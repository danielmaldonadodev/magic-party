import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../../lib/supabaseClient'
import PageHeader from '../../components/PageHeader'
import ManaSymbol from '../../components/ManaSymbol'

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

  if (loading) {
    return (
      <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-gray-500">
              <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-medium">Cargando partida...</span>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar la partida</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link 
                href="/matches"
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a partidas
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!match) {
    return (
      <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Partida no encontrada</h2>
              <p className="text-gray-600 mb-6">La partida que buscas no existe o ha sido eliminada.</p>
              <Link 
                href="/matches"
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a partidas
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const maxKills = participants.reduce((m, p) => Math.max(m, p.kills || 0), 0)
  const maxDamage = participants.reduce((m, p) => Math.max(m, p.max_damage || 0), 0)
  const killLeaders = participants.filter(p => (p.kills || 0) === maxKills && maxKills > 0)
  const uniqueTopKillsUserId = killLeaders.length === 1 ? killLeaders[0].user_id : null

  const handleDelete = async () => {
    if (!isOwner) return
    if (!id) return alert('ID de partida no encontrado.')
    if (!window.confirm('¿Seguro que quieres eliminar esta partida? Se revertirán las estadísticas.')) return

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
      alert(`No se pudo eliminar la partida: ${e.message}`)
      setDeleting(false)
    }
  }

  return (
    <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Navigation and Actions */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/matches" 
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a partidas
          </Link>
          {isOwner && (
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          )}
        </div>

        <PageHeader 
          title="Detalle de Partida" 
          description={`${formatDate(match.played_at)} · ${gameById[match.game_id] || 'Formato desconocido'}`} 
        />

        {/* HERO - Winner Card */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-600 to-emerald-700" />
            
            <div className="p-8">
              <div className="grid md:grid-cols-[320px_1fr] gap-8">
                <div className="relative">
                  <div className="relative aspect-[5/7] rounded-lg overflow-hidden border-2 border-green-200 shadow-md bg-gray-50">
                    {winnerCard?.image ? (
                      <Image 
                        src={winnerCard.image} 
                        alt={winnerCard?.name || 'Comandante ganador'} 
                        fill 
                        className="object-contain" 
                        sizes="320px" 
                      />
                    ) : (
                      <div className="grid h-full place-content-center text-sm text-gray-500">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Sin imagen</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute -top-3 left-4 inline-flex items-center gap-2 bg-green-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg shadow-md">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Comandante Ganador
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{winnerCard?.name || 'Comandante desconocido'}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <span>{winnerCard?.setName}</span>
                      {winnerCard?.setCode && (
                        <>
                          <span>•</span>
                          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{winnerCard.setCode}</span>
                        </>
                      )}
                    </div>
                    {winnerCard?.typeLine && (
                      <p className="text-sm italic text-gray-600 mb-3">{winnerCard.typeLine}</p>
                    )}
                    {winnerCard?.manaCost && (
                      <div className="mb-4">{renderManaCost(winnerCard.manaCost)}</div>
                    )}
                    {winnerCard?.abilities?.length > 0 && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 max-h-40 overflow-y-auto">
                        <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Habilidades</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          {winnerCard.abilities.map((line, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-gray-400 font-bold">•</span>
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Estadísticas Globales</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Partidas</span>
                          <span className="font-semibold text-gray-900">{commanderStats.games_played}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Victorias</span>
                          <span className="font-semibold text-gray-900">{commanderStats.wins}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tasa de Victoria</span>
                          <span className="font-semibold text-green-700">{commanderStats.winrate}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Con Este Jugador</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Partidas</span>
                          <span className="font-semibold text-gray-900">{commanderStatsByUser.games_played}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Victorias</span>
                          <span className="font-semibold text-gray-900">{commanderStatsByUser.wins}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tasa de Victoria</span>
                          <span className="font-semibold text-green-700">{commanderStatsByUser.winrate}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Participantes */}
        <section>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-3a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Participantes</h3>
                  <p className="text-sm text-gray-600">Comandantes y estadísticas de cada jugador</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  <Link 
                    key={p.id} 
                    href={`/players/${p.user_id}`} 
                    className={`group relative rounded-lg border p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                      isWinner ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {/* Achievement badges */}
                    <div className="absolute -top-2 right-3 flex gap-2">
                      {isFirstToDie && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Eliminado primero
                        </span>
                      )}
                      {isUniqueTopKills && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l3-3 3 3v13M9 19h6" />
                          </svg>
                          Más eliminaciones
                        </span>
                      )}
                      {isTopDamage && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-600 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Mayor daño
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="relative h-24 w-[68px] overflow-hidden rounded-md border border-gray-200 bg-gray-50 flex-shrink-0">
                        {src ? (
                          <Image 
                            src={src} 
                            alt={p.commander_name || 'Comandante'} 
                            fill 
                            className="object-cover transition-transform duration-200 group-hover:scale-105" 
                            sizes="68px" 
                          />
                        ) : (
                          <div className="grid h-full w-full place-content-center text-xs text-gray-400">
                            <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Sin imagen</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-gray-900 mb-1">{profileName}</div>
                        <p className="truncate text-sm text-gray-600 mb-2">{p.commander_name || p.deck_commander || 'Comandante desconocido'}</p>
                        {isWinner && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Ganador
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-md border border-gray-200 bg-gray-50 py-2">
                        <div className="text-gray-500 mb-1">Eliminaciones</div>
                        <div className="font-semibold text-gray-900">{p.kills ?? 0}</div>
                      </div>
                      <div className="rounded-md border border-gray-200 bg-gray-50 py-2">
                        <div className="text-gray-500 mb-1">Daño Máx.</div>
                        <div className="font-semibold text-gray-900">{p.max_damage ?? 0}</div>
                      </div>
                      <div className="rounded-md border border-gray-200 bg-gray-50 py-2">
                        <div className="text-gray-500 mb-1">Vidas</div>
                        <div className="font-semibold text-gray-900">{p.life_remaining ?? 0}</div>
                      </div>
                    </div>

                    {(p.used_proxies || p.won_by_combo) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {p.used_proxies && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Usó proxies
                          </span>
                        )}
                        {p.won_by_combo && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Ganó por combo
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}