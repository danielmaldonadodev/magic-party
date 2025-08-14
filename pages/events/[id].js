// pages/events/[id].js
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'

export default function EventDetail() {
  const router = useRouter()
  const { id } = router.query
  const [event, setEvent] = useState(null)
  const [me, setMe] = useState(null)
  const [myStatus, setMyStatus] = useState('going')
  const [counts, setCounts] = useState({going:0, maybe:0, declined:0, waitlist:0})
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      const [{ data: evt }, sessionRes] = await Promise.all([
        supabase.from('events').select('*').eq('id', id).single(),
        supabase.auth.getSession()
      ])
      const session = sessionRes.data.session
      setEvent(evt)
      setMe(session?.user ?? null)
      setIsOwner(!!(evt && session?.user && evt.created_by === session.user.id))
      const { data: parts } = await supabase
        .from('event_participants')
        .select('user_id,status')
        .eq('event_id', id)
      const c = {going:0, maybe:0, declined:0, waitlist:0}
      parts?.forEach(p => { c[p.status] = (c[p.status]||0)+1 })
      setCounts(c)
      if (session?.user) {
        const mine = parts?.find(p => p.user_id === session.user.id)
        if (mine) setMyStatus(mine.status)
      }
    }
    load()
  }, [id])

  if (!event) return <div style={{padding:16}}>Cargando...</div>

  const saveRSVP = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return alert('Inicia sesión')
    try {
      const { data, error } = await supabase.rpc('rsvp_event', { p_event: id, p_status: myStatus })
      if (error) return alert(error.message)
      alert(`Tu estado: ${data}`)
      location.reload()
    } catch (e) {
      alert('No se pudo guardar el RSVP (¿evento privado/no listado?). Usa el enlace con código si aplica.')
    }
  }

  const gcalLink = `/api/events/${id}/google-link`
  const icsLink  = `/api/events/${id}/ics`

  return (
    <div style={{padding:16}}>
      <h1>{event.title} {event.visibility !== 'public' ? '🔒' : ''}</h1>
      {event.status === 'cancelled' && <p style={{color:'red'}}>Evento cancelado</p>}
      <p>{event.description}</p>
      <p><b>Cuándo:</b> {new Date(event.starts_at).toLocaleString()} → {new Date(event.ends_at).toLocaleString()}</p>
      <p><b>Dónde:</b> {event.location || 'online'}</p>

      <div style={{margin:'12px 0'}}>
        <label>Tu estado: </label>
        <select value={myStatus} onChange={e=>setMyStatus(e.target.value)}>
          <option value="going">Voy</option>
          <option value="maybe">Quizá</option>
          <option value="declined">No voy</option>
        </select>
        <button onClick={saveRSVP} style={{marginLeft:8}}>Guardar</button>
      </div>

      <p>Apuntados: ✅ {counts.going} | ❓ {counts.maybe} | ❌ {counts.declined} | ⏳ {counts.waitlist}</p>

      <h3>Calendario</h3>
      <ul>
        <li><a href={gcalLink}>➕ Añadir a Google Calendar</a></li>
        <li><a href={icsLink}>📅 Descargar .ics (con recordatorio)</a></li>
      </ul>

      {isOwner && (
        <>
          <hr />
          <h3>Acciones del organizador</h3>
          <button onClick={() => router.push(`/matches/new?fromEvent=${id}`)}>
            Crear partida desde este evento
          </button>
        </>
      )}

      <div style={{marginTop:16}}>
        <Link href="/events">← Volver</Link>
      </div>
    </div>
  )
}
