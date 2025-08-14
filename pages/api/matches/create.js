// pages/api/matches/create.js
import { createClient } from '@supabase/supabase-js'
import { getArchetypeByColors } from '../../../lib/archetypes'

const WUBRG = ['W', 'U', 'B', 'R', 'G']

function normalizeColors(arr) {
  return Array.from(
    new Set(
      (arr || [])
        .map((c) => String(c).toUpperCase())
        .filter((c) => WUBRG.includes(c))
    )
  )
}

function extractColorsFromCard(card) {
  if (!card) return []
  if (Array.isArray(card.color_identity) && card.color_identity.length) {
    return normalizeColors(card.color_identity)
  }
  if (Array.isArray(card.card_faces) && card.card_faces.length) {
    const faces = card.card_faces.flatMap((f) =>
      Array.isArray(f?.color_identity)
        ? f.color_identity
        : Array.isArray(f?.colors)
        ? f.colors
        : []
    )
    if (faces.length) return normalizeColors(faces)
  }
  if (Array.isArray(card.colors) && card.colors.length) {
    return normalizeColors(card.colors)
  }
  return []
}

async function resolveColorsForParticipant(p) {
  // 1) Ya vienen del cliente
  let colors = normalizeColors(p.commander_colors)

  // 2) Si no vienen, intenta Scryfall por scryfall_id
  if ((!colors || colors.length === 0) && p.scryfall_id) {
    try {
      const r = await fetch(`https://api.scryfall.com/cards/${p.scryfall_id}`)
      if (r.ok) {
        const card = await r.json()
        colors = extractColorsFromCard(card)
      }
    } catch {
      // silencioso
    }
  }

  // 3) Calcular code si hace falta
  const code =
    typeof p.commander_color_code === 'string' && p.commander_color_code
      ? p.commander_color_code.toUpperCase()
      : colors.length
      ? getArchetypeByColors(colors).code
      : null

  return { colors, code }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 1) Token del usuario (para validar identidad)
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'No autenticado (sin Authorization)' })
  }

  // 2) Cliente con token del usuario (solo para validar al usuario)
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

  // 4) Cliente Service Role (UN SOLO BLOQUE)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return res
      .status(500)
      .json({ error: 'SUPABASE_SERVICE_ROLE_KEY no encontrada en variables de entorno' })
  }
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // 5) Cuerpo
  const { match, participants } = req.body || {}
  if (!match || !Array.isArray(participants) || participants.length < 2) {
    return res.status(400).json({ error: 'Datos inválidos: se requieren match y 2+ participantes' })
  }

  // Ganador debe estar entre participantes
  const participantIds = new Set(participants.map((x) => x.user_id).filter(Boolean))
  if (!match?.winner || !participantIds.has(match.winner)) {
    return res.status(400).json({ error: 'El ganador debe estar entre los participantes.' })
  }

  // 6) Insertar partida con Service Role (bypassa RLS y permite triggers)
  const { data: matchData, error: matchError } = await supabaseAdmin
    .from('matches')
    .insert({
      ...match,
      user_id: user.id, // dueño de la partida
    })
    .select()
    .single()

  if (matchError) {
    return res.status(400).json({ error: matchError.message })
  }

  // 7) Preparar datos de participantes (resolviendo colores si hace falta)
  const participantsData = await Promise.all(
    participants.map(async (p) => {
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

        commander_colors: colors,
        commander_color_code: code,
      }
    })
  )

  // 8) Insert en match_participants con Service Role
  //    (opcionalmente probamos uno primero para logs más claros)
  try {
    // Inserción de prueba (el primero)
    const first = participantsData[0]
    const { error: testError } = await supabaseAdmin.from('match_participants').insert(first)
    if (testError) {
      return res.status(400).json({
        error: 'Error en inserción de prueba de participante',
        originalError: testError.message,
        details: testError.details,
        hint: testError.hint,
        code: testError.code,
      })
    }

    // Si hay más, insertamos el resto en batch
    if (participantsData.length > 1) {
      const rest = participantsData.slice(1)
      const { error: partError } = await supabaseAdmin.from('match_participants').insert(rest)
      if (partError) {
        return res.status(400).json({
          error: partError.message,
          details: partError.details,
          hint: partError.hint,
          code: partError.code,
        })
      }
    }
  } catch (e) {
    // por si algo inesperado explota
    return res.status(500).json({ error: 'Error insertando participantes', message: String(e) })
  }

  // 9) OK
  return res.status(201).json({ success: true, match: matchData })
}
