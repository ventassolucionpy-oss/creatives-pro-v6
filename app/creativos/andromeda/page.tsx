'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

// ---------------------------------------------
// TIPOS
// ---------------------------------------------
type Business = 'dropshipping' | 'hotmart'
type Phase = 'validacion' | 'escala' | 'dominio'
type PostType = {
  id: string
  nombre: string
  emoji: string
  descripcion: string
  engagement: 'muy alto' | 'alto' | 'medio'
  mejor_para: string[]
  plataformas: string[]
  tag: string
}

type Strategy = {
  id: string
  nombre: string
  fase: Phase
  presupuesto: string
  objetivo: string
  descripcion: string
  pasos: string[]
  kpis: { nombre: string; meta: string }[]
  tipos_post: string[]
  color: string
}

// ---------------------------------------------
// DATOS
// ---------------------------------------------
const POST_TYPES: PostType[] = [
  {
    id: 'imagen-estatica',
    nombre: 'Imagen Estática',
    emoji: '🖼️',
    descripcion: 'Una sola imagen de producto, resultado o beneficio. La base de todo test inicial.',
    engagement: 'medio',
    mejor_para: ['dropshipping', 'hotmart'],
    plataformas: ['Feed', 'Stories'],
    tag: 'Esencial',
  },
  {
    id: 'carrusel',
    nombre: 'Carrusel',
    emoji: '🎴',
    descripcion: 'Secuencia de 3-10 slides. Cada card lleva la historia más profunda. Máximo tiempo de permanencia.',
    engagement: 'muy alto',
    mejor_para: ['dropshipping', 'hotmart'],
    plataformas: ['Feed', 'Reels'],
    tag: '🔥 Top Engagement',
  },
  {
    id: 'antes-despues',
    nombre: 'Antes & Después',
    emoji: '↔️',
    descripcion: 'Split visual del estado inicial vs. el resultado. Activa el deseo de transformación.',
    engagement: 'muy alto',
    mejor_para: ['dropshipping'],
    plataformas: ['Feed', 'Stories', 'Reels'],
    tag: '🔥 Top Conversión',
  },
  {
    id: 'video-ugc',
    nombre: 'Video UGC',
    emoji: '📱',
    descripcion: 'Video estilo "persona real hablando". El formato que más baja el CPM y aumenta la confianza.',
    engagement: 'muy alto',
    mejor_para: ['dropshipping', 'hotmart'],
    plataformas: ['Reels', 'Stories', 'Feed'],
    tag: '🔥 Más barato',
  },
  {
    id: 'problema-solucion',
    nombre: 'Problema → Solución',
    emoji: '🎯',
    descripcion: 'Primera mitad: escena del dolor. Segunda mitad: el producto como héroe. Estructura PAS visual.',
    engagement: 'muy alto',
    mejor_para: ['dropshipping', 'hotmart'],
    plataformas: ['Reels', 'Stories'],
    tag: 'PAS Visual',
  },
  {
    id: 'testimonial',
    nombre: 'Testimonial Real',
    emoji: '⭐',
    descripcion: 'Screenshot o video de cliente real usando el producto. La prueba social más poderosa.',
    engagement: 'alto',
    mejor_para: ['dropshipping', 'hotmart'],
    plataformas: ['Feed', 'Stories'],
    tag: 'Prueba Social',
  },
  {
    id: 'unboxing',
    nombre: 'Unboxing / Reveal',
    emoji: '📦',
    descripcion: 'Abrir el paquete en cámara. Genera anticipación y muestra la calidad del packaging.',
    engagement: 'alto',
    mejor_para: ['dropshipping'],
    plataformas: ['Reels', 'Stories'],
    tag: 'Dropshipping',
  },
  {
    id: 'comparativa',
    nombre: 'Comparativa / vs.',
    emoji: '⚖️',
    descripcion: '"Tu producto vs. la alternativa cara/inferior". Perfecto para nivel 3-4 de conciencia.',
    engagement: 'alto',
    mejor_para: ['dropshipping', 'hotmart'],
    plataformas: ['Feed', 'Stories'],
    tag: 'Nivel 3-4',
  },
  {
    id: 'lifestyle',
    nombre: 'Lifestyle',
    emoji: '✨',
    descripcion: 'Producto en su contexto natural de uso. Vende el estilo de vida, no el objeto.',
    engagement: 'medio',
    mejor_para: ['dropshipping'],
    plataformas: ['Feed'],
    tag: 'Branding',
  },
  {
    id: 'demo-producto',
    nombre: 'Demo / How-to',
    emoji: '🛠️',
    descripcion: 'Mostrar cómo funciona el producto paso a paso. Elimina objeciones antes de la compra.',
    engagement: 'alto',
    mejor_para: ['dropshipping'],
    plataformas: ['Reels', 'Feed'],
    tag: 'Objeciones',
  },
  {
    id: 'hook-curiosidad',
    nombre: 'Hook de Curiosidad',
    emoji: '🤔',
    descripcion: '"No sabía que esto existía" / "El truco que nadie te contó". Funciona con público frío.',
    engagement: 'muy alto',
    mejor_para: ['dropshipping', 'hotmart'],
    plataformas: ['Reels', 'Stories'],
    tag: 'Tráfico frío',
  },
  {
    id: 'urgencia-escasez',
    nombre: 'Urgencia / Escasez',
    emoji: '⏰',
    descripcion: 'Cuenta regresiva, stock limitado, oferta que vence. Para retargeting nivel 4-5.',
    engagement: 'medio',
    mejor_para: ['dropshipping', 'hotmart'],
    plataformas: ['Stories', 'Feed'],
    tag: 'Retargeting',
  },
  {
    id: 'tutorial-educativo',
    nombre: 'Tutorial / Educativo',
    emoji: '📚',
    descripcion: 'Aporta valor real antes de vender. Funciona para construir audiencia caliente y retargeting.',
    engagement: 'alto',
    mejor_para: ['hotmart'],
    plataformas: ['Reels', 'Feed'],
    tag: 'Hotmart',
  },
  {
    id: 'resultado-especifico',
    nombre: 'Resultado Específico',
    emoji: '📈',
    descripcion: '"Pasé de X a Y en Z días". Un número concreto en el hook convierte 3x más que lo genérico.',
    engagement: 'muy alto',
    mejor_para: ['hotmart', 'dropshipping'],
    plataformas: ['Feed', 'Stories', 'Reels'],
    tag: 'Alta conversión',
  },
  {
    id: 'objecion-directa',
    nombre: 'Rebate de Objeción',
    emoji: '🛡️',
    descripcion: '"¿No tienes tiempo? Este método toma solo 20 min al día". Ideal para retargeting caliente.',
    engagement: 'alto',
    mejor_para: ['hotmart', 'dropshipping'],
    plataformas: ['Stories', 'Feed'],
    tag: 'Retargeting',
  },
]

