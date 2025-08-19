// pages/decks/index.js
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import Card from '../../components/Card'
import DeckCard from '../../components/DeckCard'

export default function DecksPage({ initialDecks = [], initialPagination = {} }) {
  const [user, setUser] = useState(null)
  const [decks, setDecks] = useState(initialDecks)
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    format: '',
    showOnlyMine: false
  })

  // Get user state (igual que tu navbar)
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

  const fetchDecks = async (newFilters = filters, page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(newFilters.search && { search: newFilters.search }),
        ...(newFilters.format && { format: newFilters.format }),
        ...(newFilters.showOnlyMine && user && { user_id: user.id })
      })

      const response = await fetch(`/api/decks?${params}`)
      const data = await response.json()

      if (response.ok) {
        setDecks(data.decks)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching decks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    fetchDecks(newFilters, 1)
  }

  const handlePageChange = (page) => {
    fetchDecks(filters, page)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Biblioteca de Mazos
              </h1>
              <p className="text-lg text-gray-600">
                Explora y gestiona mazos de Magic: The Gathering
              </p>
            </div>
            
            {user && (
              <Link
                href="/decks/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Importar Mazo
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <DecksFilters 
          filters={filters}
          onFiltersChange={handleFilterChange}
          userLoggedIn={!!user}
        />

        {/* Stats */}
        <DecksStats totalDecks={pagination.total || 0} />

        {/* Decks Grid */}
        {loading ? (
          <DecksLoadingSkeleton />
        ) : decks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {decks.map((deck) => (
                <DeckCard key={deck.id} deck={deck} />
              ))}
            </div>
            
            {/* Pagination */}
            <DecksPagination 
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <DecksEmptyState filters={filters} />
        )}
      </div>
    </div>
  )
}

// Componente de filtros
function DecksFilters({ filters, onFiltersChange, userLoggedIn }) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleSubmit = (e) => {
    e.preventDefault()
    onFiltersChange(localFilters)
  }

  const handleReset = () => {
    const resetFilters = { search: '', format: '', showOnlyMine: false }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  return (
    <Card className="mb-8" padding="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar mazos por nombre, descripción o comandante..."
                value={localFilters.search}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {localFilters.search && (
                <button
                  type="button"
                  onClick={() => setLocalFilters(prev => ({ ...prev, search: '' }))}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Format filter */}
          <div>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={localFilters.format}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, format: e.target.value }))}
            >
              <option value="">Todos los formatos</option>
              <option value="Commander">Commander</option>
              <option value="Modern">Modern</option>
              <option value="Standard">Standard</option>
              <option value="Legacy">Legacy</option>
              <option value="Vintage">Vintage</option>
            </select>
          </div>

          {/* My decks toggle */}
          {userLoggedIn && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showOnlyMine"
                checked={localFilters.showOnlyMine}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, showOnlyMine: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="showOnlyMine" className="text-sm font-medium text-gray-700">
                Solo mis mazos
              </label>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </form>
    </Card>
  )
}

// Componente de estadísticas
function DecksStats({ totalDecks }) {
  return (
    <div className="mb-8">
      <Card padding="lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{totalDecks.toLocaleString()}</p>
            <p className="text-gray-600">mazos en la biblioteca</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Skeleton loading
function DecksLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <Card padding="none">
            <div className="h-48 bg-gray-200 rounded-t-lg" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          </Card>
        </div>
      ))}
    </div>
  )
}

// Empty state
function DecksEmptyState({ filters }) {
  const hasFilters = filters.search || filters.format || filters.showOnlyMine

  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {hasFilters ? 'No se encontraron mazos' : '¡Aún no hay mazos aquí!'}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {hasFilters 
          ? 'Intenta ajustar los filtros o crear un nuevo mazo.'
          : 'Sé el primero en importar un mazo y comenzar a construir la biblioteca de la comunidad.'
        }
      </p>
      
      <Link
        href="/decks/new"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Importar Primer Mazo
      </Link>
    </div>
  )
}

// Pagination
function DecksPagination({ pagination, onPageChange }) {
  const { page, totalPages } = pagination
  
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    let start = Math.max(1, page - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Anterior
      </button>
      
      {getPageNumbers().map(pageNum => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`px-3 py-2 text-sm rounded-lg ${
            pageNum === page
              ? 'bg-blue-600 text-white'
              : 'border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {pageNum}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Siguiente
      </button>
    </div>
  )
}

// SSR para datos iniciales
export async function getServerSideProps({ query }) {
  try {
    const params = new URLSearchParams({
      page: '1',
      limit: '12',
      ...(query.search && { search: query.search }),
      ...(query.format && { format: query.format })
    })

    // En desarrollo, comentar esta línea hasta tener la API funcionando
    // const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/decks?${params}`)
    // const data = await response.json()

    // Datos mock para desarrollo inicial
    const data = {
      decks: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 }
    }

    return {
      props: {
        initialDecks: data.decks || [],
        initialPagination: data.pagination || {}
      }
    }
  } catch (error) {
    console.error('Error fetching initial decks:', error)
    return {
      props: {
        initialDecks: [],
        initialPagination: {}
      }
    }
  }
}