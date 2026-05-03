import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { createServerComponentClient } from '@/lib/supabase-server'

const SECCIONES = [
  {
    titulo: '⚡ Empezar aquí',
    desc: 'El flujo completo para lanzar un producto',
    color: 'border-violet-500/20',
    items: [
      {
        href: '/campana',
        icon: '⚡',
        bg: 'bg-gradient-to-br from-violet-600 to-indigo-600',
        titulo: 'Campaña Completa',
        desc: 'Genera TODO de una vez: copies, guiones de video, emails, WhatsApp y audiencias. El módulo más poderoso.',
        badge: '⭐ Empezá acá',
        grande: true,
      },
      {
        href: '/lanzar',
        icon: '🚀',
        bg: 'bg-gradient-to-br from-emerald-600 to-teal-600',
        titulo: 'Lanzar producto nuevo',
        desc: 'Tenés un producto nuevo y querés lanzarlo hoy. En 10 minutos tenés todo listo.',
        badge: '🚀 Rápido',
        grande: true,
      },
    ],
  },
  {
    titulo: '📣 Anuncios',
    desc: 'Contenido para publicar en Meta Ads y TikTok',
    color: 'border-blue-500/15',
    items: [
      { href: '/creativos/ugc/anuncios', icon: '✦', bg: 'bg-violet-600', titulo: 'Anuncios UGC', desc: '5 copies listos para Facebook e Instagram con todos los frameworks.' },
      { href: '/creativos/meta-ads', icon: '⊞', bg: 'bg-blue-600', titulo: 'Estrategia Meta Ads', desc: 'Estructura completa de campaña: segmentación, copies y presupuesto.' },
      { href: '/creativos/tiktok', icon: '◈', bg: 'bg-pink-600', titulo: 'Scripts TikTok', desc: 'Guiones para videos en TikTok Ads con hooks y CTAs que funcionan.' },
      { href: '/tiktok-shop', icon: '🛍️', bg: 'bg-gradient-to-br from-pink-600 to-red-500', titulo: 'TikTok Shop Completo', desc: 'Orgánico + Spark Ads + Live Shopping + 5 guiones de video.' },
    ],
  },
  {
    titulo: '🎬 Contenido de Video',
    desc: 'Guiones para creadores UGC y Reels',
    color: 'border-pink-500/15',
    items: [
      { href: '/creativos/ugc-creator', icon: '🎬', bg: 'bg-rose-600', titulo: 'Guiones UGC', desc: 'Guiones profesionales para que el creador grabe. Listos para enviar.' },
      { href: '/organico', icon: '🌱', bg: 'bg-green-600', titulo: 'Contenido Orgánico', desc: 'Plan semanal para Instagram y Facebook. Captions listos para copiar.' },
      { href: '/creadores', icon: '🎭', bg: 'bg-gradient-to-br from-violet-600 to-rose-600', titulo: 'CRM Creadores UGC', desc: 'Gestioná tus creadores, asignales guiones y seguí su rendimiento.', badge: '🆕 Nuevo' },
    ],
  },
  {
    titulo: '🌐 Venta y Conversión',
    desc: 'Landing pages, emails y WhatsApp',
    color: 'border-emerald-500/15',
    items: [
      { href: '/oferta', icon: '💎', bg: 'bg-gradient-to-br from-amber-500 to-orange-600', titulo: 'Constructor de Oferta', desc: 'Stack de oferta irresistible: precio ancla, bonos, garantía, urgencia. Framework Hormozi.', badge: '🆕 Nuevo' },
      { href: '/landing', icon: '🏠', bg: 'bg-gradient-to-br from-violet-600 to-indigo-600', titulo: 'Landing Page para Lovable', desc: 'Estructura completa + copy + prompt para Lovable.dev + briefing de video UGC.' },
      { href: '/cro', icon: '🔬', bg: 'bg-gradient-to-br from-blue-600 to-cyan-600', titulo: 'Analizador CRO', desc: 'Score de tu landing + las 3 mejoras que más impactan la conversión. Análisis con IA.', badge: '🆕 Nuevo' },
      { href: '/email-flows', icon: '📧', bg: 'bg-emerald-600', titulo: 'Emails Automáticos', desc: 'Carrito abandonado, bienvenida, upsell y reactivación. Listos para Mailchimp.' },
      { href: '/whatsapp-biz', icon: '📱', bg: 'bg-green-600', titulo: 'WhatsApp Business (Bots)', desc: 'Flujos automáticos de venta y atención por WhatsApp. El canal #1 en Paraguay.' },
      { href: '/whatsapp-ventas', icon: '💬', bg: 'bg-green-700', titulo: 'Scripts WhatsApp Humano', desc: 'Las 10 situaciones más comunes (precio, calidad, entrega, objeciones) — respuestas listas.' },
      { href: '/contenido-imagen', icon: '🖼️', bg: 'bg-gradient-to-br from-fuchsia-600 to-pink-700', titulo: 'Contenido de Imagen', desc: 'Prompts ultra-específicos para Gemini Banana Pro — 5 variantes por ángulo con ratio correcto para Meta Ads.' },
      { href: '/creativo-visual', icon: '🎨', bg: 'bg-gradient-to-br from-pink-600 to-rose-600', titulo: 'Estrategia de Creativo Visual', desc: 'Estrategia visual completa: formato ganador, composición, texto superpuesto y checklist antes de publicar.' },
      { href: '/retencion', icon: '🔄', bg: 'bg-gradient-to-br from-teal-600 to-emerald-700', titulo: 'Motor de Retención', desc: 'Secuencias post-entrega, pedido de reseñas y reactivación de clientes inactivos para multiplicar el LTV.', badge: '🆕 Nuevo' },
      { href: '/customer-service', icon: '🎧', bg: 'bg-teal-600', titulo: 'Atención al Cliente', desc: 'Respuestas para cada situación: quejas, devoluciones, upsell. Copiar y pegar.' },
      { href: '/whatsapp-flows', icon: '📲', bg: 'bg-gradient-to-br from-green-600 to-teal-600', titulo: 'Flujos WhatsApp Business', desc: '6 flujos completos: lead nuevo, seguimiento, confirmación, post-entrega, recuperación rechazado, upsell. 100% listos.', badge: '🆕 Nuevo' },
    ],
  },
  {
    titulo: '⭐ Social Proof',
    desc: 'Testimonios que convierten',
    color: 'border-amber-500/15',
    items: [
      { href: '/testimonios', icon: '⭐', bg: 'bg-amber-500', titulo: 'Testimonios y Reseñas', desc: 'Testimonios paraguayos realistas para creativos + plantilla para pedir reseñas reales a clientes.', badge: '🆕 Nuevo' },
    ],
  },
  {
    titulo: '📅 Temporadas',
    desc: 'Campañas especiales para fechas clave',
    color: 'border-amber-500/15',
    items: [
      { href: '/temporadas', icon: '📅', bg: 'bg-orange-500', titulo: 'Black Friday, Navidad y más', desc: 'Plan completo para las 10 temporadas más rentables del año.' },
      { href: '/oferta-flash', icon: '⚡', bg: 'bg-gradient-to-br from-red-600 to-orange-500', titulo: 'Oferta Flash 48-72hs', desc: 'Urgencia real para eventos: San Juan, Buen Fin, Amor y Amistad, Black Friday. Copy + WhatsApp + script.', badge: '🆕 Nuevo' },
    ],
  },
  {
    titulo: '🎬 Video UGC & Reseñas',
    desc: 'Scripts para que clientes y creadores graben testimonios reales',
    color: 'border-rose-500/15',
    items: [
      { href: '/ugc-review', icon: '🌟', bg: 'bg-gradient-to-br from-rose-600 to-pink-600', titulo: 'Guión de Reseña en Video', desc: 'Script de 30-60s para que clientes reales graben su testimonio. Incluye instrucciones de grabación y mensaje de WhatsApp para pedirlo.', badge: '🆕 Nuevo' },
    ],
  },
  {
    titulo: '📊 Análisis y Optimización',
    desc: 'Herramientas para tomar mejores decisiones con datos',
    color: 'border-cyan-500/15',
    items: [
      { href: '/copy-scorer', icon: '📊', bg: 'bg-gradient-to-br from-cyan-600 to-blue-600', titulo: 'Copy Scorer IA', desc: 'Pegá cualquier copy y recibís un score 0-100 en 10 dimensiones con mejoras específicas listas para aplicar.', badge: '🆕 Nuevo' },
      { href: '/roas-simulator', icon: '🎯', bg: 'bg-gradient-to-br from-violet-600 to-purple-700', titulo: 'Simulador ROAS Break-Even', desc: 'Calculá exactamente cuánto podés gastar y cuántas ventas necesitás para ser rentable. Para PY, CO y MX.', badge: '🆕 Nuevo' },
      { href: '/logistica-cod', icon: '🗺️', label: 'Logística COD por Ciudad', bg: 'bg-gradient-to-br from-teal-600 to-emerald-700', titulo: 'Logística COD', desc: 'Dashboard de tasa de entrega por ciudad. Sabé dónde escalar y dónde pausar el targeting.', badge: '🆕 Nuevo' },
    ],
  },
]

