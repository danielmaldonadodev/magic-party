// pages/recursos.js
import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import Card from '../components/Card'

/* ===============================================================
  SISTEMA DE TEMAS MTG PROFESIONAL - EXACTO AL INDEX
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
  CSS PROFESIONAL - EXACTO AL INDEX
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

.theme-transition {
  transition: all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
`

// Inyectar estilos
if (typeof document !== 'undefined' && !document.getElementById('professional-recursos-styles')) {
  const style = document.createElement('style')
  style.id = 'professional-recursos-styles'
  style.textContent = professionalCSS
  document.head.appendChild(style)
}

/* ===============================================================
  THEME ROTATION HOOK - EXACTO AL INDEX
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
  DATOS DE RECURSOS
  =============================================================== */
const RECURSOS_DATA = {
  tiendas: [
    {
      id: 'cardmarket',
      nombre: 'Cardmarket',
      url: 'https://www.cardmarket.com/es/Magic',
      descripcion: 'El marketplace europeo más grande para Magic. Imprescindible en España para comprar y vender cartas.',
      tipo: 'Europa',
      icono: '⬢'
    },
    {
      id: 'generacion-x',
      nombre: 'Generación X',
      url: 'https://www.generacionx.com',
      descripcion: 'Cadena española con tiendas físicas y online. Buen sitio para sellado, fundas y cartas sueltas.',
      tipo: 'España',
      icono: '◇'
    },
    {
      id: 'devir',
      nombre: 'Devir',
      url: 'https://www.devir.es',
      descripcion: 'Distribuidor oficial de Magic en España. Referencia para lanzamientos y productos sellados.',
      tipo: 'España',
      icono: '◈'
    }
  ],
  herramientas: [
    {
      id: 'scryfall',
      nombre: 'Scryfall',
      url: 'https://scryfall.com',
      descripcion: 'El mejor buscador de cartas, con imágenes, ediciones y texto oráculo. Búsqueda avanzada.',
      tipo: 'Búsqueda',
      icono: '◯'
    },
    {
      id: 'moxfield',
      nombre: 'Moxfield',
      url: 'https://www.moxfield.com',
      descripcion: 'Constructor de mazos moderno con estadísticas y curva. Perfecto para Commander y Standard casual.',
      tipo: 'Deckbuilding',
      icono: '▣'
    },
    {
      id: 'edhrec',
      nombre: 'EDHRec',
      url: 'https://edhrec.com',
      descripcion: 'Ideas y estadísticas para Commander/EDH basadas en listas reales. Ideal para inspirarte.',
      tipo: 'Commander',
      icono: '▲'
    },
    {
      id: 'spelltable',
      nombre: 'SpellTable',
      url: 'https://spelltable.wizards.com',
      descripcion: 'Plataforma oficial para jugar por webcam con amigos. Muy útil si no os veis en persona.',
      tipo: 'Oficial',
      icono: '⬟'
    }
  ],
  calculadoras: [
    {
      id: 'mtg-goldfish-prices',
      nombre: 'MTGGoldfish Precios',
      url: 'https://www.mtggoldfish.com',
      descripcion: 'Seguimiento de precios y tendencias del mercado. Útil para saber si una carta está cara o barata.',
      tipo: 'Precios',
      icono: '◐'
    },
    {
      id: 'deck-pricer',
      nombre: 'Calculadora de Precios (Deck Pricer)',
      url: 'https://www.mtggoldfish.com/tools/deck_pricer',
      descripcion: 'Calcula el precio total de tu mazo y alternativas más baratas.',
      tipo: 'Precios',
      icono: '◑'
    }
  ],
  formatos: [
    {
      id: 'commander-rules',
      nombre: 'Reglas de Commander',
      url: 'https://mtgcommander.net/index.php/rules/',
      descripcion: 'Reglas oficiales del formato Commander/EDH. El formato casual más popular.',
      tipo: 'Commander',
      icono: '▲'
    },
    {
      id: 'standard-rotation',
      nombre: 'Rotación Standard',
      url: 'https://whatsinstandard.com',
      descripcion: 'Sets legales en Standard y fechas de rotación (si probáis Standard con proxies).',
      tipo: 'Standard',
      icono: '◯'
    }
  ],
  normas: [
    {
      id: 'mulligan-guide',
      nombre: 'Guía de Mulligan (London Mulligan)',
      url: 'https://magic.wizards.com/en/articles/archive/feature/london-mulligan-2019-06-03',
      descripcion: 'Cómo funciona el mulligan moderno explicado de forma clara.',
      tipo: 'Guía',
      icono: '◯'
    },
    {
      id: 'priority-stack',
      nombre: 'Prioridad y Stack',
      url: 'https://mtg.fandom.com/wiki/Stack',
      descripcion: 'Explicación práctica de prioridad y resolución de hechizos. Muy útil para evitar dudas.',
      tipo: 'Guía',
      icono: '⬢'
    }
  ],
  proxies: [
    {
      id: 'mtg-proxy-generator',
      nombre: 'MTG Proxy Generator',
      url: 'https://philo-jh.github.io/MTG-Proxy-Generator/',
      descripcion: 'Generador gratuito para imprimir en casa o copistería en España. Rápido y sin registro.',
      tipo: 'Gratuito',
      icono: '◇'
    },
    {
      id: 'mtggoldfish-proxies',
      nombre: 'MTGGoldfish Proxies',
      url: 'https://www.mtggoldfish.com/proxies/new',
      descripcion: 'Genera proxies directamente desde tu decklist. Ideal para pruebas rápidas.',
      tipo: 'Simple',
      icono: '◯'
    },
    {
      id: 'mtgcardbuilder',
      nombre: 'MTGCardBuilder',
      url: 'https://mtgcardbuilder.com',
      descripcion: 'Creador de cartas con marcos muy fieles. Útil si queréis estética cuidada antes de imprimir en España.',
      tipo: 'Avanzado',
      icono: '▲'
    }
  ]
}


