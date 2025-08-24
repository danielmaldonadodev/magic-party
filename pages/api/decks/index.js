// pages/api/decks/index.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function getSupabaseFromReq(req) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  return createClient(supabaseUrl, supabaseAnon, {
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    auth: { persistSession: false },
  })
}

/* =========================
   Scryfall helpers (batch)
   ========================= */
async function fetchScryfallCardsByIds(ids) {
  if (!ids || ids.length === 0) return []
  const chunks = []
  for (let i = 0; i < ids.length; i += 75) chunks.push(ids.slice(i, i + 75))

  const results = []
  for (const chunk of chunks) {
    const body = { identifiers: chunk.map(id => ({ id })) }
    const res = await fetch('https://api.scryfall.com/cards/collection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Scryfall ${res.status}: ${txt}`)
    }
    const json = await res.json()
    if (Array.isArray(json.data)) results.push(...json.data)
  }
  return results
}

function _pickImages(c) {
  if (c.image_uris) return { small: c.image_uris.small ?? null, normal: c.image_uris.normal ?? null }
  if (Array.isArray(c.card_faces) && c.card_faces[0]?.image_uris) {
    const f = c.card_faces[0].image_uris
    return { small: f.small ?? null, normal: f.normal ?? null }
  }
  return { small: null, normal: null }
}

function _pickOracle(c) {
  if (c.oracle_text) return c.oracle_text
  if (Array.isArray(c.card_faces)) {
    return c.card_faces.map(f => f.oracle_text).filter(Boolean).join('\n—\n') || null
  }
  return null
}

// Nota: tu columna cmc es INTEGER, por eso lo redondeamos.
function mapScryfallToDeckCard(c) {
  const imgs = _pickImages(c)
  const cmc = Number.isFinite(c.cmc) ? Math.round(c.cmc) : 0
  return {
    name: c.name,
    scryfall_id: c.id,
    cmc,
    colors: c.colors ?? [],
    color_identity: c.color_identity ?? [],
    type_line: c.type_line ?? null,
    rarity: c.rarity ?? null,
    set_code: c.set ?? null,
    oracle_text: _pickOracle(c),
    power: c.power ?? null,
    toughness: c.toughness ?? null,
    loyalty: c.loyalty ?? null,
    image_url: imgs.normal,
    image_url_small: imgs.small,
    price_usd: c.prices?.usd ? parseFloat(c.prices.usd) : null,
    price_eur: c.prices?.eur ? parseFloat(c.prices.eur) : null,
  }
}

/* =========================
   Handler raíz
   ========================= */
