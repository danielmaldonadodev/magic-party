// pages/api/matches/create.js
import { createClient } from '@supabase/supabase-js'
import { getArchetypeByColors } from '../../../lib/archetypes'

const WUBRG = ['W','U','B','R','G']

function normalizeColors(arr) {
  return Array.from(new Set(
    (arr || [])
      .map(c => String(c).toUpperCase())
      .filter(c => WUBRG.includes(c))
  ))
}

function extractColorsFromCard(card) {
  if (!card) return []
  if (Array.isArray(card.color_identity) && card.color_identity.length) {
    return normalizeColors(card.color_identity)
  }
  if (Array.isArray(card.card_faces) && card.card_faces.length) {
    const faces = card.card_faces.flatMap(f =>
      Array.isArray(f?.color_identity) ? f.color_identity :
      (Array.isArray(f?.colors) ? f.colors : [])
    )
    if (faces.length) return normalizeColors(faces)
  }
  if (Array.isArray(card.colors) && card.colors.length) {
    return normalizeColors(card.colors)
  }
  return []
}

async function resolveColorsForParticipant(p) {
  // 1) Si ya vienen del cliente, úsalos
  let colors = normalizeColors(p.commander_colors)

  // 2) Si NO vienen, intenta obtenerlos de Scryfall por scryfall_id
  if ((!colors || colors.length === 0) && p.scryfall_id) {
    try {
      const r = await fetch(`https://api.scryfall.com/cards/${p.scryfall_id}`)
      if (r.ok) {
        const card = await r.json()
        colors = extractColorsFromCard(card)
      }
    } catch {}
  }

  // 3) Code: usa el del cliente o calcúlalo
  const code = (typeof p.commander_color_code === 'string' && p.commander_color_code)
    ? p.commander_color_code.toUpperCase()
    : (colors.length ? getArchetypeByColors(colors).code : null)

  return { colors, code }
}

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

  const participantIds = new Set((participants || []).map(x => x.user_id).filter(Boolean))
  if (!participantIds.has(match?.winner)) {
    return res.status(400).json({ error: 'El ganador debe estar entre los participantes.' })
  }

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


  const participantsData = await Promise.all(
    (participants || []).map(async (p) => {
      const { colors, code } = await resolveColorsForParticipant(p)

      return {
        match_id: matchData.id,
        user_id: p.user_id,
        deck_commander: p.deck_commander || null,
        commander_image: p.commander_image || null,
        commander_art_crop: p.commander_art_crop || null,
        commander_image_normal: p.commander_image_normal || null,
        commander_image_small: p.commander_image_small || null,
        commander_name: p.commander_name || null,
        scryfall_id: p.scryfall_id || null,
        used_proxies: !!p.used_proxies,
        life_remaining: p.life_remaining ? parseInt(p.life_remaining) : null,
        max_damage: p.max_damage ? parseInt(p.max_damage) : null,
        first_to_die: !!p.first_to_die,
        won_by_combo: !!p.won_by_combo,
        kills: p.kills ? parseInt(p.kills) : null,

        // 💾 ya resuelto (cliente o Scryfall)
        commander_colors: colors,
        commander_color_code: code,
      }
    })
  )

  // Debug: Verificar variables de entorno
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
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