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

function MatchSkeleton() {
  return (
    <div className="relative">
      <Card className="overflow-hidden border border-slate-200/60 bg-white shadow-sm animate-pulse" padding="none">
        <div className="aspect-[4/3] bg-slate-200" />
        <Card.Section className="p-6">
          <div className="space-y-3">
            <div className="h-5 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-slate-200 rounded-md" />
              <div className="h-6 w-24 bg-slate-200 rounded-md" />
              <div className="h-6 w-28 bg-slate-200 rounded-md" />
            </div>
          </div>
        </Card.Section>
      </Card>
    </div>
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

function MatchCard({ match, formatName, winnerNickname, parts, bannerSrc, winnerPart, nickById }) {
  const [isHovered, setIsHovered] = useState(false)
  
  const getMatchPerformance = (playerCount) => {
    if (playerCount >= 5) return { level: 'epic', color: 'from-purple-600 to-indigo-700', bg: 'bg-purple-50', text: 'text-purple-800', ring: 'ring-purple-200' }
    if (playerCount === 4) return { level: 'standard', color: 'from-blue-600 to-blue-700', bg: 'bg-blue-50', text: 'text-blue-800', ring: 'ring-blue-200' }
    if (playerCount === 3) return { level: 'small', color: 'from-amber-600 to-amber-700', bg: 'bg-amber-50', text: 'text-amber-800', ring: 'ring-amber-200' }
    return { level: 'duo', color: 'from-emerald-600 to-emerald-700', bg: 'bg-emerald-50', text: 'text-emerald-800', ring: 'ring-emerald-200' }
  }

  const performance = getMatchPerformance(parts.length)

  return (
    <div 
      className="group relative transform transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Premium glow effect */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${performance.color} opacity-0 blur-xl transition-all duration-700 group-hover:opacity-15 -z-10`} />
      
      <Link href={`/matches/${match.id}`} className="block focus:outline-none">
        <Card
          interactive
          className="relative overflow-hidden border border-slate-200/60 bg-white/95 backdrop-blur-sm transition-all duration-500 hover:border-slate-300 hover:shadow-2xl focus:ring-4 focus:ring-slate-500/20 focus:border-slate-400"
          padding="none"
        >
          {/* Hero Image Section */}
          <div className={BANNER_MODE === 'full' ? `relative ${CARD_ASPECT}` : 'relative aspect-[4/3] overflow-hidden'}>
            {bannerSrc ? (
              <Image
                src={bannerSrc}
                alt={winnerPart?.commander_name ? `Comandante: ${winnerPart.commander_name}` : 'Comandante del ganador'}
                fill
                className={BANNER_MODE === 'full' ? 'object-contain transition-transform duration-700 group-hover:scale-110' : 'object-cover transition-transform duration-700 group-hover:scale-110'}
                style={BANNER_MODE === 'top' ? { objectPosition: 'top' } : undefined}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] transition-transform duration-1000 group-hover:translate-x-[100%]" />
                <div className="relative z-10">
                  <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>Sin imagen de comandante</div>
                </div>
              </div>
            )}

            {/* Premium overlay gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent" />

            {/* Floating badges with premium animations */}
            <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-all duration-300 group-hover:bg-black/70 group-hover:shadow-xl">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(match.played_at)}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105 ${performance.bg} ${performance.text} ring-2 ring-white/20`}>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                </svg>
                {formatName}
              </span>
            </div>

            {/* Hero content with premium typography */}
            <div className="absolute bottom-3 left-3 right-3 space-y-2">
              {winnerPart?.commander_name && (
                <h3 className="line-clamp-2 text-lg font-bold leading-tight text-white drop-shadow-lg transition-all duration-300 group-hover:drop-shadow-2xl">
                  {winnerPart.commander_name}
                </h3>
              )}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-lg ring-1 ring-black/5 transition-all duration-300 group-hover:bg-white group-hover:shadow-xl group-hover:scale-105">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="text-slate-700">Ganador:</span>
                <span className="text-slate-900">{winnerNickname}</span>
              </div>
            </div>
          </div>

          {/* Content section with premium styling */}
          <Card.Section className="p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Jugadores</h4>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${performance.bg} ${performance.text}`}>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  {parts.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parts.map((p, index) => {
                  const isWinner = p.user_id === match.winner
                  return (
                    <span 
                      key={p.user_id}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:scale-105 hover:shadow-md ${
                        isWinner
                          ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 ring-2 ring-amber-200 shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        animation: isHovered ? 'fadeInUp 0.3s ease-out forwards' : undefined
                      }}
                    >
                      {isWinner && (
                        <svg className="h-3 w-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                      {nickById[p.user_id] ?? p.user_id}
                    </span>
                  )
                })}
              </div>
            </div>
          </Card.Section>
          
          {/* Premium action footer */}
          <div className="border-t border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50/50 to-transparent">
            <div className={`flex items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-all duration-500 py-2.5 px-4 ${
              isHovered 
                ? `border-slate-300 bg-slate-50 text-slate-700 shadow-sm` 
                : 'border-slate-200 bg-transparent text-slate-500'
            }`}>
              <svg className={`h-4 w-4 transition-all duration-300 ${isHovered ? 'translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="font-medium">Ver Detalles</span>
              <svg className={`h-4 w-4 transition-all duration-300 ${isHovered ? 'translate-x-1 scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  )
}

// FAB — Botón flotante (solo ≥ sm)
function FabCreate() {
  return (
    <Link
      href="/matches/new"
      aria-label="Crear nueva partida"
      className="fixed right-6 z-50 hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-3 text-white shadow-xl ring-1 ring-black/10 transition-all duration-300 hover:from-slate-800 hover:to-slate-700 hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-500/30"
      style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span className="font-semibold">Nueva partida</span>
      {/* Floating ring animation */}
      <div className="absolute inset-0 rounded-full border-2 border-white/20 opacity-0 transition-all duration-500 hover:opacity-100 hover:scale-125 blur-sm -z-10" />
    </Link>
  )
}

// Barra móvil fija inferior (solo < sm)
function MobileCreateBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center border-t border-slate-200/80 bg-white/95 backdrop-blur-lg px-4 py-3 sm:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
    >
      <Link
        href="/matches/new"
        className="w-full max-w-md rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-3 text-center font-semibold text-white shadow-xl ring-1 ring-black/10 transition-all duration-300 active:scale-95 active:shadow-lg"
        aria-label="Crear nueva partida"
      >
        <div className="flex items-center justify-center gap-2">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva partida
        </div>
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
      <section className="py-8 pb-24 px-4 bg-slate-50/30 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <PageHeader title="Partidas" description="Consulta partidas recientes, filtra por formato o jugador y ve detalles." />
          <PremiumFilterBar
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
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <MatchSkeleton key={i} />)}
          </div>
          <FabCreate />
          <MobileCreateBar />
        </div>
      </section>
    )
  }

  // ERROR
  if (error) {
    return (
      <section className="py-8 pb-24 px-4 bg-slate-50/30 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <PageHeader title="Partidas" description="Consulta partidas recientes, filtra por formato o jugador y ve detalles." />
          <Card className="border border-red-200 bg-red-50 shadow-sm mb-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <div className="mb-2 text-red-800 font-semibold">No se pudieron cargar las partidas</div>
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          </Card>
          <FabCreate />
          <MobileCreateBar />
        </div>
      </section>
    )
  }

  const visible = filteredMatches.slice(0, visibleCount)
  const canLoadMore = visibleCount < filteredMatches.length

  return (
    <section className="py-8 pb-24 px-4 bg-slate-50/30 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Partidas" description="Consulta partidas recientes, filtra por formato o jugador y ve detalles." />

        <PremiumFilterBar
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
          <PremiumEmptyState />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
                  <MatchCard
                    key={m.id}
                    match={m}
                    formatName={formatName}
                    winnerNickname={winnerNickname}
                    parts={parts}
                    bannerSrc={bannerSrc}
                    winnerPart={winnerPart}
                    nickById={nickById}
                  />
                )
              })}
            </div>

            {canLoadMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-500/20"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Cargar más partidas
                </button>
              </div>
            )}
          </>
        )}

        {/* Acciones responsivas */}
        <FabCreate />
        <MobileCreateBar />
      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────────
