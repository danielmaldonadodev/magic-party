'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'

const MIN_MATCHES = 5

/* ===============================================================
  SISTEMA DE TEMAS MTG PROFESIONAL COMPLETO - IDÉNTICO AL INDEX
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
  CSS PROFESIONAL REFINADO - MÁS SOBRIO
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

@keyframes premiumGlow {
  0%, 100% { 
    box-shadow: 0 0 20px var(--glow-color), 
                0 10px 40px rgba(0,0,0,0.1);
  }
  50% { 
    box-shadow: 0 0 30px var(--glow-color), 
                0 15px 50px rgba(0,0,0,0.15);
  }
}

@keyframes floatSubtle {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}

@keyframes crystalShine {
  0% { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(300%) rotate(45deg); }
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

.champion-glow {
  position: relative;
}

.champion-glow::after {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, #ffd700, #ffed4e, #ffd700);
  border-radius: inherit;
  z-index: -1;
  opacity: 0.6;
  animation: premiumGlow 4s ease-in-out infinite;
}

.animate-professional-fade-in {
  animation: professionalFadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
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

.podium-first {
  background: linear-gradient(145deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
}

.podium-second {
  background: linear-gradient(145deg, #c0c0c0 0%, #e5e5e5 50%, #c0c0c0 100%);
  box-shadow: 0 6px 20px rgba(192, 192, 192, 0.3);
}

.podium-third {
  background: linear-gradient(145deg, #cd7f32 0%, #daa520 50%, #cd7f32 100%);
  box-shadow: 0 4px 15px rgba(205, 127, 50, 0.3);
}
`

// Inyectar estilos
if (typeof document !== 'undefined' && !document.getElementById('refined-ranking-styles')) {
  const style = document.createElement('style')
  style.id = 'refined-ranking-styles'
  style.textContent = professionalCSS
  document.head.appendChild(style)
}

/* ===============================================================
  THEME ROTATION HOOK - IDÉNTICO AL INDEX
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
  UTILIDADES PARA IMÁGENES - BASADO EN EL NAVBAR
  =============================================================== */
