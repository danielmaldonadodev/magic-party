'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

const MTG_PROFESSIONAL_THEMES = [
  {
    key: 'mono-white',
    label: 'Plains',
    icon: '⚪️',
    colors: {
      primary: 'from-amber-400 to-yellow-500',
      secondary: 'from-amber-100 to-yellow-200',
      accent: 'bg-amber-500',
      bgSoft: 'bg-amber-50/80',
      ring: 'ring-amber-300',
      glowColor: 'rgba(245, 158, 11, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600',
    backgroundGradient: 'from-amber-50 via-yellow-50 to-amber-100',
    navbarGradient: 'from-amber-900/95 to-yellow-900/95',
    text: {
      strong: 'text-amber-900',
      soft: 'text-amber-700',
      white: 'text-white',
      navbar: 'text-amber-100',
    },
    border: 'border-amber-300',
    shadow: 'shadow-amber-500/25',
    navAccent: 'amber',
  },
  {
    key: 'mono-blue',
    label: 'Island',
    icon: '🔵',
    colors: {
      primary: 'from-blue-500 to-indigo-600',
      secondary: 'from-blue-100 to-indigo-200',
      accent: 'bg-blue-600',
      bgSoft: 'bg-blue-50/80',
      ring: 'ring-blue-300',
      glowColor: 'rgba(59, 130, 246, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-blue-600 via-indigo-500 to-blue-700',
    backgroundGradient: 'from-blue-50 via-indigo-50 to-blue-100',
    navbarGradient: 'from-blue-900/95 to-indigo-900/95',
    text: {
      strong: 'text-blue-900',
      soft: 'text-blue-700',
      white: 'text-white',
      navbar: 'text-blue-100',
    },
    border: 'border-blue-300',
    shadow: 'shadow-blue-500/25',
    navAccent: 'blue',
  },
  {
    key: 'mono-black',
    label: 'Swamp',
    icon: '⚫️',
    colors: {
      primary: 'from-gray-700 to-gray-900',
      secondary: 'from-gray-200 to-gray-400',
      accent: 'bg-gray-800',
      bgSoft: 'bg-gray-50/80',
      ring: 'ring-gray-400',
      glowColor: 'rgba(107, 114, 128, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900',
    backgroundGradient: 'from-gray-50 via-gray-100 to-gray-200',
    navbarGradient: 'from-gray-900/95 to-black/95',
    text: {
      strong: 'text-gray-900',
      soft: 'text-gray-700',
      white: 'text-white',
      navbar: 'text-gray-100',
    },
    border: 'border-gray-400',
    shadow: 'shadow-gray-500/25',
    navAccent: 'gray',
  },
  {
    key: 'mono-red',
    label: 'Mountain',
    icon: '🔴',
    colors: {
      primary: 'from-red-500 to-rose-600',
      secondary: 'from-red-100 to-rose-200',
      accent: 'bg-red-600',
      bgSoft: 'bg-red-50/80',
      ring: 'ring-red-300',
      glowColor: 'rgba(239, 68, 68, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-red-600 via-rose-500 to-red-700',
    backgroundGradient: 'from-red-50 via-rose-50 to-red-100',
    navbarGradient: 'from-red-900/95 to-rose-900/95',
    text: {
      strong: 'text-red-900',
      soft: 'text-red-700',
      white: 'text-white',
      navbar: 'text-red-100',
    },
    border: 'border-red-300',
    shadow: 'shadow-red-500/25',
    navAccent: 'red',
  },
  {
    key: 'mono-green',
    label: 'Forest',
    icon: '🟢',
    colors: {
      primary: 'from-green-500 to-emerald-600',
      secondary: 'from-green-100 to-emerald-200',
      accent: 'bg-green-600',
      bgSoft: 'bg-green-50/80',
      ring: 'ring-green-300',
      glowColor: 'rgba(34, 197, 94, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-green-600 via-emerald-500 to-green-700',
    backgroundGradient: 'from-green-50 via-emerald-50 to-green-100',
    navbarGradient: 'from-green-900/95 to-emerald-900/95',
    text: {
      strong: 'text-green-900',
      soft: 'text-green-700',
      white: 'text-white',
      navbar: 'text-green-100',
    },
    border: 'border-green-300',
    shadow: 'shadow-green-500/25',
    navAccent: 'green',
  },
  {
    key: 'azorius',
    label: 'Azorius',
    icon: '⚪️🔵',
    colors: {
      primary: 'from-blue-400 to-indigo-500',
      secondary: 'from-blue-100 to-indigo-200',
      accent: 'bg-blue-500',
      bgSoft: 'bg-blue-50/80',
      ring: 'ring-blue-300',
      glowColor: 'rgba(99, 102, 241, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-blue-500 via-indigo-400 to-blue-600',
    backgroundGradient: 'from-blue-50 via-indigo-50 to-blue-100',
    navbarGradient: 'from-blue-900/95 to-indigo-900/95',
    text: {
      strong: 'text-blue-900',
      soft: 'text-blue-700',
      white: 'text-white',
      navbar: 'text-blue-100',
    },
    border: 'border-blue-300',
    shadow: 'shadow-blue-500/25',
    navAccent: 'blue',
  },
  {
    key: 'golgari',
    label: 'Golgari',
    icon: '⚫️🟢',
    colors: {
      primary: 'from-green-600 to-gray-700',
      secondary: 'from-green-100 to-gray-300',
      accent: 'bg-green-700',
      bgSoft: 'bg-green-50/80',
      ring: 'ring-green-400',
      glowColor: 'rgba(21, 128, 61, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-green-600 via-gray-600 to-green-800',
    backgroundGradient: 'from-green-50 via-gray-50 to-green-100',
    navbarGradient: 'from-green-900/95 to-gray-900/95',
    text: {
      strong: 'text-green-900',
      soft: 'text-green-700',
      white: 'text-white',
      navbar: 'text-green-100',
    },
    border: 'border-green-400',
    shadow: 'shadow-green-500/25',
    navAccent: 'green',
  },
  {
    key: 'izzet',
    label: 'Izzet',
    icon: '🔵🔴',
    colors: {
      primary: 'from-blue-500 to-red-500',
      secondary: 'from-blue-100 to-red-200',
      accent: 'bg-purple-600',
      bgSoft: 'bg-purple-50/80',
      ring: 'ring-purple-300',
      glowColor: 'rgba(147, 51, 234, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-blue-500 via-purple-500 to-red-500',
    backgroundGradient: 'from-blue-50 via-purple-50 to-red-50',
    navbarGradient: 'from-blue-900/95 to-red-900/95',
    text: {
      strong: 'text-purple-900',
      soft: 'text-purple-700',
      white: 'text-white',
      navbar: 'text-purple-100',
    },
    border: 'border-purple-300',
    shadow: 'shadow-purple-500/25',
    navAccent: 'purple',
  },
]

const DEFAULT_THEME_KEY = 'azorius'

function useThemeFromLocalStorage(pollMs = 1000) {
  const [themeKey, setThemeKey] = useState(DEFAULT_THEME_KEY)
  const lastRef = useRef('')

  useEffect(() => {
    const read = () => {
      try {
        const k = localStorage.getItem('mp_professional_theme') || DEFAULT_THEME_KEY
        if (k !== lastRef.current) {
          lastRef.current = k
          setThemeKey(k)
        }
      } catch {}
    }
    read()
    const id = setInterval(read, pollMs)
    return () => clearInterval(id)
  }, [pollMs])

  const theme = useMemo(() => {
    return MTG_PROFESSIONAL_THEMES.find(t => t.key === themeKey) || MTG_PROFESSIONAL_THEMES[0]
  }, [themeKey])

  return { theme }
}

export default function Footer() {
  const { theme } = useThemeFromLocalStorage(1000)

  return (
    <footer
      className={`border-t ${theme.border} backdrop-blur-md`}
      style={{
        background: `linear-gradient(135deg, ${theme.navbarGradient})`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className={`text-sm ${theme.text.navbar}`}>
          © {new Date().getFullYear()} Magic Party
        </p>
        <div className={`flex space-x-4 text-sm ${theme.text.navbar}`}>
          <Link href="/stats" className="hover:opacity-80 transition-opacity">
            Estadísticas
          </Link>
          <Link href="/players" className="hover:opacity-80 transition-opacity">
            Perfiles
          </Link>
          <Link href="/matches/new" className="hover:opacity-80 transition-opacity">
            Nueva partida
          </Link>
        </div>
      </div>
    </footer>
  )
}
