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

  const userMenuRef = useRef(null)
  const mobilePanelRef = useRef(null)

  const NAV_ITEMS = [
    { href: '/matches', label: 'Partidas', Icon: Icons.BookOpen },
    { href: '/players', label: 'Jugadores', Icon: Icons.Users },
    { href: '/ranking', label: 'Ranking', Icon: Icons.Trophy },
    { href: '/stats', label: 'Estadísticas', Icon: Icons.BarChart2 },
    { href: '/formats', label: 'Formatos', Icon: Icons.Dice1 },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  useEffect(() => {
    let ignore = false
    const loadNick = async () => {
      if (!user?.id) { setProfileNick(null); return }
      const { data, error } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .single()
      if (ignore) return
      if (!error) setProfileNick(data?.nickname || null)
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

  const displayName = profileNick || user?.user_metadata?.nickname || user?.email || 'Usuario'
  const initial = (displayName || 'U').slice(0, 1).toUpperCase()

  const isActive = (href) => router.asPath === href || router.asPath.startsWith(`${href}/`)

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 h-16 border-b border-transparent',
        'bg-white/65 backdrop-blur-xl supports-[backdrop-filter]:bg-white/55',
        'transition-all duration-200',
        scrolled ? 'shadow-[0_6px_24px_-8px_rgba(0,0,0,0.18)] border-gray-200/70' : 'shadow-none',
      ].join(' ')}
      role="banner"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-7xl mx-auto h-full px-3 sm:px-4 lg:px-6">
        <div className="flex h-full items-center justify-between gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-lg sm:text-xl font-semibold text-primary"
          >
            <span className="inline-grid place-items-center w-8 h-8 rounded-xl bg-primary/10 ring-1 ring-primary/15 transition-transform group-hover:scale-[1.02]">
              <Icons.Sparkles size={18} className="opacity-90" aria-hidden="true" />
            </span>
            <span className="whitespace-nowrap">Magic Party</span>
          </Link>

          {/* NAV adaptado */}
          <nav
            className="hidden md:flex flex-wrap items-center gap-x-1 gap-y-2 max-w-[60vw] lg:max-w-[70vw] xl:max-w-none"
            aria-label="Principal"
          >
            {NAV_ITEMS.map(({ href, label, Icon }) => (
              <NavLink
                key={href}
                href={href}
                variant="default"
                className={[
                  'relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition',
                  isActive(href)
                    ? 'bg-gray-900 text-white shadow-sm ring-1 ring-black/10'
                    : 'text-gray-800 hover:bg-gray-100/80 ring-1 ring-transparent hover:ring-gray-200',
                ].join(' ')}
              >
                <Icon size={18} aria-hidden="true" />
                <span className="hidden sm:inline text-sm lg:text-[15px] font-medium">{label}</span>
                {isActive(href) && (
                  <span className="absolute -bottom-[7px] left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-primary/90" />
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              {!user ? (
                <>
                  <NavLink
                    href="/login"
                    variant="default"
                    className="px-3 py-1.5 rounded-lg ring-1 ring-gray-200 hover:bg-gray-50"
                  >
                    Iniciar Sesión
                  </NavLink>
                  <NavLink
                    href="/signup"
                    variant="default"
                    className="px-3 py-1.5 rounded-lg bg-primary text-white ring-1 ring-black/10 hover:brightness-[1.02]"
                  >
                    Registrarse
                  </NavLink>
                </>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="group flex items-center gap-2 focus:outline-none"
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-white grid place-items-center text-sm font-semibold ring-1 ring-black/10 group-hover:brightness-105 transition">
                      {initial}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium max-w-[22ch] truncate">{displayName}</span>
                    <Icons.ChevronDown size={16} className="opacity-80 group-hover:opacity-100 transition" aria-hidden="true" />
                  </button>

                  {userMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl ring-1 ring-black/10 p-2 z-50"
                    >
                      <div className="px-2.5 py-2.5 mb-1 rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Conectado como</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                      </div>

                      <Link
                        href="/players/me"
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Icons.User size={16} aria-hidden="true" />
                        <span>Mi perfil</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-red-50 text-red-700"
                      >
                        <Icons.LogOut size={16} aria-hidden="true" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              className="md:hidden p-2 rounded-lg ring-1 ring-transparent hover:ring-gray-200"
              onClick={() => setMobileOpen(true)}
            >
              <Icons.Menu size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer móvil se queda igual */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <aside
            ref={mobilePanelRef}
            className="absolute right-0 top-0 h-full w-80 max-w-[88vw] bg-white shadow-2xl ring-1 ring-black/10 border-l border-gray-100 flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200/70">
              <div className="inline-flex items-center gap-2">
                <span className="inline-grid place-items-center w-8 h-8 rounded-xl bg-primary/10 ring-1 ring-primary/15">
                  <Icons.Sparkles size={18} className="opacity-90" />
                </span>
                <span className="font-semibold">Magic Party</span>
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
                <Icons.X size={22} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-3">
              {NAV_ITEMS.map(({ href, label, Icon }) => {
                const active = isActive(href)
                return (
                  <NavLink
                    key={href}
                    href={href}
                    variant="ghost"
                    className={[
                      'flex items-center gap-3 px-2.5 py-2.5 text-base rounded-lg',
                      active ? 'bg-gray-900 text-white shadow-sm ring-1 ring-black/10' : 'hover:bg-gray-50',
                    ].join(' ')}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{label}</span>
                  </NavLink>
                )
              })}

              {!user ? (
                <div className="mt-3 space-y-1">
                  <NavLink
                    href="/login"
                    variant="ghost"
                    className="px-2.5 py-2.5 rounded-lg ring-1 ring-gray-200 hover:bg-gray-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    Iniciar Sesión
                  </NavLink>
                  <NavLink
                    href="/signup"
                    variant="ghost"
                    className="px-2.5 py-2.5 rounded-lg bg-primary text-white ring-1 ring-black/10"
                    onClick={() => setMobileOpen(false)}
                  >
                    Registrarse
                  </NavLink>
                </div>
              ) : (
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-gray-50 ring-1 ring-gray-200/60 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-white grid place-items-center text-sm font-semibold ring-1 ring-black/10">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{displayName}</p>
                      <p className="text-[11px] text-gray-600">Conectado</p>
                    </div>
                  </div>
                  <NavLink
                    href="/players/me"
                    variant="ghost"
                    className="px-2.5 py-2.5 rounded-lg hover:bg-gray-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    Mi perfil
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="mt-1 w-full text-left px-2.5 py-2.5 rounded-lg hover:bg-red-50 text-red-700"
                  >
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
