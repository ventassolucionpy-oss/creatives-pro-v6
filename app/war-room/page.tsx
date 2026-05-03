'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { getPaisConfig, type Pais } from '@/lib/constants'
import Link from 'next/link'

type CampaignStatus = {
  nombre: string
  plataforma: 'meta' | 'tiktok'
  roas: number
  gasto_hoy: number
  gasto_ayer: number
  conversiones_hoy: number
  ctr: number
  frecuencia: number
  presupuesto: number
  estado: 'escalando' | 'estable' | 'fatiga' | 'muriendo' | 'nueva'
  tendencia: 'subiendo' | 'igual' | 'bajando'
  accion_urgente?: string
}

type WarRoomAnalysis = {
  semaforo: 'verde' | 'amarillo' | 'rojo'
  resumen: string
  decision_numero_1: string
  campanas_accion: Array<{ campana: string; accion: string; por_que: string; cuando: string }>
  dinero_en_riesgo: string
  oportunidad_perdida: string
  proximas_24h: string[]
  proyeccion_revenue: string
}

async function analyzeWarRoom(campaigns: CampaignStatus[], contexto: string): Promise<WarRoomAnalysis> {
    const summary = campaigns.map(c =>
    `"${c.nombre}" [${c.plataforma.toUpperCase()}]: ROAS ${c.roas.toFixed(2)}x | Hoy Gs.${Math.round(c.gasto_hoy*6350)} (Ayer Gs.${Math.round(c.gasto_ayer*6350)}) | CTR ${c.ctr.toFixed(2)}% | Frecuencia ${c.frecuencia.toFixed(1)} | Tendencia: ${c.tendencia.toUpperCase()} | Estado: ${c.estado.toUpperCase()}`
  ).join('\n')

  const prompt = `Sos el Chief Media Buyer de una operación de ecommerce en ${paisCfg.nombre} con presupuesto alto en ad spend. Estás en la sala de guerra revisando el estado de TODAS las campañas ahora mismo. Contexto: ${paisCfg.contexto_cultural}

ESTADO ACTUAL DE TODAS LAS CAMPAÑAS:
${summary}

CONTEXTO ADICIONAL DEL OPERADOR: ${contexto || 'Sin contexto adicional.'}

Tu trabajo: dar un diagnóstico BRUTAL y honesto en 60 segundos. Sin rodeos. Las decisiones que tomes hoy valen miles de dólares.

Respondé SOLO con JSON válido:
{
  "semaforo": "verde | amarillo | rojo",
  "resumen": "1-2 líneas brutalmente honestas sobre el estado general. Como si le hablaras a alguien que perdió Gs. 60.000.000 si no actúa.",
  "decision_numero_1": "la única decisión MÁS IMPORTANTE que debés tomar ahora mismo y por qué",
  "campanas_accion": [
    {
      "campana": "nombre exacto",
      "accion": "ESCALAR 30% | PAUSAR | MATAR | DUPLICAR | REFRESCAR CREATIVO | CAMBIAR AUDIENCIA",
      "por_que": "razón específica con números",
      "cuando": "AHORA | Hoy antes de las 3pm | Mañana temprano | Esta semana"
    }
  ],
  "dinero_en_riesgo": "cuánto dinero estás quemando en campañas que deberías pausar ya",
  "oportunidad_perdida": "cuánto dinero estás dejando sobre la mesa por no escalar lo que funciona",
  "proximas_24h": ["acción 1 en las próximas 24hs", "acción 2", "acción 3"],
  "proyeccion_revenue": "si ejecutás las acciones, qué revenue proyectás en los próximos 7 días vs el actual"
}`

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  })
  const data = await res.json()
  const raw = data.text || ''
  let clean = raw.replace(/```json\s*/g,'').replace(/```\s*/g,'').trim()
  const s = clean.indexOf('{'), e = clean.lastIndexOf('}')
  if (s >= 0 && e > s) clean = clean.slice(s, e+1)
  return JSON.parse(clean)
}

