// pages/api/decks/[id].js
// API de detalle de mazos: entrega el formato que espera el frontend
// (deck.deck_cards[x].cards) + extras (cards.*, statistics, sync_logs)

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

// Fallbacks de imagen con scryfall_id (si no hay URLs guardadas)
function mapCardForFrontend(card) {
  const imgNormal = card.image_url || (card.scryfall_id
    ? `https://api.scryfall.com/cards/${card.scryfall_id}?format=image&version=normal`
    : null)

  const imgSmall = card.image_url_small || (card.scryfall_id
    ? `https://api.scryfall.com/cards/${card.scryfall_id}?format=image&version=small`
    : null)

  return {
    // ID interno
    id: card.id,
    
    // Campos básicos de la carta
    name: card.name || null,
    scryfall_id: card.scryfall_id || null,
    quantity: card.quantity || 1,
    
    // URLs de imagen con fallbacks
    image_url: imgNormal,
    image_url_small: imgSmall,
    
    // Propiedades de juego
    cmc: card.cmc || 0,
    colors: card.colors || [],
    color_identity: card.color_identity || [],
    type_line: card.type_line || null,
    rarity: card.rarity || null,
    set_code: card.set_code || null,
    oracle_text: card.oracle_text || null,
    power: card.power || null,
    toughness: card.toughness || null,
    loyalty: card.loyalty || null,
    
    // Precios
    price_usd: card.price_usd || null,
    price_eur: card.price_eur || null,
    
    // Metadatos y categorización
    categories: card.categories || [],
    is_commander: Boolean(card.is_commander),
    is_sideboard: Boolean(card.is_sideboard),
    
    // Timestamps
    created_at: card.created_at || null,
    updated_at: card.updated_at || null,
  }
}

