'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { PAISES } from '@/lib/constants'

// ─── Tipos ───────────────────────────────────────────────
type StageId =
  | 'encontrar'
  | 'validar'
  | 'conocer'
  | 'construir'
  | 'lanzar'
  | 'gestionar'
  | 'escalar'

type Step = {
  href: string
  icon: string
  label: string
  desc: string
  badge?: string
  cta: string
}

type Stage = {
  id: StageId
  numero: number
  titulo: string
  subtitulo: string
  emoji: string
  color: string
  borderColor: string
  bgColor: string
  dotColor: string
  steps: Step[]
  tip: string
  siguiente?: StageId
}

// ─── Definición del flujo completo ───────────────────────
const STAGES: Stage[] = [
  {
    id: 'encontrar',
    numero: 1,
    titulo: 'Encontrá el producto',
    subtitulo: 'Antes de invertir en ads, validá que el producto tiene mercado real en tu país (Paraguay, Colombia o México).',
    emoji: '🔍',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/5',
    dotColor: 'bg-amber-500',
    tip: '💡 Regla de oro: si no te lo venderías a un familiar, no lo vendas. Funciona igual en PY, CO y MX.',
    siguiente: 'validar',
    steps: [
      {
        href: '/dropi',
        icon: '🇵🇾',
        label: 'Dropi Paraguay',
        desc: 'Explorá el catálogo de Dropi y encontrá productos con alto margen y baja competencia.',
        badge: '⭐ Empezá acá',
        cta: 'Buscar productos →',
      },
      {
        href: '/spy',
        icon: '🕵️',
        label: 'Spy de Competidores',
        desc: 'Pegá el copy de un anuncio que viste corriendo. La IA analiza qué hace funcionar ese ad y te da 3 versiones mejoradas para vos.',
        cta: 'Analizar ad rival →',
      },
      {
        href: '/nicho',
        icon: '🎯',
        label: 'Análisis de Nicho',
        desc: 'Profundizá en el potencial del mercado: tamaño, competencia, estacionalidad y mejores ángulos para Paraguay.',
        cta: 'Analizar nicho →',
      },
    ],
  },
  {
    id: 'validar',
    numero: 2,
    titulo: 'Validá antes de invertir',
    subtitulo: '14 criterios que separan los productos ganadores de los que queman presupuesto.',
    emoji: '✅',
    color: 'text-teal-400',
    borderColor: 'border-teal-500/30',
    bgColor: 'bg-teal-500/5',
    dotColor: 'bg-teal-500',
    tip: '💡 Si el producto no pasa 10 de 14 criterios, no lo lances. El mercado ya te está diciendo que no.',
    siguiente: 'conocer',
    steps: [
      {
        href: '/validador-producto',
        icon: '✅',
        label: 'Validador COD',
        desc: '14 criterios específicos para dropshipping COD en Paraguay. Urgencia, margen, competencia, facilidad de entrega.',
        badge: '🔑 Crítico',
        cta: 'Validar producto →',
      },
      {
        href: '/precios-psicologicos',
        icon: '💰',
        label: 'Precios Psicológicos',
        desc: 'Calculá el precio exacto que maximiza la tasa de conversión sin destruir el margen.',
        cta: 'Calcular precio →',
      },
      {
        href: '/rentabilidad',
        icon: '📊',
        label: 'Calculadora de Rentabilidad',
        desc: 'ROAS mínimo, ganancia real por venta y proyección mensual. Sabé exactamente cuánto necesitás vender.',
        cta: 'Calcular margen →',
      },
    ],
  },
  {
    id: 'conocer',
    numero: 3,
    titulo: 'Conocé a tu comprador',
    subtitulo: 'El 80% de los ads que no convierten fallan porque le hablan a la persona equivocada.',
    emoji: '👤',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/5',
    dotColor: 'bg-blue-500',
    tip: '💡 No vendas el producto. Vendé la transformación que siente el comprador cuando lo recibe.',
    siguiente: 'construir',
    steps: [
      {
        href: '/buyer-persona',
        icon: '👤',
        label: 'Buyer Persona',
        desc: 'Perfil completo del comprador: quién es, qué miedos tiene, por qué compra, qué palabras usa. Los ángulos de copy salen de acá.',
        badge: '⭐ Fundamental',
        cta: 'Crear buyer persona →',
      },
      {
        href: '/sourcing',
        icon: '📦',
        label: 'Sourcing y Posicionamiento',
        desc: 'Cómo diferenciarte de otros que venden lo mismo. El posicionamiento correcto triplica la tasa de conversión.',
        cta: 'Ver estrategia →',
      },
    ],
  },
  {
    id: 'construir',
    numero: 4,
    titulo: 'Construí el arsenal de venta',
    subtitulo: 'Todo el contenido que necesitás listo para publicar: copies, guiones, emails, WhatsApp y landing.',
    emoji: '⚡',
    color: 'text-violet-400',
    borderColor: 'border-violet-500/30',
    bgColor: 'bg-violet-500/5',
    dotColor: 'bg-violet-500',
    tip: '💡 Lanzá con mínimo 4 copies diferentes. El algoritmo necesita variedad para encontrar al comprador ideal.',
    siguiente: 'lanzar',
    steps: [
      {
        href: '/campana',
        icon: '⚡',
        label: 'Campaña Completa',
        desc: 'El módulo más poderoso: genera copies + guiones UGC + emails + WhatsApp + audiencias + estrategia Meta en un solo paso.',
        badge: '🚀 Todo en uno',
        cta: 'Crear campaña →',
      },
      {
        href: '/lanzar',
        icon: '🚀',
        label: 'Lanzar Producto',
        desc: 'Flujo rápido para tener todo listo en 60 minutos: ficha del producto, primer ad y checklist de lanzamiento.',
        cta: 'Lanzar rápido →',
      },
      {
        href: '/oferta',
        icon: '💎',
        label: 'Constructor de Oferta',
        desc: 'Armá el stack de oferta irresistible: precio ancla, bono de urgencia, garantía y bundle. Sube el ticket sin gastar más en ads.',
        badge: '🆕 Nuevo',
        cta: 'Construir oferta →',
      },
      {
        href: '/landing',
        icon: '🌐',
        label: 'Landing Page',
        desc: 'Estructura completa + copy persuasivo + prompt para Lovable.dev. Tener landing propia multiplica el ROAS.',
        cta: 'Crear landing →',
      },
      {
        href: '/checkout-dropi',
        icon: '🛒',
        label: 'Checkout Dropi',
        desc: 'Ficha completa para cargar en Dropi: título, descripción, FAQ, garantía y CTA optimizados.',
        cta: 'Optimizar checkout →',
      },
      {
        href: '/contenido-imagen',
        icon: '🖼️',
        label: 'Contenido de Imagen',
        desc: 'Prompts específicos para Gemini/Midjourney con los ángulos exactos. El creativo visual que para el scroll.',
        cta: 'Generar prompts →',
      },
    ],
  },
  {
    id: 'lanzar',
    numero: 5,
    titulo: 'Lanzá la campaña',
    subtitulo: 'Configuración técnica, checklist pre-lanzamiento y primera semana de testeo.',
    emoji: '🎯',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-500/5',
    dotColor: 'bg-emerald-500',
    tip: '💡 Los primeros 3 días NO toques nada. El algoritmo necesita tiempo para aprender. Decisiones a partir del día 4.',
    siguiente: 'gestionar',
    steps: [
      {
        href: '/meta-ads-pro',
        icon: '📘',
        label: 'Meta Ads Pro',
        desc: 'Guía completa de configuración: estructura CBO/ABO, fase de aprendizaje, Pixel para Dropi y errores comunes.',
        badge: '📚 Leer primero',
        cta: 'Ver guía →',
      },
      {
        href: '/creativos/andromeda',
        icon: '🌌',
        label: 'Ándrómeda — UGC Creator',
        desc: 'Guiones profesionales para que el creador grabe. Listos para enviar con briefing completo.',
        cta: 'Crear guiones UGC →',
      },
      {
        href: '/testimonios',
        icon: '⭐',
        label: 'Testimonios y Social Proof',
        desc: 'Testimonios realistas en dialecto paraguayo para los primeros creativos, más plantilla para pedir reseñas reales.',
        cta: 'Generar testimonios →',
      },
      {
        href: '/presupuesto-escalado',
        icon: '💹',
        label: 'Plan de Presupuesto',
        desc: 'Cuánto poner en testeo, cuánto en escalar y cuándo mover el dinero. Con tus números actuales.',
        cta: 'Planificar presupuesto →',
      },
    ],
  },
  {
    id: 'gestionar',
    numero: 6,
    titulo: 'Gestioná en tiempo real',
    subtitulo: 'Los números del día, decisiones urgentes y seguimiento de pedidos COD.',
    emoji: '📊',
    color: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    bgColor: 'bg-orange-500/5',
    dotColor: 'bg-orange-500',
    tip: '💡 Si el ROAS cae más del 30% vs la semana anterior por 2 días seguidos → refrescá el creativo AHORA.',
    siguiente: 'escalar',
    steps: [
      {
        href: '/dashboard-pl',
        icon: '💰',
        label: 'Dashboard P&L',
        desc: 'Ingresos del día, gasto en ads, ganancia bruta, margen neto y proyección del mes — todo en tiempo real.',
        badge: '🆕 Nuevo',
        cta: 'Ver P&L →',
      },
      {
        href: '/war-room',
        icon: '🔴',
        label: 'War Room',
        desc: 'Cargá el estado de tus campañas. La IA te dice qué pausar, qué escalar y cuánto dinero dejás sobre la mesa hoy.',
        badge: '📅 Revisar a diario',
        cta: 'Abrir War Room →',
      },
      {
        href: '/kpis',
        icon: '📊',
        label: 'Dashboard de KPIs',
        desc: 'ROAS, CPA, tasa de entrega y margen neto real. Los 5 números que importan cada día.',
        cta: 'Ver KPIs →',
      },
      {
        href: '/pedidos',
        icon: '📦',
        label: 'Pedidos COD',
        desc: 'Seguimiento de todos los pedidos: pendientes, en camino, entregados, devueltos. Calculá la tasa de entrega real.',
        cta: 'Ver pedidos →',
      },
      {
        href: '/alertas',
        icon: '🔔',
        label: 'Alertas Proactivas',
        desc: 'El sistema detecta automáticamente cuando el ROAS cae, la frecuencia sube o pasan días sin generar copies nuevos.',
        cta: 'Ver alertas →',
      },
      {
        href: '/meta-tracker',
        icon: '📘',
        label: 'Análisis CSV Meta Ads',
        desc: 'Subí el CSV de Meta Ads Manager. La IA analiza cada anuncio y te dice qué escalar, qué pausar y qué matar.',
        cta: 'Subir CSV →',
      },
    ],
  },
  {
    id: 'escalar',
    numero: 7,
    titulo: 'Escalá sin límite',
    subtitulo: 'Una vez que encontraste el producto ganador, estos son los pasos para multiplicar los ingresos.',
    emoji: '🚀',
    color: 'text-pink-400',
    borderColor: 'border-pink-500/30',
    bgColor: 'bg-pink-500/5',
    dotColor: 'bg-pink-500',
    tip: '💡 Escalar no es solo subir el presupuesto. Es duplicar lo que funciona: mismo producto, más audiencias, más creativos.',
    steps: [
      {
        href: '/autopilot',
        icon: '🤖',
        label: 'Modo Autopilot',
        desc: 'Definí reglas automáticas: si ROAS > X por N días → escalar Y%. Si ROAS < Z → pausar y notificar. La app actúa sola.',
        badge: '🆕 Nuevo',
        cta: 'Activar autopilot →',
      },
      {
        href: '/matriz-creativos',
        icon: '🔢',
        label: 'Matriz Creativos',
        desc: 'Tablero visual Ángulo × Audiencia. Ve exactamente qué combinaciones testeaste y cuáles gaps tienen más potencial.',
        badge: '🆕 Nuevo',
        cta: 'Ver matriz →',
      },
      {
        href: '/upsell',
        icon: '💎',
        label: 'Upsell & Bundles',
        desc: 'Sistema de upsell post-compra. Cada pedido tiene potencial de +30-50% de ticket sin gastar más en ads.',
        cta: 'Crear upsell →',
      },
      {
        href: '/retencion',
        icon: '🔄',
        label: 'Motor de Retención',
        desc: 'Emails + WhatsApp post-entrega automáticos. Pedido de reseñas, oferta de re-compra y reactivación de clientes inactivos.',
        badge: '🆕 Nuevo',
        cta: 'Activar retención →',
      },
      {
        href: '/portfolio',
        icon: '📋',
        label: 'Portfolio de Productos',
        desc: 'Vista global de todos tus productos: estado, ROAS por producto y margen neto del portfolio completo.',
        cta: 'Ver portfolio →',
      },
      {
        href: '/ab-tracker',
        icon: '🧪',
        label: 'A/B Tracker',
        desc: 'Registrá métricas de cada variante de copy. La IA detecta el ganador y genera automáticamente 3 variaciones del ángulo que funciona.',
        cta: 'Abrir A/B tracker →',
      },
      {
        href: '/copy-intelligence',
        icon: '🧠',
        label: 'Copy Intelligence',
        desc: 'La IA analiza el historial completo de tus campañas y detecta qué frameworks, ángulos y hooks tienen el mejor ROAS histórico.',
        cta: 'Ver inteligencia →',
      },
      {
        href: '/postmortem',
        icon: '💀',
        label: 'Post-mortem de Campaña',
        desc: 'Análisis brutal de campañas que terminaron. Qué falló, qué funcionó y cómo aplicarlo en la próxima.',
        cta: 'Hacer post-mortem →',
      },
    ],
  },
]

