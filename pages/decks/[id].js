// pages/decks/[id].js - Fixed version
import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Card from '../../components/Card'
import FramedArt from '../../components/FramedArt'
import ManaSymbol from '../../components/ManaSymbol'

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
    fact: 'El análisis detallado revela las verdaderas sinergias.',
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
    fact: 'Cada carta cuenta una historia dentro de la estrategia mayor.',
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
    fact: 'La perfección se encuentra en los detalles organizados.',
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
    fact: 'Todo mazo evoluciona, incluso después de ser archivado.',
  },
]

const DEFAULT_THEME_KEY = 'azorius'

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
if (typeof document !== 'undefined' && !document.getElementById('professional-deck-detail-styles')) {
  const style = document.createElement('style')
  style.id = 'professional-deck-detail-styles'
  style.textContent = professionalCSS
  document.head.appendChild(style)
}

/* ===============================================================
  HOOK DE ROTACIÓN DE TEMAS (REUTILIZADO)
  =============================================================== */
function useThemeRotation(intervalMs = 50000) {
  const [themeKey, setThemeKey] = useState(DEFAULT_THEME_KEY)
  const [index, setIndex] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mp_professional_theme_deck_detail')
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
          localStorage.setItem('mp_professional_theme_deck_detail', nextKey) 
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
  HOOK PARA ACCIONES DE DECK
  =============================================================== */
function useDeckActions() {
  const syncDeck = async (deckId) => {
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
    } catch (error) {
      console.error('Error syncing deck:', error)
      throw error
    }
  }

  const deleteDeck = async (deckId) => {
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
    } catch (error) {
      console.error('Error deleting deck:', error)
      throw error
    }
  }

  return { syncDeck, deleteDeck }
}

/* ===============================================================
  COMPONENTES PROFESIONALES
  =============================================================== */

