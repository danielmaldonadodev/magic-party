  import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
  import Link from 'next/link'
  import Image from 'next/image'
  import { 
    format, addDays, isBefore, isAfter,
    startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday,
    addMonths, subMonths, startOfWeek, endOfWeek
  } from 'date-fns'
  import { es } from 'date-fns/locale'
  import { supabase } from '../../lib/supabaseClient'
  import { createSupabaseServerClient } from '../../lib/supabaseServer'
  import Card from '../../components/Card'

  /* ===============================================================
    FUNCIONES DE CALENDARIO INTEGRADAS
    =============================================================== */

  // Utility para generar archivo .ics mejorado
  function generateEnhancedICS(event) {
    const startDate = new Date(event.starts_at)
    const endDate = new Date(event.ends_at)
    
    const formatICSDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }
    
    const icsContent = `BEGIN:VCALENDAR
  VERSION:2.0
  PRODID:-//MTG Events//MTG Events App//ES
  BEGIN:VEVENT
  UID:mtg-event-${event.id}@mtgapp.com
  DTSTAMP:${formatICSDate(new Date())}
  DTSTART:${formatICSDate(startDate)}
  DTEND:${formatICSDate(endDate)}
  SUMMARY:${event.title}
  DESCRIPTION:${event.description || 'Evento de Magic: The Gathering'}\\n\\nOrganizado por: Colegueo MTG\\nUbicación: ${event.location || 'Por confirmar'}
  LOCATION:${event.location || ''}
  STATUS:CONFIRMED
  SEQUENCE:0
  BEGIN:VALARM
  TRIGGER:-PT1H
  DESCRIPTION:Recordatorio: ${event.title} en 1 hora
  ACTION:DISPLAY
  END:VALARM
  BEGIN:VALARM
  TRIGGER:-P1D
  DESCRIPTION:Recordatorio: ${event.title} mañana
  ACTION:DISPLAY
  END:VALARM
  END:VEVENT
  END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `evento-mtg-${event.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  // Generar enlaces para diferentes servicios de calendario
  function generateCalendarLinks(event) {
    const startDate = new Date(event.starts_at)
    const endDate = new Date(event.ends_at)
    
    const formatForGoogle = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    
    const description = `${event.description || 'Evento de Magic: The Gathering'}

  Organizado por: Colegueo MTG
  Ubicación: ${event.location || 'Por confirmar'}`

    return {
      google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatForGoogle(startDate)}/${formatForGoogle(endDate)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(event.location || '')}`,
      
      outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(event.location || '')}`,
      
      yahoo: `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${encodeURIComponent(event.title)}&st=${formatForGoogle(startDate)}&et=${formatForGoogle(endDate)}&desc=${encodeURIComponent(description)}&in_loc=${encodeURIComponent(event.location || '')}`
    }
  }

  // Programar notificación de recordatorio
  function scheduleEventReminder(event) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const eventDate = new Date(event.starts_at)
      const now = new Date()
      
      // Notificación 1 día antes
      const oneDayBefore = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000)
      if (oneDayBefore > now) {
        setTimeout(() => {
          new Notification(`🎲 Evento MTG mañana`, {
            body: `${event.title} - ${event.location || 'Ubicación por confirmar'}`,
            icon: '/mtg-icon.png',
            tag: `event-reminder-${event.id}`,
            requireInteraction: true
          })
        }, oneDayBefore.getTime() - now.getTime())
      }
      
      // Notificación 1 hora antes
      const oneHourBefore = new Date(eventDate.getTime() - 60 * 60 * 1000)
      if (oneHourBefore > now) {
        setTimeout(() => {
          new Notification(`🔥 Evento MTG en 1 hora`, {
            body: `${event.title} está por comenzar`,
            icon: '/mtg-icon.png',
            tag: `event-starting-${event.id}`,
            requireInteraction: true
          })
        }, oneHourBefore.getTime() - now.getTime())
      }
    }
  }

  /* ===============================================================
    MODAL DE CALENDARIO AUTOMÁTICO - OPTIMIZADO PARA MÓVIL
    =============================================================== */
  function AutoCalendarModal({ isOpen, onClose, event, creatorName }) {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false)
    
    const handleAddToCalendar = (type) => {
      const links = generateCalendarLinks(event)
      
      switch(type) {
        case 'download':
          generateEnhancedICS(event)
          break
        case 'google':
          window.open(links.google, '_blank')
          break
        case 'outlook':
          window.open(links.outlook, '_blank')
          break
        case 'yahoo':
          window.open(links.yahoo, '_blank')
          break
      }
      
      onClose()
    }

    const handleNotifications = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          setNotificationsEnabled(true)
          scheduleEventReminder(event)
        }
      }
    }

    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-3 sm:p-4 text-center sm:items-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={onClose}
          />
          
          {/* Modal - Optimizado para móvil */}
          <div className="relative transform overflow-hidden rounded-xl sm:rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-sm sm:max-w-lg">
            {/* Header con gradiente de éxito */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      🎉 ¡Te has apuntado!
                    </h3>
                    <p className="text-sm text-green-100">
                      ¿Añadir a tu calendario?
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
              <div className="space-y-5">
                {/* Event info compacta para móvil */}
                <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                  <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base line-clamp-2">{event.title}</h4>
                  <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                    <p>📅 {format(new Date(event.starts_at), "d 'de' MMMM 'a las' HH:mm", { locale: es })}</p>
                    <p>📍 {event.location || 'Ubicación por confirmar'}</p>
                    {creatorName && <p>👤 {creatorName}</p>}
                  </div>
                </div>

                {/* Calendar options - Grid adaptativo */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base text-center sm:text-left">
                    Elige tu calendario preferido
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      onClick={() => handleAddToCalendar('google')}
                      className="flex flex-col items-center gap-1.5 sm:gap-2 rounded-lg border border-gray-300 px-3 py-3 sm:px-4 text-xs sm:text-sm hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <span className="text-lg sm:text-base text-blue-600">📅</span>
                      <span className="font-medium">Google</span>
                    </button>
                    
                    <button
                      onClick={() => handleAddToCalendar('outlook')}
                      className="flex flex-col items-center gap-1.5 sm:gap-2 rounded-lg border border-gray-300 px-3 py-3 sm:px-4 text-xs sm:text-sm hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <span className="text-lg sm:text-base text-blue-800">📧</span>
                      <span className="font-medium">Outlook</span>
                    </button>
                    
                    <button
                      onClick={() => handleAddToCalendar('yahoo')}
                      className="flex flex-col items-center gap-1.5 sm:gap-2 rounded-lg border border-gray-300 px-3 py-3 sm:px-4 text-xs sm:text-sm hover:bg-purple-50 hover:border-purple-300 transition-colors"
                    >
                      <span className="text-lg sm:text-base text-purple-600">🟣</span>
                      <span className="font-medium">Yahoo</span>
                    </button>
                    
                    <button
                      onClick={() => handleAddToCalendar('download')}
                      className="flex flex-col items-center gap-1.5 sm:gap-2 rounded-lg border border-gray-300 px-3 py-3 sm:px-4 text-xs sm:text-sm hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    >
                      <span className="text-lg sm:text-base text-gray-600">💾</span>
                      <span className="font-medium">Descargar</span>
                    </button>
                  </div>
                </div>

                {/* Notifications - Compacto para móvil */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">Recordatorios</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      notificationsEnabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {notificationsEnabled ? '✅ Activos' : '❌ Off'}
                    </span>
                  </div>
                  
                  {!notificationsEnabled ? (
                    <button
                      onClick={handleNotifications}
                      className="w-full rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs sm:text-sm text-amber-800 hover:bg-amber-100 transition-colors"
                    >
                      🔔 Activar notificaciones web
                    </button>
                  ) : (
                    <p className="text-xs sm:text-sm text-green-700 bg-green-50 rounded-lg p-2.5">
                      ✅ Te avisaremos 1 día y 1 hora antes
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Los recordatorios se incluyen en el archivo .ics
                  </p>
                </div>

                {/* Actions - Botones finales */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Ahora no
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ===============================================================
    THEME SYSTEM - REUTILIZADO
    =============================================================== */
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
      text: {
        strong: 'text-amber-900',
        soft: 'text-amber-700',
        white: 'text-white',
      },
      border: 'border-amber-300',
      shadow: 'shadow-amber-500/25',
      fact: 'Orden y protección. La fuerza del colectivo supera al individuo.',
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
      text: {
        strong: 'text-blue-900',
        soft: 'text-blue-700',
        white: 'text-white',
      },
      border: 'border-blue-300',
      shadow: 'shadow-blue-500/25',
      fact: 'Conocimiento es poder. La paciencia define al maestro.',
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
      text: {
        strong: 'text-gray-900',
        soft: 'text-gray-700',
        white: 'text-white',
      },
      border: 'border-gray-400',
      shadow: 'shadow-gray-500/25',
      fact: 'El poder tiene un precio. La ambición no conoce límites.',
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
      text: {
        strong: 'text-red-900',
        soft: 'text-red-700',
        white: 'text-white',
      },
      border: 'border-red-300',
      shadow: 'shadow-red-500/25',
      fact: 'La velocidad es vida. Actúa primero, piensa después.',
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
      text: {
        strong: 'text-green-900',
        soft: 'text-green-700',
        white: 'text-white',
      },
      border: 'border-green-300',
      shadow: 'shadow-green-500/25',
      fact: 'La naturaleza es fuerza bruta. El crecimiento es inevitable.',
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
      text: {
        strong: 'text-blue-900',
        soft: 'text-blue-700',
        white: 'text-white',
      },
      border: 'border-blue-300',
      shadow: 'shadow-blue-500/25',
      fact: 'Ley y orden. El control perfecto define la victoria.',
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
      text: {
        strong: 'text-green-900',
        soft: 'text-green-700',
        white: 'text-white',
      },
      border: 'border-green-400',
      shadow: 'shadow-green-500/25',
      fact: 'Vida y muerte son parte del ciclo. El cementerio es recurso.',
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
      text: {
        strong: 'text-purple-900',
        soft: 'text-purple-700',
        white: 'text-white',
      },
      border: 'border-purple-300',
      shadow: 'shadow-purple-500/25',
      fact: 'Genio y locura van de la mano. La experimentación no tiene límites.',
    },
  ]

  const DEFAULT_THEME_KEY = 'azorius'

  /* ===============================================================
    CSS PROFESIONAL
    =============================================================== */
  const professionalCSS = `
    @keyframes professionalFadeIn {
      from { 
        opacity: 0; 
        transform: translateY(20px) scale(0.98); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }

    @keyframes crystalShine {
      0% { transform: translateX(-100%) rotate(45deg); }
      100% { transform: translateX(300%) rotate(45deg); }
    }

    @keyframes premiumGlow {
      0%, 100% { 
        box-shadow: 0 0 20px var(--glow-color), 
                    0 10px 40px rgba(0,0,0,0.1);
      }
      50% { 
        box-shadow: 0 0 40px var(--glow-color), 
                    0 20px 60px rgba(0,0,0,0.15);
      }
    }

    @keyframes floatSubtle {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
    }

    @keyframes pulseGlow {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }

    .professional-glass {
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .crystal-card {
      position: relative;
      overflow: hidden;
    }

    .crystal-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      transition: left 0.5s;
      z-index: 1;
    }

    .crystal-card:hover::before {
      left: 100%;
    }

    .animate-professional-fade-in {
      animation: professionalFadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }

    .animate-crystal-shine {
      animation: crystalShine 3s ease-in-out infinite;
    }

    .animate-premium-glow {
      animation: premiumGlow 4s ease-in-out infinite;
    }

    .animate-float-subtle {
      animation: floatSubtle 6s ease-in-out infinite;
    }

    .animate-pulse-glow {
      animation: pulseGlow 2s ease-in-out infinite;
    }

    .theme-transition {
      transition: all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
  `

  // Inyectar estilos
  if (typeof document !== 'undefined' && !document.getElementById('professional-events-styles')) {
    const style = document.createElement('style')
    style.id = 'professional-events-styles'
    style.textContent = professionalCSS
    document.head.appendChild(style)
  }

  /* ===============================================================
    THEME ROTATION HOOK
    =============================================================== */
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

  /* ===============================================================
    UTILITY FUNCTIONS
    =============================================================== */
  function formatEventDate(date) {
    try {
      const d = new Date(date)
      const now = new Date()
      
      // Si es hoy
      if (d.toDateString() === now.toDateString()) {
        return `Hoy a las ${format(d, 'HH:mm')}`
      }
      
      // Si es mañana
      const tomorrow = addDays(now, 1)
      if (d.toDateString() === tomorrow.toDateString()) {
        return `Mañana a las ${format(d, 'HH:mm')}`
      }
      
      // Si es esta semana
      const weekFromNow = addDays(now, 7)
      if (isBefore(d, weekFromNow)) {
        return format(d, "eeee 'a las' HH:mm", { locale: es })
      }
      
      // Fecha normal
      return format(d, "d 'de' MMMM 'a las' HH:mm", { locale: es })
    } catch {
      return '—'
    }
  }

  function getEventStatus(startsAt, endsAt) {
    const now = new Date()
    const start = new Date(startsAt)
    const end = new Date(endsAt)
    
    if (isAfter(now, end)) {
      return { key: 'past', label: 'Finalizado', color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50', text: 'text-gray-700', ring: 'ring-gray-200' }
    }
    
    if (isAfter(now, start)) {
      return { key: 'active', label: 'En curso', color: 'from-green-500 to-emerald-600', bg: 'bg-green-50', text: 'text-green-800', ring: 'ring-green-200' }
    }
    
    // Próximo evento (menos de 2 horas)
    const twoHoursFromNow = addDays(now, 0)
    twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2)
    if (isBefore(start, twoHoursFromNow)) {
      return { key: 'soon', label: 'Próximamente', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-800', ring: 'ring-amber-200' }
    }
    
    return { key: 'scheduled', label: 'Programado', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-800', ring: 'ring-blue-200' }
  }

  function getLocationIcon(location) {
    if (!location) return '📍'
    const loc = location.toLowerCase()
    if (loc.includes('spelltable') || loc.includes('webcam')) return '💻'
    if (loc.includes('arena') || loc.includes('mtga')) return '🎮'
    if (loc.includes('discord') || loc.includes('online')) return '🌐'
    return '🏠'
  }

  /* ===============================================================
    PROFESSIONAL COMPONENTS
    =============================================================== */

  function ProfessionalHero({ theme }) {
    const [loaded, setLoaded] = useState(false)
    
    useEffect(() => {
      setLoaded(true)
    }, [])

    return (
      <section className="relative overflow-hidden py-8 sm:py-12 lg:py-16">
        <div 
          className="absolute inset-0 theme-transition"
          style={{ 
            background: `linear-gradient(135deg, ${theme.backgroundGradient})`,
            '--glow-color': theme.colors.glowColor 
          }}
        />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-96 lg:h-96 bg-gradient-to-l from-white/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-96 lg:h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Theme indicator */}
            <div 
              className={`inline-flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-6 sm:py-3 rounded-full professional-glass ${
                loaded ? 'animate-professional-fade-in' : 'opacity-0'
              }`}
              style={{ animationDelay: '0.2s' }}
            >
              <span className="text-base sm:text-lg lg:text-2xl">{theme.icon}</span>
              <span className={`font-bold text-xs sm:text-sm lg:text-lg ${theme.text.strong}`}>
                {theme.label}
              </span>
            </div>

            {/* Main title */}
            <div 
              className={`space-y-2 sm:space-y-3 lg:space-y-4 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
              style={{ animationDelay: '0.4s' }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-tight">
                <span className={`${theme.text.strong} block sm:inline`}>
                  Próximos
                </span>
                <span className="text-gray-900 block sm:inline sm:ml-2 lg:ml-4">Eventos</span>
              </h1>
              
              <p className={`text-sm sm:text-base md:text-lg lg:text-xl ${theme.text.soft} max-w-3xl mx-auto leading-relaxed font-medium px-2 sm:px-4 lg:px-0`}>
                Únete a la comunidad, participa en torneos épicos y vive experiencias 
                únicas con otros planeswalkers.
              </p>
              
              <div className={`mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm ${theme.text.soft} opacity-80 px-2 sm:px-4 lg:px-0`}>
                <span className="font-semibold">Sabiduría del plano: </span>
                <span className="block sm:inline mt-1 sm:mt-0">{theme.fact}</span>
              </div>
            </div>

            {/* Action buttons - Optimizados para móvil */}
            <div 
              className={`flex flex-col gap-3 sm:gap-4 px-4 sm:px-0 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
              style={{ animationDelay: '0.6s' }}
            >
              <Link
                href="/events/new"
                className={`group relative w-full sm:w-auto sm:mx-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl ${theme.gradient} text-white font-bold text-sm sm:text-base lg:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 ${theme.colors.ring}`}
              >
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Evento
                </div>
              </Link>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto sm:mx-auto">
                <Link
                  href="/matches"
                  className="group w-full sm:w-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl bg-white/80 backdrop-blur-sm font-semibold text-gray-800 border-2 border-gray-300 hover:border-gray-400 hover:bg-white transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                >
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Ver Partidas
                  </div>
                </Link>

                <Link
                  href="/stats"
                  className="group w-full sm:w-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl bg-white/80 backdrop-blur-sm font-semibold text-gray-800 border-2 border-gray-300 hover:border-gray-400 hover:bg-white transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                >
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="hidden sm:inline">Estadísticas</span>
                    <span className="sm:hidden">Stats</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  function ProfessionalFilters({ theme, formats, selectedFormat, setSelectedFormat, query, setQuery, onClear, filteredEvents, showPastEvents, setShowPastEvents }) {
    const anyFilter = selectedFormat || query || showPastEvents

    return (
      <div 
        className="crystal-card animate-professional-fade-in"
        style={{ '--glow-color': theme.colors.glowColor }}
      >
        <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg" padding="none">
          <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`} />
          
          <div className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div>
                <h2 className={`text-lg sm:text-xl font-bold ${theme.text.strong} mb-1`}>
                  Filtros y Búsqueda
                </h2>
                <p className={`text-xs sm:text-sm ${theme.text.soft}`}>
                  Encuentra eventos específicos por formato, fecha o ubicación
                </p>
              </div>

              <div className="grid gap-3 sm:gap-4 lg:grid-cols-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <label className={`mb-2 block text-sm font-medium ${theme.text.strong}`}>
                    🔍 Buscar Eventos
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-4 w-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input 
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2 sm:py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all duration-200" 
                      placeholder="Título, formato, ubicación..." 
                      value={query} 
                      onChange={(e) => setQuery(e.target.value)} 
                    />
                    {query && (
                      <button 
                        type="button" 
                        onClick={() => setQuery('')} 
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Format filter */}
                <div>
                  <label className={`mb-2 block text-sm font-medium ${theme.text.strong}`}>
                    🎯 Formato
                  </label>
                  <div className="relative">
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2 sm:py-2.5 pl-3 pr-8 sm:pr-10 text-sm text-gray-900 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 appearance-none transition-all duration-200"
                    >
                      <option value="">Todos</option>
                      {formats.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Show past events toggle */}
                <div>
                  <label className={`mb-2 block text-sm font-medium ${theme.text.strong}`}>
                    ⏰ Mostrar
                  </label>
                  <label className="flex items-center gap-2 sm:gap-3 rounded-lg border border-gray-200 bg-white p-2 sm:p-2.5 cursor-pointer hover:bg-gray-50 transition-all duration-200">
                    <input
                      type="checkbox"
                      checked={showPastEvents}
                      onChange={(e) => setShowPastEvents(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200"
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Eventos pasados</span>
                  </label>
                </div>
              </div>

              {anyFilter && (
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full ${theme.colors.accent}/20`}>
                      <svg className={`h-3 w-3 sm:h-4 sm:w-4 ${theme.text.strong}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-xs sm:text-sm font-medium ${theme.text.strong}`}>Filtros activos</p>
                      <p className="text-xs text-gray-600">Mostrando {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <button 
                    onClick={onClear} 
                    className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-gray-300 bg-white px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Limpiar
                  </button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  function ProfessionalEventCard({ 
    event, 
    formatName, 
    creatorName, 
    participantCount, 
    currentUserId, 
    isParticipating, 
    theme, 
    index = 0, 
    onJoin, 
    onLeave,
    onShowCalendar
  }) {
    const [isHovered, setIsHovered] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const status = getEventStatus(event.starts_at, event.ends_at)
    const locationIcon = getLocationIcon(event.location)

    const handleJoinLeave = async (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      if (isLoading) return
      setIsLoading(true)

      try {
        if (isParticipating) {
          await onLeave(event.id)
        } else {
          await onJoin(event.id)
          // 🚀 MOSTRAR MODAL DE CALENDARIO AL APUNTARSE
          setTimeout(() => {
            onShowCalendar(event, creatorName)
          }, 500)
        }
      } finally {
        setIsLoading(false)
      }
    }

    const canJoin = currentUserId && status.key !== 'past' && (!event.capacity || participantCount < event.capacity)
    const isFull = event.capacity && participantCount >= event.capacity

    return (
      <div
        className="group crystal-card animate-professional-fade-in relative"
        style={{ animationDelay: `${index * 100}ms`, '--glow-color': theme.colors.glowColor }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${status.color} opacity-0 blur-xl transition-all duration-700 group-hover:opacity-10 -z-10`} />

        <Link href={`/events/${event.id}`} className="block focus:outline-none">
          <Card
            className="relative overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-500 hover:scale-[1.02] focus:ring-2 focus:ring-gray-500/20 focus:border-gray-400 h-full"
            padding="none"
          >
            <div className={`h-1 bg-gradient-to-r ${status.color}`} />

            {/* Header con estado - Optimizado para móvil */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-bold ${status.bg} ${status.text} ring-2 ring-white/20`}>
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r ${status.color}`} />
                      {status.label}
                    </span>
                    {event.visibility === 'private' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Privado
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
                    {event.title}
                  </h3>
                  
                  {event.description && (
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Información clave - Compacta para móvil */}
              <div className="space-y-2 sm:space-y-3">
                {/* Fecha y hora */}
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs sm:text-sm font-medium text-gray-700">
                    {formatEventDate(event.starts_at)}
                  </p>
                </div>

                {/* Formato */}
                {formatName && (
                  <div className="flex items-center gap-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-xs sm:text-sm font-medium text-gray-700">{formatName}</p>
                  </div>
                )}

                {/* Ubicación */}
                {event.location && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm">{locationIcon}</span>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 line-clamp-1">
                      {event.location}
                    </p>
                  </div>
                )}

                {/* Organizador */}
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                    {creatorName}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer con participantes y acciones - Optimizado para móvil */}
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    {participantCount} {participantCount !== 1 ? 'participantes' : 'participante'}
                    {event.capacity && ` / ${event.capacity}`}
                  </span>
                  {isFull && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.17 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Completo
                    </span>
                  )}
                </div>
                
                {isParticipating && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Apuntado
                  </span>
                )}
              </div>

              {/* Botones de acción - Stack en móvil */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className={`flex-1 flex items-center justify-center gap-2 rounded border-2 border-dashed transition-all duration-300 py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-medium ${
                  isHovered ? 'border-gray-300 bg-white text-gray-700 shadow-sm' : 'border-gray-200 bg-transparent text-gray-500'
                }`}>
                  <svg className={`h-3 w-3 sm:h-4 sm:w-4 transition-all duration-300 ${isHovered ? 'translate-x-0.5' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Ver Detalles</span>
                </div>

                {currentUserId && canJoin && (
                  <button
                    onClick={handleJoinLeave}
                    disabled={isLoading}
                    className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isParticipating
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500'
                        : `${theme.gradient} text-white hover:shadow-lg focus:ring-blue-500`
                    }`}
                  >
                    {isLoading ? (
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mx-auto" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                    ) : isParticipating ? (
                      'Cancelar'
                    ) : isFull ? (
                      'Lista de espera'
                    ) : (
                      'Apuntarse'
                    )}
                  </button>
                )}
              </div>
            </div>
          </Card>
        </Link>
      </div>
    )
  }

  function ProfessionalEmptyState({ theme, showPastEvents }) {
    return (
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-300 p-8 sm:p-16 text-center crystal-card">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent" />
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-l from-gray-100/30 to-transparent rounded-full blur-3xl" />
        
        <div className="relative space-y-6 sm:space-y-8">
          <div className="mx-auto">
            <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gray-100 flex items-center justify-center ring-4 ring-gray-200 shadow-lg animate-float-subtle mx-auto">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <h3 className={`text-2xl sm:text-3xl font-bold ${theme.text.strong}`}>
              {showPastEvents ? '¡No hay eventos en el archivo!' : '¡El calendario está vacío!'}
            </h3>
            <p className={`${theme.text.soft} max-w-md mx-auto leading-relaxed font-medium text-sm sm:text-base px-4 sm:px-0`}>
              {showPastEvents 
                ? 'No se encontraron eventos pasados que coincidan con los filtros.'
                : 'No hay eventos programados que coincidan con los criterios. ¡Sé el primero en organizar una batalla épica!'
              }
            </p>
          </div>
          
          <div className="flex flex-col gap-3 sm:gap-4 px-4 sm:px-0">
            <Link
              href="/events/new"
              className={`group px-6 py-3 sm:px-8 sm:py-4 rounded-xl ${theme.gradient} text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 ${theme.colors.ring}`}
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear Evento
              </div>
            </Link>
            
            <Link
              href="/matches/new"
              className="group px-6 py-3 sm:px-8 sm:py-4 rounded-xl bg-white border-2 border-gray-300 font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Partida
              </div>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // FAB — Botón flotante profesional - Optimizado para móvil
  function ProfessionalFab({ theme }) {
    return (
      <Link
        href="/events/new"
        aria-label="Crear nuevo evento"
        className={`fixed right-4 sm:right-6 z-30 hidden sm:inline-flex items-center gap-2 rounded-full ${theme.gradient} px-4 py-2.5 sm:px-5 sm:py-3 text-white shadow-xl ring-1 ring-black/10 transition-all duration-300 hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 ${theme.colors.ring} animate-float-subtle`}
        style={{ 
          bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
          '--glow-color': theme.colors.glowColor
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="font-semibold text-sm sm:text-base">Nuevo evento</span>
        <div className="absolute inset-0 rounded-full opacity-0 transition-all duration-500 hover:opacity-100 animate-pulse-glow -z-10" 
            style={{ boxShadow: `0 0 20px ${theme.colors.glowColor}` }} />
      </Link>
    )
  }

  // Barra móvil profesional - CORREGIDA
  function ProfessionalMobileBar({ theme }) {
    return (
      <div
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center border-t border-gray-200/80 bg-white/95 backdrop-blur-lg px-4 py-3 sm:hidden"
        style={{ 
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
          // Asegurar que quede completamente abajo
          marginBottom: 0
        }}
      >
        <Link
          href="/events/new"
          className={`w-full max-w-sm rounded-full ${theme.gradient} px-5 py-3 text-center font-semibold text-white shadow-xl ring-1 ring-black/10 transition-all duration-300 active:scale-95`}
          aria-label="Crear nuevo evento"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo evento
          </div>
        </Link>
      </div>
    )
  }

  function DayEventsModal({
    isOpen, onClose, day, events = [], theme,
    onJoinEvent, onLeaveEvent, currentUser,
    participants = [], profiles = []
  }) {
    if (!isOpen) return null

    const userParticipations = useMemo(() => {
      if (!currentUser) return {}
      const map = {}
      participants.filter(p => p.user_id === currentUser.id).forEach(p => { map[p.event_id] = p })
      return map
    }, [participants, currentUser])

    const participantsByEventId = useMemo(() => {
      const acc = {}
      for (const p of participants) {
        if (!acc[p.event_id]) acc[p.event_id] = []
        acc[p.event_id].push(p)
      }
      return acc
    }, [participants])

    const profileById = useMemo(() => {
      const acc = {}
      for (const p of profiles) acc[p.id] = p.nickname || 'Usuario'
      return acc
    }, [profiles])

    return (
      <div className="fixed inset-0 z-[2000] overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-3 sm:p-4 text-center sm:items-center">
          {/* Backdrop */}
          <div className="fixed inset-0 z-[1990] bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

          {/* Panel */}
          <div className="relative z-[2000] w-full max-w-2xl max-h-[80vh] transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all">
            <div className={`bg-gradient-to-r ${theme.colors.primary} px-4 py-4 sm:px-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    📅 Eventos del {format(day, "d 'de' MMMM", { locale: es })}
                  </h3>
                  <p className="text-sm text-white/80">
                    {events.length} evento{events.length !== 1 ? 's' : ''} programado{events.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button onClick={onClose} className="rounded-lg p-1.5 text-white/80 hover:text-white hover:bg-white/20">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="bg-white px-4 py-4 sm:px-6 max-h-[60vh] overflow-y-auto">
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No hay eventos</h4>
                  <p className="text-gray-600">No hay eventos programados para este día.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => {
                    const status = getEventStatus(event.starts_at, event.ends_at)
                    const eventParticipants = participantsByEventId[event.id] || []
                    const participantCount = eventParticipants.filter(p => p.status === 'going').length
                    const isParticipating = currentUser
                      ? eventParticipants.some(p => p.user_id === currentUser.id && p.status === 'going')
                      : false
                    const creatorName = profileById[event.created_by] || 'Organizador'
                    const canJoin = currentUser && status.key !== 'past' && (!event.capacity || participantCount < event.capacity)
                    const isFull = event.capacity && participantCount >= event.capacity

                    return (
                      <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${status.bg} ${status.text}`}>
                                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${status.color}`} />
                                {status.label}
                              </span>
                              {isParticipating && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Apuntado
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                            {event.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{event.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{format(new Date(event.starts_at), 'HH:mm')} - {format(new Date(event.ends_at), 'HH:mm')}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>{getLocationIcon(event.location)}</span>
                              <span>{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>{creatorName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 004 0z" />
                            </svg>
                            <span>{participantCount} participante{participantCount !== 1 ? 's' : ''}</span>
                            {isFull && <span className="text-red-600 font-medium">• Completo</span>}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Link href={`/events/${event.id}`} className="flex-1 text-center px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium">
                            Ver Detalles
                          </Link>
                          {currentUser && canJoin && (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                if (isParticipating) onLeaveEvent(event.id)
                                else onJoinEvent(event.id)
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isParticipating
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : `${theme.gradient} text-white hover:shadow-lg`
                              }`}
                            >
                              {isParticipating ? 'Cancelar' : isFull ? 'Lista de espera' : 'Apuntarse'}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

 function CalendarGrid({
 theme,
 events = [],
 participants = [],
 profiles = [],
 currentUser = null,
 onJoinEvent,
 onShowCalendar
}) {
 const [currentDate, setCurrentDate] = useState(new Date())
 // 🔥 NUEVOS ESTADOS PARA EL MODAL
 const [selectedDay, setSelectedDay] = useState(null)
 const [selectedDayEvents, setSelectedDayEvents] = useState([])

 // Mapa de participaciones del usuario actual
 const userParticipations = useMemo(() => {
   if (!currentUser) return {}
   const map = {}
   participants.filter(p => p.user_id === currentUser.id).forEach(p => { map[p.event_id] = p })
   return map
 }, [participants, currentUser])

 // Agrupar eventos por día (clave yyyy-MM-dd)
 const eventsByDay = useMemo(() => {
   const grouped = {}
   for (const ev of events) {
     const key = format(new Date(ev.starts_at), 'yyyy-MM-dd')
     if (!grouped[key]) grouped[key] = []
     grouped[key].push({
       ...ev,
       participation: userParticipations[ev.id],
       isOwned: ev.created_by === currentUser?.id
     })
   }
   return grouped
 }, [events, userParticipations, currentUser])

 // Días visibles (lunes a domingo)
 const calendarDays = useMemo(() => {
   const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 })
   const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
   return eachDayOfInterval({ start, end })
 }, [currentDate])

 const next = () => setCurrentDate(addMonths(currentDate, 1))
 const prev = () => setCurrentDate(subMonths(currentDate, 1))
 const today = () => setCurrentDate(new Date())

 // 🔥 NUEVA FUNCIÓN PARA MANEJAR CLICK EN DÍA
 const handleDayClick = (day, dayEvents) => {
   if (dayEvents.length > 0) {
     setSelectedDay(day)
     setSelectedDayEvents(dayEvents)
   }
 }

 // 🔥 NUEVA FUNCIÓN PARA MANEJAR SALIDA DE EVENTOS DESDE EL MODAL
 const handleLeaveEventFromModal = async (eventId) => {
   if (!currentUser) return

   try {
     const { error } = await supabase
       .from('event_participants')
       .delete()
       .eq('event_id', eventId)
       .eq('user_id', currentUser.id)

     if (error) throw error

     // Actualizar eventos del día seleccionado
     setSelectedDayEvents(prev => prev.filter(e => e.id !== eventId))
     
   } catch (error) {
     console.error('Error leaving event:', error)
     alert('Error al cancelar participación')
   }
 }

 const chipColor = (ev) => {
   if (ev.participation?.status === 'going') return 'border-green-400 bg-green-100 text-green-800'
   if (ev.visibility === 'public' && !ev.participation) return 'border-blue-200 bg-blue-50 text-blue-700'
   switch (ev.participation?.status) {
     case 'maybe': return 'border-amber-400 bg-amber-100 text-amber-800'
     case 'waitlist': return 'border-purple-400 bg-purple-100 text-purple-800'
     default: return 'border-gray-300 bg-gray-100 text-gray-600'
   }
 }

 const weekdays = [
   { full: 'Lunes', short: 'Lun', mobile: 'L' },
   { full: 'Martes', short: 'Mar', mobile: 'M' },
   { full: 'Miércoles', short: 'Mié', mobile: 'X' },
   { full: 'Jueves', short: 'Jue', mobile: 'J' },
   { full: 'Viernes', short: 'Vie', mobile: 'V' },
   { full: 'Sábado', short: 'Sáb', mobile: 'S' },
   { full: 'Domingo', short: 'Dom', mobile: 'D' }
 ]

 return (
   <>
     <div className="crystal-card animate-professional-fade-in">
       <Card className="relative overflow-hidden bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl" padding="none">
         <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`} />

         {/* Header de Navegación */}
         <div className="bg-white border-b border-gray-200">
           <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
             {/* Controles de navegación */}
             <div className="flex items-center space-x-2">
               <button 
                 onClick={prev}
                 className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                 aria-label="Mes anterior"
               >
                 <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                 </svg>
               </button>
               
               <button 
                 onClick={next}
                 className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                 aria-label="Mes siguiente"
               >
                 <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                 </svg>
               </button>
             </div>

             {/* Título del mes - Centrado */}
             <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 text-center flex-1 mx-4">
               {format(currentDate, "MMMM 'de' yyyy", { locale: es })}
             </h2>

             {/* Botón Hoy */}
             <button 
               onClick={today}
               className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 text-sm font-medium text-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
             >
               Hoy
             </button>
           </div>
         </div>

         {/* Días de la semana */}
         <div className="bg-gray-50 border-b border-gray-200">
           <div className="grid grid-cols-7">
             {weekdays.map((day, index) => (
               <div 
                 key={index} 
                 className="px-2 py-3 text-center border-r border-gray-200 last:border-r-0"
               >
                 {/* Escritorio */}
                 <span className="hidden lg:inline text-sm font-semibold text-gray-700 uppercase tracking-wide">
                   {day.full}
                 </span>
                 {/* Tablet */}
                 <span className="hidden sm:inline lg:hidden text-sm font-semibold text-gray-700 uppercase tracking-wide">
                   {day.short}
                 </span>
                 {/* Móvil */}
                 <span className="sm:hidden text-sm font-bold text-gray-700 uppercase">
                   {day.mobile}
                 </span>
               </div>
             ))}
           </div>
         </div>

         {/* Rejilla del calendario */}
         <div className="bg-white">
           <div className="grid grid-cols-7">
             {calendarDays.map((day, dayIndex) => {
               const key = format(day, 'yyyy-MM-dd')
               const dayEvents = eventsByDay[key] || []
               const inMonth = isSameMonth(day, currentDate)
               const todayFlag = isToday(day)
               const isWeekend = day.getDay() === 0 || day.getDay() === 6
               const dayNumber = parseInt(format(day, 'd'))
               const hasEvents = dayEvents.length > 0
               
               // Determinar altura de la celda
               const cellHeight = 'h-20 sm:h-24 md:h-28 lg:h-32 xl:h-36'
               
               return (
<button 
  key={key}
  onClick={() => handleDayClick(day, dayEvents)}
  className={`
    ${cellHeight}
    relative overflow-hidden w-full text-left
    border-r border-b border-gray-200 last:border-r-0
    ${inMonth 
      ? isWeekend ? 'bg-gray-50/50' : 'bg-white'
      : 'bg-gray-100/70'
    }
    hover:bg-gray-50 transition-colors duration-150
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
    ${hasEvents ? 'cursor-pointer hover:shadow-sm' : 'cursor-default'}
    group
  `}
  disabled={!hasEvents}
>
  {/* Contenedor principal */}
  <div className="h-full flex flex-col">
    {/* Header del día */}
    <div className="flex-shrink-0 p-2 flex items-center justify-between">
      {/* Número del día */}
      <div className={`
        flex items-center justify-center
        w-6 h-6 sm:w-7 sm:h-7
        rounded-full text-xs sm:text-sm font-bold
        transition-all duration-200
        ${todayFlag 
          ? `bg-gradient-to-r ${theme.colors.primary} text-white shadow-lg`
          : inMonth
            ? 'text-gray-900 group-hover:bg-gray-100'
            : 'text-gray-400'
        }
      `}>
        {dayNumber}
      </div>
      
      {/* Badge de eventos - Solo en desktop */}
      {hasEvents && (
        <div className={`
          hidden sm:flex items-center justify-center
          w-4 h-4 sm:w-5 sm:h-5
          rounded-full text-[10px] sm:text-xs font-bold
          transition-transform duration-200 group-hover:scale-110
          ${dayEvents.some(ev => ev.participation?.status === 'going')
            ? 'bg-green-500 text-white shadow-sm'
            : 'bg-blue-500 text-white shadow-sm'
          }
        `}>
          {dayEvents.length > 9 ? '9+' : dayEvents.length}
        </div>
      )}
    </div>

    {/* Vista móvil: contador centrado */}
    <div className="sm:hidden flex-1 flex items-center justify-center">
      {hasEvents ? (
        <div className="text-center">
          <div className="text-xs font-semibold text-blue-600 mb-1">
            {dayEvents.length}
          </div>
          <div className="text-[9px] text-gray-500 leading-none">
            evento{dayEvents.length !== 1 ? 's' : ''}
          </div>
        </div>
      ) : null}
    </div>

    {/* Vista desktop: eventos detallados */}
    <div className="hidden sm:block flex-1 px-1.5 pb-1 overflow-hidden">
      <div className="space-y-1">
        {dayEvents.slice(0, 3).map((ev, i) => (
          <div
            key={ev.id}
            className={`
              px-1.5 py-0.5 rounded text-[10px] font-medium truncate
              border transition-all duration-200
              ${chipColor(ev)}
              group-hover:scale-105
            `}
            title={ev.title}
          >
            {ev.title}
          </div>
        ))}
        {dayEvents.length > 3 && (
          <div className="text-[9px] text-gray-500 font-medium px-1.5">
            +{dayEvents.length - 3} más
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Overlay de hover solo si hay eventos */}
  {hasEvents && (
    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
  )}
</button>
               )
             })}
           </div>
         </div>

         {/* Leyenda mejorada */}
         <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3">
           {/* Instrucciones para móvil */}
           <div className="sm:hidden mb-3 text-center">
             <p className="text-xs text-gray-600 font-medium">
               📱 Toca cualquier día para ver sus eventos
             </p>
           </div>
           
           {/* Leyenda de colores */}
           <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-green-500 ring-2 ring-green-200"></div>
               <span className="text-xs sm:text-sm text-gray-600 font-medium">Participando</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-200"></div>
               <span className="text-xs sm:text-sm text-gray-600 font-medium">Disponible</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-gray-400 ring-2 ring-gray-200"></div>
               <span className="text-xs sm:text-sm text-gray-600 font-medium">Finalizado</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-200"></div>
               <span className="text-xs sm:text-sm text-gray-600 font-medium">Próximamente</span>
             </div>
           </div>
         </div>
       </Card>
     </div>

     {/* 🔥 MODAL DE EVENTOS DEL DÍA */}
     <DayEventsModal
       isOpen={selectedDay !== null}
       onClose={() => {
         setSelectedDay(null)
         setSelectedDayEvents([])
       }}
       day={selectedDay}
       events={selectedDayEvents}
       theme={theme}
       onJoinEvent={onJoinEvent}
       onLeaveEvent={handleLeaveEventFromModal}
       currentUser={currentUser}
       participants={participants}
       profiles={profiles}
     />
   </>
 )
}

  /* ===============================================================
    MAIN COMPONENT
    =============================================================== */
  export default function ProfessionalEventsList({
    initialEvents = [],
    initialProfiles = [],
    initialFormats = [],
    initialParticipants = []
  }) {
    const { theme } = useThemeRotation(40000)

    // Datos
    const [events, setEvents] = useState(initialEvents)
    const [profiles, setProfiles] = useState(initialProfiles)
    const [formats, setFormats] = useState(initialFormats)
    const [participants, setParticipants] = useState(initialParticipants)

    // Usuario actual
    const [currentUser, setCurrentUser] = useState(null)

    // UI
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [view, setView] = useState('list') // 'list' | 'calendar'

    // Filtros
    const [selectedFormat, setSelectedFormat] = useState('')
    const [query, setQuery] = useState('')
    const [showPastEvents, setShowPastEvents] = useState(false)

    // 🚀 NUEVO: Estado para el modal de calendario automático
    const [calendarModal, setCalendarModal] = useState({ isOpen: false, event: null, creatorName: null })

    // Cargar usuario actual y datos si no hay SSR
    useEffect(() => {
      let ignore = false
      
      const loadInitialData = async () => {
        console.log('🔄 Loading events from client...')
        console.log('📊 Initial data:', { 
          events: events.length, 
          profiles: profiles.length, 
          formats: formats.length,
          participants: participants.length
        })

        // Cargar usuario actual
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user && !ignore) {
            setCurrentUser(user)
          }
        } catch (err) {
          console.error('Error loading user:', err)
        }

        // Si no hay eventos del SSR, cargar desde cliente
        if (events.length === 0) {
          console.log('📱 No SSR data, loading from client...')
          setLoading(true)
          try {
            const [
              { data: eventsData, error: eventsError },
              { data: profilesData, error: profilesError },
              { data: formatsData, error: formatsError },
              { data: participantsData, error: participantsError }
            ] = await Promise.all([
              supabase.from('events').select('*').order('starts_at', { ascending: true }),
              supabase.from('profiles').select('id, nickname'),
              supabase.from('games').select('id, name'),
              supabase.from('event_participants').select('event_id, user_id, status, created_at')
            ])
            
            if (!ignore) {
              if (eventsError || profilesError || formatsError || participantsError) {
                const firstError = eventsError || profilesError || formatsError || participantsError
                setError(firstError.message)
              } else {
                setEvents(eventsData || [])
                setProfiles(profilesData || [])
                setFormats(formatsData || [])
                setParticipants(participantsData || [])
              }
            }
          } catch (err) {
            if (!ignore) {
              console.error('💥 Client query exception:', err)
              setError('Error al cargar los datos')
            }
          } finally {
            if (!ignore) {
              setLoading(false)
            }
          }
        } else {
          setLoading(false)
        }
      }
      
      loadInitialData()
    return () => { ignore = true }
    }, [events.length, formats.length, participants.length, profiles.length]) 

    // Maps para optimización (corregir verificaciones)
    const formatById = useMemo(() => {
      if (!formats || formats.length === 0) return {}
      const acc = {}
      for (const f of formats) acc[f.id] = f.name
      return acc
    }, [formats])

    const profileById = useMemo(() => {
      if (!profiles || profiles.length === 0) return {}
      const acc = {}
      for (const p of profiles) acc[p.id] = p.nickname
      return acc
    }, [profiles])

    const participantsByEventId = useMemo(() => {
      if (!participants || participants.length === 0) return {}
      const acc = {}
      for (const p of participants) {
        if (!acc[p.event_id]) acc[p.event_id] = []
        acc[p.event_id].push(p)
      }
      return acc
    }, [participants])

    // Eventos filtrados
    const filteredEvents = useMemo(() => {
      const q = query.trim().toLowerCase()
      const now = new Date()
      
      return events.filter((event) => {
        // Filtro de tiempo
        if (!showPastEvents) {
          const endDate = new Date(event.ends_at)
          if (isBefore(endDate, now)) return false
        }

        // Filtro de formato
        if (selectedFormat && event.game_id !== selectedFormat) return false

        // Filtro de búsqueda
        if (!q) return true

        const title = (event.title || '').toLowerCase()
        const description = (event.description || '').toLowerCase()
        const location = (event.location || '').toLowerCase()
        const formatName = (formatById[event.game_id] || '').toLowerCase()
        const creatorName = (profileById[event.created_by] || '').toLowerCase()

        return (
          title.includes(q) ||
          description.includes(q) ||
          location.includes(q) ||
          formatName.includes(q) ||
          creatorName.includes(q)
        )
      })
    }, [events, selectedFormat, query, showPastEvents, formatById, profileById])

    // 🚀 FUNCIÓN: Mostrar modal de calendario (corregir para usar useCallback)
    const handleShowCalendar = useCallback((event, creatorName) => {
      setCalendarModal({ isOpen: true, event, creatorName })
    }, [])

// Acciones de participación (corregir para usar useCallback)
const handleJoinEvent = useCallback(async (eventId) => {
  if (!currentUser) return

  try {
    const { error } = await supabase
      .from('event_participants')
      .insert({
        event_id: eventId,
        user_id: currentUser.id,
        status: 'going'
      })

    if (error) throw error

    // Actualizar estado local
    setParticipants(prev => [...prev, {
      event_id: eventId,
      user_id: currentUser.id,
      status: 'going',
      created_at: new Date().toISOString()
    }])
  } catch (error) {
    console.error('Error joining event:', error)
    alert('Error al apuntarse al evento')
  }
}, [currentUser])

const handleLeaveEvent = useCallback(async (eventId) => {
  if (!currentUser) return

  try {
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', currentUser.id)

    if (error) throw error

    // Actualizar estado local
    setParticipants(prev => 
      prev.filter(p => !(p.event_id === eventId && p.user_id === currentUser.id))
    )
  } catch (error) {
    console.error('Error leaving event:', error)
    alert('Error al cancelar participación')
  }
}, [currentUser])

    if (loading) {
      return (
        <div className="min-h-screen theme-transition pb-20 sm:pb-8" style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})` }}>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12 lg:space-y-16">
            <ProfessionalHero theme={theme} />
            {/* Toggle Lista / Calendario */}
            <div className="flex items-center justify-center">
              <div className="inline-flex rounded-lg bg-gray-100 p-1">
                <button
                  onClick={() => setView('list')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📋 Lista
                </button>
                <button
                  onClick={() => setView('calendar')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    view === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📅 Calendario
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center py-12 sm:py-20">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center mx-auto shadow-lg">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                </div>
                <p className={`text-base sm:text-lg font-medium ${theme.text.strong}`}>Cargando eventos...</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="min-h-screen theme-transition pb-20 sm:pb-8" style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})` }}>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12 lg:space-y-16">
            <ProfessionalHero theme={theme} />
            <div className="crystal-card">
              <Card className="border border-red-300 bg-red-50/90 backdrop-blur-sm shadow-lg">
                <div className="rounded-xl border-2 border-red-300 bg-red-100/50 p-6 sm:p-8 text-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-red-800 mb-2">Error al cargar los eventos</h3>
                  <p className="text-red-700 font-medium text-sm sm:text-base">{error}</p>
                </div>
              </Card>
            </div>
            <ProfessionalFab theme={theme} />
            <ProfessionalMobileBar theme={theme} />
          </div>
        </div>
      )
    }

  return (
    <div
      className="min-h-screen theme-transition pb-20 sm:pb-24"
      style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})` }}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12 lg:space-y-16">
        <ProfessionalHero theme={theme} />

        {/* Toggle Lista / Calendario */}
        <div className="flex items-center justify-center">
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                view === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Lista
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                view === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📅 Calendario
            </button>
          </div>
        </div>

        {/* ——— LISTA ——— */}
        {view === 'list' && (
          <>
            <ProfessionalFilters
              theme={theme}
              formats={formats}
              selectedFormat={selectedFormat}
              setSelectedFormat={setSelectedFormat}
              query={query}
              setQuery={setQuery}
              onClear={() => {
                setSelectedFormat('')
                setQuery('')
                setShowPastEvents(false)
              }}
              filteredEvents={filteredEvents}
              showPastEvents={showPastEvents}
              setShowPastEvents={setShowPastEvents}
            />

            {filteredEvents.length === 0 ? (
              <ProfessionalEmptyState theme={theme} showPastEvents={showPastEvents} />
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {/* Stats header */}
                <div className="text-center">
                  <p className={`text-base sm:text-lg ${theme.text.soft} font-medium`}>
                    {filteredEvents.length} evento
                    {filteredEvents.length !== 1 ? 's' : ''} encontrado
                    {filteredEvents.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Events grid - Responsive */}
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredEvents.map((event, index) => {
                    const formatName = formatById[event.game_id] || null
                    const creatorName =
                      profileById[event.created_by] || 'Organizador desconocido'
                    const eventParticipants = participantsByEventId[event.id] || []
                    const participantCount = eventParticipants.filter(
                      (p) => p.status === 'going'
                    ).length
                    const isParticipating = currentUser
                      ? eventParticipants.some(
                          (p) => p.user_id === currentUser.id && p.status === 'going'
                        )
                      : false

                    return (
                      <ProfessionalEventCard
                        key={event.id}
                        event={event}
                        formatName={formatName}
                        creatorName={creatorName}
                        participantCount={participantCount}
                        currentUserId={currentUser?.id}
                        isParticipating={isParticipating}
                        theme={theme}
                        index={index}
                        onJoin={handleJoinEvent}
                        onLeave={handleLeaveEvent}
                        onShowCalendar={handleShowCalendar}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ——— CALENDARIO ——— */}
        {view === 'calendar' && (
          <CalendarGrid
            theme={theme}
            events={filteredEvents}
            participants={participants}
            profiles={profiles}
            currentUser={currentUser}
            onJoinEvent={handleJoinEvent}
            onShowCalendar={handleShowCalendar}
          />
        )}

        <ProfessionalFab theme={theme} />
        <ProfessionalMobileBar theme={theme} />

        {/* Theme indicator footer */}
        <footer className="py-6 sm:py-8 text-center">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <span className={`text-xs sm:text-sm font-medium ${theme.text.soft}`}>
                Tema actual:
              </span>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-lg"
                  style={{ background: `linear-gradient(45deg, ${theme.colors.primary})` }}
                />
                <span
                  className={`font-bold text-sm sm:text-base ${theme.text.strong}`}
                >
                  {theme.label}
                </span>
              </div>
            </div>
            <p className={`text-xs ${theme.text.soft} opacity-75`}>
              El tema cambia automáticamente cada 40 segundos
            </p>
          </div>
        </footer>
      </div>

      {/* 🚀 MODAL DE CALENDARIO AUTOMÁTICO */}
      <AutoCalendarModal
        isOpen={calendarModal.isOpen}
        onClose={() =>
          setCalendarModal({ isOpen: false, event: null, creatorName: null })
        }
        event={calendarModal.event}
        creatorName={calendarModal.creatorName}
      />
    </div>
  )

  }

  /* ===============================================================
    SSR - DATOS DEL SERVIDOR
    =============================================================== */
  export async function getServerSideProps({ req, res }) {
    const supabase = createSupabaseServerClient(req, res)

    try {
      console.log('🔍 SSR: Loading events data...')
      
      // 1) Cargar datos base en paralelo
      const [profilesRes, eventsRes, participantsRes, gamesRes] = await Promise.allSettled([
        supabase.from('profiles').select('id, nickname'),
        supabase
          .from('events')
          .select('*')
          .order('starts_at', { ascending: true }),
        supabase
          .from('event_participants')
          .select('event_id, user_id, status, created_at'),
        supabase.from('games').select('id, name'),
      ])

      console.log('📊 SSR Results:', {
        profiles: profilesRes.status === 'fulfilled' ? profilesRes.value.data?.length : profilesRes.reason,
        events: eventsRes.status === 'fulfilled' ? eventsRes.value.data?.length : eventsRes.reason,
        participants: participantsRes.status === 'fulfilled' ? participantsRes.value.data?.length : participantsRes.reason,
        games: gamesRes.status === 'fulfilled' ? gamesRes.value.data?.length : gamesRes.reason,
      })

      const profiles = profilesRes.status === 'fulfilled' ? (profilesRes.value.data || []) : []
      const events = eventsRes.status === 'fulfilled' ? (eventsRes.value.data || []) : []
      const participants = participantsRes.status === 'fulfilled' ? (participantsRes.value.data || []) : []
      const games = gamesRes.status === 'fulfilled' ? (gamesRes.value.data || []) : []

      console.log('✅ SSR: Returning data:', { 
        eventsCount: events.length, 
        profilesCount: profiles.length,
        participantsCount: participants.length,
        gamesCount: games.length
      })

      return {
        props: {
          initialEvents: events,
          initialProfiles: profiles,
          initialFormats: games,
          initialParticipants: participants,
        },
      }
    } catch (error) {
      console.error('💥 SSR Error fetching events data:', error)
      return {
        props: {
          initialEvents: [],
          initialProfiles: [],
          initialFormats: [],
          initialParticipants: [],
        },
      }
    }
  }