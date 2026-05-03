'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { getPaisConfig, PAISES } from '@/lib/constants'
import ProductSelector from '@/components/wizard/ProductSelector'
import ProductModal from '@/components/wizard/ProductModal'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Product } from '@/types'

type ModuleKey = 'copies' | 'ugc' | 'emails' | 'whatsapp' | 'audiencias' | 'prompts' | 'estrategia_meta'
type Phase = 'config' | 'generating' | 'results'
type CampaignOutput = {
  copies?: Array<{ id: number; framework: string; angulo: string; hook: string; titular: string; cuerpo: string; cta: string; por_que_funciona?: string; hashtags: string[] }>
  guionesUGC?: Array<{ id: number; tipo: string; hook_principal: string; guion: { apertura: { texto: string }; desarrollo: { texto: string }; cierre_cta: { texto: string } }; briefing_creador: string }>
  emailSequence?: Array<{ tipo: string; asunto: string; cuerpo: string; cuando_enviar: string }>
  whatsappSequence?: Array<{ tipo: string; mensaje: string; cuando_enviar: string }>
  audiencias?: Array<{ nombre: string; temperatura: string; descripcion: string; intereses: string[]; copy_recomendado: string }>
  prompts_visuales?: Array<{ uso: string; prompt: string; negativePrompt: string; ratio: string }>
  estrategia?: { estructura: string; presupuesto_minimo: string; cuando_escalar: string; kpi_principal: string }
  estrategia_meta?: {
    estructura_campana: string
    adsets: Array<{ nombre: string; temperatura: string; presupuesto_diario: string; audiencia: string; copy_recomendado: string; objetivo: string }>
    presupuesto_minimo: string
    cuando_escalar: string
    senales_apagar: string
    objetivo_primera_semana: string
    configuracion_pixel: string
    tip_dropi: string
  }
}

