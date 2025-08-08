// pages/api/matches/[id]/delete.js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 1) Leer token del header Authorization
  const authHeader = req.headers.authorization // "Bearer <token>"
  if (!authHeader) {
    return res.status(401).json({ error: 'No autenticado (sin Authorization)' })
  }

  // 2) Crear cliente con ese token (RLS aplicado como ese usuario)
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  // 3) Validar usuario
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return res.status(401).json({ error: 'No autenticado' })
  }

  // 4) Borrar la partida (RLS: solo si user_id = auth.uid())
  const { id } = req.query
  const { error: deleteError } = await supabase
    .from('matches')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return res.status(400).json({ error: deleteError.message })
  }

  return res.status(200).json({ success: true })
}
