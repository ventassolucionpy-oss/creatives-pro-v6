'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/layout/Navbar'
import { getPaisConfig, PAISES, formatPrecio, type Pais } from '@/lib/constants'
import ProductSelector from '@/components/wizard/ProductSelector'
import ProductModal from '@/components/wizard/ProductModal'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { buildLandingPrompt, LandingOutput } from '@/lib/prompts/landing'
import type { Product } from '@/types'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function autoPublico(p: Product): string {
  const d = p.description.toLowerCase()
  if (p.category === 'digital') {
    if (d.match(/trading|finanzas/)) return 'Hombres y mujeres 25-45 interesados en finanzas, LATAM'
    if (d.match(/fitness|gym/)) return 'Personas 20-40 apasionadas por el fitness, LATAM'
    if (d.match(/negocio|marketing/)) return 'Emprendedores 22-45 que quieren escalar sus ventas, LATAM'
    return 'Personas 25-45 que buscan resultados concretos, LATAM'
  }
  if (d.match(/belleza|skin|crema|piel/)) return 'Mujeres 25-45 interesadas en skincare, Paraguay'
  if (d.match(/tecnología|gadget/)) return 'Hombres 18-40 tech enthusiasts, Paraguay'
  return 'Compradores online 22-45, clase media, Paraguay'
}

async function callClaude(prompt: string): Promise<LandingOutput> {
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
  return JSON.parse(clean) as LandingOutput
}

