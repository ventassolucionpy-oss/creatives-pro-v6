'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type NichoOutput = {
  resumen: { potencial: 'alto' | 'medio' | 'bajo'; score: number; veredicto: string }
  mercado: { tamano: string; crecimiento: string; estacionalidad: string; madurez: string }
  competencia: { nivel: string; principales_jugadores: string[]; precio_promedio_mercado: string; diferenciacion_posible: string }
  publico: { perfil_principal: string; demografia: string; dolores_principales: string[]; motivaciones_compra: string[] }
  angulos_venta: Array<{ angulo: string; efectividad: 'alta' | 'media' | 'baja'; por_que: string; ejemplo_hook: string }>
  precio: { rango_recomendado: string; precio_psicologico: string; estrategia: string }
  canales: Array<{ canal: string; potencial: 'alto' | 'medio' | 'bajo'; por_que: string; presupuesto_minimo: string }>
  advertencias: string[]
  plan_accion: Array<{ paso: number; accion: string; cuando: string; kpi: string }>
}

async function callClaude(prompt: string): Promise<NichoOutput> {
    const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  })
  if (!res.ok) throw new Error(`Error API (${res.status})`)
  const data = await res.json()
  const raw: string = data.text || ''
  let clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const s = clean.indexOf('{'), e = clean.lastIndexOf('}')
  if (s >= 0 && e > s) clean = clean.slice(s, e + 1)
  return JSON.parse(clean) as NichoOutput
}

function buildNichoPrompt(producto: string, descripcion: string, pais: string, modelo: string): string {
  return `Sos un experto en análisis de mercados para ecommerce, dropshipping y productos digitales en LATAM con 10+ años de experiencia. Has lanzado más de 200 productos y sabés exactamente qué funciona y qué no.

PRODUCTO A ANALIZAR:
- Nombre: ${producto}
- Descripción: ${descripcion}
- País objetivo: ${pais}
- Modelo de negocio: ${modelo}

Analizá este producto/nicho con honestidad brutal. No suavices la realidad — si el nicho está saturado o tiene poco potencial, decilo claramente.

Respondé SOLO con JSON válido:
{
  "resumen": {
    "potencial": "alto | medio | bajo",
    "score": 7.5,
    "veredicto": "2-3 líneas directas sobre el potencial real de este producto en este mercado y modelo de negocio"
  },
  "mercado": {
    "tamano": "tamaño estimado del mercado en ${pais}",
    "crecimiento": "tendencia: creciendo / estable / bajando y por qué",
    "estacionalidad": "¿tiene picos estacionales? cuándo y qué tanto afecta",
    "madurez": "nicho nuevo / en crecimiento / maduro / saturado"
  },
  "competencia": {
    "nivel": "baja / media / alta / muy alta",
    "principales_jugadores": ["competidor tipo 1 (ej: tiendas de ropa online)", "competidor tipo 2", "competidor tipo 3"],
    "precio_promedio_mercado": "rango de precios que maneja la competencia para este tipo de producto",
    "diferenciacion_posible": "cómo diferenciarse de forma real y sostenible en este mercado"
  },
  "publico": {
    "perfil_principal": "descripción del comprador ideal para este producto en ${pais}",
    "demografia": "edad, género, NSE, ubicación específica",
    "dolores_principales": ["dolor más frecuente del público 1", "dolor 2", "dolor 3", "dolor 4"],
    "motivaciones_compra": ["motivación de compra 1 (qué los mueve a comprar)", "motivación 2", "motivación 3"]
  },
  "angulos_venta": [
    { "angulo": "nombre del ángulo", "efectividad": "alta", "por_que": "por qué este ángulo convierte para este producto y público", "ejemplo_hook": "hook de ejemplo listo para usar en un anuncio" },
    { "angulo": "...", "efectividad": "alta", "por_que": "...", "ejemplo_hook": "..." },
    { "angulo": "...", "efectividad": "media", "por_que": "...", "ejemplo_hook": "..." },
    { "angulo": "...", "efectividad": "media", "por_que": "...", "ejemplo_hook": "..." }
  ],
  "precio": {
    "rango_recomendado": "rango de precio que maximiza conversión en ${pais}",
    "precio_psicologico": "precio específico recomendado (ej: Gs. 149.000 en lugar de 150.000)",
    "estrategia": "estrategia de precio: premium / competitivo / valor percibido / freemium"
  },
  "canales": [
    { "canal": "Meta Ads (Facebook/Instagram)", "potencial": "alto", "por_que": "por qué este canal funciona o no para este producto", "presupuesto_minimo": "USD mínimo para obtener datos" },
    { "canal": "TikTok Shop / TikTok Ads", "potencial": "medio", "por_que": "...", "presupuesto_minimo": "..." },
    { "canal": "Orgánico / Redes sociales", "potencial": "medio", "por_que": "...", "presupuesto_minimo": "sin costo" },
    { "canal": "WhatsApp Marketing", "potencial": "alto", "por_que": "...", "presupuesto_minimo": "..." }
  ],
  "advertencias": [
    "riesgo real más importante a tener en cuenta",
    "advertencia 2",
    "advertencia 3"
  ],
  "plan_accion": [
    { "paso": 1, "accion": "primera acción concreta a tomar", "cuando": "Semana 1", "kpi": "cómo medir que lo lograste" },
    { "paso": 2, "accion": "...", "cuando": "Semana 1-2", "kpi": "..." },
    { "paso": 3, "accion": "...", "cuando": "Semana 2-3", "kpi": "..." },
    { "paso": 4, "accion": "...", "cuando": "Mes 2", "kpi": "..." },
    { "paso": 5, "accion": "...", "cuando": "Mes 2-3", "kpi": "..." }
  ]
}`
}

