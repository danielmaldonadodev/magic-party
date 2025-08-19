// lib/deckServices.js

/**
 * Extrae el ID de un mazo desde una URL de Moxfield o Archidekt
 */
export function extractDeckId(url) {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    
    // Moxfield: https://moxfield.com/decks/oEWXWHM5eEGMmopExLWRCA
    if (urlObj.hostname.includes('moxfield.com')) {
      const match = urlObj.pathname.match(/\/decks\/([a-zA-Z0-9_-]+)/);
      return match ? { id: match[1], source: 'moxfield' } : null;
    }
    
    // Archidekt: https://archidekt.com/decks/1234567/deck-name
    if (urlObj.hostname.includes('archidekt.com')) {
      const match = urlObj.pathname.match(/\/decks\/(\d+)/);
      return match ? { id: match[1], source: 'archidekt' } : null;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing deck URL:', error);
    return null;
  }
}

/**
 * Valida si una URL es de Moxfield o Archidekt
 */
export function isValidDeckUrl(url) {
  return extractDeckId(url) !== null;
}

/**
 * Servicio para Moxfield
 */
export class MoxfieldService {
  static BASE_URL = 'https://api2.moxfield.com';
  
  static async fetchDeck(deckId) {
    try {
      const response = await fetch(`${this.BASE_URL}/v2/decks/all/${deckId}`, {
        headers: {
          'User-Agent': 'MagicParty/1.0',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('El mazo no existe o es privado');
        }
        throw new Error(`Error de Moxfield: ${response.status}`);
      }
      
      const data = await response.json();
      return this.normalizeMoxfieldDeck(data);
    } catch (error) {
      console.error('Error fetching Moxfield deck:', error);
      throw new Error(`No se pudo obtener el mazo de Moxfield: ${error.message}`);
    }
  }
  
  static normalizeMoxfieldDeck(moxfieldData) {
    const mainboard = moxfieldData.mainboard || {};
    const commanders = moxfieldData.commanders || {};
    
    // Obtener el comandante principal
    const commanderCards = Object.values(commanders);
    const mainCommander = commanderCards[0];
    
    // Extraer colores del comandante o del mazo
    const colors = mainCommander?.card?.color_identity || 
                  moxfieldData.colorIdentity || 
                  [];
    
    return {
      name: moxfieldData.name || 'Mazo sin nombre',
      description: moxfieldData.description || '',
      format: moxfieldData.format || 'Commander',
      commander: {
        name: mainCommander?.card?.name || null,
        image: mainCommander?.card?.image_uris?.art_crop || 
               mainCommander?.card?.image_uris?.normal || null,
        colors: colors,
        scryfall_id: mainCommander?.card?.id || null
      },
      cardCount: this.countCards(mainboard) + this.countCards(commanders),
      lastModified: moxfieldData.last_updated || moxfieldData.created,
      isPublic: moxfieldData.visibility === 'public',
      tags: moxfieldData.tags || [],
      hash: this.generateHash(moxfieldData)
    };
  }
  
  static countCards(cardGroup) {
    return Object.values(cardGroup || {}).reduce((total, card) => total + (card.quantity || 0), 0);
  }
  
  static generateHash(data) {
    // Genera un hash simple basado en el contenido del mazo
    const hashContent = JSON.stringify({
      name: data.name,
      mainboard: Object.keys(data.mainboard || {}),
      commanders: Object.keys(data.commanders || {}),
      last_updated: data.last_updated
    });
    
    // Hash simple usando btoa (en producción usar algo más robusto)
    try {
      return btoa(hashContent).slice(0, 16);
    } catch (e) {
      return Math.random().toString(36).substring(2, 18);
    }
  }
}

/**
 * Servicio para Archidekt
 */
export class ArchidektService {
  static BASE_URL = 'https://archidekt.com/api';
  
