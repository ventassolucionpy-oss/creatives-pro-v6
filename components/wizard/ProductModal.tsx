'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Product } from '@/types'

type Props = {
  onClose: () => void
  onCreated: (product: Product) => void
}

export default function ProductModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<'fisico' | 'digital' | 'servicio'>('fisico')
  const [platform, setPlatform] = useState<string>('')
  const [price, setPrice] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) return
    setLoading(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('No autenticado'); setLoading(false); return }

    const { data, error } = await supabase.from('products').insert({
      user_id: user.id, name: name.trim(), description: description.trim(),
      category, platform: platform || null, price: price ? parseFloat(price) : null,
      url: url || null,
    }).select().single()

    if (error) { setError(error.message); setLoading(false) }
    else { onCreated(data as Product) }
  }

  const labelClass = 'block text-xs font-medium text-white/40 mb-1.5'
  const CATEGORIES = [
    { value: 'fisico', label: '📦 Producto físico', desc: 'Dropshipping, tienda online' },
    { value: 'digital', label: '💻 Producto digital', desc: 'Cursos, ebooks, software' },
    { value: 'servicio', label: '⚡ Servicio', desc: 'Consultoría, coaching, agencia' },
  ]
  const PLATFORMS = [
    { value: 'hotmart', label: 'Hotmart' },
    { value: 'shopify', label: 'Shopify' },
    { value: 'mercadolibre', label: 'MercadoLibre' },
    { value: 'otro', label: 'Otro' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
      <div className="card w-full max-w-lg animate-fade-up">
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <h2 className="font-semibold text-white">Nuevo producto</h2>
          <button onClick={onClose} className="btn-ghost text-white/40 hover:text-white p-1.5">✕</button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className={labelClass}>Nombre del producto *</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)}
              placeholder="Ej: Crema hidratante premium, Curso de Trading, etc." />
          </div>

          <div>
            <label className={labelClass}>Descripción para la IA *</label>
            <textarea className="input resize-none h-20" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describí el producto en detalle: qué es, a quién va dirigido, cuál es su beneficio principal, qué problema resuelve..." />
          </div>

          <div>
            <label className={labelClass}>Categoría *</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat.value} onClick={() => { setCategory(cat.value as typeof category); setPlatform('') }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    category === cat.value ? 'card-selected' : 'border-white/8 bg-white/3 hover:border-white/15'
                  }`}>
                  <p className="text-xs font-medium text-white">{cat.label}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{cat.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Plataforma</label>
              <select className="input cursor-pointer" value={platform} onChange={e => setPlatform(e.target.value)}>
                <option value="" style={{ background: '#111' }}>Seleccionar...</option>
                {PLATFORMS.map(p => <option key={p.value} value={p.value} style={{ background: '#111' }}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Precio de venta (Gs.)</label>
              <input className="input" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="150000" />
            </div>
          </div>

          <div>
            <label className={labelClass}>URL del producto</label>
            <input className="input" value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://..." />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        <div className="flex gap-3 p-5 border-t border-white/8">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={handleCreate} disabled={loading || !name.trim() || !description.trim()} className="btn-primary flex-1">
            {loading ? 'Guardando...' : 'Crear producto'}
          </button>
        </div>
      </div>
    </div>
  )
}
