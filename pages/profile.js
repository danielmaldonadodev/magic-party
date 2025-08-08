'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/login')
        return
      }
      setUser(user)
      setNickname(user.user_metadata?.nickname || '')
      setLoading(false)
    }
    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null)
        router.push('/login')
      } else {
        setUser(session.user)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [router])

  const handleSave = async (e) => {
    e.preventDefault()
    setMessage('')
    const { error } = await supabase.auth.updateUser({ data: { nickname } })
    if (error) {
      setMessage(`Error al guardar: ${error.message}`)
    } else {
      setMessage('✅ Nickname actualizado')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading || !user) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando...</p>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 font-sans">
      <h1 className="text-2xl font-semibold mb-6 text-primary">Mi Perfil</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
            {user.user_metadata?.nickname?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-lg">{user.user_metadata?.nickname || 'Sin nickname'}</p>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <label className="block">
            <span className="text-sm text-gray-600">Cambiar nickname</span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </label>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Guardar cambios
          </button>
        </form>

        {message && <p className="text-sm text-gray-700">{message}</p>}

        <hr className="my-4" />

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  )
}