  static async fetchDeck(deckId) {
    try {
      const response = await fetch(`${this.BASE_URL}/decks/${deckId}/`, {
        headers: {
          'User-Agent': 'MagicParty/1.0',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('El mazo no existe o es privado');
        }
        throw new Error(`Error de Archidekt: ${response.status}`);
      }
      
      const data = await response.json();
      return this.normalizeArchidektDeck(data);
    } catch (error) {
      console.error('Error fetching Archidekt deck:', error);
      throw new Error(`No se pudo obtener el mazo de Archidekt: ${error.message}`);
    }
  }
  
  static normalizeArchidektDeck(archidektData) {
    // Buscar comandantes en las categorías
    const commanders = this.findCommanders(archidektData.cards || []);
    const mainCommander = commanders[0];
    
    return {
      name: archidektData.name || 'Mazo sin nombre',
      description: archidektData.description || '',
      format: this.mapFormat(archidektData.format),
      commander: {
        name: mainCommander?.card?.oracleCard?.name || null,
        image: mainCommander?.card?.oracleCard?.imageUris?.artCrop || 
               mainCommander?.card?.oracleCard?.imageUris?.normal || null,
        colors: mainCommander?.card?.oracleCard?.colorIdentity || [],
        scryfall_id: mainCommander?.card?.oracleCard?.scryfallId || null
      },
      cardCount: this.countArchidektCards(archidektData.cards || []),
      lastModified: archidektData.updatedAt || archidektData.createdAt,
      isPublic: !archidektData.private,
      tags: archidektData.tags?.map(tag => tag.name) || [],
      hash: this.generateHash(archidektData)
    };
  }
  
  static findCommanders(cards) {
    return cards.filter(cardEntry => 
      cardEntry.categories?.some(cat => 
        cat.toLowerCase().includes('commander') || 
        cat.toLowerCase().includes('general')
      )
    );
  }
  
  static mapFormat(archidektFormat) {
    const formatMap = {
      3: 'Commander',
      1: 'Standard',
      2: 'Modern',
      4: 'Legacy',
      5: 'Vintage',
      7: 'Custom'
    };
    
    return formatMap[archidektFormat] || 'Commander';
  }
  
  static countArchidektCards(cards) {
    return cards.reduce((total, card) => total + (card.quantity || 0), 0);
  }
  
  static generateHash(data) {
    const hashContent = JSON.stringify({
      name: data.name,
      cards: data.cards?.map(c => ({ id: c.card?.oracleCard?.scryfallId, qty: c.quantity })),
      updatedAt: data.updatedAt
    });
    
    try {
      return btoa(hashContent).slice(0, 16);
    } catch (e) {
      return Math.random().toString(36).substring(2, 18);
    }
  }
}

/**
 * Servicio principal que maneja ambas APIs
 */
export class DeckImportService {
  static async importFromUrl(url) {
    const urlInfo = extractDeckId(url);
    
    if (!urlInfo) {
      throw new Error('URL no válida. Debe ser de Moxfield o Archidekt.');
    }
    
    switch (urlInfo.source) {
      case 'moxfield':
        return await MoxfieldService.fetchDeck(urlInfo.id);
      case 'archidekt':
        return await ArchidektService.fetchDeck(urlInfo.id);
      default:
        throw new Error('Plataforma no soportada');
    }
  }
  
  static async syncDeck(deck) {
    if (!deck.moxfield_url && !deck.archidekt_url) {
      throw new Error('No hay URL externa para sincronizar');
    }
    
    const url = deck.moxfield_url || deck.archidekt_url;
    const importedData = await this.importFromUrl(url);
    
    // Comparar hash para ver si hay cambios
    const hasChanges = deck.deck_hash !== importedData.hash;
    
    return {
      hasChanges,
      importedData,
      changes: hasChanges ? this.detectChanges(deck, importedData) : null
    };
  }
  
  static detectChanges(currentDeck, importedData) {
    const changes = [];
    
    if (currentDeck.name !== importedData.name) {
      changes.push({ field: 'name', old: currentDeck.name, new: importedData.name });
    }
    
    if (currentDeck.description !== importedData.description) {
      changes.push({ field: 'description', old: currentDeck.description, new: importedData.description });
    }
    
    if (currentDeck.commander_name !== importedData.commander.name) {
      changes.push({ 
        field: 'commander', 
        old: currentDeck.commander_name, 
        new: importedData.commander.name 
      });
    }
    
    return changes;
  }
}

// Utilidades adicionales
export const DeckUtils = {
  /**
   * Genera una URL de vista previa de Scryfall para el comandante
   */
  getCommanderPreviewUrl(commanderName) {
    if (!commanderName) return null;
    const searchName = encodeURIComponent(commanderName.replace(/\s+/g, '+'));
    return `https://api.scryfall.com/cards/named?exact=${searchName}`;
  },
  
  /**
   * Convierte colores a formato legible
   */
  formatColors(colors) {
    const colorMap = { W: 'Blanco', U: 'Azul', B: 'Negro', R: 'Rojo', G: 'Verde' };
    if (!colors || colors.length === 0) return 'Incoloro';
    return colors.map(c => colorMap[c] || c).join(', ');
  },
  
  /**
   * Valida que un mazo tenga los datos mínimos requeridos
   */
  validateDeck(deckData) {
    const errors = [];
    
    if (!deckData.name || deckData.name.trim().length === 0) {
      errors.push('El mazo debe tener un nombre');
    }
    
    if (deckData.format === 'Commander' && !deckData.commander.name) {
      errors.push('Los mazos Commander deben tener un comandante');
    }
    
    return errors;
  }
};