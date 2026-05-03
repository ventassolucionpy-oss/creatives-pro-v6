'use client'
import { useState, useEffect, useRef } from 'react'
import WizardStepper from '@/components/wizard/WizardStepper'
import ProductSelector from '@/components/wizard/ProductSelector'
import ProductModal from '@/components/wizard/ProductModal'
import ResultsPanel from '@/components/tools/ResultsPanel'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import type { Product, GenerationOutput } from '@/types'

export type FieldConfig = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'toggle' | 'currency' | 'multiselect'
  placeholder?: string
  options?: string[]
  required?: boolean
}

type Props = {
  tool: string
  title: string
  subtitle: string
  backHref: string
  steps: string[]
  fields: FieldConfig[]
  requiresProduct?: boolean
  andromedaData?: { selectedPostTypes?: string[]; business?: string; strategy?: string }
}

// ─────────────────────────────────────────────
// ALL PROMPTS — called directly from browser
// ─────────────────────────────────────────────
const COPY_FRAMEWORK = `
FRAMEWORKS DE COPYWRITING QUE DEBES APLICAR:
1. AIDA — Atención · Interés · Deseo · Acción
2. PAS — Problema · Agitación · Solución (mejor para público frío)
3. FAB — Features · Advantages · Benefits
4. HSO — Hook · Story · Offer (formato nativo Meta)
5. BAB — Before · After · Bridge

REGLAS DE ORO Meta Ads:
- El hook (primera línea) es TODO. Debe parar el scroll.
- Hablar SIEMPRE en segunda persona (vos/tú).
- Beneficios > Features. Especificidad > Generalidad.
- Tono humano, como un amigo que recomienda.
- CTA específico y orientado a resultado.`

