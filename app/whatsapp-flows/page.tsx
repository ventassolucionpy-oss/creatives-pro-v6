'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

type MensajeFlujo = {
  numero: number
  tipo: string
  cuando: string
  mensaje: string
  si_responde_si?: string
  si_responde_no?: string
  nota?: string
}

type Flujo = {
  nombre: string
  trigger: string
  objetivo: string
  mensajes: MensajeFlujo[]
  tips: string[]
}

type WAFlowsOutput = {
  flujo_nuevo_lead: Flujo
  flujo_seguimiento_sin_respuesta: Flujo
  flujo_confirmacion_pedido: Flujo
  flujo_post_entrega: Flujo
  flujo_recuperacion_rechazado: Flujo
  flujo_upsell_post_compra: Flujo
  respuestas_objeciones: Array<{ objecion: string; respuesta: string; nota: string }>
  tips_whatsapp_business: string[]
}

async function callClaude(prompt: string): Promise<WAFlowsOutput> {
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
  return JSON.parse(clean) as WAFlowsOutput
}

function buildPrompt(
  producto: string,
  precio: string,
  beneficio: string,
  pais: string,
  negocio: string
): string {
  const contextos: Record<string, string> = {
    PY: 'Paraguay. WhatsApp tiene 98% de apertura. El cliente llega por Meta Ads o TikTok y espera respuesta en menos de 5 minutos. El cobro es COD (contra entrega). Los clientes paraguayos valoran mucho el trato personal y cercano.',
    CO: 'Colombia. WhatsApp es el canal principal de venta. El cliente es price-sensitive y necesita confirmación de calidad. Cobro COD. Tono cercano pero profesional.',
    MX: 'México. WhatsApp domina la comunicación comercial. El cliente mexicano es escéptico y necesita prueba social. Cobro COD. Tono amigable y de confianza.',
  }
  return `Sos un experto en ventas por WhatsApp Business en ${contextos[pais] || contextos.PY}

PRODUCTO: ${producto}
PRECIO: ${precio}
BENEFICIO PRINCIPAL: ${beneficio}
TIPO DE NEGOCIO: ${negocio || 'dropshipping COD'}

MISIÓN: Crear 6 flujos de automatización de WhatsApp Business ultra-efectivos para este producto. Los mensajes deben ser naturales, cortos, sin spam, y con alto porcentaje de respuesta.

REGLAS DE ORO PARA WHATSAPP DE VENTAS:
1. Primer mensaje: máximo 2-3 líneas. Si es largo, no lo leen.
2. Personalizar con el nombre cuando sea posible (usar {{nombre}})
3. Siempre terminar con UNA sola pregunta o acción — nunca múltiples
4. Emojis con moderación (1-2 por mensaje, no más)
5. El mejor horario de contacto: 9-12hs y 15-20hs
6. Nunca mandar el precio de entrada sin crear contexto
7. El seguimiento más efectivo: "¿llegaste a ver mi mensaje?" — simple y sin presión
8. Para COD: nunca decir "pago anticipado" — siempre "pagás al recibir"

FLUJOS REQUERIDOS:
1. Nuevo lead que llega de un anuncio (primer contacto inmediato)
2. Seguimiento a quien no respondió (sin ser molesto)
3. Confirmación de pedido tomado (tranquilizar al comprador)
4. Post-entrega (pedir reseña + upsell suave)
5. Recuperación de pedido rechazado/no entregado
6. Upsell post-compra (7-10 días después)

Respondé SOLO con JSON válido:
{
  "flujo_nuevo_lead": {
    "nombre": "Nuevo Lead — Primer Contacto",
    "trigger": "Cuando llega un nuevo lead del anuncio",
    "objetivo": "Confirmar interés y tomar el pedido en la primera conversación",
    "mensajes": [
      {
        "numero": 1,
        "tipo": "Apertura",
        "cuando": "Inmediatamente al llegar el lead (max 5 min)",
        "mensaje": "Hola {{nombre}}! 👋 Vi que te interesó [PRODUCTO]. Te cuento...",
        "si_responde_si": "Perfecto! Para enviarte...",
        "si_responde_no": "Sin problema! Si tenés alguna duda...",
        "nota": "consejo de actuación para el vendedor"
      }
    ],
    "tips": ["tip específico para este flujo"]
  },
  "flujo_seguimiento_sin_respuesta": { ... },
  "flujo_confirmacion_pedido": { ... },
  "flujo_post_entrega": { ... },
  "flujo_recuperacion_rechazado": { ... },
  "flujo_upsell_post_compra": { ... },
  "respuestas_objeciones": [
    {
      "objecion": "¿Es original/de calidad?",
      "respuesta": "respuesta completa lista para copiar y pegar",
      "nota": "por qué esta respuesta funciona"
    },
    {"objecion": "¿Cuánto tarda en llegar?", "respuesta": "...", "nota": "..."},
    {"objecion": "¿Puedo devolver si no me gusta?", "respuesta": "...", "nota": "..."},
    {"objecion": "¿Por qué no tiene página web?", "respuesta": "...", "nota": "..."},
    {"objecion": "Está muy caro", "respuesta": "...", "nota": "..."},
    {"objecion": "Lo voy a pensar", "respuesta": "...", "nota": "..."}
  ],
  "tips_whatsapp_business": [
    "tip general 1 para maximizar la conversión por WhatsApp",
    "tip 2", "tip 3", "tip 4", "tip 5"
  ]
}`
}

