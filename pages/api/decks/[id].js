// pages/api/decks/[id].js - ARCHIVO DE API (no React)
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
  const { id } = req.query
  const supabase = getSupabaseFromReq(req)

  console.log('🚀 API Call:', req.method, `/api/decks/${id}`)

  if (req.method === 'GET') {
    try {
      console.log('📖 Getting deck by ID...')

      // Primero obtener el deck SIN el JOIN problemático
      const { data: deck, error } = await supabase
        .from('decks')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Database error:', error)
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Deck not found' })
        }
        return res.status(500).json({ error: 'Error fetching deck', details: error.message })
      }

      console.log('✅ Deck fetched, now getting profile...')

      // Obtener el profile por separado si hay user_id
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

      console.log('✅ Profile fetched:', profile)

      // Obtener logs de sincronización
      const { data: syncLogs } = await supabase
        .from('deck_sync_logs')
        .select('*')
        .eq('deck_id', id)
        .order('synced_at', { ascending: false })
        .limit(10)

      console.log('✅ Sync logs fetched:', syncLogs?.length || 0)

      const deckWithExtras = {
        ...deck,
        profiles: profile,
        sync_logs: syncLogs || []
      }

      console.log('✅ Deck with extras prepared')
      return res.status(200).json({ deck: deckWithExtras, success: true })

    } catch (error) {
      console.error('❌ Unexpected error:', error)
      return res.status(500).json({ error: 'Server error', details: error.message })
    }
  }

  if (req.method === 'DELETE') {
    try {
      console.log('🗑️ Deleting deck...')

      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) {
        return res.status(401).json({ error: 'Invalid or missing token' })
      }

      const { data: deck, error: fetchError } = await supabase
        .from('decks')
        .select('id, user_id, name')
        .eq('id', id)
        .single()

      if (fetchError) {
        console.error('❌ Error fetching deck:', fetchError)
        if (fetchError.code === 'PGRST116') {
          return res.status(404).json({ error: 'Deck not found' })
        }
        return res.status(500).json({ error: 'Error fetching deck', details: fetchError.message })
      }

      if (deck.user_id !== user.id) {
        return res.status(403).json({ error: 'You can only delete your own decks' })
      }

      const { error: deleteError } = await supabase
        .from('decks')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('❌ Error deleting deck:', deleteError)
        return res.status(500).json({ error: 'Error deleting deck', details: deleteError.message })
      }

      console.log('✅ Deck deleted successfully:', deck.name)
      return res.status(200).json({ 
        success: true, 
        message: 'Deck deleted successfully',
        deckName: deck.name
      })

    } catch (error) {
      console.error('❌ Unexpected error in DELETE:', error)
      return res.status(500).json({ error: 'Server error', details: error.message })
    }
  }

  res.setHeader('Allow', ['GET', 'DELETE'])
  return res.status(405).json({ error: 'Method not allowed' })
}