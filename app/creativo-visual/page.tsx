'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

type ProductoGuardado = { id: string; nombre: string; audiencia?: string; beneficio_principal?: string; categoria?: string; precio_venta_gs?: number; angulos_de_venta?: string[] }

type CreativoVisualOutput = {
  estrategia_visual: {
    formato_ganador: string
    razon: string
    formatos_a_testear: string[]
  }
  imagenes: Array<{
    tipo: string
    concepto: string
    descripcion_detallada: string
    colores_recomendados: string[]
    texto_superpuesto: string
    donde_poner_texto: string
    fondo: string
    prop_ratio: string
    por_que_convierte: string
    prompt_ia: string
  }>
  carrusel: {
    estructura: string
    slide_1: string
    slide_2: string
    slide_3: string
    slide_4: string
    slide_final: string
    copy_intro: string
  }
  thumbnail_video: {
    frame_ideal: string
    texto_sobre_imagen: string
    color_texto: string
    expresion_facial: string
    por_que: string
  }
  errores_visuales_comunes: string[]
  checklist_antes_publicar: string[]
}

async function callClaude(data: Record<string, string>): Promise<CreativoVisualOutput> {
    const prompt = `Sos un director de arte y media buyer experto en creativos para Meta Ads y TikTok Ads, especializado en dropshipping COD en Paraguay. Sabés exactamente qué elementos visuales paran el scroll en el feed paraguayo.

PRODUCTO: ${data.producto}
BENEFICIO PRINCIPAL: ${data.beneficio}
PRECIO: Gs. ${data.precio}
AUDIENCIA: ${data.audiencia}
CATEGORÍA: ${data.categoria}
PLATAFORMA PRINCIPAL: ${data.plataforma}
TIPO DE CREATIVO (imagen / video / carrusel / mix): ${data.tipo_creativo}
CONTEXTO ADICIONAL: ${data.notas || 'ninguno'}

PRINCIPIOS DE CREATIVOS QUE FUNCIONAN EN PARAGUAY:
- Colores vibrantes y de alto contraste (el feed paraguayo es ruidoso)
- Texto corto en la imagen — máx 5-7 palabras grandes y legibles en móvil
- Precio siempre visible si la oferta es el diferenciador
- Cara humana en el thumbnail aumenta CTR hasta 30%
- Antes/Después son los creativos que más convierten en salud y belleza
- El fondo blanco o limpio funciona para producto solo
- El lifestyle (persona usando el producto) funciona para aspiracionales

Generá la estrategia visual completa. Respondé SOLO con JSON válido:
{
  "estrategia_visual": {
    "formato_ganador": "el formato visual que más va a convertir para este producto y audiencia",
    "razon": "por qué este formato específicamente en Paraguay",
    "formatos_a_testear": ["formato 1", "formato 2", "formato 3"]
  },
  "imagenes": [
    {
      "tipo": "Antes/Después | Producto solo | Lifestyle | Texto dominante | Testimonial",
      "concepto": "nombre corto del concepto creativo",
      "descripcion_detallada": "descripción visual exacta: qué aparece en la imagen, dónde, cómo está compuesto",
      "colores_recomendados": ["#COLOR1 — por qué", "COLOR2"],
      "texto_superpuesto": "el texto exacto que va en la imagen — máx 7 palabras",
      "donde_poner_texto": "arriba / centro / abajo / superposición lateral — con justificación",
      "fondo": "blanco limpio | lifestyle hogareño | degradado oscuro | etc.",
      "prop_ratio": "1:1 para feed | 9:16 para Stories/Reels | 4:5 para feed vertical",
      "por_que_convierte": "por qué este creativo específicamente va a parar el scroll",
      "prompt_ia": "prompt listo para usar en Midjourney, DALL-E o Ideogram para generar esta imagen"
    },
    { "tipo": "segundo creativo", "concepto": "...", "descripcion_detallada": "...", "colores_recomendados": [], "texto_superpuesto": "...", "donde_poner_texto": "...", "fondo": "...", "prop_ratio": "...", "por_que_convierte": "...", "prompt_ia": "..." },
    { "tipo": "tercer creativo", "concepto": "...", "descripcion_detallada": "...", "colores_recomendados": [], "texto_superpuesto": "...", "donde_poner_texto": "...", "fondo": "...", "prop_ratio": "...", "por_que_convierte": "...", "prompt_ia": "..." }
  ],
  "carrusel": {
    "estructura": "para qué sirve este carrusel y cuál es el arco narrativo",
    "slide_1": "slide de apertura — gancho visual — qué mostrar y qué texto",
    "slide_2": "desarrollo — beneficio 1",
    "slide_3": "desarrollo — beneficio 2 o prueba social",
    "slide_4": "objeción rebatida o diferenciador",
    "slide_final": "CTA — qué decir y qué mostrar en el último slide",
    "copy_intro": "texto del copy que va sobre el carrusel en el post"
  },
  "thumbnail_video": {
    "frame_ideal": "qué frame del video usar como thumbnail — qué debe mostrar",
    "texto_sobre_imagen": "texto que va sobre el thumbnail — máx 5 palabras",
    "color_texto": "color del texto y por qué",
    "expresion_facial": "si hay persona: qué expresión debe tener y por qué",
    "por_que": "por qué este thumbnail va a tener mayor CTR"
  },
  "errores_visuales_comunes": [
    "error 1 que cometen los dropshippers en Paraguay al hacer creativos",
    "error 2",
    "error 3",
    "error 4"
  ],
  "checklist_antes_publicar": [
    "ítem 1 a verificar antes de activar el anuncio",
    "ítem 2",
    "ítem 3",
    "ítem 4",
    "ítem 5"
  ]
}`

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  })
  const d = await res.json()
  return JSON.parse(d.content[0].text.replace(/```json|```/g, '').trim())
}