function buildPrompt(tool: string, data: Record<string, string>): string {
  const { producto, descripcion, publico, objetivo, plataforma, tono, nivel_conciencia, angulo, categoria, precio, precio_comparacion, beneficios, presupuesto, pais, tipo_secuencia, tipo_ugc, duracion, perfil_creador, fondo, garantia, estilo, angulo: anguloData } = data

  if (tool === 'ugc-anuncios') return `
Sos un estratega de Consumer Psychology y Media Buyer experto en Meta Ads con 10+ años y más de $2M en ad spend gestionado. Tu especialidad es crear anuncios que hablan directo al dolor del buyer ANTES de hablarle del producto.

CONTEXTO DE VENTA — PARAGUAY + DROPI:
- Modelo: Dropshipping con COD (pago contra entrega)
- El comprador paraguayo es desconfiado del ecommerce — cada anuncio tiene que vencer esa barrera
- El precio tiene que aparecer en el anuncio (si no está, el scroll continúa)
- Los testimonios locales ("un señor de Asunción...") convierten más que los genéricos
- El flete de Dropi es Gs. 38.000 estándar — si lo mencionás, usalo como garantía de entrega

ESTUDIO DE MERCADO IMPLÍCITO:
Antes de escribir cada copy, hacé este análisis interno:
1. ¿Qué problema cotidiano resuelve este producto?
2. ¿Cómo describe ese problema el paraguayo con sus propias palabras?
3. ¿Qué ya intentó antes y por qué no le funcionó?
4. ¿Qué miedo tiene al comprar online?
5. ¿A dónde quiere llegar cuando el problema esté resuelto?

Cada anuncio tiene que responder IMPLÍCITAMENTE (sin decirlo directamente):
→ ¿Por qué este producto y no otro?
→ ¿Qué lo diferencia de lo que ya probé?
→ ¿Puedo confiar en este vendedor?
→ ¿Vale el riesgo de pagar contra entrega?

${COPY_FRAMEWORK}

BRIEF:
- Producto: ${producto}
- Descripción: ${descripcion}
- Categoría: ${categoria || 'general'}
- Precio: ${precio || 'no especificado'}
- Beneficios: ${beneficios || 'no especificados'}
- Público objetivo: ${publico || 'audiencia general'}
- Objetivo: ${objetivo || 'Conversiones / Ventas'}
- Plataforma: ${plataforma || 'Facebook e Instagram'}
- Tono: ${tono || 'cercano y persuasivo — como habla un paraguayo real'}
- Nivel de conciencia: ${nivel_conciencia || 'Nivel 2-3'}
- Ángulo: ${angulo || 'IA elige el más efectivo'}

REGLAS DE ORO PARA PARAGUAY:
- Nunca sonar como copy de China/AliExpress — tiene que sonar local
- El hook tiene que nombrar el dolor o el resultado, nunca el producto
- Incluir señal de confianza en cada copy (entrega garantizada, pago al recibir, etc.)
- Usar segunda persona singular (vos/tu) — nunca "usted"
- El CTA tiene que ser específico y orientado a resultado

Generá 5 copies completos con frameworks distintos. Respondé SOLO con JSON válido:
{
  "copies": [
    {
      "id": 1,
      "framework": "AIDA",
      "angulo": "Transformación / Resultado final",
      "nivel_conciencia": 3,
      "hook": "primera línea que para el scroll (máx 10 palabras, con emoji)",
      "titular": "Titular del anuncio (máx 40 chars)",
      "cuerpo": "Texto principal completo. 2-4 párrafos cortos con saltos de línea. Natural, conversacional.",
      "cta": "CTA específico (máx 5 palabras)",
      "por_que_funciona": "1 línea con la psicología detrás",
      "hashtags": ["#tag1","#tag2","#tag3","#tag4"]
    },
    { "id": 2, "framework": "PAS", "angulo": "Dolor / Público frío", "nivel_conciencia": 2, "hook": "...", "titular": "...", "cuerpo": "...", "cta": "...", "por_que_funciona": "...", "hashtags": ["#tag1","#tag2","#tag3","#tag4"] },
    { "id": 3, "framework": "HSO", "angulo": "Historia de identificación", "nivel_conciencia": 2, "hook": "...", "titular": "...", "cuerpo": "...", "cta": "...", "por_que_funciona": "...", "hashtags": ["#tag1","#tag2","#tag3","#tag4"] },
    { "id": 4, "framework": "BAB", "angulo": "Before/After/Bridge", "nivel_conciencia": 3, "hook": "...", "titular": "...", "cuerpo": "...", "cta": "...", "por_que_funciona": "...", "hashtags": ["#tag1","#tag2","#tag3","#tag4"] },
    { "id": 5, "framework": "FAB + Urgencia", "angulo": "Prueba social + Escasez", "nivel_conciencia": 4, "hook": "...", "titular": "...", "cuerpo": "...", "cta": "...", "por_que_funciona": "...", "hashtags": ["#tag1","#tag2","#tag3","#tag4"] }
  ],
  "perfilesAudiencia": [
    { "id": 1, "nombre": "Perfil frío", "temperatura": "frio", "descripcion": "...", "demografia": { "edad": "...", "genero": "...", "ubicacion": ["Paraguay"], "nivel_socioeconomico": "Medio" }, "intereses": ["interés 1","interés 2","interés 3","interés 4"], "comportamientos": ["Compradores online"], "exclusiones": ["Compradores existentes"], "lookalike_fuente": "compradores existentes", "copy_recomendado": "Copy 2 (PAS)", "presupuesto_sugerido": "USD 5-10/día", "objetivo_meta": "AWARENESS" },
    { "id": 2, "nombre": "Perfil tibio", "temperatura": "tibio", "descripcion": "...", "demografia": { "edad": "...", "genero": "...", "ubicacion": ["Paraguay"], "nivel_socioeconomico": "Medio-alto" }, "intereses": ["interés 1","interés 2","interés 3","interés 4"], "comportamientos": ["Compradores online frecuentes"], "exclusiones": ["Compradores existentes"], "lookalike_fuente": "visitantes web", "copy_recomendado": "Copy 1 (AIDA)", "presupuesto_sugerido": "USD 10-15/día", "objetivo_meta": "CONVERSIONS" },
    { "id": 3, "nombre": "Retargeting caliente", "temperatura": "muy_caliente", "descripcion": "Visitaron la tienda pero no compraron", "demografia": { "edad": "mismo rango", "genero": "Todos", "ubicacion": ["Paraguay"], "nivel_socioeconomico": "Medio" }, "intereses": [], "comportamientos": ["Visitaron página de producto"], "exclusiones": ["Compradores existentes"], "lookalike_fuente": "Pixel retargeting 30 días", "copy_recomendado": "Copy 5 (FAB + Urgencia)", "presupuesto_sugerido": "USD 5-8/día", "objetivo_meta": "CONVERSIONS" }
  ],
  "leonardoPrompts": [
    { "id": 1, "uso": "Feed 1:1 principal", "prompt": "photorealistic commercial product photography of ${producto}, lifestyle context, professional lighting, high resolution", "negativePrompt": "text, watermark, blurry, low quality", "settings": { "model": "Leonardo Kino XL", "style": "Commercial Photography", "ratio": "1:1" } },
    { "id": 2, "uso": "Story/Reels 9:16", "prompt": "vertical lifestyle product ad for ${producto}, authentic UGC style, natural lighting", "negativePrompt": "text, watermark, blurry", "settings": { "model": "Leonardo Kino XL", "style": "Lifestyle Photography", "ratio": "9:16" } }
  ],
  "hooksAlternativos": [
    { "copy_id": 1, "hook_original": "hook del copy 1", "variantes": [ { "id": "1a", "hook": "variante pregunta directa", "tipo": "Pregunta", "por_que_probar": "Las preguntas generan pausa cognitiva" }, { "id": "1b", "hook": "variante dato estadístico", "tipo": "Dato", "por_que_probar": "Los números crean credibilidad" } ] }
  ],
  "dallePrompt": "photorealistic product advertisement for ${producto}, professional studio lighting, commercial photography style, high resolution, no text"
}`

  if (tool === 'meta-ads') return `
Sos un Media Buyer y Copywriter experto en Meta Ads con más de $1M en ad spend gestionado. Especializado en campañas de alto ROAS para ecommerce y productos digitales en LATAM.

${COPY_FRAMEWORK}

BRIEF:
- Producto: ${producto}
- Descripción: ${descripcion}
- Categoría: ${categoria}
- Público objetivo: ${publico}
- Objetivo de campaña: ${objetivo || 'Conversiones / Ventas'}
- Presupuesto diario: ${presupuesto || 'USD 10-50'}
- País/Región: ${pais || 'LATAM'}
- Nivel de conciencia: ${nivel_conciencia || 'Nivel 2-3'}
- Ángulo preferido: ${angulo || 'IA elige el más efectivo'}

Generá una estrategia completa de Meta Ads. Respondé SOLO con JSON válido:
{
  "metaAds": {
    "campana": "nombre técnico de campaña",
    "objetivo_meta": "CONVERSIONS",
    "audiencia": {
      "edad": "rango específico",
      "genero": "Todos / Solo mujeres / Solo hombres",
      "intereses": ["interés 1","interés 2","interés 3","interés 4","interés 5"],
      "comportamientos": ["Compradores online","otro comportamiento"],
      "ubicaciones": ["${pais || 'Paraguay'}"],
      "excluir": ["Compradores existentes"]
    },
    "copies": [
      { "id": 1, "framework": "AIDA", "angulo": "Transformación", "nivel_conciencia": 3, "hook": "...", "primario": "texto principal completo con saltos de línea...", "titular": "...", "descripcion": "...", "cta_boton": "SHOP_NOW", "por_que_funciona": "..." },
      { "id": 2, "framework": "PAS", "angulo": "Dolor", "nivel_conciencia": 2, "hook": "...", "primario": "...", "titular": "...", "descripcion": "...", "cta_boton": "LEARN_MORE", "por_que_funciona": "..." },
      { "id": 3, "framework": "HSO", "angulo": "Historia", "nivel_conciencia": 2, "hook": "...", "primario": "...", "titular": "...", "descripcion": "...", "cta_boton": "GET_OFFER", "por_que_funciona": "..." },
      { "id": 4, "framework": "BAB + Urgencia", "angulo": "Before/After + Escasez", "nivel_conciencia": 4, "hook": "...", "primario": "...", "titular": "...", "descripcion": "...", "cta_boton": "SHOP_NOW", "por_que_funciona": "..." }
    ],
    "presupuesto": {
      "diario_recomendado": "USD X-Y",
      "cpm_estimado": "USD X-Y para ${pais || 'Paraguay'}",
      "cpc_estimado": "USD X-Y",
      "roas_objetivo": "X:1"
    },
    "estrategia_ab": "instrucciones de qué testear primero"
  },
  "leonardoPrompts": [
    { "id": 1, "uso": "Feed 1:1", "prompt": "...", "negativePrompt": "...", "settings": { "model": "Leonardo Kino XL", "style": "Commercial Photography", "ratio": "1:1" } },
    { "id": 2, "uso": "Story 9:16", "prompt": "...", "negativePrompt": "...", "settings": { "model": "Leonardo Kino XL", "style": "Lifestyle Photography", "ratio": "9:16" } }
  ],
  "copies": [
    { "id": 1, "framework": "AIDA", "angulo": "Transformación", "nivel_conciencia": 3, "hook": "...", "titular": "...", "cuerpo": "...", "cta": "...", "por_que_funciona": "...", "hashtags": [] },
    { "id": 2, "framework": "PAS", "angulo": "Dolor", "nivel_conciencia": 2, "hook": "...", "titular": "...", "cuerpo": "...", "cta": "...", "por_que_funciona": "...", "hashtags": [] }
  ],
  "dallePrompt": "photorealistic product advertisement for ${producto}, professional lighting, no text"
}`

  if (tool === 'ugc-secuencias') return `
Eres experto en diseño de contenido para landing pages y carruseles de Instagram.

BRIEF:
- Producto: ${producto}
- Descripción: ${descripcion}
- Tipo: ${tipo_secuencia || 'Landing vertical 9:16'}
- Público: ${publico}
- Precio: ${precio || 'no especificado'}
- Precio tachado: ${precio_comparacion || 'no especificado'}
- Beneficios clave: ${beneficios || 'no especificados'}
- Nivel de conciencia: ${nivel_conciencia || 'Nivel 3'}

Genera 5 slides de secuencia. Respondé SOLO con JSON válido:
{
  "secuencias": [
    { "id": 1, "orden": 1, "tipo": "Portada/Hook", "titulo": "...", "descripcion": "...", "prompt": "photorealistic slide visual for ${producto}...", "negativePrompt": "text, watermark, blurry", "ratio": "9:16" },
    { "id": 2, "orden": 2, "tipo": "Problema", "titulo": "...", "descripcion": "...", "prompt": "...", "negativePrompt": "text, watermark, blurry", "ratio": "9:16" },
    { "id": 3, "orden": 3, "tipo": "Solución", "titulo": "...", "descripcion": "...", "prompt": "...", "negativePrompt": "text, watermark, blurry", "ratio": "9:16" },
    { "id": 4, "orden": 4, "tipo": "Beneficios", "titulo": "...", "descripcion": "...", "prompt": "...", "negativePrompt": "text, watermark, blurry", "ratio": "9:16" },
    { "id": 5, "orden": 5, "tipo": "CTA final", "titulo": "...", "descripcion": "...", "prompt": "...", "negativePrompt": "text, watermark, blurry", "ratio": "9:16" }
  ],
  "copies": [
    { "id": 1, "tipo": "Caption para carrusel", "titular": "...", "cuerpo": "...", "cta": "...", "estrategia": "...", "hashtags": ["#tag1","#tag2"] }
  ],
  "dallePrompt": "photorealistic product for ${producto}, studio lighting, no text"
}`

  if (tool === 'ugc-catalogo') return `
Eres experto en fotografía de producto para catálogos de ecommerce.

BRIEF:
- Producto: ${producto}
- Descripción: ${descripcion}
- Ángulo: ${anguloData || 'múltiples ángulos'}
- Fondo: ${fondo || 'blanco limpio y lifestyle'}
- Categoría: ${categoria}

Genera prompts de catálogo. Respondé SOLO con JSON válido:
{
  "catalogoPrompts": [
    { "id": 1, "angulo": "Frontal", "fondo": "Blanco puro", "prompt": "professional product photography, frontal view of ${producto}, pure white background, studio lighting, sharp focus, commercial catalog style", "negativePrompt": "text, watermark, blurry, person", "settings": { "model": "Leonardo Diffusion XL", "ratio": "1:1" } },
    { "id": 2, "angulo": "3/4 vista", "fondo": "Lifestyle", "prompt": "...", "negativePrompt": "text, watermark, blurry", "settings": { "model": "Leonardo Kino XL", "ratio": "4:3" } },
    { "id": 3, "angulo": "Detalle/Zoom", "fondo": "Degradado suave", "prompt": "...", "negativePrompt": "text, watermark, blurry", "settings": { "model": "Leonardo Diffusion XL", "ratio": "1:1" } },
    { "id": 4, "angulo": "Lifestyle en uso", "fondo": "Ambiente natural", "prompt": "...", "negativePrompt": "text, watermark, blurry", "settings": { "model": "Leonardo Kino XL", "ratio": "16:9" } }
  ],
  "copies": [
    { "id": 1, "tipo": "Descripción de producto", "titular": "...", "cuerpo": "...", "cta": "...", "estrategia": "...", "hashtags": [] }
  ],
  "dallePrompt": "professional product photography of ${producto}, white background, studio lighting, no text"
}`

  if (tool === 'ugc-creator') return `
Sos un director creativo de UGC para publicidad de alto rendimiento en LATAM. El UGC que vende suena a una persona real, confiada, específica y humana.

BRIEF: Producto: ${producto} | Descripción: ${descripcion} | Público: ${publico} | Tipo: ${tipo_ugc} | Duración: ${duracion} | Perfil creador: ${perfil_creador} | Ángulo: ${angulo} | Plataforma: ${plataforma}

Generá 3 guiones UGC completos. Respondé SOLO con JSON válido:
{
  "guionesUGC": [
    {
      "id": 1,
      "tipo": "${tipo_ugc || 'Testimonial'}",
      "angulo": "Resultado concreto",
      "duracion_estimada": "${duracion || '30s'}",
      "hook_principal": "primeras palabras exactas que paran el scroll",
      "hook_alternativo": "variante para A/B testing",
      "guion": {
        "apertura": { "segundos": "0-3", "texto": "lo que dice el creador", "visual": "descripción de cámara", "nota_actuacion": "cómo debe sonar" },
        "desarrollo": { "segundos": "3-24", "texto": "texto completo conversacional y específico", "visual": "planos y acciones", "nota_actuacion": "tono y energía" },
        "cierre_cta": { "segundos": "24-30", "texto": "CTA como recomendación genuina", "visual": "cierre", "nota_actuacion": "convicción" }
      },
      "briefing_creador": "instrucciones completas: actitud, ropa, fondo, qué NO decir",
      "variante_b": "hook alternativo para probar"
    },
    { "id": 2, "tipo": "...", "angulo": "Frustración con alternativas", "duracion_estimada": "...", "hook_principal": "...", "hook_alternativo": "...", "guion": { "apertura": { "segundos": "0-3", "texto": "...", "visual": "...", "nota_actuacion": "..." }, "desarrollo": { "segundos": "3-24", "texto": "...", "visual": "...", "nota_actuacion": "..." }, "cierre_cta": { "segundos": "24-30", "texto": "...", "visual": "...", "nota_actuacion": "..." } }, "briefing_creador": "...", "variante_b": "..." },
    { "id": 3, "tipo": "...", "angulo": "Descubrimiento", "duracion_estimada": "...", "hook_principal": "...", "hook_alternativo": "...", "guion": { "apertura": { "segundos": "0-3", "texto": "...", "visual": "...", "nota_actuacion": "..." }, "desarrollo": { "segundos": "3-24", "texto": "...", "visual": "...", "nota_actuacion": "..." }, "cierre_cta": { "segundos": "24-30", "texto": "...", "visual": "...", "nota_actuacion": "..." } }, "briefing_creador": "...", "variante_b": "..." }
  ],
  "leonardoPrompts": [
    { "id": 1, "uso": "Thumbnail 9:16", "prompt": "lifestyle ugc style photo for ${producto}, authentic, natural lighting, person using product", "negativePrompt": "studio, fake, blurry", "settings": { "model": "Leonardo Kino XL", "style": "Lifestyle Photography", "ratio": "9:16" } }
  ],
  "copies": [
    { "id": 1, "framework": "PAS", "angulo": "Copy para pautar el UGC", "nivel_conciencia": 2, "hook": "...", "titular": "...", "cuerpo": "...", "cta": "...", "por_que_funciona": "...", "hashtags": [] }
  ],
  "dallePrompt": "ugc style product photo for ${producto}, authentic lifestyle, natural lighting, no text"
}`

  if (tool === 'tiktok') return `
Sos un experto en TikTok Shop para Paraguay y LATAM con $1M+ gestionado en esta plataforma. Conocés el algoritmo de TikTok: los primeros 0.5 segundos visuales son todo.

CONTEXTO TIKTOK SHOP PARAGUAY:
- El hook visual (primer frame) detiene el scroll — más importante que el audio
- Los primeros 3 segundos determinan el 80% del watch rate
- En Paraguay el COD funciona también en TikTok Shop — mencionarlo genera confianza
- Los videos que muestran el problema ANTES de mostrar el producto convierten 3x más
- Los comentarios de "dónde lo compro" son la mejor señal de que el hook funcionó
- La música trending baja el CPM hasta 30% en TikTok Ads

BUYER PSYCHOLOGY PARA TIKTOK:
El usuario de TikTok en Paraguay está en modo entretenimiento — no en modo compra.
Tu video tiene que:
1. Interrumpir con un hook que lo haga sentir identificado ("Eso me pasa a mí")
2. Mostrar el problema de forma exagerada pero real
3. Revelar la solución de forma satisfactoria (como un "ahora tiene sentido")
4. El CTA tiene que sonar como un consejo de amigo, no como un vendedor

ESTUDIO DE MERCADO IMPLÍCITO:
Antes de escribir, analizá:
- ¿Qué dolor resuelve este producto? ¿Cómo lo viviría un paraguayo en su día a día?
- ¿Qué objeción principal tiene el buyer? Respondela en el video implícitamente.
- ¿Qué diferencia a este producto de lo que el buyer ya conoce?

BRIEF: Producto: ${producto} | Descripción: ${descripcion} | Público: ${publico} | Objetivo: ${objetivo || 'ventas TikTok Shop'} | Categoría: ${categoria} | Precio: ${precio || 'no especificado'}

Genera estrategia TikTok completa. Respondé SOLO con JSON válido:
{
  "tiktokScript": {
    "guion": [
      { 
        "hook_visual": "qué se ve en el primer frame ANTES de cualquier audio — qué detiene el scroll visualmente",
        "hook_audio": "las primeras palabras exactas 0-3 segundos — usando el lenguaje del buyer paraguayo",
        "desarrollo": "desarrollo completo 3-20 segundos — qué mostrar, qué decir, en qué orden. Nombrar el problema con las palabras del buyer antes de mostrar la solución.",
        "giro": "el momento de reveal o sorpresa que mantiene al espectador",
        "cta": "CTA final — suena como consejo de amigo, no como vendedor. Incluir señal de confianza (COD, envío garantizado)",
        "duracion": "15-20 segundos (óptimo para TikTok Shop)",
        "musica_sugerida": "tipo de música trending — descripción del mood/ritmo"
      },
      { 
        "hook_visual": "variante 2 — diferente ángulo de entrada",
        "hook_audio": "...",
        "desarrollo": "desarrollo alternativo — mismo producto, diferente problema que resuelve",
        "giro": "...",
        "cta": "...",
        "duracion": "20-30 segundos",
        "musica_sugerida": "..."
      }
    ],
    "hashtags": ["#Paraguay","#TikTokShop","#fyp","#tag4","#tag5","#tag6","#tag7","#tag8"],
    "caption": "Caption completo con el mismo hook del video + emojis + CTA + hashtags — en español paraguayo natural"
  },
  "copies": [
    { 
      "id": 1, 
      "tipo": "Ad copy TikTok In-Feed", 
      "titular": "...", 
      "cuerpo": "copy completo para In-Feed ad — nombra el problema, ofrece la solución, incluye señal de confianza y precio visible",
      "cta": "...", 
      "estrategia": "por qué este copy conecta con el buyer de TikTok en Paraguay",
      "hashtags": ["#fyp","#Paraguay","#TikTokShop"] 
    }
  ],
  "dallePrompt": "dynamic lifestyle product visual for tiktok ad, ${producto}, vibrant authentic style, person using product, no text"
}`

  if (tool === 'hotmart') return `
Eres un experto en marketing digital y ventas de productos digitales en Hotmart.

BRIEF: Producto: ${producto} | Descripción: ${descripcion} | Público: ${publico} | Precio: ${precio || 'USD 47-197'} | Garantía: ${garantia || '7 días'}

Genera funnel completo. Respondé SOLO con JSON válido:
{
  "hotmartFunnel": {
    "producto": { "nombre": "nombre comercial optimizado", "promesa": "promesa de transformación en 1 línea", "publico": "${publico}", "precio_sugerido": "...", "garantia": "${garantia || '7 días'}" },
    "pagina_ventas": {
      "headline": "Headline principal poderoso orientado a transformación",
      "subheadline": "Subheadline que amplifica la promesa",
      "beneficios": ["Beneficio 1 orientado a resultado", "Beneficio 2", "Beneficio 3", "Beneficio 4", "Beneficio 5"],
      "objeciones": ["Objeción 1 y cómo rebatirla", "Objeción 2"],
      "testimonios_ficticios": ["Testimonio con nombre y resultado específico", "Testimonio 2", "Testimonio 3"],
      "cta_principal": "texto del botón de compra"
    },
    "emails": [
      { "tipo": "Bienvenida", "asunto": "...", "cuerpo": "cuerpo completo del email..." },
      { "tipo": "Seguimiento día 2", "asunto": "...", "cuerpo": "..." },
      { "tipo": "Urgencia/Cierre", "asunto": "...", "cuerpo": "..." }
    ],
    "whatsapp_scripts": ["Script completo para primer contacto...", "Script de seguimiento..."]
  },
  "copies": [
    { "id": 1, "tipo": "Anuncio Meta Ads para producto digital", "titular": "...", "cuerpo": "...", "cta": "...", "estrategia": "...", "hashtags": [] }
  ],
  "dallePrompt": "digital product mockup for ${producto}, professional design, no text"
}`

  if (tool === 'andromeda-meta-ads') return `
Sos un Media Buyer experto en Meta Ads. Generá una estrategia completa incluyendo copies para TODOS estos tipos de creatividad: ${data.andromeda_tipos || 'imagen estática, video UGC, carrusel'}.

Estrategia: ${data.andromeda_strategy_name || 'escalado'}
Negocio: ${data.andromeda_business || 'dropshipping'}

BRIEF: Producto: ${producto} | Descripción: ${descripcion} | Público: ${publico || 'audiencia general'} | Nivel: ${data.nivel_conciencia || 'Nivel 3'} | Presupuesto: ${presupuesto || 'USD 10-30/día'} | País: ${pais || 'Paraguay'}

${COPY_FRAMEWORK}

Generá copies y prompts específicos para cada tipo de creatividad solicitado. Respondé SOLO con JSON válido:
{
  "copies": [
    { "id": 1, "framework": "AIDA", "angulo": "Transformación", "nivel_conciencia": 3, "hook": "...", "titular": "...", "cuerpo": "texto completo del copy...", "cta": "...", "por_que_funciona": "...", "hashtags": ["#tag1","#tag2"] },
    { "id": 2, "framework": "PAS", "angulo": "Dolor", "nivel_conciencia": 2, "hook": "...", "titular": "...", "cuerpo": "...", "cta": "...", "por_que_funciona": "...", "hashtags": ["#tag1","#tag2"] },
    { "id": 3, "framework": "HSO", "angulo": "Historia", "nivel_conciencia": 2, "hook": "...", "titular": "...", "cuerpo": "...", "cta": "...", "por_que_funciona": "...", "hashtags": ["#tag1","#tag2"] }
  ],
  "leonardoPrompts": [
    { "id": 1, "uso": "Creatividad principal para esta estrategia", "prompt": "photorealistic commercial ad for ${producto}...", "negativePrompt": "text, watermark, blurry", "settings": { "model": "Leonardo Kino XL", "style": "Commercial Photography", "ratio": "1:1" } }
  ],
  "dallePrompt": "professional product advertisement for ${producto}, commercial photography, no text"
}`

  return `Generá contenido de marketing para: ${producto}. ${descripcion}. Público: ${publico}. Respondé con JSON: { "copies": [{ "id": 1, "titular": "...", "cuerpo": "...", "cta": "..." }] }`
}

