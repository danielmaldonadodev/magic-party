import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../../lib/supabaseClient'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'

// ────────────────────────────────────────────────────────────
// Config visual
const BANNER_MODE = 'top'          // 'top' (recorte arriba) | 'full' (carta entera)
const CARD_ASPECT = 'aspect-[5/7]' // proporción carta (5:7)
// ────────────────────────────────────────────────────────────

function formatDate(date) {
  try {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  } catch {
    return '—'
  }
}

function SkeletonCard() {
  return (
    <Card className="overflow-hidden animate-pulse" padding="none">
      <div className="aspect-[4/3] bg-gray-200" />
      <Card.Section className="space-y-3">
        <div className="h-4 w-36 bg-gray-200 rounded" />
        <div className="h-5 w-1/2 bg-gray-200 rounded" />
        <div className="h-4 w-40 bg-gray-200 rounded" />
      </Card.Section>
    </Card>
  )
}

// Sube /small/ -> /normal/
function upgradeScryfallUrl(url) {
  if (!url) return url
  try {
    const u = new URL(url)
    if ((u.hostname === 'cards.scryfall.io' || u.hostname === 'img.scryfall.com') && u.pathname.includes('/small/')) {
      u.pathname = u.pathname.replace('/small/', '/normal/')
      return u.toString()
    }
  } catch {}
  return url
}

// FAB — Botón flotante (solo ≥ sm)
function FabCreate() {
  return (
    <Link
      href="/matches/new"
      aria-label="Crear nueva partida"
      className="fixed right-6 z-50 hidden sm:inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-white shadow-lg ring-1 ring-black/5 transition hover:translate-y-[1px] hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/60"
      style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span className="font-medium">Nueva partida</span>
    </Link>
  )
}

// Barra móvil fija inferior (solo < sm)
function MobileCreateBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
    >
      <Link
        href="/matches/new"
        className="w-full max-w-md rounded-full bg-primary px-5 py-3 text-center font-medium text-white shadow-md ring-1 ring-black/5 active:translate-y-[1px]"
        aria-label="Crear nueva partida"
      >
        Nueva partida
      </Link>
    </div>
  )
}

