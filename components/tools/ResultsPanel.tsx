'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { GenerationOutput, CopyVariant, LeonardoPrompt, NanaBananaPrompts } from '@/types'

// ─────────────────────────────────────────────
// NANO BANANA PRO SECTION
// ─────────────────────────────────────────────
const FORMAT_COLORS: Record<string, { text: string; border: string; bg: string }> = {
  '16:9': { text: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/5' },
  '1:1':  { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5' },
  '4:5':  { text: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/5' },
}

function NanaBananaSection({ prompts, defaultType = 'imagen' }: { prompts: NanaBananaPrompts; defaultType?: 'imagen' | 'video' }) {
  const [activeType, setActiveType] = useState<'imagen' | 'video'>(defaultType)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const items = activeType === 'imagen' ? (prompts.imagen || []) : (prompts.video || [])

  return (
    <div className="mt-3 pt-3 border-t border-white/5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-widest text-yellow-400/80 font-bold flex items-center gap-1">
          🍌 Nano Banana Pro
        </p>
        <div className="flex gap-1">
          {(['imagen', 'video'] as const).map(t => (
            <button key={t} onClick={() => setActiveType(t)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
                activeType === t
                  ? 'border-yellow-500/40 bg-yellow-500/15 text-yellow-300'
                  : 'border-white/10 text-white/30 hover:text-white/50'
              }`}>
              {t === 'imagen' ? '🖼 Imagen' : '🎬 Video'}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => {
          const fc = FORMAT_COLORS[item.formato] || { text: 'text-white/40', border: 'border-white/10', bg: 'bg-white/3' }
          const key = `${activeType}-${item.formato}-${i}`
          return (
            <div key={key} className={`rounded-lg border p-2.5 ${fc.border} ${fc.bg}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${fc.text}`}>
                  {item.formato} · {activeType}
                </span>
                <button onClick={() => copy(item.prompt, key)}
                  className="text-[10px] text-white/25 hover:text-yellow-400 transition-colors">
                  {copiedKey === key ? '✓ Copiado' : '⊕ Copiar'}
                </button>
              </div>
              <p className="text-white/70 text-[11px] font-mono leading-relaxed bg-black/20 rounded p-2 border border-white/5">
                {item.prompt}
              </p>
              {item.negativePrompt && (
                <p className="text-red-400/40 text-[10px] mt-1 leading-relaxed">
                  <span className="text-red-400/60 font-medium">— Neg: </span>{item.negativePrompt}
                </p>
              )}
            </div>
          )
        })}
        {items.length === 0 && (
          <p className="text-white/20 text-xs text-center py-2">Sin prompts de {activeType} para esta variante</p>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// COPY CARD
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// REGENERAR VARIANTE
// ─────────────────────────────────────────────
async function regenVariant(v: CopyVariant & { framework?: string; angulo?: string; hook?: string }, instruccion: string): Promise<{ hook: string; titular: string; cuerpo: string; cta: string }> {
  const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('Falta NEXT_PUBLIC_ANTHROPIC_API_KEY')
  const vExt = v as CopyVariant & { framework?: string; angulo?: string; hook?: string; por_que_funciona?: string }
  const prompt = `Sos un copywriter experto en Meta Ads. Regenerá esta variante de copy aplicando la siguiente instrucción.

COPY ORIGINAL:
Framework: ${vExt.framework || 'N/A'}
Ángulo: ${vExt.angulo || 'N/A'}
Hook: ${vExt.hook || v.titular}
Titular: ${v.titular}
Cuerpo: ${v.cuerpo}
CTA: ${v.cta}

INSTRUCCIÓN DE MEJORA: ${instruccion}

Generá una versión mejorada. SOLO JSON válido:
{
  "hook": "nueva primera línea que para el scroll con emoji",
  "titular": "nuevo titular máx 40 chars",
  "cuerpo": "nuevo texto principal 2-4 párrafos cortos conversacionales",
  "cta": "nuevo CTA específico máx 5 palabras"
}`
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] }),
  })
  const d = await res.json()
  const raw = d.content?.[0]?.text || ''
  let clean = raw.replace(/```json\s*/g,'').replace(/```\s*/g,'').trim()
  const s = clean.indexOf('{'), e2 = clean.lastIndexOf('}')
  if (s >= 0 && e2 > s) clean = clean.slice(s, e2+1)
  return JSON.parse(clean)
}

function CopyCard({ v, i, onRegenerate, isRegenerating, regenerated, copiedVariant, setCopiedVariant }: { v: CopyVariant; i: number; onRegenerate: (i: number, v: CopyVariant & {framework?: string; hook?: string; por_que_funciona?: string}) => void; isRegenerating: number | null; regenerated: Record<string, unknown> | null; copiedVariant: string | null; setCopiedVariant: (v: string | null) => void }) {
  const [copied, setCopied] = useState(false)
  const [showRegen, setShowRegen] = useState(false)
  const [regenInstr, setRegenInstr] = useState('')
  const [regenLoading, setRegenLoading] = useState(false)
  const [regenResult, setRegenResult] = useState<{ hook: string; titular: string; cuerpo: string; cta: string } | null>(null)
  const [regenCopied, setRegenCopied] = useState(false)
  const colors = ['text-violet-400', 'text-amber-400', 'text-emerald-400', 'text-blue-400', 'text-pink-400']
  const borders = ['border-violet-500/20', 'border-amber-500/20', 'border-emerald-500/20', 'border-blue-500/20', 'border-pink-500/20']
  const frameworkColors: Record<string, string> = {
    'AIDA': 'tag-violet', 'PAS': 'tag-red', 'HSO': 'tag-gold',
    'BAB': 'tag-green', 'FAB': 'tag-blue', 'FAB + Urgencia': 'tag-blue', 'BAB + Urgencia': 'tag-purple',
  }
  const nivelColors = ['', 'tag-gray', 'tag-red', 'tag-gold', 'tag-green', 'tag-violet']

  const hasNewFormat = !!(v as CopyVariant & { framework?: string }).framework
  const vExt = v as CopyVariant & { framework?: string; angulo?: string; nivel_conciencia?: number; hook?: string; por_que_funciona?: string; nanoBananaPrompts?: NanaBananaPrompts }
  const fullText = hasNewFormat
    ? `HOOK: ${vExt.hook}\n\n${v.titular}\n\n${v.cuerpo}\n\n${v.cta}\n\n${v.hashtags?.join(' ')}`
    : `${v.titular}\n\n${v.cuerpo}\n\n${v.cta}\n\n${v.hashtags?.join(' ')}`

  return (
    <div className={`card p-4 border ${borders[i % 5] || 'border-white/10'} animate-fade-up`} style={{ animationDelay: `${i*0.08}s` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold uppercase tracking-wider ${colors[i % 5]}`}>Var. {i+1}</span>
          {hasNewFormat && vExt.framework && <span className={`tag ${frameworkColors[vExt.framework] || 'tag-gray'} text-[10px]`}>{vExt.framework}</span>}
          {hasNewFormat && vExt.nivel_conciencia && <span className={`tag ${nivelColors[vExt.nivel_conciencia] || 'tag-gray'} text-[10px]`}>Nivel {vExt.nivel_conciencia}</span>}
          {!hasNewFormat && v.tipo && <span className="tag tag-gray text-[10px]">{v.tipo}</span>}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setShowRegen(s => !s)}
            className="text-xs text-white/25 hover:text-violet-400 transition-colors">
            {showRegen ? '✕ Cerrar' : '↺ Regenerar'}
          </button>
          <button onClick={async () => { await navigator.clipboard.writeText(fullText); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            className="text-xs text-white/25 hover:text-white/60 transition-colors">
            {copied ? <span className="text-success">✓ Copiado</span> : '⊕ Copiar'}
          </button>
        </div>
      </div>

      {hasNewFormat && vExt.angulo && <p className="text-[10px] text-white/30 italic mb-3">Ángulo: {vExt.angulo}</p>}

      <div className="space-y-3">
        {hasNewFormat && vExt.hook && (
          <div className="bg-violet-500/8 border border-violet-500/20 rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-widest text-violet-400/60 mb-1">🎯 Hook — para el scroll</p>
            <p className="text-white font-bold text-sm">{vExt.hook}</p>
          </div>
        )}
        <div>
          <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Titular del anuncio</p>
          <p className="text-white font-semibold text-sm">{v.titular}</p>
        </div>
        <div>
          <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Texto principal</p>
          <p className="text-white/65 text-sm leading-relaxed whitespace-pre-line">{v.cuerpo}</p>
        </div>
        <div>
          <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1">CTA</p>
          <span className="inline-block px-3 py-1 rounded-lg bg-white/8 text-white/80 text-xs font-semibold">{v.cta}</span>
        </div>
        {v.hashtags?.length > 0 && <p className="text-violet-400/60 text-xs">{v.hashtags.join(' ')}</p>}
        {hasNewFormat && vExt.por_que_funciona && (
          <div className="border-t border-white/5 pt-2">
            <p className="text-[10px] uppercase tracking-widest text-white/20 mb-1">Por qué convierte</p>
            <p className="text-white/30 text-xs italic">{vExt.por_que_funciona}</p>
          </div>
        )}
        {!hasNewFormat && v.estrategia && <p className="text-white/20 text-xs italic border-t border-white/5 pt-2">{v.estrategia}</p>}

        {/* Nano Banana Pro */}
        {vExt.nanoBananaPrompts && <NanaBananaSection prompts={vExt.nanoBananaPrompts} />}

        {/* Regenerar variante */}
        {showRegen && (
          <div className="border-t border-white/5 pt-3 mt-2">
            <p className="text-[10px] uppercase tracking-widest text-violet-400/60 mb-2">↺ Regenerar esta variante</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {['Más urgente','Hook más disruptivo','Tono más empático','Más específico','Versión corta','Más prueba social'].map(s => (
                <button key={s} onClick={() => setRegenInstr(s)}
                  className={`text-[10px] px-2 py-1 rounded-full border transition-all ${regenInstr===s ? 'border-violet-500/50 bg-violet-500/15 text-violet-300' : 'border-white/10 text-white/30 hover:border-white/25'}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input flex-1 text-xs py-2"
                placeholder="O escribí tu instrucción específica..."
                value={regenInstr}
                onChange={e => setRegenInstr(e.target.value)}
              />
              <button
                onClick={async () => {
                  if (!regenInstr.trim()) return
                  setRegenLoading(true); setRegenResult(null)
                  try { const r = await regenVariant(v as CopyVariant & {framework?:string;angulo?:string;hook?:string}, regenInstr); setRegenResult(r) }
                  catch { alert('Error regenerando. Intentá de nuevo.') }
                  setRegenLoading(false)
                }}
                disabled={regenLoading || !regenInstr.trim()}
                className="btn-primary text-xs px-3 py-2 flex-shrink-0">
                {regenLoading ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : '↺'}
              </button>
            </div>

            {regenResult && (
              <div className="mt-3 p-3 rounded-xl border border-violet-500/25 bg-violet-500/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-violet-300 text-[10px] font-bold uppercase tracking-wider">✦ Versión regenerada</p>
                  <button onClick={async () => {
                    const t = `HOOK: ${regenResult.hook}\n\n${regenResult.titular}\n\n${regenResult.cuerpo}\n\n${regenResult.cta}`
                    await navigator.clipboard.writeText(t); setRegenCopied(true); setTimeout(() => setRegenCopied(false), 2000)
                  }} className="text-[10px] text-white/30 hover:text-violet-400">
                    {regenCopied ? '✓ Copiado' : '⊕ Copiar todo'}
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="bg-violet-500/8 border border-violet-500/15 rounded-lg p-2">
                    <p className="text-[9px] text-violet-400/50 mb-0.5">HOOK</p>
                    <p className="text-white font-semibold text-xs">{regenResult.hook}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-white/20 mb-0.5">TITULAR</p>
                    <p className="text-white/80 text-xs font-medium">{regenResult.titular}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-white/20 mb-0.5">CUERPO</p>
                    <p className="text-white/60 text-xs leading-relaxed whitespace-pre-line">{regenResult.cuerpo}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-white/20 mb-0.5">CTA</p>
                    <span className="inline-block px-2 py-1 rounded bg-white/8 text-white/70 text-xs">{regenResult.cta}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// LEONARDO CARD
// ─────────────────────────────────────────────
function LeonardoCard({ item }: { item: LeonardoPrompt }) {
  const [c1, setC1] = useState(false); const [c2, setC2] = useState(false)
  return (
    <div className="card p-4 border border-amber-500/15 animate-fade-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-400 uppercase">Prompt {item.id}</span>
          <span className="tag tag-gold text-[10px]">{item.uso}</span>
        </div>
        <div className="flex gap-2 text-[10px] text-white/25">
          <span>{item.settings?.model}</span>·<span>{item.settings?.ratio}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between mb-1">
            <p className="text-[10px] text-white/25 uppercase tracking-widest">Prompt positivo</p>
            <button onClick={async () => { await navigator.clipboard.writeText(item.prompt); setC1(true); setTimeout(() => setC1(false), 2000) }}
              className="text-[10px] text-white/25 hover:text-amber-400 transition-colors">{c1 ? '✓' : '⊕ Copiar'}</button>
          </div>
          <p className="text-white/70 text-xs font-mono bg-white/3 rounded-lg p-3 border border-white/8 leading-relaxed">{item.prompt}</p>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <p className="text-[10px] text-red-400/60 uppercase tracking-widest">Negative prompt</p>
            <button onClick={async () => { await navigator.clipboard.writeText(item.negativePrompt); setC2(true); setTimeout(() => setC2(false), 2000) }}
              className="text-[10px] text-white/25 hover:text-red-400 transition-colors">{c2 ? '✓' : '⊕ Copiar'}</button>
          </div>
          <p className="text-red-400/50 text-xs font-mono bg-red-500/3 rounded-lg p-3 border border-red-500/10 leading-relaxed">{item.negativePrompt}</p>
        </div>
        <div className="flex gap-2 pt-1 flex-wrap">
          <span className="tag tag-gray text-[10px]">{item.settings?.model}</span>
          <span className="tag tag-gray text-[10px]">{item.settings?.ratio}</span>
          <span className="tag tag-gray text-[10px]">{item.settings?.style}</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN RESULTS PANEL
// ─────────────────────────────────────────────
type Tab = 'copy' | 'leonardo' | 'guion' | 'imagenes' | 'videos' | 'meta' | 'tiktok' | 'hotmart' | 'secuencias' | 'catalogo' | 'ugc' | 'audiencias' | 'estructura' | 'hooks' | 'checklist' | 'metricas' | 'calendario'

type Props = { output: GenerationOutput; tool: string; imageUrl?: string; isLoadingImage?: boolean }

export default function ResultsPanel({ output, tool, imageUrl, isLoadingImage }: Props) {
  const [tab, setTab] = useState<Tab>('copy')
  const [regenerating, setRegenerating] = useState<number | null>(null)
  const [regeneratedCopies, setRegeneratedCopies] = useState<Record<number, {hook: string; cuerpo: string; cta: string}>>({})
  const [copiedVariant, setCopiedVariant] = useState<string | null>(null)

  const regenerateVariant = async (copyIndex: number, originalCopy: CopyVariant & {framework?: string; hook?: string; por_que_funciona?: string}) => {
    const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
    if (!apiKey) return
    setRegenerating(copyIndex)
    try {
      const prompt = `Sos experto en copywriting para Meta Ads. Tenés este copy con framework ${originalCopy.framework || 'desconocido'}:
Hook: ${originalCopy.hook || originalCopy.titular}
Titular: ${originalCopy.titular}
CTA: ${originalCopy.cta}

Generá 3 variantes ALTERNATIVAS del HOOK y el CUERPO — mismo framework, diferente apertura y enfoque. Mantenés el mismo producto y ángulo pero cambiás la forma de empezar.
Respondé SOLO con JSON:
{"variantes":[
  {"id":"A","hook":"nuevo hook variante A con emoji","cuerpo":"cuerpo completo variante A — 2-3 párrafos conversacionales","cta":"CTA variante A","angulo":"descripción del nuevo ángulo"},
  {"id":"B","hook":"variante B","cuerpo":"...","cta":"...","angulo":"..."},
  {"id":"C","hook":"variante C — el más disruptivo","cuerpo":"...","cta":"...","angulo":"..."}
]}`
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
      })
      const data = await res.json()
      const raw = data.content?.[0]?.text || ''
      let clean = raw.replace(/```json\s*/g,'').replace(/```\s*/g,'').trim()
      const s = clean.indexOf('{'), e = clean.lastIndexOf('}')
      if (s>=0 && e>s) clean = clean.slice(s, e+1)
      const parsed = JSON.parse(clean)
      setRegeneratedCopies(prev => ({ ...prev, [copyIndex]: parsed }))
    } catch { /* silent fail */ }
    setRegenerating(null)
  }
  const hasUGC = !!(output as GenerationOutput & { guionesUGC?: unknown[] }).guionesUGC?.length
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const outputExt = output as any

  // Collect ALL nano banana imagen prompts from copies/secuencias/catalogoPrompts
  const allImagenPrompts: { label: string; prompts: NanaBananaPrompts['imagen'] }[] = []
  const allVideoPrompts: { label: string; prompts: NanaBananaPrompts['video'] }[] = []

  output.copies?.forEach((v, i) => {
    const vExt = v as CopyVariant & { nanoBananaPrompts?: NanaBananaPrompts }
    if (vExt.nanoBananaPrompts?.imagen?.length) {
      allImagenPrompts.push({ label: `Variante ${i + 1} — ${(vExt as CopyVariant & { framework?: string }).framework || 'Copy'}`, prompts: vExt.nanoBananaPrompts.imagen })
    }
    if (vExt.nanoBananaPrompts?.video?.length) {
      allVideoPrompts.push({ label: `Variante ${i + 1} — ${(vExt as CopyVariant & { framework?: string }).framework || 'Copy'}`, prompts: vExt.nanoBananaPrompts.video })
    }
  })

  output.secuencias?.forEach((s, i) => {
    const sExt = s as typeof s & { nanoBananaPrompts?: NanaBananaPrompts }
    if (sExt.nanoBananaPrompts?.imagen?.length) allImagenPrompts.push({ label: `Slide ${i+1} — ${s.tipo}`, prompts: sExt.nanoBananaPrompts.imagen })
    if (sExt.nanoBananaPrompts?.video?.length) allVideoPrompts.push({ label: `Slide ${i+1} — ${s.tipo}`, prompts: sExt.nanoBananaPrompts.video })
  })

  output.catalogoPrompts?.forEach((c, i) => {
    const cExt = c as typeof c & { nanoBananaPrompts?: NanaBananaPrompts }
    if (cExt.nanoBananaPrompts?.imagen?.length) allImagenPrompts.push({ label: `${c.angulo} — ${c.fondo}`, prompts: cExt.nanoBananaPrompts.imagen })
    if (cExt.nanoBananaPrompts?.video?.length) allVideoPrompts.push({ label: `${c.angulo} — ${c.fondo}`, prompts: cExt.nanoBananaPrompts.video })
  })

  const hasImagenes = allImagenPrompts.length > 0 || !!imageUrl
  const hasVideos = allVideoPrompts.length > 0

  const allTabs = [
    { id: 'ugc' as Tab, label: '🎬 Guiones UGC', show: hasUGC },
    { id: 'copy' as Tab, label: 'Copy', show: !!(output.copies?.length) },
    { id: 'leonardo' as Tab, label: 'Leonardo.ai', show: !!(output.leonardoPrompts?.length) },
    { id: 'guion' as Tab, label: 'Guión Video', show: !!(output.guionVideo) },
    { id: 'imagenes' as Tab, label: '🖼 Imágenes', show: hasImagenes },
    { id: 'videos' as Tab, label: '🎬 Videos', show: hasVideos },
    { id: 'secuencias' as Tab, label: 'Secuencias', show: !!(output.secuencias?.length) },
    { id: 'catalogo' as Tab, label: 'Catálogo', show: !!(output.catalogoPrompts?.length) },
    { id: 'meta' as Tab, label: 'Meta Ads', show: !!(output.metaAds) },
    { id: 'tiktok' as Tab, label: 'TikTok', show: !!(output.tiktokScript) },
    { id: 'hotmart' as Tab, label: 'Hotmart', show: !!(output.hotmartFunnel) },
    { id: 'audiencias' as Tab, label: '🎯 Audiencias', show: !!(outputExt.perfilesAudiencia?.length) },
    { id: 'estructura' as Tab, label: '📊 Campaña', show: !!(outputExt.estructuraCampana) },
    { id: 'hooks' as Tab, label: '🪝 Hooks A/B', show: !!(outputExt.hooksAlternativos?.length) },
    { id: 'checklist' as Tab, label: '✅ Checklist', show: !!(outputExt.checklistLanzamiento) },
    { id: 'metricas' as Tab, label: '📈 Métricas', show: !!(outputExt.analisisMetricas) },
    { id: 'calendario' as Tab, label: '📅 Rotación', show: !!(outputExt.calendarioRotacion) },
  ]
  const tabs = allTabs.filter(t => t.show)

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 card rounded-xl overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === t.id ? 'bg-violet-600 text-white' : 'text-white/30 hover:text-white/60'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* UGC Creator */}
      {tab === 'ugc' && hasUGC && (() => {
        const ugcOutput = output as GenerationOutput & { guionesUGC: Array<{
          id: number; tipo: string; angulo: string; duracion_estimada: string
          hook_principal: string; hook_alternativo: string
          guion: { apertura: { segundos: string; texto: string; visual: string; nota_actuacion: string }
                   desarrollo: { segundos: string; texto: string; visual: string; nota_actuacion: string }
                   cierre_cta: { segundos: string; texto: string; visual: string; nota_actuacion: string } }
          briefing_creador: string
        }> }
        return (
          <div className="space-y-4">
            <div className="card p-3 border border-rose-500/15 bg-rose-500/5 text-xs text-rose-300/70">
              🎬 Guiones listos para grabar o enviar a creadores UGC.
            </div>
            {ugcOutput.guionesUGC.map((g, gi) => {
              const colors = ['border-rose-500/20', 'border-violet-500/20', 'border-amber-500/20']
              const headerColors = ['text-rose-300', 'text-violet-300', 'text-amber-300']
              return (
                <div key={g.id} className={`card p-4 border ${colors[gi] || 'border-white/10'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs font-bold uppercase tracking-wider ${headerColors[gi]}`}>Guión {g.id}</span>
                    <span className="tag tag-gray text-[10px]">{g.tipo}</span>
                    <span className="tag tag-gray text-[10px]">{g.duracion_estimada}</span>
                    <span className="tag tag-gray text-[10px]">{g.angulo}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/3 border border-white/8 rounded-lg p-3">
                      <p className="text-[10px] text-violet-400/70 uppercase tracking-widest mb-1">🎯 Hook A</p>
                      <p className="text-white font-bold text-sm">"{g.hook_principal}"</p>
                    </div>
                    <div className="bg-white/3 border border-white/8 rounded-lg p-3">
                      <p className="text-[10px] text-amber-400/70 uppercase tracking-widest mb-1">🔄 Hook B</p>
                      <p className="text-white/70 text-sm">"{g.hook_alternativo}"</p>
                    </div>
                  </div>
                  {[{ key: 'apertura', label: 'Apertura', color: 'text-emerald-400' },
                    { key: 'desarrollo', label: 'Desarrollo', color: 'text-blue-400' },
                    { key: 'cierre_cta', label: 'Cierre + CTA', color: 'text-rose-400' }].map(section => {
                    const s = g.guion[section.key as keyof typeof g.guion]
                    return (
                      <div key={section.key} className="mb-3 p-3 bg-white/3 border border-white/6 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${section.color}`}>{section.label}</span>
                          <span className="text-[10px] text-white/25 font-mono">{s.segundos}s</span>
                        </div>
                        <p className="text-white text-sm leading-relaxed mb-2 font-medium">"{s.texto}"</p>
                        <p className="text-white/40 text-xs">📹 {s.visual}</p>
                        <p className="text-white/30 text-xs mt-1 italic">🎭 {s.nota_actuacion}</p>
                      </div>
                    )
                  })}
                  <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/15 rounded-lg">
                    <p className="text-[10px] text-amber-400/70 uppercase tracking-widest mb-2">📋 Briefing para el creador/a</p>
                    <p className="text-white/60 text-xs leading-relaxed">{g.briefing_creador}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })()}

      {/* Copy tab */}
      {tab === 'copy' && output.copies && (
        <div className="space-y-3">{output.copies.map((v, i) => <CopyCard key={v.id} v={v} i={i} />)}</div>
      )}

      {/* Leonardo.ai tab */}
      {tab === 'leonardo' && output.leonardoPrompts && (
        <div className="space-y-3">
          <div className="card p-3 border border-amber-500/10 bg-amber-500/3 text-xs text-amber-400/70">
            ✦ Copiá el prompt en <strong>app.leonardo.ai</strong> → Image Generation.
          </div>
          {output.leonardoPrompts.map(p => <LeonardoCard key={p.id} item={p} />)}
        </div>
      )}

      {/* Guión Video tab */}
      {tab === 'guion' && output.guionVideo && (
        <div className="card p-4 border border-emerald-500/15 animate-fade-up">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-emerald-400 uppercase">Guión de Video</span>
            <span className="tag tag-green text-[10px]">{output.guionVideo.duracion}</span>
          </div>
          <div className="space-y-2">
            {output.guionVideo.estructura.map((e, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                <span className="text-[10px] font-mono text-emerald-400/60 bg-emerald-500/10 px-2 py-1 rounded flex-shrink-0 h-fit">{e.segundo}s</span>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">{e.escena}</p>
                  <p className="text-white text-xs font-medium mt-0.5">"{e.texto}"</p>
                  <p className="text-white/25 text-[10px] mt-0.5">→ {e.accion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IMÁGENES tab — DALL-E + todos los Nano Banana imagen */}
      {tab === 'imagenes' && (
        <div className="space-y-4 animate-fade-up">
          {/* DALL-E preview */}
          {(imageUrl || isLoadingImage) && (
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Imagen de referencia — DALL·E 3</span>
                {isLoadingImage && !imageUrl && <span className="text-xs text-white/30 flex items-center gap-1.5">
                  <span className="w-3 h-3 border border-violet-500/40 border-t-violet-500 rounded-full animate-spin"/>Generando...
                </span>}
              </div>
              <div className="aspect-video bg-white/3 flex items-center justify-center">
                {isLoadingImage && !imageUrl && <div className="text-center"><div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-2"/><p className="text-xs text-white/20">Generando imagen...</p></div>}
                {imageUrl && <img src={imageUrl} alt="Imagen generada" className="w-full h-full object-cover" />}
              </div>
              {imageUrl && <div className="px-4 py-2 border-t border-white/8 text-right"><a href={imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:text-violet-300">Abrir completa ↗</a></div>}
            </div>
          )}

          {/* Nano Banana imagen prompts grouped by variant */}
          {allImagenPrompts.length > 0 && (
            <div className="space-y-3">
              <div className="card p-3 border border-yellow-500/10 bg-yellow-500/3 text-xs text-yellow-400/70">
                🍌 Prompts de <strong>Nano Banana Pro</strong> para imagen — 3 formatos por variante. Copiá y pegá directamente en la herramienta.
              </div>
              {allImagenPrompts.map((group, gi) => (
                <div key={gi} className="card p-4 border border-yellow-500/15">
                  <p className="text-xs font-bold text-yellow-400 mb-3">{group.label}</p>
                  <div className="space-y-2">
                    {group.prompts.map((item, pi) => {
                      const fc = FORMAT_COLORS[item.formato] || { text: 'text-white/40', border: 'border-white/10', bg: 'bg-white/3' }
                      return (
                        <PromptCopyRow key={pi} item={item} fc={fc} />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!imageUrl && !isLoadingImage && allImagenPrompts.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-white/20 text-sm">Generá un creativo para ver los prompts de imagen aquí.</p>
            </div>
          )}
        </div>
      )}

      {/* VIDEOS tab — Nano Banana video prompts */}
      {tab === 'videos' && (
        <div className="space-y-3 animate-fade-up">
          <div className="card p-3 border border-yellow-500/10 bg-yellow-500/3 text-xs text-yellow-400/70">
            🍌 Prompts de <strong>Nano Banana Pro</strong> para video — 3 formatos por variante. Usá estos prompts para generar videos en Leonardo.ai con la narrativa de cada copy.
          </div>
          {allVideoPrompts.map((group, gi) => (
            <div key={gi} className="card p-4 border border-yellow-500/15">
              <p className="text-xs font-bold text-yellow-400 mb-3">{group.label}</p>
              <div className="space-y-2">
                {group.prompts.map((item, pi) => {
                  const fc = FORMAT_COLORS[item.formato] || { text: 'text-white/40', border: 'border-white/10', bg: 'bg-white/3' }
                  return <PromptCopyRow key={pi} item={item} fc={fc} />
                })}
              </div>
            </div>
          ))}
          {allVideoPrompts.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-white/20 text-sm">Generá un creativo para ver los prompts de video aquí.</p>
            </div>
          )}
        </div>
      )}

      {/* Secuencias tab */}
      {tab === 'secuencias' && output.secuencias && (
        <div className="space-y-3 animate-fade-up">
          <div className="card p-3 border border-blue-500/10 bg-blue-500/3 text-xs text-blue-400/70">
            ▤ Slides con prompts para Leonardo.ai y Nano Banana Pro en los 3 formatos.
          </div>
          {output.secuencias.map((s) => {
            const sExt = s as typeof s & { nanoBananaPrompts?: NanaBananaPrompts }
            return (
              <div key={s.id} className="card p-4 border border-blue-500/15">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{s.orden}</span>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{s.tipo}</span>
                  <span className="tag tag-gray text-[10px]">{s.ratio}</span>
                </div>
                <p className="text-white font-semibold text-sm mb-1">{s.titulo}</p>
                <p className="text-white/50 text-xs mb-3 leading-relaxed">{s.descripcion}</p>
                <p className="text-[10px] text-amber-400/60 uppercase tracking-widest mb-1">Prompt Leonardo.ai</p>
                <p className="text-white/60 text-xs font-mono bg-white/3 rounded-lg p-2.5 border border-white/8 leading-relaxed">{s.prompt}</p>
                {s.negativePrompt && <p className="text-red-400/40 text-[10px] mt-1"><span className="text-red-400/60 font-medium">— Neg: </span>{s.negativePrompt}</p>}
                {sExt.nanoBananaPrompts && <NanaBananaSection prompts={sExt.nanoBananaPrompts} />}
              </div>
            )
          })}
        </div>
      )}

      {/* Catálogo tab */}
      {tab === 'catalogo' && output.catalogoPrompts && (
        <div className="space-y-3 animate-fade-up">
          <div className="card p-3 border border-green-500/10 bg-green-500/3 text-xs text-green-400/70">
            ⊞ Prompts de catálogo con Leonardo.ai y Nano Banana Pro en los 3 formatos.
          </div>
          {output.catalogoPrompts.map((c) => {
            const cExt = c as typeof c & { nanoBananaPrompts?: NanaBananaPrompts }
            return (
              <div key={c.id} className="card p-4 border border-green-500/15">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-green-400 uppercase tracking-wider">{c.angulo}</span>
                    <span className="tag tag-gray text-[10px]">{c.fondo}</span>
                  </div>
                  <div className="flex gap-2 text-[10px] text-white/25">
                    <span>{c.settings?.model}</span>·<span>{c.settings?.ratio}</span>
                  </div>
                </div>
                <p className="text-[10px] text-amber-400/60 uppercase tracking-widest mb-1">Prompt Leonardo.ai</p>
                <p className="text-white/60 text-xs font-mono bg-white/3 rounded-lg p-2.5 border border-white/8 leading-relaxed">{c.prompt}</p>
                {c.negativePrompt && <p className="text-red-400/40 text-[10px] mt-1"><span className="text-red-400/60 font-medium">— Neg: </span>{c.negativePrompt}</p>}
                {cExt.nanoBananaPrompts && <NanaBananaSection prompts={cExt.nanoBananaPrompts} />}
              </div>
            )
          })}
        </div>
      )}

      {/* Meta Ads tab */}
      {tab === 'meta' && output.metaAds && (
        <div className="space-y-3 animate-fade-up">
          <div className="card p-4 border border-blue-500/15">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Segmentación de audiencia</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><p className="text-white/30 mb-1">Edad</p><p className="text-white">{output.metaAds.audiencia.edad}</p></div>
              <div><p className="text-white/30 mb-1">Ubicaciones</p><p className="text-white">{output.metaAds.audiencia.ubicaciones?.join(', ')}</p></div>
              <div><p className="text-white/30 mb-1">Intereses</p><div className="flex flex-wrap gap-1">{output.metaAds.audiencia.intereses?.map((item, n) => <span key={n} className="tag tag-blue text-[10px]">{item}</span>)}</div></div>
              <div><p className="text-white/30 mb-1">Presupuesto diario</p><p className="text-success font-semibold">{output.metaAds.presupuesto.diario_recomendado}</p></div>
            </div>
          </div>
          {output.metaAds.copies?.map((ad, i) => (
            <div key={i} className="card p-4">
              <p className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-3">Anuncio {i+1}</p>
              <div className="space-y-2 text-xs">
                <div><p className="text-white/30">Primario</p><p className="text-white/80 mt-0.5 leading-relaxed">{ad.primario}</p></div>
                <div><p className="text-white/30">Titular</p><p className="text-white font-semibold mt-0.5">{ad.titular}</p></div>
                <div><p className="text-white/30">Descripción</p><p className="text-white/70 mt-0.5">{ad.descripcion}</p></div>
                <span className="inline-block px-3 py-1 rounded-lg bg-violet-600/20 text-violet-300 text-xs font-semibold">{ad.cta}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TikTok tab */}
      {tab === 'tiktok' && output.tiktokScript && (
        <div className="space-y-3 animate-fade-up">
          {output.tiktokScript.guion?.map((g, i) => (
            <div key={i} className="card p-4 border border-pink-500/15">
              <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-3">Video {i+1} · {g.duracion}</p>
              <div className="space-y-2 text-xs">
                <div><p className="text-white/30">Hook (0-3s)</p><p className="text-white font-semibold mt-0.5 text-sm">"{g.hook}"</p></div>
                <div><p className="text-white/30">Desarrollo</p><p className="text-white/70 mt-0.5 leading-relaxed">{g.desarrollo}</p></div>
                <div><p className="text-white/30">CTA</p><span className="inline-block px-3 py-1 rounded-lg bg-pink-600/20 text-pink-300 font-semibold">{g.cta}</span></div>
                <div><p className="text-white/30">Música sugerida</p><p className="text-white/50">{g.musica_sugerida}</p></div>
              </div>
            </div>
          ))}
          <div className="card p-4">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Caption</p>
            <p className="text-white/70 text-sm leading-relaxed">{output.tiktokScript.caption}</p>
            <p className="text-pink-400/60 text-xs mt-2">{output.tiktokScript.hashtags?.join(' ')}</p>
          </div>
        </div>
      )}

      {/* AUDIENCIAS tab */}
      {tab === 'audiencias' && outputExt.perfilesAudiencia && (
        <div className="space-y-3 animate-fade-up">
          <div className="card p-3 border border-violet-500/10 bg-violet-500/3 text-xs text-violet-400/70">
            🎯 <strong>{outputExt.perfilesAudiencia.length} perfiles de audiencia</strong> generados por IA — del más frío al más caliente. Configurá un Ad Set por perfil.
          </div>
          {outputExt.perfilesAudiencia.map((p: any, i: number) => {
            const tempColors: Record<string, string> = { frio: 'border-sky-500/25 bg-sky-500/5', tibio: 'border-amber-500/25 bg-amber-500/5', caliente: 'border-orange-500/25 bg-orange-500/5', muy_caliente: 'border-red-500/25 bg-red-500/5' }
            const tempLabels: Record<string, string> = { frio: '🧊 Frío', tibio: '🌡️ Tibio', caliente: '🔥 Caliente', muy_caliente: '🚀 Muy caliente' }
            const tempTextColors: Record<string, string> = { frio: 'text-sky-400', tibio: 'text-amber-400', caliente: 'text-orange-400', muy_caliente: 'text-red-400' }
            const tc = tempColors[p.temperatura] || 'border-white/10'
            const tl = tempLabels[p.temperatura] || p.temperatura
            const ttc = tempTextColors[p.temperatura] || 'text-white/40'
            return (
              <div key={i} className={`card p-4 border ${tc}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${ttc}`}>{tl}</span>
                    <span className="text-white font-semibold text-sm">{p.nombre}</span>
                  </div>
                  <span className="tag tag-gray text-[10px]">{p.objetivo_meta}</span>
                </div>
                <p className="text-white/50 text-xs leading-relaxed mb-3">{p.descripcion}</p>
                <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                  <div>
                    <p className="text-white/30 mb-1">Demografía</p>
                    <p className="text-white/70">{p.demografia?.edad} · {p.demografia?.genero}</p>
                    <p className="text-white/50">{p.demografia?.ubicacion?.join(', ')}</p>
                    <p className="text-white/40">{p.demografia?.nivel_socioeconomico}</p>
                  </div>
                  <div>
                    <p className="text-white/30 mb-1">Presupuesto sugerido</p>
                    <p className="text-violet-300 font-bold text-sm">{p.presupuesto_sugerido}</p>
                    <p className="text-white/30 mt-1 text-[10px]">Copy recomendado</p>
                    <p className="text-white/60 text-[11px]">{p.copy_recomendado}</p>
                  </div>
                </div>
                {p.intereses?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Intereses</p>
                    <div className="flex flex-wrap gap-1">{p.intereses.map((item: string, n: number) => <span key={n} className="tag tag-blue text-[10px]">{item}</span>)}</div>
                  </div>
                )}
                {p.comportamientos?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Comportamientos</p>
                    <div className="flex flex-wrap gap-1">{p.comportamientos.map((item: string, n: number) => <span key={n} className="tag tag-green text-[10px]">{item}</span>)}</div>
                  </div>
                )}
                {p.exclusiones?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Excluir</p>
                    <div className="flex flex-wrap gap-1">{p.exclusiones.map((item: string, n: number) => <span key={n} className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400/70 text-[10px]">{item}</span>)}</div>
                  </div>
                )}
                <div className="mt-2 p-2 bg-violet-500/5 rounded-lg border border-violet-500/15">
                  <p className="text-violet-400/70 text-[10px] font-semibold">🔍 Fuente Lookalike</p>
                  <p className="text-white/50 text-[11px] mt-0.5">{p.lookalike_fuente}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ESTRUCTURA CAMPAÑA tab */}
      {tab === 'estructura' && outputExt.estructuraCampana && (
        <div className="space-y-3 animate-fade-up">
          <div className={`card p-4 border ${outputExt.estructuraCampana.tipo?.includes('CBO') ? 'border-violet-500/25' : 'border-amber-500/25'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{outputExt.estructuraCampana.tipo?.includes('CBO') ? '🏆' : '⚡'}</span>
              <span className="text-white font-bold">{outputExt.estructuraCampana.tipo}</span>
              <span className="tag tag-violet text-[10px]">{outputExt.estructuraCampana.objetivo_meta}</span>
            </div>
            <p className="text-white/50 text-xs leading-relaxed mb-3">{outputExt.estructuraCampana.razon}</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><p className="text-white/30">Campaña</p><p className="text-white/70 font-mono text-[11px]">{outputExt.estructuraCampana.campana}</p></div>
              <div><p className="text-white/30">Presupuesto total/día</p><p className="text-violet-300 font-bold">{outputExt.estructuraCampana.presupuesto_total_diario}</p></div>
            </div>
          </div>
          <div className="space-y-2">
            {outputExt.estructuraCampana.ad_sets?.map((adset: any, i: number) => (
              <div key={i} className="card p-3 border border-white/8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white/70">{adset.nombre}</span>
                  <span className="text-violet-300 text-xs font-bold">{adset.presupuesto_diario}</span>
                </div>
                <div className="flex gap-2 mb-1">
                  {adset.copies_asignados?.map((cid: number) => <span key={cid} className="tag tag-gray text-[10px]">Copy {cid}</span>)}
                </div>
                <p className="text-white/40 text-[11px]">{adset.objetivo}</p>
              </div>
            ))}
          </div>
          <div className="card p-4 border border-amber-500/15 space-y-3 text-xs">
            <div><p className="text-amber-400/70 font-semibold text-[10px] uppercase mb-1">⏳ Fase de aprendizaje</p><p className="text-white/60 leading-relaxed">{outputExt.estructuraCampana.fase_aprendizaje}</p></div>
            <div><p className="text-emerald-400/70 font-semibold text-[10px] uppercase mb-1">📈 Cuándo escalar</p><p className="text-white/60 leading-relaxed">{outputExt.estructuraCampana.cuando_escalar}</p></div>
            <div><p className="text-red-400/70 font-semibold text-[10px] uppercase mb-1">🛑 Cuándo matar</p><p className="text-white/60 leading-relaxed">{outputExt.estructuraCampana.cuando_matar}</p></div>
          </div>
        </div>
      )}

      {/* HOOKS ALTERNATIVOS tab */}
      {tab === 'hooks' && outputExt.hooksAlternativos && (
        <div className="space-y-4 animate-fade-up">
          <div className="card p-3 border border-violet-500/10 bg-violet-500/3 text-xs text-violet-400/70">
            🪝 3 variantes de hook por copy para A/B testing real. Cambiá solo el hook — manteniendo el mismo cuerpo — para identificar qué apertura convierte mejor.
          </div>
          {outputExt.hooksAlternativos.map((h: any, i: number) => (
            <div key={i} className="card p-4 border border-violet-500/15">
              <div className="flex items-center gap-2 mb-3">
                <span className="tag tag-violet text-[10px]">Copy {h.copy_id}</span>
                <span className="text-white/40 text-xs">Hook original:</span>
              </div>
              <p className="text-white/60 text-sm italic mb-3">"{h.hook_original}"</p>
              <div className="space-y-2">
                {h.variantes?.map((v: any) => (
                  <div key={v.id} className="p-3 bg-white/3 border border-white/8 rounded-lg">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-violet-400 uppercase">{v.id}</span>
                      <span className="tag tag-gray text-[10px]">{v.tipo}</span>
                    </div>
                    <p className="text-white font-semibold text-sm mb-1.5">"{v.hook}"</p>
                    <p className="text-white/35 text-[11px] italic">💡 {v.por_que_probar}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CHECKLIST tab */}
      {tab === 'checklist' && outputExt.checklistLanzamiento && (
        <div className="space-y-3 animate-fade-up">
          <div className="card p-3 border border-emerald-500/10 bg-emerald-500/3 text-xs text-emerald-400/70">
            ✅ Checklist de lanzamiento — completá cada ítem antes de activar la campaña. Los marcados como <strong>crítico</strong> son bloqueantes.
          </div>
          {Object.entries(outputExt.checklistLanzamiento).map(([section, items]: [string, any]) => {
            const sectionLabels: Record<string, string> = { pixel: '🔵 Pixel & Tracking', cuenta: '⚙️ Cuenta publicitaria', creatividades: '🎨 Creatividades', pagina_destino: '🌐 Página de destino', estrategia: '🧠 Estrategia' }
            return (
              <div key={section} className="card p-4 border border-white/8">
                <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">{sectionLabels[section] || section}</p>
                <div className="space-y-2">
                  {items.map((item: any, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${item.critico ? 'border-red-500/40 bg-red-500/10' : 'border-white/20 bg-white/5'}`}>
                        <span className={`text-[8px] ${item.critico ? 'text-red-400' : 'text-white/30'}`}>○</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white/70 text-xs">{item.item}</p>
                        {item.critico && <span className="text-[10px] text-red-400/60">crítico</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MÉTRICAS tab */}
      {tab === 'metricas' && outputExt.analisisMetricas && (
        <div className="space-y-3 animate-fade-up">
          <div className="card p-3 border border-blue-500/10 bg-blue-500/3 text-xs text-blue-400/70">
            📈 Rangos de referencia para este producto. Usalos para tomar decisiones en base a datos, no intuición.
          </div>
          <div className="space-y-2">
            {outputExt.analisisMetricas.kpis_principales?.map((kpi: any, i: number) => (
              <div key={i} className="card p-4 border border-white/8">
                <p className="text-xs font-bold text-white mb-3">{kpi.metrica}</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/20"><p className="text-[10px] text-red-400/60 mb-0.5">Malo</p><p className="text-red-400 font-bold text-xs">{kpi.rango_malo}</p></div>
                  <div className="text-center p-2 rounded-lg bg-amber-500/10 border border-amber-500/20"><p className="text-[10px] text-amber-400/60 mb-0.5">Bueno</p><p className="text-amber-400 font-bold text-xs">{kpi.rango_bueno}</p></div>
                  <div className="text-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"><p className="text-[10px] text-emerald-400/60 mb-0.5">Excelente</p><p className="text-emerald-400 font-bold text-xs">{kpi.rango_excelente}</p></div>
                </div>
                <p className="text-white/40 text-[11px] leading-relaxed">⚡ {kpi.accion_si_malo}</p>
              </div>
            ))}
          </div>
          <div className="card p-4 border border-white/8 space-y-3 text-xs">
            <div><p className="text-emerald-400/70 font-semibold text-[10px] uppercase mb-1">📈 Cuándo escalar</p><p className="text-white/60 leading-relaxed">{outputExt.analisisMetricas.cuando_escalar}</p></div>
            <div><p className="text-red-400/70 font-semibold text-[10px] uppercase mb-1">🛑 Cuándo matar</p><p className="text-white/60 leading-relaxed">{outputExt.analisisMetricas.cuando_matar}</p></div>
            <div><p className="text-amber-400/70 font-semibold text-[10px] uppercase mb-1">⚠️ Señales de fatiga</p>{outputExt.analisisMetricas.señales_de_fatiga?.map((s: string, i: number) => <p key={i} className="text-white/50 text-[11px]">• {s}</p>)}</div>
            <div><p className="text-white/30 font-semibold text-[10px] uppercase mb-1">⏱️ Tiempo para decidir</p><p className="text-white/60 leading-relaxed">{outputExt.analisisMetricas.dias_para_decidir}</p></div>
          </div>
        </div>
      )}

      {/* CALENDARIO ROTACIÓN tab */}
      {tab === 'calendario' && outputExt.calendarioRotacion && (
        <div className="space-y-3 animate-fade-up">
          <div className="card p-3 border border-purple-500/10 bg-purple-500/3 text-xs text-purple-400/70">
            📅 Plan de 4 semanas para lanzar, optimizar y escalar. Seguilo en orden para maximizar el ROAS.
          </div>
          {(['semana_1','semana_2','semana_3','semana_4'] as const).map((sem, i) => {
            const semData = outputExt.calendarioRotacion[sem]
            if (!semData) return null
            const colors = ['border-sky-500/20','border-violet-500/20','border-amber-500/20','border-emerald-500/20']
            const headerColors = ['text-sky-400','text-violet-400','text-amber-400','text-emerald-400']
            return (
              <div key={sem} className={`card p-4 border ${colors[i]}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${headerColors[i]}`}>Semana {i+1}</span>
                  <span className="text-white/50 text-xs">{semData.objetivo}</span>
                </div>
                <div className="space-y-2 mb-3">
                  {semData.acciones?.map((a: string, ai: number) => (
                    <div key={ai} className="flex gap-2 text-xs"><span className="text-white/20 flex-shrink-0">→</span><span className="text-white/60">{a}</span></div>
                  ))}
                </div>
                <div className="p-2.5 bg-white/3 rounded-lg border border-white/8">
                  <p className="text-[10px] text-white/30 mb-1">👁️ Qué mirar</p>
                  <p className="text-white/60 text-xs">{semData.que_mirar}</p>
                </div>
                <div className="mt-2 p-2.5 bg-violet-500/5 rounded-lg border border-violet-500/15">
                  <p className="text-[10px] text-violet-400/70 mb-1">🎯 Decisión al final de la semana</p>
                  <p className="text-white/60 text-xs">{semData.decision_al_final}</p>
                </div>
              </div>
            )
          })}
          {outputExt.calendarioRotacion.reglas_generales?.length > 0 && (
            <div className="card p-4 border border-white/8">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">📌 Reglas generales</p>
              <div className="space-y-2">
                {outputExt.calendarioRotacion.reglas_generales.map((r: string, i: number) => (
                  <div key={i} className="flex gap-2 text-xs"><span className="text-violet-400/40 flex-shrink-0">•</span><span className="text-white/60 leading-relaxed">{r}</span></div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hotmart tab */}
      {tab === 'hotmart' && output.hotmartFunnel && (
        <div className="space-y-3 animate-fade-up">
          <div className="card p-4 border border-orange-500/15">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3">Página de ventas</p>
            <div className="space-y-2 text-xs">
              <div><p className="text-white/30">Headline</p><p className="text-white font-bold text-base mt-0.5">{output.hotmartFunnel.pagina_ventas.headline}</p></div>
              <div><p className="text-white/30">Subheadline</p><p className="text-white/70 mt-0.5">{output.hotmartFunnel.pagina_ventas.subheadline}</p></div>
              <div><p className="text-white/30 mb-1">Beneficios</p>{output.hotmartFunnel.pagina_ventas.beneficios?.map((b, i) => <p key={i} className="text-white/70 flex gap-2">✓ {b}</p>)}</div>
              <div><p className="text-white/30">CTA principal</p><span className="inline-block px-4 py-2 bg-orange-500/20 text-orange-300 rounded-lg font-bold mt-1">{output.hotmartFunnel.pagina_ventas.cta_principal}</span></div>
            </div>
          </div>
          {output.hotmartFunnel.emails?.map((email, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-bold text-white/60 uppercase">Email {i+1}</p>
                <span className="tag tag-gray text-[10px]">{email.tipo}</span>
              </div>
              <p className="text-white font-semibold text-sm mb-2">Asunto: {email.asunto}</p>
              <p className="text-white/60 text-xs leading-relaxed">{email.cuerpo}</p>
            </div>
          ))}
          {output.hotmartFunnel.whatsapp_scripts?.map((script, i) => (
            <div key={i} className="card p-4 border border-green-500/15">
              <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">WhatsApp Script {i+1}</p>
              <p className="text-white/70 text-xs leading-relaxed">{script}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Helper component para filas de prompt con copy
function PromptCopyRow({ item, fc }: { item: { formato: string; prompt: string; negativePrompt: string }; fc: { text: string; border: string; bg: string } }) {
  const [copied, setCopied] = useState(false)
  const [showRegen, setShowRegen] = useState(false)
  const [regenInstr, setRegenInstr] = useState('')
  const [regenLoading, setRegenLoading] = useState(false)
  const [regenResult, setRegenResult] = useState<{ hook: string; titular: string; cuerpo: string; cta: string } | null>(null)
  const [regenCopied, setRegenCopied] = useState(false)
  return (
    <div className={`rounded-lg border p-2.5 ${fc.border} ${fc.bg}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${fc.text}`}>{item.formato}</span>
        <button onClick={async () => { await navigator.clipboard.writeText(item.prompt); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="text-[10px] text-white/25 hover:text-yellow-400 transition-colors">
          {copied ? '✓ Copiado' : '⊕ Copiar'}
        </button>
      </div>
      <p className="text-white/70 text-[11px] font-mono leading-relaxed bg-black/20 rounded p-2 border border-white/5">{item.prompt}</p>
      {item.negativePrompt && <p className="text-red-400/40 text-[10px] mt-1"><span className="text-red-400/60 font-medium">— Neg: </span>{item.negativePrompt}</p>}
    </div>
  )
}
