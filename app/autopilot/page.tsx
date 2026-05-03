'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

// ─── Tipos ───────────────────────────────────────────────
type Condicion = {
  metrica: 'roas' | 'cpa' | 'frecuencia' | 'tasa_entrega' | 'dias_sin_copy'
  operador: 'mayor_que' | 'menor_que' | 'igual_que'
  valor: number
  dias_consecutivos: number
}

type Accion = {
  tipo:
    | 'notificar'
    | 'pausar_campana'
    | 'escalar_presupuesto'
    | 'crear_copy'
    | 'ir_a_war_room'
    | 'ir_a_creativo'
  parametro?: string | number
}

type Regla = {
  id: string
  nombre: string
  activa: boolean
  prioridad: number
  condiciones: Condicion[]
  acciones: Accion[]
  ultima_activacion?: string
  veces_activada: number
  color: string
}

const METRICA_LABELS: Record<string, string> = {
  roas: 'ROAS', cpa: 'CPA (Gs.)', frecuencia: 'Frecuencia', tasa_entrega: 'Tasa entrega (%)', dias_sin_copy: 'Días sin nuevo copy',
}
const OP_LABELS: Record<string, string> = { mayor_que: '>', menor_que: '<', igual_que: '=' }
const ACCION_LABELS: Record<string, string> = {
  notificar: '🔔 Notificar en app',
  pausar_campana: '⏸️ Ir a pausar manualmente (⚠️ requiere Meta API)',
  escalar_presupuesto: '📈 Calcular escala y navegar',
  crear_copy: '✦ Abrir generador de copy',
  ir_a_war_room: '🔴 Ir al War Room',
  ir_a_creativo: '🎨 Ir a generador',
}

// Nota: Las acciones de Meta (pausar, escalar) navegan a la herramienta correspondiente
// La integración directa con Meta Marketing API está en /api/meta-connect (próximamente)
const ACCION_NAVEGAR: Record<string, string> = {
  pausar_campana: '/war-room',
  escalar_presupuesto: '/presupuesto-escalado',
  crear_copy: '/campana',
  ir_a_war_room: '/war-room',
  ir_a_creativo: '/crear',
}

const COLORES = ['border-emerald-500/30 bg-emerald-500/5', 'border-amber-500/30 bg-amber-500/5', 'border-red-500/30 bg-red-500/5', 'border-blue-500/30 bg-blue-500/5', 'border-violet-500/30 bg-violet-500/5']

const REGLAS_PREDEFINIDAS: Omit<Regla, 'id' | 'ultima_activacion' | 'veces_activada'>[] = [
  {
    nombre: '🚀 Escalar cuando ROAS es excelente',
    activa: true,
    prioridad: 1,
    color: COLORES[0],
    condiciones: [{ metrica: 'roas', operador: 'mayor_que', valor: 3.0, dias_consecutivos: 3 }],
    acciones: [
      { tipo: 'escalar_presupuesto', parametro: 25 },
      { tipo: 'notificar', parametro: 'ROAS > 3.0 por 3 días — se escaló 25%' },
      { tipo: 'crear_copy', parametro: 'Ángulo ganador — 3 variaciones nuevas' },
    ],
  },
  {
    nombre: '🔴 Pausar cuando ROAS es insostenible',
    activa: true,
    prioridad: 2,
    color: COLORES[2],
    condiciones: [{ metrica: 'roas', operador: 'menor_que', valor: 1.5, dias_consecutivos: 2 }],
    acciones: [
      { tipo: 'pausar_campana' },
      { tipo: 'notificar', parametro: 'ROAS < 1.5 por 2 días — campaña pausada' },
      { tipo: 'ir_a_war_room' },
    ],
  },
  {
    nombre: '⚠️ Alerta frecuencia alta',
    activa: true,
    prioridad: 3,
    color: COLORES[1],
    condiciones: [{ metrica: 'frecuencia', operador: 'mayor_que', valor: 3.0, dias_consecutivos: 1 }],
    acciones: [
      { tipo: 'notificar', parametro: 'Frecuencia > 3.0 — creativo quemado' },
      { tipo: 'crear_copy', parametro: 'Refrescar ángulo — ad fatigue detectado' },
    ],
  },
  {
    nombre: '📝 Recordatorio de copy nuevo',
    activa: true,
    prioridad: 4,
    color: COLORES[3],
    condiciones: [{ metrica: 'dias_sin_copy', operador: 'mayor_que', valor: 10, dias_consecutivos: 1 }],
    acciones: [
      { tipo: 'notificar', parametro: '+10 días sin generar nuevos copies' },
      { tipo: 'ir_a_creativo' },
    ],
  },
  {
    nombre: '📦 Alerta tasa de entrega baja',
    activa: false,
    prioridad: 5,
    color: COLORES[4],
    condiciones: [{ metrica: 'tasa_entrega', operador: 'menor_que', valor: 65, dias_consecutivos: 2 }],
    acciones: [
      { tipo: 'notificar', parametro: 'Tasa de entrega < 65% — revisar logística' },
      { tipo: 'ir_a_war_room' },
    ],
  },
]

