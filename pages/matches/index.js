import { useEffect, useMemo, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../../lib/supabaseClient'
import Card from '../../components/Card'
import { createSupabaseServerClient } from '../../lib/supabaseServer'

/* ===============================================================
  THEME SYSTEM - REUTILIZADO DEL INDEX
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
  CSS PROFESIONAL REUTILIZADO
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

  @keyframes pulseGlow {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
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

  .animate-pulse-glow {
    animation: pulseGlow 2s ease-in-out infinite;
  }

  .theme-transition {
    transition: all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
`

// Inyectar estilos
if (typeof document !== 'undefined' && !document.getElementById('professional-matches-styles')) {
  const style = document.createElement('style')
  style.id = 'professional-matches-styles'
  style.textContent = professionalCSS
  document.head.appendChild(style)
}

/* ===============================================================
  THEME ROTATION HOOK
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
  UTILITY FUNCTIONS
  =============================================================== */
function formatDate(date) {
  try {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  } catch {
    return '—'
  }
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

/* ===============================================================
  PROFESSIONAL COMPONENTS
  =============================================================== */

function ProfessionalHero({ theme }) {
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
      <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl" />

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
                Historia
              </span>
              <span className="text-gray-900 block sm:inline sm:ml-3 lg:ml-5">de Batallas</span>
            </h1>
            
            <p className={`text-base sm:text-lg md:text-xl ${theme.text.soft} max-w-3xl mx-auto leading-relaxed font-medium px-4 sm:px-0`}>
              Revive las partidas épicas, analiza estrategias victoriosas y descubre 
              qué comandantes dominan tu meta local.
            </p>
            
            <div className={`mt-3 sm:mt-4 text-xs sm:text-sm ${theme.text.soft} opacity-80 px-4 sm:px-0`}>
              <span className="font-semibold">Sabiduría del plano: </span>
              <span className="block sm:inline mt-1 sm:mt-0">{theme.fact}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div 
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 sm:px-0 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.6s' }}
          >
            <Link
              href="/matches/new"
              className={`group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl ${theme.gradient} text-white font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 ${theme.colors.ring}`}
            >
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-3">
                <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Partida
              </div>
            </Link>

            <Link
              href="/stats"
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-white/80 backdrop-blur-sm font-semibold text-gray-800 border-2 border-gray-300 hover:border-gray-400 hover:bg-white transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Ver Estadísticas
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProfessionalFilters({ theme, formats, profiles, selectedFormat, setSelectedFormat, selectedPlayer, setSelectedPlayer, query, setQuery, onClear, filteredMatches }) {
  const anyFilter = selectedFormat || selectedPlayer || query

  return (
    <div 
      className="crystal-card animate-professional-fade-in"
      style={{ '--glow-color': theme.colors.glowColor }}
    >
      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg" padding="none">
        <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`} />
        
        <div className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className={`text-xl font-bold ${theme.text.strong} mb-1`}>
                Filtros y Búsqueda
              </h2>
              <p className={`text-sm ${theme.text.soft}`}>
                Encuentra partidas específicas o explora por formato y jugador
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {/* Search */}
              <div>
                <label className={`mb-2 block text-sm font-medium ${theme.text.strong}`}>
                  🔍 Buscar Partidas
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-4 w-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input 
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-gray-900 placeholder-gray-500 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 sm:text-sm transition-all duration-200" 
                    placeholder="Comandante, jugador, formato..." 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                  />
                  {query && (
                    <button 
                      type="button" 
                      onClick={() => setQuery('')} 
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Format filter */}
              <div>
                <label className={`mb-2 block text-sm font-medium ${theme.text.strong}`}>
                  🎯 Formato de Juego
                </label>
                <div className="relative">
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-gray-900 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 sm:text-sm appearance-none transition-all duration-200"
                  >
                    <option value="">Todos los formatos</option>
                    {formats.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Player filter */}
              <div>
                <label className={`mb-2 block text-sm font-medium ${theme.text.strong}`}>
                  👤 Jugador Específico
                </label>
                <div className="relative">
                  <select
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-gray-900 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 sm:text-sm appearance-none transition-all duration-200"
                  >
                    <option value="">Todos los jugadores</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>{p.nickname}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {anyFilter && (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${theme.colors.accent}/20`}>
                    <svg className={`h-4 w-4 ${theme.text.strong}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${theme.text.strong}`}>Filtros activos</p>
                    <p className="text-xs text-gray-600">Mostrando {filteredMatches.length} partida{filteredMatches.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <button 
                  onClick={onClear} 
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limpiar
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

function ProfessionalMatchSkeleton({ theme, index = 0 }) {
  return (
    <div 
      className="animate-professional-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Card className="overflow-hidden border border-gray-200 bg-white/90 backdrop-blur-sm shadow-lg animate-pulse" padding="none">
        <div className={`h-1 bg-gradient-to-r ${theme.colors.primary} opacity-50`} />
        <div className="aspect-[4/3] bg-gray-200" />
        <div className="p-6">
          <div className="space-y-4">
            <div className="h-5 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-gray-200 rounded-md" />
              <div className="h-6 w-24 bg-gray-200 rounded-md" />
              <div className="h-6 w-28 bg-gray-200 rounded-md" />
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50">
          <div className="h-8 w-full bg-gray-200 rounded" />
        </div>
      </Card>
    </div>
  )
}

function ProfessionalMatchCard({ match, formatName, winnerNickname, parts, bannerSrc, winnerPart, nickById, theme, index = 0 }) {
  const [isHovered, setIsHovered] = useState(false)
  
  const getMatchPerformance = (playerCount) => {
    if (playerCount >= 5) return { 
      level: 'epic', 
      color: 'from-purple-500 to-indigo-600', 
      bg: 'bg-purple-50', 
      text: 'text-purple-800', 
      ring: 'ring-purple-200',
      label: 'Épica'
    }
    if (playerCount === 4) return { 
      level: 'standard', 
      color: 'from-blue-500 to-blue-600', 
      bg: 'bg-blue-50', 
      text: 'text-blue-800', 
      ring: 'ring-blue-200',
      label: 'Estándar'
    }
    if (playerCount === 3) return { 
      level: 'small', 
      color: 'from-amber-500 to-orange-600', 
      bg: 'bg-amber-50', 
      text: 'text-amber-800', 
      ring: 'ring-amber-200',
      label: 'Pequeña'
    }
    return { 
      level: 'duo', 
      color: 'from-emerald-500 to-green-600', 
      bg: 'bg-emerald-50', 
      text: 'text-emerald-800', 
      ring: 'ring-emerald-200',
      label: 'Duelo'
    }
  }

  const performance = getMatchPerformance(parts.length)

  return (
    <div 
      className="group crystal-card animate-professional-fade-in"
      style={{ 
        animationDelay: `${index * 100}ms`,
        '--glow-color': theme.colors.glowColor 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${performance.color} opacity-0 blur-xl transition-all duration-700 group-hover:opacity-10 -z-10`} />
      
      <Link href={`/matches/${match.id}`} className="block focus:outline-none">
        <Card
          className="relative overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-500 hover:scale-[1.02] focus:ring-2 focus:ring-gray-500/20 focus:border-gray-400"
          padding="none"
        >
          {/* Performance indicator bar */}
          <div className={`h-1 bg-gradient-to-r ${performance.color}`} />
          
          {/* Hero Image Section */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {bannerSrc ? (
              <Image
                src={bannerSrc}
                alt={winnerPart?.commander_name ? `Comandante: ${winnerPart.commander_name}` : 'Comandante del ganador'}
                fill
                className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] transition-transform duration-1000 group-hover:translate-x-[100%]" />
                <div className="relative z-10 text-center">
                  <svg className="h-8 w-8 mb-2 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>Sin imagen de comandante</div>
                </div>
              </div>
            )}

            {/* Premium overlay gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent" />

            {/* Floating badges */}
            <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-all duration-300 group-hover:bg-black/70">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(match.played_at)}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg transition-all duration-300 group-hover:scale-105 ${performance.bg} ${performance.text} ring-2 ring-white/20`}>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                </svg>
                {formatName}
              </span>
            </div>

            {/* Hero content */}
            <div className="absolute bottom-3 left-3 right-3 space-y-3">
              {winnerPart?.commander_name && (
                <h3 className="line-clamp-2 text-lg font-bold leading-tight text-white drop-shadow-lg transition-all duration-300 group-hover:drop-shadow-2xl">
                  {winnerPart.commander_name}
                </h3>
              )}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-lg ring-1 ring-black/5 transition-all duration-300 group-hover:bg-white group-hover:scale-105">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="text-gray-700">Ganador:</span>
                <span className="text-gray-900">{winnerNickname}</span>
              </div>
            </div>
          </div>

          {/* Content section */}
          <div className="p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-sm font-bold ${theme.text.strong} uppercase tracking-wide`}>Jugadores</h4>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${performance.bg} ${performance.text}`}>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  {parts.length} • {performance.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parts.map((p, pIndex) => {
                  const isWinner = p.user_id === match.winner
                  return (
                    <span 
                      key={p.user_id}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:scale-105 hover:shadow-sm ${
                        isWinner
                          ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 ring-2 ring-amber-200 shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{ 
                        animationDelay: `${(index * 100) + (pIndex * 50)}ms`,
                      }}
                    >
                      {isWinner && (
                        <svg className="h-3 w-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                      {nickById[p.user_id] ?? p.user_id}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
          
          {/* Action footer */}
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50">
            <div className={`flex items-center justify-center gap-2 rounded border-2 border-dashed transition-all duration-300 py-2.5 px-4 text-sm font-medium ${
              isHovered 
                ? 'border-gray-300 bg-white text-gray-700 shadow-sm' 
                : 'border-gray-200 bg-transparent text-gray-500'
            }`}>
              <svg className={`h-4 w-4 transition-all duration-300 ${isHovered ? 'translate-x-0.5' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Ver Detalles</span>
              <svg className={`h-4 w-4 transition-all duration-300 ${isHovered ? 'translate-x-0.5 scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  )
}

function ProfessionalEmptyState({ theme }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center crystal-card">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-gray-100/30 to-transparent rounded-full blur-3xl" />
      
      <div className="relative space-y-8">
        <div className="mx-auto">
          <div className="relative w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center ring-4 ring-gray-200 shadow-lg animate-float-subtle mx-auto">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className={`text-3xl font-bold ${theme.text.strong}`}>
            ¡El campo de batalla aguarda!
          </h3>
          <p className={`${theme.text.soft} max-w-md mx-auto leading-relaxed font-medium`}>
            No hay partidas que coincidan con los criterios de búsqueda. 
            Crea tu primera batalla épica o ajusta los filtros.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/matches/new"
            className={`group px-8 py-4 rounded-xl ${theme.gradient} text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 ${theme.colors.ring}`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Partida
            </div>
          </Link>
          
          <Link
            href="/players"
            className="group px-8 py-4 rounded-xl bg-white border-2 border-gray-300 font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-3a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Ver Jugadores
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

// FAB — Botón flotante profesional
function ProfessionalFab({ theme }) {
  return (
    <Link
      href="/matches/new"
      aria-label="Crear nueva partida"
      className={`fixed right-6 z-50 hidden sm:inline-flex items-center gap-2 rounded-full ${theme.gradient} px-5 py-3 text-white shadow-xl ring-1 ring-black/10 transition-all duration-300 hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 ${theme.colors.ring} animate-float-subtle`}
      style={{ 
        bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
        '--glow-color': theme.colors.glowColor
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span className="font-semibold">Nueva partida</span>
      <div className="absolute inset-0 rounded-full opacity-0 transition-all duration-500 hover:opacity-100 animate-pulse-glow -z-10" 
           style={{ boxShadow: `0 0 20px ${theme.colors.glowColor}` }} />
    </Link>
  )
}

// Barra móvil profesional
function ProfessionalMobileBar({ theme }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center border-t border-gray-200/80 bg-white/95 backdrop-blur-lg px-4 py-3 sm:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
    >
      <Link
        href="/matches/new"
        className={`w-full max-w-md rounded-full ${theme.gradient} px-5 py-3 text-center font-semibold text-white shadow-xl ring-1 ring-black/10 transition-all duration-300 active:scale-95`}
        aria-label="Crear nueva partida"
      >
        <div className="flex items-center justify-center gap-2">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva partida
        </div>
      </Link>
    </div>
  )
}

/* ===============================================================
  MAIN COMPONENT
  =============================================================== */
export default function ProfessionalMatchesList() {
  const { theme } = useThemeRotation(40000)
  
  // Datos
  const [matches, setMatches] = useState([])
  const [profiles, setProfiles] = useState([])
  const [formats, setFormats] = useState([])
  const [participants, setParticipants] = useState([])

  // UI
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtros
  const [selectedFormat, setSelectedFormat] = useState('') // game_id
  const [selectedPlayer, setSelectedPlayer] = useState('') // user_id
  const [query, setQuery] = useState('') // texto libre

  // Paginación
  const PAGE_SIZE = 12
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    let ignore = false
    async function loadAll() {
      setLoading(true); setError(null)

      const [
        { data: profData, error: profErr },
        { data: gameData, error: gameErr },
        { data: partData, error: partErr },
        { data: matchData, error: matchErr }
      ] = await Promise.all([
        supabase.from('profiles').select('id, nickname'),
        supabase.from('games').select('id, name'),
        supabase
          .from('match_participants')
          .select(`
            match_id,
            user_id,
            commander_image,
            commander_image_small,
            commander_image_normal,
            commander_art_crop,
            commander_name
          `),
        supabase.from('matches').select('*').order('played_at', { ascending: false })
      ])

      if (ignore) return
      const firstError = profErr || gameErr || partErr || matchErr
      if (firstError) setError(firstError.message || 'Error al cargar datos')
      else {
        setProfiles(profData || [])
        setFormats(gameData || [])
        setParticipants(partData || [])
        setMatches(matchData || [])
      }
      setLoading(false)
    }
    loadAll()
    return () => { ignore = true }
  }, [])

  // Mapas auxiliares
  const nickById = useMemo(() => {
    const acc = {}
    for (const p of profiles) acc[p.id] = p.nickname
    return acc
  }, [profiles])

  const formatById = useMemo(() => {
    const acc = {}
    for (const f of formats) acc[f.id] = f.name
    return acc
  }, [formats])

  const participantsByMatchId = useMemo(() => {
    const acc = {}
    for (const p of participants) {
      if (!acc[p.match_id]) acc[p.match_id] = []
      acc[p.match_id].push(p)
    }
    return acc
  }, [participants])

  // Filtro + búsqueda
  const filteredMatches = useMemo(() => {
    const q = query.trim().toLowerCase()
    return matches.filter((m) => {
      if (selectedFormat && m.game_id !== selectedFormat) return false
      const parts = participantsByMatchId[m.id] || []
      if (selectedPlayer && !parts.some(p => p.user_id === selectedPlayer)) return false
      if (!q) return true

      const formatName = (formatById[m.game_id] || '').toLowerCase()
      const winnerNick = (nickById[m.winner] || '').toLowerCase()
      const commanderNames = parts.map(p => (p.commander_name || '').toLowerCase()).join(' ')
      const playerNicks = parts.map(p => (nickById[p.user_id] || '').toLowerCase()).join(' ')

      return (
        formatName.includes(q) ||
        winnerNick.includes(q) ||
        commanderNames.includes(q) ||
        playerNicks.includes(q)
      )
    })
  }, [matches, participantsByMatchId, selectedFormat, selectedPlayer, query, formatById, nickById])

  // Reset de paginación con cambios en filtros/búsqueda
  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [selectedFormat, selectedPlayer, query])

  if (loading) {
    return (
      <div 
        className="min-h-screen theme-transition pb-24"
        style={{ 
          background: `linear-gradient(135deg, ${theme.backgroundGradient})`,
        }}
      >
        <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16">
          <ProfessionalHero theme={theme} />
          
          <ProfessionalFilters
            theme={theme}
            formats={formats}
            profiles={profiles}
            selectedFormat={selectedFormat}
            setSelectedFormat={setSelectedFormat}
            selectedPlayer={selectedPlayer}
            setSelectedPlayer={setSelectedPlayer}
            query={query}
            setQuery={setQuery}
            onClear={() => { setSelectedFormat(''); setSelectedPlayer(''); setQuery('') }}
            filteredMatches={filteredMatches}
          />
          
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProfessionalMatchSkeleton key={i} theme={theme} index={i} />
            ))}
          </div>
          
          <ProfessionalFab theme={theme} />
          <ProfessionalMobileBar theme={theme} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div 
        className="min-h-screen theme-transition pb-24"
        style={{ 
          background: `linear-gradient(135deg, ${theme.backgroundGradient})`,
        }}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16">
          <ProfessionalHero theme={theme} />
          
          <div className="crystal-card">
            <Card className="border border-red-300 bg-red-50/90 backdrop-blur-sm shadow-lg">
              <div className="rounded-xl border-2 border-red-300 bg-red-100/50 p-8 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-red-200 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.17 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-800 mb-2">Error al cargar las partidas</h3>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </Card>
          </div>
          
          <ProfessionalFab theme={theme} />
          <ProfessionalMobileBar theme={theme} />
        </div>
      </div>
    )
  }

  const visible = filteredMatches.slice(0, visibleCount)
  const canLoadMore = visibleCount < filteredMatches.length

  return (
    <div 
      className="min-h-screen theme-transition pb-24"
      style={{ 
        background: `linear-gradient(135deg, ${theme.backgroundGradient})`,
      }}
    >
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16">
        {/* Hero Section */}
        <ProfessionalHero theme={theme} />

        {/* Filters */}
        <ProfessionalFilters
          theme={theme}
          formats={formats}
          profiles={profiles}
          selectedFormat={selectedFormat}
          setSelectedFormat={setSelectedFormat}
          selectedPlayer={selectedPlayer}
          setSelectedPlayer={setSelectedPlayer}
          query={query}
          setQuery={setQuery}
          onClear={() => { setSelectedFormat(''); setSelectedPlayer(''); setQuery('') }}
          filteredMatches={filteredMatches}
        />

        {/* Matches Content */}
        {filteredMatches.length === 0 ? (
          <ProfessionalEmptyState theme={theme} />
        ) : (
          <div className="space-y-8">
            {/* Results header */}
            <div>
              <h2 className={`text-2xl font-bold ${theme.text.strong} mb-1`}>
                Partidas Encontradas
              </h2>
              <p className={`text-sm ${theme.text.soft}`}>
                {filteredMatches.length} partida{filteredMatches.length !== 1 ? 's' : ''} en el historial
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((m, index) => {
                const winnerNickname = nickById[m.winner] ?? '—'
                const formatName     = formatById[m.game_id] || 'Desconocido'
                const parts          = participantsByMatchId[m.id] || []
                const winnerPart     = parts.find(p => p.user_id === m.winner)

                const bannerSrcRaw =
                  winnerPart?.commander_image_normal ||
                  winnerPart?.commander_image ||
                  winnerPart?.commander_art_crop ||
                  winnerPart?.commander_image_small ||
                  null

                const bannerSrc = upgradeScryfallUrl(bannerSrcRaw)

                return (
                  <ProfessionalMatchCard
                    key={m.id}
                    match={m}
                    formatName={formatName}
                    winnerNickname={winnerNickname}
                    parts={parts}
                    bannerSrc={bannerSrc}
                    winnerPart={winnerPart}
                    nickById={nickById}
                    theme={theme}
                    index={index}
                  />
                )
              })}
            </div>

            {canLoadMore && (
              <div className="flex justify-center">
                <button
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white/80 backdrop-blur-sm px-8 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:border-gray-400 hover:bg-white hover:shadow-md hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500/20"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Cargar más partidas
                </button>
              </div>
            )}
          </div>
        )}

        {/* Acciones responsivas */}
        <ProfessionalFab theme={theme} />
        <ProfessionalMobileBar theme={theme} />

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
                    t.key === theme.key ? 'w-8 opacity-100' : 'w-2 opacity-40'
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

/* ===============================================================
  SSR - DATOS DEL SERVIDOR (SIGUIENDO ESTRUCTURA DEL INDEX)
  =============================================================== */
export async function getServerSideProps({ req, res }) {
  const supabase = createSupabaseServerClient(req, res)

  try {
    // 1) Cargar datos base en paralelo
    const [profilesRes, matchesRes, participantsRes, gamesRes] = await Promise.allSettled([
      supabase.from('profiles').select('id, nickname'),
      supabase.from('matches').select('*').order('played_at', { ascending: false }),
      supabase.from('match_participants').select(`
        match_id, user_id,
        commander_name,
        commander_image, commander_image_small, commander_image_normal, commander_art_crop
      `),
      supabase.from('games').select('id, name'),
    ])

    const profiles = profilesRes.status === 'fulfilled' ? (profilesRes.value.data || []) : []
    const matches = matchesRes.status === 'fulfilled' ? (matchesRes.value.data || []) : []
    const participants = participantsRes.status === 'fulfilled' ? (participantsRes.value.data || []) : []
    const games = gamesRes.status === 'fulfilled' ? (gamesRes.value.data || []) : []

    // 2) Procesar primeras 12 partidas para el estado inicial
    const initial12Matches = matches.slice(0, 12)
    const gameNameById = Object.fromEntries(games.map(g => [g.id, g.name]))

    const winnerByMatch = {}
    initial12Matches.forEach((match) => {
      const winnerParticipant = participants.find(
        (p) => p.match_id === match.id && p.user_id === match.winner
      )
      if (winnerParticipant) {
        winnerByMatch[match.id] = {
          image:
            winnerParticipant.commander_art_crop ||
            winnerParticipant.commander_image_normal ||
            winnerParticipant.commander_image_small ||
            winnerParticipant.commander_image ||
            null,
          name: winnerParticipant.commander_name || null,
        }
      }
    })

    const enrichedMatches = initial12Matches.map((match) => ({
      ...match,
      game_name: gameNameById[match.game_id] || 'Formato Desconocido',
      winner_image: winnerByMatch[match.id]?.image || null,
      winner_commander: winnerByMatch[match.id]?.name || null,
    }))

    return {
      props: {
        initialMatches: enrichedMatches,
        initialProfiles: profiles,
        initialFormats: games,
        initialParticipants: participants.filter(p => 
          initial12Matches.some(m => m.id === p.match_id)
        ),
      },
    }
  } catch (error) {
    console.error('Error fetching matches data:', error)
    return {
      props: {
        initialMatches: [],
        initialProfiles: [],
        initialFormats: [],
        initialParticipants: [],
      },
    }
  }
}