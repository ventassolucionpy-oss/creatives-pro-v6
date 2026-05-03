'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useMemo } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { PAISES, formatPrecio, type Pais } from '@/lib/constants'

type PedidoRow = {
  id: string
  ciudad: string
  estado: string
  precio: number
  pais: string
  created_at: string
}

type CiudadStats = {
  ciudad: string
  total: number
  entregados: number
  rechazados: number
  pendientes: number
  tasa_entrega: number
  ingreso_total: number
  ingreso_promedio: number
  dias_promedio: number
  tendencia: 'subiendo' | 'bajando' | 'estable'
}

const CIUDADES_PY = ['Asunción','San Lorenzo','Luque','Fernando de la Mora','Capiatá','Lambaré','Mariano Roque Alonso','Limpio','Ñemby','Villa Elisa','Encarnación','Ciudad del Este','Pedro Juan Caballero','Concepción']
const CIUDADES_CO = ['Bogotá','Medellín','Cali','Barranquilla','Cartagena','Bucaramanga','Cúcuta','Ibagué','Pereira','Santa Marta','Manizales','Villavicencio','Pasto']
const CIUDADES_MX = ['Ciudad de México','Guadalajara','Monterrey','Puebla','Toluca','Tijuana','León','Ciudad Juárez','Torreón','San Luis Potosí','Mérida','Querétaro','Chihuahua','Aguascalientes']

const CIUDADES_REF: Record<Pais, Array<{ciudad:string; tasa_ref: number; label: string}>> = {
  PY: [
    {ciudad:'Asunción', tasa_ref:82, label:'Capital — mejor tasa'},
    {ciudad:'Gran Asunción', tasa_ref:78, label:'Área metropolitana'},
    {ciudad:'Ciudad del Este', tasa_ref:70, label:'Segunda ciudad'},
    {ciudad:'Encarnación', tasa_ref:68, label:'Interior sur'},
    {ciudad:'Interior', tasa_ref:60, label:'Ciudades pequeñas'},
  ],
  CO: [
    {ciudad:'Bogotá', tasa_ref:78, label:'Capital'},
    {ciudad:'Medellín', tasa_ref:76, label:'Segunda ciudad'},
    {ciudad:'Cali', tasa_ref:72, label:'Tercera ciudad'},
    {ciudad:'Barranquilla', tasa_ref:70, label:'Costa Caribe'},
    {ciudad:'Interior', tasa_ref:62, label:'Ciudades menores'},
  ],
  MX: [
    {ciudad:'CDMX', tasa_ref:75, label:'Capital'},
    {ciudad:'Guadalajara', tasa_ref:72, label:'Segunda ciudad'},
    {ciudad:'Monterrey', tasa_ref:72, label:'Norte'},
    {ciudad:'Interior', tasa_ref:63, label:'República'},
    {ciudad:'Sur/Sureste', tasa_ref:58, label:'Zona difícil'},
  ],
}

function TasaBar({ pct }: { pct: number }) {
  const color = pct >= 75 ? 'bg-emerald-500' : pct >= 65 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className={`text-xs font-bold w-10 text-right ${pct >= 75 ? 'text-emerald-400' : pct >= 65 ? 'text-amber-400' : 'text-red-400'}`}>{pct}%</span>
    </div>
  )
}

