'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { getPaisConfig, PAISES, formatPrecio, type Pais } from '@/lib/constants'
import Link from 'next/link'

type ProductoLocal = { id: string; nombre: string; audiencia: string; beneficio_principal: string; angulos_de_venta: string[]; categoria: string; precio_venta_gs: number }

type ImagePromptOutput = {
  concepto_visual: string
  palette: string[]
  prompts: Array<{
    angulo: string
    tipo: string
    ratio: string
    uso: string
    prompt_gemini: string
    negative_prompt: string
    texto_sobre_imagen: string
    razon: string
  }>
  checklist_diseño: string[]
  errores_comunes: string[]
}

async function callClaude(producto: string, audiencia: string, beneficio: string, angulos: string[], categoria: string, precio: string): Promise<ImagePromptOutput> {
    const prompt = `Sos un director de arte especialista en performance marketing para Meta Ads y dropshipping COD en ${paisCfg?.nombre || '${paisCfg?.nombre || 'Paraguay'}'}. Generás prompts ultra-específicos para Gemini Imagen / Gemini Banana Pro para crear imágenes de anuncios que paran el scroll.

PRODUCTO: ${producto}
AUDIENCIA: ${audiencia || 'Adultos 25-50 Paraguay'}
BENEFICIO PRINCIPAL: ${beneficio}
ÁNGULOS DE VENTA: ${angulos.filter(Boolean).join(', ') || 'transformación, dolor, aspiración'}
CATEGORÍA: ${categoria}
PRECIO: ${precio ? `Gs. ${precio}` : 'no especificado'}

REGLAS PARA LOS PROMPTS GEMINI BANANA PRO:
- Siempre en INGLÉS — Gemini rinde mejor en inglés
- Muy específicos: tipo de iluminación, fondo exacto, composición, estilo fotográfico
- Para Paraguay COD: imagen limpia, producto destacado, sin texto (el texto va en el copy)
- Negative prompt obligatorio para evitar los errores típicos de IA
- El ratio debe coincidir con la plataforma de destino
- Estilo: ultra-realistic commercial photography, NOT illustration

Respondé SOLO con JSON válido:
{
  "concepto_visual": "resumen del concepto visual general — qué feeling deben transmitir todas las imágenes",
  "palette": ["#HEX1 — nombre y por qué", "#HEX2 — nombre y por qué", "#HEX3 — nombre y por qué"],
  "prompts": [
    {
      "angulo": "Transformación — Antes/Después",
      "tipo": "Split composition",
      "ratio": "1:1",
      "uso": "Feed Instagram + Facebook",
      "prompt_gemini": "prompt ultra-detallado en inglés para Gemini Banana Pro — mínimo 80 palabras. Include: style, subject, setting, lighting, colors, composition, quality descriptors. Example format: 'Commercial product photography, [product description], [setting/context], [lighting setup: soft box + rim light], [background: clean white gradient], [composition: rule of thirds, hero product centered], [color palette: warm neutrals + accent color], photorealistic, 8k resolution, sharp focus, professional advertising quality, no text overlay'",
      "negative_prompt": "text, watermark, logo, blurry, distorted, low quality, amateur, cartoon, illustration, painting, drawing, sketch, oversaturated, noise, grain",
      "texto_sobre_imagen": "texto corto que va SUPERPUESTO en el diseño final — máx 6 palabras — NO va en el prompt de Gemini",
      "razon": "por qué esta imagen específicamente va a parar el scroll en ${paisCfg?.nombre || 'Paraguay'}"
    },
    {
      "angulo": "Lifestyle — Producto en uso",
      "tipo": "Lifestyle photography",
      "ratio": "4:5",
      "uso": "Feed Facebook — vertical",
      "prompt_gemini": "...",
      "negative_prompt": "...",
      "texto_sobre_imagen": "...",
      "razon": "..."
    },
    {
      "angulo": "Producto solo — Hero shot",
      "tipo": "Product photography",
      "ratio": "16:9",
      "uso": "Banners + Thumbnails",
      "prompt_gemini": "...",
      "negative_prompt": "...",
      "texto_sobre_imagen": "...",
      "razon": "..."
    },
    {
      "angulo": "Social proof — Testimonial visual",
      "tipo": "Portrait + product",
      "ratio": "9:16",
      "uso": "Stories + Reels",
      "prompt_gemini": "...",
      "negative_prompt": "...",
      "texto_sobre_imagen": "...",
      "razon": "..."
    },
    {
      "angulo": "Urgencia — Oferta limitada",
      "tipo": "Product + design elements",
      "ratio": "1:1",
      "uso": "Feed + Retargeting",
      "prompt_gemini": "...",
      "negative_prompt": "...",
      "texto_sobre_imagen": "...",
      "razon": "..."
    }
  ],
  "checklist_diseño": [
    "verificación 1 antes de publicar el anuncio con esta imagen",
    "verificación 2",
    "verificación 3",
    "verificación 4",
    "verificación 5"
  ],
  "errores_comunes": [
    "error 1 al crear imágenes para ads en ${paisCfg?.nombre || 'Paraguay'}",
    "error 2",
    "error 3"
  ]
}`

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  })
  const d = await res.json()
  const text = d.content[0].text
  const s = text.indexOf('{'); const e2 = text.lastIndexOf('}')
  return JSON.parse(text.slice(s, e2 + 1))
}