function autoPublico(p: Product, pais: string = 'PY'): string {
  // BUG FIX #6: Leer campos de audiencia del producto antes de hacer keyword matching
  // Los campos audiencia y beneficio_principal ya están en el schema de products
  if (p.audiencia && p.audiencia.length > 10) return p.audiencia
  
  const d = (p.description + ' ' + (p.beneficio_principal || '')).toLowerCase()
  
  if (p.category === 'digital') {
    if (d.match(/trading|finanzas|inversión|dinero/)) return 'Hombres y mujeres 25-45, interesados en finanzas e inversión, LATAM'
    if (d.match(/fitness|gym|ejercicio|musculo/)) return 'Hombres y mujeres 20-40, apasionados por el fitness, LATAM'
    if (d.match(/negocio|marketing|ventas|emprendimiento/)) return 'Emprendedores 22-45 que quieren escalar sus ventas, LATAM'
    return 'Personas 25-45 interesadas en crecimiento personal y resultados concretos, LATAM'
  }
  
  // Productos físicos - categorías expandidas
  if (d.match(/belleza|skin|crema|piel|cuidado facial|antiedad|serum/)) return 'Mujeres 25-50, interesadas en skincare y cuidado personal, ${pais === 'CO' ? 'Colombia' : pais === 'MX' ? 'México' : 'Paraguay'} y LATAM'
  if (d.match(/adelgazar|bajar de peso|dieta|quema grasa|silueta/)) return 'Mujeres y hombres 28-50 que quieren perder peso sin dejar de comer bien, ${pais === 'CO' ? 'Colombia' : pais === 'MX' ? 'México' : 'Paraguay'}'
  if (d.match(/dolor|espalda|cuello|articulación|rodilla|lumbar/)) return 'Adultos 35-65 con dolores crónicos de espalda o articulaciones, ${pais === 'CO' ? 'Colombia' : pais === 'MX' ? 'México' : 'Paraguay'}'
  if (d.match(/faja|moldeadora|cintura|abdomen/)) return 'Mujeres 25-50 que quieren lucir su figura y sentirse más seguras, ${pais === 'CO' ? 'Colombia' : pais === 'MX' ? 'México' : 'Paraguay'}'
  if (d.match(/pelo|cabello|caída|crecimiento|calvicie/)) return 'Hombres y mujeres 28-55 preocupados por la caída del cabello, ${pais === 'CO' ? 'Colombia' : pais === 'MX' ? 'México' : 'Paraguay'}'
  if (d.match(/tecnología|gadget|electrónico|usb|bluetooth/)) return 'Hombres 18-40, tech enthusiasts, ${pais === 'CO' ? 'Colombia' : pais === 'MX' ? 'México' : 'Paraguay'}'
  if (d.match(/mascota|perro|gato|animal/)) return 'Dueños de mascotas 22-50, ${pais === 'CO' ? 'Colombia' : pais === 'MX' ? 'México' : 'Paraguay'}'
  if (d.match(/bebé|niño|infantil|maternidad/)) return 'Madres y padres 24-40 con hijos pequeños, ${pais === 'CO' ? 'Colombia' : pais === 'MX' ? 'México' : 'Paraguay'}'
  if (d.match(/hogar|casa|cocina|limpieza|organización/)) return 'Amas de casa y personas 28-55 que buscan soluciones para el hogar, ${pais === 'CO' ? 'Colombia' : pais === 'MX' ? 'México' : 'Paraguay'}'
  if (d.match(/seguridad|cámara|alarma|protección/)) return 'Propietarios de vivienda 30-60 que valoran la seguridad del hogar, ${pais === 'CO' ? 'Colombia' : pais === 'MX' ? 'México' : 'Paraguay'}'
  
  // Fallback con el nombre del producto
  return \`Compradores online 22-50 interesados en \${p.name}, clase media, ${pais === 'CO' ? 'Colombia' : pais === 'MX' ? 'México' : 'Paraguay'}\`
}

const ALL_MODULES: { key: ModuleKey; label: string; icon: string; desc: string; color: string }[] = [
  { key: 'copies', label: 'Copies Meta Ads', icon: '✦', desc: '4 variantes AIDA/PAS/HSO/BAB', color: 'violet' },
  { key: 'ugc', label: 'Guiones UGC', icon: '📱', desc: '2 guiones listos para grabar', color: 'blue' },
  { key: 'emails', label: 'Secuencia de Emails', icon: '📧', desc: '5 emails de nurturing completos', color: 'emerald' },
  { key: 'whatsapp', label: 'Secuencia WhatsApp', icon: '💬', desc: '4 mensajes de seguimiento', color: 'green' },
  { key: 'audiencias', label: 'Audiencias Meta', icon: '🎯', desc: 'Fría, tibia y retargeting', color: 'amber' },
  { key: 'prompts', label: 'Prompts Visuales', icon: '🖼️', desc: '3 prompts para IA de imágenes', color: 'pink' },
  { key: 'estrategia_meta' as ModuleKey, label: 'Estrategia Meta Ads', icon: '📘', desc: 'Estructura, presupuesto, escala y audiencias', color: 'blue' },
]

async function callClaude(prompt: string): Promise<CampaignOutput> {
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
  return JSON.parse(clean) as CampaignOutput
}

function buildPrompt(product: Product, config: Record<string, string>, modules: ModuleKey[]): string {
  const publico = config.publico || autoPublico(product)
  const defs: Record<ModuleKey, string> = {
    copies: `"copies": [
    {"id":1,"framework":"AIDA","angulo":"Transformación","hook":"emoji + primera línea que para el scroll","titular":"máx 40 chars","cuerpo":"3-4 párrafos conversacionales y específicos con saltos de línea","cta":"CTA orientado a resultado","por_que_funciona":"psicología usada","hashtags":["#tag1","#tag2","#tag3"]},
    {"id":2,"framework":"PAS","angulo":"Dolor/Frustración","hook":"...","titular":"...","cuerpo":"...","cta":"...","por_que_funciona":"...","hashtags":["#tag1","#tag2","#tag3"]},
    {"id":3,"framework":"HSO","angulo":"Historia","hook":"...","titular":"...","cuerpo":"...","cta":"...","por_que_funciona":"...","hashtags":["#tag1","#tag2","#tag3"]},
    {"id":4,"framework":"BAB","angulo":"Before/After","hook":"...","titular":"...","cuerpo":"...","cta":"...","por_que_funciona":"...","hashtags":["#tag1","#tag2","#tag3"]}
  ]`,
    ugc: `"guionesUGC": [
    {"id":1,"tipo":"Testimonial directo","hook_principal":"primeras palabras exactas 0-3s","guion":{"apertura":{"texto":"lo que dice exacto 0-3s"},"desarrollo":{"texto":"texto completo natural y específico 3-25s"},"cierre_cta":{"texto":"CTA genuino 25-30s"}},"briefing_creador":"instrucciones completas: actitud, ropa, fondo, qué NO decir"},
    {"id":2,"tipo":"Before & After","hook_principal":"...","guion":{"apertura":{"texto":"..."},"desarrollo":{"texto":"..."},"cierre_cta":{"texto":"..."}},"briefing_creador":"..."}
  ]`,
    emails: `"emailSequence": [
    {"tipo":"Email 1 — Bienvenida","asunto":"asunto que genera apertura alta","cuerpo":"cuerpo completo 3-4 párrafos naturales","cuando_enviar":"Inmediatamente"},
    {"tipo":"Email 2 — Valor","asunto":"...","cuerpo":"...","cuando_enviar":"Día 2"},
    {"tipo":"Email 3 — Prueba Social","asunto":"...","cuerpo":"...","cuando_enviar":"Día 4"},
    {"tipo":"Email 4 — Oferta directa","asunto":"...","cuerpo":"...","cuando_enviar":"Día 6"},
    {"tipo":"Email 5 — Urgencia/Cierre","asunto":"...","cuerpo":"...","cuando_enviar":"Día 8"}
  ]`,
    whatsapp: `"whatsappSequence": [
    {"tipo":"Mensaje 1 — Primer contacto","mensaje":"mensaje completo natural no spam máx 3 líneas","cuando_enviar":"Al llegar el lead"},
    {"tipo":"Mensaje 2 — Seguimiento","mensaje":"...","cuando_enviar":"24hs sin respuesta"},
    {"tipo":"Mensaje 3 — Valor","mensaje":"...","cuando_enviar":"48hs"},
    {"tipo":"Mensaje 4 — Oferta","mensaje":"...","cuando_enviar":"72hs"}
  ]`,
    audiencias: `"audiencias": [
    {"nombre":"Audiencia Fría — Intereses","temperatura":"frio","descripcion":"descripción de quiénes son","intereses":["interés 1","interés 2","interés 3","interés 4","interés 5"],"copy_recomendado":"Copy 2 (PAS) — nombrá el dolor exacto"},
    {"nombre":"Lookalike 1-3%","temperatura":"tibio","descripcion":"...","intereses":[],"copy_recomendado":"Copy 1 (AIDA)"},
    {"nombre":"Retargeting visitantes","temperatura":"caliente","descripcion":"visitaron la página pero no compraron","intereses":[],"copy_recomendado":"Copy 4 (BAB + urgencia)"}
  ]`,
    estrategia_meta: `"estrategia_meta": {
    "estructura_campana": "descripción de la estructura: CBO vs ABO, cuántos adsets, cuántos ads por adset, lógica de presupuesto para Paraguay COD",
    "adsets": [
      {"nombre":"Ad Set 1 — Frío intereses","temperatura":"fría","presupuesto_diario":"$10/día","audiencia":"audiencia fría específica con intereses relevantes para Paraguay","copy_recomendado":"framework AIDA o PAS ángulo dolor","objetivo":"objetivo específico"},
      {"nombre":"Ad Set 2 — Lookalike","temperatura":"tibia","presupuesto_diario":"$15/día","audiencia":"LAL 1-3% de compradores","copy_recomendado":"framework HSO ángulo transformación","objetivo":"objetivo"},
      {"nombre":"Ad Set 3 — Retargeting","temperatura":"caliente","presupuesto_diario":"$8/día","audiencia":"visitantes últimos 30 días + abandonos checkout","copy_recomendado":"BAB con urgencia y oferta","objetivo":"objetivo"}
    ],
    "presupuesto_minimo": "presupuesto mínimo real para 7 días de test con datos válidos en Gs. (ej: Gs. 350.000/semana)",
    "cuando_escalar": "ROAS mínimo X durante Y días consecutivos → subir budget Z%",
    "senales_apagar": "señales claras de cuándo pausar o matar el adset",
    "objetivo_primera_semana": "métricas concretas para considerar el test exitoso",
    "configuracion_pixel": "eventos de conversión específicos para Dropi COD Paraguay",
    "tip_dropi": "tip específico para Paraguay COD que aumenta el ROAS con Dropi"
  }`,
    prompts: `"prompts_visuales": [
    {"uso":"Feed 1:1 — imagen principal","prompt":"photorealistic commercial product ad for ${product.name}, professional studio lighting, high detail, vibrant colors, lifestyle context, no text","negativePrompt":"text, watermark, blurry, low quality, person","ratio":"1:1"},
    {"uso":"Story 9:16 — vertical","prompt":"vertical lifestyle shot for ${product.name}, authentic UGC style, natural lighting, person using product","negativePrompt":"text, watermark, blurry, studio","ratio":"9:16"},
    {"uso":"Feed 4:5","prompt":"...","negativePrompt":"text, watermark, blurry","ratio":"4:5"}
  ]`,
  }
  return `Sos experto en Meta Ads, copywriting de conversión y email marketing en LATAM.
BRIEF: Producto: ${product.name} | Descripción: ${product.description} | Público: ${publico} | Nivel de conciencia: ${config.nivel_conciencia || 'Nivel 3'} | Objetivo: ${config.objetivo || 'Generar ventas'} | Presupuesto: ${config.presupuesto || 'USD 10-30/día'} | País: ${config.pais || 'Paraguay'}
REGLAS: Hook = primera línea que para el scroll. Tono humano y conversacional. Beneficios > Features. Segunda persona (vos/tú). CTAs orientados a resultado.
Todos los módulos deben tener coherencia narrativa entre sí — mismo ángulo y tono.
Respondé SOLO con JSON válido sin texto extra:
{
  ${modules.map(m => defs[m]).join(',\n  ')}
}`
}

type CopyItem = NonNullable<CampaignOutput['copies']>[0]
function CopyCard({ c, i }: { c: CopyItem; i: number }) {
  const [copied, setCopied] = useState(false)
  const borders = ['border-violet-500/20','border-amber-500/20','border-emerald-500/20','border-blue-500/20']
  const fwColors: Record<string, string> = { AIDA:'tag-violet', PAS:'tag-red', HSO:'tag-gold', BAB:'tag-green' }
  const full = `🎯 ${c.hook}\n\n${c.titular}\n\n${c.cuerpo}\n\n${c.cta}\n\n${c.hashtags?.join(' ')}`
  return (
    <div className={`card p-4 border ${borders[i % 4]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`tag ${fwColors[c.framework] || 'tag-gray'} text-[10px]`}>{c.framework}</span>
          <span className="text-white/30 text-[10px]">{c.angulo}</span>
        </div>
        <button onClick={async()=>{await navigator.clipboard.writeText(full);setCopied(true);setTimeout(()=>setCopied(false),2000)}} className="text-[10px] text-white/25 hover:text-violet-400 transition-colors">{copied?'✓ Copiado':'⊕ Copiar todo'}</button>
      </div>
      <div className="p-3 bg-violet-500/8 border border-violet-500/20 rounded-lg mb-3"><p className="text-[10px] text-violet-400/60 uppercase mb-1">🎯 Hook</p><p className="text-white font-bold text-sm">{c.hook}</p></div>
      <p className="text-white font-semibold text-sm mb-2">{c.titular}</p>
      <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line mb-3">{c.cuerpo}</p>
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 bg-white/8 rounded-lg text-xs font-semibold text-white/80">{c.cta}</span>
        <p className="text-violet-400/50 text-[10px]">{c.hashtags?.join(' ')}</p>
      </div>
      {c.por_que_funciona && <p className="text-white/25 text-[10px] italic mt-3 pt-2 border-t border-white/5">💡 {c.por_que_funciona}</p>}
    </div>
  )
}

