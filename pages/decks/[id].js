// pages/decks/[id].js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Card from '../../components/Card'
import FramedArt from '../../components/FramedArt'
import ManaSymbol from '../../components/ManaSymbol'
import { useDeckActions } from '../../components/DeckCard'
import { createServiceClient } from '../../lib/supabaseServer'

export default function DeckDetailPage({ deck: initialDeck, error: initialError }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const { syncDeck, deleteDeck } = useDeckActions()
  const [deck, setDeck] = useState(initialDeck)
  const [error, setError] = useState(initialError)
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  const isOwner = user && deck && user.id === deck.user_id

  const handleSync = async () => {
    setSyncing(true)
    setSyncStatus(null)

    try {
      const result = await syncDeck(deck.id)
      setSyncStatus({
        type: 'success',
        message: result.hasChanges ? 'Mazo actualizado exitosamente' : 'El mazo ya estaba actualizado',
        changes: result.changes
      })

      // Recargar datos del mazo si hubo cambios
      if (result.hasChanges) {
        router.replace(router.asPath)
      }
    } catch (error) {
      setSyncStatus({
        type: 'error',
        message: error.message || 'Error al sincronizar el mazo'
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteDeck(deck.id)
      router.push('/decks')
    } catch (error) {
      setError(error.message || 'Error al eliminar el mazo')
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
              ? 'Este mazo no existe o no tienes permisos para verlo.'
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
    return <DeckDetailSkeleton />
  }

  const getExternalUrl = () => deck.moxfield_url || deck.archidekt_url
  const getSourceName = () => deck.moxfield_url ? 'Moxfield' : 'Archidekt'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/decks" className="hover:text-blue-600 transition-colors">
              Mazos
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">{deck.name}</span>
          </div>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {deck.name}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>{deck.format}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Actualizado {format(new Date(deck.updated_at), 'dd \'de\' MMMM \'de\' yyyy', { locale: es })}
                  </span>
                </div>

                {deck.profiles?.nickname && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>por {deck.profiles.nickname}</span>
                  </div>
                )}
              </div>

              {deck.description && (
                <p className="text-gray-700 leading-relaxed">
                  {deck.description}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {getExternalUrl() && (
                <a
                  href={getExternalUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Ver en {getSourceName()}
                </a>
              )}

              {isOwner && (
                <>
                  {getExternalUrl() && (
                    <button
                      onClick={handleSync}
                      disabled={syncing}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <svg className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {syncing ? 'Sincronizando...' : 'Sincronizar'}
                    </button>
                  )}

                  <Link
                    href={`/decks/${deck.id}/edit`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sync status */}
        {syncStatus && (
          <div className={`mb-6 p-4 rounded-lg border ${
            syncStatus.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start gap-3">
              <svg className={`w-5 h-5 mt-0.5 ${syncStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {syncStatus.type === 'success' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <div className="flex-1">
                <p className="font-medium">{syncStatus.message}</p>
                {syncStatus.changes && syncStatus.changes.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Cambios detectados:</p>
                    <ul className="text-sm space-y-1">
                      {syncStatus.changes.map((change, i) => (
                        <li key={i}>
                          <span className="font-medium">{change.field}:</span> {change.old} → {change.new}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Commander info */}
          <div className="lg:col-span-1">
            <DeckCommanderInfo deck={deck} />
          </div>

          {/* Deck details */}
          <div className="lg:col-span-2 space-y-6">
            <DeckInfoCards deck={deck} />
            <DeckSyncHistory deck={deck} />
            
            {isOwner && (
              <DeckDangerZone 
                deck={deck}
                onDelete={() => setShowDeleteConfirm(true)}
              />
            )}
          </div>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <DeleteConfirmModal
            deckName={deck.name}
            onConfirm={handleDelete}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
      </div>
    </div>
  )
}

// Componente de información del comandante
function DeckCommanderInfo({ deck }) {
  const formatColors = (colors) => {
    if (!colors || colors.length === 0) return 'Incoloro'
    const colorMap = { W: 'Blanco', U: 'Azul', B: 'Negro', R: 'Rojo', G: 'Verde' }
    return colors.map(c => colorMap[c] || c).join(', ')
  }

  return (
    <Card padding="lg" className="sticky top-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {deck.format === 'Commander' ? 'Comandante' : 'Información del Mazo'}
      </h2>

      {deck.commander_image && (
        <div className="mb-6">
          <FramedArt 
            src={deck.commander_image}
            alt={deck.commander_name || deck.name}
            isCard={true}
          />
        </div>
      )}

      <div className="space-y-4">
        {deck.commander_name && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {deck.format === 'Commander' ? 'Comandante' : 'Carta Principal'}
            </h3>
            <p className="text-gray-700">{deck.commander_name}</p>
          </div>
        )}

        {deck.commander_colors && deck.commander_colors.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Identidad de Color</h3>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {deck.commander_colors.map((color, i) => (
                  <ManaSymbol key={i} symbol={color} size="md" />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {formatColors(deck.commander_colors)}
              </span>
            </div>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Formato</h3>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {deck.format}
          </span>
        </div>

        {deck.commander_scryfall_id && (
          <div>
            <a
              href={`https://scryfall.com/card/${deck.commander_scryfall_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ver en Scryfall
            </a>
          </div>
        )}
      </div>
    </Card>
  )
}

// Componente de tarjetas de información
function DeckInfoCards({ deck }) {
  const getSourceName = () => deck.moxfield_url ? 'Moxfield' : 'Archidekt'
  const getLastSyncStatus = () => {
    if (!deck.last_synced_at) return { status: 'never', text: 'Nunca sincronizado', color: 'gray' }
    
    const lastSync = new Date(deck.last_synced_at)
    const now = new Date()
    const hoursDiff = (now - lastSync) / (1000 * 60 * 60)
    
    if (hoursDiff < 1) return { status: 'recent', text: 'Hace menos de 1 hora', color: 'green' }
    if (hoursDiff < 24) return { status: 'today', text: `Hace ${Math.floor(hoursDiff)} horas`, color: 'blue' }
    
    const daysDiff = Math.floor(hoursDiff / 24)
    if (daysDiff < 7) return { status: 'week', text: `Hace ${daysDiff} días`, color: 'yellow' }
    
    return { status: 'old', text: `Hace ${daysDiff} días`, color: 'red' }
  }

  const syncStatus = getLastSyncStatus()

  return (
    <div className="grid md:grid-cols-2 gap-6">
      
      {/* Source info */}
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Fuente Externa</h3>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-600">Plataforma:</span>
            <p className="text-gray-900">{getSourceName()}</p>
          </div>
          
          {(deck.moxfield_url || deck.archidekt_url) && (
            <div>
              <span className="text-sm font-medium text-gray-600">URL:</span>
              <p className="text-sm text-gray-700 break-all">
                {deck.moxfield_url || deck.archidekt_url}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Sync status */}
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            syncStatus.color === 'green' ? 'bg-green-100' :
            syncStatus.color === 'blue' ? 'bg-blue-100' :
            syncStatus.color === 'yellow' ? 'bg-yellow-100' :
            syncStatus.color === 'red' ? 'bg-red-100' : 'bg-gray-100'
          }`}>
            <svg className={`w-5 h-5 ${
              syncStatus.color === 'green' ? 'text-green-600' :
              syncStatus.color === 'blue' ? 'text-blue-600' :
              syncStatus.color === 'yellow' ? 'text-yellow-600' :
              syncStatus.color === 'red' ? 'text-red-600' : 'text-gray-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Estado de Sincronización</h3>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-600">Última sincronización:</span>
            <p className="text-gray-900">{syncStatus.text}</p>
          </div>
          
          {deck.deck_hash && (
            <div>
              <span className="text-sm font-medium text-gray-600">Hash del mazo:</span>
              <p className="text-xs text-gray-600 font-mono">{deck.deck_hash}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Created/Updated info */}
      <Card padding="lg" className="md:col-span-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h6l2 2h6a2 2 0 012 2v4M3 21h18M3 10h18M9 7h6m-7 4v4a2 2 0 002 2h4a2 2 0 002-2v-4H9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Información del Registro</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <span className="text-sm font-medium text-gray-600">Fecha de creación:</span>
            <p className="text-gray-900">
              {format(new Date(deck.created_at), 'dd \'de\' MMMM \'de\' yyyy \'a las\' HH:mm', { locale: es })}
            </p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-600">Última modificación:</span>
            <p className="text-gray-900">
              {format(new Date(deck.updated_at), 'dd \'de\' MMMM \'de\' yyyy \'a las\' HH:mm', { locale: es })}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Componente de historial de sincronización
function DeckSyncHistory({ deck }) {
  if (!deck.sync_logs || deck.sync_logs.length === 0) {
    return null
  }

  return (
    <Card padding="lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Sincronización</h3>
      
      <div className="space-y-3">
        {deck.sync_logs.map((log, i) => (
          <div key={log.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${
              log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium capitalize">{log.source}</span>
                <span className={`text-sm px-2 py-0.5 rounded text-xs font-medium ${
                  log.status === 'success' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {log.status === 'success' ? 'Exitoso' : 'Error'}
                </span>
              </div>
              
              {log.error_message && (
                <p className="text-sm text-red-600 mt-1">{log.error_message}</p>
              )}
            </div>
            
              <span className="text-sm text-gray-500">
                {format(new Date(log.synced_at), 'dd/MM HH:mm')}
              </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

// Componente de zona peligrosa (solo para propietarios)
function DeckDangerZone({ deck, onDelete }) {
  return (
    <Card padding="lg" className="border-red-200 bg-red-50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-900">Zona Peligrosa</h3>
      </div>

      <p className="text-red-700 mb-4">
        Una vez que elimines este mazo, no podrás recuperarlo. Esta acción es permanente.
      </p>

      <button
        onClick={onDelete}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Eliminar Mazo
      </button>
    </Card>
  )
}

// Modal de confirmación de eliminación
function DeleteConfirmModal({ deckName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full" padding="lg">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ¿Eliminar mazo?
          </h3>
          
          <p className="text-gray-600 mb-6">
            ¿Estás seguro de que quieres eliminar <strong>&quot;{deckName}&quot;</strong>? 
            Esta acción no se puede deshacer.
          </p>
        
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Skeleton de carga
function DeckDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          {/* Header skeleton */}
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>

          {/* Content skeleton */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="h-80 bg-gray-200 rounded-lg" />
              <div className="h-32 bg-gray-200 rounded-lg" />
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-32 bg-gray-200 rounded-lg" />
                <div className="h-32 bg-gray-200 rounded-lg" />
              </div>
              <div className="h-48 bg-gray-200 rounded-lg" />
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
      .select(`
        *,
        profiles:user_id (nickname, avatar_url)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching deck:', error)
      if (error.code === 'PGRST116') {
        return { props: { deck: null, error: 'not_found' } }
      }
      return { props: { deck: null, error: 'server_error' } }
    }

    // Obtener logs de sincronización
    const { data: syncLogs } = await supabase
      .from('deck_sync_logs')
      .select('*')
      .eq('deck_id', params.id)
      .order('synced_at', { ascending: false })
      .limit(10)

    return {
      props: {
        deck: {
          ...deck,
          sync_logs: syncLogs || []
        },
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