const STORAGE_KEY = 'autopilot_reglas_v1'
const LOGS_KEY = 'autopilot_logs_v1'

type Log = { fecha: string; regla: string; accion: string; detalle?: string }

// ─── Simulación de evaluación ─────────────────────────────
function evaluarRegla(regla: Regla, metricas: Record<string, number>): boolean {
  return regla.condiciones.every(c => {
    const val = metricas[c.metrica]
    if (val === undefined) return false
    if (c.operador === 'mayor_que') return val > c.valor
    if (c.operador === 'menor_que') return val < c.valor
    return Math.abs(val - c.valor) < 0.01
  })
}

export default function AutopilotPage() {
  const [reglas, setReglas] = useState<Regla[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [tab, setTab] = useState<'reglas' | 'simular' | 'logs'>('reglas')
  const [editando, setEditando] = useState<Regla | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [metricas, setMetricas] = useState({ roas: '', cpa: '', frecuencia: '', tasa_entrega: '', dias_sin_copy: '' })
  const [simResult, setSimResult] = useState<Array<{ regla: string; activa: boolean; acciones: string[] }>>([])
  const [nuevaRegla, setNuevaRegla] = useState({ nombre: '', metrica: 'roas', operador: 'mayor_que', valor: '', dias: '1', acciones: [] as string[] })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY)
      if (s) {
        setReglas(JSON.parse(s))
      } else {
        const init = REGLAS_PREDEFINIDAS.map((r, i) => ({ ...r, id: `r${i}`, veces_activada: 0 }))
        setReglas(init)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(init))
      }
      const l = localStorage.getItem(LOGS_KEY)
      if (l) setLogs(JSON.parse(l))
    } catch {}
  }, [])

  const saveReglas = (newReglas: Regla[]) => {
    setReglas(newReglas)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newReglas))
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const toggleRegla = (id: string) => {
    saveReglas(reglas.map(r => r.id === id ? { ...r, activa: !r.activa } : r))
  }

  const simular = () => {
    const met: Record<string, number> = {}
    Object.entries(metricas).forEach(([k, v]) => { if (v) met[k] = parseFloat(v) })
    const results = reglas
      .filter(r => r.activa)
      .map(r => ({
        regla: r.nombre,
        activa: evaluarRegla(r, met),
        acciones: r.acciones.map(a => `${ACCION_LABELS[a.tipo]}${a.parametro ? ` — ${a.parametro}` : ''}`),
      }))
    setSimResult(results)
  }

  const crearRegla = () => {
    if (!nuevaRegla.nombre || !nuevaRegla.valor) return
    const r: Regla = {
      id: `r${Date.now()}`,
      nombre: nuevaRegla.nombre,
      activa: true,
      prioridad: reglas.length + 1,
      veces_activada: 0,
      color: COLORES[reglas.length % COLORES.length],
      condiciones: [{
        metrica: nuevaRegla.metrica as Condicion['metrica'],
        operador: nuevaRegla.operador as Condicion['operador'],
        valor: parseFloat(nuevaRegla.valor),
        dias_consecutivos: parseInt(nuevaRegla.dias) || 1,
      }],
      acciones: nuevaRegla.acciones.map(a => ({ tipo: a as Accion['tipo'] })),
    }
    saveReglas([...reglas, r])
    setShowNew(false)
    setNuevaRegla({ nombre: '', metrica: 'roas', operador: 'mayor_que', valor: '', dias: '1', acciones: [] })
  }

  const ic = 'w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/50'
  const lc = 'block text-xs text-white/40 mb-1'

  const activasCount = reglas.filter(r => r.activa).length

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <Link href="/gestionar" className="text-white/30 hover:text-white/60 text-sm flex items-center gap-1.5 mb-4 transition-colors">← Gestionar</Link>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">🤖 Modo Autopilot</h1>
            <span className="tag tag-violet text-[10px]">Nuevo</span>
          </div>
          <p className="text-white/40 text-sm">Reglas automáticas que cuidan tus campañas mientras vos descansás</p>
        </div>

        {/* Estado global */}
        <div className="card p-4 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${activasCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
            <div>
              <p className="text-white font-bold text-sm">
                {activasCount > 0 ? `${activasCount} reglas activas` : 'Autopilot desactivado'}
              </p>
              <p className="text-white/30 text-xs">
                {activasCount > 0 ? 'Monitoreando tus métricas' : 'Activá al menos una regla'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className="text-emerald-400 text-xs">✓ Guardado</span>}
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${activasCount > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/40'}`}>
              {activasCount}/{reglas.length}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-white/8 mb-5">
          {([
            { id: 'reglas', label: '⚙️ Reglas' },
            { id: 'simular', label: '🧪 Simular' },
            { id: 'logs', label: '📋 Historial' },
          ] as { id: typeof tab; label: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-white/10 text-white' : 'text-white/30'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB: REGLAS */}
        {tab === 'reglas' && (
          <div className="space-y-3">
            <div className="card p-3 border border-blue-500/15 bg-blue-500/5">
              <p className="text-blue-300 text-[10px] leading-relaxed">
                💡 Estas reglas se evalúan cuando abrís la app o cuando actualizás las métricas del War Room. Cuando una condición se cumple, se ejecutan las acciones definidas.
              </p>
            </div>

            {reglas.map(regla => (
              <div key={regla.id} className={`card p-4 border ${regla.activa ? regla.color : 'border-white/8 opacity-60'}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">{regla.nombre}</p>
                    <p className="text-white/30 text-[10px] mt-0.5">
                      Activada {regla.veces_activada} veces
                      {regla.ultima_activacion ? ` · Última: ${regla.ultima_activacion}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleRegla(regla.id)}
                    className={`w-12 h-6 rounded-full transition-all flex-shrink-0 relative ${regla.activa ? 'bg-emerald-500' : 'bg-white/15'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${regla.activa ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                {/* Condición */}
                <div className="mb-2">
                  <p className="text-white/25 text-[9px] uppercase font-bold mb-1">SI</p>
                  {regla.condiciones.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-white/70 text-xs font-mono bg-white/5 px-2 py-0.5 rounded">{METRICA_LABELS[c.metrica]}</span>
                      <span className="text-white/40 text-xs">{OP_LABELS[c.operador]}</span>
                      <span className="text-white/70 text-xs font-mono bg-white/5 px-2 py-0.5 rounded">{c.valor}</span>
                      {c.dias_consecutivos > 1 && (
                        <span className="text-white/40 text-[10px]">por {c.dias_consecutivos} días</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Acciones */}
                <div>
                  <p className="text-white/25 text-[9px] uppercase font-bold mb-1">ENTONCES</p>
                  <div className="space-y-1">
                    {regla.acciones.map((a, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-white/60">{ACCION_LABELS[a.tipo]}</span>
                        {a.parametro && <span className="text-white/30 text-[10px]">{a.parametro}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Nueva regla */}
            {!showNew ? (
              <button
                onClick={() => setShowNew(true)}
                className="w-full py-3 border border-dashed border-white/15 rounded-2xl text-white/40 text-sm hover:border-white/30 hover:text-white/60 transition-all"
              >
                + Crear regla personalizada
              </button>
            ) : (
              <div className="card p-5 border border-violet-500/30 bg-violet-500/5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-white font-bold text-sm">Nueva regla</p>
                  <button onClick={() => setShowNew(false)} className="text-white/30 hover:text-white/60">✕</button>
                </div>

                <div>
                  <label className={lc}>Nombre de la regla</label>
                  <input type="text" className={ic} placeholder="ej: Escalar si ROAS > 4x"
                    value={nuevaRegla.nombre} onChange={e => setNuevaRegla(n => ({ ...n, nombre: e.target.value }))} />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={lc}>Métrica</label>
                    <select className={ic} value={nuevaRegla.metrica}
                      onChange={e => setNuevaRegla(n => ({ ...n, metrica: e.target.value }))}>
                      {Object.entries(METRICA_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lc}>Condición</label>
                    <select className={ic} value={nuevaRegla.operador}
                      onChange={e => setNuevaRegla(n => ({ ...n, operador: e.target.value }))}>
                      <option value="mayor_que">Mayor que</option>
                      <option value="menor_que">Menor que</option>
                    </select>
                  </div>
                  <div>
                    <label className={lc}>Valor</label>
                    <input type="number" className={ic} placeholder="ej: 3.5"
                      value={nuevaRegla.valor} onChange={e => setNuevaRegla(n => ({ ...n, valor: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className={lc}>Por N días consecutivos</label>
                  <input type="number" className={ic} placeholder="1" min="1" max="14"
                    value={nuevaRegla.dias} onChange={e => setNuevaRegla(n => ({ ...n, dias: e.target.value }))} />
                </div>

                <div>
                  <label className={lc}>Acciones (seleccioná todas las que apliquen)</label>
                  <div className="space-y-1.5">
                    {Object.entries(ACCION_LABELS).map(([k, v]) => (
                      <button
                        key={k}
                        onClick={() => setNuevaRegla(n => ({
                          ...n,
                          acciones: n.acciones.includes(k) ? n.acciones.filter(a => a !== k) : [...n.acciones, k],
                        }))}
                        className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition-all ${
                          nuevaRegla.acciones.includes(k)
                            ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                            : 'border-white/8 text-white/40 hover:border-white/20'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={crearRegla} className="btn-primary w-full py-3">Crear regla</button>
              </div>
            )}
          </div>
        )}

        {/* TAB: SIMULAR */}
        {tab === 'simular' && (
          <div className="space-y-4">
            <div className="card p-4 border border-amber-500/20 bg-amber-500/5">
              <p className="text-amber-300 text-xs font-bold mb-1">🧪 Simulador de reglas</p>
              <p className="text-white/40 text-xs">Ingresá las métricas actuales de tus campañas para ver qué reglas se activarían.</p>
            </div>

            <div className="card p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'roas', label: 'ROAS actual', placeholder: '2.5' },
                  { key: 'frecuencia', label: 'Frecuencia', placeholder: '2.1' },
                  { key: 'cpa', label: 'CPA (Gs.)', placeholder: '85000' },
                  { key: 'tasa_entrega', label: 'Tasa entrega (%)', placeholder: '78' },
                  { key: 'dias_sin_copy', label: 'Días sin copy nuevo', placeholder: '8' },
                ].map(f => (
                  <div key={f.key}>
                    <label className={lc}>{f.label}</label>
                    <input type="number" className={ic} placeholder={f.placeholder}
                      value={metricas[f.key as keyof typeof metricas]}
                      onChange={e => setMetricas(m => ({ ...m, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <button onClick={simular} className="btn-primary w-full py-3">🧪 Simular ahora</button>
            </div>

            {simResult.length > 0 && (
              <div className="space-y-2">
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Resultado de la simulación</p>
                {simResult.map((r, i) => (
                  <div
                    key={i}
                    className={`card p-4 border ${r.activa ? 'border-red-500/40 bg-red-500/5' : 'border-white/8 opacity-50'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${r.activa ? 'bg-red-400 animate-pulse' : 'bg-white/20'}`} />
                      <p className={`text-sm font-bold ${r.activa ? 'text-white' : 'text-white/40'}`}>{r.regla}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${r.activa ? 'bg-red-500/20 text-red-300' : 'bg-white/8 text-white/25'}`}>
                        {r.activa ? '🔥 Se activaría' : 'No aplica'}
                      </span>
                    </div>
                    {r.activa && (
                      <div className="space-y-1">
                        {r.acciones.map((a, j) => (
                          <p key={j} className="text-white/60 text-xs">→ {a}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: LOGS */}
        {tab === 'logs' && (
          <div className="space-y-3">
            {logs.length > 0 ? (
              logs.slice(0, 20).map((log, i) => (
                <div key={i} className="card p-3 flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-white text-xs font-bold">{log.regla}</p>
                    <p className="text-white/50 text-xs">{log.accion}</p>
                    {log.detalle && <p className="text-white/25 text-[10px] mt-0.5">{log.detalle}</p>}
                  </div>
                  <span className="text-white/20 text-[10px] flex-shrink-0">{log.fecha}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-white/30 text-sm mb-1">Sin activaciones aún</p>
                <p className="text-white/20 text-xs">Las reglas se registran acá cuando se activan</p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
