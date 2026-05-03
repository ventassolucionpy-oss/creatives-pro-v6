'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type SpyOutput = {
  analisis: {
    angulo_detectado: string
    framework_copy: string
    nivel_conciencia: string
    hook_estructura: string
    por_que_funciona: string
    publico_objetivo_inferido: string
    tipo_creativo: string
    call_to_action: string
    elementos_urgencia: string[]
    puntos_debiles: string[]
  }
  versiones_mejoradas: Array<{
    id: number
    framework: string
    angulo: string
    mejora: string
    hook: string
    titular: string
    cuerpo: string
    cta: string
    por_que_convierte_mas: string
    hashtags: string[]
  }>
  estrategia_uso: string
}

async function callClaude(prompt: string): Promise<SpyOutput> {
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
  return JSON.parse(clean) as SpyOutput
}

function buildSpyPrompt(adCopy: string, myProduct: string, myDescription: string): string {
  return `Sos un experto en análisis de anuncios de Meta Ads y TikTok Ads con 10+ años de experiencia. Tu especialidad es diseccionar qué hace funcionar un anuncio y replicar esa efectividad para otros productos.

ANUNCIO A ANALIZAR:
"${adCopy}"

MI PRODUCTO:
- Nombre: ${myProduct}
- Descripción: ${myDescription}

TAREA:
1. Analizá en profundidad el anuncio de la competencia: detectá el ángulo, framework, hook, estructura psicológica, nivel de conciencia al que apunta, por qué funciona.
2. Creá 3 versiones MEJORADAS adaptadas a mi producto — usando las mismas técnicas psicológicas que detectaste pero con copy 100% original para mi producto.

Las versiones mejoradas deben:
- Usar el mismo ángulo que funciona en el original pero aplicado a mi producto
- Corregir los puntos débiles del original
- Sonar 100% originales (no copias)
- Estar optimizadas para LATAM

Respondé SOLO con JSON válido:
{
  "analisis": {
    "angulo_detectado": "el ángulo principal de venta que usa el anuncio",
    "framework_copy": "AIDA / PAS / HSO / BAB / FAB / otro",
    "nivel_conciencia": "Nivel 1-5 al que apunta y por qué",
    "hook_estructura": "análisis del hook: qué técnica usa para parar el scroll",
    "por_que_funciona": "explicación de la psicología de conversión detrás del anuncio",
    "publico_objetivo_inferido": "a quién le habla este anuncio basándote en el copy",
    "tipo_creativo": "imagen estática / video UGC / carrusel / video producido",
    "call_to_action": "análisis del CTA: qué tan efectivo es y por qué",
    "elementos_urgencia": ["elemento de urgencia/escasez 1 detectado", "elemento 2"],
    "puntos_debiles": ["punto débil del original 1 que vas a mejorar", "punto débil 2"]
  },
  "versiones_mejoradas": [
    {
      "id": 1,
      "framework": "mismo framework que el original",
      "angulo": "el ángulo adaptado a mi producto",
      "mejora": "qué mejorás respecto al original",
      "hook": "hook mejorado con emoji para mi producto (para el scroll en <2s)",
      "titular": "titular del anuncio (máx 40 chars)",
      "cuerpo": "texto principal completo 3-4 párrafos conversacionales",
      "cta": "CTA específico orientado a resultado",
      "por_que_convierte_mas": "por qué esta versión convierte más que el original",
      "hashtags": ["#tag1","#tag2","#tag3"]
    },
    { "id": 2, "framework": "PAS — enfocado en el dolor", "angulo": "...", "mejora": "...", "hook": "...", "titular": "...", "cuerpo": "...", "cta": "...", "por_que_convierte_mas": "...", "hashtags": ["#tag1","#tag2","#tag3"] },
    { "id": 3, "framework": "BAB — transformación completa", "angulo": "...", "mejora": "...", "hook": "...", "titular": "...", "cuerpo": "...", "cta": "...", "por_que_convierte_mas": "...", "hashtags": ["#tag1","#tag2","#tag3"] }
  ],
  "estrategia_uso": "recomendación de cómo usar estas versiones: qué testear primero, qué presupuesto asignar, qué público usar para cada variante"
}`
}

