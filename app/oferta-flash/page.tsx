'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { PAISES, formatPrecio, type Pais } from '@/lib/constants'

type OfertaFlashOutput = {
  nombre_oferta: string
  duracion: string
  descuento_real: string
  mecanismo_urgencia: string
  secuencia_whatsapp: Array<{
    momento: string
    tipo: string
    mensaje: string
    nota: string
  }>
  copy_anuncio_meta: {
    hook: string
    cuerpo: string
    cta: string
    variante_b: string
  }
  copy_imagen: {
    headline: string
    subheadline: string
    precio_normal: string
    precio_oferta: string
    deadline: string
    badge: string
  }
  script_vendedor: {
    apertura: string
    cuando_duda: string
    cierre: string
  }
  checklist_lanzamiento: string[]
}

async function generateOfertaFlash(
  producto: string,
  precioNormal: string,
  precioOferta: string,
  evento: string,
  duracionHoras: number,
  beneficio: string,
  pais: Pais
): Promise<OfertaFlashOutput> {
  const cfg = PAISES[pais]
  const prompt = `Sos un experto en ventas de alta conversión para dropshipping COD en ${cfg.nombre}. Especializado en crear ofertas flash de 24-72hs que generan urgencia REAL y duplican las ventas en ese período.

PRODUCTO: ${producto}
PRECIO NORMAL: ${precioNormal}
PRECIO DE OFERTA: ${precioOferta}
EVENTO/OCASIÓN: ${evento}
DURACIÓN: ${duracionHoras} horas
BENEFICIO PRINCIPAL: ${beneficio}
MERCADO: ${cfg.nombre} (${cfg.contexto_cultural.split('.')[0]})

PRINCIPIOS DE URGENCIA REAL (no falsa):
1. La urgencia debe ser CREÍBLE — "quedan 23 unidades" cuando tenés 23 unidades
2. El deadline debe ser REAL — si decís 48hs, cortá la oferta en 48hs
3. El descuento debe verse SIGNIFICATIVO — mínimo 30% de diferencia visual
4. El beneficio extra debe ser TANGIBLE — no solo precio, agregar algo

Respondé SOLO con JSON válido:
{
  "nombre_oferta": "nombre llamativo de la oferta",
  "duracion": "${duracionHoras} horas",
  "descuento_real": "porcentaje de descuento calculado",
  "mecanismo_urgencia": "mecanismo específico de urgencia para este producto y evento",
  "secuencia_whatsapp": [
    {
      "momento": "H-0: Al lanzar la oferta",
      "tipo": "Lanzamiento",
      "mensaje": "mensaje completo listo para copiar con emojis apropiados y máx 3 párrafos",
      "nota": "tip de envío o actuación del vendedor"
    },
    {"momento": "H-12: Mitad de la oferta", "tipo": "Seguimiento", "mensaje": "...", "nota": "..."},
    {"momento": "H-24: Últimas horas", "tipo": "Urgencia final", "mensaje": "...", "nota": "..."},
    {"momento": "H-47: Último aviso", "tipo": "Cierre definitivo", "mensaje": "...", "nota": "..."}
  ],
  "copy_anuncio_meta": {
    "hook": "primer párrafo del anuncio — gancho de 1-2 líneas que para el scroll",
    "cuerpo": "cuerpo del anuncio con el beneficio + urgencia + precio",
    "cta": "llamada a la acción",
    "variante_b": "versión alternativa del hook para testear"
  },
  "copy_imagen": {
    "headline": "texto grande para la imagen del anuncio (max 5 palabras)",
    "subheadline": "subtítulo (max 8 palabras)",
    "precio_normal": "precio normal con tachado (ej: ~~${precioNormal}~~)",
    "precio_oferta": "${precioOferta}",
    "deadline": "texto de deadline para la imagen (ej: Solo hasta el domingo 23:59hs)",
    "badge": "badge de urgencia (ej: ¡ÚLTIMAS 15 UNIDADES!)"
  },
  "script_vendedor": {
    "apertura": "qué decir cuando llega un lead durante la oferta flash",
    "cuando_duda": "qué decir cuando el cliente dice 'lo voy a pensar'",
    "cierre": "script de cierre específico para la oferta con deadline real"
  },
  "checklist_lanzamiento": [
    "acción específica 1 antes de lanzar la oferta",
    "acción 2", "acción 3", "acción 4", "acción 5"
  ]
}`

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  const data = await res.json()
  const raw: string = data.text || ''
  let clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const s = clean.indexOf('{'), e = clean.lastIndexOf('}')
  if (s >= 0 && e > s) clean = clean.slice(s, e + 1)
  return JSON.parse(clean) as OfertaFlashOutput
}

