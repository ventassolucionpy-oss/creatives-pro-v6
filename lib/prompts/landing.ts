export type LandingOutput = {
  estructura: {
    nombre_pagina: string
    paleta: { primario: string; secundario: string; acento: string; fondo: string; texto: string }
    tipografia: { titular: string; cuerpo: string }
    resumen_estrategia: string
  }
  secciones: Array<{
    id: string
    tipo: string
    orden: number
    titulo_seccion: string
    contenido: {
      headline?: string
      subheadline?: string
      cta_texto?: string
      cta_accion?: string
      copy?: string
      bullets?: string[]
      testimonios?: Array<{ nombre: string; cargo: string; texto: string; resultado: string; estrellas: number }>
      garantia?: string
      preguntas?: Array<{ pregunta: string; respuesta: string }>
      urgencia?: string
      precio_tachado?: string
      precio_real?: string
      beneficios?: string[]
      instrucciones_ugc?: string
    }
    instrucciones_diseno: string
    prompt_ugc?: string
  }>
  codigo_lovable: string
  instrucciones_ugc_completas: string
  checklist_conversion: string[]
}

export function buildLandingPrompt(product: Product, config: Record<string, string>): string {
  const publico = config.publico || autoPublico(product)
  return `Sos un experto en Conversion Rate Optimization (CRO), diseño de landing pages de alta conversión y copywriting para ecommerce en LATAM. Has diseñado landing pages que convierten al 8-15% para productos físicos y digitales.

BRIEF:
- Producto: ${product.name}
- Descripción: ${product.description}
- Categoría: ${product.category}
- Público objetivo: ${publico}
- Precio: ${config.precio || 'a definir'}
- Precio tachado (comparación): ${config.precio_comparacion || 'no especificado'}
- Objetivo de conversión: ${config.objetivo_conversion || 'Compra directa'}
- Nivel de conciencia del público: ${config.nivel_conciencia || 'Nivel 3 — Busca solución'}
- Tono de marca: ${config.tono || 'Profesional y cercano'}
- País: ${config.pais || 'Paraguay'}
- ¿Incluir video UGC?: ${config.incluir_ugc === 'si' ? 'SÍ — diseñar sección prominente para video UGC real' : 'NO'}

REGLAS DE CONVERSIÓN MÁXIMA:
1. Headline = promesa de transformación específica en < 10 palabras
2. Subheadline = amplifica la promesa con especificidad y target claro
3. Hero section = beneficio principal + prueba social inmediata + CTA
4. Video UGC = si aplica, va ARRIBA del fold o justo debajo del hero — nunca enterrado
5. Bullets de beneficios = resultado concreto, no features del producto
6. Testimonios = con nombre real, cargo/tipo de cliente, resultado específico medible
7. FAQ = responde las 5 objeciones reales más comunes para este tipo de producto
8. CTA = aparece al menos 3 veces en la página (hero, mitad, final)
9. Urgencia = real y creíble (stock, precio, tiempo), nunca falsa
10. Garantía = prominente y reduce el riesgo percibido

REGLAS PARA LOVABLE.DEV:
- Lovable genera código React/Next.js a partir de prompts en lenguaje natural
- El prompt para Lovable debe ser extremadamente específico y visual
- Describí cada sección con colores exactos (hex), tamaños, espaciados, tipografías, sombras
- Especificá las animaciones (fade-in, slide-up, scroll-triggered)
- Describí el comportamiento del CTA button (hover, active states)
- El código debe ser mobile-first y funcionar perfecto en móvil (70% del tráfico en LATAM)

Respondé SOLO con JSON válido, sin texto extra:
{
  "estructura": {
    "nombre_pagina": "nombre comercial sugerido para la página",
    "paleta": {
      "primario": "#hexcolor — color principal de marca (botones CTA, acentos)",
      "secundario": "#hexcolor — color de fondo de secciones alternadas",
      "acento": "#hexcolor — color de urgencia y destacados",
      "fondo": "#hexcolor — fondo principal (preferentemente oscuro o muy claro)",
      "texto": "#hexcolor — color del texto principal"
    },
    "tipografia": {
      "titular": "nombre de fuente Google para titulares (ej: Playfair Display, Montserrat, Space Grotesk)",
      "cuerpo": "nombre de fuente Google para cuerpo (ej: Inter, DM Sans, Lato)"
    },
    "resumen_estrategia": "explicación de 2-3 líneas de por qué esta estructura convierte para este producto específico"
  },
  "secciones": [
    {
      "id": "hero",
      "tipo": "Hero Section",
      "orden": 1,
      "titulo_seccion": "HERO — Primera impresión",
      "contenido": {
        "headline": "promesa de transformación específica máx 10 palabras",
        "subheadline": "amplificación con especificidad de resultado y target (2 líneas máx)",
        "cta_texto": "texto del botón CTA principal (específico y orientado a resultado)",
        "cta_accion": "descripción de qué hace el botón: scroll a sección compra / link a checkout",
        "copy": "texto de apoyo debajo del CTA (prueba social rápida: ej: +2.300 clientes satisfechos)",
        "bullets": ["beneficio concreto 1 con resultado medible", "beneficio 2", "beneficio 3"]
      },
      "instrucciones_diseno": "Descripción visual MUY detallada para Lovable: layout, colores exactos con hex, tamaño de tipografía, espaciado, imagen de fondo o degradado, posición del producto, badge de garantía, etc.",
      "prompt_ugc": "si incluir_ugc es sí: descripción exacta del video UGC que debe grabar el creador para esta sección (duración, qué decir, qué mostrar, ángulo de cámara)"
    },
    {
      "id": "prueba_social",
      "tipo": "Prueba Social / Trust Badges",
      "orden": 2,
      "titulo_seccion": "CONFIANZA — Logos, números, badges",
      "contenido": {
        "copy": "texto de prueba social cuantificado",
        "bullets": ["dato de prueba social 1 (número específico)", "dato 2", "dato 3"]
      },
      "instrucciones_diseno": "descripción visual detallada para Lovable: badges de confianza, logos de medios, contadores animados, etc."
    },
    {
      "id": "ugc_video",
      "tipo": "Video UGC Principal",
      "orden": 3,
      "titulo_seccion": "VIDEO UGC — Prueba real del producto",
      "contenido": {
        "headline": "titular sobre el video",
        "copy": "texto que contextualiza el video",
        "instrucciones_ugc": "briefing completo para el creador de contenido: qué grabar exactamente, duración, qué decir en cada segundo, ángulo de cámara, iluminación, fondo sugerido, qué ropa usar, resultados a mostrar, errores a evitar"
      },
      "instrucciones_diseno": "descripción visual: cómo mostrar el video en Lovable (reproductor centrado, thumbnail, play button, fondo de sección, texto alrededor)",
      "prompt_ugc": "guion palabra por palabra que debe decir el creador UGC en este video"
    },
    {
      "id": "beneficios",
      "tipo": "Beneficios Detallados",
      "orden": 4,
      "titulo_seccion": "BENEFICIOS — Por qué este producto",
      "contenido": {
        "headline": "titular de sección",
        "beneficios": ["beneficio 1 con descripción de resultado", "beneficio 2", "beneficio 3", "beneficio 4", "beneficio 5"]
      },
      "instrucciones_diseno": "descripción visual: grid de iconos/cards, colores, animaciones al hacer scroll"
    },
    {
      "id": "testimonios",
      "tipo": "Testimonios Reales",
      "orden": 5,
      "titulo_seccion": "TESTIMONIOS — Resultados de clientes",
      "contenido": {
        "headline": "titular de sección",
        "testimonios": [
          { "nombre": "Nombre Apellido", "cargo": "tipo de cliente (ej: Mamá de 3 hijos, Emprendedora 32 años)", "texto": "testimonio específico con resultado concreto en primera persona", "resultado": "resultado medible específico", "estrellas": 5 },
          { "nombre": "...", "cargo": "...", "texto": "...", "resultado": "...", "estrellas": 5 },
          { "nombre": "...", "cargo": "...", "texto": "...", "resultado": "...", "estrellas": 5 }
        ]
      },
      "instrucciones_diseno": "descripción visual: cards de testimonios, fotos de perfil placeholder, estrellas, colores"
    },
    {
      "id": "precio_cta",
      "tipo": "Precio y CTA Principal",
      "orden": 6,
      "titulo_seccion": "OFERTA — Precio y llamada a la acción",
      "contenido": {
        "headline": "titular de la oferta (con urgencia real si aplica)",
        "precio_tachado": "precio de comparación tachado",
        "precio_real": "precio de venta actual",
        "beneficios": ["lo que incluye la compra 1", "lo que incluye 2", "lo que incluye 3"],
        "garantia": "texto de garantía completo (reduce el riesgo percibido)",
        "urgencia": "elemento de urgencia real (stock, tiempo, bonos)",
        "cta_texto": "texto del botón de compra final"
      },
      "instrucciones_diseno": "descripción visual: caja de precio, tachado, badge de ahorro, garantía prominente, CTA grande y llamativo, badge de pago seguro, iconos de medios de pago"
    },
    {
      "id": "faq",
      "tipo": "FAQ — Preguntas frecuentes",
      "orden": 7,
      "titulo_seccion": "FAQ — Respuestas a dudas frecuentes",
      "contenido": {
        "headline": "titular de sección",
        "preguntas": [
          { "pregunta": "objeción real más común para este producto", "respuesta": "respuesta persuasiva que elimina la objeción" },
          { "pregunta": "objeción 2", "respuesta": "..." },
          { "pregunta": "objeción 3", "respuesta": "..." },
          { "pregunta": "objeción 4", "respuesta": "..." },
          { "pregunta": "objeción 5", "respuesta": "..." }
        ]
      },
      "instrucciones_diseno": "descripción visual: acordeón expandible, colores, tipografía"
    },
    {
      "id": "cta_final",
      "tipo": "CTA Final con Urgencia",
      "orden": 8,
      "titulo_seccion": "CTA FINAL — Última oportunidad",
      "contenido": {
        "headline": "titular final de urgencia o transformación",
        "copy": "copy de cierre emocional (1-2 líneas)",
        "urgencia": "elemento de escasez final",
        "cta_texto": "texto del CTA final"
      },
      "instrucciones_diseno": "descripción visual: sección de fondo contrastante, tipografía grande, CTA prominente, sin distracciones"
    }
  ],
  "codigo_lovable": "PROMPT COMPLETO PARA LOVABLE.DEV — texto de 600-900 palabras extremadamente detallado y específico que describe toda la landing page para que Lovable la genere: layout, colores exactos (hex), tipografías, secciones en orden, comportamiento de cada elemento, animaciones, responsivo mobile-first, video UGC embed, botones de compra, badge de garantía, urgencia. Este prompt debe poder copiarse directamente en Lovable y generar una landing page lista para usar.",
  "instrucciones_ugc_completas": "BRIEFING COMPLETO PARA EL CREADOR UGC — texto de 300-400 palabras con instrucciones detalladas para grabar el video UGC que irá en la landing: duración total, guion segundo a segundo, qué mostrar en pantalla, iluminación, fondo, ropa, expresiones, errores comunes a evitar, cómo sostener el producto, qué resultado mostrar antes/después si aplica",
  "checklist_conversion": [
    "elemento de checklist 1 para maximizar conversión antes de publicar",
    "elemento 2",
    "elemento 3",
    "elemento 4",
    "elemento 5",
    "elemento 6",
    "elemento 7",
    "elemento 8"
  ]
}`
}