function ProfessionalDeckHero({ theme, deck, user, onSync, onDelete, syncing }) {
  const [loaded, setLoaded] = useState(false)
  
  useEffect(() => {
    setLoaded(true)
  }, [])

  const isOwner = user && deck && user.id === deck.user_id
  const getExternalUrl = () => deck.moxfield_url || deck.archidekt_url
  const getSourceName = () => deck.moxfield_url ? 'Moxfield' : 'Archidekt'

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
        <div className="space-y-6 sm:space-y-8">
          {/* Breadcrumb */}
          <nav 
            className={`${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex items-center gap-2 text-sm">
              <Link 
                href="/decks" 
                className={`${theme.text.soft} hover:${theme.text.strong} transition-colors font-medium`}
              >
                Biblioteca de Mazos
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className={`${theme.text.strong} font-semibold`}>{deck.name}</span>
            </div>
          </nav>

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

          {/* Main title and info */}
          <div 
            className={`space-y-4 sm:space-y-6 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.4s' }}
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-gray-900 mb-4">
                  {deck.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="font-medium">{deck.format}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      Actualizado {format(new Date(deck.updated_at), 'dd \'de\' MMMM \'de\' yyyy', { locale: es })}
                    </span>
                  </div>

                  {deck.profiles?.nickname && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>por {deck.profiles.nickname}</span>
                    </div>
                  )}
                </div>

                {deck.description && (
                  <p className={`${theme.text.soft} leading-relaxed font-medium text-sm sm:text-base max-w-3xl`}>
                    {deck.description}
                  </p>
                )}

                <div className={`mt-4 text-xs sm:text-sm ${theme.text.soft} opacity-80`}>
                  <span className="font-semibold">Sabiduría del plano: </span>
                  <span>{theme.fact}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 sm:min-w-[200px]">
                {getExternalUrl() && (
                  <a
                    href={getExternalUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-white transition-all duration-300 hover:scale-105 text-sm sm:text-base font-semibold"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Ver en {getSourceName()}
                  </a>
                )}

                {isOwner && (
                  <>
                    {getExternalUrl() && (
                      <button
                        onClick={onSync}
                        disabled={syncing}
                        className={`inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-white font-semibold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${theme.gradient} hover:shadow-lg ${theme.colors.ring}`}
                      >
                        <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {syncing ? 'Sincronizando...' : 'Sincronizar'}
                      </button>
                    )}

                    <Link
                      href={`/decks/${deck.id}/edit`}
                      className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 hover:scale-105 text-sm sm:text-base font-semibold"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </Link>
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

function ProfessionalSyncStatus({ theme, syncStatus }) {
  if (!syncStatus) return null

  return (
    <div 
      className="crystal-card animate-professional-fade-in"
      style={{ '--glow-color': theme.colors.glowColor }}
    >
      <Card className={`relative overflow-hidden backdrop-blur-sm shadow-lg border ${
        syncStatus.type === 'success' 
          ? 'bg-green-50/90 border-green-200' 
          : 'bg-red-50/90 border-red-200'
      }`} padding="lg">
        <div className={`h-1 bg-gradient-to-r ${
          syncStatus.type === 'success' ? 'from-green-400 to-emerald-500' : 'from-red-400 to-red-500'
        }`} />
        
        <div className="flex items-start gap-3 mt-4">
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
            syncStatus.type === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <svg className={`w-5 h-5 ${
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
            <p className={`font-semibold ${
              syncStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {syncStatus.message}
            </p>
            
            {syncStatus.changes && syncStatus.changes.length > 0 && (
              <div className="mt-3">
                <p className={`text-sm font-medium mb-2 ${
                  syncStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  Cambios detectados:
                </p>
                <div className="space-y-1">
                  {syncStatus.changes.map((change, i) => (
                    <div key={i} className={`text-sm p-2 rounded ${
                      syncStatus.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <span className="font-medium">{change.field}:</span> {change.old} → {change.new}
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

function ProfessionalCommanderInfo({ theme, deck }) {
  const formatColors = (colors) => {
    if (!colors || colors.length === 0) return 'Incoloro'
    const colorMap = { W: 'Blanco', U: 'Azul', B: 'Negro', R: 'Rojo', G: 'Verde' }
    return colors.map(c => colorMap[c] || c).join(', ')
  }

  return (
    <div 
      className="crystal-card animate-professional-fade-in sticky top-4"
      style={{ '--glow-color': theme.colors.glowColor, animationDelay: '0.3s' }}
    >
      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg" padding="none">
        <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`} />
        
        <div className="p-4 sm:p-6">
          <h2 className={`text-lg sm:text-xl font-bold ${theme.text.strong} mb-4`}>
            {deck.format === 'Commander' ? 'Comandante' : 'Información del Mazo'}
          </h2>

          {deck.commander_image && (
            <div className="mb-6 animate-float-subtle">
              <FramedArt 
                src={deck.commander_image}
                alt={deck.commander_name || deck.name}
                isCard={true}
              />
            </div>
          )}

          <div className="space-y-4">
            {deck.commander_name && (
              <div>
                <h3 className={`font-semibold ${theme.text.strong} mb-1 text-sm`}>
                  {deck.format === 'Commander' ? 'Comandante' : 'Carta Principal'}
                </h3>
                <p className={`${theme.text.soft} font-medium`}>{deck.commander_name}</p>
              </div>
            )}

            {deck.commander_colors && deck.commander_colors.length > 0 && (
              <div>
                <h3 className={`font-semibold ${theme.text.strong} mb-2 text-sm`}>Identidad de Color</h3>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {deck.commander_colors.map((color, i) => (
                      <ManaSymbol key={i} symbol={color} size="md" />
                    ))}
                  </div>
                  <span className={`text-xs ${theme.text.soft}`}>
                    {formatColors(deck.commander_colors)}
                  </span>
                </div>
              </div>
            )}

            <div>
              <h3 className={`font-semibold ${theme.text.strong} mb-2 text-sm`}>Formato</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${theme.colors.bgSoft} ${theme.text.strong} ring-2 ring-white/20`}>
                {deck.format}
              </span>
            </div>

{deck.commander_scryfall_id && (
  <div>
    <a
      href={`https://scryfall.com/card/${deck.commander_scryfall_id}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 text-sm ${theme.text.soft} hover:${theme.text.strong} transition-colors font-medium`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      Ver en Scryfall
    </a>
  </div>
)}
          </div>
        </div>
      </Card>
    </div>
  )
}

function ProfessionalDeckInfoCards({ theme, deck }) {
  const getSourceName = () => deck.moxfield_url ? 'Moxfield' : 'Archidekt'
  const getLastSyncStatus = () => {
    if (!deck.last_synced_at) return { status: 'never', text: 'Nunca sincronizado', color: 'gray' }
    
    const lastSync = new Date(deck.last_synced_at)
    const now = new Date()
    const hoursDiff = (now - lastSync) / (1000 * 60 * 60)
    
    if (hoursDiff < 1) return { status: 'recent', text: 'Hace menos de 1 hora', color: 'green' }
    if (hoursDiff < 24) return { status: 'today', text: `Hace ${Math.floor(hoursDiff)} horas`, color: 'blue' }
    
    const daysDiff = Math.floor(hoursDiff / 24)
    if (daysDiff < 7) return { status: 'week', text: `Hace ${daysDiff} días`, color: 'yellow' }
    
    return { status: 'old', text: `Hace ${daysDiff} días`, color: 'red' }
  }

  const syncStatus = getLastSyncStatus()

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* External source card */}
      <div 
        className="crystal-card animate-professional-fade-in"
        style={{ '--glow-color': theme.colors.glowColor, animationDelay: '0.4s' }}
      >
        <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg" padding="none">
          <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`} />
          
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg ${theme.colors.bgSoft} flex items-center justify-center animate-float-subtle`}>
                <svg className={`w-5 h-5 ${theme.text.strong}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className={`text-lg font-bold ${theme.text.strong}`}>Fuente Externa</h3>
            </div>

            <div className="space-y-3">
              <div>
                <span className={`text-sm font-medium ${theme.text.soft}`}>Plataforma:</span>
                <p className={`${theme.text.strong} font-semibold`}>{getSourceName()}</p>
              </div>
              
              {(deck.moxfield_url || deck.archidekt_url) && (
                <div>
                  <span className={`text-sm font-medium ${theme.text.soft}`}>URL:</span>
                  <p className={`text-xs ${theme.text.soft} break-all font-mono`}>
                    {deck.moxfield_url || deck.archidekt_url}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Sync status card */}
      <div 
        className="crystal-card animate-professional-fade-in"
        style={{ '--glow-color': theme.colors.glowColor, animationDelay: '0.5s' }}
      >
        <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg" padding="none">
          <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`} />
          
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center animate-float-subtle ${
                syncStatus.color === 'green' ? 'bg-green-100' :
                syncStatus.color === 'blue' ? 'bg-blue-100' :
                syncStatus.color === 'yellow' ? 'bg-yellow-100' :
                syncStatus.color === 'red' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <svg className={`w-5 h-5 ${
                  syncStatus.color === 'green' ? 'text-green-600' :
                  syncStatus.color === 'blue' ? 'text-blue-600' :
                  syncStatus.color === 'yellow' ? 'text-yellow-600' :
                  syncStatus.color === 'red' ? 'text-red-600' : 'text-gray-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className={`text-lg font-bold ${theme.text.strong}`}>Estado de Sincronización</h3>
            </div>

            <div className="space-y-3">
              <div>
                <span className={`text-sm font-medium ${theme.text.soft}`}>Última sincronización:</span>
                <p className={`${theme.text.strong} font-semibold`}>{syncStatus.text}</p>
              </div>
              
              {deck.deck_hash && (
                <div>
                  <span className={`text-sm font-medium ${theme.text.soft}`}>Hash del mazo:</span>
                  <p className={`text-xs ${theme.text.soft} font-mono break-all`}>{deck.deck_hash}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function ProfessionalSyncHistory({ theme, deck }) {
  if (!deck.sync_logs || deck.sync_logs.length === 0) return null

  return (
    <div 
      className="crystal-card animate-professional-fade-in"
      style={{ '--glow-color': theme.colors.glowColor, animationDelay: '0.6s' }}
    >
      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg" padding="none">
        <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`} />
        
        <div className="p-4 sm:p-6">
          <h3 className={`text-lg font-bold ${theme.text.strong} mb-4`}>Historial de Sincronización</h3>
          
          <div className="space-y-3">
            {deck.sync_logs.map((log, i) => (
              <div key={log.id} className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-lg transition-all duration-200 hover:bg-gray-100/80">
                <div className={`w-3 h-3 rounded-full ${
                  log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold capitalize ${theme.text.strong}`}>{log.source}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      log.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status === 'success' ? 'Exitoso' : 'Error'}
                    </span>
                  </div>
                  
                  {log.error_message && (
                    <p className="text-sm text-red-600 mt-1 font-medium">{log.error_message}</p>
                  )}
                </div>
                
                <span className={`text-sm ${theme.text.soft} font-medium`}>
                  {format(new Date(log.synced_at), 'dd/MM HH:mm')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

function ProfessionalDangerZone({ theme, deck, onDelete }) {
  return (
    <div 
      className="crystal-card animate-professional-fade-in"
      style={{ '--glow-color': 'rgba(239, 68, 68, 0.4)', animationDelay: '0.7s' }}
    >
      <Card className="relative overflow-hidden bg-red-50/90 backdrop-blur-sm border border-red-200 shadow-lg" padding="none">
        <div className="h-1 bg-gradient-to-r from-red-400 to-red-500" />
        
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center animate-float-subtle">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-red-900">Zona Peligrosa</h3>
          </div>

          <p className="text-red-700 mb-4 font-medium">
            Una vez que elimines este mazo, no podrás recuperarlo. Esta acción es permanente.
          </p>

          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 hover:scale-105 font-semibold focus:outline-none focus:ring-4 focus:ring-red-500/20"
          >
            Eliminar Mazo
          </button>
        </div>
      </Card>
    </div>
  )
}

function ProfessionalDeleteModal({ theme, deckName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        className="crystal-card animate-professional-fade-in"
        style={{ '--glow-color': 'rgba(239, 68, 68, 0.4)' }}
      >
        <Card className="max-w-md w-full bg-white/95 backdrop-blur-sm shadow-2xl" padding="lg">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6 animate-float-subtle">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">¿Eliminar mazo?</h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              ¿Estás seguro de que quieres eliminar <strong>&quot;{deckName}&quot;</strong>?
              Esta acción no se puede deshacer.
            </p>
          
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 hover:scale-105 font-semibold"
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

function ProfessionalLoadingSkeleton({ theme }) {
  return (
    <div 
      className="min-h-screen theme-transition"
      style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="animate-pulse space-y-8">
          <div className="space-y-4">
            <div className="h-4 bg-white/40 rounded w-1/4" />
            <div className="h-8 bg-white/40 rounded w-1/6" />
            <div className="h-12 sm:h-16 bg-white/40 rounded w-3/4" />
            <div className="h-4 bg-white/40 rounded w-1/2" />
            <div className="h-4 bg-white/40 rounded w-2/3" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="h-80 bg-white/40 rounded-lg" />
              <div className="h-32 bg-white/40 rounded-lg" />
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-32 bg-white/40 rounded-lg" />
                <div className="h-32 bg-white/40 rounded-lg" />
              </div>
              <div className="h-48 bg-white/40 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfessionalErrorState({ theme, error }) {
  return (
    <div 
      className="min-h-screen theme-transition flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})` }}
    >
      <div className="crystal-card">
        <Card className="max-w-md mx-auto text-center bg-white/90 backdrop-blur-sm shadow-2xl" padding="xl">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6 animate-float-subtle">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Error al cargar el mazo</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {error || 'Ocurrió un error inesperado al cargar el mazo.'}
          </p>
          <Link
            href="/decks"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 ${theme.gradient} hover:shadow-lg ${theme.colors.ring}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a mazos
          </Link>
        </Card>
      </div>
    </div>
  )
}

export default function ProfessionalDeckDetailPage() {
  const { theme } = useThemeRotation(50000)
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState(null)
  const { syncDeck, deleteDeck } = useDeckActions()
  const [deck, setDeck] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
          throw new Error(errorData.error || 'Deck no encontrado')
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
        router.replace(router.asPath)
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

  if (loading) {
    return <ProfessionalLoadingSkeleton theme={theme} />
  }

  if (error || !deck) {
    return <ProfessionalErrorState theme={theme} error={error} />
  }

  return (
    <div
      className="min-h-screen theme-transition pb-20 sm:pb-8"
      style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})` }}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12 lg:space-y-16">
        <ProfessionalDeckHero 
          theme={theme} 
          deck={deck} 
          user={user} 
          onSync={handleSync}
          onDelete={() => setShowDeleteConfirm(true)}
          syncing={syncing}
        />

        <ProfessionalSyncStatus theme={theme} syncStatus={syncStatus} />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ProfessionalCommanderInfo theme={theme} deck={deck} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <ProfessionalDeckInfoCards theme={theme} deck={deck} />
            <ProfessionalSyncHistory theme={theme} deck={deck} />
            
            {isOwner && (
              <ProfessionalDangerZone 
                theme={theme}
                deck={deck}
                onDelete={() => setShowDeleteConfirm(true)}
              />
            )}
          </div>
        </div>

        <footer className="py-6 sm:py-8 text-center">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <span className={`text-xs sm:text-sm font-medium ${theme.text.soft}`}>
                Tema actual:
              </span>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-lg"
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
              El tema cambia automáticamente cada 50 segundos
            </p>
          </div>
        </footer>
      </div>

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