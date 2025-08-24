// lib/deckServices.js
// Importa y normaliza mazos desde Moxfield/Archidekt y los enriquece con Scryfall (batch).

/* =========================
   Endpoints externos
   ========================= */
const MOXFIELD_V3 = (id) => `https://api2.moxfield.com/v3/decks/all/${id}`;
const MOXFIELD_V2A = (id) => `https://api2.moxfield.com/v2/decks/all/${id}`;
const MOXFIELD_V2B = (id) => `https://api.moxfield.com/v2/decks/all/${id}`;
const ARCHIDEKT_A = (id) => `https://archidekt.com/api/decks/${id}/?format=json`;
const ARCHIDEKT_B = (id) => `https://archidekt.com/api/decks/${id}/`;

/* =========================
   Validación y utilidades de URL
   ========================= */
export function isValidDeckUrl(url) {
  try {
    const u = new URL(url);
    const h = u.hostname.toLowerCase();
    return h.includes('moxfield.com') || h.includes('archidekt.com');
  } catch {
    return false;
  }
}

function detectProvider(url) {
  try {
    const u = new URL(url);
    const h = u.hostname.toLowerCase();
    if (h.includes('moxfield.com')) return 'moxfield';
    if (h.includes('archidekt.com')) return 'archidekt';
  } catch {}
  return null;
}

function extractMoxfieldId(url) {
  const m = url.match(/moxfield\.com\/decks\/([A-Za-z0-9_-]+)/i);
  return m?.[1] ?? null;
}

function extractArchidektId(url) {
  const m = url.match(/archidekt\.com\/decks\/(\d+)/i);
  return m?.[1] ?? null;
}

/* =========================
   Scryfall helpers (batch)
   ========================= */
async function scryfallBatchByIds(ids) {
  const uniq = Array.from(new Set((ids || []).filter(Boolean)));
  if (!uniq.length) return new Map();

  const chunks = [];
  for (let i = 0; i < uniq.length; i += 75) chunks.push(uniq.slice(i, i + 75));

  const out = new Map();
  for (const ch of chunks) {
    const res = await fetch('https://api.scryfall.com/cards/collection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifiers: ch.map((id) => ({ id })) }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Scryfall IDs ${res.status}: ${txt}`);
    }
    const { data } = await res.json();
    (data || []).forEach((c) => out.set(c.id, c));
  }
  return out;
}

async function scryfallBatchByNames(names) {
  const uniq = Array.from(new Set((names || []).filter(Boolean)));
  if (!uniq.length) return new Map();

  const chunks = [];
  for (let i = 0; i < uniq.length; i += 75) chunks.push(uniq.slice(i, i + 75));

  const out = new Map();
  for (const ch of chunks) {
    const res = await fetch('https://api.scryfall.com/cards/collection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifiers: ch.map((name) => ({ name })) }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Scryfall names ${res.status}: ${txt}`);
    }
    const { data } = await res.json();
    (data || []).forEach((c) => out.set((c.name || '').toLowerCase(), c));
  }
  return out;
}

function pickImages(c) {
  if (c?.image_uris) {
    return {
      small: c.image_uris.small ?? null,
      normal: c.image_uris.normal ?? null,
      large: c.image_uris.large ?? null,
    };
  }
  if (Array.isArray(c?.card_faces) && c.card_faces[0]?.image_uris) {
    const f = c.card_faces[0].image_uris;
    return { small: f.small ?? null, normal: f.normal ?? null, large: f.large ?? null };
  }
  return { small: null, normal: null, large: null };
}

function pickOracle(c) {
  if (c?.oracle_text) return c.oracle_text;
  if (Array.isArray(c?.card_faces)) {
    return c.card_faces.map((f) => f.oracle_text).filter(Boolean).join('\n—\n') || null;
  }
  return null;
}

