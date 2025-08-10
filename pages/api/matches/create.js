// pages/api/matches/create.js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 1) Leer token del header Authorization
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'No autenticado (sin Authorization)' })
  }

  // 2) Crear cliente con ese token
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  // 3) Validar usuario
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return res.status(401).json({ error: 'No autenticado' })
  }

  const { match, participants } = req.body

  // 4) Insertar partida
  const { data: matchData, error: matchError } = await supabase
    .from('matches')
    .insert({
      ...match,
      user_id: user.id // dueño de la partida
    })
    .select()
    .single()

  if (matchError) {
    return res.status(400).json({ error: matchError.message })
  }

  // 5) Debug: Veamos qué datos estamos intentando insertar
  console.log('Usuario autenticado:', user.id)
  console.log('Participantes originales:', participants)

  const participantsData = participants.map(p => ({
    match_id: matchData.id,
    user_id: p.user_id,
    deck_commander: p.deck_commander || null,
    commander_image: p.commander_image || null,
    commander_art_crop: p.commander_art_crop || null,
    commander_image_normal: p.commander_image_normal || null,
    commander_image_small: p.commander_image_small || null,
    commander_name: p.commander_name || null,
    scryfall_id: p.scryfall_id || null,
    used_proxies: p.used_proxies || false,
    life_remaining: p.life_remaining ? parseInt(p.life_remaining) : null,
    max_damage: p.max_damage ? parseInt(p.max_damage) : null,
    first_to_die: p.first_to_die || false,
    won_by_combo: p.won_by_combo || false,
    kills: p.kills ? parseInt(p.kills) : null,
  }))

  console.log('Datos a insertar:', participantsData)

  // Debug: Verificar variables de entorno
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  console.log('URL:', supabaseUrl)
  console.log('Anon Key exists:', !!supabaseAnonKey)
  console.log('Service Role Key exists:', !!serviceRoleKey)
  console.log('Service Role Key starts with:', serviceRoleKey?.substring(0, 20))
  
  if (!serviceRoleKey) {
    return res.status(500).json({ 
      error: 'SUPABASE_SERVICE_ROLE_KEY no encontrada en variables de entorno' 
    })
  }

  // Crear cliente admin sin auth headers
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // Probar primero con un solo participante
  console.log('Intentando insertar primer participante:', participantsData[0])
  
  const { error: testError } = await supabaseAdmin
    .from('match_participants')
    .insert(participantsData[0])

  if (testError) {
    console.error('Error en test insert:', testError)
    return res.status(400).json({ 
      error: 'Error en inserción de prueba',
      originalError: testError.message,
      details: testError.details,
      hint: testError.hint,
      code: testError.code
    })
  }

  // Si el primero funciona, insertar el resto
  if (participantsData.length > 1) {
    const { error: partError } = await supabaseAdmin
      .from('match_participants')
      .insert(participantsData.slice(1))
      
    if (partError) {
      console.error('Error en batch insert:', partError)
      return res.status(400).json({ 
        error: partError.message,
        details: partError.details,
        hint: partError.hint,
        code: partError.code
      })
    }
  }
  console.log('✅ Todos los participantes insertados correctamente')
  return res.status(200).json({ success: true, match: matchData })
}