import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../../lib/supabaseClient'
import { createSupabaseServerClient } from '../../../lib/supabaseServer'
import PageHeader from '../../../components/PageHeader'

/* ===============================================================
  UTILITY FUNCTIONS
  =============================================================== */
function formatDateForInput(dateString) {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch {
    return ''
  }
}

/* ===============================================================
  MAIN COMPONENT
  =============================================================== */
export default function EditEvent({ 
  initialEvent = null, 
  initialFormats = [],
  eventId = null 
}) {
  const router = useRouter()
  const { id } = router.query

  // Estados
  const [event, setEvent] = useState(initialEvent)
  const [formats, setFormats] = useState(initialFormats)
  const [currentUser, setCurrentUser] = useState(null)
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    starts_at: '',
    ends_at: '',
    location: '',
    game_id: '',
    capacity: '',
    visibility: 'public'
  })
  
  // UI states
  const [loading, setLoading] = useState(!initialEvent)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

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

        // Si no hay evento inicial, cargarlo
        if (!initialEvent && id) {
          setLoading(true)
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single()

          if (eventError) {
            setError('Evento no encontrado')
            return
          }

          if (!ignore) {
            setEvent(eventData)
          }
        }

        // Si no hay formatos, cargarlos
        if (formats.length === 0) {
          const { data: formatsData } = await supabase
            .from('games')
            .select('id, name')
            .order('name')

          if (!ignore && formatsData) {
            setFormats(formatsData)
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
  }, [id, initialEvent, formats.length])

  // Inicializar formulario cuando se carga el evento
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        starts_at: formatDateForInput(event.starts_at),
        ends_at: formatDateForInput(event.ends_at),
        location: event.location || '',
        game_id: event.game_id || '',
        capacity: event.capacity || '',
        visibility: event.visibility || 'public'
      })
    }
  }, [event])

  // Verificar permisos
  const canEdit = currentUser && event && (
    currentUser.id === event.created_by ||
    currentUser.user_metadata?.is_admin === true ||
    currentUser.app_metadata?.is_admin === true
  )

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!canEdit) {
      setError('No tienes permisos para editar este evento')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Validaciones básicas
      if (!formData.title.trim()) {
        throw new Error('El título es obligatorio')
      }

      if (!formData.starts_at) {
        throw new Error('La fecha de inicio es obligatoria')
      }

      if (!formData.ends_at) {
        throw new Error('La fecha de fin es obligatoria')
      }

      if (new Date(formData.starts_at) >= new Date(formData.ends_at)) {
        throw new Error('La fecha de fin debe ser posterior a la de inicio')
      }

      // Preparar datos para actualizar
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        starts_at: formData.starts_at,
        ends_at: formData.ends_at,
        location: formData.location.trim(),
        game_id: formData.game_id || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        visibility: formData.visibility,
        updated_at: new Date().toISOString()
      }

      // Actualizar en Supabase
      const { error: updateError } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', event.id)

      if (updateError) {
        throw updateError
      }

      setSuccess(true)
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        router.push(`/events/${event.id}`)
      }, 1500)

    } catch (err) {
      setError(err.message || 'Error al actualizar el evento')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!canEdit) {
      setError('No tienes permisos para eliminar este evento')
      return
    }

    const confirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.'
    )

    if (!confirmed) return

    setSaving(true)
    setError(null)

    try {
      // Primero eliminar participantes
      const { error: participantsError } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', event.id)

      if (participantsError) throw participantsError

      // Luego eliminar el evento
      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id)

      if (eventError) throw eventError

      // Redirigir a la lista de eventos
      router.push('/events')

    } catch (err) {
      setError(err.message || 'Error al eliminar el evento')
      setSaving(false)
    }
  }

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

  if (error && !event) {
    return (
      <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.17 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-red-800 mb-2">Error al cargar el evento</h3>
              <p className="text-red-700 mb-6">{error}</p>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
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

  if (!canEdit) {
    return (
      <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden">
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-amber-800 mb-2">Sin permisos</h3>
              <p className="text-amber-700 mb-6">
                No tienes permisos para editar este evento
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href={`/events/${event?.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                >
                  Ver evento
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-lg border border-amber-600 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50"
                >
                  Ver todos los eventos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/events/${event?.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al evento
          </Link>
        </div>

        <PageHeader 
          title="Editar Evento" 
          description="Actualiza los detalles de tu evento y mantén informada a la comunidad" 
        />

        {/* Success Message */}
        {success && (
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">¡Evento actualizado!</h3>
                    <p className="text-green-700">Los cambios se han guardado correctamente. Redirigiendo...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.17 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800">Error</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Información básica */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Información básica
              </h2>
              
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Título del evento *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-white py-3 px-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Ej: Torneo Commander EDH"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Formato de juego
                  </label>
                  <select
                    name="game_id"
                    value={formData.game_id}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 bg-white py-3 px-4 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  >
                    <option value="">Seleccionar formato</option>
                    {formats.map((format) => (
                      <option key={format.id} value={format.id}>
                        {format.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="block w-full rounded-lg border border-gray-300 bg-white py-3 px-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Describe tu evento, reglas especiales, premios, etc."
                />
              </div>
            </div>

            {/* Fecha y hora */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Fecha y hora
              </h2>
              
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Fecha y hora de inicio *
                  </label>
                  <input
                    type="datetime-local"
                    name="starts_at"
                    value={formData.starts_at}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-white py-3 px-4 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Fecha y hora de fin *
                  </label>
                  <input
                    type="datetime-local"
                    name="ends_at"
                    value={formData.ends_at}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-white py-3 px-4 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación y capacidad */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Ubicación y capacidad
              </h2>
              
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 bg-white py-3 px-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Ej: Tienda local, Discord, SpellTable"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Capacidad máxima
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    className="block w-full rounded-lg border border-gray-300 bg-white py-3 px-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Dejar vacío para sin límite"
                  />
                </div>
              </div>
            </div>

            {/* Visibilidad */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Configuración
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Visibilidad del evento
                </label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-gray-300 bg-white py-3 px-4 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="public">Público - Visible para todos</option>
                  <option value="private">Privado - Solo por invitación</option>
                </select>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Actualizar evento
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-6 py-3 text-red-700 font-medium shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar evento
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

/* ===============================================================
  SSR - DATOS DEL SERVIDOR
  =============================================================== */
export async function getServerSideProps({ req, res, params }) {
  const supabase = createSupabaseServerClient(req, res)
  const { id } = params

  try {
    console.log('🔍 SSR: Loading event edit data for ID:', id)
    
    // Cargar evento y formatos en paralelo
    const [eventRes, formatsRes] = await Promise.allSettled([
      supabase.from('events').select('*').eq('id', id).single(),
      supabase.from('games').select('id, name').order('name')
    ])

    console.log('📊 SSR Results:', {
      event: eventRes.status === 'fulfilled' ? 'found' : eventRes.reason,
      formats: formatsRes.status === 'fulfilled' ? formatsRes.value.data?.length : formatsRes.reason,
    })

    const event = eventRes.status === 'fulfilled' ? eventRes.value.data : null
    const formats = formatsRes.status === 'fulfilled' ? (formatsRes.value.data || []) : []

    // Si no se encuentra el evento, mostrar 404
    if (!event) {
      return {
        notFound: true
      }
    }

    console.log('✅ SSR: Returning event edit data')

    return {
      props: {
        initialEvent: event,
        initialFormats: formats,
        eventId: id,
      },
    }
  } catch (error) {
    console.error('💥 SSR Error fetching event edit data:', error)
    return {
      notFound: true
    }
  }
}