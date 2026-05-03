import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { createServerComponentClient } from '@/lib/supabase-server'

const SECCIONES = [
  {
    titulo: '📊 Panel de números',
    desc: 'Tus KPIs consolidados de un vistazo',
    items: [
      {
        href: '/dashboard-pl',
        icon: '💰',
        bg: 'bg-gradient-to-br from-emerald-600 to-teal-600',
        titulo: 'Dashboard P&L',
        desc: 'Ingresos del día, gasto en ads, ganancia bruta y margen neto en tiempo real. El número que importa.',
        badge: '🆕 Nuevo',
      },
      {
        href: '/kpis',
        icon: '📊',
        bg: 'bg-gradient-to-br from-violet-600 to-indigo-600',
        titulo: 'Dashboard de KPIs',
        desc: 'ROAS, CPA, tasa de entrega, margen neto real y pedidos — los 5 números que importan hoy.',
      },
      {
        href: '/alertas',
        icon: '🔔',
        bg: 'bg-amber-600',
        titulo: 'Alertas Proactivas',
        desc: 'Detectá automáticamente si tu CPA subió, si hay días sin generar o si la tasa de entrega bajó.',
      },
      {
        href: '/autopilot',
        icon: '🤖',
        bg: 'bg-gradient-to-br from-violet-700 to-purple-800',
        titulo: 'Modo Autopilot',
        desc: 'Reglas automáticas: si ROAS > X escalar, si ROAS < Y pausar. La app actúa mientras vos descansás.',
        badge: '🆕 Nuevo',
      },
    ],
  },
  {
    titulo: '🔴 Decisiones urgentes',
    desc: 'Revisá esto todos los días',
    items: [
      {
        href: '/war-room',
        icon: '⚡',
        bg: 'bg-red-600',
        titulo: 'War Room',
        desc: 'Cargá el estado de tus campañas y la IA te dice exactamente qué pausar, qué escalar y cuánto ganás o perdés hoy.',
        badge: '📅 Revisar a diario',
      },
      {
        href: '/meta-tracker',
        icon: '📘',
        bg: 'bg-blue-600',
        titulo: 'Resultados Meta Ads',
        desc: 'Subí el archivo CSV de Meta Ads Manager. La IA analiza cada anuncio y dice cuál escalar, cuál pausar y cuál matar.',
        badge: '📁 Subir CSV',
        guia: '/meta-tracker/guia',
      },
      {
        href: '/tiktok-tracker',
        icon: '🎵',
        bg: 'bg-pink-600',
        titulo: 'Resultados TikTok',
        desc: 'Subí el CSV de TikTok Ads. Detecta los videos con potencial de Spark Ad y cuáles escalar.',
        badge: '📁 Subir CSV',
        guia: '/tiktok-tracker/guia',
      },
    ],
  },
  {
    titulo: '📦 Pedidos y post-venta',
    desc: 'Lo que pasa después de la venta',
    items: [
      {
        href: '/portfolio',
        icon: '📋',
        bg: 'bg-gradient-to-br from-violet-600 to-purple-700',
        titulo: 'Portfolio de Productos',
        desc: 'Vista global de todos tus productos activos: estado (testeando/escalando/pausado), ROAS por producto y margen neto del portfolio.',
      },
      {
        href: '/pedidos',
        icon: '📦',
        bg: 'bg-teal-600',
        titulo: 'Pedidos COD',
        desc: 'Seguimiento de pedidos en tiempo real: pendientes, en camino, entregados, devueltos. Tasa de entrega real.',
      },
      {
        href: '/retencion',
        icon: '🔄',
        bg: 'bg-gradient-to-br from-teal-600 to-emerald-700',
        titulo: 'Motor de Retención',
        desc: 'Secuencias post-entrega automáticas, pedido de reseñas y reactivación de clientes. Multiplicá el LTV.',
        badge: '🆕 Nuevo',
      },
      {
        href: '/cro',
        icon: '🔬',
        bg: 'bg-gradient-to-br from-blue-600 to-cyan-600',
        titulo: 'Analizador CRO',
        desc: 'Score de tu landing page + las 3 mejoras de mayor impacto en conversión. Diagnóstico con IA.',
        badge: '🆕 Nuevo',
      },
    ],
  },
  {
    titulo: '💰 Números y rentabilidad',
    desc: 'Calculá antes de invertir',
    items: [
      {
        href: '/rentabilidad',
        icon: '💰',
        bg: 'bg-emerald-600',
        titulo: 'Calculadora de Rentabilidad',
        desc: 'Antes de lanzar una campaña: calculá el ROAS que necesitás, la ganancia por venta y la proyección en 3 escenarios.',
      },
      {
        href: '/presupuesto-escalado',
        icon: '📈',
        bg: 'bg-gradient-to-br from-emerald-600 to-teal-600',
        titulo: 'Presupuesto de Escalado',
        desc: 'Tenés Gs. X — ¿cómo los distribuís entre testeo y escalado? Calculadora con señales de cuándo mover el dinero.',
        },
      {
        href: '/ab-tracker',
        icon: '◎',
        bg: 'bg-violet-600',
        titulo: 'Test A/B activos',
        desc: 'Seguimiento de tus anuncios en prueba. Cuando el ganador se detecta, genera 3 variaciones automáticamente.',
      },
      {
        href: '/matriz-creativos',
        icon: '🔢',
        bg: 'bg-gradient-to-br from-violet-700 to-indigo-700',
        titulo: 'Matriz de Creativos',
        desc: 'Tablero visual Ángulo × Audiencia. Mirá exactamente qué combinaciones testeaste y cuáles gaps quedan.',
        badge: '🆕 Nuevo',
      },
    ],
  },
  {
    titulo: '🧠 Inteligencia acumulada',
    desc: 'La app aprende de tu historial',
    items: [
      {
        href: '/copy-intelligence',
        icon: '🧠',
        bg: 'bg-purple-700',
        titulo: 'Copy Intelligence',
        desc: 'Analiza todos tus resultados históricos y te dice qué framework, ángulo y hook convierte más para tus productos.',
      },
      {
        href: '/hooks-biblioteca',
        icon: '🎣',
        bg: 'bg-indigo-600',
        titulo: 'Biblioteca de Hooks',
        desc: 'Guardá, votá y filtrá los hooks que más convirtieron. Tu banco de hooks ganadores acumulado con el tiempo.',
        },
      {
        href: '/comparador-copies',
        icon: '🆚',
        bg: 'bg-violet-700',
        titulo: 'Comparador de Copies',
        desc: 'Pegá varios copies y la IA te dice cuál lanzar primero, puntuando hook, beneficio, urgencia y nivel de conciencia.',
        },
      {
        href: '/postmortem',
        icon: '🔬',
        bg: 'bg-slate-700',
        titulo: 'Post-mortem de Campaña',
        desc: 'Cuando termina una campaña, analizá qué pasó. Lecciones que alimentan Copy Intelligence automáticamente.',
        },
    ],
  },
  {
    titulo: '📂 Historial y archivos',
    desc: 'Todo lo que generaste guardado',
    items: [
      {
        href: '/historial',
        icon: '🕐',
        bg: 'bg-white/10',
        titulo: 'Historial de generaciones',
        desc: 'Todo lo que generaste. Podés volver a verlo, copiarlo o usarlo como base para la próxima campaña.',
      },
      {
        href: '/biblioteca',
        icon: '🗂️',
        bg: 'bg-white/10',
        titulo: 'Biblioteca de prompts',
        desc: 'Tus mejores prompts guardados y destacados para reusar rápido.',
      },
      {
        href: '/exportar',
        icon: '📄',
        bg: 'bg-white/10',
        titulo: 'Exportar a PDF',
        desc: 'Descargá cualquier generación en PDF para compartir o imprimir.',
      },
    ],
  },
  {
    titulo: '📊 Herramientas de análisis v6',
    desc: 'Optimización y decisiones con datos reales',
    items: [
      {
        href: '/roas-simulator',
        icon: '🎯',
        bg: 'bg-gradient-to-br from-violet-600 to-purple-700',
        titulo: 'Simulador ROAS Break-Even',
        desc: 'Calculá cuánto podés gastar y cuántas ventas necesitás para ser rentable cada día. PY, CO y MX.',
        badge: '🆕 Nuevo',
      },
      {
        href: '/logistica-cod',
        icon: '🗺️',
        bg: 'bg-gradient-to-br from-teal-600 to-emerald-700',
        titulo: 'Logística COD por Ciudad',
        desc: 'Tasa de entrega real por ciudad. Sabé dónde escalar el targeting y dónde cortar.',
        badge: '🆕 Nuevo',
      },
      {
        href: '/copy-scorer',
        icon: '📊',
        bg: 'bg-gradient-to-br from-cyan-600 to-blue-600',
        titulo: 'Copy Scorer IA',
        desc: 'Score 0-100 de cualquier copy en 10 dimensiones con mejoras concretas y versión mejorada incluida.',
        badge: '🆕 Nuevo',
      },
    ],
  },
]

