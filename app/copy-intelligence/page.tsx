'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Insight = {
  resumen_performance: string
  framework_ganador: { nombre: string; roas_promedio: number; por_que: string }
  angulo_ganador: { nombre: string; roas_promedio: number; por_que: string }
  nivel_conciencia_optimo: { nivel: number; roas_promedio: number; por_que: string }
  patron_hooks: string
  patron_ctas: string
  recomendaciones: Array<{ titulo: string; accion: string; impacto: 'alto' | 'medio' | 'bajo' }>
  proxima_generacion: string
  advertencias: string[]
}

type AdResult = {
  id: string
  framework: string
  angulo: string
  hook: string
  nivel_conciencia: number
  roas: number
  ctr: number
  cpa: number
  estado: string
  fecha: string
  producto_nombre: string
}

async function getInsights(results: AdResult[]): Promise<Insight> {
    const summary = results.map(r =>
    `Framework: ${r.framework} | Ángulo: ${r.angulo} | Nivel: ${r.nivel_conciencia} | ROAS: ${r.roas.toFixed(2)}x | CTR: ${(r.ctr * 100).toFixed(2)}% | Estado: ${r.estado} | Producto: ${r.producto_nombre}`
  ).join('\n')

  const prompt = `Sos un analista de performance de Meta Ads con 10+ años de experiencia. Analizás los datos históricos de campañas para encontrar PATRONES que permitan mejorar las próximas generaciones de copy.

DATOS HISTÓRICOS DE ${results.length} ADS:
${summary}

Tu trabajo: encontrar qué funciona y qué no, con análisis estadístico brutal. No suavices los datos — si algo no funciona, decilo.

Respondé SOLO con JSON válido:
{
  "resumen_performance": "diagnóstico de 2-3 líneas del estado general de performance basado en los datos",
  "framework_ganador": {
    "nombre": "el framework con mejor ROAS promedio",
    "roas_promedio": 2.5,
    "por_que": "explicación de por qué este framework convierte mejor para este operador/productos"
  },
  "angulo_ganador": {
    "nombre": "el ángulo de venta con mejor ROAS promedio",
    "roas_promedio": 2.8,
    "por_que": "por qué este ángulo resuena mejor con el público"
  },
  "nivel_conciencia_optimo": {
    "nivel": 3,
    "roas_promedio": 2.6,
    "por_que": "por qué este nivel de conciencia tiene mejor performance"
  },
  "patron_hooks": "qué tienen en común los hooks de los ads ganadores — patrón identificable",
  "patron_ctas": "qué tienen en común los CTAs que más convierten",
  "recomendaciones": [
    { "titulo": "título de la recomendación", "accion": "acción concreta a tomar en la próxima generación de copies", "impacto": "alto" },
    { "titulo": "...", "accion": "...", "impacto": "medio" },
    { "titulo": "...", "accion": "...", "impacto": "alto" }
  ],
  "proxima_generacion": "instrucción concreta para la próxima vez que generes copies — qué cambiar, qué mantener, qué testear",
  "advertencias": ["pattern que hay que evitar basado en los datos", "advertencia 2"]
}`

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  })
  const data = await res.json()
  const raw: string = data.text || ''
  let clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const s = clean.indexOf('{'), e = clean.lastIndexOf('}')
  if (s >= 0 && e > s) clean = clean.slice(s, e + 1)
  return JSON.parse(clean) as Insight
}

function ImpactBadge({ impact }: { impact: 'alto' | 'medio' | 'bajo' }) {
  const colors = { alto: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', medio: 'bg-amber-500/15 text-amber-400 border-amber-500/25', bajo: 'bg-white/8 text-white/40 border-white/10' }
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${colors[impact]}`}>{impact}</span>
}

function BarChart({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="flex items-center gap-3">
      <p className="text-white/50 text-xs w-28 flex-shrink-0 truncate">{label}</p>
      <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%`, transition: 'width 0.6s ease' }} />
      </div>
      <p className="text-white/70 text-xs w-10 text-right font-mono">{value.toFixed(2)}x</p>
    </div>
  )
}

