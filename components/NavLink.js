// components/NavLink.js
'use client'

import Link from 'next/link'
import { useRouter } from 'next/router'
import { forwardRef, useMemo } from 'react'

/**
 * Props:
 * - href: string (ruta interna o externa)
 * - exact?: boolean (por defecto false) -> si true, activa solo cuando pathname === href
 * - variant?: 'default' | 'subtle' | 'ghost' (clases predefinidas)
 * - isExternal?: boolean (para enlaces externos)
 * - className?: string (clases adicionales)
 * - onClick?: () => void
 */
const NavLink = forwardRef(function NavLink(
  {
    href,
    exact = false,
    variant = 'default',
    isExternal = false,
    className = '',
    children,
    ...props
  },
  ref
) {
  const { asPath } = useRouter()

  // Normaliza pathname (sin query ni hash)
  const cleanPath = useMemo(() => asPath.split('#')[0].split('?')[0], [asPath])

  // Normaliza href para comparación (quita trailing slash excepto raíz)
  const normalize = (p) => {
    if (!p) return '/'
    if (p !== '/' && p.endsWith('/')) return p.slice(0, -1)
    return p
  }

  const current = normalize(cleanPath)
  const target = normalize(typeof href === 'string' ? href : href?.pathname || '')

  // Lógica de activo:
  // - exact: activo solo si ===
  // - por defecto: activo si current === target o si current empieza por target + '/'
  const isActive = exact
    ? current === target
    : current === target || (target !== '/' && current.startsWith(target + '/'))

  // Variantes de estilo reutilizables
  const variants = {
    default:
      'text-sm text-gray-700 hover:text-primary rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary px-1',
    subtle:
      'text-sm text-gray-600 hover:text-gray-900 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary px-1',
    ghost:
      'text-sm text-gray-700 hover:text-primary rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  }

  const activeClasses = 'text-primary font-medium'

  const classes = [
    variants[variant] ?? variants.default,
    isActive ? activeClasses : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (isExternal) {
    return (
      <a
        href={typeof href === 'string' ? href : '#'}
        ref={ref}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    )
  }

  return (
    <Link
      ref={ref}
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={classes}
      {...props}
    >
      {children}
    </Link>
  )
})

export default NavLink
