// lib/deckServices.js

export function isValidDeckUrl(url) {
  if (!url) return false
  return url.includes('moxfield.com') || url.includes('archidekt.com')
}

export class DeckImportService {
  static async importFromUrl(url) {
    if (!isValidDeckUrl(url)) {
      throw new Error('URL no válida. Debe ser de Moxfield o Archidekt.')
    }

    if (url.includes('moxfield.com')) {
      return await this.importFromMoxfield(url)
    } else if (url.includes('archidekt.com')) {
      return await this.importFromArchidekt(url)
    }
    
    throw new Error('Plataforma no soportada')
  }

  static async importFromMoxfield(url) {
    try {
      // Extraer ID del deck de la URL
      const deckId = this.extractMoxfieldId(url)
      if (!deckId) throw new Error('No se pudo extraer el ID del deck de Moxfield')

      // Llamar a la API de Moxfield
      const response = await fetch(`https://api2.moxfield.com/v3/decks/all/${deckId}`)
      if (!response.ok) throw new Error('Deck no encontrado en Moxfield')
      
      const data = await response.json()
      
      return this.formatMoxfieldData(data)
    } catch (error) {
      throw new Error(`Error importando de Moxfield: ${error.message}`)
    }
  }

  static async importFromArchidekt(url) {
    try {
      // Extraer ID del deck de la URL
      const deckId = this.extractArchidektId(url)
      if (!deckId) throw new Error('No se pudo extraer el ID del deck de Archidekt')

      // Llamar a la API de Archidekt
      const response = await fetch(`https://archidekt.com/api/decks/${deckId}/`)
      if (!response.ok) throw new Error('Deck no encontrado en Archidekt')
      
      const data = await response.json()
      
      return this.formatArchidektData(data)
    } catch (error) {
      throw new Error(`Error importando de Archidekt: ${error.message}`)
    }
  }

  static extractMoxfieldId(url) {
    const match = url.match(/moxfield\.com\/decks\/([a-zA-Z0-9_-]+)/)
    return match ? match[1] : null
  }

  static extractArchidektId(url) {
    const match = url.match(/archidekt\.com\/decks\/(\d+)/)
    return match ? match[1] : null
  }

  static formatMoxfieldData(data) {
    const commander = data.commanders && Object.values(data.commanders)[0]
    const mainboard = data.mainboard || {}
    
    return {
      name: data.name || 'Deck sin nombre',
      description: data.description || '',
      format: data.format || 'Commander',
      commander: commander ? {
        name: commander.card.name,
        image_url: commander.card.image_uris?.normal || commander.card.image_uris?.large,
        colors: commander.card.color_identity || [],
        scryfall_id: commander.card.id
      } : null,
      mainboard: Object.entries(mainboard).map(([key, card]) => ({
        name: card.card.name,
        quantity: card.quantity,
        scryfall_id: card.card.id
      })),
      sideboard: [],
      source: 'moxfield'
    }
  }

  static formatArchidektData(data) {
    const commander = data.cards?.find(card => 
      card.categories?.includes('Commander') || 
      card.categories?.includes('commander')
    )
    
    return {
      name: data.name || 'Deck sin nombre',
      description: data.description || '',
      format: data.format || 'Commander',
      commander: commander ? {
        name: commander.card.oracleCard.name,
        image_url: commander.card.oracleCard.imageUris?.normal || commander.card.oracleCard.imageUris?.large,
        colors: commander.card.oracleCard.colorIdentity || [],
        scryfall_id: commander.card.oracleCard.id
      } : null,
      mainboard: data.cards?.filter(card => 
        !card.categories?.includes('Commander') && 
        !card.categories?.includes('commander')
      ).map(card => ({
        name: card.card.oracleCard.name,
        quantity: card.quantity,
        scryfall_id: card.card.oracleCard.id
      })) || [],
      sideboard: [],
      source: 'archidekt'
    }
  }
}

export class DeckUtils {
  static validateDeck(deck) {
    const errors = []
    
    if (!deck.name || deck.name.trim() === '') {
      errors.push('El nombre del deck es requerido')
    }
    
    if (!deck.format) {
      errors.push('El formato del deck es requerido')
    }
    
    if (deck.format === 'Commander' && !deck.commander) {
      errors.push('Los decks de Commander requieren un comandante')
    }
    
    return errors
  }
}