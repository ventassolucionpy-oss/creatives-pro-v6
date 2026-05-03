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

type WAFlow = {
  nombre: string
  trigger: string
  objetivo: string
  mensajes: Array<{
    numero: number
    tipo: string
    cuando: string
    mensaje: string
    si_responde_si?: string
    si_responde_no?: string
    nota?: string
  }>
  tips: string[]
}

type WAOutput = {
  flujo_nuevo_lead: WAFlow
  flujo_carrito_abandonado: WAFlow
  flujo_post_compra: WAFlow
  flujo_cierre_vendedor: WAFlow
  flujo_reclamos: WAFlow
  respuestas_rapidas: Array<{ situacion: string; respuesta: string }>
  tips_generales: string[]
}

async function callClaude(prompt: string): Promise<WAOutput> {
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
  return JSON.parse(clean) as WAOutput
}

function buildWAPrompt(product: Product, config: Record<string, string>): string {
  return `Sos un experto en WhatsApp Marketing y ventas conversacionales en LATAM. WhatsApp tiene 98% tasa de apertura en ${paisCfg?.nombre || 'Paraguay'} y es el canal de mayor conversión en ecommerce latinoamericano.

PRODUCTO: ${product.name} | Descripción: ${product.description} | Precio: ${config.precio || 'no especificado'} | País: ${config.pais || 'Paraguay'} | Tono: ${config.tono || 'Cercano y profesional'}

Reglas de WhatsApp que convierten:
- Máx 3 líneas por mensaje (el usuario lee en móvil)
- Nunca más de 1 mensaje seguido sin respuesta del cliente
- Emojis estratégicos — máx 2 por mensaje
- Preguntas que invitan a responder Sí/No
- Urgencia real, nunca falsa
- Nombre del cliente cuando lo tenés
- Voice notes cuando hay objeciones complejas (indicalo como nota)

Generá 5 flujos completos MÁS respuestas rápidas para situaciones comunes. Respondé SOLO con JSON válido:
{
  "flujo_nuevo_lead": {
    "nombre": "Atención Lead Nuevo",
    "trigger": "El lead llega por primera vez (desde ad, landing o referido)",
    "objetivo": "Calificar, generar confianza y llevar a la compra en menos de 24hs",
    "mensajes": [
      {
        "numero": 1,
        "tipo": "Bienvenida inmediata",
        "cuando": "Primeros 5 minutos de recibir el lead",
        "mensaje": "mensaje completo listo para copiar — máx 3 líneas, emoji estratégico, pregunta de calificación",
        "si_responde_si": "qué decir si responde positivamente",
        "si_responde_no": "qué decir si no está interesado o no responde",
        "nota": "consejo de implementación o cuándo usar voice note"
      },
      { "numero": 2, "tipo": "Presentación del producto", "cuando": "Inmediatamente después de la respuesta positiva", "mensaje": "...", "si_responde_si": "...", "si_responde_no": "...", "nota": "..." },
      { "numero": 3, "tipo": "Manejo de la objeción más común", "cuando": "Si hay duda o silencio después de la presentación", "mensaje": "...", "nota": "..." },
      { "numero": 4, "tipo": "Cierre con urgencia real", "cuando": "Cuando hay interés pero no decisión", "mensaje": "...", "nota": "..." },
      { "numero": 5, "tipo": "Seguimiento final", "cuando": "24hs después sin respuesta", "mensaje": "...", "nota": "..." }
    ],
    "tips": ["tip específico para este flujo 1", "tip 2"]
  },
  "flujo_carrito_abandonado": {
    "nombre": "Recuperación Carrito Abandonado",
    "trigger": "Cliente inició el proceso de compra pero no completó",
    "objetivo": "Recuperar la venta en las próximas 2 horas",
    "mensajes": [
      { "numero": 1, "tipo": "Recordatorio amigable", "cuando": "30 minutos después del abandono", "mensaje": "...", "si_responde_si": "...", "si_responde_no": "...", "nota": "..." },
      { "numero": 2, "tipo": "Oferta de rescate", "cuando": "2 horas después sin compra", "mensaje": "...", "nota": "..." },
      { "numero": 3, "tipo": "Última oportunidad", "cuando": "Al día siguiente — solo si no compró", "mensaje": "...", "nota": "..." }
    ],
    "tips": ["tip 1", "tip 2"]
  },
  "flujo_post_compra": {
    "nombre": "Post-Compra y Fidelización",
    "trigger": "Cliente realizó la compra",
    "objetivo": "Confirmar, generar confianza, conseguir reseña y preparar próxima compra",
    "mensajes": [
      { "numero": 1, "tipo": "Confirmación y expectativa", "cuando": "Inmediatamente después del pago", "mensaje": "...", "nota": "..." },
      { "numero": 2, "tipo": "Actualización de envío", "cuando": "Cuando el pedido sale", "mensaje": "...", "nota": "..." },
      { "numero": 3, "tipo": "Solicitud de reseña", "cuando": "3-5 días después de la entrega estimada", "mensaje": "...", "si_responde_si": "...", "nota": "..." },
      { "numero": 4, "tipo": "Upsell o producto complementario", "cuando": "7 días después de la entrega", "mensaje": "...", "nota": "..." }
    ],
    "tips": ["tip 1", "tip 2"]
  },
  "flujo_cierre_vendedor": {
    "nombre": "Scripts de Cierre para Vendedor",
    "trigger": "Cliente muestra interés pero no decide — el vendedor toma control activo",
    "objetivo": "Cerrar la venta en la conversación actual",
    "mensajes": [
      { "numero": 1, "tipo": "Técnica del espejo — identificar la objeción real", "cuando": "Cuando el cliente dice 'lo pienso'", "mensaje": "...", "nota": "..." },
      { "numero": 2, "tipo": "Prueba social instantánea", "cuando": "Cuando dice 'no sé si funciona'", "mensaje": "...", "nota": "..." },
      { "numero": 3, "tipo": "Reducción del riesgo", "cuando": "Cuando dice 'está caro' o 'no tengo plata ahora'", "mensaje": "...", "nota": "..." },
      { "numero": 4, "tipo": "Urgencia genuina", "cuando": "Para activar la decisión hoy", "mensaje": "...", "nota": "..." },
      { "numero": 5, "tipo": "Cierre asumido", "cuando": "Cuando todo lo demás funcionó", "mensaje": "...", "nota": "..." }
    ],
    "tips": ["tip de ventas 1", "tip 2", "tip 3"]
  },
  "flujo_reclamos": {
    "nombre": "Gestión de Reclamos y Devoluciones",
    "trigger": "Cliente insatisfecho, producto dañado o no llegó",
    "objetivo": "Resolver sin perder al cliente y sin destruir la reputación",
    "mensajes": [
      { "numero": 1, "tipo": "Recepción empática del reclamo", "cuando": "Inmediatamente al recibir el reclamo", "mensaje": "...", "nota": "..." },
      { "numero": 2, "tipo": "Oferta de solución — nunca pedir fotos como primer paso", "cuando": "30 segundos después", "mensaje": "...", "si_responde_si": "...", "nota": "..." },
      { "numero": 3, "tipo": "Cierre del reclamo y reconversión", "cuando": "Después de resolver el problema", "mensaje": "...", "nota": "..." }
    ],
    "tips": ["tip para manejar reclamos 1", "tip 2"]
  },
  "respuestas_rapidas": [
    { "situacion": "¿Cuánto cuesta el envío?", "respuesta": "respuesta lista para copiar — específica para este producto" },
    { "situacion": "¿Cuándo llega?", "respuesta": "..." },
    { "situacion": "¿Tienen garantía?", "respuesta": "..." },
    { "situacion": "¿Puedo pagar en cuotas?", "respuesta": "..." },
    { "situacion": "¿Es original?", "respuesta": "..." },
    { "situacion": "¿Hacen descuento?", "respuesta": "..." },
    { "situacion": "Me llegó roto / incompleto", "respuesta": "..." },
    { "situacion": "Quiero devolver", "respuesta": "..." }
  ],
  "tips_generales": [
    "tip general de WhatsApp Business para este nicho/producto 1",
    "tip 2",
    "tip 3",
    "tip 4"
  ]
}`
}