const EVENTOS_POR_PAIS: Record<Pais, string[]> = {
  PY: ['San Juan (Junio)','Noche Buena','Día de la Madre','Día del Padre','Black Friday','Cyber Monday','Liquidación de stock','Aniversario del negocio','Fin de semana largo','Lluvia de verano (promo fría)'],
  CO: ['Amor y Amistad','Día de la Madre','Día del Padre','Black Friday','Cyber Lunes','Temporada Navideña','Feria de Cali','Día de los Reyes','Liquidación de enero','Fin de semana largo'],
  MX: ['Buen Fin','Día de Muertos','Día de la Madre','El Grito','Black Friday','Navidad','Día de Reyes','San Valentín','Liquidación','Hot Sale'],
}

function CopyBlock({ title, content }: { title: string; content: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="bg-white/3 rounded-xl p-3 border border-white/8">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">{title}</p>
        <button onClick={() => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
          className="text-[10px] text-violet-400 px-2 py-1 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 transition-colors">
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>
      </div>
      <p className="text-white/75 text-xs leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  )
}

export default function OfertaFlashPage() {
  const [pais, setPais] = useState<Pais>('PY')
  const [producto, setProducto] = useState('')
  const [precioNormal, setPrecioNormal] = useState('')
  const [precioOferta, setPrecioOferta] = useState('')
  const [evento, setEvento] = useState('')
  const [duracion, setDuracion] = useState(48)
  const [beneficio, setBeneficio] = useState('')
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState<OfertaFlashOutput | null>(null)
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState('whatsapp')

  const cfg = PAISES[pais]
  const eventos = EVENTOS_POR_PAIS[pais]

  const handleGenerate = async () => {
    if (!producto || !precioNormal || !precioOferta) { setError('Completá producto y precios'); return }
    setLoading(true); setError(''); setOutput(null)
    try {
      const r = await generateOfertaFlash(producto, precioNormal, precioOferta, evento || 'Oferta especial', duracion, beneficio, pais)
      setOutput(r)
      setActiveSection('whatsapp')
    } catch (e) { setError('Error generando la oferta. Intentá de nuevo.'); console.error(e) }
    setLoading(false)
  }

  const sections = ['whatsapp','meta','imagen','vendedor','checklist']
  const sectionLabels: Record<string, string> = { whatsapp:'💬 WhatsApp', meta:'📱 Meta Ad', imagen:'🖼️ Imagen', vendedor:'🗣️ Script', checklist:'✅ Checklist' }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-5">
          <Link href="/crear" className="text-white/30 hover:text-white/60 text-sm transition-colors">← Herramientas</Link>
          <h1 className="text-2xl font-bold text-white mt-2">⚡ Oferta Flash</h1>
          <p className="text-white/40 text-sm mt-1">Secuencia completa para ofertas de 24-72hs — WhatsApp + Meta Ads + Script</p>
        </div>

        <div className="card p-3 border border-amber-500/20 bg-amber-500/5 mb-5">
          <p className="text-amber-300 text-xs font-bold mb-1">💡 Las ofertas flash bien ejecutadas convierten 2-3x más</p>
          <p className="text-white/40 text-xs">La clave: urgencia REAL (deadline fijo) + descuento VISIBLE (30%+) + comunicación en cascada.</p>
        </div>

        {!output ? (
          <div className="space-y-3">
            {/* País */}
            <div className="flex gap-2">
              {Object.values(PAISES).map(p => (
                <button key={p.codigo} onClick={() => setPais(p.codigo as Pais)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${pais === p.codigo ? 'border-red-500/40 bg-red-500/10 text-white' : 'border-white/8 bg-white/3 text-white/40'}`}>
                  {p.bandera} {p.nombre}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Producto *</label>
              <input value={producto} onChange={e => setProducto(e.target.value)}
                className="input text-sm" placeholder="ej: Faja moldeadora postparto" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Precio normal ({cfg.simbolo})</label>
                <input value={precioNormal} onChange={e => setPrecioNormal(e.target.value)}
                  className="input text-sm" placeholder={String(Math.round(cfg.precio_min * 1.8))} />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Precio oferta ({cfg.simbolo})</label>
                <input value={precioOferta} onChange={e => setPrecioOferta(e.target.value)}
                  className="input text-sm" placeholder={String(Math.round(cfg.precio_min * 1.3))} />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Evento / Ocasión</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {eventos.slice(0,6).map(ev => (
                  <button key={ev} onClick={() => setEvento(ev)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${evento === ev ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'border-white/8 bg-white/3 text-white/50 hover:text-white/70'}`}>
                    {ev}
                  </button>
                ))}
              </div>
              <input value={evento} onChange={e => setEvento(e.target.value)}
                className="input text-sm" placeholder="O escribí tu propio evento..." />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Beneficio principal</label>
              <input value={beneficio} onChange={e => setBeneficio(e.target.value)}
                className="input text-sm" placeholder="ej: Reduce 5-10 cm de cintura en 30 días" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-white/40">Duración de la oferta</label>
                <span className="text-white font-bold">{duracion} horas</span>
              </div>
              <input type="range" min="24" max="72" step="24" value={duracion} onChange={e => setDuracion(Number(e.target.value))} className="w-full accent-red-500" />
              <div className="flex justify-between text-[10px] text-white/20 mt-1"><span>24hs</span><span>48hs</span><span>72hs</span></div>
            </div>

            {error && <p className="text-red-400 text-xs bg-red-500/10 rounded-xl p-3">{error}</p>}

            <button onClick={handleGenerate} disabled={loading || !producto || !precioNormal || !precioOferta}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:from-red-500 hover:to-orange-500 transition-all">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generando oferta flash...
                </span>
              ) : `⚡ Generar oferta flash de ${duracion}hs`}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold">⚡ {output.nombre_oferta}</p>
                <p className="text-white/40 text-xs">{output.duracion} · {output.descuento_real} · {output.mecanismo_urgencia}</p>
              </div>
              <button onClick={() => setOutput(null)} className="text-xs text-white/40 hover:text-white/70 px-3 py-1.5 rounded-xl bg-white/5">← Nueva</button>
            </div>

            {/* Section tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {sections.map(s => (
                <button key={s} onClick={() => setActiveSection(s)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeSection === s ? 'bg-red-600/30 text-red-300 border border-red-500/30' : 'bg-white/5 text-white/40 hover:text-white/60'}`}>
                  {sectionLabels[s]}
                </button>
              ))}
            </div>

            {/* WhatsApp sequence */}
            {activeSection === 'whatsapp' && (
              <div className="space-y-3">
                <p className="text-white/50 text-xs font-bold uppercase">Secuencia de WhatsApp ({output.secuencia_whatsapp?.length} mensajes)</p>
                {output.secuencia_whatsapp?.map((m, i) => (
                  <CopyBlock key={i} title={`${m.momento} — ${m.tipo}`} content={m.mensaje + (m.nota ? `\n\n💡 ${m.nota}` : '')} />
                ))}
              </div>
            )}

            {/* Meta ad */}
            {activeSection === 'meta' && output.copy_anuncio_meta && (
              <div className="space-y-3">
                <CopyBlock title="Hook (variante A)" content={output.copy_anuncio_meta.hook} />
                <CopyBlock title="Hook (variante B — testear)" content={output.copy_anuncio_meta.variante_b} />
                <CopyBlock title="Cuerpo del anuncio" content={output.copy_anuncio_meta.cuerpo} />
                <CopyBlock title="CTA" content={output.copy_anuncio_meta.cta} />
              </div>
            )}

            {/* Imagen */}
            {activeSection === 'imagen' && output.copy_imagen && (
              <div className="space-y-3">
                <div className="card p-5 border border-red-500/20 bg-red-500/5 text-center">
                  <div className="inline-block bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full mb-2">{output.copy_imagen.badge}</div>
                  <p className="text-white text-2xl font-black mb-1">{output.copy_imagen.headline}</p>
                  <p className="text-white/60 text-sm mb-3">{output.copy_imagen.subheadline}</p>
                  <p className="text-white/40 text-lg line-through mb-1">{output.copy_imagen.precio_normal}</p>
                  <p className="text-emerald-400 text-4xl font-black">{output.copy_imagen.precio_oferta}</p>
                  <p className="text-amber-400 text-xs mt-2">⏰ {output.copy_imagen.deadline}</p>
                </div>
                <p className="text-white/30 text-xs text-center">Preview de la imagen del anuncio — usá estos textos en Canva o CapCut</p>
              </div>
            )}

            {/* Script vendedor */}
            {activeSection === 'vendedor' && output.script_vendedor && (
              <div className="space-y-3">
                <CopyBlock title="Apertura — cuando llega el lead" content={output.script_vendedor.apertura} />
                <CopyBlock title="Cuando dice 'lo voy a pensar'" content={output.script_vendedor.cuando_duda} />
                <CopyBlock title="Cierre con deadline real" content={output.script_vendedor.cierre} />
              </div>
            )}

            {/* Checklist */}
            {activeSection === 'checklist' && output.checklist_lanzamiento && (
              <div className="card p-4 border border-white/10 space-y-2">
                <p className="text-white font-bold text-sm mb-3">✅ Checklist antes de lanzar</p>
                {output.checklist_lanzamiento.map((item, i) => (
                  <label key={i} className="flex items-start gap-2 cursor-pointer group">
                    <input type="checkbox" className="mt-0.5 accent-red-500" />
                    <span className="text-white/70 text-xs leading-relaxed group-hover:text-white/90 transition-colors">{item}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
