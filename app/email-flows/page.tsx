'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { getPaisConfig, PAISES, formatPrecio, type Pais } from '@/lib/constants'
import ProductSelector from '@/components/wizard/ProductSelector'
import ProductModal from '@/components/wizard/ProductModal'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Product } from '@/types'

type EmailFlow = {
  nombre_flow: string
  objetivo: string
  duracion_total: string
  emails: Array<{
    numero: number
    tipo: string
    cuando_enviar: string
    asunto: string
    preview_text: string
    cuerpo: string
    cta_texto: string
    cta_url: string
    por_que_en_este_momento: string
    tasa_apertura_esperada: string
  }>
  tips_tecnicos: string[]
}

type FlowOutput = {
  abandono_carrito: EmailFlow
  bienvenida_nuevo_cliente: EmailFlow
  post_compra_upsell: EmailFlow
  reactivacion: EmailFlow
}

async function callClaude(prompt: string): Promise<FlowOutput> {
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
  return JSON.parse(clean) as FlowOutput
}

function buildEmailFlowPrompt(product: Product, config: Record<string, string>): string {
  return `Sos un experto en email marketing para ecommerce en LATAM. Especializado en automatizaciones que recuperan ventas perdidas y maximizan el LTV del cliente.

PRODUCTO: ${product.name} | Descripción: ${product.description} | Precio: ${config.precio || 'no especificado'} | País: ${config.pais || 'Paraguay'} | Público: ${config.publico || 'compradores online'}

Generá los 4 flows de email más importantes para ecommerce. Cada email debe ser completo, listo para copiar en Klaviyo, Mailchimp o ActiveCampaign.

REGLAS:
- Asuntos: máx 50 chars, generar curiosidad o urgencia
- Preview text: complementa el asunto, no lo repite
- Cuerpo: conversacional, en segunda persona, específico para el producto
- CTA único y claro por email

Respondé SOLO con JSON válido:
{
  "abandono_carrito": {
    "nombre_flow": "Recuperación de Carrito Abandonado",
    "objetivo": "Recuperar el 15-25% de los carritos abandonados",
    "duracion_total": "3 días",
    "emails": [
      { "numero": 1, "tipo": "Recordatorio suave", "cuando_enviar": "1 hora después del abandono", "asunto": "asunto máx 50 chars con emoji", "preview_text": "preview text que complementa el asunto", "cuerpo": "cuerpo completo del email — 3-4 párrafos conversacionales y específicos para ${product.name}", "cta_texto": "texto del botón", "cta_url": "{{carrito_url}}", "por_que_en_este_momento": "por qué esta estrategia en este timing", "tasa_apertura_esperada": "35-45%" },
      { "numero": 2, "tipo": "Oferta de rescate", "cuando_enviar": "24 horas después", "asunto": "...", "preview_text": "...", "cuerpo": "...", "cta_texto": "...", "cta_url": "{{carrito_url}}", "por_que_en_este_momento": "...", "tasa_apertura_esperada": "25-35%" },
      { "numero": 3, "tipo": "Urgencia final", "cuando_enviar": "48 horas después — último email", "asunto": "...", "preview_text": "...", "cuerpo": "...", "cta_texto": "...", "cta_url": "{{carrito_url}}", "por_que_en_este_momento": "...", "tasa_apertura_esperada": "20-30%" }
    ],
    "tips_tecnicos": ["tip de configuración 1", "tip 2", "tip 3"]
  },
  "bienvenida_nuevo_cliente": {
    "nombre_flow": "Bienvenida al Nuevo Cliente",
    "objetivo": "Confirmar compra, generar confianza y preparar el upsell",
    "duracion_total": "7 días",
    "emails": [
      { "numero": 1, "tipo": "Confirmación y bienvenida", "cuando_enviar": "Inmediatamente después de la compra", "asunto": "...", "preview_text": "...", "cuerpo": "...", "cta_texto": "...", "cta_url": "{{tracking_url}}", "por_que_en_este_momento": "...", "tasa_apertura_esperada": "65-80%" },
      { "numero": 2, "tipo": "Cómo sacarle el máximo provecho", "cuando_enviar": "Día 3", "asunto": "...", "preview_text": "...", "cuerpo": "...", "cta_texto": "...", "cta_url": "{{tips_url}}", "por_que_en_este_momento": "...", "tasa_apertura_esperada": "40-55%" },
      { "numero": 3, "tipo": "Solicitud de reseña + incentivo", "cuando_enviar": "Día 7 (después de recibir el producto)", "asunto": "...", "preview_text": "...", "cuerpo": "...", "cta_texto": "...", "cta_url": "{{resena_url}}", "por_que_en_este_momento": "...", "tasa_apertura_esperada": "30-40%" }
    ],
    "tips_tecnicos": ["tip 1", "tip 2", "tip 3"]
  },
  "post_compra_upsell": {
    "nombre_flow": "Upsell Post-Compra",
    "objetivo": "Aumentar el ticket promedio con productos complementarios",
    "duracion_total": "14 días",
    "emails": [
      { "numero": 1, "tipo": "Upsell complementario", "cuando_enviar": "10 días después de la compra", "asunto": "...", "preview_text": "...", "cuerpo": "...", "cta_texto": "...", "cta_url": "{{upsell_url}}", "por_que_en_este_momento": "...", "tasa_apertura_esperada": "25-35%" },
      { "numero": 2, "tipo": "Oferta VIP para cliente recurrente", "cuando_enviar": "14 días después", "asunto": "...", "preview_text": "...", "cuerpo": "...", "cta_texto": "...", "cta_url": "{{oferta_url}}", "por_que_en_este_momento": "...", "tasa_apertura_esperada": "20-30%" }
    ],
    "tips_tecnicos": ["tip 1", "tip 2"]
  },
  "reactivacion": {
    "nombre_flow": "Reactivación de Clientes Inactivos",
    "objetivo": "Recuperar clientes que no compran hace 60+ días",
    "duracion_total": "5 días",
    "emails": [
      { "numero": 1, "tipo": "Extrañamos verte", "cuando_enviar": "Día 1 — cliente inactivo 60 días", "asunto": "...", "preview_text": "...", "cuerpo": "...", "cta_texto": "...", "cta_url": "{{tienda_url}}", "por_que_en_este_momento": "...", "tasa_apertura_esperada": "20-30%" },
      { "numero": 2, "tipo": "Oferta exclusiva de regreso", "cuando_enviar": "Día 3 sin respuesta", "asunto": "...", "preview_text": "...", "cuerpo": "...", "cta_texto": "...", "cta_url": "{{oferta_exclusiva_url}}", "por_que_en_este_momento": "...", "tasa_apertura_esperada": "15-25%" },
      { "numero": 3, "tipo": "Último intento", "cuando_enviar": "Día 5 — decide si los das de baja", "asunto": "...", "preview_text": "...", "cuerpo": "...", "cta_texto": "...", "cta_url": "{{ultima_oferta_url}}", "por_que_en_este_momento": "...", "tasa_apertura_esperada": "10-20%" }
    ],
    "tips_tecnicos": ["tip 1", "tip 2", "tip 3"]
  }
}`
}

