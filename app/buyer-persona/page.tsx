'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { callClaudeJSON } from '@/lib/claude-client'
import { buildPrompt } from '@/lib/prompts/buyer-persona'
import type { BuyerPersonaOutput } from '@/lib/prompts/buyer-persona'
import type { Product } from '@/types'

type Phase = 'config' | 'generating' | 'results'

const lc = 'block text-xs text-white/40 mb-1.5'
const ic = 'w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/50'

export default function BuyerPersonaPage() {
  const [phase, setPhase] = useState<Phase>('config')
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [config, setConfig] = useState({ precio: '', canal: '', publico: '' })
  const [output, setOutput] = useState<BuyerPersonaOutput | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'persona' | 'psicologia' | 'angulos' | 'lenguaje' | 'estructura'>('persona')
  const supabase = createClient()

  useEffect(() => {
    supabase.from('products').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setProducts(data)
    })
  }, [])

  const generate = async () => {
    if (!selectedProduct) return
    setPhase('generating'); setError('')
    try {
      const prompt = buildPrompt(selectedProduct, config)
      const result = await callClaudeJSON<BuyerPersonaOutput>({
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 10000,
        saveGeneration: { tool: 'buyer-persona', product_id: selectedProduct.id, input: { ...config } }
      })
      setOutput(result); setPhase('results')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar')
      setPhase('config')
    }
  }

  const TABS = [
    { id: 'persona' as const, label: 'Perfil' },
    { id: 'psicologia' as const, label: 'Psicología' },
    { id: 'angulos' as const, label: 'Ángulos' },
    { id: 'lenguaje' as const, label: 'Lenguaje' },
    { id: 'estructura' as const, label: 'Estructura' },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/inicio" className="text-white/30 hover:text-white/60 text-sm flex items-center gap-1.5 mb-4 transition-colors">← Volver</Link>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">🎯 Buyer Persona</h1>
            <span className="tag tag-violet text-[10px]">IA</span>
          </div>
          <p className="text-white/40 text-sm">Entendé a tu comprador antes de crear el primer anuncio</p>
        </div>

        {phase === 'config' && (
          <div className="space-y-4 animate-fade-up">
            <div className="card p-4 border border-white/8">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Producto</p>
              {products.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-white/30 text-sm mb-3">No tenés productos guardados</p>
                  <Link href="/productos" className="text-violet-400 text-sm hover:text-violet-300">+ Agregar producto</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {products.map(p => (
                    <button key={p.id} onClick={() => setSelectedProduct(p)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${selectedProduct?.id === p.id ? 'border-violet-500/50 bg-violet-600/10' : 'border-white/8 hover:border-white/20'}`}>
                      <p className="text-white text-sm font-medium">{p.name}</p>
                      <p className="text-white/30 text-xs mt-0.5 line-clamp-1">{p.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedProduct && (
              <div className="card p-4 border border-white/8 space-y-3 animate-fade-up">
                <p className="text-xs text-white/40 uppercase tracking-wider">Configuración opcional</p>
                <div>
                  <label className={lc}>Precio de venta (Gs.)</label>
                  <input className={ic} placeholder="Ej: 150000" value={config.precio}
                    onChange={e => setConfig(p => ({ ...p, precio: e.target.value }))} />
                </div>
                <div>
                  <label className={lc}>Canal principal</label>
                  <select className={`${ic} cursor-pointer`} value={config.canal}
                    onChange={e => setConfig(p => ({ ...p, canal: e.target.value }))}>
                    <option value="" style={{ background: '#111' }}>Seleccionar...</option>
                    {['Meta Ads + TikTok Shop', 'Solo Meta Ads', 'Solo TikTok', 'Orgánico + Ads', 'WhatsApp directo'].map(o => (
                      <option key={o} value={o} style={{ background: '#111' }}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={lc}>Público estimado (opcional)</label>
                  <input className={ic} placeholder="Ej: Mujeres 25-45 con dolores articulares"
                    value={config.publico} onChange={e => setConfig(p => ({ ...p, publico: e.target.value }))} />
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button onClick={generate} disabled={!selectedProduct}
              className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-sm transition-all">
              Generar Buyer Persona
            </button>
          </div>
        )}

        {phase === 'generating' && (
          <div className="text-center py-16 animate-fade-up">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center text-2xl mx-auto mb-4 animate-pulse">🎯</div>
            <p className="text-white font-bold mb-2">Analizando tu comprador...</p>
            <p className="text-white/40 text-sm">Psicología profunda, miedos, motivaciones y ángulos de anuncio</p>
          </div>
        )}

        {phase === 'results' && output && (
          <div className="animate-fade-up space-y-4">
            <div className="card p-4 border border-violet-500/20 bg-violet-500/5">
              <p className="text-[10px] uppercase tracking-wider text-violet-400/60 mb-2">Resumen del mercado</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-white/3 rounded-lg">
                  <p className="text-[10px] text-white/30 mb-0.5">Tamaño del problema</p>
                  <p className="text-white text-xs">{output.resumen_mercado?.tamano_problema}</p>
                </div>
                <div className="p-2.5 bg-white/3 rounded-lg">
                  <p className="text-[10px] text-white/30 mb-0.5">Momento de compra</p>
                  <p className="text-white text-xs">{output.resumen_mercado?.momento_de_compra}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-1 flex-wrap">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${activeTab === t.id ? 'border-violet-500/50 bg-violet-600/20 text-violet-300' : 'border-white/10 text-white/40 hover:text-white'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === 'persona' && output.buyer_persona && (
              <div className="card p-4 border border-white/8 space-y-2">
                <p className="text-white font-bold text-lg">{output.buyer_persona.nombre_ficticio}</p>
                {[
                  ['Edad', output.buyer_persona.edad],
                  ['Género', output.buyer_persona.genero],
                  ['Ubicación', output.buyer_persona.ubicacion],
                  ['Ocupación', output.buyer_persona.ocupacion],
                  ['Ingreso mensual', output.buyer_persona.ingreso_mensual],
                  ['Dispositivo', output.buyer_persona.dispositivo_principal],
                  ['Horario online', output.buyer_persona.horario_online],
                ].map(([label, val]) => val && (
                  <div key={label as string} className="flex gap-2 text-sm">
                    <span className="text-white/30 flex-shrink-0 w-32 text-xs">{label}</span>
                    <span className="text-white/80 text-xs">{val as string}</span>
                  </div>
                ))}
                {output.buyer_persona.redes_que_usa?.length > 0 && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-white/30 flex-shrink-0 w-32 text-xs">Redes</span>
                    <span className="text-white/80 text-xs">{output.buyer_persona.redes_que_usa.join(', ')}</span>
                  </div>
                )}
                {output.buyer_persona.dia_tipico && (
                  <div className="p-3 bg-white/3 rounded-lg mt-2">
                    <p className="text-[10px] text-white/30 mb-1">Día típico</p>
                    <p className="text-white/70 text-xs leading-relaxed">{output.buyer_persona.dia_tipico}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'psicologia' && (
              <div className="space-y-3">
                {output.psicologia_profunda && [
                  ['Problema principal', output.psicologia_profunda.problema_principal],
                  ['Cómo lo describe', output.psicologia_profunda.como_describe_el_problema],
                  ['Cómo afecta su vida', output.psicologia_profunda.como_afecta_su_vida_diaria],
                  ['Qué ya intentó', output.psicologia_profunda.que_ya_intentó],
                  ['Emoción que siente', output.psicologia_profunda.que_siente_cuando_el_problema_aparece],
                  ['Lo que no dice a nadie', output.psicologia_profunda.que_verguenza_o_miedo_tiene_al_respecto],
                ].map(([label, val]) => (
                  <div key={label as string} className="card p-3 border border-white/8">
                    <p className="text-[10px] text-white/30 mb-1">{label as string}</p>
                    <p className="text-white/80 text-sm leading-relaxed">{val as string}</p>
                  </div>
                ))}
                {output.miedos_objeciones && (
                  <div className="card p-3 border border-red-500/15">
                    <p className="text-[10px] text-red-400/60 mb-2">Objeciones y cómo responderlas</p>
                    {[1, 2, 3, 4].map(i => {
                      const key = `objecion_${i}` as keyof typeof output.miedos_objeciones
                      const obj = output.miedos_objeciones[key] as { objecion: string; respuesta_en_el_anuncio: string } | undefined
                      return obj ? (
                        <div key={i} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-0 border-white/5">
                          <p className="text-white/60 text-xs font-medium">{obj.objecion}</p>
                          <p className="text-emerald-400/70 text-xs mt-0.5">→ {obj.respuesta_en_el_anuncio}</p>
                        </div>
                      ) : null
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'angulos' && output.angulos_de_anuncio && (
              <div className="space-y-3">
                {output.angulos_de_anuncio.map((a, i) => (
                  <div key={i} className="card p-4 border border-white/8">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-lg bg-violet-600/20 flex items-center justify-center text-xs font-bold text-violet-400">{i + 1}</span>
                      <p className="text-white font-bold text-sm">{a.nombre}</p>
                    </div>
                    <p className="text-white/40 text-xs mb-3">{a.por_que_conecta_con_este_buyer}</p>
                    <div className="space-y-2">
                      <div className="p-2.5 bg-violet-500/8 border border-violet-500/15 rounded-lg">
                        <p className="text-[10px] text-violet-400/60 mb-0.5">Hook Meta Ads</p>
                        <p className="text-white text-xs font-medium">"{a.hook_meta}"</p>
                      </div>
                      <div className="p-2.5 bg-pink-500/8 border border-pink-500/15 rounded-lg">
                        <p className="text-[10px] text-pink-400/60 mb-0.5">Hook TikTok</p>
                        <p className="text-white text-xs font-medium">"{a.hook_tiktok}"</p>
                      </div>
                      <div className="p-2.5 bg-white/3 rounded-lg">
                        <p className="text-[10px] text-white/30 mb-0.5">Cuerpo del anuncio</p>
                        <p className="text-white/70 text-xs leading-relaxed">{a.cuerpo_del_anuncio}</p>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]">{a.formato_recomendado}</span>
                        <span className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px]">{a.nivel_conciencia}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'lenguaje' && output.lenguaje_exacto && (
              <div className="space-y-3">
                {[
                  ['Palabras que usa', output.lenguaje_exacto.palabras_que_usa],
                  ['Frases cuando tiene el problema', output.lenguaje_exacto.frases_que_dice_cuando_tiene_el_problema],
                  ['Cómo busca en Google', output.lenguaje_exacto.como_busca_en_google],
                  ['Qué comenta en redes', output.lenguaje_exacto.que_comenta_en_redes],
                ].map(([label, items]) => (
                  <div key={label as string} className="card p-3 border border-white/8">
                    <p className="text-[10px] text-white/30 mb-2">{label as string}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(items as string[]).map((item, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg bg-white/5 border border-white/8 text-white/70 text-xs">"{item}"</span>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="card p-3 border border-white/8">
                  <p className="text-[10px] text-white/30 mb-1">Tono que conecta</p>
                  <p className="text-white/80 text-sm">{output.lenguaje_exacto.tono_que_conecta}</p>
                </div>
              </div>
            )}

            {activeTab === 'estructura' && output.estructura_anuncio_perfecto && (
              <div className="space-y-3">
                {output.estructura_anuncio_perfecto.meta_ads && (
                  <div className="card p-4 border border-blue-500/20">
                    <p className="text-[10px] text-blue-400/60 uppercase mb-3">Meta Ads — Estructura perfecta</p>
                    {[
                      ['Hook visual', output.estructura_anuncio_perfecto.meta_ads.hook_visual],
                      ['Primeras palabras', output.estructura_anuncio_perfecto.meta_ads.primeras_palabras],
                      ['Problema que nombra', output.estructura_anuncio_perfecto.meta_ads.problema_que_nombra],
                      ['Solución que ofrece', output.estructura_anuncio_perfecto.meta_ads.solucion_que_ofrece],
                      ['Prueba social', output.estructura_anuncio_perfecto.meta_ads.prueba_social],
                      ['CTA', output.estructura_anuncio_perfecto.meta_ads.cta],
                    ].map(([label, val]) => (
                      <div key={label as string} className="mb-2.5 last:mb-0">
                        <p className="text-[10px] text-white/30">{label as string}</p>
                        <p className="text-white/80 text-xs mt-0.5 leading-relaxed">{val as string}</p>
                      </div>
                    ))}
                    {output.estructura_anuncio_perfecto.meta_ads.que_NO_decir?.length > 0 && (
                      <div className="mt-3 p-2.5 bg-red-500/8 border border-red-500/15 rounded-lg">
                        <p className="text-[10px] text-red-400/60 mb-1">Qué NO decir</p>
                        {output.estructura_anuncio_perfecto.meta_ads.que_NO_decir.map((e: string, i: number) => (
                          <p key={i} className="text-red-300/60 text-xs">· {e}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {output.estructura_anuncio_perfecto.tiktok && (
                  <div className="card p-4 border border-pink-500/20">
                    <p className="text-[10px] text-pink-400/60 uppercase mb-3">TikTok — Estructura perfecta</p>
                    {[
                      ['Hook 0-3s', output.estructura_anuncio_perfecto.tiktok.hook_0_3s],
                      ['Desarrollo 3-20s', output.estructura_anuncio_perfecto.tiktok.desarrollo_3_20s],
                      ['Giro/Revelación', output.estructura_anuncio_perfecto.tiktok.giro_o_revelacion],
                      ['CTA final', output.estructura_anuncio_perfecto.tiktok.cta_final],
                    ].map(([label, val]) => (
                      <div key={label as string} className="mb-2.5 last:mb-0">
                        <p className="text-[10px] text-white/30">{label as string}</p>
                        <p className="text-white/80 text-xs mt-0.5 leading-relaxed">{val as string}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button onClick={() => { setPhase('config'); setOutput(null) }}
              className="w-full py-3 rounded-xl border border-white/10 text-white/40 hover:text-white text-sm transition-all">
              ← Generar para otro producto
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
