// ===============================================================
// HOOKS Y UTILIDADES MEJORADOS
// ===============================================================

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Card from '../../components/Card'
import FramedArt from '../../components/FramedArt'
import ManaSymbol from '../../components/ManaSymbol'
import { translateTypeLine } from '../../lib/mtgTranslate'
import useCardImage from "../../hooks/useCardImage"
import { Copy, Check, X, FileText, Link2, List, ChevronDown, Download, Mail, Archive } from 'lucide-react'


/* ===============================================================
  TEMAS PROFESIONALES MEJORADOS CON NUEVAS ANIMACIONES
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
    fact: 'Orden y perfección. Cada carta tiene su propósito exacto.',
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
    fact: 'Conocimiento es poder. Cada decisión calculada con precisión.',
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
    fact: 'El poder exige sacrificio. Victoria a cualquier costo.',
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
    fact: 'Velocidad pura. Atacar antes de que puedan defenderse.',
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
    fact: 'Fuerza natural. El crecimiento inevitable de la vida.',
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
    fact: 'Ley y orden. Control perfecto del campo de batalla.',
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
    fact: 'Vida y muerte son recursos. El cementerio es oportunidad.',
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
    fact: 'Genio e impulso. La experimentación sin límites.',
  },
]

const DEFAULT_THEME_KEY = 'azorius'

/* ===============================================================
  CSS MEJORADO CON NUEVAS ANIMACIONES
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

  @keyframes cardThumbnailHover {
    0% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.05) rotate(-1deg); }
    100% { transform: scale(1.08) rotate(0deg); }
  }

  @keyframes magnifyingGlass {
    0% { transform: scale(0) rotate(-45deg); opacity: 0; }
    50% { transform: scale(1.1) rotate(-45deg); opacity: 1; }
    100% { transform: scale(1) rotate(-45deg); opacity: 1; }
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

  .card-thumbnail {
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    transform-origin: center;
  }

  .card-thumbnail:hover {
    animation: cardThumbnailHover 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15), 0 0 0 2px rgba(59, 130, 246, 0.5);
  }

  .card-thumbnail:focus-visible {
    animation: cardThumbnailHover 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15), 0 0 0 3px rgba(59, 130, 246, 0.8);
    outline: none;
  }

  .magnifying-glass-icon {
    animation: magnifyingGlass 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .modal-backdrop {
    animation: modalBackdropIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  .modal-content {
    animation: modalContentIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
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

  .card-fallback-text {
    font-size: 10px;
    line-height: 1.2;
    font-weight: 600;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
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

  .card-hover-overlay {
    background: rgba(0, 0, 0, 0);
    transition: background-color 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .group:hover .card-hover-overlay,
  .group:focus-within .card-hover-overlay {
    background: rgba(0, 0, 0, 0.4);
  }

  @media (hover: none) and (pointer: coarse) {
    .crystal-card:active {
      transform: scale(0.98);
      transition: transform 0.1s ease;
    }
    
    .card-thumbnail:active {
      transform: scale(0.95);
      transition: transform 0.1s ease;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .crystal-card::before,
    .card-thumbnail,
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
if (typeof document !== 'undefined' && !document.getElementById('enhanced-professional-deck-detail-styles')) {
  const style = document.createElement('style')
  style.id = 'enhanced-professional-deck-detail-styles'
  style.textContent = enhancedProfessionalCSS
  document.head.appendChild(style)
}

/* ===============================================================
  HOOK DE ROTACIÓN DE TEMAS MEJORADO
  =============================================================== */
