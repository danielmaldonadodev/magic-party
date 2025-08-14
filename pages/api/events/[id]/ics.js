// pages/api/events/[id]/ics.js
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

  const fmt = (d) => new Date(d).toISOString().replace(/[-:]|\.\d{3}/g, '')
  const safe = (s) => (s || '').replace(/\r?\n/g, ' ')

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Colegueo Partidas//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${id}@colegueo`,
    `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(e.starts_at)}`,
    `DTEND:${fmt(e.ends_at)}`,
    `SUMMARY:${safe(e.title)}`,
    `DESCRIPTION:${safe(e.description)}`,
    `LOCATION:${safe(e.location)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Recordatorio de evento',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="evento-${id}.ics"`)
  res.status(200).send(ics)
}
