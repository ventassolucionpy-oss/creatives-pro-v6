'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { getPaisConfig, PAISES, formatPrecio, type Pais } from '@/lib/constants'
import ProductSelector from '@/components/wizard/ProductSelector'
import ProductModal from '@/components/wizard/ProductModal'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Product } from '@/types'

type TikTokShopOutput = {
  estrategia_general: string
  cuenta: {
    nombre_sugerido: string
    bio: string
    avatar_concepto: string
    primer_video_concepto: string
  }
  fase_organica: {
    descripcion: string
    tipos_video: Array<{ tipo: string; descripcion: string; frecuencia: string; hook_ejemplo: string }>
    hashtags_principales: string[]
    sonidos_tendencia: string[]
    horarios_publicacion: string[]
  }
  fase_paid: {
    descripcion: string
    spark_ads: string
    in_feed_ads: string
    presupuesto_inicial: string
    estructura_campana: string
  }
  live_shopping: {
    descripcion: string
    guion_apertura: string
    tecnicas_venta: string[]
    frecuencia_recomendada: string
    productos_gancho: string
  }
  guiones_video: Array<{
    id: number
    tipo: string
    duracion: string
    hook: string
    desarrollo: string
    cta: string
    caption: string
    hashtags: string[]
  }>
  kpis: Array<{ metrica: string; bueno: string; excelente: string; accion_si_malo: string }>
  calendario_30dias: string
}

async function callClaude(prompt: string): Promise<TikTokShopOutput> {
    const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  })
  if (!res.ok) throw new Error(`Error API (${res.status})`)
  const data = await res.json()
  const raw: string = data.text || ''
  let clean = raw.replace(/```json\s*/g,'').replace(/```\s*/g,'').trim()
  const s = clean.indexOf('{'), e = clean.lastIndexOf('}')
  if (s >= 0 && e > s) clean = clean.slice(s, e+1)
  return JSON.parse(clean) as TikTokShopOutput
}

