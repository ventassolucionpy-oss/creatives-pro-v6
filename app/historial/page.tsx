'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

// Mapa completo de todos los tools — ninguno queda con key cruda
const TOOL_LABELS: Record<string, { label: string; icon: string; color: string; route?: string }> = {
  'ugc-anuncios':       { label: 'UGC Anuncios',        icon: '✦', color: 'tag-purple', route: '/ugc-anuncios' },
  'ugc-secuencias':     { label: 'UGC Secuencias',      icon: '▤', color: 'tag-blue',   route: '/ugc-secuencias' },
  'ugc-catalogo':       { label: 'UGC Catálogo',        icon: '⊞', color: 'tag-green',  route: '/ugc-catalogo' },
  'meta-ads':           { label: 'Meta Ads Pro',        icon: 'M', color: 'tag-blue',   route: '/meta-ads-pro' },
  'tiktok':             { label: 'TikTok Ads',          icon: '🎵', color: 'tag-gray',  route: '/tiktok-shop' },
  'hotmart':            { label: 'Hotmart Funnel',      icon: 'H', color: 'tag-gold',  route: '/hotmart' },
  'andromeda':          { label: 'Andromeda',           icon: '✺', color: 'tag-violet', route: '/meta-ads-pro' },
  'ugc-creator':        { label: 'UGC Creator',         icon: '🎬', color: 'tag-purple', route: '/ugc-anuncios' },
  'campana-completa':   { label: 'Campaña Completa',    icon: '⚡', color: 'tag-violet', route: '/campana' },
  'lanzar-producto':    { label: 'Lanzar Producto',     icon: '🚀', color: 'tag-violet', route: '/lanzar' },
  'buyer-persona':      { label: 'Buyer Persona',       icon: '🧠', color: 'tag-violet', route: '/buyer-persona' },
  'organico':           { label: 'Orgánico IG/FB',      icon: '🌱', color: 'tag-green',  route: '/organico' },
  'spy-anuncio':        { label: 'Spy & Clonar',        icon: '🔍', color: 'tag-red',   route: '/spy' },
  'email-flows':        { label: 'Email Flows',         icon: '📧', color: 'tag-green',  route: '/email-flows' },
  'tiktok-shop':        { label: 'TikTok Shop',         icon: '🛍️', color: 'tag-gray',  route: '/tiktok-shop' },
  'whatsapp-flows':     { label: 'WhatsApp Flows',      icon: '📱', color: 'tag-green',  route: '/whatsapp-biz' },
  'customer-service':   { label: 'Customer Service',    icon: '💬', color: 'tag-green',  route: '/customer-service' },
  'analisis-nicho':     { label: 'Análisis de Nicho',   icon: '📊', color: 'tag-gold',  route: '/inteligencia' },
  'temporada':          { label: 'Temporadas',          icon: '📅', color: 'tag-gold',  route: '/calendario-contenido' },
  'contenido-imagen':   { label: 'Contenido Imagen',    icon: '🖼️', color: 'tag-blue',  route: '/crear' },
  'creativo-visual':    { label: 'Creativo Visual',     icon: '🎨', color: 'tag-blue',  route: '/crear' },
  'testimonios':        { label: 'Testimonios',         icon: '⭐', color: 'tag-gold',  route: '/crear' },
  'upsell':             { label: 'Upsell / Cross-sell', icon: '💰', color: 'tag-gold',  route: '/upsell' },
  'checkout-dropi':     { label: 'Checkout Dropi',      icon: '🛒', color: 'tag-green',  route: '/checkout-dropi' },
  'landing-page':       { label: 'Landing Page',        icon: '🏠', color: 'tag-violet', route: '/crear' },
  'sourcing':           { label: 'Sourcing',            icon: '📦', color: 'tag-blue',  route: '/dropi' },
  'precios-psicologicos':{ label: 'Precios',            icon: '🧮', color: 'tag-gold',  route: '/dropi' },
  'validador-producto': { label: 'Validador Producto',  icon: '✅', color: 'tag-green',  route: '/dropi' },
  'whatsapp-ventas':    { label: 'WhatsApp Ventas',     icon: '💬', color: 'tag-green',  route: '/whatsapp-biz' },
  'postmortem':         { label: 'Post-mortem',         icon: '🪦', color: 'tag-red',   route: '/postmortem' },
  'comparador-copies':  { label: 'Comparador Copies',   icon: '🔀', color: 'tag-blue',  route: '/comparador-copies' },
}

