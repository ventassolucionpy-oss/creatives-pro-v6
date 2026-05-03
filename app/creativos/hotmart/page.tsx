import WizardPage from '@/components/wizard/WizardPage'

export const dynamic = 'force-dynamic'
export default function HotmartPage() {
  return (
    <WizardPage
      tool="hotmart"
      title="Hotmart / Productos Digitales"
      subtitle="Funnel completo: página de ventas, emails, WhatsApp y creatividades"
      backHref="/creativos"
      steps={['Producto', 'Configurar', 'Generar', 'Resultados']}
      requiresProduct={false}
      fields={[
        { key: 'producto', label: 'Nombre del producto digital', type: 'text', placeholder: 'Ej: Curso de Marketing Digital para Emprendedores', required: true },
        { key: 'descripcion', label: 'Descripción del producto', type: 'textarea', placeholder: 'Describí qué enseña el curso, qué problema resuelve, cuál es la transformación prometida...', required: true },
        { key: 'publico', label: 'Público objetivo', type: 'text', placeholder: 'Ej: Emprendedores principiantes 25-45 años que quieren vivir de internet', required: true },
        { key: 'precio', label: 'Precio del producto', type: 'select', options: ['USD 7-17 (tripwire)', 'USD 27-47 (oferta de entrada)', 'USD 97-197 (precio estándar)', 'USD 297-497 (premium)', 'USD 997+ (high ticket)'], required: false },
        { key: 'garantia', label: 'Período de garantía', type: 'select', options: ['7 días', '15 días', '30 días', '60 días', 'Sin garantía'], required: false },
      ]}
    />
  )
}
