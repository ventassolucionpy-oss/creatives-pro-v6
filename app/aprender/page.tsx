import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { createServerComponentClient } from '@/lib/supabase-server'

// ─── ESTRUCTURA COMPLETA DE APRENDIZAJE ─────────────────
// Organizada en el orden correcto del operador de dropshipping:
// Mentalidad → Research → Producto → Campaña → Optimizar → Escalar → Avanzado

const SECCIONES = [
  {
    titulo: '🗺️ El flujo completo',
    desc: 'Empezá aquí — el camino de cero a escalar en orden lógico',
    color: 'border-violet-500/25',
    items: [
      {
        href: '/flujo',
        icon: '🗺️',
        bg: 'bg-gradient-to-br from-violet-600 to-indigo-600',
        titulo: 'Flujo completo de ventas',
        desc: 'El mapa exacto paso a paso: encontrar producto → validar → lanzar → gestionar → escalar. Para Paraguay, Colombia y México.',
        badge: '⭐ Empezá acá',
        grande: true,
      },
    ],
  },
  {
    titulo: '🔍 Research y producto',
    desc: 'Cómo encontrar y validar un producto ganador antes de invertir un peso',
    color: 'border-amber-500/20',
    items: [
      {
        href: '/dropi',
        icon: '🌎',
        bg: 'bg-gradient-to-br from-red-600 to-orange-600',
        titulo: 'Cómo usar Dropi — Guía completa',
        desc: 'Cómo funciona el modelo COD, cómo encontrar productos con margen real, la calculadora de rentabilidad, y errores comunes al empezar.',
        badge: '🇵🇾🇨🇴🇲🇽',
      },
      {
        href: '/nicho',
        icon: '🎯',
        bg: 'bg-amber-600',
        titulo: 'Análisis de Nicho',
        desc: 'Score de potencial, análisis de competencia en Dropi, ángulos de venta por mercado y plan de acción concreto.',
      },
      {
        href: '/validador-producto',
        icon: '✅',
        bg: 'bg-teal-600',
        titulo: 'Validador COD — 14 criterios',
        desc: 'Los 14 criterios específicos para COD: logística Dropi, si vende sin video, si el mercado local lo acepta, y psicología de compra.',
        badge: '🛡️ Antes de invertir',
      },
      {
        href: '/sourcing',
        icon: '🔎',
        bg: 'bg-gradient-to-br from-amber-600 to-yellow-600',
        titulo: 'Sourcing de Productos',
        desc: 'Cómo comparar el mismo producto en Dropi PY vs CO vs MX. Márgenes, disponibilidad y qué mercado tiene menos competencia.',
      },
      {
        href: '/spy',
        icon: '🕵️',
        bg: 'bg-red-600',
        titulo: 'Spy & Clonar Anuncios',
        desc: 'Pegá el copy de un anuncio que viste corriendo. La IA analiza qué hace funcionar ese ad y te da 3 versiones mejoradas.',
      },
    ],
  },
  {
    titulo: '💰 Rentabilidad y precios',
    desc: 'Los números antes de lanzar — cómo saber si vas a ganar plata',
    color: 'border-emerald-500/20',
    items: [
      {
        href: '/rentabilidad',
        icon: '📊',
        bg: 'bg-emerald-600',
        titulo: 'Calculadora de Rentabilidad COD',
        desc: 'Margen real considerando flete de devoluciones, tasa de entrega real y gasto en ads. La calculadora que todo dropshipper debería usar.',
        badge: '💡 Fundamental',
      },
      {
        href: '/roas-simulator',
        icon: '🎯',
        bg: 'bg-gradient-to-br from-violet-600 to-purple-700',
        titulo: 'Simulador ROAS Break-Even',
        desc: 'Calculá exactamente cuánto podés gastar en ads y cuántas ventas necesitás para ser rentable cada día. Para PY, CO y MX.',
        badge: '🆕 Nuevo',
      },
      {
        href: '/precios-psicologicos',
        icon: '🧮',
        bg: 'bg-gradient-to-br from-violet-600 to-indigo-600',
        titulo: 'Precios Psicológicos',
        desc: 'El impacto real en conversión de Gs. 97k vs 157k vs 197k. Con benchmarks por categoría de producto y por país.',
      },
    ],
  },
  {
    titulo: '📣 Meta Ads — Estrategia y optimización',
    desc: 'Todo lo que necesitás saber para no quemar plata en Meta',
    color: 'border-blue-500/20',
    items: [
      {
        href: '/meta-ads-pro',
        icon: '⚙️',
        bg: 'bg-blue-700',
        titulo: 'Meta Ads Pro — Guía completa',
        desc: 'Pixel, CBO vs ABO, fase de aprendizaje, ROAS cae de golpe, fatiga de creativos, Lookalike, retargeting. Con números reales de cada país.',
        badge: '📖 Lectura obligatoria',
        grande: true,
      },
      {
        href: '/creativos/andromeda',
        icon: '✺',
        bg: 'bg-gradient-to-br from-violet-600 to-indigo-600',
        titulo: 'Método Andromeda — Escalado',
        desc: '3 fases: validar → escalar → dominar. Con KPIs exactos por fase y lógica de CBO para cuando tenés un ganador confirmado.',
        badge: '🚀 Avanzado',
      },
      {
        href: '/ab-tracker',
        icon: '🔬',
        bg: 'bg-gradient-to-br from-blue-600 to-cyan-600',
        titulo: 'A/B Testing — Qué testear y cómo',
        desc: 'Los únicos elementos que vale la pena testear (hooks, ángulos, ofertas). Cómo crear variantes sin romper la fase de aprendizaje.',
      },
      {
        href: '/matriz-creativos',
        icon: '🔢',
        bg: 'bg-gradient-to-br from-indigo-600 to-violet-600',
        titulo: 'Matriz de Creativos',
        desc: 'El sistema de ángulo × audiencia × formato para no quedarte sin ideas. Cuántos creativos necesitás por presupuesto.',
      },
    ],
  },
  {
    titulo: '🧠 Buyer Persona y Psicología de Venta',
    desc: 'Entendé a quién le vendés antes de escribir una sola palabra',
    color: 'border-pink-500/20',
    items: [
      {
        href: '/buyer-persona',
        icon: '👤',
        bg: 'bg-gradient-to-br from-pink-600 to-rose-600',
        titulo: 'Buyer Persona COD',
        desc: 'El perfil exacto de tu comprador en cada país: qué le duele, qué lo frena, cómo habla, cuándo compra y por qué compra COD.',
        badge: '🧠 Clave para copy',
      },
      {
        href: '/cro',
        icon: '🔬',
        bg: 'bg-gradient-to-br from-blue-600 to-cyan-600',
        titulo: 'CRO — Por qué no convertís',
        desc: 'Las 10 razones más comunes por las que tu landing no convierte. Score de tu página con recomendaciones específicas.',
      },
      {
        href: '/oferta',
        icon: '💎',
        bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
        titulo: 'Constructor de Oferta — Framework Hormozi',
        desc: 'Por qué la oferta importa más que el producto. Cómo construir una oferta irresistible con el método $100M Offers de Alex Hormozi.',
      },
    ],
  },
  {
    titulo: '📦 Operación COD — Logística y pedidos',
    desc: 'La parte del negocio que nadie enseña y donde más plata se pierde',
    color: 'border-teal-500/20',
    items: [
      {
        href: '/logistica-cod',
        icon: '🗺️',
        bg: 'bg-gradient-to-br from-teal-600 to-emerald-700',
        titulo: 'Logística COD por Ciudad',
        desc: 'Por qué la tasa de entrega varía por ciudad (Asunción 85% vs interior 60% vs Bogotá 72%). Cómo usarla para optimizar el targeting.',
        badge: '🆕 Nuevo',
      },
      {
        href: '/pedidos',
        icon: '📦',
        bg: 'bg-teal-600',
        titulo: 'Gestión de Pedidos — Qué hacer post-venta',
        desc: 'El flujo de seguimiento de pedido COD: confirmación, envío, entrega y qué hacer con rechazos para minimizar pérdidas.',
      },
      {
        href: '/retencion',
        icon: '🔄',
        bg: 'bg-gradient-to-br from-teal-600 to-emerald-700',
        titulo: 'Motor de Retención — LTV post-venta',
        desc: 'Cómo convertir una compra en múltiples compras. Secuencias post-entrega, pedido de reseñas y reactivación de clientes inactivos.',
      },
      {
        href: '/upsell',
        icon: '💎',
        bg: 'bg-gradient-to-br from-emerald-600 to-teal-600',
        titulo: 'Upsell & Bundles — +30% ticket promedio',
        desc: 'Los 5 tipos de upsell que funcionan en COD y cómo presentarlos sin perder la venta principal. Scripts listos para WhatsApp.',
      },
    ],
  },
  {
    titulo: '📱 WhatsApp — El canal #1 de venta',
    desc: 'En Paraguay, Colombia y México el 90%+ de ventas pasan por WhatsApp',
    color: 'border-green-500/20',
    items: [
      {
        href: '/whatsapp-flows',
        icon: '📲',
        bg: 'bg-gradient-to-br from-green-600 to-teal-600',
        titulo: 'Flujos WhatsApp Business — Los 6 flujos esenciales',
        desc: 'Lead nuevo, seguimiento sin respuesta, confirmación de pedido, post-entrega, recuperación de rechazado y upsell. Con respuestas a objeciones.',
        badge: '🆕 Nuevo',
      },
      {
        href: '/whatsapp-biz',
        icon: '🤖',
        bg: 'bg-green-600',
        titulo: 'WhatsApp Business — Configuración y bots',
        desc: 'Cómo configurar respuestas rápidas, etiquetas de clientes, catálogo de productos y flujos automáticos para vender 24/7.',
      },
      {
        href: '/whatsapp-ventas',
        icon: '💬',
        bg: 'bg-green-700',
        titulo: 'Scripts WhatsApp Humano',
        desc: 'Las 10 situaciones más frecuentes con respuestas listas: precio, calidad, si es original, cuánto tarda, cómo pagar. Sin improvisar.',
      },
    ],
  },
  {
    titulo: '📊 Analytics — Interpretar los números',
    desc: 'Los KPIs que sí importan y cómo tomar decisiones con ellos',
    color: 'border-violet-500/20',
    items: [
      {
        href: '/war-room',
        icon: '🔴',
        bg: 'bg-red-700',
        titulo: 'War Room — Cómo tomar decisiones de campaña',
        desc: 'Qué mirar todos los días, cuándo escalar, cuándo pausar y cuándo matar una campaña. Con el protocolo de decisión paso a paso.',
        badge: '🔴 Operación diaria',
      },
      {
        href: '/dashboard-pl',
        icon: '💰',
        bg: 'bg-emerald-700',
        titulo: 'P&L del día — Cómo leer tu rentabilidad real',
        desc: 'La diferencia entre el ROAS de Meta y la ganancia real. Cómo calcular el P&L correcto incluyendo rechazos, devoluciones y costos ocultos.',
      },
      {
        href: '/kpis',
        icon: '📈',
        bg: 'bg-blue-700',
        titulo: 'KPIs del Dropshipping COD',
        desc: 'Los 8 indicadores que todo operador COD debe monitorear: tasa entrega, CPA real, ROAS neto, frecuencia, CPM, CTR y ticket promedio.',
      },
      {
        href: '/copy-scorer',
        icon: '📊',
        bg: 'bg-gradient-to-br from-cyan-600 to-blue-600',
        titulo: 'Cómo evaluar un copy — Copy Scorer',
        desc: 'Los 10 criterios de un copy de alto rendimiento para Meta Ads COD. Aprende a autoevaluar tus textos antes de publicarlos.',
        badge: '🆕 Nuevo',
      },
    ],
  },
  {
    titulo: '🎬 Creativos y UGC',
    desc: 'El activo más valioso de tu operación — cómo producirlos y gestionarlos',
    color: 'border-rose-500/20',
    items: [
      {
        href: '/creativos/ugc-creator',
        icon: '🎬',
        bg: 'bg-rose-600',
        titulo: 'Guiones UGC — Cómo escribirlos',
        desc: 'La estructura del guion que convierte: hook en 3 segundos, problema, solución, prueba y CTA. Con plantillas por producto.',
      },
      {
        href: '/ugc-review',
        icon: '🌟',
        bg: 'bg-gradient-to-br from-rose-600 to-pink-600',
        titulo: 'UGC de Reviews — Cómo pedirlos a clientes',
        desc: 'Por qué un testimonio en video vale 10x un texto. Cómo pedir videos de reseña, qué instrucciones dar y cómo usarlos en ads.',
        badge: '🆕 Nuevo',
      },
      {
        href: '/creadores',
        icon: '🎭',
        bg: 'bg-gradient-to-br from-violet-600 to-rose-600',
        titulo: 'Gestión de Creadores UGC',
        desc: 'Cómo encontrar creadores, qué pagarles, cómo briefearlos y qué esperar. CRM integrado para gestionar todo desde un solo lugar.',
        badge: '🆕 Nuevo',
      },
      {
        href: '/creativo-visual',
        icon: '🎨',
        bg: 'bg-gradient-to-br from-pink-600 to-rose-600',
        titulo: 'Estrategia de Creativo Visual',
        desc: 'El formato que gana en 2025 (9:16 vs 1:1 vs 4:5), reglas de texto en imagen, composición y el checklist antes de publicar.',
      },
    ],
  },
  {
    titulo: '🔥 Ofertas y temporadas',
    desc: 'Cuándo y cómo multiplicar ventas con eventos especiales',
    color: 'border-orange-500/20',
    items: [
      {
        href: '/temporadas',
        icon: '📅',
        bg: 'bg-orange-500',
        titulo: 'Calendario de Temporadas — PY, CO, MX',
        desc: 'Las fechas más rentables del año en cada mercado: Black Friday, San Juan (PY), Buen Fin (MX), Amor y Amistad (CO) y más.',
      },
      {
        href: '/oferta-flash',
        icon: '⚡',
        bg: 'bg-gradient-to-br from-red-600 to-orange-500',
        titulo: 'Oferta Flash — Urgencia real en 48-72hs',
        desc: 'Cómo crear urgencia genuina (no falsa) que multiplica conversiones. Estructura de la oferta + WhatsApp + copy + script de cierre.',
        badge: '🆕 Nuevo',
      },
    ],
  },
  {
    titulo: '📣 Contenido orgánico',
    desc: 'Cómo crecer sin pagar ads y bajar el costo de adquisición',
    color: 'border-green-500/20',
    items: [
      {
        href: '/organico',
        icon: '🌱',
        bg: 'bg-green-600',
        titulo: 'Estrategia Orgánica — Instagram y Facebook',
        desc: 'Plan semanal de contenido, hooks para Reels, captions listos y hashtags por nicho. El orgánico reduce el CPM de tus ads pagos.',
      },
      {
        href: '/tiktok-shop',
        icon: '🛍️',
        bg: 'bg-gradient-to-br from-pink-600 to-red-500',
        titulo: 'TikTok Shop — Orgánico y Spark Ads',
        desc: 'La oportunidad más grande del momento en LATAM. Cómo aprovechar TikTok Shop antes de que se sature el mercado.',
        badge: '🔥 Oportunidad',
      },
      {
        href: '/calendario-contenido',
        icon: '📅',
        bg: 'bg-gradient-to-br from-green-600 to-teal-600',
        titulo: 'Calendario de Publicación',
        desc: 'Planificá y trazá tu plan semanal de contenido orgánico. Marcá lo publicado y monitoreá el progreso.',
      },
    ],
  },
]