function ItemCard({ item }: { item: { href: string; icon: string; bg: string; titulo: string; desc: string; badge?: string; grande?: boolean } }) {
  return (
    <Link href={item.href}
      className={`card border border-white/8 hover:border-white/20 rounded-2xl p-4 flex items-start gap-3 transition-all hover:-translate-y-0.5 ${item.grande ? 'col-span-1' : ''}`}>
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
export default async function CrearPage() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('name').eq('id', user?.id).single()

  return (
    <div className="min-h-screen">
      <Link href="/inicio" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar userName={profile?.name} />
      <main className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">✦ Crear contenido</h1>
          <p className="text-white/40 text-sm mt-1">Todo lo que necesitás para vender — listo para copiar y pegar</p>
        </div>

        <div className="space-y-6">
          {SECCIONES.map(s => (
            <div key={s.titulo}>
              <div className={`flex items-start gap-2 mb-3 pb-3 border-b ${s.color}`}>
                <div>
                  <p className="text-white font-bold text-sm">{s.titulo}</p>
                  <p className="text-white/30 text-xs">{s.desc}</p>
                </div>
              </div>
              <div className={`grid gap-2.5 ${s.items.length === 1 ? 'grid-cols-1' : s.items[0]?.grande ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {s.items.map(item => <ItemCard key={item.href} item={item} />)}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
