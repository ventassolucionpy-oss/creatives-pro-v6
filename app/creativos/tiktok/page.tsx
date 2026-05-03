import WizardPage from '@/components/wizard/WizardPage'

export const dynamic = 'force-dynamic'
export default function TikTokPage() {
  return (
    <WizardPage
      tool="tiktok"
      title="TikTok / TikTok Shop"
      subtitle="Scripts virales y estrategia para TikTok Shop y TikTok Ads"
      backHref="/creativos"
      steps={['Producto', 'Configurar', 'Generar', 'Resultados']}
      requiresProduct={true}
      fields={[
        { key: 'publico', label: 'Público objetivo', type: 'text', placeholder: 'Ej: Jóvenes 18-35 interesados en moda y lifestyle', required: false },
        { key: 'objetivo', label: 'Objetivo', type: 'select', options: ['Ventas en TikTok Shop', 'Tráfico al sitio web', 'Seguidores / Awareness', 'TikTok Ads conversiones'], required: false },
        { key: 'estilo', label: 'Estilo del video', type: 'select', options: ['UGC auténtico (persona hablando)', 'Unboxing / Review', 'Before & After / Transformación', 'Tutorial / Cómo se usa', 'Tendencia viral / Meme', 'Slideshow de imágenes'], required: false },
      ]}
    />
  )
}
