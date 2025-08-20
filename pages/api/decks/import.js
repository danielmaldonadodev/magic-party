// pages/api/decks/import.js
import { DeckImportService, DeckUtils } from '../../../lib/deckServices'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ error: 'URL es requerida' })
    }

    console.log('Importando mazo desde URL:', url)

    // Importar datos del mazo
    const deckData = await DeckImportService.importFromUrl(url)
    
    console.log('Datos importados:', deckData)

    // Validar datos
    const validationErrors = DeckUtils.validateDeck(deckData)
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Datos del mazo inválidos',
        details: validationErrors
      })
    }

    return res.status(200).json({ 
      success: true,
      deck: deckData,
      message: 'Mazo importado exitosamente'
    })
  } catch (error) {
    console.error('Error importing deck:', error)
    return res.status(400).json({ 
      error: error.message || 'Error al importar el mazo'
    })
  }
}