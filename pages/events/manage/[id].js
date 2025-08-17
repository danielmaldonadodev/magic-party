import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { format, addDays, isBefore, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '../../../lib/supabaseClient'
import { createSupabaseServerClient } from '../../../lib/supabaseServer'
import { useEffect, useState, useMemo, useCallback } from 'react'

/* ===============================================================
  FUNCIONES DE CALENDARIO INTEGRADAS
  =============================================================== */

// Utility para generar archivo .ics mejorado
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

// Generar enlaces para diferentes servicios de calendario
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

/* ===============================================================
  MODAL DE CALENDARIO - OPTIMIZADO PARA MÓVIL
  =============================================================== */
function CalendarModal({ isOpen, onClose, event }) {
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
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    📅 Añadir a calendario
                  </h3>
                  <p className="text-sm text-blue-100">
                    Elige tu calendario preferido
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===============================================================
  UTILITY FUNCTIONS
  =============================================================== */
function formatEventDate(date) {
  try {
    return format(new Date(date), "d 'de' MMMM 'a las' HH:mm", { locale: es })
  } catch {
    return '—'
  }
}

function getEventStatus(startsAt, endsAt) {
  const now = new Date()
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  
  if (isAfter(now, end)) {
    return { key: 'past', label: 'Finalizado', color: 'bg-gray-100 text-gray-700', icon: '✅' }
  }
  
  if (isAfter(now, start) && isBefore(now, end)) {
    return { key: 'active', label: 'En curso', color: 'bg-green-100 text-green-800', icon: '🔴' }
  }
  
  // Próximo evento (menos de 2 horas)
  const twoHoursFromNow = new Date(now)
  twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2)
  if (isBefore(start, twoHoursFromNow)) {
    return { key: 'soon', label: 'Próximamente', color: 'bg-amber-100 text-amber-800', icon: '⏰' }
  }
  
  return { key: 'scheduled', label: 'Programado', color: 'bg-blue-100 text-blue-800', icon: '📅' }
}

function getStatusBadge(status) {
  const statusConfig = {
    going: { 
      label: 'Confirmado', 
      color: 'bg-green-100 text-green-800', 
      icon: '✓' 
    },
    maybe: { 
      label: 'Tal vez', 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: '?' 
    },
    waitlist: { 
      label: 'Lista de espera', 
      color: 'bg-orange-100 text-orange-800', 
      icon: '⏳' 
    }
  }
  
  return statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: '—' }
}

/**
 * Exporta la lista de participantes a un archivo CSV
 */
