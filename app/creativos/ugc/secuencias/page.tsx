import WizardPage from '@/components/wizard/WizardPage'

export const dynamic = 'force-dynamic'
export default function SecuenciasPage() {
  return (
    <WizardPage
      tool="ugc-secuencias"
      title="Secuencias"
      subtitle="Genera slides para tu landing page o carrusel"
      backHref="/creativos/ugc"
      steps={['Producto', 'Configurar', 'Generar', 'Resultados']}
      requiresProduct={true}
      fields={[
        {
          key: 'tipo_secuencia',
          label: 'Tipo de secuencia',
          type: 'select',
          options: ['Landing vertical 9:16', 'Carrusel cuadrado 1:1', 'Presentación 16:9'],
          required: false,
        },
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
          key: 'objetivo',
          label: 'Objetivo',
          type: 'select',
          options: ['Generar ventas', 'Captar leads', 'Educar', 'Fidelizar'],
          required: false,
        },
      ]}
    />
  )
}
