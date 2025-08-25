// components/DeckCard.js - Diseño premium revolucionario
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NextImage from 'next/image'
import ManaSymbol from './ManaSymbol'

function DeckCard({ deck, index = 0 }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getCommanderImageUrl = () => {
    if (deck.commander_art_crop) return deck.commander_art_crop
    if (deck.commander_image_normal) return deck.commander_image_normal
    if (deck.commander_image) return deck.commander_image
    if (deck.commander_scryfall_id) {
      return `https://api.scryfall.com/cards/${deck.commander_scryfall_id}?format=image&version=normal`
    }
    return null
  }

  const getColorTheme = () => {
    const colors = deck.commander_colors || []
    
    if (colors.length === 0) {
      return {
        primary: 'from-slate-600 via-slate-700 to-slate-800',
        secondary: 'from-slate-100 to-slate-200',
        accent: '#64748b',
        glow: '100, 116, 139'
      }
    }
    
    if (colors.length === 1) {
      const themes = {
        W: { primary: 'from-amber-400 via-yellow-500 to-orange-500', secondary: 'from-amber-50 to-yellow-100', accent: '#f59e0b', glow: '245, 158, 11' },
        U: { primary: 'from-blue-500 via-indigo-600 to-purple-600', secondary: 'from-blue-50 to-indigo-100', accent: '#3b82f6', glow: '59, 130, 246' },
        B: { primary: 'from-gray-700 via-slate-800 to-gray-900', secondary: 'from-gray-100 to-slate-200', accent: '#374151', glow: '55, 65, 81' },
        R: { primary: 'from-red-500 via-rose-600 to-pink-600', secondary: 'from-red-50 to-rose-100', accent: '#ef4444', glow: '239, 68, 68' },
        G: { primary: 'from-green-500 via-emerald-600 to-teal-600', secondary: 'from-green-50 to-emerald-100', accent: '#10b981', glow: '16, 185, 129' }
      }
      return themes[colors[0]] || themes.U
    }
    
    return {
      primary: 'from-purple-500 via-pink-600 to-rose-600',
      secondary: 'from-purple-50 to-pink-100',
      accent: '#a855f7',
      glow: '168, 85, 247'
    }
  }

  const theme = getColorTheme()
  const commanderImageUrl = getCommanderImageUrl()
  const hasImage = commanderImageUrl && !commanderImageUrl.includes('placeholder')

  if (!mounted) {
    return (
      <div className="bg-gray-200 animate-pulse rounded-2xl h-80" />
    )
  }

  return (
    <div 
      className="group relative transform transition-all duration-500 hover:scale-105"
      style={{ 
        animationDelay: `${index * 150}ms`,
        '--theme-glow': theme.glow
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <div 
        className={`absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl bg-gradient-to-r ${theme.primary}`}
        style={{
          background: `linear-gradient(45deg, rgba(${theme.glow}, 0.6), rgba(${theme.glow}, 0.3), rgba(${theme.glow}, 0.6))`
        }}
      />
      
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 border border-gray-200 group-hover:border-transparent">
        
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div 
            className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            style={{
              background: `conic-gradient(from 0deg, rgba(${theme.glow}, 0.8), transparent, rgba(${theme.glow}, 0.8))`,
              animation: isHovered ? 'spin 3s linear infinite' : 'none'
            }}
          />
          <div className="absolute inset-0.5 bg-white rounded-2xl" />
        </div>

        {/* Header with floating elements */}
        <div className="relative p-4 pb-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-3">
              <h3 className="font-black text-xl text-gray-900 leading-tight mb-1 group-hover:text-gray-800 transition-colors">
                {deck.name}
              </h3>
              {deck.commander_name && (
                <p className="text-sm font-semibold text-gray-600 truncate">
                  {deck.commander_name}
                </p>
              )}
            </div>
            
            {/* Floating format badge */}
            <div className="relative">
              <div 
                className={`px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg transform group-hover:scale-110 transition-all duration-300 bg-gradient-to-r ${theme.primary}`}
                style={{
                  boxShadow: `0 4px 20px rgba(${theme.glow}, 0.4)`
                }}
              >
                {deck.format || 'Commander'}
              </div>
              
              {/* Pulsing ring effect */}
              <div 
                className="absolute inset-0 rounded-full animate-ping opacity-0 group-hover:opacity-75 transition-opacity duration-300"
                style={{
                  background: `rgba(${theme.glow}, 0.3)`
                }}
              />
            </div>
          </div>
        </div>

        {/* Revolutionary image section */}
        <div className="relative mx-4 mb-4 h-48 rounded-xl overflow-hidden group-hover:shadow-2xl transition-all duration-500">
          {hasImage ? (
            <div className="relative w-full h-full">
              <NextImage
                src={commanderImageUrl}
                alt={deck.commander_name || deck.name}
                fill
                className={`object-cover transition-all duration-700 ${
                  imageLoaded 
                    ? 'opacity-100 scale-100 group-hover:scale-110' 
                    : 'opacity-0 scale-110'
                }`}
                onLoad={() => setImageLoaded(true)}
                sizes="(max-width: 768px) 100vw, 400px"
                unoptimized={commanderImageUrl?.includes('scryfall.com')}
              />
              
              {/* Dynamic overlay gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
              
              {/* Floating mana symbols */}
              {deck.commander_colors && deck.commander_colors.length > 0 && (
                <div className="absolute bottom-3 left-3 flex gap-2">
                  {deck.commander_colors.map((color, i) => (
                    <div
                      key={i}
                      className="transform hover:scale-125 transition-all duration-300"
                      style={{
                        animationDelay: `${i * 200}ms`,
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                      }}
                    >
                      <ManaSymbol symbol={color} size="md" />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Shimmer effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                  animation: isHovered ? 'shimmer 2s ease-in-out infinite' : 'none'
                }}
              />
            </div>
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${theme.secondary} flex items-center justify-center relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent" />
              <div className="relative text-center z-10">
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl"
                  style={{ backgroundColor: theme.accent }}
                >
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-700">
                  {deck.commander_name || 'Sin comandante'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced info section */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-4">
            
            {/* Card count with animation */}
            <div className="text-center">
              <div className="relative">
                <div 
                  className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  style={{
                    textShadow: `0 0 20px rgba(${theme.glow}, 0.3)`
                  }}
                >
                  {deck.total_cards || 99}
                </div>
                <div className="text-xs font-bold text-gray-500 -mt-1">
                  CARTAS
                </div>
                
                {/* Animated underline */}
                <div 
                  className={`h-0.5 bg-gradient-to-r ${theme.primary} rounded-full transform origin-left transition-all duration-500 ${
                    isHovered ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </div>
            </div>

            {/* Author with elegant styling */}
            {deck.profiles?.nickname && (
              <div className="text-right">
                <div className="text-xs text-gray-500 font-medium mb-1">CREADO POR</div>
                <div className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                  {deck.profiles.nickname}
                </div>
              </div>
            )}
          </div>

          {/* Revolutionary CTA button */}
          <Link
            href={`/decks/${deck.id}`}
            className="block w-full group/btn relative overflow-hidden"
          >
            <div 
              className={`w-full py-4 rounded-xl text-center font-bold text-white relative z-10 transition-all duration-500 shadow-lg group-hover:shadow-2xl bg-gradient-to-r ${theme.primary} group-hover/btn:scale-105`}
              style={{
                boxShadow: `0 10px 30px rgba(${theme.glow}, 0.3)`
              }}
            >
              <div className="flex items-center justify-center gap-3">
                <svg 
                  className="w-5 h-5 transition-transform duration-500 group-hover/btn:rotate-12" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-lg">EXPLORAR MAZO</span>
                <svg 
                  className="w-5 h-5 transition-transform duration-500 group-hover/btn:translate-x-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              
              {/* Button glow effect */}
              <div 
                className="absolute inset-0 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(45deg, rgba(255,255,255,0.2), transparent, rgba(255,255,255,0.2))`,
                  animation: isHovered ? 'shimmer 2s ease-in-out infinite' : 'none'
                }}
              />
            </div>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

export default DeckCard