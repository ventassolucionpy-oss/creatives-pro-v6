'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { getPaisConfig, PAISES, formatPrecio, type Pais } from '@/lib/constants'
import Link from 'next/link'

type ScriptOutput = {
  situacion: string
  scripts: Array<{
    titulo: string
    mensaje: string
    followup?: string
    tip: string
  }>
  reglas_de_oro: string[]
  errores_a_evitar: string[]
}

const SITUACIONES = [
  { id: 'precio', icon: '💰', label: '¿Cuánto cuesta?', desc: 'El cliente pregunta el precio' },
  { id: 'original', icon: '🔍', label: '¿Es original/bueno?', desc: 'Duda sobre la calidad' },
  { id: 'envio_cde', icon: '🚚', label: '¿Envían a CDE/Interior?', desc: 'Pregunta por cobertura' },
  { id: 'demora', icon: '⏱️', label: '¿Cuánto demora?', desc: 'Pregunta por tiempo de entrega' },
  { id: 'no_recibio', icon: '😤', label: 'No recibí mi pedido', desc: 'Reclamo por entrega' },
  { id: 'devolucion', icon: '↩️', label: 'Quiero devolver', desc: 'Solicitud de devolución' },
  { id: 'funciona', icon: '⚡', label: '¿Funciona de verdad?', desc: 'Escéptico sobre el producto' },
  { id: 'precio_caro', icon: '😬', label: 'Está muy caro', desc: 'Objeción de precio' },
  { id: 'comparacion', icon: '🔄', label: 'Vi más barato en X', desc: 'Compara con competencia' },
  { id: 'pensarlo', icon: '🤔', label: 'Lo voy a pensar', desc: 'Indecisión / cierre pendiente' },
]

