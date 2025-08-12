// lib/theme.js
import { useEffect, useMemo, useRef, useState } from 'react'

export const MTG_PROFESSIONAL_THEMES = [/* pega aquí TODOS tus temas */]
export const DEFAULT_THEME_KEY = 'azorius'

export function useThemeRotation(intervalMs = 40000) {
  const [themeKey, setThemeKey] = useState(DEFAULT_THEME_KEY)
  const [index, setIndex] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mp_professional_theme')
      if (saved) {
        const idx = MTG_PROFESSIONAL_THEMES.findIndex(t => t.key === saved)
        if (idx >= 0) { setThemeKey(saved); setIndex(idx) }
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = setInterval(() => {
      setIndex(prev => {
        const next = (prev + 1) % MTG_PROFESSIONAL_THEMES.length
        const nextKey = MTG_PROFESSIONAL_THEMES[next].key
        setThemeKey(nextKey)
        try { localStorage.setItem('mp_professional_theme', nextKey) } catch {}
        return next
      })
    }, intervalMs)
    return () => timer.current && clearInterval(timer.current)
  }, [intervalMs])

  const theme = useMemo(
    () => MTG_PROFESSIONAL_THEMES.find(t => t.key === themeKey) || MTG_PROFESSIONAL_THEMES[0],
    [themeKey]
  )

  return { theme, themeKey, index, setThemeKey, setIndex }
}