const EMPTY_CAMPAIGN: CampaignStatus = {
  nombre: '', plataforma: 'meta', roas: 0, gasto_hoy: 0, gasto_ayer: 0,
  conversiones_hoy: 0, ctr: 0, frecuencia: 0, presupuesto: 0, estado: 'nueva', tendencia: 'igual',
}

const estadoColors: Record<string, string> = {
  escalando: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  estable: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  fatiga: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  muriendo: 'text-red-400 bg-red-500/10 border-red-500/30',
  nueva: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
}
const tendenciaIcon: Record<string, string> = { subiendo: '↑', igual: '→', bajando: '↓' }
const tendenciaColor: Record<string, string> = { subiendo: 'text-emerald-400', igual: 'text-white/40', bajando: 'text-red-400' }

export default function WarRoomPage() {
  const [campaigns, setCampaigns] = useState<CampaignStatus[]>([{ ...EMPTY_CAMPAIGN, nombre: '' }])
  const [contexto, setContexto] = useState('')
  const [analysis, setAnalysis] = useState<WarRoomAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'input' | 'analysis'>('input')

  const addCampaign = () => setCampaigns(p => [...p, { ...EMPTY_CAMPAIGN }])
  const removeCampaign = (i: number) => setCampaigns(p => p.filter((_, j) => j !== i))
  const updateCampaign = (i: number, field: keyof CampaignStatus, value: string | number) => {
    setCampaigns(p => p.map((c, j) => j === i ? { ...c, [field]: value } : c))
  }

  const analyze = async () => {
    const valid = campaigns.filter(c => c.nombre.trim() && c.roas > 0)
    if (valid.length === 0) { setError('Agregá al menos 1 campaña con nombre y ROAS.'); return }
    setAnalyzing(true); setError('')
    try {
      const result = await analyzeWarRoom(valid, contexto)
      setAnalysis(result); setStep('analysis')
    } catch { setError('Error al analizar. Revisá tu API key.') }
    setAnalyzing(false)
  }

  const semaforoConfig = {
    verde: { color: 'border-emerald-500/40 bg-emerald-500/8', dot: 'bg-emerald-400', label: '🟢 TODO BAJO CONTROL' },
    amarillo: { color: 'border-amber-500/40 bg-amber-500/8', dot: 'bg-amber-400 animate-pulse', label: '🟡 ATENCIÓN REQUERIDA' },
    rojo: { color: 'border-red-500/40 bg-red-500/8', dot: 'bg-red-400 animate-pulse', label: '🔴 ACCIÓN URGENTE' },
  }

  const accionStyle = (a: string) => {
    if (a.includes('ESCALAR') || a.includes('DUPLICAR')) return 'bg-emerald-500 text-white'
    if (a.includes('MATAR') || a.includes('PAUSAR')) return 'bg-red-500/30 text-red-300'
    if (a.includes('REFRESCAR') || a.includes('CAMBIAR')) return 'bg-amber-500/30 text-amber-300'
    return 'bg-blue-500/30 text-blue-300'
  }

  const inputClass = 'input text-sm'
  const labelClass = 'block text-[10px] font-medium text-white/35 mb-1'

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/gestionar" className="btn-ghost text-white/30 hover:text-white p-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">War Room</h1>
              <span className="tag tag-red text-[10px]" style={{background:'rgba(239,68,68,0.15)',color:'#f87171',border:'1px solid rgba(239,68,68,0.3)'}}>⚡ Decisiones en tiempo real</span>
            </div>
            <p className="text-white/40 text-xs">Cargá el estado de TODAS tus campañas → la IA actúa como tu Chief Media Buyer</p>
          </div>
        </div>

        {step === 'input' && (
          <div className="space-y-5 animate-fade-up">
            <div className="card p-4 border border-red-500/15 bg-red-500/5">
              <p className="text-red-300 text-xs font-bold mb-1">Para qué sirve el War Room</p>
              <p className="text-white/50 text-xs leading-relaxed">Cada mañana cargás el estado de tus campañas activas (Meta + TikTok). La IA actúa como un Chief Media Buyer con $5M en ad spend — te da un diagnóstico brutal, te dice exactamente qué pausar, qué escalar y cuánto dinero estás perdiendo por no actuar.</p>
            </div>

            {/* Campañas */}
            <div className="space-y-4">
              {campaigns.map((c, i) => (
                <div key={i} className="card p-4 border border-white/8 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-xs font-semibold">Campaña {i + 1}</p>
                    {campaigns.length > 1 && (
                      <button onClick={() => removeCampaign(i)} className="text-red-400/50 hover:text-red-400 text-xs transition-colors">✕ Quitar</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className={labelClass}>Nombre del ad / campaña *</label>
                      <input className={inputClass} value={c.nombre} onChange={e => updateCampaign(i, 'nombre', e.target.value)} placeholder="Ej: UGC Crema Anti-arrugas — AIDA" />
                    </div>
                    <div>
                      <label className={labelClass}>Plataforma</label>
                      <select className={`${inputClass} cursor-pointer`} value={c.plataforma} onChange={e => updateCampaign(i, 'plataforma', e.target.value)} style={{background:'#111'}}>
                        <option value="meta">Meta (FB/IG)</option>
                        <option value="tiktok">TikTok Shop</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Estado actual</label>
                      <select className={`${inputClass} cursor-pointer`} value={c.estado} onChange={e => updateCampaign(i, 'estado', e.target.value)} style={{background:'#111'}}>
                        <option value="nueva">Nueva / Testing</option>
                        <option value="escalando">Escalando 🚀</option>
                        <option value="estable">Estable →</option>
                        <option value="fatiga">Con fatiga ⚠️</option>
                        <option value="muriendo">Muriendo 📉</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { f: 'roas', l: 'ROAS actual', ph: '2.5', step: '0.01' },
                      { f: 'gasto_hoy', l: 'Gasto hoy (USD)', ph: '45', step: '1' },
                      { f: 'gasto_ayer', l: 'Gasto ayer (USD)', ph: '40', step: '1' },
                      { f: 'ctr', l: 'CTR (%)', ph: '1.8', step: '0.01' },
                      { f: 'frecuencia', l: 'Frecuencia', ph: '2.1', step: '0.1' },
                      { f: 'presupuesto', l: 'Presupuesto/día (USD ≈ Gs. 6.350)', ph: '50', step: '1' },
                    ].map(field => (
                      <div key={field.f}>
                        <label className={labelClass}>{field.l}</label>
                        <input className={inputClass} type="number" step={field.step} placeholder={field.ph}
                          value={(c[field.f as keyof CampaignStatus] as number) || ''}
                          onChange={e => updateCampaign(i, field.f as keyof CampaignStatus, parseFloat(e.target.value) || 0)} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className={labelClass}>Tendencia (vs ayer)</label>
                    <div className="flex gap-2">
                      {(['subiendo','igual','bajando']).map(t => (
                        <button key={t} type="button" onClick={() => updateCampaign(i, 'tendencia', t)}
                          className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${c.tendencia === t ? 'border-violet-500 bg-violet-500/15 text-violet-300' : 'border-white/10 bg-white/3 text-white/40'}`}>
                          {tendenciaIcon[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addCampaign} className="btn-secondary w-full py-2.5 text-sm">
              + Agregar otra campaña
            </button>

            <div>
              <label className={`${labelClass} text-[11px]`}>Contexto adicional (opcional)</label>
              <textarea className={`${inputClass} resize-none h-16`} value={contexto} onChange={e => setContexto(e.target.value)}
                placeholder="Ej: Lanzamos un producto nuevo ayer, tenemos Black Friday en 3 días, el creativo ganador se está agotando..." />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={analyze} disabled={analyzing} className="btn-primary w-full py-4 text-base">
              {analyzing ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2"/>Analizando todas las campañas...</> : '⚡ Activar War Room →'}
            </button>
          </div>
        )}

        {step === 'analysis' && analysis && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-white font-bold">War Room — {new Date().toLocaleDateString('es-PY', {weekday:'long',day:'2-digit',month:'long'})}</h2>
              <button onClick={() => setStep('input')} className="btn-secondary text-xs px-3 py-2">← Actualizar datos</button>
            </div>

            {/* Semáforo */}
            <div className={`card p-5 border rounded-2xl ${semaforoConfig[analysis.semaforo].color}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-4 h-4 rounded-full ${semaforoConfig[analysis.semaforo].dot}`} />
                <p className="text-white font-bold text-base">{semaforoConfig[analysis.semaforo].label}</p>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{analysis.resumen}</p>
            </div>

            {/* La decisión más importante */}
            <div className="card p-5 border border-amber-500/30 bg-amber-500/8">
              <p className="text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-2">⚡ Decisión #1 — Hacela AHORA</p>
              <p className="text-white font-semibold text-sm leading-relaxed">{analysis.decision_numero_1}</p>
            </div>

            {/* Dinero en riesgo vs oportunidad */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card p-4 border border-red-500/25 bg-red-500/5">
                <p className="text-red-400 text-[10px] font-bold uppercase mb-1">💸 Dinero en riesgo</p>
                <p className="text-white/70 text-sm leading-relaxed">{analysis.dinero_en_riesgo}</p>
              </div>
              <div className="card p-4 border border-emerald-500/25 bg-emerald-500/5">
                <p className="text-emerald-400 text-[10px] font-bold uppercase mb-1">📈 Oportunidad perdida</p>
                <p className="text-white/70 text-sm leading-relaxed">{analysis.oportunidad_perdida}</p>
              </div>
            </div>

            {/* Acciones por campaña */}
            <div>
              <p className="text-xs font-semibold text-white/25 uppercase tracking-widest mb-3">Decisiones por campaña</p>
              <div className="space-y-2">
                {analysis.campanas_accion.map((a, i) => (
                  <div key={i} className="card p-4 border border-white/8">
                    <div className="flex items-start gap-3 mb-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${accionStyle(a.accion)}`}>{a.accion}</span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">{a.campana}</p>
                        <p className="text-white/25 text-[10px]">Cuándo: {a.cuando}</p>
                      </div>
                    </div>
                    <p className="text-white/65 text-xs leading-relaxed">{a.por_que}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Próximas 24hs */}
            <div className="card p-4 border border-violet-500/15 bg-violet-500/5">
              <p className="text-violet-300 text-[10px] font-bold uppercase tracking-wider mb-3">📋 Checklist próximas 24hs</p>
              <div className="space-y-2">
                {analysis.proximas_24h.map((a, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded border border-violet-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-violet-400 text-[9px]">{i+1}</span>
                    </div>
                    <p className="text-white/70 text-xs leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Proyección */}
            <div className="card p-4 border border-blue-500/15 bg-blue-500/5">
              <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-1">📈 Proyección de Revenue</p>
              <p className="text-white/70 text-sm leading-relaxed">{analysis.proyeccion_revenue}</p>
            </div>

            {/* Links */}
            <div className="flex gap-2 pt-2 flex-wrap">
              <Link href="/meta-tracker" className="btn-secondary flex-1 text-center text-xs py-2.5">📘 Meta Tracker</Link>
              <Link href="/tiktok-tracker" className="btn-secondary flex-1 text-center text-xs py-2.5">🎵 TikTok Tracker</Link>
              <Link href="/rentabilidad" className="btn-secondary flex-1 text-center text-xs py-2.5">💰 Rentabilidad</Link>
            </div>
            <div className="flex gap-2 pt-1">
              <Link href="/portfolio" className="flex-1 text-center py-2 rounded-xl border border-white/10 text-white/30 hover:text-white/60 text-xs transition-all">📋 Portfolio</Link>
              <Link href="/kpis" className="flex-1 text-center py-2 rounded-xl border border-white/10 text-white/30 hover:text-white/60 text-xs transition-all">📊 KPIs</Link>
              <Link href="/presupuesto-escalado" className="flex-1 text-center py-2 rounded-xl border border-white/10 text-white/30 hover:text-white/60 text-xs transition-all">📈 Escalar</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
