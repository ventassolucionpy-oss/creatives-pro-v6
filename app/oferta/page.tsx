'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { getPaisConfig, PAISES, formatPrecio, type Pais } from '@/lib/constants'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Product } from '@/types'

// ─── Tipos ───────────────────────────────────────────────
type OfertaOutput = {
  nombre_oferta: string
  promesa_principal: string
  precio_ancla: { precio: number; justificacion: string }
  precio_real: { precio: number; justificacion: string }
  precio_tachado_mostrar: string
  bonos: Array<{ nombre: string; valor_percibido: number; descripcion: string; por_que_agrega_valor: string }>
  garantia: { tipo: string; duracion: string; texto_completo: string }
  escasez: { tipo: 'tiempo' | 'cantidad' | 'bonus'; texto: string; por_que_creible: string }
  urgencia: { disparador: string; texto: string }
  bundle_upsell: { nombre: string; precio: number; que_incluye: string[]; cuando_ofrecerlo: string }
  copy_headline: string
  copy_subheadline: string
  copy_cta_principal: string
  copy_cta_secundario: string
  copy_whatsapp: string
  por_que_esta_oferta_convierte: string
  stack_visual: string[]
  score_oferta: number
}

async function callClaude(prompt: string): Promise<OfertaOutput> {
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
  return JSON.parse(clean) as OfertaOutput
}

function buildPrompt(product: Product, config: Record<string, string>): string {
  return `Sos Alex Hormozi aplicando el framework de "$100M Offers" al mercado paraguayo de dropshipping COD. Tu trabajo es construir una oferta tan irresistible que el cliente se sienta tonto si no compra.

PRODUCTO:
- Nombre: ${product.name}
- Descripción: ${product.description}
- Precio de venta sugerido: Gs. ${config.precio_gs || product.precio_venta_gs || ''}
- Costo en Dropi: Gs. ${config.costo_gs || product.costo_gs || ''}
- Audiencia: ${config.audiencia || product.audiencia || 'Compradores online Paraguay'}
- Problema principal que resuelve: ${config.problema || ''}
- Competidores que ya venden esto: ${config.competencia || 'varios vendedores en ${paisCfg?.nombre || 'Paraguay'}'}
- Canal de venta: ${config.canal || 'Meta Ads + WhatsApp'}

CONTEXTO DE PARAGUAY:
- Mercado COD — el cliente paga al recibir
- Alta desconfianza en compras online → la garantía es CLAVE
- Guaraníes como moneda — trabajar en Gs.
- El comprador paraguayo responde bien a: urgencia real, garantía fuerte, precio tachado visible

FRAMEWORK A APLICAR (Hormozi):
1. Precio ancla: mostrar un precio alto "real" para hacer que el precio de venta se vea barato
2. Stack de bonos: agregar bonos con alto valor percibido pero bajo costo para vos
3. Garantía de hierro: una garantía que elimine todo el riesgo del comprador
4. Escasez + Urgencia: razones REALES y CREÍBLES para actuar ahora
5. Bundle upsell: qué más podés ofrecerle en el mismo pedido para subir el ticket

Respondé SOLO con JSON válido:
{
  "nombre_oferta": "nombre memorable para este bundle de oferta",
  "promesa_principal": "la transformación en 1 línea — qué cambia en la vida del comprador",
  "precio_ancla": {
    "precio": 450000,
    "justificacion": "por qué este precio ancla es creíble"
  },
  "precio_real": {
    "precio": 180000,
    "justificacion": "por qué este precio se ve como una ganga vs el ancla"
  },
  "precio_tachado_mostrar": "texto exacto: '~~Gs. 450.000~~ → Gs. 180.000 HOY'",
  "bonos": [
    {
      "nombre": "nombre del bono",
      "valor_percibido": 50000,
      "descripcion": "qué es exactamente",
      "por_que_agrega_valor": "por qué el comprador lo valora"
    }
  ],
  "garantia": {
    "tipo": "satisfacción o devolución",
    "duracion": "30 días",
    "texto_completo": "el texto exacto de la garantía para poner en el ad o landing"
  },
  "escasez": {
    "tipo": "tiempo",
    "texto": "el texto exacto de escasez",
    "por_que_creible": "por qué esta escasez es creíble y no suena falsa"
  },
  "urgencia": {
    "disparador": "qué evento o razón crea la urgencia",
    "texto": "el texto exacto para el ad"
  },
  "bundle_upsell": {
    "nombre": "nombre del bundle upsell",
    "precio": 280000,
    "que_incluye": ["producto principal", "bono 1", "bono 2"],
    "cuando_ofrecerlo": "en qué momento del flujo de venta ofrecerlo"
  },
  "copy_headline": "el titular principal de la oferta — máx 50 chars",
  "copy_subheadline": "subheadline que amplía la promesa — máx 100 chars",
  "copy_cta_principal": "texto exacto del botón o CTA — máx 30 chars",
  "copy_cta_secundario": "CTA alternativo más suave",
  "copy_whatsapp": "el mensaje de WhatsApp completo para enviar cuando alguien pregunta el precio — natural, no spam",
  "por_que_esta_oferta_convierte": "explicación de la psicología de conversión detrás de esta oferta específica",
  "stack_visual": ["línea 1 del stack visual para mostrar en el ad", "línea 2", "línea 3"],
  "score_oferta": 85
}`
}

