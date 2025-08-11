// pages/formats/index.js
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import SkeletonCard from '../../components/SkeletonCard'

/* ===============================================================
   TEMAS MTG (mismo estilo que Home) + rotación
   =============================================================== */
const MTG_PROFESSIONAL_THEMES = [
  {
    key: 'azorius',
    label: 'Azorius',
    icon: '⚪️🔵',
    colors: { primary: 'from-blue-500 to-indigo-600', ring: 'ring-blue-300', glowColor: 'rgba(99,102,241,0.35)' },
    gradient: 'bg-gradient-to-br from-blue-500 via-indigo-400 to-blue-600',
    backgroundGradient: 'from-blue-50 via-indigo-50 to-blue-100',
    text: { strong: 'text-blue-900', soft: 'text-blue-700', white: 'text-white' },
    border: 'border-blue-300',
  },
  {
    key: 'mardu',
    label: 'Mardu',
    icon: '⚪️⚫️🔴',
    colors: { primary: 'from-rose-500 to-amber-500', ring: 'ring-rose-300', glowColor: 'rgba(244,63,94,0.35)' },
    gradient: 'bg-gradient-to-br from-rose-600 via-amber-500 to-red-600',
    backgroundGradient: 'from-rose-50 via-amber-50 to-red-50',
    text: { strong: 'text-rose-900', soft: 'text-rose-700', white: 'text-white' },
    border: 'border-rose-300',
  },
  {
    key: 'simic',
    label: 'Simic',
    icon: '🔵🟢',
    colors: { primary: 'from-emerald-500 to-cyan-600', ring: 'ring-emerald-300', glowColor: 'rgba(16,185,129,0.35)' },
    gradient: 'bg-gradient-to-br from-emerald-500 via-cyan-500 to-teal-600',
    backgroundGradient: 'from-emerald-50 via-cyan-50 to-teal-50',
    text: { strong: 'text-emerald-900', soft: 'text-emerald-700', white: 'text-white' },
    border: 'border-emerald-300',
  },
]
const DEFAULT_THEME_KEY = 'azorius'

function useThemeRotation(intervalMs = 40000) {
  const [themeKey, setThemeKey] = useState(DEFAULT_THEME_KEY)
  const [index, setIndex] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mp_professional_theme_formats')
      if (saved) {
        const idx = MTG_PROFESSIONAL_THEMES.findIndex(t => t.key === saved)
        if (idx >= 0) { setThemeKey(saved); setIndex(idx) }
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = setInterval(() => {
      setIndex(prev => {
        const next = (prev + 1) % MTG_PROFESSIONAL_THEMES.length
        const nextKey = MTG_PROFESSIONAL_THEMES[next].key
        setThemeKey(nextKey)
        try { localStorage.setItem('mp_professional_theme_formats', nextKey) } catch {}
        return next
      })
    }, intervalMs)
    return () => timer.current && clearInterval(timer.current)
  }, [intervalMs])

  const theme = MTG_PROFESSIONAL_THEMES.find(t => t.key === themeKey) || MTG_PROFESSIONAL_THEMES[0]
  return { theme, index }
}

/* ===============================================================
   CSS “pro” (mismas utilidades que Home)
   =============================================================== */
const professionalCSS = `
@keyframes professionalFadeIn { from {opacity:0; transform: translateY(12px)} to {opacity:1; transform:none} }
@keyframes floatSubtle { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
.professional-glass { background: rgba(255,255,255,0.6); backdrop-filter: blur(14px) saturate(160%); border: 1px solid rgba(255,255,255,0.6); }
.animate-professional-fade-in { animation: professionalFadeIn .6s ease-out both; }
.animate-float-subtle { animation: floatSubtle 6s ease-in-out infinite; }
`
if (typeof document !== 'undefined' && !document.getElementById('professional-formats-styles')) {
  const style = document.createElement('style')
  style.id = 'professional-formats-styles'
  style.textContent = professionalCSS
  document.head.appendChild(style)
}

/* ===============================================================
   Página
   =============================================================== */
