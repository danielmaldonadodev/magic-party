// pages/players/[id].js
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'

/* ────────────────────────────────────────────── */
/* Helpers visuales                               */
/* ────────────────────────────────────────────── */
function StatTile({ label, value, hint }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-600">{hint}</p>}
    </Card>
  )
}

function Skeleton() {
  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="animate-pulse">
        <div className="h-8 w-64 rounded bg-gray-200" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded bg-gray-200" />
          ))}
        </div>
        <div className="mt-6 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded bg-gray-200" />
          ))}
        </div>
      </div>
    </main>
  )
}

function CommanderCard({ cmd }) {
  return (
    <Card className="overflow-hidden p-0" interactive>
      <div className="aspect-[2/3] w-full bg-gray-100">
        {cmd.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cmd.image} alt={cmd.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-gray-500">Sin imagen</div>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-medium">{cmd.name}</p>
        <p className="mt-1 text-xs text-gray-600">{cmd.count} vez{cmd.count !== 1 ? 'es' : ''}</p>
      </div>
    </Card>
  )
}

function SegmentedTabs({ current, onChange, canEdit }) {
  return (
    <div className="mb-4 grid w-full max-w-sm grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onChange('stats')}
        className={[
          'rounded-md px-3 py-2 text-sm ring-1 transition',
          current === 'stats' ? 'bg-gray-900 text-white ring-black/10' : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50',
        ].join(' ')}
      >
        Estadísticas
      </button>
      <button
        type="button"
        disabled={!canEdit}
        onClick={() => canEdit && onChange('edit')}
        className={[
          'rounded-md px-3 py-2 text-sm ring-1 transition',
          current === 'edit'
            ? 'bg-gray-900 text-white ring-black/10'
            : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50',
          !canEdit && 'opacity-50 cursor-not-allowed',
        ].join(' ')}
      >
        Editar
      </button>
    </div>
  )
}

/* ────────────────────────────────────────────── */
/* Página                                         */
/* ────────────────────────────────────────────── */
export default function PlayerProfile() {
  const router = useRouter()
  const { id, tab } = router.query

  // id real a usar (si el slug es "me", resolvemos con la sesión)
  const [resolvedId, setResolvedId] = useState(null)

  // sesión y perfil
  const [session, setSession] = useState(null)
  const [nickname, setNickname] = useState('')

  // stats agregadas
  const [stats, setStats] = useState(null)

  // ui
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /* ---------- 1) resolver sesión e ID ---------- */
  useEffect(() => {
    let mounted = true
    if (!id) return

    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(session || null)

      if (id === 'me') {
        // si es /players/me y hay sesión, usamos ese id
        if (session?.user?.id) {
          setResolvedId(session.user.id)
        } else {
          setResolvedId(null) // sin sesión → CTA login
        }
      } else {
        setResolvedId(id)
      }
    }

    run()
    return () => { mounted = false }
  }, [id])

  const isOwner = useMemo(() => {
    return Boolean(session?.user?.id && resolvedId && session.user.id === resolvedId)
  }, [session, resolvedId])

  /* ---------- 2) cargar datos del perfil + stats ---------- */
  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      if (resolvedId === null) { // caso /me sin sesión
        setLoading(false)
        return
      }
      if (!resolvedId) return

      setLoading(true)
      setError(null)
      try {
        // 2.1 Perfil
        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', resolvedId)
          .single()
        if (pErr) throw pErr
        if (!mounted) return
        setNickname(profile?.nickname || 'Jugador')

        // 2.2 Participaciones del jugador
        const { data: matchesPlayed, error: mpErr } = await supabase
          .from('match_participants')
          .select('match_id, kills, max_damage, first_to_die, deck_commander, commander_image_small, commander_image_normal')
          .eq('user_id', resolvedId)
        if (mpErr) throw mpErr

        // 2.3 Partidas ganadas por el jugador
        const { data: matchesWon, error: mwErr } = await supabase
          .from('matches')
          .select('id, played_at')
          .eq('winner', resolvedId)
        if (mwErr) throw mwErr

        // 2.4 Detalle de partidas jugadas (para racha)
        const matchIds = Array.from(new Set((matchesPlayed || []).map((m) => m.match_id)))
        let playedMatchesDetailed = []
        if (matchIds.length) {
          const { data: mDetail, error: mdErr } = await supabase
            .from('matches')
            .select('id, played_at, winner')
            .in('id', matchIds)
          if (mdErr) throw mdErr
          playedMatchesDetailed = mDetail || []
        }

        // 2.5 Cálculos
        const kills = (matchesPlayed || []).reduce((sum, m) => sum + (m.kills || 0), 0)
        const firstToDie = (matchesPlayed || []).filter((m) => m.first_to_die).length
        const avgMaxDamage = (
          (matchesPlayed || []).reduce((sum, m) => sum + (m.max_damage || 0), 0) /
          ((matchesPlayed || []).length || 1)
        ).toFixed(1)

        const playedSorted = [...playedMatchesDetailed].sort(
          (a, b) => new Date(a.played_at) - new Date(b.played_at)
        )
        let streak = 0
        let maxStreak = 0
        for (const m of playedSorted) {
          if (m.winner === resolvedId) {
            streak += 1
            if (streak > maxStreak) maxStreak = streak
          } else {
            streak = 0
          }
        }

        const commanderCount = {}
        const commanderFirstImage = {}
        ;(matchesPlayed || []).forEach((m) => {
          const name = m.deck_commander
          if (!name) return
          commanderCount[name] = (commanderCount[name] || 0) + 1
          if (!commanderFirstImage[name]) {
            commanderFirstImage[name] = m.commander_image_small || m.commander_image_normal || ''
          }
        })
        const topCommanders = Object.entries(commanderCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, count]) => ({ name, count, image: commanderFirstImage[name] || '' }))

        if (!mounted) return
        setStats({
          totalGames: matchesPlayed?.length || 0,
          totalWins: matchesWon?.length || 0,
          maxStreak,
          kills,
          firstToDie,
          avgMaxDamage,
          topCommanders,
        })
      } catch (err) {
        console.error(err)
        if (!mounted) return
        setError('Error al cargar perfil')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()
    return () => { mounted = false }
  }, [resolvedId])

  /* ---------- 3) UI estados ---------- */
  if (loading) return <Skeleton />

  // /players/me sin sesión → CTA login
  if (id === 'me' && !session?.user?.id) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <PageHeader title="Tu perfil" description="Inicia sesión para ver y editar tu perfil." />
        <Card className="p-6">
          <Link href="/login" className="btn-primary">Iniciar sesión</Link>
        </Card>
      </main>
    )
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <PageHeader title="Perfil" />
        <Card tone="soft" className="p-4">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
          <div className="mt-4 flex gap-3">
            <button className="btn" onClick={() => router.reload()}>Reintentar</button>
            <Link href="/players" className="btn btn-outline">Volver</Link>
          </div>
        </Card>
      </main>
    )
  }

  if (!stats) return null

  /* ---------- 4) UI perfil ---------- */
  const currentTab = (tab === 'edit' && isOwner) ? 'edit' : 'stats'
  const winrate = stats.totalGames ? ((stats.totalWins / stats.totalGames) * 100) : 0
  const winBar =
    winrate >= 70 ? 'from-emerald-400 to-emerald-500' :
    winrate >= 50 ? 'from-amber-400 to-amber-500' :
                    'from-rose-400 to-rose-500'

  const goTab = (t) => router.replace({ query: { id, tab: t } }, undefined, { shallow: true })

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      {/* HERO header */}
      <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-primary/5 via-white to-white shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />
        <div className="flex items-center gap-5 p-5 sm:p-6">
          <div className="relative">
            <div className="absolute inset-0 -m-[2px] rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-[8px]" />
            <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-2xl font-bold text-primary ring-2 ring-primary/20">
              {(nickname || '?').slice(0, 1).toUpperCase()}
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-gray-900">{nickname}</h1>
            <p className="text-sm text-gray-600">
              {isOwner ? 'Este es tu perfil. Puedes editar tus datos.' : 'Perfil público del jugador.'}
            </p>

            {/* winrate bar en header */}
            <div className="mt-3 max-w-md">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Winrate</span>
                <span className="font-medium text-gray-800">{winrate.toFixed(1)}%</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200/70">
                <div className={`h-full bg-gradient-to-r ${winBar}`} style={{ width: `${Math.min(100, Math.max(0, winrate))}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <SegmentedTabs current={currentTab} onChange={goTab} canEdit={isOwner} />

      {currentTab === 'edit' ? (
        <EditProfileForm
          initialNickname={nickname}
          onSaved={(newNick) => setNickname(newNick)}
        />
      ) : (
        <>
          {/* Métricas principales */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Partidas jugadas" value={stats.totalGames} />
            <StatTile label="Victorias" value={stats.totalWins} />
            <StatTile label="Racha máx." value={stats.maxStreak} />
            <StatTile label="Daño máx. promedio" value={stats.avgMaxDamage} hint="Promedio de tu pico de daño en partidas" />
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <StatTile label="Kills totales" value={stats.kills} />
            <StatTile label="Veces que murió primero" value={stats.firstToDie} />
          </section>

          {/* Comandantes más usados */}
          <section>
            <Card className="p-4 sm:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold">Comandantes más usados</h2>
                  <p className="text-sm text-gray-600">Tus comandantes con más apariciones</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn" onClick={() => router.reload()}>Refrescar</button>
                  <Link href="/players" className="btn btn-outline">Volver</Link>
                </div>
              </div>

              {stats.topCommanders.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-600">
                  No se han registrado comandantes.
                </div>
              ) : (
                <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                  {stats.topCommanders.map((cmd) => (
                    <li key={cmd.name}>
                      <CommanderCard cmd={cmd} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>
        </>
      )}
    </main>
  )
}

/* ────────────────────────────────────────────── */
/* Formulario edición (solo dueño)                */
/* ────────────────────────────────────────────── */
function EditProfileForm({ initialNickname, onSaved }) {
  const [nickname, setNickname] = useState(initialNickname || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [ok, setOk] = useState(false)

  const clean = nickname.trim()
  const isValid = clean.length >= 2 && clean.length <= 32
  const isDirty = clean !== (initialNickname || '')
  const canSave = isValid && isDirty && !saving

  const save = async () => {
    if (!canSave) return
    setSaving(true); setError(null); setOk(false)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('Necesitas iniciar sesión.')

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nickname: clean })
      })

      if (!res.ok) throw new Error((await res.text()) || 'Error al guardar')

      setOk(true)
      onSaved?.(clean)
    } catch (e) {
      setError(e.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="p-0 overflow-hidden">
      {/* Header de la card */}
      <div className="flex items-center justify-between border-b border-gray-200/70 px-4 py-3 sm:px-5">
        <div>
          <h2 className="text-base font-semibold leading-tight">Editar perfil</h2>
          <p className="text-xs text-gray-600">Actualiza tu nombre público.</p>
        </div>
        {saving && <span className="text-xs text-gray-500">Guardando…</span>}
      </div>

      {/* Cuerpo */}
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        {/* Alertas */}
        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {ok && (
          <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Guardado correctamente.
          </div>
        )}

        <label className="block">
          <span className="text-sm font-medium text-gray-800">Nickname</span>
          <div
            className={[
              "mt-1.5 flex items-center rounded-lg ring-1 transition",
              isValid ? "ring-gray-300 focus-within:ring-gray-900" : "ring-red-300 focus-within:ring-red-500",
              "bg-white"
            ].join(" ")}
          >
            <input
              className="w-full rounded-lg bg-transparent px-3 py-2 outline-none"
              value={nickname}
              onChange={(e) => { setNickname(e.target.value); setOk(false); setError(null) }}
              placeholder="Tu nombre público"
              maxLength={32}
              autoComplete="off"
              onKeyDown={(e) => { if (e.key === 'Enter') save() }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className={isValid ? "text-gray-500" : "text-red-600"}>
              {isValid ? 'Entre 2 y 32 caracteres' : 'El nickname debe tener entre 2 y 32 caracteres'}
            </span>
            <span className="text-gray-400">{clean.length}/32</span>
          </div>
        </label>
      </div>

      {/* Barra de acciones con estilo mejorado */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200/70 bg-gray-50 px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={() => setNickname(initialNickname || '')}
          disabled={!isDirty || saving}
          title="Deshacer cambios"
          className={[
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm",
            "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          ].join(" ")}
        >
          Deshacer
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className={[
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm",
            "bg-primary text-white hover:bg-primary/90",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          ].join(" ")}
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </Card>
  )
}