const STRATEGIES: { dropshipping: Strategy[]; hotmart: Strategy[] } = {
  dropshipping: [
    {
      id: 'ds-val',
      nombre: 'Fase 1 — Validación del Producto',
      fase: 'validacion',
      presupuesto: 'USD 5-15/día por ad set',
      objetivo: 'Encontrar el creativo ganador y el público rentable',
      descripcion: 'Antes de escalar, necesitás saber qué funciona. Esta fase minimiza el riesgo y te da datos reales de conversión.',
      pasos: [
        'Crear 1 campaña con objetivo CONVERSIONES (evento: Compra)',
        'Hacer 3 ad sets idénticos con 3 públicos distintos (intereses amplios, LAL 1-3%, amplio sin intereses)',
        'En cada ad set: 3-4 creatividades distintas (1 imagen estática, 1 video UGC, 1 carrusel, 1 antes/después)',
        'Presupuesto: USD 5-10/día por ad set. No tocar 48-72h',
        'Criterio de corte: CTR < 0.8% y CPC > USD 1.5 → pausar el ad',
        'Ganador: el ad con mayor CTR + menor CPA. Escalarlo a la siguiente fase',
      ],
      kpis: [
        { nombre: 'CTR (Link Click)', meta: '> 1.5%' },
        { nombre: 'CPC', meta: '< USD 0.80' },
        { nombre: 'CPM', meta: '< USD 8 en LATAM' },
        { nombre: 'ROAS mínimo para escalar', meta: '> 2x' },
      ],
      tipos_post: ['imagen-estatica', 'antes-despues', 'video-ugc', 'hook-curiosidad'],
      color: 'emerald',
    },
    {
      id: 'ds-esc',
      nombre: 'Fase 2 — Escalado Horizontal',
      fase: 'escala',
      presupuesto: 'USD 30-100/día',
      objetivo: 'Multiplicar el creativo ganador sin matar el ROAS',
      descripcion: 'Una vez validado el ganador, se escala abriendo más públicos similares con el mismo creativo.',
      pasos: [
        'Duplicar el ad set ganador. NO cambiar nada del creativo',
        'Cambiar solo el público: diferentes grupos de interés, diferentes LAL (1%, 3%, 5%)',
        'Aumentar presupuesto máximo 20-30% cada 48h. Nunca duplicar de golpe',
        'Agregar 1-2 nuevas creatividades variantes del ganador (mismo hook, diferente visual)',
        'Activar retargeting: audiencias que visitaron la web en 7/14/30 días',
        'Usar el tipo de anuncio "Advantage+ Audience" para los ad sets de escala',
      ],
      kpis: [
        { nombre: 'ROAS objetivo', meta: '> 3x' },
        { nombre: 'Frecuencia', meta: '< 2.5 en 7 días' },
        { nombre: 'Costo por compra', meta: '< 30% del ticket' },
        { nombre: 'CTR mantenido', meta: '> 1.2%' },
      ],
      tipos_post: ['carrusel', 'problema-solucion', 'testimonial', 'unboxing', 'comparativa'],
      color: 'blue',
    },
    {
      id: 'ds-dom',
      nombre: 'Fase 3 — Dominio y CBO',
      fase: 'dominio',
      presupuesto: 'USD 100-500+/día',
      objetivo: 'Maximizar volumen con estructura CBO y nuevos creativos',
      descripcion: 'Estructura profesional con Campaign Budget Optimization. El algoritmo de Meta asigna el presupuesto automáticamente.',
      pasos: [
        'Crear campaña CBO (presupuesto a nivel campaña) con USD 100-200/día',
        'Dentro: 4-6 ad sets con públicos variados (fríos, tibios, retargeting)',
        'Feeds múltiples: 6-8 creativos distintos por ad set para que Meta optimice',
        'Lanzar una "creative testing" paralela: siempre probando 2 nuevos creativos por semana',
        'Activar Dynamic Creative: subir 5 imágenes + 5 titulares y Meta hace el A/B solo',
        'Revisa cada 3-5 días. Pausar lo que tiene ROAS < 1.5x después de 7 días',
      ],
      kpis: [
        { nombre: 'ROAS campaña total', meta: '> 4x' },
        { nombre: 'Frecuencia acumulada', meta: '< 4 en 30 días' },
        { nombre: '% Creative Refresh', meta: 'Nuevos creativos cada 7-10 días' },
        { nombre: 'Revenue diario', meta: 'Crecimiento sostenido' },
      ],
      tipos_post: ['lifestyle', 'urgencia-escasez', 'demo-producto', 'resultado-especifico', 'objecion-directa'],
      color: 'violet',
    },
  ],
  hotmart: [
    {
      id: 'hm-val',
      nombre: 'Fase 1 — Validación del Funnel',
      fase: 'validacion',
      presupuesto: 'USD 10-20/día',
      objetivo: 'Validar la página de ventas y el mensaje antes de escalar',
      descripcion: 'Productos digitales tienen un ciclo de decisión más largo. Primero validar el mensaje, luego escalar.',
      pasos: [
        'Objetivo de campaña: TRÁFICO o LEADS (no conversiones todavía)',
        'Probar 3 hooks distintos con el mismo público: resultado específico, dolor, curiosidad',
        'Landing page debe cargar en < 3 segundos. Testear con PageSpeed Insights',
        'Instalar el Pixel de Meta EN LA PÁGINA DE GRACIAS (post-compra), no en checkout',
        'Medir: tasa de clics → lectura de página → inicio de checkout → compra',
        'Con mínimo 20 ventas, activar campaña de CONVERSIONES',
      ],
      kpis: [
        { nombre: 'CPL (Costo por lead)', meta: '< USD 3 en LATAM' },
        { nombre: 'CTR al video de ventas', meta: '> 2%' },
        { nombre: 'Tiempo en página', meta: '> 2 minutos' },
        { nombre: 'Tasa checkout / visita', meta: '> 3%' },
      ],
      tipos_post: ['hook-curiosidad', 'resultado-especifico', 'tutorial-educativo', 'problema-solucion'],
      color: 'amber',
    },
    {
      id: 'hm-esc',
      nombre: 'Fase 2 — Funnel de Calentamiento',
      fase: 'escala',
      presupuesto: 'USD 30-80/día',
      objetivo: 'Construir audiencia caliente con contenido de valor y cerrar con retargeting',
      descripcion: 'Los productos digitales venden mejor con la estrategia "Value → Pitch". Calentar antes de vender.',
      pasos: [
        'Campaña 1 — Alcance/Visualizaciones: mostrar contenido educativo/de valor (video 60s)',
        'Crear audiencia personalizada: personas que vieron el 75% del video educativo',
        'Campaña 2 — Conversiones: retargeting a esa audiencia caliente con el pitch directo',
        'Separar ad sets: compradores anteriores, visitantes página de ventas, lista de emails',
        'Presupuesto: 70% en captación de audiencia caliente, 30% en retargeting conversion',
        'Agregar Testimonial + Antes/Después en el retargeting para subir la confianza',
      ],
      kpis: [
        { nombre: 'CPM (audiencias calientes)', meta: '< USD 5' },
        { nombre: 'CPA (costo por compra)', meta: '< 30% del precio del producto' },
        { nombre: 'ROAS', meta: '> 3x' },
        { nombre: 'Tasa apertura emails', meta: '> 25%' },
      ],
      tipos_post: ['carrusel', 'testimonial', 'antes-despues', 'objecion-directa', 'urgencia-escasez'],
      color: 'orange',
    },
    {
      id: 'hm-dom',
      nombre: 'Fase 3 — Escala con Advantage+',
      fase: 'dominio',
      presupuesto: 'USD 100-300+/día',
      objetivo: 'Meta gestiona automáticamente los públicos. Tú gestionás los creativos.',
      descripcion: 'Advantage+ Shopping Campaigns (ASC) de Meta es el futuro. El algoritmo toma el control de la segmentación.',
      pasos: [
        'Crear campaña Advantage+ Sales (disponible en Ads Manager como "Advantage+ App Campaigns")',
        'Subir 10+ creativos distintos: videos cortos, carruseles, imágenes con resultado específico',
        'Configurar el catálogo de Hotmart si tenés múltiples productos',
        'Lanzar campaña de "Retención" para clientes actuales: upsell y cross-sell',
        'Crear Lookalike audiences de compradores (el activo más valioso)',
        'Revisar el Breakdown por "Tipo de contenido" para identificar qué formato gana',
      ],
      kpis: [
        { nombre: 'ROAS total campaña', meta: '> 5x' },
        { nombre: 'Costo por compra', meta: 'Estable o decreciente' },
        { nombre: 'LTV 30 días', meta: '> 1.3x precio original' },
        { nombre: 'CAC payback period', meta: '< 30 días' },
      ],
      tipos_post: ['lifestyle', 'resultado-especifico', 'comparativa', 'tutorial-educativo', 'demo-producto'],
      color: 'violet',
    },
  ],
}