const RATIO_ICON: Record<string, string> = { '1:1': '⬛', '4:5': '▬', '16:9': '▬', '9:16': '▮' }
const STORAGE_KEY = 'creatives_productos_v1'

export default function ContenidoImagenPage() {
  const [productos, setProductos] = useState<ProductoLocal[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [producto, setProducto] = useState('')
  const [audiencia, setAudiencia] = useState('')
  const [beneficio, setBeneficio] = useState('')
  const [angulos, setAngulos] = useState<string[]>([])
  const [categoria, setCategoria] = useState('general')
  const [precio, setPrecio] = useState('')
  const [output, setOutput] = useState<ImagePromptOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setProductos(JSON.parse(saved))
      const activo = sessionStorage.getItem('producto_activo')
      if (activo) {
        const p = JSON.parse(activo)
        setSelectedId(p.id); setProducto(p.nombre); setAudiencia(p.audiencia || '')
        setBeneficio(p.beneficio_principal || ''); setAngulos(p.angulos_de_venta || [])
        setCategoria(p.categoria || 'general'); setPrecio(String(p.precio_venta_gs || ''))
      }
    } catch {}
  }, [])

  const handleSelectProduct = (p: ProductoLocal) => {
    setSelectedId(p.id); setProducto(p.nombre); setAudiencia(p.audiencia || '')
    setBeneficio(p.beneficio_principal || ''); setAngulos(p.angulos_de_venta || [])
    setCategoria(p.categoria); setPrecio(String(p.precio_venta_gs || ''))
  }

  const handleGenerate = async () => {
    if (!producto) return
    setLoading(true)
    try { const r = await callClaude(producto, audiencia, beneficio, angulos, categoria, precio); setOutput(r) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const copy = (k: string, text: string) => {
    navigator.clipboard.writeText(text); setCopied(k); setTimeout(() => setCopied(null), 1800)
  }

  const ic = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-white/20'
  const lc = 'block text-xs text-white/40 mb-1.5 font-medium'

  return (
    <div className="min-h-screen">
      <Link href="/crear" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/crear" className="text-white/30 hover:text-white/60 text-sm">Crear</Link>
            <span className="text-white/20">›</span>
            <span className="text-white/60 text-sm">Contenido de Imagen</span>
          </div>
          <h1 className="text-2xl font-bold text-white">🎨 Contenido de Imagen</h1>
          <p className="text-white/40 text-sm mt-1">Prompts para Gemini Banana Pro — imágenes que paran el scroll</p>
        </div>

        {/* Product selector */}
        {productos.length > 0 && (
          <div className="card p-4 border border-white/8 mb-4">
            <p className="text-xs text-white/40 font-medium mb-2">Seleccioná un producto guardado</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {productos.map(p => (
                <button key={p.id} onClick={() => handleSelectProduct(p)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${selectedId === p.id ? 'bg-violet-600/30 border-violet-500/50 text-violet-300' : 'border-white/10 text-white/40 hover:text-white/70'}`}>
                  {p.nombre.length > 20 ? p.nombre.slice(0, 20) + '…' : p.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="card p-5 mb-5 border border-white/8">
          <div className="space-y-3">
            <div><label className={lc}>Producto</label><input className={ic} placeholder="ej. Masajeador de cuello eléctrico" value={producto} onChange={e => setProducto(e.target.value)} /></div>
            <div><label className={lc}>Beneficio / transformación</label><input className={ic} placeholder="ej. Alivia el dolor de cuello en 15 minutos" value={beneficio} onChange={e => setBeneficio(e.target.value)} /></div>
            <div><label className={lc}>Audiencia</label><input className={ic} placeholder="ej. Mujeres 30-50 con dolor cervical" value={audiencia} onChange={e => setAudiencia(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lc}>Categoría</label>
                <select className={ic} value={categoria} onChange={e => setCategoria(e.target.value)}>
                  {['salud','belleza','hogar','fitness','tecnologia','ropa','general'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label className={lc}>Precio (Gs.)</label><input className={ic} type="number" placeholder="157000" value={precio} onChange={e => setPrecio(e.target.value)} /></div>
            </div>
            <button onClick={handleGenerate} disabled={!producto || !beneficio || loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-sm transition-all">
              {loading ? '⏳ Generando prompts...' : '🎨 Generar prompts Gemini'}
            </button>
          </div>
        </div>

        {!productos.length && (
          <Link href="/productos" className="block card p-3 border border-violet-500/20 bg-violet-500/5 mb-4 text-center">
            <p className="text-violet-300 text-xs font-bold">💡 Registrá tu producto en "Mis Productos" para no repetir datos</p>
            <p className="text-white/30 text-[10px] mt-0.5">Ir a Mis Productos →</p>
          </Link>
        )}

        {output && (
          <>
            {/* Concepto y paleta */}
            <div className="card p-4 border border-pink-500/20 bg-pink-500/5 mb-5">
              <p className="text-pink-400 font-bold text-sm mb-2">🎨 Concepto visual</p>
              <p className="text-white/70 text-sm mb-3">{output.concepto_visual}</p>
              <div className="flex gap-2 flex-wrap">
                {output.palette?.map((color, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2 py-1">
                    <div className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: color.split(' ')[0] }} />
                    <p className="text-white/50 text-[10px]">{color}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompts */}
            <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-3">Prompts para Gemini Banana Pro</p>
            <div className="space-y-4 mb-5">
              {output.prompts.map((p2, i) => (
                <div key={i} className="card border border-white/10">
                  <div className="p-4 pb-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-white font-bold text-sm">{p2.angulo}</p>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <span className="text-[10px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded font-mono">{p2.ratio}</span>
                      </div>
                    </div>
                    <p className="text-white/30 text-[10px] mb-3">{p2.tipo} · {p2.uso}</p>
                  </div>

                  {/* Main prompt */}
                  <div className="mx-4 mb-2 bg-black/40 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">PROMPT PRINCIPAL</p>
                      <button onClick={() => copy(`p-${i}`, p2.prompt_gemini)}
                        className="text-[10px] text-white/25 hover:text-violet-400 transition-colors font-medium">
                        {copied === `p-${i}` ? '✅ Copiado' : '📋 Copiar'}
                      </button>
                    </div>
                    <p className="text-white/70 text-xs leading-relaxed font-mono">{p2.prompt_gemini}</p>
                  </div>

                  {/* Negative prompt */}
                  <div className="mx-4 mb-2 bg-red-500/5 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] text-red-400/60 font-bold uppercase tracking-wider">NEGATIVE PROMPT</p>
                      <button onClick={() => copy(`np-${i}`, p2.negative_prompt)}
                        className="text-[10px] text-white/20 hover:text-red-400 transition-colors">
                        {copied === `np-${i}` ? '✅' : '📋'}
                      </button>
                    </div>
                    <p className="text-white/40 text-xs font-mono">{p2.negative_prompt}</p>
                  </div>

                  {/* Text overlay + reason */}
                  <div className="mx-4 mb-4 grid grid-cols-2 gap-2">
                    <div className="bg-white/5 rounded-xl p-2">
                      <p className="text-[10px] text-white/30 mb-1">Texto superpuesto</p>
                      <p className="text-white font-bold text-xs">"{p2.texto_sobre_imagen}"</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2">
                      <p className="text-[10px] text-white/30 mb-1">Por qué convierte</p>
                      <p className="text-white/50 text-[10px] leading-relaxed">{p2.razon}</p>
                    </div>
                  </div>

                  {/* Copy all */}
                  <div className="px-4 pb-4">
                    <button onClick={() => copy(`all-${i}`, `PROMPT: ${p2.prompt_gemini}\n\nNEGATIVE: ${p2.negative_prompt}\n\nRATIO: ${p2.ratio}\nTEXTO: ${p2.texto_sobre_imagen}`)}
                      className="w-full py-2 rounded-xl border border-white/10 hover:border-violet-500/30 text-white/30 hover:text-white text-xs font-medium transition-all">
                      {copied === `all-${i}` ? '✅ Copiado todo' : '📋 Copiar prompt completo'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Checklist y errores */}
            <div className="grid grid-cols-1 gap-3 mb-5">
              <div className="card p-4 border border-emerald-500/20 bg-emerald-500/5">
                <p className="text-emerald-400 font-bold text-sm mb-3">✅ Checklist antes de publicar</p>
                {output.checklist_diseño?.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <span className="text-emerald-500/50 text-xs mt-0.5 flex-shrink-0">{i+1}.</span>
                    <p className="text-white/60 text-xs">{item}</p>
                  </div>
                ))}
              </div>
              <div className="card p-4 border border-red-500/20 bg-red-500/5">
                <p className="text-red-400 font-bold text-sm mb-3">❌ Errores comunes a evitar</p>
                {output.errores_comunes?.map((e2, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <span className="text-red-500/50 text-xs mt-0.5 flex-shrink-0">✕</span>
                    <p className="text-white/60 text-xs">{e2}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link href="/comparador-copies" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-violet-500/30 transition-all">
                <span>⚖️</span><div><p className="text-white text-xs font-bold">Comparar copies</p><p className="text-white/30 text-[10px]">Rankear los textos</p></div>
              </Link>
              <Link href="/campana" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-violet-500/30 transition-all">
                <span>⚡</span><div><p className="text-white text-xs font-bold">Campaña completa</p><p className="text-white/30 text-[10px]">Generar todos los copies</p></div>
              </Link>
            </div>
          </>
        )}

        {!output && (
          <div className="card p-6 text-center border border-white/5">
            <p className="text-4xl mb-3">🎨</p>
            <p className="text-white/60 font-semibold mb-1">Prompts para Gemini Banana Pro</p>
            <p className="text-white/30 text-sm">Generá 5 prompts ultra-específicos en inglés — uno por ángulo de venta, con ratio correcto para cada formato de Meta Ads.</p>
          </div>
        )}
      </main>
    </div>
  )
}
