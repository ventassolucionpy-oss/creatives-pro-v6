'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import ProductSelector from '@/components/wizard/ProductSelector'
import ProductModal from '@/components/wizard/ProductModal'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Product } from '@/types'

type TemporadaOutput = {
  temporada: string
  fecha: string
  dias_para_preparar: number
  potencial_revenue: string
  estrategia: string
  cronograma: Array<{ semana: string; acciones: string[]; objetivo: string }>
  copies_especiales: Array<{ tipo: string; hook: string; copy: string; cuando: string }>
  presupuesto_sugerido: string
  kpis_clave: string[]
  errores_comunes: string[]
}

type Temporada = {
  id: string
  nombre: string
  fecha: string
  icon: string
  color: string
  impacto: 'muy alto' | 'alto' | 'medio'
  aplica: string[]
}

const TEMPORADAS: Temporada[] = [
  { id: 'dia-madre', nombre: 'Día de la Madre', fecha: 'Segunda semana de mayo', icon: '💐', color: 'border-pink-500/30 bg-pink-500/5', impacto: 'muy alto', aplica: ['belleza', 'hogar', 'moda', 'joyería', 'digital'] },
  { id: 'dia-padre', nombre: 'Día del Padre', fecha: 'Tercera semana de junio', icon: '👔', color: 'border-blue-500/30 bg-blue-500/5', impacto: 'alto', aplica: ['tecnología', 'deporte', 'herramientas', 'moda'] },
  { id: 'cyber-monday', nombre: 'Cyber Monday', fecha: 'Primer lunes de diciembre', icon: '💻', color: 'border-cyan-500/30 bg-cyan-500/5', impacto: 'muy alto', aplica: ['todos'] },
  { id: 'black-friday', nombre: 'Black Friday', fecha: 'Último viernes de noviembre', icon: '🖤', color: 'border-white/20 bg-white/3', impacto: 'muy alto', aplica: ['todos'] },
  { id: 'navidad', nombre: 'Navidad', fecha: '15 diciembre - 24 diciembre', icon: '🎄', color: 'border-red-500/30 bg-red-500/5', impacto: 'muy alto', aplica: ['todos'] },
  { id: 'ano-nuevo', nombre: 'Año Nuevo', fecha: '28 diciembre - 31 diciembre', icon: '🎆', color: 'border-amber-500/30 bg-amber-500/5', impacto: 'alto', aplica: ['bienestar', 'fitness', 'digital', 'hogar'] },
  { id: 'san-valentin', nombre: 'San Valentín', fecha: '1 - 14 febrero', icon: '❤️', color: 'border-rose-500/30 bg-rose-500/5', impacto: 'alto', aplica: ['belleza', 'joyería', 'ropa', 'digital'] },
  { id: 'vuelta-cole', nombre: 'Vuelta al Cole', fecha: 'Febrero - Marzo', icon: '📚', color: 'border-emerald-500/30 bg-emerald-500/5', impacto: 'medio', aplica: ['tecnología', 'moda', 'papelería', 'digital'] },
  { id: 'hot-sale', nombre: 'Hot Sale LATAM', fecha: 'Mayo', icon: '🔥', color: 'border-orange-500/30 bg-orange-500/5', impacto: 'muy alto', aplica: ['todos'] },
  { id: 'halloween', nombre: 'Halloween', fecha: 'Octubre', icon: '🎃', color: 'border-orange-500/25 bg-orange-500/5', impacto: 'medio', aplica: ['moda', 'decoración', 'dulces'] },
]

async function callClaude(prompt: string): Promise<TemporadaOutput> {
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
  return JSON.parse(clean) as TemporadaOutput
}