// Subcomponentes UI Premium
// ────────────────────────────────────────────────────────────

// CSS personalizado para las animaciones
const customStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.3s ease-out forwards;
  }
`

// Agregar estilos al head si no existen
if (typeof document !== 'undefined' && !document.getElementById('matches-premium-styles')) {
  const style = document.createElement('style')
  style.id = 'matches-premium-styles'
  style.textContent = customStyles
  document.head.appendChild(style)
}

function PremiumFilterBar({
  formats, profiles,
  selectedFormat, setSelectedFormat,
  selectedPlayer, setSelectedPlayer,
  query, setQuery, onClear
}) {
  const anyFilter = selectedFormat || selectedPlayer || query

  return (
    <Card className="mb-8 border border-slate-200/60 bg-white shadow-sm overflow-hidden">
      <Card.Header 
        title="Filtros & Búsqueda" 
        subtitle="Personaliza la vista de partidas según tus preferencias" 
      />
      <Card.Section className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Buscar Partidas</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 transition-colors duration-200 group-focus-within:text-slate-600">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-slate-900 placeholder-slate-500 transition-all duration-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 hover:border-slate-400 sm:text-sm" 
                placeholder="Comandante, jugador, formato..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
              />
              {query && (
                <button 
                  type="button" 
                  onClick={() => setQuery('')} 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition-colors duration-200 hover:text-slate-600"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Format filter */}
          <div className="group">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Formato de Juego</label>
            <div className="relative">
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-10 text-slate-900 transition-all duration-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 hover:border-slate-400 sm:text-sm appearance-none"
              >
                <option value="">🎯 Todos los formatos</option>
                {formats.map((f) => (
                  <option key={f.id} value={f.id}>🎲 {f.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Player filter */}
          <div className="group">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Jugador Específico</label>
            <div className="relative">
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-10 text-slate-900 transition-all duration-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 hover:border-slate-400 sm:text-sm appearance-none"
              >
                <option value="">👥 Todos los jugadores</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>👤 {p.nickname}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {anyFilter && (
          <div className="mt-6 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
                <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Filtros activos</p>
                <p className="text-xs text-slate-500">Mostrando {filteredMatches.length} partida{filteredMatches.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button 
              onClick={onClear} 
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar filtros
            </button>
          </div>
        )}
      </Card.Section>
    </Card>
  )
}

function PremiumEmptyState() {
  return (
    <Card className="border border-slate-200/60 bg-white shadow-sm">
      <div className="flex flex-col items-center justify-center p-16 text-center">
        {/* Animated icon */}
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner">
            <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          {/* Floating ring animation */}
          <div className="absolute inset-0 rounded-full border-2 border-slate-200 opacity-0 animate-ping" style={{ animationDuration: '3s' }} />
        </div>
        
        <h2 className="mb-3 text-2xl font-bold text-slate-900">Sin partidas por aquí</h2>
        <p className="mb-8 max-w-md text-slate-600 leading-relaxed">
          Crea tu primera partida épica y aquí verás todas las batallas más recientes, 
          con las imágenes de los comandantes victoriosos brillando en todo su esplendor.
        </p>
        
        {/* CTA alternativo premium */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/matches/new" 
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-slate-800 hover:to-slate-700 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-500/30"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Partida
          </Link>
          <Link 
            href="/players" 
            className="inline-flex items-center gap-2 rounded-full border-2 border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-500/20"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-3a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            Ver Jugadores
          </Link>
        </div>
      </div>
    </Card>
  )
}