type UGCItem = NonNullable<CampaignOutput['guionesUGC']>[0]
function UGCCard({ g }: { g: UGCItem }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card p-4 border border-blue-500/15">
      <div className="flex items-center justify-between mb-2">
        <span className="tag tag-blue text-[10px]">{g.tipo}</span>
        <button onClick={()=>setOpen(o=>!o)} className="text-white/30 text-xs hover:text-white/60">{open?'▲ Cerrar':'▼ Ver guión'}</button>
      </div>
      <div className="p-3 bg-blue-500/8 border border-blue-500/20 rounded-lg"><p className="text-[10px] text-blue-400/60 mb-1">🎬 Hook 0-3s</p><p className="text-white font-semibold text-sm">"{g.hook_principal}"</p></div>
      {open && <div className="space-y-2 mt-3 animate-fade-up">
        {[['Apertura 0-3s', g.guion.apertura.texto],['Desarrollo 3-25s', g.guion.desarrollo.texto],['CTA 25-30s', g.guion.cierre_cta.texto]].map(([l,t])=>(
          <div key={l} className="p-3 bg-white/3 border border-white/8 rounded-lg"><p className="text-[10px] text-white/30 mb-1">{l}</p><p className="text-white/70 text-xs leading-relaxed">{t}</p></div>
        ))}
        <div className="p-3 bg-amber-500/8 border border-amber-500/20 rounded-lg"><p className="text-[10px] text-amber-400/60 mb-1">📋 Briefing creador</p><p className="text-white/60 text-xs leading-relaxed">{g.briefing_creador}</p></div>
      </div>}
    </div>
  )
}