type EmailItem = FlowOutput['abandono_carrito']['emails'][0]
function EmailCard({ email, flowColor }: { email: EmailItem; flowColor: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const fullEmail = `Asunto: ${email.asunto}\nPreview: ${email.preview_text}\n\n${email.cuerpo}\n\n[CTA: ${email.cta_texto}]`
  return (
    <div className={`card border ${flowColor} overflow-hidden`}>
      <button onClick={() => setOpen(o => !o)} className="w-full p-4 text-left flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{email.numero}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="tag tag-gray text-[10px]">{email.tipo}</span>
            <span className="text-white/25 text-[10px]">{email.cuando_enviar}</span>
          </div>
          <p className="text-white font-semibold text-sm truncate">{email.asunto}</p>
        </div>
        <span className="text-white/20 text-xs flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3 animate-fade-up">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-center"><p className="text-[9px] text-white/25">Apertura esperada</p><p className="text-emerald-400 text-xs font-bold">{email.tasa_apertura_esperada}</p></div>
            </div>
            <button onClick={async () => { await navigator.clipboard.writeText(fullEmail); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              className="text-[10px] text-white/25 hover:text-emerald-400 transition-colors">{copied ? '✓ Copiado' : '⊕ Copiar email'}</button>
          </div>
          <div><p className="text-[10px] text-white/25 mb-1">Preview text</p><p className="text-white/50 text-xs italic">{email.preview_text}</p></div>
          <div className="p-3 bg-white/3 border border-white/8 rounded-lg"><p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">{email.cuerpo}</p></div>
          <div className="flex items-center justify-between">
            <span className="px-3 py-1.5 bg-violet-600/20 border border-violet-500/30 rounded-lg text-violet-300 text-xs font-medium">{email.cta_texto}</span>
            <span className="text-white/20 text-[10px] font-mono">{email.cta_url}</span>
          </div>
          <div className="p-2.5 bg-blue-500/6 border border-blue-500/12 rounded-lg"><p className="text-[10px] text-blue-400/60 mb-0.5">💡 Por qué en este momento</p><p className="text-white/50 text-xs leading-relaxed">{email.por_que_en_este_momento}</p></div>
        </div>
      )}
    </div>
  )
}

function FlowSection({ flow, colorClass, icon }: { flow: EmailFlow; colorClass: string; icon: string }) {
  return (
    <div className="space-y-3">
      <div className={`card p-4 border ${colorClass}`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="text-white font-bold text-sm">{flow.nombre_flow}</p>
            <p className="text-white/40 text-xs">{flow.objetivo} · {flow.duracion_total}</p>
          </div>
        </div>
        {flow.tips_tecnicos?.length > 0 && (
          <div className="pt-3 border-t border-white/5">
            <p className="text-[10px] text-white/25 uppercase mb-1.5">Tips técnicos de configuración</p>
            {flow.tips_tecnicos.map((t, i) => <p key={i} className="text-white/40 text-xs mb-1">• {t}</p>)}
          </div>
        )}
      </div>
      {flow.emails.map(e => <EmailCard key={e.numero} email={e} flowColor={colorClass} />)}
    </div>
  )
}

const FLOWS = ['abandono_carrito', 'bienvenida_nuevo_cliente', 'post_compra_upsell', 'reactivacion']
const FLOW_META = {
  abandono_carrito: { label: '🛒 Abandono de Carrito', color: 'border-amber-500/20', icon: '🛒' },
  bienvenida_nuevo_cliente: { label: '🎉 Bienvenida', color: 'border-emerald-500/20', icon: '🎉' },
  post_compra_upsell: { label: '⬆️ Upsell Post-Compra', color: 'border-blue-500/20', icon: '⬆️' },
  reactivacion: { label: '🔄 Reactivación', color: 'border-violet-500/20', icon: '🔄' },
}

export default function EmailFlowsPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [config, setConfig] = useState<Record<string, string>>({})
  const [output, setOutput] = useState<FlowOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeFlow, setActiveFlow] = useState<typeof FLOWS[number]>('abandono_carrito')
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (selectedProduct) setConfig(p => ({ ...p, publico: p.publico || 'compradores online' }))
  }, [selectedProduct?.id])

  const generate = async () => {
    if (!selectedProduct) return
    setLoading(true); setError(''); setOutput(null)
    try {
      const result = await callClaude(buildEmailFlowPrompt(selectedProduct, config))
      setOutput(result)
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    setLoading(false)
  }

  const save = async () => {
    if (!output || !selectedProduct) return
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('generations').insert({ user_id: user.id, product_id: selectedProduct.id, tool: 'email-flows', status: 'completed', input: config, output })
      setSaved(true)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      {showModal && <ProductModal onClose={() => setShowModal(false)} onCreated={p => { setSelectedProduct(p); setShowModal(false) }} />}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/crear" className="btn-ghost text-white/30 hover:text-white p-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div>
            <div className="flex items-center gap-2"><h1 className="text-lg font-bold text-white">Email Flows</h1><span className="tag tag-emerald text-[10px]">📧 Automatización</span></div>
            <p className="text-white/40 text-xs">4 flows completos: abandono de carrito, bienvenida, upsell y reactivación — listos para Klaviyo o Mailchimp</p>
          </div>
        </div>

        {!output ? (
          <div className="space-y-5 animate-fade-up">
            <ProductSelector selectedProductId={selectedProduct?.id || null} onSelect={p => setSelectedProduct(p)} onCreateNew={() => setShowModal(true)} />
            <div className="card p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-white/40 mb-1.5">Precio del producto</label><input className="input" value={config.precio || ''} onChange={e => setConfig(p => ({ ...p, precio: e.target.value }))} placeholder="Ej: $29 / Gs. 150.000" /></div>
                <div><label className="block text-xs font-medium text-white/40 mb-1.5">País</label><select className="input cursor-pointer" value={config.pais || 'Paraguay'} onChange={e => setConfig(p => ({ ...p, pais: e.target.value }))}>{['Paraguay','Argentina','Uruguay','Chile','Colombia','México','LATAM'].map(o => <option key={o} value={o} style={{ background: '#111' }}>{o}</option>)}</select></div>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={generate} disabled={!selectedProduct || loading} className="btn-primary w-full py-4 text-base">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />Generando 4 flows completos...</> : '📧 Generar 4 Email Flows →'}
            </button>
          </div>
        ) : (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold">4 flows generados para {selectedProduct?.name}</h2>
              <div className="flex gap-2">
                <button onClick={save} disabled={saved} className={`text-xs px-3 py-2 rounded-lg border transition-all ${saved ? 'border-emerald-500/40 text-emerald-400' : 'border-white/15 text-white/50 hover:border-white/30'}`}>{saved ? '✓' : '💾'}</button>
                <button onClick={() => { setOutput(null); setSaved(false) }} className="btn-secondary text-xs px-3 py-2">← Nuevo</button>
              </div>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-2 mb-5">
              {FLOWS.map(f => (
                <button key={f} onClick={() => setActiveFlow(f)} className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeFlow === f ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                  {FLOW_META[f].label}
                </button>
              ))}
            </div>
            <FlowSection flow={output[activeFlow]} colorClass={FLOW_META[activeFlow].color} icon={FLOW_META[activeFlow].icon} />
          </div>
        )}
      </main>
    </div>
  )
}
