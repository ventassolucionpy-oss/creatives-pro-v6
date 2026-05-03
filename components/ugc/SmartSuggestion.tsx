'use client'
import { NIVELES_CONCIENCIA } from '@/lib/ugc-data'

type Props = {
  nivelConciencia: string
  anguloSeleccionado?: string
  objetivoSeleccionado?: string
}

export default function SmartSuggestion({ nivelConciencia, anguloSeleccionado, objetivoSeleccionado }: Props) {
  if (!nivelConciencia) return null

  const nivel = NIVELES_CONCIENCIA.find(n => n.value === nivelConciencia)
  if (!nivel) return null

  const { sugerencias } = nivel
  const anguloOk = anguloSeleccionado && sugerencias.angulos.some(a => anguloSeleccionado.includes(a.split('/')[0].trim()))
  const objetivoOk = objetivoSeleccionado && sugerencias.objetivos.some(o => objetivoSeleccionado.includes(o.split('/')[0].trim()))

  return (
    <div className="rounded-xl border border-violet-500/25 bg-violet-500/6 p-4 space-y-3 animate-fade-up">
      <div className="flex items-center gap-2">
        <span className="text-violet-400 text-sm">✦</span>
        <p className="text-xs font-semibold text-violet-300 uppercase tracking-wider">Sugerencia de conversión</p>
      </div>

      <p className="text-white/60 text-xs leading-relaxed">{sugerencias.razon}</p>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1.5">Ángulos recomendados</p>
          <div className="space-y-1">
            {sugerencias.angulos.map(a => (
              <div key={a} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${
                anguloSeleccionado && anguloSeleccionado.includes(a.split('/')[0].trim())
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'bg-white/5 text-white/50'
              }`}>
                <span>{anguloSeleccionado && anguloSeleccionado.includes(a.split('/')[0].trim()) ? '✓' : '→'}</span>
                <span>{a}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1.5">Objetivos ideales</p>
          <div className="space-y-1">
            {sugerencias.objetivos.map(o => (
              <div key={o} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${
                objetivoSeleccionado && objetivoSeleccionado.includes(o.split('/')[0].trim())
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'bg-white/5 text-white/50'
              }`}>
                <span>{objetivoSeleccionado && objetivoSeleccionado.includes(o.split('/')[0].trim()) ? '✓' : '→'}</span>
                <span>{o}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {anguloOk && objetivoOk && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-emerald-400 text-sm">✓</span>
          <p className="text-emerald-300 text-xs font-medium">Configuración óptima para conversión</p>
        </div>
      )}
    </div>
  )
}
