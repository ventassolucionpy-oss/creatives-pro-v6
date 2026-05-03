'use client'
import { ESTILOS_VISUALES, type EstiloVisual } from '@/lib/ugc-data'

type Props = {
  selected: string
  onChange: (id: string) => void
}

const CATEGORIAS = ['IA Elige', 'UGC / Orgánico', 'Conversión Directa', 'Premium / Lifestyle']

export default function StyleGrid({ selected, onChange }: Props) {
  const automatico = ESTILOS_VISUALES.find(e => e.id === 'automatico')!
  const byCategoria = (cat: string) => ESTILOS_VISUALES.filter(e => e.categoria === cat && e.id !== 'automatico')

  return (
    <div>
      <label className="block text-sm font-semibold text-white mb-1">Estilo visual</label>
      <p className="text-white/40 text-xs mb-3">Elegí un estilo o dejá que la IA elija automáticamente</p>

      {/* Automático destacado */}
      <button onClick={() => onChange(automatico.id)}
        className={`w-full flex items-center gap-3 p-3 rounded-xl mb-4 border transition-all ${
          selected === automatico.id
            ? 'border-violet-500/50 bg-violet-500/10'
            : 'border-white/10 bg-white/3 hover:border-white/20'
        }`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${
          selected === automatico.id ? 'bg-violet-600' : 'bg-white/10'
        }`}>✦</div>
        <div className="text-left flex-1">
          <p className={`text-sm font-semibold ${selected === automatico.id ? 'text-violet-300' : 'text-white/70'}`}>
            {automatico.nombre}
          </p>
          <p className="text-xs text-white/40">{automatico.descripcion}</p>
        </div>
        {selected === automatico.id && (
          <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </button>

      {/* Grillas por categoría */}
      {CATEGORIAS.filter(c => c !== 'IA Elige').map(cat => (
        <div key={cat} className="mb-4">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">{cat}</p>
          <div className="grid grid-cols-2 gap-2">
            {byCategoria(cat).map((estilo: EstiloVisual) => (
              <button key={estilo.id} onClick={() => onChange(estilo.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selected === estilo.id
                    ? 'border-violet-500/50 bg-violet-500/8'
                    : 'border-white/8 bg-white/3 hover:border-white/18 hover:bg-white/5'
                }`}>
                <p className={`text-xs font-medium ${selected === estilo.id ? 'text-violet-300' : 'text-white/70'}`}>
                  {estilo.nombre}
                </p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
