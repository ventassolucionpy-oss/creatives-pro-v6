'use client'
export const dynamic = 'force-dynamic'
import { useState, useMemo, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { PAISES, getPaisConfig, formatPrecio, redondearPrecioPsicologico, type Pais } from '@/lib/constants'

// --- TIPOS ------------------------------------------------
type ProductoGanador = {
  nombre: string
  problema_que_resuelve: string
  por_que_gana_en_mercado: string
  score_problema: number
  demanda_estimada: 'muy alta' | 'alta' | 'media'
  competencia_en_dropi: 'baja' | 'media' | 'alta'
  rango_costo_dropi: string
  precio_venta_sugerido: string
  margen_estimado: string
  publico_principal: string
  urgencia_compra: 'alta' | 'media' | 'baja'
  tipo_problema: string
  mejor_canal: string
  advertencia?: string
}

type BusquedaOutput = {
  productos: ProductoGanador[]
  criterios_usados: string[]
  consejo_final: string
}

type CalcResult = {
  precio_venta_min: number
  precio_venta_max: number
  precio_recomendado: number
  precio_tachado: number
  ganancia_por_venta: number
  ganancia_mensual_real: number
  roas_minimo: number
  costo_ads_por_venta: number
  costo_total_por_venta: number
  margen_pct: number
  ventasReales: number
}

// --- CALCULADORA (parametrizada por país) -----------------
function calcularPrecio(
  costoDropi: number,
  tasaEntrega: number,
  utilidadPct: number,
  presupuestoAds: number,
  ventasEstimadas: number,
  pais: Pais
): CalcResult {
  const cfg = PAISES[pais]
  const flete = cfg.flete_dropi
  const fx = cfg.fx_usd

  const presupuestoLocal = presupuestoAds * fx
  const ventasReales = ventasEstimadas * (tasaEntrega / 100)
  const costoAdsPorVenta = ventasReales > 0 ? presupuestoLocal / ventasReales : 0

  // Flete ponderado: pagamos flete ida siempre + vuelta en devoluciones
  const fletePromedioPonderado = flete + (((1 - tasaEntrega / 100) / (tasaEntrega / 100)) * flete)
  const costoTotalPorVenta = costoDropi + fletePromedioPonderado + costoAdsPorVenta

  const margenDecimal = utilidadPct / 100
  const precioMin = costoTotalPorVenta / (1 - margenDecimal)
  const precioRec = redondearPrecioPsicologico(precioMin, pais)
  const precioMax = redondearPrecioPsicologico(precioMin * 1.2, pais)
  const precioTachado = redondearPrecioPsicologico(precioRec * 1.7, pais)

  const gananciaBruta = precioRec - costoDropi - flete - costoAdsPorVenta
  const gananciaConsiderandoDev = gananciaBruta - ((1 - tasaEntrega / 100) * flete)

  return {
    precio_venta_min: Math.round(precioMin),
    precio_venta_max: Math.round(precioMax),
    precio_recomendado: precioRec,
    precio_tachado: precioTachado,
    ganancia_por_venta: Math.round(gananciaConsiderandoDev),
    ganancia_mensual_real: Math.round(gananciaConsiderandoDev * ventasReales),
    roas_minimo: precioRec > 0 ? Math.round((costoAdsPorVenta > 0 ? precioRec / costoAdsPorVenta : 3) * 10) / 10 : 3,
    costo_ads_por_venta: Math.round(costoAdsPorVenta),
    costo_total_por_venta: Math.round(costoTotalPorVenta),
    margen_pct: Math.round(((precioRec - costoTotalPorVenta) / precioRec) * 100),
    ventasReales: Math.round(ventasReales),
  }
}

// --- API: buscador de productos ganadores (multi-país) ----
async function buscarProductosGanadores(categoria: string, contexto: string, pais: Pais): Promise<BusquedaOutput> {
  const cfg = PAISES[pais]
  const prompt = `Sos un experto en dropshipping con 6+ años operando con Dropi en ${cfg.nombre} (${cfg.url_dropi}).

CONTEXTO DEL MERCADO:
${cfg.contexto_cultural}

REGLA DE ORO: Los productos ganadores resuelven un dolor cotidiano real con suficiente urgencia para pagar COD sin haberlo visto físicamente.

CRITERIOS PARA PRODUCTO GANADOR EN ${cfg.nombre.toUpperCase()} CON DROPI:
1. Resuelve un problema cotidiano real (dolor físico, incomodidad, pérdida de tiempo, inseguridad)
2. Disponible en el catálogo de Dropi ${cfg.nombre}
3. El problema genera urgencia suficiente para pago COD
4. Margen real post-ads y post-devoluciones: 20-30%
5. No es producto de moda — demanda constante
6. Tasa de entrega estimada: ${cfg.tasa_entrega_default}% (promedio en ${cfg.nombre})
7. Precio de venta entre ${formatPrecio(cfg.precio_min, pais)} - ${formatPrecio(cfg.precio_max, pais)} (sweet spot en ${cfg.nombre})
8. No es frágil para el transporte de Dropi

CATEGORÍA SOLICITADA: ${categoria || 'cualquier categoría'}
CONTEXTO ADICIONAL: ${contexto || `producto para vender por Meta Ads y TikTok con COD en ${cfg.nombre}`}

Respondé SOLO con JSON válido:
{
  "productos": [
    {
      "nombre": "nombre del producto en Dropi",
      "problema_que_resuelve": "descripción del problema cotidiano — el dolor del usuario, no el feature",
      "por_que_gana_en_mercado": "razón específica de por qué funciona en ${cfg.nombre} — clima, cultura, hábitos locales",
      "score_problema": 8.5,
      "demanda_estimada": "muy alta",
      "competencia_en_dropi": "baja",
      "rango_costo_dropi": "${cfg.simbolo} ${Math.round(cfg.precio_min * 0.35).toLocaleString()} - ${cfg.simbolo} ${Math.round(cfg.precio_min * 0.55).toLocaleString()}",
      "precio_venta_sugerido": "${cfg.simbolo} ${Math.round(cfg.precio_min * 1.8).toLocaleString()}",
      "margen_estimado": "25-30% neto post-ads y devoluciones",
      "publico_principal": "descripción del comprador ideal en ${cfg.nombre}",
      "urgencia_compra": "alta",
      "tipo_problema": "Dolor físico crónico / Incomodidad / Seguridad / etc.",
      "mejor_canal": "Meta Ads COD / TikTok / Ambos",
      "advertencia": "si hay algo a tener en cuenta antes de lanzar"
    }
  ],
  "criterios_usados": ["criterio 1", "criterio 2", "criterio 3"],
  "consejo_final": "consejo estratégico de un operador experto en Dropi ${cfg.nombre} sobre cómo arrancar"
}`

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  })
  const data = await res.json()
  const raw: string = data.text || ''
  let clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const s = clean.indexOf('{'), e = clean.lastIndexOf('}')
  if (s >= 0 && e > s) clean = clean.slice(s, e + 1)
  return JSON.parse(clean) as BusquedaOutput
}

