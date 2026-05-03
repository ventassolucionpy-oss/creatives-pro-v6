'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const STEPS = [
  {
    id: 'bienvenida',
    emoji: '✦',
    titulo: 'Bienvenido a Creatives Pro',
    desc: 'La única herramienta que necesitás para crear campañas de Meta Ads que conviertan. Sin agencias. Sin horas de trabajo.',
    cta: 'Empezar →',
  },
  {
    id: 'que-hace',
    emoji: '⚡',
    titulo: 'Qué podés generar en segundos',
    desc: '',
    items: [
      { icon: '⚡', title: 'Campaña Completa', desc: 'Copies + UGC + emails + WhatsApp + audiencias — todo en un click' },
      { icon: '🌎', title: 'Dropi PY · CO · MX', desc: 'Encontrá productos ganadores + calculadora exacta con flete y COD por país' },
      { icon: '✅', title: 'Validador COD', desc: '14 criterios para saber si un producto va a funcionar antes de comprar stock' },
      { icon: '🛒', title: 'Checkout Dropi', desc: 'Ficha completa del producto — título, descripción, FAQ, garantía y CTA listos' },
      { icon: '📊', title: 'Dashboard KPIs', desc: 'ROAS, CPA, margen neto y tasa de entrega real — tus 5 números del día' },
      { icon: '💎', title: 'Upsell & Bundles', desc: 'Aumentá el ticket promedio un 30-50% con cada pedido sin gastar más en ads' },
      { icon: '🎨', title: 'Creativo Visual', desc: 'Qué imagen crear, texto superpuesto y prompts IA para parar el scroll' },
      { icon: '🧠', title: 'Copy Intelligence', desc: 'IA que aprende de tus campañas y te dice qué copies convierten más' },
    ],
    cta: 'Continuar →',
  },
  {
    id: 'flujo',
    emoji: '🚀',
    titulo: 'El flujo que usarás',
    desc: '',
    flujo: [
      { n: '1', title: 'Validá el producto', desc: 'Dropi PY → Validador COD → Precios Psicológicos → Checkout Dropi' },
      { n: '2', title: 'Conocé al comprador', desc: 'Buyer Persona → 5 ángulos de anuncio listos para Meta y TikTok' },
      { n: '3', title: 'Creá y lanzá', desc: 'Campaña Completa → Comparador de Copies → Creativo Visual → Upsell' },
      { n: '4', title: 'Gestioná y escalá', desc: 'KPIs → War Room → Portfolio → Presupuesto → Post-mortem' },
    ],
    cta: 'Entendido →',
  },
  {
    id: 'nivel',
    emoji: '🎯',
    titulo: '¿Cuánto sabés de Meta Ads?',
    desc: 'Para recomendarte el mejor punto de inicio',
    opciones: [
      { v: 'nuevo', emoji: '🌱', title: 'Recién empiezo', desc: 'Nunca corrí anuncios o tengo poca experiencia' },
      { v: 'intermedio', emoji: '⚡', title: 'Tengo experiencia', desc: 'Corro campañas pero quiero mejorar mis resultados' },
      { v: 'experto', emoji: '🏆', title: 'Soy avanzado', desc: 'Gestiono múltiples campañas y quiero escalar' },
    ],
  },
]

