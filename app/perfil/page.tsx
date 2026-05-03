'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PAISES, type Pais } from '@/lib/constants'

export default function PerfilPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [pais, setPais] = useState<Pais>('PY')
  const [saved, setSaved] = useState(false)
  const [stats, setStats] = useState({ generations: 0, products: 0 })
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email || '')
      const { data: profile } = await supabase.from('profiles').select('name, pais').eq('id', user.id).single()
      if (profile) { setName(profile.name); if (profile.pais) setPais(profile.pais as Pais) }
      const { count: genCount } = await supabase.from('generations').select('*', { count: 'exact', head: true })
      const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
      setStats({ generations: genCount || 0, products: prodCount || 0 })
    }
    load()
  }, [supabase, router])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('profiles').update({ name, pais, updated_at: new Date().toISOString() }).eq('id', user.id)
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'

  return (
    <div className="min-h-screen">
      <Link href="/inicio" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar userName={name} />
      <main className="max-w-lg mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Mi perfil</h1>
          <p className="text-white/40 text-sm mt-1">Configurá tu información personal</p>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/30 border border-violet-500/30 flex items-center justify-center text-2xl font-bold text-violet-300">
            {initials}
          </div>
          <div>
            <p className="text-white font-semibold">{name || 'Usuario'}</p>
            <p className="text-white/40 text-sm">{email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-violet-400">{stats.generations}</p>
            <p className="text-xs text-white/30 mt-1">Generaciones totales</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.products}</p>
            <p className="text-xs text-white/30 mt-1">Productos creados</p>
          </div>
        </div>

        {/* Edit form */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Información personal</h2>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">Nombre</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">Email</label>
            <input className="input" value={email} disabled />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">País de operación</label>
            <select className="input" value={pais} onChange={e => setPais(e.target.value as Pais)}>
              {Object.values(PAISES).map(p => (
                <option key={p.codigo} value={p.codigo} className="bg-zinc-900">{p.bandera} {p.nombre}</option>
              ))}
            </select>
            <p className="text-white/25 text-[10px] mt-1">Afecta los cálculos, precios y prompts en toda la app</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-3">
            {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </main>
    </div>
  )
}
