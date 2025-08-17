import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { format, addDays, isBefore, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '../../lib/supabaseClient'
import PageHeader from '../../components/PageHeader'

// ────────────────────────────────────────────────────────────
/* ===============================================================
  COMPONENTE DE CONFIRMACIÓN DE ELIMINACIÓN
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
export function ImprovedDeleteButton({ event, participantCount = 0, onDelete, className = "" }) {
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

// Utilidades de fecha/estado
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
    return { key: 'past', label: 'Finalizado', color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50', text: 'text-gray-700', ring: 'ring-gray-200', bgCard: 'bg-gray-100' }
  }

  if (isAfter(now, start) && isBefore(now, end)) {
    return { key: 'active', label: 'En curso', color: 'from-green-500 to-emerald-600', bg: 'bg-green-50', text: 'text-green-800', ring: 'ring-green-200', bgCard: 'bg-green-100' }
  }

  // Próximo evento (menos de 2 horas)
  const twoHoursFromNow = new Date(now)
  twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2)
  if (isBefore(start, twoHoursFromNow)) {
    return { key: 'soon', label: 'Próximamente', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-800', ring: 'ring-amber-200', bgCard: 'bg-amber-100' }
  }

  return { key: 'scheduled', label: 'Programado', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-800', ring: 'ring-blue-200', bgCard: 'bg-blue-100' }
}

function getLocationIcon(location) {
  if (!location) return '📍'
  const loc = location.toLowerCase()
  if (loc.includes('spelltable') || loc.includes('webcam')) return '💻'
  if (loc.includes('arena') || loc.includes('mtga')) return '🎮'
  if (loc.includes('discord') || loc.includes('online')) return '🌐'
  return '🏠'
}

function getEventTypeIcon(status) {
  switch (status.key) {
    case 'active': return '🔴'
    case 'soon': return '⏰'
    case 'past': return '✅'
    default: return '📅'
  }
}

// Sencillo generador de enlace ICS (Añadir al calendario)
function buildIcs(event) {
  try {
    const dt = (d) => new Date(d).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const body = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Colegueo MTG//Eventos//ES',
      'BEGIN:VEVENT',
      `UID:${event.id}@colegueo`,
      `DTSTAMP:${dt(Date.now())}`,
      `DTSTART:${dt(event.starts_at)}`,
      `DTEND:${dt(event.ends_at)}`,
      `SUMMARY:${(event.title || '').replace(/\n/g, ' ')}`,
      `DESCRIPTION:${(event.description || '').replace(/\n/g, ' ')}`,
      `LOCATION:${(event.location || '').replace(/\n/g, ' ')}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')
    return 'data:text/calendar;charset=utf8,' + encodeURIComponent(body)
  } catch {
    return '#'
  }
}

// ────────────────────────────────────────────────────────────
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

  const isOwner = !!(event && sessionUserId && event.created_by === sessionUserId)
  const status = event ? getEventStatus(event.starts_at, event.ends_at) : null

  // Sesión actual
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSessionUserId(session?.user?.id || null)
    })()
  }, [])

  // Carga del evento + colecciones
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

  // Participación del usuario actual
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

  // Acciones de participación
  const handleJoinEvent = async (desired = 'going') => {
    if (!sessionUserId || !event) return
    setActionLoading(true)

    const isFull = !!(event.capacity && confirmedParticipants.length >= event.capacity)
    const newStatus = desired === 'going' && isFull ? 'waitlist' : desired

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

  // NUEVA FUNCIÓN: Manejar eliminación del evento
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
      throw err // Re-throw para que el modal lo maneje
    }
  }

  // Render: estados básicos
  if (loading) {
    return (
      <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
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
        <div className="max-w-7xl mx-auto">
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
        <div className="max-w-7xl mx-auto">
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
  const typeIcon = getEventTypeIcon(status)
  const icsHref = buildIcs(event)

  return (
    <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Navigation and Actions */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/events" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a eventos
          </Link>

          <div className="flex gap-3">
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

            {/* Añadir a calendario */}
            <a
              href={icsHref}
              download={`evento-${event.id}.ics`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Añadir a calendario
            </a>

            {/* Acciones del usuario */}
            {canJoin && (
              <div className="flex gap-2">
                {!userParticipation ? (
                  <>
                    <button
                      onClick={() => handleJoinEvent('going')}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {isFull ? 'Lista de espera' : 'Apuntarse'}
                    </button>
                    <button
                      onClick={() => handleJoinEvent('maybe')}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirmar
                      </button>
                    )}

                    {userParticipation.status !== 'maybe' && (
                      <button
                        onClick={() => handleJoinEvent('maybe')}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <PageHeader 
          title="Detalle del Evento" 
          description={`${formatEventDate(event.starts_at)} · ${gameById[event.game_id] || 'Sin formato específico'}`} 
        />

        {/* HERO - Event Info */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${status.color}`} />

            <div className="p-8">
              <div className="grid lg:grid-cols-[1fr_320px] gap-8">
                <div>
                  {/* Header with status */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-4xl">{typeIcon}</div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 break-words">{event.title}</h1>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${status.bg} ${status.text} ring-2 ring-white/20`}>
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${status.color}`} />
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

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                        <span>Organizado por {nickById[event.created_by] || 'Organizador desconocido'}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <span className="text-base">{getLocationIcon(event.location)}</span>
                          <span>{event.location || 'Sin ubicación'}</span>
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">{event.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Event details grid */}
                  <div className="grid gap-6 sm:grid-cols-2">
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
                    </div>

                    <div className="space-y-4">
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
                </div>

                {/* Aside: Participantes */}
                <aside className="space-y-4">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">Participantes</h3>
                      {event.capacity && (
                        <span className="text-xs text-gray-500">{confirmedParticipants.length}/{event.capacity}</span>
                      )}
                    </div>

                    <ul className="space-y-2">
                      {confirmedParticipants.map(p => (
                        <li key={`going-${p.user_id}`} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                            {avatarById[p.user_id] ? (
                              <Image src={avatarById[p.user_id]} alt="avatar" width={32} height={32} className="w-8 h-8 object-cover" />
                            ) : (
                              <div className="w-8 h-8 flex items-center justify-center text-xs text-gray-500">{(nickById[p.user_id] || '?').slice(0,1)}</div>
                            )}
                          </div>
                          <span className="text-sm text-gray-800">{nickById[p.user_id] || p.user_id}</span>
                          <span className="ml-auto text-xs font-medium text-green-700 bg-green-50 rounded px-2 py-0.5">Confirmado</span>
                        </li>
                      ))}

                      {maybeParticipants.map(p => (
                        <li key={`maybe-${p.user_id}`} className="flex items-center gap-3 opacity-90">
                          <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                            {avatarById[p.user_id] ? (
                              <Image src={avatarById[p.user_id]} alt="avatar" width={32} height={32} className="w-8 h-8 object-cover" />
                            ) : (
                              <div className="w-8 h-8 flex items-center justify-center text-xs text-gray-500">{(nickById[p.user_id] || '?').slice(0,1)}</div>
                            )}
                          </div>
                          <span className="text-sm text-gray-800">{nickById[p.user_id] || p.user_id}</span>
                          <span className="ml-auto text-xs font-medium text-gray-700 bg-gray-100 rounded px-2 py-0.5">Tal vez</span>
                        </li>
                      ))}

                      {waitlistParticipants.map(p => (
                        <li key={`wait-${p.user_id}`} className="flex items-center gap-3 opacity-90">
                          <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                            {avatarById[p.user_id] ? (
                              <Image src={avatarById[p.user_id]} alt="avatar" width={32} height={32} className="w-8 h-8 object-cover" />
                            ) : (
                              <div className="w-8 h-8 flex items-center justify-center text-xs text-gray-500">{(nickById[p.user_id] || '?').slice(0,1)}</div>
                            )}
                          </div>
                          <span className="text-sm text-gray-800">{nickById[p.user_id] || p.user_id}</span>
                          <span className="ml-auto text-xs font-medium text-amber-700 bg-amber-50 rounded px-2 py-0.5">Lista de espera</span>
                        </li>
                      ))}

                      {!participants.length && (
                        <li className="text-sm text-gray-500">Sé el primero en apuntarte</li>
                      )}
                    </ul>
                  </div>

                  {isOwner && (
                    <div className="rounded-lg border border-gray-200 p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Acciones de organizador</h3>
                      <div className="flex flex-col gap-2">
                        <Link 
                          href={`/events/edit/${event.id}`} 
                          className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                          Editar evento
                        </Link>
                        
                        <Link 
                          href={`/events/manage/${event.id}`}
                          className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Gestionar asistentes
                        </Link>

                        {/* NUEVO: Botón de eliminar evento */}
                        <ImprovedDeleteButton
                          event={event}
                          participantCount={participants.length}
                          onDelete={handleDeleteEvent}
                          className="w-full justify-center"
                        />
                      </div>
                    </div>
                  )}
                </aside>
              </div>
            </div>
          </div>
        </section>

        {/* Sección secundaria: Notas / Reglas / Info extra si en el futuro añades campos */}
        {event.rules || event.prizes ? (
          <section className="grid md:grid-cols-2 gap-6">
            {event.rules && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Reglas</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">{event.rules}</p>
              </div>
            )}
            {event.prizes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Premios</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">{event.prizes}</p>
              </div>
            )}
          </section>
        ) : null}
      </div>
    </section>
  )
}
