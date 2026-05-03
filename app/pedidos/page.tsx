'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useMemo } from 'react'
import Navbar from '@/components/layout/Navbar'
import { getPaisConfig } from '@/lib/constants'
import Link from 'next/link'

type OrderStatus = 'pendiente' | 'en_camino' | 'entregado' | 'devuelto' | 'rechazado'

type Order = {
  id: string
  producto: string
  ciudad: string
  precio: number
  telefono: string
  notas: string
  estado: OrderStatus
  created_at: string
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: string }> = {
  pendiente:  { label: 'Pendiente',  color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   icon: '⏳' },
  en_camino:  { label: 'En camino',  color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',     icon: '🚚' },
  entregado:  { label: 'Entregado',  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: '✅' },
  devuelto:   { label: 'Devuelto',   color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',       icon: '↩️' },
  rechazado:  { label: 'Rechazado',  color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',       icon: '❌' },
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<OrderStatus | 'todos'>('todos')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [producto, setProducto] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [precio, setPrecio] = useState('')
  const [telefono, setTelefono] = useState('')
  const [notas, setNotas] = useState('')
  const [estado, pais: 'PY', setEstado] = useState<OrderStatus>('pendiente')

  // Cargar pedidos desde Supabase al montar
  useEffect(() => {
    loadPedidos()
  }, [])

  const loadPedidos = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pedidos')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setOrders(data.pedidos || [])
    } catch (err) {
      setError('Error cargando pedidos. Revisá tu conexión.')
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    const total = orders.length
    const entregados = orders.filter(o => o.estado === 'entregado').length
    const pendientes = orders.filter(o => o.estado === 'pendiente').length
    const en_camino = orders.filter(o => o.estado === 'en_camino').length
    const devueltos = orders.filter(o => o.estado === 'devuelto' || o.estado === 'rechazado').length
    const tasa_entrega = total > 0 ? (entregados / total) * 100 : 0
    // Upsell tracking (GAP #11 fix)
    const upsell_aceptados = orders.filter(o => (o as unknown as Record<string,unknown>)['upsell_aceptado'] === true).length
    const tasa_upsell = total > 0 ? Math.round((upsell_aceptados / total) * 100) : 0
    const ingresos_reales = orders.filter(o => o.estado === 'entregado').reduce((s, o) => s + o.precio, 0)
    const perdidas = orders.filter(o => o.estado === 'devuelto' || o.estado === 'rechazado').reduce((s, o) => s + getPaisConfig((o as {pais?:string}).pais || 'PY').flete_dropi, 0)
    return { total, entregados, pendientes, en_camino, devueltos, tasa_entrega, ingresos_reales, perdidas }
  }, [orders])

  const filtered = filter === 'todos' ? orders : orders.filter(o => o.estado === filter)

  const handleAdd = async () => {
    if (!producto || !precio) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ producto, ciudad: ciudad || 'Asunción', precio, telefono, notas, estado }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setOrders(prev => [data.pedido, ...prev])
      setProducto(''); setCiudad(''); setPrecio(''); setTelefono(''); setNotas(''); setEstado('pendiente')
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando pedido')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (id: string, newStatus: OrderStatus) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, estado: newStatus } : o))
    try {
      const res = await fetch('/api/pedidos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: newStatus }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
    } catch {
      // Revertir si falla
      loadPedidos()
    }
  }

  const deleteOrder = async (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id))
    try {
      await fetch(`/api/pedidos?id=${id}`, { method: 'DELETE' })
    } catch {
      loadPedidos()
    }
  }

  const fmt = (n: number) => `Gs. ${Math.round(n).toLocaleString('es-PY')}`
  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-white/20'

  const statusFlow: OrderStatus[] = ['pendiente', 'en_camino', 'entregado']
  const nextStatus = (current: OrderStatus): OrderStatus | null => {
    const idx = statusFlow.indexOf(current)
    return idx >= 0 && idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/gestionar" className="text-white/30 hover:text-white/60 text-sm transition-colors">Gestionar</Link>
            <span className="text-white/20 text-sm">›</span>
            <span className="text-white/60 text-sm">Pedidos COD</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">📦 Pedidos COD</h1>
              <p className="text-white/40 text-sm mt-1">{stats.total} pedidos · {stats.tasa_entrega.toFixed(0)}% de entrega</p>
            </div>
            <button onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-all">
              + Nuevo
            </button>
          </div>
        </div>

        {error && (
          <div className="card p-3 border border-red-500/30 bg-red-500/5 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="card p-4 text-center">
            <p className="text-2xl font-black text-emerald-400">{stats.tasa_entrega.toFixed(0)}%</p>
            <p className="text-xs text-white/30 mt-0.5">Tasa de entrega</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-black text-white">{fmt(stats.ingresos_reales)}</p>
            <p className="text-xs text-white/30 mt-0.5">Ingresos reales</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-black text-amber-400">{stats.pendientes + stats.en_camino}</p>
            <p className="text-xs text-white/30 mt-0.5">En proceso</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-black text-red-400">{fmt(stats.perdidas)}</p>
            <p className="text-xs text-white/30 mt-0.5">Pérdida por devoluciones</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {(['todos', 'pendiente', 'en_camino', 'entregado', 'devuelto', 'rechazado']).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                filter === f ? 'bg-violet-600/30 border-violet-500/50 text-violet-300' : 'border-white/10 text-white/30'
              }`}>
              {f === 'todos' ? `Todos (${stats.total})` :
               f === 'pendiente' ? `⏳ Pendientes (${stats.pendientes})` :
               f === 'en_camino' ? `🚚 En camino (${stats.en_camino})` :
               f === 'entregado' ? `✅ Entregados (${stats.entregados})` :
               `↩️ Devoluciones (${stats.devueltos})`}
            </button>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <div className="card p-5 border border-violet-500/30 bg-violet-500/5 mb-5">
            <p className="text-sm font-bold text-white mb-4">Registrar nuevo pedido</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Producto *</label>
                  <input className={inputCls} placeholder="ej. Masajeador cervical" value={producto} onChange={e => setProducto(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Ciudad</label>
                  <input className={inputCls} placeholder="Asunción" value={ciudad} onChange={e => setCiudad(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Precio COD (Gs.) *</label>
                  <input className={inputCls} type="number" placeholder="147000" value={precio} onChange={e => setPrecio(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Teléfono</label>
                  <input className={inputCls} placeholder="0981-000000" value={telefono} onChange={e => setTelefono(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Estado inicial</label>
                <select className={inputCls} value={estado} onChange={e => setEstado(e.target.value as OrderStatus)}>
                  <option value="pendiente">⏳ Pendiente</option>
                  <option value="en_camino">🚚 En camino</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Notas (opcional)</label>
                <input className={inputCls} placeholder="ej. Cliente preguntó por garantía" value={notas} onChange={e => setNotas(e.target.value)} />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/40 text-sm">Cancelar</button>
                <button onClick={handleAdd} disabled={saving || !producto || !precio}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-sm transition-all">
                  {saving ? 'Guardando...' : 'Registrar pedido'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <div className="card p-8 text-center">
            <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/40 text-sm">Cargando pedidos...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map(order => {
              const cfg = STATUS_CONFIG[order.estado]
              const next = nextStatus(order.estado)
              return (
                <div key={order.id} className={`card p-4 border ${cfg.bg} transition-all`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{order.producto}</p>
                      <p className="text-white/40 text-xs mt-0.5">{order.ciudad} · {order.telefono || 'Sin teléfono'}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-white font-bold text-sm">{fmt(order.precio)}</p>
                      <p className="text-[10px] text-white/25 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                    {order.notas && <span className="text-white/25 text-[10px] truncate flex-1">{order.notas}</span>}
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    {next && (
                      <button onClick={() => updateStatus(order.id, next)}
                        className="flex-1 py-1.5 rounded-xl border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-xs font-medium transition-all">
                        → Marcar como {STATUS_CONFIG[next].label}
                      </button>
                    )}
                    {order.estado !== 'devuelto' && order.estado !== 'rechazado' && order.estado !== 'entregado' && (
                      <button onClick={() => updateStatus(order.id, 'devuelto')}
                        className="py-1.5 px-3 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400/60 hover:text-red-400 text-xs transition-all">
                        ↩️ Devuelto
                      </button>
                    )}
                    <button onClick={() => deleteOrder(order.id)}
                      className="py-1.5 px-2 rounded-xl text-white/15 hover:text-red-400/50 text-xs transition-colors">
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card p-8 text-center border border-white/5">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-white/60 font-semibold mb-1">
              {filter === 'todos' ? 'Sin pedidos registrados' : `Sin pedidos ${STATUS_CONFIG[filter as OrderStatus]?.label.toLowerCase()}`}
            </p>
            <p className="text-white/30 text-sm">Registrá cada pedido COD para calcular tu tasa de entrega real.</p>
            {filter === 'todos' && (
              <button onClick={() => setShowForm(true)} className="mt-4 btn-primary text-sm px-5 py-2.5">
                + Registrar primer pedido
              </button>
            )}
          </div>
        )}

        {/* Tip COD */}
        <div className="card p-4 mt-5 border border-amber-500/20 bg-amber-500/5">
          <p className="text-xs text-amber-300 font-bold mb-1">💡 Referencia COD Paraguay</p>
          <p className="text-xs text-white/40">Tasa de entrega objetivo: 75-85%. Bajo 70% = revisá el targeting. Flete por devolución: Gs. 38.000 adicionales por pedido rechazado. Seguí cada pedido acá para calcular tu margen real.</p>
        </div>

      </main>
    </div>
  )
}
