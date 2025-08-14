// pages/formats/index.js
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import Card from '../../components/Card'

/* ===============================================================
   SISTEMA DE TEMAS MTG COMPLETO (Sincronizado con index.js)
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
    text: {
      strong: 'text-amber-900',
      soft: 'text-amber-700',
      white: 'text-white',
    },
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
    text: {
      strong: 'text-blue-900',
      soft: 'text-blue-700',
      white: 'text-white',
    },
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
    text: {
      strong: 'text-gray-900',
      soft: 'text-gray-700',
      white: 'text-white',
    },
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
    text: {
      strong: 'text-red-900',
      soft: 'text-red-700',
      white: 'text-white',
    },
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
    text: {
      strong: 'text-green-900',
      soft: 'text-green-700',
      white: 'text-white',
    },
    border: 'border-green-300',
    shadow: 'shadow-green-500/25',
    fact: 'La naturaleza es fuerza bruta. El crecimiento es inevitable.',
  },
  // Guilds
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
    text: {
      strong: 'text-blue-900',
      soft: 'text-blue-700',
      white: 'text-white',
    },
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
    text: {
      strong: 'text-green-900',
      soft: 'text-green-700',
      white: 'text-white',
    },
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
    text: {
      strong: 'text-purple-900',
      soft: 'text-purple-700',
      white: 'text-white',
    },
    border: 'border-purple-300',
    shadow: 'shadow-purple-500/25',
    fact: 'Genio y locura van de la mano. La experimentación no tiene límites.',
  },
]

const DEFAULT_THEME_KEY = 'azorius'

/* ===============================================================
   CSS PROFESIONAL CON EFECTOS PREMIUM (Idéntico al index.js)
   =============================================================== */
const professionalCSS = `
  @keyframes professionalFadeIn {
    from { 
      opacity: 0; 
      transform: translateY(20px) scale(0.98); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0) scale(1); 
    }
  }

  @keyframes crystalShine {
    0% { transform: translateX(-100%) rotate(45deg); }
    100% { transform: translateX(300%) rotate(45deg); }
  }

  @keyframes premiumGlow {
    0%, 100% { 
      box-shadow: 0 0 20px var(--glow-color), 
                  0 10px 40px rgba(0,0,0,0.1);
    }
    50% { 
      box-shadow: 0 0 40px var(--glow-color), 
                  0 20px 60px rgba(0,0,0,0.15);
    }
  }

  @keyframes floatSubtle {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }

  .professional-glass {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .crystal-card {
    position: relative;
    overflow: hidden;
  }

  .crystal-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transition: left 0.5s;
    z-index: 1;
  }

  .crystal-card:hover::before {
    left: 100%;
  }

  .animate-professional-fade-in {
    animation: professionalFadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  .animate-crystal-shine {
    animation: crystalShine 3s ease-in-out infinite;
  }

  .animate-premium-glow {
    animation: premiumGlow 4s ease-in-out infinite;
  }

  .animate-float-subtle {
    animation: floatSubtle 6s ease-in-out infinite;
  }

  .theme-transition {
    transition: all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
`

// Inyectar estilos
if (typeof document !== 'undefined' && !document.getElementById('professional-formats-styles')) {
  const style = document.createElement('style')
  style.id = 'professional-formats-styles'
  style.textContent = professionalCSS
  document.head.appendChild(style)
}

