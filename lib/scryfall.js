// lib/scryfall.js
async function fetchScryfallCardsByIds(ids) {
  // /cards/collection admite hasta 75 identificadores por llamada
  const chunks = []
  for (let i = 0; i < ids.length; i += 75) chunks.push(ids.slice(i, i + 75))

  const results = []
  for (const chunk of chunks) {
    const body = { identifiers: chunk.map(id => ({ id })) }
    const res = await fetch('https://api.scryfall.com/cards/collection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Scryfall ${res.status}: ${txt}`)
    }
    const json = await res.json()
    if (Array.isArray(json.data)) results.push(...json.data)
  }
  return results
}

function pickImages(c) {
  if (c.image_uris) return { small: c.image_uris.small ?? null, normal: c.image_uris.normal ?? null }
  if (Array.isArray(c.card_faces) && c.card_faces[0]?.image_uris) {
    const f = c.card_faces[0].image_uris
    return { small: f.small ?? null, normal: f.normal ?? null }
  }
  return { small: null, normal: null }
}

function pickOracle(c) {
  if (c.oracle_text) return c.oracle_text
  if (Array.isArray(c.card_faces)) {
    return c.card_faces.map(f => f.oracle_text).filter(Boolean).join('\n—\n') || null
  }
  return null
}

function mapScryfallToDeckCard(c) {
  const imgs = pickImages(c)
  return {
    name: c.name,
    scryfall_id: c.id,               // uuid string
    cmc: Number.isFinite(c.cmc) ? c.cmc : 0,
    colors: c.colors ?? [],
    color_identity: c.color_identity ?? [],
    type_line: c.type_line ?? null,
    rarity: c.rarity ?? null,
    set_code: c.set ?? null,
    oracle_text: pickOracle(c),
    power: c.power ?? null,
    toughness: c.toughness ?? null,
    loyalty: c.loyalty ?? null,
    image_url: imgs.normal,
    image_url_small: imgs.small,
    price_usd: c.prices?.usd ? parseFloat(c.prices.usd) : null,
    price_eur: c.prices?.eur ? parseFloat(c.prices.eur) : null,
  }
}

module.exports = { fetchScryfallCardsByIds, mapScryfallToDeckCard }
