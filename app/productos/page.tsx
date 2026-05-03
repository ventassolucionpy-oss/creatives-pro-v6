'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Product } from '@/types'

type ProductoLocal = {
  id: string
  nombre: string
  descripcion: string
  costo_gs: number
  precio_venta_gs: number
  precio_tachado_gs: number
  categoria: string
  audiencia: string
  beneficio_principal: string
  angulos_de_venta: string[]
  imagen_url?: string
  imagen_base64?: string
  prompts_gemini: Array<{ angulo: string; ratio: string; prompt: string }>
  created_at: string
}

type AnalisisImagen = {
  nombre_detectado: string
  descripcion: string
  categoria: string
  audiencia: string
  beneficio_principal: string
  angulos_de_venta: string[]
  precio_sugerido_gs: number
  precio_tachado_gs: number
  prompts_gemini: Array<{ angulo: string; ratio: string; prompt: string }>
}

async function analizarImagen(base64: string, mimeType: string, costoGs: number): Promise<AnalisisImagen> {
    const prompt = `Analizá esta imagen de producto para dropshipping en Paraguay. Detectá TODO lo necesario para venderlo.

El costo del producto es Gs. ${costoGs.toLocaleString('es-PY')} (guaraníes paraguayos).

Respondé SOLO con JSON válido, sin texto extra:
{
  "nombre_detectado": "nombre comercial atractivo para Paraguay, no el nombre técnico de AliExpress",
  "descripcion": "descripción de 2-3 oraciones del producto: qué es, para qué sirve, cómo funciona",
  "categoria": "salud | belleza | hogar | fitness | tecnologia | ropa | general",
  "audiencia": "perfil demográfico y psicográfico del comprador ideal en Paraguay — edad, género, situación",
  "beneficio_principal": "el beneficio más poderoso — transformación concreta que obtiene el comprador",
  "angulos_de_venta": [
    "ángulo 1 — dolor que resuelve",
    "ángulo 2 — aspiración que cumple",
    "ángulo 3 — diferenciador único",
    "ángulo 4 — urgencia o escasez",
    "ángulo 5 — prueba social"
  ],
  "precio_sugerido_gs": ${Math.ceil(costoGs * 4.5 / 7000) * 7000},
  "precio_tachado_gs": ${Math.ceil(costoGs * 4.5 * 1.7 / 7000) * 7000},
  "prompts_gemini": [
    {
      "angulo": "nombre del ángulo de venta (ej: Transformación — antes/después)",
      "ratio": "16:9",
      "prompt": "prompt detallado y específico en inglés para Gemini Imagen / Gemini Banana Pro. Debe incluir: tipo de imagen (product shot, lifestyle, before/after), iluminación, fondo, colores, mood, texto que aparece en la imagen si aplica. Formato: [style], [subject], [setting], [lighting], [colors], [composition], [mood]. Ultra-realistic, photographic quality, product advertisement."
    },
    {
      "angulo": "ángulo 2",
      "ratio": "1:1",
      "prompt": "prompt en inglés para Gemini para anuncio cuadrado feed Instagram/Facebook"
    },
    {
      "angulo": "ángulo 3",
      "ratio": "9:16",
      "prompt": "prompt en inglés para Gemini para Stories/Reels vertical"
    },
    {
      "angulo": "ángulo 4 — lifestyle",
      "ratio": "4:5",
      "prompt": "prompt en inglés para Gemini — lifestyle con persona usando el producto"
    },
    {
      "angulo": "ángulo 5 — antes/después",
      "ratio": "1:1",
      "prompt": "prompt en inglés para Gemini — composición antes/después si aplica al producto"
    }
  ]
}`

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
          { type: 'text', text: prompt },
        ],
      }],
    }),
  })
  const data = await res.json()
  const text = data.content[0].text
  const clean = text.replace(/```json|```/g, '').trim()
  const s = clean.indexOf('{'); const e = clean.lastIndexOf('}')
  return JSON.parse(clean.slice(s, e + 1))
}

const STORAGE_KEY = 'creatives_productos_v1'

