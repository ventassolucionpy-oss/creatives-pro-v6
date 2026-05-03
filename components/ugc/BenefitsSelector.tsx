'use client'
import { useState } from 'react'
import { BENEFICIOS_PREDEFINIDOS } from '@/lib/ugc-data'

type Props = {
  onChange: (beneficios: string[]) => void
}

export default function BenefitsSelector({ onChange }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [custom, setCustom] = useState('')

  const toggle = (b: string) => {
    const next = selected.includes(b) ? selected.filter(s => s !== b) : [...selected, b]
    setSelected(next)
    onChange(next)
  }

  const addCustom = () => {
    const val = custom.trim()
    if (!val || selected.includes(val)) return
    const next = [...selected, val]
    setSelected(next)
    onChange(next)
    setCustom('')
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-white mb-1">Beneficios principales <span className="text-white/30 font-normal">(opcional)</span></label>
      <p className="text-white/40 text-xs mb-3">Seleccioná los que apliquen a tu producto</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {BENEFICIOS_PREDEFINIDOS.map(b => (
          <button key={b} onClick={() => toggle(b)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selected.includes(b)
                ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70'
            }`}>
            {selected.includes(b) ? '✓ ' : '+ '}{b}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none focus:border-violet-500/50"
          placeholder="Agregá tu propia info y presioná Enter"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCustom()}
        />
        <button onClick={addCustom} className="w-8 h-8 rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 transition-colors flex items-center justify-center text-lg">+</button>
      </div>
    </div>
  )
}
