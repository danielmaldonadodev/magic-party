// pages/api/delete-user.js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'No autorizado: token no encontrado' })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) {
    return res.status(401).json({ error: 'Error autenticando usuario' })
  }

  if (user?.user_metadata?.role !== 'admin') {
    return res.status(403).json({ error: 'No tienes permisos para eliminar usuarios' })
  }

  const { userId } = req.body
  if (!userId) {
    return res.status(400).json({ error: 'Falta el parámetro userId' })
  }

  try {
    // 1️⃣ Eliminar de match_participants (relación jugador-partida)
    await supabase.from('match_participants').delete().eq('player_id', userId)

    // 2️⃣ Eliminar estadísticas del jugador
    await supabase.from('player_stats').delete().eq('player_id', userId)

    // 3️⃣ (Opcional) Eliminar entradas de partidas creadas por este jugador si aplica
    await supabase.from('matches').delete().eq('created_by', userId)

    // 4️⃣ Eliminar registro del jugador
    await supabase.from('players').delete().eq('id', userId)

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error eliminando usuario y datos relacionados' })
  }
}
