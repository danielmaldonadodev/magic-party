// pages/api/decks/index.js
import { supabase } from '../../../lib/supabaseClient'

export default async function handler(req, res) {
  console.log('🚀 API Call:', req.method, req.url)
  
  if (req.method === 'GET') {
    try {
      console.log('📖 Getting decks...')
      
      const { data: decks, error } = await supabase
        .from('decks')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('📊 Query result:', { decks, error })
      console.log('📊 Found decks:', decks?.length || 0)

      if (error) {
        console.error('❌ Database error:', error)
        return res.status(500).json({ 
          error: 'Error fetching decks',
          details: error.message 
        })
      }

      return res.status(200).json({ 
        decks: decks || [],
        success: true 
      })
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      return res.status(500).json({ 
        error: 'Server error',
        details: error.message 
      })
    }
  }

  if (req.method === 'POST') {
    try {
      console.log('💾 Creating deck...')
      console.log('📝 Request body:', JSON.stringify(req.body, null, 2))

      const { 
        name, 
        format, 
        source, 
        commander, 
        colors, 
        cards, 
        mainboard, 
        sideboard,
        moxfield_url,
        archidekt_url,
        description 
      } = req.body

      // Verificar que tenemos los datos mínimos
      if (!name || !format) {
        console.log('❌ Missing required fields:', { name, format })
        return res.status(400).json({ 
          error: 'Missing required fields: name, format' 
        })
      }

      // Verificar autenticación
      const authHeader = req.headers.authorization
      if (!authHeader) {
        console.log('❌ No authorization header')
        return res.status(401).json({ error: 'Authorization required' })
      }

      const token = authHeader.replace('Bearer ', '')
      const { data: user, error: authError } = await supabase.auth.getUser(token)

      if (authError || !user.user) {
        console.log('❌ Auth error:', authError)
        return res.status(401).json({ error: 'Invalid token' })
      }

      console.log('👤 User authenticated:', user.user.id)

      // Preparar datos del mazo según tu esquema
      const deckData = {
        name,
        format,
        description: description || null,
        user_id: user.user.id,
        is_public: true, // Por defecto público
        last_synced_at: new Date().toISOString()
      }

      // Agregar URLs según la fuente
      if (source === 'moxfield' && moxfield_url) {
        deckData.moxfield_url = moxfield_url
      } else if (source === 'archidekt' && archidekt_url) {
        deckData.archidekt_url = archidekt_url
      }

      // Agregar datos del comandante si existe
      if (commander) {
        deckData.commander_name = commander.name || commander
        deckData.commander_image = commander.image_url || commander.imageUrl || null
        deckData.commander_colors = colors || commander.colors || []
        deckData.commander_scryfall_id = commander.scryfall_id || null
      }

      console.log('📋 Deck data to insert:', deckData)

      // Insertar el mazo
      const { data: deck, error: deckError } = await supabase
        .from('decks')
        .insert(deckData)
        .select()
        .single()

      if (deckError) {
        console.error('❌ Error creating deck:', deckError)
        return res.status(500).json({ 
          error: 'Error creating deck',
          details: deckError.message 
        })
      }

      console.log('✅ Deck created:', deck)

      // Registrar log de sincronización
      try {
        const { error: logError } = await supabase
          .from('deck_sync_logs')
          .insert({
            deck_id: deck.id,
            source: source || 'manual',
            status: 'success'
          })

        if (logError) {
          console.warn('⚠️ Error creating sync log:', logError)
        }
      } catch (logErr) {
        console.warn('⚠️ Sync log error:', logErr)
      }

      console.log('🎉 Deck creation completed successfully')
      
      return res.status(201).json({ 
        deck,
        message: 'Deck created successfully' 
      })

    } catch (error) {
      console.error('❌ Unexpected error in POST:', error)
      return res.status(500).json({ 
        error: 'Server error',
        details: error.message 
      })
    }
  }

  console.log('❌ Method not allowed:', req.method)
  return res.status(405).json({ error: 'Method not allowed' })
}