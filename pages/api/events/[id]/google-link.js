// pages/api/events/[id]/google-link.js
import { createUserClientFromAuthHeader } from '../../../../lib/supabaseServer'

export default async function handler(req, res) {
  const { id } = req.query
  const { client } = createUserClientFromAuthHeader(req)
  if (!client) return res.status(401).send('No auth')

  const { data: e, error } = await client
    .from('events')
    .select('title,description,location,starts_at,ends_at')
    .eq('id', id)
    .single()

  if (error || !e) return res.status(404).send('No encontrado o sin permisos')

  const toGCalDate = (iso) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '')
  const params = new URLSearchParams({
    text: e.title || '',
    details: e.description || '',
    location: e.location || '',
    dates: `${toGCalDate(e.starts_at)}/${toGCalDate(e.ends_at)}`
  })

  res.redirect(`https://calendar.google.com/calendar/render?action=TEMPLATE&${params.toString()}`)
}
