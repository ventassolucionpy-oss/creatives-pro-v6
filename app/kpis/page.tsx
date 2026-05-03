'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useMemo } from 'react'
import Navbar from '@/components/layout/Navbar'
import { getPaisConfig } from '@/lib/constants'
import Link from 'next/link'

type Period = 'hoy' | 'semana' | 'mes'
type Platform = 'meta' | 'tiktok' | 'ambas'

type Snapshot = {
  id: string
  periodo: Period
  plataforma: Platform
  gasto_total: number
  ingresos_total: number
  ventas_total: number
  entregadas: number
  pedidos_totales: number
  cpa: number
  roas: number
  tasa_entrega: number
  margen_neto: number
  costo_producto: number
  precio_venta: number
  top_producto: string
  notas: string
  created_at: string
}

export default function KPIsPage() {
  const [period, setPeriod] = useState<Period>('hoy')
  const [platform, setPlatform] = useState<Platform>('ambas')
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  // Form inputs
  const [gasto, setGasto] = useState('')
  const [ventas, setVentas] = useState('')
  const [precioVenta, setPrecioVenta] = useState('')
  const [entregadas, setEntregadas] = useState('')
  const [pedidosTotales, setPedidosTotales] = useState('')
  const [costoProducto, setCostoProducto] = useState('')
  const [topProducto, setTopProducto] = useState('')
  const [notas, setNotas] = useState('')

  useEffect(() => { loadSnapshots() }, [])

  const loadSnapshots = async () => {
    setLoading(false)
    try {
      const res = await fetch('/api/kpis?limit=30')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSnapshots(data.snapshots || [])
    } catch {
      setError('Error cargando historial de KPIs.')
    }
  }

  const calculated = useMemo(() => {
    const g = parseFloat(gasto) || 0
    const v = parseFloat(ventas) || 0
    const pv = parseFloat(precioVenta) || 0
    const cp = parseFloat(costoProducto) || 0
    const ent = parseFloat(entregadas) || 0
    const ped = parseFloat(pedidosTotales) || v
    const ingresos = v * pv
    const cpa = v > 0 ? g / v : 0
    const roas = g > 0 ? ingresos / g : 0
    const entRate = ped > 0 ? (ent / ped) * 100 : 75
    const ingresos_reales = ent * pv
    const costo_merch = ent * cp
    const flete = ent * getPaisConfig('PY').flete_dropi // TODO: usar país del usuario
    const margen = ingresos_reales - g - costo_merch - flete
    return { g, v, pv, ingresos, cpa, roas, entRate, ingresos_reales, margen, ped, ent, cp }
  }, [gasto, ventas, precioVenta, costoProducto, entregadas, pedidosTotales])

  const [result, setResult] = useState<typeof calculated | null>(null)
  const [alert, setAlert] = useState('')

  const handleCalculate = () => {
    const c = calculated
    let a = ''
    if (c.roas < 1.5 && c.g > 0) a = '🔴 ROAS peligroso — revisá el creativo hoy mismo'
    else if (c.roas < 2 && c.g > 0) a = '🟡 ROAS bajo — optimizá antes de escalar'
    else if (c.entRate < 65 && c.ped > 0) a = '🟡 Tasa de entrega baja — revisá targeting y producto'
    else if (c.margen < 0 && c.g > 0) a = '🔴 Margen negativo — revisá costos y precios urgente'
    else if (c.roas >= 3) a = '🟢 ROAS excelente — considerá escalar el budget'
    setResult(c)
    setAlert(a)
  }

  const handleSave = async () => {
    if (!result) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/kpis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodo: period,
          plataforma: platform,
          gasto_total: result.g,
          ingresos_total: result.ingresos_reales,
          ventas_total: result.v,
          entregadas: result.ent,
          pedidos_totales: result.ped,
          cpa: result.cpa,
          roas: result.roas,
          tasa_entrega: result.entRate,
          margen_neto: result.margen,
          costo_producto: result.cp,
          precio_venta: result.pv,
          top_producto: topProducto,
          notas,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSnapshots(prev => [data.snapshot, ...prev])
      setShowHistory(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando')
    } finally {
      setSaving(false)
    }
  }

  const roasColor = (r: number) => r >= 3 ? 'text-emerald-400' : r >= 2 ? 'text-amber-400' : 'text-red-400'
  const fmtGs = (n: number) => `Gs. ${Math.round(n).toLocaleString('es-PY')}`

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-white/20'

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/gestionar" className="text-white/30 hover:text-white/60 text-sm">Gestionar</Link>
            <span className="text-white/20">›</span>
            <span className="text-white/60 text-sm">KPIs</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">📊 KPIs Dashboard</h1>
              <p className="text-white/40 text-sm mt-1">{snapshots.length} snapshots guardados</p>
            </div>
            <button onClick={() => setShowHistory(!showHistory)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${showHistory ? 'border-violet-500/50 bg-violet-600/20 text-violet-300' : 'border-white/10 text-white/40'}`}>
              🕐 Historial
            </button>
          </div>
        </div>

        {error && (
          <div className="card p-3 border border-red-500/30 bg-red-500/5 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Historial */}
        {showHistory && snapshots.length > 0 && (
          <div className="card p-4 border border-white/8 mb-5">
            <p className="text-xs text-white/40 font-bold mb-3">HISTORIAL DE SNAPSHOTS</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {snapshots.map(s => (
                <div key={s.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium">
                      {s.top_producto || '—'} · {s.plataforma} · {s.periodo}
                    </p>
                    <p className="text-white/30 text-[10px]">
                      {new Date(s.created_at).toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${roasColor(s.roas)}`}>{s.roas.toFixed(2)}x</p>
                    <p className={`text-[10px] ${s.margen_neto >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtGs(s.margen_neto)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Periodo y plataforma */}
        <div className="flex gap-2 mb-4">
          {(['hoy', 'semana', 'mes'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all capitalize ${period === p ? 'bg-violet-600/30 border-violet-500/50 text-violet-300' : 'border-white/10 text-white/30'}`}>
              {p === 'hoy' ? '📅 Hoy' : p === 'semana' ? '📆 Esta semana' : '🗓️ Este mes'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-5">
          {(['meta', 'tiktok', 'ambas'] as Platform[]).map(p => (
            <button key={p} onClick={() => setPlatform(p)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${platform === p ? 'bg-violet-600/30 border-violet-500/50 text-violet-300' : 'border-white/10 text-white/30'}`}>
              {p === 'meta' ? '📘 Meta' : p === 'tiktok' ? '🎵 TikTok' : '🔀 Ambas'}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="card p-5 border border-white/8 mb-4">
          <p className="text-xs text-white/40 font-bold mb-4">DATOS DEL PERÍODO</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-white/40 mb-1.5">Gasto en ads (USD) *</label>
              <input className={inputCls} type="number" placeholder="150" value={gasto} onChange={e => setGasto(e.target.value)} /></div>
            <div><label className="block text-xs text-white/40 mb-1.5">Ventas generadas *</label>
              <input className={inputCls} type="number" placeholder="45" value={ventas} onChange={e => setVentas(e.target.value)} /></div>
            <div><label className="block text-xs text-white/40 mb-1.5">Precio venta (Gs.)</label>
              <input className={inputCls} type="number" placeholder="157000" value={precioVenta} onChange={e => setPrecioVenta(e.target.value)} /></div>
            <div><label className="block text-xs text-white/40 mb-1.5">Costo producto (Gs.)</label>
              <input className={inputCls} type="number" placeholder="35000" value={costoProducto} onChange={e => setCostoProducto(e.target.value)} /></div>
            <div><label className="block text-xs text-white/40 mb-1.5">Pedidos totales COD</label>
              <input className={inputCls} type="number" placeholder="60" value={pedidosTotales} onChange={e => setPedidosTotales(e.target.value)} /></div>
            <div><label className="block text-xs text-white/40 mb-1.5">Entregados</label>
              <input className={inputCls} type="number" placeholder="45" value={entregadas} onChange={e => setEntregadas(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div><label className="block text-xs text-white/40 mb-1.5">Top producto</label>
              <input className={inputCls} placeholder="ej. Masajeador cervical" value={topProducto} onChange={e => setTopProducto(e.target.value)} /></div>
            <div><label className="block text-xs text-white/40 mb-1.5">Notas</label>
              <input className={inputCls} placeholder="ej. Creativos nuevos activos" value={notas} onChange={e => setNotas(e.target.value)} /></div>
          </div>
          <button onClick={handleCalculate}
            className="w-full mt-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all">
            Calcular métricas
          </button>
        </div>

        {/* Resultados */}
        {result && (
          <>
            {alert && (
              <div className={`card p-3 mb-4 border ${alert.startsWith('🔴') ? 'border-red-500/30 bg-red-500/5' : alert.startsWith('🟡') ? 'border-amber-500/30 bg-amber-500/5' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
                <p className={`text-sm font-bold ${alert.startsWith('🔴') ? 'text-red-400' : alert.startsWith('🟡') ? 'text-amber-400' : 'text-emerald-400'}`}>{alert}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="card p-4 col-span-2 text-center border border-white/10">
                <p className="text-xs text-white/30 mb-1">ROAS</p>
                <p className={`text-4xl font-black ${roasColor(result.roas)}`}>{result.roas.toFixed(2)}x</p>
              </div>
              <div className="card p-3 text-center">
                <p className={`text-xl font-bold ${result.margen >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtGs(result.margen)}</p>
                <p className="text-[10px] text-white/30 mt-0.5">Margen neto</p>
              </div>
              <div className="card p-3 text-center">
                <p className="text-xl font-bold text-white">${result.cpa.toFixed(2)}</p>
                <p className="text-[10px] text-white/30 mt-0.5">CPA</p>
              </div>
              <div className="card p-3 text-center">
                <p className={`text-xl font-bold ${result.entRate >= 75 ? 'text-emerald-400' : result.entRate >= 65 ? 'text-amber-400' : 'text-red-400'}`}>{result.entRate.toFixed(0)}%</p>
                <p className="text-[10px] text-white/30 mt-0.5">Tasa de entrega</p>
              </div>
              <div className="card p-3 text-center">
                <p className="text-xl font-bold text-white">{fmtGs(result.ingresos_reales)}</p>
                <p className="text-[10px] text-white/30 mt-0.5">Ingresos reales</p>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-sm transition-all disabled:opacity-40">
              {saving ? 'Guardando...' : '💾 Guardar snapshot'}
            </button>
          </>
        )}

        <div className="card p-4 mt-5 border border-blue-500/20 bg-blue-500/5">
          <p className="text-xs text-blue-300 font-bold mb-1">💡 Referencias Paraguay COD</p>
          <p className="text-xs text-white/40">ROAS mínimo: 2.0x | Bueno: 3.0x+ | Excelente: 4.0x+. Tasa de entrega: 75-85%. Flete por devolución: Gs. 38.000. Ingresá los datos del período y guardá el snapshot para ver tendencias en el tiempo.</p>
        </div>
      </main>
    </div>
  )
}
