// pages/events/index.js
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { format } from 'date-fns'

export default function EventsList() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id,title,starts_at,ends_at,location,visibility,created_by,status')
        .gte('ends_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
      if (!error) setEvents(data || [])
    }
    load()
  }, [])

  return (
    <div style={{padding:16}}>
      <h1>Próximas quedadas</h1>
      <div style={{marginBottom:12}}>
        <Link href="/events/new">➕ Nueva quedada</Link>
      </div>
      <ul>
        {events.map(e => (
          <li key={e.id} style={{marginBottom:6}}>
            <Link href={`/events/${e.id}`}>
              {e.title} — {format(new Date(e.starts_at), 'dd/MM HH:mm')}
              {' '}({e.location || 'online'}) {e.visibility !== 'public' ? '🔒' : ''}
            </Link>
          </li>
        ))}
        {events.length === 0 && <li>No hay eventos programados.</li>}
      </ul>
    </div>
  )
}