export default function LogisticaCODPage() {
  const [pais, setPais] = useState<Pais>('PY')
  const [pedidos, setPedidos] = useState<PedidoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tabManual, setTabManual] = useState(false)

  // Manual entry state
  const [manualCity, setManualCity] = useState('')
  const [manualTotal, setManualTotal] = useState('')
  const [manualEntregados, setManualEntregados] = useState('')
  const [manualPrecio, setManualPrecio] = useState('')
  const [manualRows, setManualRows] = useState<CiudadStats[]>([])

  const cfg = PAISES[pais]
  const fmt = (n: number) => formatPrecio(n, pais)

  useEffect(() => {
    fetch('/api/pedidos')
      .then(r => r.json())
      .then(d => { setPedidos(d.pedidos || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const stats = useMemo((): CiudadStats[] => {
    const filtered = pedidos.filter(p => p.pais === pais)
    const grouped: Record<string, PedidoRow[]> = {}
    filtered.forEach(p => {
      const key = p.ciudad || 'Sin ciudad'
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(p)
    })
    return Object.entries(grouped).map(([ciudad, rows]) => {
      const entregados = rows.filter(r => r.estado === 'entregado').length
      const rechazados = rows.filter(r => r.estado === 'rechazado').length
      const pendientes = rows.filter(r => r.estado === 'pendiente').length
      const total = rows.length
      const tasa = total > 0 ? Math.round((entregados / total) * 100) : 0
      const ingreso_total = rows.filter(r => r.estado === 'entregado').reduce((s, r) => s + (r.precio || 0), 0)
      return {
        ciudad, total, entregados, rechazados, pendientes,
        tasa_entrega: tasa,
        ingreso_total,
        ingreso_promedio: entregados > 0 ? Math.round(ingreso_total / entregados) : 0,
        dias_promedio: 0,
        tendencia: 'estable' as const,
      }
    }).sort((a, b) => b.total - a.total)
  }, [pedidos, pais])

  const allStats = tabManual ? manualRows : stats

  const addManualRow = () => {
    if (!manualCity || !manualTotal) return
    const total = Number(manualTotal)
    const entregados = Number(manualEntregados) || Math.round(total * 0.75)
    const rechazados = total - entregados
    const precio = Number(manualPrecio) || cfg.precio_min
    setManualRows(prev => {
      const existing = prev.findIndex(r => r.ciudad === manualCity)
      const row: CiudadStats = {
        ciudad: manualCity, total, entregados, rechazados,
        pendientes: 0,
        tasa_entrega: Math.round((entregados / total) * 100),
        ingreso_total: entregados * precio,
        ingreso_promedio: precio,
        dias_promedio: 0,
        tendencia: 'estable',
      }
      if (existing >= 0) { const n = [...prev]; n[existing] = row; return n }
      return [...prev, row].sort((a, b) => b.total - a.total)
    })
    setManualCity(''); setManualTotal(''); setManualEntregados(''); setManualPrecio('')
  }

  const ciudadesDisponibles = pais === 'PY' ? CIUDADES_PY : pais === 'CO' ? CIUDADES_CO : CIUDADES_MX

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-5">
          <Link href="/crear" className="text-white/30 hover:text-white/60 text-sm transition-colors">← Herramientas</Link>
          <h1 className="text-2xl font-bold text-white mt-2">📦 Logística COD</h1>
          <p className="text-white/40 text-sm mt-1">Tasa de entrega por ciudad — decidí dónde invertir más en ads</p>
        </div>

        {/* País */}
        <div className="flex gap-2 mb-4">
          {Object.values(PAISES).map(p => (
            <button key={p.codigo} onClick={() => setPais(p.codigo as Pais)}
              className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${pais === p.codigo ? 'border-violet-500/50 bg-violet-500/15 text-white' : 'border-white/8 bg-white/3 text-white/40 hover:text-white/60'}`}>
              {p.bandera} {p.nombre}
            </button>
          ))}
        </div>

        {/* Tabs datos vs manual */}
        <div className="flex gap-1 p-1 bg-white/3 rounded-xl border border-white/8 mb-5">
          {[{id:false,l:'📊 Mis pedidos'},{id:true,l:'✏️ Carga manual'}].map(t => (
            <button key={String(t.id)} onClick={() => setTabManual(t.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tabManual === t.id ? 'bg-violet-600 text-white' : 'text-white/30 hover:text-white/60'}`}>
              {t.l}
            </button>
          ))}
        </div>

        {/* Referencia del país */}
        <div className="card p-4 border border-blue-500/15 bg-blue-500/5 mb-5">
          <p className="text-blue-300 text-xs font-bold mb-2">📍 Referencias {cfg.bandera} {cfg.nombre}</p>
          <div className="space-y-2">
            {CIUDADES_REF[pais].map(r => (
              <div key={r.ciudad} className="flex items-center gap-3">
                <span className="text-white/50 text-xs w-32 flex-shrink-0">{r.ciudad}</span>
                <TasaBar pct={r.tasa_ref} />
                <span className="text-[10px] text-white/25 w-28 flex-shrink-0">{r.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Carga manual */}
        {tabManual && (
          <div className="card p-4 border border-white/10 mb-4">
            <p className="text-white font-medium text-sm mb-3">Agregar ciudad</p>
            <div className="space-y-2">
              <select value={manualCity} onChange={e => setManualCity(e.target.value)}
                className="input text-sm">
                <option value="">Seleccionar ciudad...</option>
                {ciudadesDisponibles.map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
              </select>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block">Pedidos totales</label>
                  <input className="input text-sm" type="number" value={manualTotal} onChange={e => setManualTotal(e.target.value)} placeholder="100" />
                </div>
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block">Entregados</label>
                  <input className="input text-sm" type="number" value={manualEntregados} onChange={e => setManualEntregados(e.target.value)} placeholder="75" />
                </div>
                <div>
                  <label className="text-[10px] text-white/30 mb-1 block">Precio prom. ({cfg.simbolo})</label>
                  <input className="input text-sm" type="number" value={manualPrecio} onChange={e => setManualPrecio(e.target.value)} placeholder={String(Math.round(cfg.precio_min * 1.5))} />
                </div>
              </div>
              <button onClick={addManualRow} disabled={!manualCity || !manualTotal}
                className="btn-primary w-full py-2 text-sm disabled:opacity-40">Agregar ciudad</button>
            </div>
          </div>
        )}

        {/* Stats table */}
        {loading && !tabManual ? (
          <div className="card p-8 text-center">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/40 text-sm">Cargando pedidos...</p>
          </div>
        ) : allStats.length === 0 ? (
          <div className="card p-8 border border-white/8 text-center">
            <p className="text-3xl mb-3">📦</p>
            <p className="text-white/50 text-sm font-medium mb-1">Sin datos todavía</p>
            <p className="text-white/30 text-xs">{tabManual ? 'Agregá ciudades manualmente arriba' : 'Los datos aparecen cuando tengas pedidos registrados en este país'}</p>
            {!tabManual && <button onClick={() => setTabManual(true)} className="btn-secondary mt-3 text-xs px-4 py-2">Cargar manualmente →</button>}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[
                ['Total pedidos', String(allStats.reduce((s,r) => s+r.total, 0)), 'text-white'],
                ['Entregados', String(allStats.reduce((s,r) => s+r.entregados, 0)), 'text-emerald-400'],
                ['Tasa promedio', `${Math.round(allStats.reduce((s,r) => s+(r.tasa_entrega*r.total),0) / Math.max(allStats.reduce((s,r)=>s+r.total,0),1))}%`, 'text-violet-400'],
              ].map(([l,v,c]) => (
                <div key={l} className="card p-3 text-center border border-white/8">
                  <p className={`text-lg font-black ${c}`}>{v}</p>
                  <p className="text-[10px] text-white/30">{l}</p>
                </div>
              ))}
            </div>

            {allStats.map(s => (
              <div key={s.ciudad} className={`card p-4 border ${s.tasa_entrega >= 75 ? 'border-emerald-500/20' : s.tasa_entrega >= 65 ? 'border-amber-500/20' : 'border-red-500/20'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-bold text-sm">{s.ciudad}</p>
                    <p className="text-white/30 text-xs">{s.total} pedidos · {s.entregados} entregados · {s.rechazados} rechazados</p>
                  </div>
                  <div className="text-right">
                    {s.tasa_entrega >= 75
                      ? <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full">✅ Escalar</span>
                      : s.tasa_entrega >= 65
                      ? <span className="text-[10px] bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full">⚠️ Monitorear</span>
                      : <span className="text-[10px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">🔴 Reducir</span>
                    }
                  </div>
                </div>
                <TasaBar pct={s.tasa_entrega} />
                {s.ingreso_total > 0 && (
                  <p className="text-[10px] text-white/30 mt-2">Ingresos totales: {fmt(s.ingreso_total)} · Promedio: {fmt(s.ingreso_promedio)}</p>
                )}
              </div>
            ))}

            {/* Recomendación */}
            {allStats.length > 1 && (
              <div className="card p-4 border border-violet-500/15 bg-violet-500/5">
                <p className="text-violet-300 text-xs font-bold mb-2">💡 Estrategia de targeting recomendada</p>
                <div className="space-y-1 text-xs text-white/60">
                  {allStats.filter(s => s.tasa_entrega >= 75).length > 0 && (
                    <p>✅ <strong className="text-white/80">Escalar budget:</strong> {allStats.filter(s => s.tasa_entrega >= 75).map(s => s.ciudad).join(', ')}</p>
                  )}
                  {allStats.filter(s => s.tasa_entrega < 65).length > 0 && (
                    <p>🔴 <strong className="text-white/80">Excluir o reducir:</strong> {allStats.filter(s => s.tasa_entrega < 65).map(s => s.ciudad).join(', ')}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mt-5">
          <Link href="/pedidos" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-violet-500/30 transition-all">
            <span>📋</span><div><p className="text-white text-xs font-bold">Mis Pedidos</p><p className="text-white/30 text-[10px]">Actualizar estados</p></div>
          </Link>
          <Link href="/dashboard-pl" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-emerald-500/30 transition-all">
            <span>💰</span><div><p className="text-white text-xs font-bold">P&L Dashboard</p><p className="text-white/30 text-[10px]">Rentabilidad real</p></div>
          </Link>
        </div>
      </main>
    </div>
  )
}
