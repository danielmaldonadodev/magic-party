import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Card from './Card' // Ajusta la ruta según tu estructura

/* ────────────────────────────────────────────── */
/* Utilities para Eventos                          */
/* ────────────────────────────────────────────── */
function formatEventDate(date) {
  try {
    return format(new Date(date), "d 'de' MMMM 'a las' HH:mm", { locale: es })
  } catch {
    return '—'
  }
}

function getEventStatus(event) {
  const now = new Date()
  const eventDate = new Date(event.starts_at)
  
  if (eventDate < now) {
    return { 
      status: 'past', 
      label: 'Finalizado',
      color: 'bg-gray-100 text-gray-700',
      icon: '✓'
    }
  }
  
  const daysDiff = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24))
  
  if (daysDiff <= 1) {
    return { 
      status: 'today', 
      label: 'Hoy/Mañana',
      color: 'bg-red-100 text-red-700',
      icon: '🔥'
    }
  }
  
  if (daysDiff <= 7) {
    return { 
      status: 'soon', 
      label: 'Esta semana',
      color: 'bg-amber-100 text-amber-700',
      icon: '⚡'
    }
  }
  
  return { 
    status: 'upcoming', 
    label: 'Próximamente',
    color: 'bg-blue-100 text-blue-700',
    icon: '📅'
  }
}

function getParticipantStatus(status) {
  const statusConfig = {
    going: { 
      label: 'Confirmado', 
      color: 'bg-green-100 text-green-800', 
      icon: '✓',
      gradient: 'from-green-600 to-emerald-700'
    },
    maybe: { 
      label: 'Tal vez', 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: '?',
      gradient: 'from-yellow-600 to-amber-700'
    },
    waitlist: { 
      label: 'Lista de espera', 
      color: 'bg-orange-100 text-orange-800', 
      icon: '⏳',
      gradient: 'from-orange-600 to-red-700'
    }
  }
  
  return statusConfig[status] || { 
    label: status, 
    color: 'bg-gray-100 text-gray-800', 
    icon: '—',
    gradient: 'from-gray-600 to-slate-700'
  }
}

