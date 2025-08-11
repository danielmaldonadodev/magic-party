// pages/index.js
import Link from 'next/link'
import { format } from 'date-fns'
import { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import Card from '../components/Card'
import ImageFallback from '../components/ImageFallback'
import { createSupabaseServerClient } from '../lib/supabaseServer'
import { supabase } from '../lib/supabaseClient'
import { getArchetypeForCommander } from '../lib/archetypes'

/* ===============================================================
   SISTEMA DE TEMAS MTG PROFESIONAL - 40 SEGUNDOS DE ROTACIÓN
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
   CSS PROFESIONAL CON EFECTOS PREMIUM
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

@keyframes archetype-pulse {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
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

.animate-archetype-pulse {
  animation: archetype-pulse 3s ease-in-out infinite;
}

.theme-transition {
  transition: all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
`

// Inyectar estilos
if (typeof document !== 'undefined' && !document.getElementById('professional-home-styles')) {
  const style = document.createElement('style')
  style.id = 'professional-home-styles'
  style.textContent = professionalCSS
  document.head.appendChild(style)
}

/* ===============================================================
   THEME ROTATION HOOK - 40 SEGUNDOS
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
   COMPONENTES PROFESIONALES
   =============================================================== */

function ProfessionalHero({ theme }) {
  const [loaded, setLoaded] = useState(false)
  
  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <section className="relative overflow-hidden py-20">
      <div 
        className="absolute inset-0 theme-transition"
        style={{ 
          background: `linear-gradient(135deg, ${theme.backgroundGradient})`,
          '--glow-color': theme.colors.glowColor 
        }}
      />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-white/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center space-y-8">
          {/* Theme indicator */}
          <div 
            className={`inline-flex items-center gap-3 px-6 py-3 rounded-full professional-glass ${
              loaded ? 'animate-professional-fade-in' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.2s' }}
          >
            <span className="text-2xl">{theme.icon}</span>
            <span className={`font-bold text-lg ${theme.text.strong}`}>
              {theme.label}
            </span>
          </div>

          {/* Main title */}
          <div 
            className={`space-y-4 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.4s' }}
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tight">
              <span className={`bg-gradient-to-r ${theme.colors.primary} bg-clip-text text-transparent`}>
                Magic
              </span>
              <span className="text-gray-900 ml-4">Party</span>
            </h1>
            
            <p className={`text-xl md:text-2xl ${theme.text.soft} max-w-4xl mx-auto leading-relaxed font-medium`}>
              Tu plataforma profesional para registrar partidas, analizar estadísticas 
              y descubrir tendencias en tu meta local de Magic: The Gathering.
            </p>
            
            <div className={`mt-4 text-sm ${theme.text.soft} opacity-80`}>
              <span className="font-semibold">Estrategia actual: </span>
              <span>{theme.fact}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div 
            className={`flex flex-wrap items-center justify-center gap-6 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.6s' }}
          >
            <Link
              href="/matches/new"
              className={`group relative px-8 py-4 rounded-xl ${theme.gradient} text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 ${theme.colors.ring}`}
            >
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-3">
                <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Partida
              </div>
            </Link>

            <Link
              href="/matches"
              className="group px-8 py-4 rounded-xl bg-white/80 backdrop-blur-sm font-semibold text-gray-800 border-2 border-gray-300 hover:border-gray-400 hover:bg-white transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Ver Partidas
              </div>
            </Link>

            <Link
              href="/stats"
              className="group px-8 py-4 rounded-xl bg-white/80 backdrop-blur-sm font-semibold text-gray-800 border-2 border-gray-300 hover:border-gray-400 hover:bg-white transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Estadísticas
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

function ProfessionalEmptyState({ theme }) {
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
            ¡Comienza tu aventura en Magic Party!
          </h3>
          <p className={`${theme.text.soft} max-w-md mx-auto leading-relaxed`}>
            Registra tu primera partida y desbloquea un mundo de estadísticas 
            y análisis para tu grupo de juego.
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
            href="/formats"
            className="group px-8 py-4 rounded-xl bg-white border-2 border-gray-300 font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Explorar Formatos
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

function ProfessionalStatCard({ label, value, hint, theme, index = 0, icon }) {
  return (
    <div 
      className="group crystal-card"
      style={{ 
        animationDelay: `${index * 150}ms`,
        '--glow-color': theme.colors.glowColor 
      }}
    >
      <Card className="relative bg-white/90 backdrop-blur-sm border-2 border-white/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 animate-professional-fade-in" padding="lg">
        <div className="flex items-center gap-4">
          <div 
            className={`w-14 h-14 rounded-xl ${theme.gradient} flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
          >
            {icon}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-bold uppercase tracking-wider ${theme.text.soft} mb-1`}>
              {label}
            </p>
            <p className={`text-3xl font-black ${theme.text.strong}`}>
              {value}
            </p>
            {hint && (
              <p className="text-xs text-gray-600 mt-1">
                {hint}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

function ProfessionalPlayerCard({ player, theme, isPlayerOfMonth = false }) {
  const [imageError, setImageError] = useState(false)
  
  return (
    <div 
      className={`relative crystal-card ${isPlayerOfMonth ? 'animate-premium-glow animate-float-subtle' : ''}`}
      style={{ 
        '--glow-color': theme.colors.glowColor 
      }}
    >
      <Card className="relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/30 shadow-2xl animate-professional-fade-in" padding="none">
        {/* Background */}
        <div className={`absolute inset-0 ${theme.gradient} opacity-90`} />
        
        {/* Content */}
        <div className="relative p-8 text-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-wider">
                {isPlayerOfMonth ? '👑 Jugador del Mes' : 'Jugador Destacado'}
              </span>
            </div>
            {isPlayerOfMonth && (
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-yellow-400 animate-archetype-pulse" 
                       style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            )}
          </div>

          {/* Player info */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white/50 shadow-xl">
                {player?.avatar_url && !imageError ? (
                  <Image
                    src={player.avatar_url}
                    alt={player.name}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              {isPlayerOfMonth && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
                  <span className="text-xs">🏆</span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">{player?.name || '—'}</h3>
              <div className="space-y-2">
                <p className="text-white/90">
                  {player?.wins || 0} victorias este mes
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (player?.win_rate || 0))}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold">
                    {Math.round(player?.win_rate || 0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6">
            <Link 
              href={`/players/${player?.user_id || '#'}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 font-semibold hover:bg-white/30 transition-all duration-300"
            >
              Ver perfil completo
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ProfessionalCommanderCard({ commander, theme, isCommanderOfMonth = false }) {
  const [imageError, setImageError] = useState(false)
  
  // Detectar arquetipo basado en el comandante
  const archetype = getArchetypeForCommander({
    name: commander?.name,
    // si más adelante guardas los colores del comandante en la DB:
    colorIdentity: commander?.color_identity || commander?.colors
  })
  
  return (
    <div 
      className={`relative crystal-card ${isCommanderOfMonth ? 'animate-premium-glow animate-float-subtle' : ''}`}
      style={{ 
        '--glow-color': theme.colors.glowColor 
      }}
    >
      <Card className="relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/30 shadow-2xl animate-professional-fade-in" padding="none">
        {/* Background */}
        <div className={`absolute inset-0 ${theme.gradient} opacity-90`} />
        
        {/* Archetype badge */}
        <div className="absolute top-4 right-4 z-10">
          <div
            className="px-3 py-1 rounded-full text-xs font-bold text-white border border-white/30 backdrop-blur-sm animate-archetype-pulse"
            style={{ background: archetype.badgeBackground }}
          >
            {archetype.emoji.join('')} {archetype.label}
          </div>
        </div>
        
        {/* Content */}
        <div className="relative p-8 text-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-wider">
                {isCommanderOfMonth ? '⚡ Comandante del Mes' : 'Comandante Popular'}
              </span>
            </div>
            {isCommanderOfMonth && (
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-archetype-pulse" 
                       style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            )}
          </div>

          {/* Commander info */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white/50 shadow-xl">
                {commander?.image && !imageError ? (
                  <Image
                    src={commander.image}
                    alt={commander.name}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                )}
              </div>
              {isCommanderOfMonth && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple-400 flex items-center justify-center shadow-lg">
                  <span className="text-xs">⚡</span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2 line-clamp-2">{commander?.name || '—'}</h3>
              <div className="space-y-2">
                <p className="text-white/90">
                  {commander?.wins || 0} partidas ganadas
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, ((commander?.wins || 0) / 10) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold">Popular</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 font-semibold hover:bg-white/30 transition-all duration-300">
              Ver estadísticas
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ProfessionalRecentMatches({ matches, theme }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-bold ${theme.text.strong}`}>
            Últimas Partidas
          </h2>
          <p className={`text-lg ${theme.text.soft} font-medium`}>
            Actividad reciente de la comunidad
          </p>
        </div>
        <Link
          href="/matches"
          className="group px-6 py-3 rounded-xl bg-white/80 backdrop-blur-sm font-semibold text-gray-800 border-2 border-gray-300 hover:border-gray-400 hover:bg-white transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center gap-2">
            <span>Ver todas</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Matches grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match, index) => (
          <div
            key={match.id}
            className="group crystal-card animate-professional-fade-in"
            style={{ 
              animationDelay: `${index * 100}ms`,
              '--glow-color': theme.colors.glowColor 
            }}
          >
            <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-white/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 h-full" padding="none">
              {/* Top accent */}
              <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`} />
              
              <div className="p-6">
                {/* Match header */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Commander image */}
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden border-2 border-gray-200 shadow-md flex-shrink-0">
                    {match.winner_image ? (
                      <Image
                        src={match.winner_image}
                        alt={match.game_name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="64px"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${theme.backgroundGradient} flex items-center justify-center`}>
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Match info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-lg ${theme.text.strong} mb-2 line-clamp-2 group-hover:text-opacity-80 transition-colors`}>
                      {match.game_name}
                    </h3>
                    
                    <div className="space-y-2">
                      {/* Date */}
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className={`text-sm ${theme.text.soft} font-medium`}>
                          {match.played_at ? format(new Date(match.played_at), 'dd/MM/yyyy • HH:mm') : '—'}
                        </p>
                      </div>

                      {/* Status badge */}
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${theme.colors.primary}`} />
                        <span className={`text-xs font-semibold uppercase tracking-wider ${theme.text.soft}`}>
                          Partida finalizada
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <Link
                  href={`/matches/${match.id}`}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed ${theme.border} ${theme.text.strong} hover:bg-gray-50 transition-all duration-300 text-sm font-semibold group-hover:border-solid`}
                >
                  <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver detalles de la partida
                </Link>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ===============================================================
   COMPONENTE PRINCIPAL ACTUALIZADO
   =============================================================== */
export default function ProfessionalHome({
  metrics = { totalMatches: 0, totalGames: 0 },
  latest = [],
  playerOfMonth = null,
  commanderOfMonth = null,
}) {
  const { theme, index: themeIndex } = useThemeRotation(40000) // 40 segundos
  const hasMatches = (latest || []).length > 0

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

      <div className="relative max-w-7xl mx-auto px-6 space-y-20">
        {/* Hero Section */}
        <ProfessionalHero theme={theme} />

        {/* Destacados - Solo Jugador y Comandante del Mes */}
        <ProfessionalSection
          title="Destacados del Mes"
          subtitle="Los mejores jugadores y comandantes de este mes"
          theme={theme}
          index={0}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Jugador del mes - PROTAGONISTA */}
            <ProfessionalPlayerCard 
              player={playerOfMonth} 
              theme={theme}
              isPlayerOfMonth={true}
            />

            {/* Comandante del mes - PROTAGONISTA */}
            <ProfessionalCommanderCard 
              commander={commanderOfMonth} 
              theme={theme}
              isCommanderOfMonth={true}
            />
          </div>
        </ProfessionalSection>

        {/* Recent Matches - REDISEÑADO */}
        {hasMatches ? (
          <ProfessionalRecentMatches matches={latest} theme={theme} />
        ) : (
          <ProfessionalSection
            title="Últimas Partidas"
            subtitle="Actividad reciente de la comunidad"
            theme={theme}
            index={1}
          >
            <ProfessionalEmptyState theme={theme} />
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

/* ===============================================================
   SSR - DATOS DEL SERVIDOR (MANTENIDO IGUAL)
   =============================================================== */
export async function getServerSideProps({ req, res }) {
  const supabase = createSupabaseServerClient(req, res)

  try {
    const [profilesRes, matchesRes, participantsRes, gamesRes] = await Promise.allSettled([
      supabase.from('profiles').select('id, nickname, email'),
      supabase.from('matches').select('id, winner, played_at, game_id').order('played_at', { ascending: false }),
      supabase.from('match_participants').select('match_id, user_id, commander_name, deck_commander, commander_image, commander_image_small, commander_image_normal, commander_art_crop'),
      supabase.from('games').select('id, name'),
    ])

    const profiles = profilesRes.status === 'fulfilled' ? profilesRes.value.data || [] : []
    const matches = matchesRes.status === 'fulfilled' ? matchesRes.value.data || [] : []
    const participants = participantsRes.status === 'fulfilled' ? participantsRes.value.data || [] : []
    const games = gamesRes.status === 'fulfilled' ? gamesRes.value.data || [] : []

    const totalMatches = matches.length
    const totalGames = games.length

    // Últimas 5 partidas
    const latest5Matches = matches.slice(0, 5)
    const gameNameById = Object.fromEntries(games.map(g => [g.id, g.name]))
    const winnerImageByMatch = {}

    latest5Matches.forEach(match => {
      const winnerParticipant = participants.find(p => p.match_id === match.id && p.user_id === match.winner)
      if (winnerParticipant) {
        winnerImageByMatch[match.id] =
          winnerParticipant.commander_art_crop ||
          winnerParticipant.commander_image_normal ||
          winnerParticipant.commander_image_small ||
          winnerParticipant.commander_image ||
          null
      }
    })

    const latest = latest5Matches.map(match => ({
      id: match.id,
      played_at: match.played_at,
      game_name: gameNameById[match.game_id] || 'Formato Desconocido',
      winner_image: winnerImageByMatch[match.id] || null,
    }))

    // Cálculo "del mes" (30 días atrás)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentMatches = matches.filter(m => m.played_at && new Date(m.played_at) >= thirtyDaysAgo)

    const winsByPlayer = {}
    recentMatches.forEach(match => {
      if (match.winner) {
        winsByPlayer[match.winner] = (winsByPlayer[match.winner] || 0) + 1
      }
    })

    const topPlayerEntry = Object.entries(winsByPlayer).sort((a, b) => b[1] - a[1])[0]
    let playerOfMonth = null
    if (topPlayerEntry) {
      const [playerId, wins] = topPlayerEntry
      const playerProfile = profiles.find(p => p.id === playerId)
      playerOfMonth = {
        user_id: playerId,
        name: playerProfile?.nickname || playerProfile?.email || 'Jugador Anónimo',
        wins: wins,
        win_rate: (wins / recentMatches.filter(m => m.winner === playerId).length) * 100 || 0
      }
    }

    // Commander del mes
    const recentMatchIds = recentMatches.map(m => m.id)
    const recentParticipants = participants.filter(p => recentMatchIds.includes(p.match_id))

    const winsByCommander = {}
    recentMatches.forEach(match => {
      const winnerParticipant = recentParticipants.find(p => p.match_id === match.id && p.user_id === match.winner)
      if (winnerParticipant) {
        const commanderName = winnerParticipant.commander_name || winnerParticipant.deck_commander
        const commanderImage =
          winnerParticipant.commander_art_crop ||
          winnerParticipant.commander_image_normal ||
          winnerParticipant.commander_image ||
          winnerParticipant.commander_image_small ||
          null
        if (commanderName) {
          if (!winsByCommander[commanderName]) {
            winsByCommander[commanderName] = { wins: 0, image: commanderImage }
          }
          winsByCommander[commanderName].wins += 1
          if (!winsByCommander[commanderName].image && commanderImage) {
            winsByCommander[commanderName].image = commanderImage
          }
        }
      }
    })

    const topCommanderEntry = Object.entries(winsByCommander).sort((a, b) => b[1].wins - a[1].wins)[0]
    let commanderOfMonth = null
    if (topCommanderEntry) {
      const [commanderName, data] = topCommanderEntry
      commanderOfMonth = { 
        name: commanderName, 
        wins: data.wins, 
        image: data.image 
      }
    }

    return {
      props: {
        metrics: { totalMatches, totalGames },
        latest,
        playerOfMonth,
        commanderOfMonth,
      }
    }
  } catch (error) {
    console.error('Error fetching home data:', error)
    return {
      props: {
        metrics: { totalMatches: 0, totalGames: 0 },
        latest: [],
        playerOfMonth: null,
        commanderOfMonth: null,
      }
    }
  }
}