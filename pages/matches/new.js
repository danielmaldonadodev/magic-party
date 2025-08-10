// pages/matches/new.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import CardSearchInput from '../../components/CardSearchInput'
import ImageFallback from '../../components/ImageFallback'
import PageHeader from '../../components/PageHeader'

function toDatetimeLocal(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function CommanderPreview({ name, small, normal, art }) {
  const src = small || normal || art || ''
  if (!src) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-[88px] aspect-[63/88] rounded-lg border border-gray-200 bg-gray-50 grid place-content-center text-xs text-gray-500 shadow-sm">
          <div className="text-center">
            <svg className="h-6 w-6 mx-auto mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Sin img</span>
          </div>
        </div>
        <div className="min-w-0">
          <div className="truncate font-medium text-gray-900">
            {name || <span className="text-gray-500">Sin comandante</span>}
          </div>
          {!name && <div className="text-xs text-gray-500 mt-1">Selecciona una carta</div>}
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-3">
      <div className="w-[88px] aspect-[63/88] rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
        <ImageFallback
          src={src}
          alt={name || 'Commander'}
          width={88}
          height={123}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="min-w-0">
        <div className="truncate font-semibold text-gray-900">{name}</div>
        <div className="text-xs text-gray-600 mt-1">Comandante seleccionado</div>
      </div>
    </div>
  )
}