type EmailSeqItem = NonNullable<CampaignOutput['emailSequence']>[0]
function EmailCard({ e, i }: { e: EmailSeqItem; i: number }) {
  const [open, setOpen] = useState(i===0)
  const [copied, setCopied] = useState(false)
  return (
    <div className="card border border-emerald-500/12 overflow-hidden">
      <button onClick={()=>setOpen(o=>!o)} className="w-full p-4 text-left flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0">{i+1}</div>
          <div><p className="text-white/40 text-[10px]">{e.tipo}</p><p className="text-white text-sm font-semibold">{e.asunto}</p></div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0"><span className="text-emerald-400/40 text-[10px]">{e.cuando_enviar}</span><span className="text-white/20 text-xs">{open?'▲':'▼'}</span></div>
      </button>
      {open && <div className="px-4 pb-4 border-t border-white/5 pt-3 animate-fade-up">
        <div className="flex justify-end mb-2"><button onClick={async()=>{await navigator.clipboard.writeText(`Asunto: ${e.asunto}\n\n${e.cuerpo}`);setCopied(true);setTimeout(()=>setCopied(false),2000)}} className="text-[10px] text-white/25 hover:text-emerald-400 transition-colors">{copied?'✓ Copiado':'⊕ Copiar'}</button></div>
        <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">{e.cuerpo}</p>
      </div>}
    </div>
  )
}

