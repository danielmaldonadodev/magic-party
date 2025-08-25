// pages/decks/index.js - Versión profesional MTG mejorada
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../../lib/supabaseClient'
import Card from '../../components/Card'
import DeckCard from '../../components/DeckCard'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

/* ===============================================================
  SISTEMA DE TEMAS MTG PROFESIONAL MEJORADO
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
    fact: 'Orden y estructura. La biblioteca perfecta requiere disciplina.',
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
    fact: 'Conocimiento es poder. Cada mazo enseña una nueva lección.',
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
    fact: 'Ambición sin límites. Cada mazo es un paso hacia la dominación.',
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
    fact: 'Velocidad y agresividad. No hay tiempo para la duda.',
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
    fact: 'El crecimiento es inevitable. La naturaleza siempre encuentra un camino.',
  },
  // Guildas
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
    fact: 'Ley y orden. La organización perfecta define la victoria.',
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
    fact: 'Evolución constante. Cada mazo es un experimento en progreso.',
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
    fact: 'Genio e impulso. La creatividad no conoce límites.',
  },
]

const DEFAULT_THEME_KEY = 'azorius'

/* ===============================================================
  CSS PROFESIONAL CON EFECTOS PREMIUM
  =============================================================== */
const enhancedProfessionalCSS = `
  @keyframes professionalFadeIn {
    from { 
      opacity: 0; 
      transform: translateY(30px) scale(0.95); 
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
    50% { transform: translateY(-8px); }
  }

  @keyframes pulseGlow {
    0%, 100% { 
      opacity: 0.8; 
      transform: scale(1); 
    }
    50% { 
      opacity: 1; 
      transform: scale(1.05); 
    }
  }

  @keyframes modalBackdropIn {
    from { opacity: 0; backdrop-filter: blur(0px); }
    to { opacity: 1; backdrop-filter: blur(12px); }
  }

  @keyframes modalContentIn {
    from { 
      opacity: 0; 
      transform: scale(0.9) translateY(20px); 
    }
    to { 
      opacity: 1; 
      transform: scale(1) translateY(0); 
    }
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
    transition: left 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    z-index: 1;
    pointer-events: none;
  }

  .crystal-card:hover::before {
    left: 100%;
  }

  .animate-professional-fade-in {
    animation: professionalFadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  .animate-premium-glow {
    animation: premiumGlow 4s ease-in-out infinite;
  }

  .animate-float-subtle {
    animation: floatSubtle 8s ease-in-out infinite;
  }

  .animate-pulse-glow {
    animation: pulseGlow 3s ease-in-out infinite;
  }

  .theme-transition {
    transition: all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .mobile-optimized {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .loading-skeleton {
    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
    background-size: 200% 100%;
    animation: loading-shimmer 2s infinite;
  }

  @keyframes loading-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .modal-backdrop {
    animation: modalBackdropIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  .modal-content {
    animation: modalContentIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  @media (hover: none) and (pointer: coarse) {
    .crystal-card:active {
      transform: scale(0.98);
      transition: transform 0.1s ease;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .crystal-card::before,
    .animate-professional-fade-in,
    .animate-premium-glow,
    .animate-float-subtle,
    .animate-pulse-glow {
      animation: none !important;
      transition: opacity 0.2s ease !important;
    }
  }
`

// Inyectar estilos mejorados
if (typeof document !== 'undefined' && !document.getElementById('enhanced-professional-decks-styles')) {
  const style = document.createElement('style')
  style.id = 'enhanced-professional-decks-styles'
  style.textContent = enhancedProfessionalCSS
  document.head.appendChild(style)
}
/* ===============================================================
  HOOK DE ROTACIÓN DE TEMAS MEJORADO CON PAUSA
  =============================================================== */
