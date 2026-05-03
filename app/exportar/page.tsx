'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

// Mapa completo de tools — igual que historial
const TOOL_LABELS: Record<string, string> = {
  'ugc-anuncios': 'UGC Anuncios', 'ugc-secuencias': 'UGC Secuencias',
  'ugc-catalogo': 'UGC Catálogo', 'meta-ads': 'Meta Ads Pro',
  'tiktok': 'TikTok Ads', 'hotmart': 'Hotmart Funnel',
  'andromeda': 'Andromeda', 'ugc-creator': 'UGC Creator',
  'campana-completa': 'Campaña Completa', 'lanzar-producto': 'Lanzar Producto',
  'buyer-persona': 'Buyer Persona', 'organico': 'Orgánico IG/FB',
  'spy-anuncio': 'Spy & Clonar', 'email-flows': 'Email Flows',
  'tiktok-shop': 'TikTok Shop', 'whatsapp-flows': 'WhatsApp Flows',
  'customer-service': 'Customer Service', 'analisis-nicho': 'Análisis de Nicho',
  'temporada': 'Temporadas', 'contenido-imagen': 'Contenido Imagen',
  'testimonios': 'Testimonios', 'upsell': 'Upsell',
  'checkout-dropi': 'Checkout Dropi', 'landing-page': 'Landing Page',
  'postmortem': 'Post-mortem', 'comparador-copies': 'Comparador Copies',
  'whatsapp-ventas': 'WhatsApp Ventas',
}

type Generation = {
  id: string
  tool: string
  created_at: string
  output?: Record<string, unknown>
  products?: { name: string }
}

