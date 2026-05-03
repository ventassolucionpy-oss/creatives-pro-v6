import type { Product } from '@/types'

export type BuyerPersonaOutput = {
  resumen_mercado: {
    tamano_problema: string
    urgencia_general: string
    momento_de_compra: string
    por_que_buscan_ahora: string
  }
  buyer_persona: {
    nombre_ficticio: string
    foto_perfil: string
    edad: string
    genero: string
    ubicacion: string
    ocupacion: string
    ingreso_mensual: string
    nivel_educativo: string
    estado_civil: string
    dispositivo_principal: string
    redes_que_usa: string[]
    horario_online: string
    dia_tipico: string
  }
  psicologia_profunda: {
    problema_principal: string
    como_describe_el_problema: string
    desde_cuando_lo_tiene: string
    como_afecta_su_vida_diaria: string
    que_ya_intentó: string
    por_que_fallaron_los_intentos_anteriores: string
    que_siente_cuando_el_problema_aparece: string
    que_verguenza_o_miedo_tiene_al_respecto: string
  }
  motivaciones: {
    que_quiere_lograr: string
    a_donde_quiere_llegar: string
    como_se_ve_cuando_el_problema_este_resuelto: string
    que_le_diria_a_sus_amigos_si_funciona: string
    que_aspira_ser_o_parecer: string
    que_le_importa_mas_precio_o_resultado: string
  }
  miedos_objeciones: {
    miedo_principal: string
    objecion_1: { objecion: string; respuesta_en_el_anuncio: string }
    objecion_2: { objecion: string; respuesta_en_el_anuncio: string }
    objecion_3: { objecion: string; respuesta_en_el_anuncio: string }
    objecion_4: { objecion: string; respuesta_en_el_anuncio: string }
    por_que_no_ha_comprado_todavia: string
  }
  diferenciacion: {
    que_ofrece_la_competencia: string
    por_que_elegir_tu_producto: string
    diferenciadores_reales: string[]
    como_comunicar_diferencia_sin_mencionar_competencia: string
  }
  lenguaje_exacto: {
    palabras_que_usa: string[]
    frases_que_dice_cuando_tiene_el_problema: string[]
    como_busca_en_google: string[]
    que_comenta_en_redes: string[]
    tono_que_conecta: string
  }
  angulos_de_anuncio: Array<{
    nombre: string
    por_que_conecta_con_este_buyer: string
    hook_meta: string
    hook_tiktok: string
    cuerpo_del_anuncio: string
    cta_que_convierte: string
    formato_recomendado: string
    nivel_conciencia: string
  }>
  estructura_anuncio_perfecto: {
    meta_ads: {
      hook_visual: string
      primeras_palabras: string
      problema_que_nombra: string
      solucion_que_ofrece: string
      prueba_social: string
      garantia: string
      cta: string
      que_NO_decir: string[]
    }
    tiktok: {
      hook_0_3s: string
      desarrollo_3_20s: string
      giro_o_revelacion: string
      cta_final: string
      caption: string
      hashtags: string[]
      que_NO_hacer: string[]
    }
  }
  calendario_mensajes: Array<{
    semana: string
    mensaje_clave: string
    formato: string
    objetivo: string
  }>
}


