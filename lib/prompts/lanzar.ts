export type LaunchOutput = {
  producto: {
    nombre_comercial: string
    promesa: string
    precio_recomendado: string
    precio_tachado: string
    categoria_meta: string
    audiencia: string
    beneficio_principal: string
  }
  prompts_gemini?: Array<{ angulo: string; ratio: string; prompt: string; negativePrompt: string }>
  nicho: {
    score: number
    veredicto: string
    competencia: string
    angulo_ganador: string
    advertencia_principal: string
  }
  rentabilidad: {
    margen_estimado: string
    roas_break_even: string
    presupuesto_minimo: string
    ventas_para_rentable: string
  }
  primer_ad: {
    hook: string
    titular: string
    cuerpo: string
    cta: string
    framework: string
    publico: string
    presupuesto_test: string
  }
  guion_ugc: {
    hook: string
    desarrollo: string
    cta: string
    briefing: string
  }
  landing_prompt: string
  checklist_lanzamiento: Array<{ item: string; critico: boolean; cuando: string }>
  primeras_48h: string[]
  senales_escalar: string[]
  senales_matar: string[]
}

export function buildLaunchPrompt(data: Record<string, string>): string {
  return `Sos un experto en ecommerce, dropshipping y Meta Ads en LATAM con 10+ años y $5M+ en ventas gestionadas. Un operador te trae un producto nuevo y necesita TODO lo que necesita para lanzarlo en los próximos 60 minutos. Sin rodeos, sin relleno — solo lo que sirve para generar la primera venta.

PRODUCTO NUEVO:
- Nombre: ${data.nombre}
- Descripción: ${data.descripcion}
- Costo del producto: Gs. ${parseInt(data.costo_gs || data.costo || '0').toLocaleString('es-PY')} guaraníes
- Precio de venta estimado: Gs. ${data.precio_gs || data.precio || 'a definir'} guaraníes
- País objetivo: ${data.pais || 'Paraguay'}
- Modelo: ${data.modelo || 'Dropshipping'}
- Competencia conocida: ${data.competencia || 'no especificada'}

Tu trabajo: en una sola respuesta, generá EVERYTHING que necesita para lanzar este producto HOY.

Respondé SOLO con JSON válido:
{
  "producto": {
    "nombre_comercial": "nombre optimizado para conversión (sin el nombre genérico de AliExpress)",
    "promesa": "promesa de transformación en 1 línea — lo que va a decir el headline de la landing",
    "precio_recomendado": "precio psicológico optimizado (terminar en 7000 en PYG o .99 en USD)",
    "precio_tachado": "precio de comparación (+70% del precio real)",
    "categoria_meta": "categoría más específica para segmentar en Meta Ads"
  },
  "nicho": {
    "score": 7.5,
    "veredicto": "evaluación brutal y honesta del potencial del producto — 2 líneas",
    "competencia": "nivel real de competencia y cómo diferenciarse",
    "angulo_ganador": "el ángulo de venta que nadie más está usando y que tiene más potencial",
    "advertencia_principal": "el mayor riesgo o problema a tener en cuenta antes de lanzar"
  },
  "rentabilidad": {
    "margen_estimado": "margen bruto estimado en % considerando costo + envío típico",
    "roas_break_even": "ROAS mínimo para no perder dinero",
    "presupuesto_minimo": "presupuesto mínimo para obtener datos estadísticamente válidos",
    "ventas_para_rentable": "cuántas ventas por día necesitás para cubrir el ad spend"
  },
  "primer_ad": {
    "hook": "primera línea que para el scroll — con emoji, máx 10 palabras",
    "titular": "titular del anuncio máx 40 chars",
    "cuerpo": "texto principal completo del anuncio — 3 párrafos conversacionales, segunda persona",
    "cta": "CTA específico orientado a resultado",
    "framework": "AIDA | PAS | HSO | BAB",
    "publico": "público objetivo exacto para Meta: edad, intereses específicos, comportamientos",
    "presupuesto_test": "presupuesto diario para el test inicial y por cuántos días"
  },
  "guion_ugc": {
    "hook": "primeras palabras exactas del video UGC (0-3 segundos)",
    "desarrollo": "guion completo del desarrollo (3-25 segundos) — específico y natural",
    "cta": "CTA final del video",
    "briefing": "instrucciones para el creador: actitud, ropa, fondo, iluminación, qué NO decir"
  },
  "landing_prompt": "prompt completo para pegar en Lovable.dev — describe la landing entera: hero con la promesa, 3 beneficios principales, testimonios placeholder, precio con tachado, garantía, CTA. Incluí colores sugeridos (hex), tipografía y estilo visual.",
  "checklist_lanzamiento": [
    { "item": "verificar que el pixel de Meta está instalado y activo", "critico": true, "cuando": "Antes de activar el ad" },
    { "item": "item 2", "critico": true, "cuando": "cuándo hacerlo" },
    { "item": "item 3", "critico": false, "cuando": "cuándo hacerlo" },
    { "item": "item 4", "critico": true, "cuando": "cuándo hacerlo" },
    { "item": "item 5", "critico": false, "cuando": "cuándo hacerlo" },
    { "item": "item 6", "critico": true, "cuando": "cuándo hacerlo" },
    { "item": "item 7", "critico": false, "cuando": "cuándo hacerlo" },
    { "item": "item 8", "critico": false, "cuando": "cuándo hacerlo" }
  ],
  "primeras_48h": [
    "acción concreta 1 en las primeras 48hs — específica y accionable",
    "acción 2",
    "acción 3",
    "acción 4",
    "acción 5"
  ],
  "senales_escalar": [
    "señal clara de que el producto funciona y hay que escalar",
    "señal 2",
    "señal 3"
  ],
  "senales_matar": [
    "señal clara de que hay que matar el producto y pasar al siguiente",
    "señal 2",
    "señal 3"
  ]
}`
}
