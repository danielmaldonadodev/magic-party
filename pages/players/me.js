// pages/players/me.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function MyProfileRedirect() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const fetchUserAndRedirect = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error || !data?.user) {
          router.replace('/login')
          return
        }
        router.replace(`/players/${data.user.id}`)
      } finally {
        setChecking(false)
      }
    }

    fetchUserAndRedirect()
  }, [router])

  if (checking) {
    return (
      <main className="min-h-[50vh] grid place-items-center text-gray-600">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
          <p className="text-sm">Cargando tu perfil...</p>
        </div>
      </main>
    )
  }

  return null
}
