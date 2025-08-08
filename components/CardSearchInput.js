// components/CardSearchInput.js
import { useState, useEffect, useRef } from 'react'

export default function CardSearchInput({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Buscar carta',
  closeOnSelect = true,
  className = '',
  inputProps = {},
}) {
  const [query, setQuery] = useState(value || '')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const suppressNextSearch = useRef(false) // ← NUEVO

  useEffect(() => { setQuery(value || '') }, [value])

  useEffect(() => {
    // si acabamos de seleccionar, saltamos la búsqueda UNA vez
    if (suppressNextSearch.current) {
      suppressNextSearch.current = false
      return
    }
    if (!query || query.trim().length < 3) {
      setResults([])
      setOpen(false)
      return
    }
    const t = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch(
          `https://api.scryfall.com/cards/search?q=${encodeURIComponent('name:' + query)}&unique=cards`
        )
        const json = await res.json()
        const data = Array.isArray(json.data) ? json.data : []
        const withImages = data.filter((c) => c.image_uris)
        setResults(withImages.slice(0, 8))
        setOpen(true)
      } catch {
        setResults([])
        setOpen(false)
      } finally {
        setIsLoading(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const emit = (cardOrNull) => {
    const c = cardOrNull
      ? {
          id: cardOrNull.id,
          name: cardOrNull.name,
          image_uris: {
            small: cardOrNull.image_uris?.small || '',
            normal: cardOrNull.image_uris?.normal || '',
            large: cardOrNull.image_uris?.large || '',
            art_crop: cardOrNull.image_uris?.art_crop || '',
            border_crop: cardOrNull.image_uris?.border_crop || '',
          },
        }
      : null
    if (typeof onChange === 'function') onChange(c)
    if (c && typeof onSelect === 'function') onSelect(c)
  }

  const handleSelect = (card) => {
    suppressNextSearch.current = true   // ← BLOQUEA la búsqueda causada por setQuery
    setQuery(card.name)
    emit(card)
    setResults([])
    if (closeOnSelect) setOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        className="input w-full"
        value={query}
        onChange={(e) => { setQuery(e.target.value); emit(null) }}
        placeholder={placeholder}
        onFocus={() => results.length && setOpen(true)}
        {...inputProps}
      />

      {isLoading && <div className="mt-1 text-xs opacity-70">Cargando…</div>}

      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 z-20 mt-1 max-h-72 overflow-y-auto rounded-xl border bg-white shadow-lg">
          {results.map((card) => (
            <li
              key={card.id}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(card) }} // cierre a 1 clic
              className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
            >
              {card.image_uris?.small && (
                <img
                  src={card.image_uris.small}
                  alt={card.name}
                  width={40}
                  height={56}
                  className="w-10 h-14 object-cover rounded"
                />
              )}
              <span className="text-sm">{card.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
