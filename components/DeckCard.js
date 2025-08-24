// components/DeckCard.js - CORREGIDO
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Card from './Card'
import ManaSymbol from './ManaSymbol'
import NextImage from 'next/image'  // SOLUCION: Renombrado para evitar conflictos

function DeckCard({ deck }) {
  // Función para obtener imagen del comandante
  const getCommanderImageUrl = (deck) => {
    if (deck.commander_image) {
      return deck.commander_image
    }
    
    if (deck.commander_scryfall_id) {
      return `https://api.scryfall.com/cards/${deck.commander_scryfall_id}?format=image&version=normal`
    }
    
    return null
  }

  const formatColors = (colors) => {
    if (!colors || colors.length === 0) return 'Incoloro'
    const colorMap = { W: 'Blanco', U: 'Azul', B: 'Negro', R: 'Rojo', G: 'Verde' }
    return colors.map(c => colorMap[c] || c).join(', ')
  }

  const commanderImageUrl = getCommanderImageUrl(deck)

  return (
    <Card className="relative overflow-hidden bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group" padding="none">
      <div className="h-1 bg-gradient-to-r from-blue-400 to-purple-500" />
      
      {/* Image section - SOLUCION: Usar NextImage */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {commanderImageUrl ? (
          <NextImage
            src={commanderImageUrl}
            alt={deck.commander_name || deck.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={commanderImageUrl.includes('scryfall.com')} // Para URLs externas
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        )}
        
        {/* Overlay with format */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 text-xs font-bold bg-black/70 text-white rounded">
            {deck.format}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight">
          {deck.name}
        </h3>

        {/* Commander info */}
        {deck.commander_name && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 line-clamp-1">
              <span className="font-medium">Comandante:</span> {deck.commander_name}
            </p>
            
            {deck.commander_colors && deck.commander_colors.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {deck.commander_colors.map((color, i) => (
                    <ManaSymbol key={i} symbol={color} size="sm" />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {formatColors(deck.commander_colors)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              <span className="font-semibold text-blue-600">{deck.total_cards || 0}</span> cartas
            </span>
            {deck.profiles?.nickname && (
              <span className="text-gray-500 text-xs">
                por {deck.profiles.nickname}
              </span>
            )}
          </div>
          
          <Link
            href={`/decks/${deck.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Ver →
          </Link>
        </div>

        {/* Description */}
        {deck.description && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {deck.description}
          </p>
        )}
      </div>
    </Card>
  )
}

export default DeckCard