const PAISES = [
  { value: 'PY', label: '🇵🇾 Paraguay' },
  { value: 'CO', label: '🇨🇴 Colombia' },
  { value: 'MX', label: '🇲🇽 México' },
]

const FLUJO_ICONS: Record<string, string> = {
  flujo_nuevo_lead: '⚡',
  flujo_seguimiento_sin_respuesta: '🔄',
  flujo_confirmacion_pedido: '✅',
  flujo_post_entrega: '⭐',
  flujo_recuperacion_rechazado: '🔁',
  flujo_upsell_post_compra: '💎',
}
const FLUJO_LABELS: Record<string, string> = {
  flujo_nuevo_lead: 'Nuevo Lead',
  flujo_seguimiento_sin_respuesta: 'Sin Respuesta',
  flujo_confirmacion_pedido: 'Confirmar Pedido',
  flujo_post_entrega: 'Post-Entrega',
  flujo_recuperacion_rechazado: 'Recuperar Rechazado',
  flujo_upsell_post_compra: 'Upsell',
}

function MensajeCard({ m }: { m: MensajeFlujo }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(m.mensaje)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="bg-white/3 rounded-xl p-4 border border-white/8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-violet-600/30 flex items-center justify-center text-violet-300 text-xs font-bold">{m.numero}</span>
          <span className="text-xs font-bold text-white/70">{m.tipo}</span>
          <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{m.cuando}</span>
        </div>
        <button onClick={copy} className="text-[10px] text-violet-400 px-2 py-1 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 transition-colors">
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>
      </div>
      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line bg-white/5 rounded-lg p-3 mb-2">{m.mensaje}</p>
      {(m.si_responde_si || m.si_responde_no) && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {m.si_responde_si && (
            <div className="bg-emerald-500/8 rounded-lg p-2 border border-emerald-500/15">
              <p className="text-[10px] text-emerald-400/60 mb-1">Si responde SÍ →</p>
              <p className="text-xs text-white/60 leading-relaxed">{m.si_responde_si}</p>
            </div>
          )}
          {m.si_responde_no && (
            <div className="bg-amber-500/8 rounded-lg p-2 border border-amber-500/15">
              <p className="text-[10px] text-amber-400/60 mb-1">Si no responde →</p>
              <p className="text-xs text-white/60 leading-relaxed">{m.si_responde_no}</p>
            </div>
          )}
        </div>
      )}
      {m.nota && <p className="text-[11px] text-white/35 italic mt-2">💡 {m.nota}</p>}
    </div>
  )
}