export default function CopyIntelligencePage() {
  const [results, setResults] = useState<AdResult[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [insight, setInsight] = useState<Insight | null>(null)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const { data } = await supabase.from('ad_results').select('*').gt('roas', 0).order('fecha', { ascending: false }).limit(100)
    setResults((data || []) as AdResult[])
    setLoading(false)
  }

  const analyze = async () => {
    if (results.length < 5) { setError('Necesitás al menos 5 resultados cargados en el Tracker para analizar patrones.'); return }
    setAnalyzing(true); setError('')
    try { setInsight(await getInsights(results)) }
    catch { setError('Error al analizar. Revisá tu API key.') }
    setAnalyzing(false)
  }

  // Local analytics
  const byFramework: Record<string, number[]> = {}
  const byAngulo: Record<string, number[]> = {}
  const byNivel: Record<number, number[]> = {}
  results.forEach(r => {
    if (r.roas <= 0) return
    if (r.framework) { if (!byFramework[r.framework]) byFramework[r.framework] = []; byFramework[r.framework].push(r.roas) }
    if (r.angulo) { if (!byAngulo[r.angulo]) byAngulo[r.angulo] = []; byAngulo[r.angulo].push(r.roas) }
    if (r.nivel_conciencia) { if (!byNivel[r.nivel_conciencia]) byNivel[r.nivel_conciencia] = []; byNivel[r.nivel_conciencia].push(r.roas) }
  })

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
  const sortedFw = Object.entries(byFramework).map(([k, v]) => ({ k, avg: avg(v), count: v.length })).sort((a, b) => b.avg - a.avg)
  const sortedAng = Object.entries(byAngulo).map(([k, v]) => ({ k, avg: avg(v), count: v.length })).sort((a, b) => b.avg - a.avg)
  const maxRoas = Math.max(...sortedFw.map(f => f.avg), 0.1)
  const maxAngRoas = Math.max(...sortedAng.map(a => a.avg), 0.1)

  const ganadoras = results.filter(r => r.estado === 'ganadora').length
  const totalGasto = results.reduce((s, r) => s + (r.roas > 0 ? 1 : 0), 0)
  const roasGlobal = results.length > 0 ? avg(results.filter(r => r.roas > 0).map(r => r.roas)) : 0

  return (
    <div className="min-h-screen">
      <Link href="/crear" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/gestionar" className="btn-ghost text-white/30 hover:text-white p-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">Copy Intelligence</h1>
              <span className="tag tag-violet text-[10px]">🧠 Aprende de tus datos</span>
            </div>
            <p className="text-white/40 text-xs">La IA analiza TODOS tus resultados históricos y te dice exactamente qué generar la próxima vez</p>
          </div>
        </div>

        {loading ? (
          <div className="card p-12 text-center"><span className="w-6 h-6 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin block mx-auto" /></div>
        ) : results.length === 0 ? (
          <div className="card p-12 text-center space-y-4">
            <p className="text-4xl">🧠</p>
            <p className="text-white font-semibold">Sin datos todavía</p>
            <p className="text-white/40 text-sm">Copy Intelligence aprende de tus resultados reales. Primero cargá algunos resultados en el Tracker, luego volvé acá para ver los patrones.</p>
            <Link href="/gestionar" className="btn-primary text-sm px-5 py-2.5 inline-flex">→ Ir al Tracker</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats rápidas */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { l: 'Ads analizados', v: results.length, c: 'text-white' },
                { l: 'ROAS promedio', v: `${roasGlobal.toFixed(2)}x`, c: roasGlobal >= 2 ? 'text-emerald-400' : roasGlobal >= 1 ? 'text-amber-400' : 'text-red-400' },
                { l: 'Ads ganadores', v: ganadoras, c: 'text-emerald-400' },
                { l: 'Frameworks testeados', v: sortedFw.length, c: 'text-violet-400' },
              ].map((s, i) => <div key={i} className="card p-3 text-center"><p className={`text-xl font-bold ${s.c}`}>{s.v}</p><p className="text-[10px] text-white/25 mt-0.5">{s.l}</p></div>)}
            </div>

            {/* Charts locales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card p-5 border border-white/8">
                <p className="text-white font-semibold text-sm mb-4">ROAS por Framework</p>
                <div className="space-y-3">
                  {sortedFw.slice(0, 6).map(f => (
                    <div key={f.k}>
                      <BarChart label={f.k} value={f.avg} max={maxRoas} color={f.avg >= 2 ? 'bg-emerald-500' : f.avg >= 1 ? 'bg-amber-500' : 'bg-red-500'} />
                      <p className="text-[10px] text-white/20 ml-31 pl-31 mt-0.5" style={{ marginLeft: '7.75rem' }}>{f.count} {f.count === 1 ? 'ad' : 'ads'}</p>
                    </div>
                  ))}
                  {sortedFw.length === 0 && <p className="text-white/25 text-xs">Sin datos de framework</p>}
                </div>
              </div>
              <div className="card p-5 border border-white/8">
                <p className="text-white font-semibold text-sm mb-4">ROAS por Ángulo</p>
                <div className="space-y-3">
                  {sortedAng.slice(0, 6).map(a => (
                    <BarChart key={a.k} label={a.k.length > 20 ? a.k.slice(0, 20) + '…' : a.k} value={a.avg} max={maxAngRoas} color={a.avg >= 2 ? 'bg-violet-500' : a.avg >= 1 ? 'bg-amber-500' : 'bg-red-500'} />
                  ))}
                  {sortedAng.length === 0 && <p className="text-white/25 text-xs">Sin datos de ángulo</p>}
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            {!insight ? (
              <div className="card p-6 text-center border border-violet-500/15">
                <p className="text-white font-semibold mb-2">🧠 Análisis IA profundo</p>
                <p className="text-white/40 text-sm mb-5">La IA analiza los patrones de tus {results.length} ads históricos y te dice exactamente qué generar la próxima vez para maximizar el ROAS.</p>
                {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
                <button onClick={analyze} disabled={analyzing} className="btn-primary px-6 py-3">
                  {analyzing ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />Analizando {results.length} ads...</> : `🧠 Analizar ${results.length} ads con IA →`}
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-up">
                <div className="card p-5 border border-violet-500/25 bg-violet-500/5">
                  <p className="text-violet-300 text-[10px] font-bold uppercase tracking-wider mb-2">🧠 Diagnóstico IA</p>
                  <p className="text-white/80 text-sm leading-relaxed">{insight.resumen_performance}</p>
                </div>

                {/* Top performers */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { l: '🏆 Framework ganador', v: insight.framework_ganador.nombre, sub: `${insight.framework_ganador.roas_promedio.toFixed(2)}x ROAS`, why: insight.framework_ganador.por_que, c: 'border-emerald-500/20 bg-emerald-500/5' },
                    { l: '🎯 Ángulo ganador', v: insight.angulo_ganador.nombre, sub: `${insight.angulo_ganador.roas_promedio.toFixed(2)}x ROAS`, why: insight.angulo_ganador.por_que, c: 'border-violet-500/20 bg-violet-500/5' },
                    { l: '📊 Nivel óptimo', v: `Nivel ${insight.nivel_conciencia_optimo.nivel}`, sub: `${insight.nivel_conciencia_optimo.roas_promedio.toFixed(2)}x ROAS`, why: insight.nivel_conciencia_optimo.por_que, c: 'border-blue-500/20 bg-blue-500/5' },
                  ].map(c => (
                    <div key={c.l} className={`card p-4 border ${c.c}`}>
                      <p className="text-[10px] text-white/30 mb-1">{c.l}</p>
                      <p className="text-white font-bold text-sm mb-0.5">{c.v}</p>
                      <p className="text-emerald-400 text-xs font-semibold mb-2">{c.sub}</p>
                      <p className="text-white/40 text-[10px] leading-relaxed">{c.why}</p>
                    </div>
                  ))}
                </div>

                {/* Patrones */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="card p-4 border border-white/8">
                    <p className="text-[10px] text-white/30 uppercase mb-2">Patrón en Hooks ganadores</p>
                    <p className="text-white/70 text-sm leading-relaxed">{insight.patron_hooks}</p>
                  </div>
                  <div className="card p-4 border border-white/8">
                    <p className="text-[10px] text-white/30 uppercase mb-2">Patrón en CTAs ganadores</p>
                    <p className="text-white/70 text-sm leading-relaxed">{insight.patron_ctas}</p>
                  </div>
                </div>

                {/* Próxima generación */}
                <div className="card p-5 border border-amber-500/25 bg-amber-500/8">
                  <p className="text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-2">⚡ La próxima vez que generes copies — hacé esto</p>
                  <p className="text-white font-medium text-sm leading-relaxed">{insight.proxima_generacion}</p>
                </div>

                {/* Recomendaciones */}
                <div>
                  <p className="text-xs font-semibold text-white/25 uppercase tracking-widest mb-3">Recomendaciones concretas</p>
                  <div className="space-y-2">
                    {insight.recomendaciones.map((r, i) => (
                      <div key={i} className="card p-4 border border-white/8">
                        <div className="flex items-center gap-2 mb-1.5">
                          <ImpactBadge impact={r.impacto} />
                          <p className="text-white text-xs font-semibold">{r.titulo}</p>
                        </div>
                        <p className="text-white/60 text-xs leading-relaxed">{r.accion}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advertencias */}
                {insight.advertencias?.length > 0 && (
                  <div className="card p-4 border border-red-500/20 bg-red-500/5">
                    <p className="text-red-400 text-[10px] font-bold uppercase mb-2">⚠️ Patrones a evitar</p>
                    {insight.advertencias.map((a, i) => <p key={i} className="text-white/60 text-xs mb-1">• {a}</p>)}
                  </div>
                )}

                <div className="flex gap-2 mb-2">
                  <button onClick={() => setInsight(null)} className="btn-secondary flex-1 text-sm py-2.5">↺ Re-analizar</button>
                  <Link href="/campana" className="btn-primary flex-1 text-center text-sm py-2.5">⚡ Generar con estos insights →</Link>
                </div>
                <div className="flex gap-2">
                  <Link href="/postmortem" className="flex-1 text-center py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 text-sm transition-all">🪦 Post-mortem →</Link>
                  <Link href="/comparador-copies" className="flex-1 text-center py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 text-sm transition-all">⚖️ Comparar copies →</Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