// --- UTILS ------------------------------------------------
const scoreColor = (s: number) => s >= 8 ? 'text-emerald-400' : s >= 6 ? 'text-amber-400' : 'text-red-400'
const demandaColor: Record<string, string> = { 'muy alta': 'tag-green', 'alta': 'tag-gold', 'media': 'tag-gray' }
const urgenciaColor: Record<string, string> = { 'alta': 'bg-emerald-500/15 text-emerald-400', 'media': 'bg-amber-500/15 text-amber-400', 'baja': 'bg-white/8 text-white/40' }
const competenciaColor: Record<string, string> = { 'baja': 'text-emerald-400', 'media': 'text-amber-400', 'alta': 'text-red-400' }

// --- COMPONENTES ------------------------------------------
function ProductCard({ p, index, pais, onSelect }: { p: ProductoGanador; index: number; pais: Pais; onSelect: () => void }) {
  const [open, setOpen] = useState(false)
  const cfg = PAISES[pais]
  return (
    <div className="card border border-white/8 overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full p-4 text-left flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-300 font-black text-sm flex-shrink-0 mt-0.5">{index + 1}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-white font-bold text-sm">{p.nombre}</p>
            <span className={`tag ${demandaColor[p.demanda_estimada] || 'tag-gray'} text-[10px]`}>{p.demanda_estimada}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${urgenciaColor[p.urgencia_compra] || ''}`}>urgencia {p.urgencia_compra}</span>
          </div>
          <p className="text-white/50 text-xs leading-relaxed">{p.problema_que_resuelve}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className={`text-xl font-black ${scoreColor(p.score_problema)}`}>{p.score_problema}</p>
            <p className="text-[9px] text-white/25">score</p>
          </div>
          <span className="text-white/20 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-3 animate-fade-up">
          <div className="p-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl">
            <p className="text-[10px] text-emerald-400/60 font-bold uppercase mb-1">{cfg.bandera} Por qué funciona en {cfg.nombre}</p>
            <p className="text-white/75 text-sm leading-relaxed">{p.por_que_gana_en_mercado}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Tipo de problema', p.tipo_problema, 'text-white/70'],
              ['Público principal', p.publico_principal, 'text-white/70'],
              ['Competencia Dropi', p.competencia_en_dropi, competenciaColor[p.competencia_en_dropi] || ''],
              ['Mejor canal', p.mejor_canal, 'text-violet-400'],
              ['Costo Dropi est.', p.rango_costo_dropi, 'text-white/70'],
              ['Precio venta sug.', p.precio_venta_sugerido, 'text-emerald-400 font-bold'],
              ['Margen estimado', p.margen_estimado, 'text-emerald-400'],
            ].map(([l, v, c]) => (
              <div key={l} className="p-3 bg-white/3 border border-white/6 rounded-lg">
                <p className="text-[10px] text-white/25 mb-0.5">{l}</p>
                <p className={`text-xs font-medium ${c}`}>{v}</p>
              </div>
            ))}
          </div>
          {p.advertencia && (
            <div className="p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl">
              <p className="text-amber-400 text-[10px] font-bold uppercase mb-1">⚠️ A tener en cuenta</p>
              <p className="text-white/65 text-xs leading-relaxed">{p.advertencia}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={onSelect} className="btn-primary flex-1 text-sm py-2.5">💰 Calcular precio →</button>
            <Link href="/campana" className="btn-secondary px-4 py-2.5 text-xs">⚡ Campaña</Link>
          </div>
        </div>
      )}
    </div>
  )
}

function Calculadora({ pais, productoNombre }: { pais: Pais; productoNombre?: string }) {
  const cfg = PAISES[pais]
  const [costoDropi, setCostoDropi] = useState(0)
  const [presupuestoUSD, setPresupuestoUSD] = useState(30)
  const [ventasMes, setVentasMes] = useState(100)
  const [tasaEntrega, setTasaEntrega] = useState(cfg.tasa_entrega_default)
  const [utilidad, setUtilidad] = useState(25)

  // Reset tasa entrega when country changes
  useEffect(() => { setTasaEntrega(cfg.tasa_entrega_default) }, [pais])

  const fmt = (n: number) => formatPrecio(n, pais)

  const result = useMemo(() => {
    if (costoDropi <= 0) return null
    return calcularPrecio(costoDropi, tasaEntrega, utilidad, presupuestoUSD, ventasMes, pais)
  }, [costoDropi, presupuestoUSD, ventasMes, tasaEntrega, utilidad, pais])

  return (
    <div className="space-y-5">
      {productoNombre && (
        <div className="card p-3 border border-violet-500/20 bg-violet-500/5">
          <p className="text-violet-300 text-xs">Calculando para: <strong>{productoNombre}</strong></p>
        </div>
      )}
      <div className="card p-5 space-y-4">
        <p className="text-white font-semibold text-sm">📦 Costos ({cfg.bandera} {cfg.nombre})</p>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Costo del producto en Dropi ({cfg.simbolo}) *</label>
          <input className="input text-sm" type="number" value={costoDropi || ''} onChange={e => setCostoDropi(Number(e.target.value) || 0)} placeholder={`Ej: ${Math.round(cfg.precio_min * 0.4).toLocaleString()}`} />
        </div>
        <div className="p-3 bg-white/3 border border-white/8 rounded-lg flex items-center justify-between">
          <p className="text-white/50 text-xs">Flete estándar Dropi {cfg.nombre}</p>
          <p className="text-white font-bold text-sm">{fmt(cfg.flete_dropi)}</p>
        </div>
        <div className="p-3 bg-white/3 border border-white/8 rounded-lg flex items-center justify-between">
          <p className="text-white/50 text-xs">Tipo de cambio USD → {cfg.moneda}</p>
          <p className="text-white font-bold text-sm">1 USD = {cfg.fx_usd.toLocaleString()} {cfg.moneda}</p>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <p className="text-white font-semibold text-sm">📊 Tu campaña</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Presupuesto ads/mes (USD)</label>
            <input className="input text-sm" type="number" value={presupuestoUSD} onChange={e => setPresupuestoUSD(Number(e.target.value) || 0)} placeholder="30" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Pedidos esperados/mes</label>
            <input className="input text-sm" type="number" value={ventasMes} onChange={e => setVentasMes(Number(e.target.value) || 0)} placeholder="100" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-white/40">Tasa de entrega COD</label>
            <span className="text-white font-bold">{tasaEntrega}%</span>
          </div>
          <input type="range" min="50" max="95" value={tasaEntrega} onChange={e => setTasaEntrega(Number(e.target.value))} className="w-full accent-violet-500" />
          <div className="flex justify-between text-[10px] text-white/20 mt-0.5">
            <span>50%</span><span>{cfg.tasa_entrega_default}% (ref. {cfg.nombre})</span><span>95%</span>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-white/40">% utilidad objetivo</label>
            <span className="text-white font-bold">{utilidad}%</span>
          </div>
          <input type="range" min="20" max="30" step="1" value={utilidad} onChange={e => setUtilidad(Number(e.target.value))} className="w-full accent-emerald-500" />
        </div>
      </div>

      {result && (
        <div className="space-y-4 animate-fade-up">
          <div className="card p-6 border border-emerald-500/30 bg-emerald-500/5 text-center">
            <p className="text-[10px] text-emerald-400/60 uppercase tracking-wider mb-1">Precio de venta recomendado</p>
            <p className="text-4xl font-black text-emerald-400 mb-1">{fmt(result.precio_recomendado)}</p>
            <p className="text-white/30 text-sm line-through mb-1">{fmt(result.precio_tachado)} (precio tachado)</p>
            <p className="text-white/40 text-xs">Margen real: <strong className="text-emerald-400">{result.margen_pct}%</strong></p>
          </div>

          <div className="card p-5 border border-white/8">
            <p className="text-white/50 text-xs font-bold uppercase mb-3">Desglose por venta exitosa</p>
            <div className="space-y-2">
              {[
                ['Precio de venta', fmt(result.precio_recomendado), 'text-emerald-400'],
                [`− Costo producto Dropi`, fmt(costoDropi), 'text-red-400/70'],
                [`− Flete ponderado COD`, fmt(cfg.flete_dropi * (1 + (1 - tasaEntrega/100)/(tasaEntrega/100))), 'text-red-400/70'],
                ['− Costo ads por venta', fmt(result.costo_ads_por_venta), 'text-red-400/70'],
                ['= Ganancia neta', fmt(result.ganancia_por_venta), 'text-emerald-400 font-bold text-base'],
              ].map(([l, v, c]) => (
                <div key={l} className={`flex justify-between items-center py-2 ${String(l).startsWith('=') ? 'border-t-2 border-emerald-500/20 mt-2 pt-3' : 'border-b border-white/5'}`}>
                  <p className="text-white/50 text-xs">{l}</p><p className={`text-xs ${c}`}>{v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4 border border-blue-500/15 bg-blue-500/5">
              <p className="text-blue-300 text-[10px] uppercase mb-1">Pedidos/mes</p>
              <p className="text-white text-2xl font-bold">{ventasMes}</p>
            </div>
            <div className="card p-4 border border-emerald-500/20 bg-emerald-500/5">
              <p className="text-emerald-300 text-[10px] uppercase mb-1">Entregas reales</p>
              <p className="text-emerald-400 text-2xl font-bold">{result.ventasReales}</p>
            </div>
            <div className="card p-4 border border-amber-500/15 bg-amber-500/5 col-span-2">
              <p className="text-amber-300 text-[10px] uppercase mb-1">Ganancia mensual estimada</p>
              <p className="text-amber-400 text-3xl font-black">{fmt(result.ganancia_mensual_real)}</p>
              <p className="text-white/30 text-[10px] mt-0.5">{result.ventasReales} entregas × {fmt(result.ganancia_por_venta)}/venta</p>
            </div>
          </div>

          <div className="card p-4 border border-violet-500/15 bg-violet-500/5">
            <p className="text-violet-300 text-[10px] font-bold uppercase mb-3">Meta Ads — Lo que necesitás lograr</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><p className="text-[9px] text-white/25 mb-0.5">ROAS break-even</p><p className="text-violet-400 font-bold text-lg">{result.roas_minimo}x</p></div>
              <div><p className="text-[9px] text-white/25 mb-0.5">Budget ads/mes</p><p className="text-white font-bold text-lg">${presupuestoUSD}</p></div>
              <div><p className="text-[9px] text-white/25 mb-0.5">CPA máximo</p><p className="text-white font-bold text-sm">{fmt(result.costo_ads_por_venta)}</p></div>
            </div>
          </div>

          {/* Escenarios de tasa */}
          <div className="card p-4 border border-white/8">
            <p className="text-white/50 text-xs font-bold uppercase mb-3">Escenarios de tasa de entrega</p>
            {[60, cfg.tasa_entrega_default, 85].filter((v,i,a) => a.indexOf(v) === i).map(tasa => {
              const r = calcularPrecio(costoDropi, tasa, utilidad, presupuestoUSD, ventasMes, pais)
              return (
                <div key={tasa} className={`flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 ${tasa === tasaEntrega ? 'bg-violet-500/8 -mx-2 px-2 rounded-lg' : ''}`}>
                  <div className="flex items-center gap-2">
                    {tasa === tasaEntrega && <span className="text-[9px] text-violet-400">← actual</span>}
                    <p className="text-white/60 text-xs">{tasa}% de entrega</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white/40 text-xs">{r.ventasReales} entregas</span>
                    <span className={`text-sm font-bold ${r.ganancia_mensual_real >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(r.ganancia_mensual_real)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-3">
            <Link href="/campana" className="btn-primary flex-1 text-center py-3">⚡ Generar campaña →</Link>
            <Link href="/presupuesto-escalado" className="btn-secondary px-4 py-3 text-xs">📈 Escalar</Link>
          </div>
        </div>
      )}
    </div>
  )
}