function exportParticipantsToCSV(participants, profiles, event) {
  try {
    // Crear mapa de perfiles para acceso rápido
    const profileMap = {}
    for (const profile of profiles) {
      profileMap[profile.id] = profile
    }

    // Generar encabezado del archivo
    const eventDate = formatEventDate(event.starts_at)
    const fileName = `participantes-${event.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.csv`
    
    // Crear contenido CSV
    let csvContent = `"PARTICIPANTES DEL EVENTO"\n`
    csvContent += `"Evento:","${event.title}"\n`
    csvContent += `"Fecha:","${eventDate}"\n`
    csvContent += `"Total participantes:","${participants.length}"\n`
    csvContent += `"Exportado el:","${format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}"\n`
    csvContent += `\n` // Línea vacía
    
    // Encabezados de la tabla
    csvContent += `"Nombre","Estado","Fecha de inscripción","ID Usuario"\n`
    
    // Datos de participantes
    for (const participant of participants) {
      const profile = profileMap[participant.user_id]
      const statusLabel = getStatusBadge(participant.status).label
      const inscriptionDate = formatEventDate(participant.created_at)
      const nickname = profile?.nickname || 'Usuario desconocido'
      
      // Escapar comillas en los datos
      const escapedNickname = nickname.replace(/"/g, '""')
      const escapedStatus = statusLabel.replace(/"/g, '""')
      const escapedDate = inscriptionDate.replace(/"/g, '""')
      
      csvContent += `"${escapedNickname}","${escapedStatus}","${escapedDate}","${participant.user_id}"\n`
    }
    
    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', fileName)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
    
    return true
  } catch (error) {
    console.error('Error exporting CSV:', error)
    return false
  }
}

/* ===============================================================
  COMPONENTES
  =============================================================== */

function ParticipantCard({ participant, profile, onStatusChange, onRemove }) {
  const [isLoading, setIsLoading] = useState(false)
  const [showActions, setShowActions] = useState(false)
  
  const statusBadge = getStatusBadge(participant.status)

  const handleStatusChange = async (newStatus) => {
    setIsLoading(true)
    try {
      await onStatusChange(participant.user_id, newStatus)
    } finally {
      setIsLoading(false)
      setShowActions(false)
    }
  }

  const handleRemove = async () => {
    const confirmed = window.confirm(`¿Eliminar a ${profile?.nickname || 'este participante'} del evento?`)
    if (!confirmed) return
    
    setIsLoading(true)
    try {
      await onRemove(participant.user_id)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold overflow-hidden">
            {profile?.avatar_url ? (
              <Image 
                src={profile.avatar_url} 
                alt="avatar" 
                width={40} 
                height={40} 
                className="w-10 h-10 object-cover rounded-full" 
              />
            ) : (
              (profile?.nickname || '?').slice(0, 1).toUpperCase()
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {profile?.nickname || participant.user_id}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                <span>{statusBadge.icon}</span>
                {statusBadge.label}
              </span>
              <span className="text-xs text-gray-500 hidden sm:inline">
                {format(new Date(participant.created_at), "d MMM", { locale: es })}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="relative ml-2">
          <button
            onClick={() => setShowActions(!showActions)}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            )}
          </button>

          {/* Dropdown menu */}
          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                {participant.status !== 'going' && (
                  <button
                    onClick={() => handleStatusChange('going')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span className="text-green-600">✓</span>
                    Confirmar participación
                  </button>
                )}
                
                {participant.status !== 'maybe' && (
                  <button
                    onClick={() => handleStatusChange('maybe')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span className="text-yellow-600">?</span>
                    Marcar como &quot;tal vez&quot;
                  </button>
                )}
                
                {participant.status !== 'waitlist' && (
                  <button
                    onClick={() => handleStatusChange('waitlist')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span className="text-orange-600">⏳</span>
                    Mover a lista de espera
                  </button>
                )}

                <hr className="my-1" />
                
                <button
                  onClick={handleRemove}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar del evento
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AddParticipantForm({ onAdd, existingParticipants }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const searchUsers = async (term) => {
    if (!term.trim() || term.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url')
        .ilike('nickname', `%${term}%`)
        .limit(10)

      if (!error && data) {
        // Filtrar usuarios que ya están en el evento
        const existingIds = existingParticipants.map(p => p.user_id)
        const filtered = data.filter(user => !existingIds.includes(user.id))
        setSearchResults(filtered)
      }
    } catch (err) {
      console.error('Error searching users:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAdd = async (userId) => {
    setIsAdding(true)
    try {
      await onAdd(userId)
      setSearchTerm('')
      setSearchResults([])
      setIsOpen(false)
    } finally {
      setIsAdding(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, searchUsers])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Añadir participante
      </button>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Añadir participante</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de usuario..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          {isSearching && (
            <div className="absolute right-3 top-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs overflow-hidden">
                    {user.avatar_url ? (
                      <Image src={user.avatar_url} alt="avatar" width={32} height={32} className="w-8 h-8 object-cover rounded-full" />
                    ) : (
                      user.nickname.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium truncate">{user.nickname}</span>
                </div>
                <button
                  onClick={() => handleAdd(user.id)}
                  disabled={isAdding}
                  className="px-3 py-1 rounded text-xs bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isAdding ? 'Añadiendo...' : 'Añadir'}
                </button>
              </div>
            ))}
          </div>
        )}

        {searchTerm.length >= 2 && !isSearching && searchResults.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No se encontraron usuarios con ese nombre
          </p>
        )}
      </div>
    </div>
  )
}

/* ===============================================================
  MAIN COMPONENT
  =============================================================== */
export default function ManageParticipants({ 
  initialEvent = null, 
  initialParticipants = [], 
  initialProfiles = [] 
}) {
  const router = useRouter()
  const { id } = router.query

  // Estados
  const [event, setEvent] = useState(initialEvent)
  const [participants, setParticipants] = useState(initialParticipants)
  const [profiles, setProfiles] = useState(initialProfiles)
  const [currentUser, setCurrentUser] = useState(null)
  
  // UI states
  const [loading, setLoading] = useState(!initialEvent)
  const [error, setError] = useState(null)
  
  // 🚀 NUEVO: Estado para el modal de calendario
  const [showCalendarModal, setShowCalendarModal] = useState(false)

  // Cargar datos iniciales si no vienen del SSR
  useEffect(() => {
    let ignore = false
    
    const loadData = async () => {
      try {
        // Cargar usuario actual
        const { data: { user } } = await supabase.auth.getUser()
        if (user && !ignore) {
          setCurrentUser(user)
        }

        // Si no hay datos del SSR, cargarlos
        if (!initialEvent && id) {
          setLoading(true)
          
          const [eventRes, participantsRes, profilesRes] = await Promise.allSettled([
            supabase.from('events').select('*').eq('id', id).single(),
            supabase.from('event_participants').select('*').eq('event_id', id),
            supabase.from('profiles').select('id, nickname, avatar_url')
          ])

          if (!ignore) {
            if (eventRes.status === 'fulfilled' && eventRes.value.data) {
              setEvent(eventRes.value.data)
            } else {
              setError('Evento no encontrado')
              return
            }

            if (participantsRes.status === 'fulfilled' && participantsRes.value.data) {
              setParticipants(participantsRes.value.data)
            }

            if (profilesRes.status === 'fulfilled' && profilesRes.value.data) {
              setProfiles(profilesRes.value.data)
            }
          }
        }
      } catch (err) {
        if (!ignore) {
          setError('Error al cargar los datos')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadData()
    return () => { ignore = true }
  }, [id, initialEvent])

  // Verificar permisos
  const canManage = currentUser && event && (
    currentUser.id === event.created_by ||
    currentUser.user_metadata?.is_admin === true ||
    currentUser.app_metadata?.is_admin === true
  )

  // Mapas para optimización
  const profileById = useMemo(() => {
    const acc = {}
    for (const p of profiles) acc[p.id] = p
    return acc
  }, [profiles])

  // Participantes agrupados por estado
  const participantsByStatus = useMemo(() => {
    const groups = {
      going: [],
      maybe: [],
      waitlist: []
    }
    
    for (const p of participants) {
      if (groups[p.status]) {
        groups[p.status].push(p)
      }
    }
    
    return groups
  }, [participants])

  // Estado del evento
  const eventStatus = event ? getEventStatus(event.starts_at, event.ends_at) : null

  // Handlers
  const handleStatusChange = async (userId, newStatus) => {
    try {
      const { error } = await supabase
        .from('event_participants')
        .update({ status: newStatus })
        .eq('event_id', event.id)
        .eq('user_id', userId)

      if (error) throw error

      // Actualizar estado local
      setParticipants(prev => prev.map(p => 
        p.user_id === userId && p.event_id === event.id
          ? { ...p, status: newStatus }
          : p
      ))
    } catch (err) {
      console.error('Error updating participant status:', err)
      alert('Error al cambiar el estado del participante')
    }
  }

  const handleRemoveParticipant = async (userId) => {
    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', event.id)
        .eq('user_id', userId)

      if (error) throw error

      // Actualizar estado local
      setParticipants(prev => prev.filter(p => 
        !(p.user_id === userId && p.event_id === event.id)
      ))
    } catch (err) {
      console.error('Error removing participant:', err)
      alert('Error al eliminar el participante')
    }
  }

  const handleAddParticipant = async (userId) => {
    try {
      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: event.id,
          user_id: userId,
          status: 'going'
        })

      if (error) throw error

      // Actualizar estado local
      setParticipants(prev => [...prev, {
        event_id: event.id,
        user_id: userId,
        status: 'going',
        created_at: new Date().toISOString()
      }])

      // Cargar el perfil si no está en cache
      if (!profileById[userId]) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, nickname, avatar_url')
          .eq('id', userId)
          .single()

        if (profileData) {
          setProfiles(prev => [...prev, profileData])
        }
      }
    } catch (err) {
      console.error('Error adding participant:', err)
      alert('Error al añadir el participante')
    }
  }

  const handleExportCSV = async () => {
    if (participants.length === 0) {
      alert('No hay participantes para exportar')
      return
    }
    
    try {
      const success = exportParticipantsToCSV(participants, profiles, event)
      if (!success) {
        alert('Error al exportar el archivo. Inténtalo de nuevo.')
      }
    } catch (error) {
      console.error('Error during export:', error)
      alert('Error al exportar el archivo. Inténtalo de nuevo.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-gray-500">
              <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-medium">Cargando...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.17 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-700 mb-6">{error || 'Evento no encontrado'}</p>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Volver a eventos
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden">
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-amber-800 mb-2">Sin permisos</h3>
              <p className="text-amber-700 mb-6">
                No tienes permisos para gestionar los participantes de este evento
              </p>
              <Link
                href={`/events/${event.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
              >
                Ver evento
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al evento
          </Link>
        </div>

        {/* Header del evento */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${eventStatus.color} ring-2 ring-white/20`}>
                    <span>{eventStatus.icon}</span>
                    {eventStatus.label}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{event.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatEventDate(event.starts_at)}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowCalendarModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">📅 Añadir a calendario</span>
                  <span className="sm:hidden">📅 Calendario</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Participantes</h2>
            
            {/* Estadísticas compactas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{participantsByStatus.going.length}</div>
                <div className="text-xs text-gray-600">Confirmados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{participantsByStatus.maybe.length}</div>
                <div className="text-xs text-gray-600">Tal vez</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{participantsByStatus.waitlist.length}</div>
                <div className="text-xs text-gray-600">En espera</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{participants.length}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
            </div>

            {/* Acciones principales */}
            <div className="flex flex-col sm:flex-row gap-3">
              <AddParticipantForm 
                onAdd={handleAddParticipant}
                existingParticipants={participants}
              />
              
              <button
                onClick={handleExportCSV}
                disabled={participants.length === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar lista ({participants.length})
              </button>
            </div>
          </div>
        </div>

        {/* Lista de participantes */}
        {participants.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay participantes</h3>
            <p className="text-gray-600 mb-6">
              Aún no hay nadie apuntado a este evento. Añade participantes o comparte el enlace del evento.
            </p>
            <Link
              href={`/events/${event.id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Ver evento público
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Confirmados */}
            {participantsByStatus.going.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-green-50 px-6 py-3 border-b border-green-100">
                  <h3 className="text-base font-semibold text-green-800">
                    ✓ Confirmados ({participantsByStatus.going.length})
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {participantsByStatus.going.map((participant) => (
                      <ParticipantCard
                        key={participant.user_id}
                        participant={participant}
                        profile={profileById[participant.user_id]}
                        onStatusChange={handleStatusChange}
                        onRemove={handleRemoveParticipant}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tal vez */}
            {participantsByStatus.maybe.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-yellow-50 px-6 py-3 border-b border-yellow-100">
                  <h3 className="text-base font-semibold text-yellow-800">
                    ? Tal vez ({participantsByStatus.maybe.length})
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {participantsByStatus.maybe.map((participant) => (
                      <ParticipantCard
                        key={participant.user_id}
                        participant={participant}
                        profile={profileById[participant.user_id]}
                        onStatusChange={handleStatusChange}
                        onRemove={handleRemoveParticipant}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Lista de espera */}
            {participantsByStatus.waitlist.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-orange-50 px-6 py-3 border-b border-orange-100">
                  <h3 className="text-base font-semibold text-orange-800">
                    ⏳ Lista de espera ({participantsByStatus.waitlist.length})
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {participantsByStatus.waitlist.map((participant) => (
                      <ParticipantCard
                        key={participant.user_id}
                        participant={participant}
                        profile={profileById[participant.user_id]}
                        onStatusChange={handleStatusChange}
                        onRemove={handleRemoveParticipant}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🚀 MODAL DE CALENDARIO */}
        <CalendarModal
          isOpen={showCalendarModal}
          onClose={() => setShowCalendarModal(false)}
          event={event}
        />
      </div>
    </div>
  )
}

/* ===============================================================
  SSR - DATOS DEL SERVIDOR
  =============================================================== */
export async function getServerSideProps({ req, res, params }) {
  const supabase = createSupabaseServerClient(req, res)
  const { id } = params

  try {
    console.log('🔍 SSR: Loading manage participants data for ID:', id)
    
    // Cargar evento, participantes y perfiles en paralelo
    const [eventRes, participantsRes, profilesRes] = await Promise.allSettled([
      supabase.from('events').select('*').eq('id', id).single(),
      supabase.from('event_participants').select('*').eq('event_id', id),
      supabase.from('profiles').select('id, nickname, avatar_url')
    ])

    console.log('📊 SSR Results:', {
      event: eventRes.status === 'fulfilled' ? 'found' : eventRes.reason,
      participants: participantsRes.status === 'fulfilled' ? participantsRes.value.data?.length : participantsRes.reason,
      profiles: profilesRes.status === 'fulfilled' ? profilesRes.value.data?.length : profilesRes.reason,
    })

    const event = eventRes.status === 'fulfilled' ? eventRes.value.data : null
    const participants = participantsRes.status === 'fulfilled' ? (participantsRes.value.data || []) : []
    const profiles = profilesRes.status === 'fulfilled' ? (profilesRes.value.data || []) : []

    // Si no se encuentra el evento, mostrar 404
    if (!event) {
      return {
        notFound: true
      }
    }

    console.log('✅ SSR: Returning manage participants data')

    return {
      props: {
        initialEvent: event,
        initialParticipants: participants,
        initialProfiles: profiles,
      },
    }
  } catch (error) {
    console.error('💥 SSR Error fetching manage participants data:', error)
    return {
      notFound: true
    }
  }
}