function FlujoCard({ flujo, icon }: { flujo: Flujo; icon: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card border border-white/8 overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full p-4 text-left flex items-center gap-3">
        <span className="text-xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">{flujo.nombre}</p>
          <p className="text-white/40 text-xs mt-0.5">{flujo.trigger}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{flujo.mensajes?.length || 0} msgs</span>
          <span className="text-white/20 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/8 pt-4 space-y-3">
          <div className="bg-violet-500/8 rounded-xl p-3 border border-violet-500/15">
            <p className="text-[10px] uppercase tracking-wider text-violet-400/60 mb-1">Objetivo</p>
            <p className="text-white/70 text-xs">{flujo.objetivo}</p>
          </div>
          <div className="space-y-3">
            {flujo.mensajes?.map(m => <MensajeCard key={m.numero} m={m} />)}
          </div>
          {flujo.tips && flujo.tips.length > 0 && (
            <div className="bg-amber-500/8 rounded-xl p-3 border border-amber-500/15">
              <p className="text-[10px] uppercase tracking-wider text-amber-400/60 mb-2">Tips de este flujo</p>
              <ul className="space-y-1">
                {flujo.tips.map((t, i) => <li key={i} className="text-xs text-white/60 flex gap-2"><span className="text-amber-400 flex-shrink-0">•</span>{t}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function WhatsAppFlowsPage() {
  const [producto, setProducto] = useState('')
  const [precio, setPrecio] = useState('')
  const [beneficio, setBeneficio] = useState('')
  const [pais, setPais] = useState('PY')
  const [negocio, setNegocio] = useState('dropshipping COD')
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState<WAFlowsOutput | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<string>('flujo_nuevo_lead')

  const handleGenerate = async () => {
    if (!producto.trim()) { setError('Ingresá el producto'); return }
    setLoading(true); setError(''); setOutput(null)
    try {
      const result = await callClaude(buildPrompt(producto, precio, beneficio, pais, negocio))
      setOutput(result)
      setActiveTab('flujo_nuevo_lead')
    } catch (e) {
      setError('Error generando los flujos. Intentá de nuevo.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const FLUJO_KEYS = ['flujo_nuevo_lead','flujo_seguimiento_sin_respuesta','flujo_confirmacion_pedido','flujo_post_entrega','flujo_recuperacion_rechazado','flujo_upsell_post_compra'] as const

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-5">
          <Link href="/crear" className="text-white/30 hover:text-white/60 text-sm transition-colors">← Crear</Link>
          <h1 className="text-2xl font-bold text-white mt-2">💬 Flujos WhatsApp Business</h1>
          <p className="text-white/40 text-sm mt-1">6 flujos automatizados listos para copiar y pegar en tu WhatsApp Business</p>
        </div>

        {/* Info banner */}
        <div className="card p-3 border border-green-500/20 bg-green-500/5 mb-5">
          <p className="text-green-300 text-xs font-bold mb-1">💡 WhatsApp = 98% de apertura vs 20% del email</p>
          <p className="text-white/40 text-xs">Con estos flujos bien ejecutados, podés cerrar 30-50% más de los leads que llegan de tus anuncios.</p>
        </div>

        {/* Form */}
        {!output && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block font-medium">Producto *</label>
              <input value={producto} onChange={e => setProducto(e.target.value)}
                placeholder="ej: Faja moldeadora postparto"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 placeholder:text-white/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block font-medium">Precio de venta</label>
                <input value={precio} onChange={e => setPrecio(e.target.value)}
                  placeholder="ej: Gs. 147.000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 placeholder:text-white/20" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block font-medium">País</label>
                <select value={pais} onChange={e => setPais(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500">
                  {PAISES.map(p => <option key={p.value} value={p.value} className="bg-zinc-900">{p.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block font-medium">Beneficio principal</label>
              <input value={beneficio} onChange={e => setBeneficio(e.target.value)}
                placeholder="ej: Reduce la cintura 5-10 cm en 30 días"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 placeholder:text-white/20" />
            </div>
            {error && <p className="text-red-400 text-xs bg-red-500/10 rounded-xl p-3">{error}</p>}
            <button onClick={handleGenerate} disabled={loading || !producto.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-500 hover:to-emerald-500 transition-all">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Generando flujos...
                </span>
              ) : '💬 Generar 6 flujos de WhatsApp'}
            </button>
          </div>
        )}

        {/* Results */}
        {output && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <p className="text-white font-bold text-sm">✅ 6 flujos generados</p>
              <button onClick={() => setOutput(null)}
                className="text-xs text-white/40 hover:text-white/70 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                ← Regenerar
              </button>
            </div>

            {/* Flujo tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {FLUJO_KEYS.map(k => (
                <button key={k} onClick={() => setActiveTab(k)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeTab === k ? 'bg-green-600/30 text-green-300 border border-green-500/30' : 'bg-white/5 text-white/40 hover:text-white/60'}`}>
                  {FLUJO_ICONS[k]} {FLUJO_LABELS[k]}
                </button>
              ))}
            </div>

            {/* Active flujo */}
            {FLUJO_KEYS.map(k => {
              const flujo = output[k]
              if (!flujo || activeTab !== k) return null
              return <FlujoCard key={k} flujo={flujo} icon={FLUJO_ICONS[k]} />
            })}

            {/* Objeciones */}
            {activeTab === 'flujo_nuevo_lead' && output.respuestas_objeciones && (
              <div className="card border border-amber-500/20">
                <div className="p-4 border-b border-white/8">
                  <p className="text-white font-bold text-sm">⚡ Respuestas a objeciones frecuentes</p>
                  <p className="text-white/40 text-xs mt-0.5">Listas para copiar y pegar cuando el cliente objeta</p>
                </div>
                <div className="divide-y divide-white/8">
                  {output.respuestas_objeciones.map((o, i) => {
                    const [copied, setCopied] = useState(false)
                    return (
                      <div key={i} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-amber-300 text-xs font-bold">"{o.objecion}"</p>
                          <button onClick={() => { navigator.clipboard.writeText(o.respuesta); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
                            className="text-[10px] text-amber-400 px-2 py-1 rounded-lg bg-amber-500/10">
                            {copied ? '✓' : 'Copiar'}
                          </button>
                        </div>
                        <p className="text-white/70 text-xs leading-relaxed bg-white/3 rounded-lg p-2 mb-1">{o.respuesta}</p>
                        {o.nota && <p className="text-[10px] text-white/30 italic">{o.nota}</p>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Tips generales */}
            {output.tips_whatsapp_business && (
              <div className="card p-4 border border-green-500/15">
                <p className="text-white font-bold text-xs mb-3">💡 Tips de WhatsApp Business</p>
                <ul className="space-y-2">
                  {output.tips_whatsapp_business.map((t, i) => (
                    <li key={i} className="flex gap-2 text-xs text-white/60">
                      <span className="text-green-400 flex-shrink-0">•</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next steps */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Link href="/whatsapp-biz" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-green-500/30 transition-all">
                <span>🤖</span><div><p className="text-white text-xs font-bold">Flujos Bot</p><p className="text-white/30 text-[10px]">Automatización avanzada</p></div>
              </Link>
              <Link href="/retencion" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-teal-500/30 transition-all">
                <span>🔄</span><div><p className="text-white text-xs font-bold">Retención</p><p className="text-white/30 text-[10px]">LTV post-venta</p></div>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
