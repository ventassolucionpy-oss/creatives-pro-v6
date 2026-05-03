'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { PAISES, type Pais } from '@/lib/constants'

type Dimension = {
  nombre: string
  score: number
  max: number
  evaluacion: string
  mejora_concreta: string
}

type CopyScorerOutput = {
  score_total: number
  nivel: string
  resumen: string
  dimensiones: Dimension[]
  version_mejorada: string
  frases_a_eliminar: string[]
  frases_a_agregar: string[]
  veredicto_meta_policy: string
}

async function scoreCopy(copy: string, contexto: string, pais: Pais): Promise<CopyScorerOutput> {
  const cfg = PAISES[pais]
  const prompt = `Sos un experto auditor de copy para Meta Ads y dropshipping COD en ${cfg.nombre}. Tu trabajo es evaluar copies con criterios de alto rendimiento — sin piedad y con sugerencias concretas.

COPY A EVALUAR:
---
${copy}
---

CONTEXTO: ${contexto || `Anuncio para Meta Ads, dropshipping COD en ${cfg.nombre}`}

INSTRUCCIONES: Evaluá este copy en 10 dimensiones. Sé específico, directo y útil. No des elogios vacíos.

Respondé SOLO con JSON válido:
{
  "score_total": 73,
  "nivel": "Bueno / Mejorable / Básico / Excelente",
  "resumen": "diagnóstico en 2 líneas — qué funciona y qué frena la conversión",
  "dimensiones": [
    {
      "nombre": "Fuerza del hook",
      "score": 7,
      "max": 10,
      "evaluacion": "qué tiene de bueno y qué le falta — específico, no genérico",
      "mejora_concreta": "cómo mejorar esta dimensión puntualmente con ejemplo"
    },
    {"nombre": "Especificidad de beneficios", "score": 6, "max": 10, "evaluacion": "...", "mejora_concreta": "..."},
    {"nombre": "Prueba social", "score": 5, "max": 10, "evaluacion": "...", "mejora_concreta": "..."},
    {"nombre": "Manejo de objeciones", "score": 4, "max": 10, "evaluacion": "...", "mejora_concreta": "..."},
    {"nombre": "Claridad del CTA", "score": 8, "max": 10, "evaluacion": "...", "mejora_concreta": "..."},
    {"nombre": "Nivel de conciencia del buyer", "score": 7, "max": 10, "evaluacion": "...", "mejora_concreta": "..."},
    {"nombre": "Urgencia / Escasez", "score": 3, "max": 10, "evaluacion": "...", "mejora_concreta": "..."},
    {"nombre": "Match con audiencia ${cfg.nombre}", "score": 6, "max": 10, "evaluacion": "...", "mejora_concreta": "..."},
    {"nombre": "Legibilidad / Ritmo", "score": 8, "max": 10, "evaluacion": "...", "mejora_concreta": "..."},
    {"nombre": "Cumplimiento Meta Ads policy", "score": 9, "max": 10, "evaluacion": "...", "mejora_concreta": "..."}
  ],
  "version_mejorada": "versión completa del copy mejorado aplicando todas las sugerencias — lista para usar",
  "frases_a_eliminar": ["frase 1 que debilitá el copy y por qué", "frase 2"],
  "frases_a_agregar": ["frase o elemento a agregar 1 — por qué aumenta conversión", "elemento 2"],
  "veredicto_meta_policy": "¿Este copy tiene riesgo de rechazo por Meta? ¿Por qué? ¿Cómo corregirlo?"
}`

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  const data = await res.json()
  const raw: string = data.text || ''
  let clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const s = clean.indexOf('{'), e = clean.lastIndexOf('}')
  if (s >= 0 && e > s) clean = clean.slice(s, e + 1)
  return JSON.parse(clean) as CopyScorerOutput
}

function ScoreCircle({ score, max }: { score: number; max: number }) {
  const pct = (score / max) * 100
  const color = pct >= 75 ? '#10b981' : pct >= 55 ? '#f59e0b' : '#ef4444'
  const r = 18, circ = 2 * Math.PI * r
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="flex-shrink-0">
      <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 24 24)" />
      <text x="24" y="28" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{score}</text>
    </svg>
  )
}

