// components/ManaSymbol.jsx
import React from 'react'

const MANA_COLORS = {
  w: { bg: '#fff', text: '#000', border: '#ccc' },
  u: { bg: '#1e90ff', text: '#fff', border: '#1e90ff' },
  b: { bg: '#000', text: '#fff', border: '#000' },
  r: { bg: '#d33', text: '#fff', border: '#d33' },
  g: { bg: '#228b22', text: '#fff', border: '#228b22' },
  c: { bg: '#ccc', text: '#000', border: '#999' },
  x: { bg: '#999', text: '#fff', border: '#777' },
}

// Detecta si es híbrido (ej: R/W) o numérico
function parseMana(token) {
  const clean = token.replace(/[{}]/g, '')
  if (clean.includes('/')) {
    const parts = clean.split('/')
    return { hybrid: true, parts }
  }
  return { hybrid: false, value: clean }
}

export default function ManaSymbol({ token }) {
  const { hybrid, parts, value } = parseMana(token)

  if (hybrid) {
    const c1 = MANA_COLORS[parts[0].toLowerCase()] || { bg: '#eee', text: '#000', border: '#ccc' }
    const c2 = MANA_COLORS[parts[1].toLowerCase()] || { bg: '#eee', text: '#000', border: '#ccc' }

    return (
      <span
        className="inline-flex items-center justify-center rounded-full font-bold text-xs"
        style={{
          width: 26,
          height: 26,
          background: `linear-gradient(90deg, ${c1.bg} 50%, ${c2.bg} 50%)`,
          color: '#000',
          border: `1px solid ${c1.border}`,
        }}
        title={token}
      >
        {parts.join('/').toUpperCase()}
      </span>
    )
  }

  // Si es un número
  if (!isNaN(value)) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full font-bold text-xs"
        style={{
          width: 26,
          height: 26,
          background: '#eee',
          color: '#000',
          border: '1px solid #ccc',
        }}
        title={token}
      >
        {value}
      </span>
    )
  }

  // Colores normales
  const color = MANA_COLORS[value.toLowerCase()] || { bg: '#eee', text: '#000', border: '#ccc' }

  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold text-xs"
      style={{
        width: 26,
        height: 26,
        background: color.bg,
        color: color.text,
        border: `1px solid ${color.border}`,
      }}
      title={token}
    >
      {value.toUpperCase()}
    </span>
  )
}