export default function SpyPage() {
  const [adCopy, setAdCopy] = useState('')
  const [myProduct, setMyProduct] = useState('')
  const [myDescription, setMyDescription] = useState('')
  const [output, setOutput] = useState<SpyOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const analyze = async () => {
    if (!adCopy.trim() || !myProduct.trim()) return
    setLoading(true); setError(''); setOutput(null)
    try {
      const result = await callClaude(buildSpyPrompt(adCopy, myProduct, myDescription))
      setOutput(result)
    } catch (e) { setError(e instanceof Error ? e.message : 'Error') }
    setLoading(false)
  }

  const copyText = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const save = async () => {
    if (!output) return
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('generations').insert({ user_id: user.id, tool: 'spy-anuncio', status: 'completed', input: { adCopy, myProduct, myDescription }, output })
      setSaved(true)
    }
  }

  const fwColors: Record<string, string> = { AIDA: 'tag-violet', PAS: 'tag-red', HSO: 'tag-gold', BAB: 'tag-green', FAB: 'tag-blue' }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">

        <div className="flex items-center gap-3 mb-8">
          <Link href="/crear" className="btn-ghost text-white/30 hover:text-white p-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">Spy & Clonar Anuncio</h1>
              <span className="tag tag-red text-[10px]">🔍 Inteligencia</span>
            </div>
            <p className="text-white/40 text-xs">Pegá un anuncio de la competencia — la IA lo disecciona y crea 3 versiones mejoradas para tu producto</p>
          </div>
        </div>

        {!output && (
          <div className="space-y-5 animate-fade-up">
            <div className="card p-4 border border-amber-500/15 bg-amber-500/5">
              <p className="text-amber-300 text-xs font-bold mb-2">Dónde encontrar anuncios de la competencia</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { n: 'Meta Ad Library', url: 'facebook.com/ads/library', icon: '📘' },
                  { n: 'TikTok Creative Center', url: 'ads.tiktok.com/business/creativecenter', icon: '🎵' },
                  { n: 'Minea', url: 'minea.com', icon: '🔍' },
                  { n: 'Dropi / Kalodata', url: 'dropi.co / kalodata.com', icon: '📊' },
                ].map(s => (
                  <div key={s.n} className="flex items-center gap-2 p-2 bg-white/3 rounded-lg">
                    <span className="text-base">{s.icon}</span>
                    <div><p className="text-white/70 text-xs font-medium">{s.n}</p><p className="text-white/30 text-[10px]">{s.url}</p></div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5">Texto del anuncio a analizar *</label>
              <textarea className="input resize-none h-32 text-sm" value={adCopy} onChange={e => setAdCopy(e.target.value)}
                placeholder="Pegá el copy completo del anuncio de la competencia — headline, cuerpo, CTA, hashtags. Cuanto más completo, mejor el análisis." />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5">Mi producto *</label>
              <input className="input" value={myProduct} onChange={e => setMyProduct(e.target.value)} placeholder="Nombre de tu producto" />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5">Descripción de mi producto</label>
              <textarea className="input resize-none h-20 text-sm" value={myDescription} onChange={e => setMyDescription(e.target.value)}
                placeholder="Qué es, qué problema resuelve, cuál es el beneficio principal..." />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button onClick={analyze} disabled={!adCopy.trim() || !myProduct.trim() || loading} className="btn-primary w-full py-4 text-base">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />Analizando y mejorando...</>
                : '🔍 Analizar y crear 3 versiones mejoradas →'}
            </button>
          </div>
        )}

        {output && (
          <div className="space-y-5 animate-fade-up">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold">Análisis completo</h2>
              <div className="flex gap-2">
                <button onClick={save} disabled={saved} className={`text-xs px-3 py-2 rounded-lg border transition-all ${saved ? 'border-emerald-500/40 text-emerald-400' : 'border-white/15 text-white/50 hover:border-white/30'}`}>
                  {saved ? '✓ Guardado' : '💾 Guardar'}
                </button>
                <button onClick={() => { setOutput(null); setSaved(false) }} className="btn-secondary text-xs px-3 py-2">← Nuevo análisis</button>
              </div>
            </div>

            {/* Análisis */}
            <div className="card p-5 border border-amber-500/15 space-y-3">
              <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">🔍 Disección del anuncio original</p>
              {[
                ['Ángulo detectado', output.analisis.angulo_detectado],
                ['Framework de copy', output.analisis.framework_copy],
                ['Nivel de conciencia', output.analisis.nivel_conciencia],
                ['Estructura del Hook', output.analisis.hook_estructura],
                ['Público inferido', output.analisis.publico_objetivo_inferido],
                ['Por qué funciona', output.analisis.por_que_funciona],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <p className="text-white/30 text-xs w-32 flex-shrink-0">{label}</p>
                  <p className="text-white/70 text-xs leading-relaxed flex-1">{value}</p>
                </div>
              ))}
              {output.analisis.puntos_debiles?.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <p className="text-red-400/60 text-[10px] uppercase mb-1.5">⚠️ Puntos débiles que vas a mejorar</p>
                  {output.analisis.puntos_debiles.map((p, i) => <p key={i} className="text-white/50 text-xs">• {p}</p>)}
                </div>
              )}
            </div>

            {/* Estrategia */}
            <div className="card p-4 border border-violet-500/15 bg-violet-500/5">
              <p className="text-violet-300 text-xs font-bold mb-2">🧠 Estrategia de uso recomendada</p>
              <p className="text-white/60 text-sm leading-relaxed">{output.estrategia_uso}</p>
            </div>

            {/* Versiones mejoradas */}
            <p className="text-xs font-semibold text-white/25 uppercase tracking-widest">3 versiones mejoradas para tu producto</p>
            {output.versiones_mejoradas.map((v, i) => {
              const borders = ['border-violet-500/20', 'border-amber-500/20', 'border-emerald-500/20']
              const full = `🎯 ${v.hook}\n\n${v.titular}\n\n${v.cuerpo}\n\n${v.cta}\n\n${v.hashtags?.join(' ')}`
              return (
                <div key={v.id} className={`card p-4 border ${borders[i % 3]}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`tag ${fwColors[v.framework?.split(' ')[0]] || 'tag-gray'} text-[10px]`}>{v.framework}</span>
                      <span className="text-[10px] text-white/30">{v.mejora}</span>
                    </div>
                    <button onClick={() => copyText(full, `v${v.id}`)} className="text-[10px] text-white/25 hover:text-violet-400 transition-colors">
                      {copiedId === `v${v.id}` ? '✓ Copiado' : '⊕ Copiar todo'}
                    </button>
                  </div>
                  <div className="p-3 bg-violet-500/8 border border-violet-500/20 rounded-lg mb-3">
                    <p className="text-[10px] text-violet-400/60 mb-1">🎯 Hook mejorado</p>
                    <p className="text-white font-bold text-sm">{v.hook}</p>
                  </div>
                  <p className="text-white font-semibold text-sm mb-2">{v.titular}</p>
                  <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line mb-3">{v.cuerpo}</p>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-white/8 rounded-lg text-xs font-semibold text-white/80">{v.cta}</span>
                    <p className="text-violet-400/50 text-[10px]">{v.hashtags?.join(' ')}</p>
                  </div>
                  <p className="text-emerald-400/60 text-[10px] italic mt-3 pt-2 border-t border-white/5">💡 {v.por_que_convierte_mas}</p>
                </div>
              )
            })}
          </div>
        )}
        {output && (
          <div className="grid grid-cols-2 gap-2 mt-4 px-4 pb-4">
            <Link href="/comparador-copies" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-violet-500/30 transition-all"><span>⚖️</span><div><p className="text-white text-xs font-bold">Comparar copies</p><p className="text-white/30 text-[10px]">Rankeá estos copies</p></div></Link>
            <Link href="/hooks-biblioteca" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-violet-500/30 transition-all"><span>🎣</span><div><p className="text-white text-xs font-bold">Guardar hook</p><p className="text-white/30 text-[10px]">En tu biblioteca</p></div></Link>
          </div>
        )}
      </main>
    </div>
  )
}
