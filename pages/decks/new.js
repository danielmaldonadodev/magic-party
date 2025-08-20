// pages/decks/new.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import Card from '../../components/Card'
import FramedArt from '../../components/FramedArt'
import { isValidDeckUrl } from '../../lib/deckServices'

export default function NewDeckPage() {
  const [user, setUser] = useState(null)
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: URL, 2: Preview, 3: Save
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [deckData, setDeckData] = useState(null)
  const [error, setError] = useState('')

  // Get user state (similar to your navbar)
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

  const handleUrlSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!isValidDeckUrl(url)) {
      setError('URL no válida. Debe ser de Moxfield o Archidekt.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/decks/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      const data = await response.json()

      if (response.ok) {
        setDeckData(data.deck)
        setStep(2)
      } else {
        setError(data.error || 'Error al importar el mazo')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

// pages/decks/new.js - Sección del formulario de guardado
// Busca la función handleSave y reemplázala con esta:

const handleSave = async () => {
  if (!deckData) return

  setLoading(true)
  try {
    // Obtener el token de autenticación
    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      alert('Debes iniciar sesión para guardar mazos')
      return
    }

    // Preparar datos para enviar según tu esquema
    const payload = {
      name: deckData.name,
      format: deckData.format || 'Commander',
      description: deckData.description || null,
      source: url.includes('moxfield.com') ? 'moxfield' : 
              url.includes('archidekt.com') ? 'archidekt' : 'other',
      
      // URLs
      moxfield_url: url.includes('moxfield.com') ? url : null,
      archidekt_url: url.includes('archidekt.com') ? url : null,
      
      // Datos del comandante
      commander: deckData.commander ? {
        name: deckData.commander.name,
        image_url: deckData.commander.image_url,
        colors: deckData.commander.colors,
        scryfall_id: deckData.commander.scryfall_id
      } : null,
      
      // Colores (array de strings)
      colors: deckData.commander?.colors || [],
      
      // Cartas (para logging/debugging)
      cards: deckData.mainboard || [],
      mainboard: deckData.mainboard || [],
      sideboard: deckData.sideboard || []
    }

    console.log('📤 Sending payload:', payload)

    const response = await fetch('/api/decks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.session.access_token}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ Server error:', errorData)
      throw new Error(`Error ${response.status}: ${errorData}`)
    }

    const result = await response.json()
    console.log('✅ Deck saved:', result)

    // Redirigir a la página del mazo o a la lista
    if (result.deck?.id) {
      router.push(`/decks/${result.deck.id}`)
    } else {
      router.push('/decks')
    }
    
  } catch (error) {
    console.error('❌ Error saving deck:', error)
    alert(`Error al guardar el mazo: ${error.message}`)
  } finally {
    setLoading(false)
  }
}

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center" padding="xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Inicia sesión requerida
          </h2>
          <p className="text-gray-600 mb-6">
            Necesitas iniciar sesión para importar mazos.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir a iniciar sesión
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Importar Nuevo Mazo
          </h1>
          <p className="text-gray-600">
            Importa tu mazo desde Moxfield o Archidekt
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  s <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    s < step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 text-sm text-gray-600">
            <span className="mx-4">URL</span>
            <span className="mx-4">Vista previa</span>
            <span className="mx-4">Guardar</span>
          </div>
        </div>

        {step === 1 && (
          <DeckUrlStep 
            url={url}
            setUrl={setUrl}
            onSubmit={handleUrlSubmit}
            loading={loading}
            error={error}
          />
        )}

        {step === 2 && deckData && (
          <DeckPreviewStep 
            deckData={deckData}
            onSave={handleSave}
            onBack={() => setStep(1)}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  )
}

// Componente para el paso 1: URL
function DeckUrlStep({ url, setUrl, onSubmit, loading, error }) {
  return (
    <Card padding="xl">
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL del mazo
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://moxfield.com/decks/... o https://archidekt.com/decks/..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="mt-2 text-sm text-gray-600">
            Soportamos URLs de Moxfield y Archidekt
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !url}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Importando...' : 'Importar Mazo'}
        </button>
      </form>
    </Card>
  )
}

// Componente para el paso 2: Preview
function DeckPreviewStep({ deckData, onSave, onBack, loading, error }) {
  const [formData, setFormData] = useState({
    name: deckData.name,
    description: deckData.description,
    isPublic: true
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="space-y-6">
      {/* Preview */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Vista previa del mazo
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            {deckData.commander.image && (
              <FramedArt 
                src={deckData.commander.image}
                alt={deckData.commander.name}
                isCard={true}
              />
            )}
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">Nombre:</span>
              <p className="text-lg font-semibold">{deckData.name}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-600">Formato:</span>
              <p>{deckData.format}</p>
            </div>
            
            {deckData.commander.name && (
              <div>
                <span className="text-sm font-medium text-gray-600">Comandante:</span>
                <p>{deckData.commander.name}</p>
              </div>
            )}
            
            {deckData.commander.colors?.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600">Colores:</span>
                <div className="flex gap-1 mt-1">
                  {deckData.commander.colors.map(color => (
                    <div key={color} className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                      {color}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Form */}
      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del mazo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              Hacer público (otros usuarios podrán ver este mazo)
            </label>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Atrás
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Guardando...' : 'Guardar Mazo'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}