// pages/stats/index.js
import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card' // usamos el mismo Card del home para coherencia

/* ===============================================================
   THEME: usamos la misma estructura y key guardada que el Home
   (lee mp_professional_theme de localStorage y aplica estilos)
   =============================================================== */
const MTG_PROFESSIONAL_THEMES = [
  { key:'mono-white', label:'Plains', icon:'⚪️',
    colors:{ primary:'from-amber-400 to-yellow-500', ring:'ring-amber-300', glowColor:'rgba(245,158,11,.4)' },
    gradient:'bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600',
    backgroundGradient:'from-amber-50 via-yellow-50 to-amber-100',
    text:{ strong:'text-amber-900', soft:'text-amber-700' },
    border:'border-amber-300'
  },
  { key:'mono-blue', label:'Island', icon:'🔵',
    colors:{ primary:'from-blue-500 to-indigo-600', ring:'ring-blue-300', glowColor:'rgba(59,130,246,.4)' },
    gradient:'bg-gradient-to-br from-blue-600 via-indigo-500 to-blue-700',
    backgroundGradient:'from-blue-50 via-indigo-50 to-blue-100',
    text:{ strong:'text-blue-900', soft:'text-blue-700' },
    border:'border-blue-300'
  },
  { key:'mono-black', label:'Swamp', icon:'⚫️',
    colors:{ primary:'from-gray-700 to-gray-900', ring:'ring-gray-400', glowColor:'rgba(107,114,128,.4)' },
    gradient:'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900',
    backgroundGradient:'from-gray-50 via-gray-100 to-gray-200',
    text:{ strong:'text-gray-900', soft:'text-gray-700' },
    border:'border-gray-400'
  },
  { key:'mono-red', label:'Mountain', icon:'🔴',
    colors:{ primary:'from-red-500 to-rose-600', ring:'ring-red-300', glowColor:'rgba(239,68,68,.4)' },
    gradient:'bg-gradient-to-br from-red-600 via-rose-500 to-red-700',
    backgroundGradient:'from-red-50 via-rose-50 to-red-100',
    text:{ strong:'text-red-900', soft:'text-red-700' },
    border:'border-red-300'
  },
  { key:'mono-green', label:'Forest', icon:'🟢',
    colors:{ primary:'from-green-500 to-emerald-600', ring:'ring-green-300', glowColor:'rgba(34,197,94,.4)' },
    gradient:'bg-gradient-to-br from-green-600 via-emerald-500 to-green-700',
    backgroundGradient:'from-green-50 via-emerald-50 to-green-100',
    text:{ strong:'text-green-900', soft:'text-green-700' },
    border:'border-green-300'
  },
  { key:'azorius', label:'Azorius', icon:'⚪️🔵',
    colors:{ primary:'from-blue-400 to-indigo-500', ring:'ring-blue-300', glowColor:'rgba(99,102,241,.4)' },
    gradient:'bg-gradient-to-br from-blue-500 via-indigo-400 to-blue-600',
    backgroundGradient:'from-blue-50 via-indigo-50 to-blue-100',
    text:{ strong:'text-blue-900', soft:'text-blue-700' },
    border:'border-blue-300'
  },
  { key:'golgari', label:'Golgari', icon:'⚫️🟢',
    colors:{ primary:'from-green-600 to-gray-700', ring:'ring-green-400', glowColor:'rgba(21,128,61,.4)' },
    gradient:'bg-gradient-to-br from-green-600 via-gray-600 to-green-800',
    backgroundGradient:'from-green-50 via-gray-50 to-green-100',
    text:{ strong:'text-green-900', soft:'text-green-700' },
    border:'border-green-400'
  },
  { key:'izzet', label:'Izzet', icon:'🔵🔴',
    colors:{ primary:'from-blue-500 to-red-500', ring:'ring-purple-300', glowColor:'rgba(147,51,234,.4)' },
    gradient:'bg-gradient-to-br from-blue-500 via-purple-500 to-red-500',
    backgroundGradient:'from-blue-50 via-purple-50 to-red-50',
    text:{ strong:'text-purple-900', soft:'text-purple-700' },
    border:'border-purple-300'
  },
]
const DEFAULT_THEME_KEY = 'azorius'

 function useThemeRotation(intervalMs = 60000) {
   const [themeKey, setThemeKey] = useState(DEFAULT_THEME_KEY)
   const [index, setIndex] = useState(0)
   const timer = React.useRef(null)
   // lee el último tema guardado
   useEffect(() => {
     try {
       const saved = localStorage.getItem('mp_professional_theme')
       const idx = MTG_PROFESSIONAL_THEMES.findIndex(t => t.key === saved)
       if (idx >= 0) { setThemeKey(saved); setIndex(idx) }
     } catch {}
   }, [])
   // rota cada X ms
   useEffect(() => {
     if (timer.current) clearInterval(timer.current)
     timer.current = setInterval(() => {
       setIndex(prev => {
         const next = (prev + 1) % MTG_PROFESSIONAL_THEMES.length
         const nextKey = MTG_PROFESSIONAL_THEMES[next].key
         setThemeKey(nextKey)
         try { localStorage.setItem('mp_professional_theme', nextKey) } catch {}
         return next
       })
     }, intervalMs)
     return () => timer.current && clearInterval(timer.current)
   }, [intervalMs])
   const theme = useMemo(
     () => MTG_PROFESSIONAL_THEMES.find(t => t.key === themeKey) || MTG_PROFESSIONAL_THEMES[0],
     [themeKey]
   )
   useEffect(() => {
     document.documentElement.setAttribute('data-mtg-theme', theme.key)
   }, [theme.key])
   return { theme, index }
 }