export default function FormatsPage() {
  const { theme, index: themeIndex } = useThemeRotation(40000)

  const [formats, setFormats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Crear / borrar
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
          format_stats: g.format_stats ?? { total_matches: 0, total_players: 0, last_played_at: null }
        }))
        setFormats(normalized)
      }
      setLoading(false)
    }
    load()
    return () => { ignore = true }
  }, [])

  // Realtime: games
  useEffect(() => {
    const chGames = supabase
      .channel('realtime-games')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, payload => {
        setFormats(prev => {
          const map = new Map(prev.map(f => [f.id, f]))
          if (payload.eventType === 'INSERT') {
            map.set(payload.new.id, { ...payload.new, format_stats: { total_matches: 0, total_players: 0, last_played_at: null } })
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

  // Realtime: format_stats
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
            map.set(formatId, { ...cur, format_stats: { total_matches: 0, total_players: 0, last_played_at: null } })
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

  /* =============================================================
     UI
     ============================================================= */
  return (
    <div
      className="min-h-screen"
      style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})` }}
    >
      {/* halos */}
      <div className="fixed top-0 left-0 w-80 h-80 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <section className="py-10 px-5">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Cabecera con chip del tema */}
          <div className="flex items-center justify-between">
            <PageHeader
              title="Formatos de Juego"
              description="Gestiona y consulta todos los formatos disponibles."
            />
            <div className="hidden sm:flex items-center gap-2 professional-glass px-3 py-2 rounded-full animate-professional-fade-in"
                 style={{ ['--glow-color']: theme.colors.glowColor }}>
              <span className="text-lg">{theme.icon}</span>
              <span className={`text-sm font-semibold ${theme.text.soft}`}>{theme.label}</span>
            </div>
          </div>

          {/* Formulario crear formato */}
          <div className="crystal-card animate-professional-fade-in">
            <Card className="overflow-hidden professional-glass border border-white/60 shadow-xl">
              <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`} />
              <Card.Header
                title={<span className={`${theme.text.strong}`}>Añadir formato</span>}
                subtitle={<span className={`${theme.text.soft}`}>Ejemplo: Commander, Modern, Draft…</span>}
                actions={
                  <button
                    onClick={() => setShowForm(v => !v)}
                    className={`px-4 py-2 rounded-lg border font-semibold transition hover:scale-[1.02] bg-white/70 border-white ${theme.text.strong}`}
                  >
                    {showForm ? 'Cancelar' : 'Nuevo formato'}
                  </button>
                }
              />
              {showForm && (
                <Card.Section className="p-5">
                  {error && (
                    <Card className="mb-4 text-red-700 bg-red-50 border-red-200">
                      <p className="text-sm">{error}</p>
                    </Card>
                  )}
                  <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className={`text-sm font-medium block mb-1.5 ${theme.text.soft}`}>Nombre del formato</label>
                      <input
                        className="input w-full bg-white/80 border border-gray-200 rounded-lg px-3 py-2"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Commander, Modern, Draft…"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className={`px-5 py-2 rounded-lg text-white font-bold shadow-lg transition hover:scale-[1.02] bg-gradient-to-r ${theme.colors.primary}`}
                        disabled={saving || !name.trim()}
                      >
                        {saving ? 'Guardando…' : 'Guardar'}
                      </button>
                    </div>
                  </form>
                </Card.Section>
              )}
            </Card>
          </div>

          {/* Listado */}
          <div className="crystal-card animate-professional-fade-in" style={{ animationDelay: '120ms' }}>
            <Card className="overflow-hidden professional-glass border border-white/60 shadow-xl">
              <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`} />
              <Card.Header
                title={<span className={`${theme.text.strong}`}>Formatos registrados</span>}
                subtitle={<span className={`${theme.text.soft}`}>Haz clic en un formato para editarlo.</span>}
              />
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
                <Card.Section className="p-10 text-center">
                  <div className="mx-auto w-20 h-20 rounded-2xl bg-white/70 border border-white animate-float-subtle flex items-center justify-center shadow-lg">
                    <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className={`mt-4 ${theme.text.soft}`}>Aún no hay formatos.</p>
                </Card.Section>
              ) : (
                <ul className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
                  {formats.map(f => {
                    const s = f.format_stats
                    return (
                      <li key={f.id} className="group">
                        <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/70 backdrop-blur-md shadow-lg transition hover:shadow-xl hover:scale-[1.01]">
                          {/* acento superior */}
                          <div className={`h-1.5 bg-gradient-to-r ${theme.colors.primary}`} />
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <Link
                                  href={`/formats/${f.id}`}
                                  className={`block truncate font-bold text-lg hover:underline ${theme.text.strong}`}
                                >
                                  {f.name}
                                </Link>

                                {/* chips de stats */}
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <span className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> {s.total_matches} partidas
                                  </span>
                                  <span className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> {s.total_players} jugadores
                                  </span>
                                  <span className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Última: {s.last_played_at ? new Date(s.last_played_at).toLocaleString() : '—'}
                                  </span>
                                </div>

                                <div className="mt-2 text-[11px] text-gray-500">
                                  Creado: {new Date(f.created_at).toLocaleString()}
                                </div>
                              </div>

                              {/* acciones */}
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/formats/${f.id}`}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/80 border border-gray-200 hover:bg-white transition"
                                >
                                  Editar
                                </Link>
                                <button
                                  onClick={() => handleDelete(f.id)}
                                  disabled={deletingId === f.id}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/80 border border-gray-200 hover:bg-white transition disabled:opacity-60"
                                >
                                  {deletingId === f.id ? 'Borrando…' : 'Borrar'}
                                </button>
                              </div>
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

          {/* Indicador de tema (footer) */}
          <footer className="pt-6 pb-2 text-center">
            <div className="flex items-center justify-center gap-2">
              {MTG_PROFESSIONAL_THEMES.map((t, i) => (
                <div
                  key={t.key}
                  className={`h-2 rounded-full transition-all ${i === themeIndex ? 'w-8 opacity-100' : 'w-2 opacity-40'}`}
                  style={{ background: `linear-gradient(45deg, ${t.colors.primary.replace('from-','').replace('to-','')})` }}
                />
              ))}
            </div>
            <p className={`mt-2 text-xs ${theme.text.soft} opacity-70`}>El tema cambia cada 40s</p>
          </footer>
        </div>
      </section>
    </div>
  )
}
