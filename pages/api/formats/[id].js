// pages/api/formats/[id].js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const id = req.query.id
  const token = req.headers.authorization?.replace('Bearer ', '') || ''
  if (!token) return res.status(401).json({ error: 'Missing bearer token' })

  // Cliente con el token del usuario para identificarlo
  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user }, error: userErr } = await userClient.auth.getUser()
  if (userErr || !user) return res.status(401).json({ error: 'Invalid user' })

  // ⚠️ Valida admin SOLO por app_metadata/user_metadata (sin tocar profiles)
  const isAdmin =
    user.app_metadata?.is_admin === true ||
    user.user_metadata?.is_admin === true ||
    (Array.isArray(user.app_metadata?.roles) && user.app_metadata.roles.includes('admin')) ||
    user.user_metadata?.role === 'admin'

  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return res.status(500).json({ error: 'Missing service role key' })

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    // 1) ¿Existe el formato?
    const { data: game, error: gameErr } = await admin
      .from('games')
      .select('id')
      .eq('id', id)
      .single()
    if (gameErr || !game) return res.status(404).json({ error: 'Format not found' })

    // 2) Borra participantes de matches de ese formato
    const { data: matchIds, error: listErr } = await admin
      .from('matches')
      .select('id')
      .eq('game_id', id)

    if (listErr) return res.status(400).json({ error: listErr.message })

    if (matchIds && matchIds.length) {
      const ids = matchIds.map(m => m.id)

      // match_participants
      const { error: mpErr } = await admin
        .from('match_participants')
        .delete()
        .in('match_id', ids)
      if (mpErr) return res.status(400).json({ error: mpErr.message })

      // matches
      const { error: mErr } = await admin
        .from('matches')
        .delete()
        .eq('game_id', id)
      if (mErr) return res.status(400).json({ error: mErr.message })
    }

    // 3) Borra el formato
    const { error: gErr } = await admin
      .from('games')
      .delete()
      .eq('id', id)
    if (gErr) return res.status(400).json({ error: gErr.message })

    // Listo
    return res.status(204).end()
  } catch (e) {
    console.error('DELETE /api/formats/[id] error:', e)
    return res.status(500).json({ error: 'Internal error' })
  }
}