/* ===============================================================
   CSS premium (reutilizamos los mismos nombres de animación)
   + reduce motion
   =============================================================== */
const professionalCSS = `
@keyframes professionalFadeIn {
  from { opacity:0; transform: translateY(16px) scale(.98); }
  to   { opacity:1; transform: translateY(0) scale(1); }
}
.crystal-card { position:relative; overflow:hidden; }
.crystal-card::before {
  content:''; position:absolute; inset:0; left:-120%; width:120%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent);
  transition: transform .6s ease; transform: translateX(0);
}
.crystal-card:hover::before { transform: translateX(220%); }
.animate-professional-fade-in { animation: professionalFadeIn .7s cubic-bezier(.25,.46,.45,.94) both; }
.theme-transition { transition: all .6s cubic-bezier(.25,.46,.45,.94); }
.prof-glass { background: rgba(255,255,255,.85); backdrop-filter: blur(8px) saturate(160%); }

@media (prefers-reduced-motion: reduce) {
  .animate-professional-fade-in { animation: none !important; }
  .theme-transition { transition: none !important; }
}

/* Paleta base para barras y badges, respetando tema */
.badge-soft { background: rgba(255,255,255,.8); border:1px solid rgba(0,0,0,.06); }
`

if (typeof document !== 'undefined' && !document.getElementById('professional-stats-styles')) {
  const st = document.createElement('style')
  st.id = 'professional-stats-styles'
  st.textContent = professionalCSS
  document.head.appendChild(st)
}

/* ===============================================================
   Pequeños átomos estilizados al estilo Home
   =============================================================== */

function ThemedStatCard({ title, value, subtitle, icon, accent = 'blue', trend = null, onClick = null, theme }) {
  const Component = onClick ? 'button' : 'div'
  const accentMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
    gray: 'bg-gray-100 text-gray-600'
  }
  return (
    <Component
      onClick={onClick || undefined}
      className={`crystal-card animate-professional-fade-in ${
        onClick ? 'hover:scale-[1.02] transition-transform' : ''
      }`}
      style={{ '--glow-color': theme.colors.glowColor }}
    >
      <Card className="relative bg-white/90 backdrop-blur-sm border border-white/60 shadow-lg hover:shadow-xl theme-transition" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow ${accentMap[accent]}`}>
            {icon}
          </div>
          {trend && (
            <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
              trend.direction === 'up' ? 'bg-green-100 text-green-700' :
              trend.direction === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {trend.value}
            </div>
          )}
        </div>
        <div>
          <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.text.soft} mb-1`}>{title}</h3>
          <p className={`text-3xl font-black ${theme.text.strong}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </Card>
    </Component>
  )
}

function ProgressBar({ label, value, maxValue, color = 'blue', showPercentage = false, theme }) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
  const colorMap = {
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-green-500 to-emerald-600',
    amber: 'from-amber-500 to-yellow-600',
    purple: 'from-purple-500 to-pink-500',
    gray: 'from-gray-500 to-gray-700'
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className={`font-semibold ${theme.text.strong} truncate`}>{label}</span>
        <span className={`${theme.text.soft} ml-2`}>
          {showPercentage ? `${percentage.toFixed(1)}%` : `${value}${maxValue > 0 ? `/${maxValue}` : ''}`}
        </span>
      </div>
      <div className="w-full bg-gray-200/70 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${colorMap[color]} theme-transition`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  )
}

