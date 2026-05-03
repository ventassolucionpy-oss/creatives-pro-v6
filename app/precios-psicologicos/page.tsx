'use client'
export const dynamic = 'force-dynamic'
import { useState, useMemo } from 'react'
import Navbar from '@/components/layout/Navbar'
import { getPaisConfig } from '@/lib/constants'
import Link from 'next/link'

type PricingAnalysis = {
  precio: number
  precio_tachado: number
  percepcion: string
  nivel_resistencia: 'bajo' | 'medio' | 'alto'
  tasa_conv_estimada: number
  ventas_estimadas: number
  ingreso_estimado: number
  margen_neto: number
  recomendado: boolean
  nota: string
}

const PRECIOS_PSICOLOGICOS_PY = [
  { rango: '50k-100k', desc: 'Impulso bajo riesgo', ejemplos: 'Accesorios, cosméticos básicos, gadgets pequeños' },
  { rango: '100k-150k', desc: 'Compra semi-reflexiva', ejemplos: 'Cuidado personal, herramientas pequeñas, ropa' },
  { rango: '150k-250k', desc: 'Compra reflexiva', ejemplos: 'Gadgets, salud, electrodomésticos menores' },
  { rango: '250k+', desc: 'Alta consideración', ejemplos: 'Electrónica, muebles, fitness' },
]

const BENCHMARKS_PY: Record<string, { conv: number; entrega: number }> = {
  'salud': { conv: 3.2, entrega: 78 },
  'belleza': { conv: 2.8, entrega: 74 },
  'hogar': { conv: 2.1, entrega: 72 },
  'fitness': { conv: 2.5, entrega: 75 },
  'tecnologia': { conv: 1.8, entrega: 80 },
  'ropa': { conv: 2.3, entrega: 70 },
  'general': { conv: 2.0, entrega: 75 },
}

