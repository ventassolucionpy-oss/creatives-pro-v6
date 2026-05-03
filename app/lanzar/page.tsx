'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { callClaudeJSON } from '@/lib/claude-client'
import { buildLaunchPrompt } from '@/lib/prompts/lanzar'
import type { LaunchOutput } from '@/lib/prompts/lanzar'

type Phase = 'config' | 'generating' | 'results'

const lc = 'block text-xs text-white/40 mb-1.5'
const ic = 'w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/50'

const INITIAL = { nombre: '', descripcion: '', costo_gs: '', precio_gs: '', competencia: '', modelo: '', pais: 'Paraguay' }

export default function LanzarPage() {
  const [phase, setPhase] = useState<Phase>('config')
  const [form, setForm] = useState(INITIAL)
  const [output, setOutput] = useState<LaunchOutput | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'producto' | 'ad' | 'ugc' | 'checklist' | 'rentabilidad'>('producto')

  const set = (k: keyof typeof INITIAL, v: string) => setForm(p => ({ ...p, [k]: v }))

  const generate = async () => {
    if (!form.nombre.trim() || !form.descripcion.trim()) return
    setPhase('generating'); setError('')
    try {
      const result = await callClaudeJSON<LaunchOutput>({
        messages: [{ role: 'user', content: buildLaunchPrompt(form) }],
        maxTokens: 8000,
        saveGeneration: { tool: 'lanzar-producto', input: { ...form } }
      })
      setOutput(result); setPhase('results')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar')
      setPhase('config')
    }
  }

  const TABS = [
    { id: 'producto' as const, label: 'Producto' },
    { id: 'rentabilidad' as const, label: 'Rentabilidad' },
    { id: 'ad' as const, label: 'Primer Ad' },
    { id: 'ugc' as const, label: 'Guión UGC' },
    { id: 'checklist' as const, label: 'Checklist' },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">

  {/* GATE: Validación de producto antes de lanzar */}
  {product && (
    <Link href={`/validador-producto?producto=${encodeURIComponent(product.name)}`}
      className="block card p-3 border border-amber-500/25 bg-amber-500/5 mb-4 hover:border-amber-500/45 transition-all rounded-xl">
      <div className="flex items-center gap-2">
        <span className="text-lg flex-shrink-0">✅</span>
        <div className="flex-1">
          <p className="text-amber-300 font-bold text-xs">¿Validaste este producto antes de lanzar?</p>
          <p className="text-white/35 text-[10px] mt-0.5">Los operadores de 7 cifras nunca lanzan sin validar. Score mínimo recomendado: 7/10.</p>
        </div>
        <span className="text-amber-400 text-xs flex-shrink-0">Validar →</span>
      </div>
    </Link>
  )}
        <div className="mb-6">
          <Link href="/inicio" className="text-white/30 hover:text-white/60 text-sm flex items-center gap-1.5 mb-4 transition-colors">← Volver</Link>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">🚀 Lanzar Producto</h1>
            <span className="tag tag-violet text-[10px]">IA</span>
          </div>
          <p className="text-white/40 text-sm">Todo lo que necesitás para lanzar tu producto en 60 minutos</p>
        </div>

        {phase === 'config' && (
          <div className="space-y-3 animate-fade-up">
            <div className="card p-4 border border-white/8 space-y-3">
              <p className="text-xs text-white/40 uppercase tracking-wider">Datos del producto</p>
              <div>
                <label className={lc}>Nombre del producto *</label>
                <input className={ic} placeholder="Ej: Faja Reductora Térmica" value={form.nombre}
                  onChange={e => set('nombre', e.target.value)} />
              </div>
              <div>
                <label className={lc}>Descripción *</label>
                <textarea className={`${ic} resize-none`} rows={3}
                  placeholder="Describí qué hace, cómo funciona y qué problema resuelve"
                  value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lc}>Costo (Gs.)</label>
                  <input className={ic} type="number" placeholder="45000" value={form.costo_gs}
                    onChange={e => set('costo_gs', e.target.value)} />
                </div>
                <div>
                  <label className={lc}>Precio de venta (Gs.)</label>
                  <input className={ic} type="number" placeholder="147000" value={form.precio_gs}
                    onChange={e => set('precio_gs', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={lc}>Modelo de venta</label>
                <select className={`${ic} cursor-pointer`} value={form.modelo}
                  onChange={e => set('modelo', e.target.value)}>
                  <option value="" style={{ background: '#111' }}>Seleccionar...</option>
                  {['Dropshipping Dropi', 'Stock propio', 'Servicio / Digital', 'Mayorista'].map(o => (
                    <option key={o} value={o} style={{ background: '#111' }}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lc}>Competencia conocida (opcional)</label>
                <input className={ic} placeholder="Ej: Ya lo venden en Instagram varios vendedores"
                  value={form.competencia} onChange={e => set('competencia', e.target.value)} />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button onClick={generate} disabled={!form.nombre.trim() || !form.descripcion.trim()}
              className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-sm transition-all">
              🚀 Generar Plan de Lanzamiento
            </button>
          </div>
        )}

        {phase === 'generating' && (
          <div className="text-center py-16 animate-fade-up">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center text-2xl mx-auto mb-4 animate-pulse">🚀</div>
            <p className="text-white font-bold mb-2">Armando tu plan de lanzamiento...</p>
            <p className="text-white/40 text-sm">Primer ad, guión UGC, rentabilidad y checklist completo</p>
          </div>
        )}

        {phase === 'results' && output && (
          <div className="animate-fade-up space-y-4">
            {/* Header */}
            {output.producto && (
              <div className="card p-4 border border-violet-500/20 bg-violet-500/5">
                <p className="text-white font-bold text-lg">{output.producto.nombre_comercial}</p>
                <p className="text-violet-300/80 text-sm mt-1">{output.producto.promesa}</p>
                <div className="flex gap-2 mt-3">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-bold">{output.producto.precio_recomendado}</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40 text-xs line-through">{output.producto.precio_tachado}</span>
                </div>
              </div>
            )}

            {/* Nicho score */}
            {output.nicho && (
              <div className={`card p-3 border ${output.nicho.score >= 7 ? 'border-emerald-500/20' : output.nicho.score >= 5 ? 'border-amber-500/20' : 'border-red-500/20'}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-white/40">Score de nicho</p>
                  <span className={`text-xl font-bold ${output.nicho.score >= 7 ? 'text-emerald-400' : output.nicho.score >= 5 ? 'text-amber-400' : 'text-red-400'}`}>{output.nicho.score}/10</span>
                </div>
                <p className="text-white/80 text-xs">{output.nicho.veredicto}</p>
                {output.nicho.advertencia_principal && (
                  <p className="text-amber-400/70 text-xs mt-1">⚠️ {output.nicho.advertencia_principal}</p>
                )}
              </div>
            )}

            <div className="flex gap-1 flex-wrap">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${activeTab === t.id ? 'border-violet-500/50 bg-violet-600/20 text-violet-300' : 'border-white/10 text-white/40 hover:text-white'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === 'producto' && output.producto && (
              <div className="card p-4 border border-white/8 space-y-2">
                {[
                  ['Categoría Meta', output.producto.categoria_meta],
                  ['Audiencia', output.producto.audiencia],
                  ['Beneficio principal', output.producto.beneficio_principal],
                ].map(([label, val]) => (
                  <div key={label as string}>
                    <p className="text-[10px] text-white/30">{label as string}</p>
                    <p className="text-white/80 text-sm mt-0.5">{val as string}</p>
                  </div>
                ))}
                {output.primeras_48h?.length > 0 && (
                  <div className="mt-3 p-3 bg-white/3 rounded-lg">
                    <p className="text-[10px] text-white/30 mb-2">Primeras 48 horas</p>
                    {output.primeras_48h.map((item, i) => (
                      <p key={i} className="text-white/70 text-xs mb-1">✓ {item}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rentabilidad' && output.rentabilidad && (
              <div className="card p-4 border border-white/8 space-y-3">
                {[
                  ['Margen estimado', output.rentabilidad.margen_estimado],
                  ['ROAS break even', output.rentabilidad.roas_break_even],
                  ['Presupuesto mínimo', output.rentabilidad.presupuesto_minimo],
                  ['Ventas para ser rentable', output.rentabilidad.ventas_para_rentable],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between items-center">
                    <span className="text-white/40 text-sm">{label as string}</span>
                    <span className="text-white font-bold text-sm">{val as string}</span>
                  </div>
                ))}
                {output.senales_escalar?.length > 0 && (
                  <div className="p-3 bg-emerald-500/8 border border-emerald-500/15 rounded-lg">
                    <p className="text-[10px] text-emerald-400/60 mb-1.5">Señales para escalar</p>
                    {output.senales_escalar.map((s, i) => <p key={i} className="text-emerald-300/70 text-xs">✓ {s}</p>)}
                  </div>
                )}
                {output.senales_matar?.length > 0 && (
                  <div className="p-3 bg-red-500/8 border border-red-500/15 rounded-lg">
                    <p className="text-[10px] text-red-400/60 mb-1.5">Señales para pausar</p>
                    {output.senales_matar.map((s, i) => <p key={i} className="text-red-300/70 text-xs">✗ {s}</p>)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ad' && output.primer_ad && (
              <div className="card p-4 border border-white/8 space-y-3">
                <div className="p-3 bg-violet-500/8 border border-violet-500/15 rounded-lg">
                  <p className="text-[10px] text-violet-400/60 mb-0.5">Hook</p>
                  <p className="text-white font-bold text-sm">"{output.primer_ad.hook}"</p>
                </div>
                {[
                  ['Titular', output.primer_ad.titular],
                  ['Cuerpo', output.primer_ad.cuerpo],
                  ['CTA', output.primer_ad.cta],
                  ['Framework', output.primer_ad.framework],
                  ['Público', output.primer_ad.publico],
                  ['Presupuesto test', output.primer_ad.presupuesto_test],
                ].map(([label, val]) => (
                  <div key={label as string}>
                    <p className="text-[10px] text-white/30">{label as string}</p>
                    <p className="text-white/80 text-xs mt-0.5 leading-relaxed">{val as string}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'ugc' && output.guion_ugc && (
              <div className="card p-4 border border-white/8 space-y-3">
                <div className="p-3 bg-pink-500/8 border border-pink-500/15 rounded-lg">
                  <p className="text-[10px] text-pink-400/60 mb-0.5">Hook 0-3s</p>
                  <p className="text-white font-bold text-sm">"{output.guion_ugc.hook}"</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30">Desarrollo</p>
                  <p className="text-white/80 text-xs mt-0.5 leading-relaxed">{output.guion_ugc.desarrollo}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30">CTA</p>
                  <p className="text-white/80 text-xs mt-0.5">{output.guion_ugc.cta}</p>
                </div>
                <div className="p-3 bg-white/3 rounded-lg">
                  <p className="text-[10px] text-white/30 mb-1">Briefing para el creador</p>
                  <p className="text-white/70 text-xs leading-relaxed">{output.guion_ugc.briefing}</p>
                </div>
              </div>
            )}

            {activeTab === 'checklist' && output.checklist_lanzamiento && (
              <div className="space-y-2">
                {output.checklist_lanzamiento.map((item, i) => (
                  <div key={i} className={`card p-3 border flex items-start gap-3 ${item.critico ? 'border-red-500/20' : 'border-white/8'}`}>
                    <div className={`w-5 h-5 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 ${item.critico ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/30'}`}>
                      {item.critico ? '!' : i + 1}
                    </div>
                    <div>
                      <p className="text-white text-xs font-medium">{item.item}</p>
                      <p className="text-white/30 text-[10px] mt-0.5">{item.cuando}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => { setPhase('config'); setOutput(null); setForm(INITIAL) }}
              className="w-full py-3 rounded-xl border border-white/10 text-white/40 hover:text-white text-sm transition-all">
              ← Lanzar otro producto
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
