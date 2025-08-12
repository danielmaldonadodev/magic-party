// pages/formats/[id].js
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

import Card from '../../components/Card'
import SkeletonCard from '../../components/SkeletonCard'

/* ===============================================================
   SISTEMA DE TEMAS MTG (idéntico a pages/formats/index.js)
   =============================================================== */
const MTG_PROFESSIONAL_THEMES = [
  { key: 'mono-white', label: 'Plains', icon: '⚪️',
    colors: { primary: 'from-amber-400 to-yellow-500', secondary: 'from-amber-100 to-yellow-200', accent: 'bg-amber-500', bgSoft: 'bg-amber-50/80', ring: 'ring-amber-300', glowColor: 'rgba(245, 158, 11, 0.4)' },
    gradient: 'bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600',
    backgroundGradient: 'from-amber-50 via-yellow-50 to-amber-100',
    text: { strong: 'text-amber-900', soft: 'text-amber-700', white: 'text-white' },
    border: 'border-amber-300', shadow: 'shadow-amber-500/25',
    fact: 'Orden y protección. La fuerza del colectivo supera al individuo.' },
  { key: 'mono-blue', label: 'Island', icon: '🔵',
    colors: { primary: 'from-blue-500 to-indigo-600', secondary: 'from-blue-100 to-indigo-200', accent: 'bg-blue-600', bgSoft: 'bg-blue-50/80', ring: 'ring-blue-300', glowColor: 'rgba(59, 130, 246, 0.4)' },
    gradient: 'bg-gradient-to-br from-blue-600 via-indigo-500 to-blue-700',
    backgroundGradient: 'from-blue-50 via-indigo-50 to-blue-100',
    text: { strong: 'text-blue-900', soft: 'text-blue-700', white: 'text-white' },
    border: 'border-blue-300', shadow: 'shadow-blue-500/25',
    fact: 'Conocimiento es poder. La paciencia define al maestro.' },
  { key: 'mono-black', label: 'Swamp', icon: '⚫️',
    colors: { primary: 'from-gray-700 to-gray-900', secondary: 'from-gray-200 to-gray-400', accent: 'bg-gray-800', bgSoft: 'bg-gray-50/80', ring: 'ring-gray-400', glowColor: 'rgba(107, 114, 128, 0.4)' },
    gradient: 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900',
    backgroundGradient: 'from-gray-50 via-gray-100 to-gray-200',
    text: { strong: 'text-gray-900', soft: 'text-gray-700', white: 'text-white' },
    border: 'border-gray-400', shadow: 'shadow-gray-500/25',
    fact: 'El poder tiene un precio. La ambición no conoce límites.' },
  { key: 'mono-red', label: 'Mountain', icon: '🔴',
    colors: { primary: 'from-red-500 to-rose-600', secondary: 'from-red-100 to-rose-200', accent: 'bg-red-600', bgSoft: 'bg-red-50/80', ring: 'ring-red-300', glowColor: 'rgba(239, 68, 68, 0.4)' },
    gradient: 'bg-gradient-to-br from-red-600 via-rose-500 to-red-700',
    backgroundGradient: 'from-red-50 via-rose-50 to-red-100',
    text: { strong: 'text-red-900', soft: 'text-red-700', white: 'text-white' },
    border: 'border-red-300', shadow: 'shadow-red-500/25',
    fact: 'La velocidad es vida. Actúa primero, piensa después.' },
  { key: 'mono-green', label: 'Forest', icon: '🟢',
    colors: { primary: 'from-green-500 to-emerald-600', secondary: 'from-green-100 to-emerald-200', accent: 'bg-green-600', bgSoft: 'bg-green-50/80', ring: 'ring-green-300', glowColor: 'rgba(34, 197, 94, 0.4)' },
    gradient: 'bg-gradient-to-br from-green-600 via-emerald-500 to-green-700',
    backgroundGradient: 'from-green-50 via-emerald-50 to-green-100',
    text: { strong: 'text-green-900', soft: 'text-green-700', white: 'text-white' },
    border: 'border-green-300', shadow: 'shadow-green-500/25',
    fact: 'La naturaleza es fuerza bruta. El crecimiento es inevitable.' },
  { key: 'azorius', label: 'Azorius', icon: '⚪️🔵',
    colors: { primary: 'from-blue-400 to-indigo-500', secondary: 'from-blue-100 to-indigo-200', accent: 'bg-blue-500', bgSoft: 'bg-blue-50/80', ring: 'ring-blue-300', glowColor: 'rgba(99, 102, 241, 0.4)' },
    gradient: 'bg-gradient-to-br from-blue-500 via-indigo-400 to-blue-600',
    backgroundGradient: 'from-blue-50 via-indigo-50 to-blue-100',
    text: { strong: 'text-blue-900', soft: 'text-blue-700', white: 'text-white' },
    border: 'border-blue-300', shadow: 'shadow-blue-500/25',
    fact: 'Ley y orden. El control perfecto define la victoria.' },
  { key: 'golgari', label: 'Golgari', icon: '⚫️🟢',
    colors: { primary: 'from-green-600 to-gray-700', secondary: 'from-green-100 to-gray-300', accent: 'bg-green-700', bgSoft: 'bg-green-50/80', ring: 'ring-green-400', glowColor: 'rgba(21, 128, 61, 0.4)' },
    gradient: 'bg-gradient-to-br from-green-600 via-gray-600 to-green-800',
    backgroundGradient: 'from-green-50 via-gray-50 to-green-100',
    text: { strong: 'text-green-900', soft: 'text-green-700', white: 'text-white' },
    border: 'border-green-400', shadow: 'shadow-green-500/25',
    fact: 'Vida y muerte son parte del ciclo. El cementerio es recurso.' },
  { key: 'izzet', label: 'Izzet', icon: '🔵🔴',
    colors: { primary: 'from-blue-500 to-red-500', secondary: 'from-blue-100 to-red-200', accent: 'bg-purple-600', bgSoft: 'bg-purple-50/80', ring: 'ring-purple-300', glowColor: 'rgba(147, 51, 234, 0.4)' },
    gradient: 'bg-gradient-to-br from-blue-500 via-purple-500 to-red-500',
    backgroundGradient: 'from-blue-50 via-purple-50 to-red-50',
    text: { strong: 'text-purple-900', soft: 'text-purple-700', white: 'text-white' },
    border: 'border-purple-300', shadow: 'shadow-purple-500/25',
    fact: 'Genio y locura van de la mano. La experimentación no tiene límites.' },
]
const DEFAULT_THEME_KEY = 'azorius'