function buildTikTokPrompt(product: Product, config: Record<string, string>): string {
  return `Sos un experto en TikTok Shop con $3M+ en ventas gestionadas en LATAM. Conocés el algoritmo de TikTok por dentro: cómo el contenido orgánico alimenta al paid, cómo los Spark Ads bajan el CPM hasta 60%, cómo el live shopping convierte 3x más que los ads estáticos.

PRODUCTO: ${product.name}
DESCRIPCIÓN: ${product.description}
CATEGORÍA: ${product.category}
PÚBLICO: ${config.publico || 'compradores online LATAM 18-35'}
PRESUPUESTO INICIAL: ${config.presupuesto || 'USD 20-50/día'}
PAÍS: ${config.pais || 'Paraguay'}
EXPERIENCIA EN TIKTOK: ${config.experiencia || 'Principiante'}

Generá una estrategia COMPLETA de TikTok Shop — desde cero hasta escala. Incluí la estrategia orgánica (que baja el costo del paid), los Spark Ads, el live shopping y guiones listos para grabar.

REGLAS TIKTOK:
- Los primeros 0.5 segundos determinan si el video vive o muere
- El hook visual > el hook de audio
- Los videos de 15-30s tienen mayor completion rate
- Los Spark Ads en videos orgánicos con >1000 likes tienen CPM 40-60% más bajo
- El live shopping funciona mejor con productos físicos bajo $50
- Los hashtags de nicho (10K-500K views) funcionan mejor que los mega hashtags

Respondé SOLO con JSON válido:
{
  "estrategia_general": "resumen de la estrategia en 2-3 líneas directas",
  "cuenta": {
    "nombre_sugerido": "nombre de cuenta TikTok para este producto/nicho",
    "bio": "bio de 150 chars con emoji y propuesta de valor clara",
    "avatar_concepto": "descripción del avatar/foto de perfil ideal",
    "primer_video_concepto": "idea concreta del primer video que maximiza probabilidad de viral"
  },
  "fase_organica": {
    "descripcion": "por qué el orgánico primero y cómo alimenta al paid",
    "tipos_video": [
      { "tipo": "nombre del tipo de video", "descripcion": "qué mostrar exactamente", "frecuencia": "ej: 3 por semana", "hook_ejemplo": "primeras palabras exactas del video" }
    ],
    "hashtags_principales": ["#hashtag1","#hashtag2","#hashtag3","#hashtag4","#hashtag5","#hashtag6"],
    "sonidos_tendencia": ["descripción de qué tipo de sonido/trending audio buscar"],
    "horarios_publicacion": ["horario 1 con zona horaria", "horario 2", "horario 3"]
  },
  "fase_paid": {
    "descripcion": "cuándo activar paid y cómo combinarlo con orgánico",
    "spark_ads": "estrategia completa de Spark Ads: qué videos potenciar, cómo identificar candidatos, presupuesto",
    "in_feed_ads": "cuándo usar In-Feed Ads vs Spark Ads y estructura recomendada",
    "presupuesto_inicial": "presupuesto inicial realista y cómo distribuirlo",
    "estructura_campana": "estructura técnica de la campaña en TikTok Ads Manager"
  },
  "live_shopping": {
    "descripcion": "si aplica para este producto y por qué",
    "guion_apertura": "guion de los primeros 2 minutos del live para enganchar a la audiencia",
    "tecnicas_venta": ["técnica 1", "técnica 2", "técnica 3", "técnica 4"],
    "frecuencia_recomendada": "cuántos lives por semana y duración",
    "productos_gancho": "qué product/precio usar como gancho para atraer gente al live"
  },
  "guiones_video": [
    {
      "id": 1,
      "tipo": "UGC — Testimonial de conversión",
      "duracion": "15-20 segundos",
      "hook": "primeras palabras exactas (los primeros 0.5 segundos visuales + audio)",
      "desarrollo": "el desarrollo completo del video — qué decir y mostrar segundo a segundo",
      "cta": "CTA final exacto — natural, no forzado",
      "caption": "caption completo con hook para el texto + hashtags",
      "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5"]
    },
    { "id": 2, "tipo": "Problema/Solución rápida", "duracion": "...", "hook": "...", "desarrollo": "...", "cta": "...", "caption": "...", "hashtags": [] },
    { "id": 3, "tipo": "Unboxing con sorpresa", "duracion": "...", "hook": "...", "desarrollo": "...", "cta": "...", "caption": "...", "hashtags": [] },
    { "id": 4, "tipo": "Trending audio adaptation", "duracion": "...", "hook": "...", "desarrollo": "...", "cta": "...", "caption": "...", "hashtags": [] },
    { "id": 5, "tipo": "Before & After visual", "duracion": "...", "hook": "...", "desarrollo": "...", "cta": "...", "caption": "...", "hashtags": [] }
  ],
  "kpis": [
    { "metrica": "Video Completion Rate", "bueno": "> 20%", "excelente": "> 40%", "accion_si_malo": "qué hacer si es menor" },
    { "metrica": "CTR (click al shop)", "bueno": "> 2%", "excelente": "> 5%", "accion_si_malo": "..." },
    { "metrica": "ROAS Spark Ads", "bueno": "> 2x", "excelente": "> 4x", "accion_si_malo": "..." },
    { "metrica": "Costo por orden TikTok Shop", "bueno": "< 30% del precio", "excelente": "< 15%", "accion_si_malo": "..." }
  ],
  "calendario_30dias": "plan semana por semana de los primeros 30 días: qué hacer cada semana, qué métricas mirar, cuándo activar paid, cuándo hacer el primer live"
}`
}

