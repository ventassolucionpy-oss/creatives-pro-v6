'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { getPaisConfig, PAISES, formatPrecio, type Pais } from '@/lib/constants'
import Link from 'next/link'

type TestimonialOutput = {
  testimonios_creativos: Array<{
    nombre: string
    ciudad: string
    perfil: string
    texto: string
    rating: number
    para_usar_en: string
    nivel_conciencia: string
  }>
  solicitud_resena: {
    mensaje_whatsapp: string
    mensaje_alternativo: string
    mejor_momento: string
    incentivo_sugerido: string
  }
  guia_uso: {
    en_anuncios: string
    en_landing: string
    en_whatsapp: string
  }
}

async function callClaude(producto: string, beneficio: string, audiencia: string, precio: string): Promise<TestimonialOutput> {
  
  const prompt = `Sos un experto en marketing de dropshipping para ${paisCfg?.nombre || 'Paraguay'}. Generás testimonios realistas para usar en anuncios COD.

PRODUCTO: ${producto}
BENEFICIO PRINCIPAL: ${beneficio}
AUDIENCIA OBJETIVO: ${audiencia}
PRECIO: Gs. ${precio}

REGLAS PARA LOS TESTIMONIOS:
- Nombres y ciudades REALES de ${paisCfg?.nombre || 'Paraguay'} (Asunción, Luque, San Lorenzo, Lambaré, Fernando de la Mora, Encarnación, Ciudad del Este, Caaguazú, Coronel Oviedo, Villarrica, Pedro Juan Caballero)
- Lenguaje natural paraguayo (pueden incluir "che", tono casual, errores de tipeo mínimos)
- Deben mencionar: el pedido que llegó, cuánto demoró, cómo funciona el producto
- NO exagerar ("cambió mi vida completamente" suena falso). Testimonios creíbles y específicos.
- Incluir detalles concretos (cuántos días demoró, en qué parte del cuerpo lo usa, etc.)
- 5 testimonios con perfiles distintos (ama de casa, trabajador de oficina, persona mayor, joven, madre)

Respondé SOLO con JSON válido:
{
  "testimonios_creativos": [
    {
      "nombre": "María González",
      "ciudad": "Luque",
      "perfil": "Ama de casa, 38 años",
      "texto": "testimonio completo en texto, como si fuera un mensaje de WhatsApp o comentario de Facebook",
      "rating": 5,
      "para_usar_en": "Meta Ads imagen | TikTok UGC | Landing Page | WhatsApp",
      "nivel_conciencia": "consciente del problema — perfecto para nivel 3"
    }
  ],
  "solicitud_resena": {
    "mensaje_whatsapp": "mensaje que el vendedor le manda al cliente después de la entrega para pedirle la reseña real",
    "mensaje_alternativo": "variante más corta del mismo mensaje",
    "mejor_momento": "cuándo enviarlo (día X después de la entrega)",
    "incentivo_sugerido": "pequeño incentivo para motivar la reseña real sin sobornar"
  },
  "guia_uso": {
    "en_anuncios": "cómo usar estos testimonios en los copies de Meta/TikTok",
    "en_landing": "dónde y cómo usarlos en la landing page de Lovable",
    "en_whatsapp": "cómo mencionarlos en la conversación de venta por WhatsApp"
  }
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

export default function TestimoniosPage() {
  const [producto, setProducto] = useState('')
  const [beneficio, setBeneficio] = useState('')
  const [audiencia, setAudiencia] = useState('')
  const [precio, setPrecio] = useState('')
  const [output, setOutput] = useState<TestimonialOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [tab, setTab] = useState<'testimonios' | 'solicitud' | 'guia'>('testimonios')

  const handleGenerate = async () => {
    if (!producto || !beneficio) return
    setLoading(true)
    try {
      const result = await callClaude(producto, beneficio, audiencia, precio)
      setOutput(result)
      setTab('testimonios')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const copiar = (key: string, texto: string) => {
    navigator.clipboard.writeText(texto)
    setCopied(key)
    setTimeout(() => setCopied(null), 1800)
  }

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-white/20'
  const labelCls = 'block text-xs text-white/40 mb-1.5 font-medium'
  const starRating = (r: number) => '⭐'.repeat(r)

  return (
    <div className="min-h-screen">
      <Link href="/gestionar" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/crear" className="text-white/30 hover:text-white/60 text-sm transition-colors">Crear</Link>
            <span className="text-white/20 text-sm">›</span>
            <span className="text-white/60 text-sm">Testimonios</span>
          </div>
          <h1 className="text-2xl font-bold text-white">⭐ Testimonios y Reseñas</h1>
          <p className="text-white/40 text-sm mt-1">Testimonios paraguayos realistas + cómo pedir reseñas reales</p>
        </div>

        <div className="card p-5 mb-5 border border-white/8">
          <p className="text-sm font-bold text-white mb-4">Tu producto</p>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Nombre del producto</label>
              <input className={inputCls} placeholder="ej. Masajeador de cuello eléctrico" value={producto} onChange={e => setProducto(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Beneficio principal</label>
              <input className={inputCls} placeholder="ej. Alivia el dolor de cuello después de trabajar frente al pc" value={beneficio} onChange={e => setBeneficio(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>¿Quién lo compra? (audiencia)</label>
              <input className={inputCls} placeholder="ej. Mujeres 30-50 años con dolor de cuello/espalda, trabajadoras" value={audiencia} onChange={e => setAudiencia(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Precio de venta (Gs.)</label>
              <input className={inputCls} type="number" placeholder="157000" value={precio} onChange={e => setPrecio(e.target.value)} />
            </div>
            <button onClick={handleGenerate} disabled={!producto || !beneficio || loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-sm transition-all">
              {loading ? '⏳ Generando testimonios...' : '⭐ Generar testimonios'}
            </button>
          </div>
        </div>

        {output && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-5 p-1 bg-white/5 rounded-xl">
              {[
                { k: 'testimonios', label: '⭐ Testimonios' },
                { k: 'solicitud', label: '📲 Pedir reseña' },
                { k: 'guia', label: '📖 Cómo usar' },
              ].map(t => (
                <button key={t.k} onClick={() => setTab(t.k as typeof tab)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.k ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white/60'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'testimonios' && (
              <div className="space-y-4">
                {output.testimonios_creativos.map((t, i) => (
                  <div key={i} className="card p-4 border border-white/10">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-white font-bold text-sm">{t.nombre}</p>
                        <p className="text-white/40 text-xs">{t.ciudad} · {t.perfil}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs">{starRating(t.rating)}</p>
                        <p className="text-violet-400 text-[10px] mt-0.5">{t.nivel_conciencia}</p>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 mb-3">
                      <p className="text-white/80 text-sm leading-relaxed">"{t.texto}"</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/25 text-[10px]">📍 {t.para_usar_en}</span>
                      <button onClick={() => copiar(`t${i}`, `"${t.texto}" — ${t.nombre}, ${t.ciudad}`)}
                        className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/30 text-white/40 hover:text-white text-xs transition-all">
                        {copied === `t${i}` ? '✅ Copiado' : '📋 Copiar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'solicitud' && (
              <div className="space-y-4">
                <div className="card p-4 border border-emerald-500/20 bg-emerald-500/5">
                  <p className="text-emerald-400 font-bold text-sm mb-1">⏰ Mejor momento para pedirla</p>
                  <p className="text-white/60 text-sm">{output.solicitud_resena.mejor_momento}</p>
                </div>

                <div className="card p-4 border border-white/10">
                  <p className="text-white/60 text-xs font-bold mb-2">MENSAJE PRINCIPAL</p>
                  <div className="bg-white/5 rounded-xl p-3 mb-3">
                    <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{output.solicitud_resena.mensaje_whatsapp}</p>
                  </div>
                  <button onClick={() => copiar('req1', output!.solicitud_resena.mensaje_whatsapp)}
                    className="w-full py-2 rounded-xl border border-white/10 hover:border-emerald-500/30 text-white/40 hover:text-white text-xs font-medium transition-all">
                    {copied === 'req1' ? '✅ Copiado' : '📋 Copiar mensaje'}
                  </button>
                </div>

                <div className="card p-4 border border-white/10">
                  <p className="text-white/60 text-xs font-bold mb-2">VARIANTE CORTA</p>
                  <div className="bg-white/5 rounded-xl p-3 mb-3">
                    <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{output.solicitud_resena.mensaje_alternativo}</p>
                  </div>
                  <button onClick={() => copiar('req2', output!.solicitud_resena.mensaje_alternativo)}
                    className="w-full py-2 rounded-xl border border-white/10 hover:border-emerald-500/30 text-white/40 hover:text-white text-xs font-medium transition-all">
                    {copied === 'req2' ? '✅ Copiado' : '📋 Copiar mensaje'}
                  </button>
                </div>

                <div className="card p-4 border border-violet-500/20 bg-violet-500/5">
                  <p className="text-violet-400 font-bold text-sm mb-1">🎁 Incentivo sugerido</p>
                  <p className="text-white/60 text-sm">{output.solicitud_resena.incentivo_sugerido}</p>
                </div>
              </div>
            )}

            {tab === 'guia' && (
              <div className="space-y-3">
                {[
                  { icon: '📘', titulo: 'En anuncios Meta/TikTok', contenido: output.guia_uso.en_anuncios },
                  { icon: '🖥️', titulo: 'En tu Landing Page', contenido: output.guia_uso.en_landing },
                  { icon: '💬', titulo: 'En conversaciones WhatsApp', contenido: output.guia_uso.en_whatsapp },
                ].map(g => (
                  <div key={g.titulo} className="card p-4 border border-white/10">
                    <p className="text-white font-bold text-sm mb-2">{g.icon} {g.titulo}</p>
                    <p className="text-white/60 text-sm leading-relaxed">{g.contenido}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!output && (
          <div className="card p-6 text-center border border-white/5">
            <p className="text-4xl mb-3">⭐</p>
            <p className="text-white/60 font-semibold mb-1">Social proof paraguayo</p>
            <p className="text-white/30 text-sm">Para COD en ${paisCfg?.nombre || 'Paraguay'}, los testimonios locales son decisivos. Un "Llegó en 3 días a Luque" vale más que cualquier promesa.</p>
          </div>
        )}

        <div className="card p-4 mt-5 border border-amber-500/20 bg-amber-500/5">
          <p className="text-xs text-amber-300 font-bold mb-1">⚠️ Nota importante</p>
          <p className="text-xs text-white/40">Los testimonios generados son para usar como inspiración y estructura creativa. Para máxima efectividad, reemplazalos con reseñas REALES de tus clientes usando los mensajes del tab "Pedir reseña".</p>
        </div>

      </main>
    </div>
  )
}