type WAMessage = WAFlow['mensajes'][0]
function MessageCard({ msg }: { msg: WAMessage }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  return (
    <div className="card border border-white/8 overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full p-3.5 text-left flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center text-green-300 text-xs font-bold flex-shrink-0">{msg.numero}</div>
        <div className="flex-1 min-w-0">
          <p className="text-white/50 text-[10px]">{msg.tipo}</p>
          <p className="text-white text-xs font-medium truncate">{msg.mensaje.slice(0, 60)}...</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-white/20 text-[10px]">{msg.cuando}</span>
          <span className="text-white/20 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3 animate-fade-up">
          <div className="relative">
            <div className="bg-green-500/8 border border-green-500/15 rounded-2xl rounded-tl-sm p-3.5 max-w-xs">
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{msg.mensaje}</p>
            </div>
            <button onClick={async () => { await navigator.clipboard.writeText(msg.mensaje); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              className="absolute top-2 right-2 text-[10px] text-white/20 hover:text-green-400 transition-colors">
              {copied ? '✓' : '⊕'}
            </button>
          </div>
          {msg.si_responde_si && <div className="p-2.5 bg-emerald-500/8 border border-emerald-500/15 rounded-lg"><p className="text-[10px] text-emerald-400/60 mb-0.5">Si responde SÍ →</p><p className="text-white/60 text-xs">{msg.si_responde_si}</p></div>}
          {msg.si_responde_no && <div className="p-2.5 bg-red-500/8 border border-red-500/15 rounded-lg"><p className="text-[10px] text-red-400/60 mb-0.5">Si no responde / dice NO →</p><p className="text-white/60 text-xs">{msg.si_responde_no}</p></div>}
          {msg.nota && <div className="p-2.5 bg-amber-500/8 border border-amber-500/15 rounded-lg"><p className="text-[10px] text-amber-400/60 mb-0.5">💡 Nota</p><p className="text-white/55 text-xs">{msg.nota}</p></div>}
        </div>
      )}
    </div>
  )
}