export default function TikTokShopPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [config, setConfig] = useState<Record<string, string>>({})
  const [output, setOutput] = useState<TikTokShopOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'estrategia' | 'guiones' | 'live' | 'kpis' | 'calendario'>('estrategia')
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (selectedProduct) {
      const d = selectedProduct.description.toLowerCase()
      const pub = d.match(/belleza|skin/) ? 'Mujeres 18-35 interesadas en skincare y belleza, LATAM'
        : d.match(/fitness|gym/) ? 'Hombres y mujeres 18-30 apasionados por el fitness, LATAM'
        : 'Compradores online 18-35 en LATAM'
      setConfig(p => ({ ...p, publico: p.publico || pub }))
    }
  }, [selectedProduct?.id])

  const generate = async () => {
    if (!selectedProduct) return
    setLoading(true); setError('')
    try {
      const result = await callClaude(buildTikTokPrompt(selectedProduct, config))
      setOutput(result); setActiveTab('estrategia')
    } catch (e) { setError(e instanceof Error ? e.message : 'Error') }
    setLoading(false)
  }

  const save = async () => {
    if (!output || !selectedProduct) return
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('generations').insert({ user_id: user.id, product_id: selectedProduct.id, tool: 'tiktok-shop', status: 'completed', input: config, output })
      setSaved(true)
    }
  }

  const inputClass = 'input'
  const labelClass = 'block text-xs font-medium text-white/40 mb-1.5'

  const pinkTag = { background:'rgba(236,72,153,0.15)', color:'#f472b6', border:'1px solid rgba(236,72,153,0.3)' }

  return (
    <div className="min-h-screen">
      <Navbar />
      {showModal && <ProductModal onClose={() => setShowModal(false)} onCreated={p => { setSelectedProduct(p); setShowModal(false) }} />}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/crear" className="btn-ghost text-white/30 hover:text-white p-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">TikTok Shop — Estrategia Completa</h1>
              <span className="tag text-[10px]" style={pinkTag}>🎵 Orgánico + Paid + Live</span>
            </div>
            <p className="text-white/40 text-xs">Estrategia de cuenta, Spark Ads, live shopping y 5 guiones listos para grabar</p>
          </div>
        </div>

        {!output ? (
          <div className="space-y-5 animate-fade-up">
            <ProductSelector selectedProductId={selectedProduct?.id||null} onSelect={p => setSelectedProduct(p)} onCreateNew={() => setShowModal(true)} />
            <div className="card p-5 space-y-4">
              <div>
                <label className={labelClass}>Público objetivo {selectedProduct && <span className="ml-2 text-pink-400/50 text-[10px]">✦ Auto-completado</span>}</label>
                <input className={inputClass} value={config.publico||''} onChange={e => setConfig(p => ({...p,publico:e.target.value}))} placeholder="Ej: Mujeres 18-35, Paraguay y LATAM" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Presupuesto inicial de ads</label>
                  <select className={`${inputClass} cursor-pointer`} value={config.presupuesto||''} onChange={e => setConfig(p => ({...p,presupuesto:e.target.value}))} style={{background:'#111'}}>
                    <option value="">Seleccionar...</option>
                    {['Sin presupuesto (solo orgánico)','USD 10-20/día (mínimo)','USD 20-50/día (recomendado)','USD 50-100/día (escalado)','USD 100+/día'].map(o => <option key={o} value={o} style={{background:'#111'}}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>País principal</label>
                  <select className={`${inputClass} cursor-pointer`} value={config.pais||''} onChange={e => setConfig(p => ({...p,pais:e.target.value}))} style={{background:'#111'}}>
                    <option value="">Seleccionar...</option>
                    {['Paraguay','Argentina','México','Colombia','Chile','Brasil','LATAM'].map(o => <option key={o} value={o} style={{background:'#111'}}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Experiencia en TikTok</label>
                  <select className={`${inputClass} cursor-pointer`} value={config.experiencia||''} onChange={e => setConfig(p => ({...p,experiencia:e.target.value}))} style={{background:'#111'}}>
                    <option value="">Seleccionar...</option>
                    {['Principiante — cuenta nueva','Intermedio — algo de contenido','Avanzado — cuenta con seguidores'].map(o => <option key={o} value={o} style={{background:'#111'}}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Precio del producto</label>
                  <input className={inputClass} value={config.precio||''} onChange={e => setConfig(p => ({...p,precio:e.target.value}))} placeholder="Ej: $19 / Gs. 147.000" />
                </div>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={generate} disabled={!selectedProduct||loading} className="btn-primary w-full py-4 text-base" style={{background: loading ? undefined : 'linear-gradient(135deg,#7c3aed,#ec4899)'}}>
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2"/>Generando estrategia TikTok...</> : '🎵 Generar estrategia TikTok Shop completa →'}
            </button>
          </div>
        ) : (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold">Estrategia TikTok — {selectedProduct?.name}</h2>
              <div className="flex gap-2">
                <button onClick={save} disabled={saved} className={`text-xs px-3 py-2 rounded-lg border transition-all ${saved?'border-emerald-500/40 text-emerald-400':'border-white/15 text-white/50 hover:border-white/30'}`}>{saved?'✓':'💾'}</button>
                <button onClick={() => {setOutput(null);setSaved(false)}} className="btn-secondary text-xs px-3 py-2">← Nueva</button>
              </div>
            </div>

            {/* Resumen general */}
            <div className="card p-4 border mb-5" style={{borderColor:'rgba(236,72,153,0.25)',background:'rgba(236,72,153,0.05)'}}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{color:'#f472b6'}}>🎵 Estrategia General</p>
              <p className="text-white/80 text-sm leading-relaxed">{output.estrategia_general}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2 mb-5">
              {[
                {id:'estrategia',l:'🏗️ Estrategia'},
                {id:'guiones',l:'🎬 5 Guiones'},
                {id:'live',l:'📡 Live Shopping'},
                {id:'kpis',l:'📊 KPIs'},
                {id:'calendario',l:'📅 30 días'},
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab===t.id ? 'text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                  style={activeTab===t.id ? {background:'linear-gradient(135deg,#7c3aed,#ec4899)'} : {}}>
                  {t.l}
                </button>
              ))}
            </div>

            {activeTab === 'estrategia' && (
              <div className="space-y-4 animate-fade-up">
                {/* Cuenta */}
                <div className="card p-5 border border-white/8">
                  <p className="text-white font-semibold text-sm mb-3">👤 Configuración de Cuenta</p>
                  <div className="space-y-2">
                    {[['Nombre sugerido',output.cuenta.nombre_sugerido],['Bio',output.cuenta.bio],['Avatar',output.cuenta.avatar_concepto],['Primer video',output.cuenta.primer_video_concepto]].map(([l,v]) => (
                      <div key={l} className="flex gap-3 py-2 border-b border-white/5 last:border-0">
                        <p className="text-white/30 text-xs w-24 flex-shrink-0">{l}</p>
                        <p className="text-white/70 text-xs leading-relaxed">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Orgánica */}
                <div className="card p-5 border border-white/8">
                  <p className="text-white font-semibold text-sm mb-2">🌱 Fase Orgánica</p>
                  <p className="text-white/50 text-xs mb-3 leading-relaxed">{output.fase_organica.descripcion}</p>
                  <div className="space-y-2 mb-3">
                    {output.fase_organica.tipos_video.map((t, i) => (
                      <div key={i} className="p-3 bg-white/3 border border-white/8 rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white text-xs font-semibold">{t.tipo}</p>
                          <span className="text-white/30 text-[10px]">{t.frecuencia}</span>
                        </div>
                        <p className="text-white/50 text-xs mb-1.5">{t.descripcion}</p>
                        <p className="text-pink-300/70 text-[10px] italic">Hook: "{t.hook_ejemplo}"</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">{output.fase_organica.hashtags_principales.map(h => <span key={h} className="px-2 py-0.5 rounded text-[10px]" style={{background:'rgba(236,72,153,0.1)',color:'#f472b6'}}>{h}</span>)}</div>
                  <div className="text-white/30 text-[10px]">Mejores horarios: {output.fase_organica.horarios_publicacion.join(' · ')}</div>
                </div>
                {/* Paid */}
                <div className="card p-5 border border-white/8">
                  <p className="text-white font-semibold text-sm mb-2">📘 Fase Paid (Spark Ads + In-Feed)</p>
                  <p className="text-white/50 text-xs mb-3 leading-relaxed">{output.fase_paid.descripcion}</p>
                  {[['⚡ Spark Ads',output.fase_paid.spark_ads],['🎯 In-Feed Ads',output.fase_paid.in_feed_ads],['💰 Presupuesto inicial',output.fase_paid.presupuesto_inicial],['🏗️ Estructura de campaña',output.fase_paid.estructura_campana]].map(([l,v]) => (
                    <div key={l} className="mb-3 p-3 bg-white/3 border border-white/8 rounded-xl">
                      <p className="text-white/50 text-[10px] font-semibold mb-1">{l}</p>
                      <p className="text-white/70 text-xs leading-relaxed">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'guiones' && (
              <div className="space-y-4 animate-fade-up">
                <div className="card p-3 border text-xs mb-2" style={{borderColor:'rgba(236,72,153,0.2)',background:'rgba(236,72,153,0.05)',color:'#f472b6'}}>
                  🎬 5 guiones listos para grabar. El hook de los primeros 0.5 segundos es lo más importante — practicalo hasta que sea natural.
                </div>
                {output.guiones_video.map(g => (
                  <div key={g.id} className="card p-4 border border-white/8">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-300 text-xs font-bold">{g.id}</span>
                        <div>
                          <p className="text-white text-xs font-semibold">{g.tipo}</p>
                          <p className="text-white/25 text-[10px]">{g.duracion}</p>
                        </div>
                      </div>
                      <CopyBtn text={`HOOK: ${g.hook}\n\n${g.desarrollo}\n\nCTA: ${g.cta}\n\nCaption: ${g.caption}\n\n${g.hashtags.join(' ')}`} />
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl border" style={{background:'rgba(236,72,153,0.08)',borderColor:'rgba(236,72,153,0.25)'}}>
                        <p className="text-[10px] font-bold uppercase mb-1" style={{color:'#f472b6'}}>🎬 Hook (primeros 0.5s)</p>
                        <p className="text-white font-bold text-sm">"{g.hook}"</p>
                      </div>
                      <div className="p-3 bg-white/3 border border-white/8 rounded-xl">
                        <p className="text-[10px] text-white/30 mb-1">Desarrollo</p>
                        <p className="text-white/70 text-xs leading-relaxed">{g.desarrollo}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-white/8 rounded-lg text-xs font-semibold text-white/80">{g.cta}</span>
                      </div>
                      <div className="p-2.5 bg-white/2 rounded-lg">
                        <p className="text-[10px] text-white/25 mb-1">Caption</p>
                        <p className="text-white/50 text-xs">{g.caption}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">{g.hashtags.map(h => <span key={h} className="px-2 py-0.5 text-[10px]" style={{background:'rgba(236,72,153,0.1)',color:'#f472b6',borderRadius:'4px'}}>{h}</span>)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'live' && (
              <div className="space-y-4 animate-fade-up">
                <div className="card p-5 border" style={{borderColor:'rgba(236,72,153,0.2)',background:'rgba(236,72,153,0.05)'}}>
                  <p className="font-bold text-sm text-white mb-2">📡 Live Shopping</p>
                  <p className="text-white/70 text-sm leading-relaxed">{output.live_shopping.descripcion}</p>
                </div>
                <div className="card p-5 border border-white/8">
                  <p className="text-white text-xs font-semibold mb-2">Guión de apertura (primeros 2 minutos)</p>
                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{output.live_shopping.guion_apertura}</p>
                </div>
                <div className="card p-4 border border-white/8">
                  <p className="text-white text-xs font-semibold mb-2">Técnicas de venta en live</p>
                  <ul className="space-y-2">{output.live_shopping.tecnicas_venta.map((t,i) => <li key={i} className="flex gap-2 text-xs text-white/70"><span className="text-pink-400 flex-shrink-0">✓</span>{t}</li>)}</ul>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="card p-3 border border-white/8"><p className="text-[10px] text-white/30 mb-1">Frecuencia</p><p className="text-white/70 text-xs">{output.live_shopping.frecuencia_recomendada}</p></div>
                  <div className="card p-3 border border-white/8"><p className="text-[10px] text-white/30 mb-1">Producto gancho</p><p className="text-white/70 text-xs">{output.live_shopping.productos_gancho}</p></div>
                </div>
              </div>
            )}

            {activeTab === 'kpis' && (
              <div className="space-y-3 animate-fade-up">
                {output.kpis.map((k, i) => (
                  <div key={i} className="card p-4 border border-white/8">
                    <p className="text-white text-xs font-semibold mb-2">{k.metrica}</p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="p-2 bg-amber-500/8 border border-amber-500/15 rounded-lg text-center"><p className="text-[9px] text-amber-400/60">Bueno</p><p className="text-amber-400 text-xs font-bold">{k.bueno}</p></div>
                      <div className="p-2 bg-emerald-500/8 border border-emerald-500/15 rounded-lg text-center"><p className="text-[9px] text-emerald-400/60">Excelente</p><p className="text-emerald-400 text-xs font-bold">{k.excelente}</p></div>
                    </div>
                    <p className="text-white/40 text-[10px]">Si está mal: {k.accion_si_malo}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'calendario' && (
              <div className="card p-5 border border-white/8 animate-fade-up">
                <p className="text-white font-semibold text-sm mb-3">📅 Plan 30 días</p>
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{output.calendario_30dias}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="text-[10px] text-white/25 hover:text-pink-400 transition-colors">{copied ? '✓ Copiado' : '⊕ Copiar'}</button>
  )
}