export default function MatchesList() {
  // Datos
  const [matches, setMatches] = useState([])
  const [profiles, setProfiles] = useState([])
  const [formats, setFormats] = useState([])
  const [participants, setParticipants] = useState([])

  // UI
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtros
  const [selectedFormat, setSelectedFormat] = useState('') // game_id
  const [selectedPlayer, setSelectedPlayer] = useState('') // user_id
  const [query, setQuery] = useState('') // texto libre

  // Paginación
  const PAGE_SIZE = 12
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    let ignore = false
    async function loadAll() {
      setLoading(true); setError(null)

      const [
        { data: profData, error: profErr },
        { data: gameData, error: gameErr },
        { data: partData, error: partErr },
        { data: matchData, error: matchErr }
      ] = await Promise.all([
        supabase.from('profiles').select('id, nickname'),
        supabase.from('games').select('id, name'),
        supabase
          .from('match_participants')
          .select(`
            match_id,
            user_id,
            commander_image,
            commander_image_small,
            commander_image_normal,
            commander_art_crop,
            commander_name
          `),
        supabase.from('matches').select('*').order('played_at', { ascending: false })
      ])

      if (ignore) return
      const firstError = profErr || gameErr || partErr || matchErr
      if (firstError) setError(firstError.message || 'Error al cargar datos')
      else {
        setProfiles(profData || [])
        setFormats(gameData || [])
        setParticipants(partData || [])
        setMatches(matchData || [])
      }
      setLoading(false)
    }
    loadAll()
    return () => { ignore = true }
  }, [])

  // Mapas auxiliares
  const nickById = useMemo(() => {
    const acc = {}
    for (const p of profiles) acc[p.id] = p.nickname
    return acc
  }, [profiles])

  const formatById = useMemo(() => {
    const acc = {}
    for (const f of formats) acc[f.id] = f.name
    return acc
  }, [formats])

  const participantsByMatchId = useMemo(() => {
    const acc = {}
    for (const p of participants) {
      if (!acc[p.match_id]) acc[p.match_id] = []
      acc[p.match_id].push(p)
    }
    return acc
  }, [participants])

  // Filtro + búsqueda
  const filteredMatches = useMemo(() => {
    const q = query.trim().toLowerCase()
    return matches.filter((m) => {
      if (selectedFormat && m.game_id !== selectedFormat) return false
      const parts = participantsByMatchId[m.id] || []
      if (selectedPlayer && !parts.some(p => p.user_id === selectedPlayer)) return false
      if (!q) return true

      const formatName = (formatById[m.game_id] || '').toLowerCase()
      const winnerNick = (nickById[m.winner] || '').toLowerCase()
      const commanderNames = parts.map(p => (p.commander_name || '').toLowerCase()).join(' ')
      const playerNicks = parts.map(p => (nickById[p.user_id] || '').toLowerCase()).join(' ')

      return (
        formatName.includes(q) ||
        winnerNick.includes(q) ||
        commanderNames.includes(q) ||
        playerNicks.includes(q)
      )
    })
  }, [matches, participantsByMatchId, selectedFormat, selectedPlayer, query, formatById, nickById])

  // Reset de paginación con cambios en filtros/búsqueda
  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [selectedFormat, selectedPlayer, query])

  // LOADING
  if (loading) {
    return (
      <section className="py-8 pb-24">
        <PageHeader title="Partidas" description="Consulta partidas recientes, filtra por formato o jugador y ve detalles." />
        <FilterBar
          formats={formats}
          profiles={profiles}
          selectedFormat={selectedFormat}
          setSelectedFormat={setSelectedFormat}
          selectedPlayer={selectedPlayer}
          setSelectedPlayer={setSelectedPlayer}
          query={query}
          setQuery={setQuery}
          onClear={() => { setSelectedFormat(''); setSelectedPlayer(''); setQuery('') }}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <FabCreate />
        <MobileCreateBar />
      </section>
    )
  }

  // ERROR
  if (error) {
    return (
      <section className="py-8 pb-24">
        <PageHeader title="Partidas" description="Consulta partidas recientes, filtra por formato o jugador y ve detalles." />
        <Card tone="soft" className="mb-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            Error al cargar partidas: {error}
          </div>
        </Card>
        <FabCreate />
        <MobileCreateBar />
      </section>
    )
  }

  const visible = filteredMatches.slice(0, visibleCount)
  const canLoadMore = visibleCount < filteredMatches.length

  return (
    <section className="py-8 pb-24">
      <PageHeader title="Partidas" description="Consulta partidas recientes, filtra por formato o jugador y ve detalles." />

      <FilterBar
        formats={formats}
        profiles={profiles}
        selectedFormat={selectedFormat}
        setSelectedFormat={setSelectedFormat}
        selectedPlayer={selectedPlayer}
        setSelectedPlayer={setSelectedPlayer}
        query={query}
        setQuery={setQuery}
        onClear={() => { setSelectedFormat(''); setSelectedPlayer(''); setQuery('') }}
      />

      {filteredMatches.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((m) => {
              const winnerNickname = nickById[m.winner] ?? '—'
              const formatName     = formatById[m.game_id] || 'Desconocido'
              const parts          = participantsByMatchId[m.id] || []
              const winnerPart     = parts.find(p => p.user_id === m.winner)

              const bannerSrcRaw =
                winnerPart?.commander_image_normal ||
                winnerPart?.commander_image ||
                winnerPart?.commander_art_crop ||
                winnerPart?.commander_image_small ||
                null

              const bannerSrc = upgradeScryfallUrl(bannerSrcRaw)

              return (
                <Link key={m.id} href={`/matches/${m.id}`} className="block focus:outline-none">
                  <Card
                    interactive
                    className="relative overflow-hidden rounded-xl transition duration-200 hover:shadow-lg focus:ring-2 focus:ring-primary/50"
                    padding="none"
                  >
                    {/* Imagen + overlays */}
                    <div className={BANNER_MODE === 'full' ? `relative ${CARD_ASPECT}` : 'relative aspect-[4/3]'}>
                      {bannerSrc ? (
                        <Image
                          src={bannerSrc}
                          alt={winnerPart?.commander_name ? `Comandante: ${winnerPart.commander_name}` : 'Comandante del ganador'}
                          fill
                          className={BANNER_MODE === 'full' ? 'object-contain' : 'object-cover'}
                          style={BANNER_MODE === 'top' ? { objectPosition: 'top' } : undefined}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400 bg-gray-100">
                          Sin imagen de comandante
                        </div>
                      )}

                      {/* Degradado para legibilidad */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                      {/* Badges superiores: fecha y formato */}
                      <div className="absolute left-2 right-2 top-2 flex items-center justify-between gap-2">
                        <span className="rounded-full bg-black/50 px-2 py-0.5 text-[11px] text-white backdrop-blur">
                          {formatDate(m.played_at)}
                        </span>
                        <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] text-gray-800 shadow ring-1 ring-black/5">
                          {formatName}
                        </span>
                      </div>

                      {/* Info principal sobre la imagen */}
                      <div className="absolute bottom-2 left-2 right-2">
                        {winnerPart?.commander_name && (
                          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-white drop-shadow">
                            {winnerPart.commander_name}
                          </h3>
                        )}
                        <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs text-gray-900 shadow ring-1 ring-black/5">
                          {/* Icono trofeo */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 4h-3V3a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v1H5a1 1 0 0 0-1 1v2a4 4 0 0 0 4 4h.06A6.003 6.003 0 0 0 11 15.92V18H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.08A6.003 6.003 0 0 0 15.94 11H16a4 4 0 0 0 4-4V5a1 1 0 0 0-1-1Zm-12 6a2 2 0 0 1-2-2V6h2v2a6.06 6.06 0 0 0 .17 1.4A2.02 2.02 0 0 1 7 10Zm12-2a2 2 0 0 1-2 2c.02-.33.02-.66 0-1V6h2v2Z"/>
                          </svg>
                          <span className="font-medium">Ganador:</span>
                          <span>{winnerNickname}</span>
                        </div>
                      </div>
                    </div>

                    {/* Cuerpo: jugadores */}
                    <Card.Section className="space-y-2">
                      <div className="pt-1">
                        <p className="mb-1 text-xs font-medium text-gray-600">Jugadores</p>
                        <ul className="flex flex-wrap gap-2">
                          {parts.map((p) => (
                            <li key={p.user_id}>
                              <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
                                {nickById[p.user_id] ?? p.user_id}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card.Section>
                  </Card>
                </Link>
              )
            })}
          </div>

          {canLoadMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                className="btn-outline"
              >
                Cargar más
              </button>
            </div>
          )}
        </>
      )}

      {/* Acciones responsivas */}
      <FabCreate />
      <MobileCreateBar />
    </section>
  )
}

