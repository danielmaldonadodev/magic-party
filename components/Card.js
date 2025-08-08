import React, { forwardRef } from 'react'
import clsx from 'clsx'

const paddings = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-6',
}

function toneToBg(tone) {
  if (tone === 'soft') return 'bg-gray-50/40'
  return 'bg-white'
}

const Card = forwardRef(function Card(
  {
    as: Tag = 'div',
    className,
    interactive = false,
    padding = 'md',
    tone = 'default',
    children,
    ...props
  },
  ref
) {
  return (
    <Tag
      ref={ref}
      className={clsx(
        'card rounded-2xl border border-gray-200 shadow-sm',
        toneToBg(tone),
        paddings[padding] || paddings.md,
        interactive && [
          'transition',
          'hover:shadow-md',
          'focus:outline-none',
          'focus-visible:ring-2',
          'focus-visible:ring-primary/50',
        ],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
})

Card.Header = function CardHeader({ className, title, subtitle, children }) {
  return (
    <header className={clsx('border-b px-5 py-4', className)}>
      {title && (
        <h2 className="title-text text-base text-gray-900">{title}</h2>
      )}
      {subtitle && (
        <p className="text-sm opacity-70 mt-0.5">{subtitle}</p>
      )}
      {children}
    </header>
  )
}

Card.Section = function CardSection({ className, children, withDivider = false, padding = 'md' }) {
  return (
    <div
      className={clsx(
        withDivider && 'border-t',
        padding === 'sm' ? 'px-4 py-3' :
        padding === 'lg' ? 'px-6 py-6' :
        'px-5 py-4',
        className
      )}
    >
      {children}
    </div>
  )
}

Card.Footer = function CardFooter({ className, children }) {
  return (
    <footer className={clsx('border-t bg-white/60 px-5 py-4', className)}>
      {children}
    </footer>
  )
}

/** Contenedor de media (imágenes) con proporción y fondo coherente */
Card.Media = function CardMedia({
  className,
  aspect = 'aspect-[4/3]',
  object = 'object-cover',
  children,
}) {
  return (
    <div
      className={clsx(
        'relative w-full overflow-hidden bg-gray-50',
        aspect,
        className
      )}
      style={object === 'top' ? { objectPosition: 'top' } : undefined}
    >
      {children}
    </div>
  )
}

export default Card
