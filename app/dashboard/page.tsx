import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

const TOOLS = [
  { id:'campana', href:'/campana', icon:'⚡', color:'bg-gradient-to-br from-violet-600 to-indigo-600', title:'Campaña Completa', desc:'Copies + UGC + Emails + WhatsApp + Audiencias en una sola generación.', subtags:['Full Stack','⚡ Nuevo'], highlight:true },
  { id:'lanzar', href:'/lanzar', icon:'🚀', color:'bg-gradient-to-br from-emerald-600 to-teal-600', title:'Lanzar Producto Nuevo', desc:'De cero al primer ad en 10 minutos. Nicho + precio + landing + copies todo integrado.', subtags:['Todo en 1','Nuevo producto'], highlight:true },
  { id:'ugc', href:'/creativos/ugc', icon:'✦', color:'bg-violet-600', title:'Creativos UGC', desc:'Anuncios, secuencias y catálogo con copies, audiencias y prompts.', subtags:['Anuncios','Secuencias','Catálogo'], highlight:false },
  { id:'meta', href:'/creativos/meta-ads', icon:'⊞', color:'bg-blue-600', title:'Meta Ads', desc:'Estrategia completa con segmentación, copies y creatividades.', subtags:['Segmentación','Copies','Creatividades'], highlight:false },
  { id:'tiktok-shop', href:'/tiktok-shop', icon:'🛍️', color:'bg-pink-600', title:'TikTok Shop Completo', desc:'Cuenta, orgánico, Spark Ads, live shopping y 5 guiones listos.', subtags:['Orgánico','Spark Ads','Live'], highlight:false },
  { id:'andromeda', href:'/creativos/andromeda', icon:'✺', color:'bg-indigo-600', title:'Andromeda — Escala', desc:'Estrategia progresiva de escalado. 3 fases, KPIs y tipos de creatividad.', subtags:['Dropshipping','Hotmart','3 Fases'], highlight:false },
  { id:'hotmart', href:'/creativos/hotmart', icon:'◉', color:'bg-orange-500', title:'Hotmart / Digital', desc:'Funnel completo: página de ventas, emails y WhatsApp scripts.', subtags:['Ventas','Emails','WhatsApp'], highlight:false },
  { id:'organico', href:'/organico', icon:'🌱', color:'bg-green-600', title:'Orgánico IG & Facebook', desc:'Plan semanal de contenido orgánico para calentar audiencias y bajar el CPM del paid.', subtags:['Instagram','Facebook','Paraguay'], highlight:false },
  { id:'meta-pro', href:'/meta-ads-pro', icon:'⚙️', color:'bg-blue-700', title:'Meta Ads Pro', desc:'Pixel, CBO/ABO, Dropi Paraguay, troubleshooting cuando cae el ROAS.', subtags:['Pixel','CBO','Dropi'], highlight:false },
  { id:'dropi', href:'/dropi', icon:'🇵🇾', color:'bg-red-600', title:'Dropi Paraguay', desc:'Buscador de productos ganadores + calculadora exacta con COD y flete.', subtags:['Productos','Calculadora','COD'], highlight:false },
  { id:'buyer-persona', href:'/buyer-persona', icon:'🧠', color:'bg-purple-700', title:'Buyer Persona', desc:'Psicología profunda del comprador paraguayo + 5 ángulos de anuncio.', subtags:['Psicología','Meta','TikTok'], highlight:false },
  { id:'sourcing', href:'/sourcing', icon:'🛍️', color:'bg-red-600', title:'Sourcing Dropi Paraguay', desc:'Evaluar producto, calcular precio en guaraníes, descripción y fotos.', subtags:['Dropi','Precio','Fotos'], highlight:false },
]

const TOOL_LABELS: Record<string, { label: string; color: string }> = {
  'ugc-anuncios': { label:'UGC Anuncios', color:'text-violet-400' },
  'ugc-secuencias': { label:'UGC Secuencias', color:'text-blue-400' },
  'ugc-catalogo': { label:'UGC Catálogo', color:'text-emerald-400' },
  'meta-ads': { label:'Meta Ads', color:'text-blue-400' },
  'tiktok': { label:'TikTok', color:'text-pink-400' },
  'hotmart': { label:'Hotmart', color:'text-orange-400' },
  'campana-completa': { label:'Campaña Completa', color:'text-violet-400' },
  'andromeda-meta-ads': { label:'Andromeda', color:'text-indigo-400' },
}