/* ===============================================================
   THEME ROTATION HOOK - SINCRONIZADO CON INDEX.JS
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
        if (idx >= 0) {
          setThemeKey(saved)
          setIndex(idx)
        }
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
        try { 
          localStorage.setItem('mp_professional_theme', nextKey) 
        } catch (e) {}
        return next
      })
    }, intervalMs)
    return () => timer.current && clearInterval(timer.current)
  }, [intervalMs])

  const theme = useMemo(() => {
    const found = MTG_PROFESSIONAL_THEMES.find(t => t.key === themeKey)
    return found || MTG_PROFESSIONAL_THEMES[0]
  }, [themeKey])

  return { theme, themeKey, setThemeKey, index, setIndex }
}

/* ===============================================================
   AUTH / ROLES: detectar si el usuario es admin
   =============================================================== */
  export function useAdminGuard() {
    const [session, setSession] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [authReady, setAuthReady] = useState(false)

    const computeIsAdmin = (user) => {
      if (!user) return false
      const meta = user.user_metadata || {}
      const app = user.app_metadata || {}
      // 3 vías para detectar admin:
      if (meta.role === 'admin') return true
      if (meta.is_admin === true) return true
      if (Array.isArray(app.roles) && app.roles.includes('admin')) return true
      if (app.is_admin === true) return true
      return false
    }

    useEffect(() => {
      let active = true

      // Obtener sesión actual
      ;(async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!active) return
        setSession(session)
        setIsAdmin(computeIsAdmin(session?.user))
        setAuthReady(true)
      })()

      // Escuchar cambios de sesión
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        setIsAdmin(computeIsAdmin(session?.user))
      })

      return () => {
        active = false
        listener?.subscription?.unsubscribe?.()
      }
    }, [])

    return { session, isAdmin, authReady }
  }

/* ===============================================================
   COMPONENTES PROFESIONALES
   =============================================================== */
