import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'

export default function PlayerProfile() {
  const router = useRouter()
  const { id } = router.query

  const [nickname, setNickname] = useState('')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    let mounted = true

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // 1) Perfil
        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', id)
          .single()
        if (pErr) throw pErr
        if (!mounted) return
        setNickname(profile?.nickname || 'Jugador')

        // 2) Participación del jugador (ya trae comandantes e imágenes guardadas)
        const { data: matchesPlayed, error: mpErr } = await supabase
          .from('match_participants')
          .select('match_id, kills, max_damage, first_to_die, deck_commander, commander_image_small, commander_image_normal')
          .eq('user_id', id)
        if (mpErr) throw mpErr
        if (!mounted) return

        // 3) Partidas ganadas por el jugador
        const { data: matchesWon, error: mwErr } = await supabase
          .from('matches')
          .select('id, played_at')
          .eq('winner', id)
        if (mwErr) throw mwErr

        // 4) Cargar las partidas (fecha y ganador) donde ha participado
        const matchIds = Array.from(new Set((matchesPlayed || []).map((m) => m.match_id)))
        let playedMatchesDetailed = []
        if (matchIds.length) {
          const { data: mDetail, error: mdErr } = await supabase
            .from('matches')
            .select('id, played_at, winner')
            .in('id', matchIds)
          if (mdErr) throw mdErr
          playedMatchesDetailed = mDetail || []
        }

        // 5) Cálculos
        const kills = (matchesPlayed || []).reduce((sum, m) => sum + (m.kills || 0), 0)
        const firstToDie = (matchesPlayed || []).filter((m) => m.first_to_die).length
        const avgMaxDamage = (
          (matchesPlayed || []).reduce((sum, m) => sum + (m.max_damage || 0), 0) /
          ((matchesPlayed || []).length || 1)
        ).toFixed(1)

        // 5a) Racha máxima real por orden cronológico de partidas jugadas
        const playedSorted = [...playedMatchesDetailed].sort(
          (a, b) => new Date(a.played_at) - new Date(b.played_at)
        )
        let streak = 0
        let maxStreak = 0
        for (const m of playedSorted) {
          if (m.winner === id) {
            streak += 1
            if (streak > maxStreak) maxStreak = streak
          } else {
            streak = 0
          }
        }

        // 6) Comandantes más usados e imágenes (usamos lo guardado, sin pedir a Scryfall)
        const commanderCount = {}
        const commanderFirstImage = {}
        ;(matchesPlayed || []).forEach((m) => {
          const name = m.deck_commander
          if (!name) return
          commanderCount[name] = (commanderCount[name] || 0) + 1
          if (!commanderFirstImage[name]) {
            commanderFirstImage[name] = m.commander_image_small || m.commander_image_normal || ''
          }
        })
        const topCommanders = Object.entries(commanderCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, count]) => ({
            name,
            count,
            image: commanderFirstImage[name] || '',
          }))

        if (!mounted) return
        setStats({
          totalGames: matchesPlayed?.length || 0,
          totalWins: matchesWon?.length || 0,
          maxStreak,
          kills,
          firstToDie,
          avgMaxDamage,
          topCommanders,
        })
      } catch (err) {
        console.error(err)
        if (!mounted) return
        setError('Error al cargar perfil')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()
    return () => {
      mounted = false
    }
  }, [id])

  // SKELETON
  if (loading) {
    return (
      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="mb-4">
          <div className="h-7 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-80 bg-gray-200 rounded animate-pulse mt-2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse grid gap-3">
              <div className="h-5 w-24 bg-gray-200 rounded" />
              <div className="h-8 bg-gray-200 rounded" />
              <div className="h-4 w-36 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        <h1 className="title-text mb-2">👤 Perfil</h1>
        <div className="card p-4">
          <p className="mb-4 text-red-700">{error}</p>
          <div className="flex gap-3">
            <button className="btn" onClick={() => router.reload()}>Reintentar</button>
            <Link href="/players" className="btn btn-outline">Volver</Link>
          </div>
        </div>
      </main>
    )
  }

  if (!stats) return null

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6">
      <header className="mb-6 flex items-center gap-4">
        {/* Avatar con proporción fija */}
        <div className="w-16 h-16 rounded-full bg-gray-200 grid place-items-center overflow-hidden">
          <span className="text-xl font-semibold">{(nickname || '?').slice(0,1).toUpperCase()}</span>
        </div>
        <div>
          <h1 className="title-text mb-1">👤 {nickname}</h1>
          <p className="subtitle-text">Resumen de rendimiento personal y comandantes usados.</p>
        </div>
      </header>

      {/* Métricas principales */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <p className="text-sm">Partidas jugadas</p>
          <p className="text-2xl font-bold">{stats.totalGames}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm">Victorias</p>
          <p className="text-2xl font-bold">{stats.totalWins}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm">Racha máx.</p>
          <p className="text-2xl font-bold">{stats.maxStreak}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm">Daño máx. promedio</p>
          <p className="text-2xl font-bold">{stats.avgMaxDamage}</p>
        </div>
      </section>

      {/* Extras */}
      <section className="grid gap-4 sm:grid-cols-2 mt-6">
        <div className="card p-4">
          <h2 className="font-semibold mb-2">⚔️ Kills totales</h2>
          <p className="text-2xl font-bold">{stats.kills}</p>
        </div>
        <div className="card p-4">
          <h2 className="font-semibold mb-2">💀 Veces que murió primero</h2>
          <p className="text-2xl font-bold">{stats.firstToDie}</p>
        </div>
      </section>

      {/* Comandantes más usados */}
      <section className="mt-6 card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">🧙‍♂️ Comandantes más usados</h2>
          <div className="flex gap-2">
            <button className="btn" onClick={() => router.reload()}>Refrescar</button>
            <Link href="/players" className="btn btn-outline">Volver</Link>
          </div>
        </div>

        {stats.topCommanders.length === 0 ? (
          <p className="text-sm">No se han registrado comandantes.</p>
        ) : (
          <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {stats.topCommanders.map((cmd) => (
              <li key={cmd.name} className="grid gap-2">
                <div className="w-full aspect-[2/3] bg-gray-100 rounded-xl overflow-hidden grid place-items-center">
                  {cmd.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cmd.image}
                      alt={cmd.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">Sin imagen</span>
                  )}
                </div>
                <p className="text-sm font-medium leading-tight">{cmd.name}</p>
                <p className="text-xs text-gray-600">{cmd.count} vez{cmd.count !== 1 ? 'es' : ''}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
