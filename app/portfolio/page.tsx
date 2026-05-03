'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useMemo } from 'react'
import Navbar from '@/components/layout/Navbar'
import { getPaisConfig } from '@/lib/constants'
import Link from 'next/link'

type ProductStatus = 'testeando' | 'escalando' | 'mantenimiento' | 'pausado' | 'muerto'
type Platform = 'meta' | 'tiktok' | 'ambas'

type Product = {
  id: string
  name: string
  category: string
  portfolio_plataforma: Platform
  portfolio_estado: ProductStatus
  precio_venta_gs: number
  costo_gs: number
  roas_actual: number
  roas_semana_pasada: number
  gasto_total: number
  ingresos_total: number
  pedidos_totales: number
  tasa_entrega: number
  dias_activo: number
  presupuesto_diario: number
  portfolio_notas: string
  created_at: string
}

const STATUS: Record<ProductStatus, { label: string; color: string; bg: string; icon: string }> = {
  testeando:     { label: 'Testeando',  color: 'text-amber-400',   bg: 'border-amber-500/30 bg-amber-500/5',     icon: '🧪' },
  escalando:     { label: 'Escalando',  color: 'text-emerald-400', bg: 'border-emerald-500/30 bg-emerald-500/5', icon: '🚀' },
  mantenimiento: { label: 'Estable',    color: 'text-blue-400',    bg: 'border-blue-500/30 bg-blue-500/5',       icon: '🔒' },
  pausado:       { label: 'Pausado',    color: 'text-white/40',    bg: 'border-white/10',                        icon: '⏸️' },
  muerto:        { label: 'Muerto',     color: 'text-red-400',     bg: 'border-red-500/20 bg-red-500/5',         icon: '☠️' },
}