// ─────────────────────────────────────────────
// CALL ANTHROPIC DIRECTLY FROM BROWSER
// ─────────────────────────────────────────────
async function callClaude(prompt: string): Promise<GenerationOutput> {
  const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('Falta la clave NEXT_PUBLIC_ANTHROPIC_API_KEY en las variables de entorno.')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Error API Anthropic (${res.status})`)
  }

  const data = await res.json()
  const raw: string = data.content?.[0]?.text || ''

  let clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const jsonStart = clean.indexOf('{')
  const jsonEnd = clean.lastIndexOf('}')
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    clean = clean.slice(jsonStart, jsonEnd + 1)
  }

  try {
    return JSON.parse(clean) as GenerationOutput
  } catch {
    throw new Error('La IA no devolvió un formato válido. Intentá de nuevo.')
  }
}

// ─────────────────────────────────────────────
// AUTO PÚBLICO FROM PRODUCT
// ─────────────────────────────────────────────
function generatePublicoFromProduct(product: Product): string {
  const desc = (product.description || '').toLowerCase()
  const cat = product.category
  if (cat === 'digital') {
    if (desc.match(/trading|inversión|finanzas/)) return 'Hombres y mujeres 25-45, interesados en finanzas e inversión, ingresos medios-altos, LATAM'
    if (desc.match(/fitness|ejercicio|gym/)) return 'Hombres y mujeres 20-40, apasionados por el fitness, que buscan mejorar su físico, clase media, LATAM'
    if (desc.match(/negocio|emprendimiento|marketing|ventas/)) return 'Emprendedores 22-45, dueños de pequeños negocios, interesados en crecer sus ventas digitalmente, LATAM'
    return 'Personas 25-45 interesadas en aprendizaje online y crecimiento personal, clase media-alta, LATAM'
  }
  if (cat === 'fisico') {
    if (desc.match(/belleza|skin|crema|facial|piel/)) return 'Mujeres 25-45, interesadas en skincare y cuidado personal, clase media-alta, Paraguay y LATAM'
    if (desc.match(/mascotas?|perro|gato/)) return 'Propietarios de mascotas 22-50, que tratan a sus mascotas como familia, ingresos medios, Paraguay'
    if (desc.match(/bebé|bebe|niño|infantil/)) return 'Mamás y papás 25-40 con hijos de 0-8 años, que priorizan calidad, clase media, Paraguay'
    if (desc.match(/tecnología|gadget|electrónico/)) return 'Hombres 18-40, tech enthusiasts, early adopters, poder adquisitivo medio-alto, Paraguay'
    return 'Compradores online 22-45 que buscan calidad-precio y envío rápido, clase media, Paraguay'
  }
  return `Personas 25-45 interesadas en ${product.name}, que buscan resultados comprobados, clase media, LATAM`
}

// ─────────────────────────────────────────────
// AWARENESS SUGGESTIONS
// ─────────────────────────────────────────────
const NIVEL_SUGGESTIONS: Record<string, { angulo: string[]; objetivo: string[]; tono: string[]; razon: string }> = {
  '1': { angulo: ['Curiosidad / Disrupción'], objetivo: ['Branding/Awareness', 'Tráfico web'], tono: ['Cercano y natural (como un amigo)'], razon: 'Público muy frío — usá curiosidad o disrupción. Evitá vender directamente.' },
  '2': { angulo: ['Dolor / Frustración actual'], objetivo: ['Tráfico web', 'Captar leads'], tono: ['Empático / Comprensivo'], razon: 'Sienten el dolor pero no buscan solución. Nombrá exactamente su frustración con PAS.' },
  '3': { angulo: ['Transformación / Resultado final'], objetivo: ['Generar ventas', 'Captar leads'], tono: ['Aspiracional / Inspirador', 'Urgente / Directo'], razon: 'El punto dulce de conversión. Ya buscan solución. AIDA o BAB convierten mejor aquí.' },
  '4': { angulo: ['Miedo a perderse algo (FOMO)', 'Prueba social / Lo que usan todos'], objetivo: ['Generar ventas', 'Retargeting — ya me conocen'], tono: ['Urgente / Directo'], razon: 'Te conocen pero no compraron. Eliminá objeciones con testimonios y creá urgencia genuina.' },
  '5': { angulo: ['Miedo a perderse algo (FOMO)'], objetivo: ['Retargeting — ya me conocen', 'Generar ventas'], tono: ['Urgente / Directo'], razon: 'Listos para comprar. Sé 100% directo: oferta clara, urgencia real, sin historias.' },
}

function getNivelNum(val: string): string | null {
  if (val.includes('Nivel 1')) return '1'
  if (val.includes('Nivel 2')) return '2'
  if (val.includes('Nivel 3')) return '3'
  if (val.includes('Nivel 4')) return '4'
  if (val.includes('Nivel 5')) return '5'
  return null
}

function AwarenessBanner({ nivel, fields, formData, onSet }: { nivel: string; fields: FieldConfig[]; formData: Record<string, string>; onSet: (k: string, v: string) => void }) {
  const num = getNivelNum(nivel)
  if (!num) return null
  const s = NIVEL_SUGGESTIONS[num]
  const anguloField = fields.find(f => f.key === 'angulo')
  const objetivoField = fields.find(f => f.key === 'objetivo')
  const tonoField = fields.find(f => f.key === 'tono')
  const getOpt = (field: FieldConfig | undefined, candidates: string[]) => {
    if (!field?.options) return candidates[0]
    for (const c of candidates) { const f = field.options.find(o => o.includes(c.slice(0, 10))); if (f) return f }
    return candidates[0]
  }
  return (
    <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/6 animate-fade-up">
      <p className="text-violet-300 text-xs font-bold mb-1">🧠 Sugerencias del experto — Nivel {num}</p>
      <p className="text-white/45 text-[11px] mb-3 leading-relaxed">{s.razon}</p>
      <div className="space-y-2">
        {anguloField && s.angulo.map(a => { const opt = getOpt(anguloField, [a]); return (
          <div key={a} className="flex items-center gap-2">
            <span className="text-white/25 text-[10px] w-14">Ángulo:</span>
            <button onClick={() => onSet('angulo', opt)} className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${formData['angulo']===opt ? 'border-violet-400 bg-violet-500/25 text-violet-200' : 'border-violet-500/35 bg-violet-500/8 text-violet-300 hover:bg-violet-500/18'}`}>{formData['angulo']===opt ? '✓ ' : ''}{a.split('/')[0].trim()}</button>
          </div>
        )})}
        {objetivoField && s.objetivo.slice(0,2).map(o => { const opt = getOpt(objetivoField, [o]); return (
          <div key={o} className="flex items-center gap-2">
            <span className="text-white/25 text-[10px] w-14">Objetivo:</span>
            <button onClick={() => onSet('objetivo', opt)} className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${formData['objetivo']===opt ? 'border-emerald-400 bg-emerald-500/25 text-emerald-200' : 'border-emerald-500/35 bg-emerald-500/8 text-emerald-300 hover:bg-emerald-500/18'}`}>{formData['objetivo']===opt ? '✓ ' : ''}{o.split('/')[0].split('—')[0].trim()}</button>
          </div>
        )})}
        {tonoField && s.tono.slice(0,1).map(t => { const opt = getOpt(tonoField, [t]); return (
          <div key={t} className="flex items-center gap-2">
            <span className="text-white/25 text-[10px] w-14">Tono:</span>
            <button onClick={() => onSet('tono', opt)} className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${formData['tono']===opt ? 'border-amber-400 bg-amber-500/25 text-amber-200' : 'border-amber-500/35 bg-amber-500/8 text-amber-300 hover:bg-amber-500/18'}`}>{formData['tono']===opt ? '✓ ' : ''}{t.split('(')[0].trim()}</button>
          </div>
        )})}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// BENEFICIOS MULTISELECT
