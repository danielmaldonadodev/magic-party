// pages/stats/index.js
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import PageHeader from '../../components/PageHeader'

function StatCard({ title, value, subtitle, icon, color = 'gray', trend = null, onClick = null }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-100 text-blue-600', 
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600'
  }

  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm transition-all duration-200 ${
        onClick ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center`}>
          {icon}
        </div>
        {trend && (
          <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
            trend.direction === 'up' ? 'bg-green-100 text-green-700' : 
            trend.direction === 'down' ? 'bg-red-100 text-red-700' : 
            'bg-gray-100 text-gray-700'
          }`}>
            {trend.direction === 'up' && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l10-10M17 7v10M17 7H7" />
              </svg>
            )}
            {trend.direction === 'down' && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17l-10-10M7 7v10M7 7h10" />
              </svg>
            )}
            {trend.value}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </Component>
  )
}

function ProgressBar({ label, value, maxValue, color = 'blue', showPercentage = false }) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
  
  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600', 
    amber: 'bg-amber-600',
    purple: 'bg-purple-600',
    gray: 'bg-gray-600'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-900 truncate">{label}</span>
        <span className="text-gray-600 ml-2">
          {showPercentage ? `${percentage.toFixed(1)}%` : `${value}${maxValue > 0 ? `/${maxValue}` : ''}`}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${colors[color]}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  )
}

