import Navbar from '@/components/layout/Navbar'
import { createServerComponentClient } from '@/lib/supabase-server'
import ResultsPanel from '@/components/tools/ResultsPanel'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { GenerationOutput } from '@/types'

export const dynamic = 'force-dynamic'
export default async function GenerationDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('name').eq('id', user?.id).single()

  const { data: gen } = await supabase
    .from('generations')
    .select('*, products(name, description)')
    .eq('id', params.id)
    .single()

  if (!gen) notFound()

  const toolLabels: Record<string, string> = {
    'ugc-anuncios': 'UGC Anuncios', 'ugc-secuencias': 'UGC Secuencias',
    'ugc-catalogo': 'UGC Catálogo', 'ugc-creator': 'UGC Creator',
    'meta-ads': 'Meta Ads', 'tiktok': 'TikTok',
    'hotmart': 'Hotmart', 'andromeda': 'Andromeda',
  }

  const productName = (gen.products as { name: string } | null)?.name
  const output = gen.output as GenerationOutput | null

  return (
    <div className="min-h-screen">
      <Link href="/historial" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar userName={profile?.name} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/historial" className="btn-ghost text-white/30 p-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-white">{toolLabels[gen.tool] || gen.tool}</h1>
              <span className="tag tag-green text-[10px]">{gen.status}</span>
            </div>
            <p className="text-white/40 text-xs mt-0.5">
              {productName && <span className="mr-2">📦 {productName}</span>}
              {new Date(gen.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Input summary */}
        {gen.input && Object.keys(gen.input).length > 0 && (
          <div className="card p-4 mb-6 border border-white/8">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Configuración usada</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(gen.input as Record<string, unknown>)
                .filter(([k, v]) => v && !['product_id', 'tool', 'producto', 'descripcion', 'dallePrompt'].includes(k))
                .map(([k, v]) => (
                  <span key={k} className="tag tag-gray text-[10px]">
                    {k.replace(/_/g, ' ')}: {String(v).slice(0, 30)}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Results */}
        {output ? (
          <ResultsPanel output={output} tool={gen.tool} />
        ) : (
          <div className="card p-8 text-center">
            <p className="text-white/30 text-sm">Esta generación no tiene datos guardados.</p>
          </div>
        )}
      </main>
    </div>
  )
}