export default async function handler(req, res) {
  const { id } = req.query
  const supabase = getSupabaseFromReq(req)

  console.log('🚀 API Call:', req.method, `/api/decks/${id}`)

  if (req.method === 'GET') {
    try {
      console.log('📖 Getting deck by ID...')

      // 1) Deck principal
      const { data: deck, error } = await supabase
        .from('decks')
        .select('*') // traemos todo; los agregados ya están en la fila
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Database error:', error)
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Deck not found' })
        }
        return res.status(500).json({ error: 'Error fetching deck', details: error.message })
      }

      // 2) Perfil del autor
      let profile = null
      if (deck.user_id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('nickname, avatar_url')
          .eq('id', deck.user_id)
          .single()

        if (profileError) {
          console.warn('⚠️ Error fetching profile:', profileError)
        } else {
          profile = profileData
        }
      }

      // 3) Cartas del mazo
      const { data: cards, error: cardsError } = await supabase
        .from('deck_cards')
        .select(`
          id,
          name,
          scryfall_id,
          quantity,
          image_url,
          image_url_small,
          cmc,
          colors,
          color_identity,
          type_line,
          rarity,
          set_code,
          oracle_text,
          power,
          toughness,
          loyalty,
          price_usd,
          price_eur,
          categories,
          is_commander,
          is_sideboard,
          created_at,
          updated_at
        `)
        .eq('deck_id', id)
        .order('cmc', { ascending: true })
        .order('name', { ascending: true })

      if (cardsError) {
        console.warn('⚠️ Error fetching cards:', cardsError)
      }

      // CORRECCIÓN: Usar estructura plana directamente
      const deck_cards = (cards || []).map(card => mapCardForFrontend(card))

      // Separaciones por conveniencia (para el objeto cards)
      const mainboard = deck_cards.filter(c => !c.is_sideboard && !c.is_commander)
      const sideboard = deck_cards.filter(c => c.is_sideboard)
      const commanders = deck_cards.filter(c => c.is_commander)

      // 5) Estadísticas detalladas (si existe tabla)
      let statistics = null
      {
        const { data: statsData, error: statsError } = await supabase
          .from('deck_statistics')
          .select('*')
          .eq('deck_id', id)
          .single()

        if (statsError && statsError.code !== 'PGRST116') {
          console.warn('⚠️ Error fetching statistics:', statsError)
        } else {
          statistics = statsData || null
        }
      }

      // 6) Logs de sync
      const { data: syncLogs, error: logsError } = await supabase
        .from('deck_sync_logs')
        .select('*')
        .eq('deck_id', id)
        .order('synced_at', { ascending: false })
        .limit(10)

      if (logsError) {
        console.warn('⚠️ Error fetching sync logs:', logsError)
      }

      // 7) Respuesta completa
      const deckWithExtras = {
        ...deck,
        profiles: profile,
        deck_cards, // Estructura plana que espera el frontend corregido
        cards: {
          mainboard,
          sideboard,
          commanders,
          total: (mainboard.length + sideboard.length + commanders.length),
        },
        statistics,
        sync_logs: syncLogs || [],
      }

      console.log('✅ Complete deck data prepared')
      return res.status(200).json({ deck: deckWithExtras, success: true })
    } catch (err) {
      console.error('❌ Unexpected error:', err)
      return res.status(500).json({ error: 'Server error', details: err.message })
    }
  }

  if (req.method === 'PUT') {
    try {
      console.log('📝 Updating deck...')

      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) {
        return res.status(401).json({ error: 'Invalid or missing token' })
      }

      // Whitelist de campos editables
      const b = req.body || {}
      const allowed = {
        name: b.name,
        description: b.description,
        format: b.format,
        is_public: typeof b.is_public === 'boolean' ? b.is_public : undefined,
        moxfield_url: b.moxfield_url,
        archidekt_url: b.archidekt_url,
        commander_name: b.commander_name,
        commander_image: b.commander_image,
        commander_colors: b.commander_colors,
        commander_scryfall_id: b.commander_scryfall_id,
      }
      Object.keys(allowed).forEach(k => allowed[k] === undefined && delete allowed[k])

      const { data: updatedDeck, error: updErr } = await supabase
        .from('decks')
        .update({ ...allowed, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)   // <- filtro de ownership aquí
        .select('*')
        .single()

      if (updErr) {
        if (updErr.code === 'PGRST116') {
          return res.status(404).json({ error: 'Deck not found or not owned by you' })
        }
        console.error('❌ Error updating deck:', updErr)
        return res.status(500).json({ error: 'Error updating deck', details: updErr.message })
      }

      console.log('✅ Deck updated successfully')
      return res.status(200).json({
        success: true,
        deck: updatedDeck,
        message: 'Deck updated successfully',
      })
    } catch (err) {
      console.error('❌ Unexpected error in PUT:', err)
      return res.status(500).json({ error: 'Server error', details: err.message })
    }
  }

  if (req.method === 'DELETE') {
    try {
      console.log('🗑️ Deleting deck...')

      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) {
        return res.status(401).json({ error: 'Invalid or missing token' })
      }

      // Borrado con filtro de ownership (sin SELECT previo)
      const { data: deleted, error: deleteError } = await supabase
        .from('decks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)   // <- filtro de ownership aquí
        .select('id, name')
        .single()

      if (deleteError) {
        if (deleteError.code === 'PGRST116') {
          return res.status(404).json({ error: 'Deck not found or not owned by you' })
        }
        console.error('❌ Error deleting deck:', deleteError)
        return res.status(500).json({ error: 'Error deleting deck', details: deleteError.message })
      }

      console.log('✅ Deck deleted successfully:', deleted?.name)
      return res.status(200).json({
        success: true,
        message: 'Deck deleted successfully',
        deckName: deleted?.name || null,
      })
    } catch (err) {
      console.error('❌ Unexpected error in DELETE:', err)
      return res.status(500).json({ error: 'Server error', details: err.message })
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  return res.status(405).json({ error: 'Method not allowed' })
}