type WASeqItem = NonNullable<CampaignOutput['whatsappSequence']>[0]
function WACard({ m, i }: { m: WASeqItem; i: number }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="card p-4 border border-green-500/12">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-[10px] font-bold">{i+1}</span><span className="text-white/40 text-xs">{m.tipo}</span></div>
        <div className="flex items-center gap-2"><span className="text-green-400/40 text-[10px]">{m.cuando_enviar}</span><button onClick={async()=>{await navigator.clipboard.writeText(m.mensaje);setCopied(true);setTimeout(()=>setCopied(false),2000)}} className="text-[10px] text-white/25 hover:text-green-400 transition-colors">{copied?'✓':'⊕'}</button></div>
      </div>
      <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-3"><p className="text-white/70 text-sm leading-relaxed">{m.mensaje}</p></div>
    </div>
  )
}

type PromptItem = NonNullable<CampaignOutput['prompts_visuales']>[0]
function PromptCard({ p }: { p: PromptItem }) {
  const [copied, setCopied] = useState(false)
  const rc: Record<string, string> = {'1:1':'text-emerald-400 border-emerald-500/30 bg-emerald-500/5','9:16':'text-sky-400 border-sky-500/30 bg-sky-500/5','4:5':'text-amber-400 border-amber-500/30 bg-amber-500/5'}
  const c = rc[p.ratio] || 'text-white/40 border-white/10 bg-white/3'
  return (
    <div className={`card p-4 border rounded-xl ${c}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><span className="text-[10px] font-bold uppercase opacity-80">{p.ratio}</span><span className="text-white/50 text-xs">{p.uso}</span></div>
        <button onClick={async()=>{await navigator.clipboard.writeText(p.prompt);setCopied(true);setTimeout(()=>setCopied(false),2000)}} className="text-[10px] text-white/25 hover:text-yellow-400 transition-colors">{copied?'✓ Copiado':'⊕ Copiar'}</button>
      </div>
      <p className="text-white/70 text-[11px] font-mono leading-relaxed bg-black/20 rounded-lg p-3 border border-white/5 mb-2">{p.prompt}</p>
      {p.negativePrompt && <p className="text-red-400/40 text-[10px]"><span className="text-red-400/60 font-medium">Neg: </span>{p.negativePrompt}</p>}
    </div>
  )
}

export default function CampanaPage() {
  const [phase, setPhase] = useState<Phase>('config')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedModules, setSelectedModules] = useState<ModuleKey[]>(['copies','ugc','emails','audiencias'])
  const [config, setConfig] = useState<Record<string, string>>({})
  const [output, setOutput] = useState<CampaignOutput | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<ModuleKey>('copies')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (selectedProduct) setConfig(p => ({ ...p, publico: p.publico || autoPublico(selectedProduct) }))
  }, [selectedProduct?.id])

  const toggle = (k: ModuleKey) => setSelectedModules(p => p.includes(k) ? p.filter(m=>m!==k) : [...p,k])

  const generate = async () => {
    if (!selectedProduct || selectedModules.length === 0) return
    setIsGenerating(true); setError(''); setPhase('generating')
    try {
      const result = await callClaude(buildPrompt(selectedProduct, config, selectedModules))
      setOutput(result); setActiveTab(selectedModules[0]); setPhase('results')
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); setPhase('config') }
    setIsGenerating(false)
  }

  const save = async () => {
    if (!output || !selectedProduct) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('generations').insert({ user_id: user.id, product_id: selectedProduct.id, tool: 'campana-completa', status: 'completed', input: config, output })
      setSaved(true)
    }
    setSaving(false)
  }

  const colorMap: Record<string, string> = {
    violet:'border-violet-500/40 bg-violet-500/10 text-violet-300', blue:'border-blue-500/40 bg-blue-500/10 text-blue-300',
    emerald:'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', green:'border-green-500/40 bg-green-500/10 text-green-300',
    amber:'border-amber-500/40 bg-amber-500/10 text-amber-300', pink:'border-pink-500/40 bg-pink-500/10 text-pink-300',
  }
  const inputClass = 'input'
  const labelClass = 'block text-xs font-medium text-white/40 mb-1.5'

  return (
    <div className="min-h-screen">
      <Navbar />
      {showModal && <ProductModal onClose={()=>setShowModal(false)} onCreated={p=>{setSelectedProduct(p);setShowModal(false)}} />}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/crear" className="btn-ghost text-white/30 hover:text-white p-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">Campaña Completa</h1>
              <span className="tag tag-violet text-[10px]">⚡ Full Stack</span>
            </div>
            <p className="text-white/40 text-xs">Copies + UGC + Emails + WhatsApp + Audiencias + Prompts — una sola generación</p>
          </div>
        </div>

        {phase === 'config' && (
          <div className="space-y-6 animate-fade-up">
            <div>
              <p className="text-xs font-semibold text-white/25 uppercase tracking-widest mb-3">1. Producto</p>
              <ProductSelector selectedProductId={selectedProduct?.id||null} onSelect={p=>setSelectedProduct(p)} onCreateNew={()=>setShowModal(true)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-white/25 uppercase tracking-widest">2. Qué generar</p>
                <button onClick={()=>setSelectedModules(ALL_MODULES.map(m=>m.key))} className="text-xs text-violet-400 hover:text-violet-300">Seleccionar todo</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ALL_MODULES.map(m => (
                  <button key={m.key} onClick={()=>toggle(m.key)} className={`p-3.5 rounded-xl border text-left transition-all ${selectedModules.includes(m.key) ? colorMap[m.color] : 'border-white/8 bg-white/2 hover:border-white/20'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-lg">{m.icon}</span>
                      {selectedModules.includes(m.key) && <span className="text-[9px] text-current opacity-80">✓</span>}
                    </div>
                    <p className={`text-xs font-semibold ${selectedModules.includes(m.key) ? '' : 'text-white/70'}`}>{m.label}</p>
                    <p className={`text-[10px] mt-0.5 ${selectedModules.includes(m.key) ? 'opacity-70' : 'text-white/30'}`}>{m.desc}</p>
                  </button>
                ))}
              </div>
              <p className="text-white/20 text-[10px] mt-2">{selectedModules.length} módulos seleccionados</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-white/25 uppercase tracking-widest mb-3">3. Configuración</p>
              <div className="card p-5 space-y-4">
                <div>
                  <label className={labelClass}>Público objetivo {selectedProduct && <span className="ml-2 text-violet-400/50 text-[10px]">✦ Auto-completado</span>}</label>
                  <input className={`${inputClass} ${selectedProduct?'border-violet-500/20':''}`} value={config.publico||''} onChange={e=>setConfig(p=>({...p,publico:e.target.value}))} placeholder="Ej: Mujeres 25-45 interesadas en skincare, ${pais === 'CO' ? 'Colombia' : pais === 'MX' ? 'México' : 'Paraguay'}" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key:'nivel_conciencia', label:'Nivel de conciencia', opts:['Nivel 1 — Público muy frío','Nivel 2 — Sabe que sufre','Nivel 3 — Busca solución','Nivel 4 — Te conoce, no decidió','Nivel 5 — Listo para comprar'] },
                    { key:'objetivo', label:'Objetivo', opts:['Generar ventas directas','Captar leads','Retargeting','Branding/Awareness'] },
                    { key:'presupuesto', label:'Presupuesto diario', opts:['USD 5-10/día (test)','USD 10-30/día (intermedio)','USD 30-100/día (escala)','USD 100+/día'] },
                    { key:'pais', label:'País/Región', opts:['Paraguay','Argentina','Uruguay','Chile','Colombia','México','LATAM completo'] },
                  ].map(({key,label,opts})=>(
                    <div key={key}>
                      <label className={labelClass}>{label}</label>
                      <select className={`${inputClass} cursor-pointer`} value={config[key]||''} onChange={e=>setConfig(p=>({...p,[key]:e.target.value}))}>
                        <option value="" style={{background:'#111'}}>Seleccionar...</option>
                        {opts.map(o=><option key={o} value={o} style={{background:'#111'}}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={generate} disabled={!selectedProduct||selectedModules.length===0} className="btn-primary w-full py-4 text-base">
              ✦ Generar campaña completa ({selectedModules.length} módulos) →
            </button>
          </div>
        )}

        {phase === 'generating' && (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-up">
            <div className="w-20 h-20 rounded-3xl bg-violet-600/20 flex items-center justify-center mb-6">
              <span className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin block" />
            </div>
            <h2 className="text-white font-bold text-xl mb-2">Generando campaña completa...</h2>
            <p className="text-white/40 text-sm mb-8">La IA está creando {selectedModules.length} módulos para <strong className="text-white">{selectedProduct?.name}</strong></p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {selectedModules.map((m,i)=>{const mod=ALL_MODULES.find(a=>a.key===m)!;return<span key={m} className="text-[11px] px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-300 animate-pulse" style={{animationDelay:`${i*0.3}s`}}>{mod.icon} {mod.label}</span>})}
            </div>
          </div>
        )}

        {phase === 'results' && output && (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-bold">Campaña lista — {selectedProduct?.name}</h2>
                <p className="text-white/30 text-xs mt-0.5">{selectedModules.length} módulos generados</p>
              </div>
              <div className="flex gap-2">
                <button onClick={save} disabled={saving||saved} className={`text-xs px-3 py-2 rounded-lg border transition-all ${saved?'border-emerald-500/40 bg-emerald-500/10 text-emerald-400':'border-white/15 bg-white/5 text-white/50 hover:border-white/30'}`}>
                  {saved?'✓ Guardado':saving?'Guardando...':'💾 Guardar'}
                </button>
                <button onClick={()=>{setPhase('config');setOutput(null);setSaved(false)}} className="btn-secondary text-xs px-3 py-2">← Nueva</button>
              </div>
            </div>

            {output.estrategia && (
              <div className="card p-4 border border-violet-500/20 bg-violet-500/5 mb-5 grid grid-cols-2 gap-3">
                {[['Estructura','text-violet-400/60',output.estrategia.estructura],['Presupuesto mínimo','text-violet-400/60',output.estrategia.presupuesto_minimo],['Cuándo escalar','text-emerald-400/60',output.estrategia.cuando_escalar],['KPI principal','text-amber-400/60',output.estrategia.kpi_principal]].map(([t,c,v])=>(
                  <div key={t}><p className={`text-[10px] uppercase tracking-wider mb-1 ${c}`}>{t}</p><p className="text-white/70 text-xs leading-relaxed">{v}</p></div>
                ))}
              </div>
            )}

            <div className="flex gap-1 overflow-x-auto pb-2 mb-5">
              {selectedModules.map(m=>{const mod=ALL_MODULES.find(a=>a.key===m)!;return(
                <button key={m} onClick={()=>setActiveTab(m)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeTab===m?'bg-violet-600 text-white':'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'}`}>
                  <span>{mod.icon}</span> {mod.label}
                </button>
              )})}
            </div>

            {activeTab==='copies' && output.copies && <div className="space-y-4 animate-fade-up">{output.copies.map((c,i)=><CopyCard key={c.id} c={c} i={i}/>)}</div>}
            {activeTab==='ugc' && output.guionesUGC && <div className="space-y-4 animate-fade-up">{output.guionesUGC.map(g=><UGCCard key={g.id} g={g}/>)}</div>}
            {activeTab==='emails' && output.emailSequence && (
              <div className="space-y-2 animate-fade-up">
                <div className="card p-3 border border-emerald-500/10 bg-emerald-500/3 text-xs text-emerald-400/70 mb-3">📧 5 emails listos para copiar en Mailchimp, ActiveCampaign o cualquier ESP. El mismo ángulo que tus copies.</div>
                {output.emailSequence.map((e,i)=><EmailCard key={i} e={e} i={i}/>)}
              </div>
            )}
            {activeTab==='whatsapp' && output.whatsappSequence && (
              <div className="space-y-3 animate-fade-up">
                <div className="card p-3 border border-green-500/10 bg-green-500/3 text-xs text-green-400/70 mb-3">💬 Mensajes listos para copiar. Personalizá el nombre antes de enviar. Máx 1 mensaje por día.</div>
                {output.whatsappSequence.map((m,i)=><WACard key={i} m={m} i={i}/>)}
              </div>
            )}
            {activeTab==='audiencias' && output.audiencias && (
              <div className="space-y-3 animate-fade-up">
                {output.audiencias.map((a,i)=>{
                  const tc: Record<string,string>={frio:'tag-blue',tibio:'tag-gold',caliente:'tag-red'}
                  return <div key={i} className="card p-4 border border-amber-500/12">
                    <div className="flex items-center gap-2 mb-2"><span className={`tag ${tc[a.temperatura]||'tag-gray'} text-[10px]`}>{a.temperatura}</span><p className="text-white font-semibold text-sm">{a.nombre}</p></div>
                    <p className="text-white/50 text-xs mb-3">{a.descripcion}</p>
                    {a.intereses.length>0 && <div className="mb-2"><p className="text-[10px] text-white/25 uppercase mb-1.5">Intereses en Meta</p><div className="flex flex-wrap gap-1.5">{a.intereses.map((int,j)=><span key={j} className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-300">{int}</span>)}</div></div>}
                    <div className="p-2.5 bg-violet-500/8 border border-violet-500/15 rounded-lg"><p className="text-[10px] text-violet-400/60 mb-0.5">Copy recomendado</p><p className="text-white/60 text-xs">{a.copy_recomendado}</p></div>
                  </div>
                })}
              </div>
            )}
            {activeTab==='prompts' && output.prompts_visuales && <div className="space-y-3 animate-fade-up">{output.prompts_visuales.map((p,i)=><PromptCard key={i} p={p}/>)}</div>}
            {activeTab==='estrategia_meta' && output.estrategia_meta && (
              <div className="space-y-4 animate-fade-up">
                <div className="card p-4 border border-blue-500/20 bg-blue-500/5">
                  <p className="text-[10px] uppercase tracking-wider text-blue-400/60 mb-1">Estructura de Campaña</p>
                  <p className="text-white/80 text-sm leading-relaxed">{output.estrategia_meta.estructura_campana}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="card p-3 border border-violet-500/15">
                    <p className="text-[10px] uppercase tracking-wider text-violet-400/60 mb-1">Presupuesto Mínimo</p>
                    <p className="text-white/80 text-xs leading-relaxed">{output.estrategia_meta.presupuesto_minimo}</p>
                  </div>
                  <div className="card p-3 border border-amber-500/15">
                    <p className="text-[10px] uppercase tracking-wider text-amber-400/60 mb-1">KPI Principal 72hs</p>
                    <p className="text-white/80 text-xs leading-relaxed">{output.estrategia_meta.kpi_72hs}</p>
                  </div>
                </div>
                <div className="card p-4 border border-emerald-500/15">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-400/60 mb-2">Fases Andromeda</p>
                  <div className="space-y-2">
                    {output.estrategia_meta.fases_andromeda?.map((f: {fase: string; descripcion: string; accion: string}, i: number) => (
                      <div key={i} className="flex gap-3 p-2.5 bg-white/3 rounded-lg">
                        <span className="text-xs font-bold text-emerald-400 flex-shrink-0">{f.fase}</span>
                        <div>
                          <p className="text-white/70 text-xs">{f.descripcion}</p>
                          <p className="text-emerald-300/60 text-[10px] mt-0.5">→ {f.accion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {output.estrategia_meta.cuando_escalar && (
                  <div className="card p-3 border border-white/8">
                    <p className="text-[10px] uppercase tracking-wider text-white/25 mb-1">Cuándo Escalar</p>
                    <p className="text-white/70 text-xs leading-relaxed">{output.estrategia_meta.cuando_escalar}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {output && (
          <div className="grid grid-cols-3 gap-2 mt-4 px-0 pb-2">
            <Link href="/upsell" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-emerald-500/30 transition-all"><span>💎</span><div><p className="text-white text-xs font-bold">Upsell</p><p className="text-white/30 text-[10px]">+30% ticket</p></div></Link>
            <Link href="/comparador-copies" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-violet-500/30 transition-all"><span>⚖️</span><div><p className="text-white text-xs font-bold">Comparar</p><p className="text-white/30 text-[10px]">Copiar copies</p></div></Link>
            <Link href="/creativo-visual" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-pink-500/30 transition-all"><span>🎨</span><div><p className="text-white text-xs font-bold">Visual</p><p className="text-white/30 text-[10px]">Estrategia visual</p></div></Link>
          </div>
        )}
      </main>
    </div>
  )
}
