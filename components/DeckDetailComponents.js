// Componentes adicionales para mostrar las cartas del mazo completo
import { useState, useMemo } from 'react'
import Image from 'next/image'

// COMPONENTES FALTANTES - Agregar al inicio
const Card = ({ children, className = "", padding = "none", ...props }) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  }
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${paddingClasses[padding]} ${className}`} {...props}>
      {children}
    </div>
  )
}

const ManaSymbol = ({ symbol, size = "sm" }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base'
  }
  
  const colorClasses = {
    W: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    U: 'bg-blue-100 text-blue-800 border-blue-300',
    B: 'bg-gray-800 text-white border-gray-600',
    R: 'bg-red-100 text-red-800 border-red-300',
    G: 'bg-green-100 text-green-800 border-green-300',
    C: 'bg-gray-100 text-gray-800 border-gray-300'
  }
  
  // Si es un número
  if (!isNaN(symbol) && symbol !== '') {
    return (
      <div className={`${sizeClasses[size]} rounded-full border-2 bg-gray-100 text-gray-800 border-gray-300 flex items-center justify-center font-bold`}>
        {symbol}
      </div>
    )
  }
  
  return (
    <div className={`${sizeClasses[size]} rounded-full border-2 flex items-center justify-center font-bold ${colorClasses[symbol] || colorClasses.C}`}>
      {symbol}
    </div>
  )
}

/* ===============================================================
  COMPONENTE PRINCIPAL DE LISTA DE CARTAS
  =============================================================== */
function ProfessionalCardList({ theme, cards, title, totalCount, uniqueCount }) {
  const [showAll, setShowAll] = useState(false)
  const [sortBy, setSortBy] = useState('name') // name, cmc, quantity, type
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // ✅ CORRECCIÓN: TODOS los useMemo ANTES del return temprano
  const processedCards = useMemo(() => {
    if (!cards || cards.length === 0) return []
    
    let filtered = [...cards] // Crear copia para evitar mutaciones

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(card => 
        card.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(card => {
        const typeLine = card.type_line || ''
        return typeLine.toLowerCase().includes(filterType.toLowerCase())
      })
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'cmc':
          return (a.cmc || 0) - (b.cmc || 0)
        case 'quantity':
          return (b.quantity || 0) - (a.quantity || 0)
        case 'type':
          return (a.type_line || '').localeCompare(b.type_line || '')
        default:
          return (a.name || '').localeCompare(b.name || '')
      }
    })

    return filtered
  }, [cards, searchTerm, filterType, sortBy])

  const displayCards = useMemo(() => {
    return showAll ? processedCards : processedCards.slice(0, 10)
  }, [showAll, processedCards])

  // Obtener tipos únicos para el filtro
  const cardTypes = useMemo(() => {
    if (!cards || cards.length === 0) return []
    
    const types = new Set()
    cards.forEach(card => {
      const typeLine = card.type_line || ''
      if (typeLine.includes('Creature')) types.add('Creature')
      if (typeLine.includes('Instant')) types.add('Instant')
      if (typeLine.includes('Sorcery')) types.add('Sorcery')
      if (typeLine.includes('Artifact')) types.add('Artifact')
      if (typeLine.includes('Enchantment')) types.add('Enchantment')
      if (typeLine.includes('Planeswalker')) types.add('Planeswalker')
      if (typeLine.includes('Land')) types.add('Land')
    })
    return Array.from(types).sort()
  }, [cards])

  // Estadísticas por tipo
  const typeStats = useMemo(() => {
    if (!cards || cards.length === 0) return {}
    
    const stats = {}
    cards.forEach(card => {
      const typeLine = card.type_line || ''
      let mainType = 'Other'
      
      if (typeLine.includes('Land')) mainType = 'Land'
      else if (typeLine.includes('Creature')) mainType = 'Creature'
      else if (typeLine.includes('Instant')) mainType = 'Instant'
      else if (typeLine.includes('Sorcery')) mainType = 'Sorcery'
      else if (typeLine.includes('Artifact')) mainType = 'Artifact'
      else if (typeLine.includes('Enchantment')) mainType = 'Enchantment'
      else if (typeLine.includes('Planeswalker')) mainType = 'Planeswalker'

      if (!stats[mainType]) {
        stats[mainType] = { count: 0, quantity: 0 }
      }
      stats[mainType].count += 1
      stats[mainType].quantity += card.quantity || 1
    })
    return stats
  }, [cards])

  // ✅ AHORA es seguro hacer el return temprano
  if (!cards || cards.length === 0) return null

  return (
    <div 
      className="crystal-card animate-professional-fade-in"
      style={{ '--glow-color': theme.colors.glowColor }}
    >
      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg" padding="none">
        <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`} />
        
        <div className="p-4 sm:p-6">
          {/* Header con estadísticas */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className={`text-lg font-bold ${theme.text.strong} mb-1`}>{title}</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className={`${theme.text.soft}`}>
                  <span className="font-semibold text-blue-600">{totalCount}</span> cartas totales
                </span>
                <span className={`${theme.text.soft}`}>
                  <span className="font-semibold text-green-600">{uniqueCount}</span> únicas
                </span>
              </div>
            </div>
            
            {/* Estadísticas por tipo */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeStats).map(([type, stats]) => (
                <div key={type} className={`px-2 py-1 rounded text-xs font-medium ${theme.colors.bgSoft} ${theme.text.strong}`}>
                  {type}: {stats.quantity}
                </div>
              ))}
            </div>
          </div>

          {/* Controles de filtro y búsqueda */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {/* Búsqueda */}
            <div>
              <input
                type="text"
                placeholder="Buscar cartas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filtro por tipo */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los tipos</option>
                {cardTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Ordenamiento */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Por nombre</option>
                <option value="cmc">Por coste de maná</option>
                <option value="quantity">Por cantidad</option>
                <option value="type">Por tipo</option>
              </select>
            </div>

            {/* Toggle mostrar todo */}
            <div className="flex items-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className={`w-full px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                  showAll 
                    ? `${theme.gradient} text-white` 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showAll ? 'Mostrar menos' : `Ver todas (${processedCards.length})`}
              </button>
            </div>
          </div>

          {/* Lista de cartas */}
          <div className="space-y-2">
            {displayCards.map((card, index) => (
              <CardListItem 
                key={`${card.scryfall_id || card.name}-${index}`}
                card={card}
                theme={theme}
              />
            ))}
          </div>

          {/* Mostrar más */}
          {!showAll && processedCards.length > 10 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAll(true)}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${theme.gradient} text-white hover:shadow-lg`}
              >
                Ver {processedCards.length - 10} cartas más
              </button>
            </div>
          )}

          {/* Resultados de búsqueda */}
          {searchTerm && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              {processedCards.length > 0 
                ? `${processedCards.length} carta${processedCards.length !== 1 ? 's' : ''} encontrada${processedCards.length !== 1 ? 's' : ''}`
                : 'No se encontraron cartas'
              }
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

/* ===============================================================
  COMPONENTE INDIVIDUAL DE CARTA
  =============================================================== */
function CardListItem({ card, theme }) {
  const [showImage, setShowImage] = useState(false)
  const [imageError, setImageError] = useState(false)

  const getCardImageUrl = (card) => {
    if (card.scryfall_id) {
      return `https://api.scryfall.com/cards/${card.scryfall_id}?format=image&version=normal`
    }
    return null
  }

  const formatManaCost = (manaCost) => {
    if (!manaCost) return null
    // Convertir {1}{R}{R} a elementos visuales
    const symbols = manaCost.match(/\{([^}]+)\}/g) || []
    return symbols.map((symbol, i) => {
      const cleanSymbol = symbol.replace(/[{}]/g, '')
      return <ManaSymbol key={i} symbol={cleanSymbol} size="sm" />
    })
  }

  const getTypeColor = (typeLine) => {
    if (!typeLine) return 'bg-gray-100 text-gray-700'
    
    if (typeLine.includes('Land')) return 'bg-amber-100 text-amber-800'
    if (typeLine.includes('Creature')) return 'bg-green-100 text-green-800'
    if (typeLine.includes('Instant')) return 'bg-blue-100 text-blue-800'
    if (typeLine.includes('Sorcery')) return 'bg-red-100 text-red-800'
    if (typeLine.includes('Artifact')) return 'bg-gray-100 text-gray-800'
    if (typeLine.includes('Enchantment')) return 'bg-purple-100 text-purple-800'
    if (typeLine.includes('Planeswalker')) return 'bg-indigo-100 text-indigo-800'
    
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="group relative">
      <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-lg hover:bg-gray-100/80 transition-all duration-200">
        {/* Cantidad */}
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-blue-800">{card.quantity || 1}</span>
        </div>

        {/* Imagen preview (si está disponible) */}
        {card.scryfall_id && (
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowImage(!showImage)}
              className="w-8 h-8 bg-gray-200 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center group"
              title="Ver imagen de carta"
            >
              <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        )}

        {/* Información de la carta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">{card.name}</h4>
              
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {/* Tipo */}
                {card.type_line && (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(card.type_line)}`}>
                    {card.type_line}
                  </span>
                )}
                
                {/* CMC */}
                {card.cmc !== undefined && (
                  <span className="text-xs text-gray-600 font-medium">
                    CMC: {card.cmc}
                  </span>
                )}
              </div>
            </div>

            {/* Coste de maná */}
            {card.mana_cost && (
              <div className="flex items-center gap-1">
                {formatManaCost(card.mana_cost)}
              </div>
            )}
          </div>

          {/* Power/Toughness para criaturas */}
          {card.power && card.toughness && (
            <div className="mt-1 text-sm text-gray-600 font-medium">
              {card.power}/{card.toughness}
            </div>
          )}
        </div>

        {/* Enlace a Scryfall */}
        {card.scryfall_id && (
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={`https://scryfall.com/card/${card.scryfall_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Ver en Scryfall"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* Imagen emergente */}
      {showImage && card.scryfall_id && (
        <div className="absolute left-full top-0 ml-2 z-10">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-2 animate-professional-fade-in">
            {!imageError ? (
              <Image
                src={getCardImageUrl(card)}
                alt={card.name}
                width={200}
                height={280}
                className="rounded"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-48 h-64 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500 text-sm">Imagen no disponible</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ===============================================================
  COMPONENTE DE ESTADÍSTICAS AVANZADAS
  =============================================================== */
function ProfessionalDeckStats({ theme, deck }) {
  const mainboard = deck.deck_cards?.filter(dc => dc.board_type === 'mainboard') || []
  const sideboard = deck.deck_cards?.filter(dc => dc.board_type === 'sideboard') || []

  // ✅ CORRECCIÓN: useMemo ANTES del return temprano
  const stats = useMemo(() => {
    if (!deck.deck_cards || deck.deck_cards.length === 0) {
      return {
        cmcDistribution: {},
        colorDistribution: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
        typeDistribution: {},
        avgCmc: 0,
        creatureCount: 0,
        nonCreatureCount: 0,
        totalCards: 0
      }
    }

    const cmcDistribution = {}
    const colorDistribution = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 }
    const typeDistribution = {}
    
    let totalManaCost = 0
    let creatureCount = 0
    let nonCreatureCount = 0

    mainboard.forEach(deckCard => {
      const card = deckCard.cards
      const quantity = deckCard.quantity

      // CMC
      const cmc = card.cmc || 0
      cmcDistribution[cmc] = (cmcDistribution[cmc] || 0) + quantity
      totalManaCost += cmc * quantity

      // Colores
      if (card.colors && card.colors.length > 0) {
        card.colors.forEach(color => {
          colorDistribution[color] = (colorDistribution[color] || 0) + quantity
        })
      } else {
        colorDistribution.C += quantity
      }

      // Tipos
      const typeLine = card.type_line || ''
      let mainType = 'Other'
      if (typeLine.includes('Land')) mainType = 'Land'
      else if (typeLine.includes('Creature')) mainType = 'Creature'
      else if (typeLine.includes('Instant')) mainType = 'Instant'
      else if (typeLine.includes('Sorcery')) mainType = 'Sorcery'
      else if (typeLine.includes('Artifact')) mainType = 'Artifact'
      else if (typeLine.includes('Enchantment')) mainType = 'Enchantment'
      else if (typeLine.includes('Planeswalker')) mainType = 'Planeswalker'

      typeDistribution[mainType] = (typeDistribution[mainType] || 0) + quantity

      // Criaturas vs no criaturas
      if (typeLine.includes('Creature')) {
        creatureCount += quantity
      } else {
        nonCreatureCount += quantity
      }
    })

    const totalCards = mainboard.reduce((sum, dc) => sum + dc.quantity, 0)
    const avgCmc = totalCards > 0 ? (totalManaCost / totalCards).toFixed(2) : 0

    return {
      cmcDistribution,
      colorDistribution,
      typeDistribution,
      avgCmc,
      creatureCount,
      nonCreatureCount,
      totalCards
    }
  }, [mainboard, deck.deck_cards])

  // ✅ AHORA es seguro hacer el return temprano
  if (!deck.deck_cards || deck.deck_cards.length === 0) return null

  return (
    <div 
      className="crystal-card animate-professional-fade-in"
      style={{ '--glow-color': theme.colors.glowColor }}
    >
      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg" padding="none">
        <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`} />
        
        <div className="p-4 sm:p-6">
          <h3 className={`text-lg font-bold ${theme.text.strong} mb-6`}>Estadísticas del Mazo</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Distribución de CMC */}
            <div>
              <h4 className={`font-semibold ${theme.text.strong} mb-3`}>Curva de Maná</h4>
              <div className="space-y-2">
                {Object.entries(stats.cmcDistribution)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([cmc, count]) => (
                    <div key={cmc} className="flex items-center gap-2">
                      <span className="w-8 text-sm font-medium">{cmc}:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${theme.gradient}`}
                          style={{ width: `${stats.totalCards > 0 ? (count / stats.totalCards) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="w-8 text-sm font-medium text-right">{count}</span>
                    </div>
                  ))}
                <div className="mt-2 text-sm text-gray-600">
                  <strong>CMC promedio:</strong> {stats.avgCmc}
                </div>
              </div>
            </div>

            {/* Distribución por tipo */}
            <div>
              <h4 className={`font-semibold ${theme.text.strong} mb-3`}>Tipos de Carta</h4>
              <div className="space-y-2">
                {Object.entries(stats.typeDistribution)
                  .sort(([,a], [,b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{type}:</span>
                      <span className="text-sm font-bold">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Estadísticas adicionales */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.creatureCount}</div>
                <div className="text-sm text-gray-600">Criaturas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.nonCreatureCount}</div>
                <div className="text-sm text-gray-600">Hechizos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{mainboard.length}</div>
                <div className="text-sm text-gray-600">Únicas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.totalCards}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Exportar los componentes para usar en la página principal
export { 
  ProfessionalCardList, 
  ProfessionalDeckStats, 
  CardListItem 
}