function buildTemporadaPrompt(product: Product, temporada: Temporada, config: Record<string, string>): string {
  return `Sos un experto en campañas de temporada para ecommerce en LATAM. Las campañas de temporada bien planificadas generan 3-10x el revenue normal. La clave es empezar 30 días antes y tener todo preparado.

PRODUCTO: ${product.name} | Descripción: ${product.description} | Precio: ${config.precio || 'no especificado'}
TEMPORADA: ${temporada.nombre} — ${temporada.fecha}
PAÍS: ${config.pais || 'Paraguay'}
PRESUPUESTO DISPONIBLE: ${config.presupuesto || 'USD 50-200 total para la temporada'}

Generá una estrategia COMPLETA de temporada para este producto específico. Incluí copies listos para publicar el día que corresponde.

Respondé SOLO con JSON válido:
{
  "temporada": "${temporada.nombre}",
  "fecha": "${temporada.fecha}",
  "dias_para_preparar": 30,
  "potencial_revenue": "estimación realista de cuánto podés generar en esta temporada con este producto",
  "estrategia": "estrategia específica para este producto en esta temporada — 2-3 líneas directas",
  "cronograma": [
    { "semana": "4 semanas antes", "acciones": ["acción concreta 1", "acción 2", "acción 3"], "objetivo": "qué lograr esta semana" },
    { "semana": "3 semanas antes", "acciones": ["acción 1", "acción 2", "acción 3"], "objetivo": "..." },
    { "semana": "2 semanas antes", "acciones": ["acción 1", "acción 2", "acción 3"], "objetivo": "..." },
    { "semana": "1 semana antes", "acciones": ["acción 1", "acción 2", "acción 3"], "objetivo": "..." },
    { "semana": "Semana de la temporada", "acciones": ["acción 1 — máxima inversión", "acción 2", "acción 3"], "objetivo": "maximizar ventas" },
    { "semana": "Post-temporada", "acciones": ["acción 1 — aprovechar el impulso", "acción 2"], "objetivo": "cerrar ventas rezagadas y fidelizar" }
  ],
  "copies_especiales": [
    { "tipo": "Anuncio principal de temporada", "hook": "hook con emoji de temporada que para el scroll", "copy": "copy completo del anuncio — 3 párrafos conversacionales adaptados a la temporada", "cuando": "1 semana antes de la fecha" },
    { "tipo": "Copy de urgencia — últimas horas", "hook": "hook urgente con countdown", "copy": "copy corto y directo para las últimas 24hs", "cuando": "El día de la fecha" },
    { "tipo": "Copy post-temporada", "hook": "hook para extensión de la oferta", "copy": "copy para los días después — los rezagados", "cuando": "2-3 días después de la fecha" }
  ],
  "presupuesto_sugerido": "cómo distribuir el presupuesto semana a semana durante el período de temporada",
  "kpis_clave": ["KPI más importante para esta temporada 1", "KPI 2", "KPI 3"],
  "errores_comunes": ["error que cometen la mayoría en esta temporada 1", "error 2", "error 3"]
}`
}

function CopyBtn({ text }: { text: string }) {
  const [c, setC] = useState(false)
  return <button onClick={async () => { await navigator.clipboard.writeText(text); setC(true); setTimeout(() => setC(false), 2000) }} className="text-[10px] text-white/25 hover:text-violet-400 transition-colors">{c ? '✓ Copiado' : '⊕ Copiar'}</button>
}

