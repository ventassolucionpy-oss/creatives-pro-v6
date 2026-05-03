'use client'
export const dynamic = 'force-dynamic'
import { useState, useMemo } from 'react'
import Navbar from '@/components/layout/Navbar'
import { PAISES, getPaisConfig, formatPrecio, redondearPrecioPsicologico, type Pais } from '@/lib/constants'
import Link from 'next/link'

type Scenario = 'conservador' | 'base' | 'optimista'

export default function RentabilidadPage() {
  // Producto
  const [precioVenta, setPrecioVenta] = useState(150000)
  const [costoProducto, setCostoProducto] = useState(45000)
  const [costoEnvio, setCostoEnvio] = useState(38000) // Default PY; se actualiza con el país
  const [otrosCostos, setOtrosCostos] = useState(0)
  const [moneda, setMoneda] = useState<'PYG' | 'USD'>('PYG')
  const [tasaEntrega, setTasaEntrega] = useState(75) // Default PY; se actualiza con el país

  // Campaña
  const [presupuestoDiario, setPresupuestoDiario] = useState(50)
  const [diasCampana, setDiasCampana] = useState(30)
  const [tasaConversion, setTasaConversion] = useState(2.5) // %
  const [cpc, setCpc] = useState(0.5) // USD

  // Calculados
  const calc = useMemo(() => {
    const paisCfg = getPaisConfig(moneda === 'PYG' ? 'PY' : moneda === 'COP' ? 'CO' : 'MX')
    const fx = paisCfg.fx_usd
    const pv = moneda === 'PYG' ? precioVenta / fx : precioVenta
    const cp = moneda === 'PYG' ? costoProducto / fx : costoProducto
    const ce = moneda === 'PYG' ? costoEnvio / fx : costoEnvio
    const oc = moneda === 'PYG' ? otrosCostos / fx : otrosCostos

    const costoTotal = cp + ce + oc
    const margenBruto = pv - costoTotal
    const margenPct = pv > 0 ? (margenBruto / pv) * 100 : 0
    const roasBreakEven = pv > 0 && margenBruto > 0 ? pv / margenBruto : 0

    const gastoTotal = presupuestoDiario * diasCampana
    const clicks = cpc > 0 ? gastoTotal / cpc : 0
    const ventas = clicks * (tasaConversion / 100)
    const ingresosTotal = ventas * pv
    const costoAds = gastoTotal
    const costoMercancia = ventas * costoTotal
    const ingresoNeto = ingresosTotal - costoAds - costoMercancia
    const roasReal = costoAds > 0 ? ingresosTotal / costoAds : 0

    // Escenarios
    const scenarios = {
      conservador: { tc: tasaConversion * 0.6, label: 'Conservador (60%)' },
      base: { tc: tasaConversion, label: 'Base (100%)' },
      optimista: { tc: tasaConversion * 1.5, label: 'Optimista (150%)' },
    }

    const calcScenario = (tc: number) => {
      const v = clicks * (tc / 100)
      const ing = v * pv
      const neto = ing - costoAds - (v * costoTotal)
      const roas = costoAds > 0 ? ing / costoAds : 0
      return { ventas: v, ingresos: ing, neto, roas }
    }

    return {
      pv, costoTotal, margenBruto, margenPct, roasBreakEven,
      gastoTotal, clicks, ventas, ingresosTotal, costoAds, costoMercancia, ingresoNeto, roasReal,
      scenarios: {
        conservador: calcScenario(scenarios.conservador.tc),
        base: calcScenario(scenarios.base.tc),
        optimista: calcScenario(scenarios.optimista.tc),
      }
    }
  }, [precioVenta, costoProducto, costoEnvio, otrosCostos, moneda, presupuestoDiario, diasCampana, tasaConversion, cpc])

  const fmt = (n: number) => moneda === 'PYG'
    ? `Gs. ${Math.round(n * fx).toLocaleString('es-PY')}`
    : `$${n.toFixed(2)}`

  const fmtUSD = (n: number) => `$${n.toFixed(2)}`

  const roasColor = (r: number) => r >= calc.roasBreakEven * 1.5 ? 'text-emerald-400' : r >= calc.roasBreakEven ? 'text-amber-400' : 'text-red-400'
  const netoColor = (n: number) => n >= 0 ? 'text-emerald-400' : 'text-red-400'

  const inputClass = 'input text-sm'
  const labelClass = 'block text-xs font-medium text-white/40 mb-1.5'

  return (
    <div className="min-h-screen">
      <Link href="/gestionar" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/gestionar" className="btn-ghost text-white/30 hover:text-white p-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">Calculadora de Rentabilidad</h1>
              <span className="tag tag-emerald text-[10px]" style={{background:'rgba(16,185,129,0.15)',color:'#34d399',border:'1px solid rgba(16,185,129,0.3)'}}>💰 Break-even</span>
            </div>
            <p className="text-white/40 text-xs">Calculá exactamente cuánto necesitás vender para ser rentable antes de invertir en ads</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Inputs */}
          <div className="space-y-5">
            {/* Moneda */}
            <div className="flex gap-2 p-1 bg-white/3 rounded-xl border border-white/8">
              {(['PYG','USD']).map(m => (
                <button key={m} onClick={() => setMoneda(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${moneda===m ? 'bg-violet-600 text-white' : 'text-white/30 hover:text-white/60'}`}>
                  {m === 'PYG' ? '🇵🇾 Guaraníes' : '🇺🇸 Dólares'}
                </button>
              ))}
            </div>

            {/* Producto */}
            <div className="card p-5 space-y-4">
              <p className="text-white font-semibold text-sm">📦 Tu Producto</p>
              {[
                { l: 'Precio de venta', v: precioVenta, set: setPrecioVenta, ph: moneda==='PYG'?'150000':'19.99' },
                { l: 'Costo del producto', v: costoProducto, set: setCostoProducto, ph: moneda==='PYG'?'45000':'6.00' },
                { l: `Flete Dropi (${moneda === 'PYG' ? 'Gs. 38.000' : moneda === 'COP' ? '$15.000' : '$89 MXN'} aprox)`, v: costoEnvio, set: setCostoEnvio, ph: String(getPaisConfig(moneda==='PYG'?'PY':moneda==='COP'?'CO':'MX').flete_dropi) },
                { l: 'Otros costos (empaque, etc.)', v: otrosCostos, set: setOtrosCostos, ph: moneda==='PYG'?'5000':'0.50' },
              ].map(f => (
                <div key={f.l}>
                  <label className={labelClass}>{f.l}</label>
                  <input className={inputClass} type="number" value={f.v || ''} onChange={e => f.set(parseFloat(e.target.value)||0)} placeholder={f.ph} />
                </div>
              ))}

              {/* Margen visual */}
              <div className="p-3 bg-white/3 rounded-xl border border-white/8">
                <div className="flex justify-between mb-1.5">
                  <p className="text-[10px] text-white/30">Margen bruto (sin ads)</p>
                  <p className={`text-xs font-bold ${calc.margenPct >= 40 ? 'text-emerald-400' : calc.margenPct >= 20 ? 'text-amber-400' : 'text-red-400'}`}>{calc.margenPct.toFixed(1)}%</p>
                </div>
                <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${calc.margenPct >= 40 ? 'bg-emerald-500' : calc.margenPct >= 20 ? 'bg-amber-500' : 'bg-red-500'}`} style={{width:`${Math.min(calc.margenPct,100)}%`}} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <p className="text-[10px] text-white/30">Costo total: {fmt(calc.costoTotal)}</p>
                  <p className="text-[10px] text-white/30">Ganancia/unidad: {fmt(calc.margenBruto)}</p>
                </div>
              </div>
            </div>

            {/* Campaña */}
            <div className="card p-5 space-y-4">
              <p className="text-white font-semibold text-sm">📘 Tu Campaña</p>
              {[
                { l: 'Presupuesto diario (USD)', v: presupuestoDiario, set: setPresupuestoDiario, ph: '50', step: 1 },
                { l: 'Duración de la campaña (días)', v: diasCampana, set: setDiasCampana, ph: '30', step: 1 },
                { l: 'CPC esperado (USD)', v: cpc, set: setCpc, ph: '0.50', step: 0.01 },
                { l: 'Tasa de conversión esperada (%)', v: tasaConversion, set: setTasaConversion, ph: '2.5', step: 0.1 },
                { l: 'Tasa de entrega COD (%)', v: tasaEntrega, set: setTasaEntrega, ph: '75', step: 1 },
              ].map(f => (
                <div key={f.l}>
                  <label className={labelClass}>{f.l}</label>
                  <input className={inputClass} type="number" step={f.step} value={f.v || ''} onChange={e => f.set(parseFloat(e.target.value)||0)} placeholder={f.ph} />
                </div>
              ))}
              <div className="p-3 bg-blue-500/8 border border-blue-500/15 rounded-xl text-xs text-white/40 space-y-1">
                <p>📘 Meta LATAM promedio: CPC $0.3-0.8, TC 1-3%</p>
                <p>🎵 TikTok LATAM promedio: CPC $0.2-0.5, TC 1.5-4%</p>
              </div>
              <div className="p-3 bg-amber-500/8 border border-amber-500/15 rounded-xl text-xs text-amber-400/70">
                💡 COD: El flete se paga en TODOS los pedidos, incluso los devueltos. Siempre incluilo en el cálculo.
              </div>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="space-y-4">
            {/* Break-even ROAS — el número más importante */}
            <div className="card p-5 border border-violet-500/30 bg-violet-500/6">
              <p className="text-violet-300 text-[10px] font-bold uppercase tracking-wider mb-2">🎯 Tu ROAS de Break-even</p>
              <p className="text-5xl font-black text-white mb-1">{calc.roasBreakEven.toFixed(2)}x</p>
              <p className="text-white/50 text-sm">Por cada $1 que gastás en ads, necesitás generar al menos <strong className="text-white">${calc.roasBreakEven.toFixed(2)}</strong> en ventas para no perder dinero.</p>
              <div className="mt-3 pt-3 border-t border-white/8 grid grid-cols-3 gap-3 text-center">
                <div><p className="text-[10px] text-red-400/60">Perdiendo</p><p className="text-red-400 font-bold text-sm">{"<"}{calc.roasBreakEven.toFixed(1)}x</p></div>
                <div><p className="text-[10px] text-amber-400/60">Break-even</p><p className="text-amber-400 font-bold text-sm">{calc.roasBreakEven.toFixed(1)}x</p></div>
                <div><p className="text-[10px] text-emerald-400/60">Escala</p><p className="text-emerald-400 font-bold text-sm">{">"}{(calc.roasBreakEven * 1.5).toFixed(1)}x</p></div>
              </div>
            </div>

            {/* Resumen campaña */}
            <div className="card p-5 border border-white/8">
              <p className="text-white text-sm font-semibold mb-3">Proyección de la campaña</p>
              <div className="space-y-2">
                {[
                  { l: 'Gasto total en ads', v: fmtUSD(calc.gastoTotal), c: 'text-white' },
                  { l: 'Clicks estimados', v: Math.round(calc.clicks).toLocaleString(), c: 'text-white' },
                  { l: 'Ventas estimadas', v: Math.round(calc.ventas).toLocaleString(), c: 'text-violet-300' },
                  { l: 'Ingresos brutos', v: fmt(calc.ingresosTotal), c: 'text-white' },
                  { l: 'Costo mercancía', v: fmt(calc.costoMercancia), c: 'text-red-400/70' },
                  { l: 'Costo ads', v: fmtUSD(calc.costoAds), c: 'text-red-400/70' },
                  { l: 'ROAS proyectado', v: `${calc.roasReal.toFixed(2)}x`, c: roasColor(calc.roasReal) },
                  { l: 'Ganancia NETA', v: fmt(calc.ingresoNeto), c: netoColor(calc.ingresoNeto) },
                ].map(row => (
                  <div key={row.l} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                    <p className="text-white/40 text-xs">{row.l}</p>
                    <p className={`text-xs font-bold ${row.c}`}>{row.v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Escenarios */}
            <div className="card p-5 border border-white/8">
              <p className="text-white text-sm font-semibold mb-3">Escenarios</p>
              <div className="space-y-3">
                {([['conservador','border-red-500/20 bg-red-500/5','text-red-300'],['base','border-blue-500/20 bg-blue-500/5','text-blue-300'],['optimista','border-emerald-500/20 bg-emerald-500/5','text-emerald-300']]).map(([sc, border, tc]) => {
                  const d = calc.scenarios[sc]
                  return (
                    <div key={sc} className={`p-3 rounded-xl border ${border}`}>
                      <div className="flex justify-between items-center mb-1.5">
                        <p className={`text-[10px] font-bold uppercase ${tc}`}>{sc.charAt(0).toUpperCase()+sc.slice(1)}</p>
                        <p className={`text-xs font-bold ${roasColor(d.roas)}`}>ROAS {d.roas.toFixed(2)}x</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div><p className="text-[9px] text-white/25">Ventas</p><p className="text-white/70 text-xs font-semibold">{Math.round(d.ventas)}</p></div>
                        <div><p className="text-[9px] text-white/25">Ingresos</p><p className="text-white/70 text-xs font-semibold">{fmt(d.ingresos)}</p></div>
                        <div><p className="text-[9px] text-white/25">Ganancia neta</p><p className={`text-xs font-semibold ${netoColor(d.neto)}`}>{fmt(d.neto)}</p></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recomendación */}
            <div className={`card p-4 border ${calc.roasReal >= calc.roasBreakEven ? 'border-emerald-500/25 bg-emerald-500/5' : 'border-red-500/25 bg-red-500/5'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${calc.roasReal >= calc.roasBreakEven ? 'text-emerald-300' : 'text-red-300'}`}>
                {calc.roasReal >= calc.roasBreakEven * 1.5 ? '🚀 Proyección excelente — lanzá con confianza' :
                 calc.roasReal >= calc.roasBreakEven ? '✅ Proyección rentable — lanzá y optimizá' :
                 '⚠️ Proyección negativa — revisá los costos o el presupuesto'}
              </p>
              <p className="text-white/60 text-xs leading-relaxed">
                {calc.roasReal >= calc.roasBreakEven * 1.5
                  ? `Con estos números, por cada $100 de ads generás ${fmt(calc.ingresosTotal/calc.gastoTotal*100)} de ingresos y ${fmt(calc.ingresoNeto/calc.gastoTotal*100)} de ganancia neta. Escalá gradualmente.`
                  : calc.roasReal >= calc.roasBreakEven
                  ? `Rentable pero ajustado. El margen de ${calc.margenPct.toFixed(1)}% deja poco espacio de error. Optimizá el CPC o la tasa de conversión antes de escalar fuerte.`
                  : `Con el ROAS proyectado de ${calc.roasReal.toFixed(2)}x y break-even de ${calc.roasBreakEven.toFixed(2)}x, la campaña está en rojo. Aumentá el precio, reducí costos o mejorá el creativo antes de invertir.`}
              </p>
            </div>

            <Link href="/war-room" className="btn-primary w-full py-3 text-center block mb-2">
              ⚡ Ir al War Room con estos datos →
            </Link>
            <div className="grid grid-cols-3 gap-2">
              <Link href="/kpis" className="text-center py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white/60 text-xs font-medium transition-all">📊 KPIs</Link>
              <Link href="/portfolio" className="text-center py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white/60 text-xs font-medium transition-all">📋 Portfolio</Link>
              <Link href="/presupuesto-escalado" className="text-center py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white/60 text-xs font-medium transition-all">📈 Escalar</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