// Extrae todos los bloques de texto exportables del output sin importar el tool
function extractBlocks(output: Record<string, unknown>): { title: string; content: string }[] {
  const blocks: { title: string; content: string }[] = []

  const addText = (title: string, val: unknown) => {
    if (!val) return
    if (typeof val === 'string' && val.trim()) blocks.push({ title, content: val.trim() })
    else if (typeof val === 'object') blocks.push({ title, content: JSON.stringify(val, null, 2) })
  }

  // --- Copies (cualquier herramienta) ---
  const copies = (output.copies || output.guionesUGC || output.scripts) as Array<Record<string, unknown>> | undefined
  if (Array.isArray(copies)) {
    copies.forEach((c, i) => {
      const num = i + 1
      const label = (c.framework || c.tipo || c.angulo || `Copy ${num}`) as string
      let text = ''
      if (c.hook) text += `🎣 Hook: ${c.hook}\n`
      if (c.titular) text += `📌 Titular: ${c.titular}\n`
      if (c.cuerpo) text += `\n${c.cuerpo}\n`
      if (c.cta) text += `\n👉 CTA: ${c.cta}`
      if (c.texto) text += `${c.texto}`
      if (c.por_que_funciona) text += `\n\n💡 Por qué funciona: ${c.por_que_funciona}`
      if (c.hashtags && Array.isArray(c.hashtags)) text += `\n\n${(c.hashtags as string[]).join(' ')}`
      if (text.trim()) blocks.push({ title: `${label} #${num}`, content: text.trim() })
    })
  }

  // --- UGC Guiones ---
  const guiones = output.guionesUGC as Array<Record<string, unknown>> | undefined
  if (Array.isArray(guiones)) {
    guiones.forEach((g, i) => {
      const guion = g.guion as Record<string, Record<string, string>> | undefined
      let text = ''
      if (g.hook_principal) text += `🎣 Hook: ${g.hook_principal}\n\n`
      if (guion?.apertura?.texto) text += `[0-3s] ${guion.apertura.texto}\n`
      if (guion?.desarrollo?.texto) text += `[3-25s] ${guion.desarrollo.texto}\n`
      if (guion?.cierre_cta?.texto) text += `[Final] ${guion.cierre_cta.texto}\n`
      if (g.briefing_creador) text += `\n📋 Briefing: ${g.briefing_creador}`
      if (text.trim()) blocks.push({ title: `Guión UGC #${i + 1}`, content: text.trim() })
    })
  }

  // --- Buyer Persona ---
  if (output.buyerPersona || output.buyer_persona) {
    const bp = (output.buyerPersona || output.buyer_persona) as Record<string, unknown>
    let text = ''
    if (bp.nombre) text += `👤 ${bp.nombre}\n`
    if (bp.edad) text += `Edad: ${bp.edad}\n`
    if (bp.descripcion) text += `\n${bp.descripcion}\n`
    if (bp.dolores && Array.isArray(bp.dolores)) text += `\nDolores:\n${(bp.dolores as string[]).map(d => `• ${d}`).join('\n')}`
    if (bp.deseos && Array.isArray(bp.deseos)) text += `\n\nDeseos:\n${(bp.deseos as string[]).map(d => `• ${d}`).join('\n')}`
    if (text.trim()) blocks.push({ title: 'Buyer Persona', content: text.trim() })
  }

  // --- Audiencias Meta ---
  const audiencias = output.perfilesAudiencia || output.audiencias
  if (Array.isArray(audiencias)) {
    (audiencias as Array<Record<string, unknown>>).forEach((a, i) => {
      let text = ''
      if (a.nombre) text += `${a.nombre}\n`
      if (a.tipo) text += `Tipo: ${a.tipo}\n`
      if (a.descripcion) text += `\n${a.descripcion}\n`
      if (a.intereses && Array.isArray(a.intereses)) text += `\nIntereses: ${(a.intereses as string[]).join(', ')}`
      if (text.trim()) blocks.push({ title: `Audiencia #${i + 1}`, content: text.trim() })
    })
  }

  // --- Emails ---
  const emails = output.emails || (output.hotmartFunnel as Record<string, unknown> | undefined)?.emails
  if (Array.isArray(emails)) {
    (emails as Array<Record<string, unknown>>).forEach((e, i) => {
      let text = ''
      if (e.asunto) text += `📧 Asunto: ${e.asunto}\n\n`
      if (e.cuerpo) text += e.cuerpo as string
      if (text.trim()) blocks.push({ title: `Email ${i + 1}: ${e.tipo || ''}`, content: text.trim() })
    })
  }

  // --- WhatsApp scripts ---
  const wa = output.whatsapp_scripts || output.scripts_whatsapp
  if (Array.isArray(wa)) {
    (wa as string[]).forEach((s, i) => {
      if (s.trim()) blocks.push({ title: `WhatsApp Script #${i + 1}`, content: s })
    })
  }

  // --- Plan de lanzamiento ---
  if (output.planLanzamiento || output.plan_lanzamiento) {
    const plan = (output.planLanzamiento || output.plan_lanzamiento) as Record<string, unknown>
    let text = ''
    if (plan.semana1) text += `Semana 1:\n${JSON.stringify(plan.semana1, null, 2)}\n\n`
    if (plan.semana2) text += `Semana 2:\n${JSON.stringify(plan.semana2, null, 2)}\n\n`
    if (plan.semana3) text += `Semana 3:\n${JSON.stringify(plan.semana3, null, 2)}`
    if (text.trim()) blocks.push({ title: 'Plan de Lanzamiento', content: text.trim() })
  }

  // --- Estructura de campaña ---
  if (output.estructuraCampana) {
    addText('Estructura de Campaña', JSON.stringify(output.estructuraCampana, null, 2))
  }

  // --- Checklist ---
  if (output.checklistLanzamiento) {
    const cl = output.checklistLanzamiento as Record<string, Array<{ item: string; critico?: boolean }>>
    let text = ''
    Object.entries(cl).forEach(([fase, items]) => {
      text += `\n${fase.toUpperCase()}\n`
      items.forEach(it => text += `${it.critico ? '🔴' : '○'} ${it.item}\n`)
    })
    if (text.trim()) blocks.push({ title: 'Checklist de Lanzamiento', content: text.trim() })
  }

  // --- Prompts visuales (Leonardo/Gemini) ---
  const prompts = output.leonardoPrompts || output.geminiPrompts || output.dallPrompts
  if (Array.isArray(prompts)) {
    (prompts as Array<Record<string, unknown>>).forEach((p, i) => {
      let text = ''
      if (p.uso) text += `Uso: ${p.uso}\n`
      if (p.prompt) text += `\nPrompt: ${p.prompt}\n`
      if (p.negativePrompt) text += `\nNegativo: ${p.negativePrompt}`
      if (text.trim()) blocks.push({ title: `Prompt Visual #${i + 1}`, content: text.trim() })
    })
  }

  // --- Post-mortem ---
  if (output.postmortem || output.analisis) {
    addText('Post-mortem / Análisis', typeof (output.postmortem || output.analisis) === 'string'
      ? output.postmortem as string
      : JSON.stringify(output.postmortem || output.analisis, null, 2))
  }

  // --- Fallback: si nada matcheó, exportar todo el JSON formateado ---
  if (blocks.length === 0 && Object.keys(output).length > 0) {
    blocks.push({ title: 'Contenido completo', content: JSON.stringify(output, null, 2) })
  }

  return blocks
}