export default function CreativoVisualPage() {
  const [productosGuardados, setProductosGuardados] = useState<ProductoGuardado[]>([])
  const [form, setForm] = useState({ producto: '', beneficio: '', precio: '', audiencia: '', categoria: 'general', plataforma: 'Meta Ads', tipo_creativo: 'imagen + video', notas: '' })

  useEffect(() => {
    const loadAll = async () => {
      try {
        // 1. localStorage (sistema /productos)
        const fromLocal: ProductoGuardado[] = (() => {
          try { return JSON.parse(localStorage.getItem('creatives_productos_v1') || '[]') } catch { return [] }
        })()

        // 2. Supabase products table (legado)
        const { createClient } = await import('@/lib/supabase')
        const sb = createClient()
        const { data: sbData } = await sb.from('products').select('id,name,description,price').order('created_at', { ascending: false })
        const fromSupabase: ProductoGuardado[] = (sbData || []).map((p: { id: string; name: string; description: string; price?: number }) => ({
          id: `sb_${p.id}`,
          nombre: p.name,
          beneficio_principal: p.description,
          precio_venta_gs: p.price ? Math.round(p.price * 6350) : undefined,
        }))

        // Merge dedup by nombre
        const seen = new Set<string>()
        const merged: ProductoGuardado[] = []
        for (const p of [...fromLocal, ...fromSupabase]) {
          const key = p.nombre?.toLowerCase().trim()
          if (!seen.has(key)) { seen.add(key); merged.push(p) }
        }
        setProductosGuardados(merged)

        // Auto-load active product from session
        const activo = sessionStorage.getItem('producto_activo')
        if (activo) {
          const p = JSON.parse(activo)
          setForm(prev => ({
            ...prev,
            producto: p.nombre || prev.producto,
            beneficio: p.beneficio_principal || prev.beneficio,
            audiencia: p.audiencia || prev.audiencia,
            categoria: p.categoria || prev.categoria,
            precio: p.precio_venta_gs ? String(p.precio_venta_gs) : prev.precio,
          }))
        }
      } catch {}
    }
    loadAll()
  }, [])

  const handleSelectProduct = (p: ProductoGuardado) => {
    setForm(prev => ({
      ...prev,
      producto: p.nombre,
      beneficio: p.beneficio_principal || prev.beneficio,
      audiencia: p.audiencia || prev.audiencia,
      categoria: p.categoria || prev.categoria,
      precio: p.precio_venta_gs ? String(p.precio_venta_gs) : prev.precio,
    }))
    try { sessionStorage.setItem('producto_activo', JSON.stringify(p)) } catch {}
  }
  const [output, setOutput] = useState<CreativoVisualOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'imagenes'|'carrusel'|'thumbnail'|'checklist'>('imagenes')
  const [copied, setCopied] = useState<string | null>(null)
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleGenerate = async () => {
    if (!form.producto || !form.beneficio) return
    setLoading(true)
    try { const r = await callClaude(form); setOutput(r); setTab('imagenes') }
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
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/inicio" className="text-white/30 hover:text-white/60 text-sm">← Inicio</Link>
            <span className="text-white/20">›</span>
            <span className="text-white/60 text-sm">Creativo Visual</span>
          </div>
          <h1 className="text-2xl font-bold text-white">🎨 Estrategia de Creativo Visual</h1>
          <p className="text-white/40 text-sm mt-1">Qué imagen crear, qué texto poner y por qué para parar el scroll</p>
        </div>


        {productosGuardados.length > 0 && (
          <div className="card p-3 border border-white/8 mb-3">
            <p className="text-[10px] text-white/30 font-bold mb-2 uppercase tracking-wider">Seleccioná un producto guardado</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {productosGuardados.map(p => (
                <button key={p.id} onClick={() => handleSelectProduct(p)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    form.producto === p.nombre ? 'bg-violet-600/30 border-violet-500/50 text-violet-300' : 'border-white/10 text-white/40 hover:text-white/70'
                  }`}>
                  {p.nombre.length > 22 ? p.nombre.slice(0, 22) + '…' : p.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="card p-5 mb-5 border border-white/8">
          <div className="space-y-3">
            <div><label className={lc}>Producto</label><input className={ic} placeholder="ej. Masajeador de cuello eléctrico" value={form.producto} onChange={e => set('producto', e.target.value)} /></div>
            <div><label className={lc}>Beneficio principal / resultado</label><input className={ic} placeholder="ej. Alivia el dolor de cuello y cervical" value={form.beneficio} onChange={e => set('beneficio', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lc}>Precio (Gs.)</label><input className={ic} type="number" placeholder="157000" value={form.precio} onChange={e => set('precio', e.target.value)} /></div>
              <div>
                <label className={lc}>Categoría</label>
                <select className={ic} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                  {['salud','belleza','hogar','fitness','tecnologia','ropa','general'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lc}>Plataforma</label>
                <select className={ic} value={form.plataforma} onChange={e => set('plataforma', e.target.value)}>
                  <option>Meta Ads</option><option>TikTok Ads</option><option>Ambas</option>
                </select>
              </div>
              <div>
                <label className={lc}>Tipo de creativo</label>
                <select className={ic} value={form.tipo_creativo} onChange={e => set('tipo_creativo', e.target.value)}>
                  <option>imagen + video</option><option>solo imagen</option><option>solo video</option><option>carrusel</option>
                </select>
              </div>
            </div>
            <div><label className={lc}>Audiencia</label><input className={ic} placeholder="ej. Mujeres 30-50 con dolor de cuello" value={form.audiencia} onChange={e => set('audiencia', e.target.value)} /></div>
            <div><label className={lc}>Notas adicionales</label><input className={ic} placeholder="ej. Tengo fotos del producto en fondo blanco" value={form.notas} onChange={e => set('notas', e.target.value)} /></div>
            <button onClick={handleGenerate} disabled={!form.producto || !form.beneficio || loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-sm transition-all">
              {loading ? '⏳ Generando estrategia visual...' : '🎨 Generar estrategia visual'}
            </button>
          </div>
        </div>

        {output && (
          <>
            {/* Formato ganador */}
            <div className="card p-4 border border-violet-500/30 bg-violet-500/5 mb-5">
              <p className="text-violet-400 font-bold text-sm mb-1">🏆 Formato ganador: {output.estrategia_visual.formato_ganador}</p>
              <p className="text-white/60 text-sm mb-2">{output.estrategia_visual.razon}</p>
              <div className="flex gap-1.5 flex-wrap">
                {output.estrategia_visual.formatos_a_testear.map((f, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-[10px]">{f}</span>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 p-1 bg-white/5 rounded-xl overflow-x-auto">
              {([['imagenes','🖼️ Imágenes'],['carrusel','🎠 Carrusel'],['thumbnail','🎬 Thumbnail'],['checklist','✅ Checklist']]).map(([k,l]) => (
                <button key={k} onClick={() => setTab(k)}
                  className={`flex-shrink-0 flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === k ? 'bg-violet-600 text-white' : 'text-white/40'}`}>{l}</button>
              ))}
            </div>

            {tab === 'imagenes' && (
              <div className="space-y-4">
                {output.imagenes.map((img, i) => (
                  <div key={i} className="card p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[10px] bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full font-bold">{img.tipo}</span>
                        <p className="text-white font-bold text-sm mt-1">{img.concepto}</p>
                      </div>
                      <span className="text-white/30 text-xs">{img.prop_ratio}</span>
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed mb-3">{img.descripcion_detallada}</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-white/5 rounded-xl p-2">
                        <p className="text-white/30 text-[10px] mb-1">Texto en imagen</p>
                        <p className="text-white font-bold text-sm">"{img.texto_superpuesto}"</p>
                        <p className="text-white/25 text-[10px] mt-0.5">{img.donde_poner_texto}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2">
                        <p className="text-white/30 text-[10px] mb-1">Fondo</p>
                        <p className="text-white text-xs">{img.fondo}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {img.colores_recomendados.slice(0,2).map((c, ci) => (
                            <span key={ci} className="text-[9px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-emerald-400/70 text-xs mb-3 italic">{img.por_que_convierte}</p>
                    <div className="bg-black/30 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white/30 text-[10px] font-bold">PROMPT IA (Midjourney/DALL-E/Ideogram)</p>
                        <CopyBtn k={`prompt-${i}`} text={img.prompt_ia} />
                      </div>
                      <p className="text-white/60 text-xs leading-relaxed font-mono">{img.prompt_ia}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'carrusel' && (
              <div className="space-y-3">
                <div className="card p-4 border border-white/10">
                  <p className="text-white font-bold text-sm mb-2">📖 Arco narrativo</p>
                  <p className="text-white/60 text-sm">{output.carrusel.estructura}</p>
                </div>
                {[
                  { label: 'Slide 1 — Gancho', value: output.carrusel.slide_1 },
                  { label: 'Slide 2', value: output.carrusel.slide_2 },
                  { label: 'Slide 3', value: output.carrusel.slide_3 },
                  { label: 'Slide 4', value: output.carrusel.slide_4 },
                  { label: 'Slide final — CTA', value: output.carrusel.slide_final },
                ].map((s, i) => (
                  <div key={i} className="card p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/40 text-xs font-bold">{s.label}</p>
                      <CopyBtn k={`slide-${i}`} text={s.value} />
                    </div>
                    <p className="text-white/70 text-sm">{s.value}</p>
                  </div>
                ))}
                <div className="card p-4 border border-violet-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/40 text-xs font-bold">Copy intro del carrusel</p>
                    <CopyBtn k="copy-carrusel" text={output.carrusel.copy_intro} />
                  </div>
                  <p className="text-white/70 text-sm">{output.carrusel.copy_intro}</p>
                </div>
              </div>
            )}

            {tab === 'thumbnail' && (
              <div className="space-y-3">
                {[
                  { label: '🎬 Frame ideal del video', value: output.thumbnail_video.frame_ideal },
                  { label: '📝 Texto sobre el thumbnail', value: output.thumbnail_video.texto_sobre_imagen },
                  { label: '🎨 Color del texto', value: output.thumbnail_video.color_texto },
                  { label: '😊 Expresión facial (si aplica)', value: output.thumbnail_video.expresion_facial },
                  { label: '💡 Por qué va a tener más CTR', value: output.thumbnail_video.por_que },
                ].map((item, i) => (
                  <div key={i} className="card p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/40 text-xs font-bold">{item.label}</p>
                      <CopyBtn k={`th-${i}`} text={item.value} />
                    </div>
                    <p className="text-white/70 text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === 'checklist' && (
              <div className="space-y-3">
                <div className="card p-4 border border-red-500/20 bg-red-500/5">
                  <p className="text-red-400 font-bold text-sm mb-3">❌ Errores visuales comunes</p>
                  {output.errores_visuales_comunes.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 mb-2">
                      <span className="text-red-500/60 text-xs mt-0.5 flex-shrink-0">✕</span>
                      <p className="text-white/50 text-xs">{e}</p>
                    </div>
                  ))}
                </div>
                <div className="card p-4 border border-emerald-500/20 bg-emerald-500/5">
                  <p className="text-emerald-400 font-bold text-sm mb-3">✅ Checklist antes de publicar</p>
                  {output.checklist_antes_publicar.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 mb-2">
                      <span className="text-emerald-500/60 text-xs mt-0.5 flex-shrink-0">{i+1}.</span>
                      <p className="text-white/60 text-xs">{item}</p>
                    </div>
                  ))}
                </div>
                <Link href="/comparador-copies" className="block w-full py-3 rounded-xl border border-violet-500/30 text-violet-400 text-sm font-bold text-center hover:bg-violet-500/10 transition-all">
                  ⚖️ Comparar los copies que acompañan estas imágenes →
                </Link>
              </div>
            )}
          </>
        )}

        {!output && (
          <div className="card p-6 text-center border border-white/5">
            <p className="text-4xl mb-3">🎨</p>
            <p className="text-white/60 font-semibold mb-1">La imagen importa tanto como el copy</p>
            <p className="text-white/30 text-sm">El 80% de la decisión de parar el scroll la toma el elemento visual en los primeros 0.3 segundos. Esta guía te dice exactamente qué crear.</p>
          </div>
        )}
      </main>
    </div>
  )
}