export default async function handler(req, res) {
  console.log('🚀 API Call:', req.method, req.url)
  const supabase = getSupabaseFromReq(req)

  if (req.method === 'GET') {
    return handleGetDecks(req, res, supabase)
  }

  if (req.method === 'POST') {
    return handleCreateDeck(req, res, supabase)
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}

async function handleGetDecks(req, res, supabase) {
  try {
    console.log('📖 Getting decks...')
    console.log('🔍 Query params:', req.query)

    const { 
      page = '1', 
      limit = '12', 
      search = '', 
      format = '', 
      user_id = '' 
    } = req.query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum

    // Obtener decks con campos expandidos
    let query = supabase
      .from('decks')
      .select(`
        id, name, description, format, is_public,
        commander_name, commander_image, commander_colors, commander_scryfall_id,
        total_cards, mainboard_count, sideboard_count, 
        estimated_price, average_cmc,
        moxfield_url, archidekt_url,
        created_at, updated_at, last_synced_at, deck_hash,
        user_id
      `, { count: 'exact' })

    // Filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,commander_name.ilike.%${search}%`)
    }

    if (format) {
      query = query.eq('format', format)
    }

    if (user_id) {
      query = query.eq('user_id', user_id)
    } else {
      // Si no se especifica user_id, mostrar solo mazos públicos o del usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        query = query.or(`is_public.eq.true,user_id.eq.${user.id}`)
      } else {
        query = query.eq('is_public', true)
      }
    }

    // Paginación y orden
    const { data: decks, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1)

    if (error) {
      console.error('❌ Database error:', error)
      return res.status(500).json({ error: 'Error fetching decks', details: error.message })
    }

    console.log('✅ Decks fetched, now getting profiles...')

    // Obtener los profiles de los usuarios únicos
    const userIds = [...new Set(decks.map(deck => deck.user_id))].filter(Boolean)
    let profiles = []
    
    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url')
        .in('id', userIds)

      if (profilesError) {
        console.warn('⚠️ Error fetching profiles:', profilesError)
      } else {
        profiles = profilesData || []
      }
    }

    console.log('✅ Profiles fetched:', profiles.length)

    // Combinar los datos
    const decksWithProfiles = decks.map(deck => {
      const profile = profiles.find(p => p.id === deck.user_id)
      return {
        ...deck,
        profiles: profile ? {
          nickname: profile.nickname,
          avatar_url: profile.avatar_url
        } : null
      }
    })

    const totalPages = Math.ceil((count || 0) / limitNum)

    const pagination = {
      page: pageNum,
      limit: limitNum,
      total: count || 0,
      totalPages
    }

    console.log(`✅ Found ${count} decks total, returning ${decksWithProfiles.length} for page ${pageNum}`)

    return res.status(200).json({ 
      decks: decksWithProfiles || [], 
      pagination,
      success: true 
    })
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return res.status(500).json({ error: 'Server error', details: error.message })
  }
}

async function handleCreateDeck(req, res, supabase) {
  try {
    console.log('💾 Creating deck...')
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2))

    // Obtener usuario del Bearer para setear user_id y cumplir RLS
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return res.status(401).json({ error: 'Invalid or missing token' })
    }

    const requestData = req.body || {}

    // Detectar si es un mazo completo (con cartas) o simple
    const hasCompleteData = requestData.mainboard && requestData.mainboard.length > 0

    if (hasCompleteData) {
      // Crear mazo completo con cartas (enriquecido con Scryfall)
      const deck = await createCompleteDeck(requestData, user.id, supabase)
      return res.status(201).json({ 
        deck, 
        message: 'Mazo creado exitosamente con todas las cartas',
        success: true 
      })
    } else {
      // Crear mazo simple (tu implementación actual)
      const deck = await createSimpleDeck(requestData, user.id, supabase)
      return res.status(201).json({ 
        deck, 
        message: 'Mazo creado exitosamente',
        success: true 
      })
    }

  } catch (error) {
    console.error('❌ Unexpected error in POST:', error)
    return res.status(500).json({ error: 'Server error', details: error.message })
  }
}

/* =====================================================
   Crear mazo COMPLETO con enriquecido Scryfall + upsert
   ===================================================== */