export default function TemporadasPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedTemp, setSelectedTemp] = useState<Temporada | null>(null)
  const [config, setConfig] = useState<Record<string, string>>({})
  const [output, setOutput] = useState<TemporadaOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const generate = async () => {
    if (!selectedProduct || !selectedTemp) return
    setLoading(true); setError('')
    try {
      setOutput(await callClaude(buildTemporadaPrompt(selectedProduct, selectedTemp, config)))
    } catch (e) { setError(e instanceof Error ? e.message : 'Error') }
    setLoading(false)
  }

  const save = async () => {
    if (!output || !selectedProduct) return
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('generations').insert({ user_id: user.id, product_id: selectedProduct.id, tool: 'temporada', status: 'completed', input: { ...config, temporada: selectedTemp?.nombre }, output })
      setSaved(true)
    }
  }

  const impactoColor = { 'muy alto': 'text-emerald-400', 'alto': 'text-amber-400', 'medio': 'text-blue-400' }
  const ic = 'input', lc = 'block text-xs font-medium text-white/40 mb-1.5'

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
              <h1 className="text-lg font-bold text-white">Calendario de Temporadas</h1>
              <span className="tag tag-amber text-[10px]">📅 Revenue predecible</span>
            </div>
            <p className="text-white/40 text-xs">Estrategia completa para Black Friday, Navidad, Día de la Madre y más — 30 días antes</p>
          </div>
        </div>

        {!output ? (
          <div className="space-y-6 animate-fade-up">
            <div>
              <p className="text-xs font-semibold text-white/25 uppercase tracking-widest mb-3">1. Tu producto</p>
              <ProductSelector selectedProductId={selectedProduct?.id || null} onSelect={p => setSelectedProduct(p)} onCreateNew={() => setShowModal(true)} />
            </div>

            <div>
              <p className="text-xs font-semibold text-white/25 uppercase tracking-widest mb-3">2. Seleccioná la temporada</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {TEMPORADAS.map(t => (
                  <button key={t.id} onClick={() => setSelectedTemp(t === selectedTemp ? null : t)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${selectedTemp?.id === t.id ? t.color + ' ring-1 ring-current/30' : 'border-white/8 bg-white/2 hover:border-white/20'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xl">{t.icon}</span>
                      <span className={`text-[10px] font-medium ${impactoColor[t.impacto]}`}>{t.impacto}</span>
                    </div>
                    <p className={`text-xs font-semibold ${selectedTemp?.id === t.id ? 'text-white' : 'text-white/70'}`}>{t.nombre}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{t.fecha}</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedTemp && selectedProduct && (
              <div className="card p-5 space-y-4 animate-fade-up">
                <p className="text-white font-semibold text-sm">3. Configuración</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={lc}>Precio del producto</label><input className={ic} value={config.precio || ''} onChange={e => setConfig(p => ({ ...p, precio: e.target.value }))} placeholder="Ej: Gs. 147.000" /></div>
                  <div>
                    <label className={lc}>País</label>
                    <select className={`${ic} cursor-pointer`} value={config.pais || 'Paraguay'} onChange={e => setConfig(p => ({ ...p, pais: e.target.value }))} style={{ background: '#111' }}>
                      {['Paraguay', 'Argentina', 'Uruguay', 'Chile', 'Colombia', 'México', 'LATAM'].map(o => <option key={o} value={o} style={{ background: '#111' }}>{o}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2"><label className={lc}>Presupuesto total para la temporada</label><input className={ic} value={config.presupuesto || ''} onChange={e => setConfig(p => ({ ...p, presupuesto: e.target.value }))} placeholder="Ej: USD 150 total" /></div>
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={generate} disabled={!selectedProduct || !selectedTemp || loading}
              className="btn-primary w-full py-4 text-base">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />Generando estrategia de temporada...</> : `${selectedTemp?.icon || '📅'} Generar estrategia para ${selectedTemp?.nombre || 'la temporada'} →`}
            </button>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-up">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-2xl">{selectedTemp?.icon}</span>
                  <h2 className="text-white font-bold">{output.temporada}</h2>
                </div>
                <p className="text-white/40 text-xs">{output.fecha} · Preparar {output.dias_para_preparar} días antes</p>
              </div>
              <div className="flex gap-2">
                <button onClick={save} disabled={saved} className={`text-xs px-3 py-2 rounded-lg border transition-all ${saved ? 'border-emerald-500/40 text-emerald-400' : 'border-white/15 text-white/50 hover:border-white/30'}`}>{saved ? '✓' : '💾'}</button>
                <button onClick={() => { setOutput(null); setSaved(false) }} className="btn-secondary text-xs px-3 py-2">← Nueva</button>
              </div>
            </div>

            {/* Banner */}
            <div className={`card p-5 border ${selectedTemp?.color || 'border-amber-500/20'}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-semibold">{output.estrategia}</p>
                <div className="text-right flex-shrink-0 ml-4"><p className="text-[10px] text-white/30">Revenue potencial</p><p className="text-emerald-400 font-bold">{output.potencial_revenue}</p></div>
              </div>
            </div>

            {/* Cronograma */}
            <div className="card p-5 border border-white/8">
              <p className="text-white font-semibold text-sm mb-4">📅 Cronograma semana a semana</p>
              <div className="space-y-4">
                {output.cronograma.map((sem, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-32 flex-shrink-0">
                      <p className={`text-xs font-semibold ${i === 4 ? 'text-amber-400' : 'text-white/50'}`}>{sem.semana}</p>
                      <p className="text-[10px] text-white/25 leading-tight mt-0.5">{sem.objetivo}</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {sem.acciones.map((a, j) => (
                        <div key={j} className="flex gap-2"><span className="text-violet-400/60 text-[10px] flex-shrink-0 mt-0.5">→</span><p className="text-white/65 text-xs leading-relaxed">{a}</p></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Copies especiales */}
            <div>
              <p className="text-xs font-semibold text-white/25 uppercase tracking-widest mb-3">Copies de temporada</p>
              <div className="space-y-3">
                {output.copies_especiales.map((c, i) => (
                  <div key={i} className="card p-4 border border-white/8">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="tag tag-gray text-[10px]">{c.tipo}</span>
                        <span className="text-white/25 text-[10px]">{c.cuando}</span>
                      </div>
                      <CopyBtn text={`🎯 ${c.hook}\n\n${c.copy}`} />
                    </div>
                    <div className="p-3 bg-amber-500/8 border border-amber-500/15 rounded-lg mb-2">
                      <p className="text-[10px] text-amber-400/60 mb-0.5">Hook</p>
                      <p className="text-white font-bold text-sm">{c.hook}</p>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{c.copy}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Presupuesto + KPIs + Errores */}
            <div className="grid grid-cols-1 gap-4">
              <div className="card p-4 border border-emerald-500/15 bg-emerald-500/5">
                <p className="text-emerald-300 text-xs font-bold mb-2">💰 Distribución del presupuesto</p>
                <p className="text-white/70 text-sm">{output.presupuesto_sugerido}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="card p-4 border border-white/8">
                  <p className="text-white/40 text-xs font-semibold mb-2">KPIs clave</p>
                  {output.kpis_clave.map((k, i) => <p key={i} className="text-white/65 text-xs mb-1">• {k}</p>)}
                </div>
                <div className="card p-4 border border-red-500/15 bg-red-500/5">
                  <p className="text-red-400 text-xs font-semibold mb-2">❌ Errores comunes</p>
                  {output.errores_comunes.map((e, i) => <p key={i} className="text-white/55 text-xs mb-1">• {e}</p>)}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