async function callClaude(producto: string, precio: string, ciudad: string, situacionId: string): Promise<ScriptOutput> {
    const situacion = SITUACIONES.find(s => s.id === situacionId)

  const prompt = `Sos un experto en ventas por WhatsApp para dropshipping en ${paisCfg?.nombre || 'Paraguay'} con Dropi. Vendés COD (pago contra entrega).

PRODUCTO: ${producto}
PRECIO: Gs. ${precio}
CIUDAD VENDEDOR: ${ciudad || 'Asunción'}
SITUACIÓN: ${situacion?.label} — ${situacion?.desc}

Contexto Paraguay COD:
- El cliente NO paga por adelantado (COD = pago contra entrega)
- El flete es gratis para el cliente (lo absorbe el vendedor, Gs. 38.000 fijo Dropi)
- Entrega en 2-3 días hábiles en ASU, 3-5 días interior
- No hay devolución de dinero — sí cambio de producto si llegó dañado

Escribí 3 variantes de respuesta para esta situación. Cada variante debe ser:
1. Natural, como habla un paraguayo real (podés usar "che", "pa", tonos amigables pero no payasos)
2. Sin mentiras ni promesas falsas
3. Corta (máximo 3-4 líneas en WhatsApp)
4. Con una siguiente acción clara (CTA)

Respondé SOLO con JSON válido:
{
  "situacion": "${situacion?.label}",
  "scripts": [
    {
      "titulo": "Variante 1 — [nombre de la táctica]",
      "mensaje": "el mensaje de WhatsApp listo para copiar y pegar",
      "followup": "si no responde en 1 hora, escribí esto (opcional, solo si aplica)",
      "tip": "por qué funciona esta variante"
    },
    {
      "titulo": "Variante 2 — [nombre de la táctica]",
      "mensaje": "...",
      "tip": "..."
    },
    {
      "titulo": "Variante 3 — [nombre de la táctica]",
      "mensaje": "...",
      "tip": "..."
    }
  ],
  "reglas_de_oro": ["regla 1 para esta situación", "regla 2", "regla 3"],
  "errores_a_evitar": ["error 1 que cometen vendedores novatos en ${paisCfg?.nombre || 'Paraguay'}", "error 2", "error 3"]
}`

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await res.json()
  const text = data.content[0].text
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export default function WhatsAppVentasPage() {
  const [producto, setProducto] = useState('')
  const [precio, setPrecio] = useState('')
  const [ciudad, setCiudad] = useState('Asunción')
  const [situacion, setSituacion] = useState('')
  const [output, setOutput] = useState<ScriptOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!producto || !situacion) return
    setLoading(true)
    try {
      const result = await callClaude(producto, precio, ciudad, situacion)
      setOutput(result)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const copiar = (i: number, texto: string) => {
    navigator.clipboard.writeText(texto)
    setCopied(i)
    setTimeout(() => setCopied(null), 1800)
  }

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-white/20'
  const labelCls = 'block text-xs text-white/40 mb-1.5 font-medium'

  return (
    <div className="min-h-screen">
      <Link href="/crear" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/crear" className="text-white/30 hover:text-white/60 text-sm transition-colors">Crear</Link>
            <span className="text-white/20 text-sm">›</span>
            <span className="text-white/60 text-sm">WhatsApp Ventas</span>
          </div>
          <h1 className="text-2xl font-bold text-white">💬 Scripts de Venta WhatsApp</h1>
          <p className="text-white/40 text-sm mt-1">Las 10 situaciones más comunes — respuestas listas para copiar</p>
        </div>

        {/* Datos del producto */}
        <div className="card p-5 mb-5 border border-white/8">
          <p className="text-sm font-bold text-white mb-4">Tu producto</p>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>¿Qué vendés?</label>
              <input className={inputCls} placeholder="ej. Masajeador de cuello eléctrico" value={producto} onChange={e => setProducto(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Precio de venta (Gs.)</label>
                <input className={inputCls} type="number" placeholder="157000" value={precio} onChange={e => setPrecio(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Tu ciudad</label>
                <input className={inputCls} placeholder="Asunción" value={ciudad} onChange={e => setCiudad(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Situaciones */}
        <div className="mb-5">
          <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-3">¿Qué te preguntó el cliente?</p>
          <div className="grid grid-cols-1 gap-2">
            {SITUACIONES.map(s => (
              <button key={s.id} onClick={() => setSituacion(s.id)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  situacion === s.id
                    ? 'border-violet-500/50 bg-violet-500/10 text-white'
                    : 'border-white/8 text-white/60 hover:border-white/20 hover:text-white/80'
                }`}>
                <span className="text-xl flex-shrink-0">{s.icon}</span>
                <div>
                  <p className="text-sm font-semibold leading-tight">"{s.label}"</p>
                  <p className="text-xs text-white/30 mt-0.5">{s.desc}</p>
                </div>
                {situacion === s.id && <span className="ml-auto text-violet-400">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleGenerate} disabled={!producto || !situacion || loading}
          className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-sm transition-all mb-6">
          {loading ? '⏳ Generando scripts...' : '💬 Generar scripts de respuesta'}
        </button>

        {/* Output */}
        {output && (
          <>
            <div className="mb-4">
              <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-3">Scripts para: "{output.situacion}"</p>
              <div className="space-y-4">
                {output.scripts.map((s, i) => (
                  <div key={i} className="card p-4 border border-white/10">
                    <p className="text-violet-400 text-xs font-bold mb-3">{s.titulo}</p>
                    <div className="bg-white/5 rounded-xl p-3 mb-3">
                      <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{s.mensaje}</p>
                    </div>
                    {s.followup && (
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 mb-3">
                        <p className="text-amber-400 text-[10px] font-bold mb-1">SEGUIMIENTO (si no responde):</p>
                        <p className="text-white/60 text-xs">{s.followup}</p>
                      </div>
                    )}
                    <p className="text-white/30 text-xs italic mb-3">{s.tip}</p>
                    <button onClick={() => copiar(i, s.mensaje + (s.followup ? '\n\n[SEGUIMIENTO]: ' + s.followup : ''))}
                      className="w-full py-2 rounded-xl border border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5 text-white/60 hover:text-white text-xs font-medium transition-all">
                      {copied === i ? '✅ Copiado' : '📋 Copiar mensaje'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Reglas de oro */}
            <div className="card p-4 border border-emerald-500/20 bg-emerald-500/5 mb-4">
              <p className="text-emerald-400 font-bold text-sm mb-3">✅ Reglas de oro</p>
              <div className="space-y-2">
                {output.reglas_de_oro.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500/60 text-xs mt-0.5 flex-shrink-0">{i + 1}.</span>
                    <p className="text-white/60 text-xs">{r}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Errores */}
            <div className="card p-4 border border-red-500/20 bg-red-500/5 mb-5">
              <p className="text-red-400 font-bold text-sm mb-3">❌ Errores a evitar</p>
              <div className="space-y-2">
                {output.errores_a_evitar.map((e, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-red-500/60 text-xs mt-0.5 flex-shrink-0">✕</span>
                    <p className="text-white/60 text-xs">{e}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="card p-4 border border-violet-500/20 bg-violet-500/5">
          <p className="text-xs text-violet-300 font-bold mb-1">💡 Diferencia con WhatsApp Biz</p>
          <p className="text-xs text-white/40">WhatsApp Biz genera flujos automatizados con chatbot. Este módulo es para conversaciones HUMANAS en tiempo real — los mensajes que vos mismo escribís cuando un cliente te habla.</p>
        </div>

      </main>
    </div>
  )
}
