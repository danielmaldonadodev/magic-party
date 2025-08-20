// pages/api/decks/[id]/sync.js
import { createClient } from '@supabase/supabase-js'
import { DeckImportService } from '../../../../lib/deckServices'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function getSupabaseFromReq(req) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  return createClient(supabaseUrl, supabaseAnon, {
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    auth: { persistSession: false },
  })
}

export default async function handler(req, res) {
  const { id } = req.query
  const supabase = getSupabaseFromReq(req)

  console.log('🚀 API Call:', req.method, `/api/decks/${id}/sync`)

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('🔄 Syncing deck...')

    // Verificar autenticación
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return res.status(401).json({ error: 'Invalid or missing token' })
    }

    // Obtener datos actuales del deck
    const { data: currentDeck, error: fetchError } = await supabase
      .from('decks')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching deck:', fetchError)
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Deck not found' })
      }
      return res.status(500).json({ error: 'Error fetching deck', details: fetchError.message })
    }

    // Verificar propiedad
    if (currentDeck.user_id !== user.id) {
      return res.status(403).json({ error: 'You can only sync your own decks' })
    }

    // Verificar que el deck tenga una URL externa
    const externalUrl = currentDeck.moxfield_url || currentDeck.archidekt_url
    if (!externalUrl) {
      return res.status(400).json({ error: 'This deck has no external URL to sync from' })
    }

    console.log('🌐 Syncing from external URL:', externalUrl)

    // Importar datos actualizados
    let updatedDeckData
    try {
      updatedDeckData = await DeckImportService.importFromUrl(externalUrl)
    } catch (importError) {
      console.error('❌ Error importing from external URL:', importError)
      
      // Log de sincronización fallida
      await supabase
        .from('deck_sync_logs')
        .insert({
          deck_id: id,
          source: externalUrl.includes('moxfield.com') ? 'moxfield' : 'archidekt',
          status: 'error',
          error_message: importError.message
        })

      return res.status(400).json({ 
        error: 'Error importing from external source',
        details: importError.message
      })
    }

    console.log('📊 Comparing deck data...')

    // Comparar datos y detectar cambios
    const changes = []
    
    if (currentDeck.name !== updatedDeckData.name) {
      changes.push({
        field: 'name',
        old: currentDeck.name,
        new: updatedDeckData.name
      })
    }

    if (currentDeck.description !== (updatedDeckData.description || null)) {
      changes.push({
        field: 'description',
        old: currentDeck.description,
        new: updatedDeckData.description || null
      })
    }

    if (currentDeck.commander_name !== (updatedDeckData.commander?.name || null)) {
      changes.push({
        field: 'commander_name',
        old: currentDeck.commander_name,
        new: updatedDeckData.commander?.name || null
      })
    }

    if (currentDeck.commander_image !== (updatedDeckData.commander?.image_url || null)) {
      changes.push({
        field: 'commander_image',
        old: currentDeck.commander_image,
        new: updatedDeckData.commander?.image_url || null
      })
    }

    // Comparar colores (arrays)
    const currentColors = currentDeck.commander_colors || []
    const newColors = updatedDeckData.commander?.colors || []
    if (JSON.stringify(currentColors.sort()) !== JSON.stringify(newColors.sort())) {
      changes.push({
        field: 'commander_colors',
        old: currentColors.join(', '),
        new: newColors.join(', ')
      })
    }

    if (currentDeck.commander_scryfall_id !== (updatedDeckData.commander?.scryfall_id || null)) {
      changes.push({
        field: 'commander_scryfall_id',
        old: currentDeck.commander_scryfall_id,
        new: updatedDeckData.commander?.scryfall_id || null
      })
    }

    const hasChanges = changes.length > 0

    console.log(`📈 Changes detected: ${changes.length}`)
    if (changes.length > 0) {
      console.log('📝 Changes:', changes)
    }

    // Actualizar deck si hay cambios
    let updatedDeck = currentDeck
    
    if (hasChanges) {
      const updateData = {
        name: updatedDeckData.name,
        description: updatedDeckData.description || null,
        commander_name: updatedDeckData.commander?.name || null,
        commander_image: updatedDeckData.commander?.image_url || null,
        commander_colors: updatedDeckData.commander?.colors || [],
        commander_scryfall_id: updatedDeckData.commander?.scryfall_id || null,
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Generar un hash simple basado en el contenido
        deck_hash: generateDeckHash(updatedDeckData)
      }

      const { data: syncedDeck, error: updateError } = await supabase
        .from('decks')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      if (updateError) {
        console.error('❌ Error updating deck:', updateError)
        return res.status(500).json({ error: 'Error updating deck', details: updateError.message })
      }

      updatedDeck = syncedDeck
      console.log('✅ Deck updated successfully')
    } else {
      // Solo actualizar timestamp de sincronización
      const { data: syncedDeck, error: updateError } = await supabase
        .from('decks')
        .update({ 
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single()

      if (updateError) {
        console.error('❌ Error updating sync timestamp:', updateError)
        return res.status(500).json({ error: 'Error updating sync timestamp', details: updateError.message })
      }

      updatedDeck = syncedDeck
      console.log('✅ No changes detected, updated sync timestamp')
    }

    // Log de sincronización exitosa
    await supabase
      .from('deck_sync_logs')
      .insert({
        deck_id: id,
        source: externalUrl.includes('moxfield.com') ? 'moxfield' : 'archidekt',
        status: 'success'
      })

    return res.status(200).json({
      success: true,
      hasChanges,
      changes,
      deck: updatedDeck,
      message: hasChanges ? 'Deck synchronized and updated' : 'Deck is up to date'
    })

  } catch (error) {
    console.error('❌ Unexpected error in sync:', error)
    
    // Log de error
    try {
      await supabase
        .from('deck_sync_logs')
        .insert({
          deck_id: id,
          source: 'unknown',
          status: 'error',
          error_message: error.message
        })
    } catch (logError) {
      console.error('❌ Error logging sync error:', logError)
    }

    return res.status(500).json({ error: 'Server error', details: error.message })
  }
}

// Función auxiliar para generar un hash simple del deck
function generateDeckHash(deckData) {
  const content = JSON.stringify({
    name: deckData.name,
    commander: deckData.commander?.name,
    mainboard_count: deckData.mainboard?.length || 0,
    sideboard_count: deckData.sideboard?.length || 0
  })
  
  // Hash simple usando btoa (en producción podrías usar crypto)
  return btoa(content).slice(0, 16)
}