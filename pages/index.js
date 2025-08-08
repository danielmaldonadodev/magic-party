// pages/index.js
import Link from 'next/link'
import { format } from 'date-fns'
import Card from '../components/Card'
import SkeletonCard from '../components/SkeletonCard'
import ImageFallback from '../components/ImageFallback'
import { createSupabaseServerClient } from '../lib/supabaseServer'

/* =======================
   UI Helpers
======================= */
function PageHeader() {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
        Magic Party
      </h1>
      <p className="text-gray-600">
        Registro de partidas y métricas globales de la comunidad.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/matches/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:opacity-90 transition"
        >
          Nueva partida
        </Link>
        <Link
          href="/matches"
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-900 hover:bg-gray-50 transition"
        >
          Ver partidas
        </Link>
        <Link
          href="/stats"
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-900 hover:bg-gray-50 transition"
        >
          Estadísticas
        </Link>
      </div>
    </header>
  )
}

function Section({ title, right, children }) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  )
}

function Kpi({ label, value }) {
  return (
    <Card className="p-5 rounded-xl border border-gray-200/70 bg-white shadow-sm">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-1 text-4xl font-semibold leading-none text-gray-900">{value}</p>
    </Card>
  )
}

/** Mini carta MTG pequeña (ratio ~35/49) sin deformaciones */
function CommanderThumb({ src, alt }) {
  return (
    <div
      className="relative w-16 rounded-[10px] overflow-hidden border border-black/20 bg-neutral-100 shadow"
      style={{ aspectRatio: '35 / 49' }}
    >
      <ImageFallback
        src={src}
        alt={alt}
        fill
        className="absolute inset-0 h-full w-full object-contain"
      />
      <div className="pointer-events-none absolute inset-0 rounded-[10px] ring-1 ring-black/10" />
    </div>
  )
}

