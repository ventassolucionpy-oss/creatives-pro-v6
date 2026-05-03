'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { PAISES, type Pais } from '@/lib/constants'

type UGCReviewOutput = {
  nombre_del_estilo: string
  duracion_ideal: string
  estructura: Array<{ segundo: string; accion: string; texto_en_pantalla?: string; nota: string }>
  guion_completo: string
  instrucciones_grabacion: Array<{ aspecto: string; instruccion: string; ejemplo: string }>
  checklist_antes_grabar: string[]
  mensaje_whatsapp_solicitar: string
  mensaje_followup_si_no_grabo: string
  tips_edicion: string[]
  variante_b: string
}

async function generateUGCReview(
  producto: string,
  beneficio: string,
  duracion: number,
  estilo: string,
  pais: Pais
): Promise<UGCReviewOutput> {
  const cfg = PAISES[pais]
  const prompt = `Sos un experto en producción UGC (User Generated Content) para dropshipping COD en ${cfg.nombre}. Tu especialidad es crear scripts de reseña que se ven 100% auténticos y logran que los clientes graben un video real sin guion aparente.

PRODUCTO: ${producto}
BENEFICIO PRINCIPAL: ${beneficio}
DURACIÓN OBJETIVO: ${duracion} segundos
ESTILO: ${estilo}
MERCADO: ${cfg.nombre}

REGLAS DE UN BUEN VIDEO DE RESEÑA UGC:
1. Tiene que verse REAL, no guionado — fluido y natural
2. El cliente habla del ANTES vs DESPUÉS — no del producto en sí
3. Debe incluir el producto en uso real, no posado
4. El contexto hogareño aumenta credibilidad (cocina, baño, habitación)
5. Sin música de fondo rara — silencio o ruido ambiente natural
6. La persona debe verse como alguien del mercado objetivo, no como influencer
7. Máx 3 puntos clave — más de 3 confunde y el video pierde foco
8. El momento más poderoso: la transformación real visible

Respondé SOLO con JSON válido:
{
  "nombre_del_estilo": "nombre descriptivo del estilo de este video",
  "duracion_ideal": "${duracion} segundos",
  "estructura": [
    {"segundo": "0-3s", "accion": "qué hace el creador", "texto_en_pantalla": "texto opcional para overlay", "nota": "tip de dirección"},
    {"segundo": "3-10s", "accion": "...", "nota": "..."},
    {"segundo": "10-25s", "accion": "...", "nota": "..."},
    {"segundo": "25-${duracion}s", "accion": "...", "nota": "..."}
  ],
  "guion_completo": "guion completo palabra por palabra — escrito como habla un cliente real en ${cfg.nombre}, sin frases corporativas. Máx ${duracion} segundos de lectura.",
  "instrucciones_grabacion": [
    {"aspecto": "Iluminación", "instruccion": "instrucción específica", "ejemplo": "ejemplo concreto"},
    {"aspecto": "Ángulo de cámara", "instruccion": "...", "ejemplo": "..."},
    {"aspecto": "Fondo", "instruccion": "...", "ejemplo": "..."},
    {"aspecto": "Ropa", "instruccion": "...", "ejemplo": "..."},
    {"aspecto": "Expresión", "instruccion": "...", "ejemplo": "..."}
  ],
  "checklist_antes_grabar": [
    "cosa 1 que el creador debe tener/hacer antes de grabar",
    "cosa 2", "cosa 3", "cosa 4"
  ],
  "mensaje_whatsapp_solicitar": "mensaje completo para enviar al cliente 7 días después de recibir el producto pidiéndole que grabe el video — natural, no corporativo, con el guion adjunto al mensaje",
  "mensaje_followup_si_no_grabo": "mensaje de seguimiento 3 días después si no grabó — amigable, con pequeño incentivo",
  "tips_edicion": [
    "tip 1 para editar el video en CapCut para que se vea más real",
    "tip 2", "tip 3"
  ],
  "variante_b": "guion alternativo con ángulo diferente — para tener dos opciones"
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
  return JSON.parse(clean) as UGCReviewOutput
}

const ESTILOS = [
  { id: 'testimonio-directo', label: '🗣️ Testimonio directo', desc: 'Cliente habla a cámara sobre su experiencia' },
  { id: 'antes-despues', label: '↔️ Antes vs Después', desc: 'Muestra el problema y la solución real' },
  { id: 'unboxing-reaccion', label: '📦 Unboxing + reacción', desc: 'Abre el paquete en cámara con reacción genuina' },
  { id: 'demostracion-uso', label: '👐 Demostración de uso', desc: 'Muestra cómo se usa en situación real' },
  { id: 'review-detallada', label: '🔍 Review detallada', desc: 'Revisa el producto con pros y contras reales' },
]

function CopyBtn({ content, label = 'Copiar' }: { content: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className="text-[10px] text-violet-400 px-2 py-1 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 transition-colors flex-shrink-0">
      {copied ? '✓' : label}
    </button>
  )
}

export default function UGCReviewPage() {
  const [pais, setPais] = useState<Pais>('PY')
  const [producto, setProducto] = useState('')
  const [beneficio, setBeneficio] = useState('')
  const [duracion, setDuracion] = useState(45)
  const [estilo, setEstilo] = useState('testimonio-directo')
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState<UGCReviewOutput | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'guion'|'instrucciones'|'mensajes'|'edicion'>('guion')

  const handleGenerate = async () => {
    if (!producto.trim()) { setError('Ingresá el producto'); return }
    setLoading(true); setError(''); setOutput(null)
    try {
      const r = await generateUGCReview(producto, beneficio, duracion, estilo, pais)
      setOutput(r)
      setTab('guion')
    } catch (e) { setError('Error generando el guion.'); console.error(e) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-5">
          <Link href="/crear" className="text-white/30 hover:text-white/60 text-sm transition-colors">← Herramientas</Link>
          <h1 className="text-2xl font-bold text-white mt-2">⭐ UGC Review Scripts</h1>
          <p className="text-white/40 text-sm mt-1">Guiones de reseña para videos de clientes reales + mensaje para pedirlos</p>
        </div>

        <div className="card p-3 border border-blue-500/15 bg-blue-500/5 mb-5">
          <p className="text-blue-300 text-xs font-bold mb-1">💡 Los testimonios en video aumentan conversión hasta 60%</p>
          <p className="text-white/40 text-xs">En mercados COD donde hay desconfianza, ver a una persona real usando el producto baja la fricción de compra drásticamente.</p>
        </div>

        {!output ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              {Object.values(PAISES).map(p => (
                <button key={p.codigo} onClick={() => setPais(p.codigo as Pais)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${pais === p.codigo ? 'border-violet-500/50 bg-violet-500/15 text-white' : 'border-white/8 bg-white/3 text-white/40'}`}>
                  {p.bandera} {p.nombre}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Producto *</label>
              <input value={producto} onChange={e => setProducto(e.target.value)}
                className="input text-sm" placeholder="ej: Faja moldeadora postparto" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Beneficio principal</label>
              <input value={beneficio} onChange={e => setBeneficio(e.target.value)}
                className="input text-sm" placeholder="ej: Reduce 5-10 cm de cintura sin cirugía" />
            </div>

            {/* Estilo */}
            <div>
              <label className="text-xs text-white/40 mb-2 block">Estilo del video</label>
              <div className="space-y-2">
                {ESTILOS.map(e => (
                  <button key={e.id} onClick={() => setEstilo(e.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${estilo === e.id ? 'border-violet-500/50 bg-violet-500/10' : 'border-white/8 bg-white/3 hover:border-white/15'}`}>
                    <p className="text-white text-xs font-medium">{e.label}</p>
                    <p className="text-white/35 text-[11px]">{e.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Duración */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-white/40">Duración objetivo</label>
                <span className="text-white font-bold">{duracion} segundos</span>
              </div>
              <input type="range" min="15" max="90" step="15" value={duracion} onChange={e => setDuracion(Number(e.target.value))} className="w-full accent-violet-500" />
              <div className="flex justify-between text-[10px] text-white/20 mt-1">
                <span>15s (TikTok)</span><span>45s (óptimo)</span><span>90s (YT Short)</span>
              </div>
            </div>

            {error && <p className="text-red-400 text-xs bg-red-500/10 rounded-xl p-3">{error}</p>}

            <button onClick={handleGenerate} disabled={loading || !producto.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-600 to-amber-600 text-white font-bold text-sm disabled:opacity-40 hover:from-yellow-500 hover:to-amber-500 transition-all">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generando guion UGC...
                </span>
              ) : '⭐ Generar guion de reseña UGC'}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-sm">{output.nombre_del_estilo}</p>
                <p className="text-white/40 text-xs">{output.duracion_ideal}</p>
              </div>
              <button onClick={() => setOutput(null)} className="text-xs text-white/40 hover:text-white/70 px-3 py-1.5 rounded-xl bg-white/5">← Nueva</button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {[{id:'guion',l:'📝 Guion'},{id:'instrucciones',l:'🎬 Instrucciones'},{id:'mensajes',l:'💬 Mensajes WA'},{id:'edicion',l:'✂️ Edición'}].map(t => (
                <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${tab === t.id ? 'bg-amber-600/30 text-amber-300 border border-amber-500/30' : 'bg-white/5 text-white/40 hover:text-white/60'}`}>
                  {t.l}
                </button>
              ))}
            </div>

            {tab === 'guion' && (
              <div className="space-y-3">
                {/* Estructura */}
                {output.estructura?.length > 0 && (
                  <div className="card p-4 border border-white/8">
                    <p className="text-white/50 text-xs font-bold uppercase mb-3">Estructura del video</p>
                    <div className="space-y-3">
                      {output.estructura.map((e, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="text-[10px] text-violet-400 bg-violet-500/10 px-2 py-1 rounded-full h-fit flex-shrink-0">{e.segundo}</span>
                          <div>
                            <p className="text-white/80 text-xs font-medium">{e.accion}</p>
                            {e.texto_en_pantalla && <p className="text-violet-400/70 text-[10px] mt-0.5">Overlay: "{e.texto_en_pantalla}"</p>}
                            <p className="text-white/30 text-[10px] italic mt-0.5">{e.nota}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Guion completo */}
                <div className="card p-4 border border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-amber-300 text-xs font-bold">Guion completo (variante A)</p>
                    <CopyBtn content={output.guion_completo} label="Copiar guion" />
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{output.guion_completo}</p>
                </div>

                {/* Variante B */}
                {output.variante_b && (
                  <div className="card p-4 border border-white/8">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/50 text-xs font-bold">Guion variante B</p>
                      <CopyBtn content={output.variante_b} />
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">{output.variante_b}</p>
                  </div>
                )}
              </div>
            )}

            {tab === 'instrucciones' && (
              <div className="space-y-3">
                {output.instrucciones_grabacion?.map((inst, i) => (
                  <div key={i} className="card p-4 border border-white/8">
                    <p className="text-white font-medium text-xs mb-1">{inst.aspecto}</p>
                    <p className="text-white/60 text-xs mb-1">{inst.instruccion}</p>
                    <p className="text-violet-400/70 text-[10px] italic">{inst.ejemplo}</p>
                  </div>
                ))}
                {output.checklist_antes_grabar?.length > 0 && (
                  <div className="card p-4 border border-emerald-500/15">
                    <p className="text-emerald-400 text-xs font-bold mb-3">✅ Checklist antes de grabar</p>
                    {output.checklist_antes_grabar.map((item, i) => (
                      <label key={i} className="flex items-start gap-2 cursor-pointer mb-2">
                        <input type="checkbox" className="mt-0.5 accent-amber-500" />
                        <span className="text-white/70 text-xs">{item}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'mensajes' && (
              <div className="space-y-3">
                <div className="card p-4 border border-green-500/20 bg-green-500/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-green-400 text-xs font-bold">💬 Mensaje inicial (7 días post-entrega)</p>
                    <CopyBtn content={output.mensaje_whatsapp_solicitar} />
                  </div>
                  <p className="text-white/75 text-sm leading-relaxed whitespace-pre-line">{output.mensaje_whatsapp_solicitar}</p>
                </div>
                <div className="card p-4 border border-white/8">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/50 text-xs font-bold">🔄 Follow-up si no grabó (3 días después)</p>
                    <CopyBtn content={output.mensaje_followup_si_no_grabo} />
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">{output.mensaje_followup_si_no_grabo}</p>
                </div>
              </div>
            )}

            {tab === 'edicion' && output.tips_edicion?.length > 0 && (
              <div className="card p-4 border border-violet-500/15">
                <p className="text-violet-300 text-xs font-bold mb-3">✂️ Tips de edición en CapCut</p>
                <div className="space-y-2">
                  {output.tips_edicion.map((t, i) => (
                    <div key={i} className="flex gap-2 text-xs text-white/60">
                      <span className="text-violet-400 flex-shrink-0">•</span>{t}
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
