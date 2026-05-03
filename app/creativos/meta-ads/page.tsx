import WizardPage from '@/components/wizard/WizardPage'

export const dynamic = 'force-dynamic'
export default function MetaAdsPage() {
  return (
    <WizardPage
      tool="meta-ads"
      title="Meta Ads"
      subtitle="Estrategia completa: segmentación, 4 copies con AIDA/PAS/HSO/BAB y creatividades"
      backHref="/crear"
      steps={['Producto', 'Configurar', 'Generar', 'Resultados']}
      requiresProduct={true}
      fields={[
        {
          key: 'publico',
          label: 'Público objetivo',
          type: 'text',
          placeholder: 'Auto-completado desde el producto seleccionado',
          required: true,
        },
        {
          key: 'nivel_conciencia',
          label: 'Nivel de conciencia del público (Eugene Schwartz)',
          type: 'select',
          options: [
            'Nivel 1 — No sabe que tiene el problema → usar curiosidad y disrupción',
            'Nivel 2 — Sabe que sufre pero no busca solución → usar PAS, nombrar el dolor',
            'Nivel 3 — Busca solución, no conoce tu producto → usar AIDA, mostrar la solución',
            'Nivel 4 — Conoce tu producto, no decidió → prueba social, garantías, urgencia',
            'Nivel 5 — Listo para comprar / retargeting → oferta directa, descuento, escasez',
          ],
          required: false,
        },
        {
          key: 'angulo',
          label: 'Ángulo de venta principal',
          type: 'select',
          options: [
            'IA elige el más efectivo para este producto',
            'Resultado / Transformación específica',
            'Dolor / Frustración actual del público',
            'Miedo a quedarse atrás (FOMO)',
            'Curiosidad / Dato disruptivo',
            'Prueba social / Comunidad que ya lo usa',
            'Velocidad / Ahorro de tiempo',
            'Dinero / ROI / Ahorro económico',
            'Exclusividad / Estatus / Premium',
            'Simplicidad / Sin esfuerzo / Fácil',
          ],
          required: false,
        },
        {
          key: 'objetivo',
          label: 'Objetivo de campaña',
          type: 'select',
          options: ['Conversiones / Ventas', 'Tráfico al sitio web', 'Generación de leads', 'Reconocimiento de marca', 'Retargeting — ya visitaron mi tienda'],
          required: false,
        },
        {
          key: 'presupuesto',
          label: 'Presupuesto diario',
          type: 'select',
          options: ['USD 5-10 (principiante / test)', 'USD 10-30 (intermedio)', 'USD 30-100 (escalado)', 'USD 100+ (campañas grandes)'],
          required: false,
        },
        {
          key: 'pais',
          label: 'País/Región de publicación',
          type: 'select',
          options: ['Paraguay', 'Argentina', 'Uruguay', 'Chile', 'Colombia', 'México', 'Perú', 'LATAM completo', 'España', 'Estados Unidos'],
          required: false,
        },
      ]}
    />
  )
}
