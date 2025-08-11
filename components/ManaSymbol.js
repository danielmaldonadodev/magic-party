// components/ManaSymbol.jsx
import React from 'react'

const MANA_COLORS = {
  w: { bg: '#fff',    text: '#000', border: '#d4d4d4' },
  u: { bg: '#1e90ff', text: '#fff', border: '#1e90ff' },
  b: { bg: '#000',    text: '#fff', border: '#000' },
  r: { bg: '#d33',    text: '#fff', border: '#d33' },
  g: { bg: '#228b22', text: '#fff', border: '#228b22' },
  c: { bg: '#cccccc', text: '#000', border: '#999999' },
  x: { bg: '#999999', text: '#fff', border: '#777777' },
  s: { bg: '#a9c3ff', text: '#000', border: '#7ea0ff' }, // Snow (opcional)
  '2': { bg: '#e5e5e5', text: '#000', border: '#cfcfcf' }, // genérico para híbridos 2/W, etc.
}

// Palabras → códigos
const WORD_TO_CODE = {
  WHITE: 'W', BLUE: 'U', BLACK: 'B', RED: 'R', GREEN: 'G',
  COLORLESS: 'C', SNOW: 'S',
  W: 'W', U: 'U', B: 'B', R: 'R', G: 'G', C: 'C', X: 'X', S: 'S',
}

function toStr(x) {
  if (x === null || x === undefined) return ''
  return String(x)
}

// Normaliza cada pieza a código conocido (W/U, 2/W, white, etc.)
function normalizePiece(piece) {
  const raw = toStr(piece).trim()
  if (!raw) return ''
  const cleaned = raw.replace(/[{}]/g, '').toUpperCase()
  // map palabras → código si aplica
  const mapped = WORD_TO_CODE[cleaned] || cleaned
  return mapped
}

// Devuelve { hybrid, parts, value } de forma segura
function parseMana(input) {
  const str = toStr(input).trim()
  if (!str) return { hybrid: false, value: '' }

  const cleaned = str.replace(/[{}]/g, '').toUpperCase()
  if (cleaned.includes('/')) {
    const parts = cleaned.split(/[\/,\s]+/).filter(Boolean).map(normalizePiece)
    return { hybrid: true, parts }
  }
  return { hybrid: false, value: normalizePiece(cleaned) }
}

function sizePx(size) {
  if (size === 'sm') return 18
  if (size === 'lg') return 32
  return 26 // md por defecto
}

export default function ManaSymbol({ symbol, token, size = 'md', title }) {
  // compat: usa 'symbol' si existe; si no, usa 'token'
  const input = symbol !== undefined ? symbol : token
  const { hybrid, parts = [], value = '' } = parseMana(input)
  const WH = sizePx(size)
  const safeTitle = toStr(title ?? input ?? '').trim() || undefined

  // HÍBRIDO (W/U, 2/W, etc.)
  if (hybrid && parts.length >= 2) {
    const left = (MANA_COLORS[parts[0].toLowerCase()] || MANA_COLORS.c)
    const right = (MANA_COLORS[parts[1].toLowerCase()] || MANA_COLORS.c)

    return (
      <span
        className="inline-flex items-center justify-center rounded-full font-bold"
        style={{
          width: WH, height: WH, fontSize: WH <= 18 ? 10 : 12,
          background: `linear-gradient(90deg, ${left.bg} 50%, ${right.bg} 50%)`,
          color: '#000',
          border: `1px solid ${left.border}`,
          lineHeight: 1,
        }}
        title={safeTitle}
      >
        {parts.join('/')}
      </span>
    )
  }

  // NÚMEROS (coste genérico): 0,1,2,...,10, etc.
  const isNumeric = value !== '' && !Number.isNaN(Number(value))
  if (isNumeric) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full font-bold"
        style={{
          width: WH, height: WH, fontSize: WH <= 18 ? 10 : 12,
          background: '#eeeeee',
          color: '#000',
          border: '1px solid #cccccc',
          lineHeight: 1,
        }}
        title={safeTitle}
      >
        {value}
      </span>
    )
  }

  // COLORES NORMALES (W, U, B, R, G, C, X, S)
  const colorKey = toStr(value).toLowerCase()
  const color = MANA_COLORS[colorKey] || MANA_COLORS.c

  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold"
      style={{
        width: WH, height: WH, fontSize: WH <= 18 ? 10 : 12,
        background: color.bg,
        color: color.text,
        border: `1px solid ${color.border}`,
        lineHeight: 1,
      }}
      title={safeTitle}
    >
      {toStr(value).toUpperCase()}
    </span>
  )
}
