'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { getPaisConfig, PAISES, formatPrecio, type Pais } from '@/lib/constants'
import Link from 'next/link'

type UpsellOutput = {
  estrategia_recomendada: string
  upsell_principal: {
    nombre: string
    descripcion: string
    precio_sugerido: string
    angulo: string
    texto_oferta: string
    donde_mostrar: string
    razon_funciona: string
  }
  bundles: Array<{
    nombre_bundle: string
    productos_incluidos: string[]
    precio_individual_suma: string
    precio_bundle: string
    descuento_pct: string
    texto_gancho: string
    para_quien: string
  }>
  cross_sell: Array<{
    producto_sugerido: string
    razon_complementa: string
    cuando_ofrecer: string
    texto_sugerencia: string
  }>
  textos_checkout: {
    antes_del_boton: string
    popup_upsell: string
    confirmacion_pedido: string
    whatsapp_post_compra: string
  }
  simulacion_impacto: {
    ticket_promedio_actual: string
    ticket_promedio_con_upsell: string
    incremento_pct: string
    escenario_100_pedidos: string
  }
}

async function callClaude(data: Record<string, string>): Promise<UpsellOutput> {
    const prompt = `Sos un experto en revenue optimization para dropshipping COD en ${paisCfg?.nombre || 'Paraguay'}. Tu especialidad es aumentar el ticket promedio sin reducir la tasa de conversión.

PRODUCTO PRINCIPAL: ${data.producto}
PRECIO ACTUAL: Gs. ${data.precio}
COSTO DEL PRODUCTO: Gs. ${data.costo}
CATEGORÍA: ${data.categoria}
AUDIENCIA: ${data.audiencia}
OTROS PRODUCTOS DEL CATÁLOGO (si tiene): ${data.catalogo || 'no especificado'}

CONTEXTO COD PARAGUAY:
- El cliente paga al recibir — ya confía y está motivado en ese momento
- El upsell en checkout COD DEBE ser opcional y de bajo precio relativo
- Los bundles funcionan especialmente bien si resuelven el mismo problema desde otro ángulo
- El operador puede llamar al cliente ANTES de confirmar el pedido para ofrecer el upsell
- Ticket promedio actual en ${paisCfg?.nombre || 'Paraguay'}: Gs. 80k-250k — el upsell ideal agrega un 30-50% más

Diseñá la estrategia completa de upsell y bundle. Respondé SOLO con JSON válido:
{
  "estrategia_recomendada": "cuál de las estrategias (upsell, bundle, cross-sell o combinación) es la mejor para este producto y por qué — 2-3 líneas",
  "upsell_principal": {
    "nombre": "nombre del upsell más obvio para este producto",
    "descripcion": "qué es y por qué complementa el producto principal",
    "precio_sugerido": "Gs. X — en rango del 30-60% del producto principal",
    "angulo": "el ángulo psicológico que hace que el cliente diga sí — ej: completar el resultado, ahorro, regalo",
    "texto_oferta": "el texto exacto para ofrecer el upsell — como si lo dijera un vendedor por WhatsApp",
    "donde_mostrar": "en qué momento del flujo mostrar el upsell",
    "razon_funciona": "por qué este upsell específicamente funciona en ${paisCfg?.nombre || 'Paraguay'} COD"
  },
  "bundles": [
    {
      "nombre_bundle": "nombre atractivo del bundle",
      "productos_incluidos": ["producto 1", "producto 2"],
      "precio_individual_suma": "Gs. X+Y = Gs. Z",
      "precio_bundle": "Gs. precio con descuento",
      "descuento_pct": "XX% de descuento",
      "texto_gancho": "texto de venta del bundle en 1-2 líneas",
      "para_quien": "perfil del comprador que más elegiría este bundle"
    }
  ],
  "cross_sell": [
    {
      "producto_sugerido": "producto complementario a sugerir",
      "razon_complementa": "por qué tiene sentido con el producto principal",
      "cuando_ofrecer": "en qué momento del journey del cliente ofrecerlo",
      "texto_sugerencia": "cómo decirlo por WhatsApp o en el checkout"
    }
  ],
  "textos_checkout": {
    "antes_del_boton": "texto corto que aparece justo antes del botón de compra para aumentar ticket — máx 2 líneas",
    "popup_upsell": "mensaje del popup que aparece después de que el cliente llena el formulario — oferta de upgrade",
    "confirmacion_pedido": "texto de la pantalla de confirmación que incluye un upsell o cross-sell suave",
    "whatsapp_post_compra": "mensaje que el vendedor envía por WhatsApp después de confirmar el pedido para ofrecer el upsell por teléfono"
  },
  "simulacion_impacto": {
    "ticket_promedio_actual": "Gs. ${data.precio}",
    "ticket_promedio_con_upsell": "Gs. X con el upsell principal tomado por el 30% de clientes",
    "incremento_pct": "X% de aumento en revenue",
    "escenario_100_pedidos": "con 100 pedidos base, cuánto más facturás por mes implementando la estrategia"
  }
}`

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  })
  const d = await res.json()
  return JSON.parse(d.content[0].text.replace(/```json|```/g, '').trim())
}