function useThemeRotation(intervalMs = 40000) {
  const [themeKey, setThemeKey] = useState(DEFAULT_THEME_KEY)
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mp_professional_theme_decks')
      const savedPaused = localStorage.getItem('mp_theme_paused_decks') === 'true'
      
      if (saved) {
        const idx = MTG_PROFESSIONAL_THEMES.findIndex(t => t.key === saved)
        if (idx >= 0) {
          setThemeKey(saved)
          setIndex(idx)
        }
      }
      setIsPaused(savedPaused)
    } catch (e) {
      console.warn('Error accessing localStorage:', e)
    }
  }, [])

  useEffect(() => {
    if (timer.current) clearInterval(timer.current)
    
    if (!isPaused) {
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
    }
    
    return () => timer.current && clearInterval(timer.current)
  }, [intervalMs, isPaused])

  const theme = useMemo(() => {
    const found = MTG_PROFESSIONAL_THEMES.find(t => t.key === themeKey)
    return found || MTG_PROFESSIONAL_THEMES[0]
  }, [themeKey])

  const togglePause = useCallback(() => {
    const newPaused = !isPaused
    setIsPaused(newPaused)
    try {
      localStorage.setItem('mp_theme_paused_decks', String(newPaused))
    } catch (e) {}
  }, [isPaused])

  const switchToTheme = useCallback((newThemeKey) => {
    const idx = MTG_PROFESSIONAL_THEMES.findIndex(t => t.key === newThemeKey)
    if (idx >= 0) {
      setThemeKey(newThemeKey)
      setIndex(idx)
      try { 
        localStorage.setItem('mp_professional_theme_decks', newThemeKey) 
      } catch (e) {}
    }
  }, [])

  return { 
    theme, 
    themeKey, 
    setThemeKey: switchToTheme, 
    index, 
    setIndex, 
    isPaused, 
    togglePause 
  }
}

/* ===============================================================
  HOOK DE FILTROS MEJORADO CON PERSISTENCIA
  =============================================================== */
function useDecksFilters() {
  const [filters, setFilters] = useState({
    search: '',
    format: '',
    showOnlyMine: false
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Cargar filtros persistidos
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mp_decks_filters')
      if (saved) {
        const parsedFilters = JSON.parse(saved)
        setFilters(parsedFilters)
      }
    } catch (e) {
      console.warn('Error loading saved filters:', e)
    }
  }, [])

  // Guardar filtros cuando cambien
  useEffect(() => {
    try {
      localStorage.setItem('mp_decks_filters', JSON.stringify(filters))
    } catch (e) {
      console.warn('Error saving filters:', e)
    }
  }, [filters])

  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters)
    setError('') // Limpiar error al cambiar filtros
  }, [])

  const resetFilters = useCallback(() => {
    const resetFilters = { search: '', format: '', showOnlyMine: false }
    setFilters(resetFilters)
    setError('')
  }, [])

  const hasActiveFilters = useMemo(() => {
    return filters.search || filters.format || filters.showOnlyMine
  }, [filters])

  return {
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    loading,
    setLoading,
    error,
    setError
  }
}

/* ===============================================================
  HOOK DE PAGINACIÓN AVANZADO
  =============================================================== */
function usePagination(initialPagination = {}) {
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    ...initialPagination
  })

  const canGoNext = useMemo(() => {
    return pagination.page < pagination.totalPages
  }, [pagination.page, pagination.totalPages])

  const canGoPrevious = useMemo(() => {
    return pagination.page > 1
  }, [pagination.page])

  const getPageNumbers = useCallback(() => {
    const { page, totalPages } = pagination
    const pages = []
    const maxVisible = 7 // Más páginas visibles en desktop
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
      return pages
    }
    
    let start = Math.max(1, page - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    return pages
  }, [pagination])

  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }))
  }, [])

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page }))
      return page
    }
    return pagination.page
  }, [pagination.page, pagination.totalPages])

  const nextPage = useCallback(() => {
    if (canGoNext) {
      return goToPage(pagination.page + 1)
    }
    return pagination.page
  }, [canGoNext, goToPage, pagination.page])

  const previousPage = useCallback(() => {
    if (canGoPrevious) {
      return goToPage(pagination.page - 1)
    }
    return pagination.page
  }, [canGoPrevious, goToPage, pagination.page])

  return {
    pagination,
    updatePagination,
    goToPage,
    nextPage,
    previousPage,
    canGoNext,
    canGoPrevious,
    getPageNumbers
  }
}

/* ===============================================================
  ESTADOS DE CARGA MEJORADOS
  =============================================================== */
