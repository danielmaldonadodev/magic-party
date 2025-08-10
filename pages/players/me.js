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
        // 1. Obtener usuario logueado
        const { data: userData, error: userError } = await supabase.auth.getUser()
        const user = userData?.user

        if (userError || !user) {
          router.replace('/login')
          return
        }

        // 2. Verificar que exista en profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError || !profileData) {
          console.warn('Usuario en auth pero no en profiles. Cerrando sesión...')
          await supabase.auth.signOut()
          router.replace('/login')
          return
        }

        // 3. Redirigir a su perfil
        router.replace(`/players/${user.id}`)
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