export default function UpsellPage() {
  const [form, setForm] = useState({ producto: '', precio: '', costo: '', categoria: 'general', audiencia: '', catalogo: '' })
  const [output, setOutput] = useState<UpsellOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'estrategia'|'textos'|'impacto'>('estrategia')
  const [copied, setCopied] = useState<string | null>(null)

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleGenerate = async () => {
    if (!form.producto || !form.precio) return
    setLoading(true)
    try { const r = await callClaude(form); setOutput(r); setTab('estrategia') }
    catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const copy = (k: string, text: string) => {
    navigator.clipboard.writeText(text); setCopied(k); setTimeout(() => setCopied(null), 1800)
  }
  const CopyBtn = ({ k, text }: { k: string; text: string }) => (
    <button onClick={() => copy(k, text)} className="px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-emerald-500/30 text-white/30 hover:text-white text-xs transition-all flex-shrink-0">
      {copied === k ? '✅' : '📋'}
    </button>
  )

  const ic = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-white/20'
  const lc = 'block text-xs text-white/40 mb-1.5 font-medium'

  return (
    <div className="min-h-screen">
      <Link href="/gestionar" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/crear" className="text-white/30 hover:text-white/60 text-sm">Crear</Link>
            <span className="text-white/20">›</span>
            <span className="text-white/60 text-sm">Upsell</span>
          </div>
          <h1 className="text-2xl font-bold text-white">💎 Upsell & Bundles</h1>
          <p className="text-white/40 text-sm mt-1">Aumentá tu ticket promedio un 30-50% sin cambiar lo que gastás en ads</p>
        </div>

        <div className="card p-3 border border-emerald-500/20 bg-emerald-500/5 mb-5">
          <p className="text-emerald-300 text-xs font-bold mb-1">💡 Por qué importa en COD Paraguay</p>
          <p className="text-white/40 text-xs">En COD, el upsell por WhatsApp antes de despachar el pedido tiene tasa de aceptación del 15-35%. Con 100 pedidos/mes, agregar Gs. 50.000 por cliente que acepta = Gs. 750.000–1.750.000 extras sin gastar más en ads.</p>
        </div>

        <div className="card p-5 mb-5 border border-white/8">
          <div className="space-y-3">
            <div>
              <label className={lc}>Producto principal</label>
              <input className={ic} placeholder="ej. Masajeador de cuello eléctrico" value={form.producto} onChange={e => set('producto', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lc}>Precio venta (Gs.)</label><input className={ic} type="number" placeholder="157000" value={form.precio} onChange={e => set('precio', e.target.value)} /></div>
              <div><label className={lc}>Costo producto (Gs.)</label><input className={ic} type="number" placeholder="35000" value={form.costo} onChange={e => set('costo', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lc}>Categoría</label>
                <select className={ic} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                  {['salud','belleza','hogar','fitness','tecnologia','ropa','general'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className={lc}>Audiencia</label><input className={ic} placeholder="ej. Mujeres 30-50" value={form.audiencia} onChange={e => set('audiencia', e.target.value)} /></div>
            </div>
            <div>
              <label className={lc}>Otros productos de tu catálogo (opcional)</label>
              <input className={ic} placeholder="ej. Crema de colágeno, Cojín lumbar, Almohada cervical" value={form.catalogo} onChange={e => set('catalogo', e.target.value)} />
            </div>
            <button onClick={handleGenerate} disabled={!form.producto || !form.precio || loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-sm transition-all">
              {loading ? '⏳ Generando estrategia...' : '💎 Generar estrategia de upsell'}
            </button>
          </div>
        </div>

        {output && (
          <>
            {/* Estrategia recomendada */}
            <div className="card p-4 border border-violet-500/30 bg-violet-500/5 mb-5">
              <p className="text-violet-400 font-bold text-sm mb-2">🎯 Estrategia recomendada</p>
              <p className="text-white/70 text-sm leading-relaxed">{output.estrategia_recomendada}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 p-1 bg-white/5 rounded-xl">
              {([['estrategia','💎 Ofertas'],['textos','💬 Textos'],['impacto','📊 Impacto']]).map(([k,l]) => (
                <button key={k} onClick={() => setTab(k)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === k ? 'bg-violet-600 text-white' : 'text-white/40'}`}>{l}</button>
              ))}
            </div>

            {tab === 'estrategia' && (
              <div className="space-y-4">
                {/* Upsell principal */}
                <div className="card p-5 border border-emerald-500/30 bg-emerald-500/5">
                  <p className="text-emerald-400 font-bold text-sm mb-3">🚀 Upsell principal</p>
                  <p className="text-white font-bold mb-1">{output.upsell_principal.nombre}</p>
                  <p className="text-white/50 text-sm mb-2">{output.upsell_principal.descripcion}</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-white/5 rounded-xl p-2">
                      <p className="text-white/30 text-[10px]">Precio sugerido</p>
                      <p className="text-emerald-400 font-bold text-sm">{output.upsell_principal.precio_sugerido}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2">
                      <p className="text-white/30 text-[10px]">Ángulo</p>
                      <p className="text-white font-bold text-sm">{output.upsell_principal.angulo}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 mb-3">
                    <p className="text-white/30 text-[10px] mb-1">TEXTO DE OFERTA</p>
                    <p className="text-white/70 text-sm">{output.upsell_principal.texto_oferta}</p>
                  </div>
                  <p className="text-white/30 text-xs italic">{output.upsell_principal.razon_funciona}</p>
                </div>

                {/* Bundles */}
                {output.bundles.map((b, i) => (
                  <div key={i} className="card p-4 border border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-amber-400 font-bold text-sm">📦 {b.nombre_bundle}</p>
                      <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">{b.descuento_pct}</span>
                    </div>
                    <p className="text-white/50 text-xs mb-2">{b.productos_incluidos.join(' + ')}</p>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-white/30 text-sm line-through">{b.precio_individual_suma}</p>
                      <p className="text-amber-400 font-bold">{b.precio_bundle}</p>
                    </div>
                    <p className="text-white/60 text-sm">{b.texto_gancho}</p>
                  </div>
                ))}

                {/* Cross-sell */}
                {output.cross_sell.length > 0 && (
                  <div className="card p-4 border border-blue-500/20 bg-blue-500/5">
                    <p className="text-blue-400 font-bold text-sm mb-3">🔄 Cross-sell</p>
                    {output.cross_sell.map((c, i) => (
                      <div key={i} className="mb-3 last:mb-0">
                        <p className="text-white font-semibold text-sm mb-1">{c.producto_sugerido}</p>
                        <p className="text-white/40 text-xs mb-1">{c.razon_complementa}</p>
                        <p className="text-blue-300/70 text-xs">📍 {c.cuando_ofrecer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'textos' && (
              <div className="space-y-3">
                {[
                  { label: '👆 Antes del botón de compra', value: output.textos_checkout.antes_del_boton },
                  { label: '🔔 Popup post-formulario', value: output.textos_checkout.popup_upsell },
                  { label: '✅ Pantalla de confirmación', value: output.textos_checkout.confirmacion_pedido },
                  { label: '💬 WhatsApp post-compra', value: output.textos_checkout.whatsapp_post_compra },
                ].map((item, i) => (
                  <div key={i} className="card p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/40 text-xs font-bold">{item.label}</p>
                      <CopyBtn k={`txt-${i}`} text={item.value} />
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === 'impacto' && (
              <div className="space-y-3">
                <div className="card p-5 border border-emerald-500/30 bg-emerald-500/5">
                  <p className="text-emerald-400 font-bold text-sm mb-4">📊 Simulación de impacto</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-white/30 text-[10px] mb-1">Ticket actual</p>
                      <p className="text-white font-bold">{output.simulacion_impacto.ticket_promedio_actual}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-white/30 text-[10px] mb-1">Ticket con upsell</p>
                      <p className="text-emerald-400 font-bold">{output.simulacion_impacto.ticket_promedio_con_upsell}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-white/30 text-[10px] mb-1">Incremento</p>
                      <p className="text-emerald-400 font-bold text-xl">{output.simulacion_impacto.incremento_pct}</p>
                    </div>
                  </div>
                </div>
                <div className="card p-4 border border-white/10">
                  <p className="text-white font-bold text-sm mb-2">📈 Con 100 pedidos/mes</p>
                  <p className="text-white/60 text-sm leading-relaxed">{output.simulacion_impacto.escenario_100_pedidos}</p>
                </div>
              </div>
            )}
          </>
        )}

        {!output && (
          <div className="card p-6 text-center border border-white/5">
            <p className="text-4xl mb-3">💎</p>
            <p className="text-white/60 font-semibold mb-1">Maximizá cada pedido</p>
            <p className="text-white/30 text-sm">El upsell es la forma más fácil de aumentar revenue sin gastar más en ads. Un llamado al cliente antes de despachar puede agregar 30-50% al ticket.</p>
          </div>
        )}
      </main>
    </div>
  )
}