// ─────────────────────────────────────────────
// SECTION RENDERERS
// ─────────────────────────────────────────────
type SeccionOutput = LandingOutput['secciones'][0]
function SectionCard({ s, index }: { s: SeccionOutput; index: number }) {
  const [open, setOpen] = useState(index === 0)
  const colors = [
    'border-violet-500/20', 'border-blue-500/20', 'border-emerald-500/20',
    'border-amber-500/20', 'border-pink-500/20', 'border-indigo-500/20',
    'border-cyan-500/20', 'border-rose-500/20',
  ]
  const typeIcons: Record<string, string> = {
    'Hero Section': '🎯', 'Prueba Social / Trust Badges': '⭐', 'Video UGC Principal': '🎬',
    'Beneficios Detallados': '✅', 'Testimonios Reales': '💬', 'Precio y CTA Principal': '💰',
    'FAQ — Preguntas frecuentes': '❓', 'CTA Final con Urgencia': '⚡',
  }

  return (
    <div className={`card border ${colors[index % colors.length]} overflow-hidden`}>
      <button onClick={() => setOpen(o => !o)} className="w-full p-4 text-left flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-base flex-shrink-0">
            {typeIcons[s.tipo] || '📄'}
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Sección {s.orden}</p>
            <p className="text-white font-semibold text-sm">{s.titulo_seccion}</p>
          </div>
        </div>
        <span className="text-white/30 text-xs flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4 animate-fade-up">

          {/* Headline */}
          {s.contenido.headline && (
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">Headline</p>
              <p className="text-white font-bold text-lg leading-tight">{s.contenido.headline}</p>
            </div>
          )}

          {/* Subheadline */}
          {s.contenido.subheadline && (
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">Subheadline</p>
              <p className="text-white/70 text-sm leading-relaxed">{s.contenido.subheadline}</p>
            </div>
          )}

          {/* Copy */}
          {s.contenido.copy && (
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">Copy</p>
              <p className="text-white/60 text-sm leading-relaxed">{s.contenido.copy}</p>
            </div>
          )}

          {/* CTA */}
          {s.contenido.cta_texto && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-4 py-2 bg-violet-600 rounded-lg text-white text-sm font-bold">{s.contenido.cta_texto}</div>
              {s.contenido.cta_accion && <p className="text-white/30 text-xs">{s.contenido.cta_accion}</p>}
            </div>
          )}

          {/* Bullets / Beneficios */}
          {(s.contenido.bullets || s.contenido.beneficios) && (
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2">Puntos clave</p>
              <ul className="space-y-1.5">
                {(s.contenido.bullets || s.contenido.beneficios || []).map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Precio */}
          {(s.contenido.precio_real || s.contenido.precio_tachado) && (
            <div className="flex items-center gap-4">
              {s.contenido.precio_tachado && <p className="text-white/30 line-through text-lg">{s.contenido.precio_tachado}</p>}
              {s.contenido.precio_real && <p className="text-emerald-400 font-bold text-2xl">{s.contenido.precio_real}</p>}
            </div>
          )}

          {/* Garantía */}
          {s.contenido.garantia && (
            <div className="p-3 bg-emerald-500/8 border border-emerald-500/20 rounded-lg">
              <p className="text-emerald-400 text-xs font-semibold mb-1">🛡️ Garantía</p>
              <p className="text-white/60 text-xs">{s.contenido.garantia}</p>
            </div>
          )}

          {/* Urgencia */}
          {s.contenido.urgencia && (
            <div className="p-3 bg-amber-500/8 border border-amber-500/20 rounded-lg">
              <p className="text-amber-400 text-xs font-semibold mb-1">⏰ Urgencia</p>
              <p className="text-white/60 text-xs">{s.contenido.urgencia}</p>
            </div>
          )}

          {/* Testimonios */}
          {s.contenido.testimonios && (
            <div className="space-y-3">
              {s.contenido.testimonios.map((t, i) => (
                <div key={i} className="p-3 bg-white/3 border border-white/8 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center text-violet-300 text-xs font-bold">{t.nombre[0]}</div>
                    <div>
                      <p className="text-white text-xs font-semibold">{t.nombre}</p>
                      <p className="text-white/30 text-[10px]">{t.cargo}</p>
                    </div>
                    <div className="ml-auto text-amber-400 text-xs">{'★'.repeat(t.estrellas)}</div>
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed italic">"{t.texto}"</p>
                  {t.resultado && <p className="text-emerald-400 text-[10px] mt-2 font-semibold">Resultado: {t.resultado}</p>}
                </div>
              ))}
            </div>
          )}

          {/* FAQ */}
          {s.contenido.preguntas && (
            <div className="space-y-2">
              {s.contenido.preguntas.map((q, i) => (
                <div key={i} className="p-3 bg-white/3 border border-white/8 rounded-lg">
                  <p className="text-white text-xs font-semibold mb-1">❓ {q.pregunta}</p>
                  <p className="text-white/55 text-xs leading-relaxed">{q.respuesta}</p>
                </div>
              ))}
            </div>
          )}

          {/* Instrucciones UGC */}
          {s.contenido.instrucciones_ugc && (
            <div className="p-3 bg-blue-500/8 border border-blue-500/20 rounded-xl">
              <p className="text-blue-400 text-xs font-bold mb-2">🎬 Instrucciones para el Creador UGC</p>
              <p className="text-white/60 text-xs leading-relaxed">{s.contenido.instrucciones_ugc}</p>
            </div>
          )}

          {/* Prompt UGC */}
          {s.prompt_ugc && (
            <UGCPromptBlock prompt={s.prompt_ugc} label={`Guión UGC — ${s.titulo_seccion}`} />
          )}

          {/* Instrucciones diseño */}
          <div className="p-3 bg-white/2 border border-white/6 rounded-lg">
            <p className="text-[10px] text-violet-400/60 uppercase tracking-wider mb-1">🎨 Instrucciones de diseño para Lovable</p>
            <p className="text-white/40 text-xs leading-relaxed">{s.instrucciones_diseno}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function UGCPromptBlock({ prompt, label }: { prompt: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="p-3 bg-blue-500/6 border border-blue-500/15 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <p className="text-blue-400 text-[10px] font-bold uppercase tracking-wider">🎬 {label}</p>
        <button onClick={async () => { await navigator.clipboard.writeText(prompt); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="text-[10px] text-white/25 hover:text-blue-400 transition-colors">{copied ? '✓ Copiado' : '⊕ Copiar guión'}</button>
      </div>
      <p className="text-white/60 text-xs leading-relaxed">{prompt}</p>
    </div>
  )
}

function CopyBlock({ text, label, color = 'violet' }: { text: string; label: string; color?: string }) {
  const [copied, setCopied] = useState(false)
  const colorMap: Record<string, string> = {
    violet: 'border-violet-500/20 bg-violet-500/5 text-violet-400',
    emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
    amber: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
    blue: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
  }
  return (
    <div className={`card border rounded-xl ${colorMap[color]}`}>
      <div className="flex items-center justify-between p-4 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-wider">{label}</p>
        <button onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="text-[10px] text-white/30 hover:text-current transition-colors">{copied ? '✓ Copiado' : '⊕ Copiar'}</button>
      </div>
      <div className="px-4 pb-4">
        <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function LandingPage() {
  const [step, setStep] = useState<'config' | 'generating' | 'results'>('config')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [config, setConfig] = useState<Record<string, string>>({})
  const [output, setOutput] = useState<LandingOutput | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'secciones' | 'lovable' | 'ugc' | 'checklist'>('secciones')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (selectedProduct) setConfig(p => ({ ...p, publico: p.publico || autoPublico(selectedProduct) }))
  }, [selectedProduct?.id])

  const generate = async () => {
    if (!selectedProduct) return
    setIsGenerating(true); setError(''); setStep('generating')
    try {
      const result = await callClaude(buildLandingPrompt(selectedProduct, config))
      setOutput(result); setStep('results'); setActiveTab('secciones')
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); setStep('config') }
    setIsGenerating(false)
  }

  const save = async () => {
    if (!output || !selectedProduct) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('generations').insert({
        user_id: user.id, product_id: selectedProduct.id,
        tool: 'landing-page', status: 'completed', input: config, output,
      })
      setSaved(true)
    }
    setSaving(false)
  }

  const inputClass = 'input'
  const labelClass = 'block text-xs font-medium text-white/40 mb-1.5'

  return (
    <div className="min-h-screen">
      <Navbar />
      {showModal && <ProductModal onClose={() => setShowModal(false)} onCreated={p => { setSelectedProduct(p); setShowModal(false) }} />}

      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/crear" className="btn-ghost text-white/30 hover:text-white p-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">Landing Page para Lovable</h1>
              <span className="tag tag-violet text-[10px]">🔥 Nuevo</span>
            </div>
            <p className="text-white/40 text-xs">Estructura completa + copy + UGC + prompt para Lovable.dev — lista para publicar</p>
          </div>
        </div>

        {/* CONFIG */}
        {step === 'config' && (
          <div className="space-y-6 animate-fade-up">

            {/* Explicación */}
            <div className="card p-4 border border-violet-500/15 bg-violet-500/5">
              <p className="text-violet-300 text-xs font-bold mb-2">¿Cómo funciona?</p>
              <div className="space-y-1.5">
                {[
                  '1. Seleccionás el producto y configurás la landing',
                  '2. La IA genera cada sección con copy de conversión máxima',
                  '3. Copiás el prompt para Lovable.dev y en minutos tenés la landing lista',
                  '4. Recibís el briefing UGC para que el creador grabe el video',
                ].map((t, i) => <p key={i} className="text-white/50 text-xs">{t}</p>)}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-white/25 uppercase tracking-widest mb-3">1. Producto</p>
              <ProductSelector selectedProductId={selectedProduct?.id || null} onSelect={p => setSelectedProduct(p)} onCreateNew={() => setShowModal(true)} />
            </div>

            <div>
              <p className="text-xs font-semibold text-white/25 uppercase tracking-widest mb-3">2. Configuración</p>
              <div className="card p-5 space-y-4">

                <div>
                  <label className={labelClass}>Público objetivo {selectedProduct && <span className="ml-2 text-violet-400/50 text-[10px]">✦ Auto-completado</span>}</label>
                  <input className={`${inputClass} ${selectedProduct ? 'border-violet-500/20' : ''}`} value={config.publico || ''} onChange={e => setConfig(p => ({ ...p, publico: e.target.value }))} placeholder="Ej: Mujeres 25-45 interesadas en skincare, Paraguay" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Precio de venta</label>
                    <input className={inputClass} value={config.precio || ''} 
                      onChange={e => setConfig(p => ({ ...p, precio: e.target.value }))}
                      onBlur={e => {
                        const raw = e.target.value.replace(/[^0-9]/g, '')
                        const num = parseInt(raw, 10)
                        if (!num || isNaN(num)) return
                        const rounded = Math.floor(num / 7000) * 7000
                        const fmt = rounded.toLocaleString('es-PY')
                        const comp = Math.floor(Math.round(rounded * 1.7) / 7000) * 7000
                        const fmtComp = comp.toLocaleString('es-PY')
                        setConfig(p => ({ ...p, precio: `Gs. ${fmt}`, precio_comparacion: `Gs. ${fmtComp}` }))
                      }}
                      placeholder="Ej: 150000 → redondea a Gs. 147.000" />
                  </div>
                  <div>
                    <label className={labelClass}>Precio tachado (comparación)</label>
                    <input className={inputClass} value={config.precio_comparacion || ''} onChange={e => setConfig(p => ({ ...p, precio_comparacion: e.target.value }))} placeholder="Auto-calculado (+70%) al ingresar precio" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Objetivo de conversión</label>
                    <select className={`${inputClass} cursor-pointer`} value={config.objetivo_conversion || ''} onChange={e => setConfig(p => ({ ...p, objetivo_conversion: e.target.value }))}>
                      <option value="" style={{ background: '#111' }}>Seleccionar...</option>
                      {['Compra directa', 'Captar leads / WhatsApp', 'Agendar llamada', 'Descargar recurso gratuito'].map(o => <option key={o} value={o} style={{ background: '#111' }}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Nivel de conciencia</label>
                    <select className={`${inputClass} cursor-pointer`} value={config.nivel_conciencia || ''} onChange={e => setConfig(p => ({ ...p, nivel_conciencia: e.target.value }))}>
                      <option value="" style={{ background: '#111' }}>Seleccionar...</option>
                      {['Nivel 1 — No sabe que tiene el problema', 'Nivel 2 — Siente el dolor', 'Nivel 3 — Busca solución', 'Nivel 4 — Te conoce, no decidió', 'Nivel 5 — Listo para comprar'].map(o => <option key={o} value={o} style={{ background: '#111' }}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Tono de marca</label>
                    <select className={`${inputClass} cursor-pointer`} value={config.tono || ''} onChange={e => setConfig(p => ({ ...p, tono: e.target.value }))}>
                      <option value="" style={{ background: '#111' }}>Seleccionar...</option>
                      {['Profesional y cercano', 'Aspiracional / Premium', 'Urgente y directo', 'Empático / Comprensivo', 'Energético / Motivacional'].map(o => <option key={o} value={o} style={{ background: '#111' }}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>País</label>
                    <select className={`${inputClass} cursor-pointer`} value={config.pais || ''} onChange={e => setConfig(p => ({ ...p, pais: e.target.value }))}>
                      <option value="" style={{ background: '#111' }}>Seleccionar...</option>
                      {['Paraguay', 'Argentina', 'Uruguay', 'Chile', 'Colombia', 'México', 'LATAM'].map(o => <option key={o} value={o} style={{ background: '#111' }}>{o}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>¿Incluir sección de video UGC?</label>
                  <div className="flex gap-3">
                    {[{ v: 'si', l: '✅ Sí — incluir video UGC real (recomendado)' }, { v: 'no', l: 'No incluir video' }].map(opt => (
                      <button key={opt.v} type="button" onClick={() => setConfig(p => ({ ...p, incluir_ugc: opt.v }))}
                        className={`flex-1 py-2.5 px-3 rounded-lg border text-xs font-medium transition-all ${config.incluir_ugc === opt.v ? 'border-violet-500 bg-violet-500/15 text-violet-300' : 'border-white/10 bg-white/3 text-white/40 hover:border-white/20'}`}>
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button onClick={generate} disabled={!selectedProduct || isGenerating} className="btn-primary w-full py-4 text-base">
              🏠 Generar Landing Page completa para Lovable →
            </button>
          </div>
        )}

        {/* GENERATING */}
        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-up">
            <div className="w-20 h-20 rounded-3xl bg-violet-600/20 flex items-center justify-center mb-6">
              <span className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin block" />
            </div>
            <h2 className="text-white font-bold text-xl mb-2">Diseñando tu landing page...</h2>
            <p className="text-white/40 text-sm mb-6">La IA está creando cada sección con copy de conversión máxima para <strong className="text-white">{selectedProduct?.name}</strong></p>
            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {['🎯 Hero Section', '⭐ Prueba Social', '🎬 Video UGC', '✅ Beneficios', '💬 Testimonios', '💰 Precio & CTA', '❓ FAQ', '⚡ Cierre'].map((s, i) => (
                <span key={s} className="text-[11px] px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-300 animate-pulse" style={{ animationDelay: `${i * 0.25}s` }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {step === 'results' && output && (
          <div className="animate-fade-up">

            {/* Header results */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-bold">Landing lista — {selectedProduct?.name}</h2>
                <p className="text-white/30 text-xs mt-0.5">{output.secciones.length} secciones generadas</p>
              </div>
              <div className="flex gap-2">
                <button onClick={save} disabled={saving || saved}
                  className={`text-xs px-3 py-2 rounded-lg border transition-all ${saved ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-white/15 bg-white/5 text-white/50 hover:border-white/30'}`}>
                  {saved ? '✓ Guardado' : saving ? '...' : '💾 Guardar'}
                </button>
                <button onClick={() => { setStep('config'); setOutput(null); setSaved(false) }} className="btn-secondary text-xs px-3 py-2">← Nueva</button>
              </div>
            </div>

            {/* Paleta de colores */}
            {output.estructura && (
              <div className="card p-4 border border-white/8 mb-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm mb-1">{output.estructura.nombre_pagina}</p>
                    <p className="text-white/40 text-xs leading-relaxed">{output.estructura.resumen_estrategia}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {Object.entries(output.estructura.paleta).map(([k, v]) => (
                      <div key={k} className="text-center">
                        <div className="w-8 h-8 rounded-lg border border-white/10 mb-1" style={{ background: v }} />
                        <p className="text-white/25 text-[9px] capitalize">{k}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {output.estructura.tipografia && (
                  <div className="flex gap-4 mt-3 pt-3 border-t border-white/5">
                    <div><p className="text-[10px] text-white/25 mb-0.5">Titular</p><p className="text-white/60 text-xs font-semibold">{output.estructura.tipografia.titular}</p></div>
                    <div><p className="text-[10px] text-white/25 mb-0.5">Cuerpo</p><p className="text-white/60 text-xs">{output.estructura.tipografia.cuerpo}</p></div>
                  </div>
                )}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
              {[
                { id: 'secciones', label: '🏠 Secciones' },
                { id: 'lovable', label: '⚡ Prompt Lovable' },
                { id: 'ugc', label: '🎬 Briefing UGC' },
                { id: 'checklist', label: '✅ Checklist CRO' },
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* SECCIONES */}
            {activeTab === 'secciones' && (
              <div className="space-y-3 animate-fade-up">
                <div className="card p-3 border border-violet-500/10 bg-violet-500/3 text-xs text-violet-400/70 mb-2">
                  Expandí cada sección para ver el copy completo, los testimonios y las instrucciones de diseño para Lovable.
                </div>
                {output.secciones.sort((a, b) => a.orden - b.orden).map((s, i) => (
                  <SectionCard key={s.id} s={s} index={i} />
                ))}
              </div>
            )}

            {/* LOVABLE PROMPT */}
            {activeTab === 'lovable' && (
              <div className="space-y-4 animate-fade-up">
                <div className="card p-4 border border-violet-500/15 bg-violet-500/5">
                  <p className="text-violet-300 text-xs font-bold mb-2">Cómo usar este prompt en Lovable.dev</p>
                  <ol className="space-y-1.5">
                    {['1. Andá a lovable.dev y creá un nuevo proyecto', '2. En el chat, copiá y pegá el prompt de abajo', '3. Lovable generará toda la landing page automáticamente', '4. Ajustá colores, imágenes y el video UGC con los detalles que ya tenés'].map((s, i) => (
                      <li key={i} className="text-white/50 text-xs">{s}</li>
                    ))}
                  </ol>
                </div>
                <CopyBlock text={output.codigo_lovable} label="PROMPT COMPLETO PARA LOVABLE.DEV" color="violet" />
              </div>
            )}

            {/* UGC BRIEFING */}
            {activeTab === 'ugc' && (
              <div className="space-y-4 animate-fade-up">
                <div className="card p-4 border border-blue-500/15 bg-blue-500/5">
                  <p className="text-blue-300 text-xs font-bold mb-2">Cómo usar el briefing UGC</p>
                  <ol className="space-y-1.5">
                    {['1. Enviá el briefing al creador UGC antes de la grabación', '2. El video debe grabarse en vertical (9:16) para móvil', '3. Luz natural o ring light — nunca techo de oficina', '4. El creador debe grabar 3 takes — elegís el mejor', '5. Subí el video final a la landing en la sección indicada'].map((s, i) => (
                      <li key={i} className="text-white/50 text-xs">{s}</li>
                    ))}
                  </ol>
                </div>
                <CopyBlock text={output.instrucciones_ugc_completas} label="BRIEFING COMPLETO PARA EL CREADOR UGC" color="blue" />

                {/* Guiones por sección */}
                {output.secciones.filter(s => s.prompt_ugc).map(s => (
                  <UGCPromptBlock key={s.id} prompt={s.prompt_ugc!} label={`Guión — ${s.titulo_seccion}`} />
                ))}
              </div>
            )}

            {/* CHECKLIST CRO */}
            {activeTab === 'checklist' && (
              <div className="space-y-3 animate-fade-up">
                <div className="card p-3 border border-emerald-500/10 bg-emerald-500/3 text-xs text-emerald-400/70">
                  ✅ Completá este checklist antes de publicar la landing. Cada punto puede representar 1-3% más de conversión.
                </div>
                <div className="card p-5 space-y-3">
                  {output.checklist_conversion.map((item, i) => (
                    <ChecklistItem key={i} text={item} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function ChecklistItem({ text, index }: { text: string; index: number }) {
  const [checked, setChecked] = useState(false)
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${checked ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 bg-white/2 hover:border-white/10'}`}
      onClick={() => setChecked(c => !c)}>
      <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>
        {checked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <p className={`text-sm leading-relaxed transition-all ${checked ? 'text-white/30 line-through' : 'text-white/70'}`}>{text}</p>
    </div>
  )
}