function ProfessionalLoadingSkeleton({ theme }) {
  return (
    <div 
      className="min-h-screen theme-transition"
      style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})` }}
    >
      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="space-y-8 sm:space-y-12">
          {/* Hero Section Skeleton */}
          <section className="relative overflow-hidden py-8 sm:py-12 lg:py-16">
            <div className="text-center space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Theme indicator skeleton */}
              <div className="loading-skeleton h-12 w-32 rounded-full mx-auto" />
              
              {/* Title skeleton */}
              <div className="space-y-4">
                <div className="loading-skeleton h-16 sm:h-20 md:h-24 lg:h-28 w-full max-w-4xl mx-auto rounded-xl" />
                <div className="loading-skeleton h-6 w-3/4 max-w-3xl mx-auto rounded-lg" />
              </div>
              
              {/* Stats skeleton */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                <div className="loading-skeleton h-16 w-32 rounded-xl" />
                <div className="loading-skeleton h-16 w-32 rounded-xl" />
              </div>
              
              {/* Action button skeleton */}
              <div className="loading-skeleton h-14 w-64 mx-auto rounded-xl" />
            </div>
          </section>

          {/* Filters skeleton */}
          <div className="crystal-card">
            <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg" padding="lg">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.colors.primary} opacity-50`} />
              <div className="space-y-4">
                <div className="loading-skeleton h-6 w-48 rounded" />
                <div className="grid gap-3 lg:grid-cols-4">
                  <div className="lg:col-span-2 loading-skeleton h-12 rounded-lg" />
                  <div className="loading-skeleton h-12 rounded-lg" />
                  <div className="loading-skeleton h-12 rounded-lg" />
                </div>
                <div className="flex gap-3">
                  <div className="loading-skeleton h-12 w-24 rounded-lg" />
                  <div className="loading-skeleton h-12 w-24 rounded-lg" />
                </div>
              </div>
            </Card>
          </div>

          {/* Stats skeleton */}
          <div className="crystal-card">
            <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg" padding="lg">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.colors.primary} opacity-50`} />
              <div className="flex items-center gap-6">
                <div className="loading-skeleton w-16 h-16 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="loading-skeleton h-8 w-32 rounded" />
                  <div className="loading-skeleton h-4 w-64 rounded" />
                </div>
              </div>
            </Card>
          </div>

          {/* Decks grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i} 
                className="crystal-card animate-professional-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg" padding="none">
                  <div className={`h-1 bg-gradient-to-r ${theme.colors.primary} opacity-50`} />
                  <div className="animate-pulse">
                    <div className="h-40 sm:h-48 bg-gray-200" />
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
      </div>
    </div>
  )
}

/* ===============================================================
  ESTADOS DE ERROR MEJORADOS
  =============================================================== */
function ProfessionalErrorState({ theme, error, onRetry }) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true)
      try {
        await onRetry()
      } finally {
        setIsRetrying(false)
      }
    }
  }

  return (
    <div 
      className="min-h-screen theme-transition flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})` }}
    >
      {/* Decorative elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-l from-red-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-red-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="crystal-card max-w-2xl mx-4">
        <Card className="text-center bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-red-200" padding="xl">
          {/* Error icon */}
          <div className="w-20 h-20 rounded-full bg-red-100 border-4 border-red-200 flex items-center justify-center mx-auto mb-6 animate-float-subtle shadow-lg">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          {/* Error content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Error al cargar los mazos</h2>
            <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200 mb-4">
              <p className="text-red-800 leading-relaxed font-medium">
                {error || 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.'}
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {onRetry && (
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className={`
                    inline-flex items-center gap-3 px-6 py-3 rounded-xl text-white font-bold 
                    transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 
                    shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                    bg-gradient-to-r ${theme.colors.primary} ${theme.colors.ring}
                  `}
                >
                  <svg className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isRetrying ? 'Reintentando...' : 'Reintentar'}
                </button>
              )}
              
              <Link
                href="/"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Ir al inicio
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
/* ===============================================================
  COMPONENTE HERO MEJORADO
  =============================================================== */
function ProfessionalDecksHero({ theme, user, totalDecks }) {
  const [loaded, setLoaded] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(timer)
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
      
      {/* Elementos decorativos mejorados */}
      <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-gradient-to-l from-white/20 to-transparent rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-6 sm:space-y-8">
          {/* Indicador de tema mejorado */}
          <div 
            className={`inline-flex items-center gap-3 px-6 py-3 rounded-full professional-glass ${
              loaded ? 'animate-professional-fade-in' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.2s' }}
          >
            <span className="text-2xl animate-float-subtle">{theme.icon}</span>
            <div>
              <span className={`font-bold text-base lg:text-lg ${theme.text.strong}`}>
                {theme.label}
              </span>
              <p className={`text-xs ${theme.text.soft} italic hidden sm:block`}>
                {theme.fact}
              </p>
            </div>
          </div>

          {/* Título principal mejorado */}
          <div 
            className={`space-y-4 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.4s' }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
              <span className={`${theme.text.strong} block animate-float-subtle`}>
                Biblioteca
              </span>
              <span className="text-gray-900 block sm:inline sm:ml-4 lg:ml-6">de Mazos</span>
            </h1>
            
            <p className={`text-base sm:text-lg md:text-xl lg:text-2xl ${theme.text.soft} max-w-4xl mx-auto leading-relaxed font-medium`}>
              Explora, gestiona y perfecciona tu colección de mazos de Magic: The Gathering. 
              Cada lista cuenta una historia única de estrategia y creatividad.
            </p>

            {/* Estadísticas mejoradas */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 mt-8">
              <div className="text-center">
                <div className={`text-3xl sm:text-4xl lg:text-5xl font-black ${theme.text.strong} animate-pulse-glow`}>
                  {totalDecks.toLocaleString()}
                </div>
                <div className={`text-sm sm:text-base ${theme.text.soft} font-semibold`}>
                  mazos disponibles
                </div>
              </div>
              {user && (
                <div className="text-center">
                  <div className={`text-3xl sm:text-4xl lg:text-5xl font-black ${theme.text.strong} animate-pulse-glow`}>
                    ∞
                  </div>
                  <div className={`text-sm sm:text-base ${theme.text.soft} font-semibold`}>
                    posibilidades
                  </div>
                </div>
              )}
            </div>
            
            <div className={`mt-4 text-sm sm:text-base ${theme.text.soft} opacity-80`}>
              <span className="font-bold">Filosofía de deckbuilding: </span>
              <span className="italic">{theme.fact}</span>
            </div>
          </div>

          {/* Botones de acción mejorados */}
          <div 
            className={`flex flex-col gap-4 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.6s' }}
          >
            {user ? (
              <Link
                href="/decks/new"
                className={`group relative mx-auto px-8 py-4 rounded-xl ${theme.gradient} text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 ${theme.colors.ring}`}
              >
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-3">
                  <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Importar Nuevo Mazo
                </div>
              </Link>
            ) : (
              <div className="mx-auto px-8 py-4 rounded-xl bg-white/80 backdrop-blur-sm font-bold text-gray-700 border-2 border-gray-300 text-lg shadow-lg">
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

/* ===============================================================
  COMPONENTE DE FILTROS MEJORADO
  =============================================================== */
function ProfessionalDecksFilters({ theme, filters, onFiltersChange, userLoggedIn, loading }) {
  const [localFilters, setLocalFilters] = useState(filters)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    onFiltersChange(localFilters)
    setIsExpanded(false) // Colapsar en móvil después de buscar
  }

  const handleReset = () => {
    const resetFilters = { search: '', format: '', showOnlyMine: false }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const hasActiveFilters = localFilters.search || localFilters.format || localFilters.showOnlyMine

  return (
    <div 
      className="crystal-card animate-professional-fade-in mobile-optimized"
      style={{ '--glow-color': theme.colors.glowColor }}
    >
      <Card className="relative overflow-hidden bg-white/95 backdrop-blur-sm border-2 border-white/60 shadow-lg hover:shadow-xl transition-all duration-500" padding="lg">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.colors.primary}`} />
        
        {/* Header con toggle móvil */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.colors.primary} flex items-center justify-center shadow-lg animate-float-subtle`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold ${theme.text.strong}`}>
                Explorador de Mazos
              </h2>
              <p className={`text-sm ${theme.text.soft} font-medium`}>
                Encuentra el mazo perfecto para tu estilo de juego
              </p>
            </div>
          </div>
          
          {/* Toggle móvil */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              sm:hidden p-3 rounded-xl font-semibold transition-all duration-300 
              shadow-lg hover:shadow-xl hover:scale-105
              ${isExpanded 
                ? `bg-gradient-to-r ${theme.colors.primary} text-white` 
                : 'bg-white/90 text-gray-700 hover:bg-white border border-gray-200'
              }
            `}
            aria-expanded={isExpanded}
          >
            <svg className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Contenido de filtros */}
        <div className={`
          transition-all duration-500 ease-in-out overflow-hidden
          ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 sm:max-h-96 opacity-0 sm:opacity-100'} 
        `}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-4">
              {/* Búsqueda mejorada */}
              <div className="lg:col-span-2">
                <label className={`mb-3 block text-sm font-bold ${theme.text.strong} uppercase tracking-wider`}>
                  Búsqueda Inteligente
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Nombre, comandante, estrategia, colores..."
                    value={localFilters.search}
                    onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="block w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-12 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:border-gray-300"
                  />
                  {localFilters.search && (
                    <button 
                      type="button" 
                      onClick={() => setLocalFilters(prev => ({ ...prev, search: '' }))}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Filtro de formato */}
              <div>
                <label className={`mb-3 block text-sm font-bold ${theme.text.strong} uppercase tracking-wider`}>
                  Formato
                </label>
                <div className="relative">
                  <select
                    value={localFilters.format}
                    onChange={(e) => setLocalFilters(prev => ({ ...prev, format: e.target.value }))}
                    className="block w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-4 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none transition-all duration-300 hover:border-gray-300"
                  >
                    <option value="">Todos los formatos</option>
                    <option value="Commander">Commander</option>
                    <option value="Modern">Modern</option>
                    <option value="Standard">Standard</option>
                    <option value="Legacy">Legacy</option>
                    <option value="Vintage">Vintage</option>
                    <option value="Pioneer">Pioneer</option>
                    <option value="Pauper">Pauper</option>
                    <option value="Historic">Historic</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Toggle mis mazos */}
              <div>
                <label className={`mb-3 block text-sm font-bold ${theme.text.strong} uppercase tracking-wider`}>
                  Propietario
                </label>
                <label className={`flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-white p-3 cursor-pointer hover:bg-gray-50 transition-all duration-300 ${!userLoggedIn ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}`}>
                  <input
                    type="checkbox"
                    checked={localFilters.showOnlyMine}
                    onChange={(e) => setLocalFilters(prev => ({ ...prev, showOnlyMine: e.target.checked }))}
                    disabled={!userLoggedIn}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50"
                  />
                  <span className="text-sm font-semibold text-gray-700">Solo mis mazos</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl ${theme.gradient} text-white ${theme.colors.ring}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Buscando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Buscar Mazos
                  </div>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-8 py-3 rounded-xl border-2 border-gray-300 bg-white text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Limpiar Filtros
              </button>
            </div>

            {/* Indicador de filtros activos */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between rounded-xl border-2 border-blue-200 bg-blue-50/50 p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r ${theme.colors.primary} shadow-lg`}>
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${theme.text.strong}`}>Filtros Aplicados</p>
                    <p className="text-xs text-gray-600">Resultados personalizados</p>
                  </div>
                </div>
                <button 
                  onClick={handleReset} 
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limpiar
                </button>
              </div>
            )}
          </form>
        </div>
      </Card>
    </div>
  )
}
/* ===============================================================
  COMPONENTE DE ESTADÍSTICAS MEJORADO
  =============================================================== */
function ProfessionalDecksStats({ theme, totalDecks, loading, additionalStats = {} }) {
  const stats = [
    {
      value: totalDecks,
      label: 'mazos en la biblioteca',
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      highlight: true
    },
    {
      value: additionalStats.formats || 8,
      label: 'formatos disponibles',
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      value: additionalStats.commanders || '500+',
      label: 'comandantes únicos',
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    }
  ]

  return (
    <div 
      className="crystal-card animate-professional-fade-in"
      style={{ '--glow-color': theme.colors.glowColor, animationDelay: '0.2s' }}
    >
      <Card className="relative overflow-hidden bg-white/95 backdrop-blur-sm border-2 border-white/60 shadow-lg hover:shadow-xl transition-all duration-500" padding="lg">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.colors.primary}`} />
        
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.colors.primary} flex items-center justify-center shadow-lg animate-float-subtle`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold ${theme.text.strong}`}>
                Estado de la Biblioteca
              </h2>
              <p className={`text-sm ${theme.text.soft} font-medium`}>
                Estadísticas actualizadas en tiempo real
              </p>
            </div>
          </div>

          {/* Stats grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`
                    group relative rounded-xl p-4 transition-all duration-300 hover:scale-105
                    ${stat.highlight 
                      ? `bg-gradient-to-br ${theme.colors.primary} text-white shadow-lg hover:shadow-xl animate-premium-glow` 
                      : 'bg-white border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                    }
                  `}
                  style={stat.highlight ? { '--glow-color': theme.colors.glowColor } : {}}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center
                      ${stat.highlight 
                        ? 'bg-white/20 backdrop-blur-sm' 
                        : `bg-gradient-to-br ${theme.colors.primary} shadow-lg`
                      }
                    `}>
                      {stat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`
                        text-2xl sm:text-3xl font-black leading-none
                        ${stat.highlight ? 'text-white' : theme.text.strong}
                      `}>
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </div>
                      <div className={`
                        text-xs sm:text-sm font-semibold mt-1
                        ${stat.highlight ? 'text-white/90' : theme.text.soft}
                      `}>
                        {stat.label}
                      </div>
                    </div>
                  </div>
                  
                  {stat.highlight && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

/* ===============================================================
  ESTADO VACÍO MEJORADO CON ILUSTRACIONES
  =============================================================== */
function ProfessionalEmptyState({ theme, filters, user, hasActiveFilters }) {
  const isEmpty = !hasActiveFilters

  return (
    <div className="crystal-card animate-professional-fade-in">
      <Card className="relative overflow-hidden bg-white/95 backdrop-blur-sm border-2 border-gray-300 border-dashed shadow-lg">
        <div className="relative text-center py-16 sm:py-24">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent" />
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-l from-gray-100/30 to-transparent rounded-full blur-3xl" />
          
          <div className="relative space-y-8">
            {/* Icon */}
            <div className="mx-auto">
              <div className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-8 ring-gray-200/50 shadow-2xl animate-float-subtle mx-auto">
                {isEmpty ? (
                  <svg className="w-10 h-10 sm:w-16 sm:h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 sm:w-16 sm:h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
            </div>
            
            {/* Content */}
            <div className="space-y-4 max-w-2xl mx-auto px-4">
              <h3 className={`text-3xl sm:text-4xl font-bold ${theme.text.strong}`}>
                {isEmpty 
                  ? '¡La biblioteca está esperando!' 
                  : 'No se encontraron mazos'
                }
              </h3>
              <p className={`${theme.text.soft} leading-relaxed text-lg font-medium`}>
                {isEmpty 
                  ? 'Sé el primero en importar un mazo y comenzar a construir la biblioteca de la comunidad. Cada mazo cuenta una historia única de estrategia y creatividad.'
                  : 'Intenta ajustar los filtros de búsqueda o explora otros criterios. Puede que el mazo perfecto esté esperando con una búsqueda ligeramente diferente.'
                }
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
              {user ? (
                <Link
                  href="/decks/new"
                  className={`group px-8 py-4 rounded-xl ${theme.gradient} text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 ${theme.colors.ring}`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {isEmpty ? 'Importar Primer Mazo' : 'Crear Nuevo Mazo'}
                  </div>
                </Link>
              ) : (
                <div className="px-8 py-4 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-gray-300 font-bold text-gray-700 text-lg shadow-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Inicia sesión para contribuir
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/formats"
                  className="group px-6 py-3 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-gray-300 font-semibold text-gray-700 hover:border-gray-400 hover:bg-white transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Explorar Formatos
                  </div>
                </Link>

                <Link
                  href="/stats"
                  className="group px-6 py-3 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-gray-300 font-semibold text-gray-700 hover:border-gray-400 hover:bg-white transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Ver Estadísticas
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ===============================================================
  COMPONENTE DE PAGINACIÓN MEJORADO
  =============================================================== */
function ProfessionalPagination({ theme, pagination, onPageChange, loading }) {
  const { page, totalPages } = pagination
  
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = window.innerWidth >= 640 ? 7 : 5 // Más páginas en desktop
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
      return pages
    }
    
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
    <div 
      className="crystal-card animate-professional-fade-in mobile-optimized"
      style={{ '--glow-color': theme.colors.glowColor }}
    >
      <Card className="relative overflow-hidden bg-white/95 backdrop-blur-sm border-2 border-white/60 shadow-lg hover:shadow-xl transition-all duration-500" padding="lg">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.colors.primary}`} />
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Info de página */}
          <div className={`text-sm ${theme.text.soft} font-semibold flex items-center gap-2 order-2 sm:order-1`}>
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${theme.colors.primary} animate-pulse-glow`} />
            Página {page.toLocaleString()} de {totalPages.toLocaleString()}
          </div>
          
          {/* Controles de navegación */}
          <div className="flex items-center justify-center gap-2 order-1 sm:order-2">
            {/* Botón anterior */}
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1 || loading}
              className="flex items-center gap-2 px-4 py-2 text-sm border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500/20 shadow-lg mobile-optimized"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline font-semibold">Anterior</span>
            </button>
            
            {/* Números de página */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  disabled={loading}
                  className={`px-3 py-2 text-sm rounded-xl font-bold transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed mobile-optimized ${
                    pageNum === page
                      ? `${theme.gradient} text-white shadow-xl ${theme.colors.ring} animate-pulse-glow`
                      : 'border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500/20 shadow-lg'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            
            {/* Botón siguiente */}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages || loading}
              className="flex items-center gap-2 px-4 py-2 text-sm border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500/20 shadow-lg mobile-optimized"
            >
              <span className="hidden sm:inline font-semibold">Siguiente</span>
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
/* ===============================================================
  FAB PROFESIONAL MEJORADO PARA DESKTOP
  =============================================================== */
function ProfessionalDecksFab({ theme, user }) {
  if (!user) return null

  return (
    <Link
      href="/decks/new"
      aria-label="Importar nuevo mazo"
      className={`
        fixed right-6 z-50 hidden sm:inline-flex items-center gap-3 rounded-2xl 
        ${theme.gradient} px-6 py-4 text-white shadow-2xl ring-1 ring-black/10 
        transition-all duration-300 hover:shadow-3xl hover:scale-110 
        focus:outline-none focus:ring-4 ${theme.colors.ring} 
        animate-float-subtle mobile-optimized
      `}
      style={{ 
        bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
        '--glow-color': theme.colors.glowColor
      }}
    >
      <div className="relative">
        <svg className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-white" />
      </div>
      <span className="font-bold text-base tracking-wide">Importar Mazo</span>
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 transition-all duration-500 hover:opacity-100 animate-pulse-glow -z-10" 
        style={{ boxShadow: `0 0 30px ${theme.colors.glowColor}` }} 
      />
    </Link>
  )
}

/* ===============================================================
  BARRA MÓVIL PROFESIONAL MEJORADA
  =============================================================== */
function ProfessionalDecksMobileBar({ theme, user }) {
  if (!user) return null

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 sm:hidden"
      style={{ 
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
        background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.95) 20%, rgba(255,255,255,0.98) 100%)',
        backdropFilter: 'blur(20px)'
      }}
    >
      <div className="border-t border-gray-200/80 px-4 py-4">
        <Link
          href="/decks/new"
          className={`
            w-full max-w-sm mx-auto block rounded-2xl ${theme.gradient} 
            px-6 py-4 text-center font-bold text-white shadow-2xl 
            ring-1 ring-black/10 transition-all duration-300 
            active:scale-95 mobile-optimized
          `}
          aria-label="Importar nuevo mazo"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-white" />
            </div>
            <span className="text-lg tracking-wide">Importar Mazo</span>
          </div>
        </Link>
      </div>
    </div>
  )
}

/* ===============================================================
  COMPONENTE PRINCIPAL INTEGRADO
  =============================================================== */
export default function ProfessionalDecksPage({ initialDecks = [], initialPagination = {} }) {
  const { theme, isPaused, togglePause, index: themeIndex } = useThemeRotation(40000)
  
  const [user, setUser] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [decks, setDecks] = useState(initialDecks)
  
  const {
    pagination,
    updatePagination,
    goToPage
  } = usePagination(initialPagination)
  
  const {
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    loading,
    setLoading,
    error,
    setError
  } = useDecksFilters()

  // Obtener estado del usuario
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

  // Función de carga de mazos mejorada
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
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (response.ok && data.success) {
        setDecks(data.decks || [])
        updatePagination(data.pagination || {})
      } else {
        setError(data.error || 'Error desconocido')
        setDecks([])
        updatePagination({ page: 1, totalPages: 0, total: 0 })
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setError(error.message || 'Error de conexión')
      setDecks([])
      updatePagination({ page: 1, totalPages: 0, total: 0 })
    } finally {
      setLoading(false)
    }
  }

  // Cargar mazos cuando el usuario esté listo
  useEffect(() => {
    if (!userLoading) {
      fetchDecks(filters, 1)
    }
  }, [userLoading, user?.id])

  // Handlers mejorados
  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters)
    fetchDecks(newFilters, 1)
    // Scroll suave al contenido después de filtrar
    setTimeout(() => {
      document.getElementById('decks-content')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }, 100)
  }

  const handlePageChange = (page) => {
    const newPage = goToPage(page)
    if (newPage !== pagination.page) {
      fetchDecks(filters, newPage)
      // Scroll al inicio del contenido
      setTimeout(() => {
        document.getElementById('decks-content')?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }, 100)
    }
  }

  const handleRetry = () => {
    fetchDecks(filters, pagination.page || 1)
  }

  // Loading state
  if (userLoading) {
    return <ProfessionalLoadingSkeleton theme={theme} />
  }

  // Error state
  if (error && !loading && decks.length === 0) {
    return <ProfessionalErrorState theme={theme} error={error} onRetry={handleRetry} />
  }

  return (
    <div
      className="min-h-screen theme-transition pb-24 sm:pb-8"
      style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})` }}
    >
      {/* Elementos decorativos de fondo */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '3s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12 lg:space-y-16">
        {/* Hero Section */}
        <ProfessionalDecksHero theme={theme} user={user} totalDecks={pagination.total || 0} />

        {/* Contenido principal */}
        <div id="decks-content" className="space-y-8">
          {/* Mostrar error si existe pero hay mazos cargados */}
          {error && decks.length > 0 && (
            <div className="crystal-card">
              <Card className="border-2 border-orange-300 bg-orange-50/90 backdrop-blur-sm shadow-lg">
                <div className="rounded-xl border border-orange-300 bg-orange-100/50 p-4 text-center">
                  <h3 className="text-lg font-bold text-orange-800 mb-2">Advertencia</h3>
                  <p className="text-orange-700 font-medium text-sm mb-3">{error}</p>
                  <button 
                    onClick={handleRetry}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    Reintentar
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* Lista de mazos */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div 
                  key={i} 
                  className="crystal-card animate-professional-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg" padding="none">
                    <div className={`h-1 bg-gradient-to-r ${theme.colors.primary} opacity-50`} />
                    <div className="animate-pulse">
                      <div className="h-48 bg-gray-200" />
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
          ) : decks.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {decks.map((deck, index) => (
                  <div 
                    key={deck.id}
                    className="crystal-card animate-professional-fade-in mobile-optimized"
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
            </>
          ) : (
            <ProfessionalEmptyState 
              theme={theme} 
              filters={filters} 
              user={user} 
              hasActiveFilters={hasActiveFilters}
            />
          )}
        </div>

        {/* Footer profesional */}
        <footer className="py-12 text-center">
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm font-semibold ${theme.text.soft}`}>
                Tema actual:
              </span>
              <div className="flex items-center gap-3">
                <div 
                  className="w-5 h-5 rounded-full shadow-lg animate-pulse-glow"
                  style={{ background: `linear-gradient(45deg, ${theme.colors.primary})` }}
                />
                <span className={`font-bold text-lg ${theme.text.strong}`}>
                  {theme.label}
                </span>
                <button
                  onClick={togglePause}
                  className={`ml-2 p-2 rounded-lg transition-colors ${theme.text.soft} hover:${theme.text.strong} hover:bg-white/20`}
                  title={isPaused ? 'Reanudar rotación automática' : 'Pausar rotación automática'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isPaused ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a4 4 0 01-4 4H9a2 2 0 01-2-2v-8a2 2 0 012-2z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Indicador de progreso de temas */}
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
            
            <div className="space-y-2">
              <p className={`text-sm ${theme.text.soft} opacity-75`}>
                {isPaused ? 'Rotación automática pausada' : 'El tema cambia automáticamente cada 40 segundos'}
              </p>
              <p className={`text-xs ${theme.text.soft} opacity-60 italic`}>
                &quot;{theme.fact}&quot;
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* FAB y barra móvil */}
      <ProfessionalDecksFab theme={theme} user={user} />
      <ProfessionalDecksMobileBar theme={theme} user={user} />
    </div>
  )
}

// SSR simplificado - carga client-side
export async function getServerSideProps() {
  return {
    props: {
      initialDecks: [],
      initialPagination: { page: 1, limit: 12, total: 0, totalPages: 0 }
    }
  }
}