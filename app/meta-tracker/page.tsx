'use client'
export const dynamic = 'force-dynamic'
import { useState, useRef } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

// ---------------------------------------------
// TYPES
// ---------------------------------------------
type MetaAd = {
  nombre: string
  estado: string
  presupuesto: number
  impresiones: number
  alcance: number
  frecuencia: number
  clicks: number
  ctr: number
  cpc: number
  cpm: number
  conversiones: number
  cpa: number
  gasto: number
  ingresos: number
  roas: number
  // Calculados
  ganancia: number
  margen: number
  decision?: 'escalar' | 'mantener' | 'pausar' | 'matar'
  razon?: string
  escalar_a?: number
}

type AiAnalysis = {
  resumen_ejecutivo: string
  ganador_absoluto: string
  por_que_gana: string
  acciones_inmediatas: Array<{
    ad: string
    accion: 'ESCALAR' | 'MANTENER' | 'PAUSAR' | 'MATAR'
    presupuesto_actual: number
    presupuesto_nuevo?: number
    razon: string
    urgencia: 'alta' | 'media' | 'baja'
  }>
  alertas: string[]
  proyeccion_7dias: string
  siguiente_paso: string
}

// ---------------------------------------------
// CSV PARSER — Meta Ads format
// ---------------------------------------------
function parseMetaCSV(text: string): MetaAd[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["\s]/g, '').replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i').replace(/ó/g,'o').replace(/ú/g,'u'))
  
  const colMap: Record<string, string[]> = {
    nombre: ['nombre','name','anuncio','ad','campana','campaign','adname'],
    estado: ['estado','status','delivery'],
    presupuesto: ['presupuesto','budget','presupuestod','dailybudget'],
    impresiones: ['impresiones','impressions'],
    alcance: ['alcance','reach'],
    frecuencia: ['frecuencia','frequency'],
    clicks: ['clicks','clics','linkclicks'],
    ctr: ['ctr','clickthroughrate'],
    cpc: ['cpc','costperclick','costoporclic'],
    cpm: ['cpm','costper1000'],
    conversiones: ['conversiones','results','compras','purchases'],
    cpa: ['cpa','costperresult','costopor'],
    gasto: ['gasto','spend','importe','amountspent','montogastado'],
    ingresos: ['ingresos','revenue','purchasevalue','valor'],
    roas: ['roas','returnon','retornoen'],
  }

  const findCol = (key: string): number => {
    const candidates = colMap[key] || [key]
    for (const c of candidates) {
      const idx = headers.findIndex(h => h.includes(c))
      if (idx >= 0) return idx
    }
    return -1
  }

  const cols: Record<string, number> = {}
  Object.keys(colMap).forEach(k => { cols[k] = findCol(k) })

  const parseNum = (v: string) => parseFloat((v || '0').replace(/[^0-9.,]/g, '').replace(',', '.')) || 0

  return lines.slice(1).filter(l => l.trim()).map(line => {
    const cells = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    const get = (k: string) => cells[cols[k]] || ''
    const getN = (k: string) => parseNum(get(k))

    const gasto = getN('gasto')
    const ingresos = getN('ingresos')
    const clicks = getN('clicks')
    const impresiones = getN('impresiones')
    const conversiones = getN('conversiones')
    const presupuesto = getN('presupuesto')

    const roas = cols['roas'] >= 0 ? getN('roas') : (gasto > 0 ? ingresos / gasto : 0)
    const ctr = cols['ctr'] >= 0 ? getN('ctr') : (impresiones > 0 ? (clicks / impresiones) * 100 : 0)
    const cpc = cols['cpc'] >= 0 ? getN('cpc') : (clicks > 0 ? gasto / clicks : 0)
    const cpm = cols['cpm'] >= 0 ? getN('cpm') : (impresiones > 0 ? (gasto / impresiones) * 1000 : 0)
    const cpa = cols['cpa'] >= 0 ? getN('cpa') : (conversiones > 0 ? gasto / conversiones : 0)

    return {
      nombre: get('nombre') || `Ad ${Math.random().toString(36).slice(2,6)}`,
      estado: get('estado') || 'Activo',
      presupuesto,
      impresiones,
      alcance: getN('alcance'),
      frecuencia: getN('frecuencia'),
      clicks,
      ctr,
      cpc,
      cpm,
      conversiones,
      cpa,
      gasto,
      ingresos,
      roas,
      ganancia: ingresos - gasto,
      margen: ingresos > 0 ? ((ingresos - gasto) / ingresos) * 100 : 0,
    }
  }).filter(a => a.gasto > 0 || a.impresiones > 0)
}

// ---------------------------------------------
// DECISION ENGINE — local, no API needed
// ---------------------------------------------
function applyDecisions(ads: MetaAd[], margenProducto: number): MetaAd[] {
  return ads.map(ad => {
    const roasBreakEven = 1 / (margenProducto / 100)
    const roasEscala = roasBreakEven * 1.5
    
    let decision: MetaAd['decision'] = 'mantener'
    let razon = ''
    let escalar_a: number | undefined

    if (ad.roas === 0 && ad.gasto > 10) {
      decision = 'matar'
      razon = '0 conversiones con gasto real. No hay señal de vida.'
    } else if (ad.roas < roasBreakEven && ad.gasto > 20) {
      decision = 'matar'
      razon = `ROAS ${ad.roas.toFixed(1)}x por debajo del break-even (${roasBreakEven.toFixed(1)}x). Perdiendo dinero.`
    } else if (ad.roas >= roasBreakEven && ad.roas < roasEscala) {
      if (ad.frecuencia > 3.5) {
        decision = 'pausar'
        razon = `Frecuencia ${ad.frecuencia.toFixed(1)} — audiencia saturada. Refrescá el creativo.`
      } else if (ad.ctr < 0.8) {
        decision = 'pausar'
        razon = `CTR ${ad.ctr.toFixed(2)}% muy bajo. El hook no está parando el scroll.`
      } else {
        decision = 'mantener'
        razon = `ROAS sobre break-even. Acumulá más datos antes de escalar (min 50 conversiones).`
      }
    } else if (ad.roas >= roasEscala) {
      decision = 'escalar'
      escalar_a = Math.round(ad.presupuesto * 1.25)
      razon = `ROAS ${ad.roas.toFixed(1)}x — rentable y estable. Escalá +25% del presupuesto.`
      if (ad.frecuencia > 2.5) {
        razon += ` Ojo: frecuencia ${ad.frecuencia.toFixed(1)} — empezá a preparar variante del creativo.`
      }
    }

    return { ...ad, decision, razon, escalar_a }
  })
}

async function getAiAnalysis(ads: MetaAd[], margenProducto: number): Promise<AiAnalysis> {
    const summary = ads.map(a => `"${a.nombre}": ROAS ${a.roas.toFixed(2)}x | CTR ${a.ctr.toFixed(2)}% | CPC Gs.${Math.round(a.cpc*6350)} | CPA Gs.${Math.round(a.cpa*6350)} | Gasto Gs.${Math.round(a.gasto*6350)} | Frecuencia ${a.frecuencia.toFixed(1)} | Decisión: ${a.decision?.toUpperCase()} — ${a.razon}`).join('\n')
  
  const prompt = `Sos un Media Buyer experto con $5M+ en ad spend gestionado en Meta Ads para LATAM.

DATOS REALES DE LAS CAMPAÑAS (margen del producto: ${margenProducto}%, break-even ROAS: ${(1/(margenProducto/100)).toFixed(2)}x):
${summary}

Analizá estos datos con criterio de experto y dame recomendaciones CONCRETAS Y ACCIONABLES.

Respondé SOLO con JSON válido:
{
  "resumen_ejecutivo": "2-3 líneas directas sobre el estado real de las campañas. Sin rodeos.",
  "ganador_absoluto": "nombre exacto del mejor ad",
  "por_que_gana": "por qué ese ad específico está ganando — psicología, métricas, contexto",
  "acciones_inmediatas": [
    {
      "ad": "nombre exacto del ad",
      "accion": "ESCALAR",
      "presupuesto_actual": 10,
      "presupuesto_nuevo": 13,
      "razon": "razón específica de por qué esta acción ahora",
      "urgencia": "alta"
    }
  ],
  "alertas": ["alerta crítica 1", "alerta 2"],
  "proyeccion_7dias": "si ejecutás las acciones recomendadas, qué esperás ver en 7 días en términos concretos",
  "siguiente_paso": "la única acción más importante que debés hacer HOY"
}`

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  })
  const data = await res.json()
  const raw = data.text || ''
  let clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const s = clean.indexOf('{'), e = clean.lastIndexOf('}')
  if (s >= 0 && e > s) clean = clean.slice(s, e + 1)
  return JSON.parse(clean)
}

