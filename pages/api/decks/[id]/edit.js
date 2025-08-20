// pages/decks/[id]/edit.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../lib/supabaseClient'
import Link from 'next/link'
import Card from '../../../components/Card'
import FramedArt from '../../../components/FramedArt'
import { createServiceClient } from '../../../lib/supabaseServer'

export default function EditDeckPage({ deck: initialDeck, error: initialError }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [deck, setDeck] = useState(initialDeck)
  const [error, setError] = useState(initialError)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: initialDeck?.name || '',
    description: initialDeck?.description || '',
    format: initialDeck?.format || 'Commander',
    is_public: initialDeck?.is_public ?? true,
    moxfield_url: initialDeck?.moxfield_url || '',
    archidekt_url: initialDeck?.archidekt_url || ''
  })

  // Get user state
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (mounted) setUser(data.user || null)
      } catch (error) {
        console.error('Error getting user:', error)
        if (mounted) setUser(null)
      }
    })()
    
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (mounted) setUser(session?.user || null)
    })
    
    return () => {
      mounted = false
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  // Update form data when deck changes
  useEffect(() => {
    if (deck) {
      setFormData({
        name: deck.name || '',
        description: deck.description || '',
        format: deck.format || 'Commander',
        is_public: deck.is_public ?? true,
        moxfield_url: deck.moxfield_url || '',
        archidekt_url: deck.archidekt_url || ''
      })
    }
  }, [deck])

  const isOwner = user && deck && user.id === deck.user_id

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!deck || !isOwner) return

    setSaving(true)
    setError('')

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error('No autenticado')
      }

      const response = await fetch(`/api/decks/${deck.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar el mazo')
      }

      const result = await response.json()
      setDeck(result.deck)
      
      // Redirigir a la página del deck
      router.push(`/decks/${deck.id}`)
      
    } catch (error) {
      console.error('Error updating deck:', error)
      setError(error.message || 'Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center" padding="xl">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {error === 'not_found' ? 'Mazo no encontrado' : 'Error'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error === 'not_found' 
              ? 'Este mazo no existe o no tienes permisos para editarlo.'
              : 'Ocurrió un error al cargar el mazo.'
            }
          </p>
          <Link
            href="/decks"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a mazos
          </Link>
        </Card>
      </div>
    )
  }

  if (!deck) {
    return <EditDeckSkeleton />
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center" padding="xl">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sin permisos</h2>
          <p className="text-gray-600 mb-6">
            <p>Este texto tiene &quot;comillas&quot; dentro</p>
          </p>
          <Link
            href={`/decks/${deck.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver mazo
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/decks" className="hover:text-blue-600 transition-colors">
              Mazos
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href={`/decks/${deck.id}`} className="hover:text-blue-600 transition-colors">
              {deck.name}
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">Editar</span>
          </div>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Editar Mazo
          </h1>
          <p className="text-gray-600">
            Actualiza la información de tu mazo
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Commander preview */}
          <div className="lg:col-span-1">
            <Card padding="lg" className="sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vista Previa</h3>
              
              {deck.commander_image && (
                <div className="mb-4">
                  <FramedArt 
                    src={deck.commander_image}
                    alt={deck.commander_name || deck.name}
                    isCard={true}
                  />
                </div>
              )}
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Nombre:</span>
                  <p className="text-gray-900">{formData.name || 'Sin nombre'}</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-600">Formato:</span>
                  <p className="text-gray-900">{formData.format}</p>
                </div>
                
                {deck.commander_name && (
                  <div>
                    <span className="font-medium text-gray-600">Comandante:</span>
                    <p className="text-gray-900">{deck.commander_name}</p>
                  </div>
                )}
                
                <div>
                  <span className="font-medium text-gray-600">Visibilidad:</span>
                  <p className="text-gray-900">{formData.is_public ? 'Público' : 'Privado'}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Edit form */}
          <div className="lg:col-span-2">
            <Card padding="lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Basic info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del mazo *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe tu mazo, estrategia, combos..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Formato *
                    </label>
                    <select
                      value={formData.format}
                      onChange={(e) => handleInputChange('format', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="Commander">Commander</option>
                      <option value="Modern">Modern</option>
                      <option value="Standard">Standard</option>
                      <option value="Legacy">Legacy</option>
                      <option value="Vintage">Vintage</option>
                      <option value="Pioneer">Pioneer</option>
                      <option value="Pauper">Pauper</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={formData.is_public}
                      onChange={(e) => handleInputChange('is_public', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="is_public" className="text-sm text-gray-700">
                      <span className="font-medium">Mazo público</span>
                      <span className="block text-gray-500">Otros usuarios podrán ver este mazo</span>
                    </label>
                  </div>
                </div>

                {/* External URLs */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">URLs Externas</h3>
                  <p className="text-sm text-gray-600">
                    Enlaces a plataformas externas para sincronización automática
                  </p>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL de Moxfield
                    </label>
                    <input
                      type="url"
                      value={formData.moxfield_url}
                      onChange={(e) => handleInputChange('moxfield_url', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://moxfield.com/decks/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL de Archidekt
                    </label>
                    <input
                      type="url"
                      value={formData.archidekt_url}
                      onChange={(e) => handleInputChange('archidekt_url', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://archidekt.com/decks/..."
                    />
                  </div>

                  {(formData.moxfield_url || formData.archidekt_url) && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900 mb-1">Sincronización Automática</h4>
                          <p className="text-sm text-blue-700">
                            Con una URL externa configurada, podrás sincronizar automáticamente 
                            los cambios desde la plataforma externa usando el botón &quot;Sincronizar&quot; 
                            en la página del mazo.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error display */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-600">{error}</p>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <Link
                    href={`/decks/${deck.id}`}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </Link>
                  
                  <button
                    type="submit"
                    disabled={saving || !formData.name}
                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton de carga
function EditDeckSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          {/* Header skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>

          {/* Content skeleton */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="h-80 bg-gray-200 rounded-lg" />
              <div className="h-32 bg-gray-200 rounded-lg" />
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// SSR para obtener datos del mazo
export async function getServerSideProps({ params }) {
  try {
    const supabase = createServiceClient()
    
    const { data: deck, error } = await supabase
      .from('decks')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching deck:', error)
      if (error.code === 'PGRST116') {
        return { props: { deck: null, error: 'not_found' } }
      }
      return { props: { deck: null, error: 'server_error' } }
    }

    return {
      props: {
        deck,
        error: null
      }
    }
  } catch (error) {
    console.error('Server error:', error)
    return {
      props: {
        deck: null,
        error: 'server_error'
      }
    }
  }
}