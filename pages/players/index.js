// pages/players/index.js
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Card from '../../components/Card'
import SkeletonCard from '../../components/SkeletonCard'

export default function PlayersIndex() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [q, setQ] = useState('')
  const [sortKey, setSortKey] = useState('name') // name | wins | played | winrate
  const [sortDir, setSortDir] = useState('asc')  // asc | desc

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('player_stats_view')
        .select('id, nickname, total_played, total_wins, win_rate')

      if (error) {
        setError(error.message)
        setPlayers([])
        setLoading(false)
        return
      }

      const mapped = (data || []).map(p => ({
        id: p.id,
        nickname: p.nickname,
        totalPlayed: p.total_played,
        totalWins: p.total_wins,
        winRate: p.win_rate
      }))

      setPlayers(mapped)
      setLoading(false)
    }

    load()
  }, [])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return players
    return players.filter((p) => (p.nickname || '').toLowerCase().includes(term))
  }, [players, q])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      let comp = 0
      switch (sortKey) {
        case 'wins':
          comp = b.totalWins - a.totalWins
            || b.totalPlayed - a.totalPlayed
            || (a.nickname || '').localeCompare(b.nickname || '')
          break
        case 'played':
          comp = b.totalPlayed - a.totalPlayed
            || b.totalWins - a.totalWins
            || (a.nickname || '').localeCompare(b.nickname || '')
          break
        case 'winrate':
          comp = b.winRate - a.winRate
            || b.totalPlayed - a.totalPlayed
            || (a.nickname || '').localeCompare(b.nickname || '')
          break
        case 'name':
        default:
          comp = (a.nickname || '').localeCompare(b.nickname || '')
      }
      return sortDir === 'asc' ? comp * -1 : comp
    })
    return arr
  }, [filtered, sortKey, sortDir])

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        <header className="mb-4">
          <h1 className="title-text mb-1">👥 Jugadores</h1>
          <p className="subtitle-text">Lista de perfiles. Pulsa para ver detalles.</p>
        </header>

        <div className="mb-4 grid gap-2">
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        <h1 className="title-text mb-2">👥 Jugadores</h1>
        <Card className="p-4 text-red-700 bg-red-50 border-red-200">
          <p className="mb-4">{error}</p>
          <button className="btn" onClick={() => location.reload()}>Reintentar</button>
        </Card>
      </main>
    )
  }

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6">
      <header className="mb-4">
        <h1 className="title-text mb-1">👥 Jugadores</h1>
        <p className="subtitle-text">Lista de perfiles. Pulsa para ver detalles.</p>
      </header>

      <Card className="p-4 mb-4 grid gap-4 sm:grid-cols-3">
        <label className="grid gap-2">
          <span className="font-medium">Buscar</span>
          <input
            className="input"
            placeholder="Filtrar por nombre…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>

        <label className="grid gap-2">
          <span className="font-medium">Ordenar por</span>
          <select className="input" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
            <option value="name">Nombre</option>
            <option value="wins">Victorias</option>
            <option value="played">Partidas jugadas</option>
            <option value="winrate">% Victorias</option>
          </select>
        </label>

        <div className="grid gap-2">
          <span className="font-medium">Dirección</span>
          <button
            type="button"
            className="btn"
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            title="Cambiar dirección de orden"
          >
            {sortDir === 'asc' ? '↑ Ascendente' : '↓ Descendente'}
          </button>
        </div>
      </Card>

      {sorted.length === 0 ? (
        <Card className="p-6 text-sm">No hay jugadores que coincidan con la búsqueda.</Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((p) => (
            <li key={p.id}>
              <Card className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 grid place-items-center overflow-hidden">
                  <span className="text-base font-semibold">
                    {(p.nickname || '?').slice(0,1).toUpperCase()}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{p.nickname || 'Jugador'}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-700">
                    <span title="Partidas jugadas">🎮 {p.totalPlayed}</span>
                    <span title="Victorias">🏆 {p.totalWins}</span>
                    <span title="Porcentaje de victorias">📈 {p.winRate}%</span>
                  </div>
                </div>

                <Link href={`/players/${p.id}`} className="btn btn-outline shrink-0">
                  Ver perfil
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