/* ===============================================================
   CSS premium + inyección
   =============================================================== */
const professionalCSS = `
  @keyframes professionalFadeIn { from { opacity: 0; transform: translateY(20px) scale(0.98);} to { opacity: 1; transform: translateY(0) scale(1);} }
  .animate-professional-fade-in { animation: professionalFadeIn 0.6s ease-out forwards; }
  .professional-glass { background: rgba(255,255,255,0.25); backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
  .theme-transition { transition: all 0.6s cubic-bezier(0.25,0.46,0.45,0.94); }
`
if (typeof document !== 'undefined' && !document.getElementById('professional-formats-styles')) {
  const style = document.createElement('style')
  style.id = 'professional-formats-styles'
  style.textContent = professionalCSS
  document.head.appendChild(style)
}

/* ===============================================================
   Hook de rotación de tema (compartido con index/new)
   =============================================================== */
function useThemeRotation(intervalMs = 40000) {
  const [themeKey, setThemeKey] = useState(DEFAULT_THEME_KEY)
  const [index, setIndex] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mp_professional_theme')
      if (saved) {
        const idx = MTG_PROFESSIONAL_THEMES.findIndex(t => t.key === saved)
        if (idx >= 0) { setThemeKey(saved); setIndex(idx) }
      }
    } catch (e) {}
  }, [])

  useEffect(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = setInterval(() => {
      setIndex(prev => {
        const next = (prev + 1) % MTG_PROFESSIONAL_THEMES.length
        const nextKey = MTG_PROFESSIONAL_THEMES[next].key
        setThemeKey(nextKey)
        try { localStorage.setItem('mp_professional_theme', nextKey) } catch (e) {}
        return next
      })
    }, intervalMs)
    return () => timer.current && clearInterval(timer.current)
  }, [intervalMs])

  const theme = useMemo(() => MTG_PROFESSIONAL_THEMES.find(t => t.key === themeKey) || MTG_PROFESSIONAL_THEMES[0], [themeKey])
  return { theme, index, setIndex }
}

/* ===============================================================
   Hero de edición
   =============================================================== */
