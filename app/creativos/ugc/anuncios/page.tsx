import WizardPage from '@/components/wizard/WizardPage'

export const dynamic = 'force-dynamic'
export default function AnunciosPage() {
  return (
    <WizardPage
      tool="ugc-anuncios"
      title="Creativos UGC — Anuncios"
      subtitle="5 variantes con AIDA, PAS, HSO, BAB y FAB para A/B testing real"
      backHref="/creativos/ugc"
      steps={['Producto', 'Configurar', 'Generar', 'Resultados']}
      requiresProduct={true}
      fields={[
        {
          key: 'precio',
          label: 'Precio de venta',
          type: 'currency',
          required: false,
        },
        {
          key: 'precio_comparacion',
          label: 'Precio de comparación (tachado)',
          type: 'currency',
          required: false,
        },
        {
          key: 'beneficios',
          label: 'Beneficios principales',
          type: 'multiselect',
          required: false,
        },
        {
          key: 'publico',
          label: 'Público objetivo',
          type: 'text',
          placeholder: 'Auto-completado desde el producto seleccionado',
          required: false,
        },
        {
          key: 'nivel_conciencia',
          label: 'Nivel de conciencia del público',
          type: 'select',
          options: [
            'Nivel 1 — No sabe que tiene el problema (público muy frío)',
            'Nivel 2 — Sabe que sufre pero no busca solución (frío)',
            'Nivel 3 — Busca solución pero no conoce tu producto (tibio)',
            'Nivel 4 — Conoce el producto pero no decidió (caliente)',
            'Nivel 5 — Listo para comprar (muy caliente / retargeting)',
          ],
          required: false,
        },
        {
          key: 'angulo',
          label: 'Ángulo de venta principal',
          type: 'select',
          options: [
            'IA elige el más efectivo',
            'Transformación / Resultado final',
            'Dolor / Frustración actual',
            'Miedo a perderse algo (FOMO)',
            'Curiosidad / Disrupción',
            'Prueba social / Lo que usan todos',
            'Ahorro de tiempo / Eficiencia',
            'Ahorro de dinero / ROI',
            'Exclusividad / Estatus',
            'Facilidad / Sin esfuerzo',
          ],
          required: false,
        },
        {
          key: 'objetivo',
          label: 'Objetivo de campaña',
          type: 'select',
          options: ['Generar ventas', 'Captar leads', 'Branding/Awareness', 'Tráfico web', 'Retargeting — ya me conocen'],
          required: false,
        },
        {
          key: 'plataforma',
          label: 'Plataforma',
          type: 'select',
          options: ['Facebook e Instagram (Meta)', 'Solo Instagram', 'Solo Facebook', 'TikTok', 'General'],
          required: false,
        },
        {
          key: 'tono',
          label: 'Tono',
          type: 'select',
          options: ['Cercano y natural (como un amigo)', 'Aspiracional / Inspirador', 'Urgente / Directo', 'Humorístico / Descontracturado', 'Exclusivo / Premium', 'Empático / Comprensivo'],
          required: false,
        },
      ]}
    />
  )
}
