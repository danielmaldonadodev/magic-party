'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import NavLink from './NavLink'

/**
 * Navbar: más limpio, accesible y realmente responsive
 * - Barra superior fija con blur y sombra al hacer scroll
 * - Navegación de escritorio con fila desplazable (overflow-x-auto) para pantallas pequeñas de PC
 * - En pantallas "semi-pequeñas" (md→lg) los links no se rompen gracias a whitespace-nowrap
 * - Menú móvil en panel lateral (drawer) con fondo semitransparente y cierre por ESC y clic fuera
 * - Dropdown de usuario con click-outside y accesibilidad ARIA
 * - Cierre de menús al navegar
 */
export default function Navbar() {
  const router = useRouter()

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState(null)

  const userMenuRef = useRef(null)
  const mobilePanelRef = useRef(null)

  const NAV_ITEMS = [
    { href: '/matches', label: 'Partidas', Icon: Icons.BookOpen },
    { href: '/players', label: 'Jugadores', Icon: Icons.Users },
    { href: '/ranking', label: 'Ranking', Icon: Icons.Trophy },
    { href: '/stats', label: 'Estadísticas', Icon: Icons.BarChart2 },
    { href: '/formats', label: 'Formatos', Icon: Icons.Dice1 },
  ]

  // 1) Sombra al hacer scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 2) Autenticación: obtener usuario y escuchar cambios
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (mounted) setUser(data.user || null)
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user || null)
    })

    return () => {
      mounted = false
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  // 3) Cerrar dropdown de usuario al hacer clic fuera
  useEffect(() => {
    const onDown = (e) => {
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [userMenuOpen])

  // 4) Bloquear scroll cuando el drawer móvil está abierto
  useEffect(() => {
    if (!mobileOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [mobileOpen])

  // 5) Cerrar menús al pulsar ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // 6) Cerrar drawer si se hace clic fuera del panel
  useEffect(() => {
    const onDown = (e) => {
      if (!mobileOpen) return
      const panel = mobilePanelRef.current
      if (panel && !panel.contains(e.target)) setMobileOpen(false)
    }
    if (mobileOpen) document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [mobileOpen])

  // 7) Cerrar menús al cambiar de ruta
  useEffect(() => {
    const handleRoute = () => {
      setMobileOpen(false)
      setUserMenuOpen(false)
    }
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
      setMobileOpen(false)
      setUserMenuOpen(false)
      router.push('/')
    }
  }

  const initial = (user?.user_metadata?.nickname || user?.email || 'U').slice(0, 1).toUpperCase()
  const username = user?.user_metadata?.nickname || user?.email

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 h-16 border-b border-gray-200/60',
        'bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60',
        'transition-shadow',
        scrolled ? 'shadow-md' : '',
      ].join(' ')}
      role="banner"
    >
      <div className="max-w-7xl mx-auto h-full px-3 sm:px-4 lg:px-6">
        <div className="flex h-full items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="text-lg sm:text-xl font-semibold text-primary whitespace-nowrap">
            Magic Party
          </Link>

          {/* Navegación escritorio: fila desplazable para pantallas pequeñas de PC */}
          <nav
            className="hidden md:flex items-center gap-2 lg:gap-4 max-w-[60vw] lg:max-w-[70vw] xl:max-w-none overflow-x-auto scrollbar-thin whitespace-nowrap"
            aria-label="Principal"
          >
            {NAV_ITEMS.map(({ href, label, Icon }) => (
              <NavLink key={href} href={href} variant="default" className="flex items-center gap-2 px-2 sm:px-3 py-1.5">
                <Icon size={18} aria-hidden="true" />
                <span className="text-sm lg:text-base">{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Área usuario + botón móvil */}
          <div className="flex items-center gap-2">
            {/* Desktop: auth */}
            <div className="hidden md:flex items-center gap-2">
              {!user ? (
                <>
                  <NavLink href="/login" variant="default">Iniciar Sesión</NavLink>
                  <NavLink href="/signup" variant="default">Registrarse</NavLink>
                </>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 focus:outline-none"
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                    aria-label="Abrir menú de usuario"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-white grid place-items-center text-sm font-semibold">
                      {initial}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium max-w-[22ch] truncate">{username}</span>
                    <Icons.ChevronDown size={16} aria-hidden="true" />
                  </button>

                  {userMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg border border-gray-200/70 py-1 z-50"
                    >
                      <Link href="/profile" className="block px-3 py-2 text-sm hover:bg-gray-50" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                        Perfil
                      </Link>
                      <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50" role="menuitem">
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botón menú móvil */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md border border-transparent hover:border-gray-200 focus:outline-none"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={mobileOpen}
              aria-controls="mobile-drawer"
            >
              <Icons.Menu size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60]" aria-modal="true" role="dialog">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Panel */}
          <aside
            id="mobile-drawer"
            ref={mobilePanelRef}
            className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-xl border-l border-gray-200 flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              <span className="font-semibold">Menú</span>
              <button className="p-2" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú">
                <Icons.X size={22} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Móvil">
              {NAV_ITEMS.map(({ href, label, Icon }) => (
                <NavLink
                  key={href}
                  href={href}
                  variant="ghost"
                  className="flex items-center gap-3 px-2 py-2 text-base rounded-md"
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              ))}

              {!user ? (
                <div className="mt-2 space-y-1">
                  <NavLink href="/login" variant="ghost" className="px-2 py-2" onClick={() => setMobileOpen(false)}>
                    Iniciar Sesión
                  </NavLink>
                  <NavLink href="/signup" variant="ghost" className="px-2 py-2" onClick={() => setMobileOpen(false)}>
                    Registrarse
                  </NavLink>
                </div>
              ) : (
                <div className="mt-2 border-t border-gray-200 pt-2">
                  <NavLink href="/profile" variant="ghost" className="px-2 py-2" onClick={() => setMobileOpen(false)}>
                    Perfil
                  </NavLink>
                  <button onClick={handleLogout} className="w-full text-left px-2 py-2 rounded-md hover:bg-gray-50">
                    Cerrar sesión
                  </button>
                </div>
              )}
            </nav>
          </aside>
        </div>
      )}
    </header>
  )
}
