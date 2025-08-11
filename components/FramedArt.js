// components/FramedArt.jsx
import Image from 'next/image'
import { useState } from 'react'

const BLUR_1PX =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSIjZWVlZWVlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4='

/**
 * Marco premium con:
 * - Borde conic + máscara (alto contraste)
 * - Glow configurable (prop `glow`)
 * - Cristal con reflejo y “shine” animado
 * - BlurDataURL y fallback si la imagen falla
 * - Cinta/badge opcional
 *
 * Props:
 *  src, alt
 *  isCard       -> relación 63/88 (MTG) o cuadrado
 *  widthClass   -> tailwind width (ej. 'w-[224px] md:w-[248px]')
 *  glow         -> rgba() del resplandor
 *  badge        -> texto de la cinta (opcional)
 *  radius       -> border-radius (string)
 *  priority, sizes -> pasan a <Image/>
 */
export default function FramedArt({
  src,
  alt,
  isCard = true,
  widthClass = 'w-[224px] md:w-[248px]',
  glow = 'rgba(99,102,241,.38)', // indigo por defecto
  badge,
  radius = '1.25rem',
  priority = false,
  sizes = '240px',
}) {
  const [error, setError] = useState(false)
  const ratioClass = isCard ? 'aspect-[63/88]' : 'aspect-square'
  const show = !!src && !error

  return (
    <div className={`group ${ratioClass} ${widthClass} relative [perspective:1200px]`}>
      {/* Resplandor exterior */}
      <div
        className="absolute -inset-3 rounded-[1.6rem] opacity-0 group-hover:opacity-60 blur-2xl transition-opacity duration-500"
        style={{ background: `radial-gradient(60% 60% at 50% 40%, ${glow}, transparent)` }}
      />

      {/* Borde conic con máscara (queda “metálico”) */}
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
        className="relative w-full h-full rounded-2xl overflow-hidden border border-white/20 bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-[0_12px_30px_rgba(0,0,0,.25)] will-change-transform transition-transform duration-500 group-hover:rotate-[.6deg] group-hover:scale-[1.012]"
        style={{ borderRadius: radius }}
      >
        {/* Cinta opcional */}
        {badge && (
          <span className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold text-white/90 bg-black/35 border border-white/20 backdrop-blur-[2px]">
            {badge}
          </span>
        )}

        {/* Imagen / fallback */}
        {show ? (
          <Image
            src={src}
            alt={alt || 'art'}
            fill
            sizes={sizes}
            priority={priority}
            placeholder="blur"
            blurDataURL={BLUR_1PX}
            className="object-cover select-none"
            onError={() => setError(true)}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500">
            <svg width="28" height="28" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h18M3 19h18M3 5l6 7-6 7m18-14l-6 7 6 7"/>
            </svg>
          </div>
        )}

        {/* Cristal + “shine” */}
        <div className="pointer-events-none absolute inset-0 mix-blend-screen">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/18 via-transparent to-transparent" />
          <div className="absolute -left-1/3 top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/35 to-transparent translate-x-[-120%] group-hover:translate-x-[220%] transition-transform duration-[1600ms] ease-out" />
        </div>
      </div>
    </div>
  )
}
