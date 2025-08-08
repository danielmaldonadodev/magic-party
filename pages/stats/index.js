import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'

/**
 * Página de estadísticas globales (ruta: /stats)
 * - Contenedor de métricas dentro de .card
 * - Títulos con title-text / subtitle-text
 * - Botones .btn
 * - Skeleton de carga
 */
export default function Stats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      // 1) Carga de datos base
      const [profilesRes, matchesRes, participantsRes, gamesRes] = await Promise.all([
        supabase.from('profiles').select('id, nickname'),
        supabase.from('matches').select('id, winner, played_at, game_id'),
        supabase
          .from('match_participants')
          .select('match_id, user_id, kills, max_damage, first_to_die, deck_commander'),
        supabase.from('games').select('id, name'),
      ])

      // Manejo de errores individuales
      const anyError = profilesRes.error || matchesRes.error || participantsRes.error || gamesRes.error
      if (anyError) throw anyError

      const profiles = profilesRes.data || []
      const matches = matchesRes.data || []
      const participants = participantsRes.data || []
      const games = gamesRes.data || []

      // 2) Acumulados por usuario
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

      // 3) Racha máxima por usuario
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

      // 4) Top jugadores por victorias
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

      // 5) Comandantes (uso y victorias)
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

      // 6) Datos de partidas
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

      // 7) Juegos / formatos populares
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

  useEffect(() => {
    fetchStats()
  }, [])

  // SKELETON
  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <h1 className="title-text mb-2">📊 Estadísticas Globales</h1>
        <p className="subtitle-text mb-6">Resumen de jugadores, comandantes y partidas.</p>

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
        <h1 className="title-text mb-2">📊 Estadísticas Globales</h1>
        <div className="card p-4">
          <p className="mb-4 text-red-700">{error}</p>
          <button className="btn" onClick={fetchStats}>Reintentar</button>
        </div>
      </main>
    )
  }

  if (!stats) return null

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="title-text mb-1">📊 Estadísticas Globales</h1>
        <p className="subtitle-text">Resumen de jugadores, comandantes y partidas.</p>
      </header>

      {/* Métrica destacada */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold mb-2">🥇 Racha más larga de victorias</h2>
          <p>
            {stats.playerLongest} – <strong>{stats.longestStreak}</strong> victorias consecutivas
          </p>
        </div>
        <div className="card p-5 flex gap-3 items-center justify-between">
          <span className="font-semibold">Total partidas</span>
          <span className="text-2xl font-bold">{stats.totalMatches}</span>
        </div>
      </section>

      {/* Top jugadores */}
      <section className="mt-6 card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">🏅 Top 10 jugadores por victorias</h2>
          <button className="btn" onClick={fetchStats}>Refrescar</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-3">Pos</th>
                <th className="py-2 pr-3">Jugador</th>
                <th className="py-2 pr-3">V</th>
                <th className="py-2 pr-3">Daño</th>
                <th className="py-2 pr-3">Kills</th>
                <th className="py-2 pr-3">Racha</th>
              </tr>
            </thead>
            <tbody>
              {stats.topPlayers.map((p, idx) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2 pr-3">{idx + 1}</td>
                  <td className="py-2 pr-3">
                    <Link href={`/players/${p.id}`} className="underline">
                      {p.nickname}
                    </Link>
                  </td>
                  <td className="py-2 pr-3">{p.wins}</td>
                  <td className="py-2 pr-3">{p.totalDamage}</td>
                  <td className="py-2 pr-3">{p.kills}</td>
                  <td className="py-2 pr-3">{p.maxStreak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Comandantes */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-semibold mb-2">🧙 Comandantes más usados</h2>
          <ul className="list-disc pl-5 text-sm">
            {stats.topUsage.map((c) => (
              <li key={c.commander}>
                {c.commander} – {c.count} partidas
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold mb-2">🏆 Comandantes con más victorias</h2>
          <ul className="list-disc pl-5 text-sm">
            {stats.topWinsCmd.map((c) => (
              <li key={c.commander}>
                {c.commander} – {c.wins} victorias
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Datos de partidas */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-semibold">🎲 Participantes medios por partida</h2>
          <p className="text-2xl font-bold">{stats.avgParticipants}</p>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold mb-2">🎮 Juegos populares</h2>
          <ul className="list-disc pl-5 text-sm">
            {stats.popularGames.map((g) => (
              <li key={g.name}>
                {g.name} – {g.count} partidas
              </li>
            ))}
          </ul>
          <h3 className="font-semibold mt-3">🎴 Formatos más jugados</h3>
          <ul className="list-disc pl-5 text-sm">
            {stats.topFormats.map((f) => (
              <li key={f.format}>
                {f.format} – {f.count} partidas
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
