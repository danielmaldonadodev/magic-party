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
        <div className="w-[88px] aspect-[63/88] rounded-md border border-gray-200 bg-gray-50 grid place-content-center text-xs text-gray-400">
          Sin img
        </div>
        <div className="min-w-0">
          <div className="truncate font-medium">
            {name || <span className="opacity-50">Sin comandante</span>}
          </div>
          {!name && <div className="text-xs opacity-60">Selecciona una carta</div>}
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-3">
      <div className="w-[88px] aspect-[63/88] rounded-md overflow-hidden border border-gray-200 bg-white shadow-sm">
        <ImageFallback
          src={src}
          alt={name || 'Commander'}
          width={88}
          height={123}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="min-w-0">
        <div className="truncate font-medium">{name}</div>
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
    life_remaining: '', // antes 0
    max_damage: '',     // antes 0
    first_to_die: false,
    won_by_combo: false,
    kills: '',          // antes 0
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

    const { data: matchData, error: insertError } = await supabase
      .from('matches')
      .insert({
        game_id: form.game_id,
        played_at: form.played_at,
        winner: form.winner,
        user_id: session.user.id,
      })
      .select()
      .single()
    if (insertError) return setError(insertError.message)

    const payload = participants.map((p) => ({
      match_id: matchData.id,
      user_id: p.user_id,
      deck_commander: p.deck_commander || p.commander_name || '',
      commander_image:
        p.commander_image ||
        p.commander_image_normal ||
        p.commander_art_crop ||
        p.commander_image_small ||
        null,
      commander_art_crop: p.commander_art_crop || null,
      commander_image_normal: p.commander_image_normal || null,
      commander_image_small: p.commander_image_small || null,
      commander_name: p.commander_name || p.deck_commander || null,
      scryfall_id: p.scryfall_id || null,
      used_proxies: !!p.used_proxies,
      life_remaining: p.life_remaining === '' ? null : Number(p.life_remaining),
      max_damage: p.max_damage === '' ? null : Number(p.max_damage),
      first_to_die: !!p.first_to_die,
      won_by_combo: !!p.won_by_combo,
      kills: p.kills === '' ? null : Number(p.kills),
    }))
    const { error: participantsError } = await supabase.from('match_participants').insert(payload)
    if (participantsError) return setError(participantsError.message)

    const { error: statsError } = await supabase.rpc('update_commander_stats', {
      p_match_id: matchData.id
    })
    if (statsError) console.error('update_commander_stats error', statsError)

    router.push('/matches')
  }

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6">
      <PageHeader
        title="Nueva partida"
        description="Registra una partida, añade participantes y su comandante."
      />

      {error && (
        <div className="mb-4 text-sm p-3 rounded-md bg-red-100 text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Datos generales */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-6">
        <header className="px-5 py-4 border-b">
          <h2 className="title-text text-base">Datos generales</h2>
          <p className="text-sm opacity-70 mt-0.5">Juego, fecha y ganador</p>
        </header>

        <div className="p-5 grid gap-5 sm:grid-cols-2">
          <div className="group rounded-lg border border-gray-200 bg-gray-50/40 p-3">
            <label className="text-sm font-medium block mb-1.5">Juego</label>
            <select
              name="game_id"
              value={form.game_id}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="" disabled>— Selecciona juego —</option>
              {games.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>

          <div className="group rounded-lg border border-gray-200 bg-gray-50/40 p-3">
            <label className="text-sm font-medium block mb-1.5">Fecha y hora</label>
            <input
              type="datetime-local"
              name="played_at"
              value={form.played_at}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          <div className="group rounded-lg border border-gray-200 bg-gray-50/40 p-3 sm:col-span-2">
            <label className="text-sm font-medium block mb-1.5">Ganador</label>
            <select
              name="winner"
              value={form.winner}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="">— Selecciona —</option>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.nickname}</option>)}
            </select>
            <p className="text-xs opacity-70 mt-1.5">
              Se usará en el listado para mostrar la imagen del ganador.
            </p>
          </div>
        </div>
      </section>

      {/* Participantes */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <header className="px-5 py-4 border-b flex items-start justify-between gap-3">
          <div>
            <h2 className="title-text text-base">Participantes</h2>
            <p className="text-sm opacity-70 mt-0.5">Jugadores, comandante y detalles</p>
          </div>
          <button
            type="button"
            className="btn btn-outline px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow-md"
            onClick={addParticipant}
          >
            Añadir participante
          </button>
        </header>

        <div className="divide-y">
          {loading ? (
            <div className="p-5">Cargando...</div>
          ) : (
            participants.map((p, index) => (
              <fieldset key={index} className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 border">#{index + 1}</span>
                    <span className="text-sm opacity-70">Participante</span>
                  </div>
                  {participants.length > 1 && (
                    <button type="button" className="btn btn-outline" onClick={() => removeParticipant(index)}>
                      Quitar
                    </button>
                  )}
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_1fr_280px]">
                  <div className="group rounded-lg border border-gray-200 bg-gray-50/40 p-3">
                    <label className="text-sm font-medium block mb-1.5">Jugador</label>
                    <select
                      value={p.user_id}
                      onChange={(e) => updateParticipant(index, 'user_id', e.target.value)}
                      required
                      className="input"
                    >
                      <option value="">— Selecciona —</option>
                      {profiles
                        .filter((pp) => pp.id === p.user_id || !participants.some((x) => x.user_id === pp.id))
                        .map((pp) => (
                          <option key={pp.id} value={pp.id}>{pp.nickname}</option>
                        ))}
                    </select>
                  </div>

                  <div className="group rounded-lg border border-gray-200 bg-gray-50/40 p-3">
                    <label className="text-sm font-medium block mb-1.5">Carta insignia / Comandante</label>
                    <CardSearchInput
                      key={`${p.scryfall_id || 'none'}-${index}`}
                      value={p.commander_name || p.deck_commander || ''}
                      placeholder="Buscar carta"
                      onSelect={(card) => onSelectCommander(index, card)}
                      closeOnSelect
                    />
                  </div>

                  <div className="rounded-lg border-l-4 border-primary/40 pl-4">
                    <CommanderPreview
                      name={p.commander_name}
                      small={p.commander_image_small}
                      normal={p.commander_image_normal}
                      art={p.commander_art_crop}
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="group rounded-lg border border-gray-200 bg-gray-50/40 p-3">
                    <label className="text-sm font-medium block mb-1.5">Vidas restantes</label>
                    <input
                      type="number"
                      value={p.life_remaining}
                      onChange={(e) => updateParticipant(index, 'life_remaining', e.target.value)}
                      min="0"
                      placeholder="—"
                      className="input text-right"
                    />
                  </div>

                  <div className="group rounded-lg border border-gray-200 bg-gray-50/40 p-3">
                    <label className="text-sm font-medium block mb-1.5">Daño máximo en un turno</label>
                    <input
                      type="number"
                      value={p.max_damage}
                      onChange={(e) => updateParticipant(index, 'max_damage', e.target.value)}
                      min="0"
                      placeholder="—"
                      className="input text-right"
                    />
                  </div>

                  <div className="group rounded-lg border border-gray-200 bg-gray-50/40 p-3">
                    <label className="text-sm font-medium block mb-1.5">Número de kills</label>
                    <input
                      type="number"
                      value={p.kills}
                      onChange={(e) => updateParticipant(index, 'kills', e.target.value)}
                      min="0"
                      placeholder="—"
                      className="input text-right"
                    />
                  </div>

                  <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50/40 p-3">
                    <input
                      type="checkbox"
                      checked={p.used_proxies}
                      onChange={(e) => updateParticipant(index, 'used_proxies', e.target.checked)}
                    />
                    <span className="text-sm">¿Usó proxys?</span>
                  </label>

                  <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50/40 p-3">
                    <input
                      type="checkbox"
                      checked={p.first_to_die}
                      onChange={(e) => updateParticipant(index, 'first_to_die', e.target.checked)}
                    />
                    <span className="text-sm">¿Murió primero?</span>
                  </label>

                  <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50/40 p-3">
                    <input
                      type="checkbox"
                      checked={p.won_by_combo}
                      onChange={(e) => updateParticipant(index, 'won_by_combo', e.target.checked)}
                    />
                    <span className="text-sm">¿Ganó por combo?</span>
                  </label>
                </div>
              </fieldset>
            ))
          )}
        </div>

        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t bg-white p-4">
          <button
            type="button"
            className="btn btn-outline px-4 py-2.5 text-sm font-medium hover:shadow-sm"
            onClick={() => router.push('/matches')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary px-6 py-2.5 text-sm font-medium shadow-sm hover:shadow-md"
            onClick={handleSubmit}
          >
            Guardar partida
          </button>
        </div>
      </section>
    </main>
  )
}
