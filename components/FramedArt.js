// SOLUCION: FramedArt corregido para evitar el error de Image
import NextImage from 'next/image' // CAMBIO: Renombré la importación
import { useState } from 'react'

const BLUR_1PX =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSIjZWVlZWVlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4='

export default function FramedArt({
  src,
  alt,
  isCard = true,
  widthClass = 'w-[224px] md:w-[248px]',
  glow = 'rgba(99,102,241,.38)',
  badge,
  radius = '1.25rem',
  priority = false,
  sizes = '240px',
  fit = 'cover',
  onLoad,
  onError,
  onClick,
  className = '',
}) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  
  const ratioClass = isCard ? 'aspect-[63/88]' : 'aspect-square'
  
  // MEJORA: Validación más estricta de la URL
  const isValidImageSrc = src && typeof src === 'string' && src.trim().length > 0
  const show = isValidImageSrc && !error

  const handleLoad = (e) => {
    setLoaded(true)
    if (onLoad) {
      onLoad(e)
    }
  }

  const handleError = (e) => {
    console.warn('Error loading image:', src)
    setError(true)
    if (onError) {
      onError(e)
    }
  }

  const handleClick = (e) => {
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <div 
      className={`group ${ratioClass} ${widthClass} relative [perspective:1200px] ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
    >
      {/* Resplandor exterior */}
      <div
        className="absolute -inset-3 rounded-[1.6rem] opacity-0 group-hover:opacity-60 blur-2xl transition-opacity duration-500"
        style={{ background: `radial-gradient(60% 60% at 50% 40%, ${glow}, transparent)` }}
      />

      {/* Borde conic con máscara */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl">
        <div
          className="absolute inset-0 rounded-2xl p-[2.5px]"
          style={{
            background:
              'conic-gradient(from 210deg, #ffffffcc, #a78bfaaa, #60a5faaa, #ffffff66)',
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            borderRadius: radius,
          }}
        >
          <div className="absolute inset-0 rounded-2xl" />
        </div>
      </div>

      {/* Tarjeta + cristal */}
      <div
        className={`relative w-full h-full rounded-2xl overflow-hidden border border-white/20 bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-[0_12px_30px_rgba(0,0,0,.25)] will-change-transform transition-transform duration-500 group-hover:rotate-[.6deg] group-hover:scale-[1.012] ${onClick ? 'hover:shadow-[0_16px_40px_rgba(0,0,0,.35)]' : ''}`}
        style={{ borderRadius: radius }}
      >
        {/* Cinta opcional */}
        {badge && (
          <span className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold text-white/90 bg-black/35 border border-white/20 backdrop-blur-[2px]">
            {badge}
          </span>
        )}

        {/* Loading indicator */}
        {show && !loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 backdrop-blur-sm z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        )}

        {/* SOLUCION: Imagen con mejor manejo de errores */}
        {show ? (
          <NextImage
            src={src}
            alt={alt || 'Magic card art'}
            fill
            sizes={sizes}
            priority={priority}
            placeholder="blur"
            blurDataURL={BLUR_1PX}
            className={`${fit === 'contain' ? 'object-contain bg-gray-50' : 'object-cover'} select-none transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleLoad}
            onError={handleError}
            unoptimized={src?.includes('scryfall.com')} // NUEVO: Para URLs externas de Scryfall
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500">
            <div className="text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" stroke="currentColor" fill="none" className="mx-auto mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p className="text-xs text-gray-500">
                {error ? 'Error al cargar' : 'Sin imagen'}
              </p>
            </div>
          </div>
        )}

        {/* Cristal + "shine" */}
        <div className="pointer-events-none absolute inset-0 mix-blend-screen">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/18 via-transparent to-transparent" />
          <div className="absolute -left-1/3 top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/35 to-transparent translate-x-[-120%] group-hover:translate-x-[220%] transition-transform duration-[1600ms] ease-out" />
        </div>
      </div>
    </div>
  )
}