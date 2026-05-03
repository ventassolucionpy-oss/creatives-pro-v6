'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

// ─── Tipos ───────────────────────────────────────────────
type CROOutput = {
  score_global: number
  resumen_ejecutivo: string
  dimensiones: Array<{
    nombre: string
    score: number
    problemas: string[]
    bien: string[]
  }>
  top3_mejoras: Array<{
    prioridad: number
    titulo: string
    problema_detectado: string
    solucion_concreta: string
    impacto_estimado: string
    tiempo_implementacion: string
    ejemplo_antes?: string
    ejemplo_despues?: string
  }>
  checklist_rapido: Array<{ item: string; estado: 'ok' | 'falta' | 'mejorar' }>
  headline_alternativo: string
  cta_alternativo: string
  consejo_experto: string
}

async function callClaude(prompt: string): Promise<CROOutput> {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  })
  if (!res.ok) throw new Error(`Error API (${res.status})`)
  const data = await res.json()
  const raw: string = data.text || ''
  let clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const s = clean.indexOf('{'), e = clean.lastIndexOf('}')
  if (s >= 0 && e > s) clean = clean.slice(s, e + 1)
  return JSON.parse(clean) as CROOutput
}

function buildPrompt(config: Record<string, string>): string {
  return `Sos un experto en CRO (Conversion Rate Optimization) especializado en páginas de venta para dropshipping COD en Paraguay. Analizás páginas de destino con ojo quirúrgico.

DATOS DE LA PÁGINA A ANALIZAR:
- URL o descripción: ${config.url_o_desc}
- Producto: ${config.producto}
- Precio: ${config.precio || 'no especificado'}
- Audiencia objetivo: ${config.audiencia || 'compradores online Paraguay'}
- Fuente de tráfico: ${config.fuente || 'Meta Ads (Facebook/Instagram)'}
- Tasa de conversión actual: ${config.tasa_conversion || 'desconocida'}
- Descripción del contenido de la página: ${config.descripcion_contenido || 'no provista'}
- Problemas que sospechás: ${config.problemas_sospechados || 'ninguno en particular'}

CRITERIOS DE EVALUACIÓN PARA PARAGUAY COD:
1. Congruencia ad-landing: el titular de la página debe coincidir con la promesa del ad
2. Velocidad percibida: en móvil (70%+ del tráfico en PY) la página debe cargar visualmente en <2s
3. Headline: ¿es claro, específico y orientado al beneficio principal?
4. Social proof: testimonios, cantidad de compradores, stars — crítico en Paraguay por la desconfianza
5. CTA placement: el botón debe aparecer sin scroll en mobile
6. Fricción en el formulario: COD requiere solo: nombre, celular, dirección — nada más
7. Urgencia/Escasez: ¿hay un razón para comprar ahora?
8. Manejo de objeciones: precio, entrega, garantía — ¿están respondidas?
9. Trust signals: logo, datos de contacto, garantía visible, método de pago
10. Claridad de la oferta: en 5 segundos el visitante entiende qué es y cuánto cuesta

Analizá esta página según estos criterios y devolvé SOLO JSON válido:
{
  "score_global": 72,
  "resumen_ejecutivo": "2-3 líneas del diagnóstico principal — el problema más importante primero",
  "dimensiones": [
    {
      "nombre": "Congruencia ad-landing",
      "score": 65,
      "problemas": ["lista de problemas detectados en esta dimensión"],
      "bien": ["qué está funcionando bien"]
    },
    { "nombre": "Headline y propuesta de valor", "score": 70, "problemas": [], "bien": [] },
    { "nombre": "Social proof", "score": 45, "problemas": [], "bien": [] },
    { "nombre": "CTA y formulario", "score": 80, "problemas": [], "bien": [] },
    { "nombre": "Urgencia y escasez", "score": 55, "problemas": [], "bien": [] },
    { "nombre": "Manejo de objeciones", "score": 60, "problemas": [], "bien": [] },
    { "nombre": "Trust signals", "score": 75, "problemas": [], "bien": [] }
  ],
  "top3_mejoras": [
    {
      "prioridad": 1,
      "titulo": "título de la mejora — accionable en 1 línea",
      "problema_detectado": "qué exactamente está mal y por qué afecta la conversión",
      "solucion_concreta": "qué exactamente cambiar — lo más específico posible",
      "impacto_estimado": "ej: +15-25% en tasa de conversión",
      "tiempo_implementacion": "ej: 30 minutos",
      "ejemplo_antes": "cómo está ahora (si aplica)",
      "ejemplo_despues": "cómo debería quedar"
    },
    {
      "prioridad": 2,
      "titulo": "",
      "problema_detectado": "",
      "solucion_concreta": "",
      "impacto_estimado": "",
      "tiempo_implementacion": ""
    },
    {
      "prioridad": 3,
      "titulo": "",
      "problema_detectado": "",
      "solucion_concreta": "",
      "impacto_estimado": "",
      "tiempo_implementacion": ""
    }
  ],
  "checklist_rapido": [
    { "item": "Titular visible sin scroll en mobile", "estado": "ok" },
    { "item": "CTA arriba del fold en mobile", "estado": "falta" },
    { "item": "Formulario COD con máx. 3 campos", "estado": "ok" },
    { "item": "Al menos 3 testimonios con foto", "estado": "mejorar" },
    { "item": "Precio claro y visible", "estado": "ok" },
    { "item": "Garantía con duración específica", "estado": "falta" },
    { "item": "Razón de escasez o urgencia", "estado": "mejorar" },
    { "item": "Número de WhatsApp visible", "estado": "ok" },
    { "item": "Imágenes del producto en contexto de uso", "estado": "mejorar" },
    { "item": "Velocidad de carga aceptable en móvil", "estado": "ok" }
  ],
  "headline_alternativo": "un headline alternativo para testear que debería convertir mejor",
  "cta_alternativo": "texto alternativo para el botón que genera más urgencia",
  "consejo_experto": "el insight más importante que un experto CRO le diría al dueño de este negocio hoy"
}`
}

