// pages/dashboard.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
      } else {
        setSession(session)
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) router.replace('/login')
        else setSession(session)
      }
    )
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <p>Cargando…</p>
      </main>
    )
  }

  // Sacamos el nickname o, si no existe, el email
  const nickname =
    session.user.user_metadata?.nickname || session.user.email

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>¡Bienvenido, {nickname}!</h1>
      <button onClick={handleLogout} style={{ marginBottom: '1rem' }}>
        Cerrar sesión
      </button>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>
            <Link href="/matches/">Partidas</Link>
          </li>
          <li>
            <Link href="/stats/">Estadísticas</Link>
          </li>
        </ul>
      </nav>
    </main>
  )
}
