'use client'
export const dynamic = 'force-dynamic'
import { useState, useMemo } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

type CheckItem = {
  id: string
  categoria: string
  pregunta: string
  descripcion: string
  peso: number // 1-3
  respuesta: boolean | null
  critico: boolean
}

const CHECKLIST_ITEMS: Omit<CheckItem, 'respuesta'>[] = [
  // Logística COD
  { id: 'sobrevive_viaje', categoria: 'Logística', pregunta: '¿El producto sobrevive el viaje de Dropi sin daños?', descripcion: 'Empaque robusto, no frágil, no líquidos que se derraman. Dropi no garantiza embalaje cuidadoso.', peso: 3, critico: true },
  { id: 'peso_razonable', categoria: 'Logística', pregunta: '¿El peso es razonable para COD? (menos de 5kg)', descripcion: 'Productos muy pesados aumentan el flete y las devoluciones por "no paga el precio".', peso: 2, critico: false },
  { id: 'no_restringido', categoria: 'Logística', pregunta: '¿No tiene restricciones de aduana o importación en Paraguay?', descripcion: 'Medicamentos, baterías grandes, ciertos alimentos — pueden frenarse en aduana. Verificar.', peso: 3, critico: true },
  { id: 'talla_standard', categoria: 'Logística', pregunta: '¿Si tiene tallas, maneja una talla única o pocas opciones?', descripcion: 'Las devoluciones por talla incorrecta destruyen la tasa de entrega COD.', peso: 2, critico: false },

  // Venta sin video
  { id: 'funciona_foto', categoria: 'Venta sin video', pregunta: '¿Se puede vender con solo fotos? (no requiere demostración en video)', descripcion: 'Si el producto solo convierte con video explicativo, el costo de producción sube y la velocidad de lanzamiento baja.', peso: 2, critico: false },
  { id: 'foto_celular_ok', categoria: 'Venta sin video', pregunta: '¿La foto con celular se ve bien? (no necesita estudio)', descripcion: 'Los mejores productos para dropshipping tienen aspecto visual atractivo con luz natural y fondo blanco.', peso: 2, critico: false },
  { id: 'beneficio_obvio', categoria: 'Venta sin video', pregunta: '¿El beneficio principal es obvio con solo ver el producto?', descripcion: 'Un masajeador de cuello = alivio de dolor. Obvio. Un suplemento genérico = no tan obvio. Más difícil de vender.', peso: 3, critico: true },

  // Mercado Paraguay
  { id: 'problema_real', categoria: 'Mercado PY', pregunta: '¿Resuelve un problema real y frecuente en Paraguay?', descripcion: 'Dolor de espalda, manchas, control de peso, cabello. Problemas que el paraguayo quiere resolver HOY.', peso: 3, critico: true },
  { id: 'precio_viable', categoria: 'Mercado PY', pregunta: '¿El precio COD viable (Gs. 90k-250k) genera margen real?', descripcion: 'Por debajo de Gs. 90k la percepción de "muy barato" genera dudas. Por encima de Gs. 250k, la fricción de COD aumenta mucho.', peso: 3, critico: true },
  { id: 'sin_competencia_masiva', categoria: 'Mercado PY', pregunta: '¿No está saturado en Paraguay? (no lo vende la mitad de Dropi ya)', descripcion: 'Buscá en grupos de Facebook de compradores paraguayos si el producto ya está sobrevendido.', peso: 2, critico: false },
  { id: 'sin_estacion', categoria: 'Mercado PY', pregunta: '¿No depende de estacionalidad crítica? (navidad, invierno)', descripcion: 'Productos sin estación son más estables. Estacionales pueden ser picos grandes pero riesgosos.', peso: 1, critico: false },

  // Psicología de compra
  { id: 'compra_impulsiva', categoria: 'Psicología', pregunta: '¿Se puede comprar de forma impulsiva? (sin investigación)', descripcion: 'COD funciona mejor con productos de compra emocional/impulsiva. No para productos de alta investigación como laptops.', peso: 3, critico: true },
  { id: 'regalo_potencial', categoria: 'Psicología', pregunta: '¿Funciona como regalo? (amplía la audiencia)', descripcion: 'Productos que funcionan como regalo tienen CPAs más bajos porque hay más razones de compra.', peso: 1, critico: false },
  { id: 'urgencia_real', categoria: 'Psicología', pregunta: '¿Se puede crear urgencia real? (oferta limitada, stock, temporada)', descripcion: 'Sin urgencia creíble, el COD baja porque el cliente "lo piensa y no vuelve".', peso: 2, critico: false },
]

