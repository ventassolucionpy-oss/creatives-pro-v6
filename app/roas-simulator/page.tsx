'use client'
export const dynamic = 'force-dynamic'
import { useState, useMemo } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { PAISES, formatPrecio, type Pais } from '@/lib/constants'

type Escenario = { roas: number; gasto_usd: number; ingresos: number; ganancia: number; entregas: number }

export default function RoasSimulatorPage() {
  const [pais, setPais] = useState<Pais>('PY')
  const [precioVenta, setPrecioVenta] = useState(0)
  const [costoProducto, setCostoProducto] = useState(0)
  const [flete, setFlete] = useState(0)
  const [tasaEntrega, setTasaEntrega] = useState(75)
  const [gastoUsd, setGastoUsd] = useState(30)
  const [roasObjetivo, setRoasObjetivo] = useState(3)

  const cfg = PAISES[pais]
  const fmt = (n: number) => formatPrecio(n, pais)

  // Set defaults when country changes
  const handlePaisChange = (p: Pais) => {
    setPais(p)
    const c = PAISES[p]
    setFlete(c.flete_dropi)
    setTasaEntrega(c.tasa_entrega_default)
  }

  const calc = useMemo(() => {
    if (precioVenta <= 0 || costoProducto <= 0) return null
    const fx = cfg.fx_usd
    const gastoLocal = gastoUsd * fx
    const costoTotal = costoProducto + flete

    // ROAS break-even: precio / (precio - costoTotal - costoPorVenta) = 1
    // costoPorVenta = gastoLocal / ventasEntregadas
    // Simplificado: roasBE = precio / (precio - costoTotal) si ads = 0
    // Real: resuelve para roasBE donde ganancia = 0
    // ganancia = (precio - costoTotal) * entregas - gastoLocal = 0
    // entregas = (tasaEntrega/100) * (gastoLocal / CPC)  -> necesitamos CPA
    // Versión directa: ROAS_BE = precio / (precio - costoTotal_sin_ads) * (1 / tasa)
    
    const margenSinAds = precioVenta - costoProducto - flete
    const roasBreakEven = margenSinAds > 0
      ? precioVenta / (margenSinAds * (tasaEntrega / 100))
      : 999

    // Escenarios de ROAS
    const escenarios: Escenario[] = [1.5, 2, roasBreakEven, 3, 4, 5].map(roas => {
      const ingresos = gastoLocal * roas
      const ventas = ingresos / precioVenta
      const entregas = ventas * (tasaEntrega / 100)
      const ganancia = entregas * margenSinAds - gastoLocal
      return { roas: Math.round(roas * 10) / 10, gasto_usd: gastoUsd, ingresos: Math.round(ingresos), ganancia: Math.round(ganancia), entregas: Math.round(entregas) }
    }).filter((e, i, arr) => arr.findIndex(x => x.roas === e.roas) === i).sort((a, b) => a.roas - b.roas)

    // Con ROAS objetivo
    const ingresosObj = gastoLocal * roasObjetivo
    const ventasObj = ingresosObj / precioVenta
    const entregasObj = ventasObj * (tasaEntrega / 100)
    const gananciaObj = entregasObj * margenSinAds - gastoLocal
    const cpaObj = entregasObj > 0 ? gastoLocal / entregasObj : 0

    return {
      roasBreakEven: Math.round(roasBreakEven * 100) / 100,
      margenSinAds,
      escenarios,
      objetivo: {
        ingresos: Math.round(ingresosObj),
        entregas: Math.round(entregasObj),
        ganancia: Math.round(gananciaObj),
        cpa: Math.round(cpaObj),
        rentable: gananciaObj > 0
      }
    }
  }, [precioVenta, costoProducto, flete, tasaEntrega, gastoUsd, roasObjetivo, pais])

  const inputCls = 'input text-sm'

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-5">
          <Link href="/crear" className="text-white/30 hover:text-white/60 text-sm transition-colors">← Herramientas</Link>
          <h1 className="text-2xl font-bold text-white mt-2">📊 ROAS Simulator</h1>
          <p className="text-white/40 text-sm mt-1">Calculá tu ROAS break-even exacto y simulá escenarios de rentabilidad</p>
        </div>

        {/* País selector */}
        <div className="flex gap-2 mb-4">
          {Object.values(PAISES).map(p => (
            <button key={p.codigo} onClick={() => handlePaisChange(p.codigo as Pais)}
              className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${pais === p.codigo ? 'border-violet-500/50 bg-violet-500/15 text-white' : 'border-white/8 bg-white/3 text-white/40 hover:text-white/60'}`}>
              {p.bandera} {p.nombre}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="card p-5 space-y-4 mb-4">
          <p className="text-white font-semibold text-sm">💰 Tu estructura de costos ({cfg.bandera})</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Precio de venta ({cfg.simbolo})</label>
              <input className={inputCls} type="number" value={precioVenta || ''} onChange={e => setPrecioVenta(Number(e.target.value))} placeholder={String(Math.round(cfg.precio_min * 1.8))} />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Costo producto Dropi ({cfg.simbolo})</label>
              <input className={inputCls} type="number" value={costoProducto || ''} onChange={e => setCostoProducto(Number(e.target.value))} placeholder={String(Math.round(cfg.precio_min * 0.4))} />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Flete ({cfg.simbolo})</label>
              <input className={inputCls} type="number" value={flete || ''} onChange={e => setFlete(Number(e.target.value))} placeholder={String(cfg.flete_dropi)} />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Gasto ads/mes (USD)</label>
              <input className={inputCls} type="number" value={gastoUsd} onChange={e => setGastoUsd(Number(e.target.value))} placeholder="30" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-white/40">Tasa de entrega COD</label>
              <span className="text-white font-bold">{tasaEntrega}%</span>
            </div>
            <input type="range" min="50" max="95" value={tasaEntrega} onChange={e => setTasaEntrega(Number(e.target.value))} className="w-full accent-violet-500" />
          </div>
        </div>

        {/* ROAS objetivo */}
        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white font-semibold text-sm">🎯 ROAS objetivo</p>
            <span className="text-2xl font-black text-violet-400">{roasObjetivo}x</span>
          </div>
          <input type="range" min="1" max="8" step="0.5" value={roasObjetivo} onChange={e => setRoasObjetivo(Number(e.target.value))} className="w-full accent-violet-500" />
          <div className="flex justify-between text-[10px] text-white/20 mt-1"><span>1x</span><span>4x</span><span>8x</span></div>
        </div>

        {/* Resultado */}
        {calc && precioVenta > 0 && costoProducto > 0 && (
          <div className="space-y-4 animate-fade-up">
            {/* Break-even destacado */}
            <div className={`card p-5 border text-center ${calc.roasBreakEven <= 2 ? 'border-emerald-500/30 bg-emerald-500/5' : calc.roasBreakEven <= 3.5 ? 'border-amber-500/30 bg-amber-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">ROAS Break-Even</p>
              <p className={`text-5xl font-black mb-1 ${calc.roasBreakEven <= 2 ? 'text-emerald-400' : calc.roasBreakEven <= 3.5 ? 'text-amber-400' : 'text-red-400'}`}>{calc.roasBreakEven}x</p>
              <p className="text-white/40 text-xs">
                {calc.roasBreakEven <= 2 ? '✅ Excelente — muy fácil de alcanzar en Meta Ads' : calc.roasBreakEven <= 3 ? '⚠️ Manejable — necesita buen creativo' : '🔴 Alto — revisar estructura de costos'}
              </p>
            </div>

            {/* Objetivo */}
            <div className={`card p-5 border ${calc.objetivo.rentable ? 'border-violet-500/30 bg-violet-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-bold text-sm">Con ROAS {roasObjetivo}x</p>
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${calc.objetivo.rentable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {calc.objetivo.rentable ? '✅ Rentable' : '❌ En pérdida'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Ingresos totales', fmt(calc.objetivo.ingresos), 'text-blue-400'],
                  ['Entregas/mes', String(calc.objetivo.entregas), 'text-white'],
                  ['CPA (costo por venta)', fmt(calc.objetivo.cpa), 'text-amber-400'],
                  ['Ganancia mensual', fmt(calc.objetivo.ganancia), calc.objetivo.rentable ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'],
                ].map(([l, v, c]) => (
                  <div key={l} className="p-3 bg-white/3 rounded-lg">
                    <p className="text-[10px] text-white/30 mb-0.5">{l}</p>
                    <p className={`text-sm font-bold ${c}`}>{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabla de escenarios */}
            <div className="card border border-white/8 overflow-hidden">
              <div className="p-4 border-b border-white/8">
                <p className="text-white font-bold text-sm">📈 Tabla de escenarios</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="text-left px-4 py-2 text-white/30 font-medium">ROAS</th>
                      <th className="text-right px-4 py-2 text-white/30 font-medium">Entregas</th>
                      <th className="text-right px-4 py-2 text-white/30 font-medium">Ganancia</th>
                      <th className="text-right px-4 py-2 text-white/30 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {calc.escenarios.map(e => {
                      const esBE = Math.abs(e.roas - calc.roasBreakEven) < 0.2
                      const esObj = e.roas === roasObjetivo
                      return (
                        <tr key={e.roas} className={`${esObj ? 'bg-violet-500/10' : esBE ? 'bg-amber-500/5' : ''}`}>
                          <td className="px-4 py-2.5">
                            <span className={`font-bold ${e.ganancia >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{e.roas}x</span>
                            {esBE && <span className="ml-1 text-[9px] text-amber-400">← BE</span>}
                            {esObj && <span className="ml-1 text-[9px] text-violet-400">← objetivo</span>}
                          </td>
                          <td className="px-4 py-2.5 text-right text-white/70">{e.entregas}</td>
                          <td className={`px-4 py-2.5 text-right font-bold ${e.ganancia >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(e.ganancia)}</td>
                          <td className="px-4 py-2.5 text-right">
                            {e.ganancia >= 0 ? <span className="text-[10px] text-emerald-400">✅</span> : <span className="text-[10px] text-red-400">❌</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link href="/dropi" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-violet-500/30 transition-all">
                <span>📦</span><div><p className="text-white text-xs font-bold">Calculadora Dropi</p><p className="text-white/30 text-[10px]">Precio con COD real</p></div>
              </Link>
              <Link href="/presupuesto-escalado" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-emerald-500/30 transition-all">
                <span>📈</span><div><p className="text-white text-xs font-bold">Escalar Budget</p><p className="text-white/30 text-[10px]">Calculá el próximo nivel</p></div>
              </Link>
            </div>
          </div>
        )}

        {!calc && (
          <div className="card p-6 border border-white/8 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-white/50 text-sm">Ingresá el precio de venta y costo del producto para ver el simulador</p>
          </div>
        )}
      </main>
    </div>
  )
}
