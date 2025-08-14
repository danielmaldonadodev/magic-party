'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import { UserPlus, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import Link from 'next/link'

/* ===============================================================
  SISTEMA DE TEMAS MTG PROFESIONAL - IDÉNTICO AL INDEX
  =============================================================== */
const MTG_PROFESSIONAL_THEMES = [
  {
    key: 'mono-white',
    label: 'Plains',
    icon: '⚪️',
    colors: {
      primary: 'from-amber-400 to-yellow-500',
      secondary: 'from-amber-100 to-yellow-200',
      accent: 'bg-amber-500',
      bgSoft: 'bg-amber-50/80',
      ring: 'ring-amber-300',
      glowColor: 'rgba(245, 158, 11, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600',
    backgroundGradient: 'from-amber-50 via-yellow-50 to-amber-100',
    text: {
      strong: 'text-amber-900',
      soft: 'text-amber-700',
      white: 'text-white',
    },
    border: 'border-amber-300',
    shadow: 'shadow-amber-500/25',
    fact: 'Orden y protección. La fuerza del colectivo supera al individuo.',
  },
  {
    key: 'mono-blue',
    label: 'Island',
    icon: '🔵',
    colors: {
      primary: 'from-blue-500 to-indigo-600',
      secondary: 'from-blue-100 to-indigo-200',
      accent: 'bg-blue-600',
      bgSoft: 'bg-blue-50/80',
      ring: 'ring-blue-300',
      glowColor: 'rgba(59, 130, 246, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-blue-600 via-indigo-500 to-blue-700',
    backgroundGradient: 'from-blue-50 via-indigo-50 to-blue-100',
    text: {
      strong: 'text-blue-900',
      soft: 'text-blue-700',
      white: 'text-white',
    },
    border: 'border-blue-300',
    shadow: 'shadow-blue-500/25',
    fact: 'Conocimiento es poder. La paciencia define al maestro.',
  },
  {
    key: 'mono-black',
    label: 'Swamp',
    icon: '⚫️',
    colors: {
      primary: 'from-gray-700 to-gray-900',
      secondary: 'from-gray-200 to-gray-400',
      accent: 'bg-gray-800',
      bgSoft: 'bg-gray-50/80',
      ring: 'ring-gray-400',
      glowColor: 'rgba(107, 114, 128, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900',
    backgroundGradient: 'from-gray-50 via-gray-100 to-gray-200',
    text: {
      strong: 'text-gray-900',
      soft: 'text-gray-700',
      white: 'text-white',
    },
    border: 'border-gray-400',
    shadow: 'shadow-gray-500/25',
    fact: 'El poder tiene un precio. La ambición no conoce límites.',
  },
  {
    key: 'mono-red',
    label: 'Mountain',
    icon: '🔴',
    colors: {
      primary: 'from-red-500 to-rose-600',
      secondary: 'from-red-100 to-rose-200',
      accent: 'bg-red-600',
      bgSoft: 'bg-red-50/80',
      ring: 'ring-red-300',
      glowColor: 'rgba(239, 68, 68, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-red-600 via-rose-500 to-red-700',
    backgroundGradient: 'from-red-50 via-rose-50 to-red-100',
    text: {
      strong: 'text-red-900',
      soft: 'text-red-700',
      white: 'text-white',
    },
    border: 'border-red-300',
    shadow: 'shadow-red-500/25',
    fact: 'La velocidad es vida. Actúa primero, piensa después.',
  },
  {
    key: 'mono-green',
    label: 'Forest',
    icon: '🟢',
    colors: {
      primary: 'from-green-500 to-emerald-600',
      secondary: 'from-green-100 to-emerald-200',
      accent: 'bg-green-600',
      bgSoft: 'bg-green-50/80',
      ring: 'ring-green-300',
      glowColor: 'rgba(34, 197, 94, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-green-600 via-emerald-500 to-green-700',
    backgroundGradient: 'from-green-50 via-emerald-50 to-green-100',
    text: {
      strong: 'text-green-900',
      soft: 'text-green-700',
      white: 'text-white',
    },
    border: 'border-green-300',
    shadow: 'shadow-green-500/25',
    fact: 'La naturaleza es fuerza bruta. El crecimiento es inevitable.',
  },
  {
    key: 'azorius',
    label: 'Azorius',
    icon: '⚪️🔵',
    colors: {
      primary: 'from-blue-400 to-indigo-500',
      secondary: 'from-blue-100 to-indigo-200',
      accent: 'bg-blue-500',
      bgSoft: 'bg-blue-50/80',
      ring: 'ring-blue-300',
      glowColor: 'rgba(99, 102, 241, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-blue-500 via-indigo-400 to-blue-600',
    backgroundGradient: 'from-blue-50 via-indigo-50 to-blue-100',
    text: {
      strong: 'text-blue-900',
      soft: 'text-blue-700',
      white: 'text-white',
    },
    border: 'border-blue-300',
    shadow: 'shadow-blue-500/25',
    fact: 'Ley y orden. El control perfecto define la victoria.',
  },
  {
    key: 'golgari',
    label: 'Golgari',
    icon: '⚫️🟢',
    colors: {
      primary: 'from-green-600 to-gray-700',
      secondary: 'from-green-100 to-gray-300',
      accent: 'bg-green-700',
      bgSoft: 'bg-green-50/80',
      ring: 'ring-green-400',
      glowColor: 'rgba(21, 128, 61, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-green-600 via-gray-600 to-green-800',
    backgroundGradient: 'from-green-50 via-gray-50 to-green-100',
    text: {
      strong: 'text-green-900',
      soft: 'text-green-700',
      white: 'text-white',
    },
    border: 'border-green-400',
    shadow: 'shadow-green-500/25',
    fact: 'Vida y muerte son parte del ciclo. El cementerio es recurso.',
  },
  {
    key: 'izzet',
    label: 'Izzet',
    icon: '🔵🔴',
    colors: {
      primary: 'from-blue-500 to-red-500',
      secondary: 'from-blue-100 to-red-200',
      accent: 'bg-purple-600',
      bgSoft: 'bg-purple-50/80',
      ring: 'ring-purple-300',
      glowColor: 'rgba(147, 51, 234, 0.4)',
    },
    gradient: 'bg-gradient-to-br from-blue-500 via-purple-500 to-red-500',
    backgroundGradient: 'from-blue-50 via-purple-50 to-red-50',
    text: {
      strong: 'text-purple-900',
      soft: 'text-purple-700',
      white: 'text-white',
    },
    border: 'border-purple-300',
    shadow: 'shadow-purple-500/25',
    fact: 'Genio y locura van de la mano. La experimentación no tiene límites.',
  },
]

const DEFAULT_THEME_KEY = 'azorius'

/* ===============================================================
  CSS PROFESIONAL CON EFECTOS PREMIUM - IDÉNTICO AL INDEX
  =============================================================== */
const professionalCSS = `
@keyframes professionalFadeIn {
  from { 
    opacity: 0; 
    transform: translateY(20px) scale(0.98); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

@keyframes crystalShine {
  0% { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(300%) rotate(45deg); }
}

@keyframes premiumGlow {
  0%, 100% { 
    box-shadow: 0 0 20px var(--glow-color), 
                0 10px 40px rgba(0,0,0,0.1);
  }
  50% { 
    box-shadow: 0 0 40px var(--glow-color), 
                0 20px 60px rgba(0,0,0,0.15);
  }
}

@keyframes floatSubtle {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

@keyframes pulse-error {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes pulse-success {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.02); }
}

.professional-glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.crystal-card {
  position: relative;
  overflow: hidden;
}

.crystal-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: left 0.5s;
  z-index: 1;
}

.crystal-card:hover::before {
  left: 100%;
}

.animate-professional-fade-in {
  animation: professionalFadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.animate-crystal-shine {
  animation: crystalShine 3s ease-in-out infinite;
}

.animate-premium-glow {
  animation: premiumGlow 4s ease-in-out infinite;
}

.animate-float-subtle {
  animation: floatSubtle 6s ease-in-out infinite;
}

.animate-pulse-error {
  animation: pulse-error 2s ease-in-out infinite;
}

.animate-pulse-success {
  animation: pulse-success 2s ease-in-out infinite;
}

.theme-transition {
  transition: all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.input-focus-ring {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.input-focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--ring-color);
  border-color: var(--border-color);
}
`

// Inyectar estilos - IDÉNTICO AL INDEX
if (typeof document !== 'undefined' && !document.getElementById('professional-signup-styles')) {
  const style = document.createElement('style')
  style.id = 'professional-signup-styles'
  style.textContent = professionalCSS
  document.head.appendChild(style)
}

/* ===============================================================
  THEME ROTATION HOOK - IDÉNTICO AL INDEX
  =============================================================== */
function useThemeRotation(intervalMs = 40000) {
  const [themeKey, setThemeKey] = useState(DEFAULT_THEME_KEY)
  const [index, setIndex] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mp_professional_theme')
      if (saved) {
        const idx = MTG_PROFESSIONAL_THEMES.findIndex(t => t.key === saved)
        if (idx >= 0) {
          setThemeKey(saved)
          setIndex(idx)
        }
      }
    } catch (e) {}
  }, [])

  useEffect(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = setInterval(() => {
      setIndex(prev => {
        const next = (prev + 1) % MTG_PROFESSIONAL_THEMES.length
        const nextKey = MTG_PROFESSIONAL_THEMES[next].key
        setThemeKey(nextKey)
        try { 
          localStorage.setItem('mp_professional_theme', nextKey) 
        } catch (e) {}
        return next
      })
    }, intervalMs)
    return () => timer.current && clearInterval(timer.current)
  }, [intervalMs])

  const theme = useMemo(() => {
    const found = MTG_PROFESSIONAL_THEMES.find(t => t.key === themeKey)
    return found || MTG_PROFESSIONAL_THEMES[0]
  }, [themeKey])

  return { theme, themeKey, setThemeKey, index, setIndex }
}

/* ===============================================================
  COMPONENTE SIGNUP PROFESIONAL
  =============================================================== */
export default function ProfessionalSignUp() {
  const router = useRouter()
  const { theme, index: themeIndex } = useThemeRotation(40000)
  
  // Estados del formulario
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'error' | 'success'
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('')
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname } }
    })
    setLoading(false)

    if (error) {
      setMessage(`❌ ${error.message}`)
      setMessageType('error')
    } else {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (!loginError) {
        setMessage('🎉 ¡Cuenta creada exitosamente! Redirigiendo...')
        setMessageType('success')
        setTimeout(() => router.push('/'), 2000)
      } else {
        setMessage('✅ Registro correcto. Revisa tu email para confirmar tu cuenta.')
        setMessageType('success')
      }
    }
  }

  return (
    <div 
      className="min-h-screen theme-transition flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{ 
        background: `linear-gradient(135deg, ${theme.backgroundGradient})`,
        '--glow-color': theme.colors.glowColor,
        '--ring-color': theme.colors.glowColor,
        '--border-color': theme.colors.primary
      }}
    >
      {/* Decorative background elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-l from-white/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Theme indicator */}
        <div 
          className={`mb-8 text-center ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
          style={{ animationDelay: '0.2s' }}
        >
          <div 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full professional-glass"
          >
            <span className="text-2xl">{theme.icon}</span>
            <span className={`font-bold text-lg ${theme.text.strong}`}>
              {theme.label}
            </span>
          </div>
          <p className={`mt-2 text-sm ${theme.text.soft} opacity-80`}>
            {theme.fact}
          </p>
        </div>

        {/* SignUp card */}
        <div 
          className={`crystal-card ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
          style={{ animationDelay: '0.4s' }}
        >
          <div className="professional-glass rounded-2xl p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div 
                className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${theme.gradient} shadow-xl animate-float-subtle mx-auto mb-6`}
              >
                <UserPlus className={`w-10 h-10 ${theme.text.white}`} />
              </div>
              
              <h1 className={`text-3xl font-black ${theme.text.strong} mb-2`}>
                Crear cuenta
              </h1>
              <p className={`text-lg ${theme.text.soft} font-medium`}>
                Únete a Magic Party y registra tus partidas
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignUp} className="space-y-6">
              {/* Nickname field */}
              <div>
                <label className={`block text-sm font-bold uppercase tracking-wider ${theme.text.strong} mb-3`}>
                  Nickname
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className={`w-5 h-5 ${theme.text.soft}`} />
                  </div>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    className={`
                      w-full pl-12 pr-4 py-4 rounded-xl 
                      bg-white/80 backdrop-blur-sm 
                      border-2 ${theme.border}
                      ${theme.text.strong} placeholder-gray-500
                      input-focus-ring
                      font-medium text-lg
                      transition-all duration-300
                    `}
                    placeholder="Tu nombre de planeswalker"
                  />
                </div>
              </div>

              {/* Email field */}
              <div>
                <label className={`block text-sm font-bold uppercase tracking-wider ${theme.text.strong} mb-3`}>
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className={`w-5 h-5 ${theme.text.soft}`} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`
                      w-full pl-12 pr-4 py-4 rounded-xl 
                      bg-white/80 backdrop-blur-sm 
                      border-2 ${theme.border}
                      ${theme.text.strong} placeholder-gray-500
                      input-focus-ring
                      font-medium text-lg
                      transition-all duration-300
                    `}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className={`block text-sm font-bold uppercase tracking-wider ${theme.text.strong} mb-3`}>
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className={`w-5 h-5 ${theme.text.soft}`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`
                      w-full pl-12 pr-12 py-4 rounded-xl 
                      bg-white/80 backdrop-blur-sm 
                      border-2 ${theme.border}
                      ${theme.text.strong} placeholder-gray-500
                      input-focus-ring
                      font-medium text-lg
                      transition-all duration-300
                    `}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className={`w-5 h-5 ${theme.text.soft} hover:${theme.text.strong} transition-colors`} />
                    ) : (
                      <Eye className={`w-5 h-5 ${theme.text.soft} hover:${theme.text.strong} transition-colors`} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className={`
                  group relative w-full py-4 rounded-xl 
                  ${theme.gradient} ${theme.text.white}
                  font-bold text-lg shadow-xl hover:shadow-2xl 
                  transition-all duration-300 hover:scale-105 
                  focus:outline-none focus:ring-4 ${theme.colors.ring}
                  disabled:opacity-50 disabled:cursor-not-allowed
                  disabled:hover:scale-100
                `}
              >
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 transition-transform group-hover:rotate-12" />
                      Crear cuenta
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Message */}
            {message && (
              <div className={`mt-6 p-4 rounded-xl border-2 ${
                messageType === 'success' 
                  ? 'bg-green-50/80 border-green-200 animate-pulse-success' 
                  : 'bg-red-50/80 border-red-200 animate-pulse-error'
              }`}>
                <p className={`font-medium text-center ${
                  messageType === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message}
                </p>
              </div>
            )}

            {/* Login link */}
            <div className="mt-8 text-center">
              <p className={`text-lg ${theme.text.soft}`}>
                ¿Ya tienes cuenta?{' '}
                <Link 
                  href="/login" 
                  className={`font-bold ${theme.text.strong} hover:underline transition-all duration-300 hover:scale-105 inline-block`}
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </div>

            {/* Additional info */}
            <div className="mt-6 text-center">
              <p className={`text-sm ${theme.text.soft} opacity-80`}>
                Al registrarte, aceptas comenzar tu aventura en Magic Party
              </p>
            </div>
          </div>
        </div>

        {/* Theme progress indicator */}
        <div 
          className={`mt-8 text-center ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
          style={{ animationDelay: '0.6s' }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            {MTG_PROFESSIONAL_THEMES.map((t, i) => (
              <div
                key={t.key}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === themeIndex ? 'w-8 opacity-100' : 'w-2 opacity-40'
                }`}
                style={{ 
                  background: `linear-gradient(45deg, ${t.colors.primary})` 
                }}
              />
            ))}
          </div>
          <p className={`text-sm ${theme.text.soft} opacity-75`}>
            El tema cambia automáticamente cada 40 segundos
          </p>
        </div>
      </div>
    </div>
  )
}