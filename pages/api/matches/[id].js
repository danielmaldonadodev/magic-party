// pages/api/matches/[id].js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).send('Method not allowed')
  }

  const id = req.query.id
  const token = req.headers.authorization?.replace('Bearer ', '') || ''
  if (!token) return res.status(401).send('Missing bearer token')

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return res.status(500).send('Missing service role key')

  // Cliente “como usuario” solo para identificar user y rol
  const userClient = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  })

  const { data: { user }, error: userErr } = await userClient.auth.getUser()
  if (userErr || !user) return res.status(401).send('Invalid user')

  const isAdmin = !!user.app_metadata?.is_admin

  // Service client para ejecutar el delete (bypasa RLS y evita el error en format_stats)
  const serviceClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    if (!isAdmin) {
      // Comprobar propiedad antes de borrar
      const { data: m, error: qErr } = await serviceClient
        .from('matches')
        .select('id, user_id')
        .eq('id', id)
        .single()

      if (qErr || !m) return res.status(404).send('Match not found')
      if (m.user_id !== user.id) return res.status(403).send('Forbidden')
    } else {
      // Si quieres devolver 404 cuando no existe, puedes mirar antes:
      const { data: exists, error: exErr } = await serviceClient
        .from('matches')
        .select('id')
        .eq('id', id)
        .single()

      if (exErr || !exists) return res.status(404).send('Match not found')
    }

    // Borrar SIEMPRE con service role para que no falle ningún trigger por RLS
    const { error: delErr } = await serviceClient
      .from('matches')
      .delete()
      .eq('id', id)

    if (delErr) return res.status(400).send(delErr.message)
    return res.status(204).end()
  } catch (e) {
    console.error('Delete match API error:', e)
    return res.status(500).send('Internal error')
  }
}