function FlowSection({ flow, icon, color }: { flow: WAFlow; icon: string; color: string }) {
  return (
    <div className="space-y-3">
      <div className={`card p-4 border ${color}`}>
        <div className="flex items-center gap-2 mb-1"><span className="text-lg">{icon}</span><p className="text-white font-semibold text-sm">{flow.nombre}</p></div>
        <p className="text-white/40 text-xs mb-0.5"><span className="text-white/25">Trigger:</span> {flow.trigger}</p>
        <p className="text-white/40 text-xs"><span className="text-white/25">Objetivo:</span> {flow.objetivo}</p>
      </div>
      {flow.mensajes.map(m => <MessageCard key={m.numero} msg={m} />)}
      {flow.tips?.length > 0 && (
        <div className="p-3 bg-white/3 border border-white/8 rounded-xl">
          {flow.tips.map((t, i) => <p key={i} className="text-white/40 text-xs mb-1 last:mb-0">💡 {t}</p>)}
        </div>
      )}
    </div>
  )
}

const FLOWS = [
  { id: 'flujo_nuevo_lead', label: '👋 Lead nuevo', icon: '👋', color: 'border-violet-500/20' },
  { id: 'flujo_carrito_abandonado', label: '🛒 Carrito', icon: '🛒', color: 'border-amber-500/20' },
  { id: 'flujo_post_compra', label: '📦 Post-compra', icon: '📦', color: 'border-emerald-500/20' },
  { id: 'flujo_cierre_vendedor', label: '💪 Cierre', icon: '💪', color: 'border-blue-500/20' },
  { id: 'flujo_reclamos', label: '⚠️ Reclamos', icon: '⚠️', color: 'border-red-500/20' },
  { id: 'respuestas_rapidas', label: '⚡ Respuestas rápidas', icon: '⚡', color: 'border-white/10' },
]

