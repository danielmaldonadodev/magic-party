// pages/stats/index.js
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'

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
          .select('match_id, user_id, kills, max_damage, first_to_die, deck_commander'),
        supabase.from('games').select('id, name'),
      ])

      const anyError = profilesRes.error || matchesRes.error || participantsRes.error || gamesRes.error
      if (anyError) throw anyError

      const profiles = profilesRes.data || []
      const matches = matchesRes.data || []
      const participants = participantsRes.data || []
      const games = gamesRes.data || []

      // Aggregations
      const winsCount = {}
      const damageCount = {}
      const killsCount = {}
      const firstDieCount = {}
      const playedMatchesByUser = {}

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
      })

      // Streaks
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
      const playerLongest =
        profiles.find((p) => streakByUser[p.id] === longestStreak)?.nickname || 'Nadie'

      // Top players
      const topPlayers = profiles
        .map((p) => ({
          id: p.id,
          nickname: p.nickname,
          wins: winsCount[p.id] || 0,
          totalDamage: damageCount[p.id] || 0,
          kills: killsCount[p.id] || 0,
          firstToDie: firstDieCount[p.id] || 0,
          maxStreak: streakByUser[p.id] || 0,
        }))
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 10)

      // Commanders
      const usageCount = {}
      const winsByCommander = {}

      participants.forEach((p) => {
        if (p.deck_commander) usageCount[p.deck_commander] = (usageCount[p.deck_commander] || 0) + 1
      })
      matches.forEach((m) => {
        const winPart = participants.find((p) => p.match_id === m.id && p.user_id === m.winner)
        if (winPart?.deck_commander) {
          winsByCommander[winPart.deck_commander] = (winsByCommander[winPart.deck_commander] || 0) + 1
        }
      })
      const topUsage = Object.entries(usageCount)
        .map(([commander, count]) => ({ commander, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
      const topWinsCmd = Object.entries(winsByCommander)
        .map(([commander, wins]) => ({ commander, wins }))
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 5)

      // Match meta
      const totalMatches = matches.length
      const participantsCount = Object.values(
        participants.reduce((acc, p) => {
          acc[p.match_id] = (acc[p.match_id] || 0) + 1
          return acc
        }, {})
      )
      const avgParticipants = (
        participantsCount.reduce((sum, val) => sum + val, 0) /
        (participantsCount.length || 1)
      ).toFixed(1)

      // Games/formats
      const gameCount = {}
      matches.forEach((m) => {
        gameCount[m.game_id] = (gameCount[m.game_id] || 0) + 1
      })
      const popularGames = Object.entries(gameCount)
        .map(([game_id, count]) => ({
          name: games.find((g) => g.id === game_id)?.name || 'Desconocido',
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      const formatCount = {}
      matches.forEach((m) => {
        const fmt = games.find((g) => g.id === m.game_id)?.name || 'Desconocido'
        formatCount[fmt] = (formatCount[fmt] || 0) + 1
      })
      const topFormats = Object.entries(formatCount)
        .map(([format, count]) => ({ format, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setStats({
        longestStreak,
        playerLongest,
        topPlayers,
        topUsage,
        topWinsCmd,
        totalMatches,
        avgParticipants,
        popularGames,
        topFormats,
      })
    } catch (err) {
      console.error(err)
      setError('Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  /* ───────────── Skeleton / Error ───────────── */
  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <PageHeader title="Estadísticas globales" description="Resumen de jugadores, comandantes y partidas." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
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
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <PageHeader title="Estadísticas globales" />
        <Card className="p-4">
          <p className="mb-4 text-red-700">{error}</p>
          <button className="btn" onClick={fetchStats}>Reintentar</button>
        </Card>
      </main>
    )
  }

  if (!stats) return null

  /* ───────────── UI ───────────── */
  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <PageHeader
        title="Estadísticas globales"
        description="Resumen de jugadores, comandantes y partidas."
      />

      {/* Métrica destacada */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-base font-semibold mb-1">🥇 Racha más larga de victorias</h2>
          <p className="text-sm text-gray-700">
            <span className="font-medium">{stats.playerLongest}</span> —{' '}
            <span className="text-gray-900 font-bold">{stats.longestStreak}</span> victorias consecutivas
          </p>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <span className="font-semibold">Total partidas</span>
          <span className="text-2xl font-bold">{stats.totalMatches}</span>
        </Card>
      </section>

      {/* Top jugadores */}
      <section>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 sm:px-5 border-b">
            <h2 className="text-base font-semibold">🏅 Top 10 jugadores por victorias</h2>
            <button className="btn" onClick={fetchStats}>Refrescar</button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="text-left text-gray-600">
                  <th className="py-2 pl-4 pr-3 sm:pl-5">Pos</th>
                  <th className="py-2 pr-3">Jugador</th>
                  <th className="py-2 pr-3">Victorias</th>
                  <th className="py-2 pr-3">Daño total</th>
                  <th className="py-2 pr-3">Kills</th>
                  <th className="py-2 pr-4">Racha máx.</th>
                </tr>
              </thead>
              <tbody>
                {stats.topPlayers.map((p, idx) => (
                  <tr key={p.id} className="border-t">
                    <td className="py-2 pl-4 pr-3 sm:pl-5">{idx + 1}</td>
                    <td className="py-2 pr-3">
                      <Link href={`/players/${p.id}`} className="text-primary hover:underline">
                        {p.nickname || 'Jugador'}
                      </Link>
                    </td>
                    <td className="py-2 pr-3">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">
                        {p.wins}
                      </span>
                    </td>
                    <td className="py-2 pr-3">{p.totalDamage}</td>
                    <td className="py-2 pr-3">{p.kills}</td>
                    <td className="py-2 pr-4">{p.maxStreak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Comandantes */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-base font-semibold mb-2">🧙 Comandantes más usados</h2>
          {stats.topUsage.length === 0 ? (
            <p className="text-sm text-gray-600">Sin datos.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {stats.topUsage.map((c) => (
                <li key={c.commander}>
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs">
                    {c.commander}
                    <span className="ml-2 rounded-full bg-gray-900/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {c.count}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold mb-2">🏆 Comandantes con más victorias</h2>
          {stats.topWinsCmd.length === 0 ? (
            <p className="text-sm text-gray-600">Sin datos.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {stats.topWinsCmd.map((c) => (
                <li key={c.commander}>
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs">
                    {c.commander}
                    <span className="ml-2 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {c.wins}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {/* Datos de partidas */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-base font-semibold">🎲 Participantes medios por partida</h2>
          <p className="mt-1 text-2xl font-bold">{stats.avgParticipants}</p>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold mb-2">🎮 Juegos y formatos populares</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Juegos</p>
              {stats.popularGames.length === 0 ? (
                <p className="text-sm text-gray-600">Sin datos.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {stats.popularGames.map((g) => (
                    <li key={g.name} className="flex items-center justify-between">
                      <span className="truncate">{g.name}</span>
                      <span className="ml-3 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{g.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Formatos</p>
              {stats.topFormats.length === 0 ? (
                <p className="text-sm text-gray-600">Sin datos.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {stats.topFormats.map((f) => (
                    <li key={f.format} className="flex items-center justify-between">
                      <span className="truncate">{f.format}</span>
                      <span className="ml-3 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{f.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
      </section>
    </main>
  )
}
