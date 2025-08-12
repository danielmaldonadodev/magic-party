// pages/ranking/index.js
import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'

const MIN_MATCHES = 5

/* ===============================================================
   THEME (mismo set que Home/Stats) + sticky por localStorage
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

function useStickyTheme() {
  const [themeKey, setThemeKey] = useState(DEFAULT_THEME_KEY)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mp_professional_theme')
      if (saved && MTG_PROFESSIONAL_THEMES.some(t => t.key === saved)) setThemeKey(saved)
    } catch {}
  }, [])
  const theme = useMemo(
    () => MTG_PROFESSIONAL_THEMES.find(t => t.key === themeKey) || MTG_PROFESSIONAL_THEMES[0],
    [themeKey]
  )
  useEffect(() => { document.documentElement.setAttribute('data-mtg-theme', theme.key) }, [theme.key])
  return theme
}

/* ===============================================================
   CSS premium + motion-safe
   =============================================================== */
const professionalCSS = `
@keyframes professionalFadeIn {
  from { opacity: 0; transform: translateY(14px) scale(.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.crystal-card { position:relative; overflow:hidden; }
.crystal-card::before {
  content:''; position:absolute; inset:0; left:-120%; width:120%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent);
  transition: transform .6s ease; transform: translateX(0);
}
.crystal-card:hover::before { transform: translateX(220%); }
.animate-professional-fade-in { animation: professionalFadeIn .6s cubic-bezier(.25,.46,.45,.94) both; }
.theme-transition { transition: all .5s cubic-bezier(.25,.46,.45,.94); }
.badge-soft { background: rgba(255,255,255,.85); border:1px solid rgba(0,0,0,.06); }
@media (prefers-reduced-motion: reduce) {
  .animate-professional-fade-in { animation: none !important; }
  .theme-transition { transition: none !important; }
}
`
if (typeof document !== 'undefined' && !document.getElementById('professional-ranking-styles')) {
  const st = document.createElement('style')
  st.id = 'professional-ranking-styles'
  st.textContent = professionalCSS
  document.head.appendChild(st)
}

/* ===============================================================
   Skeleton (coherente con glass/tema)
   =============================================================== */
function RankingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="bg-white/90 backdrop-blur-sm border border-white/60 shadow animate-pulse" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded" />
          </div>
        </Card>
      ))}
    </div>
  )
}

/* ===============================================================
   Card de ranking: móvil primero (compacta), desktop enriquecida
   =============================================================== */
function RankingCard({ player, position, theme, isTopThree }) {
  const getPositionSkin = (pos) => {
    if (pos === 1) return { badge:'bg-yellow-500 text-white', halo:'bg-yellow-100', border: theme.border }
    if (pos === 2) return { badge:'bg-gray-500 text-white', halo:'bg-gray-100', border: theme.border }
    if (pos === 3) return { badge:'bg-orange-600 text-white', halo:'bg-orange-100', border: theme.border }
    return { badge:'bg-gray-200 text-gray-800', halo:'bg-gray-50', border:'border-white/60' }
  }
  const skin = getPositionSkin(position)

  const winrate = typeof player.winRate === 'number' ? player.winRate : 0
  const winrateColor =
    winrate >= 70 ? 'text-green-700' : winrate >= 50 ? 'text-blue-700' : 'text-gray-700'

  return (
    <Link href={`/players/${player.id}`} className="block">
      <div className="crystal-card animate-professional-fade-in">
        <Card className="bg-white/90 backdrop-blur-sm border shadow hover:shadow-md theme-transition" padding="md">
          {/* GRID móvil: 2 filas; md+: 1 fila */}
          <div className="grid grid-cols-[auto,1fr,auto] gap-3 items-center md:gap-4">
            {/* Posición + avatar (compacto en móvil) */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`w-8 h-8 rounded-full grid place-items-center text-sm font-bold shadow ${skin.badge}`}>
                {position}
              </div>
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${skin.halo} border border-white/60 grid place-items-center text-gray-700 font-bold`}>
                {(player.nickname || '?').slice(0,1).toUpperCase()}
              </div>
            </div>

            {/* Nombre + chips */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold truncate ${theme.text.strong}`}>
                  {player.nickname || 'Jugador'}
                </h3>
                {position <= 3 && (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                    Top {position}
                  </span>
                )}
              </div>

              {/* Métricas secundarias (móvil en línea, md en línea también pero separadas) */}
              <div className={`mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs ${theme.text.soft}`}>
                <span className="inline-flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l3-3 3 3v13M9 19h6" />
                  </svg>
                  {player.totalPlayed} partidas
                </span>
                <span className="inline-flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {player.totalWins} victorias
                </span>
              </div>
            </div>

            {/* Winrate: grande y alineado a la derecha (en móvil también) */}
            <div className="text-right">
              <div className={`text-lg md:text-2xl font-extrabold ${winrateColor}`}>
                {winrate.toFixed(1)}%
              </div>
              <div className="text-[11px] text-gray-500 font-medium leading-tight">Win rate</div>
            </div>
          </div>
        </Card>
      </div>
    </Link>
  )
}

/* ===============================================================
   Página
   =============================================================== */
