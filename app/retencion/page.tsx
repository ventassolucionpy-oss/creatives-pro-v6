'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { getPaisConfig, PAISES, formatPrecio, type Pais } from '@/lib/constants'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Product } from '@/types'

// ─── Tipos ───────────────────────────────────────────────
type RetencionOutput = {
  secuencia_post_entrega: Array<{
    dia: string
    canal: string
    objetivo: string
    mensaje: string
    cuando_enviar: string
  }>
  pedido_resena: {
    mensaje_whatsapp: string
    mensaje_sms: string
    incentivo: string
    mejor_momento: string
  }
  oferta_recompra: {
    producto_complementario: string
    descuento_sugerido: string
    mensaje_whatsapp: string
    cuando_activar: string
  }
  reactivacion_inactivos: {
    criterio: string
    mensaje_whatsapp: string
    asunto_email: string
    cuerpo_email: string
    incentivo: string
  }
  upsell_post_compra: {
    producto: string
    precio: string
    mensaje: string
    cuando: string
  }
  manejo_reclamo: {
    respuesta_devolucion: string
    respuesta_demora: string
    respuesta_producto_defectuoso: string
    politica_garantia: string
  }
  kpis_retencion: Array<{ metrica: string; objetivo: string; como_medir: string }>
  resumen_estrategia: string
}

async function callClaude(prompt: string): Promise<RetencionOutput> {
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
  return JSON.parse(clean) as RetencionOutput
}

function buildPrompt(product: Product, config: Record<string, string>): string {
  return `Sos un experto en post-venta y retención de clientes para dropshipping COD en ${paisCfg?.nombre || 'Paraguay'}. Tu trabajo es diseñar el sistema completo de retención que convierte un comprador de una vez en un cliente recurrente.

CONTEXTO DE PARAGUAY:
- Compras COD = alta desconfianza inicial → la experiencia post-compra es determinante para la recompra
- WhatsApp es el canal principal de comunicación
- Los compradores paraguayos valoran la cercanía y el trato personal
- Tasa de rechazo COD promedio: 20-35% → el seguimiento pre-entrega baja este número
- El LTV real de un cliente satisfecho puede ser 3-5x la primera compra

PRODUCTO:
- Nombre: ${product.name}
- Descripción: ${product.description}
- Precio de venta: Gs. ${config.precio || product.precio_venta_gs || '180.000'}
- Categoría: ${product.category || 'general'}
- Audiencia: ${config.audiencia || product.audiencia || 'compradores online Paraguay'}

COMPORTAMIENTO DEL CLIENTE:
- Tiempo de entrega típico en ${paisCfg?.nombre || 'Paraguay'}: ${config.dias_entrega || '3-5'} días hábiles
- Canal de contacto principal: ${config.canal || 'WhatsApp'}
- Problema principal que resuelve el producto: ${config.problema || 'ver descripción del producto'}

Diseñá el sistema completo de retención. Los mensajes deben sonar HUMANOS, no automatizados. En Paraguay el "vos" y la cercanía funcionan mucho mejor que el formalismo.

Respondé SOLO con JSON válido:
{
  "secuencia_post_entrega": [
    {
      "dia": "Día 0 — Al confirmar el pedido",
      "canal": "WhatsApp",
      "objetivo": "Confirmar y reducir ansiedad",
      "mensaje": "mensaje exacto en guaraní/castellano paraguayo, natural, max 3 líneas",
      "cuando_enviar": "Inmediatamente al confirmar el pedido en Dropi"
    },
    {
      "dia": "Día 1 — En camino",
      "canal": "WhatsApp",
      "objetivo": "Informar y generar expectativa",
      "mensaje": "...",
      "cuando_enviar": "Cuando el logístico recoge el paquete"
    },
    {
      "dia": "Día 3 — Post-entrega",
      "canal": "WhatsApp",
      "objetivo": "Verificar satisfacción",
      "mensaje": "...",
      "cuando_enviar": "48-72hs después de la entrega confirmada"
    },
    {
      "dia": "Día 7 — Seguimiento de resultado",
      "canal": "WhatsApp",
      "objetivo": "Confirmar resultado y pedir reseña",
      "mensaje": "...",
      "cuando_enviar": "7 días después de la entrega"
    }
  ],
  "pedido_resena": {
    "mensaje_whatsapp": "el mensaje exacto para pedir una reseña — debe sonar natural y fácil de responder",
    "mensaje_sms": "versión corta para SMS",
    "incentivo": "qué podés ofrecer para que deje la reseña (descuento en próxima compra, etc)",
    "mejor_momento": "cuándo es el mejor momento para pedirla y por qué"
  },
  "oferta_recompra": {
    "producto_complementario": "qué producto o variante podés ofrecerle que complemente lo que ya compró",
    "descuento_sugerido": "qué descuento tiene sentido para activar la recompra sin destruir el margen",
    "mensaje_whatsapp": "el mensaje exacto de la oferta de recompra",
    "cuando_activar": "cuántos días después de la entrega y bajo qué condición"
  },
  "reactivacion_inactivos": {
    "criterio": "qué define a un cliente 'inactivo' para este producto específico",
    "mensaje_whatsapp": "el mensaje de reactivación — debe sentirse como una sorpresa positiva, no spam",
    "asunto_email": "asunto de email de reactivación que genera apertura",
    "cuerpo_email": "cuerpo completo del email de reactivación (3-4 párrafos)",
    "incentivo": "qué ofrecerle para que vuelva"
  },
  "upsell_post_compra": {
    "producto": "producto o servicio adicional que podés ofrecer",
    "precio": "precio sugerido",
    "mensaje": "el mensaje exacto del upsell — cuándo y cómo ofrecerlo",
    "cuando": "el momento exacto en el flujo post-compra para ofrecerlo"
  },
  "manejo_reclamo": {
    "respuesta_devolucion": "cómo responder a un pedido de devolución — tono empático + solución",
    "respuesta_demora": "cómo responder cuando el cliente pregunta dónde está su pedido",
    "respuesta_producto_defectuoso": "qué hacer y qué decir si el producto llegó dañado",
    "politica_garantia": "cómo articular la garantía de forma que el cliente no sienta que perdió"
  },
  "kpis_retencion": [
    { "metrica": "Tasa de recompra a 60 días", "objetivo": ">15%", "como_medir": "..." },
    { "metrica": "NPS post-entrega", "objetivo": ">40", "como_medir": "..." },
    { "metrica": "Tasa de reseñas", "objetivo": ">20%", "como_medir": "..." }
  ],
  "resumen_estrategia": "2-3 líneas del impacto esperado en LTV si se implementa esta estrategia"
}`
}