const CATEGORIAS = [
  { key: 'todos', label: 'Todos', icono: '◉', descripcion: 'Ver todos los recursos disponibles' },
  { key: 'tiendas', label: 'Tiendas', icono: '◆', descripcion: 'Donde comprar cartas y productos' },
  { key: 'herramientas', label: 'Herramientas', icono: '⬢', descripcion: 'Aplicaciones y webs útiles' },
  { key: 'calculadoras', label: 'Calculadoras', icono: '◣', descripcion: 'Probabilidades y análisis de mazo' },
  { key: 'formatos', label: 'Formatos', icono: '▲', descripcion: 'Reglas de cada formato de juego' },
  { key: 'normas', label: 'Normas', icono: '▣', descripcion: 'Reglas oficiales y guías de juego' },
  { key: 'proxies', label: 'Proxies', icono: '◈', descripcion: 'Herramientas para crear cartas proxy' }
]

/* ===============================================================
  COMPONENTES
  =============================================================== */
function RecursoCard({ recurso, theme, index = 0 }) {
  const getBadgeStyle = (tipo) => {
    const styles = {
      'Internacional': 'bg-slate-600/15 text-slate-700 border-slate-400/30',
      'Europa': 'bg-indigo-600/15 text-indigo-700 border-indigo-400/30',
      'España': 'bg-red-600/15 text-red-700 border-red-400/30',
      'Premium': 'bg-amber-600/15 text-amber-700 border-amber-400/30',
      'Oficial': 'bg-emerald-600/15 text-emerald-700 border-emerald-400/30',
      'Búsqueda': 'bg-blue-600/15 text-blue-700 border-blue-400/30',
      'Digital': 'bg-cyan-600/15 text-cyan-700 border-cyan-400/30',
      'Deckbuilding': 'bg-orange-600/15 text-orange-700 border-orange-400/30',
      'Commander': 'bg-green-600/15 text-green-700 border-green-400/30',
      'Probabilidad': 'bg-pink-600/15 text-pink-700 border-pink-400/30',
      'Análisis': 'bg-teal-600/15 text-teal-700 border-teal-400/30',
      'Precios': 'bg-yellow-600/15 text-yellow-700 border-yellow-400/30',
      'Standard': 'bg-blue-600/15 text-blue-700 border-blue-400/30',
      'Modern': 'bg-gray-600/15 text-gray-700 border-gray-400/30',
      'Pioneer': 'bg-violet-600/15 text-violet-700 border-violet-400/30',
      'Torneo': 'bg-rose-600/15 text-rose-700 border-rose-400/30',
      'Guía': 'bg-slate-600/15 text-slate-700 border-slate-400/30',
      'Avanzado': 'bg-purple-600/15 text-purple-700 border-purple-400/30',
      'Simple': 'bg-green-600/15 text-green-700 border-green-400/30',
      'Printing': 'bg-indigo-600/15 text-indigo-700 border-indigo-400/30',
      'Gratuito': 'bg-emerald-600/15 text-emerald-700 border-emerald-400/30'
    }
    return styles[tipo] || 'bg-gray-600/15 text-gray-700 border-gray-400/30'
  }

  return (
    <div
      className="group crystal-card animate-professional-fade-in"
      style={{ 
        animationDelay: `${index * 100}ms`,
        '--glow-color': theme.colors.glowColor 
      }}
    >
      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-white/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 h-full" padding="lg">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div 
              className={`w-12 h-12 rounded-xl ${theme.gradient} flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110 flex-shrink-0`}
            >
              <span className="text-xl">{recurso.icono}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-lg ${theme.text.strong} mb-2 line-clamp-2 group-hover:text-opacity-80 transition-colors`}>
                {recurso.nombre}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(recurso.tipo)}`}>
                  {recurso.tipo}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className={`text-sm ${theme.text.soft} mb-6 flex-1 leading-relaxed`}>
            {recurso.descripcion}
          </p>

          {/* Action */}
          <a
            href={recurso.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed ${theme.border} ${theme.text.strong} hover:bg-gray-50 transition-all duration-300 text-sm font-semibold group-hover:border-solid`}
          >
            <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Visitar sitio web
          </a>
        </div>
      </Card>
    </div>
  )
}

function CategoriaSection({ categoria, recursos, theme, index = 0 }) {
  if (!recursos || recursos.length === 0) return null

  return (
    <section 
      className="space-y-6 animate-professional-fade-in"
      style={{ animationDelay: `${index * 200}ms` }}
    >
      <div className="space-y-2">
        <h2 className={`text-2xl md:text-3xl font-bold ${theme.text.strong} flex items-center gap-3`}>
          <span className="text-2xl opacity-80">{categoria.icono}</span>
          {categoria.label}
        </h2>
        <p className={`text-base md:text-lg ${theme.text.soft} font-medium`}>
          {categoria.descripcion}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recursos.map((recurso, idx) => (
          <RecursoCard 
            key={recurso.id} 
            recurso={recurso} 
            theme={theme} 
            index={idx} 
          />
        ))}
      </div>
    </section>
  )
}

/* ===============================================================
  COMPONENTE PRINCIPAL
  =============================================================== */
export default function RecursosPage() {
  const { theme, index: themeIndex } = useThemeRotation(40000)
  const [categoriaActiva, setCategoriaActiva] = useState('todos')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  const recursosVisibles = useMemo(() => {
    if (categoriaActiva === 'todos') {
      return CATEGORIAS.slice(1).map(cat => ({
        categoria: cat,
        recursos: RECURSOS_DATA[cat.key] || []
      }))
    }
    
    return [{
      categoria: CATEGORIAS.find(c => c.key === categoriaActiva),
      recursos: RECURSOS_DATA[categoriaActiva] || []
    }]
  }, [categoriaActiva])

  return (
    <div 
      className="min-h-screen theme-transition"
      style={{ 
        background: `linear-gradient(135deg, ${theme.backgroundGradient})`,
      }}
    >
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12 lg:space-y-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-8 sm:py-12 lg:py-16">
          <div className="text-center space-y-4 sm:space-y-6">

            {/* Theme indicator */}
            <div 
              className={`inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 rounded-full professional-glass ${
                loaded ? 'animate-professional-fade-in' : 'opacity-0'
              }`}
              style={{ animationDelay: '0.3s' }}
            >
              <span className="text-lg sm:text-xl lg:text-2xl">{theme.icon}</span>
              <span className={`font-bold text-sm sm:text-base lg:text-lg ${theme.text.strong}`}>
                {theme.label}
              </span>
            </div>

            {/* Main title */}
            <div 
              className={`space-y-3 sm:space-y-4 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
              style={{ animationDelay: '0.4s' }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
                <span className={`${theme.text.strong} block sm:inline`}>
                  📚 Recursos
                </span>
                <span className="text-gray-900 block sm:inline sm:ml-3 lg:ml-4">MTG</span>
              </h1>
              
              <p className={`text-base sm:text-lg md:text-xl lg:text-2xl ${theme.text.soft} max-w-4xl mx-auto leading-relaxed font-medium px-4 sm:px-0`}>
                Todo lo que necesitas para mejorar tu experiencia jugando Magic: The Gathering. 
                Tiendas, herramientas, calculadoras y más.
              </p>
              
              <div className={`mt-3 sm:mt-4 text-xs sm:text-sm ${theme.text.soft} opacity-80 px-4 sm:px-0`}>
                <span className="font-semibold">Estrategia actual: </span>
                <span className="block sm:inline mt-1 sm:mt-0">{theme.fact}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filtros de Categoría */}
        <section 
          className={`space-y-6 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
          style={{ animationDelay: '0.6s' }}
        >
          <div className="space-y-4">
            <h2 className={`text-xl sm:text-2xl font-bold ${theme.text.strong} text-center sm:text-left`}>
              Explorar por Categoría
            </h2>
            
            {/* Filtros - Optimizados para móvil */}
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              {CATEGORIAS.map((categoria, index) => (
                <button
                  key={categoria.key}
                  onClick={() => setCategoriaActiva(categoria.key)}
                  className={`group relative px-4 py-3 sm:px-6 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                    categoriaActiva === categoria.key
                      ? `${theme.gradient} text-white shadow-xl ${theme.colors.ring}`
                      : `bg-white/80 backdrop-blur-sm ${theme.text.strong} border-2 border-gray-300 hover:border-gray-400 hover:bg-white`
                  }`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    '--glow-color': theme.colors.glowColor 
                  }}
                >
                  {categoriaActiva === categoria.key && (
                    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  <div className="relative flex items-center gap-2 sm:gap-3">
                    <span className="text-lg opacity-80">{categoria.icono}</span>
                    <span className="whitespace-nowrap">{categoria.label}</span>
                    {categoriaActiva === categoria.key && (
                      <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Contenido Principal */}
        <main className="space-y-12 sm:space-y-16 pb-12 sm:pb-16">
          {recursosVisibles.map(({ categoria, recursos }, index) => (
            <CategoriaSection
              key={categoria.key}
              categoria={categoria}
              recursos={recursos}
              theme={theme}
              index={index}
            />
          ))}
        </main>

        {/* Action Section */}
        <section 
          className={`py-12 sm:py-16 text-center space-y-6 sm:space-y-8 ${loaded ? 'animate-professional-fade-in' : 'opacity-0'}`}
          style={{ animationDelay: '0.8s' }}
        >
          <div className="space-y-4">
            <h2 className={`text-2xl sm:text-3xl font-bold ${theme.text.strong}`}>
              ¿Listo para jugar?
            </h2>
            <p className={`text-base sm:text-lg ${theme.text.soft} max-w-2xl mx-auto px-4 sm:px-0`}>
              Ahora que tienes todas las herramientas, ¡registra tu próxima partida!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 sm:px-0">
            <Link
              href="/matches/new"
              className={`group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl ${theme.gradient} text-white font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 ${theme.colors.ring}`}
            >
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-3">
                <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Partida
              </div>
            </Link>

            <Link
              href="/"
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-white/80 backdrop-blur-sm font-semibold text-gray-800 border-2 border-gray-300 hover:border-gray-400 hover:bg-white transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al Inicio
              </div>
            </Link>
          </div>
        </section>

        {/* Theme Indicator Footer */}
        <footer className="py-8 sm:py-12 text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <span className={`text-sm font-medium ${theme.text.soft}`}>
                Tema actual:
              </span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full shadow-lg"
                  style={{ background: `linear-gradient(45deg, ${theme.colors.primary})` }}
                />
                <span className={`font-bold ${theme.text.strong}`}>
                  {theme.label}
                </span>
              </div>
            </div>
            
            {/* Theme progress indicator */}
            <div className="flex items-center justify-center gap-2">
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
        </footer>
      </div>
    </div>
  )
}