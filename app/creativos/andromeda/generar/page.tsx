'use client'
export const dynamic = 'force-dynamic'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Página deprecada — reemplazada por /campana (tab Estrategia Meta Ads)
export default function AndromedaGenerarRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/campana') }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-white/40 text-sm">Redirigiendo a Campaña completa...</p>
    </div>
  )
}