export default function PreciosPsicologicosPage() {
  const [costoProducto, setCostoProducto] = useState('')
  const [costoEnvio, setCostoEnvio] = useState(String(getPaisConfig('PY').flete_dropi))
  const [gastoPublicitario, setGastoPublicitario] = useState('')
  const [categoria, setCategoria] = useState('general')
  const [clicksEsperados, setClicksEsperados] = useState('')
  const [calculado, setCalculado] = useState(false)

  const PRECIOS_OBJETIVO = [97000, 107000, 117000, 127000, 137000, 147000, 157000, 167000, 177000, 197000, 217000, 237000, 257000, 297000]

  const analyses = useMemo((): PricingAnalysis[] => {
    if (!costoProducto || !gastoPublicitario || !clicksEsperados) return []

    const cp = parseFloat(costoProducto)
    const flete = parseFloat(costoEnvio) || getPaisConfig('PY').flete_dropi
    const gasto = parseFloat(gastoPublicitario)
    const clicks = parseFloat(clicksEsperados)
    const bench = BENCHMARKS_PY[categoria]

    // Filtrar precios que son al menos 2x el costo
    const costoTotal = cp + flete
    const precios = PRECIOS_OBJETIVO.filter(p => p >= costoTotal * 1.8)

    return precios.map((precio, i) => {
      // La conversión baja cuando el precio sube — modelo logarítmico simple
      const factorPrecio = Math.pow(0.92, i) // cada escalón baja ~8%
      const tasaConv = (bench.conv * factorPrecio) / 100
      const ventas = clicks * tasaConv
      const entregadas = ventas * (bench.entrega / 100)
      const ingresos = entregadas * precio
      const costoMerch = entregadas * cp
      const costoFlete = ventas * flete // flete se paga por todos los pedidos
      const margen = ingresos - gasto - costoMerch - costoFlete

      // Detección de precio psicológico óptimo
      const esXX7 = precio.toString().endsWith('7000')
      const resistencia: PricingAnalysis['nivel_resistencia'] = precio > 200000 ? 'alto' : precio > 150000 ? 'medio' : 'bajo'

      // El precio recomendado maximiza el margen neto absoluto
      const precio_tachado = Math.ceil(precio * 1.7 / 7000) * 7000

      let nota = ''
      if (esXX7) nota = '✓ Precio X7 — termina en "7" lo que genera percepción de descuento mayor'
      if (precio === 157000) nota = '⭐ Precio estrella Paraguay — alta conversión histórica en COD'
      if (precio === 197000) nota = '🔥 Aspiracional — funciona bien con producto premium en video'

      return {
        precio, precio_tachado,
        percepcion: precio < 100000 ? 'Accesible' : precio < 150000 ? 'Razonable' : precio < 200000 ? 'Moderado' : 'Premium',
        nivel_resistencia: resistencia,
        tasa_conv_estimada: tasaConv * 100,
        ventas_estimadas: ventas,
        ingreso_estimado: ingresos,
        margen_neto: margen,
        recomendado: margen > 0 && esXX7,
        nota,
      }
    })
  }, [costoProducto, costoEnvio, gastoPublicitario, clicksEsperados, categoria])

  const mejorMargen = analyses.length > 0 ? analyses.reduce((best, a) => a.margen_neto > best.margen_neto ? a : best) : null

  const fmt = (n: number) => `Gs. ${Math.round(n).toLocaleString('es-PY')}`
  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-white/20'
  const labelCls = 'block text-xs text-white/40 mb-1.5 font-medium'

  const resistenciaColor = (r: PricingAnalysis['nivel_resistencia']) =>
    r === 'bajo' ? 'text-emerald-400' : r === 'medio' ? 'text-amber-400' : 'text-red-400'
  const margenColor = (m: number) => m > 0 ? 'text-emerald-400' : 'text-red-400'

  return (
    <div className="min-h-screen">
      <Link href="/gestionar" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dropi" className="text-white/30 hover:text-white/60 text-sm transition-colors">Dropi PY</Link>
            <span className="text-white/20 text-sm">›</span>
            <span className="text-white/60 text-sm">Precios</span>
          </div>
          <h1 className="text-2xl font-bold text-white">🧮 Precios Psicológicos</h1>
          <p className="text-white/40 text-sm mt-1">¿Gs. 147k, 157k o 197k? Simulá el impacto en tu margen</p>
        </div>

        {/* Referencias */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {PRECIOS_PSICOLOGICOS_PY.map(r => (
            <div key={r.rango} className="card p-3 border border-white/5">
              <p className="text-violet-400 text-xs font-bold">Gs. {r.rango}</p>
              <p className="text-white/60 text-[10px] mt-0.5">{r.desc}</p>
            </div>
          ))}
        </div>

        {/* Inputs */}
        <div className="card p-5 mb-5 border border-white/8">
          <p className="text-sm font-bold text-white mb-4">Datos del producto</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Costo del producto (Gs.)</label>
                <input className={inputCls} type="number" placeholder="ej. 35000" value={costoProducto} onChange={e => setCostoProducto(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Flete Dropi (Gs.)</label>
                <input className={inputCls} type="number" placeholder={String(getPaisConfig('PY').flete_dropi)} value={costoEnvio} onChange={e => setCostoEnvio(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Gasto total en ads (Gs.)</label>
                <input className={inputCls} type="number" placeholder="ej. 500000" value={gastoPublicitario} onChange={e => setGastoPublicitario(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Clicks estimados</label>
                <input className={inputCls} type="number" placeholder="ej. 1000" value={clicksEsperados} onChange={e => setClicksEsperados(e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Categoría del producto</label>
              <select className={inputCls} value={categoria} onChange={e => setCategoria(e.target.value)}>
                {Object.entries(BENCHMARKS_PY).map(([k, v]) => (
                  <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)} (conv. media: {v.conv}%)</option>
                ))}
              </select>
            </div>
            <button onClick={() => setCalculado(true)} disabled={!costoProducto || !gastoPublicitario || !clicksEsperados}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-sm transition-all">
              Simular precios
            </button>
          </div>
        </div>

        {/* Mejor precio */}
        {calculado && mejorMargen && (
          <div className="card p-5 border border-emerald-500/30 bg-emerald-500/5 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-emerald-400 text-lg">🏆</span>
              <p className="text-emerald-300 font-bold text-sm">Precio con mayor margen neto</p>
            </div>
            <p className="text-3xl font-black text-white mb-1">{fmt(mejorMargen.precio)}</p>
            <p className="text-sm text-white/50">Precio tachado sugerido: <span className="line-through text-white/30">{fmt(mejorMargen.precio_tachado)}</span></p>
            <p className="text-emerald-400 font-bold mt-2">Margen neto estimado: {fmt(mejorMargen.margen_neto)}</p>
            {mejorMargen.nota && <p className="text-xs text-white/40 mt-2">{mejorMargen.nota}</p>}
          </div>
        )}

        {/* Tabla comparativa */}
        {calculado && analyses.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-3">Comparativa de precios</p>
            {analyses.map(a => (
              <div key={a.precio} className={`card p-4 border transition-all ${a.precio === mejorMargen?.precio ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/8'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-bold">{fmt(a.precio)}</p>
                      {a.precio === mejorMargen?.precio && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">MEJOR</span>}
                    </div>
                    <p className="text-white/30 text-xs mt-0.5">Tachado: {fmt(a.precio_tachado)} · {a.percepcion}</p>
                    {a.nota && <p className="text-violet-400 text-[10px] mt-1">{a.nota}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${margenColor(a.margen_neto)}`}>{fmt(a.margen_neto)}</p>
                    <p className="text-white/30 text-[10px]">margen neto</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-2 pt-2 border-t border-white/5">
                  <div>
                    <p className="text-white/60 text-xs">{a.tasa_conv_estimada.toFixed(2)}% conv.</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">{a.ventas_estimadas.toFixed(0)} ventas est.</p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${resistenciaColor(a.nivel_resistencia)}`}>
                      Resistencia {a.nivel_resistencia}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card p-4 mt-5 border border-amber-500/20 bg-amber-500/5">
          <p className="text-xs text-amber-300 font-bold mb-1">💡 Regla de oro Paraguay COD</p>
          <p className="text-xs text-white/40">Los precios que terminan en "7" (Gs. 147.000, 157.000, 197.000) generan mayor percepción de oferta. El precio tachado al +70% activa el sesgo de anclaje. Testeá siempre 2 precios distintos antes de escalar.</p>
        </div>

      </main>
    </div>
  )
}
