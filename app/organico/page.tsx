'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import ProductSelector from '@/components/wizard/ProductSelector'
import ProductModal from '@/components/wizard/ProductModal'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { buildPrompt, OrganicoOutput } from '@/lib/prompts/organico'
import type { Product } from '@/types'

// ─── TYPES ───────────────────────────────────────────────// ─── API CALL ─────────────────────────────────────────────
async function callClaude(prompt: string): Promise<OrganicoOutput> {
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
  return JSON.parse(clean) as OrganicoOutput
}

// ─── PROMPT ───────────────────────────────────────────────
// ─── COMPONENTS ───────────────────────────────────────────
function CopyBtn({ text, label = '⊕ Copiar' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="text-[10px] text-white/25 hover:text-violet-400 transition-colors flex-shrink-0">
      {copied ? '✓ Copiado' : label}
    </button>
  )
}

type PilarItem = OrganicoOutput['pilares_contenido'][0]
function PilarCard({ p, index }: { p: PilarItem; index: number }) {
  const [open, setOpen] = useState(index === 0)
  const colors = ['border-violet-500/25', 'border-blue-500/20', 'border-emerald-500/20', 'border-amber-500/20', 'border-pink-500/20']
  const pctColors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500']
  return (
    <div className={`card border overflow-hidden ${colors[index % 5]}`}>
      <button onClick={() => setOpen(o => !o)} className="w-full p-4 text-left flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-white font-semibold text-sm">{p.nombre}</p>
            <span className="text-[10px] text-white/30">{p.porcentaje}%</span>
            <span className="text-[10px] text-white/25">{p.frecuencia}</span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden w-48">
            <div className={`h-full rounded-full ${pctColors[index % 5]}`} style={{ width: `${p.porcentaje}%` }} />
          </div>
        </div>
        <span className="text-white/20 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3 animate-fade-up">
          <p className="text-white/60 text-sm leading-relaxed">{p.descripcion}</p>
          <div>
            <p className="text-[10px] text-white/25 uppercase mb-2">Ideas concretas de contenido</p>
            <div className="space-y-1.5">
              {p.ejemplos.map((e, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-violet-400/50 flex-shrink-0 mt-0.5">→</span>
                  <p className="text-white/65 text-xs leading-relaxed">{e}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-2.5 bg-white/3 border border-white/8 rounded-lg">
            <p className="text-[10px] text-white/30 mb-0.5">Objetivo</p>
            <p className="text-white/60 text-xs">{p.objetivo}</p>
          </div>
        </div>
      )}
    </div>
  )
}

type DayData = OrganicoOutput['plan_semanal']['lunes']
function DayCard({ day, data }: { day: string; data: DayData }) {
  const [open, setOpen] = useState(false)
  const formatColors: Record<string, string> = {
    'Reel': 'bg-pink-500/20 text-pink-300',
    'Carrusel': 'bg-blue-500/20 text-blue-300',
    'Story': 'bg-amber-500/20 text-amber-300',
    'Post imagen': 'bg-violet-500/20 text-violet-300',
  }
  const fc = Object.entries(formatColors).find(([k]) => data.formato.includes(k))?.[1] || 'bg-white/10 text-white/50'
  return (
    <div className="card border border-white/8 overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full p-3.5 text-left flex items-center gap-3">
        <p className="text-white/40 text-xs font-bold w-16 flex-shrink-0 capitalize">{day}</p>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${fc}`}>{data.formato}</span>
        <p className="text-white/70 text-xs flex-1 min-w-0 truncate">{data.tema}</p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-white/20 text-[10px]">{data.hora}</span>
          <span className="text-white/20 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3 animate-fade-up">
          <div className="relative">
            <p className="text-[10px] text-white/25 uppercase mb-1.5">Caption listo</p>
            <div className="p-3 bg-white/3 border border-white/8 rounded-xl pr-16">
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{data.caption}</p>
            </div>
            <div className="absolute top-6 right-2">
              <CopyBtn text={data.caption + '\n\n' + data.hashtags.join(' ')} />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.hashtags.map(h => <span key={h} className="px-2 py-0.5 bg-violet-500/10 rounded text-[10px] text-violet-300/70">{h}</span>)}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────
export default function OrganicoPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [config, setConfig] = useState<Record<string, string>>({})
  const [output, setOutput] = useState<OrganicoOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'pilares' | 'semanal' | 'reels' | 'captions' | 'stories' | 'hashtags'>('pilares')
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (selectedProduct) {
      const d = selectedProduct.description.toLowerCase()
      const tono = d.match(/belleza|skin/) ? 'Femenino, cercano y empático — como habla una amiga en Paraguay'
        : d.match(/tech|gadget/) ? 'Tech-savvy pero accesible — como explica un amigo que sabe de tecnología'
        : 'Cercano, local, con humor paraguayo cuando aplica'
      setConfig(p => ({ ...p, tono: p.tono || tono }))
    }
  }, [selectedProduct?.id])

  const generate = async () => {
    if (!selectedProduct) return
    setLoading(true); setError('')
    try {
      const result = await callClaude(buildPrompt(selectedProduct, config))
      setOutput(result); setActiveTab('pilares')
    } catch (e) { setError(e instanceof Error ? e.message : 'Error') }
    setLoading(false)
  }

  const save = async () => {
    if (!output || !selectedProduct) return
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('generations').insert({ user_id: user.id, product_id: selectedProduct.id, tool: 'organico', status: 'completed', input: config, output })
      setSaved(true)
    }
  }

  const TABS = [
    { id: 'pilares', label: '🏛️ Pilares' },
    { id: 'semanal', label: '📅 Plan Semanal' },
    { id: 'reels', label: '🎬 Reels' },
    { id: 'captions', label: '✍️ Captions' },
    { id: 'stories', label: '📱 Stories' },
    { id: 'hashtags', label: '#️⃣ Hashtags' },
  ]

  const DIAS = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']

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
              <h1 className="text-lg font-bold text-white">Orgánico — Instagram & Facebook</h1>
              <span className="tag tag-green text-[10px]" style={{background:'rgba(34,197,94,0.15)',color:'#4ade80',border:'1px solid rgba(34,197,94,0.3)'}}>🇵🇾 Paraguay</span>
            </div>
            <p className="text-white/40 text-xs">Estrategia orgánica para calentar audiencias + bajar el CPM del paid hasta 40%</p>
          </div>
        </div>

        {!output ? (
          <div className="space-y-5 animate-fade-up">
            <div className="card p-4 border border-emerald-500/15 bg-emerald-500/5">
              <p className="text-emerald-300 text-xs font-bold mb-2">Por qué el orgánico es dinero gratis</p>
              <p className="text-white/55 text-xs leading-relaxed">Cada interacción orgánica crea una audiencia personalizada en Meta. Cuando activás paid, ya tenés gente caliente para retargetear a CPM 40% más bajo. En Paraguay donde hay desconfianza del dropshipping, el orgánico construye la credibilidad que el paid solo no puede dar.</p>
            </div>

            <ProductSelector selectedProductId={selectedProduct?.id || null} onSelect={p => setSelectedProduct(p)} onCreateNew={() => setShowModal(true)} />

            <div className="card p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5">Plataforma principal</label>
                  <select className="input cursor-pointer" value={config.plataforma || ''} onChange={e => setConfig(p => ({...p, plataforma: e.target.value}))} style={{background:'#111'}}>
                    <option value="" style={{background:'#111'}}>Seleccionar...</option>
                    {['Instagram principal + Facebook secundario', 'Facebook principal + Instagram secundario', 'Solo Instagram', 'Solo Facebook', 'Ambas por igual'].map(o => <option key={o} value={o} style={{background:'#111'}}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5">Estado de la cuenta</label>
                  <select className="input cursor-pointer" value={config.estado_cuenta || ''} onChange={e => setConfig(p => ({...p, estado_cuenta: e.target.value}))} style={{background:'#111'}}>
                    <option value="" style={{background:'#111'}}>Seleccionar...</option>
                    {['Cuenta nueva — 0 seguidores', 'Cuenta pequeña — menos de 500', 'Cuenta media — 500 a 5.000', 'Cuenta establecida — más de 5.000'].map(o => <option key={o} value={o} style={{background:'#111'}}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5">Tiempo disponible por semana</label>
                  <select className="input cursor-pointer" value={config.frecuencia || ''} onChange={e => setConfig(p => ({...p, frecuencia: e.target.value}))} style={{background:'#111'}}>
                    <option value="" style={{background:'#111'}}>Seleccionar...</option>
                    {['2-3 posts/semana (mínimo)', '4-5 posts/semana (recomendado)', '6-7 posts/semana (intensivo)', 'Diario + stories'].map(o => <option key={o} value={o} style={{background:'#111'}}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5">Objetivo principal</label>
                  <select className="input cursor-pointer" value={config.objetivo || ''} onChange={e => setConfig(p => ({...p, objetivo: e.target.value}))} style={{background:'#111'}}>
                    <option value="" style={{background:'#111'}}>Seleccionar...</option>
                    {['Construir confianza + calentar para paid', 'Vender directamente por DM/WhatsApp', 'Crecer seguidores para luego monetizar', 'Todo lo anterior'].map(o => <option key={o} value={o} style={{background:'#111'}}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5">Tono de la cuenta {selectedProduct && <span className="ml-2 text-emerald-400/50 text-[10px]">✦ Auto-detectado</span>}</label>
                <input className="input" value={config.tono || ''} onChange={e => setConfig(p => ({...p, tono: e.target.value}))} placeholder="Ej: Cercano, local, con humor paraguayo" />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={generate} disabled={!selectedProduct || loading} className="btn-primary w-full py-4 text-base">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />Generando estrategia orgánica...</> : '📱 Generar estrategia orgánica completa →'}
            </button>
          </div>
        ) : (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold">Estrategia Orgánica — {selectedProduct?.name}</h2>
              <div className="flex gap-2">
                <button onClick={save} disabled={saved} className={`text-xs px-3 py-2 rounded-lg border transition-all ${saved ? 'border-emerald-500/40 text-emerald-400' : 'border-white/15 text-white/50 hover:border-white/30'}`}>{saved ? '✓' : '💾'}</button>
                <button onClick={() => { setOutput(null); setSaved(false) }} className="btn-secondary text-xs px-3 py-2">← Nueva</button>
              </div>
            </div>

            {/* Cuenta setup */}
            <div className="card p-5 border border-emerald-500/15 bg-emerald-500/5 mb-5">
              <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-3">👤 Configuración de cuenta</p>
              <div className="space-y-2">
                {[
                  ['Nombre de perfil', output.estrategia_cuenta.nombre_perfil],
                  ['Bio (copiar tal cual)', output.estrategia_cuenta.bio],
                  ['Link en bio', output.estrategia_cuenta.link_bio],
                  ['Foto de perfil', output.estrategia_cuenta.foto_perfil],
                  ['Primer paso HOY', output.estrategia_cuenta.primer_paso],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-3 py-2 border-b border-white/5 last:border-0">
                    <p className="text-white/30 text-xs w-28 flex-shrink-0">{label}</p>
                    <p className="text-white/70 text-xs leading-relaxed flex-1">{value}</p>
                    <CopyBtn text={value} />
                  </div>
                ))}
              </div>
              {output.estrategia_cuenta.highlights_sugeridos.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-[10px] text-white/25 mb-2">Highlights sugeridos</p>
                  <div className="flex flex-wrap gap-2">
                    {output.estrategia_cuenta.highlights_sugeridos.map(h => (
                      <span key={h} className="px-2.5 py-1 bg-white/8 border border-white/10 rounded-full text-xs text-white/60">{h}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2 mb-5">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-emerald-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* PILARES */}
            {activeTab === 'pilares' && (
              <div className="space-y-3 animate-fade-up">
                <div className="card p-3 border border-emerald-500/10 bg-emerald-500/3 text-xs text-emerald-400/70 mb-2">
                  Los pilares son los tipos de contenido que publicás. Cada uno tiene un objetivo diferente. Rotarlos en la proporción indicada es lo que hace crecer la cuenta de forma sostenida.
                </div>
                {output.pilares_contenido.map((p, i) => <PilarCard key={i} p={p} index={i} />)}
                <div className="card p-4 border border-blue-500/15 bg-blue-500/5 mt-4">
                  <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-2">🎯 Cómo calentar audiencias para paid</p>
                  <p className="text-white/70 text-sm leading-relaxed">{output.como_calentar_para_paid}</p>
                </div>
              </div>
            )}

            {/* PLAN SEMANAL */}
            {activeTab === 'semanal' && (
              <div className="space-y-2 animate-fade-up">
                <div className="card p-3 border border-white/8 text-xs text-white/40 mb-2">
                  📅 Plan listo para esta semana. Cada día tiene el caption completo para copiar. Los captions incluyen la pregunta final para activar el algoritmo.
                </div>
                {DIAS.map(day => (
                  <DayCard key={day} day={day} data={output.plan_semanal[day]} />
                ))}
              </div>
            )}

            {/* REELS */}
            {activeTab === 'reels' && (
              <div className="space-y-4 animate-fade-up">
                <div className="card p-3 border border-pink-500/15 bg-pink-500/5 text-xs mb-2" style={{color:'#f472b6'}}>
                  🎬 Los Reels son el formato con mayor alcance orgánico en 2025. El hook visual (primer frame) decide si alguien para el scroll — es más importante que el audio.
                </div>
                {output.reels_hooks.map((r, i) => (
                  <div key={i} className="card p-4 border border-white/8">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white font-semibold text-sm">{r.tema}</p>
                      <CopyBtn text={`HOOK VISUAL: ${r.hook_visual}\nHOOK AUDIO: ${r.hook_audio}\n\n${r.desarrollo}\n\nCTA: ${r.cta}`} />
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 bg-pink-500/8 border rounded-lg" style={{borderColor:'rgba(236,72,153,0.2)'}}>
                        <p className="text-[10px] font-bold uppercase mb-1" style={{color:'#f472b6'}}>👁️ Hook visual (primer frame)</p>
                        <p className="text-white/80 text-sm">{r.hook_visual}</p>
                      </div>
                      <div className="p-3 bg-violet-500/8 border border-violet-500/20 rounded-lg">
                        <p className="text-[10px] text-violet-400/60 font-bold uppercase mb-1">🔊 Hook audio (0-2 segundos)</p>
                        <p className="text-white font-semibold text-sm">"{r.hook_audio}"</p>
                      </div>
                      <div className="p-3 bg-white/3 border border-white/8 rounded-lg">
                        <p className="text-[10px] text-white/30 mb-1">Desarrollo</p>
                        <p className="text-white/70 text-xs leading-relaxed">{r.desarrollo}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-white/8 rounded-lg text-xs text-white/70">{r.cta}</span>
                        <p className="text-emerald-400/60 text-[10px] italic">💡 {r.por_que_viral}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CAPTIONS */}
            {activeTab === 'captions' && (
              <div className="space-y-4 animate-fade-up">
                <div className="card p-3 border border-white/8 text-xs text-white/40 mb-2">
                  ✍️ Captions completos para copiar y pegar. Están escritos en español paraguayo natural — no suenan a bot ni a corporativo.
                </div>
                {output.captions_listos.map((c, i) => (
                  <div key={i} className="card p-4 border border-white/8">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="tag tag-gray text-[10px]">{c.formato}</span>
                        <p className="text-white text-xs font-semibold">{c.tipo}</p>
                      </div>
                      <CopyBtn text={c.caption + '\n\n' + c.hashtags.join(' ')} />
                    </div>
                    <p className="text-white/25 text-[10px] mb-2">{c.cuando_publicar}</p>
                    <div className="p-3 bg-white/3 border border-white/8 rounded-xl">
                      <p className="text-white/75 text-sm leading-relaxed whitespace-pre-line">{c.caption}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {c.hashtags.map(h => <span key={h} className="px-2 py-0.5 bg-violet-500/10 rounded text-[10px] text-violet-300/70">{h}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* STORIES */}
            {activeTab === 'stories' && (
              <div className="space-y-4 animate-fade-up">
                <div className="card p-4 border border-amber-500/15">
                  <p className="text-amber-300 text-xs font-bold mb-1">Frecuencia</p>
                  <p className="text-white/70 text-sm">{output.estrategia_stories.frecuencia}</p>
                </div>
                <div className="space-y-3">
                  {output.estrategia_stories.tipos.map((t, i) => (
                    <div key={i} className="card p-4 border border-white/8">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-white text-xs font-semibold">{t.tipo}</p>
                        <span className="text-white/25 text-[10px]">{t.frecuencia}</span>
                      </div>
                      <p className="text-white/60 text-xs leading-relaxed">{t.descripcion}</p>
                    </div>
                  ))}
                </div>
                <div className="card p-4 border border-blue-500/15 bg-blue-500/5">
                  <p className="text-blue-300 text-xs font-bold mb-2">Encuesta para usar esta semana</p>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-white text-sm font-semibold">{output.estrategia_stories.encuesta_sugerida}</p>
                  </div>
                  <div className="mt-3">
                    <p className="text-[10px] text-white/30 mb-1.5">Stickers clave</p>
                    <div className="flex flex-wrap gap-2">
                      {output.estrategia_stories.stickers_clave.map(s => (
                        <span key={s} className="px-2.5 py-1 bg-white/8 border border-white/10 rounded-full text-xs text-white/60">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* HASHTAGS */}
            {activeTab === 'hashtags' && (
              <div className="space-y-4 animate-fade-up">
                <div className="card p-4 border border-white/8">
                  <p className="text-white/50 text-xs font-bold mb-3 uppercase">Estrategia de hashtags</p>
                  <p className="text-white/70 text-sm leading-relaxed">{output.hashtags_estrategia.estrategia}</p>
                </div>
                {[
                  { label: '🎯 Nicho — Paraguay específico', tags: output.hashtags_estrategia.de_nicho, color: 'text-emerald-400 bg-emerald-500/10' },
                  { label: '📌 Pequeños (< 50K)', tags: output.hashtags_estrategia.pequeños, color: 'text-violet-400 bg-violet-500/10' },
                  { label: '⚖️ Medianos (50K-500K)', tags: output.hashtags_estrategia.medianos, color: 'text-blue-400 bg-blue-500/10' },
                  { label: '🌎 Grandes (500K+)', tags: output.hashtags_estrategia.grandes, color: 'text-amber-400 bg-amber-500/10' },
                ].map(({ label, tags, color }) => (
                  <div key={label} className="card p-4 border border-white/8">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/60 text-xs font-semibold">{label}</p>
                      <CopyBtn text={tags.join(' ')} />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map(h => <span key={h} className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${color}`}>{h}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Métricas y errores */}
            <div className="mt-6 space-y-3">
              <div className="card p-4 border border-white/8">
                <p className="text-white/50 text-xs font-bold uppercase mb-3">📊 KPIs de cuenta orgánica</p>
                <div className="space-y-2">
                  {output.metricas_organico.map((m, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2 py-2 border-b border-white/5 last:border-0">
                      <p className="text-white/50 text-xs col-span-1">{m.metrica}</p>
                      <div className="text-center"><p className="text-amber-400 text-xs font-bold">{m.bueno}</p><p className="text-[9px] text-white/25">Bueno</p></div>
                      <div className="text-center"><p className="text-emerald-400 text-xs font-bold">{m.excelente}</p><p className="text-[9px] text-white/25">Excelente</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-4 border border-red-500/15 bg-red-500/5">
                <p className="text-red-400 text-[10px] font-bold uppercase mb-2">🚫 Errores que arruinan el crecimiento</p>
                {output.errores_comunes.map((e, i) => <p key={i} className="text-white/60 text-xs mb-1.5 flex gap-2"><span className="text-red-400 flex-shrink-0">✕</span>{e}</p>)}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