// Tu columna cmc es INTEGER → redondeamos
function mapScryfallToMinimal(c) {
  const imgs = pickImages(c);
  const cmc = Number.isFinite(c?.cmc) ? Math.round(c.cmc) : 0;
  return {
    scryfall_id: c?.id ?? null,
    image_url: imgs.normal ?? imgs.large ?? null,
    image_url_small: imgs.small ?? null,
    cmc,
    colors: c?.colors ?? [],
    color_identity: c?.color_identity ?? [],
    type_line: c?.type_line ?? null,
    rarity: c?.rarity ?? null,
    set_code: c?.set ?? null,
    oracle_text: pickOracle(c),
    power: c?.power ?? null,
    toughness: c?.toughness ?? null,
    loyalty: c?.loyalty ?? null,
    price_usd: c?.prices?.usd ? parseFloat(c.prices.usd) : null,
    price_eur: c?.prices?.eur ? parseFloat(c.prices.eur) : null,
  };
}

/* =========================
   Normalizador común
   ========================= */
function normalizeEntry({ name, quantity = 1, scryfall_id = null }) {
  return {
    name,
    quantity: Number(quantity) || 1,
    scryfall_id,
    // campos a enriquecer por Scryfall:
    image_url: null,
    image_url_small: null,
    cmc: 0,
    colors: [],
    color_identity: [],
    type_line: null,
    rarity: null,
    set_code: null,
    oracle_text: null,
    power: null,
    toughness: null,
    loyalty: null,
    price_usd: null,
    price_eur: null,
    categories: [],
  };
}

/* =========================
   Importadores por proveedor
   ========================= */
async function fetchFromMoxfield(url) {
  const id = extractMoxfieldId(url);
  if (!id) throw new Error('No se pudo extraer el ID del deck de Moxfield');

  // Intentamos varias rutas por compatibilidad
  let json = null;
  for (const builder of [MOXFIELD_V3, MOXFIELD_V2A, MOXFIELD_V2B]) {
    const res = await fetch(builder(id));
    if (res.ok) {
      json = await res.json();
      break;
    }
  }
  if (!json) throw new Error('No se pudo obtener el mazo desde Moxfield');

  return formatMoxfieldData(json, url);
}

// Reemplaza la función formatMoxfieldData en tu archivo lib/deckServices.js

function formatMoxfieldData(data, sourceUrl) {
  // boards: { mainboard: {cards: {...}}, sideboard: {cards: {...}} }
  const boards = data?.boards || {};
  const objToArray = (obj) => (Array.isArray(obj) ? obj : Object.values(obj || {}));
  const rawMain = objToArray(boards.mainboard?.cards);
  const rawSide = objToArray(boards.sideboard?.cards);

  const mapCard = (row) => {
    const qty = row?.quantity ?? row?.count ?? 1;
    const card = row?.card || row;
    const name = card?.name ?? row?.name ?? 'Unknown';
    const sid =
      card?.scryfall_id ||
      card?.scryfallId ||
      card?.identifiers?.scryfallId ||
      row?.scryfall_id ||
      null;
    return normalizeEntry({ name, quantity: qty, scryfall_id: sid });
  };

  const mainboard = rawMain.map(mapCard);
  const sideboard = rawSide.map(mapCard);

  // CORREGIDO: El comandante está en data.main, no en boards.commanders
  let commander = null;
  if (data?.main) {
    const mainCard = data.main;
    const name = mainCard?.name || 'Unknown Commander';
    const sid = mainCard?.scryfall_id || null;
    
    commander = { 
      name, 
      scryfall_id: sid, 
      image_url: null, // Se llenará en enrichWithScryfall
      colors: mainCard?.colors || [],
      type_line: mainCard?.type_line || null
    };
  }

  console.log('📊 Moxfield data processed:', {
    name: data?.name,
    commander: commander?.name,
    mainboardCount: mainboard.length,
    sideboardCount: sideboard.length,
    totalMainboardCards: mainboard.reduce((sum, card) => sum + card.quantity, 0),
    totalSideboardCards: sideboard.reduce((sum, card) => sum + card.quantity, 0)
  });

  return {
    name: data?.name || 'Deck sin nombre',
    description: data?.description || '',
    format: data?.format || 'Commander',
    source: 'moxfield',
    sourceUrl,
    commander,
    mainboard,
    sideboard,
  };
}

