'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { PAISES, type Pais } from '@/lib/constants'

type Creador = {
  id: string
  nombre: string
  instagram: string
  tiktok: string
  whatsapp: string
  nicho: string
  tarifa_usd: number
  estado: 'activo' | 'inactivo' | 'en_prueba'
  pais: Pais
  notas: string
  guiones_asignados: number
  guiones_entregados: number
  ultima_entrega: string | null
  created_at: string
}

const NICHOS = ['Belleza','Salud','Tecnología','Hogar','Fitness','Moda','Mascotas','Bebés','Cocina','General']
const ESTADOS = { activo: '🟢 Activo', inactivo: '⚫ Inactivo', en_prueba: '🟡 En prueba' }

function CreadorCard({ c, onEdit, onDelete }: { c: Creador; onEdit: (c: Creador) => void; onDelete: (id: string) => void }) {
  const entregaPct = c.guiones_asignados > 0 ? Math.round((c.guiones_entregados / c.guiones_asignados) * 100) : 0
  return (
    <div className="card border border-white/8 p-4 rounded-2xl">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {c.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-bold text-sm">{c.nombre}</p>
            <p className="text-white/40 text-xs">{c.nicho} · {PAISES[c.pais]?.bandera}</p>
          </div>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.estado === 'activo' ? 'bg-emerald-500/15 text-emerald-400' : c.estado === 'en_prueba' ? 'bg-amber-500/15 text-amber-400' : 'bg-white/10 text-white/40'}`}>
          {ESTADOS[c.estado]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        {c.instagram && (
          <div className="flex items-center gap-1.5 text-white/50">
            <span>📸</span><span className="truncate">@{c.instagram}</span>
          </div>
        )}
        {c.tiktok && (
          <div className="flex items-center gap-1.5 text-white/50">
            <span>🎵</span><span className="truncate">@{c.tiktok}</span>
          </div>
        )}
        {c.whatsapp && (
          <a href={`https://wa.me/${c.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-green-400 hover:text-green-300">
            <span>📱</span><span className="truncate">{c.whatsapp}</span>
          </a>
        )}
        <div className="flex items-center gap-1.5 text-amber-400">
          <span>💵</span><span>${c.tarifa_usd} USD/video</span>
        </div>
      </div>

      {/* Guiones stats */}
      <div className="bg-white/3 rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-white/40 uppercase tracking-wide">Guiones</span>
          <span className="text-[10px] text-white/50">{c.guiones_entregados}/{c.guiones_asignados} entregados</span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${entregaPct}%` }} />
        </div>
        {c.ultima_entrega && (
          <p className="text-[10px] text-white/25 mt-1">Última entrega: {new Date(c.ultima_entrega).toLocaleDateString('es-PY')}</p>
        )}
      </div>

      {c.notas && <p className="text-xs text-white/30 italic mb-3 leading-relaxed">"{c.notas}"</p>}

      <div className="flex gap-2">
        <Link href={`/creativos/ugc-creator?creador=${encodeURIComponent(c.nombre)}`}
          className="flex-1 py-2 rounded-xl bg-violet-600/20 text-violet-300 text-xs font-medium text-center hover:bg-violet-600/30 transition-colors">
          ✦ Crear guion
        </Link>
        <button onClick={() => onEdit(c)}
          className="px-3 py-2 rounded-xl bg-white/5 text-white/50 text-xs hover:bg-white/10 transition-colors">
          Editar
        </button>
        <button onClick={() => onDelete(c.id)}
          className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors">
          ✕
        </button>
      </div>
    </div>
  )
}

function CreadorForm({ initial, onSave, onCancel }: {
  initial?: Partial<Creador>;
  onSave: (data: Partial<Creador>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Creador>>({
    nombre: '', instagram: '', tiktok: '', whatsapp: '', nicho: 'Belleza',
    tarifa_usd: 0, estado: 'en_prueba', pais: 'PY', notas: '',
    ...initial,
  })
  const set = (k: keyof Creador, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="card border border-violet-500/30 bg-violet-500/5 p-5 rounded-2xl space-y-3">
      <p className="text-white font-bold text-sm mb-2">{initial?.id ? 'Editar creador' : 'Agregar creador'}</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-white/40 mb-1 block">Nombre *</label>
          <input value={form.nombre || ''} onChange={e => set('nombre', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-500 placeholder:text-white/20"
            placeholder="Ej: María González" />
        </div>
        <div>
          <label className="text-[10px] text-white/40 mb-1 block">Nicho</label>
          <select value={form.nicho || 'General'} onChange={e => set('nicho', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-500">
            {NICHOS.map(n => <option key={n} value={n} className="bg-zinc-900">{n}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-white/40 mb-1 block">Instagram (sin @)</label>
          <input value={form.instagram || ''} onChange={e => set('instagram', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-500 placeholder:text-white/20"
            placeholder="usuario" />
        </div>
        <div>
          <label className="text-[10px] text-white/40 mb-1 block">TikTok (sin @)</label>
          <input value={form.tiktok || ''} onChange={e => set('tiktok', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-500 placeholder:text-white/20"
            placeholder="usuario" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-white/40 mb-1 block">WhatsApp</label>
          <input value={form.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-500 placeholder:text-white/20"
            placeholder="+595 981..." />
        </div>
        <div>
          <label className="text-[10px] text-white/40 mb-1 block">Tarifa (USD/video)</label>
          <input type="number" value={form.tarifa_usd || 0} onChange={e => set('tarifa_usd', Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-white/40 mb-1 block">Estado</label>
          <select value={form.estado || 'en_prueba'} onChange={e => set('estado', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-500">
            <option value="en_prueba" className="bg-zinc-900">🟡 En prueba</option>
            <option value="activo" className="bg-zinc-900">🟢 Activo</option>
            <option value="inactivo" className="bg-zinc-900">⚫ Inactivo</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] text-white/40 mb-1 block">País</label>
          <select value={form.pais || 'PY'} onChange={e => set('pais', e.target.value as Pais)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-500">
            {Object.values(PAISES).map(p => <option key={p.codigo} value={p.codigo} className="bg-zinc-900">{p.bandera} {p.nombre}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-[10px] text-white/40 mb-1 block">Notas</label>
        <textarea value={form.notas || ''} onChange={e => set('notas', e.target.value)} rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-500 placeholder:text-white/20 resize-none"
          placeholder="Ej: Muy buena presencia en cámara, especialidad en unboxings..." />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(form)}
          className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition-colors">
          {initial?.id ? 'Guardar cambios' : 'Agregar creador'}
        </button>
        <button onClick={onCancel}
          className="px-4 py-2.5 rounded-xl bg-white/5 text-white/50 text-xs hover:bg-white/10 transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default function CreadoresPage() {
  const [creadores, setCreadores] = useState<Creador[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<Creador | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const supabase = createClient()

  useEffect(() => { loadCreadores() }, [])

  async function loadCreadores() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data } = await supabase.from('creadores_ugc').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setCreadores((data || []) as Creador[])
    setLoading(false)
  }

  async function handleSave(form: Partial<Creador>) {
    if (!form.nombre?.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editando?.id) {
      await supabase.from('creadores_ugc').update({ ...form }).eq('id', editando.id)
    } else {
      await supabase.from('creadores_ugc').insert({ ...form, user_id: user.id, guiones_asignados: 0, guiones_entregados: 0 })
    }
    setShowForm(false); setEditando(null)
    await loadCreadores()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este creador?')) return
    await supabase.from('creadores_ugc').delete().eq('id', id)
    setCreadores(cs => cs.filter(c => c.id !== id))
  }

  const filtered = creadores.filter(c => filtroEstado === 'todos' || c.estado === filtroEstado)
  const activos = creadores.filter(c => c.estado === 'activo').length
  const totalGuiones = creadores.reduce((s, c) => s + c.guiones_entregados, 0)
  const tarifaPromedio = creadores.length > 0
    ? Math.round(creadores.reduce((s, c) => s + c.tarifa_usd, 0) / creadores.length)
    : 0

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <Link href="/crear" className="text-white/30 hover:text-white/60 text-sm transition-colors">← Crear</Link>
            <h1 className="text-2xl font-bold text-white mt-1">🎬 Creadores UGC</h1>
            <p className="text-white/40 text-xs mt-0.5">CRM de tus creadores de contenido</p>
          </div>
          {!showForm && (
            <button onClick={() => { setEditando(null); setShowForm(true) }}
              className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition-colors">
              + Agregar
            </button>
          )}
        </div>

        {/* Stats */}
        {creadores.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="card p-3 text-center rounded-xl">
              <p className="text-lg font-bold text-emerald-400">{activos}</p>
              <p className="text-[10px] text-white/30">Activos</p>
            </div>
            <div className="card p-3 text-center rounded-xl">
              <p className="text-lg font-bold text-violet-400">{totalGuiones}</p>
              <p className="text-[10px] text-white/30">Videos entregados</p>
            </div>
            <div className="card p-3 text-center rounded-xl">
              <p className="text-lg font-bold text-amber-400">${tarifaPromedio}</p>
              <p className="text-[10px] text-white/30">Tarifa promedio</p>
            </div>
          </div>
        )}

        {/* Form */}
        {(showForm || editando) && (
          <div className="mb-4">
            <CreadorForm
              initial={editando || undefined}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditando(null) }}
            />
          </div>
        )}

        {/* Filters */}
        {creadores.length > 0 && (
          <div className="flex gap-2 mb-3">
            {['todos', 'activo', 'en_prueba', 'inactivo'].map(f => (
              <button key={f} onClick={() => setFiltroEstado(f)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${filtroEstado === f ? 'border-violet-500/50 bg-violet-500/15 text-violet-300' : 'border-white/10 text-white/40 hover:text-white/60'}`}>
                {f === 'todos' ? 'Todos' : ESTADOS[f as keyof typeof ESTADOS]}
              </button>
            ))}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎬</p>
            <p className="text-white/50 text-sm font-medium">
              {creadores.length === 0 ? 'Aún no tenés creadores registrados' : 'No hay creadores con este filtro'}
            </p>
            <p className="text-white/25 text-xs mt-1">
              {creadores.length === 0 ? 'Agregá tus creadores UGC para gestionar guiones y tarifas' : 'Probá con otro filtro'}
            </p>
            {creadores.length === 0 && (
              <button onClick={() => setShowForm(true)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-500">
                + Agregar primer creador
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <CreadorCard key={c.id} c={c}
                onEdit={c => { setEditando(c); setShowForm(false) }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Quick links */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Link href="/ugc-review" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-rose-500/30 transition-all">
            <span>🌟</span><div><p className="text-white text-xs font-bold">Scripts de reseña</p><p className="text-white/30 text-[10px]">Generar guion de video</p></div>
          </Link>
          <Link href="/creativos/ugc-creator" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-violet-500/30 transition-all">
            <span>✦</span><div><p className="text-white text-xs font-bold">Guiones UGC</p><p className="text-white/30 text-[10px]">Para creadores pro</p></div>
          </Link>
        </div>
      </main>
    </div>
  )
}
