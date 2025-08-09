import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../../lib/supabaseClient'
import PageHeader from '../../components/PageHeader'
import ManaSymbol from '../../components/ManaSymbol'
import { ArrowLeft, Trash2, Edit2, Award, Skull, Sword, Flame } from 'lucide-react'

// ────────────────────────────────────────────────────────────
// Utilidades
function formatDate(date) {
  try {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric', month: 'long', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(date))
  } catch { return '—' }
}

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

function renderManaCost(cost) {
  if (!cost) return null
  const tokens = cost.match(/{[^}]+}/g) || []
  if (!tokens.length) return <span className="text-sm">{cost}</span>
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {tokens.map((tok, i) => (
        <ManaSymbol key={`${tok}-${i}`} token={tok.replace(/[{}]/g, '')} />
      ))}
    </span>
  )
}
// ────────────────────────────────────────────────────────────

export default function MatchDetail() {
  const router = useRouter()
  const { id } = router.query

  const [match, setMatch] = useState(null)
  const [participants, setParticipants] = useState([])
  const [profiles, setProfiles] = useState([])
  const [games, setGames] = useState([])

  const [winnerCard, setWinnerCard] = useState(null)
  const [commanderStats, setCommanderStats] = useState({ games_played: 0, wins: 0, winrate: '0.0' })
  const [commanderStatsByUser, setCommanderStatsByUser] = useState({ games_played: 0, wins: 0, winrate: '0.0' })

  const [sessionUserId, setSessionUserId] = useState(null)
  const isOwner = !!(match && sessionUserId && match.user_id === sessionUserId)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSessionUserId(session?.user?.id || null)
    })()
  }, [])

  useEffect(() => {
    if (!id) return
    let ignore = false
    ;(async () => {
      setLoading(true); setError(null)
      const [
        { data: mData, error: mErr },
        { data: parts },
        { data: gData },
        { data: pData },
      ] = await Promise.all([
        supabase.from('matches').select('*').eq('id', id).single(),
        supabase.from('match_participants').select('*').eq('match_id', id),
        supabase.from('games').select('id, name').order('name', { ascending: true }),
        supabase.from('profiles').select('id, nickname'),
      ])
      if (ignore) return
      if (mErr) {
        setError(mErr.message || 'No se pudo cargar la partida')
        setLoading(false)
        return
      }
      setMatch(mData || null)
      setParticipants(parts || [])
      setGames(gData || [])
      setProfiles(pData || [])
      setLoading(false)
    })()
    return () => { ignore = true }
  }, [id])

  const nickById = useMemo(() => {
    const acc = {}; for (const p of profiles) acc[p.id] = p.nickname; return acc
  }, [profiles])
  const gameById = useMemo(() => {
    const acc = {}; for (const g of games) acc[g.id] = g.name; return acc
  }, [games])

  const winnerParticipant = useMemo(
    () => match ? participants.find(p => p.user_id === match.winner) : null,
    [participants, match]
  )

  useEffect(() => {
    if (!winnerParticipant?.scryfall_id) { setWinnerCard(null); return }
    ;(async () => {
      try {
        const resp = await fetch(`https://api.scryfall.com/cards/${winnerParticipant.scryfall_id}`)
        const card = await resp.json()
        const lines = (card.oracle_text || '').split('\n').filter(Boolean)
        setWinnerCard({
          name: card.name,
          setName: card.set_name,
          setCode: (card.set || '').toUpperCase(),
          typeLine: card.type_line,
          manaCost: card.mana_cost || '',
          abilities: lines,
          image: upgradeScryfallUrl(card.image_uris?.normal || card.image_uris?.large || ''),
        })
      } catch {
        setWinnerCard(null)
      }
    })()
  }, [winnerParticipant?.scryfall_id])

  useEffect(() => {
    if (!winnerParticipant?.scryfall_id) {
      setCommanderStats({ games_played: 0, wins: 0, winrate: '0.0' })
      setCommanderStatsByUser({ games_played: 0, wins: 0, winrate: '0.0' })
      return
    }
    ;(async () => {
      const [globalRes, byUserRes] = await Promise.all([
        supabase
          .from('commander_stats')
          .select('games_played, wins')
          .eq('scryfall_id', winnerParticipant.scryfall_id)
          .maybeSingle(),
        match?.winner
          ? supabase
              .from('commander_stats_by_user')
              .select('games_played, wins')
              .eq('user_id', match.winner)
              .eq('scryfall_id', winnerParticipant.scryfall_id)
              .maybeSingle()
          : Promise.resolve({ data: null })
      ])

      const g = globalRes.data || { games_played: 0, wins: 0 }
      setCommanderStats({
        ...g,
        winrate: g.games_played ? ((g.wins / g.games_played) * 100).toFixed(1) : '0.0'
      })

      const bu = byUserRes.data || { games_played: 0, wins: 0 }
      setCommanderStatsByUser({
        ...bu,
        winrate: bu.games_played ? ((bu.wins / bu.games_played) * 100).toFixed(1) : '0.0'
      })
    })()
  }, [winnerParticipant?.scryfall_id, match?.winner])

  if (loading) return <main className="py-10">Cargando…</main>
  if (error)   return <main className="py-10 text-red-600">Error: {error}</main>
  if (!match)  return <main className="py-10">Partida no encontrada.</main>

  const maxKills = participants.reduce((m, p) => Math.max(m, p.kills || 0), 0)
  const maxDamage = participants.reduce((m, p) => Math.max(m, p.max_damage || 0), 0)
  const killLeaders = participants.filter(p => (p.kills || 0) === maxKills && maxKills > 0)
  const uniqueTopKillsUserId = killLeaders.length === 1 ? killLeaders[0].user_id : null

  const handleDelete = async () => {
    if (!isOwner) return
    if (!id) return alert('ID de partida no encontrado.')
    if (!window.confirm('¿Seguro que quieres borrar esta partida? Se revertirán las estadísticas.')) return

    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('No autenticado')

      const resp = await fetch(`/api/matches/${encodeURIComponent(id)}/delete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) throw new Error(data.error || 'Error desconocido')

      await router.replace('/matches')
    } catch (e) {
      alert(`No se pudo borrar la partida: ${e.message}`)
      setDeleting(false)
    }
  }

  return (
    <main className="py-6 px-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href="/matches" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Volver
        </Link>
        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn btn-outline border-red-300 text-red-700 hover:bg-red-50 flex items-center gap-1 disabled:opacity-60"
            >
              <Trash2 size={16} /> {deleting ? 'Borrando…' : 'Borrar'}
            </button>
          </div>
        )}
      </div>

      <PageHeader title="Partida" description={`${formatDate(match.played_at)} · ${gameById[match.game_id] || 'Formato'}`} />

      {/* HERO */}
      <section className="mb-10 rounded-2xl border border-gray-200 bg-gradient-to-br from-amber-50 to-white shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-[320px_1fr] gap-6 p-6">
          <div className="relative">
            <div className="relative aspect-[5/7] rounded-xl overflow-hidden border-4 border-amber-500 shadow-lg">
              {winnerCard?.image ? (
                <Image src={winnerCard.image} alt={winnerCard?.name || 'Comandante ganador'} fill className="object-contain" sizes="320px" />
              ) : (
                <div className="grid h-full place-content-center text-sm text-gray-400">Sin imagen</div>
              )}
            </div>
            <div className="absolute -top-4 left-4 flex items-center gap-2 bg-amber-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
              <Award size={14} /> Ganador
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{winnerCard?.name || '—'}</h2>
              <p className="text-sm text-gray-600">{winnerCard?.setName} {winnerCard?.setCode && `(${winnerCard.setCode})`}</p>
              {winnerCard?.typeLine && <p className="mt-1 text-sm italic text-gray-500">{winnerCard.typeLine}</p>}
              {winnerCard?.manaCost && <div className="mt-2">{renderManaCost(winnerCard.manaCost)}</div>}
              {winnerCard?.abilities?.length > 0 && (
                <ul className="mt-4 space-y-1 rounded-lg border bg-white p-3 text-sm max-h-40 overflow-y-auto">
                  {winnerCard.abilities.map((line, i) => (
                    <li key={i} className="flex gap-2"><span className="text-amber-600 font-bold">•</span>{line}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg border bg-gray-50 p-3">
                <h4 className="text-xs text-gray-500 mb-2">Global</h4>
                <div className="flex justify-between text-sm"><span>Partidas</span><span>{commanderStats.games_played}</span></div>
                <div className="flex justify-between text-sm"><span>Victorias</span><span>{commanderStats.wins}</span></div>
                <div className="flex justify-between text-sm"><span>Winrate</span><span>{commanderStats.winrate}%</span></div>
              </div>
              <div className="rounded-lg border bg-white p-3">
                <h4 className="text-xs text-gray-500 mb-2">Jugador</h4>
                <div className="flex justify-between text-sm"><span>Partidas</span><span>{commanderStatsByUser.games_played}</span></div>
                <div className="flex justify-between text-sm"><span>Victorias</span><span>{commanderStatsByUser.wins}</span></div>
                <div className="flex justify-between text-sm"><span>Winrate</span><span>{commanderStatsByUser.winrate}%</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Participantes */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <header className="border-b px-5 py-4">
          <h3 className="text-base font-bold">Participantes</h3>
          <p className="text-sm opacity-70">Comandantes y métricas por jugador</p>
        </header>

        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {participants.map((p) => {
            const isWinner = p.user_id === match.winner
            const profileName = nickById[p.user_id] || p.user_id
            const src = upgradeScryfallUrl(
              p.commander_image_small || p.commander_image_normal || p.commander_art_crop || p.commander_image || ''
            )
            const isFirstToDie = !!p.first_to_die
            const isTopDamage = (p.max_damage || 0) > 0 && (p.max_damage || 0) === maxDamage
            const isUniqueTopKills = uniqueTopKillsUserId && p.user_id === uniqueTopKillsUserId

            return (
              <Link key={p.id} href={`/players/${p.user_id}`} className={`relative rounded-xl border p-4 shadow-sm transition hover:shadow-md ${isWinner ? 'border-amber-500' : 'border-gray-200'}`}>
                <div className="absolute -top-2 right-3 flex gap-2">
                  {isFirstToDie && <span className="rounded-full bg-gray-900/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow flex items-center gap-1"><Skull size={10} /> Murió primero</span>}
                  {isUniqueTopKills && <span className="rounded-full bg-rose-600/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow flex items-center gap-1"><Sword size={10} /> Más kills</span>}
                  {isTopDamage && <span className="rounded-full bg-indigo-600/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow flex items-center gap-1"><Flame size={10} /> Mayor daño</span>}
                </div>
                <div className="flex items-start gap-3">
                  <div className="relative h-[96px] w-[68px] overflow-hidden rounded-md border bg-gray-50 flex-shrink-0">
                    {src ? <Image src={src} alt={p.commander_name || 'Comandante'} fill className="object-cover" sizes="68px" /> : <div className="grid h-full w-full place-content-center text-xs text-gray-400">Sin imagen</div>}
                  </div>
                  <div className="min-w-0">
                    <div className="block truncate text-sm font-medium text-primary">{profileName}</div>
                    <p className="truncate text-sm text-gray-700">{p.commander_name || p.deck_commander || '—'}</p>
                    {isWinner && <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Ganador</span>}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded border bg-gray-50 py-1.5"><div className="text-[11px] text-gray-500">Kills</div><div className="font-semibold">{p.kills ?? 0}</div></div>
                  <div className="rounded border bg-gray-50 py-1.5"><div className="text-[11px] text-gray-500">Daño máx.</div><div className="font-semibold">{p.max_damage ?? 0}</div></div>
                  <div className="rounded border bg-gray-50 py-1.5"><div className="text-[11px] text-gray-500">Vidas</div><div className="font-semibold">{p.life_remaining ?? 0}</div></div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-600">
                  {p.used_proxies && <span className="rounded-full border px-2 py-0.5">Proxys</span>}
                  {p.won_by_combo && <span className="rounded-full border px-2 py-0.5">Ganó por combo</span>}
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}