export default function ValidadorProductoPage() {
  const [checklist, setChecklist] = useState<CheckItem[]>(
    CHECKLIST_ITEMS.map(item => ({ ...item, respuesta: null }))
  )
  const [producto, setProducto] = useState('')
  const [showResultado, setShowResultado] = useState(false)

  const toggle = (id: string, value: boolean) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, respuesta: value } : item))
  }

  const resultado = useMemo(() => {
    const respondidos = checklist.filter(i => i.respuesta !== null)
    if (respondidos.length < 5) return null

    const criticos = checklist.filter(i => i.critico)
    const criticosFallados = criticos.filter(i => i.respuesta === false)
    const puntaje = respondidos.reduce((sum, i) => sum + (i.respuesta ? i.peso : 0), 0)
    const puntajeMax = respondidos.reduce((sum, i) => sum + i.peso, 0)
    const score = puntajeMax > 0 ? Math.round((puntaje / puntajeMax) * 100) : 0

    let veredicto: 'verde' | 'amarillo' | 'rojo'
    let mensaje: string
    if (criticosFallados.length >= 2 || score < 40) {
      veredicto = 'rojo'
      mensaje = 'No lanzar — demasiados puntos críticos fallados. Buscá otro producto.'
    } else if (criticosFallados.length === 1 || score < 65) {
      veredicto = 'amarillo'
      mensaje = 'Lanzar con precaución — hay un riesgo importante que podés mitigar antes.'
    } else {
      veredicto = 'verde'
      mensaje = 'Producto validado — listo para lanzar en Paraguay COD.'
    }

    const warnings = checklist
      .filter(i => i.respuesta === false && i.critico)
      .map(i => i.pregunta)

    const oportunidades = checklist
      .filter(i => i.respuesta === false && !i.critico)
      .map(i => i.pregunta)

    return { score, veredicto, mensaje, criticosFallados: criticosFallados.length, warnings, oportunidades }
  }, [checklist])

  const respondidos = checklist.filter(i => i.respuesta !== null).length
  const total = checklist.length
  const categorias = [...new Set(CHECKLIST_ITEMS.map(i => i.categoria))]

  const verdictoColor = (v?: string) =>
    v === 'verde' ? 'border-emerald-500/40 bg-emerald-500/5' :
    v === 'amarillo' ? 'border-amber-500/40 bg-amber-500/5' :
    'border-red-500/40 bg-red-500/5'

  const veredictoText = (v?: string) =>
    v === 'verde' ? 'text-emerald-400' : v === 'amarillo' ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="min-h-screen">
      <Link href="/gestionar" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dropi" className="text-white/30 hover:text-white/60 text-sm transition-colors">Dropi PY</Link>
            <span className="text-white/20 text-sm">›</span>
            <span className="text-white/60 text-sm">Validador</span>
          </div>
          <h1 className="text-2xl font-bold text-white">✅ Validador COD Paraguay</h1>
          <p className="text-white/40 text-sm mt-1">¿Este producto va a funcionar en Dropi? Checklist antes de comprar stock.</p>
        </div>

        {/* Producto */}
        <div className="card p-4 mb-5 border border-white/8">
          <input
            className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-white/20"
            placeholder="¿Qué producto estás evaluando? (ej. Masajeador de cuello eléctrico)"
            value={producto}
            onChange={e => setProducto(e.target.value)}
          />
        </div>

        {/* Progreso */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-violet-600 rounded-full transition-all duration-300" style={{ width: `${(respondidos / total) * 100}%` }} />
          </div>
          <span className="text-white/40 text-xs flex-shrink-0">{respondidos}/{total}</span>
        </div>

        {/* Checklist por categoría */}
        {categorias.map(cat => (
          <div key={cat} className="mb-5">
            <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-3">{cat}</p>
            <div className="space-y-2">
              {checklist.filter(i => i.categoria === cat).map(item => (
                <div key={item.id} className={`card p-4 border transition-all ${
                  item.respuesta === true ? 'border-emerald-500/30 bg-emerald-500/3' :
                  item.respuesta === false ? 'border-red-500/30 bg-red-500/3' :
                  'border-white/8'
                }`}>
                  <div className="flex items-start gap-3 mb-2">
                    {item.critico && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 mt-0.5">CRÍTICO</span>}
                    <p className="text-white/80 text-sm font-medium leading-tight flex-1">{item.pregunta}</p>
                  </div>
                  <p className="text-white/30 text-xs mb-3 leading-relaxed">{item.descripcion}</p>
                  <div className="flex gap-2">
                    <button onClick={() => toggle(item.id, true)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                        item.respuesta === true ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'border-white/10 text-white/30 hover:border-emerald-500/30 hover:text-emerald-400/60'
                      }`}>
                      ✓ Sí
                    </button>
                    <button onClick={() => toggle(item.id, false)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                        item.respuesta === false ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'border-white/10 text-white/30 hover:border-red-500/30 hover:text-red-400/60'
                      }`}>
                      ✕ No
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Resultado */}
        {resultado && (
          <div className={`card p-5 border mb-5 ${verdictoColor(resultado.veredicto)}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl">{resultado.veredicto === 'verde' ? '🟢' : resultado.veredicto === 'amarillo' ? '🟡' : '🔴'}</div>
              <div>
                <p className={`text-lg font-black ${veredictoText(resultado.veredicto)}`}>Score: {resultado.score}/100</p>
                <p className="text-xs text-white/40">{resultado.mensaje}</p>
              </div>
            </div>

            {resultado.warnings.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-bold text-red-400 mb-2">⚠️ Riesgos críticos:</p>
                {resultado.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-red-300/70 mb-1">• {w}</p>
                ))}
              </div>
            )}

            {resultado.oportunidades.length > 0 && (
              <div>
                <p className="text-xs font-bold text-amber-400 mb-2">💡 Puntos a mejorar:</p>
                {resultado.oportunidades.slice(0, 3).map((o, i) => (
                  <p key={i} className="text-xs text-amber-300/60 mb-1">• {o}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {resultado && resultado.veredicto === 'verde' && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Link href="/sourcing" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-violet-500/30 transition-all">
              <span>📦</span><div><p className="text-white text-xs font-bold">Sourcing</p><p className="text-white/30 text-[10px]">Evaluar y calcular precio</p></div>
            </Link>
            <Link href="/lanzar" className="card p-3 flex items-center gap-2 border border-white/8 hover:border-violet-500/30 transition-all">
              <span>🚀</span><div><p className="text-white text-xs font-bold">Lanzar</p><p className="text-white/30 text-[10px]">Del producto al primer anuncio</p></div>
            </Link>
          </div>
        )}

        <div className="card p-4 border border-amber-500/20 bg-amber-500/5">
          <p className="text-xs text-amber-300 font-bold mb-1">💡 Regla del 70%</p>
          <p className="text-xs text-white/40">En Paraguay COD, si no podés responder "sí" a los puntos críticos con confianza, el producto va a costar más en devoluciones y fletes que lo que va a generar. Mejor encontrar un producto mejor.</p>
        </div>

      </main>
    </div>
  )
}