export default function WhatsAppBizPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [config, setConfig] = useState<Record<string, string>>({})
  const [output, setOutput] = useState<WAOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeFlow, setActiveFlow] = useState<typeof FLOWS[number]['id']>('flujo_nuevo_lead')
  const [saved, setSaved] = useState(false)
  const [copiedRq, setCopiedRq] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (selectedProduct) setConfig(p => ({ ...p, publico: p.publico || 'compradores online' }))
  }, [selectedProduct?.id])

  const generate = async () => {
    if (!selectedProduct) return
    setLoading(true); setError('')
    try {
      setOutput(await callClaude(buildWAPrompt(selectedProduct, config)))
    } catch (e) { setError(e instanceof Error ? e.message : 'Error') }
    setLoading(false)
  }

  const save = async () => {
    if (!output || !selectedProduct) return
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('generations').insert({ user_id: user.id, product_id: selectedProduct.id, tool: 'whatsapp-flows', status: 'completed', input: config, output })
      setSaved(true)
    }
  }

  const ic = 'input', lc = 'block text-xs font-medium text-white/40 mb-1.5'
  const greenStyle = { background: 'rgba(37,211,102,0.15)', color: '#25d366', border: '1px solid rgba(37,211,102,0.3)' }

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
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">WhatsApp Business Flows</h1>
              <span className="tag text-[10px]" style={greenStyle}>💬 98% apertura</span>
            </div>
            <p className="text-white/40 text-xs">5 flujos completos: lead nuevo, carrito abandonado, post-compra, cierre y reclamos</p>
          </div>
        </div>

        {!output ? (
          <div className="space-y-5 animate-fade-up">
            <div className="card p-4 border" style={{ borderColor: 'rgba(37,211,102,0.2)', background: 'rgba(37,211,102,0.05)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#25d366' }}>Por qué WhatsApp es el canal #1 en LATAM</p>
              <p className="text-white/50 text-xs leading-relaxed">98% tasa de apertura vs 20% del email. El cliente lee tu mensaje en los primeros 3 minutos. En Paraguay, más del 90% de las ventas de ecommerce tienen contacto por WhatsApp. Sin scripts estructurados, perdés entre 30-60% de los leads por respuestas lentas o mensajes incorrectos.</p>
            </div>
            <ProductSelector selectedProductId={selectedProduct?.id || null} onSelect={p => setSelectedProduct(p)} onCreateNew={() => setShowModal(true)} />
            <div className="card p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lc}>Precio del producto</label>
                  <input className={ic} value={config.precio || ''} onChange={e => setConfig(p => ({ ...p, precio: e.target.value }))} placeholder="Ej: Gs. 147.000 / $25" />
                </div>
                <div>
                  <label className={lc}>País</label>
                  <select className={`${ic} cursor-pointer`} value={config.pais || 'Paraguay'} onChange={e => setConfig(p => ({ ...p, pais: e.target.value }))} style={{ background: '#111' }}>
                    {['Paraguay', 'Argentina', 'Uruguay', 'Chile', 'Colombia', 'México'].map(o => <option key={o} value={o} style={{ background: '#111' }}>{o}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={lc}>Tono de comunicación</label>
                  <select className={`${ic} cursor-pointer`} value={config.tono || ''} onChange={e => setConfig(p => ({ ...p, tono: e.target.value }))} style={{ background: '#111' }}>
                    <option value="" style={{ background: '#111' }}>Seleccionar...</option>
                    {['Cercano y amistoso (tuteo, emojis moderados)', 'Profesional pero cálido', 'Muy formal (usted)', 'Directo y urgente'].map(o => <option key={o} value={o} style={{ background: '#111' }}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={generate} disabled={!selectedProduct || loading} className="btn-primary w-full py-4 text-base" style={{ background: loading ? undefined : 'linear-gradient(135deg,#25d366,#128C7E)' }}>
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />Generando 5 flujos...</> : '💬 Generar flujos de WhatsApp completos →'}
            </button>
          </div>
        ) : (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold">WhatsApp Flows — {selectedProduct?.name}</h2>
              <div className="flex gap-2">
                <button onClick={save} disabled={saved} className={`text-xs px-3 py-2 rounded-lg border transition-all ${saved ? 'border-emerald-500/40 text-emerald-400' : 'border-white/15 text-white/50 hover:border-white/30'}`}>{saved ? '✓' : '💾'}</button>
                <button onClick={() => { setOutput(null); setSaved(false) }} className="btn-secondary text-xs px-3 py-2">← Nuevo</button>
              </div>
            </div>

            {/* Tips generales */}
            {output.tips_generales && (
              <div className="card p-4 border mb-5" style={{ borderColor: 'rgba(37,211,102,0.2)', background: 'rgba(37,211,102,0.05)' }}>
                <p className="text-xs font-bold mb-2" style={{ color: '#25d366' }}>💡 Tips para este producto</p>
                {output.tips_generales.map((t, i) => <p key={i} className="text-white/55 text-xs mb-1">• {t}</p>)}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2 mb-5">
              {FLOWS.map(f => (
                <button key={f.id} onClick={() => setActiveFlow(f.id)}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeFlow === f.id ? 'text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                  style={activeFlow === f.id ? { background: '#25d366', color: 'white' } : {}}>
                  {f.label}
                </button>
              ))}
            </div>

            {activeFlow !== 'respuestas_rapidas' && output[activeFlow] && (
              <FlowSection flow={output[activeFlow]} icon={FLOWS.find(f => f.id === activeFlow)!.icon} color={FLOWS.find(f => f.id === activeFlow)!.color} />
            )}

            {activeFlow === 'respuestas_rapidas' && output.respuestas_rapidas && (
              <div className="space-y-2 animate-fade-up">
                <div className="card p-3 border border-white/8 text-xs text-white/40 mb-3">
                  ⚡ Mensajes de respuesta rápida — guardá estos en WhatsApp Business como "Respuestas Rápidas" para enviarlos con / en segundos.
                </div>
                {output.respuestas_rapidas.map((r, i) => (
                  <div key={i} className="card p-4 border border-white/8">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/50 text-xs font-medium">"{r.situacion}"</p>
                      <button onClick={async () => { await navigator.clipboard.writeText(r.respuesta); setCopiedRq(i); setTimeout(() => setCopiedRq(null), 2000) }}
                        className="text-[10px] text-white/25 hover:text-green-400 transition-colors">{copiedRq === i ? '✓ Copiado' : '⊕ Copiar'}</button>
                    </div>
                    <div className="bg-green-500/8 border border-green-500/15 rounded-2xl rounded-tl-sm p-3 max-w-xs">
                      <p className="text-white/75 text-sm leading-relaxed">{r.respuesta}</p>
                    </div>
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
