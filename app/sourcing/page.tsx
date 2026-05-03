'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

type SourcingOutput = {
  evaluacion: {
    score: number
    potencial: 'alto' | 'medio' | 'bajo'
    veredicto: string
    apto_cod: boolean
  }
  precio_optimo: {
    costo_dropi_estimado: string
    precio_venta_recomendado: string
    precio_tachado: string
    margen_bruto_pct: string
    margen_neto_estimado: string
    roas_break_even: string
    justificacion: string
  }
  descripcion_checkout: {
    nombre_comercial: string
    subtitulo: string
    descripcion_corta: string
    descripcion_larga: string
    bullets_beneficios: string[]
    garantia: string
    incluye: string[]
  }
  angulos_venta: Array<{
    angulo: string
    hook: string
    por_que_funciona_paraguay: string
  }>
  fotografia_celular: {
    equipamiento: string[]
    fondos_recomendados: string[]
    tomas_obligatorias: string[]
    iluminacion: string
    edicion: string
    errores_comunes: string[]
  }
  red_flags: string[]
  siguiente_paso: string
}

async function callClaude(prompt: string): Promise<SourcingOutput> {
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
  return JSON.parse(clean) as SourcingOutput
}

function buildSourcingPrompt(data: Record<string, string>): string {
  return `Sos un experto en dropshipping en Paraguay con 5+ años operando con Dropi Paraguay. Conocés el mercado paraguayo a fondo: qué compra la gente, a qué precio, qué genera confianza y qué genera rechazo.

CONTEXTO DROPI PARAGUAY:
- Dropi.co/py es el principal proveedor de dropshipping en Paraguay
- Ofrece Cash on Delivery (COD) — el cliente paga al recibir
- Envíos en 1-3 días hábiles desde sus depósitos en Asunción
- El costo del producto en Dropi ya incluye el envío al cliente
- Margen típico: el precio Dropi es el 25-40% del precio de venta sugerido
- La tasa de devolución COD en Paraguay es del 15-25%
- El ticket promedio que más convierte: Gs. 80.000 - Gs. 200.000

PRODUCTO A EVALUAR:
- Nombre/Descripción: ${data.producto}
- Costo estimado en Dropi (si lo sabe): ${data.costo_dropi || 'a estimar'}
- Precio de venta tentativo: ${data.precio_venta || 'a definir'}
- Categoría: ${data.categoria || 'general'}
- Ofrece COD: ${data.cod || 'sí'}

Analizá este producto para el mercado paraguayo con Dropi y dame TODO lo que necesito para lanzarlo.

Respondé SOLO con JSON válido:
{
  "evaluacion": {
    "score": 7.5,
    "potencial": "alto",
    "veredicto": "2-3 líneas directas sobre si este producto tiene potencial real en Paraguay con Dropi — honestidad brutal, sin suavizar",
    "apto_cod": true
  },
  "precio_optimo": {
    "costo_dropi_estimado": "estimación del costo en Dropi en guaraníes si no fue especificado",
    "precio_venta_recomendado": "precio en guaraníes terminado en X7.000 — el precio que maximiza conversión en Paraguay",
    "precio_tachado": "precio tachado en guaraníes (+70%) terminado en X7.000",
    "margen_bruto_pct": "porcentaje de margen antes de ads",
    "margen_neto_estimado": "margen estimado después de ads con ROAS 3x en guaraníes",
    "roas_break_even": "ROAS mínimo necesario para no perder dinero",
    "justificacion": "por qué ese precio funciona en Paraguay — psicología de precios local"
  },
  "descripcion_checkout": {
    "nombre_comercial": "nombre del producto optimizado para conversión — no el nombre técnico",
    "subtitulo": "subtítulo de 1 línea con la promesa principal",
    "descripcion_corta": "2-3 líneas para el copy de la landing o la descripción de WhatsApp — orientada a beneficios",
    "descripcion_larga": "descripción completa para la página de producto — storytelling + beneficios + especificaciones — lista para copiar en Lovable o Tiendanube",
    "bullets_beneficios": ["beneficio concreto 1 — resultado específico", "beneficio 2", "beneficio 3", "beneficio 4", "beneficio 5"],
    "garantia": "texto de garantía específico para Paraguay — debe generar confianza ante la desconfianza del mercado",
    "incluye": ["lo que incluye el pedido 1", "lo que incluye 2", "bonus si aplica"]
  },
  "angulos_venta": [
    {
      "angulo": "nombre del ángulo",
      "hook": "hook específico para este ángulo — listo para usar como primera línea del ad",
      "por_que_funciona_paraguay": "por qué este ángulo conecta con el consumidor paraguayo en particular"
    },
    { "angulo": "segundo ángulo", "hook": "...", "por_que_funciona_paraguay": "..." },
    { "angulo": "tercer ángulo", "hook": "...", "por_que_funciona_paraguay": "..." }
  ],
  "fotografia_celular": {
    "equipamiento": ["lo que necesitás para hacer fotos profesionales con el celular — sin gastar en estudio"],
    "fondos_recomendados": ["fondo 1 con instrucción de cómo crearlo en casa", "fondo 2", "fondo 3"],
    "tomas_obligatorias": ["toma 1 — descripción exacta de qué mostrar y desde qué ángulo", "toma 2", "toma 3", "toma 4", "toma 5"],
    "iluminacion": "cómo conseguir buena luz sin equipo profesional — específico para casas paraguayas",
    "edicion": "qué app usar para editar y qué ajustes hacer — instrucciones concretas",
    "errores_comunes": ["error 1 que arruina las fotos de producto", "error 2", "error 3"]
  },
  "red_flags": [
    "señal de que este producto puede NO funcionar o tener problemas — honestidad total",
    "red flag 2",
    "red flag 3"
  ],
  "siguiente_paso": "la primera acción concreta a hacer mañana para lanzar este producto — específica y accionable"
}`
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="text-[10px] text-white/25 hover:text-violet-400 transition-colors">
      {copied ? '✓ Copiado' : '⊕ Copiar'}
    </button>
  )
}

