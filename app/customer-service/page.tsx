'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import ProductSelector from '@/components/wizard/ProductSelector'
import ProductModal from '@/components/wizard/ProductModal'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Product } from '@/types'

type CSOutput = {
  tono_marca: string
  reglas_generales: string[]
  situaciones: Array<{
    categoria: string
    emoji: string
    casos: Array<{
      situacion: string
      cliente_dice: string
      respuesta_whatsapp: string
      respuesta_email: string
      notas: string
    }>
  }>
  scripts_cierre: Array<{
    tipo: string
    script: string
    cuando_usar: string
  }>
  frases_prohibidas: string[]
  escalamiento: string
}

async function callClaude(prompt: string): Promise<CSOutput> {
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
  return JSON.parse(clean) as CSOutput
}

function buildCSPrompt(product: Product, config: Record<string, string>): string {
  return `Sos un experto en Customer Service para ecommerce en LATAM con 10+ años de experiencia. Sabés que el 40% de las recompras dependen de cómo se maneja el primer problema. Una mala respuesta destruye reviews y genera chargebacks. Una buena respuesta convierte un cliente frustrado en embajador de marca.

PRODUCTO: ${product.name}
DESCRIPCIÓN: ${product.description}
CATEGORÍA: ${product.category}
PRECIO: ${config.precio || 'no especificado'}
PAÍS: ${config.pais || 'Paraguay'}
TONO DE MARCA: ${config.tono || 'Cercano y profesional'}
PLATAFORMA PRINCIPAL: ${config.plataforma || 'WhatsApp + Instagram'}
POLÍTICA DE DEVOLUCIÓN: ${config.devolucion || 'A definir'}

Generá un manual completo de Customer Service para este producto específico. Las respuestas deben:
- Sonar HUMANAS, no como un bot corporativo
- Resolver el problema Y retener al cliente
- Estar en el español/modalismo de ${config.pais || 'Paraguay'}
- Ser cortas para WhatsApp (máx 3 líneas) y más completas para email

Respondé SOLO con JSON válido:
{
  "tono_marca": "descripción del tono a usar en todas las respuestas — cómo debe sonar la marca",
  "reglas_generales": [
    "regla de oro 1 para responder",
    "regla 2",
    "regla 3",
    "regla 4",
    "regla 5"
  ],
  "situaciones": [
    {
      "categoria": "Consultas pre-venta",
      "emoji": "💬",
      "casos": [
        {
          "situacion": "Pregunta por el precio",
          "cliente_dice": "ejemplo de cómo escribe el cliente",
          "respuesta_whatsapp": "respuesta corta para WhatsApp (máx 3 líneas, con emoji, tono cálido)",
          "respuesta_email": "respuesta más completa para email o DM de Instagram",
          "notas": "tip para el operador sobre cuándo o cómo usar esta respuesta"
        }
      ]
    },
    {
      "categoria": "Problemas con el pedido",
      "emoji": "📦",
      "casos": [
        {
          "situacion": "No llegó el pedido",
          "cliente_dice": "Hola, hice un pedido hace 5 días y no llegó nada",
          "respuesta_whatsapp": "...",
          "respuesta_email": "...",
          "notas": "..."
        },
        {
          "situacion": "Pedido llegó tarde",
          "cliente_dice": "...",
          "respuesta_whatsapp": "...",
          "respuesta_email": "...",
          "notas": "..."
        },
        {
          "situacion": "Producto llegó dañado",
          "cliente_dice": "...",
          "respuesta_whatsapp": "...",
          "respuesta_email": "...",
          "notas": "..."
        }
      ]
    },
    {
      "categoria": "Devoluciones y reembolsos",
      "emoji": "↩️",
      "casos": [
        {
          "situacion": "Quiere devolver el producto",
          "cliente_dice": "...",
          "respuesta_whatsapp": "...",
          "respuesta_email": "...",
          "notas": "..."
        },
        {
          "situacion": "Quiere reembolso",
          "cliente_dice": "...",
          "respuesta_whatsapp": "...",
          "respuesta_email": "...",
          "notas": "..."
        }
      ]
    },
    {
      "categoria": "Problemas con el producto",
      "emoji": "⚠️",
      "casos": [
        {
          "situacion": "El producto no funciona como esperaba",
          "cliente_dice": "...",
          "respuesta_whatsapp": "...",
          "respuesta_email": "...",
          "notas": "..."
        },
        {
          "situacion": "El producto llegó diferente a la foto",
          "cliente_dice": "...",
          "respuesta_whatsapp": "...",
          "respuesta_email": "...",
          "notas": "..."
        }
      ]
    },
    {
      "categoria": "Reseñas negativas y quejas",
      "emoji": "⭐",
      "casos": [
        {
          "situacion": "Dejó una reseña negativa en redes",
          "cliente_dice": "...",
          "respuesta_whatsapp": "respuesta pública para comentario en Instagram/TikTok (muy corta, profesional)",
          "respuesta_email": "DM privado para resolver el problema",
          "notas": "..."
        },
        {
          "situacion": "Amenaza con chargeback",
          "cliente_dice": "...",
          "respuesta_whatsapp": "...",
          "respuesta_email": "...",
          "notas": "Cómo manejar esta situación sin ceder inmediatamente pero sin perder al cliente"
        }
      ]
    },
    {
      "categoria": "Oportunidades de upsell post-venta",
      "emoji": "⬆️",
      "casos": [
        {
          "situacion": "Cliente satisfecho que pregunta por más productos",
          "cliente_dice": "...",
          "respuesta_whatsapp": "respuesta que aprovecha el momento para ofrecer otro producto o descuento de recompra",
          "respuesta_email": "...",
          "notas": "..."
        },
        {
          "situacion": "Pedir reseña a cliente satisfecho",
          "cliente_dice": "...",
          "respuesta_whatsapp": "mensaje proactivo para pedir la reseña en el momento justo",
          "respuesta_email": "...",
          "notas": "..."
        }
      ]
    }
  ],
  "scripts_cierre": [
    {
      "tipo": "Cierre de venta por WhatsApp — cliente indeciso",
      "script": "script completo de 3-5 mensajes para cerrar una venta con alguien que preguntó pero no compró",
      "cuando_usar": "cuando el cliente hizo preguntas hace 24-48hs y no compró todavía"
    },
    {
      "tipo": "Recuperación de cliente insatisfecho",
      "script": "script para convertir una queja en una recompra — incluí oferta de compensación razonable",
      "cuando_usar": "cuando hay un problema real y querés retener al cliente"
    },
    {
      "tipo": "Reactivación de cliente inactivo",
      "script": "mensaje para cliente que compró hace 30+ días y no ha vuelto",
      "cuando_usar": "campaña mensual de reactivación"
    }
  ],
  "frases_prohibidas": [
    "frase que NUNCA hay que decir y por qué destruye la relación",
    "frase prohibida 2",
    "frase prohibida 3",
    "frase prohibida 4",
    "frase prohibida 5"
  ],
  "escalamiento": "cuándo y cómo escalar a un supervisor o dar una compensación — reglas claras para tomar esa decisión"
}`
}