function ProfessionalHero({ theme, isAdmin }) {
  const [loaded, setLoaded] = useState(false)
  
  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
      <div 
        className="absolute inset-0 theme-transition"
        style={{ 
          background: `linear-gradient(135deg, ${theme.backgroundGradient})`,
          '--glow-color': theme.colors.glowColor 
        }}
      />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-gradient-to-l from-white/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-6 sm:space-y-8">
          {/* Theme indicator */}
          <div 
            className={`inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 rounded-full professional-glass ${
              loaded ? 'animate-professional-fade-in' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.2s' }}
          >
            <span className="text-lg sm:text-xl lg:text-2xl">{theme.icon}</span>
            <span className={`font-bold text-sm sm:text-base lg:text-lg ${theme.text.strong}`}>
              {theme.label}
            </span>
          </div>

          {/* Main title */}
          <div 
            className={`space-y-3 sm:space-y-4 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.4s' }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
              <span className={`${theme.text.strong} block sm:inline`}>
                Formatos
              </span>
              <span className="text-gray-900 block sm:inline sm:ml-3 lg:ml-4">de Juego</span>
            </h1>
            
            <p className={`text-base sm:text-lg md:text-xl lg:text-2xl ${theme.text.soft} max-w-4xl mx-auto leading-relaxed font-medium px-4 sm:px-0`}>
              Gestiona y organiza todos los formatos de Magic disponibles en tu comunidad. 
              Commander, Modern, Draft y mucho más.
            </p>
            
            <div className={`mt-3 sm:mt-4 text-xs sm:text-sm ${theme.text.soft} opacity-80 px-4 sm:px-0`}>
              <span className="font-semibold">Filosofía actual: </span>
              <span className="block sm:inline mt-1 sm:mt-0">{theme.fact}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div 
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 sm:px-0 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.6s' }}
          >
            {isAdmin && (
              <Link
                href="/formats/new"
                className={`group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl ${theme.gradient} text-white font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 ${theme.colors.ring}`}
              >
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-3">
                  <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Formato
                </div>
              </Link>
            )}

            <Link
              href="/matches/new"
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-white/80 backdrop-blur-sm font-semibold text-gray-800 border-2 border-gray-300 hover:border-gray-400 hover:bg-white transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Nueva Partida
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProfessionalSection({ title, subtitle, children, index = 0, theme, rightAction }) {
  return (
    <section 
      className="space-y-8 animate-professional-fade-in"
      style={{ animationDelay: `${index * 200}ms` }}
    >
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="space-y-2">
          <h2 className={`text-3xl font-bold ${theme.text.strong}`}>{title}</h2>
          {subtitle && (
            <p className={`text-lg ${theme.text.soft} font-medium`}>{subtitle}</p>
          )}
        </div>
        {rightAction}
      </div>
      {children}
    </section>
  )
}

function ProfessionalFormatCard({ format, theme, index = 0, onDelete, isAdmin }) {
  const [deleting, setDeleting] = useState(false)
  const stats = format.format_stats || { total_matches: 0, total_players: 0, last_played_at: null }

  const handleDelete = async () => {
    if (!isAdmin) return
    if (!confirm('¿Estás seguro de que quieres eliminar este formato?')) return
    setDeleting(true)
    await onDelete(format.id)
    setDeleting(false)
  }

  const getFormatIcon = (name) => {
    const n = name.toLowerCase()
    if (n.includes('commander') || n.includes('edh')) return '👑'
    if (n.includes('draft')) return '📦'
    if (n.includes('sealed')) return '🎁'
    if (n.includes('modern')) return '⚡'
    if (n.includes('legacy')) return '🏛️'
    if (n.includes('vintage')) return '💎'
    if (n.includes('standard')) return '🎯'
    if (n.includes('pauper')) return '🏪'
    return '🎲'
  }

  return (
    <div
      className="group crystal-card"
      style={{ 
        animationDelay: `${index * 100}ms`,
        '--glow-color': theme.colors.glowColor 
      }}
    >
      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-white/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 animate-professional-fade-in h-full" padding="none">
        {/* Top accent */}
        <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`} />
        
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-12 h-12 rounded-xl ${theme.gradient} flex items-center justify-center text-white shadow-lg text-xl`}>
                {getFormatIcon(format.name)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`font-bold text-lg ${theme.text.strong} truncate`}>
                  {format.name}
                </h3>
                <p className={`text-sm ${theme.text.soft} opacity-80`}>
                  Creado {new Date(format.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${theme.colors.primary}`} />
              <span className={`text-sm font-medium ${theme.text.soft}`}>
                {stats.total_matches} partidas jugadas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${theme.colors.primary}`} />
              <span className={`text-sm font-medium ${theme.text.soft}`}>
                {stats.total_players} jugadores únicos
              </span>
            </div>
            {stats.last_played_at && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${theme.colors.primary}`} />
                <span className={`text-sm font-medium ${theme.text.soft}`}>
                  Última partida: {new Date(stats.last_played_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href={`/formats/${format.id}`}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed ${theme.border} ${theme.text.strong} hover:bg-gray-50 transition-all duration-300 text-sm font-semibold group-hover:border-solid`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </Link>
            )}
            
            {isAdmin && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-50 border-2 border-red-200 text-red-700 hover:bg-red-100 transition-all duration-300 text-sm font-semibold disabled:opacity-50"
              >
                {deleting ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

function ProfessionalEmptyState({ theme, isAdmin }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50/50 to-transparent p-16 text-center">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-gray-100/30 to-transparent rounded-full blur-3xl" />
      
      <div className="relative space-y-8">
        <div className="mx-auto">
          <div className="relative w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center ring-4 ring-gray-200 shadow-lg animate-float-subtle mx-auto">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className={`text-2xl font-bold ${theme.text.strong}`}>
            ¡Crea tu primer formato!
          </h3>
          <p className={`${theme.text.soft} max-w-md mx-auto leading-relaxed`}>
            Define los formatos de Magic que jugarás en tu comunidad. 
            Commander, Modern, Draft y cualquier variante que prefieras.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isAdmin && (
            <Link
              href="/formats/new"
              className={`group px-8 py-4 rounded-xl ${theme.gradient} text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 ${theme.colors.ring}`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear primer formato
              </div>
            </Link>
          )}
          
          <Link
            href="/matches"
            className="group px-8 py-4 rounded-xl bg-white border-2 border-gray-300 font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Ver partidas existentes
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

function ProfessionalSkeleton({ theme }) {
  return (
    <div className="space-y-8">
      {/* Hero skeleton */}
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white/90 shadow-sm animate-pulse">
        <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`} />
        <div className="p-8 text-center space-y-6">
          <div className="w-32 h-8 bg-gray-200 rounded-full mx-auto" />
          <div className="space-y-3">
            <div className="w-96 h-12 bg-gray-200 rounded-lg mx-auto" />
            <div className="w-80 h-6 bg-gray-100 rounded mx-auto" />
          </div>
          <div className="flex gap-4 justify-center">
            <div className="w-32 h-12 bg-gray-200 rounded-xl" />
            <div className="w-32 h-12 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="relative overflow-hidden rounded-xl border border-gray-200 bg-white/90 shadow-sm animate-pulse">
            <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`} />
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="w-32 h-5 bg-gray-200 rounded" />
                  <div className="w-24 h-4 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-4 bg-gray-100 rounded" />
                <div className="w-3/4 h-4 bg-gray-100 rounded" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1 h-10 bg-gray-100 rounded-lg" />
                <div className="w-16 h-10 bg-gray-100 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ===============================================================
   COMPONENTE PRINCIPAL
   =============================================================== */
export default function FormatsPage() {
  const { theme, index: themeIndex } = useThemeRotation(40000)

  // NEW: auth / role
  const { isAdmin } = useAdminGuard()

  const [formats, setFormats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Carga inicial
  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      setError(null)
      
      try {
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
        
        if (error) throw error
        
        const normalized = (data || []).map(g => ({
          ...g,
          format_stats: g.format_stats ?? { 
            total_matches: 0, 
            total_players: 0, 
            last_played_at: null 
          }
        }))
        
        setFormats(normalized)
      } catch (err) {
        if (!ignore) {
          setError(err.message)
          setFormats([])
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    
    load()
    return () => { ignore = true }
  }, [])

  // Realtime subscriptions
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

    return () => {
      supabase.removeChannel(chGames)
      supabase.removeChannel(chStats)
    }
  }, [])

  const handleDelete = async (id) => {
    setError(null)

    // Guard de seguridad en cliente
    if (!isAdmin) {
      setError('No tienes permisos para borrar formatos.')
      return false
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError('No autenticado.')
        return false
      }

      const resp = await fetch(`/api/formats/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (!resp.ok) {
        const text = await resp.text().catch(() => '')
        setError(text || 'No se pudo borrar el formato.')
        return false
      }

      // Optimiza UI localmente
      setFormats(prev => prev.filter(f => f.id !== id))
      return true
    } catch (e) {
      setError(e.message || 'Error inesperado al borrar el formato.')
      return false
    }
  }

  const isEmpty = useMemo(() => !loading && !error && formats.length === 0, [loading, error, formats])

  return (
    <div 
      className="min-h-screen theme-transition"
      style={{ 
        background: `linear-gradient(135deg, ${theme.backgroundGradient})`,
      }}
    >
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16 lg:space-y-20">
        {/* Hero Section */}
        <ProfessionalHero theme={theme} isAdmin={isAdmin} />

        {/* Error Display */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 animate-professional-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Error al cargar formatos</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {loading ? (
          <ProfessionalSkeleton theme={theme} />
        ) : isEmpty ? (
          <ProfessionalSection
            title="Formatos de Juego"
            subtitle="No hay formatos registrados"
            theme={theme}
            index={1}
          >
            <ProfessionalEmptyState theme={theme} isAdmin={isAdmin} />
          </ProfessionalSection>
        ) : (
          <ProfessionalSection
            title="Formatos Disponibles"
            subtitle={`${formats.length} formato${formats.length !== 1 ? 's' : ''} registrado${formats.length !== 1 ? 's' : ''}`}
            theme={theme}
            index={1}
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {formats.map((format, index) => (
                <ProfessionalFormatCard
                  key={format.id}
                  format={format}
                  theme={theme}
                  index={index}
                  onDelete={handleDelete}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          </ProfessionalSection>
        )}

        {/* Theme Indicator Footer */}
        <footer className="py-12 text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <span className={`text-sm font-medium ${theme.text.soft}`}>
                Tema actual:
              </span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full shadow-lg"
                  style={{ background: `linear-gradient(45deg, ${theme.colors.primary})` }}
                />
                <span className={`font-bold ${theme.text.strong}`}>
                  {theme.label}
                </span>
              </div>
            </div>
            
            {/* Theme progress indicator */}
            <div className="flex items-center justify-center gap-2">
              {MTG_PROFESSIONAL_THEMES.map((t, i) => (
                <div
                  key={t.key}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i === themeIndex ? 'w-8 opacity-100' : 'w-2 opacity-40'
                  }`}
                  style={{ 
                    background: `linear-gradient(45deg, ${t.colors.primary})` 
                  }}
                />
              ))}
            </div>
            
            <p className={`text-sm ${theme.text.soft} opacity-75`}>
              El tema cambia automáticamente cada 40 segundos
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