const RECOMENDACIONES: Record<string, { titulo: string; desc: string; href: string; icon: string }[]> = {
  nuevo: [
    { titulo: 'Dropi (PY / CO / MX)', desc: 'Encontrá un producto ganador con la calculadora COD de tu país', href: '/dropi', icon: '🌎' },
    { titulo: 'Validador COD', desc: '14 criterios para validar el producto antes de invertir', href: '/validador-producto', icon: '✅' },
    { titulo: 'Campaña Completa', desc: 'Generá copies, UGC, emails y audiencias en un click', href: '/campana', icon: '⚡' },
  ],
  intermedio: [
    { titulo: 'UGC Anuncios', desc: '5 copies con frameworks para tu próximo A/B test', href: '/creativos/ugc/anuncios', icon: '🎬' },
    { titulo: 'Copy Intelligence', desc: 'Analiza qué está funcionando en tus campañas actuales', href: '/inteligencia', icon: '🧠' },
  ],
  experto: [
    { titulo: 'Copy Intelligence', desc: 'Feedback loop IA sobre qué frameworks te dan más ROAS', href: '/inteligencia', icon: '🧠' },
    { titulo: 'Andromeda', desc: 'Estrategia CBO de dominio con múltiples tipos de creatividad', href: '/creativos/andromeda', icon: '✺' },
  ],
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [nivel, setNivel] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const current = STEPS[step]

  const handleFinish = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && nombre.trim()) {
        await supabase.from('profiles').update({ name: nombre.trim() }).eq('id', user.id)
      }
    } catch {}
    setSaving(false)
    router.push('/inicio')
  }

  const isLastStep = step === STEPS.length

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, #080808 60%)' }}>
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-1.5 mb-8 justify-center">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-violet-600' : 'bg-white/8'} ${i === step ? 'w-8' : 'w-4'}`} />
          ))}
          <div className={`h-1 rounded-full transition-all duration-500 ${isLastStep ? 'bg-violet-600 w-8' : 'bg-white/8 w-4'}`} />
        </div>

        {/* Steps */}
        {!isLastStep && (
          <div className="animate-fade-up">
            {/* Step 0: Bienvenida */}
            {step === 0 && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-4xl mx-auto mb-6">
                  {current.emoji}
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">{current.titulo}</h1>
                <p className="text-white/50 text-base leading-relaxed mb-8 max-w-sm mx-auto">{current.desc}</p>
                <div className="mb-6">
                  <label className="block text-xs text-white/40 mb-2">¿Cómo te llamás? (opcional)</label>
                  <input className="input text-center max-w-xs mx-auto block" placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
                </div>
                <button onClick={() => setStep(1)} className="btn-primary px-10 py-3 text-base">{current.cta}</button>
              </div>
            )}

            {/* Step 1: Qué hace */}
            {step === 1 && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">{current.emoji}</div>
                  <h2 className="text-2xl font-bold text-white mb-2">{current.titulo}</h2>
                </div>
                <div className="space-y-3 mb-6">
                  {current.items?.map((item, i) => (
                    <div key={i} className="card p-4 flex items-start gap-3 animate-fade-up" style={{ animationDelay: `${i*0.1}s` }}>
                      <div className="w-9 h-9 rounded-xl bg-violet-600/20 flex items-center justify-center text-violet-400 flex-shrink-0">{item.icon}</div>
                      <div>
                        <p className="text-white font-semibold text-sm mb-0.5">{item.title}</p>
                        <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep(2)} className="btn-primary w-full py-3">{current.cta}</button>
              </div>
            )}

            {/* Step 2: Flujo */}
            {step === 2 && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">{current.emoji}</div>
                  <h2 className="text-2xl font-bold text-white">{current.titulo}</h2>
                </div>
                <div className="space-y-3 mb-6">
                  {current.flujo?.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 animate-fade-up" style={{ animationDelay: `${i*0.1}s` }}>
                      <div className="w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center text-violet-300 text-xs font-bold flex-shrink-0 mt-0.5">{item.n}</div>
                      <div className="card p-3 flex-1">
                        <p className="text-white font-semibold text-sm mb-0.5">{item.title}</p>
                        <p className="text-white/40 text-xs">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep(3)} className="btn-primary w-full py-3">{current.cta}</button>
              </div>
            )}

            {/* Step 3: Nivel */}
            {step === 3 && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">{current.emoji}</div>
                  <h2 className="text-2xl font-bold text-white mb-2">{current.titulo}</h2>
                  <p className="text-white/40 text-sm">{current.desc}</p>
                </div>
                <div className="space-y-3 mb-6">
                  {current.opciones?.map(op => (
                    <button key={op.v} onClick={() => setNivel(op.v)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${
                        nivel === op.v ? 'border-violet-500/50 bg-violet-500/8' : 'border-white/8 hover:border-white/20'
                      }`}>
                      <span className="text-2xl">{op.emoji}</span>
                      <div>
                        <p className={`font-semibold text-sm ${nivel === op.v ? 'text-violet-300' : 'text-white/80'}`}>{op.title}</p>
                        <p className="text-white/35 text-xs mt-0.5">{op.desc}</p>
                      </div>
                      {nivel === op.v && <span className="ml-auto w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center"><svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>}
                    </button>
                  ))}
                </div>
                <button onClick={() => { if (nivel) setStep(4) }} disabled={!nivel} className="btn-primary w-full py-3">
                  Ver mi plan personalizado →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Final step: Recomendaciones personalizadas */}
        {isLastStep && nivel && (
          <div className="animate-fade-up text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-white mb-2">Tu plan de inicio</h2>
            <p className="text-white/40 text-sm mb-6">Basado en tu experiencia, te recomendamos empezar por:</p>
            <div className="space-y-3 mb-6 text-left">
              {RECOMENDACIONES[nivel]?.map((r, i) => (
                <Link key={i} href={r.href}
                  className="flex items-center gap-3 card p-4 card-hover rounded-xl animate-fade-up"
                  style={{ animationDelay: `${i*0.1}s` }}
                  onClick={() => {
                    // Save profile then redirect
                    handleFinish()
                  }}>
                  <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center text-violet-400 text-lg flex-shrink-0">{r.icon}</div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{r.titulo}</p>
                    <p className="text-white/40 text-xs">{r.desc}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-white/20"><path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              ))}
            </div>
            <button onClick={handleFinish} disabled={saving} className="btn-secondary w-full py-2.5">
              {saving ? 'Guardando...' : 'Ir al dashboard →'}
            </button>
          </div>
        )}

        {/* Skip */}
        {step > 0 && !isLastStep && (
          <button onClick={handleFinish} className="block mx-auto mt-4 text-xs text-white/20 hover:text-white/40 transition-colors">
            Saltar onboarding
          </button>
        )}
      </div>
    </div>
  )
}
