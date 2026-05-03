'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

// Rutas que son "hoja" — muestran botón de volver
const LEAF_ROUTES = [
  '/kpis', '/pedidos', '/hooks-biblioteca', '/comparador-copies', '/postmortem',
  '/presupuesto-escalado', '/alertas', '/portfolio', '/checkout-dropi', '/upsell',
  '/creativo-visual', '/testimonios', '/whatsapp-ventas', '/validador-producto',
  '/precios-psicologicos', '/calendario-contenido', '/contenido-imagen', '/productos',
  '/campana', '/landing', '/tiktok-shop', '/email-flows', '/whatsapp-biz',
  '/customer-service', '/temporadas', '/buyer-persona', '/sourcing', '/lanzar',
  '/nicho', '/rentabilidad', '/meta-tracker', '/tiktok-tracker', '/war-room',
  '/ab-tracker', '/copy-intelligence', '/spy', '/meta-ads-pro', '/organico',
  // v6 new tools
  '/whatsapp-flows', '/oferta-flash', '/roas-simulator', '/logistica-cod',
  '/copy-scorer', '/ugc-review', '/creadores', '/dashboard-pl',
]

type Props = { userName?: string }

const NAV = [
  {
    href: '/inicio',
    label: '🏠',
    title: 'Inicio',
    active: ['/inicio', '/dashboard', '/perfil', '/productos', '/flujo'],
  },
  {
    href: '/dropi',
    label: '🌎',
    title: 'Dropi',
    active: ['/dropi', '/sourcing', '/buyer-persona', '/lanzar', '/nicho', '/rentabilidad', '/validador-producto', '/precios-psicologicos', '/checkout-dropi', '/upsell', '/productos', '/roas-simulator'],
  },
  {
    href: '/crear',
    label: '✦',
    title: 'Crear',
    active: ['/crear', '/campana', '/creativos', '/landing', '/tiktok-shop', '/email-flows', '/whatsapp-biz', '/whatsapp-ventas', '/whatsapp-flows', '/customer-service', '/temporadas', '/testimonios', '/creativo-visual', '/contenido-imagen', '/oferta', '/oferta-flash', '/retencion', '/ugc-review', '/creadores', '/copy-scorer'],
  },
  {
    href: '/gestionar',
    label: '📊',
    title: 'Gestionar',
    active: ['/gestionar', '/tracker', '/meta-tracker', '/tiktok-tracker', '/war-room', '/ab-tracker', '/copy-intelligence', '/historial', '/biblioteca', '/exportar', '/kpis', '/pedidos', '/hooks-biblioteca', '/comparador-copies', '/postmortem', '/presupuesto-escalado', '/alertas', '/portfolio', '/dashboard-pl', '/matriz-creativos', '/autopilot', '/cro', '/logistica-cod', '/roas-simulator'],
  },
  {
    href: '/aprender',
    label: '📚',
    title: 'Aprender',
    active: ['/aprender', '/meta-ads-pro', '/organico', '/spy', '/creativos/andromeda', '/inteligencia', '/calendario-contenido'],
  },
]

export default function Navbar({ userName }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isLeaf = LEAF_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    }
  }

  const isActive = (item: typeof NAV[0]) =>
    item.active.some(a => pathname === a || pathname.startsWith(a + '/'))

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <header
      className="border-b border-white/5 px-4 h-14 flex items-center justify-between sticky top-0 z-50"
      style={{ background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(20px)' }}
    >
      <Link href="/inicio" className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-bold text-white text-sm tracking-tight hidden sm:block">Creatives Pro</span>
      </Link>

      <nav className="flex items-center gap-1">
        {NAV.map(item => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                active
                  ? 'bg-violet-600/20 text-violet-300'
                  : 'text-white/35 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <span className="text-base leading-none">{item.label}</span>
              <span className={`text-[10px] font-semibold leading-none ${active ? 'text-violet-300' : 'text-white/30'}`}>
                {item.title}
              </span>
            </Link>
          )
        })}
      </nav>

      <Link
        href="/perfil"
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
      >
        <div className="w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center text-xs font-semibold text-violet-300">
          {initials}
        </div>
        <span className="text-xs text-white/40 hidden md:block">{userName || 'Perfil'}</span>
      </Link>
    </header>
  )
}