function upgradeScryfall(url) {
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
  SKELETON PROFESIONAL
  =============================================================== */
function ProfessionalRankingSkeleton({ theme }) {
  return (
    <div className="space-y-6">
      {/* Podium skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="professional-glass rounded-2xl p-8 animate-pulse">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full" />
              <div className="h-6 w-32 bg-gray-200 rounded" />
              <div className="h-8 w-20 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Lista skeleton */}
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="professional-glass rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="w-16 h-16 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-100 rounded" />
            </div>
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ===============================================================
  PODIUM PROFESIONAL PARA EL TOP 3
  =============================================================== */
function ProfessionalPodium({ topThree, theme }) {
  const getPodiumHeight = (position) => {
    switch(position) {
      case 1: return 'h-24'
      case 2: return 'h-20'
      case 3: return 'h-16'
      default: return 'h-12'
    }
  }

  const getPodiumStyle = (position) => {
    switch(position) {
      case 1: return 'podium-first'
      case 2: return 'podium-second'  
      case 3: return 'podium-third'
      default: return 'bg-gray-300'
    }
  }

  const getPositionLabel = (position) => {
    switch(position) {
      case 1: return 'Campeón'
      case 2: return 'Subcampeón'
      case 3: return 'Tercer Lugar'
      default: return `Posición ${position}`
    }
  }

  const reorderedForDisplay = [
    topThree[1], // 2do lugar (izquierda)
    topThree[0], // 1er lugar (centro)
    topThree[2]  // 3er lugar (derecha)
  ].filter(Boolean)

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className={`text-4xl md:text-5xl font-black ${theme.text.strong} mb-4`}>
          Top 3 Jugadores
        </h2>
        <p className={`text-lg ${theme.text.soft} font-medium`}>
          Los mejores jugadores de Magic Party
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {reorderedForDisplay.map((player, displayIndex) => {
          if (!player) return null
          
          const actualPosition = displayIndex === 1 ? 1 : displayIndex === 0 ? 2 : 3
          const isChampion = actualPosition === 1
          
          return (
            <div 
              key={player.id}
              className={`animate-professional-fade-in ${isChampion ? 'md:order-2' : displayIndex === 0 ? 'md:order-1' : 'md:order-3'}`}
              style={{ animationDelay: `${displayIndex * 200}ms` }}
            >
              <Link href={`/players/${player.id}`}>
                <div className={`crystal-card ${isChampion ? 'champion-glow animate-premium-glow' : ''}`}
                     style={{ '--glow-color': theme.colors.glowColor }}>
                  
                  <div className="professional-glass rounded-2xl p-6 text-center hover:scale-105 transition-all duration-500">
                    {/* Posición */}
                    <div className="mb-4">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-black text-white mb-2 ${
                        actualPosition === 1 ? 'bg-yellow-500' :
                        actualPosition === 2 ? 'bg-gray-500' :
                        'bg-orange-600'
                      }`}>
                        #{actualPosition}
                      </div>
                    </div>

                    {/* Avatar del jugador */}
                    <div className={`relative mx-auto w-20 h-20 rounded-full mb-4 ${
                      isChampion ? 'ring-4 ring-yellow-400 ring-opacity-75' : 'ring-2 ring-white ring-opacity-50'
                    } overflow-hidden shadow-xl`}>
                      {player.highlightImage ? (
                        <img
                          src={player.highlightImage}
                          alt={player.nickname || 'Jugador'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${theme.colors.primary} flex items-center justify-center text-2xl font-black text-white`}>
                          {(player.nickname || '?').slice(0,1).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Información del jugador */}
                    <h3 className={`text-xl font-black ${theme.text.strong} mb-2 ${isChampion ? 'text-2xl' : ''}`}>
                      {player.nickname || 'Jugador'}
                    </h3>
                    
                    {/* Título */}
                    <div className={`mb-3 px-3 py-1 rounded-full text-xs font-bold ${
                      actualPosition === 1 ? 'bg-yellow-100 text-yellow-800' :
                      actualPosition === 2 ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {getPositionLabel(actualPosition)}
                    </div>

                    {/* Estadísticas */}
                    <div className="space-y-2">
                      <div className={`text-3xl font-black ${
                        player.winRate >= 70 ? 'text-green-600' : 
                        player.winRate >= 50 ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {player.winRate?.toFixed(1)}%
                      </div>
                      
                      <div className={`text-sm ${theme.text.soft} space-y-1`}>
                        <div>{player.totalWins} victorias</div>
                        <div>{player.totalPlayed} partidas</div>
                      </div>
                    </div>

                    {/* Podium base */}
                    <div className={`mt-4 mx-auto w-full ${getPodiumHeight(actualPosition)} ${getPodiumStyle(actualPosition)} rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg`}>
                      {getPositionLabel(actualPosition)}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ===============================================================
  CARD DE RANKING PROFESIONAL
  =============================================================== */
function ProfessionalRankingCard({ player, position, theme }) {
  const isTopTier = position <= 10
  const winrate = typeof player.winRate === 'number' ? player.winRate : 0
  
  const getWinrateColor = (rate) => {
    if (rate >= 80) return 'text-purple-700'
    if (rate >= 70) return 'text-green-700'
    if (rate >= 60) return 'text-blue-700'
    if (rate >= 50) return 'text-orange-700'
    return 'text-gray-700'
  }

  const getPlayerBadge = (pos, rate) => {
    if (pos <= 5) return { label: 'Elite', color: 'bg-purple-100 text-purple-800' }
    if (pos <= 10) return { label: 'Expert', color: 'bg-blue-100 text-blue-800' }
    if (rate >= 70) return { label: 'Veteran', color: 'bg-green-100 text-green-800' }
    if (rate >= 60) return { label: 'Skilled', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Player', color: 'bg-gray-100 text-gray-700' }
  }

  const badge = getPlayerBadge(position, winrate)

  return (
    <Link href={`/players/${player.id}`} className="block">
      <div 
        className={`crystal-card animate-professional-fade-in ${isTopTier ? 'animate-premium-glow' : ''}`}
        style={{ 
          animationDelay: `${position * 50}ms`,
          '--glow-color': isTopTier ? theme.colors.glowColor : 'transparent'
        }}
      >
        <div className="professional-glass rounded-2xl hover:scale-105 transition-all duration-500 overflow-hidden">
          {/* Barra superior de color del tema */}
          <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`} />
          
          <div className="p-6">
            <div className="flex items-center gap-4">
              {/* Posición */}
              <div className="flex-shrink-0">
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${
                  position <= 3 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' :
                  position <= 10 ? `bg-gradient-to-br ${theme.colors.primary} text-white shadow-md` :
                  'bg-gray-100 text-gray-700'
                }`}>
                  #{position}
                </div>
              </div>

              {/* Avatar del jugador */}
              <div className={`w-16 h-16 rounded-full ${
                isTopTier ? `ring-4 ${theme.border} ring-opacity-50` : 'ring-2 ring-gray-200'
              } overflow-hidden shadow-lg flex-shrink-0`}>
                {player.highlightImage ? (
                  <img
                    src={player.highlightImage}
                    alt={player.nickname || 'Jugador'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${theme.colors.primary} flex items-center justify-center text-xl font-black text-white`}>
                    {(player.nickname || '?').slice(0,1).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Información del jugador */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-xl font-black ${theme.text.strong} truncate`}>
                    {player.nickname || 'Jugador'}
                  </h3>
                  {isTopTier && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-float-subtle" />
                  )}
                </div>
                
                {/* Badge del jugador */}
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold mb-2 ${badge.color}`}>
                  {badge.label}
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={theme.text.soft}>
                      <span className="font-bold">{player.totalWins}</span> victorias
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className={theme.text.soft}>
                      <span className="font-bold">{player.totalPlayed}</span> partidas
                    </span>
                  </div>
                </div>
              </div>

              {/* Win Rate */}
              <div className="text-right flex-shrink-0">
                <div className={`text-2xl font-black ${getWinrateColor(winrate)} mb-1`}>
                  {winrate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 font-bold">
                  WIN RATE
                </div>
                
                {/* Barra de progreso */}
                <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${
                      winrate >= 80 ? 'from-purple-500 to-pink-500' :
                      winrate >= 70 ? 'from-green-500 to-emerald-500' :
                      winrate >= 60 ? 'from-blue-500 to-indigo-500' :
                      winrate >= 50 ? 'from-orange-500 to-yellow-500' :
                      'from-gray-400 to-gray-500'
                    } transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(100, winrate)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ===============================================================
  ESTADÍSTICAS PROFESIONALES
  =============================================================== */
function ProfessionalStats({ totalPlayers, eligiblePlayers, theme }) {
  const stats = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-3a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      value: totalPlayers,
      label: 'Jugadores Totales',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      value: eligiblePlayers,
      label: 'En el Ranking',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      value: MIN_MATCHES,
      label: 'Partidas Mínimas',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="crystal-card animate-professional-fade-in"
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <div className="professional-glass rounded-2xl p-6 text-center hover:scale-105 transition-all duration-500">
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} text-white text-xl font-black mb-4 shadow-lg`}>
              {stat.icon}
            </div>
            <div className={`text-3xl font-black ${theme.text.strong} mb-2`}>
              {stat.value.toLocaleString()}
            </div>
            <div className={`text-sm font-bold ${theme.text.soft} uppercase tracking-wider`}>
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ===============================================================
  PÁGINA PRINCIPAL REFINADA
  =============================================================== */
export default function RefinedRanking() {
  const { theme, index: themeIndex } = useThemeRotation(40000)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Cargar estadísticas básicas
        const { data: stats, error: statsError } = await supabase
          .from('player_stats_view')
          .select('id, nickname, total_played, total_wins, win_rate')

        if (statsError) throw statsError

        // Cargar información de perfil para imágenes
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, avatar_url, highlight_image_preference')

        if (profilesError) throw profilesError

        // Cargar comandantes más usados para aquellos con preferencia de comandante
        const commanderPrefs = profiles.filter(p => p.highlight_image_preference === 'commander')
        let commanderImages = {}
        
        if (commanderPrefs.length > 0) {
          const { data: topCommanders, error: cmdError } = await supabase
            .from('commander_stats_by_user')
            .select('user_id, last_image_url')
            .in('user_id', commanderPrefs.map(p => p.id))
            .order('games_played', { ascending: false })

          if (!cmdError && topCommanders) {
            commanderImages = topCommanders.reduce((acc, cmd) => {
              if (!acc[cmd.user_id]) {
                acc[cmd.user_id] = upgradeScryfall(cmd.last_image_url)
              }
              return acc
            }, {})
          }
        }

        // Combinar datos
        const mapped = (stats || []).map(p => {
          const profile = profiles.find(prof => prof.id === p.id)
          const avatarUrl = profile?.avatar_url || ''
          const preference = profile?.highlight_image_preference || 'profile'
          const commanderImage = commanderImages[p.id] || ''

          let highlightImage = ''
          if (preference === 'commander') {
            highlightImage = commanderImage || avatarUrl
          } else {
            highlightImage = avatarUrl || commanderImage
          }

          return {
            id: p.id,
            nickname: p.nickname,
            totalPlayed: p.total_played,
            totalWins: p.total_wins,
            winRate: p.win_rate,
            highlightImage: upgradeScryfall(highlightImage)
          }
        })

        setRows(mapped)
        setLoading(false)
      } catch (err) {
        console.error('Error loading ranking data:', err)
        setError(err.message)
        setRows([])
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const filteredSorted = useMemo(() => {
    return rows
      .filter(x => (x.totalPlayed ?? 0) >= MIN_MATCHES)
      .sort((a, b) =>
        (b.winRate ?? 0) - (a.winRate ?? 0) ||
        (b.totalPlayed ?? 0) - (a.totalPlayed ?? 0) ||
        (b.totalWins ?? 0) - (a.totalWins ?? 0) ||
        (a.nickname || '').localeCompare(b.nickname || '')
      )
  }, [rows])

  const topThree = filteredSorted.slice(0, 3)
  const restOfRanking = filteredSorted.slice(3)
  const eligiblePlayers = rows.filter(x => (x.totalPlayed ?? 0) >= MIN_MATCHES).length
  const totalPlayers = rows.length

  return (
    <>
      <Head>
        <title>Ranking de Jugadores · Magic Party</title>
        <meta
          name="description"
          content={`Descubre a los mejores jugadores de Magic Party. Rankings profesionales basados en tasa de victoria con un mínimo de ${MIN_MATCHES} partidas.`}
        />
      </Head>

      <div 
        className="min-h-screen theme-transition"
        style={{ 
          background: `linear-gradient(135deg, ${theme.backgroundGradient})`,
          '--glow-color': theme.colors.glowColor
        }}
      >
        {/* Efectos de fondo profesionales */}
        <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-r from-white/8 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-white/8 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Header profesional */}
          <div 
            className={`text-center space-y-6 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s' }}
          >
            {/* Theme indicator */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full professional-glass">
              <span className="text-xl">{theme.icon}</span>
              <span className={`font-bold text-lg ${theme.text.strong}`}>
                {theme.label}
              </span>
            </div>

            {/* Título profesional */}
            <div className="space-y-4">
              <h1 className={`text-4xl md:text-6xl font-black ${theme.text.strong}`}>
                Ranking de Jugadores
              </h1>
              <p className={`text-xl md:text-2xl ${theme.text.soft} font-medium max-w-4xl mx-auto`}>
                Clasificación oficial de los mejores jugadores de Magic Party
              </p>
              <p className={`text-lg ${theme.text.soft} opacity-80`}>
                {theme.fact}
              </p>
            </div>
          </div>

          {/* Estadísticas profesionales */}
          {!loading && (
            <ProfessionalStats 
              totalPlayers={totalPlayers} 
              eligiblePlayers={eligiblePlayers} 
              theme={theme} 
            />
          )}

          {/* Loading profesional */}
          {loading && <ProfessionalRankingSkeleton theme={theme} />}

          {/* Error profesional */}
          {error && (
            <div className="crystal-card animate-professional-fade-in">
              <div className="professional-glass rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className={`text-2xl font-black ${theme.text.strong} mb-2`}>
                  Error al cargar el ranking
                </h3>
                <p className={`${theme.text.soft} mb-6`}>
                  No se pudieron cargar los datos del ranking: {error}
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className={`px-6 py-3 rounded-xl ${theme.gradient} text-white font-bold hover:scale-105 transition-all duration-300`}
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {/* Empty state profesional */}
          {!loading && !error && filteredSorted.length === 0 && (
            <div className="crystal-card animate-professional-fade-in">
              <div className="professional-glass rounded-2xl p-12 text-center">
                <div className="text-6xl mb-6">🏆</div>
                <h3 className={`text-3xl font-black ${theme.text.strong} mb-4`}>
                  Ranking no disponible
                </h3>
                <p className={`text-xl ${theme.text.soft} max-w-2xl mx-auto mb-8`}>
                  Aún no hay suficientes jugadores con {MIN_MATCHES} o más partidas 
                  para generar el ranking oficial.
                </p>
                <Link
                  href="/matches/new"
                  className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl ${theme.gradient} text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Crear primera partida
                </Link>
              </div>
            </div>
          )}

          {/* Podium profesional */}
          {!loading && !error && topThree.length > 0 && (
            <ProfessionalPodium topThree={topThree} theme={theme} />
          )}

          {/* Resto del ranking */}
          {!loading && !error && restOfRanking.length > 0 && (
            <div className="space-y-4">
              <h3 className={`text-2xl font-black ${theme.text.strong} text-center mb-6`}>
                Otros Jugadores Destacados
              </h3>
              {restOfRanking.map((player, index) => (
                <ProfessionalRankingCard
                  key={player.id}
                  player={player}
                  position={index + 4}
                  theme={theme}
                />
              ))}
            </div>
          )}

          {/* Metodología profesional */}
          {!loading && !error && filteredSorted.length > 0 && (
            <div className="crystal-card animate-professional-fade-in">
              <div className="professional-glass rounded-2xl p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className={`text-2xl font-black ${theme.text.strong} mb-4`}>
                      Metodología del Ranking
                    </h4>
                    <div className={`text-lg ${theme.text.soft} space-y-2`}>
                      <p><strong>Criterio principal:</strong> Tasa de victoria (% de partidas ganadas)</p>
                      <p><strong>Requisito mínimo:</strong> {MIN_MATCHES} partidas jugadas para aparecer en el ranking</p>
                      <p><strong>Desempates:</strong> Más partidas jugadas → más victorias → orden alfabético</p>
                      <p><strong>Actualización:</strong> Los rankings se actualizan automáticamente tras cada partida</p>
                      <p><strong>Clasificación:</strong> Elite (Top 5), Expert (Top 10), Veteran (70%+), Skilled (60%+)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Theme progress indicator */}
          <div 
            className={`text-center ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.6s' }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
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
        </div>
      </div>
    </>
  )
}