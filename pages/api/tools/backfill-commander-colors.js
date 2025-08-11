// pages/api/tools/backfill-commander-colors.js
import { createClient } from '@supabase/supabase-js'
import { getArchetypeByColors } from '../../../lib/archetypes'

// ─── Helpers de colores ─────────────────────────────────────
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

async function fetchScryfallById(id) {
  const r = await fetch(`https://api.scryfall.com/cards/${id}`)
  if (!r.ok) throw new Error(`Scryfall ${r.status}`)
  return r.json()
}

// tiny sleep for rate-limit cortesía (Scryfall ~10 req/s)
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// ─── Endpoint ────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Autorización simple por cabecera
  const secret = req.headers['x-backfill-secret']
  if (!secret || secret !== process.env.BACKFILL_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Faltan SUPABASE vars en el servidor' })
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Parámetros
  const limit = Math.min(parseInt(req.query.limit || '100', 10), 500)
  const offset = parseInt(req.query.offset || '0', 10)
  const dryRun = req.query.dry === '1' || req.query.dry === 'true'
  const concurrency = Math.min(parseInt(req.query.concurrency || '5', 10), 10)

  // Selección: registros con code vacío o nulo (cubre arrays vacíos)
  // + con scryfall_id presente
  const { data: rows, error } = await supabaseAdmin
    .from('match_participants')
    .select('id, scryfall_id, commander_colors, commander_color_code')
    .or('commander_color_code.is.null,commander_color_code.eq.')
    .not('scryfall_id', 'is', null)
    .order('id', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) return res.status(400).json({ error: error.message })

  // Nada que hacer
  if (!rows || rows.length === 0) {
    return res.status(200).json({ scanned: 0, updated: 0, dryRun, sample: [] })
  }

  let updated = 0
  const sample = []
  const errors = []

  // Cola simple con concurrencia
  let idx = 0
  async function worker() {
    while (idx < rows.length) {
      const i = idx++
      const r = rows[i]
      try {
        // Si ya hay colores válidos, calcula code y listo
        let colors = normalizeColors(r.commander_colors)
        if (!colors.length) {
          const card = await fetchScryfallById(r.scryfall_id)
          colors = extractColorsFromCard(card)
          // cortesía para Scryfall
          await sleep(120)
        }
        const code = colors.length ? getArchetypeByColors(colors).code : null

        if (!colors.length || !code) {
          // no actualizamos si no pudimos resolver
          sample.push({ id: r.id, scryfall_id: r.scryfall_id, colors, code, skipped: true })
          continue
        }

        if (!dryRun) {
          const { error: upErr } = await supabaseAdmin
            .from('match_participants')
            .update({ commander_colors: colors, commander_color_code: code })
            .eq('id', r.id)
          if (upErr) throw upErr
        }

        updated++
        if (sample.length < 10) sample.push({ id: r.id, scryfall_id: r.scryfall_id, colors, code })
      } catch (e) {
        errors.push({ id: r.id, scryfall_id: r.scryfall_id, message: String(e?.message || e) })
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()))

  return res.status(200).json({
    scanned: rows.length,
    updated,
    dryRun,
    sample,
    errors: errors.slice(0, 10),
    next: { offset: offset + rows.length, limit }
  })
}
