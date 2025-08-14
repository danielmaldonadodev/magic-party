// pages/api/events/[id]/join-with-code.js
import { createUserClientFromAuthHeader, createServiceClient } from '../../../../lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')

  const { id } = req.query
  const { code, status } = req.body || {}
  if (!code) return res.status(400).send('Falta code')

  // Cliente "como usuario" → para obtener user_id
  const { client: userClient } = createUserClientFromAuthHeader(req)
  if (!userClient) return res.status(401).send('No auth')

  const { data: userRes, error: userErr } = await userClient.auth.getUser()
  if (userErr || !userRes?.user) return res.status(401).send('No user')
  const userId = userRes.user.id

  // Cliente con service role → para leer evento y saltar RLS
  const svc = createServiceClient()
  const { data: e, error: eErr } = await svc
    .from('events')
    .select('id, status, visibility, join_code, capacity')
    .eq('id', id)
    .single()

  if (eErr || !e) return res.status(404).send('Evento no encontrado')
  if (e.status === 'cancelled') return res.status(400).send('Evento cancelado')
  if (!['private', 'unlisted'].includes(e.visibility)) {
    return res.status(400).send('Evento público: únete desde el detalle')
  }

  if (!e.join_code || e.join_code.trim() !== String(code).trim()) {
    return res.status(403).send('Código inválido')
  }

  // Calcular estado final (going/waitlist)
  let finalStatus = status === 'maybe' ? 'maybe' : 'going'
  if (e.capacity) {
    const { count } = await svc
      .from('event_participants')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id)
      .eq('status', 'going')
    if ((count || 0) >= e.capacity) finalStatus = 'waitlist'
  }

  // Upsert en participantes
  const { error: upErr } = await svc
    .from('event_participants')
    .upsert({ event_id: id, user_id: userId, status: finalStatus })
  if (upErr) return res.status(500).send(upErr.message)

  return res.status(200).json({ ok: true, status: finalStatus })
}
