export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Creatives Pro — Plataforma de Creatividades con IA',
  description: 'Genera creativos para Meta Ads, TikTok, Hotmart y más con inteligencia artificial.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
