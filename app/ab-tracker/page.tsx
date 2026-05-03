'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import { getPaisConfig } from '@/lib/constants'

type Variant = {
  id: string
  nombre: string
  framework?: string
  angulo?: string
  nivel_conciencia?: number
  hook?: string
  titular: string
  cuerpo: string
  cta: string
  impresiones: number
  clicks: number
  conversiones: number
  gasto: number
  ingresos: number
  ctr: number
  cpa: number
  roas: number
  estado: 'en_prueba' | 'ganadora' | 'perdedora' | 'pausada'
}

type Campaign = {
  id: string
  nombre: string
  plataforma: string
  estado: string
  fecha_inicio: string
  presupuesto_total?: number
  notas?: string
  ab_variants: Variant[]
  products?: { name: string }
}

const estadoColor: Record<string, string> = {
  en_prueba: 'tag-gray', ganadora: 'tag-green', perdedora: 'tag-red', pausada: 'tag-gold',
}
const campanaColor: Record<string, string> = {
  activa: 'tag-green', pausada: 'tag-gold', finalizada: 'tag-gray',
}

function MetricCard({ label, value, sub, color = 'text-white' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="card p-3 text-center">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-white/30 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-white/20">{sub}</p>}
    </div>
  )
}

function VariantRow({ v, onUpdate }: { v: Variant; onUpdate: (id: string, data: Partial<Variant>) => void }) {
  const [editing, setEditing] = useState(false)
  const [metrics, setMetrics] = useState({ impresiones: v.impresiones, clicks: v.clicks, conversiones: v.conversiones, gasto: v.gasto, ingresos: v.ingresos })
  const [estado, setEstado] = useState(v.estado)
  const [saving, setSaving] = useState(false)

  const ctr = metrics.impresiones > 0 ? ((metrics.clicks / metrics.impresiones) * 100).toFixed(2) : '—'
  const cpa = metrics.conversiones > 0 ? (metrics.gasto / metrics.conversiones).toFixed(2) : '—'
  const roas = metrics.gasto > 0 ? (metrics.ingresos / metrics.gasto).toFixed(2) : '—'

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/ab-tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_metrics', variant_id: v.id, ...metrics, estado }),
    })
    onUpdate(v.id, { ...metrics, estado })
    setSaving(false)
    setEditing(false)
  }

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-violet-500'

  return (
    <div className={`card p-4 border ${v.estado === 'ganadora' ? 'border-emerald-500/30 bg-emerald-500/5' : v.estado === 'perdedora' ? 'border-red-500/20' : 'border-white/8'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`tag ${estadoColor[v.estado]} text-[10px]`}>{v.estado.replace('_', ' ')}</span>
            {v.framework && <span className="tag tag-violet text-[10px]">{v.framework}</span>}
            {v.nivel_conciencia && <span className="tag tag-gray text-[10px]">Nivel {v.nivel_conciencia}</span>}
          </div>
          {v.hook && <p className="text-white font-bold text-sm mb-1">"{v.hook}"</p>}
          <p className="text-white/70 text-xs font-medium">{v.titular}</p>
          {v.angulo && <p className="text-white/30 text-[10px] mt-0.5">Ángulo: {v.angulo}</p>}
            {v.created_at && (() => {
              const _days = Math.floor((Date.now() - new Date(v.created_at).getTime()) / 86400000)
              const _fz = getFatigueZone(_days)
              return <span className={`inline-flex items-center gap-1 text-[10px] mt-1.5 ${_fz.color}`} title={_fz.nota}>⏱ {_days}d · {_fz.label}</span>
            })()}
        </div>
        <button onClick={() => setEditing(!editing)} className="btn-ghost text-white/40 text-xs flex-shrink-0">
          {editing ? 'Cancelar' : '✎ Métricas'}
        </button>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
        <MetricCard label="Impresiones" value={v.impresiones.toLocaleString()} />
        <MetricCard label="Clicks" value={v.clicks.toLocaleString()} />
        <MetricCard label="CTR" value={`${ctr}%`} color={parseFloat(String(ctr)) > 2 ? 'text-emerald-400' : 'text-white'} />
        <MetricCard label="Conversiones" value={v.conversiones} />
        <MetricCard label="CPA" value={cpa !== '—' ? `Gs. ${Math.round(parseFloat(cpa) * 6350).toLocaleString("es-PY")}` : '—'} color="text-amber-400" />
        <MetricCard label="ROAS" value={roas !== '—' ? `${roas}x` : '—'} color={parseFloat(String(roas)) >= 2 ? 'text-emerald-400' : 'text-white'} />
      </div>

      {editing && (
        <div className="bg-white/3 border border-white/8 rounded-lg p-4 space-y-3">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Actualizar métricas</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(['impresiones', 'clicks', 'conversiones', 'gasto', 'ingresos']).map(key => (
              <div key={key}>
                <label className="block text-[10px] text-white/30 mb-1 capitalize">{key}</label>
                <input type="number" className={inputClass} value={metrics[key]}
                  onChange={e => setMetrics(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))} />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-[10px] text-white/30 mb-1">Estado</label>
              <select className={inputClass} value={estado} onChange={e => setEstado(e.target.value as Variant['estado'])}>
                <option value="en_prueba">En prueba</option>
                <option value="ganadora">Ganadora 🏆</option>
                <option value="perdedora">Perdedora</option>
                <option value="pausada">Pausada</option>
              </select>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-xs px-4 py-2 mt-4">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


// GAP #9 fix: Calcular zona de fatiga según días activo
function getFatigueZone(diasActivo: number): { label: string; color: string; nota: string } {
  if (diasActivo <= 3) return { label: 'Aprendizaje', color: 'text-blue-400', nota: 'Meta Ads está aprendiendo. No toqués el presupuesto.' }
  if (diasActivo <= 7) return { label: 'Pico', color: 'text-emerald-400', nota: 'Zona de máximo rendimiento. Escalá si el ROAS lo permite.' }
  if (diasActivo <= 14) return { label: 'Estable', color: 'text-amber-400', nota: 'Rendimiento puede empezar a bajar. Preparate para rotar.' }
  if (diasActivo <= 21) return { label: 'Fatiga', color: 'text-orange-400', nota: 'Creativos en zona de fatiga. Empezá a testear reemplazos.' }
  return { label: 'Saturado', color: 'text-red-400', nota: 'Rotá este creativo YA. Creá variante nueva urgente.' }
}

export default function ABTrackerPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showNewCampaign, setShowNewCampaign] = useState(false)
  const [newCampaign, setNewCampaign] = useState({ nombre: '', plataforma: 'meta', presupuesto_total: '', notas: '' })
  const [creating, setCreating] = useState(false)

  const loadCampaigns = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/ab-tracker?action=campaigns')
    const data = await res.json()
    setCampaigns(data)
    setLoading(false)
  }, [])

  useEffect(() => { loadCampaigns() }, [loadCampaigns])

  const handleCreateCampaign = async () => {
    if (!newCampaign.nombre.trim()) return
    setCreating(true)
    await fetch('/api/ab-tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_campaign', ...newCampaign, presupuesto_total: parseFloat(newCampaign.presupuesto_total) || null }),
    })
    await loadCampaigns()
    setShowNewCampaign(false)
    setNewCampaign({ nombre: '', plataforma: 'meta', presupuesto_total: '', notas: '' })
    setCreating(false)
  }

  const handleVariantUpdate = (variantId: string, data: Partial<Variant>) => {
    setCampaigns(prev => prev.map(c => ({
      ...c,
      ab_variants: c.ab_variants.map(v => v.id === variantId ? { ...v, ...data } : v),
    })))
    if (selectedCampaign) {
      setSelectedCampaign(prev => prev ? {
        ...prev,
        ab_variants: prev.ab_variants.map(v => v.id === variantId ? { ...v, ...data } : v),
      } : null)
    }
  }

  const inputClass = 'input text-sm'
  const labelClass = 'block text-xs font-medium text-white/40 mb-1.5'

  // Global stats
  const totalVariants = campaigns.reduce((s, c) => s + (c.ab_variants?.length || 0), 0)
  const ganadores = campaigns.reduce((s, c) => s + (c.ab_variants?.filter(v => v.estado === 'ganadora').length || 0), 0)
  const totalConversiones = campaigns.reduce((s, c) => s + c.ab_variants.reduce((sv, v) => sv + v.conversiones, 0), 0)
  const totalIngresos = campaigns.reduce((s, c) => s + c.ab_variants.reduce((sv, v) => sv + v.ingresos, 0), 0)

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">A/B Tracker</h1>
            <p className="text-white/40 text-sm mt-1">Registrá qué copies usaste, sus métricas y aprendé qué funciona</p>
          </div>
          <button onClick={() => setShowNewCampaign(true)} className="btn-primary text-sm">
            + Nueva campaña
          </button>
        </div>

        {/* Global stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <MetricCard label="Campañas" value={campaigns.length} color="text-violet-400" />
          <MetricCard label="Variantes testeadas" value={totalVariants} color="text-white" />
          <MetricCard label="Copies ganadores" value={ganadores} color="text-emerald-400" />
          <MetricCard label="Ingresos trackeados" value={`Gs. ${Math.round(totalIngresos * 6350).toLocaleString("es-PY")}`} /* TODO: usar getPaisConfig */ color="text-amber-400" sub={`${totalConversiones} conversiones`} />
        </div>

        {/* New campaign modal */}
        {showNewCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
            <div className="card w-full max-w-md animate-fade-up">
              <div className="flex items-center justify-between p-5 border-b border-white/8">
                <h2 className="font-semibold text-white">Nueva campaña A/B</h2>
                <button onClick={() => setShowNewCampaign(false)} className="btn-ghost text-white/40 p-1.5">✕</button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className={labelClass}>Nombre de la campaña *</label>
                  <input className={inputClass} value={newCampaign.nombre} onChange={e => setNewCampaign(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Crema hidratante — Agosto 2025" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Plataforma</label>
                    <select className={inputClass} value={newCampaign.plataforma} onChange={e => setNewCampaign(p => ({ ...p, plataforma: e.target.value }))}>
                      <option value="meta">Meta Ads</option>
                      <option value="tiktok">TikTok Ads</option>
                      <option value="google">Google Ads</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Presupuesto total (USD)</label>
                    <input className={inputClass} type="number" value={newCampaign.presupuesto_total} onChange={e => setNewCampaign(p => ({ ...p, presupuesto_total: e.target.value }))} placeholder="150 (USD) o Gs. 952.500" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Notas</label>
                  <textarea className={`${inputClass} resize-none h-16`} value={newCampaign.notas} onChange={e => setNewCampaign(p => ({ ...p, notas: e.target.value }))} placeholder="Contexto, producto, objetivo..." />
                </div>
              </div>
              <div className="flex gap-3 p-5 border-t border-white/8">
                <button onClick={() => setShowNewCampaign(false)} className="btn-secondary flex-1">Cancelar</button>
                <button onClick={handleCreateCampaign} disabled={creating || !newCampaign.nombre.trim()} className="btn-primary flex-1">
                  {creating ? 'Creando...' : 'Crear campaña'}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 card shimmer rounded-xl" />)}</div>
        ) : campaigns.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-4">📊</p>
            <p className="text-white/50 font-medium mb-2">No hay campañas aún</p>
            <p className="text-white/25 text-sm mb-6">Creá tu primera campaña para empezar a trackear tus A/B tests</p>
            <button onClick={() => setShowNewCampaign(true)} className="btn-primary">+ Crear primera campaña</button>
          </div>
        ) : selectedCampaign ? (
          <div className="space-y-4">
            <button onClick={() => setSelectedCampaign(null)} className="btn-ghost text-white/40">← Volver a campañas</button>
            <div className="card p-4 flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold">{selectedCampaign.nombre}</h2>
                <div className="flex gap-2 mt-1">
                  <span className={`tag ${campanaColor[selectedCampaign.estado]} text-[10px]`}>{selectedCampaign.estado}</span>
                  <span className="tag tag-gray text-[10px]">{selectedCampaign.plataforma}</span>
                  {selectedCampaign.presupuesto_total && <span className="tag tag-gray text-[10px]">${selectedCampaign.presupuesto_total} presupuesto</span>}
                </div>
              </div>
              <span className="text-white/25 text-xs">{selectedCampaign.ab_variants?.length || 0} variantes</span>
            </div>
            {selectedCampaign.ab_variants?.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-white/30 text-sm">No hay variantes en esta campaña.</p>
                <p className="text-white/20 text-xs mt-1">Las variantes se agregan desde los resultados de generación.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedCampaign.ab_variants.map(v => (
                  <VariantRow key={v.id} v={v} onUpdate={handleVariantUpdate} />
                ))}

                {/* ── LOOP: Copy ganador → Generar variaciones ── */}
                {(() => {
                  const winner = selectedCampaign.ab_variants.find(v => v.estado === 'ganadora')
                  if (!winner) return null
                  const roasWinner = winner.roas || 0
                  const winnerAngulo = winner.angulo || 'sin ángulo definido'
                  const winnerHook = winner.hook || winner.titular?.slice(0, 60) || ''
                  const winnerRoas = roasWinner > 0 ? ` · ROAS ${roasWinner.toFixed(2)}x` : ''

                  // Build deep-link to campaign generator with winner context
                  const params = new URLSearchParams({
                    winner_angulo: winnerAngulo,
                    winner_hook: winnerHook,
                    winner_framework: winner.framework || '',
                    campana_origen: selectedCampaign.nombre,
                    modo: 'variaciones_ganadora',
                  })

                  return (
                    <div className="card p-5 border border-emerald-500/30 bg-emerald-500/5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🏆</span>
                        <div>
                          <p className="text-emerald-300 font-bold text-sm">Variante ganadora detectada{winnerRoas}</p>
                          <p className="text-white/40 text-xs">Ángulo: {winnerAngulo}</p>
                        </div>
                      </div>

                      {/* Winner copy preview */}
                      <div className="p-3 rounded-xl bg-white/3 border border-white/8 mb-4">
                        {winner.hook && (
                          <p className="text-white/80 text-xs font-bold mb-1">"{winner.hook}"</p>
                        )}
                        <p className="text-white/60 text-xs">{winner.titular}</p>
                        {winner.cuerpo && (
                          <p className="text-white/30 text-[10px] mt-1 line-clamp-2">{winner.cuerpo.slice(0, 120)}...</p>
                        )}
                      </div>

                      {/* Insight */}
                      <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 mb-4">
                        <p className="text-emerald-300 text-[10px] font-bold mb-1">💡 Qué hacer ahora</p>
                        <p className="text-white/50 text-xs leading-relaxed">
                          El ángulo <strong className="text-white/70">"{winnerAngulo}"</strong> ganó este A/B test.
                          Generá 3 variaciones del mismo ángulo con distintos hooks — el algoritmo te va a dar más volumen con la misma tasa de conversión.
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`/campana?${params.toString()}`}
                          className="btn-primary text-center text-xs py-3"
                        >
                          ✦ Generar 3 variaciones →
                        </a>
                        <a
                          href={`/matriz-creativos?angulo=${encodeURIComponent(winnerAngulo)}`}
                          className="btn-secondary text-center text-xs py-3"
                        >
                          🔢 Ver en matriz
                        </a>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {campaigns.map(c => {
              const totalImpr = c.ab_variants?.reduce((s, v) => s + v.impresiones, 0) || 0
              const totalConv = c.ab_variants?.reduce((s, v) => s + v.conversiones, 0) || 0
              const winner = c.ab_variants?.find(v => v.estado === 'ganadora')
              return (
                <button key={c.id} onClick={() => setSelectedCampaign(c)}
                  className="w-full text-left card card-hover rounded-xl p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{c.nombre}</span>
                      <span className={`tag ${campanaColor[c.estado]} text-[10px]`}>{c.estado}</span>
                      <span className="tag tag-gray text-[10px]">{c.plataforma}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/30">
                      <span>{c.ab_variants?.length || 0} variantes</span>
                      <span>{totalImpr.toLocaleString()} impresiones</span>
                      <span>{totalConv} conversiones</span>
                      {winner && <span className="text-emerald-400">🏆 {winner.titular.slice(0, 30)}...</span>}
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white/20 flex-shrink-0">
                    <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
