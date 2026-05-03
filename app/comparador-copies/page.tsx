'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

type CopyScore = {
  copy: string
  puntaje_total: number
  hook: { score: number; feedback: string }
  beneficio: { score: number; feedback: string }
  urgencia: { score: number; feedback: string }
  coherencia: { score: number; feedback: string }
  nivel_conciencia: { nivel: number; descripcion: string }
  plataforma_ideal: string
  posicion_lanzamiento: number
  mejora_sugerida: string
  veredicto: string
}

type CompararOutput = {
  analisis: CopyScore[]
  orden_lanzamiento: string[]
  estrategia_testing: string
  patron_ganador: string
}

async function callClaude(copies: string[], producto: string, objetivo: string): Promise<CompararOutput> {
  
  const copiesFormateados = copies.map((c, i) => `COPY ${i + 1}:\n${c}`).join('\n\n---\n\n')

  const prompt = `Sos un experto en media buying y copywriting para dropshipping en Paraguay. Analizás copies de anuncios y los ordenás por probabilidad de conversión.

PRODUCTO: ${producto}
OBJETIVO: ${objetivo || 'Ventas directas COD Paraguay'}

COPIES A ANALIZAR:
${copiesFormateados}

Para cada copy, evaluá en escala 0-10:
1. HOOK (primeras 2 líneas): ¿Para el scroll? ¿Genera intriga o dolor?
2. BENEFICIO: ¿Es claro, específico, creíble para Paraguay?
3. URGENCIA/CTA: ¿Mueve a la acción ahora? ¿El CTA es específico?
4. COHERENCIA: ¿Tiene sentido de principio a fin? ¿No contradice?

También determiná:
- Nivel de conciencia del consumidor (1=inconsciente del problema, 5=listo para comprar)
- En qué plataforma funciona mejor (Meta frío, Meta retargeting, TikTok, WhatsApp)
- Posición de lanzamiento (1 = lanzar primero)
- Una mejora concreta de 1 línea

Respondé SOLO con JSON válido:
{
  "analisis": [
    {
      "copy": "primeras 15 palabras del copy...",
      "puntaje_total": 8.2,
      "hook": { "score": 9, "feedback": "hook específico, para el scroll con pregunta de dolor" },
      "beneficio": { "score": 8, "feedback": "beneficio claro pero podría ser más específico" },
      "urgencia": { "score": 7, "feedback": "CTA presente pero débil" },
      "coherencia": { "score": 9, "feedback": "fluye bien, no se contradice" },
      "nivel_conciencia": { "nivel": 3, "descripcion": "consciente del problema, semi-consciente de la solución" },
      "plataforma_ideal": "Meta Ads frío — nivel 3 perfecto para audiencia fría",
      "posicion_lanzamiento": 1,
      "mejora_sugerida": "cambiar el CTA final por 'Pedilo ahora con entrega a domicilio — pagás cuando llega'",
      "veredicto": "Lanzar primero — hook potente y beneficio creíble"
    }
  ],
  "orden_lanzamiento": ["Copy X primero porque...", "Copy Y segundo porque..."],
  "estrategia_testing": "cómo testear estos copies en paralelo sin desperdiciar presupuesto",
  "patron_ganador": "qué tienen en común los copies con mayor puntaje — el patrón a replicar"
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

const ScoreBar = ({ score, max = 10 }: { score: number; max?: number }) => {
  const pct = (score / max) * 100
  const color = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-white/60 text-xs font-bold w-6 text-right">{score}</span>
    </div>
  )
}

export default function ComparadorCopiesPage() {
  const [producto, setProducto] = useState('')

  // Pre-cargar copies desde Buyer Persona (vía sessionStorage)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('comparador_copies')
      const savedProducto = sessionStorage.getItem('comparador_producto')
      if (saved) {
        const parsed: string[] = JSON.parse(saved)
        if (parsed.length >= 2) {
          setCopies(parsed.slice(0, 5))
          sessionStorage.removeItem('comparador_copies')
        }
      }
      if (savedProducto) {
        setProducto(savedProducto)
        sessionStorage.removeItem('comparador_producto')
      }
    } catch {}
  }, [])
  const [objetivo, setObjetivo] = useState('')
  const [copies, setCopies] = useState(['', '', ''])
  const [output, setOutput] = useState<CompararOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedCopy, setSelectedCopy] = useState<number | null>(null)

  const handleGenerate = async () => {
    const validCopies = copies.filter(c => c.trim().length > 10)
    if (!producto || validCopies.length < 2) return
    setLoading(true)
    try {
      const result = await callClaude(validCopies, producto, objetivo)
      setOutput(result)
      setSelectedCopy(0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const addCopy = () => {
    if (copies.length < 6) setCopies(prev => [...prev, ''])
  }

  const updateCopy = (i: number, val: string) => {
    setCopies(prev => prev.map((c, idx) => idx === i ? val : c))
  }

  const removeCopy = (i: number) => {
    if (copies.length > 2) setCopies(prev => prev.filter((_, idx) => idx !== i))
  }

  const validCopies = copies.filter(c => c.trim().length > 10)
  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-white/20'
  const labelCls = 'block text-xs text-white/40 mb-1.5 font-medium'

  const posColor = (pos: number) => pos === 1 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : pos === 2 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-white/40 bg-white/5 border-white/10'
  const scoreColor = (s: number) => s >= 8 ? 'text-emerald-400' : s >= 6 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="min-h-screen">
      <Link href="/crear" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/gestionar" className="text-white/30 hover:text-white/60 text-sm transition-colors">Gestionar</Link>
            <span className="text-white/20 text-sm">›</span>
            <span className="text-white/60 text-sm">Comparador</span>
          </div>
          <h1 className="text-2xl font-bold text-white">🆚 Comparador de Copies</h1>
          <p className="text-white/40 text-sm mt-1">Pegá tus copies — te digo cuál lanzar primero y por qué</p>
        </div>

        {/* Setup */}
        <div className="card p-5 mb-5 border border-white/8">
          <div className="space-y-3 mb-4">
            <div>
              <label className={labelCls}>Producto</label>
              <input className={inputCls} placeholder="ej. Masajeador de cuello eléctrico" value={producto} onChange={e => setProducto(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Objetivo del anuncio (opcional)</label>
              <input className={inputCls} placeholder="ej. Ventas directas frío, retargeting carrito" value={objetivo} onChange={e => setObjetivo(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {copies.map((copy, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelCls + ' mb-0'}>Copy {i + 1}</label>
                  {copies.length > 2 && (
                    <button onClick={() => removeCopy(i)} className="text-white/20 hover:text-red-400 text-xs transition-colors">✕ Quitar</button>
                  )}
                </div>
                <textarea
                  className={`${inputCls} resize-none`} rows={4}
                  placeholder={`Pegá el copy ${i + 1} acá — headline + body + CTA completo`}
                  value={copy} onChange={e => updateCopy(i, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {copies.length < 6 && (
              <button onClick={addCopy} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white/60 text-sm transition-all">
                + Agregar copy
              </button>
            )}
            <button onClick={handleGenerate} disabled={!producto || validCopies.length < 2 || loading}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-sm transition-all">
              {loading ? '⏳ Analizando...' : `🆚 Comparar ${validCopies.length} copies`}
            </button>
          </div>
        </div>

        {/* Resultados */}
        {output && (
          <>
            {/* Ranking rápido */}
            <div className="mb-5">
              <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-3">Ranking — orden de lanzamiento</p>
              <div className="space-y-2">
                {[...output.analisis]
                  .sort((a, b) => a.posicion_lanzamiento - b.posicion_lanzamiento)
                  .map((a, i) => (
                    <button key={i} onClick={() => setSelectedCopy(output.analisis.indexOf(a))}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                        selectedCopy === output.analisis.indexOf(a) ? 'border-violet-500/40 bg-violet-500/5' : 'border-white/8 hover:border-white/20'
                      }`}>
                      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm font-black flex-shrink-0 ${posColor(a.posicion_lanzamiento)}`}>
                        {a.posicion_lanzamiento}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/70 text-xs truncate">{a.copy}...</p>
                        <p className="text-white/30 text-[10px] mt-0.5">{a.plataforma_ideal.split('—')[0].trim()}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className={`text-lg font-black ${scoreColor(a.puntaje_total)}`}>{a.puntaje_total.toFixed(1)}</p>
                        <p className="text-white/25 text-[10px]">/10</p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Detalle del copy seleccionado */}
            {selectedCopy !== null && output.analisis[selectedCopy] && (
              <div className="card p-5 border border-white/10 mb-5">
                <p className="text-white font-bold text-sm mb-4">
                  Análisis detallado — Copy #{output.analisis[selectedCopy].posicion_lanzamiento}
                </p>

                <div className="space-y-3 mb-4">
                  {[
                    { label: 'Hook (parar el scroll)', data: output.analisis[selectedCopy].hook },
                    { label: 'Beneficio (claro y creíble)', data: output.analisis[selectedCopy].beneficio },
                    { label: 'Urgencia / CTA', data: output.analisis[selectedCopy].urgencia },
                    { label: 'Coherencia del mensaje', data: output.analisis[selectedCopy].coherencia },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1">
                        <p className="text-white/50 text-xs">{item.label}</p>
                      </div>
                      <ScoreBar score={item.data.score} />
                      <p className="text-white/30 text-[10px] mt-1">{item.data.feedback}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-white/30 text-[10px] mb-1">Nivel de conciencia</p>
                    <p className="text-violet-400 font-bold text-sm">Nivel {output.analisis[selectedCopy].nivel_conciencia.nivel}</p>
                    <p className="text-white/30 text-[10px] mt-0.5">{output.analisis[selectedCopy].nivel_conciencia.descripcion}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-white/30 text-[10px] mb-1">Plataforma ideal</p>
                    <p className="text-emerald-400 font-bold text-xs leading-tight">{output.analisis[selectedCopy].plataforma_ideal}</p>
                  </div>
                </div>

                <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 mb-3">
                  <p className="text-violet-400 text-xs font-bold mb-1">💡 Mejora sugerida</p>
                  <p className="text-white/60 text-sm">{output.analisis[selectedCopy].mejora_sugerida}</p>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                  <p className="text-emerald-400 text-xs font-bold mb-1">✅ Veredicto</p>
                  <p className="text-white/60 text-sm">{output.analisis[selectedCopy].veredicto}</p>
                </div>
              </div>
            )}

            {/* Estrategia y patrón */}
            <div className="space-y-3 mb-5">
              <div className="card p-4 border border-amber-500/20 bg-amber-500/5">
                <p className="text-amber-400 font-bold text-sm mb-2">📋 Estrategia de testing</p>
                <p className="text-white/60 text-sm leading-relaxed">{output.estrategia_testing}</p>
              </div>
              <div className="card p-4 border border-violet-500/20 bg-violet-500/5">
                <p className="text-violet-400 font-bold text-sm mb-2">🧬 Patrón ganador detectado</p>
                <p className="text-white/60 text-sm leading-relaxed">{output.patron_ganador}</p>
              </div>
            </div>

            {/* Orden de lanzamiento */}
            <div className="card p-4 border border-white/8 mb-5">
              <p className="text-white font-bold text-sm mb-3">🚀 Orden de lanzamiento recomendado</p>
              <div className="space-y-2">
                {output.orden_lanzamiento.map((o, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-violet-400 text-xs font-bold flex-shrink-0 w-4">{i + 1}.</span>
                    <p className="text-white/60 text-xs leading-relaxed">{o}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!output && (
          <div className="card p-6 text-center border border-white/5">
            <p className="text-4xl mb-3">🆚</p>
            <p className="text-white/60 font-semibold mb-1">Pegá 2 a 6 copies</p>
            <p className="text-white/30 text-sm">Analizamos hook, beneficio, urgencia y coherencia. Te decimos cuál lanzar primero, en qué plataforma y qué mejorar.</p>
          </div>
        )}

      </main>
    </div>
  )
}
