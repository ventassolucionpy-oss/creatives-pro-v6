'use client'
import { useState } from 'react'
import { PAISES, type Pais } from '@/lib/ugc-data'

type Props = {
  onChange: (data: { pais: Pais; tienePreicio: boolean; precio: string; precioComparacion: string; precio2: string; precio3: string }) => void
}

export default function PriceSelector({ onChange }: Props) {
  const [pais, setPais] = useState<Pais>(PAISES[0])
  const [tienePrecio, setTienePrecio] = useState(true)
  const [precio, setPrecio] = useState('')
  const [precioComp, setPrecioComp] = useState('')
  const [precio2, setPrecio2] = useState('')
  const [precio3, setPrecio3] = useState('')

  const update = (changes: Partial<{ pais: Pais; tienePrecio: boolean; precio: string; precioComp: string; precio2: string; precio3: string }>) => {
    const merged = { pais, tienePrecio, precio, precioComp, precio2, precio3, ...changes }
    onChange({
      pais: merged.pais,
      tienePreicio: merged.tienePrecio,
      precio: merged.precio,
      precioComparacion: merged.precioComp,
      precio2: merged.precio2,
      precio3: merged.precio3,
    })
  }

  const inputClass = 'flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-white/20'
  const wrapClass = 'flex items-center gap-2 border border-white/10 bg-white/5 rounded-lg px-3 py-2.5'

  return (
    <div className="space-y-4">
      {/* País / Mercado */}
      <div>
        <label className="block text-sm font-semibold text-white mb-1">Mercado objetivo <span className="text-red-400">*</span></label>
        <p className="text-white/40 text-xs mb-2">¿Para qué país va dirigida la publicidad?</p>
        <select
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 cursor-pointer"
          value={pais.code}
          onChange={e => {
            const p = PAISES.find(p => p.code === e.target.value) || PAISES[0]
            setPais(p)
            update({ pais: p })
          }}
        >
          {PAISES.map(p => (
            <option key={p.code} value={p.code} style={{ background: '#111' }}>
              {p.label} — {p.nombre_moneda} ({p.simbolo})
            </option>
          ))}
        </select>
      </div>

      {/* Precio */}
      <div>
        <label className="block text-sm font-semibold text-white mb-3">Información adicional <span className="text-red-400">*</span></label>
        <p className="text-white/40 text-xs mb-3">Precio y datos que aparecerán en los anuncios</p>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => { setTienePrecio(true); update({ tienePrecio: true }) }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tienePrecio ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/20'
            }`}>
            ✓ Sí, tiene precio
          </button>
          <button
            onClick={() => { setTienePrecio(false); update({ tienePrecio: false }) }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              !tienePrecio ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/20'
            }`}>
            — No mostrar precio
          </button>
        </div>

        {tienePrecio && (
          <div className="space-y-2.5">
            <div>
              <p className="text-xs text-white/40 mb-1.5">Precio <span className="text-red-400">*</span></p>
              <div className={wrapClass}>
                <span className="text-white/50 text-sm font-medium flex-shrink-0">{pais.simbolo}</span>
                <input type="text" placeholder="150.000" value={precio}
                  onChange={e => { setPrecio(e.target.value); update({ precio: e.target.value }) }}
                  className={inputClass} />
              </div>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1.5">Precio de comparación <span className="text-white/25">(precio tachado)</span></p>
              <div className={wrapClass}>
                <span className="text-white/50 text-sm font-medium flex-shrink-0">{pais.simbolo}</span>
                <input type="text" placeholder="200.000" value={precioComp}
                  onChange={e => { setPrecioComp(e.target.value); update({ precioComp: e.target.value }) }}
                  className={inputClass} />
              </div>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1.5">Precios por cantidad <span className="text-white/25">(opcionales)</span></p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-white/30 mb-1">2 unidades</p>
                  <div className={wrapClass}>
                    <span className="text-white/50 text-xs flex-shrink-0">{pais.simbolo}</span>
                    <input type="text" placeholder="280.000" value={precio2}
                      onChange={e => { setPrecio2(e.target.value); update({ precio2: e.target.value }) }}
                      className={`${inputClass} text-xs`} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 mb-1">3 unidades</p>
                  <div className={wrapClass}>
                    <span className="text-white/50 text-xs flex-shrink-0">{pais.simbolo}</span>
                    <input type="text" placeholder="390.000" value={precio3}
                      onChange={e => { setPrecio3(e.target.value); update({ precio3: e.target.value }) }}
                      className={`${inputClass} text-xs`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
