// pages/ranking/index.js
import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import { supabase } from '../../lib/supabaseClient'
import Card from '../../components/Card'
import SkeletonCard from '../../components/SkeletonCard'

const MIN_MATCHES = 5 // cambia el mínimo aquí

export default function Ranking() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('player_stats_view')
        .select('id, nickname, total_played, total_wins, win_rate')

      if (error) {
        setError(error.message)
        setRows([])
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

      setRows(mapped)
      setLoading(false)
    }
    load()
  }, [])

  const filteredSorted = useMemo(() => {
    return rows
      .filter(x => x.totalPlayed >= MIN_MATCHES)
      .sort((a, b) =>
        // Orden principal: winrate desc
        b.winRate - a.winRate ||
        // Desempate 1: partidas jugadas desc (más sample size)
        b.totalPlayed - a.totalPlayed ||
        // Desempate 2: victorias desc
        b.totalWins - a.totalWins ||
        // Desempate 3: nombre asc
        (a.nickname || '').localeCompare(b.nickname || '')
      )
  }, [rows])

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-6">
      <Head>
        <title>Ranking · Magic Party</title>
      </Head>

      <header className="mb-4">
        <h1 className="title-text mb-1">🏆 Ranking</h1>
        <p className="subtitle-text">
          Top jugadores por winrate (mín. {MIN_MATCHES} partidas)
        </p>
      </header>

      {loading && (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {error && (
        <Card className="p-4 text-red-700 bg-red-50 border-red-200">
          <p>{error}</p>
        </Card>
      )}

      {!loading && !error && filteredSorted.length === 0 && (
        <Card className="p-4 text-sm">
          Aún no hay suficientes partidas para calcular el ranking.
        </Card>
      )}

      {!loading && !error && filteredSorted.length > 0 && (
        <ol className="space-y-3">
          {filteredSorted.map((p, idx) => (
            <li key={p.id}>
              <Card className="p-4 flex items-center gap-4">
                <div className="w-8 text-right tabular-nums">{idx + 1}.</div>

                <div className="w-10 h-10 rounded-full bg-gray-100 grid place-items-center overflow-hidden">
                  <span className="text-sm font-semibold">
                    {(p.nickname || '?').slice(0,1).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.nickname || 'Jugador'}</div>
                  <div className="text-xs text-gray-600">
                    🎮 {p.totalPlayed} · 🏆 {p.totalWins}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-semibold">{p.winRate}%</div>
                  <div className="text-xs text-gray-500">Winrate</div>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </main>
  )
}
