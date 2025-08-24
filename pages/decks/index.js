// pages/decks/index.js - Versión con diseño profesional MTG
import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import Card from '../../components/Card'
import DeckCard from '../../components/DeckCard'

/* ===============================================================
  SISTEMA DE TEMAS MTG PROFESIONAL (REUTILIZADO)
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
    fact: 'La biblioteca perfecta requiere orden y dedicación.',
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
    fact: 'El conocimiento de cada mazo alimenta la sabiduría del colectivo.',
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
    fact: 'Cada lista organizada es un paso hacia la perfección.',
  },
  {
    key: 'simic',
    label: 'Simic',
    icon: '🟢🔵',
    colors: {
      primary: 'from-green-400 to-blue-500',
      secondary: 'from-green-100 to-blue-200',
      accent: 'bg-teal-500',
      bgSoft: 'bg-teal-50/80',
      ring: 'ring-teal-300',
      glowColor: 'rgba(20, 184, 166, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-green-500 via-teal-400 to-blue-500',
    backgroundGradient: 'from-green-50 via-teal-50 to-blue-100',
    text: {
      strong: 'text-teal-900',
      soft: 'text-teal-700',
      white: 'text-white',
    },
    border: 'border-teal-300',
    shadow: 'shadow-teal-500/25',
    fact: 'La evolución de tus mazos refleja tu crecimiento como planeswalker.',
  },
]

const DEFAULT_THEME_KEY = 'simic'

/* ===============================================================
  CSS PROFESIONAL (REUTILIZADO)
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
if (typeof document !== 'undefined' && !document.getElementById('professional-decks-styles')) {
  const style = document.createElement('style')
  style.id = 'professional-decks-styles'
  style.textContent = professionalCSS
  document.head.appendChild(style)
}

/* ===============================================================
  HOOK DE ROTACIÓN DE TEMAS (REUTILIZADO)
  =============================================================== */
