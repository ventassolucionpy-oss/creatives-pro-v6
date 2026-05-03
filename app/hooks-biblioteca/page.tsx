'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useMemo } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

type Hook = {
  id: string
  texto: string
  categoria: string
  producto: string
  plataforma: 'meta' | 'tiktok' | 'ambas'
  roas?: number
  votos: number
  tags: string[]
  created_at: string
}

const CATEGORIAS = ['Problema', 'Pregunta', 'Número/Estadística', 'Historia', 'Controversia', 'Urgencia', 'Social proof', 'Curiosidad']

export default function HooksBibliotecaPage() {
  const [hooks, setHooks] = useState<Hook[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState('todos')
  const [filtroPlataforma, setFiltroPlataforma] = useState<'todos' | 'meta' | 'tiktok' | 'ambas'>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState<'votos' | 'roas' | 'reciente'>('votos')
  const [showForm, setShowForm] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [newTexto, setNewTexto] = useState('')
  const [newCategoria, setNewCategoria] = useState(CATEGORIAS[0])
  const [newProducto, setNewProducto] = useState('')
  const [newPlataforma, setNewPlataforma] = useState<'meta' | 'tiktok' | 'ambas'>('meta')
  const [newRoas, setNewRoas] = useState('')
  const [newTags, setNewTags] = useState('')

  useEffect(() => { loadHooks() }, [])

  const loadHooks = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hooks')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setHooks(data.hooks || [])
    } catch (err) {
      setError('Error cargando hooks.')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newTexto) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto: newTexto,
          categoria: newCategoria,
          producto: newProducto || 'General',
          plataforma: newPlataforma,
          roas: newRoas || null,
          tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setHooks(prev => [data.hook, ...prev])
      setNewTexto(''); setNewProducto(''); setNewRoas(''); setNewTags('')
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando hook')
    } finally {
      setSaving(false)
    }
  }

  const votar = async (hook: Hook) => {
    const nuevos = hook.votos + 1
    setHooks(prev => prev.map(h => h.id === hook.id ? { ...h, votos: nuevos } : h))
    try {
      await fetch('/api/hooks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: hook.id, votos: nuevos }),
      })
    } catch {
      loadHooks()
    }
  }

  const borrar = async (id: string) => {
    setHooks(prev => prev.filter(h => h.id !== id))
    try {
      await fetch(`/api/hooks?id=${id}`, { method: 'DELETE' })
    } catch {
      loadHooks()
    }
  }

  const copiar = (id: string, texto: string) => {
    navigator.clipboard.writeText(texto)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  const filtered = useMemo(() => {
    let list = [...hooks]
    if (filtroCategoria !== 'todos') list = list.filter(h => h.categoria === filtroCategoria)
    if (filtroPlataforma !== 'todos') list = list.filter(h => h.plataforma === filtroPlataforma || h.plataforma === 'ambas')
    if (busqueda) list = list.filter(h =>
      h.texto.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.producto.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.tags.some(t => t.toLowerCase().includes(busqueda.toLowerCase()))
    )
    if (orden === 'votos') list.sort((a, b) => b.votos - a.votos)
    else if (orden === 'roas') list.sort((a, b) => (b.roas || 0) - (a.roas || 0))
    else list.sort((a, b) => b.created_at.localeCompare(a.created_at))
    return list
  }, [hooks, filtroCategoria, filtroPlataforma, busqueda, orden])

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-white/20'
  const platColor = (p: string) => p === 'meta' ? 'text-blue-400' : p === 'tiktok' ? 'text-pink-400' : 'text-violet-400'
  const platIcon = (p: string) => p === 'meta' ? '📘' : p === 'tiktok' ? '🎵' : '🔀'

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/gestionar" className="text-white/30 hover:text-white/60 text-sm transition-colors">Gestionar</Link>
            <span className="text-white/20 text-sm">›</span>
            <span className="text-white/60 text-sm">Hooks</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">🎣 Biblioteca de Hooks</h1>
              <p className="text-white/40 text-sm mt-1">
                {loading ? 'Cargando...' : `${hooks.length} hooks guardados · Votá los que más convierten`}
              </p>
            </div>
            <button onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-all">
              + Agregar
            </button>
          </div>
        </div>

        {error && (
          <div className="card p-3 border border-red-500/30 bg-red-500/5 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Búsqueda */}
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
          <input className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-white/20"
            placeholder="Buscar por texto, producto o tag..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>

        {/* Filtro plataforma */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {(['todos', 'meta', 'tiktok', 'ambas']).map(p => (
            <button key={p} onClick={() => setFiltroPlataforma(p)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${filtroPlataforma === p ? 'bg-violet-600/30 border-violet-500/50 text-violet-300' : 'border-white/10 text-white/30'}`}>
              {p === 'todos' ? 'Todas' : `${platIcon(p)} ${p === 'ambas' ? 'Ambas' : p.charAt(0).toUpperCase() + p.slice(1)}`}
            </button>
          ))}
        </div>

        {/* Filtro categoría */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <button onClick={() => setFiltroCategoria('todos')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${filtroCategoria === 'todos' ? 'bg-violet-600/30 border-violet-500/50 text-violet-300' : 'border-white/10 text-white/30'}`}>
            Todas
          </button>
          {CATEGORIAS.map(c => (
            <button key={c} onClick={() => setFiltroCategoria(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${filtroCategoria === c ? 'bg-violet-600/30 border-violet-500/50 text-violet-300' : 'border-white/10 text-white/30'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Ordenar */}
        <div className="flex gap-2 mb-5">
          {([['votos', '👍 Más votados'], ['roas', '🔥 Mejor ROAS'], ['reciente', '🕐 Recientes']]).map(([k, l]) => (
            <button key={k} onClick={() => setOrden(k)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${orden === k ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/30'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <div className="card p-5 border border-violet-500/30 bg-violet-500/5 mb-5">
            <p className="text-sm font-bold text-white mb-4">Guardar nuevo hook</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Texto del hook</label>
                <textarea className={`${inputCls} resize-none`} rows={3}
                  placeholder="Escribí o pegá el hook acá..."
                  value={newTexto} onChange={e => setNewTexto(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Categoría</label>
                  <select className={inputCls} value={newCategoria} onChange={e => setNewCategoria(e.target.value)}>
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Plataforma</label>
                  <select className={inputCls} value={newPlataforma} onChange={e => setNewPlataforma(e.target.value as 'meta' | 'tiktok' | 'ambas')}>
                    <option value="meta">📘 Meta</option>
                    <option value="tiktok">🎵 TikTok</option>
                    <option value="ambas">🔀 Ambas</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Producto</label>
                  <input className={inputCls} placeholder="ej. Masajeador" value={newProducto} onChange={e => setNewProducto(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">ROAS obtenido</label>
                  <input className={inputCls} type="number" step="0.1" placeholder="ej. 3.5" value={newRoas} onChange={e => setNewRoas(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Tags (separados por coma)</label>
                <input className={inputCls} placeholder="ej. dolor, salud, mujer" value={newTags} onChange={e => setNewTags(e.target.value)} />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/40 text-sm">Cancelar</button>
                <button onClick={handleAdd} disabled={saving || !newTexto}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-sm transition-all">
                  {saving ? 'Guardando...' : 'Guardar hook'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <div className="card p-8 text-center">
            <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/40 text-sm">Cargando hooks...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map(hook => (
              <div key={hook.id} className="card p-4 border border-white/8 hover:border-white/15 transition-all">
                <p className="text-white text-sm font-medium leading-relaxed mb-3">{hook.texto}</p>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-[10px] font-medium">{hook.categoria}</span>
                  <span className={`text-[10px] font-medium ${platColor(hook.plataforma)}`}>{platIcon(hook.plataforma)} {hook.plataforma}</span>
                  {hook.producto !== 'General' && <span className="text-[10px] text-white/30">{hook.producto}</span>}
                  {hook.roas && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">ROAS {hook.roas}x</span>}
                  {hook.tags.map(t => <span key={t} className="px-1.5 py-0.5 rounded-full bg-white/5 text-white/25 text-[10px]">#{t}</span>)}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => votar(hook)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all">
                    <span className="text-xs">👍</span>
                    <span className="text-white/60 text-xs font-bold">{hook.votos}</span>
                  </button>
                  <button onClick={() => copiar(hook.id, hook.texto)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all">
                    <span className="text-xs">{copied === hook.id ? '✅' : '📋'}</span>
                    <span className="text-white/60 text-xs">{copied === hook.id ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <span className="text-white/20 text-xs ml-auto">
                    {new Date(hook.created_at).toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit' })}
                  </span>
                  <button onClick={() => borrar(hook.id)} className="text-white/15 hover:text-red-400/50 text-xs transition-colors">✕</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center border border-white/5">
            <p className="text-4xl mb-3">🎣</p>
            <p className="text-white/60 font-semibold mb-1">Sin hooks que coincidan</p>
            <p className="text-white/30 text-sm">Guardá tus mejores hooks de las campañas y votá los que mejor convierten.</p>
          </div>
        )}

        <div className="card p-4 mt-5 border border-violet-500/20 bg-violet-500/5">
          <p className="text-xs text-violet-300 font-bold mb-1">💡 Tip</p>
          <p className="text-xs text-white/40">Copiá los hooks ganadores de tus generaciones, pegálos acá con el ROAS que obtuviste, y votá los mejores para priorizar en la próxima campaña. Los hooks se guardan automáticamente.</p>
        </div>
      </main>
    </div>
  )
}
