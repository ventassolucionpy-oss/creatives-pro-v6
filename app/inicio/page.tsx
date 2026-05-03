import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { createServerComponentClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export default async function InicioPage() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('name').eq('id', user?.id).single()
  const { data: recentGens } = await supabase.from('generations').select('id, tool, created_at, products(name)').order('created_at', { ascending: false }).limit(5)
  const { count: totalGens } = await supabase.from('generations').select('*', { count: 'exact', head: true })
  const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user?.id || '')

  const hour = new Date().getHours()
  const greeting = hour < 12 ? '¡Buenos días' : hour < 19 ? '¡Buenas tardes' : '¡Buenas noches'
  const name = profile?.name?.split(' ')[0] || 'ahí'
  const isNew = (totalGens || 0) === 0

  // Días desde la última generación (para alertas proactivas)
  const lastGen = recentGens?.[0]
  const daysSinceLastGen = lastGen
    ? Math.floor((Date.now() - new Date(lastGen.created_at).getTime()) / 86400000)
    : null

  const TOOL_LABELS: Record<string, string> = {
    'campana-completa': 'Campaña Completa', 'ugc-anuncios': 'Anuncios UGC',
    'meta-ads': 'Meta Ads', 'tiktok': 'TikTok', 'landing-page': 'Landing Page',
    'tiktok-shop': 'TikTok Shop', 'buyer-persona': 'Buyer Persona',
    'lanzar-producto': 'Lanzar Producto', 'organico': 'Contenido Orgánico',
    'email-flows': 'Email Flows', 'customer-service': 'Atención al Cliente',
    'whatsapp-flows': 'Flujos WhatsApp', 'oferta-flash': 'Oferta Flash',
    'roas-simulator': 'Simulador ROAS', 'logistica-cod': 'Logística COD',
    'copy-scorer': 'Copy Scorer', 'ugc-review': 'UGC Reviews',
  }

  return (
    <div className="min-h-screen">
      <Navbar userName={profile?.name} />
      <main className="max-w-lg mx-auto px-4 py-6">

        {/* Saludo */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">{greeting}, {name}! 👋</h1>
          <p className="text-white/40 text-sm mt-1">Tu plataforma de ventas con Dropi · Paraguay · Colombia · México</p>
        </div>

        {/* Alerta proactiva — días sin generar */}
        {!isNew && daysSinceLastGen !== null && daysSinceLastGen >= 7 && (
          <Link href="/campana" className="block card p-4 border border-amber-500/30 bg-amber-500/5 mb-5 hover:border-amber-500/50 transition-all">
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">⏰</span>
              <div>
                <p className="text-amber-300 font-bold text-sm">Hace {daysSinceLastGen} días sin nueva generación</p>
                <p className="text-white/40 text-xs mt-0.5">¿Renovás los copies de tus campañas? Los creativos se queman en 7-14 días. Tocá para crear nueva campaña.</p>
              </div>
            </div>
          </Link>
        )}

        {/* NUEVO USUARIO — pasos guiados */}
        {isNew && (
          <div className="card p-5 border border-violet-500/30 bg-violet-500/5 mb-5">
            <p className="text-violet-300 font-bold mb-1">¿Empezás desde cero?</p>
            <p className="text-white/50 text-sm mb-4">Seguí el flujo completo en orden y vas a tener tu primer producto listo para vender hoy.</p>
            <div className="space-y-3">
              {[
                { n: '1', texto: 'Ver el flujo completo', sub: 'El camino de cero a escalar — en orden', href: '/flujo', cta: 'Ir al flujo →' },
                { n: '2', texto: 'Encontrá un producto ganador', sub: 'Buscamos juntos qué vender', href: '/dropi', cta: 'Ir a Dropi →' },
                { n: '3', texto: 'Creá tu primera campaña', sub: 'Copies + UGC + Emails listos', href: '/campana', cta: 'Crear campaña →' },
              ].map(s => (
                <Link key={s.n} href={s.href} className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/3 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all">
                  <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center text-violet-300 font-black text-sm flex-shrink-0">{s.n}</div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">{s.texto}</p>
                    <p className="text-white/35 text-xs">{s.sub}</p>
                  </div>
                  <span className="text-violet-400 text-xs font-medium flex-shrink-0">{s.cta}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Stats rápidas */}
        {!isNew && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="card p-4 text-center">
              <p className="text-xl font-bold text-violet-400">{totalGens || 0}</p>
              <p className="text-xs text-white/30 mt-0.5">Generaciones</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-xl font-bold text-amber-400">{totalProducts || 0}</p>
              <p className="text-xs text-white/30 mt-0.5">Productos</p>
            </div>
            <Link href="/kpis" className="card p-4 text-center hover:border-violet-500/30 transition-all">
              <p className="text-xl font-bold text-emerald-400">KPIs</p>
              <p className="text-xs text-white/30 mt-0.5">Ver métricas →</p>
            </Link>
          </div>
        )}

        {/* Accesos rápidos — lo más importante arriba */}
        <div className="mb-5">
          {/* Flujo guiado — destacado */}
          <Link href="/flujo" className="block card p-4 border border-violet-500/30 bg-violet-500/5 mb-3 hover:border-violet-500/50 transition-all rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl flex-shrink-0">🗺️</span>
              <div className="flex-1 min-w-0">
                <p className="text-violet-300 font-bold text-sm">Flujo completo de ventas</p>
                <p className="text-white/40 text-xs mt-0.5">El camino exacto de cero a escalar — en orden lógico</p>
              </div>
              <span className="text-violet-400 text-sm flex-shrink-0">→</span>
            </div>
          </Link>

          <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-3">Accesos rápidos</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { href: '/dropi', icon: '🇵🇾', label: 'Dropi Paraguay', sub: 'Productos + Calculadora', color: 'border-red-500/20 hover:border-red-500/40' },
              { href: '/productos', icon: '📦', label: 'Mis Productos', sub: 'Registro central con imagen', color: 'border-teal-500/20 hover:border-teal-500/40' },
              { href: '/campana', icon: '⚡', label: 'Nueva Campaña', sub: 'Copies + UGC + Emails', color: 'border-violet-500/20 hover:border-violet-500/40' },
              { href: '/dashboard-pl', icon: '💰', label: 'P&L del día', sub: 'Ingresos, gasto y margen', color: 'border-emerald-500/20 hover:border-emerald-500/40' },
              { href: '/war-room', icon: '🔴', label: 'War Room', sub: 'Decisiones de hoy', color: 'border-red-500/20 hover:border-red-500/40' },
              { href: '/pedidos', icon: '📦', label: 'Pedidos COD', sub: 'Seguimiento post-venta', color: 'border-teal-500/20 hover:border-teal-500/40' },
              { href: '/oferta', icon: '💎', label: 'Constructor Oferta', sub: 'Framework Hormozi', color: 'border-amber-500/20 hover:border-amber-500/40' },
              { href: '/meta-tracker', icon: '📘', label: 'Meta Tracker', sub: 'Subir CSV de resultados', color: 'border-blue-500/20 hover:border-blue-500/40' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className={`card p-4 flex items-center gap-3 rounded-xl border transition-all ${a.color}`}>
                <span className="text-2xl flex-shrink-0">{a.icon}</span>
                <div className="min-w-0">
                  <p className="text-white text-xs font-bold leading-tight">{a.label}</p>
                  <p className="text-white/30 text-[10px] mt-0.5">{a.sub}</p>
                </div>
              </Link>
            ))}

          </div>
        </div>

        {/* Módulos nuevos destacados */}
        {!isNew && (
          <div className="mb-5">
            <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-3">Herramientas clave</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: '/portfolio', icon: '📋', label: 'Portfolio', sub: 'Vista global de productos' },
                { href: '/autopilot', icon: '🤖', label: 'Autopilot', sub: 'Reglas automáticas' },
                { href: '/matriz-creativos', icon: '🔢', label: 'Matriz Creativos', sub: 'Ángulo × Audiencia' },
                { href: '/cro', icon: '🔬', label: 'Analizador CRO', sub: 'Score tu landing page' },
                { href: '/retencion', icon: '🔄', label: 'Motor Retención', sub: 'LTV post-venta' },
                { href: '/upsell', icon: '💎', label: 'Upsell & Bundles', sub: '+30% ticket promedio' },
                { href: '/checkout-dropi', icon: '🛒', label: 'Checkout Dropi', sub: 'Ficha completa lista' },
                { href: '/whatsapp-ventas', icon: '💬', label: 'Scripts WhatsApp', sub: '10 situaciones de venta' },
                { href: '/validador-producto', icon: '✅', label: 'Validador COD', sub: '14 criterios antes de comprar' },
                { href: '/whatsapp-flows', icon: '📲', label: 'Flujos WhatsApp', sub: '6 flujos COD automatizados' },
                { href: '/oferta-flash', icon: '⚡', label: 'Oferta Flash', sub: 'Urgencia real en 48-72hs' },
                { href: '/roas-simulator', icon: '🎯', label: 'Simulador ROAS', sub: 'Break-even dinámico' },
                { href: '/logistica-cod', icon: '🗺️', label: 'Logística COD', sub: 'Tasa entrega por ciudad' },
                { href: '/copy-scorer', icon: '📊', label: 'Copy Scorer', sub: 'Score IA de tus copies' },
                { href: '/ugc-review', icon: '🎬', label: 'UGC Reviews', sub: 'Scripts de reseña en video' },
                { href: '/creadores', icon: '🎭', label: 'Creadores UGC', sub: 'CRM de tus creadores' },
              ].map(a => (
                <Link key={a.href} href={a.href}
                  className="card p-3 flex items-center gap-2.5 rounded-xl border border-violet-500/15 hover:border-violet-500/35 transition-all">
                  <span className="text-lg flex-shrink-0">{a.icon}</span>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold leading-tight truncate">{a.label}</p>
                    <p className="text-white/30 text-[10px] mt-0.5 truncate">{a.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recientes */}
        {recentGens && recentGens.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-white/25 uppercase tracking-widest">Últimas generaciones</p>
              <Link href="/gestionar" className="text-xs text-violet-400">Ver todo →</Link>
            </div>
            <div className="space-y-2">
              {(recentGens as Array<{ id: string; tool: string; created_at: string; products?: { name: string } }>).map(g => (
                <Link key={g.id} href="/gestionar" className="flex items-center gap-3 p-3 card rounded-xl hover:border-white/15 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-violet-600/15 flex items-center justify-center text-violet-400 text-sm flex-shrink-0">✦</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs font-medium truncate">{TOOL_LABELS[g.tool] || g.tool}</p>
                    {g.products?.name && <p className="text-white/25 text-[10px] truncate">{g.products.name}</p>}
                  </div>
                  <p className="text-white/20 text-[10px] flex-shrink-0">
                    {new Date(g.created_at).toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit' })}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