type GestionItem = typeof SECCIONES[0]['items'][0] & { guia?: string }
function ItemCard({ item }: { item: GestionItem }) {
  return (
    <div className="relative">
    <Link href={item.href}
      className="card border border-white/8 hover:border-white/20 rounded-2xl p-4 flex items-start gap-3 transition-all hover:-translate-y-0.5 block">
      <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center text-white text-xl flex-shrink-0`}>
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <p className="text-white font-semibold text-sm">{item.titulo}</p>
          {item.badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">{item.badge}</span>}
        </div>
        <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
      </div>
      <span className="text-white/20 text-sm flex-shrink-0 mt-0.5">→</span>
    </Link>
    {(item as any).guia && (
      <a href={(item as any).guia} className="absolute bottom-3 left-16 text-[10px] text-blue-400 hover:text-blue-300 font-bold transition-colors">📖 Ver guía de descarga →</a>
    )}
    </div>
  )
}

export const dynamic = 'force-dynamic'
export default async function GestionarPage() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('name').eq('id', user?.id).single()

  return (
    <div className="min-h-screen">
      <Link href="/inicio" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar userName={profile?.name} />
      <main className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">📊 Gestionar campañas</h1>
          <p className="text-white/40 text-sm mt-1">Tus números, tus resultados y tus decisiones del día</p>
        </div>

        <div className="space-y-6">
          {SECCIONES.map(s => (
            <div key={s.titulo}>
              <div className="flex items-start gap-2 mb-3 pb-3 border-b border-white/8">
                <div>
                  <p className="text-white font-bold text-sm">{s.titulo}</p>
                  <p className="text-white/30 text-xs">{s.desc}</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {s.items.map(item => <ItemCard key={item.href} item={item} />)}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
