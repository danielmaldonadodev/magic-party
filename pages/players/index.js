// pages/players/index.js
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'

/* ────────────────────────────────────────────── */
/* Skeleton coherente y elegante                  */
/* ────────────────────────────────────────────── */
function PlayerSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse" padding="none">
      <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
      <Card.Section className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-56 bg-gray-200 rounded" />
          <div className="h-2 w-48 bg-gray-200 rounded" />
        </div>
      </Card.Section>
    </Card>
  )
}

/* ────────────────────────────────────────────── */
/* Tarjeta de jugador — versión “excelente”       */
/* ────────────────────────────────────────────── */
function PlayerCard({ p }) {
  const initial = (p.nickname || 'U').slice(0, 1).toUpperCase()
  const winrate = Math.max(0, Math.min(100, Number(p.winRate ?? 0)))

  // Color de la barra según winrate
  const barColor =
    winrate >= 70 ? 'from-emerald-400 to-emerald-500' :
    winrate >= 50 ? 'from-amber-400 to-amber-500' :
                    'from-rose-400 to-rose-500'

  return (
    <Link href={`/players/${p.id}`} className="block focus:outline-none">
      <Card
        interactive
        padding="none"
        className="group relative overflow-hidden rounded-xl transition duration-200 hover:shadow-lg focus:ring-2 focus:ring-primary/50"
      >
        {/* franja superior sutil */}
        <div className="h-1.5 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent" />

        <Card.Section className="flex items-start gap-4">
          {/* Avatar con halo */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 -m-[2px] rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-[6px] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-lg font-bold text-primary ring-2 ring-primary/20">
              {initial}
            </div>
          </div>

          {/* Contenido */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold text-gray-900">
              {p.nickname || 'Jugador'}
            </h3>

            {/* Chips limpias */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
              <span className="inline-flex rounded-full bg-gray-50 px-2.5 py-1 font-medium text-gray-700 ring-1 ring-gray-200">
                {p.totalPlayed} jugadas
              </span>
              <span className="inline-flex rounded-full bg-gray-50 px-2.5 py-1 font-medium text-gray-700 ring-1 ring-gray-200">
                {p.totalWins} victorias
              </span>
              <span className="inline-flex rounded-full bg-white px-2.5 py-1 font-medium text-gray-800 ring-1 ring-gray-200">
                {winrate.toFixed(1)}% winrate
              </span>
            </div>

            {/* Barra winrate */}
            <div className="mt-3">
              <div className="h-2 w-full rounded-full bg-gray-100 ring-1 ring-gray-200/70 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-[width] duration-500`}
                  style={{ width: `${winrate}%` }}
                />
              </div>
            </div>
          </div>

          {/* CTA sutil (solo desktop) */}
          <div className="hidden sm:block pt-1">
            <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors group-hover:bg-gray-50">
              Ver perfil
            </span>
          </div>
        </Card.Section>
      </Card>
    </Link>
  )
}

/* ────────────────────────────────────────────── */
/* Contenedor principal                           */
/* ────────────────────────────────────────────── */
export default function PlayersIndex() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtros / orden
  const [q, setQ] = useState('')
  const [sortKey, setSortKey] = useState('winrate') // arranca por rendimiento
  const [sortDir, setSortDir] = useState('desc')

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

  /* ── Estados UI ── */
  if (loading) {
    return (
      <section className="py-8">
        <PageHeader title="Jugadores" description="Explora la lista de jugadores y consulta sus estadísticas." />
        <Filters
          q={q} setQ={setQ}
          sortKey={sortKey} setSortKey={setSortKey}
          sortDir={sortDir} setSortDir={setSortDir}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <PlayerSkeleton key={i} />)}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-8">
        <PageHeader title="Jugadores" description="Explora la lista de jugadores y consulta sus estadísticas." />
        <Card tone="soft" className="mb-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            Error al cargar jugadores: {error}
          </div>
        </Card>
      </section>
    )
  }

  return (
    <section className="py-8">
      <PageHeader title="Jugadores" description="Explora la lista de jugadores y consulta sus estadísticas." />

      <Filters
        q={q} setQ={setQ}
        sortKey={sortKey} setSortKey={setSortKey}
        sortDir={sortDir} setSortDir={setSortDir}
      />

      {sorted.length === 0 ? (
        <Card className="p-10 text-center text-sm text-gray-600">No hay jugadores que coincidan con la búsqueda.</Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((p) => <PlayerCard key={p.id} p={p} />)}
        </div>
      )}
    </section>
  )
}

/* ────────────────────────────────────────────── */
/* Barra de filtros tipo “pro”                    */
/* ────────────────────────────────────────────── */
function Filters({ q, setQ, sortKey, setSortKey, sortDir, setSortDir }) {
  const keys = [
    { k: 'name', label: 'Nombre' },
    { k: 'played', label: 'Jugadas' },
    { k: 'wins', label: 'Victorias' },
    { k: 'winrate', label: 'Winrate' },
  ]

  return (
    <Card className="mb-6">
      <Card.Header title="Filtros" subtitle="Busca por nombre y ordena por rendimiento" />
      <Card.Section className="grid gap-4 sm:grid-cols-3">
        {/* Buscador con botón limpiar */}
        <div className="group rounded-lg border border-gray-200 bg-gray-50/40 p-3 transition focus-within:border-primary/50 focus-within:bg-white focus-within:shadow-sm">
          <label className="mb-1.5 block text-sm font-medium">Buscar</label>
          <div className="flex items-center gap-2">
            <input
              className="input flex-1"
              placeholder="nickname…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                aria-label="Limpiar búsqueda"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Segmented control para ordenar */}
        <div className="group rounded-lg border border-gray-200 bg-gray-50/40 p-3 transition focus-within:border-primary/50 focus-within:bg-white focus-within:shadow-sm">
          <label className="mb-1.5 block text-sm font-medium">Ordenar por</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {keys.map(({ k, label }) => {
              const active = sortKey === k
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSortKey(k)}
                  className={[
                    'rounded-md px-2.5 py-1.5 text-sm ring-1 transition',
                    active
                      ? 'bg-gray-900 text-white ring-black/10'
                      : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Dirección */}
        <div className="group rounded-lg border border-gray-200 bg-gray-50/40 p-3 transition">
          <label className="mb-1.5 block text-sm font-medium">Dirección</label>
          <button
            type="button"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50"
            onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
            title="Cambiar dirección de orden"
          >
            {sortDir === 'asc' ? '↑ Ascendente' : '↓ Descendente'}
          </button>
        </div>
      </Card.Section>
    </Card>
  )
}
