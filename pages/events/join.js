// pages/events/join.js
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function JoinEvent() {
  const router = useRouter()
  const { id, code } = router.query
  const [msg, setMsg] = useState('Procesando...')

  useEffect(() => {
    const go = async () => {
      if (!id || !code) return
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setMsg('Inicia sesión para continuar'); return }
      const r = await fetch(`/api/events/${id}/join-with-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ code, status: 'going' })
      })
      if (r.ok) {
        router.replace(`/events/${id}`)
      } else {
        const t = await r.text()
        setMsg(`No se pudo unir: ${t}`)
      }
    }
    go()
  }, [id, code])

  return <div style={{padding:16}}><h1>{msg}</h1></div>
}
