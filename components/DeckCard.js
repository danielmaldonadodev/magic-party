// components/DeckCard.js
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'

export default function DeckCard({ deck }) {
  // Función para obtener colores del comandante
  const getColorBadges = (colors) => {
    if (!colors || colors.length === 0) return null
    
    const colorMap = {
      'W': { name: 'Blanco', color: 'bg-yellow-100 text-yellow-800' },
      'U': { name: 'Azul', color: 'bg-blue-100 text-blue-800' },
      'B': { name: 'Negro', color: 'bg-gray-100 text-gray-800' },
      'R': { name: 'Rojo', color: 'bg-red-100 text-red-800' },
      'G': { name: 'Verde', color: 'bg-green-100 text-green-800' }
    }
    
    return colors.map(color => colorMap[color]).filter(Boolean)
  }

  // Función para obtener la fuente del mazo
  const getSource = () => {
    if (deck.moxfield_url) return { name: 'Moxfield', color: 'bg-orange-100 text-orange-800' }
    if (deck.archidekt_url) return { name: 'Archidekt', color: 'bg-purple-100 text-purple-800' }
    return { name: 'Manual', color: 'bg-gray-100 text-gray-800' }
  }

  const colorBadges = getColorBadges(deck.commander_colors)
  const source = getSource()

  return (
    <Link href={`/decks/${deck.id}`}>
      <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors cursor-pointer group">
        {/* Header con imagen del comandante */}
        <div className="relative h-48 bg-gray-700">
          {deck.commander_image ? (
            <Image
              src={deck.commander_image}
              alt={deck.commander_name || deck.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          )}
          
          {/* Overlay con gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Badges en la esquina superior */}
          <div className="absolute top-3 right-3 flex gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${source.color}`}>
              {source.name}
            </span>
          </div>

          {/* Formato en la esquina superior izquierda */}
          <div className="absolute top-3 left-3">
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
              {deck.format}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4">
          {/* Título del mazo */}
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
            {deck.name}
          </h3>

          {/* Comandante */}
          {deck.commander_name && (
            <p className="text-gray-300 text-sm mb-3">
              <span className="text-gray-400">Comandante:</span> {deck.commander_name}
            </p>
          )}

          {/* Descripción */}
          {deck.description && (
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
              {deck.description}
            </p>
          )}

          {/* Colores del comandante */}
          {colorBadges && colorBadges.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {colorBadges.map((color, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${color.color}`}
                >
                  {color.name}
                </span>
              ))}
            </div>
          )}

          {/* Footer con fecha */}
          <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t border-gray-700">
            <span>
              Creado {format(new Date(deck.created_at), 'dd/MM/yyyy')}
            </span>
            {deck.last_synced_at && (
              <span>
                Sync: {format(new Date(deck.last_synced_at), 'dd/MM')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}