function ProfessionalHeroEdit({ theme }) {
  return (
    <section className="relative overflow-hidden py-10 sm:py-14">
      <div className={`absolute inset-0 theme-transition bg-gradient-to-br ${theme.backgroundGradient}`} style={{ '--glow-color': theme.colors.glowColor }} />
      <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-l from-white/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-5">
        <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-full professional-glass animate-professional-fade-in`}>
          <span className="text-xl">{theme.icon}</span>
          <span className={`font-bold ${theme.text.strong}`}>Editar Formato</span>
        </div>
        <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight animate-professional-fade-in ${theme.text.strong}`} style={{ animationDelay: '80ms' }}>
          Cambia el nombre del formato
        </h1>
        <p className={`max-w-2xl mx-auto text-base sm:text-lg ${theme.text.soft} animate-professional-fade-in`} style={{ animationDelay: '120ms' }}>
          Mantén tu catálogo limpio y consistente. Estos cambios afectan a cómo verás el formato en listas y estadísticas.
        </p>
        <div className="flex items-center justify-center gap-3 animate-professional-fade-in" style={{ animationDelay: '160ms' }}>
          <Link href="/formats" className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 border-2 border-gray-300 hover:bg-white hover:border-gray-400 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Volver a formatos
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ===============================================================
   Página principal
   =============================================================== */
export default function EditFormat() {
  const router = useRouter()
  const { id } = router.query
  const { theme } = useThemeRotation(40000)

  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    let ignore = false
    ;(async () => {
      setLoading(true); setError(null); setNotFound(false)
      const { data, error } = await supabase
        .from('games')
        .select('id, name')
        .eq('id', id)
        .single()

      if (ignore) return
      if (error) {
        // PGRST116 => no rows
        if (error.code === 'PGRST116' || error.details?.includes('Results contain 0 rows')) {
          setNotFound(true)
        } else {
          setError(error.message)
        }
      } else {
        setName(data?.name || '')
      }
      setLoading(false)
    })()
    return () => { ignore = true }
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    const value = name.trim()
    if (!value) return
    setSaving(true); setError(null)
    const { error } = await supabase.from('games').update({ name: value }).eq('id', id)
    setSaving(false)
    if (error) return setError(error.message)
    router.push('/formats')
  }

  async function handleDelete() {
    if (!confirm('¿Borrar este formato?')) return
    setDeleting(true); setError(null)
    const { error } = await supabase.from('games').delete().eq('id', id)
    setDeleting(false)
    if (error) return setError(error.message)
    router.push('/formats')
  }

  if (loading) {
    return (
      <div className={`min-h-screen theme-transition bg-gradient-to-br ${theme.backgroundGradient}`}>
        <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <SkeletonCard />
        </main>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className={`min-h-screen theme-transition bg-gradient-to-br ${theme.backgroundGradient}`}>
        <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <Card className="p-6 bg-white/90 backdrop-blur-sm border border-white/50">
            <p className="font-medium">Formato no encontrado</p>
            <p className="text-sm text-gray-600">Puede que se haya borrado o el enlace no sea correcto.</p>
            <div className="mt-4">
              <Link href="/formats" className="btn-outline">Volver a formatos</Link>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className={`min-h-screen theme-transition bg-gradient-to-br ${theme.backgroundGradient}`}>
      {/* Fondos decorativos */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <ProfessionalHeroEdit theme={theme} />

        {/* Errores */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 animate-professional-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Se ha producido un error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Card principal */}
        <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-white/50 shadow-lg animate-professional-fade-in" padding="none">
          <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`} />
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 grid gap-6 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor="format-name" className={`text-sm font-medium ${theme.text.strong}`}>Nombre del formato</label>
              <input
                id="format-name"
                className="input w-full mt-2"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Commander, Modern, Draft…"
                required
              />
              <p className={`text-xs mt-2 ${theme.text.soft} opacity-80`}>Se mostrará en listas, partidas y estadísticas.</p>
            </div>

            <div className="col-span-full sm:col-span-1 flex flex-col sm:flex-row sm:items-end sm:justify-end gap-2">
              <button
                type="submit"
                disabled={saving || !name.trim()} aria-busy={saving}
                className={`w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 ${theme.colors.ring} bg-gradient-to-r ${theme.colors.primary} min-h-[44px]`}
              >
                {saving ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Guardando…
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Guardar cambios
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl bg-white/80 border-2 border-gray-300 hover:bg-white hover:border-gray-400 transition font-semibold text-gray-800 disabled:opacity-50 min-h-[44px]"
              >
                {deleting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Borrando…
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Borrar
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>

        {/* Mobile action bar sticky */}
        <div className="sm:hidden fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 right-4 z-40">
          <div className="rounded-2xl bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 border border-gray-200 shadow-lg p-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="col-span-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border-2 border-gray-300 hover:border-gray-400 transition font-semibold text-gray-800 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Borrar
              </button>
              <button
                onClick={(e)=>{ e.preventDefault(); if(!saving && name.trim()){ handleSubmit(e) } }}
                disabled={saving || !name.trim()}
                className={`col-span-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-4 ${theme.colors.ring} bg-gradient-to-r ${theme.colors.primary}`}
              >
                {saving ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Guardando…
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Indicador de tema */}
        <footer className="py-10 text-center">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className={`text-sm font-medium ${theme.text.soft}`}>Tema actual:</span>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full shadow-lg bg-gradient-to-r ${theme.colors.primary}`} />
                <span className={`font-bold ${theme.text.strong}`}>{/* label dinámico no necesario aquí */}Activo</span>
              </div>
            </div>
            <p className={`text-xs ${theme.text.soft} opacity-75`}>Se sincroniza con la página de formatos.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