export default function CustomerServicePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [config, setConfig] = useState<Record<string, string>>({})
  const [output, setOutput] = useState<CSOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState(0)
  const [activeType, setActiveType] = useState<'whatsapp' | 'email'>('whatsapp')
  const [copied, setCopied] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const generate = async () => {
    if (!selectedProduct) return
    setLoading(true); setError('')
    try {
      const result = await callClaude(buildCSPrompt(selectedProduct, config))
      setOutput(result); setActiveCategory(0)
    } catch (e) { setError(e instanceof Error ? e.message : 'Error') }
    setLoading(false)
  }

  const copyText = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id); setTimeout(() => setCopied(null), 2000)
  }

  const save = async () => {
    if (!output || !selectedProduct) return
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('generations').insert({ user_id: user.id, product_id: selectedProduct.id, tool: 'customer-service', status: 'completed', input: config, output })
      setSaved(true)
    }
  }

  const inputClass = 'input'
  const labelClass = 'block text-xs font-medium text-white/40 mb-1.5'
  const greenStyle = { background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }

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
              <h1 className="text-lg font-bold text-white">Customer Service IA</h1>
              <span className="tag text-[10px]" style={greenStyle}>💬 WhatsApp + Email</span>
            </div>
            <p className="text-white/40 text-xs">Plantillas de respuesta para cada situación — listas para copiar y pegar en WhatsApp o email</p>
          </div>
        </div>

        {!output ? (
          <div className="space-y-5 animate-fade-up">
            <div className="card p-4 border border-green-500/15 bg-green-500/5">
              <p className="text-green-300 text-xs font-bold mb-2">Por qué esto vale su peso en oro</p>
              <p className="text-white/50 text-xs leading-relaxed">El 60% del tiempo operativo en ecommerce se va en responder mensajes. Con este módulo tenés respuestas perfectas para cada situación — escritas en el tono de tu marca, listas para copiar. Un cliente satisfecho en su problema compra 3x más.</p>
            </div>

            <ProductSelector selectedProductId={selectedProduct?.id || null} onSelect={p => setSelectedProduct(p)} onCreateNew={() => setShowModal(true)} />

            <div className="card p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Precio del producto</label>
                  <input className={inputClass} value={config.precio || ''} onChange={e => setConfig(p => ({ ...p, precio: e.target.value }))} placeholder="Ej: Gs. 147.000 / $19" />
                </div>
                <div>
                  <label className={labelClass}>País</label>
                  <select className={`${inputClass} cursor-pointer`} value={config.pais || 'Paraguay'} onChange={e => setConfig(p => ({ ...p, pais: e.target.value }))} style={{ background: '#111' }}>
                    {['Paraguay', 'Argentina', 'Uruguay', 'Chile', 'Colombia', 'México'].map(o => <option key={o} value={o} style={{ background: '#111' }}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Tono de marca</label>
                  <select className={`${inputClass} cursor-pointer`} value={config.tono || ''} onChange={e => setConfig(p => ({ ...p, tono: e.target.value }))} style={{ background: '#111' }}>
                    <option value="" style={{ background: '#111' }}>Seleccionar...</option>
                    {['Cercano y cálido (como un amigo)', 'Profesional y confiable', 'Jovial y con humor', 'Empático y comprensivo', 'Directo y eficiente'].map(o => <option key={o} value={o} style={{ background: '#111' }}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Política de devolución</label>
                  <select className={`${inputClass} cursor-pointer`} value={config.devolucion || ''} onChange={e => setConfig(p => ({ ...p, devolucion: e.target.value }))} style={{ background: '#111' }}>
                    <option value="" style={{ background: '#111' }}>Seleccionar...</option>
                    {['Sin devoluciones', '7 días para cambio', '15 días para devolución', '30 días con reembolso completo', 'Solo cambio por defecto de fábrica'].map(o => <option key={o} value={o} style={{ background: '#111' }}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Plataforma de atención principal</label>
                <select className={`${inputClass} cursor-pointer`} value={config.plataforma || ''} onChange={e => setConfig(p => ({ ...p, plataforma: e.target.value }))} style={{ background: '#111' }}>
                  <option value="" style={{ background: '#111' }}>Seleccionar...</option>
                  {['WhatsApp Business', 'WhatsApp + Instagram DM', 'WhatsApp + Facebook Messenger', 'Email + WhatsApp', 'TikTok + WhatsApp'].map(o => <option key={o} value={o} style={{ background: '#111' }}>{o}</option>)}
                </select>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button onClick={generate} disabled={!selectedProduct || loading} className="btn-primary w-full py-4 text-base">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />Generando plantillas de CS...</>
                : '💬 Generar manual de Customer Service →'}
            </button>
          </div>
        ) : (
          <div className="animate-fade-up">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-bold">Manual CS — {selectedProduct?.name}</h2>
                <p className="text-white/30 text-xs mt-0.5">{output.situaciones.length} categorías · {output.situaciones.reduce((s, c) => s + c.casos.length, 0)} situaciones</p>
              </div>
              <div className="flex gap-2">
                <button onClick={save} disabled={saved} className={`text-xs px-3 py-2 rounded-lg border transition-all ${saved ? 'border-emerald-500/40 text-emerald-400' : 'border-white/15 text-white/50 hover:border-white/30'}`}>{saved ? '✓' : '💾'}</button>
                <button onClick={() => { setOutput(null); setSaved(false) }} className="btn-secondary text-xs px-3 py-2">← Nuevo</button>
              </div>
            </div>

            {/* Tono y reglas */}
            <div className="card p-4 border border-green-500/15 bg-green-500/5 mb-5">
              <p className="text-green-300 text-[10px] font-bold uppercase tracking-wider mb-1">🎯 Tono de marca</p>
              <p className="text-white/70 text-sm mb-3">{output.tono_marca}</p>
              <div className="space-y-1">
                {output.reglas_generales.map((r, i) => (
                  <p key={i} className="text-white/50 text-xs flex gap-2"><span className="text-green-400 flex-shrink-0">✓</span>{r}</p>
                ))}
              </div>
            </div>

            {/* WA vs Email toggle */}
            <div className="flex gap-2 p-1 bg-white/3 rounded-xl border border-white/8 mb-5 max-w-xs">
              {(['whatsapp', 'email']).map(t => (
                <button key={t} onClick={() => setActiveType(t)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeType === t ? 'bg-green-600 text-white' : 'text-white/30 hover:text-white/60'}`}>
                  {t === 'whatsapp' ? '💬 WhatsApp' : '📧 Email / DM'}
                </button>
              ))}
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2 mb-5">
              {output.situaciones.map((cat, i) => (
                <button key={i} onClick={() => setActiveCategory(i)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeCategory === i ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'}`}>
                  <span>{cat.emoji}</span> {cat.categoria}
                </button>
              ))}
            </div>

            {/* Cases */}
            {output.situaciones[activeCategory] && (
              <div className="space-y-4 animate-fade-up">
                {output.situaciones[activeCategory].casos.map((caso, i) => {
                  const respuesta = activeType === 'whatsapp' ? caso.respuesta_whatsapp : caso.respuesta_email
                  const cid = `${activeCategory}-${i}-${activeType}`
                  return (
                    <div key={i} className="card border border-white/8 overflow-hidden">
                      <div className="p-4 pb-3">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="text-white text-xs font-semibold mb-1">{caso.situacion}</p>
                            <div className="px-3 py-2 bg-white/5 border border-white/8 rounded-xl rounded-br-sm max-w-sm">
                              <p className="text-white/50 text-xs italic">"{caso.cliente_dice}"</p>
                            </div>
                          </div>
                        </div>

                        {/* Respuesta */}
                        <div className="flex items-start gap-2">
                          <div className="flex-1 relative">
                            <div className={`p-3 rounded-2xl ${activeType === 'whatsapp' ? 'rounded-tl-sm bg-green-500/10 border border-green-500/20' : 'rounded-tl-sm bg-blue-500/8 border border-blue-500/15'}`}>
                              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{respuesta}</p>
                            </div>
                            <button onClick={() => copyText(respuesta, cid)}
                              className="absolute top-2 right-2 text-[10px] text-white/25 hover:text-green-400 transition-colors">
                              {copied === cid ? '✓' : '⊕'}
                            </button>
                          </div>
                        </div>

                        {caso.notas && (
                          <p className="text-white/25 text-[10px] mt-2 italic">💡 {caso.notas}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Scripts de cierre */}
            <div className="mt-6 space-y-4">
              <p className="text-xs font-semibold text-white/25 uppercase tracking-widest">Scripts de cierre y recuperación</p>
              {output.scripts_cierre.map((s, i) => (
                <div key={i} className="card p-4 border border-amber-500/15">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-amber-300 text-xs font-bold">{s.tipo}</p>
                      <p className="text-white/30 text-[10px]">Cuándo: {s.cuando_usar}</p>
                    </div>
                    <button onClick={() => copyText(s.script, `script-${i}`)}
                      className="text-[10px] text-white/25 hover:text-amber-400 transition-colors flex-shrink-0">
                      {copied === `script-${i}` ? '✓ Copiado' : '⊕ Copiar'}
                    </button>
                  </div>
                  <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                    <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{s.script}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Frases prohibidas */}
            <div className="mt-4 card p-4 border border-red-500/20 bg-red-500/5">
              <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider mb-3">🚫 Frases que NUNCA hay que decir</p>
              <div className="space-y-2">
                {output.frases_prohibidas.map((f, i) => (
                  <p key={i} className="text-white/60 text-xs flex gap-2">
                    <span className="text-red-400 flex-shrink-0">✕</span>{f}
                  </p>
                ))}
              </div>
            </div>

            {/* Escalamiento */}
            <div className="mt-4 card p-4 border border-blue-500/15 bg-blue-500/5">
              <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-2">📋 Política de escalamiento</p>
              <p className="text-white/70 text-sm leading-relaxed">{output.escalamiento}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
