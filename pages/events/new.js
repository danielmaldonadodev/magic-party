import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import Card from '../../components/Card'

/* ===============================================================
  THEME SYSTEM - IDÉNTICO A MATCHES/NEW
  =============================================================== */
const MTG_PROFESSIONAL_THEMES = [
  {
    key: 'mono-white',
    label: 'Plains',
    icon: '⚪️',
    colors: {
      primary: 'from-amber-400 to-yellow-500',
      secondary: 'from-amber-100 to-yellow-200',
      accent: 'bg-amber-500',
      bgSoft: 'bg-amber-50/80',
      ring: 'ring-amber-300',
      glowColor: 'rgba(245, 158, 11, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600',
    backgroundGradient: 'from-amber-50 via-yellow-50 to-amber-100',
    text: { strong: 'text-amber-900', soft: 'text-amber-700', white: 'text-white' },
    border: 'border-amber-300',
    shadow: 'shadow-amber-500/25',
    fact: 'Orden y protección. La fuerza del colectivo supera al individuo.',
  },
  {
    key: 'mono-blue',
    label: 'Island',
    icon: '🔵',
    colors: {
      primary: 'from-blue-500 to-indigo-600',
      secondary: 'from-blue-100 to-indigo-200',
      accent: 'bg-blue-600',
      bgSoft: 'bg-blue-50/80',
      ring: 'ring-blue-300',
      glowColor: 'rgba(59, 130, 246, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-blue-600 via-indigo-500 to-blue-700',
    backgroundGradient: 'from-blue-50 via-indigo-50 to-blue-100',
    text: { strong: 'text-blue-900', soft: 'text-blue-700', white: 'text-white' },
    border: 'border-blue-300',
    shadow: 'shadow-blue-500/25',
    fact: 'Conocimiento es poder. La paciencia define al maestro.',
  },
  {
    key: 'mono-black',
    label: 'Swamp',
    icon: '⚫️',
    colors: {
      primary: 'from-gray-700 to-gray-900',
      secondary: 'from-gray-200 to-gray-400',
      accent: 'bg-gray-800',
      bgSoft: 'bg-gray-50/80',
      ring: 'ring-gray-400',
      glowColor: 'rgba(107, 114, 128, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900',
    backgroundGradient: 'from-gray-50 via-gray-100 to-gray-200',
    text: { strong: 'text-gray-900', soft: 'text-gray-700', white: 'text-white' },
    border: 'border-gray-400',
    shadow: 'shadow-gray-500/25',
    fact: 'El poder tiene un precio. La ambición no conoce límites.',
  },
  {
    key: 'mono-red',
    label: 'Mountain',
    icon: '🔴',
    colors: {
      primary: 'from-red-500 to-rose-600',
      secondary: 'from-red-100 to-rose-200',
      accent: 'bg-red-600',
      bgSoft: 'bg-red-50/80',
      ring: 'ring-red-300',
      glowColor: 'rgba(239, 68, 68, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-red-600 via-rose-500 to-red-700',
    backgroundGradient: 'from-red-50 via-rose-50 to-red-100',
    text: { strong: 'text-red-900', soft: 'text-red-700', white: 'text-white' },
    border: 'border-red-300',
    shadow: 'shadow-red-500/25',
    fact: 'La velocidad es vida. Actúa primero, piensa después.',
  },
  {
    key: 'mono-green',
    label: 'Forest',
    icon: '🟢',
    colors: {
      primary: 'from-green-500 to-emerald-600',
      secondary: 'from-green-100 to-emerald-200',
      accent: 'bg-green-600',
      bgSoft: 'bg-green-50/80',
      ring: 'ring-green-300',
      glowColor: 'rgba(34, 197, 94, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-green-600 via-emerald-500 to-green-700',
    backgroundGradient: 'from-green-50 via-emerald-50 to-green-100',
    text: { strong: 'text-green-900', soft: 'text-green-700', white: 'text-white' },
    border: 'border-green-300',
    shadow: 'shadow-green-500/25',
    fact: 'La naturaleza es fuerza bruta. El crecimiento es inevitable.',
  },
  {
    key: 'azorius',
    label: 'Azorius',
    icon: '⚪️🔵',
    colors: {
      primary: 'from-blue-400 to-indigo-500',
      secondary: 'from-blue-100 to-indigo-200',
      accent: 'bg-blue-500',
      bgSoft: 'bg-blue-50/80',
      ring: 'ring-blue-300',
      glowColor: 'rgba(99, 102, 241, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-blue-500 via-indigo-400 to-blue-600',
    backgroundGradient: 'from-blue-50 via-indigo-50 to-blue-100',
    text: { strong: 'text-blue-900', soft: 'text-blue-700', white: 'text-white' },
    border: 'border-blue-300',
    shadow: 'shadow-blue-500/25',
    fact: 'Ley y orden. El control perfecto define la victoria.',
  },
  {
    key: 'golgari',
    label: 'Golgari',
    icon: '⚫️🟢',
    colors: {
      primary: 'from-green-600 to-gray-700',
      secondary: 'from-green-100 to-gray-300',
      accent: 'bg-green-700',
      bgSoft: 'bg-green-50/80',
      ring: 'ring-green-400',
      glowColor: 'rgba(21, 128, 61, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-green-600 via-gray-600 to-green-800',
    backgroundGradient: 'from-green-50 via-gray-50 to-green-100',
    text: { strong: 'text-green-900', soft: 'text-green-700', white: 'text-white' },
    border: 'border-green-400',
    shadow: 'shadow-green-500/25',
    fact: 'Vida y muerte son parte del ciclo. El cementerio es recurso.',
  },
  {
    key: 'izzet',
    label: 'Izzet',
    icon: '🔵🔴',
    colors: {
      primary: 'from-blue-500 to-red-500',
      secondary: 'from-blue-100 to-red-200',
      accent: 'bg-purple-600',
      bgSoft: 'bg-purple-50/80',
      ring: 'ring-purple-300',
      glowColor: 'rgba(147, 51, 234, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-blue-500 via-purple-500 to-red-500',
    backgroundGradient: 'from-blue-50 via-purple-50 to-red-50',
    text: { strong: 'text-purple-900', soft: 'text-purple-700', white: 'text-white' },
    border: 'border-purple-300',
    shadow: 'shadow-purple-500/25',
    fact: 'Genio y locura van de la mano. La experimentación no tiene límites.',
  },
]
const DEFAULT_THEME_KEY = 'azorius'

/* ===============================================================
  CSS - IDÉNTICO
  =============================================================== */
const professionalCSS = `
  @keyframes professionalFadeIn {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes pulseSuccess { 0%,100%{background-color:rgb(34,197,94)} 50%{background-color:rgb(22,163,74)} }
  .professional-glass { background:rgba(255,255,255,0.25); backdrop-filter:blur(20px) saturate(180%); border:1px solid rgba(255,255,255,0.3); box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); }
  .crystal-card { position:relative; overflow:hidden; }
  .crystal-card::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent); transition:left .5s; z-index:1; }
  .crystal-card:hover::before { left:100%; }
  .animate-professional-fade-in { animation: professionalFadeIn .8s cubic-bezier(.25,.46,.45,.94) forwards; }
  .animate-pulse-success { animation: pulseSuccess 2s ease-in-out infinite; }
  .theme-transition { transition: all 2s cubic-bezier(.25,.46,.45,.94); }
  .form-step { opacity:0; transform:translateX(20px); animation: professionalFadeIn .6s ease-out forwards; }
  .form-step:nth-child(1){animation-delay:.1s} .form-step:nth-child(2){animation-delay:.2s} .form-step:nth-child(3){animation-delay:.3s}
`
if (typeof document !== 'undefined' && !document.getElementById('professional-new-event-styles')) {
  const style = document.createElement('style')
  style.id = 'professional-new-event-styles'
  style.textContent = professionalCSS
  document.head.appendChild(style)
}

/* ===============================================================
  HOOK THEME ROTATION
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
    } catch {}
  }, [])

  useEffect(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = setInterval(() => {
      setIndex(prev => {
        const next = (prev + 1) % MTG_PROFESSIONAL_THEMES.length
        const nextKey = MTG_PROFESSIONAL_THEMES[next].key
        setThemeKey(nextKey)
        try { localStorage.setItem('mp_professional_theme', nextKey) } catch {}
        return next
      })
    }, intervalMs)
    return () => timer.current && clearInterval(timer.current)
  }, [intervalMs])

  const theme = useMemo(() => {
    const found = MTG_PROFESSIONAL_THEMES.find(t => t.key === themeKey)
    return found || MTG_PROFESSIONAL_THEMES[0]
  }, [themeKey])

  return { theme }
}

/* ===============================================================
  UTILS
  =============================================================== */
function toDatetimeLocal(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function addHours(date, hours) {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}

/* ===============================================================
  UI COMPONENTS
  =============================================================== */
function ProfessionalHero({ theme, onCancel }) {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setLoaded(true) }, [])
  return (
    <section className="relative overflow-hidden py-12 sm:py-16">
      <div className="absolute inset-0 theme-transition" style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})`, '--glow-color': theme.colors.glowColor }}/>
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-white/20 to-transparent rounded-full blur-3xl"/>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl"/>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-6">
          <div className={`inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 rounded-full professional-glass ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <span className="text-lg sm:text-xl">{theme.icon}</span>
            <span className={`font-bold text-sm sm:text-base ${theme.text.strong}`}>{theme.label}</span>
          </div>
          <div className={`space-y-3 sm:space-y-4 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              <span className={`${theme.text.strong} block sm:inline`}>Nuevo</span>
              <span className="text-gray-900 block sm:inline sm:ml-3">Evento</span>
            </h1>
            <p className={`text-base sm:text-lg ${theme.text.soft} max-w-2xl mx-auto leading-relaxed font-medium px-4 sm:px-0`}>
              Organiza torneos épicos, reuniones casuales y experiencias únicas para tu comunidad.
            </p>
          </div>
          <div className={`${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <button onClick={onCancel} className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/80 backdrop-blur-sm font-semibold text-gray-800 border-2 border-gray-300 hover:border-gray-400 hover:bg-white transition-all duration-300 hover:scale-105">
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Volver a Eventos
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProgressIndicator({ currentStep, totalSteps, theme }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <span className={`text-sm font-medium ${theme.text.soft}`}>Progreso del formulario</span>
        <span className={`text-sm font-bold ${theme.text.strong}`}>{currentStep} de {totalSteps}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${theme.colors.primary} transition-all duration-700 ease-out rounded-full`} style={{ width: `${(currentStep / totalSteps) * 100}%` }}/>
      </div>
    </div>
  )
}

function ProfessionalAlert({ type = 'error', title, message, onDismiss }) {
  const styles = {
    error: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', title: 'text-red-800', text: 'text-red-700' },
    success: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', title: 'text-green-800', text: 'text-green-700' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', title: 'text-amber-800', text: 'text-amber-700' }
  }
  const style = styles[type] || styles.error
  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-4 mb-6 animate-professional-fade-in`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${style.icon}`}>
          {type === 'error' && (<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>)}
          {type === 'success' && (<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>)}
          {type === 'warning' && (<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.17 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>)}
        </div>
        <div className="flex-1">
          <h4 className={`font-bold ${style.title}`}>{title}</h4>
          <p className={`text-sm ${style.text} mt-1`}>{message}</p>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className={`flex-shrink-0 ${style.icon} hover:opacity-75 transition-opacity`}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ icon, title, subtitle, action, theme }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${theme.gradient} flex items-center justify-center text-white shadow-lg`}>{icon}</div>
        <div>
          <h2 className={`text-xl font-bold ${theme.text.strong}`}>{title}</h2>
          <p className={`text-sm ${theme.text.soft} mt-1`}>{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  )
}

/* ===============================================================
  MAIN COMPONENT
  =============================================================== */
export default function NewEventPage() {
  const router = useRouter()
  const { theme } = useThemeRotation(40000)

  // Data
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    game_id: '',
    starts_at: '',
    ends_at: '',
    location: '',
    capacity: '',
    visibility: 'public'
  })

  // Feedback
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Progress calculation
  const currentStep = useMemo(() => {
    let step = 0
    if (form.title && form.starts_at && form.ends_at) step++
    if (form.game_id) step++
    if (form.location) step++
    return step
  }, [form])
  const totalSteps = 3

  // Load initial data
  useEffect(() => {
    let mounted = true
    const loadBase = async () => {
      const { data: gData } = await supabase
        .from('games')
        .select('id, name')
        .order('name', { ascending: true })
      
      if (!mounted) return
      
      if (gData?.length) {
        setGames(gData)
        setForm(f => ({ ...f, game_id: f.game_id || gData[0].id }))
      }

      // Defaults: evento empezando en 2 horas, durando 4 horas
      const now = new Date()
      const defaultStart = addHours(now, 2)
      const defaultEnd = addHours(defaultStart, 4)
      
      setForm(f => ({ 
        ...f, 
        starts_at: f.starts_at || toDatetimeLocal(defaultStart),
        ends_at: f.ends_at || toDatetimeLocal(defaultEnd)
      }))

      setLoading(false)
    }
    loadBase()
    return () => { mounted = false }
  }, [])

  // Auto-update end time when start time changes
  useEffect(() => {
    if (form.starts_at && !form.ends_at) {
      const startDate = new Date(form.starts_at)
      const endDate = addHours(startDate, 4) // Default 4 hours duration
      setForm(f => ({ ...f, ends_at: toDatetimeLocal(endDate) }))
    }
  }, [form.starts_at, form.ends_at])

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    
    // Auto-update end time when start time changes
    if (name === 'starts_at' && value) {
      const startDate = new Date(value)
      const currentEndDate = form.ends_at ? new Date(form.ends_at) : null
      
      // Only update end time if it's before start time or not set
      if (!currentEndDate || currentEndDate <= startDate) {
        const newEndDate = addHours(startDate, 4)
        setForm(f => ({ ...f, ends_at: toDatetimeLocal(newEndDate) }))
      }
    }
  }

const handleSubmit = async (e) => {
  e.preventDefault()
  setError(null)
  setSubmitting(true)

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('No estás autenticado.')
      return
    }

    // Validations (igual que antes) ...
    if (!form.title.trim()) { setError('El título es obligatorio.'); return }
    if (!form.starts_at || !form.ends_at) { setError('Las fechas de inicio y fin son obligatorias.'); return }

    const startDate = new Date(form.starts_at)
    const endDate = new Date(form.ends_at)
    if (endDate <= startDate) { setError('La fecha de fin debe ser posterior a la de inicio.'); return }
    if (startDate < new Date()) { setError('La fecha de inicio no puede ser en el pasado.'); return }
    if (!form.location.trim()) { setError('La ubicación es obligatoria.'); return }

    // 1) Genera un id en cliente (compatible navegador/node)
    const newId =
      (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

    // 2) Payload con id propio (Postgres aceptará el tuyo aunque tenga DEFAULT)
    const eventData = {
      id: newId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      game_id: form.game_id || null,
      starts_at: startDate.toISOString(),
      ends_at: endDate.toISOString(),
      location: form.location.trim(),
      capacity: form.capacity ? parseInt(form.capacity) : null,
      visibility: form.visibility,
      status: 'scheduled',
      created_by: session.user.id,
    }

    // 3) Insert SIN RETURNING (evita SELECT y por tanto la policy SELECT)
    const { error: createError } = await supabase
      .from('events')
      .insert([eventData], { returning: 'minimal' }) // ← clave
      // NO encadenes .select() ni .single()

    if (createError) throw createError

    setSuccess('¡Evento creado exitosamente!')
    // Redirige con el id que generaste
    setTimeout(() => {
      router.push(`/events/${newId}`)
    }, 800)

  } catch (err) {
    console.error('Error creating event:', err)
    setError(err.message || 'Error inesperado al crear el evento.')
  } finally {
    setSubmitting(false)
  }
}

  const handleCancel = () => router.push('/events')

  if (loading) {
    return (
      <div className="min-h-screen theme-transition" style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})`, '--glow-color': theme.colors.glowColor }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center mx-auto shadow-lg">
              <svg className="w-8 h-8 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <p className={`text-lg font-medium ${theme.text.strong}`}>Preparando el organizador…</p>
            <p className={`text-sm ${theme.text.soft}`}>Cargando formatos disponibles</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen theme-transition pb-24" style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})` }}>
      <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl pointer-events-none"/>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl pointer-events-none"/>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <ProfessionalHero theme={theme} onCancel={handleCancel} />

        <div className="crystal-card">
          <Card className="relative overflow-hidden bg-white/95 backdrop-blur-lg border border-gray-200/50 shadow-2xl" padding="none">
            <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`}/>
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} theme={theme} />

              {error && <ProfessionalAlert type="error" title="Error" message={error} onDismiss={() => setError(null)} />}
              {success && <ProfessionalAlert type="success" title="¡Éxito!" message={success} onDismiss={() => setSuccess(null)} />}

              {/* Step 1: Información básica */}
              <section className="form-step">
                <SectionHeader
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
                  title="Información del Evento"
                  subtitle="Define los detalles básicos de tu evento"
                  theme={theme}
                />
                
                <div className="space-y-6">
                  {/* Título */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">📝 Título del Evento</label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      placeholder="ej. Torneo Commander de Viernes"
                      className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all duration-200"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">📄 Descripción (Opcional)</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe tu evento: reglas especiales, premios, nivel de competitividad..."
                      className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all duration-200 resize-none"
                    />
                  </div>

                  {/* Fechas */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700">🕐 Fecha y Hora de Inicio</label>
                      <input
                        type="datetime-local"
                        name="starts_at"
                        value={form.starts_at}
                        onChange={handleChange}
                        required
                        className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700">🕕 Fecha y Hora de Fin</label>
                      <input
                        type="datetime-local"
                        name="ends_at"
                        value={form.ends_at}
                        onChange={handleChange}
                        required
                        className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Step 2: Formato */}
              <section className="form-step">
                <SectionHeader
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>}
                  title="Formato y Configuración"
                  subtitle="Elige el formato y ajusta la configuración del evento"
                  theme={theme}
                />
                
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Formato */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">🎯 Formato de Juego</label>
                    <div className="relative">
                      <select
                        name="game_id"
                        value={form.game_id}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all duration-200 appearance-none"
                      >
                        <option value="">Sin formato específico</option>
                        {games.map((g) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* Capacidad */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">👥 Capacidad Máxima</label>
                    <input
                      type="number"
                      name="capacity"
                      value={form.capacity}
                      onChange={handleChange}
                      min="1"
                      max="100"
                      placeholder="Opcional (sin límite)"
                      className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500">Deja vacío para eventos sin límite de participantes</p>
                  </div>
                </div>

                {/* Visibilidad */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700">🔍 Visibilidad del Evento</label>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="group relative flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200">
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        checked={form.visibility === 'public'}
                        onChange={handleChange}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌍</span>
                        <div>
                          <span className="text-sm font-bold text-gray-700">Público</span>
                          <p className="text-xs text-gray-500">Visible para todos</p>
                        </div>
                      </div>
                    </label>
                    
                    <label className="group relative flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200">
                      <input
                        type="radio"
                        name="visibility"
                        value="unlisted"
                        checked={form.visibility === 'unlisted'}
                        onChange={handleChange}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔗</span>
                        <div>
                          <span className="text-sm font-bold text-gray-700">No listado</span>
                          <p className="text-xs text-gray-500">Solo con enlace</p>
                        </div>
                      </div>
                    </label>
                    
                    <label className="group relative flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200">
                      <input
                        type="radio"
                        name="visibility"
                        value="private"
                        checked={form.visibility === 'private'}
                        onChange={handleChange}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔒</span>
                        <div>
                          <span className="text-sm font-bold text-gray-700">Privado</span>
                          <p className="text-xs text-gray-500">Solo invitados</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </section>

              {/* Step 3: Ubicación */}
              <section className="form-step">
                <SectionHeader
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
                  title="Ubicación del Evento"
                  subtitle="¿Dónde se celebrará la batalla?"
                  theme={theme}
                />
                
                <div className="space-y-6">
                  {/* Ubicación */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">📍 Ubicación</label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      required
                      placeholder="ej. Casa de Juan, Tienda Local Magic, SpellTable, Magic Arena..."
                      className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all duration-200"
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, location: 'SpellTable (webcam)' }))}
                        className="p-2 rounded border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                      >
                        💻 SpellTable
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, location: 'Magic Arena' }))}
                        className="p-2 rounded border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                      >
                        🎮 Arena
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, location: 'Casa de [Anfitrión]' }))}
                        className="p-2 rounded border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                      >
                        🏠 Casa
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, location: 'Tienda local' }))}
                        className="p-2 rounded border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                      >
                        🏪 Tienda
                      </button>
                    </div>
                  </div>

                  {/* Resumen del evento */}
                  <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-6">
                    <h3 className={`text-lg font-bold ${theme.text.strong} mb-4`}>📋 Resumen del Evento</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">Título:</span>
                        <span className="font-medium">{form.title || '—'}</span>
                      </div>
                      {form.description && (
                        <div className="flex items-start gap-3">
                          <span className="text-gray-500 flex-shrink-0">Descripción:</span>
                          <span className="font-medium">{form.description}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">Formato:</span>
                        <span className="font-medium">
                          {form.game_id ? games.find(g => g.id === form.game_id)?.name : 'Sin formato específico'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">Inicio:</span>
                        <span className="font-medium">
                          {form.starts_at ? new Date(form.starts_at).toLocaleString('es-ES') : '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">Fin:</span>
                        <span className="font-medium">
                          {form.ends_at ? new Date(form.ends_at).toLocaleString('es-ES') : '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">Ubicación:</span>
                        <span className="font-medium">{form.location || '—'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">Capacidad:</span>
                        <span className="font-medium">{form.capacity ? `${form.capacity} participantes` : 'Sin límite'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">Visibilidad:</span>
                        <span className="font-medium">
                          {form.visibility === 'public' && '🌍 Público'}
                          {form.visibility === 'unlisted' && '🔗 No listado'}
                          {form.visibility === 'private' && '🔒 Privado'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Actions */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                <div className="text-sm text-gray-500">Progreso: {currentStep}/{totalSteps} secciones completadas</div>
                <div className="flex items-center gap-4">
                  <button 
                    type="button" 
                    onClick={handleCancel} 
                    disabled={submitting} 
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all duration-200 disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || currentStep < totalSteps}
                    className={`inline-flex items-center gap-2 rounded-lg px-8 py-3 text-sm font-bold shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                      currentStep >= totalSteps ? `${theme.gradient} text-white hover:shadow-xl hover:scale-105 ${theme.colors.ring}` : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Creando evento...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        {currentStep >= totalSteps ? 'Crear Evento' : `Completa ${totalSteps - currentStep} sección${totalSteps - currentStep !== 1 ? 'es' : ''} más`}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </Card>
        </div>

        <footer className="py-8 text-center">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <span className={`text-sm font-medium ${theme.text.soft}`}>Tema actual:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full shadow-lg" style={{ background: `linear-gradient(45deg, ${theme.colors.primary})` }}/>
                <span className={`font-bold ${theme.text.strong}`}>{theme.label}</span>
              </div>
            </div>
            <p className={`text-xs ${theme.text.soft} opacity-75`}>El tema cambia automáticamente cada 40 segundos</p>
          </div>
        </footer>
      </div>
    </div>
  )
}