export default function NewMatch() {
  const router = useRouter()
  const [games, setGames] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({ game_id: '', played_at: '', winner: '' })
  const [participants, setParticipants] = useState([])

  const blankParticipant = () => ({
    user_id: '',
    deck_commander: '',
    commander_image: '',
    commander_art_crop: '',
    commander_image_normal: '',
    commander_image_small: '',
    commander_name: '',
    scryfall_id: '',
    used_proxies: false,
    life_remaining: '',
    max_damage: '',
    first_to_die: false,
    won_by_combo: false,
    kills: '',
  })

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const [{ data: gData, error: gErr }, { data: pData, error: pErr }] = await Promise.all([
        supabase.from('games').select('id, name').order('name', { ascending: true }),
        supabase.from('profiles').select('id, nickname').order('created_at', { ascending: true }),
      ])
      if (!mounted) return
      if (gErr) console.error(gErr)
      if (pErr) console.error(pErr)

      if (gData?.length) {
        setGames(gData)
        setForm((f) => ({ ...f, game_id: f.game_id || gData[0].id }))
      }
      if (pData) setProfiles(pData)
      setForm((f) => ({ ...f, played_at: f.played_at || toDatetimeLocal() }))
      setParticipants((cur) => (cur.length ? cur : [blankParticipant()]))
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  const addParticipant = () => setParticipants((prev) => [...prev, blankParticipant()])
  const removeParticipant = (idx) => setParticipants((prev) => prev.filter((_, i) => i !== idx))
  const updateParticipant = (index, key, value) =>
    setParticipants((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [key]: value }
      return copy
    })

  const onSelectCommander = (index, card) => {
    const name = card?.name || ''
    const iu = card?.image_uris || {}
    const art = iu.art_crop || ''
    const normal = iu.normal || iu.large || ''
    const small = iu.small || ''
    const anyImg = normal || art || small || ''
    setParticipants((prev) => {
      const copy = [...prev]
      copy[index] = {
        ...copy[index],
        deck_commander: name,
        commander_name: name,
        scryfall_id: card?.id || '',
        commander_art_crop: art || '',
        commander_image_normal: normal || '',
        commander_image_small: small || '',
        commander_image: anyImg || '',
      }
      return copy
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return setError('No estás autenticado.')

    if (!form.game_id || !form.played_at || !form.winner)
      return setError('Completa juego, fecha y ganador.')
    if (!participants.length || participants.some((p) => !p.user_id))
      return setError('Selecciona jugador para cada participante.')

    const uniquePlayers = new Set(participants.map((p) => p.user_id).filter(Boolean))
    if (uniquePlayers.size < 2) {
      return setError('Debes añadir al menos dos jugadores diferentes.')
    }

    const res = await fetch('/api/matches/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        match: {
          game_id: form.game_id,
          played_at: form.played_at,
          winner: form.winner,
          user_id: session.user.id
        },
        participants
      })
    })

    if (!res.ok) {
      const msg = await res.text()
      return setError(msg)
    }

    router.push('/matches')
  }

  return (
    <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Nueva Partida"
          description="Registra una partida, añade participantes y selecciona sus comandantes."
        />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-red-800">Error</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Datos generales */}
            <section className="mb-8">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Información General</h2>
                    <p className="text-sm text-gray-600">Configura los datos básicos de la partida</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Juego</label>
                  <div className="relative">
                    <select
                      name="game_id"
                      value={form.game_id}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 sm:text-sm"
                    >
                      <option value="" disabled>Selecciona un juego</option>
                      {games.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
                  <input
                    type="datetime-local"
                    name="played_at"
                    value={form.played_at}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 sm:text-sm"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Ganador de la Partida</label>
                  <div className="relative">
                    <select
                      name="winner"
                      value={form.winner}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 sm:text-sm"
                    >
                      <option value="">Selecciona el ganador</option>
                      {profiles.map((p) => <option key={p.id} value={p.id}>{p.nickname}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Se utilizará para mostrar al ganador en el listado de partidas.
                  </p>
                </div>
              </div>
            </section>

            {/* Participantes */}
            <section>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-3a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Participantes</h2>
                      <p className="text-sm text-gray-600">Agrega jugadores y sus comandantes</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    onClick={addParticipant}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Añadir Participante
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-gray-500">
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Cargando...</span>
                    </div>
                  </div>
                ) : (
                  participants.map((p, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg bg-gray-50/30 overflow-hidden">
                      <div className="px-6 py-4 bg-white border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-sm font-semibold text-gray-700">
                              {index + 1}
                            </div>
                            <span className="font-medium text-gray-900">Participante {index + 1}</span>
                          </div>
                          {participants.length > 1 && (
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              onClick={() => removeParticipant(index)}
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Quitar
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        <div className="grid gap-6 lg:grid-cols-[1fr_1fr_280px]">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Jugador</label>
                            <div className="relative">
                              <select
                                value={p.user_id}
                                onChange={(e) => updateParticipant(index, 'user_id', e.target.value)}
                                required
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 sm:text-sm"
                              >
                                <option value="">Selecciona un jugador</option>
                                {profiles
                                  .filter((pp) => pp.id === p.user_id || !participants.some((x) => x.user_id === pp.id))
                                  .map((pp) => (
                                    <option key={pp.id} value={pp.id}>{pp.nickname}</option>
                                  ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Comandante</label>
                            <CardSearchInput
                              key={`${p.scryfall_id || 'none'}-${index}`}
                              value={p.commander_name || p.deck_commander || ''}
                              placeholder="Buscar comandante..."
                              onSelect={(card) => onSelectCommander(index, card)}
                              closeOnSelect
                            />
                          </div>

                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <CommanderPreview
                              name={p.commander_name}
                              small={p.commander_image_small}
                              normal={p.commander_image_normal}
                              art={p.commander_art_crop}
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Vidas Restantes</label>
                            <input
                              type="number"
                              value={p.life_remaining}
                              onChange={(e) => updateParticipant(index, 'life_remaining', e.target.value)}
                              min="0"
                              placeholder="0"
                              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 sm:text-sm text-right"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Daño Máximo</label>
                            <input
                              type="number"
                              value={p.max_damage}
                              onChange={(e) => updateParticipant(index, 'max_damage', e.target.value)}
                              min="0"
                              placeholder="0"
                              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 sm:text-sm text-right"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Eliminaciones</label>
                            <input
                              type="number"
                              value={p.kills}
                              onChange={(e) => updateParticipant(index, 'kills', e.target.value)}
                              min="0"
                              placeholder="0"
                              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 sm:text-sm text-right"
                            />
                          </div>

                          <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 cursor-pointer hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={p.used_proxies}
                              onChange={(e) => updateParticipant(index, 'used_proxies', e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                            />
                            <span className="text-sm font-medium text-gray-700">¿Usó proxies?</span>
                          </label>

                          <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 cursor-pointer hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={p.first_to_die}
                              onChange={(e) => updateParticipant(index, 'first_to_die', e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                            />
                            <span className="text-sm font-medium text-gray-700">¿Eliminado primero?</span>
                          </label>

                          <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 cursor-pointer hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={p.won_by_combo}
                              onChange={(e) => updateParticipant(index, 'won_by_combo', e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                            />
                            <span className="text-sm font-medium text-gray-700">¿Ganó por combo?</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                onClick={() => router.push('/matches')}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                onClick={handleSubmit}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar Partida
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}