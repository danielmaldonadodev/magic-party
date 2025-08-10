// pages/formats/index.js
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import SkeletonCard from '../../components/SkeletonCard'

export default function FormatsPage() {
  const [formats, setFormats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Crear / borrar formato
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // ────────────────────────────────────────────────────────────
  // Carga inicial
  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('games')
        .select(`
          id,
          name,
          created_at,
          format_stats (
            total_matches,
            total_players,
            last_played_at
          )
        `)
        .order('name', { ascending: true })

      if (ignore) return
      if (error) {
        setError(error.message)
        setFormats([])
      } else {
        const normalized = (data || []).map(g => ({
          ...g,
          format_stats: g.format_stats ?? {
            total_matches: 0,
            total_players: 0,
            last_played_at: null
          }
        }))
        setFormats(normalized)
      }
      setLoading(false)
    }
    load()
    return () => { ignore = true }
  }, [])

  // ────────────────────────────────────────────────────────────
  // Realtime: cambios en `games`
  useEffect(() => {
    const chGames = supabase
      .channel('realtime-games')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, payload => {
        setFormats(prev => {
          const map = new Map(prev.map(f => [f.id, f]))
          if (payload.eventType === 'INSERT') {
            map.set(payload.new.id, {
              ...payload.new,
              format_stats: { total_matches: 0, total_players: 0, last_played_at: null }
            })
          } else if (payload.eventType === 'UPDATE') {
            const cur = map.get(payload.new.id) || {}
            map.set(payload.new.id, { ...cur, ...payload.new })
          } else if (payload.eventType === 'DELETE') {
            map.delete(payload.old.id)
          }
          return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(chGames) }
  }, [])

  // Realtime: cambios en `format_stats`
  useEffect(() => {
    const chStats = supabase
      .channel('realtime-format-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'format_stats' }, payload => {
        setFormats(prev => {
          const map = new Map(prev.map(f => [f.id, f]))
          const formatId = payload.new?.format_id ?? payload.old?.format_id
          const cur = map.get(formatId)
          if (!cur) return prev

          if (payload.eventType === 'DELETE') {
            map.set(formatId, {
              ...cur,
              format_stats: { total_matches: 0, total_players: 0, last_played_at: null }
            })
          } else {
            map.set(formatId, {
              ...cur,
              format_stats: {
                total_matches: payload.new.total_matches,
                total_players: payload.new.total_players,
                last_played_at: payload.new.last_played_at
              }
            })
          }
          return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(chStats) }
  }, [])

  // ────────────────────────────────────────────────────────────
  async function handleAdd(e) {
    e.preventDefault()
    const value = name.trim()
    if (!value) return
    setSaving(true)
    setError(null)

    const { data, error } = await supabase
      .from('games')
      .insert({ name: value })
      .select('id, name, created_at')
      .single()

    setSaving(false)
    if (error) return setError(error.message)

    setFormats(prev =>
      [...prev, { ...data, format_stats: { total_matches: 0, total_players: 0, last_played_at: null } }]
        .sort((a, b) => a.name.localeCompare(b.name))
    )
    setName('')
    setShowForm(false)
  }

  async function handleDelete(id) {
    if (!confirm('¿Borrar este formato?')) return
    setDeletingId(id)
    setError(null)
    const { error } = await supabase.from('games').delete().eq('id', id)
    setDeletingId(null)
    if (error) return setError(error.message)
    setFormats(prev => prev.filter(f => f.id !== id))
  }

  const isEmpty = useMemo(() => !loading && !error && formats.length === 0, [loading, error, formats])

  // ────────────────────────────────────────────────────────────
  return (
    <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        <PageHeader title="Formatos de Juego" description="Gestiona y consulta todos los formatos disponibles." />

        {/* Formulario de creación */}
        <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm">
          <Card.Header
            title="Añadir formato"
            subtitle="Ejemplo: Commander, Modern, Draft…"
            actions={
              <button onClick={() => setShowForm(v => !v)} className="btn-outline">
                {showForm ? 'Cancelar' : 'Nuevo formato'}
              </button>
            }
          />
          {showForm && (
            <Card.Section className="p-5">
              {error && <Card className="mb-4 text-red-700 bg-red-50 border-red-200"><p className="text-sm">{error}</p></Card>}
              <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium block mb-1.5">Nombre del formato</label>
                  <input
                    className="input w-full"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Commander, Modern, Draft…"
                  />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="btn-primary" disabled={saving || !name.trim()}>
                    {saving ? 'Guardando…' : 'Guardar'}
                  </button>
                </div>
              </form>
            </Card.Section>
          )}
        </Card>

        {/* Listado */}
        <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm">
          <Card.Header title="Formatos registrados" subtitle="Haz clic en un formato para editarlo." />
          {loading ? (
            <Card.Section className="p-5 space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </Card.Section>
          ) : error && !showForm ? (
            <Card.Section className="p-5">
              <Card className="text-red-700 bg-red-50 border-red-200">
                <p className="text-sm">{error}</p>
              </Card>
            </Card.Section>
          ) : isEmpty ? (
            <Card.Section className="p-5 text-sm text-gray-600">Aún no hay formatos.</Card.Section>
          ) : (
            <ul className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {formats.map(f => {
                const s = f.format_stats
                return (
                  <li key={f.id} className="group">
                    <div className="rounded-xl border border-gray-200 p-4 shadow-sm transition group-hover:border-amber-400">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link href={`/formats/${f.id}`} className="block truncate font-medium text-gray-900 hover:underline">
                            {f.name}
                          </Link>
                          <div className="mt-1 text-xs text-gray-600">
                            <span className="mr-3">{s.total_matches} partidas</span>
                            <span className="mr-3">{s.total_players} jugadores</span>
                            <span>Última: {s.last_played_at ? new Date(s.last_played_at).toLocaleString() : '—'}</span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-gray-400">
                            Creado: {new Date(f.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/formats/${f.id}`} className="btn-outline text-xs py-1 px-2">
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(f.id)}
                            disabled={deletingId === f.id}
                            className="btn-outline text-xs py-1 px-2 disabled:opacity-50"
                          >
                            {deletingId === f.id ? 'Borrando…' : 'Borrar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </section>
  )
}