// ────────────────────────────────────────────────────────────
// Subcomponentes UI (coherentes con matches/new)
// ────────────────────────────────────────────────────────────

function FilterBar({
  formats, profiles,
  selectedFormat, setSelectedFormat,
  selectedPlayer, setSelectedPlayer,
  query, setQuery, onClear
}) {
  const anyFilter = selectedFormat || selectedPlayer || query
  return (
    <Card className="mb-6">
      <Card.Header title="Filtros" subtitle="Filtra por formato, jugador o busca por texto" />
      <Card.Section className="grid gap-4 sm:grid-cols-3">
        <div className="group rounded-lg border border-gray-200 bg-gray-50/40 p-3 transition focus-within:border-primary/50 focus-within:bg-white focus-within:shadow-sm">
          <label className="mb-1.5 block text-sm font-medium">Formato</label>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="input"
          >
            <option value="">Todos</option>
            {formats.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div className="group rounded-lg border border-gray-200 bg-gray-50/40 p-3 transition focus-within:border-primary/50 focus-within:bg-white focus-within:shadow-sm">
          <label className="mb-1.5 block text-sm font-medium">Jugador</label>
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="input"
          >
            <option value="">Todos</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.nickname}</option>
            ))}
          </select>
        </div>

        <div className="group rounded-lg border border-gray-200 bg-gray-50/40 p-3 transition focus-within:border-primary/50 focus-within:bg-white focus-within:shadow-sm">
          <label className="mb-1.5 block text-sm font-medium">Buscar</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="comandante, jugador, formato…"
            className="input"
          />
        </div>

        {anyFilter && (
          <div className="sm:col-span-3">
            <button onClick={onClear} className="btn-outline px-3 py-1 text-xs">
              Limpiar filtros
            </button>
          </div>
        )}
      </Card.Section>
    </Card>
  )
}

function EmptyState() {
  return (
    <Card className="flex flex-col items-center p-10 text-center">
      <h2 className="mb-3 text-2xl font-semibold text-gray-900">Sin partidas aún</h2>
      <p className="mb-6 max-w-sm text-sm text-gray-600">
        Crea tu primera partida y aquí verás las más recientes, con la imagen del comandante del ganador.
      </p>
      {/* CTA alternativo por si no ven la barra móvil / FAB */}
      <Link href="/matches/new" className="btn-primary">Nueva partida</Link>
    </Card>
  )
}