type Phase = 'config' | 'generating' | 'results'
type Tab = 'secuencia' | 'resenas' | 'recompra' | 'reclamos'

export default function RetencionPage() {
  const [phase, setPhase] = useState<Phase>('config')
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [output, setOutput] = useState<RetencionOutput | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('secuencia')
  const [copied, setCopied] = useState('')
  const [config, setConfig] = useState({
    precio: '', audiencia: '', problema: '', dias_entrega: '3-5', canal: 'WhatsApp',
  })
  const supabase = createClient()

  useEffect(() => {
    supabase.from('products').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setProducts(data as Product[]) })
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

  const CopyBtn = ({ text, k }: { text: string; k: string }) => (
    <button
      onClick={() => copy(text, k)}
      className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex-shrink-0"
    >
      {copied === k ? '✓ Copiado' : 'Copiar'}
    </button>
  )

  const MsgCard = ({ label, msg, k, sub }: { label: string; msg: string; k: string; sub?: string }) => (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">{label}</p>
        <CopyBtn text={msg} k={k} />
      </div>
      {sub && <p className="text-white/25 text-[10px] mb-2">{sub}</p>}
      <p className="text-white/70 text-xs leading-relaxed whitespace-pre-line bg-white/3 rounded-xl p-3 border border-white/8">
        {msg}
      </p>
    </div>
  )

  const CANAL_ICON: Record<string, string> = {
    WhatsApp: '💬', Email: '📧', SMS: '📱', Llamada: '📞',
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <Link href="/crear" className="text-white/30 hover:text-white/60 text-sm flex items-center gap-1.5 mb-4 transition-colors">← Crear</Link>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">🔄 Motor de Retención</h1>
            <span className="tag tag-violet text-[10px]">IA</span>
          </div>
          <p className="text-white/40 text-sm">Post-venta que convierte compradores en clientes recurrentes</p>
        </div>

        {phase === 'config' && (
          <div className="space-y-5">

            {/* Dato de impacto */}
            <div className="card p-4 border border-emerald-500/20 bg-emerald-500/5">
              <p className="text-emerald-300 font-bold text-sm mb-1">💡 Por qué importa la retención</p>
              <p className="text-white/50 text-xs leading-relaxed">
                En Paraguay COD, conseguir que un cliente compre por segunda vez cuesta 5x menos que adquirir uno nuevo. Si solo el 15% de tus clientes recompra en 60 días, tu rentabilidad real puede subir 40% sin gastar más en ads.
              </p>
            </div>

            {/* Selector de producto */}
            <div className="card p-5">
              <p className="text-white font-bold text-sm mb-3">¿Para qué producto?</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {products.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p)
                      setConfig(c => ({
                        ...c,
                        precio: p.precio_venta_gs?.toString() || '',
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
                    <p className="text-white/30 text-xs">{p.category}</p>
                  </button>
                ))}
                {products.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-white/30 text-sm mb-2">No hay productos registrados</p>
                    <Link href="/productos" className="text-violet-400 text-xs underline">Agregar producto →</Link>
                  </div>
                )}
              </div>
            </div>

            {selectedProduct && (
              <div className="card p-5 space-y-4">
                <p className="text-white font-bold text-sm">Contexto adicional</p>
                <div>
                  <label className={lc}>Problema principal que resuelve</label>
                  <input
                    type="text" className={ic}
                    placeholder="ej: dolor de rodilla, falta de energía, cabello con canas..."
                    value={config.problema}
                    onChange={e => setConfig(c => ({ ...c, problema: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lc}>Días de entrega</label>
                    <select className={ic} value={config.dias_entrega}
                      onChange={e => setConfig(c => ({ ...c, dias_entrega: e.target.value }))}>
                      <option value="1-2">1-2 días (Asunción)</option>
                      <option value="3-5">3-5 días (interior)</option>
                      <option value="5-7">5-7 días (zonas remotas)</option>
                    </select>
                  </div>
                  <div>
                    <label className={lc}>Canal principal</label>
                    <select className={ic} value={config.canal}
                      onChange={e => setConfig(c => ({ ...c, canal: e.target.value }))}>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="WhatsApp + Email">WhatsApp + Email</option>
                      <option value="Llamada + WhatsApp">Llamada + WhatsApp</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              onClick={generate}
              disabled={!selectedProduct}
              className="btn-primary w-full py-4 text-base disabled:opacity-40"
            >
              🔄 Generar sistema de retención →
            </button>
          </div>
        )}

        {phase === 'generating' && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold">Diseñando el sistema de retención...</p>
            <p className="text-white/40 text-sm mt-1">Creando mensajes para cada etapa post-venta</p>
          </div>
        )}

        {phase === 'results' && output && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold">Sistema de Retención — {selectedProduct?.name}</h2>
              <button onClick={() => setPhase('config')} className="btn-secondary text-xs px-3 py-2">← Editar</button>
            </div>

            {/* Resumen de estrategia */}
            <div className="card p-4 border border-emerald-500/20 bg-emerald-500/5">
              <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">💡 Impacto esperado</p>
              <p className="text-white/70 text-xs leading-relaxed">{output.resumen_estrategia}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-white/8">
              {([
                { id: 'secuencia', label: '📅 Secuencia' },
                { id: 'resenas', label: '⭐ Reseñas' },
                { id: 'recompra', label: '🔁 Recompra' },
                { id: 'reclamos', label: '🛡️ Reclamos' },
              ] as { id: Tab; label: string }[]).map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-semibold transition-all ${tab === t.id ? 'bg-white/10 text-white' : 'text-white/30'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* SECUENCIA POST-ENTREGA */}
            {tab === 'secuencia' && (
              <div className="space-y-3">
                <p className="text-white/40 text-xs">Enviá estos mensajes en el orden indicado para cada pedido.</p>
                {output.secuencia_post_entrega.map((paso, i) => (
                  <div key={i} className="card p-4 border border-white/8">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full bg-violet-600/20 flex items-center justify-center text-violet-300 font-bold text-xs flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold text-sm">{paso.dia}</p>
                          <span className="text-xs">{CANAL_ICON[paso.canal] || '📱'}</span>
                        </div>
                        <p className="text-white/30 text-[10px]">{paso.objetivo}</p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <p className="text-white/25 text-[10px] mb-1">⏰ {paso.cuando_enviar}</p>
                    </div>
                    <MsgCard label={`Mensaje ${paso.canal}`} msg={paso.mensaje} k={`seq-${i}`} />
                  </div>
                ))}
              </div>
            )}

            {/* RESEÑAS */}
            {tab === 'resenas' && (
              <div className="space-y-3">
                <MsgCard label="WhatsApp — Pedir reseña" msg={output.pedido_resena.mensaje_whatsapp} k="resena-wa" />
                <MsgCard label="SMS — Versión corta" msg={output.pedido_resena.mensaje_sms} k="resena-sms" />
                <div className="card p-4">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">🎁 Incentivo sugerido</p>
                  <p className="text-white/70 text-xs">{output.pedido_resena.incentivo}</p>
                </div>
                <div className="card p-4">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">⏰ Mejor momento</p>
                  <p className="text-white/70 text-xs">{output.pedido_resena.mejor_momento}</p>
                </div>

                <div className="border-t border-white/8 pt-4 mt-2">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-3">🔁 Oferta de upsell post-compra</p>
                  <div className="card p-4 border border-violet-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-bold text-sm">{output.upsell_post_compra.producto}</p>
                      <span className="text-violet-300 font-bold text-sm">{output.upsell_post_compra.precio}</span>
                    </div>
                    <p className="text-white/40 text-xs mb-3">{output.upsell_post_compra.cuando}</p>
                    <MsgCard label="Mensaje upsell" msg={output.upsell_post_compra.mensaje} k="upsell-msg" />
                  </div>
                </div>
              </div>
            )}

            {/* RECOMPRA */}
            {tab === 'recompra' && (
              <div className="space-y-3">
                <div className="card p-4 border border-emerald-500/20 bg-emerald-500/5">
                  <p className="text-emerald-400 text-[10px] font-bold uppercase mb-2">Oferta de recompra</p>
                  <p className="text-white font-bold">{output.oferta_recompra.producto_complementario}</p>
                  <p className="text-white/40 text-xs mt-1">Descuento: {output.oferta_recompra.descuento_sugerido}</p>
                  <p className="text-white/40 text-xs mt-0.5">Activar: {output.oferta_recompra.cuando_activar}</p>
                </div>
                <MsgCard label="WhatsApp — Oferta recompra" msg={output.oferta_recompra.mensaje_whatsapp} k="recompra-wa" />

                <div className="border-t border-white/8 pt-4">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-3">📢 Reactivación de inactivos</p>
                  <div className="card p-4 mb-3">
                    <p className="text-white/40 text-[10px] font-bold uppercase mb-1">Criterio de inactivo</p>
                    <p className="text-white/70 text-xs">{output.reactivacion_inactivos.criterio}</p>
                    <p className="text-white/30 text-xs mt-1">Incentivo: {output.reactivacion_inactivos.incentivo}</p>
                  </div>
                  <MsgCard label="WhatsApp — Reactivación" msg={output.reactivacion_inactivos.mensaje_whatsapp} k="react-wa" />
                  <div className="mt-3 card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/40 text-[10px] font-bold uppercase">Email reactivación</p>
                      <CopyBtn text={`${output.reactivacion_inactivos.asunto_email}\n\n${output.reactivacion_inactivos.cuerpo_email}`} k="react-email" />
                    </div>
                    <p className="text-violet-300 text-xs font-bold mb-2">{output.reactivacion_inactivos.asunto_email}</p>
                    <p className="text-white/50 text-xs leading-relaxed whitespace-pre-line">{output.reactivacion_inactivos.cuerpo_email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* RECLAMOS */}
            {tab === 'reclamos' && (
              <div className="space-y-3">
                {[
                  { label: '📦 "¿Dónde está mi pedido?"', msg: output.manejo_reclamo.respuesta_demora, k: 'dem' },
                  { label: '↩️ "Quiero devolverlo"', msg: output.manejo_reclamo.respuesta_devolucion, k: 'dev' },
                  { label: '🔧 "El producto llegó defectuoso"', msg: output.manejo_reclamo.respuesta_producto_defectuoso, k: 'def' },
                ].map(item => <MsgCard key={item.k} label={item.label} msg={item.msg} k={item.k} />)}

                <div className="card p-4 border border-blue-500/20 bg-blue-500/5">
                  <p className="text-blue-400 text-[10px] font-bold uppercase mb-2">🛡️ Política de garantía</p>
                  <p className="text-white/70 text-xs leading-relaxed">{output.manejo_reclamo.politica_garantia}</p>
                </div>

                <div className="border-t border-white/8 pt-4">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-3">📈 KPIs de retención a monitorear</p>
                  {output.kpis_retencion.map((kpi, i) => (
                    <div key={i} className="card p-3 mb-2 flex items-center justify-between">
                      <div>
                        <p className="text-white text-xs font-bold">{kpi.metrica}</p>
                        <p className="text-white/30 text-[10px]">{kpi.como_medir}</p>
                      </div>
                      <span className="text-emerald-400 font-bold text-sm">{kpi.objetivo}</span>
                    </div>
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
