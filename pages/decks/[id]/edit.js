// pages/decks/[id]/edit.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../lib/supabaseClient'
import Link from 'next/link'
import Card from '../../../components/Card'
import FramedArt from '../../../components/FramedArt'
import { createServiceClient } from '../../../lib/supabaseServer'

export default function EditDeckPage({ deck, error }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    name: deck?.name || '',
    description: deck?.description || '',
    format: deck?.format || 'Commander',
    is_public: deck?.is_public ?? true,
    moxfield_url: deck?.moxfield_url || '',
    archidekt_url: deck?.archidekt_url || ''
  })
  const [loading, setLoading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  // Get user state (igual que en otros archivos)
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

  // Check if user is owner
  const isOwner = user && deck && user.id === deck.user_id

  if (error || !deck) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center" padding="xl">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            No se puede editar este mazo
          </h2>
          <p className="text-gray-600 mb-6">
            El mazo no existe o no tienes permisos para editarlo.
          </p>
          <Link
            href="/decks"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a mazos
          </Link>
        </Card>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center" padding="xl">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Acceso denegado
          </h2>
          <p className="text-gray-600 mb-6">
            Solo el propietario del mazo puede editarlo.
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
    setSaveError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSaveError('')

    try {
      const response = await fetch(`/api/decks/${deck.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push(`/decks/${deck.id}`)
      } else {
        const data = await response.json()
        setSaveError(data.error || 'Error al guardar los cambios')
      }
    } catch (error) {
      setSaveError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('¿Estás seguro? Se perderán los cambios no guardados.')) {
        router.push(`/decks/${deck.id}`)
      }
    } else {
      router.push(`/decks/${deck.id}`)
    }
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
            Modifica la información básica de tu mazo
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Preview */}
          <div className="lg:col-span-1">
            <Card padding="lg" className="sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Vista Previa
              </h2>

              {deck.commander_image && (
                <div className="mb-4">
                  <FramedArt 
                    src={deck.commander_image}
                    alt={deck.commander_name || formData.name}
                    isCard={true}
                  />
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Nombre:</span>
                  <p className="text-gray-900 font-medium">
                    {formData.name || 'Sin nombre'}
                  </p>
                </div>

                {deck.commander_name && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Comandante:</span>
                    <p className="text-gray-900">{deck.commander_name}</p>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-gray-600">Formato:</span>
                  <p className="text-gray-900">{formData.format}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">Visibilidad:</span>
                  <p className="text-gray-900">
                    {formData.is_public ? 'Público' : 'Privado'}
                  </p>
                </div>

                {formData.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Descripción:</span>
                    <p className="text-gray-700 text-sm">{formData.description}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Basic Info */}
              <Card padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Información Básica
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del mazo *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nombre de tu mazo"
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
                      placeholder="Describe tu mazo, estrategia, o cualquier información relevante..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Formato
                    </label>
                    <select
                      value={formData.format}
                      onChange={(e) => handleInputChange('format', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Commander">Commander</option>
                      <option value="Modern">Modern</option>
                      <option value="Standard">Standard</option>
                      <option value="Legacy">Legacy</option>
                      <option value="Vintage">Vintage</option>
                      <option value="Pioneer">Pioneer</option>
                      <option value="Pauper">Pauper</option>
                      <option value="Historic">Historic</option>
                      <option value="Custom">Personalizado</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* External URLs */}
              <Card padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Enlaces Externos
                </h3>
                
                <div className="space-y-4">
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

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Nota sobre enlaces externos:</p>
                        <p>Si cambias la URL, podrás sincronizar con la nueva fuente. Los datos del comandante no se actualizarán automáticamente hasta que hagas una sincronización manual.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Privacy Settings */}
              <Card padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Configuración de Privacidad
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={formData.is_public}
                      onChange={(e) => handleInputChange('is_public', e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <label htmlFor="is_public" className="text-sm font-medium text-gray-700">
                        Hacer público este mazo
                      </label>
                      <p className="text-sm text-gray-600 mt-1">
                        Los mazos públicos aparecen en la biblioteca de mazos y pueden ser vistos por otros usuarios. 
                        Los mazos privados solo son visibles para ti.
                      </p>
                    </div>
                  </div>

                  {!formData.is_public && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium mb-1">Mazo privado</p>
                          <p>Este mazo no aparecerá en la biblioteca pública ni en estadísticas de la comunidad.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Error message */}
              {saveError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-red-800 font-medium">Error al guardar</p>
                      <p className="text-red-700 text-sm mt-1">{saveError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>

                <div className="flex gap-3">
                  {hasChanges && (
                    <span className="text-sm text-amber-600 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Cambios sin guardar
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !hasChanges}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            </form>
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
      .select(`
        *,
        profiles:user_id (nickname, avatar_url)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching deck for edit:', error)
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