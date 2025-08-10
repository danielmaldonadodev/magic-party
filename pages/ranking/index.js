// pages/ranking/index.js
import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import PageHeader from '../../components/PageHeader'

const MIN_MATCHES = 5

function RankingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-8 h-6 bg-gray-200 rounded" />
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-100 rounded" />
            </div>
            <div className="text-right space-y-2">
              <div className="h-6 w-16 bg-gray-200 rounded" />
              <div className="h-3 w-12 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function RankingCard({ player, position, isTopThree }) {
  const getPositionTheme = (pos) => {
    switch (pos) {
      case 1:
        return {
          bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
          border: 'border-yellow-200',
          badge: 'bg-yellow-500 text-white',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )
        }
      case 2:
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-slate-50',
          border: 'border-gray-300',
          badge: 'bg-gray-500 text-white',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        }
      case 3:
        return {
          bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
          border: 'border-orange-200',
          badge: 'bg-orange-600 text-white',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
          )
        }
      default:
        return {
          bg: 'bg-white',
          border: 'border-gray-200',
          badge: 'bg-gray-100 text-gray-700',
          icon: null
        }
    }
  }

  const theme = getPositionTheme(position)
  const winrateColor = player.winRate >= 70 ? 'text-green-700' : player.winRate >= 50 ? 'text-blue-700' : 'text-gray-700'

  return (
    <Link href={`/players/${player.id}`}>
      <div className={`group relative rounded-lg border ${theme.border} ${theme.bg} p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01] cursor-pointer`}>
        <div className="flex items-center gap-4">
          {/* Position */}
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${theme.badge} font-bold text-sm shadow-sm`}>
              {position}
            </div>
            {theme.icon && (
              <div className={`${theme.badge.includes('yellow') ? 'text-yellow-600' : theme.badge.includes('gray') ? 'text-gray-600' : 'text-orange-600'}`}>
                {theme.icon}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-200 grid place-items-center overflow-hidden shadow-sm">
              <span className="text-lg font-semibold text-gray-700">
                {(player.nickname || '?').slice(0, 1).toUpperCase()}
              </span>
            </div>
            {isTopThree && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {player.nickname || 'Jugador'}
              </h3>
              {position <= 3 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Top {position}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l3-3 3 3v13M9 19h6" />
                </svg>
                <span>{player.totalPlayed} partidas</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{player.totalWins} victorias</span>
              </div>
            </div>
          </div>

          {/* Win Rate */}
          <div className="text-right">
            <div className={`text-2xl font-bold ${winrateColor} mb-1`}>
              {player.winRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Tasa de Victoria
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

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

  const eligiblePlayers = rows.filter(x => x.totalPlayed >= MIN_MATCHES).length
  const totalPlayers = rows.length

  return (
    <>
      <Head>
        <title>Ranking de Jugadores · Magic Party</title>
        <meta name="description" content={`Descubre los mejores jugadores de Magic Party. Rankings basados en tasa de victoria con un mínimo de ${MIN_MATCHES} partidas jugadas.`} />
      </Head>

      <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="Ranking de Jugadores"
            description={`Clasificación oficial basada en tasa de victoria (mínimo ${MIN_MATCHES} partidas)`}
          />

          {/* Stats Header */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-3a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalPlayers}</div>
                  <div className="text-sm text-gray-600">Jugadores totales</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{eligiblePlayers}</div>
                  <div className="text-sm text-gray-600">En el ranking</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{MIN_MATCHES}</div>
                  <div className="text-sm text-gray-600">Partidas mínimas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && <RankingSkeleton />}

          {/* Error State */}
          {error && (
            <div className="bg-white rounded-lg border border-red-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 text-red-800">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold">Error al cargar el ranking</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredSorted.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l3-3 3 3v13M9 19h6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ranking no disponible</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Aún no hay suficientes jugadores con {MIN_MATCHES} o más partidas para generar el ranking oficial.
              </p>
              <Link 
                href="/matches/new"
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear partida
              </Link>
            </div>
          )}

          {/* Ranking List */}
          {!loading && !error && filteredSorted.length > 0 && (
            <div className="space-y-4">
              {filteredSorted.map((player, idx) => (
                <RankingCard
                  key={player.id}
                  player={player}
                  position={idx + 1}
                  isTopThree={idx < 3}
                />
              ))}
            </div>
          )}

          {/* Footer Info */}
          {!loading && !error && filteredSorted.length > 0 && (
            <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Metodología del Ranking</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• <strong>Criterio principal:</strong> Tasa de victoria (% de partidas ganadas)</p>
                    <p>• <strong>Requisito mínimo:</strong> {MIN_MATCHES} partidas jugadas para aparecer en el ranking</p>
                    <p>• <strong>Criterios de desempate:</strong> Mayor cantidad de partidas jugadas, luego victorias totales</p>
                    <p>• <strong>Actualización:</strong> El ranking se actualiza automáticamente después de cada partida</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}