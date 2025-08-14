  // pages/matches/new.js
  import { useState, useEffect, useRef, useMemo } from 'react'
  import { useRouter } from 'next/router'
  import Image from 'next/image'
  import { supabase } from '../../lib/supabaseClient'
  import CardSearchInput from '../../components/CardSearchInput'
  import Card from '../../components/Card'
  import { getArchetypeByColors } from '../../lib/archetypes'

  /* ===============================================================
    THEME SYSTEM
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
      text: { strong: 'text-amber-900', soft: 'text-amber-700', white: 'text-white' },
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
      text: { strong: 'text-blue-900', soft: 'text-blue-700', white: 'text-white' },
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
      text: { strong: 'text-gray-900', soft: 'text-gray-700', white: 'text-white' },
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
      text: { strong: 'text-red-900', soft: 'text-red-700', white: 'text-white' },
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
      text: { strong: 'text-green-900', soft: 'text-green-700', white: 'text-white' },
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
      text: { strong: 'text-blue-900', soft: 'text-blue-700', white: 'text-white' },
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
      text: { strong: 'text-green-900', soft: 'text-green-700', white: 'text-white' },
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
      text: { strong: 'text-purple-900', soft: 'text-purple-700', white: 'text-white' },
      border: 'border-purple-300',
      shadow: 'shadow-purple-500/25',
      fact: 'Genio y locura van de la mano. La experimentación no tiene límites.',
    },
  ]
  const DEFAULT_THEME_KEY = 'azorius'

  /* ===============================================================
    CSS (injection once)
    =============================================================== */
  const professionalCSS = `
    @keyframes professionalFadeIn {
      from { opacity: 0; transform: translateY(20px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes pulseSuccess { 0%,100%{background-color:rgb(34,197,94)} 50%{background-color:rgb(22,163,74)} }
    .professional-glass { background:rgba(255,255,255,0.25); backdrop-filter:blur(20px) saturate(180%); border:1px solid rgba(255,255,255,0.3); box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); }
    .crystal-card { position:relative; overflow:hidden; }
    .crystal-card::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent); transition:left .5s; z-index:1; }
    .crystal-card:hover::before { left:100%; }
    .animate-professional-fade-in { animation: professionalFadeIn .8s cubic-bezier(.25,.46,.45,.94) forwards; }
    .animate-pulse-success { animation: pulseSuccess 2s ease-in-out infinite; }
    .theme-transition { transition: all 2s cubic-bezier(.25,.46,.45,.94); }
    .form-step { opacity:0; transform:translateX(20px); animation: professionalFadeIn .6s ease-out forwards; }
    .form-step:nth-child(1){animation-delay:.1s} .form-step:nth-child(2){animation-delay:.2s} .form-step:nth-child(3){animation-delay:.3s}
  `
  if (typeof document !== 'undefined' && !document.getElementById('professional-new-match-styles')) {
    const style = document.createElement('style')
    style.id = 'professional-new-match-styles'
    style.textContent = professionalCSS
    document.head.appendChild(style)
  }

  /* ===============================================================
    Theme rotation hook
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
          if (idx >= 0) { setThemeKey(saved); setIndex(idx) }
        }
      } catch {}
    }, [])

    useEffect(() => {
      if (timer.current) clearInterval(timer.current)
      timer.current = setInterval(() => {
        setIndex(prev => {
          const next = (prev + 1) % MTG_PROFESSIONAL_THEMES.length
          const nextKey = MTG_PROFESSIONAL_THEMES[next].key
          setThemeKey(nextKey)
          try { localStorage.setItem('mp_professional_theme', nextKey) } catch {}
          return next
        })
      }, intervalMs)
      return () => timer.current && clearInterval(timer.current)
    }, [intervalMs])

    const theme = useMemo(() => {
      const found = MTG_PROFESSIONAL_THEMES.find(t => t.key === themeKey)
      return found || MTG_PROFESSIONAL_THEMES[0]
    }, [themeKey])

    return { theme }
  }

  /* ===============================================================
    Utils
    =============================================================== */
  function toDatetimeLocal(d = new Date()) {
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  /* ===============================================================
    UI bits
    =============================================================== */
  function ProfessionalHero({ theme, onCancel }) {
    const [loaded, setLoaded] = useState(false)
    useEffect(() => { setLoaded(true) }, [])
    return (
      <section className="relative overflow-hidden py-12 sm:py-16">
        <div className="absolute inset-0 theme-transition" style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})`, '--glow-color': theme.colors.glowColor }}/>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-white/20 to-transparent rounded-full blur-3xl"/>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl"/>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-6">
            <div className={`inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 rounded-full professional-glass ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <span className="text-lg sm:text-xl">{theme.icon}</span>
              <span className={`font-bold text-sm sm:text-base ${theme.text.strong}`}>{theme.label}</span>
            </div>
            <div className={`space-y-3 sm:space-y-4 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                <span className={`${theme.text.strong} block sm:inline`}>Nueva</span>
                <span className="text-gray-900 block sm:inline sm:ml-3">Batalla</span>
              </h1>
              <p className={`text-base sm:text-lg ${theme.text.soft} max-w-2xl mx-auto leading-relaxed font-medium px-4 sm:px-0`}>
                Registra una partida, añade participantes y documenta cada momento.
              </p>
            </div>
            <div className={`${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
              <button onClick={onCancel} className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/80 backdrop-blur-sm font-semibold text-gray-800 border-2 border-gray-300 hover:border-gray-400 hover:bg-white transition-all duration-300 hover:scale-105">
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                Volver a Partidas
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  function ProgressIndicator({ currentStep, totalSteps, theme }) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className={`text-sm font-medium ${theme.text.soft}`}>Progreso del formulario</span>
          <span className={`text-sm font-bold ${theme.text.strong}`}>{currentStep} de {totalSteps}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${theme.colors.primary} transition-all duration-700 ease-out rounded-full`} style={{ width: `${(currentStep / totalSteps) * 100}%` }}/>
        </div>
      </div>
    )
  }

  function ProfessionalAlert({ type = 'error', title, message, onDismiss }) {
    const styles = {
      error: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', title: 'text-red-800', text: 'text-red-700' },
      success: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', title: 'text-green-800', text: 'text-green-700' },
      warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', title: 'text-amber-800', text: 'text-amber-700' }
    }
    const style = styles[type] || styles.error
    return (
      <div className={`rounded-xl border ${style.border} ${style.bg} p-4 mb-6 animate-professional-fade-in`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${style.icon}`}>
            {type === 'error' && (<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>)}
            {type === 'success' && (<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>)}
            {type === 'warning' && (<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.17 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>)}
          </div>
          <div className="flex-1">
            <h4 className={`font-bold ${style.title}`}>{title}</h4>
            <p className={`text-sm ${style.text} mt-1`}>{message}</p>
          </div>
          {onDismiss && (
            <button onClick={onDismiss} className={`flex-shrink-0 ${style.icon} hover:opacity-75 transition-opacity`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          )}
        </div>
      </div>
    )
  }

  function SectionHeader({ icon, title, subtitle, action, theme }) {
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${theme.gradient} flex items-center justify-center text-white shadow-lg`}>{icon}</div>
          <div>
            <h2 className={`text-xl font-bold ${theme.text.strong}`}>{title}</h2>
            <p className={`text-sm ${theme.text.soft} mt-1`}>{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
    )
  }

  function ProfessionalCommanderPreview({ name, small, normal, art, colors = [], theme }) {
    const src = small || normal || art || ''
    const colorMap = { W:{symbol:'⚪',bg:'bg-yellow-100',text:'text-yellow-800'}, U:{symbol:'🔵',bg:'bg-blue-100',text:'text-blue-800'}, B:{symbol:'⚫',bg:'bg-gray-100',text:'text-gray-800'}, R:{symbol:'🔴',bg:'bg-red-100',text:'text-red-800'}, G:{symbol:'🟢',bg:'bg-green-100',text:'text-green-800'} }
    const colorPips = (colors||[]).map(c => colorMap[c]).filter(Boolean)

    if (!src) {
      return (
        <div className="space-y-4">
          <div className="relative w-full aspect-[63/88] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex items-center justify-center overflow-hidden">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <p className="text-sm font-medium text-gray-600">{name || 'Sin comandante'}</p>
              <p className="text-xs text-gray-400 mt-1">{name ? 'Imagen no disponible' : 'Busca y selecciona una carta'}</p>
            </div>
          </div>
          {colorPips.length > 0 && (
            <div className="flex justify-center gap-1">
              {colorPips.map((pip, i) => (
                <span key={i} className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${pip.bg} ${pip.text}`}>{pip.symbol}</span>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="relative group">
          <div className="w-full aspect-[63/88] rounded-xl overflow-hidden border-2 border-gray-200 bg-white shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
            <Image src={src} alt={name || 'Commander'} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="280px"/>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-white font-bold text-sm truncate">{name}</p>
          </div>
        </div>
        {colorPips.length > 0 && (
          <div className="flex justify-center gap-1">
            {colorPips.map((pip, i) => (
              <span key={i} className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${pip.bg} ${pip.text} shadow-sm`}>{pip.symbol}</span>
            ))}
          </div>
        )}
        <div className="text-center">
          <p className="font-bold text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-500 mt-1">Comandante seleccionado</p>
        </div>
      </div>
    )
  }

  function ParticipantCard({ participant, index, onUpdate, onRemove, profiles, canRemove, theme }) {
    const [isExpanded, setIsExpanded] = useState(true)
    const fromEvent = participant.__fromEvent === true

    const getStatusColor = () => {
      if (!participant.user_id) return 'border-gray-300 bg-gray-50/50'
      if (!participant.commander_name) return 'border-amber-300 bg-amber-50/50'
      return 'border-green-300 bg-green-50/50'
    }

    const getStatusIcon = () => {
      if (!participant.user_id) {
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a2 2 0 00-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </div>
        )
      }
      if (!participant.commander_name) {
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        )
      }
      return (
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-pulse-success">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
        </div>
      )
    }

    return (
      <div className={`crystal-card animate-professional-fade-in border-2 rounded-xl ${getStatusColor()} transition-all duration-300`} style={{ animationDelay: `${index * 120}ms` }}>
        <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-lg" padding="none">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon()}
                <div>
                  <h3 className="font-bold text-gray-900">
                    Participante {index + 1}
                    {fromEvent && (
                      <span className="ml-2 align-middle text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Desde evento
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {participant.user_id
                      ? (profiles.find(p => p.id === participant.user_id)?.nickname || 'Jugador')
                      : 'Selecciona un jugador'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  <svg className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                </button>
                {canRemove && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!fromEvent || confirm('Este jugador viene del evento. ¿Seguro que quieres quitarlo?')) onRemove()
                    }}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={`transition-all duration-300 ${isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="p-6 space-y-6">
              <div className="grid gap-6 lg:grid-cols-[1fr_1fr_300px]">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">👤 Jugador</label>
                  <div className="relative">
                    <select
                      value={participant.user_id}
                      onChange={(e) => onUpdate('user_id', e.target.value)}
                      required
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all duration-200 appearance-none"
                    >
                      <option value="">Selecciona un jugador</option>
                      {profiles.map((p) => (
                        <option key={p.id} value={p.id}>{p.nickname}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">⚔️ Comandante</label>
                  <CardSearchInput
                    key={`${participant.scryfall_id || 'none'}-${index}`}
                    value={participant.commander_name || participant.deck_commander || ''}
                    placeholder="Buscar comandante..."
                    // Compatibilidad con ambas props (onSelect y onSelectCard)
                    onSelect={(card) => onUpdate('commander', card)}
                    onSelectCard={(card) => onUpdate('commander', card)}
                    closeOnSelect
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all duration-200"
                  />
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                  <ProfessionalCommanderPreview
                    name={participant.commander_name}
                    small={participant.commander_image_small}
                    normal={participant.commander_image_normal}
                    art={participant.commander_art_crop}
                    colors={participant.commander_colors || []}
                    theme={theme}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">❤️ Vidas Restantes</label>
                  <input type="number" value={participant.life_remaining || ''} onChange={(e) => onUpdate('life_remaining', e.target.value)} min="0" placeholder="40" className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm text-center font-mono text-lg transition-all duration-200"/>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">⚡ Daño Máximo</label>
                  <input type="number" value={participant.max_damage || ''} onChange={(e) => onUpdate('max_damage', e.target.value)} min="0" placeholder="0" className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm text-center font-mono text-lg transition-all duration-200"/>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">💀 Eliminaciones</label>
                  <input type="number" value={participant.kills || ''} onChange={(e) => onUpdate('kills', e.target.value)} min="0" placeholder="0" className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm text-center font-mono text-lg transition-all duration-200"/>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="group relative flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200">
                  <input type="checkbox" checked={!!participant.used_proxies} onChange={(e) => onUpdate('used_proxies', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200"/>
                  <div className="flex items-center gap-2"><span className="text-lg">🃏</span><span className="text-sm font-bold text-gray-700">¿Usó proxies?</span></div>
                </label>
                <label className="group relative flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200">
                  <input type="checkbox" checked={!!participant.first_to_die} onChange={(e) => onUpdate('first_to_die', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 transition-all duration-200"/>
                  <div className="flex items-center gap-2"><span className="text-lg">☠️</span><span className="text-sm font-bold text-gray-700">¿Eliminado primero?</span></div>
                </label>
                <label className="group relative flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200">
                  <input type="checkbox" checked={!!participant.won_by_combo} onChange={(e) => onUpdate('won_by_combo', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 transition-all duration-200"/>
                  <div className="flex items-center gap-2"><span className="text-lg">🌟</span><span className="text-sm font-bold text-gray-700">¿Ganó por combo?</span></div>
                </label>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  /* ===============================================================
    MAIN PAGE
    =============================================================== */
  export default function NewMatchPage() {
    const router = useRouter()
    const { fromEvent } = router.query
    const { theme } = useThemeRotation(40000)

    // Data
    const [games, setGames] = useState([])
    const [profiles, setProfiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Form
    const [form, setForm] = useState({ game_id: '', played_at: '', winner: '' })
    const [participants, setParticipants] = useState([])

    // Feedback
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    const blankParticipant = (extra = {}) => ({
      user_id: '',
      deck_commander: '',
      commander_image: '',
      commander_art_crop: '',
      commander_image_normal: '',
      commander_image_small: '',
      commander_name: '',
      scryfall_id: '',
      used_proxies: false,
      life_remaining: '',
      max_damage: '',
      first_to_die: false,
      won_by_combo: false,
      kills: '',
      commander_colors: [],
      commander_color_code: '',
      __fromEvent: false,
      ...extra,
    })

    // Progress
    const currentStep = useMemo(() => {
      let step = 0
      if (form.game_id) step++
      if (form.played_at) step++
      if (participants.length > 0 && participants.every(p => p.user_id)) step++
      if (participants.length > 1 && participants.every(p => p.commander_name)) step++
      if (form.winner) step++
      return step
    }, [form, participants])
    const totalSteps = 5

    // Load initial data
    useEffect(() => {
      let mounted = true
      const loadBase = async () => {
        const [{ data: gData }, { data: pData }] = await Promise.all([
          supabase.from('games').select('id, name').order('name', { ascending: true }),
          supabase.from('profiles').select('id, nickname').order('created_at', { ascending: true }),
        ])
        if (!mounted) return
        if (gData?.length) {
          setGames(gData)
          setForm((f) => ({ ...f, game_id: f.game_id || gData[0].id }))
        }
        if (pData) setProfiles(pData)
        setForm((f) => ({ ...f, played_at: f.played_at || toDatetimeLocal() }))

        // default: 1 row
        setParticipants((cur) => (cur.length ? cur : [blankParticipant()]))

        setLoading(false)
      }
      loadBase()
      return () => { mounted = false }
    }, [])

    // Load from event if present
    useEffect(() => {
      const loadPresetFromEvent = async () => {
        if (!fromEvent) return

        const { data: e } = await supabase
          .from('events')
          .select('id, title, game_id, starts_at')
          .eq('id', fromEvent)
          .single()

        if (e?.game_id) setForm((f) => ({ ...f, game_id: e.game_id }))
        if (e?.starts_at) setForm((f) => ({ ...f, played_at: toDatetimeLocal(new Date(e.starts_at)) }))

        const { data: eps } = await supabase
          .from('event_participants')
          .select('user_id, commander_name, commander_scryfall_id, commander_image_url, status')
          .eq('event_id', fromEvent)
          .eq('status', 'going')

        if (Array.isArray(eps) && eps.length) {
          setParticipants(eps.map(p => blankParticipant({
            user_id: p.user_id,
            commander_name: p.commander_name || '',
            deck_commander: p.commander_name || '',
            scryfall_id: p.commander_scryfall_id || '',
            commander_image: p.commander_image_url || '',
            commander_image_normal: p.commander_image_url || '',
            commander_image_small: p.commander_image_url || '',
            commander_art_crop: p.commander_image_url || '',
            __fromEvent: true,
          })))
        }
      }
      loadPresetFromEvent()
    }, [fromEvent])

    // Autopreselección de ganador:
    useEffect(() => {
      setForm((f) => {
        // Si ya hay ganador y sigue presente, no tocar
        if (f.winner && participants.some(p => p.user_id === f.winner)) return f

        const complete = participants.filter(p => p.user_id && p.commander_name)
        if (!f.winner && complete.length === 1) {
          // Solo uno “completo” -> preseleccionar
          return { ...f, winner: complete[0].user_id }
        }
        // Si el ganador actual ya no está presente, limpiarlo
        if (f.winner && !participants.some(p => p.user_id === f.winner)) {
          return { ...f, winner: '' }
        }
        return f
      })
    }, [participants])

    // Derived helpers
    const allParticipantsComplete = useMemo(
      () => participants.length > 0 && participants.every(p => p.user_id && p.commander_name),
      [participants]
    )

    const availableWinners = useMemo(
      () => profiles.filter(p => participants.some(part => part.user_id === p.id)),
      [profiles, participants]
    )

    // Handlers
    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

    const addParticipant = () => {
      setParticipants((prev) => [...prev, blankParticipant()])
      setSuccess('✨ Nuevo participante añadido')
      setTimeout(() => setSuccess(null), 2200)
    }

    // ✔️ removeParticipant robusto, sin depender de `participants` externo
    const removeParticipant = (idx) => {
      setParticipants((prev) => {
        const removed = prev[idx]
        if (removed?.user_id === form.winner) {
          setForm((f) => ({ ...f, winner: '' }))
        }
        return prev.filter((_, i) => i !== idx)
      })
    }

    const updateParticipant = (index, key, value) => {
      if (key === 'commander') {
        const card = value
        const name = card?.name || ''
        const iu = card?.image_uris || {}
        const art = iu.art_crop || ''
        const normal = iu.normal || iu.large || ''
        const small = iu.small || ''
        let colorsArr = Array.isArray(card?.color_identity) ? card.color_identity : []
        if (!colorsArr.length && Array.isArray(card?.card_faces)) {
          const facesColors = card.card_faces.flatMap(f =>
            Array.isArray(f?.color_identity) ? f.color_identity : (Array.isArray(f?.colors) ? f.colors : [])
          )
          colorsArr = facesColors
        }
        if (!colorsArr.length && Array.isArray(card?.colors)) {
          colorsArr = card.colors
        }
        const clean = Array.from(new Set((colorsArr || []).map(c => String(c).toUpperCase()).filter(c => ['W','U','B','R','G'].includes(c))))
        const { code } = getArchetypeByColors(clean)
        const anyImg = normal || art || small || ''
        setParticipants(prev => {
          const copy = [...prev]
          copy[index] = {
            ...copy[index],
            deck_commander: name,
            commander_name: name,
            scryfall_id: card?.id || '',
            commander_art_crop: art || '',
            commander_image_normal: normal || '',
            commander_image_small: small || '',
            commander_image: anyImg || '',
            commander_colors: clean,
            commander_color_code: code || '',
          }
          return copy
        })
      } else {
        setParticipants((prev) => {
          const copy = [...prev]
          copy[index] = { ...copy[index], [key]: value }
          return copy
        })
      }
    }

    // Submit
    const handleSubmit = async (e) => {
      e.preventDefault()
      setError(null)
      setSubmitting(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { setError('No estás autenticado.'); return }

        // Validations
        if (!form.game_id || !form.played_at) { setError('Completa juego y fecha.'); return }
        if (participants.length < 2) { setError('Añade al menos dos jugadores.'); return }
        if (participants.some(p => !p.user_id)) { setError('Selecciona jugador para cada participante.'); return }
        if (participants.some(p => !p.commander_name)) { setError('Selecciona comandante para cada participante.'); return }

        const uniquePlayers = new Set(participants.map(p => p.user_id))
        if (uniquePlayers.size < participants.length) { setError('No puede haber jugadores duplicados.'); return }
        if (!form.winner || !participants.some(p => p.user_id === form.winner)) { setError('Selecciona un ganador que esté entre los participantes.'); return }

        // 1) Construir payload para la API
        const eventId = (typeof fromEvent === 'string' && fromEvent.length) ? fromEvent : null

        const matchPayload = {
          game_id: form.game_id || null,
          played_at: form.played_at
            ? new Date(form.played_at).toISOString()
            : new Date().toISOString(),
          winner: form.winner || null,
          // ⚠️ no metas user_id aquí; tu API lo pone a user.id del token
          event_id: eventId,
        }

        const participantsPayload = participants.map(p => ({
          user_id: p.user_id,
          deck_commander: p.deck_commander || p.commander_name || null,
          life_remaining: p.life_remaining === '' ? null : Number(p.life_remaining),
          max_damage: p.max_damage === '' ? null : Number(p.max_damage),
          first_to_die: !!p.first_to_die,
          won_by_combo: !!p.won_by_combo,
          kills: p.kills === '' ? null : Number(p.kills),
          used_proxies: !!p.used_proxies,

          commander_image: p.commander_image || null,
          commander_art_crop: p.commander_art_crop || null,
          commander_image_normal: p.commander_image_normal || null,
          commander_image_small: p.commander_image_small || null,
          commander_name: p.commander_name || null,
          scryfall_id: p.scryfall_id || null,

          // opcional: si ya las traes del cliente, la API las respeta;
          // si no, tu API las resolverá vía Scryfall
          commander_colors: Array.isArray(p.commander_colors) && p.commander_colors.length ? p.commander_colors : null,
          commander_color_code: p.commander_color_code || null,

          // compat con columnas antiguas
          commander_image_url: p.commander_image || null,
          commander_scryfall_id: p.scryfall_id || null,

          // estos los calcula la UI; la API no los usa para RLS
          result: p.user_id === form.winner ? 'win' : 'loss',
          score: p.user_id === form.winner ? 1 : 0,
        }))

        // 2) Llamar a la API con el Bearer del usuario
        const token = session?.access_token
        const resp = await fetch('/api/matches/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            match: matchPayload,
            participants: participantsPayload,
          }),
        })

        // 3) Manejo de respuesta/errores
        let out = null
        try { out = await resp.json() } catch {}
        if (!resp.ok) {
          setError(out?.error || 'No se pudo crear la partida.')
          return
        }

        // 4) Éxito → redirigir
        setSuccess('¡Partida creada! Vamos a completar resultados…')
        router.replace(`/matches/${out.match.id}/complete`)

        } catch (err) {
          console.error(err)
          setError('Error inesperado al crear la partida.')
        } finally {
          setSubmitting(false)
        }
    }

    const handleCancel = () => router.push('/matches')

    if (loading) {
      return (
        <div className="min-h-screen theme-transition" style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})` }}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center mx-auto shadow-lg">
                <svg className="w-8 h-8 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              </div>
              <p className={`text-lg font-medium ${theme.text.strong}`}>Preparando el campo de batalla…</p>
              <p className={`text-sm ${theme.text.soft}`}>Cargando jugadores y formatos</p>
            </div>
          </div>
        </div>
      )
    }

    // Perf: filtrar opciones de jugador para que no se puedan duplicar
    const takenIds = new Set(participants.map(p => p.user_id).filter(Boolean))
    const optionsFor = (currentId) =>
      profiles.filter(pr => pr.id === currentId || !takenIds.has(pr.id))

    const canAddParticipant = allParticipantsComplete

    return (
      <div className="min-h-screen theme-transition pb-24" style={{ background: `linear-gradient(135deg, ${theme.backgroundGradient})` }}>
        <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl pointer-events-none"/>
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl pointer-events-none"/>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          <ProfessionalHero theme={theme} onCancel={handleCancel} />

          <div className="crystal-card">
            <Card className="relative overflow-hidden bg-white/95 backdrop-blur-lg border border-gray-200/50 shadow-2xl" padding="none">
              <div className={`h-1 bg-gradient-to-r ${theme.colors.primary}`}/>
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} theme={theme} />

                {error && <ProfessionalAlert type="error" title="Error" message={error} onDismiss={() => setError(null)} />}
                {success && <ProfessionalAlert type="success" title="¡Éxito!" message={success} onDismiss={() => setSuccess(null)} />}

                {/* Step 1: General */}
                <section className="form-step">
                  <SectionHeader
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
                    title="Información General"
                    subtitle="Configura los datos básicos de la batalla"
                    theme={theme}
                  />
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700">🎮 Formato de Juego</label>
                      <div className="relative">
                        <select
                          name="game_id"
                          value={form.game_id}
                          onChange={handleChange}
                          required
                          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all duration-200 appearance-none"
                        >
                          <option value="" disabled>Selecciona un formato</option>
                          {games.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700">📅 Fecha y Hora</label>
                      <input
                        type="datetime-local"
                        name="played_at"
                        value={form.played_at}
                        onChange={handleChange}
                        required
                        className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all duration-200"
                      />
                    </div>
                  </div>
                </section>

                {/* Step 2: Participantes */}
                <section className="form-step">
                  <SectionHeader
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-3a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/></svg>}
                    title="Participantes"
                    subtitle={`${participants.length} guerrero${participants.length !== 1 ? 's' : ''} en la batalla`}
                    action={
                      <button
                        type="button"
                        onClick={addParticipant}
                        disabled={!canAddParticipant}
                        className={`group inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold shadow-lg transition-all duration-300 ${
                          canAddParticipant ? `${theme.gradient} text-white hover:shadow-xl hover:scale-105` : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        }`}
                        title={!canAddParticipant ? 'Completa jugador y comandante de todos los actuales' : 'Añadir participante'}
                      >
                        <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12"/></svg>
                        Añadir Participante
                      </button>
                    }
                    theme={theme}
                  />
                  <div className="space-y-6">
                    {participants.map((participant, index) => (
                      <ParticipantCard
                        key={index}
                        participant={participant}
                        index={index}
                        onUpdate={(key, value) => updateParticipant(index, key, value)}
                        onRemove={() => removeParticipant(index)}
                        profiles={optionsFor(participant.user_id)}
                        canRemove={participants.length > 1}
                        theme={theme}
                      />
                    ))}
                  </div>
                </section>

                {/* Step 3: Ganador */}
                {availableWinners.length > 0 && (
                  <section className="form-step">
                    <SectionHeader
                      icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>}
                      title="Ganador de la Batalla"
                      subtitle="¿Quién se alzó victorioso?"
                      theme={theme}
                    />
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700">👑 Selecciona el Ganador</label>
                      <div className="relative">
                        <select
                          name="winner"
                          value={form.winner}
                          onChange={handleChange}
                          required
                          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all duration-200 appearance-none"
                        >
                          <option value="">¿Quién ganó la partida?</option>
                          {availableWinners.map((p) => (
                            <option key={p.id} value={p.id}>🏆 {p.nickname}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                        </div>
                      </div>

                      {/* Badge con nombre del ganador */}
                      {form.winner && (
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                            Ganador: {profiles.find(x => x.id === form.winner)?.nickname || '—'}
                          </span>
                        </div>
                      )}

                      <p className="text-xs text-gray-500">Solo aparecen los jugadores que participan en la partida</p>
                    </div>
                  </section>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                  <div className="text-sm text-gray-500">Progreso: {currentStep}/{totalSteps} pasos completados</div>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={handleCancel} disabled={submitting} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all duration-200 disabled:opacity-50">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || currentStep < totalSteps}
                      className={`inline-flex items-center gap-2 rounded-lg px-8 py-3 text-sm font-bold shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                        currentStep >= totalSteps ? `${theme.gradient} text-white hover:shadow-xl hover:scale-105 ${theme.colors.ring}` : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {submitting ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          Creando partida...
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                          {currentStep >= totalSteps ? 'Registrar Batalla' : `Completa ${totalSteps - currentStep} paso${totalSteps - currentStep !== 1 ? 's' : ''} más`}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </Card>
          </div>

          <footer className="py-8 text-center">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <span className={`text-sm font-medium ${theme.text.soft}`}>Tema actual:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full shadow-lg" style={{ background: `linear-gradient(45deg, ${theme.colors.primary})` }}/>
                  <span className={`font-bold ${theme.text.strong}`}>{theme.label}</span>
                </div>
              </div>
              <p className={`text-xs ${theme.text.soft} opacity-75`}>El tema cambia automáticamente cada 40 segundos</p>
            </div>
          </footer>
        </div>
      </div>
    )
  }