async function fetchFromArchidekt(url) {
  const id = extractArchidektId(url);
  if (!id) throw new Error('No se pudo extraer el ID del deck de Archidekt');

  let res = await fetch(ARCHIDEKT_A(id));
  if (!res.ok) res = await fetch(ARCHIDEKT_B(id));
  if (!res.ok) throw new Error(`Archidekt ${res.status}`);

  const json = await res.json();
  return formatArchidektData(json, url);
}

function formatArchidektData(data, sourceUrl) {
  const cards = Array.isArray(data?.cards) ? data.cards : [];

  let commander = null;
  const mainboard = [];
  const sideboard = [];

  for (const row of cards) {
    const qty = row?.quantity ?? 1;
    const oc = row?.card?.oracleCard || row?.oracleCard || {};
    const name = row?.card?.name || oc?.name || row?.name || 'Unknown';
    const sid = row?.card?.uid || oc?.uid || row?.scryfall_id || oc?.id || null;
    const board = (row?.board || '').toLowerCase();
    const categories = (row?.categories || [])
      .map((c) => (typeof c === 'string' ? c : c?.name))
      .filter(Boolean);

    const entry = normalizeEntry({ name, quantity: qty, scryfall_id: sid });

    const isCommander = board === 'commander' || categories.some((c) => /commander/i.test(c));
    const isSide = board === 'sideboard';

    if (isCommander && !commander) {
      commander = { name: entry.name, scryfall_id: entry.scryfall_id, image_url: null, colors: [] };
    } else if (isSide) {
      sideboard.push(entry);
    } else {
      mainboard.push(entry);
    }
  }

  return {
    name: data?.name || 'Deck sin nombre',
    description: data?.description || '',
    format: data?.format?.name || data?.format || 'Commander',
    source: 'archidekt',
    sourceUrl,
    commander,
    mainboard,
    sideboard,
  };
}

/* =========================
   Enriquecido con Scryfall
   ========================= */
// Reemplaza la función enrichWithScryfall en tu archivo lib/deckServices.js

