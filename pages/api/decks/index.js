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

export default async function handler(req, res) {
  console.log('🚀 API Call:', req.method, req.url)
  const supabase = getSupabaseFromReq(req)

  if (req.method === 'GET') {
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

      // Primero obtener los decks sin el JOIN problemático
      let query = supabase
        .from('decks')
        .select(`
          id, name, description, format, is_public,
          commander_name, commander_image, commander_colors, commander_scryfall_id,
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
        const { data: { user }, error: authErr } = await supabase.auth.getUser()
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

  if (req.method === 'POST') {
    try {
      console.log('💾 Creating deck...')
      console.log('📝 Request body:', JSON.stringify(req.body, null, 2))

      const { 
        name, format, source, commander, colors,
        moxfield_url, archidekt_url, description 
      } = req.body || {}

      if (!name || !format) {
        return res.status(400).json({ error: 'Missing required fields: name, format' })
      }

      // Obtener usuario del Bearer para setear user_id y cumplir RLS
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) {
        return res.status(401).json({ error: 'Invalid or missing token' })
      }

      const deckData = {
        user_id: user.id, // <-- clave por RLS y porque no hay default
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

      console.log('📋 Deck data to insert:', deckData)

      const { data: deck, error: deckError } = await supabase
        .from('decks')
        .insert(deckData)
        .select('*')
        .single()

      if (deckError) {
        console.error('❌ Error creating deck:', deckError)
        return res.status(500).json({ error: 'Error creating deck', details: deckError.message })
      }

      console.log('✅ Deck created:', deck)

      // Log de sincronización — requiere política INSERT en deck_sync_logs
      const { error: logError } = await supabase
        .from('deck_sync_logs')
        .insert({
          deck_id: deck.id,
          source: source || 'manual',
          status: 'success',
        })
      if (logError) console.warn('⚠️ Error creating sync log:', logError)

      return res.status(201).json({ deck, message: 'Deck created successfully' })
    } catch (error) {
      console.error('❌ Unexpected error in POST:', error)
      return res.status(500).json({ error: 'Server error', details: error.message })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}