async function createCompleteDeck(data, userId, supabase) {
  console.log('💾 Creating complete deck with cards...')

  // Preparar datos del mazo principal
  const deckData = {
    user_id: userId,
    name: data.name,
    format: data.format || 'Commander',
    description: data.description || null,
    is_public: data.is_public !== false,
    
    // URLs de fuentes externas
    moxfield_url: data.source === 'moxfield' ? data.sourceUrl : data.moxfield_url || null,
    archidekt_url: data.source === 'archidekt' ? data.sourceUrl : data.archidekt_url || null,
    
    // Información del comandante
    commander_name: data.commander?.name || null,
    commander_image: data.commander?.image_url || null,
    commander_colors: data.commander?.colors || [],
    commander_scryfall_id: data.commander?.scryfall_id || null,
    
    // Estadísticas básicas (luego se recalculan)
    total_cards: data.totalCards || 0,
    mainboard_count: data.mainboard?.length || 0, // se recalcula al final
    sideboard_count: data.sideboard?.length || 0, // se recalcula al final
    mana_curve: data.manaCurve || {},
    color_distribution: data.colorDistribution || {},
    average_cmc: data.averageCmc || 0, // se recalcula al final
    estimated_price: data.estimatedPrice || 0,
    
    // Metadatos
    deck_hash: data.deckHash || null,
    last_synced_at: new Date().toISOString()
  }

  console.log('📋 Complete deck data to insert:', deckData)

  // 1) Crear el deck
  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .insert(deckData)
    .select('*')
    .single()

  if (deckError) {
    console.error('❌ Error creating deck:', deckError)
    throw new Error(`Error creating deck: ${deckError.message}`)
  }

  console.log('✅ Deck created:', deck.id)

  // 2) Normalizar listas y juntar main + side
  const baseMain = (data.mainboard || []).map(c => ({
    name: c.name,
    scryfall_id: c.scryfall_id || null,
    quantity: c.quantity ?? 1,
    is_sideboard: false,
    // si ya vino algo del import, lo respetamos como preferencia
    cmc: c.cmc, colors: c.colors, color_identity: c.color_identity, type_line: c.type_line,
    rarity: c.rarity, set_code: c.set_code, oracle_text: c.oracle_text,
    power: c.power, toughness: c.toughness, loyalty: c.loyalty,
    image_url: c.image_url, image_url_small: c.image_url_small,
    price_usd: c.price_usd, price_eur: c.price_eur, categories: c.categories
  }))

  const baseSide = (data.sideboard || []).map(c => ({
    name: c.name,
    scryfall_id: c.scryfall_id || null,
    quantity: c.quantity ?? 1,
    is_sideboard: true,
    cmc: c.cmc, colors: c.colors, color_identity: c.color_identity, type_line: c.type_line,
    rarity: c.rarity, set_code: c.set_code, oracle_text: c.oracle_text,
    power: c.power, toughness: c.toughness, loyalty: c.loyalty,
    image_url: c.image_url, image_url_small: c.image_url_small,
    price_usd: c.price_usd, price_eur: c.price_eur, categories: c.categories
  }))

  const baseAll = [...baseMain, ...baseSide]
  const ids = Array.from(new Set(baseAll.map(c => c.scryfall_id).filter(Boolean)))

  // 3) Llamada batch a Scryfall
  const scry = await fetchScryfallCardsByIds(ids)
  const byId = new Map(scry.map(c => [c.id, c]))

  // 4) Mezcla datos del import con enriquecido de Scryfall
  const rows = baseAll
    .filter(r => r.scryfall_id) // evita filas sin id (opcional: resolver por nombre)
    .map(r => {
      const sf = byId.get(r.scryfall_id)
      const mapped = sf ? mapScryfallToDeckCard(sf) : {}
      return {
        deck_id: deck.id,
        name: r.name,
        scryfall_id: r.scryfall_id,
        quantity: r.quantity,
        is_sideboard: r.is_sideboard,
        image_url: r.image_url ?? mapped.image_url,
        image_url_small: r.image_url_small ?? mapped.image_url_small,
        cmc: r.cmc ?? mapped.cmc ?? 0,
        colors: r.colors ?? mapped.colors ?? [],
        color_identity: r.color_identity ?? mapped.color_identity ?? [],
        type_line: r.type_line ?? mapped.type_line ?? null,
        rarity: r.rarity ?? mapped.rarity ?? null,
        set_code: r.set_code ?? mapped.set_code ?? null,
        oracle_text: r.oracle_text ?? mapped.oracle_text ?? null,
        power: r.power ?? mapped.power ?? null,
        toughness: r.toughness ?? mapped.toughness ?? null,
        loyalty: r.loyalty ?? mapped.loyalty ?? null,
        price_usd: r.price_usd ?? mapped.price_usd ?? null,
        price_eur: r.price_eur ?? mapped.price_eur ?? null,
        categories: r.categories ?? [],
        is_commander: false
      }
    })

  // 5) Upsert masivo respetando UNIQUE (deck_id, scryfall_id, is_sideboard)
  if (rows.length) {
    const { error: cardsErr } = await supabase
      .from('deck_cards')
      .upsert(rows, { onConflict: 'deck_id,scryfall_id,is_sideboard' })
    if (cardsErr) {
      console.error('❌ Error upserting deck_cards:', cardsErr)
    } else {
      console.log('✅ deck_cards upserted:', rows.length)
    }
  }

  // 6) Recalcular agregados reales del mazo
  await updateDeckAggregates(supabase, deck.id)

  // 7) Log de sincronización
  const { error: logError } = await supabase
    .from('deck_sync_logs')
    .insert({
      deck_id: deck.id,
      source: data.source || 'import',
      status: 'success',
    })
  if (logError) console.warn('⚠️ Error creating sync log:', logError)

  return deck
}

