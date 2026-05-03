'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

type CheckoutOutput = {
  nombre_producto: string
  subtitulo_gancho: string
  precio_original: string
  precio_oferta: string
  descripcion_breve: string
  descripcion_completa: string
  bullets_beneficios: string[]
  que_incluye: string[]
  garantia: string
  preguntas_frecuentes: Array<{ pregunta: string; respuesta: string }>
  instrucciones_uso: string
  aviso_cuidado: string
  texto_cta: string
  texto_urgencia: string
  seo_tags: string[]
  campo_comentarios_hint: string
}

async function callClaude(data: Record<string, string>): Promise<CheckoutOutput> {
    const prompt = `Sos un experto en copywriting de checkout para dropshipping COD en Paraguay con Dropi. Tu especialidad es escribir descripciones que conviertan visitantes en compradores en el momento final — cuando el cliente ya está en la página del producto y está a punto de llenar su nombre y teléfono.

PRODUCTO: ${data.producto}
BENEFICIO PRINCIPAL: ${data.beneficio}
PRECIO DE VENTA: Gs. ${data.precio_venta}
PRECIO TACHADO: Gs. ${data.precio_tachado || Math.round(parseInt(data.precio_venta || '0') * 1.7)}
CATEGORÍA: ${data.categoria}
AUDIENCIA: ${data.audiencia}
NOTAS ADICIONALES: ${data.notas || 'ninguna'}

CONTEXTO DROPI PARAGUAY:
- El checkout es COD (pago contra entrega al cartero)
- El cliente llena solo: nombre, apellido, teléfono, ciudad, dirección
- No hay tarjeta de crédito — esto reduce la fricción a casi cero
- La garantía debe ser específica para COD (no "30 días de devolución" sino algo real como "si llegó roto, te mandamos uno nuevo")
- El copywriting debe ser en español paraguayo natural (no corporativo)
- Las FAQ deben anticipar las 5 preguntas que más hace el cliente paraguayo antes de comprar

Generá el contenido completo del checkout de Dropi. Respondé SOLO con JSON válido:
{
  "nombre_producto": "nombre comercial atractivo que va como título del producto",
  "subtitulo_gancho": "subtítulo de 1 línea que refuerza el beneficio principal — máx 60 chars",
  "precio_original": "Gs. ${data.precio_tachado || Math.round(parseInt(data.precio_venta || '0') * 1.7).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}",
  "precio_oferta": "Gs. ${data.precio_venta ? data.precio_venta.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}",
  "descripcion_breve": "1-2 oraciones de máx 100 chars que aparecen arriba del precio — el gancho más corto",
  "descripcion_completa": "3-4 párrafos conversacionales en español paraguayo. Habla del problema, la solución, por qué funciona y por qué comprarlo ahora. Sin bullet points — prosa natural.",
  "bullets_beneficios": ["beneficio 1 concreto y específico", "beneficio 2", "beneficio 3", "beneficio 4", "beneficio 5"],
  "que_incluye": ["item 1 del paquete", "item 2", "item 3"],
  "garantia": "texto de garantía específico para COD Paraguay — honesto y tranquilizador",
  "preguntas_frecuentes": [
    { "pregunta": "¿Cómo funciona el pago?", "respuesta": "respuesta específica para COD Paraguay" },
    { "pregunta": "¿Cuánto tarda en llegar?", "respuesta": "..." },
    { "pregunta": "¿Es original/de calidad?", "respuesta": "..." },
    { "pregunta": "¿Envían a mi ciudad?", "respuesta": "..." },
    { "pregunta": "¿Qué pasa si no me gusta?", "respuesta": "..." }
  ],
  "instrucciones_uso": "cómo usar el producto — breve y claro",
  "aviso_cuidado": "instrucción de cuidado o advertencia si aplica",
  "texto_cta": "texto del botón de compra que maximiza conversión — no 'Comprar' sino algo más poderoso",
  "texto_urgencia": "1 línea de urgencia genuina para mostrar cerca del CTA — stock, tiempo, oferta",
  "seo_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "campo_comentarios_hint": "placeholder del campo de comentarios del checkout — qué pedirle al cliente que escriba"
}`

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  })
  const d = await res.json()
  const text = d.content[0].text
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}