// Grupos de filtro
const FILTER_GROUPS = [
  { key: 'all', label: 'Todos' },
  { key: 'campana-completa', label: '⚡ Campaña' },
  { key: 'ugc-anuncios', label: '✦ UGC' },
  { key: 'meta-ads', label: 'M Meta Ads' },
  { key: 'buyer-persona', label: '🧠 Persona' },
  { key: 'lanzar-producto', label: '🚀 Lanzar' },
  { key: 'spy-anuncio', label: '🔍 Spy' },
  { key: 'hotmart', label: 'H Hotmart' },
]

type Generation = {
  id: string
  tool: string
  status: string
  input: Record<string, unknown>
  output: Record<string, unknown>
  created_at: string
  products?: { name: string }
}

export default function HistorialPage() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/generations?limit=100')
      .then(r => r.json())
      .then(data => { setGenerations(data.generations || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? generations : generations.filter(g => g.tool === filter)

  // Extraer preview del input (producto o descripción)
  const getPreview = (g: Generation) => {
    const inp = g.input as Record<string, unknown>
    return (inp.producto || inp.name || inp.product_name || inp.nicho || '') as string
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">

        <div className="mb-6">
          <Link href="/inicio" className="text-white/30 hover:text-white/60 text-sm flex items-center gap-1.5 mb-4 transition-colors">← Volver</Link>
          <h1 className="text-2xl font-bold text-white">🕐 Historial de Generaciones</h1>
          <p className="text-white/40 text-sm mt-1">
            {loading ? 'Cargando...' : `${generations.length} generaciones guardadas — hacé clic para ver el contenido`}
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTER_GROUPS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                filter === f.key
                  ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                  : 'border-white/10 bg-white/5 text-white/40 hover:text-white/70'
              }`}>
              {f.label}
              {f.key !== 'all' && generations.filter(g => g.tool === f.key).length > 0 && (
                <span className="ml-1.5 text-[10px] opacity-60">
                  {generations.filter(g => g.tool === f.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="card p-12 text-center">
            <div className="w-6 h-6 border-2 border-white/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/30 text-sm">Cargando historial...</p>
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-3">🕐</p>
            <p className="text-white/40 text-sm">
              {filter !== 'all' ? 'No hay generaciones de este tipo.' : '¡Empezá creando tu primera creatividad!'}
            </p>
            {filter === 'all' && (
              <Link href="/crear" className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all">
                Ir a Crear
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(g => {
              const tool = TOOL_LABELS[g.tool] || { label: g.tool, icon: '✦', color: 'tag-gray' }
              const hasOutput = g.output && Object.keys(g.output).length > 0
              const preview = getPreview(g)
              return (
                <Link
                  key={g.id}
                  href={`/historial/${g.id}`}
                  className="w-full card p-4 flex items-center gap-4 rounded-xl text-left transition-all hover:border-violet-500/30 hover:bg-white/[0.02] block"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-600/15 flex items-center justify-center text-violet-400 text-sm flex-shrink-0">
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={`tag ${tool.color} text-[10px]`}>{tool.label}</span>
                      {g.status === 'completed' && <span className="tag tag-green text-[10px]">Completado</span>}
                      {hasOutput && <span className="text-[10px] text-white/30">Ver contenido →</span>}
                    </div>
                    <p className="text-white/60 text-xs truncate">
                      {g.products?.name || preview || 'Sin producto vinculado'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white/30 text-xs">
                      {new Date(g.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </p>
                    <p className="text-white/20 text-[10px]">
                      {new Date(g.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {tool.route && (
                      <p className="text-violet-400/40 text-[10px] mt-0.5">Repetir →</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Estadísticas rápidas */}
        {generations.length > 0 && !loading && (
          <div className="mt-6 card p-4 border border-white/5">
            <p className="text-xs text-white/30 font-bold mb-3">RESUMEN</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-xl font-bold text-white">{generations.length}</p>
                <p className="text-[10px] text-white/30">Total generaciones</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-emerald-400">{generations.filter(g => g.status === 'completed').length}</p>
                <p className="text-[10px] text-white/30">Completadas</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-violet-400">
                  {new Set(generations.map(g => g.tool)).size}
                </p>
                <p className="text-[10px] text-white/30">Herramientas usadas</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
