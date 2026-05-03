import WizardPage from '@/components/wizard/WizardPage'

export const dynamic = 'force-dynamic'
export default function UGCCreatorPage() {
  return (
    <WizardPage
      tool="ugc-creator"
      title="UGC Creator"
      subtitle="Guiones UGC profesionales para grabar o contratar creadores. Seguros, confiables, que venden."
      backHref="/creativos/ugc"
      steps={['Producto', 'Configurar', 'Generar', 'Resultados']}
      requiresProduct={true}
      fields={[
        {
          key: 'publico',
          label: 'Público objetivo',
          type: 'text',
          placeholder: 'Auto-completado desde el producto seleccionado',
          required: false,
        },
        {
          key: 'tipo_ugc',
          label: 'Tipo de UGC',
          type: 'select',
          options: [
            'Testimonial directo a cámara (1 persona hablando)',
            'Unboxing + primera reacción',
            'Before & After / Transformación',
            'Tutorial — cómo se usa el producto',
            'Día en mi vida + integración del producto',
            'Review honesta + comparación con alternativas',
            'POV — punto de vista del cliente',
            'Trending audio / Video meme con producto',
          ],
          required: false,
        },
        {
          key: 'duracion',
          label: 'Duración del video',
          type: 'select',
          options: ['15 segundos (TikTok/Reels rápido)', '30 segundos (estándar)', '45-60 segundos (completo)', '90 segundos (YouTube Shorts extended)'],
          required: false,
        },
        {
          key: 'perfil_creador',
          label: 'Perfil del creador UGC',
          type: 'select',
          options: [
            'Cliente real satisfecho (auténtico, sin guión rígido)',
            'Micro-influencer (confiable, cercano)',
            'Experto/profesional del nicho',
            'Mamá / persona cotidiana (relatable)',
            'Joven / Gen Z (energético, trending)',
          ],
          required: false,
        },
        {
          key: 'angulo',
          label: 'Ángulo de venta',
          type: 'select',
          options: [
            'IA elige el más efectivo para este producto',
            'Resultado concreto y específico',
            'Frustración con otras alternativas',
            'Descubrimiento / "No sabía que existía"',
            'Recomendación genuina a una amiga',
            'Antes vs Después (transformación visual)',
            'Solución al problema que nadie resuelve',
          ],
          required: false,
        },
        {
          key: 'plataforma',
          label: 'Plataforma destino',
          type: 'select',
          options: ['TikTok', 'Instagram Reels', 'Facebook Reels', 'YouTube Shorts', 'Meta Ads (paid)', 'Multiplataforma'],
          required: false,
        },
      ]}
    />
  )
}
