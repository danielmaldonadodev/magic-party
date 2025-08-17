// pages/players/[id].js
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../../lib/supabaseClient'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import ProfessionalMyEvents from '../../components/ProfessionalMyEvents'

/* ────────────────────────────────────────────── */
/* Professional Animations & Styles                */
/* ────────────────────────────────────────────── */
const customStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes pulse-subtle {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .animate-slideInLeft {
    animation: slideInLeft 0.5s ease-out forwards;
  }

  .animate-pulse-subtle {
    animation: pulse-subtle 2s ease-in-out infinite;
  }
`

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('player-professional-styles')) {
  const style = document.createElement('style')
  style.id = 'player-professional-styles'
  style.textContent = customStyles
  document.head.appendChild(style)
}

/* ────────────────────────────────────────────── */
/* Helpers                                          */
/* ────────────────────────────────────────────── */
// Sube automáticamente calidad de imagen de Scryfall: /small/ -> /normal/
function upgradeScryfall(url) {
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

/* ────────────────────────────────────────────── */
/* Professional Components                          */
/* ────────────────────────────────────────────── */
function ProfessionalStatTile({ label, value, hint, index = 0, icon }) {
  const [isHovered, setIsHovered] = useState(false)
  
  const getStatTheme = (label) => {
    if (label.includes('Victorias') || label.includes('Wins')) 
      return { 
        gradient: 'from-green-600 to-emerald-700', 
        bg: 'bg-green-50', 
        text: 'text-green-800', 
        border: 'border-green-200',
        icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
      }
    if (label.includes('Partidas') || label.includes('jugadas')) 
      return { 
        gradient: 'from-blue-600 to-indigo-700', 
        bg: 'bg-blue-50', 
        text: 'text-blue-800', 
        border: 'border-blue-200',
        icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      }
    if (label.includes('Racha') || label.includes('Streak')) 
      return { 
        gradient: 'from-orange-600 to-red-700', 
        bg: 'bg-orange-50', 
        text: 'text-orange-800', 
        border: 'border-orange-200',
        icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
      }
    if (label.includes('Kills') || label.includes('elimina')) 
      return { 
        gradient: 'from-red-600 to-rose-700', 
        bg: 'bg-red-50', 
        text: 'text-red-800', 
        border: 'border-red-200',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
      }
    if (label.includes('Daño') || label.includes('Damage')) 
      return { 
        gradient: 'from-amber-600 to-orange-700', 
        bg: 'bg-amber-50', 
        text: 'text-amber-800', 
        border: 'border-amber-200',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      }
    if (label.includes('murió') || label.includes('die')) 
      return { 
        gradient: 'from-gray-600 to-slate-700', 
        bg: 'bg-gray-50', 
        text: 'text-gray-800', 
        border: 'border-gray-200',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      }
    return { 
      gradient: 'from-slate-600 to-gray-700', 
      bg: 'bg-slate-50', 
      text: 'text-slate-800', 
      border: 'border-slate-200',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    }
  }

  const theme = getStatTheme(label)

  return (
    <div 
      className="group relative transform transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-1"
      style={{ 
        animationDelay: `${index * 150}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle shadow effect */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${theme.gradient} opacity-0 blur-xl transition-all duration-700 group-hover:opacity-5 -z-10`} />
      
      <Card className={`relative overflow-hidden border ${theme.border} bg-white shadow-sm transition-all duration-500 hover:shadow-lg hover:border-gray-300`} padding="none">
        {/* Subtle top accent */}
        <div className={`h-0.5 bg-gradient-to-r ${theme.gradient}`} />
        
        <div className="p-6 space-y-4">
          {/* Header with professional icon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white shadow-md transition-all duration-300 group-hover:scale-105`}>
                {icon || theme.icon}
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                  {label}
                </p>
              </div>
            </div>
            {/* Status indicator */}
            <div className={`h-2 w-2 rounded-full bg-gradient-to-br ${theme.gradient} transition-all duration-300 group-hover:scale-150 shadow-sm`} />
          </div>
          
          {/* Value with professional styling */}
          <div className="relative">
            <p className={`text-3xl font-bold tracking-tight transition-all duration-500 group-hover:scale-105 bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
              {value}
            </p>
            {/* Subtle shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000 -skew-x-12 group-hover:translate-x-full" />
          </div>
          
          {/* Hint with professional styling */}
          {hint && (
            <div className={`transform transition-all duration-300 ${
              isHovered ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-80'
            }`}>
              <p className={`text-xs font-medium px-3 py-1.5 rounded-lg ${theme.bg} ${theme.text} border ${theme.border}`}>
                {hint}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

function ProfessionalSkeleton() {
  return (
    <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero skeleton */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm animate-pulse">
          <div className="h-1 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
          <div className="flex items-center gap-8 p-8">
            <div className="relative">
              <div className="h-28 w-28 rounded-full bg-gradient-to-br from-gray-200 to-gray-100" />
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gray-200" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-8 w-80 bg-gray-200 rounded-lg" />
              <div className="h-4 w-96 bg-gray-100 rounded" />
              <div className="space-y-2">
                <div className="h-3 w-32 bg-gray-100 rounded" />
                <div className="h-4 w-full bg-gray-100 rounded-full">
                  <div className="h-full w-3/5 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 animate-pulse shadow-sm" />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProfessionalCommanderCard({ cmd, index = 0 }) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Upgrade image URL from small to normal if possible
  const getImageUrl = (url) => {
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

  const imageUrl = getImageUrl(cmd.image)

  return (
    <div 
      className="group relative transform transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-2"
      style={{ 
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle outer effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-600 to-slate-700 opacity-0 blur-xl transition-all duration-700 group-hover:opacity-5 -z-10" />
      
      <Card className="relative overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:shadow-md hover:border-gray-300" padding="none">
        {/* Professional top accent */}
        <div className="h-0.5 bg-gradient-to-r from-gray-600 to-slate-700" />

        {/* Image container */}
        <div className="relative aspect-[5/7] w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {imageUrl ? (
            <>
              {/* Loading shimmer */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
              )}
              <Image 
                src={imageUrl} 
                alt={cmd.name} 
                fill
                className={`object-cover transition-all duration-700 group-hover:scale-105 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                onLoad={() => setImageLoaded(true)}
              />
              {/* Professional overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </>
          ) : (
            <div className="grid h-full w-full place-items-center text-gray-500">
              <div className="text-center space-y-2">
                <div className="h-10 w-10 mx-auto rounded-lg bg-gray-200 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-500">Sin imagen</span>
              </div>
            </div>
          )}
          
          {/* Usage count badge */}
          <div className="absolute top-3 right-3 z-10">
            <div className={`inline-flex items-center gap-1.5 rounded-lg bg-black/80 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition-all duration-300 ${
              isHovered ? 'scale-105 bg-black/90' : ''
            }`}>
              <svg className="h-3 w-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>{cmd.count}</span>
            </div>
          </div>
        </div>

        {/* Card content */}
        <div className="p-4 space-y-3">
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 leading-tight transition-colors duration-300 group-hover:text-gray-800">
            {cmd.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200">
              <span>{cmd.count} vez{cmd.count !== 1 ? 'es' : ''}</span>
            </div>
            {/* Professional action indicator */}
            <div className={`flex items-center text-gray-400 transition-all duration-300 ${
              isHovered ? 'text-gray-600 translate-x-1' : ''
            }`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ProfessionalSegmentedTabs({ current, onChange, canEdit, eventsCount = 0 }) {
  const tabs = [
    {
      key: 'stats',
      label: 'Estadísticas',
      icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    },
    {
      key: 'events',
      label: 'Mis Eventos',
      icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
      count: eventsCount
    }
  ]

  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex items-center rounded-lg bg-gray-100 p-1 shadow-sm border border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`relative rounded-md px-6 py-2.5 text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
              current === tab.key 
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
              {tab.count && tab.count > 0 && (
                <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-bold ${
                  current === tab.key 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────── */
/* Professional Empty State Component               */
/* ────────────────────────────────────────────── */
function ProfessionalEmptyCommandersState() {
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-16 text-center">
      <div className="relative">
        {/* Professional icon */}
        <div className="mx-auto mb-6 relative">
          <div className="relative h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-gray-200 shadow-sm">
            <svg className="h-10 w-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 00-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Sin comandantes registrados</h3>
        <p className="text-gray-600 max-w-md mx-auto leading-relaxed mb-8">
          Aún no se han registrado comandantes para este jugador. Juega algunas partidas para ver tus comandantes favoritos aquí.
        </p>
        
        <Link 
          href="/matches/new"
          className="group inline-flex items-center gap-3 rounded-lg bg-gray-900 px-6 py-3 text-white font-semibold shadow-sm transition-all duration-300 hover:bg-gray-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Crear nueva partida
        </Link>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────── */
/* Professional Edit Form Component                 */
/* ────────────────────────────────────────────── */
function ProfessionalEditProfileForm({ initialNickname, onSaved }) {
  const [nickname, setNickname] = useState(initialNickname || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [ok, setOk] = useState(false)

  const clean = nickname.trim()
  const isValid = clean.length >= 2 && clean.length <= 32
  const isDirty = clean !== (initialNickname || '')
  const canSave = isValid && isDirty && !saving

  const save = async () => {
    if (!canSave) return
    setSaving(true); setError(null); setOk(false)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('Necesitas iniciar sesión.')

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nickname: clean })
      })

      if (!res.ok) throw new Error((await res.text()) || 'Error al guardar')

      setOk(true)
      onSaved?.(clean)
    } catch (e) {
      setError(e.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="group relative">
      <Card className="relative overflow-hidden border border-gray-200 bg-white shadow-sm" padding="none">
        {/* Professional header */}
        <div className="h-0.5 bg-gradient-to-r from-gray-600 to-slate-700" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center text-white shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Editar Perfil</h2>
              <p className="text-sm text-gray-600">Actualiza tu información de usuario.</p>
            </div>
          </div>
          {saving && (
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm font-medium">Guardando...</span>
            </div>
          )}
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Status Messages */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-medium">Error al guardar</h4>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            </div>
          )}
          
          {ok && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-medium">Perfil actualizado</h4>
                  <span className="text-sm">Los cambios se han guardado correctamente.</span>
                </div>
              </div>
            </div>
          )}

          {/* Input Field */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-900">
              Nombre de Usuario
            </label>
            <div className="relative">
              <div
                className={`relative flex items-center rounded-lg border-2 transition-all duration-300 ${
                  isValid 
                    ? 'border-gray-300 focus-within:border-gray-500 bg-white' 
                    : 'border-red-300 focus-within:border-red-500 bg-red-50'
                }`}
              >
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg className={`h-5 w-5 transition-colors duration-300 ${
                    isValid ? 'text-gray-400' : 'text-red-500'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  className="w-full rounded-lg bg-transparent pl-11 pr-20 py-3 text-gray-900 placeholder-gray-500 outline-none font-medium"
                  value={nickname}
                  onChange={(e) => { 
                    setNickname(e.target.value); 
                    setOk(false); 
                    setError(null) 
                  }}
                  placeholder="Ingresa tu nombre de usuario"
                  maxLength={32}
                  autoComplete="off"
                  onKeyDown={(e) => { if (e.key === 'Enter') save() }}
                />
                {/* Character counter */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all duration-300 ${
                    isValid ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <span>{clean.length}/32</span>
                    {isValid ? (
                      <svg className="h-3 w-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-3 w-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Help text */}
              <div className="mt-2">
                <p className={`text-sm transition-colors duration-300 ${
                  isValid ? 'text-gray-600' : 'text-red-600'
                }`}>
                  El nombre debe tener entre 2 y 32 caracteres
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={() => setNickname(initialNickname || '')}
            disabled={!isDirty || saving}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Deshacer
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar cambios
              </>
            )}
          </button>
        </div>
      </Card>
    </div>
  )
}

/* ────────────────────────────────────────────── */
/* Main Component                                   */
/* ────────────────────────────────────────────── */
export default function PlayerProfile() {
  const router = useRouter()
  const { id, tab } = router.query

  // Estados existentes
  const [resolvedId, setResolvedId] = useState(null)
  const [session, setSession] = useState(null)
  const [nickname, setNickname] = useState('')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // NUEVO: avatar y preferencia de imagen
  const [avatarUrl, setAvatarUrl] = useState('')
  const [highlightPreference, setHighlightPreference] = useState('profile') // 'profile' | 'commander'

  // ⭐ PASO 2: estados adicionales
  const [userEvents, setUserEvents] = useState([])
  const [userParticipations, setUserParticipations] = useState([])
  const [currentTab, setCurrentTab] = useState(tab || 'stats')

  // Lógica existente sin cambios
  useEffect(() => {
    let mounted = true
    if (!id) return

    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(session || null)

      if (id === 'me') {
        if (session?.user?.id) setResolvedId(session.user.id)
        else setResolvedId(null)
      } else {
        setResolvedId(id)
      }
    }

    run()
    return () => { mounted = false }
  }, [id])

  const isOwner = useMemo(() => {
    return Boolean(session?.user?.id && resolvedId && session.user.id === resolvedId)
  }, [session, resolvedId])

  // ⭐ PASO 3: sincronizar tab desde la URL
  useEffect(() => {
    if (tab && ['stats', 'events', 'edit'].includes(tab)) {
      setCurrentTab(tab)
    }
  }, [tab])

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      if (resolvedId === null) { setLoading(false); return }
      if (!resolvedId) return

      setLoading(true); setError(null)
      try {
        // ⬇️ Ampliamos select para traer avatar y preferencia
        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('nickname, avatar_url, highlight_image_preference')
          .eq('id', resolvedId)
          .single()
        if (pErr) throw pErr
        if (!mounted) return

        setNickname(profile?.nickname || 'Jugador')
        setAvatarUrl(profile?.avatar_url || '')
        setHighlightPreference(profile?.highlight_image_preference || 'profile')

        const { data: psv, error: vErr } = await supabase
          .from('player_stats_view')
          .select('total_played, total_wins, win_rate')
          .eq('id', resolvedId)
          .maybeSingle()
        if (vErr) throw vErr

        const { data: parts, error: mpErr } = await supabase
          .from('match_participants')
          .select('match_id, kills, max_damage, first_to_die')
          .eq('user_id', resolvedId)
        if (mpErr) throw mpErr

        const { data: topCmds, error: tcErr } = await supabase
          .from('commander_stats_by_user')
          .select('name, last_image_url, games_played')
          .eq('user_id', resolvedId)
          .order('games_played', { ascending: false })
          .limit(6)
        if (tcErr) throw tcErr

        // ⭐ PASO 4: cargar eventos del usuario si es owner
        if (isOwner && resolvedId) {
          const [eventsRes, participationsRes] = await Promise.allSettled([
            // Eventos creados por el usuario
            supabase
              .from('events')
              .select(`
                *,
                participant_count:event_participants(count)
              `)
              .eq('created_by', resolvedId)
              .order('starts_at', { ascending: false }),
            
            // Participaciones del usuario
            supabase
              .from('event_participants')
              .select(`
                status,
                created_at,
                event:events(*)
              `)
              .eq('user_id', resolvedId)
              .order('created_at', { ascending: false })
          ])

          if (eventsRes.status === 'fulfilled' && eventsRes.value.data) {
            const events = eventsRes.value.data.map(event => ({
              ...event,
              participant_count: event.participant_count?.[0]?.count || 0
            }))
            if (!mounted) return
            setUserEvents(events)
          }

          if (participationsRes.status === 'fulfilled' && participationsRes.value.data) {
            const participations = participationsRes.value.data.filter(p => p.event) // Solo incluir si el evento existe
            if (!mounted) return
            setUserParticipations(participations)
          }
        }

        const matchIds = Array.from(new Set((parts || []).map(m => m.match_id))).filter(Boolean)
        let playedMatchesDetailed = []
        if (matchIds.length) {
          const { data: mDetail, error: mdErr } = await supabase
            .from('matches')
            .select('id, played_at, winner')
            .in('id', matchIds)
          if (mdErr) throw mdErr
          playedMatchesDetailed = mDetail || []
        }

        const totalGames = Number(psv?.total_played ?? 0)
        const totalWins  = Number(psv?.total_wins ?? 0)
        const winRate    = Number(psv?.win_rate ?? (totalGames ? (100 * totalWins / totalGames) : 0))

        const kills = (parts || []).reduce((sum, m) => sum + (m.kills || 0), 0)
        const firstToDie = (parts || []).filter(m => m.first_to_die).length
        const avgMaxDamage = (
          (parts || []).reduce((sum, m) => sum + (m.max_damage || 0), 0) /
          ((parts || []).length || 1)
        ).toFixed(1)

        const playedSorted = [...playedMatchesDetailed].sort(
          (a, b) => new Date(a.played_at) - new Date(b.played_at)
        )
        let streak = 0, maxStreak = 0
        for (const m of playedSorted) {
          if (m.winner === resolvedId) { streak++; if (streak > maxStreak) maxStreak = streak }
          else { streak = 0 }
        }

        const topCommanders = (topCmds || []).map(c => ({
          name: c.name,
          count: Number(c.games_played || 0),
          image: c.last_image_url || ''
        }))

        if (!mounted) return
        setStats({
          totalGames,
          totalWins,
          winRate,
          maxStreak,
          kills,
          firstToDie,
          avgMaxDamage,
          topCommanders,
        })
      } catch (err) {
        console.error(err)
        if (!mounted) return
        setError('Error al cargar perfil')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()
    return () => { mounted = false }
  }, [resolvedId, isOwner])

  // ⬇️ Cálculo de imagen destacada con preferencia y fallbacks seguros
  const commanderImage = useMemo(
    () => upgradeScryfall(stats?.topCommanders?.[0]?.image || ''),
    [stats?.topCommanders]
  )

  const highlightImage = useMemo(() => {
    const pref = (highlightPreference || 'profile').toLowerCase()
    const avatar = avatarUrl || ''
    if (pref === 'commander') {
      return commanderImage || avatar || '/default-avatar.png'
    }
    // 'profile' por defecto
    return (avatar || commanderImage || '/default-avatar.png')
  }, [avatarUrl, highlightPreference, commanderImage])

  if (loading) return <ProfessionalSkeleton />

  if (id === 'me' && !session?.user?.id) {
    return (
      <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Professional gradient header */}
            <div className="h-1 bg-gradient-to-r from-gray-600 to-slate-700" />
            
            <div className="text-center py-16 px-8">
              {/* Professional avatar placeholder */}
              <div className="relative inline-flex items-center justify-center mb-8">
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 ring-2 ring-gray-200 shadow-sm">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Accede a tu perfil
              </h1>
              <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                Inicia sesión para acceder a tus estadísticas detalladas, comandantes favoritos y toda tu información de juego.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-white font-semibold shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Iniciar sesión
                </Link>
                
                <Link href="/players" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-3a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Ver otros jugadores
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-xl border border-red-200 bg-white shadow-sm">
            {/* Error header */}
            <div className="h-1 bg-gradient-to-r from-red-600 to-red-700" />
            
            <div className="text-center py-16 px-8">
              {/* Error icon */}
              <div className="relative inline-flex items-center justify-center mb-8">
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-red-50 ring-2 ring-red-200 shadow-sm">
                  <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Error al cargar el perfil
              </h1>
              <p className="text-lg text-red-600 mb-12 font-medium">{error}</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => router.reload()} 
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-white font-semibold shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reintentar
                </button>
                
                <Link href="/players" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver atrás
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!stats) return null

  const winrate = Number.isFinite(stats.winRate) ? stats.winRate : (stats.totalGames ? ((stats.totalWins / stats.totalGames) * 100) : 0)
  
  const getWinrateTheme = (rate) => {
    if (rate >= 75) return { 
      gradient: 'from-green-600 to-emerald-700', 
      bg: 'bg-green-50', 
      text: 'text-green-800', 
      border: 'border-green-200',
      label: 'Excelente',
      status: 'Elite'
    }
    if (rate >= 60) return { 
      gradient: 'from-blue-600 to-indigo-700', 
      bg: 'bg-blue-50', 
      text: 'text-blue-800', 
      border: 'border-blue-200',
      label: 'Muy bueno',
      status: 'Avanzado'
    }
    if (rate >= 45) return { 
      gradient: 'from-amber-600 to-orange-700', 
      bg: 'bg-amber-50', 
      text: 'text-amber-800', 
      border: 'border-amber-200',
      label: 'Competitivo',
      status: 'Intermedio'
    }
    return { 
      gradient: 'from-gray-600 to-slate-700', 
      bg: 'bg-gray-50', 
      text: 'text-gray-800', 
      border: 'border-gray-200',
      label: 'En desarrollo',
      status: 'Principiante'
    }
  }

  const winrateTheme = getWinrateTheme(winrate)

  // ⭐ PASO 6: lógica tabs + URL
  const totalEventsCount = userEvents.length + userParticipations.length
  const goTab = (t) => {
    setCurrentTab(t)
    router.replace({ query: { id, tab: t } }, undefined, { shallow: true })
  }

  // Render principal
  return (
    <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header profesional */}
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:shadow-md">
          {/* Barra superior */}
          <div className="h-1 bg-gradient-to-r from-gray-600 to-slate-700" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 p-8 lg:p-10">
            {/* Avatar / imagen destacada */}
            <div className="relative flex-shrink-0">
              <div className={`relative h-32 w-32 lg:h-40 lg:w-40 rounded-full overflow-hidden ring-2 ${winrateTheme.border} shadow-md transition-all duration-500 group-hover:scale-105 bg-gray-100`}>
                <Image
                  src={highlightImage || '/default-avatar.png'}
                  alt={nickname || 'Jugador'}
                  fill
                  className="object-cover"
                  sizes="160px"
                  priority
                />
                {/* Indicador de estado */}
                <div className={`absolute -top-1 -right-1 h-8 w-8 rounded-full bg-gradient-to-br ${winrateTheme.gradient} ring-2 ring-white flex items-center justify-center text-xs font-semibold text-white shadow-md`}>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Info perfil */}
            <div className="min-w-0 flex-1 space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
                  {nickname || 'Jugador'}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <p className="text-gray-600 font-medium">
                    {isOwner ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Tu perfil personal
                      </span>
                    ) : (
                      'Perfil público del jugador'
                    )}
                  </p>
                  <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold ${winrateTheme.bg} ${winrateTheme.text} border ${winrateTheme.border}`}>
                    <span>{winrateTheme.status}</span>
                  </div>
                </div>

                {/* Botón editar (solo owner) */}
                {isOwner && (
                  <div className="mt-2">
                    <Link
                      href="/players/edit"
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar perfil
                    </Link>
                  </div>
                )}
              </div>

              {/* Winrate */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">Tasa de Victoria</span>
                    <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold ${winrateTheme.bg} ${winrateTheme.text} border ${winrateTheme.border}`}>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {winrate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl lg:text-4xl font-bold bg-gradient-to-r ${winrateTheme.gradient} bg-clip-text text-transparent`}>
                      {winrate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500 font-medium">
                      {stats?.totalWins ?? 0} victorias de {stats?.totalGames ?? 0} partidas
                    </p>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${winrateTheme.gradient} transition-all duration-1000 ease-out relative`}
                    style={{ width: `${Math.min(100, Math.max(0, winrate))}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full transition-transform duration-1500 group-hover:translate-x-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs profesionales */}
        <div className="flex justify-center">
          <ProfessionalSegmentedTabs 
            current={currentTab} 
            onChange={goTab} 
            canEdit={isOwner}
            eventsCount={isOwner ? totalEventsCount : 0}
          />
        </div>

        {/* Contenido por pestaña */}
        {currentTab === 'edit' ? (
          <ProfessionalEditProfileForm
            initialNickname={nickname}
            onSaved={(newNick) => setNickname(newNick)}
          />
        ) : currentTab === 'events' ? (
          <ProfessionalMyEvents
            userEvents={userEvents}
            userParticipations={userParticipations}
            isOwner={isOwner}
          />
        ) : (
          <>
            {/* Stats principales */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <ProfessionalStatTile label="Partidas jugadas" value={stats.totalGames} index={0} />
              <ProfessionalStatTile label="Victorias totales" value={stats.totalWins} index={1} />
              <ProfessionalStatTile label="Racha máxima" value={stats.maxStreak} index={2} />
            </div>

            {/* Stats adicionales */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <ProfessionalStatTile 
                label="Daño máx. promedio" 
                value={stats.avgMaxDamage} 
                hint="Promedio de tu pico de daño por partida" 
                index={3} 
              />
              <ProfessionalStatTile label="Eliminaciones totales" value={stats.kills} index={4} />
              <ProfessionalStatTile label="Eliminado primero" value={stats.firstToDie} index={5} />
            </div>

            {/* Comandantes más usados */}
            <div className="group relative">
              <Card className="relative overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:shadow-md" padding="none">
                <div className="h-1 bg-gradient-to-r from-gray-600 to-slate-700" />

                <div className="p-8 lg:p-10">
                  <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center text-white shadow-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 00-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            Comandantes Más Usados
                          </h2>
                          <p className="text-gray-600">
                            Comandantes con más apariciones en tus partidas
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => router.reload()} 
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Actualizar
                      </button>
                      <Link 
                        href="/players" 
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Todos los jugadores
                      </Link>
                    </div>
                  </div>

                  {/* Grid de comandantes */}
                  {stats.topCommanders.length === 0 ? (
                    <ProfessionalEmptyCommandersState />
                  ) : (
                    <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                      {stats.topCommanders.map((cmd, index) => (
                        <ProfessionalCommanderCard key={cmd.name} cmd={cmd} index={index} />
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