function useThemeRotation(intervalMs = 40000) {
  const [themeKey, setThemeKey] = useState(DEFAULT_THEME_KEY)
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mp_professional_theme')
      const savedPaused = localStorage.getItem('mp_theme_paused') === 'true'
      
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
            localStorage.setItem('mp_professional_theme', nextKey) 
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
      localStorage.setItem('mp_theme_paused', String(newPaused))
    } catch (e) {}
  }, [isPaused])

  const switchToTheme = useCallback((newThemeKey) => {
    const idx = MTG_PROFESSIONAL_THEMES.findIndex(t => t.key === newThemeKey)
    if (idx >= 0) {
      setThemeKey(newThemeKey)
      setIndex(idx)
      try { 
        localStorage.setItem('mp_professional_theme', newThemeKey) 
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
  HOOK DE ACCIONES DE MAZO MEJORADO
  =============================================================== */
function useDeckActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const syncDeck = useCallback(async (deckId) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error('No autenticado')
      }

      const response = await fetch(`/api/decks/${deckId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al sincronizar')
      }

      return await response.json()
    } catch (err) {
      console.error('Error syncing deck:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteDeck = useCallback(async (deckId) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error('No autenticado')
      }

      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar')
      }

      return await response.json()
    } catch (err) {
      console.error('Error deleting deck:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { syncDeck, deleteDeck, loading, error }
}

/* ===============================================================
  HOOK DE MANEJO DE MODAL ÚNICO CENTRALIZADO
  =============================================================== */
function useImageModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentCard, setCurrentCard] = useState(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const openModal = useCallback((card) => {
    setCurrentCard(card)
    setIsOpen(true)
    setImageLoaded(false)
    setImageError(false)
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setCurrentCard(null)
    setImageLoaded(false)
    setImageError(false)
    
    // Restore body scroll
    document.body.style.overflow = 'unset'
  }, [])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, closeModal]) // Incluir closeModal en dependencias

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return {
    isOpen,
    currentCard,
    imageLoaded,
    setImageLoaded,
    imageError,
    setImageError,
    openModal,
    closeModal
  }
}
/* ===============================================================
  COMPONENTES DE MINIATURA OPTIMIZADOS - RATIO 5:7 Y OVERLAYS
  =============================================================== */

/* ===============================================================
  COMPONENTE DE MINIATURA DE CARTA MEJORADO
  =============================================================== */
function ProfessionalCardThumbnail({ 
  card, 
  onImageClick, 
  size = 'default' // 'small' | 'default' | 'large'
}) {
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false)
  const [thumbnailError, setThumbnailError] = useState(false)
  
  // Usar el hook para obtener URLs optimizadas
  const thumbnailUrl = useCardImage(card, 'small')
  
  // Configuración de tamaños responsive
  const sizeClasses = {
    small: 'w-12 sm:w-14 aspect-[5/7]',
    default: 'w-16 sm:w-20 aspect-[5/7]', 
    large: 'w-20 sm:w-24 aspect-[5/7]'
  }
  
  const sizes = {
    small: '(min-width:640px) 56px, 48px',
    default: '(min-width:640px) 80px, 64px',
    large: '(min-width:640px) 96px, 80px'
  }

  const hasValidImage = thumbnailUrl && thumbnailUrl !== "/images/card-placeholder.png"

  const handleClick = () => {
    if (hasValidImage && onImageClick) {
      onImageClick(card)
    }
  }

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && hasValidImage && onImageClick) {
      e.preventDefault()
      onImageClick(card)
    }
  }

  return (
    <div className="flex-shrink-0">
      {hasValidImage ? (
        <button
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={`
            group relative ${sizeClasses[size]} card-thumbnail
            overflow-hidden rounded-lg border-2 border-black/10 bg-white 
            shadow-sm hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 
            focus-visible:ring-blue-500 focus-visible:outline-none
            transition-all duration-300 mobile-optimized
          `}
          aria-label={`Ver imagen de ${card.name}`}
          title={`Click para ver ${card.name} en grande`}
        >
          {/* Loading skeleton */}
          {!thumbnailLoaded && (
            <div className="absolute inset-0 loading-skeleton rounded-lg" />
          )}
          
          {/* Imagen principal */}
          <Image
            src={thumbnailUrl}
            alt={card.name}
            fill
            className={`
              object-cover transition-opacity duration-300 
              ${thumbnailLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            onLoad={() => setThumbnailLoaded(true)}
            onError={() => setThumbnailError(true)}
            sizes={sizes[size]}
            priority={size === 'large'}
          />
          
          {/* Overlay con lupa - aparece en hover/focus */}
          <div className="absolute inset-0 card-hover-overlay transition-colors duration-300">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="
                opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
                transition-opacity duration-300 magnifying-glass-icon
              ">
                <div className="
                  w-6 h-6 sm:w-8 sm:h-8 bg-white/90 backdrop-blur-sm 
                  rounded-full flex items-center justify-center shadow-lg
                ">
                  <svg 
                    className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </button>
      ) : (
        // Fallback mejorado - muestra el nombre de la carta
        <div 
          className={`
            ${sizeClasses[size]} rounded-lg border-2 border-dashed 
            border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 
            flex items-center justify-center shadow-sm
          `}
          title={`Imagen no disponible para ${card.name}`}
        >
          <div className="card-fallback-text text-gray-600 px-1">
            {card.name}
          </div>
        </div>
      )}
    </div>
  )
}

/* ===============================================================
  COMPONENTE DE ITEM DE CARTA PROFESIONAL MEJORADO
  =============================================================== */
function ProfessionalCardListItem({ card, theme, onImageClick }) {
  const translatedTypeLine = translateTypeLine(card.type_line)

  const getTypeColor = (typeLine) => {
    if (!typeLine) return 'bg-gray-50 text-gray-700 border-gray-200'
    
    const translatedType = translateTypeLine(typeLine)
    
    if (translatedType.includes('Tierra')) return 'bg-amber-50 text-amber-800 border-amber-200'
    if (translatedType.includes('Criatura')) return 'bg-green-50 text-green-800 border-green-200'
    if (translatedType.includes('Instantáneo')) return 'bg-blue-50 text-blue-800 border-blue-200'
    if (translatedType.includes('Hechizo')) return 'bg-red-50 text-red-800 border-red-200'
    if (translatedType.includes('Artefacto')) return 'bg-gray-50 text-gray-800 border-gray-200'
    if (translatedType.includes('Encantamiento')) return 'bg-purple-50 text-purple-800 border-purple-200'
    if (translatedType.includes('Caminante de Planos')) return 'bg-indigo-50 text-indigo-800 border-indigo-200'
    
    return 'bg-gray-50 text-gray-700 border-gray-200'
  }

  return (
    <div className="group relative crystal-card mobile-optimized">
      <div className="
        bg-white/95 backdrop-blur-sm border border-white/60 shadow-md 
        hover:shadow-xl hover:bg-white transition-all duration-300 
        flex items-center gap-4 p-4 sm:p-5 rounded-xl
        hover:border-gray-200
      ">
        {/* Badge de cantidad MEJORADO - más prominente */}
        <div className="flex-shrink-0 relative">
          <div className="
            w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 
            rounded-2xl flex items-center justify-center shadow-xl border-2 border-white
            animate-float-subtle relative overflow-hidden
          ">
            {/* Efecto de brillo en el badge */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-2xl" />
            
            <div className="relative text-center">
              <div className="text-lg sm:text-xl font-black text-white drop-shadow-sm">
                {card.quantity || 1}
              </div>
              <div className="text-xs font-bold text-blue-100 opacity-90 -mt-1">
                {card.quantity === 1 ? 'copia' : 'copias'}
              </div>
            </div>
          </div>
          
          {/* Indicador de rareza mejorado */}
          {card.rarity && (
            <div className={`
              absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white shadow-lg
              flex items-center justify-center text-xs font-bold text-white
              ${card.rarity === 'mythic' ? 'bg-gradient-to-br from-orange-400 to-red-500' :
                card.rarity === 'rare' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                card.rarity === 'uncommon' ? 'bg-gradient-to-br from-gray-400 to-gray-500' : 
                'bg-gradient-to-br from-gray-300 to-gray-400'}
            `} title={`Rareza: ${card.rarity}`}>
              {card.rarity === 'mythic' ? 'M' :
               card.rarity === 'rare' ? 'R' :
               card.rarity === 'uncommon' ? 'U' : 'C'}
            </div>
          )}
        </div>

        {/* Miniatura de carta */}
        <ProfessionalCardThumbnail 
          card={card}
          onImageClick={onImageClick}
          size="default"
        />

        {/* Información de la carta - sin coste de maná */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-3">
            <div className="flex-1 min-w-0">
              {/* Nombre de la carta */}
              <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-3 group-hover:text-blue-700 transition-colors">
                {card.name}
              </h4>
              
              {/* Chips de información mejorados */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {/* Tipo */}
                {card.type_line && (
                  <span className={`
                    px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm
                    ${getTypeColor(card.type_line)}
                    transition-all duration-200 hover:scale-105
                  `}>
                    {translatedTypeLine}
                  </span>
                )}
                
                {/* CMC */}
                {card.cmc !== undefined && (
                  <span className="
                    text-xs font-bold bg-gradient-to-r from-gray-100 to-gray-200 
                    border border-gray-300 px-3 py-1.5 rounded-full text-gray-700
                    hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm
                  ">
                    CMC {card.cmc}
                  </span>
                )}

                {/* Poder/Resistencia para criaturas - mejorado */}
                {card.power && card.toughness && (
                  <span className="
                    text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-200
                    border border-green-300 px-3 py-1.5 rounded-full text-green-800
                    hover:from-green-200 hover:to-emerald-300 transition-all duration-200 shadow-sm
                  ">
                    {card.power}/{card.toughness}
                  </span>
                )}
              </div>

              {/* Texto de la carta (truncado) si está disponible */}
              {card.oracle_text && (
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed bg-gray-50 p-2 rounded border">
                  {card.oracle_text}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Enlace a Scryfall mejorado */}
        {card.scryfall_id && (
          <div className="flex-shrink-0">
            <div className="
              opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
              transition-opacity duration-300
            ">
              <a
                href={`https://scryfall.com/card/${card.scryfall_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center justify-center w-12 h-12 
                  bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300
                  rounded-xl text-gray-600 hover:text-gray-800 
                  transition-all duration-200 hover:scale-110 shadow-md
                  focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:outline-none
                  border border-gray-300
                "
                title="Ver en Scryfall"
                aria-label={`Ver ${card.name} en Scryfall`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                  />
                </svg>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ===============================================================
  MODAL DE IMAGEN ÚNICO Y CENTRALIZADO
  =============================================================== */
// Reemplaza tu función ProfessionalImageModal completa con esta:
function ProfessionalImageModal({ 
  isOpen, 
  card, 
  onClose, 
  imageLoaded, 
  setImageLoaded, 
  imageError, 
  setImageError,
  theme 
}) {
  const [isClosing, setIsClosing] = useState(false)
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  if (!isOpen || !card) return null

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 200)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  // Obtener URL de imagen completa
  const getFullImageUrl = () => {
    // Primero intentar con las URLs que ya tiene la carta
    if (card.image_uris?.normal) return card.image_uris.normal
    if (card.image_uris?.large) return card.image_uris.large
    if (card.image_uris?.png) return card.image_uris.png
    
    // Si no hay image_uris pero hay scryfall_id
    if (card.scryfall_id) {
      return `https://api.scryfall.com/cards/${card.scryfall_id}?format=image&version=normal`
    }
    
    // Fallback a placeholder
    return null
  }

  const imageUrl = getFullImageUrl()

  return (
    <div 
      className={`
        fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm 
        flex items-center justify-center p-4
        transition-opacity duration-200
        ${isClosing ? 'opacity-0' : 'opacity-100'}
      `}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Imagen de ${card.name}`}
    >
      <div className={`
        relative max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh]
        transform transition-all duration-200
        ${isClosing ? 'scale-95' : 'scale-100'}
      `}>
        {/* Botón de cierre */}
        <button
          onClick={handleClose}
          className="
            absolute -top-12 right-0 z-10 w-10 h-10 
            bg-white/20 hover:bg-white/30 backdrop-blur-sm 
            text-white rounded-full flex items-center justify-center 
            transition-all duration-200 hover:scale-110 hover:rotate-90
            focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none
          "
          aria-label="Cerrar imagen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Contenedor de la imagen */}
        <div className="bg-white rounded-xl shadow-2xl p-2 overflow-hidden">
          {imageUrl ? (
            <>
              {/* Loading state */}
              {!imageLoaded && !imageError && (
                <div className="w-full aspect-[488/680] bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="loading-skeleton w-full h-full rounded-lg"></div>
                </div>
              )}
              
              {/* Error state */}
              {imageError && (
                <div className="w-full aspect-[488/680] bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center p-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600 font-semibold">{card.name}</p>
                    <p className="text-sm text-gray-500 mt-1">Imagen no disponible</p>
                  </div>
                </div>
              )}
              
              {/* Imagen */}
              {!imageError && (
                <img
                  src={imageUrl}
                  alt={card.name}
                  width={400}
                  height={560}
                  className={`
                    w-full h-auto rounded-lg
                    transition-opacity duration-300
                    ${imageLoaded ? 'opacity-100' : 'opacity-0 absolute'}
                  `}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  style={{ maxHeight: '85vh' }}
                />
              )}
            </>
          ) : (
            // No image available
            <div className="w-full aspect-[488/680] bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center p-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 font-semibold">{card.name}</p>
                <p className="text-sm text-gray-500 mt-1">Sin imagen disponible</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
/* ===============================================================
  LISTA DE CARTAS MEJORADA CON MODAL ÚNICO
  =============================================================== */
function ProfessionalCardList({ theme, cards, title, totalCount, uniqueCount }) {
  const [showAll, setShowAll] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  
  // Hook centralizado para el modal único
  const {
    isOpen: isModalOpen,
    currentCard: modalCard,
    imageLoaded,
    setImageLoaded,
    imageError,
    setImageError,
    openModal,
    closeModal
  } = useImageModal()
  
  // TODOS LOS HOOKS DEBEN IR ANTES DE CUALQUIER RETURN CONDICIONAL
  
  // Procesar y filtrar cartas con memoización mejorada
  const processedCards = useMemo(() => {
    if (!cards || cards.length === 0) return []

    let filtered = [...cards]

    // Filtro de búsqueda mejorado
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(card => 
        card.name?.toLowerCase().includes(searchLower) ||
        translateTypeLine(card.type_line)?.toLowerCase().includes(searchLower) ||
        card.oracle_text?.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(card => {
        const translatedTypeLine = translateTypeLine(card.type_line) || ''
        return translatedTypeLine.toLowerCase().includes(filterType.toLowerCase())
      })
    }

    // Ordenación mejorada
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'cmc':
          const cmcA = a.cmc || 0
          const cmcB = b.cmc || 0
          if (cmcA !== cmcB) return cmcA - cmcB
          return (a.name || '').localeCompare(b.name || '')
        case 'quantity':
          const qtyA = a.quantity || 0
          const qtyB = b.quantity || 0
          if (qtyA !== qtyB) return qtyB - qtyA
          return (a.name || '').localeCompare(b.name || '')
        case 'type':
          const typeA = translateTypeLine(a.type_line || '')
          const typeB = translateTypeLine(b.type_line || '')
          if (typeA !== typeB) return typeA.localeCompare(typeB)
          return (a.name || '').localeCompare(b.name || '')
        case 'rarity':
          const rarityOrder = { 'mythic': 4, 'rare': 3, 'uncommon': 2, 'common': 1 }
          const rarityA = rarityOrder[a.rarity] || 0
          const rarityB = rarityOrder[b.rarity] || 0
          if (rarityA !== rarityB) return rarityB - rarityA
          return (a.name || '').localeCompare(b.name || '')
        default:
          return (a.name || '').localeCompare(b.name || '')
      }
    })

    return filtered
  }, [cards, searchTerm, filterType, sortBy])

  // Obtener tipos únicos para el filtro
  const cardTypes = useMemo(() => {
    if (!cards || cards.length === 0) return []
    
    const types = new Set()
    cards.forEach(card => {
      const translatedTypeLine = translateTypeLine(card.type_line) || ''
      
      if (translatedTypeLine.includes('Criatura')) types.add('Criatura')
      if (translatedTypeLine.includes('Instantáneo')) types.add('Instantáneo')
      if (translatedTypeLine.includes('Hechizo')) types.add('Hechizo')
      if (translatedTypeLine.includes('Artefacto')) types.add('Artefacto')
      if (translatedTypeLine.includes('Encantamiento')) types.add('Encantamiento')
      if (translatedTypeLine.includes('Caminante de Planos')) types.add('Caminante de Planos')
      if (translatedTypeLine.includes('Tierra')) types.add('Tierra')
    })
    return Array.from(types).sort()
  }, [cards])

  // Estadísticas por tipo mejoradas
  const typeStats = useMemo(() => {
    if (!cards || cards.length === 0) return {}
    
    const stats = {}
    cards.forEach(card => {
      const translatedTypeLine = translateTypeLine(card.type_line) || ''
      let mainType = 'Otro'
      
      if (translatedTypeLine.includes('Tierra')) mainType = 'Tierra'
      else if (translatedTypeLine.includes('Criatura')) mainType = 'Criatura'
      else if (translatedTypeLine.includes('Instantáneo')) mainType = 'Instantáneo'
      else if (translatedTypeLine.includes('Hechizo')) mainType = 'Hechizo'
      else if (translatedTypeLine.includes('Artefacto')) mainType = 'Artefacto'
      else if (translatedTypeLine.includes('Encantamiento')) mainType = 'Encantamiento'
      else if (translatedTypeLine.includes('Caminante de Planos')) mainType = 'Caminante de Planos'

      if (!stats[mainType]) {
        stats[mainType] = { count: 0, quantity: 0 }
      }
      stats[mainType].count += 1
      stats[mainType].quantity += card.quantity || 1
    })
    return stats
  }, [cards])

  const displayCards = useMemo(() => {
    return showAll ? processedCards : processedCards.slice(0, 10)
  }, [showAll, processedCards])

  // AHORA SÍ PODEMOS HACER EL RETURN CONDICIONAL
  if (!cards || cards.length === 0) return null

  return (
    <>
      <div 
        className="crystal-card animate-professional-fade-in mobile-optimized"
        style={{ '--glow-color': theme.colors.glowColor }}
      >
        <Card className="
          relative overflow-hidden bg-white/95 backdrop-blur-sm 
          border-2 border-white/60 shadow-lg hover:shadow-xl 
          transition-all duration-500
        " padding="lg">
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.colors.primary}`} />
          
          {/* Header mejorado con estadísticas */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-3">
                <h3 className={`text-2xl sm:text-3xl font-bold ${theme.text.strong}`}>
                  {title}
                </h3>
                <div className="flex items-center gap-6 text-sm">
                  <span className={`${theme.text.soft} flex items-center gap-2`}>
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse-glow"></div>
                    <span className="font-bold text-blue-600">{totalCount}</span> 
                    <span>cartas totales</span>
                  </span>
                  <span className={`${theme.text.soft} flex items-center gap-2`}>
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse-glow"></div>
                    <span className="font-bold text-green-600">{uniqueCount}</span> 
                    <span>únicas</span>
                  </span>
                  {processedCards.length !== cards.length && (
                    <span className={`${theme.text.soft} flex items-center gap-2`}>
                      <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse-glow"></div>
                      <span className="font-bold text-orange-600">{processedCards.length}</span> 
                      <span>filtradas</span>
                    </span>
                  )}
                </div>
              </div>
              
              {/* Botón de filtros móvil mejorado */}
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={`
                  sm:hidden px-4 py-3 rounded-xl font-semibold transition-all duration-300 
                  shadow-lg hover:shadow-xl hover:scale-105
                  ${isFiltersOpen 
                    ? `bg-gradient-to-r ${theme.colors.primary} text-white` 
                    : 'bg-white/90 text-gray-700 hover:bg-white border border-gray-200'
                  }
                `}
                aria-expanded={isFiltersOpen}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Filtros
              </button>
            </div>
            
            {/* Estadísticas por tipo mejoradas */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeStats)
                .sort(([,a], [,b]) => b.quantity - a.quantity)
                .map(([type, stats]) => (
                <div 
                  key={type} 
                  className="
                    px-3 py-2 rounded-lg text-xs font-semibold
                    bg-gradient-to-r from-gray-50 to-gray-100 
                    border border-gray-200 shadow-sm
                    hover:from-gray-100 hover:to-gray-200 
                    hover:scale-105 transition-all duration-200
                  "
                >
                  <span className="text-gray-700">{type}:</span>
                  <span className="text-gray-900 ml-1">{stats.quantity}</span>
                  {stats.count !== stats.quantity && (
                    <span className="text-gray-500 ml-1">({stats.count})</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Controles mejorados */}
          <div className={`
            transition-all duration-500 ease-in-out overflow-hidden
            ${isFiltersOpen ? 'max-h-96 opacity-100' : 'max-h-0 sm:max-h-96 opacity-0 sm:opacity-100'} 
            mb-8
          `}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 sm:p-0">
              {/* Búsqueda mejorada */}
              <div className="relative lg:col-span-2">
                <input
                  type="text"
                  placeholder="Buscar por nombre, tipo o texto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="
                    w-full px-4 py-3 pl-10 text-sm border border-gray-200 
                    rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    bg-white shadow-sm transition-all duration-300
                    hover:shadow-md focus:shadow-lg
                  "
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="
                      absolute right-3 top-1/2 transform -translate-y-1/2 
                      w-5 h-5 text-gray-400 hover:text-gray-600
                      transition-colors duration-200
                    "
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filtro por tipo */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="
                  w-full px-4 py-3 text-sm border border-gray-200 
                  rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  bg-white shadow-sm transition-all duration-300
                  hover:shadow-md focus:shadow-lg
                "
              >
                <option value="all">Todos los tipos</option>
                {cardTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {/* Ordenación */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="
                  w-full px-4 py-3 text-sm border border-gray-200 
                  rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  bg-white shadow-sm transition-all duration-300
                  hover:shadow-md focus:shadow-lg
                "
              >
                <option value="name">Por nombre</option>
                <option value="cmc">Por coste de maná</option>
                <option value="quantity">Por cantidad</option>
                <option value="type">Por tipo</option>
                <option value="rarity">Por rareza</option>
              </select>

              {/* Mostrar todas/menos */}
              <button
                onClick={() => setShowAll(!showAll)}
                className={`
                  w-full px-4 py-3 text-sm rounded-xl font-semibold 
                  transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105
                  ${showAll 
                    ? `bg-gradient-to-r ${theme.colors.primary} text-white` 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }
                `}
              >
                {showAll ? 'Mostrar menos' : `Ver todas (${processedCards.length})`}
              </button>
            </div>
          </div>

          {/* Lista de cartas */}
          <div className="space-y-4">
            {displayCards.length > 0 ? (
              displayCards.map((card, index) => (
                <ProfessionalCardListItem 
                  key={`${card.scryfall_id || card.name}-${index}`}
                  card={card}
                  theme={theme}
                  onImageClick={openModal}
                />
              ))
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No se encontraron cartas</h4>
                  <p className="text-sm text-gray-500">
                    {searchTerm || filterType !== 'all' 
                      ? 'Intenta ajustar tus filtros de búsqueda' 
                      : 'No hay cartas disponibles en esta sección'
                    }
                  </p>
                </div>
                {(searchTerm || filterType !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFilterType('all')
                    }}
                    className={`
                      px-4 py-2 rounded-lg bg-gradient-to-r ${theme.colors.primary} 
                      text-white font-semibold text-sm
                      hover:shadow-lg transition-all duration-200
                    `}
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Botón "Ver más" mejorado */}
          {!showAll && processedCards.length > 10 && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowAll(true)}
                className={`
                  inline-flex items-center gap-3 px-8 py-4 text-sm rounded-xl 
                  font-semibold transition-all duration-300 
                  bg-gradient-to-r ${theme.colors.primary} text-white 
                  hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 ${theme.colors.ring}
                `}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Ver {processedCards.length - 10} cartas más
              </button>
            </div>
          )}
        </Card>
      </div>

      {/* Modal único centralizado */}
      <ProfessionalImageModal
        isOpen={isModalOpen}
        card={modalCard}
        onClose={closeModal}
        imageLoaded={imageLoaded}
        setImageLoaded={setImageLoaded}
        imageError={imageError}
        setImageError={setImageError}
        theme={theme}
      />
    </>
  )
}

/* ===============================================================
  SISTEMA DE EXPORTACIÓN MEJORADO
  =============================================================== */
const CATEGORY_ORDER_ES = [
  'Comandante',
  'Caminantes de Planos',
  'Criaturas', 
  'Artefactos',
  'Encantamientos',
  'Instantáneos',
  'Conjuros',
  'Tierras',
  'Otros',
]

function inferCategoryEs(typeLine) {
  const t = (translateTypeLine(typeLine) || '').toLowerCase()
  if (t.includes('comandante') || t.includes('legendary') && t.includes('criatura')) return 'Comandante'
  if (t.includes('caminante de planos') || t.includes('planeswalker')) return 'Caminantes de Planos'
  if (t.includes('criatura')) return 'Criaturas'
  if (t.includes('artefacto')) return 'Artefactos'
  if (t.includes('encantamiento')) return 'Encantamientos'
  if (t.includes('instantáneo')) return 'Instantáneos'
  if (t.includes('hechizo') || t.includes('conjuro')) return 'Conjuros'
  if (t.includes('tierra')) return 'Tierras'
  return 'Otros'
}

function toArenaList(cards) {
  return cards.map(c => `${Math.max(1, c.quantity || 1)} ${c.name}`).join('\n')
}

function toMoxfieldList(cards) {
  return cards.map(c => `${Math.max(1, c.quantity || 1)}x ${c.name}`).join('\n')
}

function toDetailedListEs(cards) {
  const groups = {}
  CATEGORY_ORDER_ES.forEach(cat => { groups[cat] = [] })

  cards.forEach(c => {
    const cat = inferCategoryEs(c.type_line)
    groups[cat].push(c)
  })

  const lines = []
  CATEGORY_ORDER_ES.forEach(cat => {
    const arr = groups[cat]
    if (!arr || arr.length === 0) return
    
    lines.push(`// ${cat}`)
    arr
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .forEach(c => lines.push(`${Math.max(1, c.quantity || 1)}x ${c.name}`))
    lines.push('')
  })

  return lines.join('\n').trim()
}


/* ===============================================================
  COMPONENTE CTA DE EXPORTACIÓN MEJORADO
  =============================================================== */
// Reemplaza tu componente ExportDeckCTA completo con esta versión más simple:
function ExportDeckCTA({ theme, deck }) {
  const [copied, setCopied] = useState(false)
  const [format, setFormat] = useState('arena') // Podrías agregar un selector si quieres
  
  const allCards = useMemo(() => {
    if (!deck.deck_cards) return []
    return deck.deck_cards.map(dc => ({ 
      ...dc.cards, 
      quantity: dc.quantity, 
      board_type: dc.board_type 
    }))
  }, [deck.deck_cards])

  const cardCount = useMemo(() => {
    return allCards.reduce((sum, card) => sum + (card.quantity || 1), 0)
  }, [allCards])

  const handleExport = async () => {
    // Generar el texto para exportar (formato Arena por defecto)
    const mainboard = allCards.filter(c => c.board_type !== 'sideboard')
    const sideboard = allCards.filter(c => c.board_type === 'sideboard')
    
    let exportText = mainboard.map(c => `${c.quantity || 1} ${c.name}`).join('\n')
    
    if (sideboard.length > 0) {
      exportText += '\n\nSideboard\n'
      exportText += sideboard.map(c => `${c.quantity || 1} ${c.name}`).join('\n')
    }

    try {
      await navigator.clipboard.writeText(exportText)
      setCopied(true)
      
      // Resetear el estado después de 3 segundos
      setTimeout(() => {
        setCopied(false)
      }, 3000)
    } catch (err) {
      // Fallback para navegadores antiguos
      const textarea = document.createElement('textarea')
      textarea.value = exportText
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 3000)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg animate-float-subtle">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-gray-900">Exportar Lista del Mazo</div>
            <div className="text-xs text-gray-600">
              {cardCount} cartas • Formato MTG Arena
            </div>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={!allCards.length}
          className={`
            inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold 
            transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 
            focus-visible:ring-offset-2 
            ${copied 
              ? 'bg-green-500 text-white shadow-lg' 
              : `bg-gradient-to-r ${theme.colors.primary} text-white hover:shadow-lg hover:scale-105 ${theme.colors.ring}`
            }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          `}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              ¡Copiado!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar lista
            </>
          )}
        </button>
      </div>

      {/* Notificación flotante de éxito (opcional - aparece arriba a la derecha) */}
      {copied && (
        <div className="fixed top-4 right-4 z-50 animate-professional-fade-in">
          <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">Lista del mazo copiada al portapapeles</span>
          </div>
        </div>
      )}
    </>
  )
}

// Función auxiliar para construir el texto del mazo
function buildDeckText(cards, format) {
  if (!cards.length) return ''
  
  const mainboard = cards.filter(c => c.board_type !== 'sideboard')
  const sideboard = cards.filter(c => c.board_type === 'sideboard')
  
  switch (format) {
    case 'arena':
      return [
        ...mainboard.map(c => `${c.quantity || 1} ${c.name}`),
        sideboard.length ? '\nSideboard' : '',
        ...sideboard.map(c => `${c.quantity || 1} ${c.name}`)
      ].filter(Boolean).join('\n')
      
    case 'moxfield':
      return [
        ...mainboard.map(c => `${c.quantity || 1}x ${c.name}`),
        sideboard.length ? '\nSideboard' : '',
        ...sideboard.map(c => `${c.quantity || 1}x ${c.name}`)
      ].filter(Boolean).join('\n')
      
    case 'detailed':
      const grouped = {}
      mainboard.forEach(c => {
        const type = c.type || 'Other'
        if (!grouped[type]) grouped[type] = []
        grouped[type].push(c)
      })
      
      let text = []
      Object.entries(grouped).forEach(([type, cards]) => {
        text.push(`// ${type} (${cards.length})`)
        cards.forEach(c => text.push(`${c.quantity || 1} ${c.name}`))
        text.push('')
      })
      
      if (sideboard.length) {
        text.push('// Sideboard')
        sideboard.forEach(c => text.push(`${c.quantity || 1} ${c.name}`))
      }
      
      return text.join('\n')
      
    default:
      return ''
  }
}

// Componente principal del modal
function ExportModal({ 
  cards = [], 
  onClose = () => {}, 
  theme = { colors: { primary: 'from-blue-600 to-blue-700', ring: 'focus:ring-blue-500' } }, 
  deckName = "Mazo sin nombre" 
}) {
  const [format, setFormat] = useState('arena')
  const [includeSideboard, setIncludeSideboard] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState('txt')
  const modalRef = useRef(null)
  const textareaRef = useRef(null)

  // Generar cartas de ejemplo si no hay cartas
  const exampleCards = useMemo(() => {
    if (cards.length > 0) return cards
    return [
      { name: 'Lightning Bolt', quantity: 4, type: 'Instant', board_type: 'mainboard' },
      { name: 'Ragavan, Nimble Pilferer', quantity: 4, type: 'Creature', board_type: 'mainboard' },
      { name: 'Misty Rainforest', quantity: 4, type: 'Land', board_type: 'mainboard' },
      { name: 'Force of Negation', quantity: 2, type: 'Instant', board_type: 'mainboard' },
      { name: 'Teferi, Time Raveler', quantity: 3, type: 'Planeswalker', board_type: 'mainboard' },
      { name: 'Mystical Dispute', quantity: 2, type: 'Instant', board_type: 'sideboard' },
      { name: 'Surgical Extraction', quantity: 3, type: 'Instant', board_type: 'sideboard' },
    ]
  }, [cards])

  // Filtrar cartas según configuración
  const filteredCards = useMemo(() => {
    if (!includeSideboard) return exampleCards.filter(c => c.board_type !== 'sideboard')
    return exampleCards
  }, [exampleCards, includeSideboard])

  // Generar texto según formato
  const exportText = useMemo(() => buildDeckText(filteredCards, format), [filteredCards, format])
  
  // Estadísticas
  const stats = useMemo(() => {
    const total = filteredCards.reduce((sum, c) => sum + (c.quantity || 1), 0)
    const unique = filteredCards.length
    const mainboard = filteredCards.filter(c => c.board_type !== 'sideboard')
    const sideboard = filteredCards.filter(c => c.board_type === 'sideboard')
    const mainboardTotal = mainboard.reduce((sum, c) => sum + (c.quantity || 1), 0)
    const sideboardTotal = sideboard.reduce((sum, c) => sum + (c.quantity || 1), 0)
    
    return { 
      total, 
      unique, 
      mainboard: mainboard.length,
      sideboard: sideboard.length,
      mainboardTotal,
      sideboardTotal
    }
  }, [filteredCards])

  // Reset copied state when format or sideboard changes
  useEffect(() => { 
    setCopied(false) 
  }, [format, includeSideboard])

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => { 
      if (e.key === 'Escape' && !isClosing) {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isClosing])

  // Focus trap y manejo de scroll
  useEffect(() => {
    // Guardar el scroll actual
    const scrollY = window.scrollY
    
    // Prevenir scroll del body manteniendo la posición
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    
    // Focus en el modal
    if (modalRef.current) {
      modalRef.current.focus()
    }
    
    return () => {
      // Restaurar el scroll
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 200)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (err) {
      // Fallback para navegadores antiguos
      if (textareaRef.current) {
        textareaRef.current.select()
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    }
  }

  const handleDownload = () => {
    const blob = new Blob([exportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${deckName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${downloadFormat}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleEmail = () => {
    const subject = encodeURIComponent(`Lista del Mazo: ${deckName}`)
    const body = encodeURIComponent(exportText)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const formatOptions = [
    {
      key: 'arena',
      label: 'MTG Arena',
      description: 'Compatible con MTGO',
      hint: '4 Lightning Bolt',
    },
    {
      key: 'moxfield',
      label: 'Moxfield',
      description: 'Archidekt, Tappedout',
      hint: '4x Lightning Bolt',
    },
    {
      key: 'detailed',
      label: 'Detallado',
      description: 'Por categorías',
      hint: '// Instants (4)',
    }
  ]

  return (
    <div 
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center
        transition-opacity duration-200 ease-out
        ${isClosing ? 'opacity-0' : 'opacity-100'}
      `}
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="export-modal-title"
      ref={modalRef}
      tabIndex={-1}
    >
      {/* Backdrop con blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      
      {/* Contenedor del modal con scroll interno */}
      <div className="relative w-full h-full p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center">
          <div className={`
            relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl
            transform transition-all duration-200 ease-out
            ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
          `}>
            {/* Header fijo */}
            <div className="sticky top-0 z-10 bg-white rounded-t-2xl border-b border-gray-200">
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <h2 id="export-modal-title" className="text-2xl font-bold text-gray-900">
                    Exportar Lista del Mazo
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {deckName} • {stats.total} cartas ({stats.mainboardTotal} principal, {stats.sideboardTotal} sideboard)
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="
                    p-2 rounded-xl bg-gray-100 hover:bg-gray-200 
                    text-gray-600 hover:text-gray-900
                    transition-all duration-200 hover:rotate-90
                    focus:outline-none focus:ring-2 focus:ring-gray-400
                  "
                  aria-label="Cerrar modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido con scroll */}
            <div className="flex flex-col lg:flex-row max-h-[calc(100vh-12rem)] lg:max-h-[600px]">
              {/* Panel izquierdo - Controles */}
              <div className="lg:w-96 border-b lg:border-b-0 lg:border-r border-gray-200 p-6 overflow-y-auto">
                {/* Selector de formato */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Formato de Exportación
                  </h3>
                  <div className="space-y-2">
                    {formatOptions.map(option => (
                      <button
                        key={option.key}
                        onClick={() => setFormat(option.key)}
                        className={`
                          w-full text-left p-3 rounded-xl border-2 transition-all duration-200
                          ${format === option.key
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            p-2 rounded-lg transition-colors
                            ${format === option.key ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}
                          `}>
                            {option.key === 'arena' ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            ) : option.key === 'moxfield' ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{option.label}</div>
                            <div className="text-xs text-gray-600">{option.description}</div>
                            <code className="text-xs text-gray-500 font-mono">{option.hint}</code>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Opciones */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Opciones
                  </h3>
                  <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer border border-gray-200">
                    <input 
                      type="checkbox" 
                      checked={includeSideboard} 
                      onChange={(e) => setIncludeSideboard(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Incluir Sideboard</div>
                      <div className="text-sm text-gray-600">
                        {stats.sideboard} cartas únicas ({stats.sideboardTotal} total)
                      </div>
                    </div>
                  </label>
                </div>

                {/* Estadísticas */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Resumen
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                      <div className="text-xs text-gray-600">Cartas Totales</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.unique}</div>
                      <div className="text-xs text-gray-600">Cartas Únicas</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-700">{stats.mainboardTotal}</div>
                      <div className="text-xs text-gray-600">Principal</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-700">{stats.sideboardTotal}</div>
                      <div className="text-xs text-gray-600">Sideboard</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel derecho - Vista previa */}
              <div className="flex-1 p-6 flex flex-col min-h-0">
                {/* Toolbar de acciones */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <button
                    onClick={handleCopy}
                    className={`
                      flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 
                      rounded-xl text-sm font-semibold transition-all duration-200
                      ${copied 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30'
                      }
                    `}
                    disabled={!exportText}
                  >
                    {copied ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                    <span>{copied ? '¡Copiado!' : 'Copiar al Portapapeles'}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="
                      flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 
                      rounded-xl text-sm font-semibold
                      bg-gray-100 hover:bg-gray-200 text-gray-700
                      transition-all duration-200 border border-gray-300
                    "
                    disabled={!exportText}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <span>Descargar</span>
                  </button>

                  <button
                    onClick={handleEmail}
                    className="
                      flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 
                      rounded-xl text-sm font-semibold
                      bg-gray-100 hover:bg-gray-200 text-gray-700
                      transition-all duration-200 border border-gray-300
                    "
                    disabled={!exportText}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Email</span>
                  </button>
                </div>

                {/* Área de texto */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Vista Previa
                    </h3>
                    <span className="text-xs text-gray-500">
                      {exportText.split('\n').filter(line => line.trim()).length} líneas
                    </span>
                  </div>
                  
                  <textarea
                    ref={textareaRef}
                    readOnly
                    value={exportText}
                    className="
                      flex-1 w-full resize-none border-2 border-gray-200 rounded-xl 
                      bg-gray-50 hover:bg-white p-4 font-mono text-sm leading-relaxed text-gray-800
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white
                      transition-all duration-200 overflow-auto
                    "
                    placeholder="El texto exportado aparecerá aquí..."
                    onClick={(e) => e.target.select()}
                  />
                </div>

                {/* Indicador de formato actual */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <span>Formato: {formatOptions.find(f => f.key === format)?.label}</span>
                  </div>
                  {exportText && (
                    <div className="text-xs text-green-600 font-medium">
                      ✓ Lista lista para exportar
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer opcional con acciones adicionales */}
            <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Tip: Puedes hacer clic en el área de texto para seleccionar todo el contenido
                </p>
                <button
                  onClick={handleClose}
                  className="
                    text-sm text-gray-600 hover:text-gray-900 font-medium
                    transition-colors duration-200
                  "
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===============================================================
  COMPONENTE DE PILLS/CHIPS MEJORADO PARA FORMATOS
  =============================================================== */
function FormatPill({ label, hint, active, onClick, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group inline-flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm 
        transition-all duration-300 hover:scale-105 focus-visible:outline-none 
        focus-visible:ring-2 focus-visible:ring-offset-2
        ${active 
          ? 'border-blue-500 bg-blue-50 text-blue-900 ring-blue-300' 
          : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50 ring-gray-300'
        }
      `}
    >
      {icon && (
        <div className={`
          transition-colors duration-200
          ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
        `}>
          {icon}
        </div>
      )}
      <div className="text-left">
        <div className="font-semibold">{label}</div>
        {hint && (
          <div className={`
            text-xs font-mono mt-1
            ${active ? 'text-blue-700' : 'text-gray-500'}
          `}>
            {hint}
          </div>
        )}
      </div>
    </button>
  )
}
/* ===============================================================
  COMPONENTE DE ESTADÍSTICAS MEJORADO CON VISUALIZACIÓN AVANZADA
  =============================================================== */
function ProfessionalDeckStats({ theme, deck }) {
  if (!deck.deck_cards || deck.deck_cards.length === 0) {
    if (deck.total_cards > 0) {
      return (
        <div 
          className="crystal-card animate-professional-fade-in"
          style={{ '--glow-color': theme.colors.glowColor }}
        >
          <Card className="relative overflow-hidden bg-white/95 backdrop-blur-sm border-2 border-white/60 shadow-lg hover:shadow-xl transition-all duration-500" padding="lg">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.colors.primary}`} />
            
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${theme.colors.primary} flex items-center justify-center shadow-lg animate-float-subtle`}>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${theme.text.strong}`}>Estadísticas del Mazo</h3>
                <p className={`text-sm ${theme.text.soft} font-medium`}>Información básica disponible</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Total de Cartas"
                value={deck.total_cards || 0}
                icon={(
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )}
                color="blue"
                theme={theme}
              />
              <StatCard
                title="Mainboard"
                value={deck.mainboard_count || 0}
                icon={(
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                )}
                color="green"
                theme={theme}
              />
              <StatCard
                title="Sideboard"
                value={deck.sideboard_count || 0}
                icon={(
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                color="purple"
                theme={theme}
              />
            </div>

            <ExportDeckCTA theme={theme} deck={deck} />
          </Card>
        </div>
      )
    }
    return null
  }

  const mainboard = deck.deck_cards.filter(dc => dc.board_type === 'mainboard')

const stats = useMemo(() => {
    const cmcDistribution = {}
    const typeDistribution = {}
    const colorDistribution = {}
    const rarityDistribution = {}
    let totalManaCost = 0
    let nonLandCardCount = 0 // Solo para CMC promedio
    let creatureCount = 0
    let nonCreatureCount = 0
    let landCount = 0

    mainboard.forEach(deckCard => {
      const card = deckCard.cards
      const quantity = deckCard.quantity || 1
      const cmc = card.cmc || 0
      
      // CMC Distribution
      cmcDistribution[cmc] = (cmcDistribution[cmc] || 0) + quantity
      
      // Type Distribution
      const typeLine = card.type_line || ''
      let mainType = 'Otro'
      if (typeLine.includes('Land')) {
        mainType = 'Tierra'
        landCount += quantity
        // NO añadir tierras al cálculo de CMC promedio
      } else {
        // Solo cartas no-tierra cuentan para CMC promedio
        totalManaCost += cmc * quantity
        nonLandCardCount += quantity
        
        if (typeLine.includes('Creature')) {
          mainType = 'Criatura'
          creatureCount += quantity
        } else if (typeLine.includes('Instant')) {
          mainType = 'Instantáneo'
          nonCreatureCount += quantity
        } else if (typeLine.includes('Sorcery')) {
          mainType = 'Hechizo'
          nonCreatureCount += quantity
        } else if (typeLine.includes('Artifact')) {
          mainType = 'Artefacto'
          nonCreatureCount += quantity
        } else if (typeLine.includes('Enchantment')) {
          mainType = 'Encantamiento'
          nonCreatureCount += quantity
        } else if (typeLine.includes('Planeswalker')) {
          mainType = 'Caminante de Planos'
          nonCreatureCount += quantity
        } else {
          nonCreatureCount += quantity
        }
      }
      
      typeDistribution[mainType] = (typeDistribution[mainType] || 0) + quantity

      // Color Distribution
      if (card.colors && card.colors.length > 0) {
        card.colors.forEach(color => {
          colorDistribution[color] = (colorDistribution[color] || 0) + quantity
        })
      } else {
        colorDistribution['Incoloro'] = (colorDistribution['Incoloro'] || 0) + quantity
      }

      // Rarity Distribution
      if (card.rarity) {
        rarityDistribution[card.rarity] = (rarityDistribution[card.rarity] || 0) + quantity
      }
    })

    const totalCards = mainboard.reduce((sum, dc) => sum + (dc.quantity || 1), 0)
    // CMC promedio solo de cartas no-tierra
    const avgCmc = nonLandCardCount > 0 ? (totalManaCost / nonLandCardCount).toFixed(2) : '0.00'

    return { 
      cmcDistribution, 
      typeDistribution, 
      colorDistribution, 
      rarityDistribution,
      avgCmc, 
      creatureCount, 
      nonCreatureCount, 
      landCount,
      totalCards,
      nonLandCardCount // Para mostrar en tooltip
    }
  }, [mainboard])

  return (
    <div 
      className="crystal-card animate-professional-fade-in"
      style={{ '--glow-color': theme.colors.glowColor }}
    >
      <Card className="relative overflow-hidden bg-white/95 backdrop-blur-sm border-2 border-white/60 shadow-lg hover:shadow-xl transition-all duration-500" padding="lg">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.colors.primary}`} />

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${theme.colors.primary} flex items-center justify-center shadow-lg animate-float-subtle`}>
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className={`text-2xl font-bold ${theme.text.strong}`}>Análisis Avanzado del Mazo</h3>
            <p className={`text-sm ${theme.text.soft} font-medium`}>Estadísticas detalladas y distribuciones</p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Mainboard"
            value={stats.totalCards}
            icon={(
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            )}
            color="blue"
            theme={theme}
          />
          <StatCard
            title="Criaturas"
            value={stats.creatureCount}
            subtitle={`${((stats.creatureCount / stats.totalCards) * 100).toFixed(0)}%`}
            icon={(
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            color="green"
            theme={theme}
          />
          <StatCard
            title="Hechizos"
            value={stats.nonCreatureCount}
            subtitle={`${((stats.nonCreatureCount / stats.totalCards) * 100).toFixed(0)}%`}
            icon={(
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            )}
            color="purple"
            theme={theme}
          />
          <StatCard
              title="CMC Promedio"
              value={stats.avgCmc}
              subtitle={`Exc. tierras (${stats.nonLandCardCount})`}
              icon={(
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              )}
              color="orange"
              theme={theme}
              isDecimal={true}
  />
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Mana Curve */}
          <div className="bg-white/80 rounded-xl p-6 border border-white/60 shadow-sm">
            <h4 className={`font-bold ${theme.text.strong} mb-4 flex items-center gap-2`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Curva de Maná
            </h4>
            <div className="space-y-3">
              {Object.entries(stats.cmcDistribution)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .slice(0, 8) // Limitar a CMC 0-7 para visualización
                .map(([cmc, count]) => {
                  const percentage = stats.totalCards > 0 ? (count / stats.totalCards) * 100 : 0
                  return (
                    <div key={cmc} className="flex items-center gap-3">
                      <span className="w-8 text-sm font-bold text-gray-700 text-center">
                        {cmc === '0' ? '0' : cmc}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-7 relative overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${theme.colors.primary}`}
                          style={{ width: `${Math.max(percentage, 3)}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-700">{count}</span>
                        </div>
                      </div>
                      <span className="w-12 text-xs text-gray-500 text-right">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Type Distribution */}
          <div className="bg-white/80 rounded-xl p-6 border border-white/60 shadow-sm">
            <h4 className={`font-bold ${theme.text.strong} mb-4 flex items-center gap-2`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Distribución por Tipo
            </h4>
            <div className="space-y-3">
              {Object.entries(stats.typeDistribution)
                .sort(([,a], [,b]) => b - a)
                .map(([type, count]) => {
                  const percentage = (count / stats.totalCards) * 100
                  return (
                    <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <TypeIcon type={type} />
                        <span className="text-sm font-semibold text-gray-700">{type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{count}</span>
                        <span className="text-xs text-gray-500 w-10 text-right">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>

        {/* Color Distribution */}
        {Object.keys(stats.colorDistribution).length > 0 && (
          <div className="bg-white/80 rounded-xl p-6 border border-white/60 shadow-sm mb-8">
            <h4 className={`font-bold ${theme.text.strong} mb-4 flex items-center gap-2`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
              Identidad de Color
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {Object.entries(stats.colorDistribution)
                .sort(([,a], [,b]) => b - a)
                .map(([color, count]) => (
                  <div key={color} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex justify-center mb-2">
                      {color !== 'Incoloro' ? <ManaSymbol symbol={color} size="lg" /> : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-600">○</span>
                        </div>
                      )}
                    </div>
                    <div className="text-lg font-bold text-gray-900">{count}</div>
                    <div className="text-xs text-gray-500">
                      {color === 'W' ? 'Blanco' :
                       color === 'U' ? 'Azul' :
                       color === 'B' ? 'Negro' :
                       color === 'R' ? 'Rojo' :
                       color === 'G' ? 'Verde' : color}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Export CTA */}
        <ExportDeckCTA theme={theme} deck={deck} />
      </Card>
    </div>
  )
}

/* ===============================================================
  COMPONENTE DE TARJETA DE ESTADÍSTICA
  =============================================================== */
function StatCard({ title, value, subtitle, icon, color = 'blue', theme, isDecimal = false }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-600',
    green: 'from-green-500 to-green-600 text-green-600',
    purple: 'from-purple-500 to-purple-600 text-purple-600',
    orange: 'from-orange-500 to-orange-600 text-orange-600',
    red: 'from-red-500 to-red-600 text-red-600',
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-white/60 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} flex items-center justify-center shadow-sm`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <div className={`text-2xl sm:text-3xl font-bold ${colorClasses[color].split(' ')[2]}`}>
          {isDecimal ? value : new Intl.NumberFormat().format(value)}
        </div>
        <div className="text-sm font-medium text-gray-600">{title}</div>
        {subtitle && (
          <div className="text-xs text-gray-500">{subtitle}</div>
        )}
      </div>
    </div>
  )
}

/* ===============================================================
  COMPONENTE DE ICONOS POR TIPO
  =============================================================== */
function TypeIcon({ type }) {
  const iconMap = {
    'Criatura': (
      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    ),
    'Tierra': (
      <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
        <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
        </svg>
      </div>
    ),
    'Instantáneo': (
      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    ),
    'Hechizo': (
      <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </div>
    ),
    'Artefacto': (
      <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      </div>
    ),
    'Encantamiento': (
      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
        <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
    ),
    'Caminante de Planos': (
      <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
        <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </div>
    )
  }

  return iconMap[type] || (
    <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
      <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 .211-.018.42-.053.624M13 16v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-9M8 12h6m-3-6V4" />
      </svg>
    </div>
  )
}

/* ===============================================================
  ESTADOS DE CARGA MEJORADOS CON SKELETON AVANZADO
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
          <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
            <div className="space-y-6 sm:space-y-8">
              {/* Breadcrumb skeleton */}
              <div className="loading-skeleton h-4 w-48 rounded-lg" />
              
              {/* Theme indicator skeleton */}
              <div className="loading-skeleton h-12 w-32 rounded-full" />
              
              {/* Main content skeleton */}
              <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-8">
                <div className="flex-1 min-w-0 space-y-6">
                  {/* Title skeleton */}
                  <div className="space-y-4">
                    <div className="loading-skeleton h-16 sm:h-20 md:h-24 lg:h-28 w-full rounded-xl" />
                    <div className="loading-skeleton h-12 w-3/4 rounded-xl" />
                  </div>
                  
                  {/* Tags skeleton */}
                  <div className="flex flex-wrap gap-3">
                    <div className="loading-skeleton h-8 w-24 rounded-lg" />
                    <div className="loading-skeleton h-8 w-32 rounded-lg" />
                    <div className="loading-skeleton h-8 w-28 rounded-lg" />
                  </div>
                  
                  {/* Description skeleton */}
                  <div className="space-y-3">
                    <div className="loading-skeleton h-4 w-full rounded" />
                    <div className="loading-skeleton h-4 w-5/6 rounded" />
                    <div className="loading-skeleton h-4 w-4/5 rounded" />
                  </div>
                </div>
                
                {/* Action buttons skeleton */}
                <div className="flex flex-col gap-4 min-w-[220px]">
                  <div className="loading-skeleton h-12 w-full rounded-xl" />
                  <div className="loading-skeleton h-12 w-full rounded-xl" />
                  <div className="loading-skeleton h-12 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </section>

          {/* Main Content Layout Skeleton */}
          <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Sidebar skeleton */}
            <div className="lg:col-span-1 space-y-6">
              <div className="loading-skeleton aspect-[5/7] w-full rounded-xl" />
              <div className="space-y-4">
                <div className="loading-skeleton h-6 w-3/4 rounded" />
                <div className="loading-skeleton h-4 w-full rounded" />
                <div className="loading-skeleton h-4 w-5/6 rounded" />
              </div>
            </div>

            {/* Main Content skeleton */}
            <div className="lg:col-span-3 space-y-8">
              {/* Info cards skeleton */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="loading-skeleton h-48 w-full rounded-2xl" />
                <div className="loading-skeleton h-48 w-full rounded-2xl" />
              </div>
              
              {/* Stats skeleton */}
              <div className="loading-skeleton h-80 w-full rounded-2xl" />
              
              {/* Card list skeleton */}
              <div className="space-y-6">
                <div className="loading-skeleton h-64 w-full rounded-2xl" />
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <div className="loading-skeleton w-12 h-12 rounded-xl flex-shrink-0" />
                      <div className="loading-skeleton w-16 sm:w-20 aspect-[5/7] rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="loading-skeleton h-6 w-3/4 rounded" />
                        <div className="loading-skeleton h-4 w-1/2 rounded" />
                      </div>
                      <div className="loading-skeleton w-10 h-10 rounded-xl flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===============================================================
  ESTADOS DE ERROR MEJORADOS CON ACCIONES
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
          <div className="w-24 h-24 rounded-full bg-red-100 border-4 border-red-200 flex items-center justify-center mx-auto mb-8 animate-float-subtle shadow-lg">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          {/* Error content */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Oops, algo salió mal</h2>
              <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200 mb-6">
                <p className="text-red-800 leading-relaxed font-medium text-lg">
                  {error || 'Ocurrió un error inesperado al cargar el mazo. Por favor, inténtalo de nuevo.'}
                </p>
              </div>
            </div>
            
            {/* Error details (if needed) */}
            <details className="text-left">
              <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 font-medium mb-2">
                Detalles técnicos
              </summary>
              <div className="text-xs font-mono bg-gray-100 p-4 rounded-lg border text-gray-700 leading-relaxed">
                Error: {error || 'Unknown error occurred'}
                <br />
                Timestamp: {new Date().toISOString()}
                <br />
                User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}
              </div>
            </details>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {onRetry && (
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className={`
                    inline-flex items-center gap-3 px-8 py-4 rounded-xl text-white font-bold 
                    transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 
                    shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed
                    bg-gradient-to-r ${theme.colors.primary} ${theme.colors.ring}
                  `}
                >
                  <svg className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isRetrying ? 'Reintentando...' : 'Reintentar'}
                </button>
              )}
              
              <Link
                href="/decks"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a mazos
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ===============================================================
  ESTADO VACÍO MEJORADO CON ILUSTRACIÓN
  =============================================================== */
function ProfessionalEmptyState({ theme, title, description, actionText, actionHref, icon }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50/50 to-transparent p-16 text-center">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-gray-100/30 to-transparent rounded-full blur-3xl" />
      
      <div className="relative space-y-8">
        {/* Icon */}
        <div className="mx-auto">
          <div className="relative w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-gray-200/50 shadow-xl animate-float-subtle mx-auto">
            {icon || (
              <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-4 max-w-md mx-auto">
          <h3 className={`text-2xl sm:text-3xl font-bold ${theme.text.strong}`}>
            {title || "No hay información disponible"}
          </h3>
          <p className={`${theme.text.soft} leading-relaxed text-lg`}>
            {description || "Parece que no hay datos para mostrar en esta sección."}
          </p>
        </div>
        
        {/* Action */}
        {actionText && actionHref && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={actionHref}
              className={`
                group inline-flex items-center gap-3 px-8 py-4 rounded-xl 
                bg-gradient-to-r ${theme.colors.primary} text-white font-bold 
                shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 
                focus:outline-none focus:ring-4 ${theme.colors.ring}
              `}
            >
              <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {actionText}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
/* ===============================================================
  COMPONENTE PRINCIPAL DE CARTAS DEL MAZO INTEGRADO
  =============================================================== */
function ProfessionalDeckCards({ theme, deck }) {
  const {
    isOpen: isModalOpen,
    currentCard: modalCard,
    imageLoaded,
    setImageLoaded,
    imageError,
    setImageError,
    openModal,
    closeModal
  } = useImageModal()

  if (!deck.deck_cards || deck.deck_cards.length === 0) {
    return (
      <div 
        className="crystal-card animate-professional-fade-in"
        style={{ '--glow-color': theme.colors.glowColor }}
      >
        <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-white/50 shadow-lg hover:shadow-xl transition-all duration-500" padding="lg">
          <ProfessionalEmptyState
            theme={theme}
            title="No hay cartas disponibles"
            description="Este mazo no tiene cartas importadas o solo contiene metadatos básicos. Intenta sincronizar con la fuente externa para importar las cartas."
            icon={(
              <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            )}
          />
        </Card>
      </div>
    )
  }

  // Separar mainboard y sideboard
  const mainboardCards = deck.deck_cards
    .filter(dc => dc.board_type === 'mainboard')
    .map(dc => ({
      ...dc.cards,
      quantity: dc.quantity,
      board_type: dc.board_type
    }))

  const sideboardCards = deck.deck_cards
    .filter(dc => dc.board_type === 'sideboard')
    .map(dc => ({
      ...dc.cards,
      quantity: dc.quantity,
      board_type: dc.board_type
    }))

  // Calcular totales
  const mainboardTotal = mainboardCards.reduce((sum, card) => sum + card.quantity, 0)
  const sideboardTotal = sideboardCards.reduce((sum, card) => sum + card.quantity, 0)

  return (
    <>
      <div className="space-y-8">
        {/* Estadísticas del mazo */}
        <ProfessionalDeckStats theme={theme} deck={deck} />

        {/* Mainboard */}
        {mainboardCards.length > 0 && (
          <ProfessionalCardList
            theme={theme}
            cards={mainboardCards}
            title="Mainboard"
            totalCount={mainboardTotal}
            uniqueCount={mainboardCards.length}
          />
        )}

        {/* Sideboard */}
        {sideboardCards.length > 0 && (
          <ProfessionalCardList
            theme={theme}
            cards={sideboardCards}
            title="Sideboard"
            totalCount={sideboardTotal}
            uniqueCount={sideboardCards.length}
          />
        )}
      </div>

      {/* Modal único centralizado */}
      <ProfessionalImageModal
        isOpen={isModalOpen}
        card={modalCard}
        onClose={closeModal}
        imageLoaded={imageLoaded}
        setImageLoaded={setImageLoaded}
        imageError={imageError}
        setImageError={setImageError}
        theme={theme}
      />
    </>
  )
}

/* ===============================================================
  COMPONENTE DE INFORMACIÓN MEJORADO
  =============================================================== */
function ProfessionalDeckInfoCards({ theme, deck }) {
  const getSourceName = () => deck.moxfield_url ? 'Moxfield' : 'Archidekt'
  const getLastSyncStatus = () => {
    if (!deck.last_synced_at) return { status: 'never', text: 'Nunca sincronizado', color: 'gray', description: 'Este mazo no ha sido sincronizado desde fuentes externas' }
    
    const lastSync = new Date(deck.last_synced_at)
    const now = new Date()
    const hoursDiff = (now - lastSync) / (1000 * 60 * 60)
    
    if (hoursDiff < 1) return { 
      status: 'recent', 
      text: 'Hace menos de 1 hora', 
      color: 'green', 
      description: 'Datos completamente actualizados'
    }
    if (hoursDiff < 24) return { 
      status: 'today', 
      text: `Hace ${Math.floor(hoursDiff)} horas`, 
      color: 'blue', 
      description: 'Datos recientes y confiables'
    }
    
    const daysDiff = Math.floor(hoursDiff / 24)
    if (daysDiff < 7) return { 
      status: 'week', 
      text: `Hace ${daysDiff} días`, 
      color: 'yellow', 
      description: 'Considera sincronizar para datos más recientes'
    }
    
    return { 
      status: 'old', 
      text: `Hace ${daysDiff} días`, 
      color: 'red', 
      description: 'Datos desactualizados, se recomienda sincronizar'
    }
  }

  const syncStatus = getLastSyncStatus()

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Fuente externa mejorada */}
      <div 
        className="crystal-card animate-professional-fade-in"
        style={{ '--glow-color': theme.colors.glowColor, animationDelay: '0.1s' }}
      >
        <Card className="relative overflow-hidden bg-white/95 backdrop-blur-sm border-2 border-white/60 shadow-lg hover:shadow-xl transition-all duration-500" padding="lg">
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.colors.primary}`} />
          
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.colors.primary} flex items-center justify-center animate-float-subtle shadow-lg`}>
              <svg className={`w-6 h-6 text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-xl font-bold ${theme.text.strong} mb-1`}>Fuente Externa</h3>
              <p className={`text-sm ${theme.text.soft} font-medium`}>Origen de los datos del mazo</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <span className={`text-sm font-semibold ${theme.text.soft}`}>Plataforma</span>
              </div>
              <p className={`${theme.text.strong} font-bold text-lg`}>{getSourceName()}</p>
            </div>
            
            {(deck.moxfield_url || deck.archidekt_url) && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <span className={`text-sm font-semibold ${theme.text.soft}`}>URL</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(deck.moxfield_url || deck.archidekt_url)}
                    className="ml-auto text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition-colors"
                    title="Copiar URL"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-8-4h8M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H9l-4 4v10a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <p className={`text-xs ${theme.text.soft} break-all font-mono bg-white p-3 rounded border border-gray-300`}>
                  {deck.moxfield_url || deck.archidekt_url}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Estado de sincronización mejorado */}
      <div 
        className="crystal-card animate-professional-fade-in"
        style={{ '--glow-color': theme.colors.glowColor, animationDelay: '0.2s' }}
      >
        <Card className="relative overflow-hidden bg-white/95 backdrop-blur-sm border-2 border-white/60 shadow-lg hover:shadow-xl transition-all duration-500" padding="lg">
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.colors.primary}`} />
          
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center animate-float-subtle shadow-lg border-2 ${
              syncStatus.color === 'green' ? 'bg-green-100 border-green-200' :
              syncStatus.color === 'blue' ? 'bg-blue-100 border-blue-200' :
              syncStatus.color === 'yellow' ? 'bg-yellow-100 border-yellow-200' :
              syncStatus.color === 'red' ? 'bg-red-100 border-red-200' : 'bg-gray-100 border-gray-200'
            }`}>
              <svg className={`w-6 h-6 ${
                syncStatus.color === 'green' ? 'text-green-600' :
                syncStatus.color === 'blue' ? 'text-blue-600' :
                syncStatus.color === 'yellow' ? 'text-yellow-600' :
                syncStatus.color === 'red' ? 'text-red-600' : 'text-gray-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-xl font-bold ${theme.text.strong} mb-1`}>Estado de Sincronización</h3>
              <p className={`text-sm ${theme.text.soft} font-medium`}>Actualización de datos</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  syncStatus.color === 'green' ? 'bg-green-500' :
                  syncStatus.color === 'blue' ? 'bg-blue-500' :
                  syncStatus.color === 'yellow' ? 'bg-yellow-500' :
                  syncStatus.color === 'red' ? 'bg-red-500' : 'bg-gray-500'
                }`}>
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className={`text-sm font-semibold ${theme.text.soft}`}>Última sincronización</span>
              </div>
              <p className={`${theme.text.strong} font-bold text-lg mb-2`}>{syncStatus.text}</p>
              <p className="text-xs text-gray-600">{syncStatus.description}</p>
              {deck.last_synced_at && (
                <p className="text-xs text-gray-500 mt-1 font-mono" title="Fecha exacta ISO">
                  {new Date(deck.last_synced_at).toISOString()}
                </p>
              )}
            </div>
            
            {deck.deck_hash && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <span className={`text-sm font-semibold ${theme.text.soft}`}>Hash del mazo</span>
                </div>
                <p className={`text-xs ${theme.text.soft} font-mono break-all bg-white p-3 rounded border border-gray-300`}>
                  {deck.deck_hash}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ===============================================================
  COMPONENTE HERO MEJORADO CON BREADCRUMBS Y ACCIONES
  =============================================================== */
function ProfessionalDeckHero({ theme, deck, user, onSync, onDelete, syncing }) {
  const [loaded, setLoaded] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const isOwner = user && deck && user.id === deck.user_id
  const getExternalUrl = () => deck.moxfield_url || deck.archidekt_url
  const getSourceName = () => deck.moxfield_url ? 'Moxfield' : 'Archidekt'

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
        <div className="space-y-6 sm:space-y-8">
          {/* Breadcrumb mejorado */}
          <nav 
            className={`${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.1s' }}
            aria-label="Breadcrumb"
          >
            <div className="flex items-center gap-2 text-sm">
              <Link 
                href="/decks" 
                className={`
                  ${theme.text.soft} hover:${theme.text.strong} transition-all duration-300 
                  font-semibold px-4 py-2 rounded-lg hover:bg-white/20 backdrop-blur-sm 
                  flex items-center gap-2
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                Biblioteca de Mazos
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className={`${theme.text.strong} font-bold px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm`} aria-current="page">
                {deck.name}
              </span>
            </div>
          </nav>

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

          {/* Contenido principal mejorado */}
          <div 
            className={`space-y-8 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.4s' }}
          >
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-8">
              <div className="flex-1 min-w-0">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-6">
                  <span className={`${theme.text.strong} block animate-float-subtle`}>
                    {deck.name}
                  </span>
                </h1>
                
                {/* Metadata mejorada */}
                <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                  <MetadataBadge
                    icon={(
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    )}
                    text={deck.format}
                    delay="0.6s"
                  />
                  
                  <MetadataBadge
                    icon={(
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    text={format(new Date(deck.updated_at), 'dd \'de\' MMMM', { locale: es })}
                    delay="0.7s"
                  />

                  {deck.profiles?.nickname && (
                    <MetadataBadge
                      icon={(
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                      text={`por ${deck.profiles.nickname}`}
                      delay="0.8s"
                    />
                  )}

                  {deck.total_cards > 0 && (
                    <MetadataBadge
                      icon={(
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      )}
                      text={`${deck.total_cards} cartas`}
                      delay="0.9s"
                    />
                  )}
                </div>

                {/* Descripción mejorada */}
                {deck.description && (
                  <div className="animate-professional-fade-in bg-white/60 rounded-xl p-6 backdrop-blur-sm border border-white/50 shadow-lg mb-6" style={{ animationDelay: '1s' }}>
                    <p className={`${theme.text.soft} leading-relaxed font-medium text-base`}>
                      {deck.description}
                    </p>
                  </div>
                )}

                {/* Fact box mejorado */}
                <div className="animate-professional-fade-in bg-white/40 rounded-xl p-4 backdrop-blur-sm border border-white/40 shadow-lg" style={{ animationDelay: '1.1s' }}>
                  <div className={`text-sm ${theme.text.soft} flex items-start gap-3`}>
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0 animate-pulse-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div>
                      <span className="font-bold">Estrategia actual: </span>
                      <span className="italic">{theme.fact}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción mejorados */}
              <div className="flex flex-col gap-4 sm:min-w-[240px] animate-professional-fade-in" style={{ animationDelay: '1.2s' }}>
                {getExternalUrl() && (
                  <ActionButton
                    href={getExternalUrl()}
                    external
                    icon={(
                      <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    )}
                    variant="secondary"
                  >
                    Ver en {getSourceName()}
                  </ActionButton>
                )}

                {isOwner && (
                  <>
                    {getExternalUrl() && (
                      <ActionButton
                        onClick={onSync}
                        disabled={syncing}
                        icon={(
                          <svg className={`w-5 h-5 transition-transform duration-300 ${syncing ? 'animate-spin' : 'group-hover:rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        )}
                        variant="primary"
                        theme={theme}
                      >
                        {syncing ? 'Sincronizando...' : 'Sincronizar'}
                      </ActionButton>
                    )}

                    <ActionButton
                      href={`/decks/${deck.id}/edit`}
                      icon={(
                        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      )}
                      variant="secondary"
                    >
                      Editar Mazo
                    </ActionButton>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===============================================================
  COMPONENTES AUXILIARES PARA EL HERO
  =============================================================== */
function MetadataBadge({ icon, text, delay = "0s" }) {
  return (
    <div 
      className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2 backdrop-blur-sm border border-white/50 animate-professional-fade-in hover:bg-white/80 transition-all duration-300"
      style={{ animationDelay: delay }}
    >
      {icon}
      <span className="font-semibold text-gray-700">{text}</span>
    </div>
  )
}

function ActionButton({ 
  children, 
  href, 
  onClick, 
  icon, 
  variant = 'primary', 
  theme, 
  external = false, 
  disabled = false 
}) {
  const baseClasses = `
    group inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl 
    font-semibold transition-all duration-300 hover:scale-105 
    focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-xl
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `
  
  const variants = {
    primary: theme ? `bg-gradient-to-r ${theme.colors.primary} text-white hover:shadow-2xl ${theme.colors.ring}` : 
             'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-2xl ring-blue-300',
    secondary: 'bg-white/80 backdrop-blur-sm text-gray-800 border-2 border-gray-300 hover:border-gray-400 hover:bg-white ring-gray-300'
  }
  
  const className = `${baseClasses} ${variants[variant]}`
  
  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {icon}
          {children}
        </a>
      )
    } else {
      return (
        <Link href={href} className={className}>
          {icon}
          {children}
        </Link>
      )
    }
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {icon}
      {children}
    </button>
  )
}

/* ===============================================================
  COMPONENTE PRINCIPAL INTEGRADO - VERSION FINAL
  =============================================================== */
export default function EnhancedProfessionalDeckDetailPage() {
  const { theme, index: themeIndex, isPaused, togglePause } = useThemeRotation(40000)
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState(null)
  const { syncDeck, deleteDeck, loading: actionLoading, error: actionError } = useDeckActions()
  const [deck, setDeck] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Autenticación de usuario
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (mounted) setUser(data.user || null)
      } catch (error) {
        console.error('Error getting user:', error)
        if (mounted) setUser(null)
      }
    })()
    
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (mounted) setUser(session?.user || null)
    })
    
    return () => {
      mounted = false
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  // Obtener datos del mazo
  useEffect(() => {
    if (!id) return

    const fetchDeck = async () => {
      try {
        const { data: session } = await supabase.auth.getSession()
        const headers = {
          'Content-Type': 'application/json'
        }
        
        if (session.session?.access_token) {
          headers.Authorization = `Bearer ${session.session.access_token}`
        }

        const response = await fetch(`/api/decks/${id}`, { headers })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Mazo no encontrado')
        }

        const data = await response.json()
        setDeck(data.deck)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDeck()
  }, [id])

  const isOwner = user && deck && user.id === deck.user_id

  const handleSync = async () => {
    setSyncing(true)
    setSyncStatus(null)

    try {
      const result = await syncDeck(deck.id)
      setSyncStatus({
        type: 'success',
        message: result.hasChanges ? 'Mazo actualizado exitosamente' : 'El mazo ya estaba actualizado',
        changes: result.changes
      })

      if (result.hasChanges) {
        // Recargar datos del mazo
        const { data: session } = await supabase.auth.getSession()
        const headers = { 'Content-Type': 'application/json' }
        if (session.session?.access_token) {
          headers.Authorization = `Bearer ${session.session.access_token}`
        }
        
        const response = await fetch(`/api/decks/${id}`, { headers })
        if (response.ok) {
          const data = await response.json()
          setDeck(data.deck)
        }
      }
    } catch (error) {
      setSyncStatus({
        type: 'error',
        message: error.message || 'Error al sincronizar el mazo'
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteDeck(deck.id)
      router.push('/decks')
    } catch (error) {
      setError(error.message || 'Error al eliminar el mazo')
    }
  }

  const handleRetry = async () => {
    setLoading(true)
    setError('')
    
    // Reintento de carga
    try {
      const { data: session } = await supabase.auth.getSession()
      const headers = { 'Content-Type': 'application/json' }
      
      if (session.session?.access_token) {
        headers.Authorization = `Bearer ${session.session.access_token}`
      }

      const response = await fetch(`/api/decks/${id}`, { headers })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar el mazo')
      }

      const data = await response.json()
      setDeck(data.deck)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <ProfessionalLoadingSkeleton theme={theme} />
  }

  if (error || !deck) {
    return <ProfessionalErrorState theme={theme} error={error} onRetry={handleRetry} />
  }

  return (
    <div
      className="min-h-screen theme-transition pb-20 sm:pb-8"
      style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})` }}
    >
      {/* Elementos decorativos de fondo */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '3s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12 lg:space-y-16">
        {/* Hero Section */}
        <ProfessionalDeckHero 
          theme={theme} 
          deck={deck} 
          user={user} 
          onSync={handleSync}
          onDelete={() => setShowDeleteConfirm(true)}
          syncing={syncing}
        />

        {/* Estado de Sincronización */}
        <ProfessionalSyncStatus theme={theme} syncStatus={syncStatus} />

        {/* Layout Principal */}
        <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <ProfessionalCommanderInfo theme={theme} deck={deck}/>
          </div>

          {/* Contenido Principal */}
          <div className="lg:col-span-3 space-y-8">
            <ProfessionalSection
              title="Información del Mazo"
              subtitle="Fuente y estado de sincronización"
              theme={theme}
              index={0}
            >
              <ProfessionalDeckInfoCards theme={theme} deck={deck} />
            </ProfessionalSection>

            <ProfessionalSection
              title="Cartas del Mazo"
              subtitle="Análisis detallado y lista completa"
              theme={theme}
              index={1}
            >
              <ProfessionalDeckCards theme={theme} deck={deck} />
            </ProfessionalSection>

            {isOwner && (
              <ProfessionalSection
                title="Gestión del Mazo"
                subtitle="Opciones avanzadas de administración"
                theme={theme}
                index={2}
              >
                <ProfessionalDangerZone
                  theme={theme}
                  deck={deck}
                  onDelete={() => setShowDeleteConfirm(true)}
                />
              </ProfessionalSection>
            )}
          </div>
        </div>

        {/* Footer Profesional */}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8a2 2 0 012-2z" />
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
                <button
                  key={t.key}
                  onClick={() => switchToTheme && switchToTheme(t.key)}
                  className={`h-2 rounded-full transition-all duration-500 hover:scale-125 ${
                    i === themeIndex ? 'w-8 opacity-100' : 'w-2 opacity-40'
                  }`}
                  style={{ 
                    background: `linear-gradient(45deg, ${t.colors.primary})` 
                  }}
                  title={t.label}
                />
              ))}
            </div>
            
            <div className="space-y-2">
              <p className={`text-sm ${theme.text.soft} opacity-75`}>
                {isPaused ? 'Rotación automática pausada' : 'Rotación automática cada 40 segundos'}
              </p>
              <p className={`text-xs ${theme.text.soft} opacity-60 italic`}>
                "{theme.fact}"
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Modal de confirmación de borrado */}
      {showDeleteConfirm && (
        <ProfessionalDeleteModal
          theme={theme}
          deckName={deck.name}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}

/* ===============================================================
  COMPONENTE DE SECCIÓN PROFESIONAL
  =============================================================== */
function ProfessionalSection({ title, subtitle, children, index = 0, theme, rightAction }) {
  return (
    <section 
      className="space-y-8 animate-professional-fade-in"
      style={{ animationDelay: `${index * 200}ms` }}
    >
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="space-y-2">
          <h2 className={`text-3xl font-bold ${theme.text.strong} flex items-center gap-3`}>
            <span className="animate-float-subtle">{title}</span>
          </h2>
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

/* ===============================================================
  COMPONENTE DE ESTADO DE SINCRONIZACIÓN
  =============================================================== */
function ProfessionalSyncStatus({ theme, syncStatus }) {
  if (!syncStatus) return null

  return (
    <div 
      className="crystal-card animate-professional-fade-in"
      style={{ '--glow-color': theme.colors.glowColor }}
    >
      <Card className={`relative overflow-hidden backdrop-blur-sm shadow-xl border-2 ${
        syncStatus.type === 'success' 
          ? 'bg-green-50/95 border-green-300' 
          : 'bg-red-50/95 border-red-300'
      }`} padding="lg">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          syncStatus.type === 'success' ? 'from-green-400 to-emerald-500' : 'from-red-400 to-red-500'
        }`} />
        
        <div className="flex items-start gap-4 mt-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg animate-float-subtle ${
            syncStatus.type === 'success' ? 'bg-green-100 border-2 border-green-200' : 'bg-red-100 border-2 border-red-200'
          }`}>
            <svg className={`w-6 h-6 ${
              syncStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {syncStatus.type === 'success' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
          </div>
          
          <div className="flex-1">
            <p className={`font-bold text-xl mb-2 ${
              syncStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {syncStatus.message}
            </p>
            
            {syncStatus.changes && syncStatus.changes.length > 0 && (
              <div className="mt-4">
                <p className={`text-sm font-semibold mb-3 ${
                  syncStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  Cambios detectados:
                </p>
                <div className="space-y-2">
                  {syncStatus.changes.map((change, i) => (
                    <div key={i} className={`text-sm p-3 rounded-lg border ${
                      syncStatus.type === 'success' 
                        ? 'bg-green-100/80 border-green-200' 
                        : 'bg-red-100/80 border-red-200'
                    }`}>
                      <span className="font-semibold">{change.field}:</span> 
                      <span className="text-gray-600 mx-2">{change.old}</span> → 
                      <span className="font-semibold ml-2">{change.new}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
/* ===============================================================
  COMPONENTES FALTANTES - PROFESSIONAL COMMANDER INFO Y OTROS
  =============================================================== */

/* ===============================================================
  COMPONENTE DE INFORMACIÓN DEL COMANDANTE MEJORADO
  =============================================================== */
function ProfessionalCommanderInfo({ theme, deck }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)
  
  const formatColors = (colors) => {
    if (!colors || colors.length === 0) return 'Incoloro'
    const colorMap = { W: 'Blanco', U: 'Azul', B: 'Negro', R: 'Rojo', G: 'Verde' }
    return colors.map(c => colorMap[c] || c).join(', ')
  }

  const getCommanderImageUrl = () => {
    if (deck.commander_image) {
      return deck.commander_image
    }
    
    if (deck.commander_scryfall_id) {
      return `https://api.scryfall.com/cards/${deck.commander_scryfall_id}?format=image&version=normal`
    }
    
    return null
  }

  const commanderImageUrl = getCommanderImageUrl()

  return (
    <>
      <div 
        className="crystal-card animate-professional-fade-in lg:sticky lg:top-4"
        style={{ '--glow-color': theme.colors.glowColor, animationDelay: '0.3s' }}
      >
        <Card className="relative overflow-hidden bg-white/95 backdrop-blur-sm border border-white/60 shadow-lg hover:shadow-xl transition-all duration-500" padding="md">
          <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${theme.colors.primary}`} />
          
          {/* Header compacto */}
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.colors.primary} flex items-center justify-center shadow-lg animate-float-subtle`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className={`text-xl font-black ${theme.text.strong} tracking-tight`}>
                  Información del Mazo
                </h2>
                <p className={`text-sm ${theme.text.soft} font-medium`}>
                  Detalles y estadísticas
                </p>
              </div>
            </div>
          </div>

          {/* Nombre del comandante - compacto */}
          {deck.commander_name && (
            <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-blue-800 uppercase tracking-wide">
                    {deck.format === 'Commander' ? 'Comandante' : 'Carta Principal'}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-black text-gray-900 leading-tight tracking-tight">
                {deck.commander_name}
              </h3>
            </div>
          )}

          {/* Imagen compacta */}
          {commanderImageUrl && (
            <div className="mb-4">
              <div 
                className="relative group cursor-pointer bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                onClick={() => setShowFullImage(true)}
              >
                <div className="relative w-full aspect-[5/7]">
                  {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 loading-skeleton rounded-lg" />
                  )}
                  
                  {imageError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 border border-dashed border-gray-300">
                      <div className="text-center p-3">
                        <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-xs text-gray-500">No disponible</p>
                      </div>
                    </div>
                  )}
                  
                  {!imageError && (
                    <Image
                      src={commanderImageUrl}
                      alt={deck.commander_name || deck.name}
                      fill
                      className={`object-cover transition-all duration-300 group-hover:scale-105 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageError(true)}
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                    />
                  )}
                  
                  {/* Overlay simple de hover */}
                  <div className="absolute inset-0 card-hover-overlay transition-colors duration-300 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-90 group-hover:scale-100">
                      Ver completa
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Secciones de información compactas */}
          <div className="space-y-3">
            {/* Identidad de color - layout horizontal */}
            {deck.commander_colors && deck.commander_colors.length > 0 && (
              <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-800">Identidad de Color</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {deck.commander_colors.map((color, i) => (
                      <div key={i} className="transform hover:scale-110 transition-transform duration-200">
                        <ManaSymbol symbol={color} size="md" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Formato - layout horizontal */}
            <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-800">Formato</span>
                </div>
                <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                  {deck.format}
                </span>
              </div>
            </div>

            {/* Estadísticas - grid compacto */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 text-center">
                <div className="text-xl font-bold text-blue-800">{deck.total_cards || 0}</div>
                <div className="text-xs text-blue-600 font-semibold">TOTAL</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 text-center">
                <div className="text-xl font-bold text-green-800">{deck.mainboard_count || 0}</div>
                <div className="text-xs text-green-600 font-semibold">MAINBOARD</div>
              </div>
            </div>
          </div>

          {/* Acción del footer compacta */}
          {deck.commander_scryfall_id && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <a
                href={`https://scryfall.com/card/${deck.commander_scryfall_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg 
                  bg-gradient-to-r ${theme.colors.primary} text-white font-semibold text-sm 
                  transition-all duration-300 hover:scale-[1.02] hover:shadow-lg 
                  focus:outline-none focus:ring-2 ${theme.colors.ring}
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Ver en Scryfall
              </a>
            </div>
          )}
        </Card>
      </div>

      {/* Modal de imagen completa liviano */}
      {showFullImage && commanderImageUrl && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 modal-backdrop"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] modal-content">
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute -top-10 right-0 w-8 h-8 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10"
              aria-label="Cerrar imagen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="relative rounded-xl overflow-hidden shadow-2xl bg-white">
              <Image
                src={commanderImageUrl}
                alt={deck.commander_name || deck.name}
                width={400}
                height={560}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ===============================================================
  COMPONENTE DE ZONA PELIGROSA MEJORADO
  =============================================================== */
function ProfessionalDangerZone({ theme, deck, onDelete }) {
  return (
    <div 
      className="crystal-card animate-professional-fade-in"
      style={{ '--glow-color': 'rgba(239, 68, 68, 0.5)', animationDelay: '0.7s' }}
    >
      <Card className="relative overflow-hidden bg-red-50/95 backdrop-blur-sm border-2 border-red-300 shadow-xl" padding="lg">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-red-500" />
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-red-100 border-2 border-red-200 flex items-center justify-center animate-float-subtle shadow-lg">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-red-900">Zona Peligrosa</h3>
        </div>

        <div className="bg-white/80 rounded-xl p-4 border border-red-200 mb-6">
          <p className="text-red-700 font-medium leading-relaxed">
            Una vez que elimines este mazo, no podrás recuperarlo. Esta acción es permanente y eliminará toda la información asociada, incluyendo el historial de sincronización.
          </p>
        </div>

        <button
          onClick={onDelete}
          className="group px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 hover:scale-105 font-semibold focus:outline-none focus:ring-4 focus:ring-red-500/20 shadow-xl border border-red-500"
        >
          <svg className="w-5 h-5 inline mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Eliminar Mazo
        </button>
      </Card>
    </div>
  )
}

/* ===============================================================
  MODAL DE CONFIRMACIÓN DE BORRADO MEJORADO
  =============================================================== */
function ProfessionalDeleteModal({ theme, deckName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 mobile-optimized modal-backdrop">
      <div 
        className="crystal-card modal-content"
        style={{ '--glow-color': 'rgba(239, 68, 68, 0.5)' }}
      >
        <Card className="max-w-md w-full bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-red-200" padding="lg">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-red-100 border-2 border-red-200 flex items-center justify-center mx-auto mb-6 animate-float-subtle shadow-lg">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">¿Eliminar mazo?</h3>
            
            <div className="bg-red-50 rounded-xl p-4 border border-red-200 mb-6">
              <p className="text-gray-700 leading-relaxed">
                ¿Estás seguro de que quieres eliminar <strong className="text-red-700">"{deckName}"</strong>?  
                Esta acción no se puede deshacer y se perderán todos los datos asociados.
              </p>
            </div>
          
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium shadow-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 hover:scale-105 font-semibold shadow-xl border border-red-500"
              >
                Eliminar
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}