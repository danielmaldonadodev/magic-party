// pages/profile/edit.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import Card from '@/components/Card'

/* ────────────────────────────────────────────── */
/* Professional Animations & Styles                */
/* ────────────────────────────────────────────── */
const customStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes pulse-subtle {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .animate-slideInLeft {
    animation: slideInLeft 0.5s ease-out forwards;
  }

  .animate-pulse-subtle {
    animation: pulse-subtle 2s ease-in-out infinite;
  }
`

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('edit-profile-professional-styles')) {
  const style = document.createElement('style')
  style.id = 'edit-profile-professional-styles'
  style.textContent = customStyles
  document.head.appendChild(style)
}

/* ────────────────────────────────────────────── */
/* Professional Components                          */
/* ────────────────────────────────────────────── */
function ProfessionalSkeleton() {
  return (
    <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm animate-pulse">
          <div className="h-1 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
          <div className="p-8 space-y-4">
            <div className="h-8 w-80 bg-gray-200 rounded-lg" />
            <div className="h-4 w-96 bg-gray-100 rounded" />
          </div>
        </div>

        {/* Form skeleton */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm animate-pulse">
          <div className="h-1 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-6">
              <div className="h-32 w-32 rounded-full bg-gray-200" />
              <div className="space-y-3">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-10 w-48 bg-gray-100 rounded-lg" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-12 w-full bg-gray-100 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-gray-100 rounded-lg" />
              <div className="h-20 bg-gray-100 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProfessionalBreadcrumb() {
  return (
    <nav className="mb-8" aria-label="Breadcrumb">
      <div className="flex items-center gap-2 text-sm">
        <Link 
          href="/players/me" 
          className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
        >
          Mi Perfil
        </Link>
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-semibold">Editar Perfil</span>
      </div>
    </nav>
  )
}

function ProfessionalAlert({ type, title, message, onClose }) {
  const themes = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: (
        <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: (
        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
  }

  const theme = themes[type]

  return (
    <div className={`rounded-lg border ${theme.border} ${theme.bg} p-4 ${theme.text} animate-fadeInUp`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {theme.icon}
          <div>
            <h4 className="font-medium">{title}</h4>
            <span className="text-sm">{message}</span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

function ProfessionalAvatarUpload({ 
  currentAvatar, 
  previewAvatar, 
  onFileSelect, 
  isUploading,
  error,
  setError 
}) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      // Validar que solo se subió una imagen
      if (files.length > 1) {
        setError && setError('Solo puedes subir una imagen a la vez.')
        return
      }
      onFileSelect(files[0])
    }
  }

  return (
    <div className="space-y-6">
      <label className="block text-sm font-medium text-gray-900">
        Imagen de Perfil
      </label>
      
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
        {/* Avatar Preview */}
        <div className="relative group">
          <div className="h-40 w-40 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg bg-gray-100 transition-all duration-300 group-hover:border-gray-300">
            {previewAvatar || currentAvatar ? (
              <Image
                src={previewAvatar || currentAvatar}
                alt="Vista previa del avatar"
                fill
                className="object-cover transition-all duration-300 group-hover:scale-105"
                sizes="160px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Upload indicator */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
          
          {/* Change indicator */}
          {previewAvatar && previewAvatar !== currentAvatar && (
            <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div className="flex-1 space-y-4">
          <div
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-all duration-300 ${
              isDragging
                ? 'border-gray-500 bg-gray-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  onFileSelect(file)
                }
                // Reset input para permitir seleccionar el mismo archivo de nuevo
                e.target.value = ''
              }}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={isUploading}
            />
            
            <div className="space-y-4">
              <div className="mx-auto h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-900 font-medium">
                  {isDragging ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz clic para seleccionar'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  JPG, PNG o WEBP · Mínimo 300×300px · Máximo 5MB
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const input = document.querySelector('input[type="file"]')
                if (input) {
                  input.click()
                }
              }}
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Seleccionar archivo
            </button>
            
            {(previewAvatar || currentAvatar) && (
              <button
                type="button"
                onClick={() => onFileSelect(null)}
                disabled={isUploading}
                className="text-sm text-red-600 hover:text-red-800 transition-colors duration-200 font-medium disabled:opacity-50"
              >
                Eliminar imagen
              </button>
            )}
          </div>
          
          {/* Error específico del avatar */}
          {error && error.includes('imagen') && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-start gap-2">
                <svg className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────── */
/* Main Component                                   */
/* ────────────────────────────────────────────── */
export default function EditProfile() {
  const router = useRouter()
  
  // Estados principales
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Estados del formulario
  const [nickname, setNickname] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState('')
  const [highlightPref, setHighlightPref] = useState('commander')
  
  // Estados de UI
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  // Estados iniciales para detectar cambios
  const [initialNickname, setInitialNickname] = useState('')
  const [initialHighlightPref, setInitialHighlightPref] = useState('')

  // Validaciones
  const clean = nickname.trim()
  const isNicknameValid = clean.length >= 2 && clean.length <= 32
  const hasChanges = 
    clean !== initialNickname || 
    avatarFile !== null || 
    highlightPref !== initialHighlightPref
  const canSave = isNicknameValid && hasChanges && !saving

  // Inicialización
  useEffect(() => {
    let mounted = true
    
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!mounted) return
      
      if (!session?.user?.id) {
        router.replace('/login')
        return
      }
      
      setSession(session)
      await fetchProfile(session.user.id)
      setLoading(false)
    }

    initAuth()
    return () => { mounted = false }
  }, [router])

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('nickname, avatar_url, highlight_image_preference')
        .eq('id', userId)
        .single()
        
      if (error) throw error
      
      const profileNickname = data?.nickname || ''
      const profileAvatar = data?.avatar_url || ''
      const profileHighlight = data?.highlight_image_preference || 'commander'
      
      setNickname(profileNickname)
      setInitialNickname(profileNickname)
      setCurrentAvatarUrl(profileAvatar)
      setAvatarPreview(profileAvatar)
      setHighlightPref(profileHighlight)
      setInitialHighlightPref(profileHighlight)
    } catch (err) {
      console.error('Error al cargar perfil:', err)
      setError('Error al cargar el perfil')
    }
  }

  function handleAvatarChange(file) {
    // Limpiar estados previos
    setError(null)
    setSuccess(null)
    
    if (!file) {
      setAvatarFile(null)
      setAvatarPreview(currentAvatarUrl)
      return
    }

    // Validar tipo de archivo
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Formato de imagen no válido. Solo se permiten archivos JPG, PNG o WEBP.')
      return
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      setError(`La imagen es demasiado grande (${sizeMB}MB). El tamaño máximo permitido es 5MB.`)
      return
    }

    // Validar dimensiones
    const imageElement = document.createElement('img')
    imageElement.onload = () => {
      if (imageElement.width < 300 || imageElement.height < 300) {
        setError(`La imagen es demasiado pequeña (${imageElement.width}×${imageElement.height}px). Se requiere un mínimo de 300×300 píxeles.`)
        URL.revokeObjectURL(imageElement.src) // Limpiar memoria
        return
      }
      
      // Si llegamos aquí, la imagen es válida
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
      setError(null)
    }
    
    imageElement.onerror = () => {
      setError('No se pudo procesar la imagen. Asegúrate de que el archivo no esté dañado.')
      URL.revokeObjectURL(imageElement.src) // Limpiar memoria
    }
    
    // Crear URL temporal para validar
    const tempUrl = URL.createObjectURL(file)
    imageElement.src = tempUrl
  }

  async function handleSave() {
    if (!canSave || !session) return
    
    setSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      let publicUrl = currentAvatarUrl

      // Subir avatar si hay uno nuevo
      if (avatarFile) {
        // 1. Borrar avatares antiguos
        try {
          const { data: list } = await supabase.storage
            .from('avatars')
            .list(session.user.id)
          
          if (list?.length) {
            await Promise.all(
              list.map(file => 
                supabase.storage
                  .from('avatars')
                  .remove([`${session.user.id}/${file.name}`])
              )
            )
          }
        } catch (cleanupError) {
          console.warn('Error al limpiar avatares antiguos:', cleanupError)
        }

        // 2. Subir nuevo avatar
        const ext = avatarFile.name.split('.').pop()
        const filePath = `${session.user.id}/avatar.${ext}`
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true })
          
        if (uploadError) throw uploadError

        // 3. Obtener URL pública
        const response = await fetch('/api/profile/public-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ path: filePath }),
        })
        
        if (!response.ok) throw new Error('Error al obtener URL pública')
        
        const { publicUrl: newUrl } = await response.json()
        publicUrl = newUrl
      }

      // 4. Actualizar perfil
      const updateResponse = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          nickname: clean,
          avatar_url: publicUrl,
          highlight_image_preference: highlightPref,
        }),
      })

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text()
        throw new Error(errorText || 'Error al actualizar perfil')
      }

      // Actualizar estado local
      setInitialNickname(clean)
      setInitialHighlightPref(highlightPref)
      setCurrentAvatarUrl(publicUrl)
      setAvatarFile(null)
      
      setSuccess('Perfil actualizado correctamente')
      
      // Opcional: redirigir después de un tiempo
      setTimeout(() => {
        router.push('/players/me')
      }, 2000)
      
    } catch (err) {
      console.error('Error al guardar:', err)
      setError(err.message || 'Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setNickname(initialNickname)
    setHighlightPref(initialHighlightPref)
    setAvatarFile(null)
    setAvatarPreview(currentAvatarUrl)
    setError(null)
    setSuccess(null)
  }

  if (loading) return <ProfessionalSkeleton />

  if (!session) return null

  return (
    <section className="py-8 pb-24 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <ProfessionalBreadcrumb />

        {/* Page Header */}
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="h-1 bg-gradient-to-r from-gray-600 to-slate-700" />
          
          <div className="p-8 lg:p-10">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-gray-900 flex items-center justify-center text-white shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Editar Perfil</h1>
                <p className="text-gray-600 mt-1">
                  Actualiza tu información personal y preferencias de visualización
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="relative overflow-hidden border border-gray-200 bg-white shadow-sm" padding="none">
          <div className="h-0.5 bg-gradient-to-r from-gray-600 to-slate-700" />

          <div className="p-8 lg:p-10 space-y-8">
            {/* Alerts */}
            {error && (
              <ProfessionalAlert
                type="error"
                title="Error al guardar"
                message={error}
                onClose={() => setError(null)}
              />
            )}
            
            {success && (
              <ProfessionalAlert
                type="success"
                title="¡Perfil actualizado!"
                message={success}
                onClose={() => setSuccess(null)}
              />
            )}

            {/* Avatar Upload */}
            <ProfessionalAvatarUpload
              currentAvatar={currentAvatarUrl}
              previewAvatar={avatarPreview}
              onFileSelect={handleAvatarChange}
              isUploading={saving}
              error={error}
              setError={setError}
            />

            {/* Nickname Field */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-900">
                Nombre de Usuario
              </label>
              <div className="relative">
                <div
                  className={`relative flex items-center rounded-lg border-2 transition-all duration-300 ${
                    isNicknameValid 
                      ? 'border-gray-300 focus-within:border-gray-500 bg-white' 
                      : 'border-red-300 focus-within:border-red-500 bg-red-50'
                  }`}
                >
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg className={`h-5 w-5 transition-colors duration-300 ${
                      isNicknameValid ? 'text-gray-400' : 'text-red-500'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    className="w-full rounded-lg bg-transparent pl-11 pr-20 py-3 text-gray-900 placeholder-gray-500 outline-none font-medium"
                    value={nickname}
                    onChange={(e) => { 
                      setNickname(e.target.value)
                      setError(null)
                      setSuccess(null)
                    }}
                    placeholder="Ingresa tu nombre de usuario"
                    maxLength={32}
                    autoComplete="off"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                  />
                  {/* Character counter */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all duration-300 ${
                      isNicknameValid ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <span>{clean.length}/32</span>
                      {isNicknameValid ? (
                        <svg className="h-3 w-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-3 w-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className={`text-sm transition-colors duration-300 ${
                    isNicknameValid ? 'text-gray-600' : 'text-red-600'
                  }`}>
                    El nombre debe tener entre 2 y 32 caracteres
                  </p>
                </div>
              </div>
            </div>

            {/* Highlight Preference */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-900">
                Imagen Destacada en Perfil
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div
                  className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all duration-300 ${
                    highlightPref === 'profile'
                      ? 'border-gray-500 bg-gray-50 ring-2 ring-gray-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setHighlightPref('profile')}
                >
                  <div className="flex items-start gap-4">
                    <div className={`h-5 w-5 rounded-full border-2 mt-0.5 flex-shrink-0 transition-all duration-300 ${
                      highlightPref === 'profile'
                        ? 'border-gray-500 bg-gray-500'
                        : 'border-gray-300'
                    }`}>
                      {highlightPref === 'profile' && (
                        <div className="h-full w-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Imagen de Perfil</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Usar tu avatar personal como imagen principal en tu perfil
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">Recomendado para perfiles personales</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all duration-300 ${
                    highlightPref === 'commander'
                      ? 'border-gray-500 bg-gray-50 ring-2 ring-gray-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setHighlightPref('commander')}
                >
                  <div className="flex items-start gap-4">
                    <div className={`h-5 w-5 rounded-full border-2 mt-0.5 flex-shrink-0 transition-all duration-300 ${
                      highlightPref === 'commander'
                        ? 'border-gray-500 bg-gray-500'
                        : 'border-gray-300'
                    }`}>
                      {highlightPref === 'commander' && (
                        <div className="h-full w-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Comandante Favorito</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Usar la imagen de tu comandante más usado como imagen principal
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gray-200 flex items-center justify-center">
                          <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">Ideal para jugadores de MTG</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">¿Qué significa esto?</h5>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        La imagen destacada se mostrará como tu avatar principal en el perfil. Si eliges &quot;Comandante Favorito&quot;, 
                        se usará automáticamente la imagen del comandante que más hayas usado en tus partidas.
                      </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 bg-gray-50 px-8 lg:px-10 py-6">
            <div className="flex items-center gap-3">
              <Link
                href="/players/me"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Cancelar
              </Link>
              
              {hasChanges && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Deshacer cambios
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Save Status */}
              {hasChanges && !saving && (
                <div className="hidden sm:flex items-center gap-2 text-amber-600">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Tienes cambios sin guardar</span>
                </div>
              )}
              
              {saving && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm font-medium">Guardando...</span>
                </div>
              )}
              
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>

        {/* Help Section */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Consejos para tu perfil</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <svg className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Usa una imagen de perfil clara y reconocible para que otros jugadores te identifiquen fácilmente.</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>El nombre de usuario aparecerá en las partidas y rankings, elige uno que te represente.</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>La preferencia de imagen destacada afecta cómo se muestra tu perfil a otros usuarios.</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}