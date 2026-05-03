import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { createServerComponentClient } from '@/lib/supabase-server'

const UGC_TOOLS = [
  {
    href: '/creativos/ugc/anuncios',
    icon: '▤',
    color: 'bg-violet-600',
    title: 'Anuncios',
    desc: 'Genera imágenes y videos creativos para Meta Ads, TikTok y redes sociales',
    badge: null,
  },
  {
    href: '/creativos/ugc-creator',
    icon: '🎬',
    color: 'bg-rose-600',
    title: 'UGC Creator',
    desc: 'Guiones profesionales para creadores UGC. Seguros, confiables, que venden sin sonar a comercial.',
    badge: 'NUEVO',
  },
  {
    href: '/creativos/ugc/secuencias',
    icon: '▦',
    color: 'bg-blue-600',
    title: 'Secuencias',
    desc: 'Crea series de imágenes para landing pages, carruseles y presentaciones',
    badge: null,
  },
  {
    href: '/creativos/ugc/catalogo',
    icon: '▣',
    color: 'bg-emerald-600',
    title: 'Catálogo',
    desc: 'Imágenes de producto fieles al original para catálogos y tiendas',
    badge: null,
  },
]

export const dynamic = 'force-dynamic'
export default async function CreativosUGCPage() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('name').eq('id', user?.id).single()

  return (
    <div className="min-h-screen">
      <Navbar userName={profile?.name} />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Creativos UGC</h1>
            <p className="text-white/40 text-sm mt-1">Genera imágenes y videos para tus ads con IA</p>
          </div>
          <Link href="/inicio" className="btn-ghost text-white/40">← Dashboard</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {UGC_TOOLS.map((tool, i) => (
            <Link key={i} href={tool.href}
              className="tool-card animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center text-white text-xl flex-shrink-0`}>
                  {tool.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-white font-semibold text-base">{tool.title}</h2>
                    {tool.badge && <span className="tag tag-gold text-[10px]">{tool.badge}</span>}
                  </div>
                </div>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">{tool.desc}</p>
              <div className="mt-auto pt-2">
                <span className="text-violet-400 text-sm font-medium">→ Comenzar</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
