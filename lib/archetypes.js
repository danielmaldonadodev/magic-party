// lib/archetypes.js

// Emojis para mostrar colores rápido
const COLOR_EMOJI = { W: '⚪️', U: '🔵', B: '⚫️', R: '🔴', G: '🟢' }

// Nombres por combinaciones conocidas (gremios, shards, wedges)
const GUILDS = {
  WU: 'Azorius', UB: 'Dimir', BR: 'Rakdos', RG: 'Gruul', GW: 'Selesnya',
  WB: 'Orzhov', UR: 'Izzet', BG: 'Golgari', RW: 'Boros', GU: 'Simic',
}
const SHARDS = { WUG: 'Bant', WUB: 'Esper', UBR: 'Grixis', BRG: 'Jund', RGW: 'Naya' }
const WEDGES = { WBG: 'Abzan', URW: 'Jeskai', BGU: 'Sultai', RWB: 'Mardu', GUR: 'Temur' }

// 4 colores (alias típicos de C16; útil para mostrar etiqueta)
const FOUR = {
  WUBG: 'sin R (Atraxa)',  // W U B G
  WUBR: 'sin G (Breya)',   // W U B R
  UBRG: 'sin W (Yidris)',  // U B R G
  RGWB: 'sin U (Saskia)',  // R G W B
  GWUR: 'sin B (Kynaios & Tiro)', // G W U R
}

// Fondos para el badge (gradiente CSS REAL, no clases Tailwind)
const BADGE_BG = {
  // pares
  WU: 'linear-gradient(45deg, #93c5fd, #a78bfa)',
  UB: 'linear-gradient(45deg, #60a5fa, #6b7280)',
  BR: 'linear-gradient(45deg, #ef4444, #6b7280)',
  RG: 'linear-gradient(45deg, #34d399, #ef4444)',
  GW: 'linear-gradient(45deg, #86efac, #fde68a)',
  WB: 'linear-gradient(45deg, #fde68a, #9ca3af)',
  UR: 'linear-gradient(45deg, #60a5fa, #f43f5e)',
  BG: 'linear-gradient(45deg, #22c55e, #374151)',
  RW: 'linear-gradient(45deg, #f59e0b, #ef4444)',
  GU: 'linear-gradient(45deg, #34d399, #60a5fa)',
  // tríos
  WUG: 'linear-gradient(45deg, #93c5fd, #86efac)',
  WUB: 'linear-gradient(45deg, #93c5fd, #9ca3af)',
  UBR: 'linear-gradient(45deg, #60a5fa, #ef4444)',
  BRG: 'linear-gradient(45deg, #ef4444, #22c55e)',
  RGW: 'linear-gradient(45deg, #22c55e, #f59e0b)',
  WBG: 'linear-gradient(45deg, #fde68a, #22c55e)',
  URW: 'linear-gradient(45deg, #60a5fa, #f59e0b)',
  BGU: 'linear-gradient(45deg, #374151, #34d399)',
  RWB: 'linear-gradient(45deg, #ef4444, #9ca3af)',
  GUR: 'linear-gradient(45deg, #34d399, #60a5fa)',
  // 4 y 5 colores: genéricos
  WUBG: 'linear-gradient(45deg, #93c5fd, #22c55e)',
  WUBR: 'linear-gradient(45deg, #93c5fd, #ef4444)',
  UBRG: 'linear-gradient(45deg, #60a5fa, #22c55e)',
  RGWB: 'linear-gradient(45deg, #ef4444, #fde68a)',
  GWUR: 'linear-gradient(45deg, #86efac, #60a5fa)',
  WUBRG: 'linear-gradient(45deg, #a78bfa, #f472b6)',
}

// Tags típicas por combinación (muy resumido; amplía según tu meta)
const TAGS = {
  // pares
  WU: ['Control', 'Skies'], UB: ['Control/Tempo', 'Mill/Rogues'], BR: ['Sacrifice', 'Midrange'],
  RG: ['Stompy', 'Aggro'], GW: ['Tokens', 'Enchantments'], WB: ['Midrange', 'Lifegain/Taxes'],
  UR: ['Spellslinger', 'Tempo'], BG: ['Cementerio', 'Midrange'], RW: ['Aggro', 'Equipos/Tokens'],
  GU: ['Ramp/Value', 'Flash'],
  // shards
  WUG: ['Exalted/Skies', 'Ramp-control'], WUB: ['Artefactos/Control'], UBR: ['Control/Spells', 'Reanimator'],
  BRG: ['Midrange', 'Sacrifice'], RGW: ['Zoo', 'Tokens'],
  // wedges
  WBG: ['Midrange', '+1/+1 Counters'], URW: ['Tempo/Control', 'Spells'], BGU: ['Cementerio', 'Ramp-control'],
  RWB: ['Aggro', 'Sacrifice'], GUR: ['Ramp', 'Flash/Big Spells'],
  // 4/5
  WUBG: ['Proliferate', 'Counters/Superfriends'], WUBR: ['Artefactos', 'Combo'],
  UBRG: ['Cascade', 'Spells'], RGWB: ['Aggro', 'Go-wide'], GWUR: ['Politics', 'Value'],
  WUBRG: ['Domain', 'Good-stuff'],
}

// Fallbacks por nombre de comandante (pon los que te interesen)
const NAME_HINTS = {
  'Atraxa': 'WUBG',
  'Edgar': 'RWB',
  'Edgar Markov': 'RWB',
  'Meren': 'BG',
  'Meren of Clan Nel Toth': 'BG',
  // añade más si quieres…
}

// ---------- Helpers ----------
const ORDER = ['W','U','B','R','G']
function normalizeColors(input) {
  if (!input) return []
  if (Array.isArray(input)) return input.map(c => String(c).toUpperCase()).filter(c => ORDER.includes(c))
  if (typeof input === 'string') {
    return input.toUpperCase().replace(/[^WUBRG]/g, '').split('')
  }
  return []
}
function codeFromColors(colors) {
  const arr = normalizeColors(colors)
  arr.sort((a,b) => ORDER.indexOf(a) - ORDER.indexOf(b))
  return arr.join('')
}

// ---------- API pública ----------
export function getArchetypeByColors(colors) {
  const code = codeFromColors(colors)
  const len = code.length

  let label = 'Monocolor'
  if (len === 1) label = code
  else if (len === 2) label = GUILDS[code] || code
  else if (len === 3) label = SHARDS[code] || WEDGES[code] || code
  else if (len === 4) label = FOUR[code] || 'Cuatro colores'
  else if (len === 5) label = 'Cinco colores'

  const emoji = code.split('').map(c => COLOR_EMOJI[c] || '🌈')
  const badgeBackground = BADGE_BG[code] || 'linear-gradient(45deg, #a3a3a3, #d4d4d4)'
  const tags = TAGS[code] || []

  return { code, label, emoji, badgeBackground, tags }
}

export function getArchetypeForCommander({ name, colorIdentity }) {
  // 1) Preferimos colorIdentity si lo tienes guardado en DB
  if (colorIdentity && normalizeColors(colorIdentity).length) {
    return getArchetypeByColors(colorIdentity)
  }
  // 2) Fallback por nombre conocido
  if (name) {
    for (const key in NAME_HINTS) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return getArchetypeByColors(NAME_HINTS[key])
      }
    }
  }
  // 3) Por defecto
  return {
    code: '',
    label: 'Multicolor',
    emoji: ['🌈'],
    badgeBackground: 'linear-gradient(45deg, #a78bfa, #f472b6)',
    tags: ['Variante']
  }
}
