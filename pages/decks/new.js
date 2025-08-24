// pages/decks/new.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import Card from '../../components/Card'
import FramedArt from '../../components/FramedArt'
import { isValidDeckUrl } from '../../lib/deckServices'
import { translateTypeLine } from '../../lib/mtgTranslate'

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

// Reemplaza tu función handleSave actual con esta versión
const handleSave = async (formData) => {
  if (!deckData) return

  setLoading(true)
  try {
    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      alert('Debes iniciar sesión para guardar mazos')
      return
    }

    // Payload simplificado para el nuevo formato
    const payload = {
      name: formData.name,
      description: formData.description,
      is_public: formData.isPublic,
      format: deckData.format || 'Commander',
      source: deckData.source,
      sourceUrl: url,
      commander: deckData.commander,
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

// Reemplaza tu componente DeckPreviewStep con esta versión
// Reemplaza el componente DeckPreviewStep en tu archivo new.js con esta versión mejorada

function DeckPreviewStep({ deckData, onSave, onBack, loading, error }) {
  const [formData, setFormData] = useState({
    name: deckData.name || '',
    description: deckData.description || '',
    isPublic: true
  })
  
  // Estados para el manejo de imágenes
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  // Verificar si tenemos datos completos o básicos
  const hasCompleteData = deckData.mainboard && deckData.mainboard.length > 0
  const commanderImage = deckData.commander?.image_url
  const commanderName = deckData.commander?.name

  // Calcular estadísticas CORRECTAMENTE sumando quantities
  const mainboardCount = hasCompleteData 
    ? deckData.mainboard.reduce((sum, card) => sum + (card.quantity || 0), 0)
    : 0

  const sideboardCount = hasCompleteData 
    ? deckData.sideboard.reduce((sum, card) => sum + (card.quantity || 0), 0)
    : 0

  const totalCards = mainboardCount + sideboardCount

  // Contar cartas únicas (para mostrar "22 cartas diferentes")
  const uniqueMainboard = deckData.mainboard?.length || 0
  const uniqueSideboard = deckData.sideboard?.length || 0

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Vista previa del mazo
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Columna de imagen mejorada */}
          <div className="space-y-4">
            {commanderImage ? (
              <div className="relative">
                {!imageLoaded && (
                  <div className="w-full aspect-[5/7] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {!imageError ? (
                  <FramedArt 
                    src={commanderImage}
                    alt={commanderName || deckData.name}
                    isCard={true}
                    className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${!imageLoaded ? 'absolute top-0' : ''}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full aspect-[5/7] bg-gray-100 rounded-lg p-8 text-center flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                    <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 text-sm">Error al cargar imagen</p>
                  </div>
                )}

                {commanderName && (
                  <div className="mt-2 text-center">
                    <p className="font-semibold text-gray-900">{commanderName}</p>
                    {deckData.commander?.type_line && (
                      <p className="text-sm text-gray-600">{translateTypeLine(deckData.commander.type_line)}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full aspect-[5/7] bg-gray-100 rounded-lg p-8 text-center flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-gray-500 text-sm">Sin imagen del comandante</p>
              </div>
            )}
          </div>
          
          {/* Columna de información */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-sm font-medium text-gray-600">Nombre:</span>
              <p className="text-lg font-semibold text-gray-900 mt-1">{deckData.name}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-sm font-medium text-gray-600">Formato:</span>
              <p className="font-medium text-gray-900 mt-1">{deckData.format}</p>
            </div>
            
            {commanderName && (
              <div className="bg-gray-50 rounded-lg p-4">
                <span className="text-sm font-medium text-gray-600">Comandante:</span>
                <p className="font-medium text-gray-900 mt-1">{commanderName}</p>
              </div>
            )}
            
            {deckData.commander?.colors?.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <span className="text-sm font-medium text-gray-600 block mb-2">Identidad de color:</span>
                <div className="flex gap-2">
                  {deckData.commander.colors.map(color => {
                    const colorStyles = {
                      'W': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                      'U': 'bg-blue-100 text-blue-800 border-blue-200',
                      'B': 'bg-gray-100 text-gray-800 border-gray-200',
                      'R': 'bg-red-100 text-red-800 border-red-200',
                      'G': 'bg-green-100 text-green-800 border-green-200'
                    }
                    return (
                      <div 
                        key={color} 
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${colorStyles[color] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
                      >
                        {color}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Estadísticas de cartas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                <p className="text-2xl font-bold text-blue-600">{mainboardCount}</p>
                <p className="text-sm font-medium text-blue-800">Mainboard</p>
                {uniqueMainboard !== mainboardCount && (
                  <p className="text-xs text-blue-600">({uniqueMainboard} únicas)</p>
                )}
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
                <p className="text-2xl font-bold text-purple-600">{sideboardCount}</p>
                <p className="text-sm font-medium text-purple-800">Sideboard</p>
                {uniqueSideboard !== sideboardCount && (
                  <p className="text-xs text-purple-600">({uniqueSideboard} únicas)</p>
                )}
              </div>
            </div>

            {totalCards > 0 && (
              <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                <p className="text-2xl font-bold text-green-600">{totalCards}</p>
                <p className="text-sm font-medium text-green-800">Total de cartas</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-sm font-medium text-gray-600">Fuente:</span>
              <p className="font-medium text-gray-900 mt-1 capitalize">{deckData.source}</p>
            </div>

            {/* Indicador del tipo de importación */}
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-blue-900 mb-1">
                    {hasCompleteData ? 'Importación completa' : 'Importación básica'}
                  </p>
                  <p className="text-sm text-blue-700">
                    {hasCompleteData 
                      ? `Se importarán ${mainboardCount} cartas del mainboard y ${sideboardCount} del sideboard.`
                      : 'Solo se importaron los metadatos básicos del mazo.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de cartas si están disponibles */}
        {hasCompleteData && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 text-lg">Cartas importadas</h4>
            <div className="grid md:grid-cols-2 gap-6">
              {uniqueMainboard > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Mainboard ({mainboardCount} cartas, {uniqueMainboard} únicas)
                  </h5>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto border border-gray-200">
                    {deckData.mainboard.slice(0, 12).map((card, index) => (
                      <div key={index} className="flex justify-between items-center py-1.5 border-b border-gray-200 last:border-b-0">
                        <span className="text-sm text-gray-700 font-medium">
                          <span className="inline-block w-6 text-blue-600 font-bold">{card.quantity}×</span>
                          {card.name}
                        </span>
                        {card.type_line && (
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {translateTypeLine(card.type_line)}
                          </span>
                        )}
                      </div>
                    ))}
                    {uniqueMainboard > 12 && (
                      <div className="text-sm text-gray-500 italic text-center pt-2 border-t border-gray-200 mt-2">
                        ... y {uniqueMainboard - 12} cartas más
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {uniqueSideboard > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    Sideboard ({sideboardCount} cartas, {uniqueSideboard} únicas)
                  </h5>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto border border-gray-200">
                    {deckData.sideboard.slice(0, 12).map((card, index) => (
                      <div key={index} className="flex justify-between items-center py-1.5 border-b border-gray-200 last:border-b-0">
                        <span className="text-sm text-gray-700 font-medium">
                          <span className="inline-block w-6 text-purple-600 font-bold">{card.quantity}×</span>
                          {card.name}
                        </span>
                        {card.type_line && (
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {translateTypeLine(card.type_line)}
                          </span>
                        )}
                      </div>
                    ))}
                    {uniqueSideboard > 12 && (
                      <div className="text-sm text-gray-500 italic text-center pt-2 border-t border-gray-200 mt-2">
                        ... y {uniqueSideboard - 12} cartas más
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Formulario de guardado */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuración del mazo
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del mazo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Describe tu mazo, estrategia, o cualquier información relevante..."
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-900 cursor-pointer">
                  Hacer público
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Otros usuarios podrán ver este mazo en la biblioteca pública
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium"
            >
              ← Atrás
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Guardando mazo...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar Mazo
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}