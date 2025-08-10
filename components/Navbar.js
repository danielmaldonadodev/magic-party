'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import NavLink from './NavLink'

export default function Navbar() {
  const router = useRouter()

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [profileNick, setProfileNick] = useState(null)
  const [isReady, setIsReady] = useState(false)

  const userMenuRef = useRef(null)
  const mobilePanelRef = useRef(null)

  const NAV_ITEMS = [
    { href: '/matches', label: 'Partidas', Icon: Icons.Layers3 },
    { href: '/players', label: 'Jugadores', Icon: Icons.Users2 },
    { href: '/ranking', label: 'Ranking', Icon: Icons.Award },
    { href: '/stats', label: 'Estadísticas', Icon: Icons.TrendingUp },
    { href: '/formats', label: 'Formatos', Icon: Icons.Sparkles },
  ]

  // Fix para router.isReady
  useEffect(() => {
    if (router.isReady) {
      setIsReady(true)
    }
  }, [router.isReady])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
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
    const loadNick = async () => {
      if (!user?.id) { 
        setProfileNick(null)
        return 
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', user.id)
          .single()
        
        if (ignore) return
        
        if (!error && data) {
          setProfileNick(data.nickname || null)
        } else {
          console.log('No profile found or error:', error)
          setProfileNick(null)
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        if (!ignore) setProfileNick(null)
      }
    }
    loadNick()
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

  const handleProfileClick = (e) => {
    e.preventDefault()
    setUserMenuOpen(false)
    router.push('/players/me?tab=stats')
  }

  const handleEditProfileClick = (e) => {
    e.preventDefault()
    setUserMenuOpen(false)
    router.push('/players/me?tab=edit')
  }

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-[70] h-[72px] border-b',
          'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl',
          'supports-[backdrop-filter]:bg-white/90 dark:supports-[backdrop-filter]:bg-gray-950/90',
          'transition-all duration-300 ease-out',
          scrolled 
            ? 'shadow-lg border-gray-200 dark:border-gray-800' 
            : 'shadow-sm border-gray-200/70 dark:border-gray-800/70',
        ].join(' ')}
        role="banner"
      >
        <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-full items-center justify-between">
            
            {/* Logo profesional */}
            <Link
              href="/"
              className="group relative flex items-center gap-3 text-xl font-medium tracking-tight text-gray-900 dark:text-white transition-colors duration-200 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <span className="relative inline-grid place-items-center w-10 h-10 rounded-lg bg-gray-900 dark:bg-white shadow-md transition-all duration-200 group-hover:shadow-lg group-hover:scale-105">
                <Icons.Sparkles size={18} className="text-white dark:text-gray-900" aria-hidden="true" />
              </span>
              <span className="relative">
                <span className="font-normal text-gray-700 dark:text-gray-300">Magic</span>
                <span className="font-semibold ml-1 text-gray-900 dark:text-white">Party</span>
              </span>
            </Link>

            {/* Navegación desktop profesional */}
            <nav
              className="hidden lg:flex items-center gap-1 px-8"
              aria-label="Principal"
            >
              {NAV_ITEMS.map(({ href, label, Icon }) => {
                const active = isActive(href)
                return (
                  <NavLink
                    key={href}
                    href={href}
                    variant="default"
                    className={[
                      'relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
                      'text-sm font-medium',
                      active
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
                    ].join(' ')}
                  >
                    <Icon size={16} className={active ? 'text-white' : 'text-gray-500'} aria-hidden="true" />
                    <span>{label}</span>
                  </NavLink>
                )
              })}
            </nav>

            {/* Área de usuario profesional */}
            <div className="flex items-center gap-3">
              {!user ? (
                <div className="hidden lg:flex items-center gap-3">
                  <NavLink
                    href="/login"
                    variant="default"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Iniciar Sesión
                  </NavLink>
                  <NavLink
                    href="/signup"
                    variant="default"
                    className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium shadow-md transition-all duration-200 hover:bg-gray-800 hover:shadow-lg"
                  >
                    Registrarse
                  </NavLink>
                </div>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500/20"
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                  >
                    <div className="relative w-8 h-8 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 grid place-items-center text-sm font-semibold shadow-sm">
                      {initial}
                    </div>
                    <span className="hidden xl:inline text-sm font-medium text-gray-900 dark:text-white max-w-[20ch] truncate">
                      {displayName}
                    </span>
                    <Icons.ChevronDown 
                      size={14} 
                      className={[
                        'text-gray-500 dark:text-gray-400 transition-transform duration-200',
                        userMenuOpen ? 'rotate-180' : ''
                      ].join(' ')} 
                      aria-hidden="true" 
                    />
                  </button>

                  {/* Menú de usuario profesional */}
                  {userMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-lg shadow-xl ring-1 ring-gray-200 dark:ring-gray-700 p-2 z-[80] animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      <div className="px-4 py-3 mb-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 font-medium">
                          Mi Cuenta
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
                          {user?.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleProfileClick}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors duration-150 group"
                        >
                          <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 grid place-items-center transition-colors duration-150 group-hover:bg-gray-200 dark:group-hover:bg-gray-700">
                            <Icons.User size={16} className="text-gray-600 dark:text-gray-400" />
                          </span>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Mi Perfil</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Ver estadísticas y rendimiento</p>
                          </div>
                        </button>

                        <button
                          onClick={handleEditProfileClick}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors duration-150 group"
                        >
                          <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 grid place-items-center transition-colors duration-150 group-hover:bg-gray-200 dark:group-hover:bg-gray-700">
                            <Icons.Settings size={16} className="text-gray-600 dark:text-gray-400" />
                          </span>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Configuración</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Administrar mi cuenta</p>
                          </div>
                        </button>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-left transition-colors duration-150 group"
                        >
                          <span className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 grid place-items-center transition-colors duration-150 group-hover:bg-red-100 dark:group-hover:bg-red-900/30">
                            <Icons.LogOut size={16} className="text-red-600 dark:text-red-400" />
                          </span>
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            Cerrar sesión
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Botón móvil profesional */}
              <button
                type="button"
                className="lg:hidden p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileOpen(true)}
              >
                <Icons.Menu size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Panel móvil profesional */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100]">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setMobileOpen(false)}
          />
          <aside
            ref={mobilePanelRef}
            className="absolute right-0 top-0 h-full w-[320px] max-w-[85vw] bg-white dark:bg-gray-900 shadow-xl flex flex-col animate-in slide-in-from-right duration-200"
          >
            {/* Header del panel móvil */}
            <div className="h-[72px] flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-gray-900 dark:bg-white shadow-sm">
                  <Icons.Sparkles size={16} className="text-white dark:text-gray-900" />
                </span>
                <span className="text-lg font-medium">
                  <span className="font-normal text-gray-700 dark:text-gray-300">Magic</span>
                  <span className="font-semibold ml-1 text-gray-900 dark:text-white">Party</span>
                </span>
              </div>
              <button 
                className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileOpen(false)}
              >
                <Icons.X size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Navegación móvil */}
            <nav className="flex-1 overflow-y-auto px-4 py-6">
              <div className="space-y-1">
                {NAV_ITEMS.map(({ href, label, Icon }) => {
                  const active = isActive(href)
                  return (
                    <NavLink
                      key={href}
                      href={href}
                      variant="ghost"
                      className={[
                        'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150',
                        active 
                          ? 'bg-gray-900 text-white shadow-sm' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                      ].join(' ')}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon size={16} className={active ? 'text-white' : 'text-gray-500'} />
                      <span>{label}</span>
                    </NavLink>
                  )
                })}
              </div>

              {/* Área de usuario móvil */}
              {!user ? (
                <div className="mt-8 space-y-3 border-t border-gray-200 dark:border-gray-800 pt-6">
                  <NavLink
                    href="/login"
                    variant="ghost"
                    className="block px-4 py-3 rounded-lg text-center text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMobileOpen(false)}
                  >
                    Iniciar Sesión
                  </NavLink>
                  <NavLink
                    href="/signup"
                    variant="ghost"
                    className="block px-4 py-3 rounded-lg bg-gray-900 text-white text-center text-sm font-medium shadow-md"
                    onClick={() => setMobileOpen(false)}
                  >
                    Registrarse
                  </NavLink>
                </div>
              ) : (
                <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-6">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 grid place-items-center text-sm font-semibold shadow-sm">
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <button
                      onClick={(e) => {
                        handleProfileClick(e)
                        setMobileOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                    >
                      <Icons.User size={16} className="text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium">Mi Perfil</span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        handleEditProfileClick(e)
                        setMobileOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                    >
                      <Icons.Settings size={16} className="text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium">Configuración</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-left transition-colors mt-3"
                    >
                      <Icons.LogOut size={16} className="text-red-600 dark:text-red-400" />
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        Cerrar sesión
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}