// ─────────────────────────────────────────────
const BENEFICIOS_PRESET = ['Envío gratis','Pagás al recibir','Garantía incluida','Envío en 24hs','Stock limitado','Precio especial hoy','Oferta por tiempo limitado','Producto original','Últimas unidades','Cuotas sin interés','Devolución garantizada','Atención por WhatsApp']

function BeneficiosMultiSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [custom, setCustom] = useState('')
  const selected = value ? value.split(',').map(s => s.trim()).filter(Boolean) : []
  const toggle = (b: string) => { const next = selected.includes(b) ? selected.filter(s => s !== b) : [...selected, b]; onChange(next.join(', ')) }
  const addCustom = () => { if (!custom.trim() || selected.includes(custom.trim())) return; onChange([...selected, custom.trim()].join(', ')); setCustom('') }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {BENEFICIOS_PRESET.map(b => (
          <button key={b} type="button" onClick={() => toggle(b)} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selected.includes(b) ? 'border-violet-500/60 bg-violet-500/20 text-violet-200 font-medium' : 'border-white/10 bg-white/3 text-white/40 hover:border-white/25 hover:text-white/70'}`}>
            {selected.includes(b) ? '✓ ' : ''}{b}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="input flex-1 text-sm" placeholder="Agregar beneficio personalizado..." value={custom} onChange={e => setCustom(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())} />
        <button type="button" onClick={addCustom} className="btn-secondary text-xs px-3 py-2 flex-shrink-0">+ Agregar</button>
      </div>
      {selected.length > 0 && <p className="text-white/25 text-[10px]">Seleccionados: {selected.join(' · ')}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────
// CURRENCY FIELD
// ─────────────────────────────────────────────
const CURRENCIES = [{ value: 'PYG', symbol: 'Gs.', flag: '🇵🇾' }, { value: 'USD', symbol: '$', flag: '🇺🇸' }]

// Redondea al múltiplo de 7000 más cercano hacia abajo, terminando en X7000
function roundTo7k(n: number): number {
  return Math.floor(n / 7000) * 7000 || n
}
function formatPYG(n: number): string {
  return n.toLocaleString('es-PY')
}

function CurrencyField({ value, onChange, fieldKey, onComparisonChange }: {
  value: string
  onChange: (v: string) => void
  fieldKey?: string
  onComparisonChange?: (v: string) => void
}) {
  const [currency, setCurrency] = useState('PYG')
  const cur = CURRENCIES.find(c => c.value === currency) || CURRENCIES[0]

  const handleCur = (newCur: string) => {
    setCurrency(newCur)
    const raw = value.replace(/^(Gs\.|[$])\s*/, '').replace(/\./g, '').replace(/,/g, '')
    const sym = newCur === 'PYG' ? 'Gs.' : '$'
    onChange(raw ? `${sym} ${raw}` : '')
  }

  const handleAmt = (amt: string) => {
    // Remove formatting dots for parsing
    const clean = amt.replace(/\./g, '').replace(/,/g, '')
    onChange(clean ? `${cur.symbol} ${clean}` : '')
  }

  const handleBlur = () => {
    if (fieldKey !== 'precio') return
    const raw = value.replace(/^(Gs\.|[$])\s*/, '').replace(/\./g, '').replace(/,/g, '')
    const num = parseInt(raw, 10)
    if (!num || isNaN(num)) return

    if (currency === 'PYG') {
      const rounded = roundTo7k(num)
      const formatted = formatPYG(rounded)
      onChange(`Gs. ${formatted}`)
      // Auto-fill precio de comparación: +70%, también redondeado a 7k
      if (onComparisonChange) {
        const comp = roundTo7k(Math.round(rounded * 1.7))
        onComparisonChange(`Gs. ${formatPYG(comp)}`)
      }
    }
  }

  const raw = value.replace(/^(Gs\.|[$])\s*/, '')

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {CURRENCIES.map(c => <button key={c.value} type="button" onClick={() => handleCur(c.value)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${currency===c.value ? 'border-violet-500 bg-violet-500/20 text-violet-300' : 'border-white/10 bg-white/5 text-white/40 hover:text-white/70'}`}><span>{c.flag}</span><span>{c.value}</span></button>)}
      </div>
      <div className="flex items-center gap-2 input px-3">
        <span className="text-white/40 text-sm font-mono flex-shrink-0">{cur.symbol}</span>
        <input
          className="flex-1 bg-transparent outline-none text-white text-sm"
          placeholder={currency==='PYG' ? '150.000' : '29.99'}
          value={raw}
          onChange={e => handleAmt(e.target.value)}
          onBlur={handleBlur}
        />
        <span className="text-white/20 text-xs">{currency}</span>
      </div>
      {fieldKey === 'precio' && currency === 'PYG' && raw && (
        <p className="text-white/25 text-[10px]">Al salir del campo: redondea al X7.000 más cercano y calcula precio tachado (+70%) automáticamente</p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// IMAGE UPLOAD + AI ANALYSIS
// ─────────────────────────────────────────────
function ProductImageUpload({ onAnalyzed }: { onAnalyzed: (data: Record<string, string>) => void }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const analyze = async (file: File) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      const base64 = dataUrl.split(',')[1]
      setPreview(dataUrl); setAnalyzing(true); setErr(''); setDone(false)
      const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
      if (!apiKey) { setErr('Falta NEXT_PUBLIC_ANTHROPIC_API_KEY'); setAnalyzing(false); return }
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
          body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 500, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: file.type, data: base64 } }, { type: 'text', text: 'Analizá esta imagen de producto. SOLO JSON sin backticks:\n{"nombre":"nombre del producto","descripcion":"descripción breve","categoria":"fisico|digital|servicio","beneficios":"beneficio1, beneficio2, beneficio3","publico":"público objetivo con demografía LATAM"}' }] }] })
        })
        if (!res.ok) throw new Error('API error')
        const d = await res.json()
        const text = d.content?.[0]?.text || ''
        const parsed = JSON.parse(text.replace(/```json|```/g,'').trim())
        setDone(true); onAnalyzed(parsed)
      } catch { setErr('No se pudo analizar. Completá los campos manualmente.') }
      setAnalyzing(false)
    }
    reader.readAsDataURL(file)
  }
  return (
    <div className="card p-4 border border-violet-500/15 bg-violet-500/3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-violet-400 text-xs font-bold">📸 Imagen del producto</span>
        <span className="text-white/20 text-[10px]">— la IA captura los datos automáticamente</span>
      </div>
      {!preview ? (
        <div className="border-2 border-dashed border-white/10 rounded-xl p-5 text-center cursor-pointer hover:border-violet-500/30 transition-all" onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) analyze(f) }}>
          <div className="text-2xl mb-1.5">🖼️</div>
          <p className="text-white/35 text-xs">Arrastrá o hacé click para subir</p>
          <p className="text-white/20 text-[10px] mt-0.5">La IA pre-completará los campos automáticamente</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) analyze(f) }} />
        </div>
      ) : (
        <div className="flex gap-3 items-center">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
            <img src={preview} alt="producto" className="w-full h-full object-cover" />
            <button onClick={() => { setPreview(null); setDone(false); setErr('') }} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white text-[9px] flex items-center justify-center hover:bg-red-500/80">✕</button>
          </div>
          <div>
            {analyzing && <div className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin"/><p className="text-violet-300 text-xs">Analizando con IA...</p></div>}
            {done && <p className="text-emerald-400 text-xs font-medium">✓ Campos pre-completados desde la imagen</p>}
            {err && <p className="text-red-400 text-xs">{err}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function WizardPage({ tool, title, subtitle, backHref, steps, fields, requiresProduct = true, andromedaData }: Props) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [output, setOutput] = useState<GenerationOutput | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const totalSteps = steps.length
  const setField = (key: string, val: string) => setFormData(p => ({ ...p, [key]: val }))

  useEffect(() => {
    if (selectedProduct && fields.some(f => f.key === 'publico')) {
      setFormData(p => ({ ...p, publico: p.publico || generatePublicoFromProduct(selectedProduct) }))
    }
  }, [selectedProduct?.id])

  const handleImageAnalyzed = (data: Record<string, string>) => {
    setFormData(p => ({
      ...p,
      ...(data.beneficios && !p.beneficios ? { beneficios: data.beneficios } : {}),
      ...(data.publico && !p.publico ? { publico: data.publico } : {}),
    }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true); setError(''); setOutput(null)
    try {
      const payload: Record<string, string> = {
        tool,
        producto: selectedProduct?.name || formData.producto || '',
        descripcion: selectedProduct?.description || formData.descripcion || '',
        categoria: selectedProduct?.category || 'fisico',
        ...formData,
        ...(andromedaData ? { andromeda_tipos: andromedaData.selectedPostTypes?.join(',') || '', andromeda_business: andromedaData.business || '', andromeda_strategy: andromedaData.strategy || '' } : {}),
      }
      const prompt = buildPrompt(tool, payload)
      const result = await callClaude(prompt)
      setOutput(result)
      setCurrentStep(totalSteps)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
    setIsGenerating(false)
  }

  const canProceed = () => {
    if (currentStep === 1 && requiresProduct) return !!selectedProduct
    if (currentStep === 2) return fields.filter(f => f.required).every(f => formData[f.key]?.trim())
    return true
  }

  const inputClass = 'input'
  const labelClass = 'block text-xs font-medium text-white/40 mb-1.5'
  const nivelVal = formData['nivel_conciencia'] || ''

  return (
    <div className="min-h-screen">
      <Navbar />
      {showProductModal && <ProductModal onClose={() => setShowProductModal(false)} onCreated={(p) => { setSelectedProduct(p); setShowProductModal(false) }} />}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href={backHref} className="btn-ghost text-white/30 hover:text-white p-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">{title}</h1>
            <p className="text-white/40 text-xs">{subtitle}</p>
          </div>
        </div>

        <WizardStepper steps={steps} currentStep={currentStep} />

        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-up">
            <ProductImageUpload onAnalyzed={handleImageAnalyzed} />
            {requiresProduct ? (
              <ProductSelector selectedProductId={selectedProduct?.id || null} onSelect={p => setSelectedProduct(p)} onCreateNew={() => setShowProductModal(true)} />
            ) : (
              <div className="card p-5 space-y-4">
                <h3 className="font-semibold text-white text-sm">Información del producto</h3>
                <div><label className={labelClass}>Nombre *</label><input className={inputClass} value={formData.producto||''} onChange={e => setField('producto',e.target.value)} placeholder="Nombre del producto" /></div>
                <div><label className={labelClass}>Descripción *</label><textarea className={`${inputClass} resize-none h-20`} value={formData.descripcion||''} onChange={e => setField('descripcion',e.target.value)} placeholder="Describí el producto en detalle..." /></div>
              </div>
            )}
            {selectedProduct && (
              <div className="card p-4 border border-violet-500/20 bg-violet-500/5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <p className="text-white/50 text-xs">IA genera creatividades para <strong className="text-white">{selectedProduct.name}</strong></p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="card p-5 space-y-5 animate-fade-up">
            <h3 className="font-semibold text-white text-sm mb-1">Configuración</h3>
            {nivelVal && <AwarenessBanner nivel={nivelVal} fields={fields} formData={formData} onSet={setField} />}
            {fields.map(field => (
              <div key={field.key}>
                <label className={labelClass}>
                  {field.label}{field.required ? ' *' : ''}
                  {field.key === 'publico' && selectedProduct && <span className="ml-2 text-violet-400/60 text-[10px] font-normal">✦ Auto-completado</span>}
                </label>
                {field.type === 'currency' ? (
                  <CurrencyField
                    value={formData[field.key]||''}
                    onChange={v => setField(field.key,v)}
                    fieldKey={field.key}
                    onComparisonChange={field.key === 'precio' ? (v) => setField('precio_comparacion', v) : undefined}
                  />
                ) : field.type === 'multiselect' ? (
                  <BeneficiosMultiSelect value={formData[field.key]||''} onChange={v => setField(field.key,v)} />
                ) : field.type === 'textarea' ? (
                  <textarea className={`${inputClass} resize-none h-20`} value={formData[field.key]||''} onChange={e => setField(field.key,e.target.value)} placeholder={field.placeholder} />
                ) : field.type === 'select' ? (
                  <select className={`${inputClass} cursor-pointer`} value={formData[field.key]||''} onChange={e => setField(field.key,e.target.value)}>
                    <option value="" style={{background:'#111'}}>Seleccionar...</option>
                    {field.options?.map(opt => <option key={opt} value={opt} style={{background:'#111'}}>{opt}</option>)}
                  </select>
                ) : (
                  <input className={`${inputClass} ${field.key==='publico'&&selectedProduct ? 'border-violet-500/25' : ''}`} value={formData[field.key]||''} onChange={e => setField(field.key,e.target.value)} placeholder={field.placeholder} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* STEP 3: Generate */}
        {currentStep === 3 && !output && (
          <div className="card p-8 text-center animate-fade-up">
            <div className="w-14 h-14 rounded-2xl bg-violet-600/20 flex items-center justify-center text-3xl mx-auto mb-4">✦</div>
            <h3 className="text-white font-semibold text-lg mb-2">Listo para generar</h3>
            <p className="text-white/40 text-sm mb-6">La IA generará tu paquete creativo completo</p>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {selectedProduct && <span className="tag tag-violet text-xs">{selectedProduct.name}</span>}
              {formData['nivel_conciencia'] && <span className="tag tag-gray text-xs">{formData['nivel_conciencia'].split('—')[0].trim()}</span>}
              {formData['angulo'] && <span className="tag tag-gray text-xs">{(formData['angulo']||'').slice(0,28)}{(formData['angulo']||'').length>28?'…':''}</span>}
            </div>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button onClick={handleGenerate} disabled={isGenerating} className="btn-primary px-8 py-3">
              {isGenerating ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2"/>Generando con IA...</> : '✦ Generar creatividades'}
            </button>
          </div>
        )}

        {/* Results */}
        {currentStep === totalSteps && output && (
          <div className="animate-fade-up">
            <ResultsPanel output={output} tool={tool} imageUrl={undefined} isLoadingImage={false} />
          </div>
        )}

        {/* Nav */}
        {currentStep < totalSteps && (
          <div className="flex gap-3 mt-6">
            {currentStep > 1 && <button onClick={() => setCurrentStep(s=>s-1)} className="btn-secondary flex-1">← Anterior</button>}
            {currentStep < totalSteps-1 && <button onClick={() => setCurrentStep(s=>s+1)} disabled={!canProceed()} className="btn-primary flex-1">Siguiente →</button>}
          </div>
        )}
        {currentStep === totalSteps && output && (
          <div className="mt-6">
            <button onClick={() => { setOutput(null); setCurrentStep(1); setSelectedProduct(null); setFormData({}) }} className="btn-secondary w-full">← Nueva generación</button>
          </div>
        )}
      </main>
    </div>
  )
}
