'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Product } from '@/types'

// ─── Tipos ───────────────────────────────────────────────
type Celda = {
  angulo: string
  audiencia: string
  estado: 'no_testeado' | 'testeando' | 'ganador' | 'perdedor' | 'pausado'
  roas?: number
  ctr?: number
  notas?: string
}

const ANGULOS = ['Beneficio directo', 'Dolor/Frustración', 'Historia', 'Curiosidad/Hook', 'Social proof', 'Urgencia/Escasez', 'Transformación', 'Precio/Valor']
const AUDIENCIAS = ['Fría — Intereses', 'Fría — Amplia', 'Lookalike 1-3%', 'Lookalike 3-7%', 'Retargeting', 'Base de clientes']

const ESTADO_CONFIG = {
  no_testeado: { label: 'Sin testear', color: 'bg-white/5 border-white/10', textColor: 'text-white/25', dot: 'bg-white/20' },
  testeando:   { label: 'Testeando',  color: 'bg-amber-500/10 border-amber-500/30', textColor: 'text-amber-300', dot: 'bg-amber-500' },
  ganador:     { label: 'Ganador',    color: 'bg-emerald-500/10 border-emerald-500/30', textColor: 'text-emerald-300', dot: 'bg-emerald-500' },
  perdedor:    { label: 'Perdedor',   color: 'bg-red-500/8 border-red-500/20', textColor: 'text-red-400/60', dot: 'bg-red-500' },
  pausado:     { label: 'Pausado',    color: 'bg-white/3 border-white/8', textColor: 'text-white/20', dot: 'bg-white/30' },
}

const STORAGE_KEY = 'matriz_creativos_v2'

