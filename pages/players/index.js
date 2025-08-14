import Link from 'next/link'
import { useEffect, useMemo, useState, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Card from '../../components/Card'

// Utils functions (from your index.js)
function isCardLike(url = '') {
  try {
    const u = new URL(url)
    return u.hostname.includes('scryfall')
  } catch {
    return typeof url === 'string' && url.includes('scryfall')
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
if (typeof document !== 'undefined' && !document.getElementById('professional-players-styles')) {
  const style = document.createElement('style')
  style.id = 'professional-players-styles'
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
                Comunidad
              </span>
              <span className="text-gray-900 block sm:inline sm:ml-3 lg:ml-5">de Jugadores</span>
            </h1>
            
            <p className={`text-base sm:text-lg md:text-xl ${theme.text.soft} max-w-3xl mx-auto leading-relaxed font-medium px-4 sm:px-0`}>
              Descubre perfiles, estadísticas de rendimiento y el ranking de tu meta local. 
              Conecta con otros jugadores y analiza el meta competitivo.
            </p>
          </div>

          {/* Action buttons */}
          <div 
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 sm:px-0 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.6s' }}
          >
            <Link
              href="/players/leaderboard"
              className={`group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl ${theme.gradient} text-white font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 ${theme.colors.ring}`}
            >
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Ver Ranking
              </div>
            </Link>

            <Link
              href="/matches/new"
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-white/80 backdrop-blur-sm font-semibold text-gray-800 border-2 border-gray-300 hover:border-gray-400 hover:bg-white transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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

function ProfessionalFilters({ theme, q, setQ, sortKey, setSortKey, sortDir, setSortDir }) {
  const keys = [
    { k: 'name', label: 'Nombre' },
    { k: 'played', label: 'Partidas' },
    { k: 'wins', label: 'Victorias' },
    { k: 'winrate', label: 'Tasa de Victoria' },
  ]
  
  return (
    <div 
      className="crystal-card animate-professional-fade-in"
      style={{ '--glow-color': theme.colors.glowColor }}
    >
      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg" padding="lg">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.colors.primary}`} />
        
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className={`text-xl font-bold ${theme.text.strong} mb-1`}>
              Filtros y Ordenación
            </h2>
            <p className={`text-sm ${theme.text.soft}`}>
              Busca jugadores y personaliza el orden de visualización
            </p>
          </div>

          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className={`mb-2 block text-sm font-medium ${theme.text.strong}`}>
                Buscar Jugadores
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input 
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-gray-900 placeholder-gray-500 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 sm:text-sm"
                  placeholder="Ingresa el nombre del jugador..." 
                  value={q} 
                  onChange={(e) => setQ(e.target.value)} 
                />
                {q && (
                  <button 
                    type="button" 
                    onClick={() => setQ('')} 
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sort by */}
              <div>
                <label className={`mb-2 block text-sm font-medium ${theme.text.strong}`}>
                  Ordenar Por
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {keys.map(({ k, label }) => {
                    const active = sortKey === k
                    return (
                      <button 
                        key={k} 
                        type="button" 
                        onClick={() => setSortKey(k)} 
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                          active 
                            ? 'bg-gray-900 text-white shadow-sm' 
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* Sort direction */}
              <div>
                <label className={`mb-2 block text-sm font-medium ${theme.text.strong}`}>
                  Orden
                </label>
                <button 
                  type="button" 
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-gray-500/20"
                  onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className={`h-4 w-4 transition-transform duration-200 ${sortDir === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    {sortDir === 'asc' ? 'Ascendente' : 'Descendente'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ProfessionalPlayerSkeleton({ theme, index = 0 }) {
  return (
    <div 
      className="animate-professional-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Card className="overflow-hidden border border-gray-200 bg-white/90 backdrop-blur-sm shadow-lg animate-pulse" padding="none">
        <div className={`h-1 bg-gradient-to-r ${theme.colors.primary} opacity-50`} />
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="flex gap-1.5">
                <div className="h-6 w-20 bg-gray-200 rounded" />
                <div className="h-6 w-24 bg-gray-200 rounded" />
                <div className="h-6 w-16 bg-gray-200 rounded" />
              </div>
              <div className="space-y-1">
                <div className="h-3 w-full bg-gray-100 rounded-full">
                  <div className="h-full w-3/5 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
          <div className="h-8 w-full bg-gray-200 rounded" />
        </div>
      </Card>
    </div>
  )
}

function ProfessionalPlayerCard({ player, theme, isAdmin, onDeleted, index = 0 }) {
  const [isHovered, setIsHovered] = useState(false)
  const initial = (player.nickname || 'U').slice(0, 1).toUpperCase()
  const winrate = Math.max(0, Math.min(100, Number(player.winRate ?? 0)))
  
  // Sistema de imágenes avanzado (igual que el navbar)
  const upgradeScryfall = (url) => {
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

  const commanderImage = useMemo(
    () => upgradeScryfall(player.topCommanderImage || ''),
    [player.topCommanderImage]
  )

  const highlightImage = useMemo(() => {
    const pref = (player.highlightPreference || 'profile').toLowerCase()
    const avatar = player.avatarUrl || ''
    if (pref === 'commander') {
      return commanderImage || avatar || ''
    }
    // 'profile' por defecto
    return avatar || commanderImage || ''
  }, [player.avatarUrl, player.highlightPreference, commanderImage])
  
  const getPerformanceLevel = (winrate) => {
    if (winrate >= 75) return { 
      level: 'excelente', 
      color: 'from-green-500 to-emerald-600', 
      bg: 'bg-green-50', 
      text: 'text-green-800', 
      border: 'border-green-300',
    }
    if (winrate >= 60) return { 
      level: 'bueno', 
      color: 'from-blue-500 to-indigo-600', 
      bg: 'bg-blue-50', 
      text: 'text-blue-800', 
      border: 'border-blue-300',
    }
    if (winrate >= 45) return { 
      level: 'promedio', 
      color: 'from-amber-500 to-orange-600', 
      bg: 'bg-amber-50', 
      text: 'text-amber-800', 
      border: 'border-amber-300',
    }
    return { 
      level: 'en desarrollo', 
      color: 'from-gray-500 to-slate-600', 
      bg: 'bg-gray-50', 
      text: 'text-gray-800', 
      border: 'border-gray-300',
    }
  }

  const performance = getPerformanceLevel(winrate)

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`¿Eliminar a ${player.nickname}?`)) return
    if (!confirm(`Esto eliminará PERMANENTEMENTE todas las estadísticas, partidas y registros. ¿Confirmar?`)) return

    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/delete-user', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ userId: player.id })
    })
    const result = await res.json()
    if (res.ok) {
      alert('Usuario y datos eliminados exitosamente')
      onDeleted(player.id)
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  return (
    <div 
      className="group crystal-card animate-professional-fade-in"
      style={{ 
        animationDelay: `${index * 100}ms`,
        '--glow-color': theme.colors.glowColor,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Admin delete button */}
      {isAdmin && (
        <div className="absolute -top-2 -right-2 z-20">
          <button
            onClick={handleDelete}
            className="group/btn relative rounded-full bg-red-500 p-2 text-white shadow-lg transition-all duration-300 hover:bg-red-600 hover:scale-110 hover:shadow-xl focus:ring-4 focus:ring-red-500/30"
          >
            <svg className="h-3 w-3 transition-transform duration-200 group-hover/btn:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}

      <Link href={`/players/${player.id}`} className="block focus:outline-none">
        <Card
          className="relative overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] focus:ring-2 focus:ring-gray-500/20 focus:border-gray-400"
          padding="none"
        >
          {/* Performance indicator bar */}
          <div className={`h-0.5 bg-gradient-to-r ${performance.color}`} />
          
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Avatar Professional con imagen real */}
              <div className="relative shrink-0">
                {highlightImage ? (
                  <div className={`w-12 h-12 rounded-lg overflow-hidden border-2 ${performance.border} shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105`}>
                    <img
                      src={highlightImage}
                      alt={player.nickname || 'Jugador'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        // Fallback a inicial si la imagen falla
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    {/* Fallback inicial oculto por defecto */}
                    <div className={`hidden w-full h-full bg-gray-100 text-lg font-bold text-gray-700 items-center justify-center`}>
                      {initial}
                    </div>
                  </div>
                ) : (
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-700 border ${performance.border} transition-all duration-300 group-hover:shadow-sm group-hover:scale-105`}>
                    <span className="transition-all duration-200 group-hover:scale-105">{initial}</span>
                  </div>
                )}
                
                {/* Status indicator */}
                <div className={`absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-br ${performance.color} border border-white`} />
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                {/* Player name */}
                <h3 className="truncate text-lg font-semibold text-gray-900 transition-colors duration-200 group-hover:text-gray-800">
                  {player.nickname || 'Jugador'}
                </h3>
                
                {/* Statistics */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 font-medium text-gray-700">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {player.totalPlayed} partidas
                  </span>
                  
                  <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 font-medium text-gray-700">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {player.totalWins} victorias
                  </span>
                  
                  <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${performance.bg} ${performance.text}`}>
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {winrate.toFixed(1)}%
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">Tasa de Victoria</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${performance.bg} ${performance.text}`}>
                      {performance.level}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${performance.color} transition-all duration-700 ease-out`}
                      style={{ width: `${winrate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action footer */}
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
            <div className={`flex items-center justify-center gap-2 rounded border-2 border-dashed transition-all duration-300 py-2 px-3 text-sm font-medium ${
              isHovered 
                ? 'border-gray-300 bg-white text-gray-700' 
                : 'border-gray-200 bg-transparent text-gray-500'
            }`}>
              <svg className={`h-4 w-4 transition-all duration-200 ${isHovered ? 'translate-x-0.5' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Ver Perfil</span>
              <svg className={`h-4 w-4 transition-all duration-200 ${isHovered ? 'translate-x-0.5' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  )
}

function ProfessionalEmptyState({ theme, setQ, setSortKey, setSortDir }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center crystal-card">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-gray-100/30 to-transparent rounded-full blur-3xl" />
      
      <div className="relative space-y-8">
        <div className="mx-auto">
          <div className="relative w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center ring-4 ring-gray-200 shadow-lg animate-float-subtle mx-auto">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className={`text-3xl font-bold ${theme.text.strong}`}>
            ¡La comunidad está creciendo!
          </h3>
          <p className={`${theme.text.soft} max-w-md mx-auto leading-relaxed font-medium`}>
            No hay jugadores que coincidan con los criterios de búsqueda actuales. 
            Ajusta los filtros o invita a más jugadores a unirse.
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
          
          <button
            onClick={() => {
              setQ('')
              setSortKey('winrate')
              setSortDir('desc')
            }}
            className="group px-8 py-4 rounded-xl bg-white border-2 border-gray-300 font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Limpiar Filtros
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ===============================================================
  MAIN COMPONENT
  =============================================================== */
export default function ProfessionalPlayersIndex() {
  const { theme } = useThemeRotation(40000)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const [q, setQ] = useState('')
  const [sortKey, setSortKey] = useState('winrate')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAdmin(user?.user_metadata?.role === 'admin')
    }
    checkRole()
  }, [])

  useEffect(() => {
    let ignore = false
    const load = async () => {
      setLoading(true); setError(null)
      
      // Obtener datos básicos de estadísticas
      const { data: statsData, error: statsError } = await supabase
        .from('player_stats_view')
        .select('id, nickname, total_played, total_wins, win_rate')
      
      if (ignore) return
      if (statsError) {
        setError(statsError.message)
        setPlayers([])
        setLoading(false)
        return
      }

      // Obtener datos de perfiles (avatar, preferencias)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, avatar_url, highlight_image_preference')
        .in('id', (statsData || []).map(p => p.id))

      // Obtener comandantes más usados para usuarios con preferencia 'commander'
      const commanderUsers = (profilesData || [])
        .filter(p => p.highlight_image_preference === 'commander')
        .map(p => p.id)

      let commandersData = []
      if (commanderUsers.length > 0) {
        const { data: cmdData } = await supabase
          .from('commander_stats_by_user')
          .select('user_id, last_image_url')
          .in('user_id', commanderUsers)
          .order('games_played', { ascending: false })

        // Agrupar por usuario y tomar el más usado
        const commandersByUser = {}
        cmdData?.forEach(cmd => {
          if (!commandersByUser[cmd.user_id]) {
            commandersByUser[cmd.user_id] = cmd.last_image_url
          }
        })
        commandersData = commandersByUser
      }

      if (ignore) return

      // Combinar todos los datos
      const enrichedPlayers = (statsData || []).map(p => {
        const profile = profilesData?.find(prof => prof.id === p.id)
        const topCommanderImage = commandersData[p.id] || ''
        
        return {
          id: p.id,
          nickname: p.nickname,
          totalPlayed: p.total_played,
          totalWins: p.total_wins,
          winRate: p.win_rate,
          avatarUrl: profile?.avatar_url || '',
          highlightPreference: profile?.highlight_image_preference || 'profile',
          topCommanderImage: topCommanderImage
        }
      })

      setPlayers(enrichedPlayers)
      setLoading(false)
    }
    load()
    return () => { ignore = true }
  }, [])

  const handleDeleted = (id) => {
    setPlayers(players => players.filter(p => p.id !== id))
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return players
    return players.filter(p => (p.nickname || '').toLowerCase().includes(term))
  }, [players, q])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      let comp = 0
      switch (sortKey) {
        case 'wins':
          comp = (b.totalWins - a.totalWins) || (b.totalPlayed - a.totalPlayed) || (a.nickname || '').localeCompare(b.nickname || '')
          break
        case 'played':
          comp = (b.totalPlayed - a.totalPlayed) || (b.totalWins - a.totalWins) || (a.nickname || '').localeCompare(b.nickname || '')
          break
        case 'winrate':
          comp = (b.winRate - a.winRate) || (b.totalPlayed - a.totalPlayed) || (a.nickname || '').localeCompare(b.nickname || '')
          break
        case 'name':
        default:
          comp = (a.nickname || '').localeCompare(b.nickname || '')
      }
      return sortDir === 'asc' ? comp * -1 : comp
    })
    return arr
  }, [filtered, sortKey, sortDir])

  if (loading) {
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16">
          <ProfessionalHero theme={theme} />
          
          <ProfessionalFilters 
            theme={theme} 
            q={q} 
            setQ={setQ} 
            sortKey={sortKey} 
            setSortKey={setSortKey} 
            sortDir={sortDir} 
            setSortDir={setSortDir} 
          />
          
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProfessionalPlayerSkeleton key={i} theme={theme} index={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div 
        className="min-h-screen theme-transition"
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
                <h3 className="text-2xl font-bold text-red-800 mb-2">Error al cargar jugadores</h3>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16">
        {/* Hero Section */}
        <ProfessionalHero theme={theme} />
        
        {/* Filters */}
        <ProfessionalFilters 
          theme={theme} 
          q={q} 
          setQ={setQ} 
          sortKey={sortKey} 
          setSortKey={setSortKey} 
          sortDir={sortDir} 
          setSortDir={setSortDir} 
        />
        
        {/* Players Grid */}
        {sorted.length === 0 ? (
          <ProfessionalEmptyState 
            theme={theme} 
            setQ={setQ} 
            setSortKey={setSortKey} 
            setSortDir={setSortDir} 
          />
        ) : (
          <div className="space-y-6">
            {/* Simple header */}
            <div>
              <h2 className={`text-2xl font-bold ${theme.text.strong} mb-1`}>
                Jugadores Encontrados
              </h2>
              <p className={`text-sm ${theme.text.soft}`}>
                {sorted.length} {sorted.length === 1 ? 'jugador' : 'jugadores'} en la comunidad
              </p>
            </div>
            
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sorted.map((player, index) => (
                <ProfessionalPlayerCard 
                  key={player.id} 
                  player={player} 
                  theme={theme} 
                  isAdmin={isAdmin} 
                  onDeleted={handleDeleted} 
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}