// ---------------------------------------------
// COMPONENTS
// ---------------------------------------------
function MetricPill({ label, value, status }: { label: string; value: string; status: 'good' | 'warn' | 'bad' | 'neutral' }) {
  const colors = { good: 'text-emerald-400', warn: 'text-amber-400', bad: 'text-red-400', neutral: 'text-white/60' }
  return (
    <div className="text-center">
      <p className="text-[10px] text-white/25 mb-0.5">{label}</p>
      <p className={`text-xs font-bold ${colors[status]}`}>{value}</p>
    </div>
  )
}

function AdCard({ ad, margen }: { ad: MetaAd; margen: number }) {
  const [open, setOpen] = useState(false)
  const decisionConfig = {
    escalar: { color: 'border-emerald-500/40 bg-emerald-500/8', badge: 'bg-emerald-500 text-white', label: '⬆ ESCALAR' },
    mantener: { color: 'border-blue-500/20 bg-blue-500/5', badge: 'bg-blue-500/30 text-blue-300', label: '→ MANTENER' },
    pausar: { color: 'border-amber-500/30 bg-amber-500/8', badge: 'bg-amber-500/30 text-amber-300', label: '⏸ PAUSAR' },
    matar: { color: 'border-red-500/30 bg-red-500/8', badge: 'bg-red-500/30 text-red-300', label: '✕ MATAR' },
  }
  const dc = decisionConfig[ad.decision || 'mantener']
  const roasBreakEven = 1 / (margen / 100)

  const roasStatus = ad.roas >= roasBreakEven * 1.5 ? 'good' : ad.roas >= roasBreakEven ? 'warn' : 'bad'
  const ctrStatus = ad.ctr >= 2 ? 'good' : ad.ctr >= 1 ? 'warn' : 'bad'
  const freqStatus = ad.frecuencia <= 2 ? 'good' : ad.frecuencia <= 3.5 ? 'warn' : 'bad'
  const cpaStatus = ad.cpa <= 15 ? 'good' : ad.cpa <= 30 ? 'warn' : ad.cpa > 0 ? 'bad' : 'neutral'

  return (
    <div className={`card border rounded-xl overflow-hidden ${dc.color}`}>
      <button onClick={() => setOpen(o => !o)} className="w-full p-4 text-left flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${dc.badge}`}>{dc.label}</span>
          <p className="text-white text-sm font-semibold truncate">{ad.nombre}</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <p className="text-[9px] text-white/25">ROAS</p>
            <p className={`text-sm font-bold ${roasStatus === 'good' ? 'text-emerald-400' : roasStatus === 'warn' ? 'text-amber-400' : 'text-red-400'}`}>{ad.roas.toFixed(2)}x</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-white/25">Ganancia</p>
            <p className={`text-sm font-bold ${ad.ganancia >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${ad.ganancia.toFixed(0)}</p>
          </div>
          <span className="text-white/20 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-4 animate-fade-up">
          {/* Métricas grid */}
          <div className="grid grid-cols-4 gap-3 p-3 bg-black/20 rounded-xl">
            <MetricPill label="CTR" value={`${ad.ctr.toFixed(2)}%`} status={ctrStatus} />
            <MetricPill label="CPC" value={`Gs. ${Math.round(ad.cpc * 6350).toLocaleString("es-PY")}`} status={ad.cpc <= 0.8 ? 'good' : ad.cpc <= 1.5 ? 'warn' : 'bad'} />
            <MetricPill label="CPM" value={`Gs. ${Math.round(ad.cpm * 6350).toLocaleString("es-PY")}`} status={ad.cpm <= 8 ? 'good' : ad.cpm <= 15 ? 'warn' : 'bad'} />
            <MetricPill label="Frecuencia" value={ad.frecuencia.toFixed(1)} status={freqStatus} />
            <MetricPill label="CPA" value={ad.cpa > 0 ? `Gs. ${Math.round(ad.cpa * 6350).toLocaleString("es-PY")}` : '—'} status={cpaStatus} />
            <MetricPill label="Conversiones" value={ad.conversiones.toString()} status={ad.conversiones >= 10 ? 'good' : ad.conversiones >= 3 ? 'warn' : 'neutral'} />
            <MetricPill label="Gasto" value={`Gs. ${Math.round(ad.gasto * 6350).toLocaleString("es-PY")}`} status="neutral" />
            <MetricPill label="Ingresos" value={`Gs. ${Math.round(ad.ingresos * 6350).toLocaleString("es-PY")}`} status={ad.ingresos > ad.gasto ? 'good' : 'bad'} />
          </div>

          {/* Decisión con acción concreta */}
          <div className={`p-3 rounded-xl border ${dc.color}`}>
            <p className="text-[10px] uppercase tracking-wider font-bold mb-1 opacity-70">Decisión & Acción</p>
            <p className="text-white/80 text-sm leading-relaxed">{ad.razon}</p>
            {ad.decision === 'escalar' && ad.escalar_a && (
              <div className="mt-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-emerald-300 text-xs font-semibold">
                  Presupuesto actual: ${ad.presupuesto}/día → Nuevo presupuesto: ${ad.escalar_a}/día
                </p>
                <p className="text-emerald-400/60 text-[10px] mt-0.5">Subí el presupuesto en Ads Manager hoy mismo</p>
              </div>
            )}
          </div>

          {/* Break-even visual */}
          <div className="p-3 bg-white/3 border border-white/8 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-white/25 uppercase">Break-even ROAS</p>
              <p className="text-white/40 text-[10px]">{roasBreakEven.toFixed(2)}x</p>
            </div>
            <div className="h-2 bg-white/8 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${ad.roas >= roasBreakEven * 1.5 ? 'bg-emerald-500' : ad.roas >= roasBreakEven ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min((ad.roas / (roasBreakEven * 2)) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-[9px] text-red-400/60">Perdida</p>
              <p className="text-[9px] text-amber-400/60">Break-even</p>
              <p className="text-[9px] text-emerald-400/60">Escala</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------
// MAIN PAGE
// ---------------------------------------------
export default function MetaTrackerPage() {
  const [ads, setAds] = useState<MetaAd[]>([])
  const [margen, setMargen] = useState(40)
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [csvError, setCsvError] = useState('')
  const [step, setStep] = useState<'upload' | 'review' | 'analysis'>('upload')
  const [sortBy, setSortBy] = useState<'roas' | 'ganancia' | 'gasto' | 'decision'>('decision')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setCsvError('')
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const parsed = parseMetaCSV(text)
      if (parsed.length === 0) {
        setCsvError('No se pudieron leer datos. Verificá que el CSV tenga columnas de gasto, clicks e impresiones.')
        return
      }
      const withDecisions = applyDecisions(parsed, margen)
      setAds(withDecisions)
      setStep('review')
    }
    reader.readAsText(file, 'UTF-8')
  }

  const runAiAnalysis = async () => {
    setAnalyzing(true)
    try {
      const result = await getAiAnalysis(ads, margen)
      setAnalysis(result)
      setStep('analysis')
    } catch { setCsvError('Error al analizar con IA. Revisá tu conexión.') }
    setAnalyzing(false)
  }

  const sortedAds = [...ads].sort((a, b) => {
    if (sortBy === 'decision') {
      const order = { escalar: 0, mantener: 1, pausar: 2, matar: 3 }
      return (order[a.decision || 'mantener']) - (order[b.decision || 'mantener'])
    }
    if (sortBy === 'roas') return b.roas - a.roas
    if (sortBy === 'ganancia') return b.ganancia - a.ganancia
    return b.gasto - a.gasto
  })

  const totalGasto = ads.reduce((s, a) => s + a.gasto, 0)
  const totalIngresos = ads.reduce((s, a) => s + a.ingresos, 0)
  const totalGanancia = totalIngresos - totalGasto
  const roasGlobal = totalGasto > 0 ? totalIngresos / totalGasto : 0
  const escalar = ads.filter(a => a.decision === 'escalar').length
  const matar = ads.filter(a => a.decision === 'matar').length

  const urgColors = { alta: 'text-red-400 border-red-500/30 bg-red-500/8', media: 'text-amber-400 border-amber-500/30 bg-amber-500/8', baja: 'text-blue-400 border-blue-500/20 bg-blue-500/5' }
  const accionColors = { ESCALAR: 'bg-emerald-500 text-white', MANTENER: 'bg-blue-500/30 text-blue-300', PAUSAR: 'bg-amber-500/30 text-amber-300', MATAR: 'bg-red-500/30 text-red-300' }

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
              <h1 className="text-lg font-bold text-white">Meta Ads Tracker</h1>
              <span className="tag tag-blue text-[10px]">📘 CSV + IA</span>
            </div>
            <p className="text-white/40 text-xs">Subí el reporte CSV de Meta → la IA analiza y decide qué escalar, pausar o matar</p>
          </div>
        </div>

        {/* STEP: UPLOAD */}
        {step === 'upload' && (
          <div className="space-y-5 animate-fade-up">
            <div className="card p-4 border border-blue-500/15 bg-blue-500/5">
              <p className="text-blue-300 text-xs font-bold mb-3">📋 Cómo descargar el CSV correcto desde Meta</p>
              <ol className="space-y-2 text-white/50 text-xs mb-4">
                <li className="flex items-start gap-2"><span className="text-blue-400 font-bold flex-shrink-0">1.</span>Ads Manager → nivel <strong className="text-white/70">Anuncios</strong> (no campañas, no conjuntos)</li>
                <li className="flex items-start gap-2"><span className="text-blue-400 font-bold flex-shrink-0">2.</span>Seleccioná todos los anuncios → <strong className="text-white/70">Exportar → Exportar datos de tabla → CSV</strong></li>
                <li className="flex items-start gap-2"><span className="text-blue-400 font-bold flex-shrink-0">3.</span>Período mínimo <strong className="text-white/70">7 días</strong> para datos válidos</li>
              </ol>
              <p className="text-blue-300/60 text-[10px] font-bold mb-1.5">✅ Columnas necesarias en el CSV:</p>
              <div className="grid grid-cols-2 gap-0.5 mb-3">
                {["Nombre del anuncio","Importe gastado","Impresiones","Clics en enlace","CTR","CPC","CPM","Resultados (compras)","Coste por resultado","Valor de conversión"].map(c=>(
                  <p key={c} className="text-[10px] text-white/35 flex items-center gap-1"><span className="text-emerald-500">✓</span>{c}</p>
                ))}
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-amber-300 text-[10px] font-bold">⚠️ Si falla el parsing</p>
                <p className="text-white/40 text-[10px] mt-0.5">Asegurate de exportar a nivel Anuncio (ad), no conjunto ni campaña. Si no aparece "Resultados", configurá el pixel en Meta Events Manager.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5">Margen del producto (%)</label>
              <div className="flex items-center gap-3">
                <input type="range" min="5" max="90" value={margen} onChange={e => setMargen(parseInt(e.target.value))}
                  className="flex-1 accent-violet-500" />
                <div className="w-24 text-center">
                  <p className="text-white font-bold text-lg">{margen}%</p>
                  <p className="text-white/30 text-[10px]">Break-even: {(1/(margen/100)).toFixed(2)}x ROAS</p>
                </div>
              </div>
              <p className="text-white/25 text-[10px] mt-1">El margen real del producto después de costos (sin contar ads)</p>
            </div>

            <div
              className="border-2 border-dashed border-white/15 rounded-2xl p-10 text-center cursor-pointer hover:border-blue-500/40 hover:bg-blue-500/3 transition-all"
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}>
              <div className="text-4xl mb-3">📊</div>
              <p className="text-white font-semibold mb-1">Arrastrá el CSV de Meta Ads</p>
              <p className="text-white/40 text-sm">o hacé clic para seleccionar el archivo</p>
              <p className="text-white/20 text-xs mt-2">Funciona con el reporte estándar de Ads Manager</p>
              <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            </div>
            {csvError && <p className="text-red-400 text-sm">{csvError}</p>}
          </div>
        )}

        {/* STEP: REVIEW */}
        {step === 'review' && ads.length > 0 && (
          <div className="space-y-4 animate-fade-up">
            {/* KPIs globales */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
              {[
                { l: 'ROAS Global', v: `${roasGlobal.toFixed(2)}x`, c: roasGlobal >= 2 ? 'text-emerald-400' : roasGlobal >= 1 ? 'text-amber-400' : 'text-red-400' },
                { l: 'Gasto Total', v: `$${totalGasto.toFixed(0)}`, c: 'text-white' },
                { l: 'Ganancia Neta', v: `$${totalGanancia.toFixed(0)}`, c: totalGanancia >= 0 ? 'text-emerald-400' : 'text-red-400' },
                { l: 'Ads a Escalar', v: `${escalar} / Matar: ${matar}`, c: 'text-violet-400' },
              ].map((s, i) => (
                <div key={i} className="card p-3 text-center">
                  <p className={`text-xl font-bold ${s.c}`}>{s.v}</p>
                  <p className="text-[10px] text-white/25 mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>

            {/* Controles */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-1">
                {(['decision','roas','ganancia','gasto']).map(s => (
                  <button key={s} onClick={() => setSortBy(s)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all capitalize ${sortBy === s ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                    {s === 'decision' ? '⚡ Decisión' : s === 'roas' ? 'ROAS' : s === 'ganancia' ? 'Ganancia' : 'Gasto'}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setAds([]); setStep('upload'); setAnalysis(null) }} className="btn-secondary text-xs px-3 py-2">← Nuevo CSV</button>
                <button onClick={runAiAnalysis} disabled={analyzing}
                  className="btn-primary text-xs px-4 py-2">
                  {analyzing ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-1.5"/>Analizando...</> : '🧠 Análisis IA →'}
                </button>
              </div>
            </div>

            {/* Ad cards */}
            <div className="space-y-3">
              {sortedAds.map((ad, i) => <AdCard key={i} ad={ad} margen={margen} />)}
            </div>
          </div>
        )}

        {/* STEP: AI ANALYSIS */}
        {step === 'analysis' && analysis && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold">Análisis IA Completo</h2>
              <button onClick={() => setStep('review')} className="btn-secondary text-xs px-3 py-2">← Ver ads</button>
            </div>

            {/* Resumen ejecutivo */}
            <div className="card p-5 border border-violet-500/25 bg-violet-500/5">
              <p className="text-violet-300 text-[10px] font-bold uppercase tracking-wider mb-2">🧠 Diagnóstico del Media Buyer</p>
              <p className="text-white/80 text-sm leading-relaxed">{analysis.resumen_ejecutivo}</p>
            </div>

            {/* Ganador */}
            <div className="card p-4 border border-emerald-500/25 bg-emerald-500/5">
              <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-1">🏆 Ad Ganador</p>
              <p className="text-white font-bold text-sm mb-1">{analysis.ganador_absoluto}</p>
              <p className="text-white/60 text-xs leading-relaxed">{analysis.por_que_gana}</p>
            </div>

            {/* Siguiente paso */}
            <div className="card p-4 border border-amber-500/25 bg-amber-500/8">
              <p className="text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">⚡ Lo que hacés HOY</p>
              <p className="text-white text-sm leading-relaxed font-medium">{analysis.siguiente_paso}</p>
            </div>

            {/* Acciones */}
            <div>
              <p className="text-xs font-semibold text-white/25 uppercase tracking-widest mb-3">Plan de acción por ad</p>
              <div className="space-y-2">
                {analysis.acciones_inmediatas.map((a, i) => (
                  <div key={i} className={`card p-4 border ${urgColors[a.urgencia]}`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${accionColors[a.accion]}`}>{a.accion}</span>
                        <p className="text-white text-sm font-semibold">{a.ad}</p>
                      </div>
                      <span className={`text-[10px] font-medium flex-shrink-0 ${urgColors[a.urgencia].split(' ')[0]}`}>urgencia {a.urgencia}</span>
                    </div>
                    <p className="text-white/65 text-xs leading-relaxed mb-2">{a.razon}</p>
                    {a.presupuesto_nuevo && (
                      <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                        <span className="text-white/40 text-xs line-through">${a.presupuesto_actual}/día</span>
                        <span className="text-white/30 text-xs">→</span>
                        <span className="text-emerald-400 text-xs font-bold">${a.presupuesto_nuevo}/día</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Alertas */}
            {analysis.alertas.length > 0 && (
              <div className="card p-4 border border-red-500/20 bg-red-500/5">
                <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider mb-2">⚠️ Alertas</p>
                {analysis.alertas.map((a, i) => <p key={i} className="text-white/60 text-xs mb-1">• {a}</p>)}
              </div>
            )}

            {/* Proyección */}
            <div className="card p-4 border border-blue-500/15 bg-blue-500/5">
              <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-2">📈 Proyección 7 días</p>
              <p className="text-white/70 text-sm leading-relaxed">{analysis.proyeccion_7dias}</p>
            </div>

            {/* Ver ads de nuevo */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-white/25 uppercase tracking-widest">Decisiones por ad</p>
              {sortedAds.map((ad, i) => <AdCard key={i} ad={ad} margen={margen} />)}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