/* ==================================
   Crear mazo SIMPLE (sin cartas)
   ================================== */
async function createSimpleDeck(data, userId, supabase) {
  console.log('💾 Creating simple deck...')

  const { 
    name, format, source, commander, colors,
    moxfield_url, archidekt_url, description 
  } = data

  if (!name || !format) {
    throw new Error('Missing required fields: name, format')
  }

  const deckData = {
    user_id: userId,
    name,
    format,
    description: description || null,
    is_public: true,
    last_synced_at: new Date().toISOString(),
    moxfield_url: source === 'moxfield' ? (moxfield_url ?? null) : null,
    archidekt_url: source === 'archidekt' ? (archidekt_url ?? null) : null,
    commander_name: commander?.name ?? (typeof commander === 'string' ? commander : null),
    commander_image: commander?.image_url ?? commander?.imageUrl ?? null,
    commander_colors: colors ?? commander?.colors ?? [],
    commander_scryfall_id: commander?.scryfall_id ?? null,
  }

  console.log('📋 Simple deck data to insert:', deckData)

  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .insert(deckData)
    .select('*')
    .single()

  if (deckError) {
    console.error('❌ Error creating deck:', deckError)
    throw new Error(`Error creating deck: ${deckError.message}`)
  }

  console.log('✅ Simple deck created:', deck)

  // Log de sincronización
  const { error: logError } = await supabase
    .from('deck_sync_logs')
    .insert({
      deck_id: deck.id,
      source: source || 'manual',
      status: 'success',
    })
  if (logError) console.warn('⚠️ Error creating sync log:', logError)

  return deck
}

/* =========================
   Agregados del mazo
   ========================= */
async function updateDeckAggregates(supabase, deckId) {
  const { data: cards, error } = await supabase
    .from('deck_cards')
    .select('quantity, cmc, color_identity, is_sideboard')
    .eq('deck_id', deckId)

  if (error) throw error

  const sum = (arr, pred) => arr.filter(pred).reduce((a, c) => a + (c.quantity ?? 1), 0)
  const totalMain = sum(cards, c => !c.is_sideboard)
  const totalSide = sum(cards, c =>  c.is_sideboard)
  const totalAll  = totalMain + totalSide

  const avg = totalMain
    ? Number((
        cards
          .filter(c => !c.is_sideboard)
          .reduce((a, c) => a + (Number(c.cmc ?? 0) * (c.quantity ?? 1)), 0) / totalMain
      ).toFixed(2))
    : 0

  const identity = new Set()
  cards.forEach(c => (c.color_identity ?? []).forEach(x => identity.add(x)))

  const { error: updErr } = await supabase
    .from('decks')
    .update({
      mainboard_count: totalMain,
      sideboard_count: totalSide,
      total_cards: totalAll,
      average_cmc: avg,
      color_identity: Array.from(identity).sort(),
      last_synced_at: new Date().toISOString(),
    })
    .eq('id', deckId)

  if (updErr) throw updErr
}