export default function CheckoutDropiPage() {
  const [form, setForm] = useState({ producto: '', beneficio: '', precio_venta: '', precio_tachado: '', categoria: 'general', audiencia: '', notas: '' })
  const [output, setOutput] = useState<CheckoutOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [tab, setTab] = useState<'ficha'|'desc'|'faq'|'copy'>('ficha')

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleGenerate = async () => {
    if (!form.producto) return
    setLoading(true)
    try { const r = await callClaude(form); setOutput(r); setTab('ficha') }
    catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1800)
  }

  const CopyBtn = ({ k, text }: { k: string; text: string }) => (
    <button onClick={() => copy(k, text)}
      className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-emerald-500/30 text-white/30 hover:text-white text-xs transition-all flex-shrink-0">
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
            <Link href="/dropi" className="text-white/30 hover:text-white/60 text-sm">Dropi PY</Link>
            <span className="text-white/20">›</span>
            <span className="text-white/60 text-sm">Checkout</span>
          </div>
          <h1 className="text-2xl font-bold text-white">🛒 Checkout Dropi Completo</h1>
          <p className="text-white/40 text-sm mt-1">Todos los campos del producto Dropi — listos para copiar y pegar</p>
        </div>

        {/* Info banner */}
        <div className="card p-3 border border-blue-500/20 bg-blue-500/5 mb-5 flex items-start gap-2">
          <span className="text-blue-400 text-sm flex-shrink-0">ℹ️</span>
          <p className="text-blue-300/70 text-xs">Genera título, subtítulo, descripción, bullets, FAQ, garantía y el botón de compra optimizados para el checkout de Dropi Paraguay.</p>
        </div>

        <div className="card p-5 mb-5 border border-white/8">
          <div className="space-y-3">
            <div>
              <label className={lc}>Producto</label>
              <input className={ic} placeholder="ej. Masajeador de cuello eléctrico con calor" value={form.producto} onChange={e => set('producto', e.target.value)} />
            </div>
            <div>
              <label className={lc}>Beneficio principal / ¿qué problema resuelve?</label>
              <input className={ic} placeholder="ej. Alivia el dolor de cuello y cervical en 15 minutos" value={form.beneficio} onChange={e => set('beneficio', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lc}>Precio de venta (Gs.)</label>
                <input className={ic} type="number" placeholder="157000" value={form.precio_venta} onChange={e => set('precio_venta', e.target.value)} />
              </div>
              <div>
                <label className={lc}>Precio tachado (Gs.)</label>
                <input className={ic} type="number" placeholder="247000" value={form.precio_tachado} onChange={e => set('precio_tachado', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lc}>Categoría</label>
                <select className={ic} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                  {['salud','belleza','hogar','fitness','tecnologia','ropa','general'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={lc}>Audiencia objetivo</label>
                <input className={ic} placeholder="ej. Mujeres 30-50" value={form.audiencia} onChange={e => set('audiencia', e.target.value)} />
              </div>
            </div>
            <div>
              <label className={lc}>Notas adicionales (opcional)</label>
              <input className={ic} placeholder="ej. Viene en 3 colores, talla única, incluye cargador USB" value={form.notas} onChange={e => set('notas', e.target.value)} />
            </div>
            <button onClick={handleGenerate} disabled={!form.producto || !form.beneficio || loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-sm transition-all">
              {loading ? '⏳ Generando checkout...' : '🛒 Generar checkout completo'}
            </button>
          </div>
        </div>

        {output && (
          <>
            {/* Precio preview */}
            <div className="card p-4 border border-emerald-500/20 bg-emerald-500/5 mb-4">
              <p className="text-white/40 text-xs mb-2">Vista previa del precio</p>
              <div className="flex items-center gap-3">
                <p className="text-white/30 text-sm line-through">{output.precio_original}</p>
                <p className="text-emerald-400 text-2xl font-black">{output.precio_oferta}</p>
              </div>
              <p className="text-white font-bold mt-1">{output.nombre_producto}</p>
              <p className="text-white/50 text-sm">{output.subtitulo_gancho}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 p-1 bg-white/5 rounded-xl overflow-x-auto">
              {([['ficha','📋 Ficha'],['desc','📝 Descripción'],['faq','❓ FAQ'],['copy','🎯 CTA & Copy']]).map(([k,l]) => (
                <button key={k} onClick={() => setTab(k)}
                  className={`flex-shrink-0 flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === k ? 'bg-violet-600 text-white' : 'text-white/40'}`}>{l}</button>
              ))}
            </div>

            {tab === 'ficha' && (
              <div className="space-y-3">
                {[
                  { label: 'Nombre del producto (título)', value: output.nombre_producto },
                  { label: 'Subtítulo gancho', value: output.subtitulo_gancho },
                  { label: 'Descripción breve', value: output.descripcion_breve },
                  { label: 'Instrucciones de uso', value: output.instrucciones_uso },
                  { label: 'Garantía', value: output.garantia },
                  { label: 'Aviso / cuidado', value: output.aviso_cuidado },
                ].map((item, i) => (
                  <div key={i} className="card p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/40 text-xs font-bold">{item.label}</p>
                      <CopyBtn k={`ficha-${i}`} text={item.value} />
                    </div>
                    <p className="text-white/80 text-sm">{item.value}</p>
                  </div>
                ))}

                <div className="card p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/40 text-xs font-bold">Beneficios (bullets)</p>
                    <CopyBtn k="bullets" text={output.bullets_beneficios.map(b => `• ${b}`).join('\n')} />
                  </div>
                  {output.bullets_beneficios.map((b, i) => (
                    <p key={i} className="text-white/80 text-sm mb-1">✓ {b}</p>
                  ))}
                </div>

                <div className="card p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/40 text-xs font-bold">Qué incluye</p>
                    <CopyBtn k="incluye" text={output.que_incluye.join('\n')} />
                  </div>
                  {output.que_incluye.map((item, i) => (
                    <p key={i} className="text-white/80 text-sm mb-1">📦 {item}</p>
                  ))}
                </div>

                <div className="card p-4 border border-white/10">
                  <p className="text-white/40 text-xs font-bold mb-2">Tags / palabras clave</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {output.seo_tags.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'desc' && (
              <div className="card p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/40 text-xs font-bold">Descripción completa</p>
                  <CopyBtn k="desc" text={output.descripcion_completa} />
                </div>
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{output.descripcion_completa}</p>
              </div>
            )}

            {tab === 'faq' && (
              <div className="space-y-3">
                {output.preguntas_frecuentes.map((faq, i) => (
                  <div key={i} className="card p-4 border border-white/10">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white font-bold text-sm mb-2">❓ {faq.pregunta}</p>
                      <CopyBtn k={`faq-${i}`} text={`${faq.pregunta}\n${faq.respuesta}`} />
                    </div>
                    <p className="text-white/60 text-sm">{faq.respuesta}</p>
                  </div>
                ))}
                <button onClick={() => copy('all-faq', output.preguntas_frecuentes.map(f => `❓ ${f.pregunta}\n${f.respuesta}`).join('\n\n'))}
                  className="w-full py-2.5 rounded-xl border border-white/10 hover:border-violet-500/30 text-white/40 hover:text-white text-sm font-medium transition-all">
                  {copied === 'all-faq' ? '✅ Copiado' : '📋 Copiar todas las FAQ'}
                </button>
              </div>
            )}

            {tab === 'copy' && (
              <div className="space-y-3">
                {[
                  { label: 'Texto del botón CTA', value: output.texto_cta, icon: '👆' },
                  { label: 'Texto de urgencia', value: output.texto_urgencia, icon: '⏰' },
                  { label: 'Hint campo comentarios', value: output.campo_comentarios_hint, icon: '💬' },
                ].map((item, i) => (
                  <div key={i} className="card p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/40 text-xs font-bold">{item.icon} {item.label}</p>
                      <CopyBtn k={`cta-${i}`} text={item.value} />
                    </div>
                    <p className="text-white font-bold text-sm">{item.value}</p>
                  </div>
                ))}

                {/* Botón copiar todo */}
                <button onClick={() => copy('todo', [
                  `TÍTULO: ${output.nombre_producto}`,
                  `SUBTÍTULO: ${output.subtitulo_gancho}`,
                  `PRECIO ORIGINAL: ${output.precio_original}`,
                  `PRECIO OFERTA: ${output.precio_oferta}`,
                  `\nDESCRIPCIÓN BREVE:\n${output.descripcion_breve}`,
                  `\nDESCRIPCIÓN COMPLETA:\n${output.descripcion_completa}`,
                  `\nBENEFICIOS:\n${output.bullets_beneficios.map(b => `• ${b}`).join('\n')}`,
                  `\nQUÉ INCLUYE:\n${output.que_incluye.join('\n')}`,
                  `\nGARANTÍA:\n${output.garantia}`,
                  `\nFAQ:\n${output.preguntas_frecuentes.map(f => `${f.pregunta}\n${f.respuesta}`).join('\n\n')}`,
                  `\nCTA: ${output.texto_cta}`,
                  `URGENCIA: ${output.texto_urgencia}`,
                ].join('\n'))}
                  className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all">
                  {copied === 'todo' ? '✅ Copiado todo' : '📋 Copiar todo el checkout'}
                </button>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href="/sourcing" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-white/20 transition-all">
                <span>📦</span><div><p className="text-white text-xs font-bold">Sourcing</p><p className="text-white/30 text-[10px]">Evaluar y calcular</p></div>
              </Link>
              <Link href="/landing" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-white/20 transition-all">
                <span>🏠</span><div><p className="text-white text-xs font-bold">Landing Page</p><p className="text-white/30 text-[10px]">Generar landing</p></div>
              </Link>
              <Link href="/upsell" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-violet-500/30 transition-all">
                <span>💎</span><div><p className="text-white text-xs font-bold">Upsell & Bundles</p><p className="text-white/30 text-[10px]">+30% ticket promedio</p></div>
              </Link>
              <Link href="/campana" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-violet-500/30 transition-all">
                <span>⚡</span><div><p className="text-white text-xs font-bold">Campaña Completa</p><p className="text-white/30 text-[10px]">Generar creativos</p></div>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
