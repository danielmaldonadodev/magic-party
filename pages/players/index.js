import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'

function PlayerSkeleton() {
  return (
    <div className="relative">
      <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm animate-pulse" padding="none">
        <div className="h-0.5 bg-gradient-to-r from-gray-200 to-gray-100" />
        <Card.Section className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-36 bg-gray-200 rounded" />
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-gray-200 rounded-md" />
                <div className="h-6 w-24 bg-gray-200 rounded-md" />
                <div className="h-6 w-28 bg-gray-200 rounded-md" />
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-gray-100 rounded-full">
                  <div className="h-full w-3/5 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </Card.Section>
      </Card>
    </div>
  )
}

function PlayerCard({ p, isAdmin, onDeleted }) {
  const [isHovered, setIsHovered] = useState(false)
  const initial = (p.nickname || 'U').slice(0, 1).toUpperCase()
  const winrate = Math.max(0, Math.min(100, Number(p.winRate ?? 0)))
  
  const getPerformanceLevel = (winrate) => {
    if (winrate >= 75) return { 
      level: 'excelente', 
      color: 'from-green-600 to-emerald-700', 
      bg: 'bg-green-50', 
      text: 'text-green-800', 
      border: 'border-green-200' 
    }
    if (winrate >= 60) return { 
      level: 'bueno', 
      color: 'from-blue-600 to-indigo-700', 
      bg: 'bg-blue-50', 
      text: 'text-blue-800', 
      border: 'border-blue-200' 
    }
    if (winrate >= 45) return { 
      level: 'promedio', 
      color: 'from-amber-600 to-orange-700', 
      bg: 'bg-amber-50', 
      text: 'text-amber-800', 
      border: 'border-amber-200' 
    }
    return { 
      level: 'en desarrollo', 
      color: 'from-gray-600 to-slate-700', 
      bg: 'bg-gray-50', 
      text: 'text-gray-800', 
      border: 'border-gray-200' 
    }
  }

  const performance = getPerformanceLevel(winrate)

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`¿Eliminar a ${p.nickname}?`)) return
    if (!confirm(`Esto eliminará PERMANENTEMENTE todas las estadísticas, partidas y registros. ¿Confirmar?`)) return

    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/delete-user', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ userId: p.id })
    })
    const result = await res.json()
    if (res.ok) {
      alert('Usuario y datos eliminados exitosamente')
      onDeleted(p.id)
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  return (
    <div 
      className="group relative transform transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle glow effect */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${performance.color} opacity-0 blur-xl transition-all duration-500 group-hover:opacity-5 -z-10`} />
      
      {/* Admin delete button */}
      {isAdmin && (
        <div className="absolute -top-2 -right-2 z-20">
          <button
            onClick={handleDelete}
            className="group/btn relative rounded-full bg-red-500 p-2 text-white shadow-md transition-all duration-200 hover:bg-red-600 hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-red-500/30"
          >
            <svg className="h-4 w-4 transition-transform duration-200 group-hover/btn:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform opacity-0 transition-all duration-300 group-hover/btn:opacity-100">
              <div className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
                Eliminar Jugador
                <div className="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-gray-900" />
              </div>
            </div>
          </button>
        </div>
      )}

      <Link href={`/players/${p.id}`} className="block focus:outline-none">
        <Card
          interactive
          padding="none"
          className="relative overflow-hidden border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-md focus:ring-2 focus:ring-gray-500/20 focus:border-gray-400"
        >
          {/* Performance indicator bar */}
          <div className={`h-0.5 bg-gradient-to-r ${performance.color} transition-all duration-300`} />
          
          <Card.Section className="p-6">
            <div className="flex items-start gap-4">
              {/* Professional avatar */}
              <div className="relative shrink-0">
                <div className={`flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-xl font-semibold text-gray-700 border ${performance.border} transition-all duration-300 group-hover:shadow-md group-hover:scale-105`}>
                  <span className="transition-all duration-200 group-hover:scale-105">{initial}</span>
                </div>
                {/* Status indicator */}
                <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br ${performance.color} border-2 border-white transition-all duration-200 group-hover:scale-110`} />
              </div>

              <div className="min-w-0 flex-1 space-y-4">
                {/* Player name */}
                <div>
                  <h3 className="truncate text-xl font-semibold text-gray-900 transition-colors duration-200 group-hover:text-gray-800">
                    {p.nickname || 'Jugador'}
                  </h3>
                </div>
                
                {/* Statistics */}
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 font-medium text-gray-700 border border-gray-200 transition-all duration-200 hover:bg-gray-50">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {p.totalPlayed} partidas
                  </span>
                  
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 font-medium text-gray-700 border border-gray-200 transition-all duration-200 hover:bg-gray-50">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {p.totalWins} victorias
                  </span>
                  
                  <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold border transition-all duration-200 hover:scale-105 ${performance.bg} ${performance.text} ${performance.border}`}>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {winrate.toFixed(1)}%
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium text-gray-600">
                    <span>Tasa de Victoria</span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${performance.bg} ${performance.text}`}>
                      {winrate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${performance.color} transition-all duration-700 ease-out`}
                      style={{ width: `${winrate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card.Section>
          
          {/* Action footer */}
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50">
            <div className={`flex items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-all duration-300 py-2.5 px-4 ${
              isHovered 
                ? `border-gray-300 bg-white text-gray-700 shadow-sm` 
                : 'border-gray-200 bg-transparent text-gray-500'
            }`}>
              <svg className={`h-4 w-4 transition-all duration-200 ${isHovered ? 'translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="font-medium">Ver Perfil</span>
              <svg className={`h-4 w-4 transition-all duration-200 ${isHovered ? 'translate-x-1 scale-105' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  )
}

export default function PlayersIndex() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const [q, setQ] = useState('')
  const [sortKey, setSortKey] = useState('winrate')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAdmin(user?.user_metadata?.role === 'admin')
    }
    checkRole()
  }, [])

  useEffect(() => {
    let ignore = false
    const load = async () => {
      setLoading(true); setError(null)
      const { data, error } = await supabase
        .from('player_stats_view')
        .select('id, nickname, total_played, total_wins, win_rate')
      if (ignore) return
      if (error) {
        setError(error.message)
        setPlayers([])
      } else {
        setPlayers(
          (data || []).map(p => ({
            id: p.id,
            nickname: p.nickname,
            totalPlayed: p.total_played,
            totalWins: p.total_wins,
            winRate: p.win_rate
          }))
        )
      }
      setLoading(false)
    }
    load()
    return () => { ignore = true }
  }, [])

  const handleDeleted = (id) => {
    setPlayers(players => players.filter(p => p.id !== id))
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return players
    return players.filter(p => (p.nickname || '').toLowerCase().includes(term))
  }, [players, q])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      let comp = 0
      switch (sortKey) {
        case 'wins':
          comp = (b.totalWins - a.totalWins) || (b.totalPlayed - a.totalPlayed) || (a.nickname || '').localeCompare(b.nickname || '')
          break
        case 'played':
          comp = (b.totalPlayed - a.totalPlayed) || (b.totalWins - a.totalWins) || (a.nickname || '').localeCompare(b.nickname || '')
          break
        case 'winrate':
          comp = (b.winRate - a.winRate) || (b.totalPlayed - a.totalPlayed) || (a.nickname || '').localeCompare(b.nickname || '')
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
      <section className="py-8 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <PageHeader title="Jugadores" description="Explora perfiles de jugadores y estadísticas de rendimiento." />
          <Filters q={q} setQ={setQ} sortKey={sortKey} setSortKey={setSortKey} sortDir={sortDir} setSortDir={setSortDir} />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <PlayerSkeleton key={i} />)}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-8 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <PageHeader title="Jugadores" description="Explora perfiles de jugadores y estadísticas de rendimiento." />
          <Card className="border border-red-200 bg-red-50">
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <div className="mb-2 text-red-800 font-semibold">No se pueden cargar los jugadores</div>
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Jugadores" description="Explora perfiles de jugadores y estadísticas de rendimiento." />
        <Filters q={q} setQ={setQ} sortKey={sortKey} setSortKey={setSortKey} sortDir={sortDir} setSortDir={setSortDir} />
        {sorted.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron jugadores</h3>
              <p className="text-gray-600">No hay jugadores que coincidan con los criterios de búsqueda actuales.</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {sorted.map((p) => (
              <PlayerCard key={p.id} p={p} isAdmin={isAdmin} onDeleted={handleDeleted} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function Filters({ q, setQ, sortKey, setSortKey, sortDir, setSortDir }) {
  const keys = [
    { k: 'name', label: 'Nombre' },
    { k: 'played', label: 'Partidas' },
    { k: 'wins', label: 'Victorias' },
    { k: 'winrate', label: 'Tasa de Victoria' },
  ]
  
  return (
    <Card className="mb-8 border border-gray-200 bg-white shadow-sm">
      <Card.Header title="Filtros y Ordenación" subtitle="Busca jugadores y personaliza el orden de visualización" />
      <Card.Section className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Buscar Jugadores</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-500 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 sm:text-sm" 
                placeholder="Ingresa el nombre del jugador..." 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
              />
              {q && (
                <button 
                  type="button" 
                  onClick={() => setQ('')} 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Sort by */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Ordenar Por</label>
            <div className="grid grid-cols-2 gap-2">
              {keys.map(({ k, label }) => {
                const active = sortKey === k
                return (
                  <button 
                    key={k} 
                    type="button" 
                    onClick={() => setSortKey(k)} 
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active 
                        ? 'bg-gray-900 text-white shadow-sm' 
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Sort direction */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Orden</label>
            <button 
              type="button" 
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-gray-500/20" 
              onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className={`h-4 w-4 transition-transform duration-200 ${sortDir === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                {sortDir === 'asc' ? 'Ascendente' : 'Descendente'}
              </div>
            </button>
          </div>
        </div>
      </Card.Section>
    </Card>
  )
}