export const dynamic = 'force-dynamic'
export default async function DashboardPage() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('name').eq('id', user?.id).single()
  const { data: recentGens } = await supabase.from('generations').select('id, tool, created_at, products(name)').order('created_at', { ascending: false }).limit(6)
  const { data: products } = await supabase.from('products').select('id, name, category').eq('user_id', user?.id || '').limit(4)
  const { count: totalGens } = await supabase.from('generations').select('*', { count: 'exact', head: true })
  const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user?.id || '')

  // Framework usage intelligence
  const { data: allGens } = await supabase.from('generations').select('output, tool').limit(50)
  const frameworkCounts: Record<string, number> = {}
  allGens?.forEach(g => {
    const copies = (g.output as Record<string, unknown>)?.copies as Array<{ framework?: string }> | undefined
    copies?.forEach(c => { if (c.framework) frameworkCounts[c.framework] = (frameworkCounts[c.framework] || 0) + 1 })
  })
  const topFramework = Object.entries(frameworkCounts).sort((a,b) => b[1]-a[1])[0]
  const toolCounts: Record<string, number> = {}
  allGens?.forEach(g => { toolCounts[g.tool] = (toolCounts[g.tool] || 0) + 1 })
  const topTool = Object.entries(toolCounts).sort((a,b) => b[1]-a[1])[0]

  const isNewUser = (totalGens || 0) === 0
  const userName = profile?.name || user?.email?.split('@')[0] || 'Usuario'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  redirect('/inicio')
  return (
    <div className="min-h-screen">
      <Navbar userName={userName} />
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Welcome */}
        <div className="mb-8 animate-fade-up">
          <p className="text-white/30 text-sm mb-1">{greeting},</p>
          <h1 className="text-3xl font-bold text-white mb-1"><span className="text-violet-400">{userName}</span> 👋</h1>
          <p className="text-white/40 text-sm">Tu centro de operaciones para Meta Ads y conversión.</p>
        </div>

        {/* ONBOARDING — solo para usuarios nuevos */}
        {isNewUser && (
          <div className="card p-6 border border-violet-500/30 bg-violet-500/5 mb-8 animate-fade-up">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-2xl flex-shrink-0">🚀</div>
              <div className="flex-1">
                <h2 className="text-white font-bold text-lg mb-1">Bienvenido a Creatives Pro</h2>
                <p className="text-white/50 text-sm mb-4">Seguí estos 3 pasos para generar tu primera campaña en minutos:</p>
                <div className="space-y-3">
                  {[
                    { n:'1', title:'Creá tu primer producto', desc:'Toda la IA se personaliza según tu producto.', href:'/creativos/ugc/anuncios', cta:'Crear producto →', done: (totalProducts||0)>0 },
                    { n:'2', title:'Generá una Campaña Completa', desc:'Copies + UGC + Emails + WhatsApp en una sola generación.', href:'/campana', cta:'Ir a Campaña Completa →', done: false },
                    { n:'3', title:'Cargá los resultados en el Tracker', desc:'El sistema aprende qué funciona para tu producto.', href:'/tracker', cta:'Ver Tracker →', done: false },
                  ].map(step => (
                    <div key={step.n} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${step.done ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/8 bg-white/3'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step.done ? 'bg-emerald-500 text-white' : 'bg-violet-600/30 text-violet-300'}`}>{step.done ? '✓' : step.n}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${step.done ? 'text-emerald-400 line-through opacity-60' : 'text-white'}`}>{step.title}</p>
                        <p className="text-white/35 text-xs">{step.desc}</p>
                      </div>
                      {!step.done && <Link href={step.href} className="text-xs text-violet-400 hover:text-violet-300 flex-shrink-0">{step.cta}</Link>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label:'Generaciones', value: totalGens || 0, icon:'◎', color:'text-violet-400', sub: topTool ? `Más usada: ${TOOL_LABELS[topTool[0]]?.label || topTool[0]}` : 'Comenzá generando' },
            { label:'Productos', value: totalProducts || 0, icon:'◫', color:'text-amber-400', sub: (totalProducts||0)>0 ? 'Registrados en el sistema' : 'Aún no tenés productos' },
            { label:'Framework top', value: topFramework ? topFramework[0] : '—', icon:'✦', color:'text-emerald-400', sub: topFramework ? `${topFramework[1]} veces generado` : 'Generá para ver insights' },
          ].map((s, i) => (
            <div key={i} className="card p-4 text-center">
              <p className={`text-2xl font-bold ${s.color} mb-0.5`}>{s.value}</p>
              <p className="text-[10px] text-white/30 font-medium">{s.label}</p>
              <p className="text-[9px] text-white/20 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* CAMPAÑA COMPLETA — hero CTA */}
        <Link href="/campana" className="block mb-6 p-6 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-600/15 to-indigo-600/10 hover:from-violet-600/20 hover:to-indigo-600/15 transition-all card-hover animate-fade-up" style={{animationDelay:'0.1s'}}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-2xl flex-shrink-0">⚡</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-white font-bold">Campaña Completa</h2>
                <span className="tag tag-violet text-[10px]">Recomendado</span>
              </div>
              <p className="text-white/50 text-sm">Generá copies, guiones UGC, emails, WhatsApp y audiencias para el mismo producto — en una sola generación integrada y coherente.</p>
            </div>
            <span className="text-violet-400 text-sm font-medium flex-shrink-0">→</span>
          </div>
        </Link>

        {/* Tus productos — acceso rápido */}
        {products && products.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-white/25 uppercase tracking-widest">Tus productos</p>
              <Link href="/campana" className="text-xs text-violet-400 hover:text-violet-300">Nueva campaña →</Link>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {products.map(p => (
                <div key={p.id} className="card p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/12 flex items-center justify-center text-amber-400 text-sm flex-shrink-0">{p.category === 'digital' ? '💻' : p.category === 'servicio' ? '⚡' : '📦'}</div>
                    <div>
                      <p className="text-white text-sm font-semibold">{p.name}</p>
                      <p className="text-white/30 text-[10px] capitalize">{p.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/campana" className="px-3 py-1.5 rounded-lg bg-violet-500/15 text-violet-300 text-[11px] font-medium hover:bg-violet-500/25 transition-colors">⚡ Campaña</Link>
                    <Link href="/creativos/ugc/anuncios" className="px-3 py-1.5 rounded-lg bg-white/5 text-white/40 text-[11px] font-medium hover:bg-white/10 transition-colors">Anuncio</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-white/25 uppercase tracking-widest mb-3">Acciones rápidas</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href:'/campana', icon:'⚡', color:'bg-violet-600/20 text-violet-400', title:'Campaña Completa', sub:'Full stack con IA' },
              { href:'/landing', icon:'🏠', color:'bg-indigo-600/20 text-indigo-400', title:'Landing para Lovable', sub:'Con video UGC' },
              { href:'/spy', icon:'🔍', color:'bg-red-600/20 text-red-400', title:'Spy & Clonar', sub:'Analizar competencia' },
              { href:'/nicho', icon:'📊', color:'bg-amber-600/20 text-amber-400', title:'Análisis de Nicho', sub:'Score del producto' },
              { href:'/email-flows', icon:'📧', color:'bg-emerald-600/20 text-emerald-400', title:'Email Flows', sub:'4 automatizaciones' },
              { href:'/tracker', icon:'📈', color:'bg-blue-600/20 text-blue-400', title:'Tracker', sub:'Cargar resultados' },
            ].map(a => (
              <Link key={a.href} href={a.href} className="card p-4 flex items-center gap-3 card-hover rounded-xl">
                <div className={`w-9 h-9 rounded-xl ${a.color} flex items-center justify-center text-sm flex-shrink-0`}>{a.icon}</div>
                <div><p className="text-white text-xs font-semibold">{a.title}</p><p className="text-white/30 text-[10px]">{a.sub}</p></div>
              </Link>
            ))}
          </div>
        </div>

        {/* Herramientas */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-white/25 uppercase tracking-widest mb-3">Todas las herramientas</p>
          <div className="space-y-2">
            {TOOLS.map((tool, i) => (
              <Link key={tool.id} href={tool.href}
                className={`flex items-center gap-4 p-4 card card-hover rounded-xl cursor-pointer animate-fade-up ${tool.highlight ? 'border-violet-500/20' : ''}`}
                style={{ animationDelay:`${i*0.05}s` }}>
                <div className={`w-10 h-10 rounded-xl ${tool.color} flex items-center justify-center text-white text-lg flex-shrink-0`}>{tool.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm mb-0.5">{tool.title}</p>
                  <p className="text-white/40 text-xs mb-1.5">{tool.desc}</p>
                  <div className="flex gap-1.5 flex-wrap">{tool.subtags.map(tag => <span key={tag} className={`tag ${tool.highlight?'tag-violet':'tag-gray'} text-[10px]`}>{tag}</span>)}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-white/20 flex-shrink-0"><path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Recientes */}
        {recentGens && recentGens.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-white/25 uppercase tracking-widest">Generaciones recientes</p>
              <Link href="/historial" className="text-xs text-violet-400 hover:text-violet-300">Ver todo →</Link>
            </div>
            <div className="space-y-2">
              {(recentGens as Array<{ id: string; tool: string; created_at: string; products?: { name: string } }>).map(g => {
                const tl = TOOL_LABELS[g.tool] || { label: g.tool, color: 'text-white/40' }
                return (
                  <Link key={g.id} href="/historial" className="flex items-center gap-3 p-3 card rounded-lg card-hover">
                    <div className="w-7 h-7 rounded-lg bg-violet-600/15 flex items-center justify-center text-violet-400 text-xs flex-shrink-0">✦</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${tl.color}`}>{tl.label}</p>
                      {g.products?.name && <p className="text-white/30 text-[10px] truncate">{g.products.name}</p>}
                    </div>
                    <p className="text-white/20 text-[10px] flex-shrink-0">{new Date(g.created_at).toLocaleDateString('es-PY',{day:'2-digit',month:'2-digit'})}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