export function buildPrompt(product: Product, config: Record<string, string>): string {
  return `Sos un estratega de marketing con 12+ años en Consumer Psychology, Buyer Persona Research y Copywriting de conversión para ecommerce en LATAM. Tu especialidad es entender qué hay en la cabeza del comprador ANTES de que llegue al anuncio.

PRODUCTO: ${product.name}
DESCRIPCIÓN: ${product.description}
CATEGORÍA: ${product.category}
PRECIO: ${config.precio || 'a definir'}
CANAL: ${config.canal || 'Meta Ads + TikTok Shop'}
PAÍS: Paraguay (específico — con sus particularidades culturales)
MODELO: Dropi Paraguay con COD (pago contra entrega)
PÚBLICO ESTIMADO: ${config.publico || 'a definir por la IA'}

CONTEXTO DE COMPRA EN PARAGUAY:
- El comprador paraguayo es desconfiado de las compras online — el anuncio tiene que vencer esa barrera ANTES de pedir que compre
- Con COD la barrera de entrada baja, pero si el anuncio no genera confianza real, el cliente rechaza el paquete al llegar
- El precio tiene que estar visible en el anuncio (si no lo ponés, pierde el scroll)
- Los testimonios de compatriotas ("un señor de Asunción dijo...") convierten más que testimonios genéricos
- El consumidor paraguayo compara precio con la farmacia, el mercado local y MercadoLibre

TU MISIÓN:
Hacer el estudio de mercado más profundo posible para que CADA ANUNCIO que se cree para este producto hable directamente al corazón del comprador.

Los anuncios que generás tienen que responder IMPLÍCITAMENTE (sin mencionar directamente):
→ ¿Por qué elegir este producto?
→ ¿Qué lo diferencia de todo lo demás que el cliente ya probó?
→ ¿Por qué este proveedor/vendedor es confiable?
→ ¿Por qué funciona cuando otras cosas no funcionaron?
→ ¿Cuál es el riesgo si NO compra?

Respondé SOLO con JSON válido y completo:
{
  "resumen_mercado": {
    "tamano_problema": "qué tan común es este problema en Paraguay — porcentaje o descripción cuantificada",
    "urgencia_general": "qué tan urgente es resolver este problema para quien lo tiene",
    "momento_de_compra": "cuándo exactamente la persona está más lista para comprar — qué situación detona la compra",
    "por_que_buscan_ahora": "qué cambió recientemente en su vida que los hizo buscar una solución"
  },
  "buyer_persona": {
    "nombre_ficticio": "nombre paraguayo real (ej: María José, Carlos, Lorena)",
    "foto_perfil": "descripción física de cómo se ve — edad aparente, estilo, expresión — para que el copywriter pueda visualizarla al escribir",
    "edad": "rango específico",
    "genero": "...",
    "ubicacion": "ciudad/barrio típico en Paraguay",
    "ocupacion": "trabajo específico que hacen en Paraguay",
    "ingreso_mensual": "rango en guaraníes",
    "nivel_educativo": "...",
    "estado_civil": "...",
    "dispositivo_principal": "Android (90% en Paraguay) / iPhone",
    "redes_que_usa": ["Facebook", "WhatsApp", "TikTok", "Instagram"],
    "horario_online": "cuándo está más activo en redes",
    "dia_tipico": "descripción de un día típico de esta persona — esto ayuda a entender cuándo y dónde aparece el problema"
  },
  "psicologia_profunda": {
    "problema_principal": "el dolor específico que tiene — no el feature del producto, sino cómo se manifiesta en su vida diaria",
    "como_describe_el_problema": "cómo lo diría con sus palabras — el vocabulario exacto que usa",
    "desde_cuando_lo_tiene": "cuánto tiempo lleva sufriendo esto",
    "como_afecta_su_vida_diaria": "impacto concreto en su rutina, trabajo, relaciones, autoestima",
    "que_ya_intentó": "qué otras soluciones probó antes (productos de farmacia, remedios caseros, otras marcas)",
    "por_que_fallaron_los_intentos_anteriores": "por qué esas soluciones no funcionaron — esta es la CLAVE para diferenciarte",
    "que_siente_cuando_el_problema_aparece": "emoción específica — frustración, vergüenza, dolor, angustia — sé específico",
    "que_verguenza_o_miedo_tiene_al_respecto": "algo que no le dice a nadie sobre este problema"
  },
  "motivaciones": {
    "que_quiere_lograr": "resultado concreto que busca — no el producto, sino la transformación",
    "a_donde_quiere_llegar": "visión del futuro cuando el problema esté resuelto",
    "como_se_ve_cuando_el_problema_este_resuelto": "descripción específica de cómo será su vida — imágenes concretas",
    "que_le_diria_a_sus_amigos_si_funciona": "qué contaría — esto es lo que tiene que prometer el anuncio",
    "que_aspira_ser_o_parecer": "identidad aspiracional — cómo quiere que los demás lo vean",
    "que_le_importa_mas_precio_o_resultado": "análisis de la sensibilidad al precio de este buyer persona específico"
  },
  "miedos_objeciones": {
    "miedo_principal": "el mayor freno para la compra — lo que más paraliza",
    "objecion_1": {
      "objecion": "primera objeción que tiene en mente (la más común)",
      "respuesta_en_el_anuncio": "cómo responder IMPLÍCITAMENTE en el anuncio sin sonar defensivo — copy exacto que neutraliza esta objeción"
    },
    "objecion_2": { "objecion": "...", "respuesta_en_el_anuncio": "..." },
    "objecion_3": { "objecion": "...", "respuesta_en_el_anuncio": "..." },
    "objecion_4": { "objecion": "...", "respuesta_en_el_anuncio": "..." },
    "por_que_no_ha_comprado_todavia": "la razón real por la que sigue sufriendo el problema en lugar de comprar la solución"
  },
  "diferenciacion": {
    "que_ofrece_la_competencia": "análisis de cómo se vende la competencia y qué ángulos ya están saturados",
    "por_que_elegir_tu_producto": "propuesta de valor diferenciada que aún no está saturada en el mercado paraguayo",
    "diferenciadores_reales": ["diferenciador concreto 1", "diferenciador 2", "diferenciador 3"],
    "como_comunicar_diferencia_sin_mencionar_competencia": "estrategia de copy para posicionarte como la mejor opción sin atacar directamente a la competencia"
  },
  "lenguaje_exacto": {
    "palabras_que_usa": ["palabras o frases exactas que usa para describir su problema"],
    "frases_que_dice_cuando_tiene_el_problema": ["frase exacta que dice o piensa cuando el problema aparece"],
    "como_busca_en_google": ["búsqueda real que haría en Google"],
    "que_comenta_en_redes": ["tipo de comentario que dejaría en un post o video relacionado"],
    "tono_que_conecta": "descripción del tono que conecta con esta persona — formal/informal, directo/empático, con humor/serio"
  },
  "angulos_de_anuncio": [
    {
      "nombre": "nombre del ángulo",
      "por_que_conecta_con_este_buyer": "explicación psicológica de por qué este ángulo específico resuena con este buyer persona",
      "hook_meta": "hook completo para Meta Ads — primeras palabras que paran el scroll en Facebook/Instagram",
      "hook_tiktok": "hook de 0-3 segundos para TikTok — visual + audio — específico para el formato corto",
      "cuerpo_del_anuncio": "cuerpo completo del anuncio usando el lenguaje exacto del buyer persona — conversacional, sin corporativo",
      "cta_que_convierte": "CTA específico que funciona para este buyer — no genérico",
      "formato_recomendado": "imagen estática / video UGC / carrusel / Reel — y por qué este formato",
      "nivel_conciencia": "Nivel 1-5 al que apunta y por qué"
    },
    { "nombre": "Ángulo 2 — Diferenciación", "por_que_conecta_con_este_buyer": "...", "hook_meta": "...", "hook_tiktok": "...", "cuerpo_del_anuncio": "...", "cta_que_convierte": "...", "formato_recomendado": "...", "nivel_conciencia": "..." },
    { "nombre": "Ángulo 3 — Transformación Before/After", "por_que_conecta_con_este_buyer": "...", "hook_meta": "...", "hook_tiktok": "...", "cuerpo_del_anuncio": "...", "cta_que_convierte": "...", "formato_recomendado": "...", "nivel_conciencia": "..." },
    { "nombre": "Ángulo 4 — Objeción directa rebatida", "por_que_conecta_con_este_buyer": "...", "hook_meta": "...", "hook_tiktok": "...", "cuerpo_del_anuncio": "...", "cta_que_convierte": "...", "formato_recomendado": "...", "nivel_conciencia": "..." },
    { "nombre": "Ángulo 5 — Urgencia genuina", "por_que_conecta_con_este_buyer": "...", "hook_meta": "...", "hook_tiktok": "...", "cuerpo_del_anuncio": "...", "cta_que_convierte": "...", "formato_recomendado": "...", "nivel_conciencia": "..." }
  ],
  "estructura_anuncio_perfecto": {
    "meta_ads": {
      "hook_visual": "qué se muestra en los primeros 2 segundos del video o en la imagen — decisión visual que para el scroll",
      "primeras_palabras": "las primeras palabras exactas que dice o aparecen — usando el lenguaje del buyer persona",
      "problema_que_nombra": "cómo nombrar el problema sin sonar clínico — en las palabras del buyer",
      "solucion_que_ofrece": "cómo presentar la solución respondiendo implícitamente 'por qué este y no otro'",
      "prueba_social": "cómo incluir prueba social creíble para Paraguay — qué tipo de testimonio convierte más",
      "garantia": "cómo presentar la garantía para el buyer paraguayo con COD — qué palabras usar",
      "cta": "CTA específico y el momento exacto en el que aparece",
      "que_NO_decir": ["error de copy 1 que aleja a este buyer", "error 2", "error 3"]
    },
    "tiktok": {
      "hook_0_3s": "exactamente qué pasa en los primeros 3 segundos — visual + audio — para retener el scroll de TikTok",
      "desarrollo_3_20s": "cómo se desarrolla el contenido — qué mostrar, qué decir, qué mostrar en pantalla",
      "giro_o_revelacion": "el momento de reveal o sorpresa que mantiene al espectador hasta el final",
      "cta_final": "CTA final adaptado a TikTok — qué decir y cómo",
      "caption": "caption completo para TikTok con el lenguaje del buyer",
      "hashtags": ["#hashtag1","#hashtag2","#hashtag3","#hashtag4","#hashtag5","#hashtag6","#hashtag7","#hashtag8"],
      "que_NO_hacer": ["error 1 que hace que el video no funcione en TikTok Paraguay", "error 2", "error 3"]
    }
  },
  "calendario_mensajes": [
    { "semana": "Semana 1 — Reconocimiento del problema", "mensaje_clave": "el mensaje central que hay que comunicar esta semana", "formato": "formato de contenido recomendado", "objetivo": "qué queremos lograr en la mente del buyer" },
    { "semana": "Semana 2 — Educación y confianza", "mensaje_clave": "...", "formato": "...", "objetivo": "..." },
    { "semana": "Semana 3 — Prueba social y diferenciación", "mensaje_clave": "...", "formato": "...", "objetivo": "..." },
    { "semana": "Semana 4 — Conversión y urgencia", "mensaje_clave": "...", "formato": "...", "objetivo": "..." }
  ]
}`
}