/* =======================
   SSR (RPC global + fallback)
======================= */
export async function getServerSideProps({ req, res }) {
  const supabase = createSupabaseServerClient(req, res)

  // Intento 1: RPCs (si existen). No usar .catch() aquí.
  const [mRes, latRes, pomRes, comRes] = await Promise.allSettled([
    supabase.rpc('get_home_metrics').single(),
    supabase.rpc('get_latest_matches', { limit_n: 6 }),
    supabase.rpc('get_player_of_month').single(),
    supabase.rpc('get_commander_of_month').single(),
  ])

  const metricsRow = mRes.status === 'fulfilled' ? mRes.value.data : null
  const latestRows  = latRes.status === 'fulfilled' ? latRes.value.data : null
  const pomRow      = pomRes.status === 'fulfilled' ? pomRes.value.data : null
  const comRow      = comRes.status === 'fulfilled' ? comRes.value.data : null

  let metrics = {
    totalMatches: Number(metricsRow?.total_matches ?? 0),
    totalGames: Number(metricsRow?.total_games ?? 0),
  }

  let latest = (latestRows || []).map(m => ({
    id: m.id,
    played_at: m.played_at,
    game_name: m.game_name || 'Juego',
    winner_image: m.winner_image || null,
  }))

  let playerOfMonth = pomRow
    ? { user_id: pomRow.user_id, name: pomRow.nickname || pomRow.email || '—', wins: Number(pomRow.wins || 0) }
    : null

  let commanderOfMonth = comRow
    ? { image: comRow.commander_image || comRow.commander_image_small || comRow.commander_image_normal || null,
        wins: Number(comRow.wins || 0) }
    : null

  // ---------- Fallback si faltan RPCs o datos ----------
  if (!metricsRow || latest.length === 0 || !playerOfMonth || !commanderOfMonth) {
    // Últimas 6 partidas
    const { data: matches } = await supabase
      .from('matches')
      .select('id, played_at, game_id, winner')
      .order('played_at', { ascending: false })
      .limit(6)

    // Últimos 30 días
    const since = new Date()
    since.setDate(since.getDate() - 30)
    const { data: last30 } = await supabase
      .from('matches')
      .select('id, played_at, game_id, winner')
      .gte('played_at', since.toISOString())

    // Nombres de juego
    const gameIds = Array.from(new Set([
      ...(matches || []).map(m => m.game_id).filter(Boolean),
      ...(last30 || []).map(m => m.game_id).filter(Boolean),
    ]))
    let gameNameById = {}
    if (gameIds.length > 0) {
      const { data: gamesData } = await supabase
        .from('games')
        .select('id, name')
        .in('id', gameIds)
      gameNameById = Object.fromEntries((gamesData || []).map(g => [g.id, g.name]))
    }

    // Imágenes del ganador para latest
    const matchIds = (matches || []).map(m => m.id)
    const winnerByMatchId = Object.fromEntries((matches || []).map(m => [m.id, m.winner]))
    let winnerByMatch = {}
    if (matchIds.length > 0) {
      const { data: parts } = await supabase
        .from('match_participants')
        .select('match_id, user_id, commander_image, commander_image_small, commander_image_normal, commander_art_crop')
        .in('match_id', matchIds)

      for (const p of parts || []) {
        const expectedWinner = winnerByMatchId[p.match_id]
        if (!expectedWinner) continue
        if (p.user_id === expectedWinner && !winnerByMatch[p.match_id]) {
          winnerByMatch[p.match_id] =
            p.commander_image_small ||
            p.commander_image_normal ||
            p.commander_art_crop ||
            p.commander_image ||
            null
        }
      }
    }

    // Totales si no vinieron por RPC
    if (!metricsRow) {
      const { count: totalMatches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
      const { count: totalGames } = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
      metrics = { totalMatches: totalMatches || 0, totalGames: totalGames || 0 }
    }

    // Últimas si faltaban
    if (latest.length === 0) {
      latest = (matches || []).map(m => ({
        id: m.id,
        played_at: m.played_at,
        game_name: gameNameById[m.game_id] || 'Juego',
        winner_image: winnerByMatch[m.id] || null,
      }))
    }

    // Jugador del mes (por wins en 30 días)
    if (!playerOfMonth) {
      const winsByUser = {}
      for (const m of last30 || []) {
        if (!m.winner) continue
        winsByUser[m.winner] = (winsByUser[m.winner] || 0) + 1
      }
      const top = Object.entries(winsByUser).sort((a, b) => b[1] - a[1])[0]
      playerOfMonth = top
        ? { user_id: top[0], name: 'Jugador destacado', wins: Number(top[1]) }
        : { user_id: null, name: '—', wins: 0 }
    }

    // Comandante del mes (imagen más ganadora en 30 días)
    if (!commanderOfMonth) {
      const lastIds = (last30 || []).map(m => m.id)
      let parts30 = []
      if (lastIds.length > 0) {
        const { data: p30 } = await supabase
          .from('match_participants')
          .select('match_id, user_id, commander_image, commander_image_small, commander_image_normal, commander_art_crop')
          .in('match_id', lastIds)
        parts30 = p30 || []
      }

      const winnerById = Object.fromEntries((last30 || []).map(m => [m.id, m.winner]))
      const imgWins = {}
      for (const p of parts30) {
        if (winnerById[p.match_id] && winnerById[p.match_id] === p.user_id) {
          const img =
            p.commander_image_small ||
            p.commander_image_normal ||
            p.commander_art_crop ||
            p.commander_image ||
            null
          if (img) imgWins[img] = (imgWins[img] || 0) + 1
        }
      }
      const best = Object.entries(imgWins).sort((a, b) => b[1] - a[1])[0]
      commanderOfMonth = best
        ? { image: best[0], wins: Number(best[1]) }
        : { image: null, wins: 0 }
    }
  }

  return {
    props: {
      metrics,
      latest,
      playerOfMonth,
      commanderOfMonth,
    }
  }
}

/* =======================
   Page
======================= */
export default function Home({
  metrics = { totalMatches: 0, totalGames: 0 },
  latest = [],
  playerOfMonth = { name: '—', wins: 0 },
  commanderOfMonth = { image: null, wins: 0 },
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">

      {/* Header */}
      <PageHeader />

      {/* KPIs + tarjetas del mes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Total partidas" value={metrics.totalMatches} />
        <Kpi label="Formatos registrados" value={metrics.totalGames} />

        {/* Jugador del mes */}
        <Card className="p-5 rounded-xl border border-gray-200/70 bg-white shadow-sm">
          <p className="text-sm text-gray-600">Jugador del mes (últimos 30 días)</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{playerOfMonth.name}</p>
          <p className="text-sm text-gray-600 mt-1">{playerOfMonth.wins} victoria(s)</p>
          <Link href="/ranking" className="mt-3 inline-block text-sm text-gray-900 hover:underline">
            Ver ranking
          </Link>
        </Card>

        {/* Comandante del mes */}
        <Card className="p-5 rounded-xl border border-gray-200/70 bg-white shadow-sm">
          <p className="text-sm text-gray-600">Comandante del mes</p>
          <div className="mt-2 flex items-center gap-3">
            <CommanderThumb
              src={commanderOfMonth.image || '/placeholder-commander.png'}
              alt="Comandante del mes"
            />
            <div>
              <p className="text-sm text-gray-600">{commanderOfMonth.wins} victoria(s)</p>
              <Link href="/stats" className="mt-1 inline-block text-sm text-gray-900 hover:underline">
                Ver estadísticas
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Últimas partidas */}
      <Section
        title="Últimas partidas"
        right={<Link href="/matches" className="text-sm font-medium text-gray-900 hover:underline">Ver todas</Link>}
      >
        {latest.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {latest.map((m) => {
              const playedAt = m?.played_at ? format(new Date(m.played_at), 'dd/MM/yyyy') : '—'
              return (
                <Card
                  key={m.id}
                  className="p-4 rounded-xl border border-gray-200/70 bg-white shadow-sm hover:shadow transition"
                >
                  <div className="flex items-center gap-4">
                    <CommanderThumb
                      src={m.winner_image || '/placeholder-commander.png'}
                      alt={m.game_name}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium leading-tight text-gray-900 truncate">
                        {m.game_name}
                      </h3>
                      <p className="text-sm text-gray-600">{playedAt}</p>
                      <Link
                        href={`/matches/${m.id}`}
                        className="mt-2 inline-block rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 hover:bg-gray-50 transition"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </Section>
    </div>
  )
}
