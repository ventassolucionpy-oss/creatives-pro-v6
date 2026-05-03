'use client'
export const dynamic = 'force-dynamic'
import { useState, useMemo, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

type AlertLevel = 'critica' | 'advertencia' | 'info'
type AlertCategory = 'roas' | 'cpa' | 'frecuencia' | 'contenido' | 'entrega' | 'presupuesto' | 'campana'

type Alert = {
  id: string
  nivel: AlertLevel
  categoria: AlertCategory
  titulo: string
  descripcion: string
  accion: string
  link?: string
  linkLabel?: string
  fecha: string
  leida: boolean
  activa: boolean
}

type MetricInput = {
  roas_actual: string
  roas_semana_pasada: string
  cpa_actual: string
  cpa_objetivo: string
  frecuencia: string
  dias_sin_generar: string
  gasto_hoy: string
  presupuesto_diario: string
  tasa_entrega: string
  dias_campana_activa: string
}

function generateAlerts(metrics: MetricInput): Alert[] {
  const alerts: Alert[] = []
  const now = new Date().toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  const roas = parseFloat(metrics.roas_actual)
  const roasPasado = parseFloat(metrics.roas_semana_pasada)
  const cpa = parseFloat(metrics.cpa_actual)
  const cpaObj = parseFloat(metrics.cpa_objetivo)
  const frec = parseFloat(metrics.frecuencia)
  const diasSinGen = parseInt(metrics.dias_sin_generar)
  const gasto = parseFloat(metrics.gasto_hoy)
  const presupuesto = parseFloat(metrics.presupuesto_diario)
  const entrega = parseFloat(metrics.tasa_entrega)
  const diasCampana = parseInt(metrics.dias_campana_activa)

  // 1. ROAS caída brusca
  if (roas && roasPasado && roasPasado > 0) {
    const caida = ((roasPasado - roas) / roasPasado) * 100
    if (caida >= 40) {
      alerts.push({
        id: 'roas-caida', nivel: 'critica', categoria: 'roas',
        titulo: `🔴 ROAS cayó ${caida.toFixed(0)}% esta semana`,
        descripcion: `Pasó de ${roasPasado.toFixed(2)}x a ${roas.toFixed(2)}x. Caída brusca — actuá hoy.`,
        accion: 'Revisá el creativo, la frecuencia y la audiencia. Si la frecuencia superó 3.0, refrescá el creativo ya.',
        link: '/war-room', linkLabel: 'Ir al War Room',
      link2: '/portfolio', linkLabel2: 'Ver Portfolio',
        fecha: now, leida: false, activa: true,
      })
    } else if (caida >= 20) {
      alerts.push({
        id: 'roas-baja', nivel: 'advertencia', categoria: 'roas',
        titulo: `🟡 ROAS bajando — ${caida.toFixed(0)}% menos que la semana pasada`,
        descripcion: `De ${roasPasado.toFixed(2)}x a ${roas.toFixed(2)}x. Tendencia negativa.`,
        accion: 'Monitoreá por 48h más. Si sigue bajando, refrescá el creativo o cambiá la audiencia.',
        link: '/copy-intelligence', linkLabel: 'Ver Copy Intelligence',
        fecha: now, leida: false, activa: true,
      })
    }
  }

  // 2. ROAS por debajo del mínimo
  if (roas && roas < 2.0) {
    alerts.push({
      id: 'roas-minimo', nivel: 'critica', categoria: 'roas',
      titulo: '🔴 ROAS por debajo del break-even',
      descripcion: `ROAS actual: ${roas.toFixed(2)}x. Con los costos de Paraguay COD, el mínimo para no perder plata es ~2.2x.`,
      accion: 'Pausá la campaña o bajá el presupuesto a mínimo mientras testás un nuevo creativo.',
      link: '/war-room', linkLabel: 'Decidir en War Room',
      link2: '/kpis', linkLabel2: 'Ver KPIs',
      fecha: now, leida: false, activa: true,
    })
  }

  // 3. CPA superó el objetivo
  if (cpa && cpaObj && cpa > cpaObj * 1.3) {
    const exceso = ((cpa - cpaObj) / cpaObj * 100).toFixed(0)
    alerts.push({
      id: 'cpa-alto', nivel: 'advertencia', categoria: 'cpa',
      titulo: `🟡 CPA ${exceso}% por encima del objetivo`,
      descripcion: `CPA actual: Gs. ${Math.round(cpa).toLocaleString('es-PY')}. Objetivo: Gs. ${Math.round(cpaObj).toLocaleString('es-PY')}.`,
      accion: 'Revisá la segmentación. Un CPA alto suele ser audiencia demasiado amplia o un hook débil.',
      link: '/meta-tracker', linkLabel: 'Analizar con Meta Tracker',
      link2: '/postmortem', linkLabel2: 'Hacer Post-mortem',
      fecha: now, leida: false, activa: true,
    })
  }

  // 4. Frecuencia alta
  if (frec && frec >= 3.5) {
    alerts.push({
      id: 'frecuencia-alta', nivel: 'critica', categoria: 'frecuencia',
      titulo: `🔴 Frecuencia en ${frec.toFixed(1)} — fatiga creativa`,
      descripcion: 'Por encima de 3.5, el ROAS empieza a caer porque la misma persona vio el anuncio muchas veces.',
      accion: 'Lanzá un nuevo creativo HOY con hook diferente o pausá la campaña 3 días.',
      link: '/creativos/ugc/anuncios', linkLabel: 'Generar nuevo creativo',
      fecha: now, leida: false, activa: true,
    })
  } else if (frec && frec >= 2.8) {
    alerts.push({
      id: 'frecuencia-media', nivel: 'advertencia', categoria: 'frecuencia',
      titulo: `🟡 Frecuencia en ${frec.toFixed(1)} — preparate para refreshear`,
      descripcion: 'Todavía no es urgente, pero en 2-3 días vas a necesitar un creativo nuevo.',
      accion: 'Empezá a preparar el próximo creativo para tenerlo listo antes de que sature.',
      link: '/campana', linkLabel: 'Generar nueva campaña',
      fecha: now, leida: false, activa: true,
    })
  }

  // 5. Sin generar contenido
  if (diasSinGen && diasSinGen >= 7) {
    alerts.push({
      id: 'sin-generar', nivel: diasSinGen >= 14 ? 'critica' : 'advertencia', categoria: 'contenido',
      titulo: `${diasSinGen >= 14 ? '🔴' : '🟡'} ${diasSinGen} días sin generar contenido nuevo`,
      descripcion: 'Las campañas que no se alimentan con nuevo contenido se apagan solas.',
      accion: 'Generá al menos un copy nuevo hoy — campana completa o UGC anuncios.',
      link: '/campana', linkLabel: 'Crear nueva campaña',
      fecha: now, leida: false, activa: true,
    })
  }

  // 6. Tasa de entrega baja
  if (entrega && entrega < 65) {
    alerts.push({
      id: 'entrega-baja', nivel: 'critica', categoria: 'entrega',
      titulo: `🔴 Tasa de entrega: ${entrega.toFixed(0)}% — muy por debajo del promedio`,
      descripcion: 'El promedio Paraguay COD es 70-80%. Por debajo de 65% estás perdiendo plata en fletes sin cobrar.',
      accion: 'Revisá los pedidos rechazados. ¿El perfil del comprador es correcto? ¿El precio crea fricción al cobrar?',
      link: '/pedidos', linkLabel: 'Ver pedidos COD',
      fecha: now, leida: false, activa: true,
    })
  } else if (entrega && entrega < 72) {
    alerts.push({
      id: 'entrega-media', nivel: 'advertencia', categoria: 'entrega',
      titulo: `🟡 Tasa de entrega: ${entrega.toFixed(0)}% — por debajo del promedio`,
      descripcion: 'Podría mejorar. Verificá si los mensajes de confirmación están saliendo a tiempo.',
      accion: 'Mejorá el flujo de WhatsApp de confirmación del pedido.',
      link: '/whatsapp-biz', linkLabel: 'WhatsApp Business',
      fecha: now, leida: false, activa: true,
    })
  }

  // 7. Presupuesto casi agotado
  if (gasto && presupuesto && (gasto / presupuesto) >= 0.85) {
    alerts.push({
      id: 'presupuesto-bajo', nivel: 'advertencia', categoria: 'presupuesto',
      titulo: '🟡 Gastaste el 85%+ del presupuesto diario',
      descripcion: 'Si el ROAS está bien, considerá aumentar el budget para no perder el momentum del algoritmo.',
      accion: 'Si ROAS ≥ 3x, subí 20% el presupuesto diario antes del anochecer.',
      link: '/presupuesto-escalado', linkLabel: 'Calculadora de escalado',
      fecha: now, leida: false, activa: true,
    })
  }

  // 8. Campaña larga sin optimización
  if (diasCampana && diasCampana >= 21 && roas && roas < 2.5) {
    alerts.push({
      id: 'campana-vieja', nivel: 'advertencia', categoria: 'campana',
      titulo: `🟡 Campaña de ${diasCampana} días con ROAS bajo — hora del post-mortem`,
      descripcion: 'Una campaña de 3+ semanas con ROAS bajo suele necesitar un reseteo completo.',
      accion: 'Hacé el post-mortem, extraé los aprendizajes y lanzá una campaña nueva desde cero.',
      link: '/postmortem', linkLabel: 'Hacer post-mortem',
      fecha: now, leida: false, activa: true,
    })
  }

  // 9. Todo bien
  if (alerts.length === 0 && roas && roas >= 3) {
    alerts.push({
      id: 'todo-bien', nivel: 'info', categoria: 'roas',
      titulo: '🟢 Todo en orden — ROAS saludable',
      descripcion: `ROAS ${roas.toFixed(2)}x. Seguí monitoreando la frecuencia para anticipar la fatiga.`,
      accion: 'Considerá escalar el presupuesto un 20% si el ROAS se mantiene por 3 días seguidos.',
      link: '/presupuesto-escalado', linkLabel: 'Calculadora de escalado',
      fecha: now, leida: false, activa: true,
    })
  }

  return alerts
}

const ALERT_COLORS: Record<AlertLevel, { border: string; bg: string; badge: string }> = {
  critica: { border: 'border-red-500/30', bg: 'bg-red-500/5', badge: 'bg-red-500/20 text-red-400' },
  advertencia: { border: 'border-amber-500/30', bg: 'bg-amber-500/5', badge: 'bg-amber-500/20 text-amber-400' },
  info: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', badge: 'bg-emerald-500/20 text-emerald-400' },
}

export default function AlertasPage() {
  const [metrics, setMetrics] = useState<MetricInput>({
    roas_actual: '', roas_semana_pasada: '', cpa_actual: '', cpa_objetivo: '',
    frecuencia: '', dias_sin_generar: '', gasto_hoy: '', presupuesto_diario: '',
    tasa_entrega: '', dias_campana_activa: '',
  })
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [calculado, setCalculado] = useState(false)
  const [leidas, setLeidas] = useState<Set<string>>(new Set())

  const [importedFrom, setImportedFrom] = useState<string | null>(null)

  // Auto-import from KPIs Dashboard via sessionStorage
  useEffect(() => {
    try {
      const kpisData = sessionStorage.getItem('kpis_snapshot')
      if (kpisData) {
        const kpis = JSON.parse(kpisData)
        setMetrics(prev => ({ ...prev,
          roas_actual: kpis.roas_promedio ? kpis.roas_promedio.toFixed(2) : prev.roas_actual,
          cpa_actual: kpis.cpa_promedio ? String(Math.round(kpis.cpa_promedio)) : prev.cpa_actual,
          tasa_entrega: kpis.entrega_rate ? kpis.entrega_rate.toFixed(0) : prev.tasa_entrega,
        }))
        setImportedFrom('KPIs Dashboard')
      }
    } catch (e) { /* silent */ }
  }, [])

  const update = (k: keyof MetricInput, v: string) => setMetrics(prev => ({ ...prev, [k]: v }))

  const handleCheck = () => {
    const generated = generateAlerts(metrics)
    setAlerts(generated)
    setCalculado(true)
  }

  const marcarLeida = (id: string) => {
    setLeidas(prev => new Set([...prev, id]))
  }

  const criticas = alerts.filter(a => a.nivel === 'critica').length
  const advertencias = alerts.filter(a => a.nivel === 'advertencia').length

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-white/20'
  const labelCls = 'block text-xs text-white/40 mb-1.5 font-medium'

  return (
    <div className="min-h-screen">
      <Link href="/gestionar" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/gestionar" className="text-white/30 hover:text-white/60 text-sm transition-colors">Gestionar</Link>
            <span className="text-white/20 text-sm">›</span>
            <span className="text-white/60 text-sm">Alertas</span>
          </div>
          <h1 className="text-2xl font-bold text-white">🔔 Alertas Proactivas</h1>
          <p className="text-white/40 text-sm mt-1">Ingresá tus métricas de hoy — te avisamos qué necesita atención</p>
        </div>

        {/* Inputs métricas */}
        <div className="card p-5 mb-5 border border-white/8">
          <p className="text-sm font-bold text-white mb-4">Métricas de hoy</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>ROAS actual</label>
                <input className={inputCls} type="number" step="0.1" placeholder="ej. 2.4" value={metrics.roas_actual} onChange={e => update('roas_actual', e.target.value)} />
              </div>

        {importedFrom && (
          <div className="card p-3 border border-emerald-500/30 bg-emerald-500/5 mb-4 flex items-center gap-3">
            <span className="text-emerald-400">✅</span>
            <div className="flex-1 min-w-0">
              <p className="text-emerald-300 text-xs font-bold">Métricas importadas desde {importedFrom}</p>
              <p className="text-white/30 text-[10px]">ROAS, CPA y tasa de entrega cargados automáticamente</p>
            </div>
            <Link href="/kpis" className="text-[10px] text-emerald-400 font-bold flex-shrink-0">Actualizar →</Link>
          </div>
        )}

        {!importedFrom && (
          <div className="card p-3 border border-violet-500/20 bg-violet-500/5 mb-4 flex items-center gap-3">
            <span className="text-violet-400">💡</span>
            <div className="flex-1 min-w-0">
              <p className="text-violet-300 text-xs font-bold">Auto-importar desde KPIs Dashboard</p>
              <p className="text-white/30 text-[10px]">Calculá tus métricas en KPIs primero y se importan acá</p>
            </div>
            <Link href="/kpis" className="text-[10px] text-violet-400 font-bold flex-shrink-0">Ir a KPIs →</Link>
          </div>
        )}
              <div>
                <label className={labelCls}>ROAS semana pasada</label>
                <input className={inputCls} type="number" step="0.1" placeholder="ej. 3.8" value={metrics.roas_semana_pasada} onChange={e => update('roas_semana_pasada', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>CPA actual (Gs.)</label>
                <input className={inputCls} type="number" placeholder="ej. 65000" value={metrics.cpa_actual} onChange={e => update('cpa_actual', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>CPA objetivo (Gs.)</label>
                <input className={inputCls} type="number" placeholder="ej. 45000" value={metrics.cpa_objetivo} onChange={e => update('cpa_objetivo', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Frecuencia del anuncio</label>
                <input className={inputCls} type="number" step="0.1" placeholder="ej. 2.8" value={metrics.frecuencia} onChange={e => update('frecuencia', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Días sin generar contenido</label>
                <input className={inputCls} type="number" placeholder="ej. 5" value={metrics.dias_sin_generar} onChange={e => update('dias_sin_generar', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Gasto hoy (Gs.)</label>
                <input className={inputCls} type="number" placeholder="ej. 420000" value={metrics.gasto_hoy} onChange={e => update('gasto_hoy', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Presupuesto diario (Gs.)</label>
                <input className={inputCls} type="number" placeholder="ej. 500000" value={metrics.presupuesto_diario} onChange={e => update('presupuesto_diario', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Tasa entrega % (Dropi)</label>
                <input className={inputCls} type="number" placeholder="ej. 71" value={metrics.tasa_entrega} onChange={e => update('tasa_entrega', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Días de campaña activa</label>
                <input className={inputCls} type="number" placeholder="ej. 8" value={metrics.dias_campana_activa} onChange={e => update('dias_campana_activa', e.target.value)} />
              </div>
            </div>
            <button onClick={handleCheck}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all">
              🔔 Chequear alertas
            </button>
          </div>
        </div>

        {/* Resumen */}
        {calculado && alerts.length > 0 && (
          <div className="flex gap-2 mb-4">
            <div className={`flex-1 card p-3 text-center border ${criticas > 0 ? 'border-red-500/30 bg-red-500/5' : 'border-white/5'}`}>
              <p className={`text-2xl font-black ${criticas > 0 ? 'text-red-400' : 'text-white/20'}`}>{criticas}</p>
              <p className="text-[10px] text-white/30 mt-0.5">Críticas</p>
            </div>
            <div className={`flex-1 card p-3 text-center border ${advertencias > 0 ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5'}`}>
              <p className={`text-2xl font-black ${advertencias > 0 ? 'text-amber-400' : 'text-white/20'}`}>{advertencias}</p>
              <p className="text-[10px] text-white/30 mt-0.5">Advertencias</p>
            </div>
            <div className="flex-1 card p-3 text-center border border-white/5">
              <p className="text-2xl font-black text-white">{alerts.length}</p>
              <p className="text-[10px] text-white/30 mt-0.5">Total</p>
            </div>
          </div>
        )}

        {/* Lista de alertas */}
        {calculado && (
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="card p-6 text-center border border-white/5">
                <p className="text-4xl mb-3">🟢</p>
                <p className="text-white/60 font-semibold">Sin métricas ingresadas</p>
                <p className="text-white/30 text-sm">Completá al menos un campo para ver las alertas.</p>
              </div>
            ) : (
              [...alerts].sort((a, b) => {
                const order = { critica: 0, advertencia: 1, info: 2 }
                return order[a.nivel] - order[b.nivel]
              }).map(alert => {
                const cfg = ALERT_COLORS[alert.nivel]
                const leida = leidas.has(alert.id)
                return (
                  <div key={alert.id} className={`card p-4 border transition-all ${cfg.border} ${cfg.bg} ${leida ? 'opacity-50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
                            {alert.nivel.toUpperCase()}
                          </span>
                          <span className="text-white/20 text-[10px]">{alert.fecha}</span>
                        </div>
                        <p className="text-white font-bold text-sm mb-1">{alert.titulo}</p>
                        <p className="text-white/50 text-xs mb-2 leading-relaxed">{alert.descripcion}</p>
                        <div className="bg-white/5 rounded-xl p-2.5 mb-3">
                          <p className="text-white/70 text-xs leading-relaxed">💡 {alert.accion}</p>
                        </div>
                        <div className="flex gap-2">
                          {alert.link && (
                            <Link href={alert.link}
                              className="flex-1 py-1.5 rounded-lg border border-white/10 hover:border-violet-500/30 text-white/50 hover:text-white text-xs text-center transition-all">
                              {alert.linkLabel} →
                            </Link>
                          )}
                          <button onClick={() => marcarLeida(alert.id)}
                            className="px-3 py-1.5 rounded-lg border border-white/10 text-white/30 hover:text-white/50 text-xs transition-all">
                            {leida ? 'Leída ✓' : 'Marcar leída'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {!calculado && (
          <div className="card p-6 text-center border border-white/5">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-white/60 font-semibold mb-1">Tu sistema de alertas</p>
            <p className="text-white/30 text-sm">Ingresá las métricas del día y te avisamos qué necesita atención — ROAS en caída, fatiga creativa, tasa de entrega baja, presupuesto casi agotado y más.</p>
          </div>
        )}

      </main>
    </div>
  )
}
