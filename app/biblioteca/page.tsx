'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

type PromptSaved = {
  id: string
  titulo: string
  prompt: string
  negative_prompt: string
  tipo: 'imagen' | 'video' | 'leonardo' | 'copy'
  formato: string
  angulo: string
  producto_nombre: string
  herramienta: string
  destacado: boolean
  created_at: string
}

type Generation = {
  id: string
  tool: string
  created_at: string
  output?: Record<string, unknown>
  products?: { name: string }
}

export default function BibliotecaPage() {
  const [prompts, setPrompts] = useState<PromptSaved[]>([])
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'todos' | 'imagen' | 'video' | 'copy' | 'destacado'>('todos')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [selectedGenId, setSelectedGenId] = useState('')
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const { data: ps } = await supabase.from('prompt_library').select('*').order('destacado', { ascending: false }).order('created_at', { ascending: false })
    const { data: gens } = await supabase.from('generations').select('id, tool, created_at, output, products(name)').order('created_at', { ascending: false }).limit(20)
    setPrompts(ps || [])
    setGenerations((gens || []) as Generation[])
    setLoading(false)
  }

  const copyPrompt = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleDestacado = async (id: string, current: boolean) => {
    await supabase.from('prompt_library').update({ destacado: !current }).eq('id', id)
    setPrompts(ps => ps.map(p => p.id === id ? { ...p, destacado: !current } : p))
  }

  const deletePrompt = async (id: string) => {
    await supabase.from('prompt_library').delete().eq('id', id)
    setPrompts(ps => ps.filter(p => p.id !== id))
  }

  const importFromGeneration = async () => {
    if (!selectedGenId) return
    setImporting(true)
    const gen = generations.find(g => g.id === selectedGenId)
    if (!gen?.output) { setImporting(false); return }
    
    const output = gen.output as Record<string, unknown>
    const productoNombre = (gen as Generation & { products?: { name: string } }).products?.name || ''
    const inserts: Omit<PromptSaved, 'id' | 'created_at'>[] = []

    // Importar prompts de Nano Banana de cada copy
    const copies = output.copies as Array<Record<string, unknown>> | undefined
    copies?.forEach((copy) => {
      const nbp = copy.nanoBananaPrompts as Record<string, Array<{ formato: string; prompt: string; negativePrompt: string }>> | undefined
      nbp?.imagen?.forEach(p => {
        inserts.push({
          titulo: `${copy.framework} · ${copy.angulo} · ${p.formato}`,
          prompt: p.prompt,
          negative_prompt: p.negativePrompt || '',
          tipo: 'imagen',
          formato: p.formato,
          angulo: String(copy.angulo || ''),
          producto_nombre: productoNombre,
          herramienta: gen.tool,
          destacado: false,
        })
      })
      nbp?.video?.forEach(p => {
        inserts.push({
          titulo: `VIDEO ${copy.framework} · ${copy.angulo} · ${p.formato}`,
          prompt: p.prompt,
          negative_prompt: p.negativePrompt || '',
          tipo: 'video',
          formato: p.formato,
          angulo: String(copy.angulo || ''),
          producto_nombre: productoNombre,
          herramienta: gen.tool,
          destacado: false,
        })
      })
    })

    // Importar prompts de Leonardo
    const leo = output.leonardoPrompts as Array<{ uso: string; prompt: string; negativePrompt: string; settings: { ratio: string } }> | undefined
    leo?.forEach(p => {
      inserts.push({
        titulo: `Leonardo · ${p.uso}`,
        prompt: p.prompt,
        negative_prompt: p.negativePrompt || '',
        tipo: 'leonardo',
        formato: p.settings?.ratio || '',
        angulo: '',
        producto_nombre: productoNombre,
        herramienta: gen.tool,
        destacado: false,
      })
    })

    if (inserts.length > 0) {
      await supabase.from('prompt_library').insert(inserts)
    }
    setImporting(false)
    setSelectedGenId('')
    loadData()
  }

  const filtered = filter === 'todos' ? prompts
    : filter === 'destacado' ? prompts.filter(p => p.destacado)
    : prompts.filter(p => p.tipo === filter)

  const tipoColors: Record<string, string> = {
    imagen: 'text-sky-400',
    video: 'text-rose-400',
    leonardo: 'text-amber-400',
    copy: 'text-violet-400',
  }

  return (
    <div className="min-h-screen">
      <Link href="/aprender" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">🗂 Biblioteca de prompts</h1>
            <p className="text-white/40 text-xs mt-0.5">Todos tus mejores prompts guardados y listos para reusar</p>
          </div>
        </div>

        {/* Importar desde generación */}
        <div className="card p-4 border border-violet-500/20 bg-violet-500/5 mb-6">
          <p className="text-xs font-semibold text-violet-300 mb-2">📥 Importar prompts de una generación</p>
          <div className="flex gap-2">
            <select className="input flex-1 cursor-pointer text-xs" value={selectedGenId} onChange={e => setSelectedGenId(e.target.value)} style={{ background: '#111' }}>
              <option value="" style={{ background: '#111' }}>Seleccionar generación...</option>
              {generations.map(g => (
                <option key={g.id} value={g.id} style={{ background: '#111' }}>
                  {(g as Generation & { products?: { name: string } }).products?.name || 'Sin producto'} — {new Date(g.created_at).toLocaleDateString('es-PY')} ({g.tool})
                </option>
              ))}
            </select>
            <button onClick={importFromGeneration} disabled={!selectedGenId || importing} className="btn-primary text-xs px-4 whitespace-nowrap">
              {importing ? 'Importando...' : 'Importar'}
            </button>
          </div>
          <p className="text-white/25 text-[10px] mt-2">Importa automáticamente todos los prompts Nano Banana y Leonardo de esa generación</p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'destacado', label: '⭐ Destacados' },
            { key: 'imagen', label: '🖼 Imagen' },
            { key: 'video', label: '🎬 Video' },
            { key: 'leonardo', label: '🎨 Leonardo' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as typeof filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                filter === f.key ? 'border-violet-500 bg-violet-500/20 text-violet-300' : 'border-white/10 bg-white/5 text-white/40 hover:text-white/70'
              }`}>
              {f.label}
              {f.key !== 'todos' && <span className="ml-1 text-white/20">
                {f.key === 'destacado' ? prompts.filter(p=>p.destacado).length : prompts.filter(p=>p.tipo===f.key).length}
              </span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="card p-12 text-center"><div className="w-6 h-6 border-2 border-white/20 border-t-violet-500 rounded-full animate-spin mx-auto"/></div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-3xl mb-3">🗂</p>
            <p className="text-white/50 text-sm font-semibold mb-1">Biblioteca vacía</p>
            <p className="text-white/30 text-xs">Importá prompts de tus generaciones anteriores o generá nuevos creativos para poblar tu biblioteca.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(p => (
              <div key={p.id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold uppercase ${tipoColors[p.tipo] || 'text-white/40'}`}>{p.tipo}</span>
                      {p.formato && <span className="tag tag-gray text-[10px]">{p.formato}</span>}
                      {p.destacado && <span className="text-amber-400 text-[10px]">⭐</span>}
                    </div>
                    <p className="text-white text-xs font-semibold truncate">{p.titulo}</p>
                    {p.producto_nombre && <p className="text-white/30 text-[10px]">{p.producto_nombre}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0 ml-2">
                    <button onClick={() => toggleDestacado(p.id, p.destacado)} className="text-white/20 hover:text-amber-400 text-sm transition-colors" title="Destacar">⭐</button>
                    <button onClick={() => copyPrompt(p.prompt, p.id)} className="text-white/20 hover:text-violet-400 text-xs transition-colors px-2 py-1 rounded border border-white/10 hover:border-violet-500/30">
                      {copiedId === p.id ? '✓' : '⊕ Copiar'}
                    </button>
                    <button onClick={() => deletePrompt(p.id)} className="text-white/15 hover:text-red-400 text-xs transition-colors">✕</button>
                  </div>
                </div>
                <p className="text-white/50 text-[11px] font-mono bg-black/20 rounded-lg p-2.5 border border-white/5 leading-relaxed line-clamp-3">
                  {p.prompt}
                </p>
                {p.negative_prompt && (
                  <p className="text-red-400/40 text-[10px] mt-1">
                    <span className="text-red-400/60 font-medium">— Neg: </span>{p.negative_prompt}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