export default function CopyScorerPage() {
  const [pais, setPais] = useState<Pais>('PY')
  const [copy, setCopy] = useState('')
  const [contexto, setContexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState<CopyScorerOutput | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'score'|'mejora'|'policy'>('score')
  const [copiedMejora, setCopiedMejora] = useState(false)

  const handleScore = async () => {
    if (!copy.trim() || copy.trim().length < 20) { setError('Pegá un copy de al menos 20 caracteres'); return }
    setLoading(true); setError(''); setOutput(null)
    try {
      const r = await scoreCopy(copy, contexto, pais)
      setOutput(r)
      setTab('score')
    } catch (e) { setError('Error analizando el copy.'); console.error(e) }
    setLoading(false)
  }

  const nivelColor = (n: string) => {
    if (n?.includes('Excelente')) return 'text-emerald-400'
    if (n?.includes('Bueno')) return 'text-blue-400'
    if (n?.includes('Mejorable')) return 'text-amber-400'
    return 'text-red-400'
  }

  const scoreColor = (s: number) => s >= 75 ? 'text-emerald-400' : s >= 55 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-5">
          <Link href="/crear" className="text-white/30 hover:text-white/60 text-sm transition-colors">← Herramientas</Link>
          <h1 className="text-2xl font-bold text-white mt-2">🎯 Copy Scorer</h1>
          <p className="text-white/40 text-sm mt-1">Análisis IA de tu copy en 10 dimensiones con versión mejorada lista</p>
        </div>

        <div className="flex gap-2 mb-4">
          {Object.values(PAISES).map(p => (
            <button key={p.codigo} onClick={() => setPais(p.codigo as Pais)}
              className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${pais === p.codigo ? 'border-violet-500/50 bg-violet-500/15 text-white' : 'border-white/8 bg-white/3 text-white/40'}`}>
              {p.bandera} {p.nombre}
            </button>
          ))}
        </div>

        {!output ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Pegá tu copy aquí *</label>
              <textarea value={copy} onChange={e => setCopy(e.target.value)}
                className="input resize-none h-40 text-sm leading-relaxed"
                placeholder="Pegá cualquier copy — tuyo, de la competencia, o generado por IA. Mínimo 20 caracteres." />
              <p className="text-[10px] text-white/20 mt-1 text-right">{copy.length} caracteres</p>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Contexto (opcional)</label>
              <input value={contexto} onChange={e => setContexto(e.target.value)}
                className="input text-sm" placeholder="ej: Anuncio para faja moldeadora, mujeres 30-50, Meta Ads" />
            </div>
            {error && <p className="text-red-400 text-xs bg-red-500/10 rounded-xl p-3">{error}</p>}
            <button onClick={handleScore} disabled={loading || copy.trim().length < 20}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:from-violet-500 hover:to-purple-500 transition-all">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analizando tu copy...
                </span>
              ) : '🎯 Analizar copy en 10 dimensiones'}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-up">
            {/* Score global */}
            <div className="card p-5 border border-white/10 text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-2">
                <svg width="96" height="96" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                  <circle cx="48" cy="48" r="38" fill="none"
                    stroke={output.score_total >= 75 ? '#10b981' : output.score_total >= 55 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="6"
                    strokeDasharray={`${(output.score_total/100)*2*Math.PI*38} ${2*Math.PI*38}`}
                    strokeLinecap="round" transform="rotate(-90 48 48)" />
                  <text x="48" y="52" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{output.score_total}</text>
                  <text x="48" y="64" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">/100</text>
                </svg>
              </div>
              <p className={`text-xl font-black ${nivelColor(output.nivel)}`}>{output.nivel}</p>
              <p className="text-white/50 text-xs mt-1 max-w-xs mx-auto leading-relaxed">{output.resumen}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-white/3 rounded-xl border border-white/8">
              {[{id:'score',l:'📊 Dimensiones'},{id:'mejora',l:'✨ Versión mejorada'},{id:'policy',l:'⚖️ Meta Policy'}].map(t => (
                <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
                  className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all ${tab === t.id ? 'bg-violet-600 text-white' : 'text-white/30 hover:text-white/60'}`}>
                  {t.l}
                </button>
              ))}
            </div>

            {tab === 'score' && (
              <div className="space-y-2">
                {output.dimensiones?.map(d => (
                  <div key={d.nombre} className="card p-4 border border-white/8">
                    <div className="flex items-center gap-3 mb-2">
                      <ScoreCircle score={d.score} max={d.max} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium text-sm">{d.nombre}</p>
                          <span className={`text-sm font-black ${scoreColor(d.score/d.max*100)}`}>{d.score}/{d.max}</span>
                        </div>
                        <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{d.evaluacion}</p>
                      </div>
                    </div>
                    <div className="bg-violet-500/8 rounded-lg p-2 border border-violet-500/15">
                      <p className="text-[10px] text-violet-400/70 font-bold mb-0.5">MEJORA →</p>
                      <p className="text-white/65 text-xs leading-relaxed">{d.mejora_concreta}</p>
                    </div>
                  </div>
                ))}

                {/* Frases a eliminar/agregar */}
                {output.frases_a_eliminar?.length > 0 && (
                  <div className="card p-4 border border-red-500/20">
                    <p className="text-red-400 text-xs font-bold mb-2">❌ Eliminar</p>
                    {output.frases_a_eliminar.map((f, i) => <p key={i} className="text-white/60 text-xs mb-1">• {f}</p>)}
                  </div>
                )}
                {output.frases_a_agregar?.length > 0 && (
                  <div className="card p-4 border border-emerald-500/20">
                    <p className="text-emerald-400 text-xs font-bold mb-2">✅ Agregar</p>
                    {output.frases_a_agregar.map((f, i) => <p key={i} className="text-white/60 text-xs mb-1">• {f}</p>)}
                  </div>
                )}
              </div>
            )}

            {tab === 'mejora' && (
              <div className="space-y-3">
                <div className="card p-4 border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-emerald-400 text-xs font-bold">✨ Versión mejorada — lista para usar</p>
                    <button onClick={() => { navigator.clipboard.writeText(output.version_mejorada); setCopiedMejora(true); setTimeout(() => setCopiedMejora(false), 2000) }}
                      className="text-[10px] text-emerald-400 px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 transition-colors">
                      {copiedMejora ? '✓ Copiado' : 'Copiar todo'}
                    </button>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{output.version_mejorada}</p>
                </div>
                <Link href="/ab-tracker" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-violet-500/30 transition-all">
                  <span>🧪</span><div><p className="text-white text-xs font-bold">Testear en A/B Tracker</p><p className="text-white/30 text-[10px]">Compará esta versión vs la original</p></div>
                </Link>
              </div>
            )}

            {tab === 'policy' && (
              <div className="card p-4 border border-amber-500/20 bg-amber-500/5">
                <p className="text-amber-300 text-xs font-bold mb-2">⚖️ Veredicto Meta Ads Policy</p>
                <p className="text-white/70 text-sm leading-relaxed">{output.veredicto_meta_policy}</p>
              </div>
            )}

            <button onClick={() => setOutput(null)} className="w-full btn-secondary py-3 text-sm">← Analizar otro copy</button>
          </div>
        )}
      </main>
    </div>
  )
}
