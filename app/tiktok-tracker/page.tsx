'use client'
export const dynamic = 'force-dynamic'
import { useState, useRef } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

type TikTokAd = {
  nombre: string
  tipo: string // video, spark, live
  impresiones: number
  alcance: number
  vistas_video: number
  tasa_reproduccion: number // % que ve >6s
  clics: number
  ctr: number
  cpc: number
  cpm: number
  conversiones: number
  cpa: number
  gasto: number
  ingresos: number
  roas: number
  ganancia: number
  gmv?: number // Gross Merchandise Value TikTok Shop
  tasa_conversion?: number
  decision?: 'escalar' | 'mantener' | 'pausar' | 'matar' | 'spark'
  razon?: string
  escalar_a?: number
}

type TikTokAnalysis = {
  resumen: string
  mejor_video: string
  por_que: string
  acciones: Array<{ ad: string; accion: string; razon: string; presupuesto_nuevo?: number }>
  estrategia_contenido: string
  spark_ads_recomendado: string
  alertas: string[]
  siguiente_paso: string
}

function parseTikTokCSV(text: string): TikTokAd[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["\s]/g,'').replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i').replace(/ó/g,'o').replace(/ú/g,'u'))

  const find = (keys: string[]) => {
    for (const k of keys) {
      const i = headers.findIndex(h => h.includes(k))
      if (i >= 0) return i
    }
    return -1
  }

  const cols = {
    nombre: find(['nombre','name','adname','anuncio','video']),
    impresiones: find(['impresiones','impressions']),
    alcance: find(['alcance','reach']),
    vistas: find(['vistas','views','videoviews']),
    reproduccion: find(['reproduccion','watchrate','videowatch','play']),
    clics: find(['clics','clicks','linkclicks']),
    ctr: find(['ctr']),
    cpc: find(['cpc','costperclick']),
    cpm: find(['cpm']),
    conversiones: find(['conversiones','results','purchases','orders']),
    cpa: find(['cpa','costperresult']),
    gasto: find(['gasto','spend','cost','amount']),
    ingresos: find(['ingresos','revenue','value','gmv']),
    roas: find(['roas','return']),
    gmv: find(['gmv','grossmerchandise']),
  }

  const parseNum = (v: string) => parseFloat((v || '0').replace(/[^0-9.,]/g,'').replace(',','.')) || 0

  return lines.slice(1).filter(l => l.trim()).map(line => {
    const cells = line.split(',').map(c => c.trim().replace(/^"|"$/g,''))
    const get = (k: keyof typeof cols) => cols[k] >= 0 ? cells[cols[k]] || '' : ''
    const getN = (k: keyof typeof cols) => parseNum(get(k))

    const gasto = getN('gasto')
    const ingresos = getN('ingresos')
    const clics = getN('clics')
    const impresiones = getN('impresiones')
    const conversiones = getN('conversiones')

    const roas = cols.roas >= 0 ? getN('roas') : (gasto > 0 ? ingresos / gasto : 0)
    const ctr = cols.ctr >= 0 ? getN('ctr') : (impresiones > 0 ? (clics/impresiones)*100 : 0)
    const cpc = cols.cpc >= 0 ? getN('cpc') : (clics > 0 ? gasto/clics : 0)
    const cpm = cols.cpm >= 0 ? getN('cpm') : (impresiones > 0 ? (gasto/impresiones)*1000 : 0)
    const cpa = cols.cpa >= 0 ? getN('cpa') : (conversiones > 0 ? gasto/conversiones : 0)

    return {
      nombre: get('nombre') || `Video ${Math.random().toString(36).slice(2,6)}`,
      tipo: 'video',
      impresiones,
      alcance: getN('alcance'),
      vistas_video: getN('vistas'),
      tasa_reproduccion: getN('reproduccion'),
      clics,
      ctr,
      cpc,
      cpm,
      conversiones,
      cpa,
      gasto,
      ingresos,
      roas,
      ganancia: ingresos - gasto,
      gmv: getN('gmv') || ingresos,
      tasa_conversion: impresiones > 0 ? (conversiones/impresiones)*100 : 0,
    }
  }).filter(a => a.gasto > 0 || a.impresiones > 0)
}

function applyTikTokDecisions(ads: TikTokAd[], margen: number): TikTokAd[] {
  return ads.map(ad => {
    const roasBE = 1 / (margen / 100)
    let decision: TikTokAd['decision'] = 'mantener'
    let razon = ''
    let escalar_a: number | undefined

    // TikTok-specific thresholds
    if (ad.roas === 0 && ad.gasto > 15) {
      decision = 'matar'
      razon = '0 conversiones con gasto real. En TikTok esto es muy raro — revisá el tracking.'
    } else if (ad.roas < roasBE && ad.gasto > 25) {
      decision = 'matar'
      razon = `ROAS ${ad.roas.toFixed(1)}x bajo break-even (${roasBE.toFixed(1)}x). En TikTok los malos videos no mejoran solos.`
    } else if (ad.ctr > 3 && ad.roas >= roasBE) {
      // Alto CTR y rentable = candidato Spark Ad
      decision = 'spark'
      razon = `CTR ${ad.ctr.toFixed(1)}% excelente. Convertilo en Spark Ad para potenciar con paid mientras conservás el engagement orgánico.`
    } else if (ad.roas >= roasBE * 1.5) {
      decision = 'escalar'
      escalar_a = Math.round((ad.gasto / 7) * 1.3) // presupuesto diario +30%
      razon = `ROAS ${ad.roas.toFixed(1)}x — rentable. Escalá presupuesto +30%. En TikTok el algoritmo necesita volumen para optimizar.`
    } else if (ad.tasa_reproduccion < 15 && ad.impresiones > 1000) {
      decision = 'pausar'
      razon = `Solo ${ad.tasa_reproduccion?.toFixed(0)}% ve más de 6 segundos. El hook no engancha en TikTok. Rehacé los primeros 3 segundos.`
    }

    return { ...ad, decision, razon, escalar_a }
  })
}

async function getTikTokAnalysis(ads: TikTokAd[], margen: number): Promise<TikTokAnalysis> {
    const summary = ads.map(a =>
    `"${a.nombre}": ROAS ${a.roas.toFixed(2)}x | CTR ${a.ctr.toFixed(2)}% | Reproducción ${a.tasa_reproduccion?.toFixed(0)}% | CPA Gs.${Math.round(a.cpa*6350)} | Gasto Gs.${Math.round(a.gasto*6350)} | Decisión: ${a.decision?.toUpperCase()}`
  ).join('\n')

  const prompt = `Sos un experto en TikTok Shop y TikTok Ads para LATAM con $2M+ gestionado en esta plataforma. Especializado en estrategia orgánica + paid, Spark Ads y TikTok Shop.

DATOS REALES (margen producto: ${margen}%, break-even ROAS: ${(1/(margen/100)).toFixed(2)}x):
${summary}

TikTok tiene dinámicas MUY diferentes a Meta:
- CTR > 2% es bueno, > 4% es excelente
- Tasa de reproducción > 25% = buen hook
- CPM típico LATAM: $3-8 (mucho más barato que Meta)
- Los videos orgánicos con alto engagement se pueden potenciar con Spark Ads a menor costo
- El algoritmo de TikTok favorece el contenido con alto watch time

Respondé SOLO con JSON válido:
{
  "resumen": "diagnóstico directo del estado de las campañas TikTok",
  "mejor_video": "nombre del mejor video",
  "por_que": "por qué ese video funciona mejor en el algoritmo de TikTok",
  "acciones": [
    { "ad": "nombre", "accion": "ESCALAR | SPARK AD | PAUSAR | MATAR | MANTENER", "razon": "razón específica para TikTok", "presupuesto_nuevo": 20 }
  ],
  "estrategia_contenido": "recomendación de qué tipo de contenido crear próximamente basado en los datos",
  "spark_ads_recomendado": "qué videos convertir en Spark Ads y por qué esta estrategia baja el CPM",
  "alertas": ["alerta 1", "alerta 2"],
  "siguiente_paso": "la única acción más importante que hacés HOY en TikTok Ads Manager"
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

function TikTokAdCard({ ad, margen }: { ad: TikTokAd; margen: number }) {
  const [open, setOpen] = useState(false)
  const decisionStyle: Record<string, { border: string; badge: string; label: string }> = {
    escalar: { border: 'border-emerald-500/40 bg-emerald-500/8', badge: 'bg-emerald-500 text-white', label: '⬆ ESCALAR' },
    spark:   { border: 'border-pink-500/40 bg-pink-500/8', badge: 'bg-pink-500 text-white', label: '⚡ SPARK AD' },
    mantener:{ border: 'border-blue-500/20 bg-blue-500/5', badge: 'bg-blue-500/30 text-blue-300', label: '→ MANTENER' },
    pausar:  { border: 'border-amber-500/30 bg-amber-500/8', badge: 'bg-amber-500/30 text-amber-300', label: '⏸ PAUSAR' },
    matar:   { border: 'border-red-500/30 bg-red-500/8', badge: 'bg-red-500/30 text-red-300', label: '✕ MATAR' },
  }
  const ds = decisionStyle[ad.decision || 'mantener']
  const roasBE = 1 / (margen / 100)

  return (
    <div className={`card border rounded-xl overflow-hidden ${ds.border}`}>
      <button onClick={() => setOpen(o => !o)} className="w-full p-4 text-left flex items-center gap-3">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${ds.badge}`}>{ds.label}</span>
        <p className="text-white text-sm font-semibold flex-1 min-w-0 truncate">{ad.nombre}</p>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right"><p className="text-[9px] text-white/25">ROAS</p><p className={`text-sm font-bold ${ad.roas >= roasBE * 1.5 ? 'text-emerald-400' : ad.roas >= roasBE ? 'text-amber-400' : 'text-red-400'}`}>{ad.roas.toFixed(2)}x</p></div>
          <div className="text-right"><p className="text-[9px] text-white/25">CTR</p><p className={`text-sm font-bold ${ad.ctr >= 3 ? 'text-emerald-400' : ad.ctr >= 1.5 ? 'text-amber-400' : 'text-red-400'}`}>{ad.ctr.toFixed(2)}%</p></div>
          <span className="text-white/20 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3 animate-fade-up">
          <div className="grid grid-cols-4 gap-3 p-3 bg-black/20 rounded-xl">
            {[
              { l: 'Reproducción', v: `${ad.tasa_reproduccion?.toFixed(0)}%`, ok: (ad.tasa_reproduccion||0) >= 25 },
              { l: 'CPM', v: `Gs. ${Math.round(ad.cpm * 6350).toLocaleString("es-PY")}`, ok: ad.cpm <= 8 },
              { l: 'CPA', v: ad.cpa > 0 ? `Gs. ${Math.round(ad.cpa * 6350).toLocaleString("es-PY")}` : '—', ok: ad.cpa > 0 && ad.cpa <= 20 },
              { l: 'Ganancia', v: `$${ad.ganancia.toFixed(0)}`, ok: ad.ganancia >= 0 },
            ].map(m => (
              <div key={m.l} className="text-center">
                <p className="text-[10px] text-white/25 mb-0.5">{m.l}</p>
                <p className={`text-xs font-bold ${m.ok ? 'text-emerald-400' : 'text-red-400'}`}>{m.v}</p>
              </div>
            ))}
          </div>
          <div className={`p-3 rounded-xl border ${ds.border}`}>
            <p className="text-white/75 text-sm leading-relaxed">{ad.razon}</p>
            {ad.decision === 'spark' && (
              <div className="mt-2 p-2.5 bg-pink-500/10 border border-pink-500/20 rounded-lg">
                <p className="text-pink-300 text-xs font-semibold">Cómo convertir en Spark Ad:</p>
                <p className="text-pink-400/70 text-[10px] mt-0.5">TikTok Ads Manager → Creative → Spark Ads → pegar el link del post orgánico</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function TikTokTrackerPage() {
  const [ads, setAds] = useState<TikTokAd[]>([])
  const [margen, setMargen] = useState(40)
  const [analysis, setAnalysis] = useState<TikTokAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'upload' | 'review' | 'analysis'>('upload')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const parsed = parseTikTokCSV(e.target?.result as string)
      if (!parsed.length) { setError('No se pudieron leer datos del CSV.'); return }
      setAds(applyTikTokDecisions(parsed, margen))
      setStep('review')
    }
    reader.readAsText(file, 'UTF-8')
  }

  const runAnalysis = async () => {
    setAnalyzing(true)
    try {
      setAnalysis(await getTikTokAnalysis(ads, margen))
      setStep('analysis')
    } catch { setError('Error al analizar.') }
    setAnalyzing(false)
  }

  const totalGasto = ads.reduce((s,a) => s+a.gasto, 0)
  const totalIngresos = ads.reduce((s,a) => s+a.ingresos, 0)
  const roasGlobal = totalGasto > 0 ? totalIngresos/totalGasto : 0
  const sparkCandidates = ads.filter(a => a.decision === 'spark').length

  const accionColors: Record<string, string> = {
    'ESCALAR': 'bg-emerald-500 text-white',
    'SPARK AD': 'bg-pink-500 text-white',
    'PAUSAR': 'bg-amber-500/30 text-amber-300',
    'MATAR': 'bg-red-500/30 text-red-300',
    'MANTENER': 'bg-blue-500/30 text-blue-300',
  }

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
              <h1 className="text-lg font-bold text-white">TikTok Shop Tracker</h1>
              <span className="tag tag-pink text-[10px]" style={{background:'rgba(236,72,153,0.15)',color:'#f472b6',border:'1px solid rgba(236,72,153,0.3)'}}>🎵 CSV + IA</span>
            </div>
            <p className="text-white/40 text-xs">Subí el reporte de TikTok Ads → análisis IA con estrategia de Spark Ads y escalado</p>
          </div>
        </div>

        {step === 'upload' && (
          <div className="space-y-5 animate-fade-up">
            <div className="card p-4 border border-pink-500/15 bg-pink-500/5">
              <p className="text-pink-300 text-xs font-bold mb-2">Cómo exportar desde TikTok Ads Manager</p>
              <ol className="space-y-1.5 text-white/50 text-xs">
                <li>1. TikTok Ads Manager → <strong className="text-white/70">Dashboard</strong> → seleccioná el nivel Ad</li>
                <li>2. Elegí el período (mínimo 7 días)</li>
                <li>3. <strong className="text-white/70">Export</strong> → <strong className="text-white/70">Download Report</strong> → CSV</li>
                <li>4. Para TikTok Shop: también podés exportar desde <strong className="text-white/70">TikTok Seller Center → Analytics</strong></li>
              </ol>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5">Margen del producto (%)</label>
              <div className="flex items-center gap-3">
                <input type="range" min="5" max="90" value={margen} onChange={e => setMargen(parseInt(e.target.value))} className="flex-1 accent-pink-500" />
                <div className="w-24 text-center">
                  <p className="text-white font-bold text-lg">{margen}%</p>
                  <p className="text-white/30 text-[10px]">BE: {(1/(margen/100)).toFixed(2)}x ROAS</p>
                </div>
              </div>
            </div>
            <div className="border-2 border-dashed border-white/15 rounded-2xl p-10 text-center cursor-pointer hover:border-pink-500/40 transition-all"
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}>
              <div className="text-4xl mb-3">🎵</div>
              <p className="text-white font-semibold mb-1">Arrastrá el CSV de TikTok Ads</p>
              <p className="text-white/40 text-sm">Reporte de TikTok Ads Manager o Seller Center</p>
              <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        )}

        {step === 'review' && ads.length > 0 && (
          <div className="space-y-4 animate-fade-up">
            <div className="grid grid-cols-4 gap-3">
              {[
                { l:'ROAS Global', v:`${roasGlobal.toFixed(2)}x`, c: roasGlobal>=2?'text-emerald-400':roasGlobal>=1?'text-amber-400':'text-red-400'},
                { l:'Gasto Total', v:`$${totalGasto.toFixed(0)}`, c:'text-white'},
                { l:'Ganancia', v:`$${(totalIngresos-totalGasto).toFixed(0)}`, c:(totalIngresos-totalGasto)>=0?'text-emerald-400':'text-red-400'},
                { l:'Spark Ads potenciales', v:sparkCandidates.toString(), c:'text-pink-400'},
              ].map((s,i) => <div key={i} className="card p-3 text-center"><p className={`text-xl font-bold ${s.c}`}>{s.v}</p><p className="text-[10px] text-white/25 mt-0.5">{s.l}</p></div>)}
            </div>
            <div className="flex justify-between">
              <button onClick={() => {setAds([]); setStep('upload')}} className="btn-secondary text-xs px-3 py-2">← Nuevo CSV</button>
              <button onClick={runAnalysis} disabled={analyzing} className="btn-primary text-xs px-4 py-2">
                {analyzing ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-1.5"/>Analizando...</> : '🧠 Análisis IA →'}
              </button>
            </div>
            <div className="space-y-3">{ads.map((ad,i) => <TikTokAdCard key={i} ad={ad} margen={margen}/>)}</div>
          </div>
        )}

        {step === 'analysis' && analysis && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex justify-between mb-2">
              <h2 className="text-white font-bold">Análisis IA — TikTok</h2>
              <button onClick={() => setStep('review')} className="btn-secondary text-xs px-3 py-2">← Ver ads</button>
            </div>
            <div className="card p-5 border border-pink-500/20 bg-pink-500/5">
              <p className="text-pink-300 text-[10px] font-bold uppercase tracking-wider mb-2">🎵 Diagnóstico TikTok Expert</p>
              <p className="text-white/80 text-sm leading-relaxed">{analysis.resumen}</p>
            </div>
            <div className="card p-4 border border-emerald-500/20 bg-emerald-500/5">
              <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-1">🏆 Mejor Video</p>
              <p className="text-white font-bold text-sm mb-1">{analysis.mejor_video}</p>
              <p className="text-white/60 text-xs">{analysis.por_que}</p>
            </div>
            {analysis.spark_ads_recomendado && (
              <div className="card p-4 border border-pink-500/20 bg-pink-500/5">
                <p className="text-pink-300 text-[10px] font-bold uppercase tracking-wider mb-1">⚡ Estrategia Spark Ads</p>
                <p className="text-white/70 text-sm leading-relaxed">{analysis.spark_ads_recomendado}</p>
              </div>
            )}
            <div className="card p-4 border border-amber-500/20 bg-amber-500/8">
              <p className="text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">⚡ Lo que hacés HOY</p>
              <p className="text-white font-medium text-sm">{analysis.siguiente_paso}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/25 uppercase tracking-widest">Plan de acción</p>
              {analysis.acciones.map((a, i) => (
                <div key={i} className="card p-4 border border-white/8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${accionColors[a.accion] || 'bg-white/10 text-white/50'}`}>{a.accion}</span>
                    <p className="text-white text-sm font-semibold">{a.ad}</p>
                  </div>
                  <p className="text-white/65 text-xs leading-relaxed">{a.razon}</p>
                  {a.presupuesto_nuevo && <p className="text-emerald-400 text-xs mt-1 font-semibold">Nuevo presupuesto: ${a.presupuesto_nuevo}/día</p>}
                </div>
              ))}
            </div>
            {analysis.estrategia_contenido && (
              <div className="card p-4 border border-blue-500/15">
                <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-1">🎬 Próximo Contenido</p>
                <p className="text-white/70 text-sm">{analysis.estrategia_contenido}</p>
              </div>
            )}
            {analysis.alertas?.length > 0 && (
              <div className="card p-4 border border-red-500/20 bg-red-500/5">
                <p className="text-red-400 text-[10px] font-bold uppercase mb-2">⚠️ Alertas</p>
                {analysis.alertas.map((a,i) => <p key={i} className="text-white/60 text-xs mb-1">• {a}</p>)}
              </div>
            )}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-semibold text-white/25 uppercase tracking-widest">Decisiones por video</p>
              {ads.map((ad,i) => <TikTokAdCard key={i} ad={ad} margen={margen}/>)}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
