'use client'
export const dynamic = 'force-dynamic'
import { useState, useMemo } from 'react'
import Navbar from '@/components/layout/Navbar'
import { getPaisConfig, PAISES, type Pais } from '@/lib/constants'
import Link from 'next/link'

export default function PresupuestoEscaladoPage() {
  const [pais, setPais] = useState<Pais>('PY')
  const [presupuesto, setPresupuesto] = useState('')
  const [moneda, setMoneda] = useState<'PYG' | 'USD'>('PYG')
  const [riesgo, setRiesgo] = useState<'conservador' | 'equilibrado' | 'agresivo'>('equilibrado')
  const [productosActivos, setProductosActivos] = useState('0')
  const [roasPromedio, setRoasPromedio] = useState('')
  const [calculado, setCalculado] = useState(false)

  const FX = 6350 // PYG por USD

  const plan = useMemo(() => {
    const paisFx = getPaisConfig(moneda === 'PYG' ? 'PY' : moneda === 'COP' ? 'CO' : 'MX').fx_usd
    const presUSD = moneda !== 'USD' ? parseFloat(presupuesto) / paisFx : parseFloat(presupuesto)
    if (!presUSD || presUSD <= 0) return null

    const roas = parseFloat(roasPromedio) || 0
    const activos = parseInt(productosActivos) || 0

    // Estrategia de distribución por nivel de riesgo
    const config = {
      conservador: { test: 0.5, escalar: 0.35, mantenimiento: 0.15, diasTest: 7, budgetMinTest: 3 },
      equilibrado: { test: 0.4, escalar: 0.45, mantenimiento: 0.15, diasTest: 5, budgetMinTest: 5 },
      agresivo: { test: 0.3, escalar: 0.55, mantenimiento: 0.15, diasTest: 3, budgetMinTest: 8 },
    }
    const cfg = config[riesgo]

    // Distribución del presupuesto
    const paraTest = presUSD * cfg.test
    const paraEscalar = presUSD * cfg.escalar
    const paraMantenimiento = presUSD * cfg.mantenimiento

    // Cuántos productos testear
    const budgetPorProducto = cfg.budgetMinTest * cfg.diasTest // $ por producto en fase test
    const productosATestear = Math.max(1, Math.floor(paraTest / budgetPorProducto))
    const budgetDiarioPorProductoTest = budgetPorProducto / cfg.diasTest

    // Proyección si un producto gana
    const ingresoProyectado = roas > 0 ? paraEscalar * roas : null
    const roasBreakEven = 2.2 // aproximado para Paraguay COD

    // Señales de que funciona
    const senalEscalar = roasBreakEven * 1.4
    const senalPausar = roasBreakEven * 0.7

    const fmt = (usd: number) => moneda === 'PYG'
      ? `Gs. ${Math.round(usd * getPaisConfig('PY').fx_usd).toLocaleString('es-PY')}`
      : `$${usd.toFixed(2)}`

    return {
      presUSD, paraTest, paraEscalar, paraMantenimiento,
      productosATestear, budgetDiarioPorProductoTest,
      budgetPorProducto, diasTest: cfg.diasTest,
      ingresoProyectado, roasBreakEven, senalEscalar, senalPausar,
      activos, roas, fmt,
      tieneProductosActivos: activos > 0 && roas > 0,
    }
  }, [presupuesto, moneda, riesgo, productosActivos, roasPromedio])

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-white/20'
  const labelCls = 'block text-xs text-white/40 mb-1.5 font-medium'

  const riesgoConfig = {
    conservador: { color: 'border-emerald-500/30 bg-emerald-500/5', text: 'text-emerald-400', label: 'Conservador', sub: 'Más productos a testear, menos riesgo por producto' },
    equilibrado: { color: 'border-violet-500/30 bg-violet-500/5', text: 'text-violet-400', label: 'Equilibrado', sub: 'Balance entre exploración y explotación' },
    agresivo: { color: 'border-red-500/30 bg-red-500/5', text: 'text-red-400', label: 'Agresivo', sub: 'Más presupuesto en lo que ya funciona' },
  }

  return (
    <div className="min-h-screen">
      <Link href="/gestionar" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/gestionar" className="text-white/30 hover:text-white/60 text-sm transition-colors">Gestionar</Link>
            <span className="text-white/20 text-sm">›</span>
            <span className="text-white/60 text-sm">Escalado</span>
          </div>
          <h1 className="text-2xl font-bold text-white">📈 Escalado Progresivo</h1>
          <p className="text-white/40 text-sm mt-1">¿Cuánto presupuesto tenés? Te digo cómo distribuirlo.</p>
        </div>

        {/* Inputs */}
        <div className="card p-5 mb-5 border border-white/8">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Presupuesto disponible</label>
              <div className="flex gap-2">
                <select className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none flex-shrink-0"
                  value={moneda} onChange={e => setMoneda(e.target.value as 'PYG' | 'USD')}>
                  <option value="PYG">Gs.</option>
                  <option value="USD">USD</option>
                </select>
                <input className={inputCls} type="number"
                  placeholder={moneda === 'PYG' ? 'ej. 3900000' : 'ej. 500'}
                  value={presupuesto} onChange={e => setPresupuesto(e.target.value)} />
              </div>
              {presupuesto && moneda === 'PYG' && (
                <p className="text-white/25 text-xs mt-1">≈ ${(parseFloat(presupuesto) / getPaisConfig('PY').fx_usd).toFixed(0)} USD</p>
              )}
              {presupuesto && moneda === 'USD' && (
                <p className="text-white/25 text-xs mt-1">≈ Gs. {Math.round(parseFloat(presupuesto) * getPaisConfig('PY').fx_usd).toLocaleString('es-PY')}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Productos activos con ROAS</label>
                <input className={inputCls} type="number" placeholder="0" value={productosActivos} onChange={e => setProductosActivos(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>ROAS promedio actual</label>
                <input className={inputCls} type="number" step="0.1" placeholder="ej. 2.8" value={roasPromedio} onChange={e => setRoasPromedio(e.target.value)} />
              </div>
            </div>

            {/* Riesgo */}
            <div>
              <label className={labelCls}>Perfil de riesgo</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {(Object.entries(riesgoConfig) as [typeof riesgo, typeof riesgoConfig[typeof riesgo]][]).map(([k, v]) => (
                  <button key={k} onClick={() => setRiesgo(k)}
                    className={`p-3 rounded-xl border text-center transition-all ${riesgo === k ? v.color : 'border-white/10'}`}>
                    <p className={`text-xs font-bold ${riesgo === k ? v.text : 'text-white/40'}`}>{v.label}</p>
                  </button>
                ))}
              </div>
              <p className="text-white/30 text-xs mt-2">{riesgoConfig[riesgo].sub}</p>
            </div>

            <button onClick={() => setCalculado(true)} disabled={!presupuesto}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-sm transition-all">
              Calcular distribución
            </button>
          </div>
        </div>

        {/* Plan */}
        {calculado && plan && (
          <>
            {/* Resumen */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="card p-3 text-center border border-amber-500/20 bg-amber-500/5">
                <p className="text-amber-400 text-xs font-bold mb-1">🧪 TESTEAR</p>
                <p className="text-white font-black text-sm">{plan.fmt(plan.paraTest)}</p>
                <p className="text-white/30 text-[10px] mt-0.5">{(40 * (riesgo === 'conservador' ? 1.25 : riesgo === 'agresivo' ? 0.75 : 1)).toFixed(0)}% del total</p>
              </div>
              <div className="card p-3 text-center border border-emerald-500/20 bg-emerald-500/5">
                <p className="text-emerald-400 text-xs font-bold mb-1">🚀 ESCALAR</p>
                <p className="text-white font-black text-sm">{plan.fmt(plan.paraEscalar)}</p>
                <p className="text-white/30 text-[10px] mt-0.5">{(45 * (riesgo === 'agresivo' ? 1.22 : riesgo === 'conservador' ? 0.78 : 1)).toFixed(0)}% del total</p>
              </div>
              <div className="card p-3 text-center border border-blue-500/20 bg-blue-500/5">
                <p className="text-blue-400 text-xs font-bold mb-1">🔒 MANTENER</p>
                <p className="text-white font-black text-sm">{plan.fmt(plan.paraMantenimiento)}</p>
                <p className="text-white/30 text-[10px] mt-0.5">15% del total</p>
              </div>
            </div>

            {/* Plan de testeo */}
            <div className="card p-5 border border-amber-500/20 bg-amber-500/5 mb-4">
              <p className="text-amber-400 font-bold text-sm mb-3">🧪 Plan de testeo</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-white/60 text-sm">Productos a testear</p>
                  <p className="text-white font-bold">{plan.productosATestear} productos</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-white/60 text-sm">Budget por producto</p>
                  <p className="text-white font-bold">{plan.fmt(plan.budgetPorProducto)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-white/60 text-sm">Budget diario por producto</p>
                  <p className="text-white font-bold">{plan.fmt(plan.budgetDiarioPorProductoTest)}/día</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-white/60 text-sm">Días de test por producto</p>
                  <p className="text-white font-bold">{plan.diasTest} días</p>
                </div>
              </div>
            </div>

            {/* Señales */}
            <div className="card p-5 border border-white/8 mb-4">
              <p className="text-white font-bold text-sm mb-3">🚦 ¿Cuándo escalar o pausar?</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-emerald-400 text-xs font-bold">Escalar si ROAS ≥ {plan.senalEscalar.toFixed(1)}x</p>
                    <p className="text-white/40 text-xs">Aumentá el budget diario un 20-30% y monitoreá 48h</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-amber-400 text-xs font-bold">Mantener si ROAS entre {plan.senalPausar.toFixed(1)}x y {plan.senalEscalar.toFixed(1)}x</p>
                    <p className="text-white/40 text-xs">No tocar el budget, optimizar el creativo</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-red-400 text-xs font-bold">Pausar si ROAS ≤ {plan.senalPausar.toFixed(1)}x después de {plan.diasTest} días</p>
                    <p className="text-white/40 text-xs">El producto o el creativo no está funcionando — mover a otro</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Proyección */}
            {plan.ingresoProyectado && plan.roas > 0 && (
              <div className="card p-5 border border-emerald-500/20 bg-emerald-500/5 mb-4">
                <p className="text-emerald-400 font-bold text-sm mb-2">💰 Proyección si tu ROAS actual se mantiene</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-white/40 text-xs">Gasto en escalar</p>
                    <p className="text-white font-bold">{plan.fmt(plan.paraEscalar)}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Ingresos proyectados</p>
                    <p className="text-emerald-400 font-bold">{plan.fmt(plan.ingresoProyectado)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="card p-5 border border-white/8 mb-5">
              <p className="text-white font-bold text-sm mb-3">📅 Timeline sugerido</p>
              <div className="space-y-3">
                {[
                  { dia: 'Día 1-2', accion: `Lanzás los ${plan.productosATestear} productos en test a ${plan.fmt(plan.budgetDiarioPorProductoTest)}/día c/u`, color: 'text-amber-400' },
                  { dia: `Día ${plan.diasTest}`, accion: `Revisás ROAS. Pausás los que no llegaron a ${plan.senalPausar.toFixed(1)}x`, color: 'text-amber-400' },
                  { dia: `Día ${plan.diasTest + 1}`, accion: `Movés el budget de los pausados al ganador. Empezás a escalar.`, color: 'text-emerald-400' },
                  { dia: 'Día 14+', accion: 'Duplicás el adset ganador con audiencia lookalike y subís budget 20% cada 3 días.', color: 'text-emerald-400' },
                ].map(step => (
                  <div key={step.dia} className="flex items-start gap-3">
                    <span className={`text-xs font-bold flex-shrink-0 w-16 ${step.color}`}>{step.dia}</span>
                    <p className="text-white/60 text-xs leading-relaxed">{step.accion}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!calculado && (
          <div className="card p-6 text-center border border-white/5">
            <p className="text-4xl mb-3">📈</p>
            <p className="text-white/60 font-semibold mb-1">Ingresá tu presupuesto</p>
            <p className="text-white/30 text-sm">Te decimos exactamente cuánto poner en testeo, cuánto en escalar lo que ya funciona y cómo leer las señales para saber cuándo mover el dinero.</p>
          </div>
        )}

        <div className="card p-4 border border-violet-500/20 bg-violet-500/5">
          <p className="text-xs text-violet-300 font-bold mb-1">💡 Complemento de Andromeda</p>
          <p className="text-xs text-white/40">Andromeda define las 3 fases estratégicas. Este módulo te dice cómo distribuir el presupuesto REAL que tenés hoy entre múltiples productos, con números concretos.</p>
        </div>

      </main>
    </div>
  )
}