export default function NichoPage() {
  const [producto, setProducto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [pais, setPais] = useState('Paraguay')
  const [modelo, setModelo] = useState('Dropshipping')
  const [output, setOutput] = useState<NichoOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const analyze = async () => {
    if (!producto.trim()) return
    setLoading(true); setError(''); setOutput(null)
    try {
      const result = await callClaude(buildNichoPrompt(producto, descripcion, pais, modelo))
      setOutput(result)
    } catch (e) { setError(e instanceof Error ? e.message : 'Error') }
    setLoading(false)
  }

  const save = async () => {
    if (!output) return
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('generations').insert({ user_id: user.id, tool: 'analisis-nicho', status: 'completed', input: { producto, descripcion, pais, modelo }, output })
      setSaved(true)
    }
  }

  const potencialColor = { alto: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/8', medio: 'text-amber-400 border-amber-500/30 bg-amber-500/8', bajo: 'text-red-400 border-red-500/30 bg-red-500/8' }
  const efectividadColor = { alta: 'tag-green', media: 'tag-gold', baja: 'tag-red' }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">

        <div className="flex items-center gap-3 mb-8">
          <Link href="/crear" className="btn-ghost text-white/30 hover:text-white p-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">Análisis de Nicho</h1>
              <span className="tag tag-amber text-[10px]">📊 Inteligencia</span>
            </div>
            <p className="text-white/40 text-xs">Evaluá el potencial real de un producto antes de invertir en ads</p>
          </div>
        </div>

        {!output && (
          <div className="space-y-5 animate-fade-up">
            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5">Producto a analizar *</label>
              <input className="input" value={producto} onChange={e => setProducto(e.target.value)} placeholder="Ej: Masajeador de cuello eléctrico, Curso de dropshipping, Crema anti-arrugas..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5">Descripción (opcional pero mejora el análisis)</label>
              <textarea className="input resize-none h-20 text-sm" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Describe el producto, cómo funciona, qué lo diferencia..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5">País objetivo</label>
                <select className="input cursor-pointer" value={pais} onChange={e => setPais(e.target.value)}>
                  {['Paraguay','Argentina','Uruguay','Chile','Colombia','México','LATAM completo'].map(o => <option key={o} value={o} style={{ background: '#111' }}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5">Modelo de negocio</label>
                <select className="input cursor-pointer" value={modelo} onChange={e => setModelo(e.target.value)}>
                  {['Dropshipping','Ecommerce propio','Producto digital / Hotmart','Servicio','Afiliado'].map(o => <option key={o} value={o} style={{ background: '#111' }}>{o}</option>)}
                </select>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={analyze} disabled={!producto.trim() || loading} className="btn-primary w-full py-4 text-base">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />Analizando el nicho...</> : '📊 Analizar potencial del nicho →'}
            </button>
          </div>
        )}

        {output && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold">Análisis: {producto}</h2>
              <div className="flex gap-2">
                <button onClick={save} disabled={saved} className={`text-xs px-3 py-2 rounded-lg border transition-all ${saved ? 'border-emerald-500/40 text-emerald-400' : 'border-white/15 text-white/50 hover:border-white/30'}`}>{saved ? '✓' : '💾 Guardar'}</button>
                <button onClick={() => { setOutput(null); setSaved(false) }} className="btn-secondary text-xs px-3 py-2">← Nuevo</button>
              </div>
            </div>

            {/* Score */}
            <div className={`card p-5 border rounded-2xl ${potencialColor[output.resumen.potencial]}`}>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 rounded-2xl bg-current/10 flex items-center justify-center flex-shrink-0">
                  <p className="text-3xl font-black">{output.resumen.score}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1">Potencial del nicho</p>
                  <p className="font-bold text-lg capitalize">{output.resumen.potencial}</p>
                </div>
              </div>
              <p className="text-sm opacity-80 leading-relaxed">{output.resumen.veredicto}</p>
            </div>

            {/* Mercado */}
            <div className="card p-5 border border-white/8">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">📈 Análisis de Mercado</p>
              <div className="grid grid-cols-2 gap-3">
                {[['Tamaño', output.mercado.tamano], ['Crecimiento', output.mercado.crecimiento], ['Estacionalidad', output.mercado.estacionalidad], ['Madurez', output.mercado.madurez]].map(([l, v]) => (
                  <div key={l} className="p-3 bg-white/3 rounded-lg"><p className="text-[10px] text-white/30 mb-1">{l}</p><p className="text-white/70 text-xs">{v}</p></div>
                ))}
              </div>
            </div>

            {/* Competencia */}
            <div className="card p-5 border border-white/8">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">⚔️ Competencia</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><p className="text-white/30 text-xs w-24">Nivel</p><span className={`tag ${output.competencia.nivel === 'baja' ? 'tag-green' : output.competencia.nivel === 'media' ? 'tag-gold' : 'tag-red'} text-[10px]`}>{output.competencia.nivel}</span></div>
                <div className="flex gap-2"><p className="text-white/30 text-xs w-24 flex-shrink-0">Precio mercado</p><p className="text-white/70 text-xs">{output.competencia.precio_promedio_mercado}</p></div>
                <div className="flex gap-2"><p className="text-white/30 text-xs w-24 flex-shrink-0">Diferenciación</p><p className="text-white/70 text-xs leading-relaxed">{output.competencia.diferenciacion_posible}</p></div>
                <div className="flex flex-wrap gap-1.5 pt-1">{output.competencia.principales_jugadores.map((j, i) => <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/8 rounded text-[10px] text-white/40">{j}</span>)}</div>
              </div>
            </div>

            {/* Ángulos de venta */}
            <div className="card p-5 border border-white/8">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">🎯 Ángulos de Venta Recomendados</p>
              <div className="space-y-3">
                {output.angulos_venta.map((a, i) => (
                  <div key={i} className="p-3 bg-white/3 border border-white/8 rounded-xl">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`tag ${efectividadColor[a.efectividad]} text-[10px]`}>{a.efectividad}</span>
                      <p className="text-white text-xs font-semibold">{a.angulo}</p>
                    </div>
                    <p className="text-white/50 text-xs mb-2 leading-relaxed">{a.por_que}</p>
                    <div className="p-2 bg-violet-500/8 border border-violet-500/15 rounded-lg">
                      <p className="text-[10px] text-violet-400/60 mb-0.5">Hook de ejemplo</p>
                      <p className="text-white/70 text-xs italic">"{a.ejemplo_hook}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Canales */}
            <div className="card p-5 border border-white/8">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">📡 Canales de Venta</p>
              <div className="space-y-2">
                {output.canales.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/3 rounded-lg">
                    <span className={`tag ${efectividadColor[c.potencial]} text-[10px] flex-shrink-0 mt-0.5`}>{c.potencial}</span>
                    <div className="flex-1"><p className="text-white text-xs font-semibold mb-0.5">{c.canal}</p><p className="text-white/50 text-xs leading-relaxed">{c.por_que}</p></div>
                    <p className="text-white/25 text-[10px] flex-shrink-0">{c.presupuesto_minimo}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Advertencias */}
            {output.advertencias.length > 0 && (
              <div className="card p-4 border border-red-500/20 bg-red-500/5">
                <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-3">⚠️ Riesgos y advertencias</p>
                {output.advertencias.map((a, i) => <p key={i} className="text-white/60 text-xs mb-1.5">• {a}</p>)}
              </div>
            )}

            {/* Plan de acción */}
            <div className="card p-5 border border-violet-500/15">
              <p className="text-xs font-bold text-violet-400/60 uppercase tracking-wider mb-3">🗺️ Plan de Acción</p>
              <div className="space-y-3">
                {output.plan_accion.map(p => (
                  <div key={p.paso} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-violet-600/20 flex items-center justify-center text-violet-300 text-xs font-bold flex-shrink-0">{p.paso}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-white text-xs font-semibold">{p.accion}</p>
                        <span className="text-white/25 text-[10px]">{p.cuando}</span>
                      </div>
                      <p className="text-white/40 text-[10px]">KPI: {p.kpi}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/campana" className="btn-primary w-full py-3 text-center block">
              ⚡ Crear campaña completa para este producto →
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