export default function PortfolioPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<ProductStatus | 'todos'>('todos')
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const emptyForm = {
    name: '', category: 'salud', portfolio_plataforma: 'meta' as Platform,
    portfolio_estado: 'testeando' as ProductStatus,
    precio_venta_gs: '', costo_gs: '', roas_actual: '', roas_semana_pasada: '',
    gasto_total: '', ingresos_total: '', pedidos_totales: '', tasa_entrega: '75',
    dias_activo: '', presupuesto_diario: '', portfolio_notas: '',
  }
  const [form, setForm] = useState(emptyForm)
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => { loadProducts() }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      // Filtrar solo los que tienen datos de portfolio (tienen precio o estado explícito)
      setProducts(data.products || [])
    } catch {
      setError('Error cargando productos.')
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    const activos = products.filter(p => p.portfolio_estado !== 'muerto' && p.portfolio_estado !== 'pausado')
    const escalando = products.filter(p => p.portfolio_estado === 'escalando').length
    const testeando = products.filter(p => p.portfolio_estado === 'testeando').length
    const gasto_usd = products.reduce((s, p) => s + (p.gasto_total || 0), 0)
    const ingresos_gs = products.reduce((s, p) => s + (p.ingresos_total || 0), 0)
    const roas_global = gasto_usd > 0 ? ingresos_gs / gasto_usd : 0
    const FX = 6350
    const margen = activos.reduce((s, p) => {
      const entregas = (p.pedidos_totales || 0) * ((p.tasa_entrega || 75) / 100)
      const ingr = entregas * (p.precio_venta_gs || 0)
      const _fx = getPaisConfig('PY').fx_usd
      const costos = (p.gasto_total || 0) * _fx + entregas * (p.costo_gs || 0) + (p.pedidos_totales || 0) * getPaisConfig('PY').flete_dropi
      return s + (ingr - costos)
    }, 0)
    return { activos: activos.length, escalando, testeando, gasto_usd, roas_global, margen }
  }, [products])

  const handleSave = async () => {
    if (!form.name) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: form.name,
        description: form.portfolio_notas || form.name,
        category: 'fisico',
        portfolio_plataforma: form.portfolio_plataforma,
        portfolio_estado: form.portfolio_estado,
        precio_venta_gs: parseInt(form.precio_venta_gs) || 0,
        costo_gs: parseInt(form.costo_gs) || 0,
        roas_actual: parseFloat(form.roas_actual) || 0,
        roas_semana_pasada: parseFloat(form.roas_semana_pasada) || 0,
        gasto_total: parseFloat(form.gasto_total) || 0,
        ingresos_total: parseFloat(form.ingresos_total) || 0,
        pedidos_totales: parseInt(form.pedidos_totales) || 0,
        tasa_entrega: parseFloat(form.tasa_entrega) || 75,
        dias_activo: parseInt(form.dias_activo) || 0,
        presupuesto_diario: parseFloat(form.presupuesto_diario) || 0,
        portfolio_notas: form.portfolio_notas,
      }

      if (editId) {
        const res = await fetch(`/api/products/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setProducts(prev => prev.map(p => p.id === editId ? { ...p, ...payload } : p))
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setProducts(prev => [data.product, ...prev])
      }
      setForm(emptyForm); setShowForm(false); setEditId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando producto')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (id: string, estado: ProductStatus) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, portfolio_estado: estado } : p))
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio_estado: estado }),
      })
    } catch { loadProducts() }
  }

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id))
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
    } catch { loadProducts() }
  }

  const handleEdit = (p: Product) => {
    setForm({
      name: p.name, category: p.category,
      portfolio_plataforma: p.portfolio_plataforma || 'meta',
      portfolio_estado: p.portfolio_estado || 'testeando',
      precio_venta_gs: String(p.precio_venta_gs || ''),
      costo_gs: String(p.costo_gs || ''),
      roas_actual: String(p.roas_actual || ''),
      roas_semana_pasada: String(p.roas_semana_pasada || ''),
      gasto_total: String(p.gasto_total || ''),
      ingresos_total: String(p.ingresos_total || ''),
      pedidos_totales: String(p.pedidos_totales || ''),
      tasa_entrega: String(p.tasa_entrega || '75'),
      dias_activo: String(p.dias_activo || ''),
      presupuesto_diario: String(p.presupuesto_diario || ''),
      portfolio_notas: p.portfolio_notas || '',
    })
    setEditId(p.id); setShowForm(true)
  }

  const filtered = filter === 'todos' ? products : products.filter(p => p.portfolio_estado === filter)
  const fmt = (n: number) => `Gs. ${Math.round(n).toLocaleString('es-PY')}`
  const fmtUSD = (n: number) => `$${n.toFixed(0)}`
  const roasColor = (r: number) => r >= 3 ? 'text-emerald-400' : r >= 2 ? 'text-amber-400' : 'text-red-400'
  const roasTrend = (cur: number, prev: number) => {
    if (!prev) return ''
    const d = cur - prev
    if (Math.abs(d) < 0.1) return '→'
    return d > 0 ? `↑ +${d.toFixed(1)}` : `↓ ${d.toFixed(1)}`
  }

  const ic = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-white/20'
  const lc = 'block text-xs text-white/40 mb-1.5'

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/gestionar" className="text-white/30 hover:text-white/60 text-sm">Gestionar</Link>
            <span className="text-white/20">›</span>
            <span className="text-white/60 text-sm">Portfolio</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">📋 Portfolio de Productos</h1>
              <p className="text-white/40 text-sm mt-1">Vista global de todos tus productos</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/productos" className="px-3 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white text-xs transition-all">
                + Desde catálogo
              </Link>
              <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm) }}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-all">
                + Nuevo
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="card p-3 border border-red-500/30 bg-red-500/5 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Stats globales */}
        {products.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-5">
            <div className="card p-4 col-span-2 border border-white/8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/30 mb-1">ROAS global</p>
                  <p className={`text-3xl font-black ${roasColor(stats.roas_global)}`}>{stats.roas_global.toFixed(2)}x</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/30 mb-1">Margen neto estimado</p>
                  <p className={`text-xl font-bold ${stats.margen >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(stats.margen)}</p>
                </div>
              </div>
            </div>
            <div className="card p-3 text-center"><p className="text-xl font-bold text-emerald-400">{stats.escalando}</p><p className="text-[10px] text-white/30">Escalando</p></div>
            <div className="card p-3 text-center"><p className="text-xl font-bold text-amber-400">{stats.testeando}</p><p className="text-[10px] text-white/30">Testeando</p></div>
            <div className="card p-3 text-center"><p className="text-xl font-bold text-white">{stats.activos}</p><p className="text-[10px] text-white/30">Activos</p></div>
            <div className="card p-3 text-center"><p className="text-xl font-bold text-white">{fmtUSD(stats.gasto_usd)}</p><p className="text-[10px] text-white/30">Gasto total</p></div>
          </div>
        )}

        {/* Filtros */}
        {products.length > 0 && (
          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
            {(['todos', 'testeando', 'escalando', 'mantenimiento', 'pausado', 'muerto']).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${filter === f ? 'bg-violet-600/30 border-violet-500/50 text-violet-300' : 'border-white/10 text-white/30'}`}>
                {f === 'todos' ? `Todos (${products.length})` : `${STATUS[f].icon} ${STATUS[f].label}`}
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="card p-5 border border-violet-500/30 bg-violet-500/5 mb-5">
            <p className="text-sm font-bold text-white mb-4">{editId ? 'Editar producto' : 'Agregar al portfolio'}</p>
            <div className="space-y-3">
              <div>
                <label className={lc}>Nombre del producto</label>
                <input className={ic} placeholder="ej. Masajeador de cuello eléctrico" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lc}>Plataforma</label>
                  <select className={ic} value={form.portfolio_plataforma} onChange={e => set('portfolio_plataforma', e.target.value)}>
                    <option value="meta">📘 Meta</option>
                    <option value="tiktok">🎵 TikTok</option>
                    <option value="ambas">🔀 Ambas</option>
                  </select>
                </div>
                <div>
                  <label className={lc}>Estado</label>
                  <select className={ic} value={form.portfolio_estado} onChange={e => set('portfolio_estado', e.target.value)}>
                    {(Object.keys(STATUS) as ProductStatus[]).map(s => <option key={s} value={s}>{STATUS[s].icon} {STATUS[s].label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lc}>Precio venta (Gs.)</label><input className={ic} type="number" placeholder="157000" value={form.precio_venta_gs} onChange={e => set('precio_venta_gs', e.target.value)} /></div>
                <div><label className={lc}>Costo producto (Gs.)</label><input className={ic} type="number" placeholder="35000" value={form.costo_gs} onChange={e => set('costo_gs', e.target.value)} /></div>
                <div><label className={lc}>ROAS actual</label><input className={ic} type="number" step="0.1" placeholder="2.8" value={form.roas_actual} onChange={e => set('roas_actual', e.target.value)} /></div>
                <div><label className={lc}>ROAS semana pasada</label><input className={ic} type="number" step="0.1" placeholder="2.5" value={form.roas_semana_pasada} onChange={e => set('roas_semana_pasada', e.target.value)} /></div>
                <div><label className={lc}>Gasto total (USD)</label><input className={ic} type="number" placeholder="200" value={form.gasto_total} onChange={e => set('gasto_total', e.target.value)} /></div>
                <div><label className={lc}>Pedidos totales</label><input className={ic} type="number" placeholder="45" value={form.pedidos_totales} onChange={e => set('pedidos_totales', e.target.value)} /></div>
                <div><label className={lc}>Tasa entrega (%)</label><input className={ic} type="number" placeholder="75" value={form.tasa_entrega} onChange={e => set('tasa_entrega', e.target.value)} /></div>
                <div><label className={lc}>Budget diario (USD)</label><input className={ic} type="number" placeholder="25" value={form.presupuesto_diario} onChange={e => set('presupuesto_diario', e.target.value)} /></div>
                <div><label className={lc}>Días activo</label><input className={ic} type="number" placeholder="14" value={form.dias_activo} onChange={e => set('dias_activo', e.target.value)} /></div>
              </div>
              <div><label className={lc}>Notas</label><input className={ic} placeholder="Creativos activos, próximos pasos..." value={form.portfolio_notas} onChange={e => set('portfolio_notas', e.target.value)} /></div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm) }} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/40 text-sm">Cancelar</button>
                <button onClick={handleSave} disabled={saving || !form.name}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-sm transition-all">
                  {saving ? 'Guardando...' : editId ? 'Guardar cambios' : 'Agregar al portfolio'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <div className="card p-8 text-center">
            <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/40 text-sm">Cargando portfolio...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map(p => {
              const st = STATUS[p.portfolio_estado]
              const trend = roasTrend(p.roas_actual, p.roas_semana_pasada)
              const FX = 6350
              const entregas = (p.pedidos_totales || 0) * ((p.tasa_entrega || 75) / 100)
              const ingr = entregas * (p.precio_venta_gs || 0)
              const _fx = getPaisConfig('PY').fx_usd
      const costos = (p.gasto_total || 0) * _fx + entregas * (p.costo_gs || 0) + (p.pedidos_totales || 0) * getPaisConfig('PY').flete_dropi
              const margen = ingr - costos
              return (
                <div key={p.id} className={`card border ${st.bg} p-4`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{st.icon}</span>
                      <div>
                        <p className="text-white font-bold text-sm">{p.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold ${st.color}`}>{st.label}</span>
                          <span className="text-white/20 text-[10px]">•</span>
                          <span className="text-white/30 text-[10px]">
                            {p.portfolio_plataforma === 'ambas' ? '🔀' : p.portfolio_plataforma === 'meta' ? '📘' : '🎵'} {p.dias_activo || 0}d activo
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${roasColor(p.roas_actual || 0)}`}>{(p.roas_actual || 0).toFixed(1)}x</p>
                      {trend && <p className={`text-[10px] font-bold ${trend.startsWith('↑') ? 'text-emerald-400' : trend.startsWith('↓') ? 'text-red-400' : 'text-white/30'}`}>{trend}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-white/5 rounded-xl p-2 text-center">
                      <p className="text-white text-xs font-bold">{fmtUSD(p.gasto_total || 0)}</p>
                      <p className="text-white/30 text-[10px]">Gasto</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2 text-center">
                      <p className="text-white text-xs font-bold">{p.tasa_entrega || 75}%</p>
                      <p className="text-white/30 text-[10px]">Entrega</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2 text-center">
                      <p className={`text-xs font-bold ${margen >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(margen)}</p>
                      <p className="text-white/30 text-[10px]">Margen</p>
                    </div>
                  </div>

                  {p.portfolio_notas && <p className="text-white/30 text-xs mb-3 italic">{p.portfolio_notas}</p>}

                  <div className="flex gap-1.5 flex-wrap">
                    <Link href="/war-room" className="px-2.5 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white text-[10px] font-medium transition-all">⚡ War Room</Link>
                    <Link href="/presupuesto-escalado" className="px-2.5 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white text-[10px] font-medium transition-all">📈 Escalar</Link>
                    <button onClick={() => handleEdit(p)} className="px-2.5 py-1.5 rounded-lg border border-violet-500/20 text-violet-400 text-[10px] font-medium hover:bg-violet-500/10 transition-all">✏️ Editar</button>
                    <button onClick={() => deleteProduct(p.id)} className="px-2.5 py-1.5 rounded-lg border border-red-500/20 text-red-400/50 hover:text-red-400 text-[10px] font-medium transition-all ml-auto">✕</button>
                  </div>

                  <div className="flex gap-1 mt-2 pt-2 border-t border-white/5 flex-wrap">
                    {(Object.keys(STATUS) as ProductStatus[]).filter(s => s !== p.portfolio_estado).map(s => (
                      <button key={s} onClick={() => updateStatus(p.id, s)}
                        className="px-2 py-1 rounded-lg text-[10px] border border-white/8 text-white/25 hover:text-white/60 transition-all">
                        → {STATUS[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card p-8 text-center border border-white/5">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-white/60 font-semibold mb-1">Sin productos en el portfolio</p>
            <p className="text-white/30 text-sm mb-4">Agregá cada producto que estés testeando o escalando para ver tu negocio en un solo lugar.</p>
            <div className="flex gap-2 justify-center">
              <Link href="/productos" className="px-4 py-2.5 rounded-xl border border-white/15 text-white/50 text-sm transition-all hover:text-white">
                Importar desde catálogo
              </Link>
              <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all">
                + Agregar producto
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
