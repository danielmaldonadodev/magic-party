// hooks/useDeckActions.js
import { supabase } from '../lib/supabaseClient'

export function useDeckActions() {
  const syncDeck = async (deckId) => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error('No autenticado')
      }

      const response = await fetch(`/api/decks/${deckId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al sincronizar')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error syncing deck:', error)
      throw error
    }
  }

  const deleteDeck = async (deckId) => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error('No autenticado')
      }

      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar')
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting deck:', error)
      throw error
    }
  }

  const updateDeck = async (deckId, updateData) => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error('No autenticado')
      }

      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating deck:', error)
      throw error
    }
  }

  const getDeck = async (deckId) => {
    try {
      const { data: session } = await supabase.auth.getSession()
      const headers = {
        'Content-Type': 'application/json'
      }
      
      if (session.session?.access_token) {
        headers.Authorization = `Bearer ${session.session.access_token}`
      }

      const response = await fetch(`/api/decks/${deckId}`, { headers })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al obtener el mazo')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting deck:', error)
      throw error
    }
  }

  return { 
    syncDeck, 
    deleteDeck, 
    updateDeck, 
    getDeck 
  }
}