export default function ExportarPage() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [selected, setSelected] = useState<Generation | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/generations?limit=50')
      .then(r => r.json())
      .then(data => { setGenerations(data.generations || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const blocks = selected?.output ? extractBlocks(selected.output) : []

  const copyBlock = async (idx: number, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopied(String(idx))
    setTimeout(() => setCopied(null), 1500)
  }

  const copyAll = async () => {
    if (!blocks.length) return
    const all = blocks.map(b => `=== ${b.title} ===\n\n${b.content}`).join('\n\n---\n\n')
    await navigator.clipboard.writeText(all)
    setCopied('all')
    setTimeout(() => setCopied(null), 2000)
  }

  const handlePrint = () => window.print()

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/gestionar" className="text-white/30 hover:text-white/60 text-sm">Gestionar</Link>
            <span className="text-white/20">›</span>
            <span className="text-white/60 text-sm">Exportar</span>
          </div>
          <h1 className="text-2xl font-bold text-white">📤 Exportar Contenido</h1>
          <p className="text-white/40 text-sm mt-1">Copiá o imprimí cualquier generación del historial</p>
        </div>

        {/* Selector de generación */}
        <div className="card p-4 border border-white/8 mb-5">
          <p className="text-xs text-white/40 font-bold mb-3">SELECCIONAR GENERACIÓN</p>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              <span className="text-white/40 text-sm">Cargando historial...</span>
            </div>
          ) : generations.length === 0 ? (
            <p className="text-white/30 text-sm">No hay generaciones en el historial.</p>
          ) : (
            <select
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50"
              value={selected?.id || ''}
              onChange={e => {
                const gen = generations.find(g => g.id === e.target.value)
                setSelected(gen || null)
              }}
            >
              <option value="">— Elegí una generación —</option>
              {generations.map(g => (
                <option key={g.id} value={g.id}>
                  {TOOL_LABELS[g.tool] || g.tool} · {g.products?.name || 'Sin producto'} · {new Date(g.created_at).toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit' })}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Contenido exportable */}
        {selected && blocks.length > 0 && (
          <>
            {/* Acciones globales */}
            <div className="flex gap-2 mb-4">
              <button onClick={copyAll}
                className="flex-1 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-sm transition-all">
                {copied === 'all' ? '✅ Todo copiado' : '📋 Copiar todo'}
              </button>
              <button onClick={handlePrint}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white text-sm transition-all">
                🖨️ Imprimir
              </button>
            </div>

            {/* Bloques individuales */}
            <div className="space-y-3" ref={printRef}>
              {blocks.map((block, idx) => (
                <div key={idx} className="card p-4 border border-white/8">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-white/60 uppercase tracking-wide">{block.title}</p>
                    <button onClick={() => copyBlock(idx, block.content)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-white/40 hover:text-emerald-400 text-xs transition-all">
                      {copied === String(idx) ? '✅ Copiado' : '📋 Copiar'}
                    </button>
                  </div>
                  <pre className="text-white/70 text-xs leading-relaxed whitespace-pre-wrap break-words font-sans">
                    {block.content}
                  </pre>
                </div>
              ))}
            </div>
          </>
        )}

        {selected && blocks.length === 0 && (
          <div className="card p-8 text-center border border-white/5">
            <p className="text-3xl mb-3">🈳</p>
            <p className="text-white/60 font-semibold mb-1">Sin contenido exportable</p>
            <p className="text-white/30 text-sm">Esta generación no tiene output guardado.</p>
          </div>
        )}

        {!selected && !loading && (
          <div className="card p-8 text-center border border-white/5">
            <p className="text-3xl mb-3">📤</p>
            <p className="text-white/50 text-sm">Seleccioná una generación arriba para ver su contenido</p>
          </div>
        )}
      </main>

      <style>{`
        @media print {
          .navbar, nav, button, select, .no-print { display: none !important; }
          .card { break-inside: avoid; margin-bottom: 1.5rem; }
          pre { white-space: pre-wrap; font-size: 11px; }
          body { background: white; color: black; }
        }
      `}</style>
    </div>
  )
}
