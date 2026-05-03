'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

type PostmortemOutput = {
  diagnostico: {
    causa_principal: string
    factores_secundarios: string[]
    fue_el_creativo: boolean
    fue_la_audiencia: boolean
    fue_el_producto: boolean
    fue_el_precio: boolean
  }
  que_funcionó: Array<{ elemento: string; por_que: string; reutilizar: string }>
  que_no_funcionó: Array<{ elemento: string; por_que: string; no_repetir: string }>
  aprendizajes_clave: string[]
  proxima_campana: {
    hook_recomendado: string
    audiencia_recomendada: string
    precio_recomendado: string
    formato_recomendado: string
    cambio_principal: string
  }
  score_campana: number
  epitafio: string
}

async function callClaude(datos: Record<string, string>): Promise<PostmortemOutput> {
  
  const prompt = `Sos el chief media buyer de una operación de dropshipping exitosa. Hacés el post-mortem de una campaña que terminó (ya sea porque murió, se apagó o la pausaste).

DATOS DE LA CAMPAÑA:
- Producto: ${datos.producto}
- Plataforma: ${datos.plataforma}
- Presupuesto total gastado: ${datos.gasto}
- Duración: ${datos.duracion} días
- ROAS final: ${datos.roas}x
- CPA: ${datos.cpa}
- CTR: ${datos.ctr}%
- Frecuencia al final: ${datos.frecuencia}
- Ventas totales: ${datos.ventas}
- Precio de venta: Gs. ${datos.precio}
- Hook principal usado: ${datos.hook}
- Audiencia: ${datos.audiencia}
- Formato del creativo: ${datos.formato}
- Por qué se detuvo: ${datos.razon_pausa}
- Notas del operador: ${datos.notas || 'Sin notas adicionales'}

Hacé un análisis BRUTAL y honesto. Sin suavizar. Las campañas que no funcionaron enseñan más que las que sí.

Respondé SOLO con JSON válido:
{
  "diagnostico": {
    "causa_principal": "la razón principal por la que esta campaña murió o no funcionó bien",
    "factores_secundarios": ["factor 1", "factor 2", "factor 3"],
    "fue_el_creativo": true,
    "fue_la_audiencia": false,
    "fue_el_producto": false,
    "fue_el_precio": false
  },
  "que_funcionó": [
    {
      "elemento": "nombre del elemento que funcionó",
      "por_que": "por qué funcionó",
      "reutilizar": "cómo reutilizarlo en la próxima campaña"
    }
  ],
  "que_no_funcionó": [
    {
      "elemento": "nombre del elemento que falló",
      "por_que": "análisis real de por qué falló",
      "no_repetir": "qué hacer diferente la próxima vez"
    }
  ],
  "aprendizajes_clave": ["aprendizaje 1 concreto y accionable", "aprendizaje 2", "aprendizaje 3"],
  "proxima_campana": {
    "hook_recomendado": "tipo de hook o frase inicial recomendada para el próximo intento",
    "audiencia_recomendada": "ajuste de audiencia para el próximo intento",
    "precio_recomendado": "precio sugerido con justificación",
    "formato_recomendado": "imagen/video/carrusel y por qué",
    "cambio_principal": "el UN cambio más importante para hacer en el próximo intento"
  },
  "score_campana": 6.5,
  "epitafio": "frase memorable de 1 línea que resume esta campaña — el aprendizaje más importante"
}`

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await res.json()
  const text = data.content[0].text
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export default function PostmortemPage() {
  const [datos, setDatos] = useState({
    producto: '', plataforma: 'Meta Ads', gasto: '', duracion: '',
    roas: '', cpa: '', ctr: '', frecuencia: '', ventas: '', precio: '',
    hook: '', audiencia: '', formato: 'Video', razon_pausa: '', notas: '',
  })
  const [output, setOutput] = useState<PostmortemOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'diagnostico' | 'que_paso' | 'proxima'>('diagnostico')

  const update = (k: string, v: string) => setDatos(prev => ({ ...prev, [k]: v }))

  const handleGenerate = async () => {
    if (!datos.producto || !datos.gasto || !datos.roas) return
    setLoading(true)
    try {
      const result = await callClaude(datos)
      setOutput(result)
      setTab('diagnostico')
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-white/20'
  const labelCls = 'block text-xs text-white/40 mb-1.5 font-medium'

  const scoreColor = (s: number) => s >= 7 ? 'text-emerald-400' : s >= 4 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="min-h-screen">
      <Link href="/gestionar" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/gestionar" className="text-white/30 hover:text-white/60 text-sm transition-colors">Gestionar</Link>
            <span className="text-white/20 text-sm">›</span>
            <span className="text-white/60 text-sm">Post-mortem</span>
          </div>
          <h1 className="text-2xl font-bold text-white">🪦 Post-mortem de Campaña</h1>
          <p className="text-white/40 text-sm mt-1">Cuando una campaña muere — analizá qué pasó para no repetirlo</p>
        </div>

        {/* Form */}
        <div className="card p-5 mb-5 border border-white/8">
          <p className="text-sm font-bold text-white mb-4">Datos de la campaña</p>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Producto</label>
              <input className={inputCls} placeholder="ej. Masajeador de cuello eléctrico" value={datos.producto} onChange={e => update('producto', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Plataforma</label>
                <select className={inputCls} value={datos.plataforma} onChange={e => update('plataforma', e.target.value)}>
                  <option>Meta Ads</option>
                  <option>TikTok Ads</option>
                  <option>Ambas</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Formato del creativo</label>
                <select className={inputCls} value={datos.formato} onChange={e => update('formato', e.target.value)}>
                  <option>Video</option>
                  <option>Imagen</option>
                  <option>Carrusel</option>
                  <option>UGC</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Gasto total (Gs.)</label>
                <input className={inputCls} type="number" placeholder="ej. 2000000" value={datos.gasto} onChange={e => update('gasto', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Duración (días)</label>
                <input className={inputCls} type="number" placeholder="ej. 14" value={datos.duracion} onChange={e => update('duracion', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>ROAS final</label>
                <input className={inputCls} type="number" step="0.1" placeholder="ej. 1.8" value={datos.roas} onChange={e => update('roas', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>CPA (Gs.)</label>
                <input className={inputCls} type="number" placeholder="ej. 45000" value={datos.cpa} onChange={e => update('cpa', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={labelCls}>CTR %</label>
                <input className={inputCls} type="number" step="0.01" placeholder="1.2" value={datos.ctr} onChange={e => update('ctr', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Frecuencia</label>
                <input className={inputCls} type="number" step="0.1" placeholder="2.4" value={datos.frecuencia} onChange={e => update('frecuencia', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Ventas</label>
                <input className={inputCls} type="number" placeholder="32" value={datos.ventas} onChange={e => update('ventas', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Precio venta (Gs.)</label>
                <input className={inputCls} type="number" placeholder="157000" value={datos.precio} onChange={e => update('precio', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>¿Por qué se pausó?</label>
                <select className={inputCls} value={datos.razon_pausa} onChange={e => update('razon_pausa', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  <option>ROAS cayó por debajo del mínimo</option>
                  <option>Se agotó el presupuesto</option>
                  <option>Fatiga creativa (frecuencia alta)</option>
                  <option>Stock agotado</option>
                  <option>Producto mal recibido</option>
                  <option>Competencia entró al mercado</option>
                  <option>Meta/TikTok desaprobó el anuncio</option>
                  <option>Decisión estratégica — cambio de producto</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Hook principal del creativo</label>
              <input className={inputCls} placeholder="ej. ¿Cuántos años más vas a vivir con ese dolor?" value={datos.hook} onChange={e => update('hook', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Audiencia configurada</label>
              <input className={inputCls} placeholder="ej. Mujeres 30-50, intereses salud, fitness, lookalike 1%" value={datos.audiencia} onChange={e => update('audiencia', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Tus notas (opcional)</label>
              <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Qué sentiste que pasó, qué testaste, observaciones..." value={datos.notas} onChange={e => update('notas', e.target.value)} />
            </div>
            <button onClick={handleGenerate} disabled={!datos.producto || !datos.gasto || !datos.roas || loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-sm transition-all">
              {loading ? '⏳ Analizando campaña...' : '🪦 Hacer el post-mortem'}
            </button>
          </div>
        </div>

        {/* Output */}
        {output && (
          <>
            {/* Score + epitafio */}
            <div className="card p-5 border border-white/10 mb-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white/40 text-xs">Score de campaña</p>
                  <p className={`text-4xl font-black ${scoreColor(output.score_campana)}`}>{output.score_campana}/10</p>
                </div>
                <div className="text-5xl">
                  {output.score_campana >= 7 ? '📈' : output.score_campana >= 4 ? '📊' : '📉'}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-white/30 text-[10px] font-bold mb-1 uppercase">Epitafio</p>
                <p className="text-white/70 text-sm italic">"{output.epitafio}"</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 p-1 bg-white/5 rounded-xl">
              {[
                { k: 'diagnostico', label: '🔍 Diagnóstico' },
                { k: 'que_paso', label: '📋 Análisis' },
                { k: 'proxima', label: '🚀 Próxima' },
              ].map(t => (
                <button key={t.k} onClick={() => setTab(t.k as typeof tab)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.k ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white/60'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'diagnostico' && (
              <div className="space-y-3">
                <div className="card p-4 border border-red-500/20 bg-red-500/5">
                  <p className="text-red-400 font-bold text-sm mb-2">🔴 Causa principal</p>
                  <p className="text-white/70 text-sm">{output.diagnostico.causa_principal}</p>
                </div>
                <div className="card p-4 border border-amber-500/20 bg-amber-500/5">
                  <p className="text-amber-400 font-bold text-sm mb-3">⚠️ Factores secundarios</p>
                  {output.diagnostico.factores_secundarios.map((f, i) => (
                    <p key={i} className="text-white/60 text-xs mb-1.5">• {f}</p>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Creativo', val: output.diagnostico.fue_el_creativo },
                    { label: 'Audiencia', val: output.diagnostico.fue_la_audiencia },
                    { label: 'Producto', val: output.diagnostico.fue_el_producto },
                    { label: 'Precio', val: output.diagnostico.fue_el_precio },
                  ].map(item => (
                    <div key={item.label} className={`card p-3 border text-center ${item.val ? 'border-red-500/30 bg-red-500/5' : 'border-white/5'}`}>
                      <p className={`text-lg ${item.val ? '' : 'opacity-20'}`}>{item.val ? '🔴' : '✅'}</p>
                      <p className={`text-xs font-bold mt-1 ${item.val ? 'text-red-400' : 'text-white/30'}`}>{item.label}</p>
                      <p className="text-[10px] text-white/25">{item.val ? 'Falló aquí' : 'Sin problema'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'que_paso' && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">✅ Qué funcionó</p>
                  {output.que_funcionó.map((q, i) => (
                    <div key={i} className="card p-4 border border-emerald-500/20 bg-emerald-500/5 mb-2">
                      <p className="text-white font-bold text-sm">{q.elemento}</p>
                      <p className="text-white/50 text-xs mt-1">{q.por_que}</p>
                      <p className="text-emerald-400 text-xs mt-2 font-medium">→ {q.reutilizar}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">❌ Qué no funcionó</p>
                  {output.que_no_funcionó.map((q, i) => (
                    <div key={i} className="card p-4 border border-red-500/20 bg-red-500/5 mb-2">
                      <p className="text-white font-bold text-sm">{q.elemento}</p>
                      <p className="text-white/50 text-xs mt-1">{q.por_que}</p>
                      <p className="text-red-400 text-xs mt-2 font-medium">✕ {q.no_repetir}</p>
                    </div>
                  ))}
                </div>
                <div className="card p-4 border border-violet-500/20 bg-violet-500/5">
                  <p className="text-violet-400 font-bold text-sm mb-3">🧠 Aprendizajes clave</p>
                  {output.aprendizajes_clave.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 mb-2">
                      <span className="text-violet-400/60 text-xs mt-0.5">{i + 1}.</span>
                      <p className="text-white/60 text-xs">{a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'proxima' && (
              <div className="space-y-3">
                <p className="text-white/60 text-sm">Basado en esta campaña, la próxima debería ser así:</p>
                {[
                  { icon: '🎣', label: 'Hook recomendado', val: output.proxima_campana.hook_recomendado },
                  { icon: '🎯', label: 'Audiencia', val: output.proxima_campana.audiencia_recomendada },
                  { icon: '💰', label: 'Precio', val: output.proxima_campana.precio_recomendado },
                  { icon: '🎬', label: 'Formato', val: output.proxima_campana.formato_recomendado },
                ].map(item => (
                  <div key={item.label} className="card p-4 border border-white/8">
                    <p className="text-white/40 text-xs mb-1">{item.icon} {item.label}</p>
                    <p className="text-white/80 text-sm">{item.val}</p>
                  </div>
                ))}
                <div className="card p-5 border border-emerald-500/30 bg-emerald-500/5">
                  <p className="text-emerald-400 font-bold text-sm mb-2">⭐ El UN cambio más importante</p>
                  <p className="text-white/80 text-sm leading-relaxed">{output.proxima_campana.cambio_principal}</p>
                </div>
                <Link href="/campana"
                  className="block w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm text-center transition-all mb-2">
                  Crear nueva campaña con estos aprendizajes →
                </Link>
                <div className="grid grid-cols-3 gap-2">
                  <Link href="/copy-intelligence" className="text-center py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white/60 text-xs font-medium transition-all">🧠 Copy Intel</Link>
                  <Link href="/hooks-biblioteca" className="text-center py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white/60 text-xs font-medium transition-all">🎣 Hooks</Link>
                  <Link href="/portfolio" className="text-center py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white/60 text-xs font-medium transition-all">📋 Portfolio</Link>
                </div>
              </div>
            )}
          </>
        )}

        {!output && (
          <div className="card p-6 text-center border border-white/5">
            <p className="text-4xl mb-3">🪦</p>
            <p className="text-white/60 font-semibold mb-1">Las campañas que mueren enseñan más</p>
            <p className="text-white/30 text-sm">Registrá qué pasó, qué funcionó y qué no. Cada post-mortem hace la próxima campaña más fuerte.</p>
          </div>
        )}

      </main>
    </div>
  )
}