export default function Ranking() {
  const theme = useStickyTheme()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null)
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
      .filter(x => (x.totalPlayed ?? 0) >= MIN_MATCHES)
      .sort((a, b) =>
        (b.winRate ?? 0) - (a.winRate ?? 0) ||
        (b.totalPlayed ?? 0) - (a.totalPlayed ?? 0) ||
        (b.totalWins ?? 0) - (a.totalWins ?? 0) ||
        (a.nickname || '').localeCompare(b.nickname || '')
      )
  }, [rows])

  const eligiblePlayers = rows.filter(x => (x.totalPlayed ?? 0) >= MIN_MATCHES).length
  const totalPlayers = rows.length

  const PageWrap = ({ children }) => (
    <section
      className="min-h-screen theme-transition"
      style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})` }}
    >
      {/* halos sutiles */}
      <div className="fixed top-0 left-0 w-72 h-72 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-72 h-72 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 space-y-6">
        {children}
      </div>
    </section>
  )

  return (
    <>
      <Head>
        <title>Ranking de Jugadores · Magic Party</title>
        <meta
          name="description"
          content={`Descubre los mejores jugadores de Magic Party. Rankings basados en tasa de victoria con un mínimo de ${MIN_MATCHES} partidas jugadas.`}
        />
      </Head>

      <PageWrap>
        {/* Header + chip de tema */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <PageHeader
              title="Ranking de Jugadores"
              description={`Clasificación oficial basada en tasa de victoria (mínimo ${MIN_MATCHES} partidas)`}
            />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-soft">
              <span className="text-lg">{theme.icon}</span>
              <span className={`text-sm font-semibold ${theme.text.strong}`}>{theme.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
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

        {/* KPIs compactos (mobile-friendly) */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="bg-white/90 backdrop-blur-sm border border-white/60 shadow" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 grid place-items-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-3a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <div className={`text-2xl font-extrabold ${theme.text.strong}`}>{totalPlayers}</div>
                <div className={`${theme.text.soft} text-sm`}>Jugadores totales</div>
              </div>
            </div>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border border-white/60 shadow" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 grid place-items-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className={`text-2xl font-extrabold ${theme.text.strong}`}>{eligiblePlayers}</div>
                <div className={`${theme.text.soft} text-sm`}>En el ranking</div>
              </div>
            </div>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border border-white/60 shadow" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 grid place-items-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className={`text-2xl font-extrabold ${theme.text.strong}`}>{MIN_MATCHES}</div>
                <div className={`${theme.text.soft} text-sm`}>Partidas mínimas</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Loading / Error / Empty */}
        {loading && <RankingSkeleton />}

        {error && (
          <Card className="bg-white/90 backdrop-blur-sm border border-red-200 shadow">
            <div className="flex items-center gap-3 text-red-800">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold">Error al cargar el ranking</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {!loading && !error && filteredSorted.length === 0 && (
          <Card className="bg-white/90 backdrop-blur-sm border border-white/60 shadow text-center" padding="xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l3-3 3 3v13M9 19h6" />
              </svg>
            </div>
            <h3 className={`text-lg font-bold ${theme.text.strong} mb-2`}>Ranking no disponible</h3>
            <p className={`${theme.text.soft} max-w-md mx-auto mb-6`}>
              Aún no hay suficientes jugadores con {MIN_MATCHES} o más partidas para generar el ranking oficial.
            </p>
            <Link
              href="/matches/new"
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white shadow ${theme.gradient} hover:shadow-md theme-transition focus:outline-none focus:ring-4 focus:ring-offset-2 ${theme.colors.ring}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Crear partida
            </Link>
          </Card>
        )}

        {/* Lista */}
        {!loading && !error && filteredSorted.length > 0 && (
          <div className="space-y-3">
            {filteredSorted.map((player, idx) => (
              <RankingCard
                key={player.id}
                player={player}
                position={idx + 1}
                isTopThree={idx < 3}
                theme={theme}
              />
            ))}
          </div>
        )}

        {/* Metodología */}
        {!loading && !error && filteredSorted.length > 0 && (
          <Card className="bg-white/90 backdrop-blur-sm border border-white/60 shadow">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 grid place-items-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className={`font-bold ${theme.text.strong} mb-2`}>Metodología del Ranking</h4>
                <div className={`text-sm ${theme.text.soft} space-y-1`}>
                  <p>• <strong>Criterio principal:</strong> Tasa de victoria (% de partidas ganadas)</p>
                  <p>• <strong>Requisito mínimo:</strong> {MIN_MATCHES} partidas jugadas para aparecer en el ranking</p>
                  <p>• <strong>Desempates:</strong> Más partidas jugadas → más victorias → nombre</p>
                  <p>• <strong>Actualización:</strong> Automática tras cada partida</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Footer tema actual */}
        <footer className="pt-6 text-center">
          <div className="inline-flex items-center gap-2">
            <span className={`text-sm ${theme.text.soft}`}>Tema actual:</span>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full shadow bg-gradient-to-r ${theme.colors.primary}`} />
              <span className={`text-sm font-bold ${theme.text.strong}`}>{theme.label}</span>
            </div>
          </div>
        </footer>
      </PageWrap>
    </>
  )
}
