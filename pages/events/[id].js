import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { format, addDays, isBefore, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '../../lib/supabaseClient'
import PageHeader from '../../components/PageHeader'

/* ===============================================================
  FUNCIONES DE CALENDARIO AVANZADAS
  =============================================================== */
function generateEnhancedICS(event) {
  const startDate = new Date(event.starts_at)
  const endDate = new Date(event.ends_at || new Date(startDate.getTime() + 3 * 60 * 60 * 1000))
  
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

function generateCalendarLinks(event) {
  const startDate = new Date(event.starts_at)
  const endDate = new Date(event.ends_at || new Date(startDate.getTime() + 3 * 60 * 60 * 1000))
  
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
  MODAL DE CALENDARIO PREMIUM
  =============================================================== */
function CalendarModal({ isOpen, onClose, event, autoTriggered = false }) {
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
        
        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-xl sm:rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-sm sm:max-w-lg">
          {/* Header */}
          <div className={`${autoTriggered ? 'bg-gradient-to-r from-green-600 to-emerald-700' : 'bg-gradient-to-r from-blue-600 to-indigo-700'} px-4 py-4 sm:px-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                  {autoTriggered ? (
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {autoTriggered ? '🎉 ¡Te has apuntado!' : '📅 Añadir a calendario'}
                  </h3>
                  <p className="text-sm text-white/80">
                    {autoTriggered ? '¿Quieres añadirlo a tu calendario?' : 'Elige tu calendario preferido'}
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
              {/* Event info */}
              <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base line-clamp-2">{event.title}</h4>
                <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                  <p>📅 {format(new Date(event.starts_at), "d 'de' MMMM 'a las' HH:mm", { locale: es })}</p>
                  <p>📍 {event.location || 'Ubicación por confirmar'}</p>
                </div>
              </div>

              {/* Calendar options */}
              <div>
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

              {/* Notifications */}
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

              {/* Actions para modal automático */}
              {autoTriggered && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Ahora no
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===============================================================
  MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
  =============================================================== */
function DeleteEventModal({ isOpen, onClose, onConfirm, event, participantCount = 0 }) {
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  
  const canDelete = confirmText === event?.title
  const hasParticipants = participantCount > 0

  const handleDelete = async () => {
    if (!canDelete) return
    
    setIsDeleting(true)
    try {
      await onConfirm()
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.17 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  Eliminar evento
                </h3>
                
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-gray-500">
                    Esta acción no se puede deshacer. El evento será eliminado permanentemente.
                  </p>

                  {/* Información del evento */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{event?.title}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📅 {new Date(event?.starts_at).toLocaleDateString('es-ES')}</p>
                      <p>👥 {participantCount} participante{participantCount !== 1 ? 's' : ''}</p>
                      {hasParticipants && (
                        <p className="text-amber-600 font-medium">
                          ⚠️ Los participantes serán notificados de la cancelación
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Confirmación por texto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Para confirmar, escribe el nombre del evento:
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder={event?.title}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={handleDelete}
              disabled={!canDelete || isDeleting}
              className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Eliminando...
                </div>
              ) : (
                'Eliminar evento'
              )}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 sm:mt-0 sm:w-auto"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===============================================================
  BOTÓN DE ELIMINACIÓN MEJORADO
  =============================================================== */
function ImprovedDeleteButton({ event, participantCount = 0, onDelete, className = "" }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleConfirmDelete = async () => {
    try {
      await onDelete(event.id)
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Error deleting event:', error)
      // El error se maneja en el componente padre
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowDeleteModal(true)}
        className={`inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors ${className}`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Eliminar evento
      </button>

      <DeleteEventModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        event={event}
        participantCount={participantCount}
      />
    </>
  )
}

/* ===============================================================
  UTILIDADES
  =============================================================== */
function formatEventDate(date) {
  try {
    const d = new Date(date)
    const now = new Date()

    // Hoy
    if (d.toDateString() === now.toDateString()) {
      return `Hoy a las ${format(d, 'HH:mm')}`
    }

    // Mañana
    const tomorrow = addDays(now, 1)
    if (d.toDateString() === tomorrow.toDateString()) {
      return `Mañana a las ${format(d, 'HH:mm')}`
    }

    // Dentro de la semana
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
    return { 
      key: 'past', 
      label: 'Finalizado', 
      color: 'from-gray-500 to-gray-600', 
      bg: 'bg-gray-50', 
      text: 'text-gray-700', 
      ring: 'ring-gray-200', 
      bgCard: 'bg-gray-100',
      statusBadge: 'bg-gray-100 text-gray-700',
      icon: '✅'
    }
  }

  if (isAfter(now, start) && isBefore(now, end)) {
    return { 
      key: 'active', 
      label: 'En curso', 
      color: 'from-green-500 to-emerald-600', 
      bg: 'bg-green-50', 
      text: 'text-green-800', 
      ring: 'ring-green-200', 
      bgCard: 'bg-green-100',
      statusBadge: 'bg-green-100 text-green-800',
      icon: '🔴'
    }
  }

  // Próximo evento (menos de 2 horas)
  const twoHoursFromNow = new Date(now)
  twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2)
  if (isBefore(start, twoHoursFromNow)) {
    return { 
      key: 'soon', 
      label: 'Próximamente', 
      color: 'from-amber-500 to-orange-600', 
      bg: 'bg-amber-50', 
      text: 'text-amber-800', 
      ring: 'ring-amber-200', 
      bgCard: 'bg-amber-100',
      statusBadge: 'bg-amber-100 text-amber-800',
      icon: '⏰'
    }
  }

  return { 
    key: 'scheduled', 
    label: 'Programado', 
    color: 'from-blue-500 to-indigo-600', 
    bg: 'bg-blue-50', 
    text: 'text-blue-800', 
    ring: 'ring-blue-200', 
    bgCard: 'bg-blue-100',
    statusBadge: 'bg-blue-100 text-blue-800',
    icon: '📅'
  }
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
  COMPONENTE PRINCIPAL
  =============================================================== */
export default function EventDetail() {
  const router = useRouter()
  const { id } = router.query

  const [event, setEvent] = useState(null)
  const [participants, setParticipants] = useState([])
  const [profiles, setProfiles] = useState([])
  const [games, setGames] = useState([])

  const [sessionUserId, setSessionUserId] = useState(null)
  const [userParticipation, setUserParticipation] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Estados para modales
  const [showAutoCalendarModal, setShowAutoCalendarModal] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)

  const isOwner = !!(event && sessionUserId && event.created_by === sessionUserId)
  const status = event ? getEventStatus(event.starts_at, event.ends_at) : null

  // Cargar sesión actual
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSessionUserId(session?.user?.id || null)
    })()
  }, [])

  // Cargar evento y datos relacionados
  useEffect(() => {
    if (!id) return
    let ignore = false
    ;(async () => {
      setLoading(true); setError(null)
      const [evtRes, partsRes, gamesRes, profRes] = await Promise.all([
        supabase.from('events').select('*').eq('id', id).single(),
        supabase.from('event_participants').select('*').eq('event_id', id),
        supabase.from('games').select('id, name').order('name', { ascending: true }),
        supabase.from('profiles').select('id, nickname, avatar_url')
      ])

      if (ignore) return

      if (evtRes.error) {
        setError(evtRes.error.message || 'No se pudo cargar el evento')
        setLoading(false)
        return
      }

      setEvent(evtRes.data || null)
      setParticipants(partsRes.data || [])
      setGames(gamesRes.data || [])
      setProfiles(profRes.data || [])
      setLoading(false)
    })()
    return () => { ignore = true }
  }, [id])

  // Encontrar participación del usuario actual
  useEffect(() => {
    if (!sessionUserId || !participants.length) {
      setUserParticipation(null)
      return
    }
    const userParticipant = participants.find(p => p.user_id === sessionUserId)
    setUserParticipation(userParticipant || null)
  }, [sessionUserId, participants])

  // Lookups
  const nickById = useMemo(() => {
    const acc = {}; for (const p of profiles) acc[p.id] = p.nickname || 'Jugador'; return acc
  }, [profiles])
  
  const avatarById = useMemo(() => {
    const acc = {}; for (const p of profiles) acc[p.id] = p.avatar_url || null; return acc
  }, [profiles])
  
  const gameById = useMemo(() => {
    const acc = {}; for (const g of games) acc[g.id] = g.name; return acc
  }, [games])

  // Derivados
  const confirmedParticipants = useMemo(
    () => participants.filter(p => p.status === 'going'),
    [participants]
  )
  const maybeParticipants = useMemo(
    () => participants.filter(p => p.status === 'maybe'),
    [participants]
  )
  const waitlistParticipants = useMemo(
    () => participants.filter(p => p.status === 'waitlist'),
    [participants]
  )

  // Manejar participación con modal automático
  const handleJoinEvent = async (desired = 'going') => {
    if (!sessionUserId || !event) return
    setActionLoading(true)

    const isFull = !!(event.capacity && confirmedParticipants.length >= event.capacity)
    const newStatus = desired === 'going' && isFull ? 'waitlist' : desired
    const wasNotParticipating = !userParticipation
    const previousStatus = userParticipation?.status

    try {
      if (userParticipation) {
        const { error } = await supabase
          .from('event_participants')
          .update({ status: newStatus })
          .eq('event_id', event.id)
          .eq('user_id', sessionUserId)
        if (error) throw error

        setParticipants(prev => prev.map(p => (
          p.user_id === sessionUserId && p.event_id === event.id
            ? { ...p, status: newStatus }
            : p
        )))
      } else {
        const { error } = await supabase
          .from('event_participants')
          .insert({ event_id: event.id, user_id: sessionUserId, status: newStatus })
        if (error) throw error

        setParticipants(prev => [...prev, { event_id: event.id, user_id: sessionUserId, status: newStatus, created_at: new Date().toISOString() }])
      }

      // Mostrar modal de calendario si se confirma participación
      if (newStatus === 'going' && (wasNotParticipating || previousStatus !== 'going')) {
        setTimeout(() => {
          setShowAutoCalendarModal(true)
        }, 500)
      }

    } catch (err) {
      console.error('Error updating participation:', err)
      alert('Error al actualizar participación')
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeaveEvent = async () => {
    if (!sessionUserId || !userParticipation) return
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', event.id)
        .eq('user_id', sessionUserId)
      if (error) throw error

      setParticipants(prev => prev.filter(p => !(p.event_id === event.id && p.user_id === sessionUserId)))
    } catch (err) {
      console.error('Error leaving event:', err)
      alert('Error al cancelar participación')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateMatch = () => {
    if (!event) return
    router.push(`/matches/new?fromEvent=${event.id}`)
  }

  // Manejar eliminación del evento
  const handleDeleteEvent = async (eventId) => {
    try {
      // Primero eliminar participantes
      const { error: participantsError } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)

      if (participantsError) throw participantsError

      // Luego eliminar el evento
      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (eventError) throw eventError

      // Redirigir a la lista de eventos
      router.push('/events')
    } catch (err) {
      setError(err.message || 'Error al eliminar el evento')
      throw err
    }
  }

  // Datos calculados para la nueva UI
  const organizer = profiles.find(p => p.id === event?.created_by)
  const confirmedCount = confirmedParticipants.length
  const maybeCount = maybeParticipants.length
  const totalInterested = confirmedCount + maybeCount

  // Estados de carga y error
  if (loading) {
    return (
      <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-gray-500">
              <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-medium">Cargando evento...</span>
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
          <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar el evento</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link href="/events" className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a eventos
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!event) {
    return (
      <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Evento no encontrado</h2>
              <p className="text-gray-600 mb-6">El evento que buscas no existe o ha sido eliminado.</p>
              <Link href="/events" className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a eventos
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const canJoin = sessionUserId && status && status.key !== 'past'
  const isFull = !!(event.capacity && confirmedParticipants.length >= event.capacity)
  const locationIcon = getLocationIcon(event.location)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Navegación superior */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a eventos
          </Link>

          {isOwner && (
            <Link
              href={`/events/edit/${event.id}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar evento
            </Link>
          )}
        </div>

        <div className="space-y-6">
          {/* Header principal del evento */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Encabezado con título y acciones */}
            <div className="px-4 py-6 sm:px-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.statusBadge}`}>
                      <span>{status.icon}</span>
                      {status.label}
                    </span>
                    {event.visibility === 'private' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 px-2 py-1 text-xs font-semibold">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Privado
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{event.title}</h1>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">{formatEventDate(event.starts_at)}</span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-sm">{locationIcon}</span>
                        <span className="text-sm font-medium">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowCalendarModal(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="hidden sm:inline">📅 Añadir a calendario</span>
                    <span className="sm:hidden">📅 Calendario</span>
                  </button>

                  {/* Crear partida desde evento */}
                  {confirmedParticipants.length >= 2 && (status.key === 'active' || status.key === 'past') && (
                    <button
                      onClick={handleCreateMatch}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Crear Partida
                    </button>
                  )}

                  {isOwner && (
                    <Link
                      href={`/events/manage/${event.id}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="hidden sm:inline">Gestionar evento</span>
                      <span className="sm:hidden">Gestionar</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido del evento */}
            <div className="px-4 py-6 sm:px-6 space-y-6">
              {/* Descripción */}
              {event.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    📝 <span>Descripción</span>
                  </h3>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    {event.description.split('\n').map((line, i) => (
                      <p key={i} className="mb-2">{line || '\u00A0'}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Información del organizador */}
              {organizer && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    👤 <span>Organizador</span>
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold overflow-hidden">
                      {organizer.avatar_url ? (
                        <Image
                          src={organizer.avatar_url}
                          alt={organizer.nickname || 'Usuario'}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        organizer.nickname?.charAt(0)?.toUpperCase() || '?'
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{organizer.nickname || 'Usuario'}</p>
                      <p className="text-sm text-gray-500">Creador del evento</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Estadísticas de participación */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  📊 <span>Participación</span>
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
                    <div className="text-sm text-green-700">Confirmados</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-amber-600">{maybeCount}</div>
                    <div className="text-sm text-amber-700">Tal vez</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{totalInterested}</div>
                    <div className="text-sm text-blue-700">Total interesados</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de participación del usuario */}
          {canJoin && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                🎯 <span>Tu participación</span>
              </h3>
              
              <div className="space-y-4">
                {/* Estado actual */}
                {userParticipation && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      userParticipation.status === 'going' ? 'bg-green-500' :
                      userParticipation.status === 'maybe' ? 'bg-amber-500' : 
                      userParticipation.status === 'waitlist' ? 'bg-blue-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      Estado actual: <span className="capitalize">{
                        userParticipation.status === 'going' ? 'Confirmado' :
                        userParticipation.status === 'maybe' ? 'Tal vez' : 
                        userParticipation.status === 'waitlist' ? 'Lista de espera' : 'No asistirá'
                      }</span>
                    </span>
                  </div>
                )}

                {/* Botones de participación */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {!userParticipation ? (
                    <>
                      <button
                        onClick={() => handleJoinEvent('going')}
                        disabled={actionLoading}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {isFull ? 'Lista de espera' : 'Apuntarse'}
                      </button>
                      <button
                        onClick={() => handleJoinEvent('maybe')}
                        disabled={actionLoading}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tal vez
                      </button>
                    </>
                  ) : (
                    <>
                      {userParticipation.status !== 'going' && (
                        <button
                          onClick={() => handleJoinEvent('going')}
                          disabled={actionLoading}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {isFull ? 'Lista de espera' : 'Confirmar'}
                        </button>
                      )}

                      {userParticipation.status !== 'maybe' && (
                        <button
                          onClick={() => handleJoinEvent('maybe')}
                          disabled={actionLoading}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Tal vez
                        </button>
                      )}

                      <button
                        onClick={handleLeaveEvent}
                        disabled={actionLoading}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-3 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Lista de participantes detallada */}
          {participants.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                👥 <span>Participantes ({participants.length})</span>
              </h3>
              
              <div className="space-y-6">
                {/* Confirmados */}
                {confirmedParticipants.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-3">✅ Confirmados ({confirmedParticipants.length})</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {confirmedParticipants.map(participant => (
                        <div key={participant.user_id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                            {avatarById[participant.user_id] ? (
                              <Image
                                src={avatarById[participant.user_id]}
                                alt={nickById[participant.user_id]}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              nickById[participant.user_id]?.charAt(0)?.toUpperCase() || '?'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {nickById[participant.user_id]}
                            </p>
                            <p className="text-xs text-green-700">
                              Se unió {format(new Date(participant.created_at), "d MMM", { locale: es })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tal vez */}
                {maybeParticipants.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-amber-700 mb-3">🤔 Tal vez ({maybeParticipants.length})</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {maybeParticipants.map(participant => (
                        <div key={participant.user_id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                            {avatarById[participant.user_id] ? (
                              <Image
                                src={avatarById[participant.user_id]}
                                alt={nickById[participant.user_id]}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              nickById[participant.user_id]?.charAt(0)?.toUpperCase() || '?'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {nickById[participant.user_id]}
                            </p>
                            <p className="text-xs text-amber-700">
                              Se unió {format(new Date(participant.created_at), "d MMM", { locale: es })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lista de espera */}
                {waitlistParticipants.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-blue-700 mb-3">⏳ Lista de espera ({waitlistParticipants.length})</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {waitlistParticipants.map(participant => (
                        <div key={participant.user_id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                            {avatarById[participant.user_id] ? (
                              <Image
                                src={avatarById[participant.user_id]}
                                alt={nickById[participant.user_id]}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              nickById[participant.user_id]?.charAt(0)?.toUpperCase() || '?'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {nickById[participant.user_id]}
                            </p>
                            <p className="text-xs text-blue-700">
                              En espera desde {format(new Date(participant.created_at), "d MMM", { locale: es })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {participants.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">👥</div>
                  <p className="text-gray-500 text-sm">Sé el primero en apuntarte a este evento</p>
                </div>
              )}
            </div>
          )}

          {/* Panel de administración para el propietario */}
          {isOwner && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                ⚙️ <span>Administración del evento</span>
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link 
                  href={`/events/edit/${event.id}`} 
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar evento
                </Link>
                
                <Link 
                  href={`/events/manage/${event.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a3.001 3.001 0 005.288 0" />
                  </svg>
                  Gestionar asistentes
                </Link>

                <ImprovedDeleteButton
                  event={event}
                  participantCount={participants.length}
                  onDelete={handleDeleteEvent}
                  className="sm:col-span-2 lg:col-span-1 justify-center"
                />
              </div>
            </div>
          )}

          {/* Información adicional del evento */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Detalles del evento */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                ℹ️ <span>Detalles</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Comienza</div>
                    <div className="text-sm text-gray-600">{formatEventDate(event.starts_at)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Termina</div>
                    <div className="text-sm text-gray-600">{formatEventDate(event.ends_at)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span className="text-sm">{locationIcon}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Ubicación</div>
                    <div className="text-sm text-gray-600">{event.location || '—'}</div>
                  </div>
                </div>

                {event.game_id && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Formato</div>
                      <div className="text-sm text-gray-600">{gameById[event.game_id]}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a3.001 3.001 0 005.288 0" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Capacidad</div>
                    <div className="text-sm text-gray-600">
                      {event.capacity ? `${confirmedParticipants.length}/${event.capacity} confirmados` : `${confirmedParticipants.length} confirmados`}
                      {isFull && <span className="ml-2 inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800">Lleno</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                📋 <span>Información adicional</span>
              </h3>
              
              <div className="space-y-4">
                {event.rules && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Reglas</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{event.rules}</p>
                  </div>
                )}
                
                {event.prizes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Premios</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{event.prizes}</p>
                  </div>
                )}

                {!event.rules && !event.prizes && (
                  <div className="text-center py-4">
                    <div className="text-gray-400 text-2xl mb-2">📋</div>
                    <p className="text-gray-500 text-sm">No hay información adicional disponible</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modales */}
        <CalendarModal
          isOpen={showAutoCalendarModal}
          onClose={() => setShowAutoCalendarModal(false)}
          event={event}
          autoTriggered={true}
        />
        
        <CalendarModal
          isOpen={showCalendarModal}
          onClose={() => setShowCalendarModal(false)}
          event={event}
          autoTriggered={false}
        />
      </div>
    </div>
  )
}