// ─── Componente principal ─────────────────────────────────
export default function FlujoPage() {
  const [activeStage, setActiveStage] = useState<StageId>('encontrar')
  const [completedStages, setCompletedStages] = useState<Set<StageId>>(new Set())
  const [userLevel, setUserLevel] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Leer nivel del usuario desde Supabase profiles
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('meta_level').eq('id', user.id).single().then(({ data }) => {
          if (data?.meta_level) setUserLevel(data.meta_level)
        })
      }
    })
    // Recuperar stages completados del localStorage
    try {
      const saved = localStorage.getItem('flujo_completed')
      if (saved) setCompletedStages(new Set(JSON.parse(saved)))
    } catch {}
  }, [])

  const markComplete = (stageId: StageId) => {
    setCompletedStages(prev => {
      const next = new Set(prev)
      next.add(stageId)
      localStorage.setItem('flujo_completed', JSON.stringify([...next]))
      return next
    })
  }

  const stage = STAGES.find(s => s.id === activeStage)!
  const currentIndex = STAGES.findIndex(s => s.id === activeStage)

  const lc = 'block text-xs text-white/40 mb-1.5'

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <Link href="/inicio" className="text-white/30 hover:text-white/60 text-sm flex items-center gap-1.5 mb-4 transition-colors">← Inicio</Link>
          <h1 className="text-2xl font-bold text-white">🗺️ Flujo completo de ventas</h1>
          <p className="text-white/40 text-sm mt-1">El camino exacto de cero a escalar — en orden lógico</p>
        </div>

        {/* Progress bar */}
        <div className="card p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Tu progreso</p>
            <p className="text-xs text-white/30">{completedStages.size}/{STAGES.length} etapas</p>
          </div>
          <div className="flex gap-1.5">
            {STAGES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveStage(s.id)}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  completedStages.has(s.id)
                    ? 'bg-emerald-500'
                    : activeStage === s.id
                    ? 'bg-violet-500'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-1.5 mt-2">
            {STAGES.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveStage(s.id)}
                className="flex-1 text-center"
              >
                <span className={`text-[9px] font-bold uppercase transition-all ${
                  activeStage === s.id ? 'text-violet-300' : 'text-white/15'
                }`}>{s.numero}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stage nav — pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {STAGES.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveStage(s.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap text-xs font-semibold border transition-all flex-shrink-0 ${
                activeStage === s.id
                  ? `${s.borderColor} ${s.bgColor} ${s.color}`
                  : completedStages.has(s.id)
                  ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                  : 'border-white/8 text-white/35 hover:text-white/60 hover:border-white/15'
              }`}
            >
              <span>{completedStages.has(s.id) ? '✓' : s.emoji}</span>
              <span>{s.numero}. {s.titulo.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Stage content */}
        <div className={`card p-5 mb-4 border ${stage.borderColor} ${stage.bgColor}`}>
          <div className="flex items-start gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${stage.bgColor} border ${stage.borderColor}`}>
              {stage.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${stage.color}`}>Etapa {stage.numero} de {STAGES.length}</span>
              </div>
              <h2 className="text-white font-bold text-lg leading-tight">{stage.titulo}</h2>
              <p className="text-white/50 text-sm mt-1 leading-relaxed">{stage.subtitulo}</p>
            </div>
          </div>

          {/* Tip del experto */}
          <div className="p-3 rounded-xl bg-white/3 border border-white/8 mb-4">
            <p className="text-white/60 text-xs leading-relaxed">{stage.tip}</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2.5 mb-5">
          {stage.steps.map((step, i) => (
            <Link
              key={step.href}
              href={step.href}
              className={`card p-4 flex items-start gap-3 border border-white/8 hover:border-white/20 hover:-translate-y-0.5 transition-all rounded-2xl`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${stage.bgColor} border ${stage.borderColor}`}>
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="text-white font-semibold text-sm">{step.label}</p>
                  {step.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-medium">{step.badge}</span>
                  )}
                </div>
                <p className="text-white/40 text-xs leading-relaxed">{step.desc}</p>
              </div>
              <span className="text-white/20 text-sm flex-shrink-0 mt-1">→</span>
            </Link>
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {currentIndex > 0 && (
            <button
              onClick={() => setActiveStage(STAGES[currentIndex - 1].id)}
              className="btn-secondary flex-1 py-3 text-sm"
            >
              ← Etapa anterior
            </button>
          )}

          {!completedStages.has(activeStage) && (
            <button
              onClick={() => {
                markComplete(activeStage)
                if (stage.siguiente) setActiveStage(stage.siguiente)
              }}
              className="btn-primary flex-1 py-3 text-sm"
            >
              Marcar como completada {stage.siguiente ? '→' : '🎉'}
            </button>
          )}

          {completedStages.has(activeStage) && currentIndex < STAGES.length - 1 && (
            <button
              onClick={() => setActiveStage(STAGES[currentIndex + 1].id)}
              className="btn-primary flex-1 py-3 text-sm"
            >
              Siguiente etapa →
            </button>
          )}
        </div>

        {/* All done */}
        {completedStages.size === STAGES.length && (
          <div className="card p-5 border border-emerald-500/30 bg-emerald-500/5 mt-5 text-center">
            <p className="text-3xl mb-2">🎉</p>
            <p className="text-emerald-300 font-bold mb-1">¡Completaste el flujo completo!</p>
            <p className="text-white/50 text-sm mb-4">Ya tenés todas las herramientas para operar como un profesional.</p>
            <Link href="/war-room" className="btn-primary text-sm px-6 py-3 inline-block">
              Ir al War Room →
            </Link>
          </div>
        )}

        {/* Quick jump */}
        <div className="mt-6 pt-5 border-t border-white/8">
          <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-3">Salto rápido a cualquier etapa</p>
          <div className="grid grid-cols-2 gap-2">
            {STAGES.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveStage(s.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeStage === s.id
                    ? `${s.borderColor} ${s.bgColor}`
                    : 'border-white/8 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{completedStages.has(s.id) ? '✅' : s.emoji}</span>
                  <div>
                    <p className={`text-xs font-bold ${activeStage === s.id ? s.color : 'text-white/60'}`}>{s.numero}. {s.titulo}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
