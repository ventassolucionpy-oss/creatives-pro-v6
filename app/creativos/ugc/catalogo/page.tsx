import WizardPage from '@/components/wizard/WizardPage'

export const dynamic = 'force-dynamic'
export default function CatalogoPage() {
  return (
    <WizardPage
      tool="ugc-catalogo"
      title="Catálogo de Producto"
      subtitle="Imágenes de producto fieles al original para catálogos y tiendas"
      backHref="/creativos/ugc"
      steps={['Producto', 'Configurar', 'Generar', 'Resultados']}
      requiresProduct={true}
      fields={[
        {
          key: 'precio',
          label: 'Precio del producto (para incluir en prompts)',
          type: 'currency',
          required: false,
        },
        {
          key: 'angulo',
          label: 'Ángulos preferidos',
          type: 'select',
          options: ['Frontal + 3/4 + Detalle', 'Lifestyle en uso', 'Todos los ángulos', 'Solo fondo blanco'],
          required: false,
        },
        {
          key: 'fondo',
          label: 'Tipo de fondo',
          type: 'select',
          options: ['Blanco puro (Amazon/ecommerce)', 'Lifestyle natural', 'Minimalista gris', 'Degradado suave', 'Mixto'],
          required: false,
        },
      ]}
    />
  )
}