function useThemeRotation(intervalMs = 45000) {
  const [themeKey, setThemeKey] = useState(DEFAULT_THEME_KEY)
  const [index, setIndex] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mp_professional_theme_decks')
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
          localStorage.setItem('mp_professional_theme_decks', nextKey) 
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
  COMPONENTES PROFESIONALES
  =============================================================== */

function ProfessionalDecksHero({ theme, user, totalDecks }) {
  const [loaded, setLoaded] = useState(false)
  
  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <section className="relative overflow-hidden py-8 sm:py-12 lg:py-16">
      <div 
        className="absolute inset-0 theme-transition"
        style={{ 
          background: `linear-gradient(135deg, ${theme.backgroundGradient})`,
          '--glow-color': theme.colors.glowColor 
        }}
      />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-96 lg:h-96 bg-gradient-to-l from-white/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-96 lg:h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Theme indicator */}
          <div 
            className={`inline-flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-6 sm:py-3 rounded-full professional-glass ${
              loaded ? 'animate-professional-fade-in' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.2s' }}
          >
            <span className="text-base sm:text-lg lg:text-2xl">{theme.icon}</span>
            <span className={`font-bold text-xs sm:text-sm lg:text-lg ${theme.text.strong}`}>
              {theme.label}
            </span>
          </div>

          {/* Main title */}
          <div 
            className={`space-y-2 sm:space-y-3 lg:space-y-4 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.4s' }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-tight">
              <span className={`${theme.text.strong} block sm:inline`}>
                Biblioteca
              </span>
              <span className="text-gray-900 block sm:inline sm:ml-2 lg:ml-4">de Mazos</span>
            </h1>
            
            <p className={`text-sm sm:text-base md:text-lg lg:text-xl ${theme.text.soft} max-w-3xl mx-auto leading-relaxed font-medium px-2 sm:px-4 lg:px-0`}>
              Explora, gestiona y perfecciona tu colección de mazos de Magic: The Gathering. 
              Cada lista cuenta una historia única.
            </p>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-4">
              <div className="text-center">
                <div className={`text-2xl sm:text-3xl lg:text-4xl font-black ${theme.text.strong}`}>
                  {totalDecks.toLocaleString()}
                </div>
                <div className={`text-xs sm:text-sm ${theme.text.soft} font-medium`}>
                  mazos disponibles
                </div>
              </div>
              {user && (
                <div className="text-center">
                  <div className={`text-2xl sm:text-3xl lg:text-4xl font-black ${theme.text.strong}`}>
                    ∞
                  </div>
                  <div className={`text-xs sm:text-sm ${theme.text.soft} font-medium`}>
                    posibilidades
                  </div>
                </div>
              )}
            </div>
            
            <div className={`mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm ${theme.text.soft} opacity-80 px-2 sm:px-4 lg:px-0`}>
              <span className="font-semibold">Sabiduría del plano: </span>
              <span className="block sm:inline mt-1 sm:mt-0">{theme.fact}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div 
            className={`flex flex-col gap-3 sm:gap-4 px-4 sm:px-0 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.6s' }}
          >
            {user ? (
              <Link
                href="/decks/new"
                className={`group relative w-full sm:w-auto sm:mx-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl ${theme.gradient} text-white font-bold text-sm sm:text-base lg:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 ${theme.colors.ring}`}
              >
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Importar Mazo
                </div>
              </Link>
            ) : (
              <div className="w-full sm:w-auto sm:mx-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-white/80 backdrop-blur-sm font-semibold text-gray-700 border-2 border-gray-300 text-sm sm:text-base lg:text-lg">
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Inicia sesión para importar mazos
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function ProfessionalDecksFilters({ theme, filters, onFiltersChange, userLoggedIn, loading }) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleSubmit = (e) => {
    e.preventDefault()
    onFiltersChange(localFilters)
  }

  const handleReset = () => {
    const resetFilters = { search: '', format: '', showOnlyMine: false }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const anyFilter = localFilters.search || localFilters.format || localFilters.showOnlyMine

  return (
    <div 
      className="crystal-card animate-professional-fade-in"
      style={{ '--glow-color': theme.colors.glowColor }}
    >
      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg" padding="none">
        <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`} />
        
        <div className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
              <h2 className={`text-lg sm:text-xl font-bold ${theme.text.strong} mb-1`}>
                Explorar Mazos
              </h2>
              <p className={`text-xs sm:text-sm ${theme.text.soft}`}>
                Encuentra el mazo perfecto por formato, estrategia o comandante
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-3 sm:gap-4 lg:grid-cols-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <label className={`mb-2 block text-sm font-medium ${theme.text.strong}`}>
                    🔍 Buscar Mazos
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-4 w-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Nombre, comandante, estrategia..."
                      value={localFilters.search}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2 sm:py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all duration-200"
                    />
                    {localFilters.search && (
                      <button 
                        type="button" 
                        onClick={() => setLocalFilters(prev => ({ ...prev, search: '' }))}
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
                    🎯 Formato
                  </label>
                  <div className="relative">
                    <select
                      value={localFilters.format}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, format: e.target.value }))}
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2 sm:py-2.5 pl-3 pr-8 sm:pr-10 text-sm text-gray-900 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 appearance-none transition-all duration-200"
                    >
                      <option value="">Todos</option>
                      <option value="Commander">Commander</option>
                      <option value="Modern">Modern</option>
                      <option value="Standard">Standard</option>
                      <option value="Legacy">Legacy</option>
                      <option value="Vintage">Vintage</option>
                      <option value="Pioneer">Pioneer</option>
                      <option value="Pauper">Pauper</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* My decks toggle */}
                <div>
                  <label className={`mb-2 block text-sm font-medium ${theme.text.strong}`}>
                    👤 Filtrar
                  </label>
                  <label className={`flex items-center gap-2 sm:gap-3 rounded-lg border border-gray-200 bg-white p-2 sm:p-2.5 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${!userLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input
                      type="checkbox"
                      checked={localFilters.showOnlyMine}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, showOnlyMine: e.target.checked }))}
                      disabled={!userLoggedIn}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50"
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Solo mis mazos</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${theme.gradient} text-white hover:shadow-lg focus:ring-blue-500`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Buscando...
                    </div>
                      ) : (
                        'Buscar'  // ✅ Ahora está en la parte else del ternary
                      )}
                </button>
                
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Limpiar
                </button>
              </div>

              {anyFilter && (
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full ${theme.colors.accent}/20`}>
                      <svg className={`h-3 w-3 sm:h-4 sm:w-4 ${theme.text.strong}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-xs sm:text-sm font-medium ${theme.text.strong}`}>Filtros activos</p>
                      <p className="text-xs text-gray-600">Resultados personalizados</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleReset} 
                    className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-gray-300 bg-white px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Limpiar
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ProfessionalDecksStats({ theme, totalDecks, loading }) {
  return (
    <div 
      className="crystal-card animate-professional-fade-in"
      style={{ '--glow-color': theme.colors.glowColor, animationDelay: '0.2s' }}
    >
      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg" padding="none">
        <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`} />
        
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl ${theme.gradient} flex items-center justify-center shadow-lg animate-float-subtle`}>
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-8 sm:h-10 bg-gray-200 rounded animate-pulse w-32"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                </div>
              ) : (
                <div>
                  <p className={`text-2xl sm:text-3xl lg:text-4xl font-black ${theme.text.strong} leading-none`}>
                    {totalDecks.toLocaleString()}
                  </p>
                  <p className={`${theme.text.soft} font-medium text-sm sm:text-base mt-1`}>
                    mazos en la biblioteca de la comunidad
                  </p>
                </div>
              )}
            </div>
            <div className="hidden sm:block text-right">
              <div className={`text-xs ${theme.text.soft} font-medium`}>
                Actualizado continuamente
              </div>
              <div className={`text-xs ${theme.text.soft} opacity-75 mt-1`}>
                por la comunidad
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ProfessionalLoadingSkeleton({ theme }) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i} 
            className="crystal-card animate-professional-fade-in"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg" padding="none">
              <div className={`h-1 bg-gradient-to-r ${theme.colors.primary} opacity-50`} />
              <div className="animate-pulse">
                <div className="h-40 sm:h-48 bg-gray-200 rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-6 bg-gray-200 rounded w-16" />
                    <div className="h-6 bg-gray-200 rounded w-20" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfessionalEmptyState({ theme, filters, user }) {
  const hasFilters = filters.search || filters.format || filters.showOnlyMine

  return (
    <div className="crystal-card animate-professional-fade-in">
      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
        <div className="relative text-center py-12 sm:py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent" />
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-l from-gray-100/30 to-transparent rounded-full blur-3xl" />
          
          <div className="relative space-y-6 sm:space-y-8">
            <div className="mx-auto">
              <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gray-100 flex items-center justify-center ring-4 ring-gray-200 shadow-lg animate-float-subtle mx-auto">
                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <h3 className={`text-2xl sm:text-3xl font-bold ${theme.text.strong}`}>
                {hasFilters ? 'No se encontraron mazos' : 'La biblioteca está vacía'}
              </h3>
              <p className={`${theme.text.soft} max-w-md mx-auto leading-relaxed font-medium text-sm sm:text-base px-4 sm:px-0`}>
                {hasFilters 
                  ? 'Intenta ajustar los filtros de búsqueda o explora otros criterios.'
                  : 'Sé el primero en importar un mazo y comenzar a construir la biblioteca de la comunidad.'
                }
              </p>
            </div>
            
            <div className="flex flex-col gap-3 sm:gap-4 px-4 sm:px-0">
              {user ? (
                <Link
                  href="/decks/new"
                  className={`group px-6 py-3 sm:px-8 sm:py-4 rounded-xl ${theme.gradient} text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 ${theme.colors.ring}`}
                >
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {hasFilters ? 'Crear Nuevo Mazo' : 'Importar Primer Mazo'}
                  </div>
                </Link>
              ) : (
                <div className="px-6 py-3 sm:px-8 sm:py-4 rounded-xl bg-white border-2 border-gray-300 font-semibold text-gray-700">
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Inicia sesión para contribuir
                  </div>
                </div>
              )}
              
              <Link
                href="/decks/builder"
                className="group px-6 py-3 sm:px-8 sm:py-4 rounded-xl bg-white border-2 border-gray-300 font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
                  </svg>
                  Explorar Constructor
                </div>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ProfessionalPagination({ theme, pagination, onPageChange, loading }) {
  const { page, totalPages } = pagination
  
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    let start = Math.max(1, page - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    return pages
  }

  return (
    <div className="crystal-card animate-professional-fade-in">
      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg" padding="lg">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.colors.primary}`} />
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className={`text-sm ${theme.text.soft} font-medium order-2 sm:order-1`}>
            Página {page} de {totalPages}
          </div>
          
          <div className="flex items-center justify-center gap-1 sm:gap-2 order-1 sm:order-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1 || loading}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Anterior</span>
            </button>
            
            <div className="flex items-center gap-1">
              {getPageNumbers().map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  disabled={loading}
                  className={`px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                    pageNum === page
                      ? `${theme.gradient} text-white shadow-lg ${theme.colors.ring}`
                      : 'border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500/20'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages || loading}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// FAB profesional para móvil
function ProfessionalDecksFab({ theme, user }) {
  if (!user) return null

  return (
    <Link
      href="/decks/new"
      aria-label="Importar nuevo mazo"
      className={`fixed right-4 sm:right-6 z-30 hidden sm:inline-flex items-center gap-2 rounded-full ${theme.gradient} px-4 py-2.5 sm:px-5 sm:py-3 text-white shadow-xl ring-1 ring-black/10 transition-all duration-300 hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 ${theme.colors.ring} animate-float-subtle`}
      style={{ 
        bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
        '--glow-color': theme.colors.glowColor
      }}
    >
      <svg className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span className="font-semibold text-sm sm:text-base">Importar mazo</span>
      <div className="absolute inset-0 rounded-full opacity-0 transition-all duration-500 hover:opacity-100 animate-pulse-glow -z-10" 
          style={{ boxShadow: `0 0 20px ${theme.colors.glowColor}` }} />
    </Link>
  )
}

// Barra móvil profesional
function ProfessionalDecksMobileBar({ theme, user }) {
  if (!user) return null

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center border-t border-gray-200/80 bg-white/95 backdrop-blur-lg px-4 py-3 sm:hidden"
      style={{ 
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
        marginBottom: 0
      }}
    >
      <Link
        href="/decks/new"
        className={`w-full max-w-sm rounded-full ${theme.gradient} px-5 py-3 text-center font-semibold text-white shadow-xl ring-1 ring-black/10 transition-all duration-300 active:scale-95`}
        aria-label="Importar nuevo mazo"
      >
        <div className="flex items-center justify-center gap-2">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Importar mazo
        </div>
      </Link>
    </div>
  )
}

/* ===============================================================
  COMPONENTE PRINCIPAL
  =============================================================== */
export default function ProfessionalDecksPage({ initialDecks = [], initialPagination = {} }) {
  const { theme } = useThemeRotation(45000)
  
  const [user, setUser] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [decks, setDecks] = useState(initialDecks)
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    format: '',
    showOnlyMine: false
  })

  // Get user state
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (mounted) {
          setUser(data.user || null)
          setUserLoading(false)
        }
      } catch (error) {
        console.error('Error getting user:', error)
        if (mounted) {
          setUser(null)
          setUserLoading(false)
        }
      }
    })()
    
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (mounted) {
        setUser(session?.user || null)
        setUserLoading(false)
      }
    })
    
    return () => {
      mounted = false
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  const fetchDecks = async (newFilters = filters, page = 1) => {
    setLoading(true)
    setError('')
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(newFilters.search && { search: newFilters.search }),
        ...(newFilters.format && { format: newFilters.format }),
        ...(newFilters.showOnlyMine && user && { user_id: user.id })
      })

      const { data: session, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
      }

      const headers = {
        'Content-Type': 'application/json'
      }
      
      if (session.session?.access_token) {
        headers.Authorization = `Bearer ${session.session.access_token}`
      }

      const response = await fetch(`/api/decks?${params}`, { headers })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (response.ok && data.success) {
        setDecks(data.decks || [])
        setPagination(data.pagination || {})
      } else {
        setError(data.error || 'Error desconocido')
        setDecks([])
        setPagination({})
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setError(error.message || 'Error de conexión')
      setDecks([])
      setPagination({})
    } finally {
      setLoading(false)
    }
  }

  // Cargar mazos cuando el usuario se termine de cargar
  useEffect(() => {
    if (!userLoading) {
      fetchDecks(filters, 1)
    }
  }, [userLoading, user?.id])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    fetchDecks(newFilters, 1)
  }

  const handlePageChange = (page) => {
    fetchDecks(filters, page)
  }

  if (userLoading) {
    return (
      <div 
        className="min-h-screen theme-transition flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})` }}
      >
        <div className="text-center space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center mx-auto shadow-lg">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </div>
          <p className={`text-base sm:text-lg font-medium ${theme.text.strong}`}>Inicializando biblioteca...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen theme-transition pb-20 sm:pb-24"
      style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})` }}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12 lg:space-y-16">
        <ProfessionalDecksHero theme={theme} user={user} totalDecks={pagination.total || 0} />

        {/* Error display */}
        {error && (
          <div className="crystal-card">
            <Card className="border border-red-300 bg-red-50/90 backdrop-blur-sm shadow-lg">
              <div className="rounded-xl border-2 border-red-300 bg-red-100/50 p-4 sm:p-6 text-center">
                <h3 className="text-lg sm:text-xl font-bold text-red-800 mb-2">Error al cargar los mazos</h3>
                <p className="text-red-700 font-medium text-sm sm:text-base mb-4">{error}</p>
                <button 
                  onClick={() => fetchDecks(filters, 1)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Reintentar
                </button>
              </div>
            </Card>
          </div>
        )}

        <ProfessionalDecksFilters 
          theme={theme}
          filters={filters}
          onFiltersChange={handleFilterChange}
          userLoggedIn={!!user}
          loading={loading}
        />

        <ProfessionalDecksStats theme={theme} totalDecks={pagination.total || 0} loading={loading} />

        {/* Decks Content */}
        {loading ? (
          <ProfessionalLoadingSkeleton theme={theme} />
        ) : decks.length > 0 ? (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {decks.map((deck, index) => (
                <div 
                  key={deck.id}
                  className="crystal-card animate-professional-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <DeckCard deck={deck} />
                </div>
              ))}
            </div>
            
            <ProfessionalPagination 
              theme={theme}
              pagination={pagination}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </div>
        ) : !loading && !error ? (
          <ProfessionalEmptyState theme={theme} filters={filters} user={user} />
        ) : null}

        <ProfessionalDecksFab theme={theme} user={user} />
        <ProfessionalDecksMobileBar theme={theme} user={user} />

        {/* Theme indicator footer */}
        <footer className="py-6 sm:py-8 text-center">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <span className={`text-xs sm:text-sm font-medium ${theme.text.soft}`}>
                Tema actual:
              </span>
              <div className="flex items-center gap-2">
                <div  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-lg"
                  style={{ background: `linear-gradient(45deg, ${theme.colors.primary})` }}
                />
                <span
                  className={`font-bold text-sm sm:text-base ${theme.text.strong}`}
                >
                  {theme.label}
                </span>
              </div>
            </div>
            <p className={`text-xs ${theme.text.soft} opacity-75`}>
              El tema cambia automáticamente cada 45 segundos
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

// SSR deshabilitado - usamos client-side loading 
export async function getServerSideProps() {
  return {
    props: {
      initialDecks: [],
      initialPagination: { page: 1, limit: 12, total: 0, totalPages: 0 }
    }
  }
}