/* ────────────────────────────────────────────── */
/* Componente Evento Professional                  */
/* ────────────────────────────────────────────── */
function ProfessionalEventCard({ event, userRelation, index = 0 }) {
  const [isHovered, setIsHovered] = useState(false)
  const eventStatus = getEventStatus(event)
  const participantStatus = userRelation.type === 'participant' 
    ? getParticipantStatus(userRelation.status) 
    : null

  const getEventTypeTheme = (type) => {
    switch(type) {
      case 'organizer':
        return {
          gradient: 'from-purple-600 to-indigo-700',
          bg: 'bg-purple-50',
          text: 'text-purple-800',
          border: 'border-purple-200',
          icon: '👑',
          label: 'Organizando'
        }
      case 'participant':
        return {
          gradient: participantStatus?.gradient || 'from-blue-600 to-indigo-700',
          bg: 'bg-blue-50',
          text: 'text-blue-800', 
          border: 'border-blue-200',
          icon: participantStatus?.icon || '🎮',
          label: participantStatus?.label || 'Participando'
        }
      default:
        return {
          gradient: 'from-gray-600 to-slate-700',
          bg: 'bg-gray-50',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: '📅',
          label: 'Evento'
        }
    }
  }

  const theme = getEventTypeTheme(userRelation.type)

  return (
    <div 
      className="group relative transform transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-1"
      style={{ 
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle shadow effect */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${theme.gradient} opacity-0 blur-xl transition-all duration-700 group-hover:opacity-5 -z-10`} />
      
      <Card className={`relative overflow-hidden border ${theme.border} bg-white shadow-sm transition-all duration-500 hover:shadow-lg hover:border-gray-300`} padding="none">
        {/* Professional top accent */}
        <div className={`h-0.5 bg-gradient-to-r ${theme.gradient}`} />
        
        <div className="p-6 space-y-4">
          {/* Header con badges */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white shadow-md transition-all duration-300 group-hover:scale-105 flex-shrink-0`}>
                <span className="text-sm font-semibold">{theme.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${theme.bg} ${theme.text} border ${theme.border}`}>
                    {theme.label}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${eventStatus.color}`}>
                    <span>{eventStatus.icon}</span>
                    {eventStatus.label}
                  </span>
                </div>
              </div>
            </div>
            {/* Participants count */}
            <div className="flex items-center gap-1 text-gray-500 flex-shrink-0">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-medium">{event.participant_count || 0}</span>
            </div>
          </div>

          {/* Event title */}
          <div>
            <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2 transition-colors duration-300 group-hover:text-gray-800">
              {event.title}
            </h3>
          </div>

          {/* Event details */}
          <div className="space-y-3">
            {/* Date and time */}
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">{formatEventDate(event.starts_at)}</span>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium truncate">{event.location}</span>
              </div>
            )}

            {/* Description preview */}
            {event.description && (
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {event.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {userRelation.type === 'organizer' && (
                <Link
                  href={`/events/${event.id}/manage`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Gestionar
                </Link>
              )}
            </div>
            
            <Link
              href={`/events/${event.id}`}
              className={`inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r ${theme.gradient} px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              Ver evento
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ────────────────────────────────────────────── */
/* Componente Tabs de Eventos                      */
/* ────────────────────────────────────────────── */
function EventTabsSegmented({ current, onChange, counts }) {
  const tabs = [
    { key: 'all', label: 'Todos', icon: '📋', count: counts.all },
    { key: 'organizing', label: 'Organizando', icon: '👑', count: counts.organizing },
    { key: 'participating', label: 'Participando', icon: '🎮', count: counts.participating },
    { key: 'upcoming', label: 'Próximos', icon: '📅', count: counts.upcoming },
    { key: 'past', label: 'Historial', icon: '✓', count: counts.past }
  ]

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="inline-flex items-center rounded-lg bg-gray-100 p-1 shadow-sm border border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`relative rounded-md px-4 py-2.5 text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
              current === tab.key 
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <span>{tab.icon}</span>
              {tab.label}
              {tab.count > 0 && (
                <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-bold ${
                  current === tab.key 
                    ? 'bg-gray-900 text-white' 
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
/* Estado Vacío Professional                       */
/* ────────────────────────────────────────────── */
function ProfessionalEmptyEventsState({ activeTab, isOwner }) {
  const getEmptyStateContent = (tab) => {
    switch(tab) {
      case 'organizing':
        return {
          icon: '👑',
          title: 'No estás organizando eventos',
          description: 'Crea tu primer evento y comienza a reunir jugadores para partidas épicas de Magic.',
          actionText: 'Crear evento',
          actionHref: '/events/new',
          gradient: 'from-purple-600 to-indigo-700'
        }
      case 'participating':
        return {
          icon: '🎮',
          title: 'No participas en eventos',
          description: 'Explora eventos disponibles y únete a la comunidad de jugadores de Magic.',
          actionText: 'Ver eventos',
          actionHref: '/events',
          gradient: 'from-blue-600 to-indigo-700'
        }
      case 'upcoming':
        return {
          icon: '📅',
          title: 'No hay eventos próximos',
          description: 'No tienes eventos programados próximamente. ¡Es hora de planificar nuevas partidas!',
          actionText: 'Buscar eventos',
          actionHref: '/events',
          gradient: 'from-green-600 to-emerald-700'
        }
      case 'past':
        return {
          icon: '✓',
          title: 'Sin historial de eventos',
          description: 'Aún no has participado en eventos. Tu historial aparecerá aquí una vez que comiences a jugar.',
          actionText: 'Ver eventos activos',
          actionHref: '/events',
          gradient: 'from-gray-600 to-slate-700'
        }
      default:
        return {
          icon: '📋',
          title: 'No hay eventos',
          description: 'Parece que aún no tienes eventos. Comienza creando o participando en eventos de la comunidad.',
          actionText: isOwner ? 'Crear mi primer evento' : 'Ver eventos disponibles',
          actionHref: isOwner ? '/events/new' : '/events',
          gradient: 'from-gray-600 to-slate-700'
        }
    }
  }

  const content = getEmptyStateContent(activeTab)

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-16 text-center">
      <div className="relative">
        {/* Professional icon */}
        <div className="mx-auto mb-6 relative">
          <div className={`relative h-20 w-20 rounded-full bg-gradient-to-br ${content.gradient} flex items-center justify-center text-white text-2xl shadow-lg`}>
            {content.icon}
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-3">{content.title}</h3>
        <p className="text-gray-600 max-w-md mx-auto leading-relaxed mb-8">
          {content.description}
        </p>
        
        <Link 
          href={content.actionHref}
          className={`group inline-flex items-center gap-3 rounded-lg bg-gradient-to-r ${content.gradient} px-6 py-3 text-white font-semibold shadow-sm transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {content.actionText}
        </Link>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────── */
/* Componente Principal "Mis Eventos"              */
/* ────────────────────────────────────────────── */
export default function ProfessionalMyEvents({ 
  userEvents = [], 
  userParticipations = [], 
  isOwner = false 
}) {
  const [activeTab, setActiveTab] = useState('all')

  // Combinar eventos y participaciones con metadata
  const allUserEvents = useMemo(() => {
    const events = [
      ...userEvents.map(event => ({
        ...event,
        userRelation: { type: 'organizer' }
      })),
      ...userParticipations.map(participation => ({
        ...participation.event,
        userRelation: { 
          type: 'participant', 
          status: participation.status,
          created_at: participation.created_at
        }
      }))
    ]

    // Eliminar duplicados (si usuario organiza Y participa en el mismo evento)
    const uniqueEvents = events.filter((event, index, self) => 
      index === self.findIndex(e => e.id === event.id)
    )

    // Ordenar por fecha
    return uniqueEvents.sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at))
  }, [userEvents, userParticipations])

  // Filtrar eventos según tab activo
  const filteredEvents = useMemo(() => {
    const now = new Date()
    
    switch(activeTab) {
      case 'organizing':
        return allUserEvents.filter(e => e.userRelation.type === 'organizer')
      case 'participating':
        return allUserEvents.filter(e => e.userRelation.type === 'participant')
      case 'upcoming':
        return allUserEvents.filter(e => new Date(e.starts_at) >= now)
      case 'past':
        return allUserEvents.filter(e => new Date(e.starts_at) < now)
      default:
        return allUserEvents
    }
  }, [allUserEvents, activeTab])

  // Calcular counts para tabs
  const counts = useMemo(() => {
    const now = new Date()
    return {
      all: allUserEvents.length,
      organizing: allUserEvents.filter(e => e.userRelation.type === 'organizer').length,
      participating: allUserEvents.filter(e => e.userRelation.type === 'participant').length,
      upcoming: allUserEvents.filter(e => new Date(e.starts_at) >= now).length,
      past: allUserEvents.filter(e => new Date(e.starts_at) < now).length,
    }
  }, [allUserEvents])

  return (
    <div className="group relative">
      <Card className="relative overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:shadow-md" padding="none">
        {/* Professional header */}
        <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-700" />

        <div className="p-8 lg:p-10">
          {/* Section Header */}
          <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Mis Eventos
                  </h2>
                  <p className="text-gray-600">
                    Gestiona tus eventos y participaciones
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              {isOwner && (
                <Link 
                  href="/events/new" 
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Crear evento
                </Link>
              )}
              <Link 
                href="/events" 
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Explorar eventos
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <EventTabsSegmented 
            current={activeTab} 
            onChange={setActiveTab} 
            counts={counts}
          />

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <ProfessionalEmptyEventsState activeTab={activeTab} isOwner={isOwner} />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event, index) => (
                <ProfessionalEventCard
                  key={event.id}
                  event={event}
                  userRelation={event.userRelation}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* Quick Stats */}
          {allUserEvents.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{counts.organizing}</div>
                  <div className="text-sm text-gray-600">Organizando</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{counts.participating}</div>
                  <div className="text-sm text-gray-600">Participando</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{counts.upcoming}</div>
                  <div className="text-sm text-gray-600">Próximos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{counts.past}</div>
                  <div className="text-sm text-gray-600">Completados</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}