export default function MatrizCreativosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [matrix, setMatrix] = useState<Record<string, Celda>>({})
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Celda>>({})
  const [view, setView] = useState<'matriz' | 'gaps' | 'ganadores'>('matriz')
  const supabase = createClient()

  useEffect(() => {
    supabase.from('products').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setProducts(data as Product[])
    })
    // Cargar matriz guardada
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setMatrix(JSON.parse(saved))
    } catch {}
  }, [])

  const saveMatrix = (newMatrix: Record<string, Celda>) => {
    setMatrix(newMatrix)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMatrix))
  }

  const getCellKey = (angulo: string, audiencia: string, productId?: string) =>
    `${productId || 'global'}::${angulo}::${audiencia}`

  const getCell = (angulo: string, audiencia: string): Celda => {
    const key = getCellKey(angulo, audiencia, selectedProduct?.id)
    return matrix[key] || { angulo, audiencia, estado: 'no_testeado' }
  }

  const openEdit = (angulo: string, audiencia: string) => {
    const cell = getCell(angulo, audiencia)
    setEditingCell(getCellKey(angulo, audiencia, selectedProduct?.id))
    setEditForm({ ...cell })
  }

  const saveEdit = () => {
    if (!editingCell) return
    const newMatrix = { ...matrix, [editingCell]: editForm as Celda }
    saveMatrix(newMatrix)
    setEditingCell(null)
  }

  // Estadísticas
  const allCells = ANGULOS.flatMap(a => AUDIENCIAS.map(au => getCell(a, au)))
  const stats = {
    total: allCells.length,
    testeados: allCells.filter(c => c.estado !== 'no_testeado').length,
    ganadores: allCells.filter(c => c.estado === 'ganador').length,
    gaps: allCells.filter(c => c.estado === 'no_testeado').length,
  }

  // Mejores combinaciones sin testear (priorizadas)
  const topGaps = (() => {
    const ganadores = allCells.filter(c => c.estado === 'ganador')
    const angloGanadores = new Set(ganadores.map(c => c.angulo))
    const audGanadoras = new Set(ganadores.map(c => c.audiencia))
    const sin = allCells.filter(c => c.estado === 'no_testeado')
    // Priorizar: ángulo ganador con audiencia no testeada, o audiencia ganadora con ángulo no testeado
    return sin.sort((a, b) => {
      const aScore = (angloGanadores.has(a.angulo) ? 2 : 0) + (audGanadoras.has(a.audiencia) ? 1 : 0)
      const bScore = (angloGanadores.has(b.angulo) ? 2 : 0) + (audGanadoras.has(b.audiencia) ? 1 : 0)
      return bScore - aScore
    }).slice(0, 6)
  })()

  const ic = 'w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/50'

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-full px-4 py-6">
        <div className="max-w-2xl mx-auto mb-6">
          <Link href="/gestionar" className="text-white/30 hover:text-white/60 text-sm flex items-center gap-1.5 mb-4 transition-colors">← Gestionar</Link>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">🔢 Matriz de Creativos</h1>
            <span className="tag tag-violet text-[10px]">Nuevo</span>
          </div>
          <p className="text-white/40 text-sm">Tablero Ángulo × Audiencia — mirá exactamente qué testeaste y qué gaps quedan</p>
        </div>

        {/* Product selector */}
        <div className="max-w-2xl mx-auto mb-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedProduct(null)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex-shrink-0 ${
                !selectedProduct ? 'border-violet-500/50 bg-violet-500/10 text-violet-300' : 'border-white/10 text-white/35'
              }`}
            >
              Todos los productos
            </button>
            {products.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex-shrink-0 ${
                  selectedProduct?.id === p.id ? 'border-violet-500/50 bg-violet-500/10 text-violet-300' : 'border-white/10 text-white/35'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-2xl mx-auto grid grid-cols-4 gap-2 mb-5">
          <div className="card p-3 text-center">
            <p className="text-lg font-bold text-white">{stats.testeados}</p>
            <p className="text-[10px] text-white/30">Testeados</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-lg font-bold text-emerald-400">{stats.ganadores}</p>
            <p className="text-[10px] text-white/30">Ganadores</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-lg font-bold text-red-400">{stats.gaps}</p>
            <p className="text-[10px] text-white/30">Sin testear</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-lg font-bold text-violet-400">{stats.total > 0 ? Math.round((stats.testeados / stats.total) * 100) : 0}%</p>
            <p className="text-[10px] text-white/30">Cobertura</p>
          </div>
        </div>

        {/* View tabs */}
        <div className="max-w-2xl mx-auto flex gap-1 p-1 rounded-xl bg-white/3 border border-white/8 mb-5">
          {(['matriz', 'gaps', 'ganadores'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${view === v ? 'bg-white/10 text-white' : 'text-white/30'}`}
            >
              {v === 'matriz' ? '📊 Matriz completa' : v === 'gaps' ? '🎯 Próximos tests' : '🏆 Ganadores'}
            </button>
          ))}
        </div>

        {/* MATRIZ VIEW */}
        {view === 'matriz' && (
          <div className="overflow-x-auto pb-4">
            <div className="min-w-max">
              {/* Header row */}
              <div className="flex gap-1.5 mb-1.5 ml-36">
                {AUDIENCIAS.map(aud => (
                  <div key={aud} className="w-32 text-center">
                    <p className="text-[10px] font-bold text-white/40 uppercase leading-tight px-1">{aud}</p>
                  </div>
                ))}
              </div>

              {/* Data rows */}
              {ANGULOS.map(angulo => (
                <div key={angulo} className="flex gap-1.5 mb-1.5 items-center">
                  <div className="w-36 flex-shrink-0">
                    <p className="text-xs font-bold text-white/60 text-right pr-3 leading-tight">{angulo}</p>
                  </div>
                  {AUDIENCIAS.map(audiencia => {
                    const cell = getCell(angulo, audiencia)
                    const cfg = ESTADO_CONFIG[cell.estado]
                    return (
                      <button
                        key={audiencia}
                        onClick={() => openEdit(angulo, audiencia)}
                        className={`w-32 h-16 rounded-xl border transition-all hover:scale-105 flex flex-col items-center justify-center gap-1 ${cfg.color}`}
                        title={`${angulo} × ${audiencia}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        {cell.roas ? (
                          <span className={`text-[10px] font-bold ${cell.roas >= 2.5 ? 'text-emerald-400' : cell.roas >= 1.8 ? 'text-amber-400' : 'text-red-400'}`}>
                            {cell.roas.toFixed(1)}x
                          </span>
                        ) : (
                          <span className={`text-[9px] ${cfg.textColor}`}>{cfg.label}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="max-w-2xl mt-4 flex gap-3 flex-wrap">
              {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className="text-[10px] text-white/40">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GAPS VIEW */}
        {view === 'gaps' && (
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="card p-4 border border-blue-500/20 bg-blue-500/5">
              <p className="text-blue-300 text-xs font-bold mb-1">🎯 Cómo priorizamos los gaps</p>
              <p className="text-white/40 text-xs leading-relaxed">Los primeros son combinaciones que ya tienen un ganador en el eje. Si un ángulo ganó con una audiencia, probarlo con otra audiencia tiene alta probabilidad de éxito.</p>
            </div>
            {topGaps.length > 0 ? (
              topGaps.map((gap, i) => (
                <div key={i} className="card p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center text-violet-300 font-bold text-sm flex-shrink-0">{i + 1}</div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{gap.angulo}</p>
                    <p className="text-white/40 text-xs">con audiencia: {gap.audiencia}</p>
                  </div>
                  <button
                    onClick={() => openEdit(gap.angulo, gap.audiencia)}
                    className="text-xs text-violet-400 font-semibold"
                  >
                    Registrar →
                  </button>
                </div>
              ))
            ) : (
              <p className="text-white/30 text-sm text-center py-8">No hay gaps — ¡cobertura completa!</p>
            )}
          </div>
        )}

        {/* GANADORES VIEW */}
        {view === 'ganadores' && (
          <div className="max-w-2xl mx-auto space-y-3">
            {allCells.filter(c => c.estado === 'ganador').length > 0 ? (
              allCells.filter(c => c.estado === 'ganador').map((cell, i) => (
                <div key={i} className="card p-4 border border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-emerald-300 font-bold text-sm">{cell.angulo}</p>
                    {cell.roas && <span className="text-emerald-400 font-bold">{cell.roas.toFixed(2)}x ROAS</span>}
                  </div>
                  <p className="text-white/40 text-xs">Audiencia: {cell.audiencia}</p>
                  {cell.notas && <p className="text-white/50 text-xs mt-2 italic">{cell.notas}</p>}
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-white/30 text-sm mb-2">Todavía no tenés combinaciones ganadoras registradas</p>
                <button onClick={() => setView('matriz')} className="text-violet-400 text-xs underline">Ir a la matriz y registrar resultados →</button>
              </div>
            )}
          </div>
        )}

        {/* Edit modal */}
        {editingCell && (
          <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 p-4">
            <div className="w-full max-w-lg bg-[#0c0c0c] rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">Registrar resultado</h3>
                <button onClick={() => setEditingCell(null)} className="text-white/40 hover:text-white/70">✕</button>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-white/40 text-xs mb-1">Estado del test</p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => setEditForm(f => ({ ...f, estado: key as Celda['estado'] }))}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                          editForm.estado === key ? cfg.color : 'border-white/10 text-white/30'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-white/40 text-xs mb-1">ROAS</p>
                    <input
                      type="number"
                      step="0.1"
                      className={ic}
                      placeholder="ej: 2.8"
                      value={editForm.roas || ''}
                      onChange={e => setEditForm(f => ({ ...f, roas: parseFloat(e.target.value) || undefined }))}
                    />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">CTR (%)</p>
                    <input
                      type="number"
                      step="0.01"
                      className={ic}
                      placeholder="ej: 2.5"
                      value={editForm.ctr || ''}
                      onChange={e => setEditForm(f => ({ ...f, ctr: parseFloat(e.target.value) || undefined }))}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-white/40 text-xs mb-1">Notas</p>
                  <input
                    type="text"
                    className={ic}
                    placeholder="observaciones importantes"
                    value={editForm.notas || ''}
                    onChange={e => setEditForm(f => ({ ...f, notas: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setEditingCell(null)} className="btn-secondary flex-1 py-3">Cancelar</button>
                <button onClick={saveEdit} className="btn-primary flex-1 py-3">Guardar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
