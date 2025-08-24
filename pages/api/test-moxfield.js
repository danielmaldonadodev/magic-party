// pages/api/explore-moxfield.js - Explorador completo de la API de Moxfield
export default async function handler(req, res) {
  try {
    const deckId = req.query.deckId || 'bqcnQNdL7kixyRyJUpcrzw'
    const showRaw = req.query.raw === 'true'
    const apiVersion = req.query.version || 'v3' // v2 o v3
    
    console.log(`Exploring Moxfield API ${apiVersion} with deck: ${deckId}`)
    
    const response = await fetch(`https://api2.moxfield.com/${apiVersion}/decks/all/${deckId}`, {
      headers: {
        'User-Agent': 'PostmanRuntime/7.31.1',
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
    
    if (!response.ok) {
      return res.json({
        error: `HTTP ${response.status}`,
        status: response.status,
        statusText: response.statusText,
        url: response.url
      })
    }
    
    const data = await response.json()
    
    // Si solo quieren los datos raw
    if (showRaw) {
      return res.json(data)
    }
    
    // Función helper para analizar una sección de cartas
    const analyzeCardSection = (section, sectionName) => {
      if (!section || typeof section !== 'object') {
        return { name: sectionName, count: 0, analysis: 'Section not found or invalid' }
      }
      
      const cards = Object.values(section)
      const sampleCard = cards[0]
      
      return {
        name: sectionName,
        count: cards.length,
        totalQuantity: cards.reduce((sum, card) => sum + (card.quantity || 0), 0),
        sampleCard: sampleCard ? {
          name: sampleCard.card?.name,
          quantity: sampleCard.quantity,
          cardStructure: {
            hasName: !!sampleCard.card?.name,
            hasScryfall: !!sampleCard.card?.scryfall_id,
            hasImageUris: !!sampleCard.card?.image_uris,
            imageTypes: sampleCard.card?.image_uris ? Object.keys(sampleCard.card.image_uris) : [],
            hasPrices: !!sampleCard.card?.prices,
            priceTypes: sampleCard.card?.prices ? Object.keys(sampleCard.card.prices) : [],
            hasColors: !!sampleCard.card?.colors,
            hasColorIdentity: !!sampleCard.card?.color_identity,
            hasCmc: sampleCard.card?.cmc !== undefined,
            hasTypeLine: !!sampleCard.card?.type_line,
            hasPowerToughness: !!(sampleCard.card?.power || sampleCard.card?.toughness),
            hasOracleText: !!sampleCard.card?.oracle_text,
            hasManaCost: !!sampleCard.card?.mana_cost,
            hasRarity: !!sampleCard.card?.rarity,
            hasSet: !!sampleCard.card?.set
          }
        } : null
      }
    }
    
    // Análisis completo del deck
    const analysis = {
      apiVersion,
      deckId,
      responseStatus: response.status,
      
      // Metadatos del deck
      metadata: {
        name: data.name,
        description: data.description ? `${data.description.substring(0, 200)}${data.description.length > 200 ? '...' : ''}` : null,
        format: data.format,
        visibility: data.visibility,
        publicUrl: data.publicUrl,
        publicId: data.publicId,
        likeCount: data.likeCount,
        viewCount: data.viewCount,
        commentCount: data.commentCount,
        createdAt: data.createdAtUtc,
        lastUpdated: data.lastUpdatedAtUtc,
        authors: data.authors,
        tags: data.tags
      },
      
      // Estructura principal del deck
      structure: {
        topLevelKeys: Object.keys(data),
        hasDeckData: {
          commanders: !!data.commanders,
          mainboard: !!data.mainboard,
          sideboard: !!data.sideboard,
          maybeboard: !!data.maybeboard,
          tokens: !!data.tokens,
          attractions: !!data.attractions,
          stickers: !!data.stickers,
          companions: !!data.companions
        }
      },
      
      // Análisis detallado de cada sección
      sections: [
        analyzeCardSection(data.commanders, 'commanders'),
        analyzeCardSection(data.mainboard, 'mainboard'),
        analyzeCardSection(data.sideboard, 'sideboard'),
        analyzeCardSection(data.maybeboard, 'maybeboard'),
        analyzeCardSection(data.tokens, 'tokens'),
        analyzeCardSection(data.attractions, 'attractions'),
        analyzeCardSection(data.stickers, 'stickers'),
        analyzeCardSection(data.companions, 'companions')
      ].filter(section => section.count > 0),
      
      // Análisis específico de comandantes
      commanderAnalysis: data.commanders ? {
        count: Object.keys(data.commanders).length,
        commanders: Object.values(data.commanders).map(cmd => ({
          name: cmd.card?.name,
          colors: cmd.card?.color_identity,
          cmc: cmd.card?.cmc,
          typeLine: cmd.card?.type_line,
          hasImage: !!cmd.card?.image_uris?.normal,
          imageUrl: cmd.card?.image_uris?.normal,
          scryfallId: cmd.card?.scryfall_id
        }))
      } : { count: 0, note: 'No commanders section found' },
      
      // Estadísticas del mainboard
      mainboardStats: data.mainboard ? {
        uniqueCards: Object.keys(data.mainboard).length,
        totalCards: Object.values(data.mainboard).reduce((sum, card) => sum + (card.quantity || 0), 0),
        avgCmc: (() => {
          const cards = Object.values(data.mainboard)
          const totalCmc = cards.reduce((sum, card) => sum + ((card.card?.cmc || 0) * (card.quantity || 0)), 0)
          const totalCards = cards.reduce((sum, card) => sum + (card.quantity || 0), 0)
          return totalCards > 0 ? (totalCmc / totalCards).toFixed(2) : 0
        })(),
        colorBreakdown: (() => {
          const colors = {}
          Object.values(data.mainboard).forEach(card => {
            const cardColors = card.card?.colors || []
            if (cardColors.length === 0) {
              colors['Colorless'] = (colors['Colorless'] || 0) + (card.quantity || 0)
            } else {
              cardColors.forEach(color => {
                colors[color] = (colors[color] || 0) + (card.quantity || 0)
              })
            }
          })
          return colors
        })()
      } : { note: 'No mainboard found' },
      
      // Información adicional disponible
      additionalData: {
        hasHub: !!data.hub,
        hubData: data.hub ? {
          id: data.hub.id,
          name: data.hub.name,
          description: data.hub.description
        } : null,
        
        hasBoard: !!data.board,
        boardData: data.board ? {
          id: data.board.id,
          name: data.board.name
        } : null,
        
        hasVersion: !!data.version,
        version: data.version,
        
        hasAreCommentsEnabled: data.areCommentsEnabled !== undefined,
        areCommentsEnabled: data.areCommentsEnabled
      }
    }
    
    res.json(analysis)
    
  } catch (error) {
    console.error('Moxfield exploration error:', error)
    res.status(500).json({ 
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    })
  }
}

/*
CÓMO USAR ESTE EXPLORADOR:

Datos básicos:
GET /api/explore-moxfield

Con deck específico:
GET /api/explore-moxfield?deckId=TU_DECK_ID

Ver datos raw completos:
GET /api/explore-moxfield?raw=true

Probar API v2:
GET /api/explore-moxfield?version=v2

Combinar parámetros:
GET /api/explore-moxfield?deckId=ABC123&version=v2&raw=true
*/