// --- MAIN PAGE --------------------------------------------
export default function DropiPage() {
  const [pais, setPais] = useState<Pais>('PY')
  const [activeTab, setActiveTab] = useState<'buscar' | 'calcular'>('buscar')
  const [categoria, setCategoria] = useState('')
  const [contexto, setContexto] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [resultado, setResultado] = useState<BusquedaOutput | null>(null)
  const [errorBusq, setErrorBusq] = useState('')
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoGanador | null>(null)

  const cfg = PAISES[pais]

  const buscar = async () => {
    setBuscando(true); setErrorBusq(''); setResultado(null)
    try {
      const r = await buscarProductosGanadores(categoria, contexto, pais)
      setResultado(r)
    } catch { setErrorBusq('Error al buscar. Revisá tu conexión.') }
    setBuscando(false)
  }

  const seleccionarProducto = (p: ProductoGanador) => {
    setProductoSeleccionado(p)
    setActiveTab('calcular')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const CATEGORIAS = [
    '🌡️ Bienestar / Dolor físico', '💆 Salud / Descanso', '🏠 Hogar / Organización',
    '💄 Belleza / Skincare', '💪 Fitness / Deporte', '🐕 Mascotas',
    '👶 Bebés / Niños', '🔧 Tecnología / Gadgets', '🔒 Seguridad', '🍳 Cocina',
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">

        <div className="flex items-center gap-3 mb-6">
          <Link href="/aprender" className="btn-ghost text-white/30 hover:text-white p-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-white">Dropi — Productos Ganadores</h1>
            </div>
            <p className="text-white/40 text-xs">Buscador + calculadora de precio con flete, COD y utilidad real</p>
          </div>
        </div>

        {/* Selector de país */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {Object.values(PAISES).map(p => (
            <button key={p.codigo} onClick={() => { setPais(p.codigo); setResultado(null) }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${pais === p.codigo ? 'border-violet-500/50 bg-violet-500/15 text-white' : 'border-white/8 bg-white/3 text-white/40 hover:text-white/60'}`}>
              {p.bandera} {p.nombre}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-white/3 rounded-xl border border-white/8 mb-6 max-w-sm">
          {[{ id: 'buscar', l: '🔍 Buscar producto' }, { id: 'calcular', l: '💰 Calculadora' }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === t.id ? 'bg-violet-600 text-white' : 'text-white/30 hover:text-white/60'}`}>
              {t.l}
            </button>
          ))}
        </div>

        {/* BUSCADOR */}
        {activeTab === 'buscar' && (
          <div className="space-y-5 animate-fade-up">
            {!resultado ? (
              <>
                <div className="card p-4 border border-amber-500/15 bg-amber-500/5">
                  <p className="text-amber-300 text-xs font-bold mb-1">{cfg.bandera} Productos ganadores para {cfg.nombre}</p>
                  <p className="text-white/55 text-xs leading-relaxed">Precio sweet spot: {formatPrecio(cfg.precio_min, pais)} – {formatPrecio(cfg.precio_max, pais)} · Tasa entrega promedio: {cfg.tasa_entrega_default}% · Flete Dropi: {formatPrecio(cfg.flete_dropi, pais)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-white/40 mb-2">Categoría (opcional)</p>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIAS.map(cat => (
                      <button key={cat} onClick={() => setCategoria(c => c === cat ? '' : cat)}
                        className={`text-left px-3 py-2 rounded-xl border text-xs font-medium transition-all ${categoria === cat ? 'border-violet-500/50 bg-violet-500/15 text-violet-300' : 'border-white/8 bg-white/3 text-white/50 hover:border-white/20 hover:text-white/70'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Contexto adicional (opcional)</label>
                  <textarea className="input resize-none h-16 text-sm" value={contexto} onChange={e => setContexto(e.target.value)}
                    placeholder={`Ej: Quiero algo para mujeres 25-45, presupuesto de $30/día en ${cfg.nombre}`} />
                </div>
                {errorBusq && <p className="text-red-400 text-sm">{errorBusq}</p>}
                <button onClick={buscar} disabled={buscando} className="btn-primary w-full py-4 text-base">
                  {buscando
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />Buscando en Dropi {cfg.nombre}...</>
                    : `🔍 Buscar productos ganadores en ${cfg.nombre} →`}
                </button>
              </>
            ) : (
              <div className="space-y-4 animate-fade-up">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-white font-bold">{resultado.productos.length} productos encontrados para {cfg.bandera} {cfg.nombre}</h2>
                    <p className="text-white/30 text-xs mt-0.5">Ordenados por score de problema</p>
                  </div>
                  <button onClick={() => setResultado(null)} className="btn-secondary text-xs px-3 py-2">← Nueva búsqueda</button>
                </div>
                <div className="card p-3 border border-violet-500/15 bg-violet-500/5">
                  <p className="text-violet-300 text-[10px] font-bold uppercase mb-1.5">Criterios aplicados</p>
                  <div className="flex flex-wrap gap-1.5">
                    {resultado.criterios_usados.map(c => (
                      <span key={c} className="px-2 py-0.5 bg-violet-500/15 rounded-full text-[10px] text-violet-300/70">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  {resultado.productos.sort((a, b) => b.score_problema - a.score_problema).map((p, i) => (
                    <ProductCard key={i} p={p} index={i} pais={pais} onSelect={() => seleccionarProducto(p)} />
                  ))}
                </div>
                <div className="card p-4 border border-amber-500/20 bg-amber-500/8">
                  <p className="text-amber-300 text-[10px] font-bold uppercase mb-2">💡 Consejo del operador experto</p>
                  <p className="text-white/70 text-sm leading-relaxed">{resultado.consejo_final}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'calcular' && (
          <Calculadora pais={pais} productoNombre={productoSeleccionado?.nombre} />
        )}

        <div className="mt-8 pt-6 border-t border-white/8">
          <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-3">Herramientas del flujo Dropi</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: '/logistica-cod', icon: '📦', label: 'Logística COD', sub: 'Tasa entrega por ciudad' },
              { href: '/checkout-dropi', icon: '🛒', label: 'Checkout Dropi', sub: 'Ficha completa lista' },
              { href: '/validador-producto', icon: '✅', label: 'Validador COD', sub: '14 criterios antes de lanzar' },
              { href: '/precios-psicologicos', icon: '🧮', label: 'Precios Psicológicos', sub: 'Rounding que convierte' },
              { href: '/roas-simulator', icon: '📊', label: 'ROAS Simulator', sub: 'Break-even dinámico' },
              { href: '/upsell', icon: '💎', label: 'Upsell & Bundles', sub: '+30% ticket promedio' },
              { href: '/whatsapp-flows', icon: '💬', label: 'Flujos WhatsApp', sub: '6 flujos automatizados' },
              { href: '/campana', icon: '⚡', label: 'Lanzar Campaña', sub: 'Del 0 al primer anuncio' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className="card p-3 flex items-center gap-2.5 border border-white/8 hover:border-white/20 transition-all">
                <span className="text-lg flex-shrink-0">{a.icon}</span>
                <div className="min-w-0">
                  <p className="text-white text-xs font-bold truncate">{a.label}</p>
                  <p className="text-white/30 text-[10px]">{a.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