type SeccionItem = {
  href: string
  icon: string
  bg: string
  titulo: string
  desc: string
  badge?: string
  grande?: boolean
}

function ItemCard({ item }: { item: SeccionItem }) {
  return (
    <Link href={item.href}
      className="card border border-white/8 hover:border-white/20 rounded-2xl p-4 flex items-start gap-3 transition-all hover:-translate-y-0.5">
      <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center text-white text-xl flex-shrink-0`}>
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <p className="text-white font-semibold text-sm">{item.titulo}</p>
          {item.badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-medium">{item.badge}</span>}
        </div>
        <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
      </div>
      <span className="text-white/20 text-sm flex-shrink-0 mt-0.5">→</span>
    </Link>
  )
}

export const dynamic = 'force-dynamic'
export default async function AprenderPage() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('name').eq('id', user?.id).single()

  return (
    <div className="min-h-screen">
      <Navbar userName={profile?.name} />
      <main className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <Link href="/inicio" className="text-white/30 hover:text-white/60 text-sm flex items-center gap-1.5 mb-4 transition-colors">← Inicio</Link>
          <h1 className="text-2xl font-bold text-white">📚 Estrategias y guías</h1>
          <p className="text-white/40 text-sm mt-1">El sistema completo de dropshipping COD — Paraguay · Colombia · México</p>
        </div>

        {/* Stats banner */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="card p-3 text-center rounded-xl border border-violet-500/20">
            <p className="text-lg font-bold text-violet-400">11</p>
            <p className="text-[10px] text-white/30">Módulos</p>
          </div>
          <div className="card p-3 text-center rounded-xl border border-amber-500/20">
            <p className="text-lg font-bold text-amber-400">40+</p>
            <p className="text-[10px] text-white/30">Guías</p>
          </div>
          <div className="card p-3 text-center rounded-xl border border-emerald-500/20">
            <p className="text-lg font-bold text-emerald-400">PY·CO·MX</p>
            <p className="text-[10px] text-white/30">Países</p>
          </div>
        </div>

        <div className="space-y-7">
          {SECCIONES.map(s => (
            <div key={s.titulo}>
              <div className={`flex items-start gap-2 mb-3 pb-3 border-b ${s.color}`}>
                <div>
                  <p className="text-white font-bold text-sm">{s.titulo}</p>
                  <p className="text-white/30 text-xs">{s.desc}</p>
                </div>
              </div>
              <div className={`grid gap-2.5 ${s.items[0]?.grande ? 'grid-cols-1' : 'grid-cols-1'}`}>
                {s.items.map(item => <ItemCard key={item.href} item={item} />)}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 p-4 card border border-violet-500/20 bg-violet-500/5 rounded-2xl">
          <p className="text-violet-300 font-bold text-sm mb-1">💡 Consejo de operador</p>
          <p className="text-white/50 text-xs leading-relaxed">
            No tratés de aprender todo de una. El orden correcto es: Flujo → Dropi → Rentabilidad → Campana Completa → War Room diario. Con esos 5 dominados, ya estás en el top 10% de dropshippers en LATAM.
          </p>
          <Link href="/flujo" className="mt-3 inline-flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 font-medium">
            Ir al flujo completo →
          </Link>
        </div>
      </main>
    </div>
  )
}