function TopPlayerCard({ player, position, maxWins }) {
  const getBadgeColor = (pos) => {
    if (pos === 1) return 'bg-yellow-500'
    if (pos === 2) return 'bg-gray-400' 
    if (pos === 3) return 'bg-amber-600'
    return 'bg-gray-300'
  }

  return (
    <Link href={`/players/${player.id}`}>
      <div className="group flex items-center gap-4 p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${getBadgeColor(position)} text-white flex items-center justify-center text-sm font-bold shadow-sm`}>
            {position}
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-700">
              {(player.nickname || '?').slice(0, 1).toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate group-hover:text-gray-700">
            {player.nickname || 'Jugador'}
          </h4>
          <div className="mt-2">
            <ProgressBar 
              label={`${player.wins} victorias`}
              value={player.wins}
              maxValue={maxWins}
              color="green"
            />
          </div>
        </div>
        
        <div className="flex items-center text-gray-400 group-hover:text-gray-600 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

function CommanderBadge({ commander, count, type = 'usage' }) {
  const colors = {
    usage: 'bg-blue-50 border-blue-200 text-blue-800',
    wins: 'bg-green-50 border-green-200 text-green-800'
  }

  return (
    <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${colors[type]}`}>
      <span className="font-medium truncate max-w-[150px]" title={commander}>
        {commander}
      </span>
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
        type === 'usage' ? 'bg-blue-600' : 'bg-green-600'
      }`}>
        {count}
      </span>
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="space-y-8">
      {/* KPI Cards Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-8 w-16 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
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

export default function Stats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const [profilesRes, matchesRes, participantsRes, gamesRes] = await Promise.all([
        supabase.from('profiles').select('id, nickname'),
        supabase.from('matches').select('id, winner, played_at, game_id'),
        supabase
          .from('match_participants')
          .select('match_id, user_id, kills, max_damage, first_to_die, deck_commander, commander_name'),
        supabase.from('games').select('id, name'),
      ])

      const anyError = profilesRes.error || matchesRes.error || participantsRes.error || gamesRes.error
      if (anyError) throw anyError

      const profiles = profilesRes.data || []
      const matches = matchesRes.data || []
      const participants = participantsRes.data || []
      const games = gamesRes.data || []

      // Enhanced aggregations
      const winsCount = {}
      const damageCount = {}
      const killsCount = {}
      const firstDieCount = {}
      const playedMatchesByUser = {}
      const totalParticipations = {}

      matches.forEach(({ winner }) => {
        if (!winner) return
        winsCount[winner] = (winsCount[winner] || 0) + 1
      })

      participants.forEach((p) => {
        const uid = p.user_id
        if (!uid) return
        damageCount[uid] = (damageCount[uid] || 0) + (p.max_damage || 0)
        killsCount[uid] = (killsCount[uid] || 0) + (p.kills || 0)
        if (p.first_to_die) firstDieCount[uid] = (firstDieCount[uid] || 0) + 1
        playedMatchesByUser[uid] = [...(playedMatchesByUser[uid] || []), p.match_id]
        totalParticipations[uid] = (totalParticipations[uid] || 0) + 1
      })

      // Calculate streaks
      const playedById = Object.fromEntries(matches.map((m) => [m.id, m]))
      const streakByUser = {}

      profiles.forEach(({ id }) => {
        const playedList = (playedMatchesByUser[id] || [])
          .map((mid) => playedById[mid])
          .filter(Boolean)
          .sort((a, b) => new Date(a.played_at) - new Date(b.played_at))

        let maxStreak = 0
        let currentStreak = 0
        playedList.forEach((m) => {
          if (m.winner === id) {
            currentStreak += 1
            maxStreak = Math.max(maxStreak, currentStreak)
          } else {
            currentStreak = 0
          }
        })
        streakByUser[id] = maxStreak
      })

      const longestStreak = Math.max(0, ...Object.values(streakByUser))
      const playerLongest = profiles.find((p) => streakByUser[p.id] === longestStreak)?.nickname || 'Ninguno'

      // Enhanced top players with more metrics
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

      // Commander analysis with better name handling
      const usageCount = {}
      const winsByCommander = {}

      participants.forEach((p) => {
        const commander = p.commander_name || p.deck_commander
        if (commander) {
          usageCount[commander] = (usageCount[commander] || 0) + 1
        }
      })

      matches.forEach((m) => {
        const winPart = participants.find((p) => p.match_id === m.id && p.user_id === m.winner)
        if (winPart) {
          const commander = winPart.commander_name || winPart.deck_commander
          if (commander) {
            winsByCommander[commander] = (winsByCommander[commander] || 0) + 1
          }
        }
      })

      const topUsage = Object.entries(usageCount)
        .map(([commander, count]) => ({ commander, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)

      const topWinsCmd = Object.entries(winsByCommander)
        .map(([commander, wins]) => ({ commander, wins }))
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 8)

      // Enhanced match analytics
      const totalMatches = matches.length
      const totalParticipantsCount = participants.length
      const activePlayersCount = profiles.filter(p => totalParticipations[p.id] > 0).length
      
      const participantsPerMatch = Object.values(
        participants.reduce((acc, p) => {
          acc[p.match_id] = (acc[p.match_id] || 0) + 1
          return acc
        }, {})
      )
      const avgParticipants = totalMatches > 0 ? 
        (participantsPerMatch.reduce((sum, val) => sum + val, 0) / totalMatches).toFixed(1) : '0'

      // Format popularity
      const gameCount = {}
      matches.forEach((m) => {
        gameCount[m.game_id] = (gameCount[m.game_id] || 0) + 1
      })
      
      const popularGames = Object.entries(gameCount)
        .map(([game_id, count]) => ({
          name: games.find((g) => g.id === game_id)?.name || 'Desconocido',
          count,
          percentage: totalMatches > 0 ? (count / totalMatches * 100).toFixed(1) : '0'
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)

      // Additional insights
      const mostActivePlayer = topPlayers.length > 0 ? 
        topPlayers.reduce((max, p) => p.totalParticipations > max.totalParticipations ? p : max) : null
      
      const bestWinRatePlayer = topPlayers
        .filter(p => p.totalParticipations >= 3)
        .sort((a, b) => b.winRate - a.winRate)[0] || null

      const topKillerPlayer = topPlayers
        .sort((a, b) => b.kills - a.kills)[0] || null

      setStats({
        // KPIs
        totalMatches,
        totalParticipantsCount,
        activePlayersCount,
        avgParticipants,
        longestStreak,
        playerLongest,

        // Players
        topPlayers: topPlayers.slice(0, 10),
        mostActivePlayer,
        bestWinRatePlayer,
        topKillerPlayer,

        // Commanders
        topUsage,
        topWinsCmd,

        // Formats
        popularGames,
      })
    } catch (err) {
      console.error(err)
      setError('Error al cargar las estadísticas del sistema')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  if (loading) {
    return (
      <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <PageHeader 
            title="Análisis y Estadísticas" 
            description="Dashboard ejecutivo con métricas clave y insights del rendimiento" 
          />
          <StatsSkeleton />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <PageHeader title="Análisis y Estadísticas" />
          <div className="bg-white rounded-lg border border-red-200 p-6 shadow-sm">
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
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors duration-200"
              onClick={fetchStats}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reintentar análisis
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (!stats) return null

  return (
    <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="Análisis y Estadísticas"
          description="Dashboard ejecutivo con métricas clave y insights del rendimiento de la plataforma"
        />

        {/* KPI Dashboard */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Partidas Totales"
            value={stats.totalMatches.toLocaleString()}
            subtitle="Registradas en el sistema"
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />

          <StatCard
            title="Jugadores Activos"
            value={stats.activePlayersCount.toLocaleString()}
            subtitle="Con al menos 1 partida"
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-3a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
          />

          <StatCard
            title="Promedio por Partida"
            value={stats.avgParticipants}
            subtitle="Jugadores participantes"
            color="amber"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />

          <StatCard
            title="Racha Récord"
            value={stats.longestStreak}
            subtitle={`por ${stats.playerLongest}`}
            color="purple"
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
            <StatCard
              title="Jugador Más Activo"
              value={stats.mostActivePlayer.nickname}
              subtitle={`${stats.mostActivePlayer.totalParticipations} participaciones`}
              color="blue"
              onClick={() => window.location.href = `/players/${stats.mostActivePlayer.id}`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
          )}

          {stats.bestWinRatePlayer && (
            <StatCard
              title="Mejor Tasa de Victoria"
              value={`${stats.bestWinRatePlayer.winRate.toFixed(1)}%`}
              subtitle={stats.bestWinRatePlayer.nickname}
              color="green"
              onClick={() => window.location.href = `/players/${stats.bestWinRatePlayer.id}`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          )}

          {stats.topKillerPlayer && (
            <StatCard
              title="Mayor Eliminador"
              value={stats.topKillerPlayer.kills}
              subtitle={`${stats.topKillerPlayer.nickname} (total)`}
              color="red"
              onClick={() => window.location.href = `/players/${stats.topKillerPlayer.id}`}
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
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Ranking de Victorias</h3>
                    <p className="text-sm text-gray-600">Top 10 jugadores por victorias totales</p>
                  </div>
                </div>
                <button
                  onClick={fetchStats}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
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
                  />
                ))
              )}
            </div>
          </div>

          {/* Format Analytics */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l3-3 3 3v13M9 19h6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Formatos Populares</h3>
                  <p className="text-sm text-gray-600">Distribución de partidas por formato</p>
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
                    label={game.name}
                    value={game.count}
                    maxValue={stats.popularGames[0]?.count || 1}
                    color={idx === 0 ? 'purple' : idx === 1 ? 'blue' : 'gray'}
                    showPercentage={false}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Commander Analytics */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Comandantes Más Usados</h3>
                  <p className="text-sm text-gray-600">Popularidad por frecuencia de uso</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {stats.topUsage.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-gray-500">No hay datos de comandantes disponibles</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {stats.topUsage.map((commander) => (
                    <CommanderBadge
                      key={commander.commander}
                      commander={commander.commander}
                      count={commander.count}
                      type="usage"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Comandantes Victoriosos</h3>
                  <p className="text-sm text-gray-600">Ranking por victorias conseguidas</p>
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
                  {stats.topWinsCmd.map((commander) => (
                    <CommanderBadge
                      key={commander.commander}
                      commander={commander.commander}
                      count={commander.wins}
                      type="wins"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Acciones Rápidas</h3>
              <p className="text-sm text-gray-600">Navega a las secciones principales de la plataforma</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/ranking"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l3-3 3 3v13M9 19h6" />
                </svg>
                Ver Ranking
              </Link>
              <Link
                href="/matches/new"
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nueva Partida
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}