const PHASE_META = {
  validacion: { label: 'Validación', color: 'emerald', desc: 'Testear antes de invertir' },
  escala: { label: 'Escala', color: 'blue', desc: 'Multiplicar lo que funciona' },
  dominio: { label: 'Dominio', color: 'violet', desc: 'Máximo volumen y ROAS' },
}

// ---------------------------------------------
// COMPONENTES
// ---------------------------------------------
function PhaseTag({ fase }: { fase: Phase }) {
  const m = PHASE_META[fase]
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[m.color]}`}>
      {m.label}
    </span>
  )
}

function EngagementDot({ level }: { level: string }) {
  if (level === 'muy alto') return <span className="inline-flex gap-0.5">{'●●●'.split('').map((d, i) => <span key={i} className="text-[8px] text-emerald-400">{d}</span>)}</span>
  if (level === 'alto') return <span className="inline-flex gap-0.5">{'●●○'.split('').map((d, i) => <span key={i} className={`text-[8px] ${d === '●' ? 'text-amber-400' : 'text-white/10'}`}>{d}</span>)}</span>
  return <span className="inline-flex gap-0.5">{'●○○'.split('').map((d, i) => <span key={i} className={`text-[8px] ${d === '●' ? 'text-blue-400' : 'text-white/10'}`}>{d}</span>)}</span>
}

function PostTypeCard({ pt, selected, onToggle }: { pt: PostType; selected: boolean; onToggle: () => void }) {
  const engColors: Record<string, string> = { 'muy alto': 'text-emerald-400', 'alto': 'text-amber-400', 'medio': 'text-blue-400' }
  return (
    <button
      onClick={onToggle}
      className={`text-left p-4 rounded-xl border transition-all duration-200 ${
        selected
          ? 'border-violet-500/50 bg-violet-500/8'
          : 'border-white/8 bg-white/2 hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xl">{pt.emoji}</span>
        {selected && (
          <span className="w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l1.5 1.5 3.5-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        )}
      </div>
      <p className="text-white text-xs font-semibold mb-1">{pt.nombre}</p>
      <p className="text-white/35 text-[11px] leading-snug mb-2">{pt.descripcion}</p>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-medium ${engColors[pt.engagement]}`}>{pt.engagement}</span>
        <div className="flex gap-1">
          {pt.plataformas.map(p => (
            <span key={p} className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded text-white/30">{p}</span>
          ))}
        </div>
      </div>
    </button>
  )
}

function StrategyCard({ s, postTypes, isSelected, onSelect }: { s: Strategy; postTypes: PostType[]; isSelected: boolean; onSelect: (s: Strategy) => void }) {
  const [open, setOpen] = useState(false)
  const colorMap: Record<string, { border: string; glow: string; text: string; tag: string }> = {
    emerald: { border: 'border-emerald-500/20', glow: 'bg-emerald-500/5', text: 'text-emerald-400', tag: 'bg-emerald-500/10 text-emerald-400' },
    blue: { border: 'border-blue-500/20', glow: 'bg-blue-500/5', text: 'text-blue-400', tag: 'bg-blue-500/10 text-blue-400' },
    violet: { border: 'border-violet-500/20', glow: 'bg-violet-500/5', text: 'text-violet-400', tag: 'bg-violet-500/10 text-violet-400' },
    amber: { border: 'border-amber-500/20', glow: 'bg-amber-500/5', text: 'text-amber-400', tag: 'bg-amber-500/10 text-amber-400' },
    orange: { border: 'border-orange-500/20', glow: 'bg-orange-500/5', text: 'text-orange-400', tag: 'bg-orange-500/10 text-orange-400' },
  }
  const c = colorMap[s.color] || colorMap.violet
  const relatedPosts = postTypes.filter(pt => s.tipos_post.includes(pt.id))

  return (
    <div className={`rounded-xl border transition-all duration-200 ${isSelected ? 'border-violet-500/50 bg-violet-500/8 ring-1 ring-violet-500/20' : `${c.border} ${c.glow}`} overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full p-5 text-left flex items-start justify-between gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <PhaseTag fase={s.fase} />
            <span className={`text-[10px] font-semibold ${c.text}`}>{s.presupuesto}</span>
          </div>
          <h3 className="text-white font-semibold text-sm">{s.nombre}</h3>
          <p className="text-white/40 text-xs mt-0.5">{s.objetivo}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isSelected && (
            <span className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          )}
          <span className={`text-white/30 text-sm transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
          <p className="text-white/50 text-sm">{s.descripcion}</p>

          {/* Pasos */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-2">Plan de acción paso a paso</p>
            <ol className="space-y-2">
              {s.pasos.map((paso, i) => (
                <li key={i} className="flex gap-3 text-sm text-white/60">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full ${c.tag} flex items-center justify-center text-[10px] font-bold`}>
                    {i + 1}
                  </span>
                  <span className="leading-snug">{paso}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* KPIs */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-2">KPIs que debés monitorear</p>
            <div className="grid grid-cols-2 gap-2">
              {s.kpis.map((k, i) => (
                <div key={i} className="bg-black/20 rounded-lg p-2.5">
                  <p className="text-white/35 text-[10px] mb-0.5">{k.nombre}</p>
                  <p className={`font-bold text-xs ${c.text}`}>{k.meta}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tipos de post recomendados */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-2">Creatividades recomendadas para esta fase</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {relatedPosts.map(pt => (
                <span key={pt.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs transition-all ${isSelected ? 'bg-violet-500/12 border-violet-500/30 text-violet-300' : 'bg-white/5 border-white/8 text-white/60'}`}>
                  <span>{pt.emoji}</span>
                  <span>{pt.nombre}</span>
                </span>
              ))}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(s) }}
              className={`text-xs px-4 py-2 rounded-lg font-medium border transition-all ${
                isSelected
                  ? 'border-violet-500/50 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30'
                  : 'border-white/15 bg-white/5 text-white/50 hover:border-violet-500/40 hover:text-violet-300'
              }`}
            >
              {isSelected ? '✓ Estrategia seleccionada — Cambiar' : '↑ Usar esta estrategia'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------
// PÁGINA PRINCIPAL
// ---------------------------------------------
export default function AndromeadaPage() {
  const [business, setBusiness] = useState<Business>('dropshipping')
  const [selectedPhase, setSelectedPhase] = useState<Phase | 'all'>('all')
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null)
  const [filterBusiness, setFilterBusiness] = useState(true)

  const togglePost = (id: string) => {
    setSelectedPosts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  // When a strategy is selected, auto-select its recommended post types
  const selectStrategy = (strategy: Strategy) => {
    if (selectedStrategyId === strategy.id) {
      setSelectedStrategyId(null)
      setSelectedPosts([])
    } else {
      setSelectedStrategyId(strategy.id)
      setSelectedPosts(strategy.tipos_post)
    }
  }

  const selectedStrategy = selectedStrategyId
    ? [...STRATEGIES.dropshipping, ...STRATEGIES.hotmart].find(s => s.id === selectedStrategyId)
    : null

  const filteredPosts = filterBusiness
    ? POST_TYPES.filter(pt => pt.mejor_para.includes(business))
    : POST_TYPES

  const filteredStrategies = STRATEGIES[business].filter(
    s => selectedPhase === 'all' || s.fase === selectedPhase
  )

  return (
    <div className="min-h-screen">
      <Link href="/aprender" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/crear" className="btn-ghost text-white/30 hover:text-white p-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-lg font-bold text-white">Andromeda</h1>
              <span className="tag tag-violet text-[10px]">Beta</span>
            </div>
            <p className="text-white/40 text-xs">Estrategia progresiva de escalado para Meta Ads — Dropshipping & Hotmart</p>
          </div>
        </div>

        {/* Business Toggle */}
        <div className="flex gap-2 p-1 bg-white/3 rounded-xl border border-white/8 mb-8 max-w-sm">
          {(['dropshipping', 'hotmart'] as Business[]).map(b => (
            <button
              key={b}
              onClick={() => setBusiness(b)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${
                business === b
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {b === 'dropshipping' ? '🛒 Dropshipping' : '🎓 Hotmart'}
            </button>
          ))}
        </div>

        {/* Resumen visual de fases */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {(Object.entries(PHASE_META) as [Phase, typeof PHASE_META[Phase]][]).map(([fase, meta]) => {
            const count = STRATEGIES[business].filter(s => s.fase === fase).length
            const colorMap: Record<string, string> = {
              emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
              blue: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
              violet: 'border-violet-500/20 bg-violet-500/5 text-violet-400',
            }
            return (
              <button
                key={fase}
                onClick={() => setSelectedPhase(prev => prev === fase ? 'all' : fase)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                  selectedPhase === fase
                    ? colorMap[meta.color] + ' ring-1 ring-inset ring-current/30'
                    : 'border-white/8 bg-white/2 hover:border-white/15'
                }`}
              >
                <p className={`text-xs font-bold ${selectedPhase === fase ? '' : 'text-white/60'}`}>{meta.label}</p>
                <p className="text-white/30 text-[10px] mt-0.5">{meta.desc}</p>
              </button>
            )
          })}
        </div>

        {/* Estrategias */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">
              Estrategias de Escalado
              <span className="ml-2 text-white/30 font-normal">{filteredStrategies.length} etapas</span>
            </h2>
            {selectedPhase !== 'all' && (
              <button onClick={() => setSelectedPhase('all')} className="text-xs text-white/30 hover:text-white/60">
                Ver todas ×
              </button>
            )}
          </div>
          <div className="space-y-3">
            {filteredStrategies.map(s => (
              <StrategyCard
                key={s.id}
                s={s}
                postTypes={POST_TYPES}
                isSelected={selectedStrategyId === s.id}
                onSelect={selectStrategy}
              />
            ))}
          </div>
        </section>

        {/* Tipos de Post */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-semibold text-sm">
                Tipos de Creatividades
                <span className="ml-2 text-white/30 font-normal">{filteredPosts.length} formatos</span>
              </h2>
              <p className="text-white/30 text-xs mt-0.5">Seleccioná los que querés usar. Los recomendados por fase aparecen marcados en cada estrategia.</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-white/30">Solo para {business}</span>
              <div
                onClick={() => setFilterBusiness(p => !p)}
                className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${filterBusiness ? 'bg-violet-600' : 'bg-white/10'}`}
              >
                <div className={`w-3 h-3 rounded-full bg-white m-0.5 transition-transform ${filterBusiness ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {filteredPosts.map(pt => (
              <PostTypeCard
                key={pt.id}
                pt={pt}
                selected={selectedPosts.includes(pt.id)}
                onToggle={() => togglePost(pt.id)}
              />
            ))}
          </div>

          {selectedPosts.length > 0 && (
            <div className="mt-6 p-4 rounded-xl border border-violet-500/20 bg-violet-500/5">
              <p className="text-violet-400 text-xs font-semibold mb-2">
                {selectedPosts.length} tipo{selectedPosts.length > 1 ? 's' : ''} seleccionado{selectedPosts.length > 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedPosts.map(id => {
                  const pt = POST_TYPES.find(p => p.id === id)
                  return pt ? (
                    <span key={id} className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs text-violet-300">
                      {pt.emoji} {pt.nombre}
                    </span>
                  ) : null
                })}
              </div>
              <Link
                href="/campana"
                className="btn-primary text-xs px-4 py-2 inline-flex"
              >
                📘 Ir a Campaña Completa + Estrategia Meta Ads →
              </Link>
            </div>
          )}
        </section>

        {/* Educational explanation — how Andromeda works */}
        <div className="mt-10 space-y-4">
          <div className="p-5 rounded-xl border border-violet-500/20 bg-violet-500/5">
            <p className="text-violet-300 font-bold text-sm mb-3">🧠 Cómo funciona Andromeda</p>
            <p className="text-white/60 text-sm leading-relaxed mb-3">
              Andromeda es un método de escalado progresivo de Meta Ads en 3 fases. No es una herramienta de generación de anuncios — es un sistema de <strong className="text-white/80">toma de decisiones</strong> sobre cuándo y cómo mover el presupuesto.
            </p>
            <div className="space-y-3">
              {[
                { fase: 'Fase 1 — Validación', desc: 'Testeás con presupuesto mínimo ($10-20/día). Objetivo: encontrar 1 creativo con ROAS ≥ 2.5x. Criterio de pasar: 3 días consecutivos rentables. NO escales antes de esto.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { fase: 'Fase 2 — Escala controlada', desc: 'Duplicás el budget del adset ganador cada 48-72hs máximo un 30%. Duplicás el ad set (no el budget). Monitorés la frecuencia (no pasar de 3.5 en 7 días). Si el ROAS cae >20% en 48hs, frenás.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { fase: 'Fase 3 — Dominio', desc: 'CBO con múltiples ad sets. Audiences lookalike 1-3%. Retargeting separado. El creativo original en rotación con 2-3 variantes. Budget horizontal, no vertical.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              ].map(f => (
                <div key={f.fase} className={`p-3 rounded-xl ${f.bg}`}>
                  <p className={`text-xs font-bold mb-1 ${f.color}`}>{f.fase}</p>
                  <p className="text-white/60 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-amber-400 font-bold text-sm mb-2">⚠️ Por qué Andromeda no genera el anuncio directamente</p>
            <p className="text-white/50 text-sm leading-relaxed">Andromeda es una <strong className="text-white/70">estrategia de escalado</strong>, no un generador de copies. Primero necesitás tener un anuncio funcionando (con ROAS positivo). Recién entonces Andromeda te dice cómo escalar ese resultado de forma sostenible sin que el algoritmo se rompa.</p>
          </div>

          <div className="p-4 rounded-xl border border-white/8">
            <p className="text-white/60 font-bold text-sm mb-3">🚀 Flujo correcto</p>
            <div className="space-y-2">
              {[
                { n: '1', label: 'Creá el anuncio', href: '/campana', btn: 'Campaña Completa →' },
                { n: '2', label: 'Lanzá y validá con presupuesto mínimo', href: '/kpis', btn: 'Dashboard KPIs →' },
                { n: '3', label: 'Si ROAS ≥ 2.5x por 3 días → aplicá Andromeda Fase 2', href: '/presupuesto-escalado', btn: 'Calculadora Escalado →' },
                { n: '4', label: 'Analizá resultados y tomá decisiones', href: '/war-room', btn: 'War Room →' },
              ].map(s => (
                <div key={s.n} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-600/20 flex items-center justify-center text-violet-400 font-black text-xs flex-shrink-0">{s.n}</div>
                  <p className="text-white/50 text-xs flex-1">{s.label}</p>
                  <Link href={s.href} className="text-[10px] text-violet-400 font-bold hover:text-violet-300 transition-colors flex-shrink-0">{s.btn}</Link>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