type Phase = 'config' | 'generating' | 'results'

export default function OfertaPage() {
  const [phase, setPhase] = useState<Phase>('config')
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [output, setOutput] = useState<OfertaOutput | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'oferta' | 'copies' | 'upsell'>('oferta')
  const [config, setConfig] = useState({ precio_gs: '', costo_gs: '', audiencia: '', problema: '', competencia: '', canal: 'Meta Ads' })
  const [copied, setCopied] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.from('products').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setProducts(data as Product[])
    })
  }, [])

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const generate = async () => {
    if (!selectedProduct) return
    setPhase('generating'); setError('')
    try {
      const result = await callClaude(buildPrompt(selectedProduct, config))
      setOutput(result); setPhase('results')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar')
      setPhase('config')
    }
  }

  const lc = 'block text-xs text-white/40 mb-1.5'
  const ic = 'w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/50'

  const scoreColor = (s: number) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/crear" className="text-white/30 hover:text-white/60 text-sm flex items-center gap-1.5 mb-4 transition-colors">← Crear</Link>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">💎 Constructor de Oferta</h1>
            <span className="tag tag-violet text-[10px]">IA</span>
          </div>
          <p className="text-white/40 text-sm">Framework $100M Offers de Hormozi aplicado a Paraguay COD</p>
        </div>

        {phase === 'config' && (
          <div className="space-y-5">
            {/* Product selector */}
            <div className="card p-5">
              <p className="text-white font-bold text-sm mb-3">1. ¿Para qué producto?</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {products.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p)
                      setConfig(c => ({
                        ...c,
                        precio_gs: p.precio_venta_gs?.toString() || '',
                        costo_gs: p.costo_gs?.toString() || '',
                        audiencia: p.audiencia || '',
                      }))
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedProduct?.id === p.id
                        ? 'border-violet-500/50 bg-violet-500/10'
                        : 'border-white/8 hover:border-white/20'
                    }`}
                  >
                    <p className="text-white text-sm font-semibold">{p.name}</p>
                    {p.precio_venta_gs ? <p className="text-white/30 text-xs">Gs. {p.precio_venta_gs.toLocaleString('es-PY')}</p> : null}
                  </button>
                ))}
              </div>
              {products.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-white/30 text-sm mb-2">No tenés productos registrados</p>
                  <Link href="/productos" className="text-violet-400 text-xs underline">Agregar producto →</Link>
                </div>
              )}
            </div>

            {selectedProduct && (
              <div className="card p-5 space-y-4">
                <p className="text-white font-bold text-sm">2. Datos para la oferta</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lc}>Precio de venta (Gs.)</label>
                    <input type="number" className={ic} placeholder="180000" value={config.precio_gs} onChange={e => setConfig(c => ({ ...c, precio_gs: e.target.value }))} />
                  </div>
                  <div>
                    <label className={lc}>Costo en Dropi (Gs.)</label>
                    <input type="number" className={ic} placeholder="60000" value={config.costo_gs} onChange={e => setConfig(c => ({ ...c, costo_gs: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className={lc}>Problema principal que resuelve</label>
                  <input type="text" className={ic} placeholder="ej: dolor de espalda crónico" value={config.problema} onChange={e => setConfig(c => ({ ...c, problema: e.target.value }))} />
                </div>
                <div>
                  <label className={lc}>Competencia en ${paisCfg?.nombre || 'Paraguay'}</label>
                  <input type="text" className={ic} placeholder="ej: 5-10 vendedores en FB con el mismo producto" value={config.competencia} onChange={e => setConfig(c => ({ ...c, competencia: e.target.value }))} />
                </div>
                <div>
                  <label className={lc}>Canal principal de venta</label>
                  <select className={ic} value={config.canal} onChange={e => setConfig(c => ({ ...c, canal: e.target.value }))}>
                    <option value="Meta Ads">Meta Ads (Facebook/Instagram)</option>
                    <option value="TikTok Ads">TikTok Ads</option>
                    <option value="Meta Ads + WhatsApp">Meta Ads + WhatsApp</option>
                    <option value="WhatsApp orgánico">WhatsApp orgánico</option>
                  </select>
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              onClick={generate}
              disabled={!selectedProduct}
              className="btn-primary w-full py-4 text-base disabled:opacity-40"
            >
              💎 Construir oferta irresistible →
            </button>
          </div>
        )}

        {phase === 'generating' && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold">Aplicando framework Hormozi...</p>
            <p className="text-white/40 text-sm mt-1">Construyendo el stack de oferta</p>
          </div>
        )}

        {phase === 'results' && output && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold">{output.nombre_oferta}</h2>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${scoreColor(output.score_oferta)}`}>{output.score_oferta}/100</span>
                <button onClick={() => setPhase('config')} className="btn-secondary text-xs px-3 py-2">← Editar</button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-white/8">
              {(['oferta', 'copies', 'upsell'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t ? 'bg-white/10 text-white' : 'text-white/30'}`}
                >
                  {t === 'oferta' ? '💎 Oferta' : t === 'copies' ? '✦ Copies' : '🎯 Upsell'}
                </button>
              ))}
            </div>

            {tab === 'oferta' && (
              <div className="space-y-3">
                {/* Precio */}
                <div className="card p-5 border border-emerald-500/30 bg-emerald-500/5">
                  <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">💰 Estructura de precio</p>
                  <p className="text-3xl font-black text-white line-through text-white/30">Gs. {output.precio_ancla.precio.toLocaleString('es-PY')}</p>
                  <p className="text-3xl font-black text-emerald-400">Gs. {output.precio_real.precio.toLocaleString('es-PY')}</p>
                  <p className="text-white/40 text-xs mt-2">{output.precio_ancla.justificacion}</p>
                </div>

                {/* Promesa */}
                <div className="card p-4">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Promesa principal</p>
                  <p className="text-white font-bold text-sm">{output.promesa_principal}</p>
                </div>

                {/* Stack visual */}
                <div className="card p-5">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-3">📦 Stack de oferta</p>
                  <div className="space-y-2">
                    {output.stack_visual.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-violet-600/30 flex items-center justify-center text-violet-300 text-[10px] font-bold flex-shrink-0">{i + 1}</div>
                        <p className="text-white text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bonos */}
                <div className="card p-5">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-3">🎁 Bonos incluidos</p>
                  <div className="space-y-3">
                    {output.bonos.map((b, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/8">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white font-semibold text-sm">{b.nombre}</p>
                          <span className="text-emerald-400 text-xs font-bold">Gs. {b.valor_percibido.toLocaleString('es-PY')}</span>
                        </div>
                        <p className="text-white/40 text-xs">{b.descripcion}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Garantía */}
                <div className="card p-4 border border-blue-500/20 bg-blue-500/5">
                  <p className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-2">🛡️ Garantía</p>
                  <p className="text-white font-bold text-sm mb-1">{output.garantia.tipo} — {output.garantia.duracion}</p>
                  <p className="text-white/60 text-xs leading-relaxed">{output.garantia.texto_completo}</p>
                </div>

                {/* Escasez + Urgencia */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="card p-4 border border-red-500/20">
                    <p className="text-red-400 text-[10px] font-bold uppercase mb-1">⏰ Escasez</p>
                    <p className="text-white/70 text-xs">{output.escasez.texto}</p>
                  </div>
                  <div className="card p-4 border border-amber-500/20">
                    <p className="text-amber-400 text-[10px] font-bold uppercase mb-1">🔥 Urgencia</p>
                    <p className="text-white/70 text-xs">{output.urgencia.texto}</p>
                  </div>
                </div>

                {/* Por qué convierte */}
                <div className="card p-4">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">🧠 Por qué esta oferta convierte</p>
                  <p className="text-white/60 text-xs leading-relaxed">{output.por_que_esta_oferta_convierte}</p>
                </div>
              </div>
            )}

            {tab === 'copies' && (
              <div className="space-y-3">
                {[
                  { label: 'Headline', value: output.copy_headline, key: 'headline' },
                  { label: 'Subheadline', value: output.copy_subheadline, key: 'sub' },
                  { label: 'CTA Principal', value: output.copy_cta_principal, key: 'cta1' },
                  { label: 'CTA Secundario', value: output.copy_cta_secundario, key: 'cta2' },
                ].map(item => (
                  <div key={item.key} className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">{item.label}</p>
                      <button
                        onClick={() => copy(item.value, item.key)}
                        className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        {copied === item.key ? '✓ Copiado' : 'Copiar'}
                      </button>
                    </div>
                    <p className="text-white text-sm">{item.value}</p>
                  </div>
                ))}

                <div className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">📱 Script WhatsApp</p>
                    <button
                      onClick={() => copy(output.copy_whatsapp, 'wa')}
                      className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      {copied === 'wa' ? '✓ Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed whitespace-pre-line">{output.copy_whatsapp}</p>
                </div>
              </div>
            )}

            {tab === 'upsell' && (
              <div className="space-y-3">
                <div className="card p-5 border border-violet-500/30 bg-violet-500/5">
                  <p className="text-violet-400 text-[10px] font-bold uppercase tracking-wider mb-3">💎 Bundle Upsell</p>
                  <p className="text-white font-bold text-lg mb-1">{output.bundle_upsell.nombre}</p>
                  <p className="text-violet-300 font-bold text-xl mb-3">Gs. {output.bundle_upsell.precio.toLocaleString('es-PY')}</p>
                  <div className="space-y-1 mb-3">
                    {output.bundle_upsell.que_incluye.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-violet-400 text-xs">✓</span>
                        <p className="text-white/70 text-xs">{item}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/40 text-xs border-t border-white/8 pt-3">{output.bundle_upsell.cuando_ofrecerlo}</p>
                </div>

                <div className="card p-4">
                  <p className="text-white/40 text-[10px] font-bold uppercase mb-2">Aumento de ticket estimado</p>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-white/40 text-xs">Precio base</p>
                      <p className="text-white font-bold">Gs. {output.precio_real.precio.toLocaleString('es-PY')}</p>
                    </div>
                    <span className="text-white/20">→</span>
                    <div>
                      <p className="text-white/40 text-xs">Con upsell</p>
                      <p className="text-emerald-400 font-bold">Gs. {output.bundle_upsell.precio.toLocaleString('es-PY')}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Extra</p>
                      <p className="text-emerald-400 font-bold">+{Math.round(((output.bundle_upsell.precio - output.precio_real.precio) / output.precio_real.precio) * 100)}%</p>
                    </div>
                  </div>
                </div>

                <Link href="/upsell" className="btn-secondary w-full py-3 text-center block text-sm">
                  Ver más estrategias de upsell →
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
