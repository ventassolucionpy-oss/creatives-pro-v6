'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { getPaisConfig, formatPrecio, type Pais } from '@/lib/constants'

// ─── Tipos ───────────────────────────────────────────────
type PLData = {
  ingresos_hoy: number
  gasto_ads_hoy: number
  pedidos_hoy: number
  entregados_hoy: number
  rechazados_hoy: number
  ingresos_semana: number
  gasto_ads_semana: number
  pedidos_semana: number
  ingresos_mes: number
  gasto_ads_mes: number
  pedidos_mes: number
}

type ManualEntry = {
  periodo: 'hoy' | 'semana' | 'mes'
  ingresos: string
  gasto_ads: string
  pedidos: string
  costo_promedio_producto: string
  entregados?: string
}

// getPaisConfig('PY').fx_usd y formato ahora vienen del contexto de país (lib/constants.ts)
const fmt = (n: number, pais: Pais = 'PY') => formatPrecio(n, pais)
const fmtUsd = (n: number) => `$${n.toFixed(2)}`

function Kpi({
  label, value, sub, color = 'text-white', trend, small,
}: {
  label: string; value: string; sub?: string; color?: string; trend?: 'up' | 'down' | 'neutral'; small?: boolean
}) {
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-white/30'
  return (
    <div className="card p-4 flex flex-col justify-between">
      <p className="text-white/35 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
      <div>
        <p className={`font-bold ${small ? 'text-lg' : 'text-2xl'} ${color}`}>
          {value}
          {trendIcon && <span className={`text-sm ml-1 ${trendColor}`}>{trendIcon}</span>}
        </p>
        {sub && <p className="text-white/25 text-[10px] mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function RoasBar({ roas, breakEven = 2.2 }: { roas: number; breakEven?: number }) {
  const max = Math.max(roas * 1.2, breakEven * 1.5, 4)
  const pct = Math.min((roas / max) * 100, 100)
  const bePct = Math.min((breakEven / max) * 100, 100)
  const color = roas >= breakEven * 1.3 ? 'bg-emerald-500' : roas >= breakEven ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="mt-2">
      <div className="relative h-2 bg-white/8 rounded-full overflow-visible">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
        {/* Break-even marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/40 rounded-full"
          style={{ left: `${bePct}%` }}
          title={`Break-even: ${breakEven}x`}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-white/25">0x</span>
        <span className="text-[9px] text-white/25">Break-even {breakEven}x</span>
        <span className="text-[9px] text-white/25">{max.toFixed(1)}x</span>
      </div>
    </div>
  )
}

export default function DashboardPLPage() {
  const [period, setPeriod] = useState<'hoy' | 'semana' | 'mes'>('hoy')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'resumen' | 'manual' | 'proyeccion'>('resumen')
  const supabase = createClient()

  // Datos desde Supabase (pedidos + kpis)
  const [pedidosData, setPedidosData] = useState<PLData>({
    ingresos_hoy: 0, gasto_ads_hoy: 0, pedidos_hoy: 0, entregados_hoy: 0, rechazados_hoy: 0,
    ingresos_semana: 0, gasto_ads_semana: 0, pedidos_semana: 0,
    ingresos_mes: 0, gasto_ads_mes: 0, pedidos_mes: 0,
  })

  // Entrada manual de gasto en ads (ya que Meta API no está conectada aún)
  const [manual, setManual] = useState<ManualEntry>({
    periodo: 'hoy', ingresos: '', gasto_ads: '', pedidos: '', costo_promedio_producto: '', entregados: '',
  })
  const [manualSaved, setManualSaved] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Cargar pedidos de Supabase
      const { data: pedidos } = await supabase
        .from('pedidos')
        .select('precio, estado, created_at')
        .order('created_at', { ascending: false })

      if (pedidos) {
        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const startOfWeek = new Date(startOfDay)
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay())
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        const calc = (from: Date) => {
          const subset = pedidos.filter(p => new Date(p.created_at) >= from)
          return {
            ingresos: subset.filter(p => p.estado === 'entregado').reduce((s, p) => s + (p.precio || 0), 0),
            pedidos: subset.length,
            entregados: subset.filter(p => p.estado === 'entregado').length,
            rechazados: subset.filter(p => ['devuelto', 'rechazado'].includes(p.estado)).length,
          }
        }

        const hoy = calc(startOfDay)
        const semana = calc(startOfWeek)
        const mes = calc(startOfMonth)

        setPedidosData({
          ingresos_hoy: hoy.ingresos, pedidos_hoy: hoy.pedidos, entregados_hoy: hoy.entregados, rechazados_hoy: hoy.rechazados,
          gasto_ads_hoy: 0, // Cargado desde /api/ad-spend
          ingresos_semana: semana.ingresos, pedidos_semana: semana.pedidos, gasto_ads_semana: 0,
          ingresos_mes: mes.ingresos, pedidos_mes: mes.pedidos, gasto_ads_mes: 0,
        })
      }

      // Cargar último KPI manual guardado
      const saved = localStorage.getItem('pl_manual')
      if (saved) {
        const parsed = JSON.parse(saved)
        setManual(parsed)
        setManualSaved(true)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  const saveManual = () => {
    localStorage.setItem('pl_manual', JSON.stringify(manual))
    setManualSaved(true)
  }

  // Calcular métricas según período
  const getPeriodData = () => {
    const fromDB = {
      hoy: { ingresos: pedidosData.ingresos_hoy, gasto: pedidosData.gasto_ads_hoy, pedidos: pedidosData.pedidos_hoy },
      semana: { ingresos: pedidosData.ingresos_semana, gasto: pedidosData.gasto_ads_semana, pedidos: pedidosData.pedidos_semana },
      mes: { ingresos: pedidosData.ingresos_mes, gasto: pedidosData.gasto_ads_mes, pedidos: pedidosData.pedidos_mes },
    }[period]

    // Si hay datos manuales para el período actual, usarlos para el gasto
    const manualIngresos = manualSaved && manual.periodo === period ? parseFloat(manual.ingresos) * getPaisConfig('PY').precio_round_base || 0 : 0
    const paisFx = getPaisConfig('PY').fx_usd
  const manualGasto = manualSaved && manual.periodo === period ? parseFloat(manual.gasto_ads) * paisFx || 0 : 0
    const manualPedidos = manualSaved && manual.periodo === period ? parseInt(manual.pedidos) || 0 : 0
    const costoProducto = manualSaved ? parseFloat(manual.costo_promedio_producto) * 1000 || 0 : 0

    const ingresos = fromDB.ingresos || manualIngresos
    const gasto = manualGasto || fromDB.gasto
    const pedidos = fromDB.pedidos || manualPedidos
    const costoTotalProductos = costoProducto * pedidos

    const gananciaB = ingresos - gasto - costoTotalProductos
    const margenPct = ingresos > 0 ? (gananciaB / ingresos) * 100 : 0
    const roas = gasto > 0 ? ingresos / gasto : 0
    const cpa = pedidos > 0 ? gasto / pedidos : 0
    const tasaEntrega = pedidosData.pedidos_hoy > 0
      ? (pedidosData.entregados_hoy / pedidosData.pedidos_hoy) * 100
      : 75

    return { ingresos, gasto, pedidos, gananciaB, margenPct, roas, cpa, tasaEntrega, costoTotalProductos }
  }

  const d = getPeriodData()

  // Proyección mensual basada en período actual
  const diasPeriodo = { hoy: 1, semana: 7, mes: 30 }[period]
  const proyIngresosMes = (d.ingresos / diasPeriodo) * 30
  const proyGananciaB = (d.gananciaB / diasPeriodo) * 30

  const PERIOD_LABELS = { hoy: 'Hoy', semana: 'Esta semana', mes: 'Este mes' }

  const ic = 'w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/50'
  const lc = 'block text-xs text-white/40 mb-1.5'

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <Link href="/inicio" className="text-white/30 hover:text-white/60 text-sm flex items-center gap-1.5 mb-4 transition-colors">← Inicio</Link>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">💰 Dashboard P&L</h1>
            <span className="tag tag-green text-[10px]">Live</span>
          </div>
          <p className="text-white/40 text-sm">Ingresos, gasto y margen — los números reales del día</p>
        </div>

        {/* Period selector */}
        <div className="flex gap-2 mb-5">
          {(['hoy', 'semana', 'mes'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all border ${
                period === p
                  ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                  : 'border-white/10 text-white/35 hover:text-white/60'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl bg-white/3 border border-white/8">
          {(['resumen', 'manual', 'proyeccion'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
                tab === t ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              {t === 'resumen' ? '📊 Resumen' : t === 'manual' ? '✏️ Cargar datos' : '📈 Proyección'}
            </button>
          ))}
        </div>

        {/* TAB: RESUMEN */}
        {tab === 'resumen' && (
          <div className="space-y-4">
            {/* KPIs principales */}
            <div className="grid grid-cols-2 gap-2.5">
              <Kpi
                label="Ingresos"
                value={fmt(d.ingresos)}
                sub={`${d.pedidos} pedidos`}
                color="text-emerald-400"
                trend={d.ingresos > 0 ? 'up' : 'neutral'}
              />
              <Kpi
                label="Gasto en Ads"
                value={d.gasto > 0 ? fmt(d.gasto) : '—'}
                sub={d.gasto > 0 ? `$${(d.gasto / getPaisConfig('PY').fx_usd).toFixed(0)} USD` : 'Cargá el gasto →'}
                color="text-red-400"
              />
              <Kpi
                label="Ganancia bruta"
                value={d.gananciaB !== 0 ? fmt(d.gananciaB) : '—'}
                sub={d.margenPct !== 0 ? `${d.margenPct.toFixed(1)}% de margen` : ''}
                color={d.gananciaB > 0 ? 'text-emerald-400' : d.gananciaB < 0 ? 'text-red-400' : 'text-white/40'}
              />
              <Kpi
                label="ROAS"
                value={d.roas > 0 ? `${d.roas.toFixed(2)}x` : '—'}
                sub={d.roas > 0 ? (d.roas >= 2.2 ? '✓ Sobre break-even' : '⚠️ Bajo break-even') : ''}
                color={d.roas >= 2.5 ? 'text-emerald-400' : d.roas >= 1.8 ? 'text-amber-400' : d.roas > 0 ? 'text-red-400' : 'text-white/40'}
              />
            </div>

            {/* ROAS bar */}
            {d.roas > 0 && (
              <div className="card p-4">
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Posición de ROAS</p>
                <RoasBar roas={d.roas} />
              </div>
            )}

            {/* Stats adicionales */}
            <div className="grid grid-cols-3 gap-2">
              <Kpi label="Tasa entrega" value={`${d.tasaEntrega.toFixed(0)}%`} color={d.tasaEntrega >= 75 ? 'text-emerald-400' : 'text-amber-400'} small />
              <Kpi label="CPA" value={d.cpa > 0 ? fmt(d.cpa) : '—'} color="text-white/70" small />
              <Kpi label="Rechazados" value={`${pedidosData.rechazados_hoy}`} color="text-red-400" small />
            </div>

            {/* Alertas contextuales */}
            {d.roas > 0 && d.roas < 1.8 && (
              <div className="card p-4 border border-red-500/30 bg-red-500/5">
                <p className="text-red-400 font-bold text-sm mb-1">🔴 ROAS bajo break-even</p>
                <p className="text-white/50 text-xs leading-relaxed">Tu ROAS de {d.roas.toFixed(2)}x está por debajo del mínimo para ser rentable ({'>'}2.2x para COD). Revisá el creativo o pausá la campaña.</p>
                <Link href="/war-room" className="inline-block mt-2 text-xs text-red-400 underline">Ir al War Room →</Link>
              </div>
            )}

            {d.roas >= 3 && (
              <div className="card p-4 border border-emerald-500/30 bg-emerald-500/5">
                <p className="text-emerald-400 font-bold text-sm mb-1">🚀 ROAS excelente — momento de escalar</p>
                <p className="text-white/50 text-xs leading-relaxed">Tu ROAS de {d.roas.toFixed(2)}x está en zona de escala. Subí el presupuesto un 20-30% y monitoreá 48hs.</p>
                <Link href="/presupuesto-escalado" className="inline-block mt-2 text-xs text-emerald-400 underline">Calcular escala →</Link>
              </div>
            )}

            {!manualSaved && (
              <div className="card p-4 border border-amber-500/20 bg-amber-500/5">
                <p className="text-amber-300 text-sm font-bold mb-1">⚠️ Gasto en ads no cargado</p>
                <p className="text-white/40 text-xs mb-2">Para ver el P&L completo, cargá el gasto de hoy desde Meta Ads Manager.</p>
                <button onClick={() => setTab('manual')} className="text-xs text-amber-400 underline">Cargar datos →</button>
              </div>
            )}

            {/* Links */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link href="/war-room" className="btn-secondary text-center text-xs py-2.5">🔴 War Room</Link>
              <Link href="/kpis" className="btn-secondary text-center text-xs py-2.5">📊 KPIs históricos</Link>
              <Link href="/pedidos" className="btn-secondary text-center text-xs py-2.5">📦 Ver pedidos</Link>
              <Link href="/presupuesto-escalado" className="btn-secondary text-center text-xs py-2.5">📈 Escalar</Link>
            </div>
          </div>
        )}

        {/* TAB: CARGAR DATOS */}
        {tab === 'manual' && (
          <div className="space-y-4">
            <div className="card p-4 border border-blue-500/20 bg-blue-500/5">
              <p className="text-blue-300 text-xs font-bold mb-1">📋 ¿Por qué carga manual?</p>
              <p className="text-white/40 text-xs leading-relaxed">Meta Ads Manager muestra el gasto real. Copialo de ahí y cargalo acá. El resto (pedidos, entregados) se toma automáticamente de tu registro de pedidos.</p>
            </div>

            <div className="card p-5 space-y-4">
              <div>
                <label className={lc}>Período de los datos</label>
                <div className="flex gap-2">
                  {(['hoy', 'semana', 'mes'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setManual(m => ({ ...m, periodo: p }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        manual.periodo === p ? 'border-violet-500/50 bg-violet-500/10 text-violet-300' : 'border-white/10 text-white/35'
                      }`}
                    >
                      {PERIOD_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={lc}>Gasto en ads (USD)</label>
                <input
                  type="number"
                  className={ic}
                  placeholder="ej: 25.50"
                  value={manual.gasto_ads}
                  onChange={e => setManual(m => ({ ...m, gasto_ads: e.target.value }))}
                />
                <p className="text-white/25 text-[10px] mt-1">
                  {manual.gasto_ads ? `≈ Gs. ${Math.round(parseFloat(manual.gasto_ads) * getPaisConfig('PY').fx_usd).toLocaleString('es-PY')}` : 'Copialo de Meta Ads Manager'}
                </p>
              </div>

              <div>
                <label className={lc}>Ingresos cobrados (miles de Gs.)</label>
                <input
                  type="number"
                  className={ic}
                  placeholder="ej: 1500 → Gs. 1.500.000"
                  value={manual.ingresos}
                  onChange={e => setManual(m => ({ ...m, ingresos: e.target.value }))}
                />
              </div>

              <div>
                <label className={lc}>Costo promedio del producto en Dropi (miles de Gs.)</label>
                <input
                  type="number"
                  className={ic}
                  placeholder="ej: 80 → Gs. 80.000"
                  value={manual.costo_promedio_producto}
                  onChange={e => setManual(m => ({ ...m, costo_promedio_producto: e.target.value }))}
                />
              </div>

              <button onClick={saveManual} className="btn-primary w-full py-3">
                💾 Guardar datos
              </button>

              {manualSaved && (
                <p className="text-emerald-400 text-xs text-center">✓ Datos guardados — volvé a Resumen para ver el P&L</p>
              )}
            </div>
          </div>
        )}

        {/* TAB: PROYECCIÓN */}
        {tab === 'proyeccion' && (
          <div className="space-y-4">
            <div className="card p-5">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-3">Proyección basada en {PERIOD_LABELS[period].toLowerCase()}</p>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/8">
                  <div>
                    <p className="text-white text-sm font-semibold">Ingresos proyectados / mes</p>
                    <p className="text-white/30 text-xs">Si mantenés el ritmo actual</p>
                  </div>
                  <p className="text-emerald-400 font-bold text-lg">{fmt(proyIngresosMes)}</p>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-white/8">
                  <div>
                    <p className="text-white text-sm font-semibold">Ganancia proyectada / mes</p>
                    <p className="text-white/30 text-xs">Después de ads y producto</p>
                  </div>
                  <p className={`font-bold text-lg ${proyGananciaB > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {fmt(proyGananciaB)}
                  </p>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-white/8">
                  <div>
                    <p className="text-white text-sm font-semibold">Pedidos proyectados / mes</p>
                  </div>
                  <p className="text-white/70 font-bold text-lg">{Math.round((d.pedidos / diasPeriodo) * 30)}</p>
                </div>

                <div className="flex justify-between items-center py-3">
                  <div>
                    <p className="text-white text-sm font-semibold">ROAS actual</p>
                    <p className="text-white/30 text-xs">Break-even COD Paraguay ≈ 2.2x</p>
                  </div>
                  <p className={`font-bold text-lg ${d.roas >= 2.5 ? 'text-emerald-400' : d.roas > 0 ? 'text-amber-400' : 'text-white/30'}`}>
                    {d.roas > 0 ? `${d.roas.toFixed(2)}x` : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Escenarios */}
            <div className="card p-5">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-3">Escenarios si escalás el presupuesto</p>
              {d.gasto > 0 ? (
                <div className="space-y-3">
                  {[
                    { label: '+20% de presupuesto', mult: 1.2 },
                    { label: '+50% de presupuesto', mult: 1.5 },
                    { label: '×2 de presupuesto', mult: 2 },
                  ].map(esc => {
                    const newGasto = d.gasto * esc.mult
                    const newIngresos = newGasto * d.roas
                    const newGanancia = newIngresos - newGasto - (d.gananciaB + d.gasto - d.ingresos + d.ingresos - d.gasto - d.gananciaB)
                    const ganEstimada = newIngresos - newGasto - (newGasto * 0.3) // estimación costo producto ~30% de gasto
                    return (
                      <div key={esc.mult} className="flex justify-between items-center p-3 rounded-xl bg-white/3 border border-white/8">
                        <p className="text-white/60 text-xs">{esc.label}</p>
                        <div className="text-right">
                          <p className="text-emerald-400 font-bold text-sm">{fmt(ganEstimada)}</p>
                          <p className="text-white/25 text-[10px]">ganancia estimada</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-white/30 text-sm text-center py-4">Cargá el gasto en ads para ver los escenarios</p>
              )}
            </div>

            <Link href="/presupuesto-escalado" className="btn-primary w-full py-3 text-center block">
              📈 Calculadora de escala completa →
            </Link>
          </div>
        )}

      </main>
    </div>
  )
}
