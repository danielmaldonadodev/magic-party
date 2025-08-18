'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import NavLink from './NavLink'

// Sistema de temas MTG idéntico al del index
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
    navbarGradient: 'from-amber-900/98 to-yellow-900/98',
    text: {
      strong: 'text-amber-900',
      soft: 'text-amber-700',
      white: 'text-white',
      navbar: 'text-white',
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
    navbarGradient: 'from-blue-900/98 to-indigo-900/98',
    text: {
      strong: 'text-blue-900',
      soft: 'text-blue-700',
      white: 'text-white',
      navbar: 'text-white',
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
    navbarGradient: 'from-gray-900/98 to-black/98',
    text: {
      strong: 'text-gray-900',
      soft: 'text-gray-700',
      white: 'text-white',
      navbar: 'text-white',
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
    navbarGradient: 'from-red-900/98 to-rose-900/98',
    text: {
      strong: 'text-red-900',
      soft: 'text-red-700',
      white: 'text-white',
      navbar: 'text-white',
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
    navbarGradient: 'from-green-900/98 to-emerald-900/98',
    text: {
      strong: 'text-green-900',
      soft: 'text-green-700',
      white: 'text-white',
      navbar: 'text-white',
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
    navbarGradient: 'from-blue-900/98 to-indigo-900/98',
    text: {
      strong: 'text-blue-900',
      soft: 'text-blue-700',
      white: 'text-white',
      navbar: 'text-white',
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
    navbarGradient: 'from-green-900/98 to-gray-900/98',
    text: {
      strong: 'text-green-900',
      soft: 'text-green-700',
      white: 'text-white',
      navbar: 'text-white',
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
    navbarGradient: 'from-blue-900/98 to-red-900/98',
    text: {
      strong: 'text-purple-900',
      soft: 'text-purple-700',
      white: 'text-white',
      navbar: 'text-white',
    },
    border: 'border-purple-300',
    shadow: 'shadow-purple-500/25',
    navAccent: 'purple',
  },
]

const DEFAULT_THEME_KEY = 'azorius'

// Hook para rotación de temas (idéntico al del index)
function useThemeRotation(intervalMs = 40000) {
  const [themeKey, setThemeKey] = useState(DEFAULT_THEME_KEY)
  const [index, setIndex] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mp_professional_theme')
      if (saved) {
        const idx = MTG_PROFESSIONAL_THEMES.findIndex(t => t.key === saved)
        if (idx >= 0) {
          setThemeKey(saved)
          setIndex(idx)
        }
      }
    } catch (e) {}
  }, [])

  useEffect(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = setInterval(() => {
      setIndex(prev => {
        const next = (prev + 1) % MTG_PROFESSIONAL_THEMES.length
        const nextKey = MTG_PROFESSIONAL_THEMES[next].key
        setThemeKey(nextKey)
        try { 
          localStorage.setItem('mp_professional_theme', nextKey) 
        } catch (e) {}
        return next
      })
    }, intervalMs)
    return () => timer.current && clearInterval(timer.current)
  }, [intervalMs])

  const theme = useMemo(() => {
    const found = MTG_PROFESSIONAL_THEMES.find(t => t.key === themeKey)
    return found || MTG_PROFESSIONAL_THEMES[0]
  }, [themeKey])

  return { theme, themeKey, setThemeKey, index, setIndex }
}

export default function Navbar() {
  const router = useRouter()
  const { theme } = useThemeRotation(40000) // Sincronizado con el index

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [profileNick, setProfileNick] = useState(null)
  const [isReady, setIsReady] = useState(false)
  
  // NUEVO: Sistema de imagen de perfil avanzado
  const [avatarUrl, setAvatarUrl] = useState('')
  const [highlightPreference, setHighlightPreference] = useState('profile')
  const [topCommanderImage, setTopCommanderImage] = useState('')

  const userMenuRef = useRef(null)
  const mobilePanelRef = useRef(null)

  const NAV_ITEMS = [
    { href: '/matches', label: 'Partidas', Icon: Icons.Swords },
    { href: '/events',  label: 'Eventos',  Icon: Icons.CalendarDays },
    { href: '/players', label: 'Jugadores', Icon: Icons.Users },
    { href: '/ranking', label: 'Ranking', Icon: Icons.Trophy },
    { href: '/stats', label: 'Estadísticas', Icon: Icons.BarChart3 },
    { href: '/formats', label: 'Formatos', Icon: Icons.Library },
    { href: '/recursos', label: 'Recursos', Icon: Icons.BookOpen }, // ← AÑADIR ESTA LÍNEA
  ]

  // Función para obtener clases temáticas dinámicas con mejor contraste
  const getThemeClasses = (accent) => {
    const baseClasses = {
      amber: {
        active: 'bg-amber-500/30 text-white border border-amber-400/50 shadow-lg',
        hover: 'hover:text-white hover:bg-amber-500/20',
        accent: 'bg-amber-500 hover:bg-amber-600',
        border: 'border-amber-400/40',
        shadow: 'shadow-amber-500/20',
      },
      blue: {
        active: 'bg-blue-500/30 text-white border border-blue-400/50 shadow-lg',
        hover: 'hover:text-white hover:bg-blue-500/20',
        accent: 'bg-blue-500 hover:bg-blue-600',
        border: 'border-blue-400/40',
        shadow: 'shadow-blue-500/20',
      },
      gray: {
        active: 'bg-gray-500/30 text-white border border-gray-400/50 shadow-lg',
        hover: 'hover:text-white hover:bg-gray-500/20',
        accent: 'bg-gray-600 hover:bg-gray-700',
        border: 'border-gray-400/40',
        shadow: 'shadow-gray-500/20',
      },
      red: {
        active: 'bg-red-500/30 text-white border border-red-400/50 shadow-lg',
        hover: 'hover:text-white hover:bg-red-500/20',
        accent: 'bg-red-500 hover:bg-red-600',
        border: 'border-red-400/40',
        shadow: 'shadow-red-500/20',
      },
      green: {
        active: 'bg-green-500/30 text-white border border-green-400/50 shadow-lg',
        hover: 'hover:text-white hover:bg-green-500/20',
        accent: 'bg-green-500 hover:bg-green-600',
        border: 'border-green-400/40',
        shadow: 'shadow-green-500/20',
      },
      purple: {
        active: 'bg-purple-500/30 text-white border border-purple-400/50 shadow-lg',
        hover: 'hover:text-white hover:bg-purple-500/20',
        accent: 'bg-purple-500 hover:bg-purple-600',
        border: 'border-purple-400/40',
        shadow: 'shadow-purple-500/20',
      },
    }
    return baseClasses[accent] || baseClasses.blue
  }

  const themeClasses = getThemeClasses(theme.navAccent)

  // Fix para router.isReady
  useEffect(() => {
    if (router.isReady) {
      setIsReady(true)
    }
  }, [router.isReady])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (mounted) setUser(data.user || null)
      } catch (error) {
        console.error('Error getting user:', error)
        if (mounted) setUser(null)
      }
    })()
    
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (mounted) setUser(session?.user || null)
    })
    
    return () => {
      mounted = false
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  useEffect(() => {
    let ignore = false
    const loadProfile = async () => {
      if (!user?.id) { 
        setProfileNick(null)
        setAvatarUrl('')
        setHighlightPreference('profile')
        setTopCommanderImage('')
        return 
      }
      
      try {
        // Cargar perfil completo con preferencias de imagen
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('nickname, avatar_url, highlight_image_preference')
          .eq('id', user.id)
          .single()
        
        if (ignore) return
        
        if (!error && profile) {
          setProfileNick(profile.nickname || null)
          setAvatarUrl(profile.avatar_url || '')
          setHighlightPreference(profile.highlight_image_preference || 'profile')
        } else {
          console.log('No profile found or error:', error)
          setProfileNick(null)
          setAvatarUrl('')
          setHighlightPreference('profile')
        }

        // Cargar comandante más usado si la preferencia es 'commander'
        if (profile?.highlight_image_preference === 'commander') {
          const { data: topCmd, error: cmdErr } = await supabase
            .from('commander_stats_by_user')
            .select('last_image_url')
            .eq('user_id', user.id)
            .order('games_played', { ascending: false })
            .limit(1)
            .maybeSingle()
          
          if (!ignore && !cmdErr && topCmd?.last_image_url) {
            setTopCommanderImage(topCmd.last_image_url)
          }
        }
        
      } catch (error) {
        console.error('Error loading profile:', error)
        if (!ignore) {
          setProfileNick(null)
          setAvatarUrl('')
          setHighlightPreference('profile')
          setTopCommanderImage('')
        }
      }
    }
    loadProfile()
    return () => { ignore = true }
  }, [user?.id])

  useEffect(() => {
    const onDown = (e) => {
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [userMenuOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [mobileOpen])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setMobileOpen(false); setUserMenuOpen(false) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const onDown = (e) => {
      if (!mobileOpen) return
      const panel = mobilePanelRef.current
      if (panel && !panel.contains(e.target)) setMobileOpen(false)
    }
    if (mobileOpen) document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [mobileOpen])

  useEffect(() => {
    const handleRoute = () => { setMobileOpen(false); setUserMenuOpen(false) }
    router.events.on('routeChangeStart', handleRoute)
    return () => router.events.off('routeChangeStart', handleRoute)
  }, [router.events])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) console.error('Error al cerrar sesión:', error.message)
    } catch (err) {
      console.error('Error inesperado al cerrar sesión:', err)
    } finally {
      setUser(null)
      setProfileNick(null)
      setMobileOpen(false)
      setUserMenuOpen(false)
      router.push('/')
    }
  }

  const isActive = (href) => {
    if (!isReady) return false
    
    const currentPath = router.pathname
    const currentQuery = router.asPath
    
    if (currentQuery === href) return true
    
    if (href === '/players') {
      return currentPath === '/players' || currentPath === '/players/[id]'
    }
    
    return currentQuery.startsWith(`${href}/`)
  }

  const displayName = profileNick || user?.user_metadata?.nickname || user?.email || 'Usuario'
  const initial = (displayName || 'U').slice(0, 1).toUpperCase()

  // Función para upgrade de URLs de Scryfall (igual que en el perfil)
  const upgradeScryfall = (url) => {
    if (!url) return url
    try {
      const u = new URL(url)
      if ((u.hostname === 'cards.scryfall.io' || u.hostname === 'img.scryfall.com') && u.pathname.includes('/small/')) {
        u.pathname = u.pathname.replace('/small/', '/normal/')
        return u.toString()
      }
    } catch {}
    return url
  }

  // Lógica de imagen destacada (igual que en el perfil)
  const commanderImage = useMemo(
    () => upgradeScryfall(topCommanderImage || ''),
    [topCommanderImage]
  )

  const highlightImage = useMemo(() => {
    const pref = (highlightPreference || 'profile').toLowerCase()
    const avatar = avatarUrl || ''
    if (pref === 'commander') {
      return commanderImage || avatar || ''
    }
    // 'profile' por defecto
    return avatar || commanderImage || ''
  }, [avatarUrl, highlightPreference, commanderImage])

  const handleProfileClick = (e) => {
    e.preventDefault()
    setUserMenuOpen(false)
    setMobileOpen(false)
    router.push('/players/me?tab=stats')
  }

  return (
    <>
      {/* NAVBAR PRINCIPAL - Z-INDEX ALTO Y MEJOR CONTRASTE */}
      <header
        className={[
          'fixed inset-x-0 top-0 z-[100] h-16',
          'bg-gradient-to-br',  // ← aplica el gradiente como clase tailwind
          theme.navbarGradient, // ← from-... to-...
          'backdrop-blur-md border-b transition-all duration-500',
          scrolled 
            ? `${themeClasses.border} shadow-lg ${themeClasses.shadow}` 
            : 'border-white/20',
        ].join(' ')}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-full items-center justify-between">
            
            {/* LOGO MAGIC PARTY CON MEJOR CONTRASTE */}
            <Link
              href="/"
              className="flex items-center gap-3 text-white font-bold text-lg transition-all duration-300 hover:scale-105"
            >
              <div 
                className={`w-9 h-9 rounded-lg ${theme.gradient} flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl`}
                style={{ boxShadow: `0 4px 14px 0 ${theme.colors.glowColor}` }}
              >
                <Icons.Sparkles size={20} className="text-white" />
              </div>
              <span className="hidden sm:block drop-shadow-sm">Magic Party</span>
            </Link>

            {/* NAVEGACIÓN DESKTOP CON MEJOR CONTRASTE */}
            <nav className="hidden lg:flex items-center space-x-1">
              {NAV_ITEMS.map(({ href, label, Icon }) => {
                const active = isActive(href)
                return (
                  <NavLink
                    key={href}
                    href={href}
                    className={[
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                      active
                        ? themeClasses.active
                        : `text-white/90 ${themeClasses.hover}`,
                    ].join(' ')}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </NavLink>
                )
              })}
            </nav>

            {/* ACCIONES DERECHA CON MEJOR CONTRASTE */}
            <div className="flex items-center gap-3">
              {/* USUARIO DESKTOP */}
              {user ? (
                <div className="hidden lg:block relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 border backdrop-blur-sm text-white hover:bg-white/20 border-white/30"
                  >
                    {highlightImage ? (
                      <div className="w-6 h-6 rounded-full overflow-hidden shadow-sm ring-2 ring-white/30">
                        <img
                          src={highlightImage}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`w-6 h-6 rounded ${theme.gradient} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                        {initial}
                      </div>
                    )}
                    <span className="text-sm max-w-[120px] truncate">{displayName}</span>
                    <Icons.ChevronDown size={14} className="opacity-70" />
                  </button>

                  {/* DROPDOWN USUARIO DESKTOP CON MEJOR Z-INDEX */}
                    {userMenuOpen && (
                    <div 
                      className={[
                        'absolute right-0 mt-2 w-64',
                        'backdrop-blur-xl rounded-lg shadow-2xl py-2 z-[110]',
                        'border border-white/30',
                        'bg-gradient-to-br',
                        theme.navbarGradient, // ← gradiente como clase
                      ].join(' ')}
                    >
                      <div className="px-4 py-3 border-b border-white/30">
                        <p className="text-sm font-medium text-white">{displayName}</p>
                        <p className="text-xs text-white/80">{user?.email}</p>
                      </div>
                      
                      <button
                        onClick={handleProfileClick}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white/90 hover:bg-white/20 transition-colors"
                      >
                        <Icons.User size={16} />
                        Mi Perfil
                      </button>
                      
                      <div className="border-t border-white/30 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-300 hover:bg-red-500/30 transition-colors"
                        >
                          <Icons.LogOut size={16} />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-3">
                  <NavLink
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
                  >
                    Iniciar Sesión
                  </NavLink>
                  <NavLink
                    href="/signup"
                    className={`px-4 py-2 ${themeClasses.accent} text-white text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 shadow-lg`}
                  >
                    Registrarse
                  </NavLink>
                </div>
              )}

              {/* BOTÓN MENÚ MÓVIL */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-300"
              >
                <Icons.Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MENÚ MÓVIL CON Z-INDEX ALTO */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          
          {/* Panel Temático */}
          <div
            ref={mobilePanelRef}
            className={[
              'absolute right-0 top-0 h-full w-80 max-w-[85vw]',
              'shadow-2xl border-l border-white/30 backdrop-blur-xl z-[110]',
              'bg-gradient-to-br',
              theme.navbarGradient, // ← gradiente como clase
            ].join(' ')}
          >
            {/* Header Temático */}
            <div className="flex items-center justify-between p-4 border-b border-white/30 bg-black/20">
              <div className="flex items-center gap-2">
                <div 
                  className={`w-8 h-8 rounded-lg ${theme.gradient} flex items-center justify-center shadow-lg`}
                >
                  <Icons.Sparkles size={16} className="text-white" />
                </div>
                <span className="text-white font-bold drop-shadow-sm">Magic Party</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-white/90 hover:text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <Icons.X size={18} />
              </button>
            </div>

            <div className="flex flex-col h-full">
              {/* Navegación Principal Temática */}
              <nav className="flex-1 p-4">
                <div className="space-y-2">
                  {NAV_ITEMS.map(({ href, label, Icon }) => {
                    const active = isActive(href)
                    return (
                      <NavLink
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={[
                          'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 w-full',
                          active
                            ? themeClasses.active
                            : 'text-white/90 hover:text-white hover:bg-white/20',
                        ].join(' ')}
                      >
                        <Icon size={18} />
                        <span>{label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              </nav>

              {/* Sección Usuario en Móvil Mejorada */}
              <div className="border-t border-white/30 p-4 bg-black/20">
                {user ? (
                  <div className="space-y-3">
                    {/* Info Usuario Temática */}
                    <div className="flex items-center gap-3 p-3 bg-white/20 rounded-lg backdrop-blur-sm border border-white/20">
                      {highlightImage ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg ring-2 ring-white/30">
                          <img
                            src={highlightImage}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-lg ${theme.gradient} flex items-center justify-center text-sm font-bold text-white shadow-lg`}>
                          {initial}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{displayName}</p>
                        <p className="text-xs text-white/80 truncate">{user?.email}</p>
                      </div>
                    </div>

                    {/* Acciones Usuario Simplificadas */}
                    <div className="space-y-2">
                      <button
                        onClick={handleProfileClick}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Icons.User size={18} />
                        Mi Perfil
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-300 hover:bg-red-500/30 rounded-lg transition-colors"
                      >
                        <Icons.LogOut size={18} />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <NavLink
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full px-4 py-3 text-center text-sm font-medium text-white/90 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm border border-white/20"
                    >
                      Iniciar Sesión
                    </NavLink>
                    <NavLink
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className={`block w-full px-4 py-3 text-center text-sm font-medium ${themeClasses.accent} text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-lg`}
                    >
                      Registrarse
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}