async function enrichWithScryfall(deck) {
  const all = [...(deck.mainboard || []), ...(deck.sideboard || [])];

  // Enriquecer cartas del mainboard y sideboard
  const haveIds = all.filter((c) => c.scryfall_id);
  const missingIds = all.filter((c) => !c.scryfall_id);

  const idMap = await scryfallBatchByIds(haveIds.map((c) => c.scryfall_id));
  haveIds.forEach((card) => {
    const c = idMap.get(card.scryfall_id);
    if (c) Object.assign(card, mapScryfallToMinimal(c));
  });

  const nameMap = await scryfallBatchByNames(missingIds.map((c) => c.name));
  missingIds.forEach((card) => {
    const c = nameMap.get(card.name.toLowerCase());
    if (c) Object.assign(card, mapScryfallToMinimal(c));
  });

  // MEJORADO: Enriquecer comandante
  if (deck.commander?.name) {
    let commanderData = null;
    
    // Intentar por scryfall_id primero
    if (deck.commander.scryfall_id) {
      commanderData = idMap.get(deck.commander.scryfall_id);
      
      // Si no lo tenemos en el mapa, hacer búsqueda individual
      if (!commanderData) {
        try {
          const response = await fetch(`https://api.scryfall.com/cards/${deck.commander.scryfall_id}`);
          if (response.ok) {
            commanderData = await response.json();
          }
        } catch (error) {
          console.warn('Error fetching commander by ID:', error);
        }
      }
    }
    
    // Si no tenemos datos aún, buscar por nombre
    if (!commanderData) {
      commanderData = nameMap.get(deck.commander.name.toLowerCase());
      
      // Si no lo tenemos en el mapa, hacer búsqueda individual por nombre
      if (!commanderData) {
        try {
          const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(deck.commander.name)}`);
          if (response.ok) {
            commanderData = await response.json();
          }
        } catch (error) {
          console.warn('Error fetching commander by name:', error);
        }
      }
    }

    if (commanderData) {
      const mapped = mapScryfallToMinimal(commanderData);
      deck.commander = {
        name: deck.commander.name,
        scryfall_id: mapped.scryfall_id,
        image_url: mapped.image_url,
        colors: mapped.colors || [],
        color_identity: mapped.color_identity || [],
        type_line: mapped.type_line || deck.commander.type_line,
        cmc: mapped.cmc || 0
      };
      
      console.log('✅ Commander enriched:', {
        name: deck.commander.name,
        hasImage: !!deck.commander.image_url,
        colors: deck.commander.colors
      });
    } else {
      console.warn('❌ Could not enrich commander:', deck.commander.name);
      
      // Fallback: construir URL de imagen si tenemos scryfall_id
      if (deck.commander.scryfall_id && !deck.commander.image_url) {
        deck.commander.image_url = `https://api.scryfall.com/cards/${deck.commander.scryfall_id}?format=image&version=large`;
      }
    }
  }

  // Totales (informativo; tu POST /api/decks recalcula igual)
  const totalMain = (deck.mainboard || []).reduce((a, c) => a + (c.quantity || 1), 0);
  const totalSide = (deck.sideboard || []).reduce((a, c) => a + (c.quantity || 1), 0);
  deck.totalCards = totalMain + totalSide;

  console.log('📋 Final deck summary:', {
    name: deck.name,
    commander: deck.commander?.name,
    commanderImage: !!deck.commander?.image_url,
    totalMainboard: totalMain,
    totalSideboard: totalSide,
    totalCards: deck.totalCards
  });

  return deck;
}

/* =========================
   API pública
   ========================= */
export class DeckImportService {
  static async importFromUrl(url) {
    if (!isValidDeckUrl(url)) {
      throw new Error('URL no válida. Debe ser de Moxfield o Archidekt.');
    }
    const provider = detectProvider(url);
    if (!provider) throw new Error('Plataforma no soportada');

    let deck;
    if (provider === 'moxfield') deck = await fetchFromMoxfield(url);
    else deck = await fetchFromArchidekt(url);

    deck = await enrichWithScryfall(deck);
    return deck;
  }
}

/* =========================
   Validaciones para el handler
   ========================= */
export const DeckUtils = {
  validateDeck(deck) {
    const errs = [];
    if (!deck || typeof deck !== 'object') {
      errs.push('Deck inválido');
      return errs;
    }
    if (!deck.name || typeof deck.name !== 'string') errs.push('El nombre del deck es requerido');
    if (!deck.format || typeof deck.format !== 'string') errs.push('El formato del deck es requerido');
    if (!Array.isArray(deck.mainboard)) errs.push('Mainboard inválido');
    if (!Array.isArray(deck.sideboard)) errs.push('Sideboard inválido');

    // Commander es opcional, pero si existe debe tener name
    if (deck.commander && !deck.commander.name) {
      errs.push('Commander inválido');
    }

    // Validación básica de cantidades
    const checkList = (arr, label) => {
      arr.forEach((c, i) => {
        if (!c?.name) errs.push(`${label}[${i}]: falta nombre`);
        const q = Number(c?.quantity);
        if (!Number.isFinite(q) || q <= 0) errs.push(`${label}[${i}]: cantidad inválida`);
      });
    };
    checkList(deck.mainboard || [], 'mainboard');
    checkList(deck.sideboard || [], 'sideboard');

    return errs;
  },
};