function TopPlayerCard({ player, position, maxWins, theme }) {
  const getBadge = (pos) => pos===1 ? 'bg-yellow-500' : pos===2 ? 'bg-gray-400' : pos===3 ? 'bg-amber-600' : 'bg-gray-300'
  return (
    <Link href={`/players/${player.id}`} className="block">
      <div className="group flex items-center gap-4 p-4 rounded-xl border border-white/60 bg-white/90 backdrop-blur-sm shadow hover:shadow-md theme-transition">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${getBadge(position)} text-white flex items-center justify-center text-sm font-bold shadow-sm`}>
            {position}
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white to-gray-100 border border-white/60 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-700">
              {(player.nickname || '?').slice(0,1).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold truncate group-hover:opacity-80 theme-transition ${theme.text.strong}`}>
            {player.nickname || 'Jugador'}
          </h4>
          <div className="mt-2">
            <ProgressBar label={`${player.wins} victorias`} value={player.wins} maxValue={maxWins} color="green" theme={theme}/>
          </div>
        </div>
        <div className={`${theme.text.soft} opacity-60 group-hover:opacity-100 theme-transition`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

function CommanderBadge({ commander, count, type = 'usage', theme }) {
  const tone = type === 'usage'
    ? 'bg-blue-50/80 border-blue-200 text-blue-800'
    : 'bg-green-50/80 border-green-200 text-green-800'
  const dot = type === 'usage' ? 'bg-blue-600' : 'bg-green-600'
  return (
    <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${tone} shadow-sm`}>
      <span className="font-semibold truncate max-w-[150px]" title={commander}>{commander}</span>
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${dot}`}>
        {count}
      </span>
    </div>
  )
}

function StatsSkeleton({ theme }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/60 bg-white/80 backdrop-blur-sm p-6 shadow animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-8 w-16 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/60 bg-white/80 backdrop-blur-sm p-6 shadow animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-16 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ===============================================================
   Página
   =============================================================== */
export default function Stats() {
  const { theme } = useThemeRotation(40000)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    setLoading(true); setError(null)
    try {
      const [profilesRes, matchesRes, participantsRes, gamesRes] = await Promise.all([
        supabase.from('profiles').select('id, nickname'),
        supabase.from('matches').select('id, winner, played_at, game_id'),
        supabase.from('match_participants').select('match_id, user_id, kills, max_damage, first_to_die, deck_commander, commander_name'),
        supabase.from('games').select('id, name'),
      ])
      const anyError = profilesRes.error || matchesRes.error || participantsRes.error || gamesRes.error
      if (anyError) throw anyError

      const profiles = profilesRes.data || []
      const matches = matchesRes.data || []
      const participants = participantsRes.data || []
      const games = gamesRes.data || []

      // --- Agregados (igual que tu versión, intacto) ---
      const winsCount = {}, damageCount = {}, killsCount = {}, firstDieCount = {}, playedMatchesByUser = {}, totalParticipations = {}

      matches.forEach(({ winner }) => { if (winner) winsCount[winner] = (winsCount[winner] || 0) + 1 })
      participants.forEach((p) => {
        const uid = p.user_id; if (!uid) return
        damageCount[uid] = (damageCount[uid] || 0) + (p.max_damage || 0)
        killsCount[uid] = (killsCount[uid] || 0) + (p.kills || 0)
        if (p.first_to_die) firstDieCount[uid] = (firstDieCount[uid] || 0) + 1
        playedMatchesByUser[uid] = [ ...(playedMatchesByUser[uid] || []), p.match_id ]
        totalParticipations[uid] = (totalParticipations[uid] || 0) + 1
      })

      const playedById = Object.fromEntries(matches.map((m) => [m.id, m]))
      const streakByUser = {}
      profiles.forEach(({ id }) => {
        const playedList = (playedMatchesByUser[id] || [])
          .map((mid) => playedById[mid]).filter(Boolean)
          .sort((a, b) => new Date(a.played_at) - new Date(b.played_at))
        let maxStreak = 0, currentStreak = 0
        playedList.forEach((m) => {
          if (m.winner === id) { currentStreak += 1; maxStreak = Math.max(maxStreak, currentStreak) }
          else currentStreak = 0
        })
        streakByUser[id] = maxStreak
      })
      const longestStreak = Math.max(0, ...Object.values(streakByUser))
      const playerLongest = profiles.find((p) => streakByUser[p.id] === longestStreak)?.nickname || 'Ninguno'

      const topPlayers = profiles
        .map((p) => ({
          id: p.id,
          nickname: p.nickname,
          wins: winsCount[p.id] || 0,
          totalParticipations: totalParticipations[p.id] || 0,
          winRate: totalParticipations[p.id] > 0 ? ((winsCount[p.id] || 0) / totalParticipations[p.id] * 100) : 0,
          totalDamage: damageCount[p.id] || 0,
          avgDamage: totalParticipations[p.id] > 0 ? (damageCount[p.id] || 0) / totalParticipations[p.id] : 0,
          kills: killsCount[p.id] || 0,
          firstToDie: firstDieCount[p.id] || 0,
          maxStreak: streakByUser[p.id] || 0,
        }))
        .filter(p => p.totalParticipations > 0)
        .sort((a, b) => b.wins - a.wins)

      const usageCount = {}, winsByCommander = {}
      participants.forEach((p) => {
        const commander = p.commander_name || p.deck_commander
        if (commander) usageCount[commander] = (usageCount[commander] || 0) + 1
      })
      matches.forEach((m) => {
        const winPart = participants.find((p) => p.match_id === m.id && p.user_id === m.winner)
        if (!winPart) return
        const commander = winPart.commander_name || winPart.deck_commander
        if (commander) winsByCommander[commander] = (winsByCommander[commander] || 0) + 1
      })

      const topUsage = Object.entries(usageCount).map(([commander, count]) => ({ commander, count }))
        .sort((a, b) => b.count - a.count).slice(0, 8)
      const topWinsCmd = Object.entries(winsByCommander).map(([commander, wins]) => ({ commander, wins }))
        .sort((a, b) => b.wins - a.wins).slice(0, 8)

      const totalMatches = matches.length
      const totalParticipantsCount = participants.length
      const activePlayersCount = profiles.filter(p => totalParticipations[p.id] > 0).length
      const participantsPerMatch = Object.values(
        participants.reduce((acc, p) => { acc[p.match_id] = (acc[p.match_id] || 0) + 1; return acc }, {})
      )
      const avgParticipants = totalMatches > 0
        ? (participantsPerMatch.reduce((s, v) => s + v, 0) / totalMatches).toFixed(1) : '0'

      const gameCount = {}
      matches.forEach((m) => { gameCount[m.game_id] = (gameCount[m.game_id] || 0) + 1 })
      const popularGames = Object.entries(gameCount).map(([game_id, count]) => ({
        name: (games.find((g) => g.id === game_id)?.name) || 'Desconocido',
        count,
        percentage: totalMatches > 0 ? (count / totalMatches * 100).toFixed(1) : '0'
      })).sort((a,b)=> b.count - a.count).slice(0,6)

      const mostActivePlayer = topPlayers.length ? topPlayers.reduce((max, p) => p.totalParticipations > max.totalParticipations ? p : max) : null
      const bestWinRatePlayer = topPlayers.filter(p => p.totalParticipations >= 3).sort((a,b)=> b.winRate - a.winRate)[0] || null
      const topKillerPlayer = topPlayers.sort((a,b)=> b.kills - a.kills)[0] || null

      setStats({
        totalMatches, totalParticipantsCount, activePlayersCount, avgParticipants,
        longestStreak, playerLongest,
        topPlayers: topPlayers.slice(0,10),
        mostActivePlayer, bestWinRatePlayer, topKillerPlayer,
        topUsage, topWinsCmd, popularGames,
      })
    } catch (err) {
      console.error(err)
      setError('Error al cargar las estadísticas del sistema')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  // Wrapper con fondo temático como en Home
  const PageWrap = ({ children }) => (
    <section
      className="min-h-screen theme-transition"
      style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})` }}
    >
      {/* halos decorativos sutiles (rendimiento OK) */}
      <div className="fixed top-0 left-0 w-72 h-72 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-72 h-72 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 space-y-8">
        {children}
      </div>
    </section>
  )

  if (loading) {
    return (
      <PageWrap>
        <div className="mb-4">
          <PageHeader
            title="Análisis y Estadísticas"
            description="Dashboard ejecutivo con métricas clave y insights del rendimiento"
          />
        </div>
        <StatsSkeleton theme={theme} />
      </PageWrap>
    )
  }

  if (error) {
    return (
      <PageWrap>
        <div className="mb-4">
          <PageHeader title="Análisis y Estadísticas" />
        </div>
        <Card className="bg-white/90 backdrop-blur-sm border border-red-200 shadow">
          <div className="flex items-center gap-3 text-red-800">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold">Error en el sistema de análisis</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <button
            className={`mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white theme-transition ${theme.gradient} focus:outline-none focus:ring-4 focus:ring-offset-2 ${theme.colors.ring}`}
            onClick={fetchStats}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reintentar análisis
          </button>
        </Card>
      </PageWrap>
    )
  }

  if (!stats) return null

  return (
    <PageWrap>
      {/* Header con chip de tema como en el Hero */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <PageHeader
            title="Análisis y Estadísticas"
            description="Dashboard ejecutivo con métricas clave y insights del rendimiento de la plataforma"
          />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-soft">
            <span className="text-lg">{theme.icon}</span>
            <span className={`text-sm font-semibold ${theme.text.strong}`}>{theme.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/ranking"
            className="inline-flex items-center gap-2 rounded-lg bg-white/80 backdrop-blur-sm border border-white/60 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-white theme-transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l3-3 3 3v13M9 19h6" />
            </svg>
            Ver Ranking
          </Link>
          <Link
            href="/matches/new"
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white shadow ${theme.gradient} hover:shadow-md theme-transition focus:outline-none focus:ring-4 focus:ring-offset-2 ${theme.colors.ring}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nueva Partida
          </Link>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ThemedStatCard
          title="Partidas Totales"
          value={stats.totalMatches.toLocaleString()}
          subtitle="Registradas en el sistema"
          accent="blue"
          theme={theme}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <ThemedStatCard
          title="Jugadores Activos"
          value={stats.activePlayersCount.toLocaleString()}
          subtitle="Con al menos 1 partida"
          accent="green"
          theme={theme}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-3a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          }
        />
        <ThemedStatCard
          title="Promedio por Partida"
          value={stats.avgParticipants}
          subtitle="Jugadores participantes"
          accent="amber"
          theme={theme}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <ThemedStatCard
          title="Racha Récord"
          value={stats.longestStreak}
          subtitle={`por ${stats.playerLongest}`}
          accent="purple"
          theme={theme}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
      </div>

      {/* Insights Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {stats.mostActivePlayer && (
          <ThemedStatCard
            title="Jugador Más Activo"
            value={stats.mostActivePlayer.nickname}
            subtitle={`${stats.mostActivePlayer.totalParticipations} participaciones`}
            accent="blue"
            theme={theme}
            onClick={() => (window.location.href = `/players/${stats.mostActivePlayer.id}`)}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
        )}
        {stats.bestWinRatePlayer && (
          <ThemedStatCard
            title="Mejor Tasa de Victoria"
            value={`${stats.bestWinRatePlayer.winRate.toFixed(1)}%`}
            subtitle={stats.bestWinRatePlayer.nickname}
            accent="green"
            theme={theme}
            onClick={() => (window.location.href = `/players/${stats.bestWinRatePlayer.id}`)}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        )}
        {stats.topKillerPlayer && (
          <ThemedStatCard
            title="Mayor Eliminador"
            value={stats.topKillerPlayer.kills}
            subtitle={`${stats.topKillerPlayer.nickname} (total)`}
            accent="red"
            theme={theme}
            onClick={() => (window.location.href = `/players/${stats.topKillerPlayer.id}`)}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            }
          />
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Top Players */}
        <Card className="bg-white/90 backdrop-blur-sm border border-white/60 shadow">
          <div className="border-b border-white/60 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${theme.text.strong}`}>Ranking de Victorias</h3>
                  <p className={`${theme.text.soft} text-sm`}>Top 10 jugadores por victorias totales</p>
                </div>
              </div>
              <button
                onClick={fetchStats}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 theme-transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {stats.topPlayers.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-3a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <p className="text-gray-500">No hay datos de jugadores disponibles</p>
              </div>
            ) : (
              stats.topPlayers.map((player, idx) => (
                <TopPlayerCard
                  key={player.id}
                  player={player}
                  position={idx + 1}
                  maxWins={stats.topPlayers[0]?.wins || 1}
                  theme={theme}
                />
              ))
            )}
          </div>
        </Card>

        {/* Format Analytics */}
        <Card className="bg-white/90 backdrop-blur-sm border border-white/60 shadow">
          <div className="border-b border-white/60 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l3-3 3 3v13M9 19h6" />
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-bold ${theme.text.strong}`}>Formatos Populares</h3>
                <p className={`${theme.text.soft} text-sm`}>Distribución de partidas por formato</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {stats.popularGames.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l3-3 3 3v13M9 19h6" />
                </svg>
                <p className="text-gray-500">No hay datos de formatos disponibles</p>
              </div>
            ) : (
              stats.popularGames.map((game, idx) => (
                <ProgressBar
                  key={game.name}
                  label={`${game.name} · ${game.percentage}%`}
                  value={game.count}
                  maxValue={stats.popularGames[0]?.count || 1}
                  color={idx === 0 ? 'purple' : idx === 1 ? 'blue' : 'gray'}
                  showPercentage={false}
                  theme={theme}
                />
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Commander Analytics */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="bg-white/90 backdrop-blur-sm border border-white/60 shadow">
          <div className="border-b border-white/60 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-bold ${theme.text.strong}`}>Comandantes Más Usados</h3>
                <p className={`${theme.text.soft} text-sm`}>Popularidad por frecuencia de uso</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {stats.topUsage.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 01-7-7z" />
                </svg>
                <p className="text-gray-500">No hay datos de comandantes disponibles</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {stats.topUsage.map((c) => (
                  <CommanderBadge key={c.commander} commander={c.commander} count={c.count} type="usage" theme={theme}/>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-white/60 shadow">
          <div className="border-b border-white/60 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-bold ${theme.text.strong}`}>Comandantes Victoriosos</h3>
                <p className={`${theme.text.soft} text-sm`}>Ranking por victorias conseguidas</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {stats.topWinsCmd.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">No hay datos de victorias disponibles</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {stats.topWinsCmd.map((c) => (
                  <CommanderBadge key={c.commander} commander={c.commander} count={c.wins} type="wins" theme={theme}/>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Footer / tema actual */}
      <footer className="pt-8 text-center">
        <div className="inline-flex items-center gap-2">
          <span className={`text-sm ${theme.text.soft}`}>Tema actual:</span>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full shadow bg-gradient-to-r ${theme.colors.primary}`} />            <span className={`text-sm font-bold ${theme.text.strong}`}>{theme.label}</span>
          </div>
        </div>
      </footer>
    </PageWrap>
  )
}