type Phase = 'config' | 'generating' | 'results'

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? '#22c55e' : score >= 55 ? '#f59e0b' : '#ef4444'
  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black" style={{ color }}>{score}</span>
        <span className="text-white/30 text-[9px]">/100</span>
      </div>
    </div>
  )
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 75 ? 'bg-emerald-500' : score >= 55 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-white/60 text-xs">{label}</span>
        <span className="text-white/40 text-xs font-bold">{score}</span>
      </div>
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%`, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )
}

export default function CROPage() {
  const [phase, setPhase] = useState<Phase>('config')
  const [output, setOutput] = useState<CROOutput | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'diagnostico' | 'mejoras' | 'checklist'>('diagnostico')
  const [copied, setCopied] = useState('')
  const [config, setConfig] = useState({
    url_o_desc: '',
    producto: '',
    precio: '',
    audiencia: '',
    fuente: 'Meta Ads (Facebook/Instagram)',
    tasa_conversion: '',
    descripcion_contenido: '',
    problemas_sospechados: '',
  })

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const generate = async () => {
    if (!config.url_o_desc || !config.producto) return
    setPhase('generating'); setError('')
    try {
      const result = await callClaude(buildPrompt(config))
      setOutput(result); setPhase('results')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al analizar')
      setPhase('config')
    }
  }

  const ic = 'w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/50'
  const lc = 'block text-xs text-white/40 mb-1.5'
  const ta = `${ic} resize-none`

  const estadoIcon = { ok: '✅', falta: '❌', mejorar: '⚠️' }
  const estadoColor = { ok: 'text-emerald-400', falta: 'text-red-400', mejorar: 'text-amber-400' }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <Link href="/gestionar" className="text-white/30 hover:text-white/60 text-sm flex items-center gap-1.5 mb-4 transition-colors">← Gestionar</Link>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">🔬 Analizador CRO</h1>
            <span className="tag tag-violet text-[10px]">IA</span>
          </div>
          <p className="text-white/40 text-sm">Score de tu landing page + las 3 mejoras que más impactan la conversión</p>
        </div>

        {phase === 'config' && (
          <div className="space-y-5">
            <div className="card p-4 border border-blue-500/20 bg-blue-500/5">
              <p className="text-blue-300 text-xs font-bold mb-1">¿No tenés la URL todavía?</p>
              <p className="text-white/40 text-xs leading-relaxed">
                Podés describir el contenido de tu página: qué tiene el headline, qué testimonios hay, cómo está el formulario, etc. La IA igual puede hacer el análisis.
              </p>
            </div>

            <div className="card p-5 space-y-4">
              <div>
                <label className={lc}>URL de tu landing page (o describila)</label>
                <input type="text" className={ic}
                  placeholder="https://mi-tienda.com/producto o 'mi landing de Dropi con...'"
                  value={config.url_o_desc}
                  onChange={e => setConfig(c => ({ ...c, url_o_desc: e.target.value }))} />
              </div>
              <div>
                <label className={lc}>Nombre del producto</label>
                <input type="text" className={ic}
                  placeholder="ej: Faja reductora postparto"
                  value={config.producto}
                  onChange={e => setConfig(c => ({ ...c, producto: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lc}>Precio de venta (Gs.)</label>
                  <input type="text" className={ic} placeholder="180.000"
                    value={config.precio} onChange={e => setConfig(c => ({ ...c, precio: e.target.value }))} />
                </div>
                <div>
                  <label className={lc}>Tasa conversión actual (%)</label>
                  <input type="text" className={ic} placeholder="ej: 1.8%"
                    value={config.tasa_conversion} onChange={e => setConfig(c => ({ ...c, tasa_conversion: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={lc}>Fuente de tráfico</label>
                <select className={ic} value={config.fuente} onChange={e => setConfig(c => ({ ...c, fuente: e.target.value }))}>
                  <option>Meta Ads (Facebook/Instagram)</option>
                  <option>TikTok Ads</option>
                  <option>WhatsApp orgánico</option>
                  <option>Google Ads</option>
                </select>
              </div>
              <div>
                <label className={lc}>Describí el contenido de tu landing (cuanto más detalle, mejor)</label>
                <textarea rows={4} className={ta}
                  placeholder="ej: La página tiene un headline que dice 'Faja modeladora', fotos del producto, un formulario con nombre, celular y dirección, precio con tachado de Gs. 350.000 a Gs. 180.000, sin testimonios aún..."
                  value={config.descripcion_contenido}
                  onChange={e => setConfig(c => ({ ...c, descripcion_contenido: e.target.value }))} />
              </div>
              <div>
                <label className={lc}>¿Qué problemas sospechás? (opcional)</label>
                <input type="text" className={ic}
                  placeholder="ej: mucha gente llega pero pocos completan el formulario"
                  value={config.problemas_sospechados}
                  onChange={e => setConfig(c => ({ ...c, problemas_sospechados: e.target.value }))} />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              onClick={generate}
              disabled={!config.url_o_desc || !config.producto}
              className="btn-primary w-full py-4 text-base disabled:opacity-40"
            >
              🔬 Analizar landing →
            </button>
          </div>
        )}

        {phase === 'generating' && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold">Analizando con ojo de experto CRO...</p>
            <p className="text-white/40 text-sm mt-1">Evaluando 7 dimensiones de conversión</p>
          </div>
        )}

        {phase === 'results' && output && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold">Análisis: {config.producto}</h2>
              <button onClick={() => setPhase('config')} className="btn-secondary text-xs px-3 py-2">← Nueva</button>
            </div>

            {/* Score principal */}
            <div className="card p-6 border border-white/8">
              <ScoreRing score={output.score_global} />
              <p className="text-white/60 text-sm text-center mt-3 leading-relaxed">{output.resumen_ejecutivo}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-white/8">
              {([
                { id: 'diagnostico', label: '📊 Diagnóstico' },
                { id: 'mejoras', label: '🔧 Top 3 Mejoras' },
                { id: 'checklist', label: '✅ Checklist' },
              ] as { id: typeof tab; label: string }[]).map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-white/10 text-white' : 'text-white/30'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* DIAGNÓSTICO */}
            {tab === 'diagnostico' && (
              <div className="space-y-4">
                <div className="card p-5 space-y-3">
                  {output.dimensiones.map((d, i) => (
                    <ScoreBar key={i} score={d.score} label={d.nombre} />
                  ))}
                </div>

                {output.dimensiones.filter(d => d.problemas.length > 0).map((d, i) => (
                  <div key={i} className="card p-4">
                    <p className="text-white font-bold text-sm mb-2">{d.nombre} — {d.score}/100</p>
                    {d.problemas.map((p, j) => (
                      <p key={j} className="text-red-400/80 text-xs mb-1">❌ {p}</p>
                    ))}
                    {d.bien.map((b, j) => (
                      <p key={j} className="text-emerald-400/80 text-xs mb-1">✓ {b}</p>
                    ))}
                  </div>
                ))}

                {/* Consejo experto */}
                <div className="card p-4 border border-violet-500/20 bg-violet-500/5">
                  <p className="text-violet-400 text-[10px] font-bold uppercase mb-2">💡 Consejo del experto</p>
                  <p className="text-white/70 text-xs leading-relaxed">{output.consejo_experto}</p>
                </div>

                {/* Headlines alternativos */}
                <div className="card p-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white/40 text-[10px] font-bold uppercase">Headline alternativo para testear</p>
                      <button onClick={() => copy(output.headline_alternativo, 'hl')} className="text-xs text-violet-400">
                        {copied === 'hl' ? '✓' : 'Copiar'}
                      </button>
                    </div>
                    <p className="text-white text-sm font-bold">{output.headline_alternativo}</p>
                  </div>
                  <div className="border-t border-white/8 pt-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white/40 text-[10px] font-bold uppercase">CTA alternativo para testear</p>
                      <button onClick={() => copy(output.cta_alternativo, 'cta')} className="text-xs text-violet-400">
                        {copied === 'cta' ? '✓' : 'Copiar'}
                      </button>
                    </div>
                    <p className="text-white text-sm font-bold">{output.cta_alternativo}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TOP 3 MEJORAS */}
            {tab === 'mejoras' && (
              <div className="space-y-4">
                {output.top3_mejoras.map((m, i) => (
                  <div key={i} className={`card p-5 border ${i === 0 ? 'border-red-500/30 bg-red-500/5' : i === 1 ? 'border-amber-500/30 bg-amber-500/5' : 'border-blue-500/20 bg-blue-500/5'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${i === 0 ? 'bg-red-500/20 text-red-300' : i === 1 ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'}`}>
                        {m.prioridad}
                      </div>
                      <p className="text-white font-bold text-sm">{m.titulo}</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-white/30 text-[10px] uppercase font-bold mb-1">Problema detectado</p>
                        <p className="text-white/70 text-xs leading-relaxed">{m.problema_detectado}</p>
                      </div>
                      <div>
                        <p className="text-white/30 text-[10px] uppercase font-bold mb-1">Solución concreta</p>
                        <p className="text-white/80 text-xs leading-relaxed font-medium">{m.solucion_concreta}</p>
                      </div>
                      {m.ejemplo_antes && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded-lg bg-red-500/8 border border-red-500/20">
                            <p className="text-red-400/60 text-[9px] mb-1">ANTES</p>
                            <p className="text-white/50 text-[10px]">{m.ejemplo_antes}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
                            <p className="text-emerald-400/60 text-[9px] mb-1">DESPUÉS</p>
                            <p className="text-white/70 text-[10px]">{m.ejemplo_despues}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-3 flex-wrap">
                        <div>
                          <p className="text-white/25 text-[9px] uppercase">Impacto estimado</p>
                          <p className="text-emerald-400 text-xs font-bold">{m.impacto_estimado}</p>
                        </div>
                        <div>
                          <p className="text-white/25 text-[9px] uppercase">Tiempo</p>
                          <p className="text-white/50 text-xs">{m.tiempo_implementacion}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CHECKLIST */}
            {tab === 'checklist' && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {(['ok', 'falta', 'mejorar'] as const).map(e => {
                    const count = output.checklist_rapido.filter(c => c.estado === e).length
                    return (
                      <div key={e} className="card p-3 text-center">
                        <p className={`text-lg font-bold ${estadoColor[e]}`}>{count}</p>
                        <p className="text-[10px] text-white/30">
                          {e === 'ok' ? 'OK ✅' : e === 'falta' ? 'Falta ❌' : 'Mejorar ⚠️'}
                        </p>
                      </div>
                    )
                  })}
                </div>
                {output.checklist_rapido.map((item, i) => (
                  <div key={i} className={`card p-3 flex items-center gap-3 border ${
                    item.estado === 'ok' ? 'border-emerald-500/15' : item.estado === 'falta' ? 'border-red-500/20' : 'border-amber-500/20'
                  }`}>
                    <span className="text-base">{estadoIcon[item.estado]}</span>
                    <p className={`text-xs ${estadoColor[item.estado]}`}>{item.item}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