export default function SourcingPage() {
  const [form, setForm] = useState<Record<string, string>>({ cod: 'sí' })
  const [output, setOutput] = useState<SourcingOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'precio' | 'descripcion' | 'angulos' | 'fotos'>('precio')

  const analyze = async () => {
    if (!form.producto?.trim()) return
    setLoading(true); setError('')
    try {
      const result = await callClaude(buildSourcingPrompt(form))
      setOutput(result); setActiveTab('precio')
    } catch (e) { setError(e instanceof Error ? e.message : 'Error') }
    setLoading(false)
  }

  const inputClass = 'input'
  const labelClass = 'block text-xs font-medium text-white/40 mb-1.5'
  const potencialConfig = {
    alto: { color: 'border-emerald-500/30 bg-emerald-500/8 text-emerald-400', label: 'Alto potencial' },
    medio: { color: 'border-amber-500/30 bg-amber-500/8 text-amber-400', label: 'Potencial medio' },
    bajo: { color: 'border-red-500/30 bg-red-500/8 text-red-400', label: 'Bajo potencial' },
  }

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
              <h1 className="text-lg font-bold text-white">Sourcing & Producto</h1>
              <span className="tag text-[10px]" style={{background:'rgba(239,68,68,0.15)',color:'#f87171',border:'1px solid rgba(239,68,68,0.3)'}}>🇵🇾 Dropi Paraguay</span>
            </div>
            <p className="text-white/40 text-xs">Evaluá el producto, calculá el precio óptimo y generá descripción + fotos para lanzar</p>
          </div>
        </div>

        {/* Guía rápida de Dropi */}
        <div className="card p-4 border border-orange-500/15 bg-orange-500/5 mb-5">
          <p className="text-orange-300 text-xs font-bold mb-2">Antes de empezar — Cómo usar Dropi Paraguay</p>
          <div className="space-y-1.5 text-white/50 text-xs">
            <p>1. Registrarte en <strong className="text-white/70">dropi.co/py</strong> con tu cédula o RUC</p>
            <p>2. Explorá el catálogo — filtrá por categoría y fijate en el precio del proveedor</p>
            <p>3. El precio de venta sugerido por Dropi es solo orientativo — vos definís el tuyo</p>
            <p>4. Antes de lanzar ads, hacé 1-2 pedidos de prueba para verificar calidad y tiempo de entrega</p>
            <p>5. Activá COD (pago contra entrega) si está disponible — va a triplicar tus conversiones</p>
          </div>
        </div>

        {!output ? (
          <div className="space-y-5 animate-fade-up">
            <div className="card p-5 space-y-4">
              <div>
                <label className={labelClass}>Producto a evaluar *</label>
                <textarea className={`${inputClass} resize-none h-20 text-sm`} value={form.producto || ''} onChange={e => setForm(p => ({...p, producto: e.target.value}))}
                  placeholder="Descripción del producto que encontraste en Dropi o que querés vender. Cuanto más detalle, mejor el análisis. Ej: Masajeador de cuello eléctrico con calor, 3 niveles de intensidad, recargable por USB" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Costo en Dropi (si lo sabés)</label>
                  <input className={inputClass} value={form.costo_dropi || ''} onChange={e => setForm(p => ({...p, costo_dropi: e.target.value}))} placeholder="Ej: Gs. 45.000" />
                </div>
                <div>
                  <label className={labelClass}>Precio de venta tentativo</label>
                  <input className={inputClass} value={form.precio_venta || ''} onChange={e => setForm(p => ({...p, precio_venta: e.target.value}))} placeholder="Ej: Gs. 147.000" />
                </div>
                <div>
                  <label className={labelClass}>Categoría del producto</label>
                  <select className={`${inputClass} cursor-pointer`} value={form.categoria || ''} onChange={e => setForm(p => ({...p, categoria: e.target.value}))} style={{background:'#111'}}>
                    <option value="" style={{background:'#111'}}>Seleccionar...</option>
                    {['Belleza / Skincare','Salud / Bienestar','Tecnología / Gadgets','Hogar / Decoración','Ropa / Moda','Deporte / Fitness','Mascotas','Bebés / Niños','Herramientas','Otro'].map(o => <option key={o} value={o} style={{background:'#111'}}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>¿Ofrece COD (contra entrega)?</label>
                  <select className={`${inputClass} cursor-pointer`} value={form.cod || 'sí'} onChange={e => setForm(p => ({...p, cod: e.target.value}))} style={{background:'#111'}}>
                    {['Sí — con contra entrega','No — solo pago online','No sé todavía'].map(o => <option key={o} value={o} style={{background:'#111'}}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={analyze} disabled={!form.producto?.trim() || loading} className="btn-primary w-full py-4 text-base">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />Analizando el producto...</> : '🛍️ Evaluar producto para Dropi Paraguay →'}
            </button>
          </div>
        ) : (
          <div className="animate-fade-up">

            {/* Evaluación */}
            <div className={`card p-5 border rounded-2xl mb-5 ${potencialConfig[output.evaluacion.potencial].color}`}>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 rounded-2xl bg-current/10 flex items-center justify-center flex-shrink-0">
                  <p className="text-3xl font-black">{output.evaluacion.score}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">Potencial del producto</p>
                  <p className="font-bold text-lg">{potencialConfig[output.evaluacion.potencial].label}</p>
                  {output.evaluacion.apto_cod && <span className="text-[10px] bg-current/15 px-2 py-0.5 rounded-full">✓ Apto para COD</span>}
                </div>
              </div>
              <p className="text-sm opacity-80 leading-relaxed">{output.evaluacion.veredicto}</p>
              {output.red_flags.length > 0 && (
                <div className="mt-3 pt-3 border-t border-current/15">
                  <p className="text-[10px] font-bold uppercase mb-1.5 opacity-60">⚠️ Red flags a tener en cuenta</p>
                  {output.red_flags.map((f, i) => <p key={i} className="text-xs opacity-70 mb-1">• {f}</p>)}
                </div>
              )}
            </div>

            {/* Siguiente paso */}
            <div className="card p-4 border border-amber-500/25 bg-amber-500/8 mb-5">
              <p className="text-amber-300 text-[10px] font-bold uppercase mb-1">⚡ Siguiente paso — Lo que hacés mañana</p>
              <p className="text-white font-medium text-sm leading-relaxed">{output.siguiente_paso}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2 mb-5">
              {[
                { id: 'precio', label: '💰 Precio & Margen' },
                { id: 'descripcion', label: '📝 Descripción' },
                { id: 'angulos', label: '🎯 Ángulos de Venta' },
                { id: 'fotos', label: '📸 Fotos con Celular' },
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* PRECIO */}
            {activeTab === 'precio' && (
              <div className="space-y-4 animate-fade-up">
                <div className="card p-5 border border-emerald-500/20 bg-emerald-500/5">
                  <p className="text-emerald-300 text-[10px] font-bold uppercase mb-3">💰 Estructura de precio óptima para Paraguay</p>
                  <div className="space-y-2">
                    {[
                      ['Costo Dropi estimado', output.precio_optimo.costo_dropi_estimado, 'text-red-400/80'],
                      ['Precio de venta recomendado', output.precio_optimo.precio_venta_recomendado, 'text-emerald-400 text-xl font-black'],
                      ['Precio tachado (+70%)', output.precio_optimo.precio_tachado, 'text-white/40 line-through'],
                      ['Margen bruto', output.precio_optimo.margen_bruto_pct, 'text-white'],
                      ['Margen neto estimado (ROAS 3x)', output.precio_optimo.margen_neto_estimado, 'text-emerald-400'],
                      ['ROAS break-even', output.precio_optimo.roas_break_even, 'text-amber-400'],
                    ].map(([l, v, c]) => (
                      <div key={l} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <p className="text-white/40 text-xs">{l}</p>
                        <p className={`text-xs font-bold ${c}`}>{v}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/50 text-xs mt-3 leading-relaxed italic">{output.precio_optimo.justificacion}</p>
                </div>
                <div className="card p-4 border border-blue-500/15 bg-blue-500/5">
                  <p className="text-blue-300 text-xs font-bold mb-2">🔵 COD — Cómo afecta al margen real</p>
                  <p className="text-white/60 text-xs leading-relaxed">Con COD en Paraguay esperá un 15-25% de devoluciones. Cada devolución te cuesta el envío de vuelta (~Gs. 10.000-15.000 según Dropi). Calculá tu margen neto COD restando las devoluciones esperadas. Si el producto cuesta Gs. 45.000, vendés a Gs. 147.000 y tenés 20% devoluciones: margen real ≈ (147.000 − 45.000) × 0.8 − costo ads.</p>
                </div>
              </div>
            )}

            {/* DESCRIPCIÓN */}
            {activeTab === 'descripcion' && (
              <div className="space-y-4 animate-fade-up">
                <div className="card p-5 border border-white/8 space-y-4">
                  {[
                    { label: 'Nombre comercial', value: output.descripcion_checkout.nombre_comercial, big: true },
                    { label: 'Subtítulo', value: output.descripcion_checkout.subtitulo, big: false },
                    { label: 'Descripción corta (WhatsApp / Stories)', value: output.descripcion_checkout.descripcion_corta, big: false },
                  ].map(f => (
                    <div key={f.label}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] text-white/30 uppercase">{f.label}</p>
                        <CopyBtn text={f.value} />
                      </div>
                      <p className={`${f.big ? 'text-white font-bold text-lg' : 'text-white/75 text-sm'} leading-relaxed`}>{f.value}</p>
                    </div>
                  ))}
                </div>

                <div className="card p-4 border border-white/8">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-white/30 uppercase">Descripción larga (landing / checkout)</p>
                    <CopyBtn text={output.descripcion_checkout.descripcion_larga} />
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{output.descripcion_checkout.descripcion_larga}</p>
                </div>

                <div className="card p-4 border border-emerald-500/15">
                  <p className="text-emerald-300 text-[10px] font-bold uppercase mb-2">Bullets de beneficios</p>
                  <ul className="space-y-1.5">
                    {output.descripcion_checkout.bullets_beneficios.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <span className="text-emerald-400 flex-shrink-0">✓</span>{b}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="card p-4 border border-white/8">
                    <p className="text-[10px] text-white/30 uppercase mb-1">Garantía</p>
                    <p className="text-white/70 text-sm">{output.descripcion_checkout.garantia}</p>
                  </div>
                  <div className="card p-4 border border-white/8">
                    <p className="text-[10px] text-white/30 uppercase mb-2">Incluye</p>
                    {output.descripcion_checkout.incluye.map((i, idx) => (
                      <p key={idx} className="text-white/60 text-xs mb-1 flex gap-2"><span className="text-violet-400">→</span>{i}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ÁNGULOS */}
            {activeTab === 'angulos' && (
              <div className="space-y-4 animate-fade-up">
                <div className="card p-3 border border-violet-500/15 bg-violet-500/5 text-xs text-violet-400/70 mb-2">
                  Estos ángulos están adaptados específicamente al consumidor paraguayo. El contexto cultural y el nivel de confianza son distintos a Argentina o México.
                </div>
                {output.angulos_venta.map((a, i) => {
                  const colors = ['border-violet-500/20', 'border-amber-500/20', 'border-emerald-500/20']
                  return (
                    <div key={i} className={`card p-4 border ${colors[i % 3]}`}>
                      <p className="text-white font-semibold text-sm mb-2">{a.angulo}</p>
                      <div className="p-3 bg-violet-500/8 border border-violet-500/20 rounded-lg mb-2">
                        <p className="text-[10px] text-violet-400/60 mb-1">Hook para el ad</p>
                        <p className="text-white font-bold text-sm">"{a.hook}"</p>
                      </div>
                      <p className="text-white/50 text-xs leading-relaxed flex gap-2">
                        <span className="text-emerald-400 flex-shrink-0">🇵🇾</span>
                        {a.por_que_funciona_paraguay}
                      </p>
                    </div>
                  )
                })}
                <Link href="/campana" className="btn-primary w-full py-3 text-center block mt-4">
                  ⚡ Generar campaña completa con estos ángulos →
                </Link>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Link href="/checkout-dropi" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-violet-500/30 transition-all">
                    <span>🛒</span><div><p className="text-white text-xs font-bold">Checkout Dropi</p><p className="text-white/30 text-[10px]">Ficha completa del producto</p></div>
                  </Link>
                  <Link href="/validador-producto" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-violet-500/30 transition-all">
                    <span>✅</span><div><p className="text-white text-xs font-bold">Validador COD</p><p className="text-white/30 text-[10px]">14 criterios antes de comprar</p></div>
                  </Link>
                </div>
              </div>
            )}

            {/* FOTOS */}
            {activeTab === 'fotos' && (
              <div className="space-y-4 animate-fade-up">
                <div className="card p-3 border border-amber-500/15 bg-amber-500/5 text-xs text-amber-400/70 mb-2">
                  📸 Fotos profesionales con el celular. La diferencia entre una foto que vende y una que no vende no es la cámara — es la luz y el ángulo.
                </div>

                <div className="card p-4 border border-white/8">
                  <p className="text-white/60 text-xs font-bold uppercase mb-2">Equipamiento (todo económico)</p>
                  <ul className="space-y-1.5">
                    {output.fotografia_celular.equipamiento.map((e, i) => (
                      <li key={i} className="flex gap-2 text-xs text-white/65"><span className="text-violet-400 flex-shrink-0">→</span>{e}</li>
                    ))}
                  </ul>
                </div>

                <div className="card p-4 border border-white/8">
                  <p className="text-white/60 text-xs font-bold uppercase mb-2">Iluminación</p>
                  <p className="text-white/70 text-sm leading-relaxed">{output.fotografia_celular.iluminacion}</p>
                </div>

                <div className="card p-4 border border-white/8">
                  <p className="text-white/60 text-xs font-bold uppercase mb-2">Fondos recomendados (DIY)</p>
                  {output.fotografia_celular.fondos_recomendados.map((f, i) => (
                    <div key={i} className="flex gap-2 text-xs text-white/65 mb-2">
                      <span className="text-amber-400 flex-shrink-0">{i + 1}.</span>{f}
                    </div>
                  ))}
                </div>

                <div className="card p-4 border border-emerald-500/15">
                  <p className="text-emerald-300 text-xs font-bold uppercase mb-2">Tomas obligatorias (en este orden)</p>
                  {output.fotografia_celular.tomas_obligatorias.map((t, i) => (
                    <div key={i} className="flex gap-2 text-xs mb-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                      <p className="text-white/70 leading-relaxed">{t}</p>
                    </div>
                  ))}
                </div>

                <div className="card p-4 border border-blue-500/15">
                  <p className="text-blue-300 text-xs font-bold uppercase mb-2">Edición (gratis en el celular)</p>
                  <p className="text-white/70 text-sm leading-relaxed">{output.fotografia_celular.edicion}</p>
                </div>

                <div className="card p-4 border border-red-500/15 bg-red-500/5">
                  <p className="text-red-400 text-xs font-bold uppercase mb-2">🚫 Errores que arruinan las fotos</p>
                  {output.fotografia_celular.errores_comunes.map((e, i) => (
                    <p key={i} className="text-white/60 text-xs mb-1 flex gap-2"><span className="text-red-400 flex-shrink-0">✕</span>{e}</p>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setOutput(null)} className="btn-secondary w-full py-3 mt-6">← Evaluar otro producto</button>
          </div>
        )}
      </main>
    </div>
  )
}