function loadProducts(): ProductoLocal[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveProducts(prods: ProductoLocal[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prods)) } catch {}
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<ProductoLocal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [selected, setSelected] = useState<ProductoLocal | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const imgRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    nombre: '', descripcion: '', costo_gs: '', precio_venta_gs: '', precio_tachado_gs: '',
    categoria: 'general', audiencia: '', beneficio_principal: '',
    angulos: ['', '', '', '', ''],
    imagen_base64: '', imagen_url: '',
    prompts_gemini: [] as Array<{ angulo: string; ratio: string; prompt: string }>,
  })

  useEffect(() => { setProductos(loadProducts()) }, [])

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      const base64 = dataUrl.split(',')[1]
      const mimeType = file.type as 'image/jpeg' | 'image/png' | 'image/webp'
      setForm(p => ({ ...p, imagen_base64: base64, imagen_url: dataUrl }))
      setAnalyzing(true)
      try {
        const costoNum = parseInt(form.costo_gs) || 35000
        const analisis = await analizarImagen(base64, mimeType, costoNum)
        setForm(p => ({
          ...p,
          nombre: analisis.nombre_detectado || p.nombre,
          descripcion: analisis.descripcion || p.descripcion,
          categoria: analisis.categoria || p.categoria,
          audiencia: analisis.audiencia || p.audiencia,
          beneficio_principal: analisis.beneficio_principal || p.beneficio_principal,
          angulos: analisis.angulos_de_venta?.length
            ? [...analisis.angulos_de_venta, '', '', ''].slice(0, 5)
            : p.angulos,
          precio_venta_gs: p.precio_venta_gs || String(analisis.precio_sugerido_gs),
          precio_tachado_gs: p.precio_tachado_gs || String(analisis.precio_tachado_gs),
          prompts_gemini: analisis.prompts_gemini || [],
        }))
      } catch (err) { console.error('Análisis imagen:', err) }
      finally { setAnalyzing(false) }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!form.nombre) return
    const nuevo: ProductoLocal = {
      id: Date.now().toString(),
      nombre: form.nombre,
      descripcion: form.descripcion,
      costo_gs: parseInt(form.costo_gs) || 0,
      precio_venta_gs: parseInt(form.precio_venta_gs) || 0,
      precio_tachado_gs: parseInt(form.precio_tachado_gs) || 0,
      categoria: form.categoria,
      audiencia: form.audiencia,
      beneficio_principal: form.beneficio_principal,
      angulos_de_venta: form.angulos.filter(Boolean),
      imagen_base64: form.imagen_base64,
      imagen_url: form.imagen_url,
      prompts_gemini: form.prompts_gemini,
      created_at: new Date().toISOString(),
    }
    const updated = [nuevo, ...productos]
    setProductos(updated)
    saveProducts(updated)
    // Share globally for other modules
    try { sessionStorage.setItem('producto_activo', JSON.stringify(nuevo)) } catch {}
    setShowForm(false)
    setSelected(nuevo)
    resetForm()
  }

  const resetForm = () => setForm({
    nombre: '', descripcion: '', costo_gs: '', precio_venta_gs: '', precio_tachado_gs: '',
    categoria: 'general', audiencia: '', beneficio_principal: '',
    angulos: ['', '', '', '', ''],
    imagen_base64: '', imagen_url: '',
    prompts_gemini: [],
  })

  const deleteProduct = (id: string) => {
    const updated = productos.filter(p => p.id !== id)
    setProductos(updated)
    saveProducts(updated)
    if (selected?.id === id) setSelected(null)
  }

  const selectProduct = (p: ProductoLocal) => {
    setSelected(p)
    try { sessionStorage.setItem('producto_activo', JSON.stringify(p)) } catch {}
  }

  const copy = (k: string, text: string) => {
    navigator.clipboard.writeText(text); setCopied(k); setTimeout(() => setCopied(null), 1800)
  }

  const fmt = (n: number) => `Gs. ${n.toLocaleString('es-PY')}`

  const ic = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-white/20'
  const lc = 'block text-xs text-white/40 mb-1.5 font-medium'

  return (
    <div className="min-h-screen">
      <Link href="/inicio" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/inicio" className="text-white/30 hover:text-white/60 text-sm">Inicio</Link>
            <span className="text-white/20">›</span>
            <span className="text-white/60 text-sm">Productos</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">📦 Mis Productos</h1>
              <p className="text-white/40 text-sm mt-1">Registrá productos con imagen — todos los datos quedan guardados para siempre</p>
            </div>
            <button onClick={() => { setShowForm(true); setSelected(null) }}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-all">
              + Nuevo
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card p-5 border border-violet-500/30 bg-violet-500/5 mb-5">
            <p className="text-sm font-bold text-white mb-4">Nuevo producto</p>

            {/* Imagen — siempre primero */}
            <div className="mb-4">
              <label className={lc}>Foto del producto (opcional — detecta todo automáticamente)</label>
              <div
                onClick={() => imgRef.current?.click()}
                className={`relative rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden
                  ${form.imagen_url ? 'border-violet-500/50 h-48' : 'border-white/15 hover:border-violet-500/40 h-32'}`}>
                {form.imagen_url ? (
                  <img src={form.imagen_url} alt="producto" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center px-4">
                    <p className="text-3xl mb-2">📸</p>
                    <p className="text-white/50 text-sm font-medium">Subir imagen del producto</p>
                    <p className="text-white/25 text-xs mt-1">La IA detecta nombre, descripción, audiencia y genera prompts para Gemini</p>
                  </div>
                )}
                {analyzing && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-violet-300 text-sm font-bold">Analizando imagen...</p>
                  </div>
                )}
              </div>
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
              {form.imagen_url && (
                <button onClick={() => setForm(p => ({ ...p, imagen_url: '', imagen_base64: '' }))}
                  className="text-xs text-red-400/60 hover:text-red-400 mt-1 transition-colors">✕ Quitar imagen</button>
              )}
            </div>

            {/* Costo — primero antes de la imagen para el cálculo */}
            <div className="mb-3">
              <label className={lc}>Costo del producto (Gs.) — necesario para calcular precio sugerido</label>
              <input className={ic} type="number" placeholder="ej. 35000" value={form.costo_gs}
                onChange={e => set('costo_gs', e.target.value)} />
            </div>

            <div className="space-y-3">
              <div>
                <label className={lc}>Nombre del producto</label>
                <input className={ic} placeholder="ej. Masajeador de cuello eléctrico" value={form.nombre} onChange={e => set('nombre', e.target.value)} />
              </div>
              <div>
                <label className={lc}>Descripción</label>
                <textarea className={`${ic} resize-none`} rows={3} placeholder="Qué es, para qué sirve, cómo funciona..." value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lc}>Precio de venta (Gs.)</label>
                  <input className={ic} type="number" placeholder="157000" value={form.precio_venta_gs} onChange={e => set('precio_venta_gs', e.target.value)} />
                </div>
                <div>
                  <label className={lc}>Precio tachado (Gs.)</label>
                  <input className={ic} type="number" placeholder="247000" value={form.precio_tachado_gs} onChange={e => set('precio_tachado_gs', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={lc}>Categoría</label>
                <select className={ic} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                  {['salud','belleza','hogar','fitness','tecnologia','ropa','general'].map(c =>
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className={lc}>Audiencia objetivo</label>
                <input className={ic} placeholder="ej. Mujeres 30-50 con dolor de cuello, trabajadoras de oficina" value={form.audiencia} onChange={e => set('audiencia', e.target.value)} />
              </div>
              <div>
                <label className={lc}>Beneficio principal / transformación</label>
                <input className={ic} placeholder="ej. Alivia el dolor de cuello en 15 minutos sin pastillas" value={form.beneficio_principal} onChange={e => set('beneficio_principal', e.target.value)} />
              </div>

              {/* Ángulos de venta */}
              <div>
                <label className={lc}>Ángulos de venta (5 máximo)</label>
                {form.angulos.map((a, i) => (
                  <input key={i} className={`${ic} mb-2`}
                    placeholder={`Ángulo ${i + 1}${i === 0 ? ' (ej: Dolor — años sufriendo cervicales)' : ''}`}
                    value={a}
                    onChange={e => {
                      const arr = [...form.angulos]; arr[i] = e.target.value
                      setForm(p => ({ ...p, angulos: arr }))
                    }} />
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => { setShowForm(false); resetForm() }}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/40 text-sm">Cancelar</button>
                <button onClick={handleSave} disabled={!form.nombre}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-sm transition-all">
                  Guardar producto
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista */}
        {productos.length === 0 && !showForm ? (
          <div className="card p-8 text-center border border-white/5">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-white/60 font-semibold mb-1">Sin productos registrados</p>
            <p className="text-white/30 text-sm mb-4">Registrá tus productos acá. Todos los módulos de la app los van a usar para no tener que ingresar los datos dos veces.</p>
            <button onClick={() => setShowForm(true)}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all">
              + Registrar primer producto
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {productos.map(p => (
              <div key={p.id} className={`card border transition-all cursor-pointer ${selected?.id === p.id ? 'border-violet-500/50 bg-violet-500/5' : 'border-white/8 hover:border-white/20'}`}
                onClick={() => selectProduct(p)}>
                <div className="flex items-start gap-3 p-4">
                  {p.imagen_url ? (
                    <img src={p.imagen_url} alt={p.nombre} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">📦</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white font-bold text-sm">{p.nombre}</p>
                      {selected?.id === p.id && <span className="text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">ACTIVO</span>}
                    </div>
                    <p className="text-white/40 text-xs mt-0.5 truncate">{p.descripcion}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-white/30 text-[10px]">Costo: {fmt(p.costo_gs)}</span>
                      <span className="text-white/20 text-[10px]">•</span>
                      <span className="text-emerald-400/70 text-[10px]">Venta: {fmt(p.precio_venta_gs)}</span>
                      {p.prompts_gemini?.length > 0 && (
                        <span className="text-[10px] bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded-full">{p.prompts_gemini.length} prompts</span>
                      )}
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteProduct(p.id) }}
                    className="text-white/15 hover:text-red-400 text-xs transition-colors flex-shrink-0">✕</button>
                </div>

                {/* Expanded detail when selected */}
                {selected?.id === p.id && (
                  <div className="px-4 pb-4 space-y-3">
                    {/* Audiencia y beneficio */}
                    <div className="grid grid-cols-1 gap-2">
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-white/30 text-[10px] font-bold mb-1">👥 AUDIENCIA</p>
                        <p className="text-white/70 text-xs">{p.audiencia || '—'}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-white/30 text-[10px] font-bold mb-1">⚡ BENEFICIO PRINCIPAL</p>
                        <p className="text-white/70 text-xs">{p.beneficio_principal || '—'}</p>
                      </div>
                    </div>

                    {/* Ángulos */}
                    {p.angulos_de_venta.length > 0 && (
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-white/30 text-[10px] font-bold mb-2">🎯 ÁNGULOS DE VENTA</p>
                        {p.angulos_de_venta.map((a, i) => (
                          <p key={i} className="text-white/60 text-xs mb-1">{i + 1}. {a}</p>
                        ))}
                      </div>
                    )}

                    {/* Prompts Gemini */}
                    {p.prompts_gemini?.length > 0 && (
                      <div>
                        <p className="text-white/30 text-[10px] font-bold mb-2 uppercase tracking-wider">🎨 Prompts Gemini / Imagen (listos para copiar)</p>
                        <div className="space-y-2">
                          {p.prompts_gemini.map((pg, i) => (
                            <div key={i} className="bg-black/30 rounded-xl p-3">
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded-full font-bold">{pg.ratio}</span>
                                  <p className="text-white/50 text-[10px] font-medium">{pg.angulo}</p>
                                </div>
                                <button onClick={() => copy(`pg-${p.id}-${i}`, pg.prompt)}
                                  className="text-[10px] text-white/25 hover:text-violet-400 transition-colors">
                                  {copied === `pg-${p.id}-${i}` ? '✅' : '📋 Copiar'}
                                </button>
                              </div>
                              <p className="text-white/50 text-[10px] leading-relaxed font-mono">{pg.prompt}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick actions */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {[
                        { href: '/campana', icon: '⚡', label: 'Campaña Completa' },
                        { href: '/creativo-visual', icon: '🎨', label: 'Creativo Visual' },
                        { href: '/checkout-dropi', icon: '🛒', label: 'Checkout Dropi' },
                        { href: '/upsell', icon: '💎', label: 'Upsell & Bundles' },
                        { href: '/buyer-persona', icon: '🧠', label: 'Buyer Persona' },
                        { href: '/lanzar', icon: '🚀', label: 'Lanzar Producto' },
                      ].map(a => (
                        <Link key={a.href} href={a.href}
                          className="flex items-center gap-2 p-2.5 rounded-xl border border-white/8 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all">
                          <span className="text-sm">{a.icon}</span>
                          <p className="text-white/60 text-xs font-medium">{a.label}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="card p-4 mt-5 border border-violet-500/20 bg-violet-500/5">
          <p className="text-xs text-violet-300 font-bold mb-1">💡 Módulo central de productos</p>
          <p className="text-xs text-white/40">Todos los módulos de la app (Campaña, Creativo Visual, Checkout, Buyer Persona) leen los datos de este registro. Cargás una vez — usás en todos lados sin repetir información.</p>
        </div>
      </main>
    </div>
  )
}
