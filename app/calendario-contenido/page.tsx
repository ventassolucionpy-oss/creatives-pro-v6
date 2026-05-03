'use client'
export const dynamic = 'force-dynamic'
import { useState, useMemo } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

type PostStatus = 'pendiente' | 'publicado' | 'saltado'
type PostType = 'reel' | 'carrusel' | 'historia' | 'tiktok' | 'live' | 'foto'

type CalendarPost = {
  id: string
  dia: string
  hora: string
  tipo: PostType
  tema: string
  caption: string
  hashtags: string
  estado: PostStatus
  plataforma: 'instagram' | 'facebook' | 'tiktok' | 'todas'
  producto: string
}

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const TYPE_CONFIG: Record<PostType, { icon: string; color: string }> = {
  reel: { icon: '🎬', color: 'border-pink-500/30 bg-pink-500/5 text-pink-400' },
  carrusel: { icon: '🖼️', color: 'border-blue-500/30 bg-blue-500/5 text-blue-400' },
  historia: { icon: '⭕', color: 'border-violet-500/30 bg-violet-500/5 text-violet-400' },
  tiktok: { icon: '🎵', color: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400' },
  live: { icon: '🔴', color: 'border-red-500/30 bg-red-500/5 text-red-400' },
  foto: { icon: '📷', color: 'border-amber-500/30 bg-amber-500/5 text-amber-400' },
}

const STATUS_CONFIG: Record<PostStatus, { icon: string; label: string; color: string }> = {
  pendiente: { icon: '⏳', label: 'Pendiente', color: 'text-white/40' },
  publicado: { icon: '✅', label: 'Publicado', color: 'text-emerald-400' },
  saltado: { icon: '⏭️', label: 'Saltado', color: 'text-red-400/60' },
}

const PLAN_SEMANAL_BASE: Omit<CalendarPost, 'id' | 'estado' | 'producto'>[] = [
  { dia: 'Lunes', hora: '12:00', tipo: 'reel', tema: 'Problema + Solución', caption: 'Generá con Orgánico →', hashtags: '#paraguay #comprasenlinea', plataforma: 'instagram' },
  { dia: 'Lunes', hora: '18:00', tipo: 'historia', tema: 'Testimonial del fin de semana', caption: 'Generá con Orgánico →', hashtags: '', plataforma: 'instagram' },
  { dia: 'Martes', hora: '10:00', tipo: 'tiktok', tema: 'Demo del producto en 30 seg', caption: 'Generá con TikTok Shop →', hashtags: '#tiktokparaguay #fyp', plataforma: 'tiktok' },
  { dia: 'Miércoles', hora: '12:00', tipo: 'carrusel', tema: '5 beneficios del producto', caption: 'Generá con Orgánico →', hashtags: '#saludparaguay', plataforma: 'facebook' },
  { dia: 'Miércoles', hora: '19:00', tipo: 'historia', tema: 'Encuesta — ¿conocés este problema?', caption: '', hashtags: '', plataforma: 'instagram' },
  { dia: 'Jueves', hora: '11:00', tipo: 'reel', tema: 'Antes y después / Transformación', caption: 'Generá con UGC →', hashtags: '#lifestyle', plataforma: 'instagram' },
  { dia: 'Viernes', hora: '12:00', tipo: 'tiktok', tema: 'Trending audio + producto', caption: 'Generá con TikTok Shop →', hashtags: '#paraguay #fyp #trending', plataforma: 'tiktok' },
  { dia: 'Viernes', hora: '18:00', tipo: 'historia', tema: 'Oferta del fin de semana — solo hoy', caption: '', hashtags: '', plataforma: 'todas' },
  { dia: 'Sábado', hora: '10:00', tipo: 'foto', tema: 'Foto del producto con lifestyle', caption: 'Generá con Orgánico →', hashtags: '#compras', plataforma: 'instagram' },
  { dia: 'Domingo', hora: '20:00', tipo: 'carrusel', tema: 'Recap de la semana + próxima semana', caption: '', hashtags: '', plataforma: 'facebook' },
]

export default function CalendarioContenidoPage() {
  const [posts, setPosts] = useState<CalendarPost[]>(
    PLAN_SEMANAL_BASE.map((p, i) => ({ ...p, id: String(i + 1), estado: 'pendiente', producto: '' }))
  )
  const [producto, setProducto] = useState('')
  const [filtro, setFiltro] = useState<PostStatus | 'todos'>('todos')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  // Form state
  const [fDia, setFDia] = useState('Lunes')
  const [fHora, setFHora] = useState('12:00')
  const [fTipo, setFTipo] = useState<PostType>('reel')
  const [fTema, setFTema] = useState('')
  const [fCaption, setFCaption] = useState('')
  const [fPlataforma, setFPlataforma] = useState<CalendarPost['plataforma']>('instagram')

  const stats = useMemo(() => {
    const total = posts.length
    const publicados = posts.filter(p => p.estado === 'publicado').length
    const pendientes = posts.filter(p => p.estado === 'pendiente').length
    const pct = total > 0 ? Math.round((publicados / total) * 100) : 0
    return { total, publicados, pendientes, pct }
  }, [posts])

  const postsByDay = useMemo(() => {
    const filtered = filtro === 'todos' ? posts : posts.filter(p => p.estado === filtro)
    return DIAS.reduce((acc, dia) => {
      acc[dia] = filtered.filter(p => p.dia === dia).sort((a, b) => a.hora.localeCompare(b.hora))
      return acc
    }, {} as Record<string, CalendarPost[]>)
  }, [posts, filtro])

  const toggleStatus = (id: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== id) return p
      const next: PostStatus = p.estado === 'pendiente' ? 'publicado' : p.estado === 'publicado' ? 'saltado' : 'pendiente'
      return { ...p, estado: next }
    }))
  }

  const handleAdd = () => {
    if (!fTema) return
    const newPost: CalendarPost = {
      id: Date.now().toString(),
      dia: fDia, hora: fHora, tipo: fTipo, tema: fTema,
      caption: fCaption, hashtags: '', estado: 'pendiente',
      plataforma: fPlataforma, producto,
    }
    setPosts(prev => [...prev, newPost])
    setFTema(''); setFCaption(''); setShowAddForm(false)
  }

  const deletePost = (id: string) => setPosts(prev => prev.filter(p => p.id !== id))

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-white/20'
  const labelCls = 'block text-xs text-white/40 mb-1.5 font-medium'

  const platIcon = (p: CalendarPost['plataforma']) =>
    p === 'instagram' ? '📸' : p === 'facebook' ? '📘' : p === 'tiktok' ? '🎵' : '🔀'

  return (
    <div className="min-h-screen">
      <Link href="/crear" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/aprender" className="text-white/30 hover:text-white/60 text-sm transition-colors">Aprender</Link>
            <span className="text-white/20 text-sm">›</span>
            <span className="text-white/60 text-sm">Calendario</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">📅 Calendario de Contenido</h1>
              <p className="text-white/40 text-sm mt-1">Tu plan semanal — marcá lo que ya publicaste</p>
            </div>
            <button onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all">
              + Post
            </button>
          </div>
        </div>

        {/* Producto */}
        <div className="card p-4 mb-4 border border-white/8">
          <input className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-white/20"
            placeholder="¿Qué producto estás promocionando esta semana?"
            value={producto} onChange={e => setProducto(e.target.value)} />
        </div>

        {/* Progreso */}
        <div className="card p-4 mb-4 border border-white/8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/60 text-sm font-bold">Progreso semanal</p>
            <p className="text-white font-black">{stats.publicados}/{stats.total}</p>
          </div>
          <div className="bg-white/5 rounded-full h-3 overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-violet-600 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.pct}%` }} />
          </div>
          <div className="flex gap-4">
            <p className="text-emerald-400 text-xs font-bold">✅ {stats.publicados} publicados</p>
            <p className="text-white/30 text-xs">⏳ {stats.pendientes} pendientes</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-5">
          {(['todos', 'pendiente', 'publicado', 'saltado']).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${filtro === f ? 'bg-violet-600/30 border-violet-500/50 text-violet-300' : 'border-white/10 text-white/30'}`}>
              {f === 'todos' ? 'Todos' : STATUS_CONFIG[f].icon + ' ' + STATUS_CONFIG[f].label}
            </button>
          ))}
        </div>

        {/* Form agregar post */}
        {showAddForm && (
          <div className="card p-5 border border-violet-500/30 bg-violet-500/5 mb-5">
            <p className="text-sm font-bold text-white mb-4">Agregar post al calendario</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Día</label>
                  <select className={inputCls} value={fDia} onChange={e => setFDia(e.target.value)}>
                    {DIAS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Hora</label>
                  <input className={inputCls} type="time" value={fHora} onChange={e => setFHora(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Tipo</label>
                  <select className={inputCls} value={fTipo} onChange={e => setFTipo(e.target.value as PostType)}>
                    {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {k}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Plataforma</label>
                  <select className={inputCls} value={fPlataforma} onChange={e => setFPlataforma(e.target.value as CalendarPost['plataforma'])}>
                    <option value="instagram">📸 Instagram</option>
                    <option value="facebook">📘 Facebook</option>
                    <option value="tiktok">🎵 TikTok</option>
                    <option value="todas">🔀 Todas</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Tema del post</label>
                <input className={inputCls} placeholder="ej. Antes y después del masajeador" value={fTema} onChange={e => setFTema(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Caption (opcional)</label>
                <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Texto para el post o nota de referencia" value={fCaption} onChange={e => setFCaption(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/40 text-sm">Cancelar</button>
                <button onClick={handleAdd} disabled={!fTema}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-sm transition-all">
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Calendario por día */}
        <div className="space-y-4">
          {DIAS.map(dia => {
            const dayPosts = postsByDay[dia] || []
            if (dayPosts.length === 0 && filtro !== 'todos') return null
            const publicadosDia = posts.filter(p => p.dia === dia && p.estado === 'publicado').length
            const totalDia = posts.filter(p => p.dia === dia).length

            return (
              <div key={dia}>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{dia}</p>
                  {totalDia > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      publicadosDia === totalDia ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/20'
                    }`}>
                      {publicadosDia}/{totalDia}
                    </span>
                  )}
                </div>

                {dayPosts.length > 0 ? (
                  <div className="space-y-2">
                    {dayPosts.map(post => {
                      const tc = TYPE_CONFIG[post.tipo]
                      const sc = STATUS_CONFIG[post.estado]
                      return (
                        <div key={post.id} className={`card p-3.5 border transition-all ${post.estado === 'publicado' ? 'opacity-60' : ''}`}>
                          <div className="flex items-start gap-3">
                            <button onClick={() => toggleStatus(post.id)}
                              className={`w-8 h-8 rounded-xl border flex items-center justify-center text-base flex-shrink-0 transition-all hover:scale-105 ${tc.color}`}>
                              {post.estado === 'publicado' ? '✅' : post.estado === 'saltado' ? '⏭️' : tc.icon}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-white/60 text-[10px] font-bold">{post.hora}</p>
                                <span className="text-white/20 text-[10px]">·</span>
                                <p className="text-white/40 text-[10px]">{platIcon(post.plataforma)} {post.plataforma}</p>
                                <span className="text-white/20 text-[10px]">·</span>
                                <p className="text-white/30 text-[10px] capitalize">{post.tipo}</p>
                              </div>
                              <p className="text-white/80 text-sm font-medium leading-tight">{post.tema}</p>
                              {post.caption && post.caption !== 'Generá con Orgánico →' && post.caption !== 'Generá con TikTok Shop →' && post.caption !== 'Generá con UGC →' && (
                                <p className="text-white/30 text-xs mt-1 truncate">{post.caption}</p>
                              )}
                              {(post.caption === 'Generá con Orgánico →' || post.caption === 'Generá con TikTok Shop →' || post.caption === 'Generá con UGC →') && (
                                <Link href={post.caption.includes('TikTok') ? '/tiktok-shop' : post.caption.includes('UGC') ? '/creativos/ugc' : '/organico'}
                                  className="text-violet-400 text-xs mt-1 hover:text-violet-300 transition-colors">
                                  {post.caption}
                                </Link>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className={`text-[10px] font-bold ${sc.color}`}>{sc.icon}</span>
                              <button onClick={() => deletePost(post.id)} className="text-white/10 hover:text-red-400/50 text-xs transition-colors">✕</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="card p-3 border border-dashed border-white/10 text-center">
                    <p className="text-white/20 text-xs">Sin posts — tap + para agregar</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Link a orgánico */}
        <div className="card p-4 mt-5 border border-violet-500/20 bg-violet-500/5">
          <p className="text-xs text-violet-300 font-bold mb-2">💡 Generá el plan completo con IA</p>
          <p className="text-xs text-white/40 mb-3">El módulo Orgánico genera tu plan semanal con copies e ideas por tipo de post. Después traés las ideas al calendario y marcás lo que vas publicando.</p>
          <Link href="/organico" className="block text-center py-2 rounded-xl border border-violet-500/30 text-violet-400 text-xs font-bold hover:bg-violet-500/10 transition-all">
            Ir a Contenido Orgánico →
          </Link>
        </div>

      </main>
    </div>
  )
}
