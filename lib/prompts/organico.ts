export type OrganicoOutput = {
  estrategia_cuenta: {
    nombre_perfil: string
    bio: string
    link_bio: string
    foto_perfil: string
    highlights_sugeridos: string[]
    primer_paso: string
  }
  pilares_contenido: Array<{
    nombre: string
    porcentaje: number
    descripcion: string
    ejemplos: string[]
    frecuencia: string
    objetivo: string
  }>
  plan_semanal: {
    lunes: { formato: string; tema: string; caption: string; hashtags: string[]; hora: string }
    martes: { formato: string; tema: string; caption: string; hashtags: string[]; hora: string }
    miercoles: { formato: string; tema: string; caption: string; hashtags: string[]; hora: string }
    jueves: { formato: string; tema: string; caption: string; hashtags: string[]; hora: string }
    viernes: { formato: string; tema: string; caption: string; hashtags: string[]; hora: string }
    sabado: { formato: string; tema: string; caption: string; hashtags: string[]; hora: string }
    domingo: { formato: string; tema: string; caption: string; hashtags: string[]; hora: string }
  }
  reels_hooks: Array<{
    tema: string
    hook_visual: string
    hook_audio: string
    desarrollo: string
    cta: string
    por_que_viral: string
  }>
  captions_listos: Array<{
    tipo: string
    formato: string
    caption: string
    hashtags: string[]
    cuando_publicar: string
  }>
  estrategia_stories: {
    frecuencia: string
    tipos: Array<{ tipo: string; descripcion: string; frecuencia: string }>
    encuesta_sugerida: string
    stickers_clave: string[]
  }
  hashtags_estrategia: {
    pequeños: string[]
    medianos: string[]
    grandes: string[]
    de_nicho: string[]
    estrategia: string
  }
  como_calentar_para_paid: string
  metricas_organico: Array<{ metrica: string; bueno: string; excelente: string }>
  errores_comunes: string[]
}

export function buildPrompt(product: Product, config: Record<string, string>): string {
  return `Sos un experto en marketing orgánico para Instagram y Facebook en Paraguay y LATAM con 8+ años de experiencia. Has crecido cuentas de 0 a 50.000 seguidores y entendés cómo el contenido orgánico en Meta baja el CPM del paid hasta 40%.

CONTEXTO ESPECÍFICO PARAGUAY:
- El paraguayo usa Facebook más que Instagram (especialmente 25-45 años)
- WhatsApp es el cierre de ventas, no el feed
- Los Reels en español rioplatense con modismos locales convierten mejor
- Los horarios pico en Paraguay: 12-13hs (almuerzo) y 20-23hs (noche)
- El contenido de "proceso detrás de bambalinas" genera mucha confianza
- Los comentarios en guaraní o mezcla español/guaraní hacen que el algoritmo favorezca el contenido local
- El dropshipping en Paraguay tiene desconfianza de base — el orgánico construye la credibilidad que el paid no puede

PRODUCTO: ${product.name}
DESCRIPCIÓN: ${product.description}
CATEGORÍA: ${product.category}
PLATAFORMA PRINCIPAL: ${config.plataforma || 'Instagram + Facebook'}
ESTADO DE LA CUENTA: ${config.estado_cuenta || 'Cuenta nueva — 0 seguidores'}
FRECUENCIA DISPONIBLE: ${config.frecuencia || '5-7 posts por semana'}
TONO: ${config.tono || 'Cercano, local, con humor paraguayo'}
OBJETIVO PRINCIPAL: ${config.objetivo || 'Construir confianza + calentar audiencias para paid'}

REGLAS DEL CONTENIDO ORGÁNICO QUE CONVIERTE EN PARAGUAY:
1. El primer comentario tuyo en tu propio post siempre debe hacer una pregunta para activar el algoritmo
2. Los Reels de 7-15 segundos tienen mayor alcance orgánico que los de 30s+
3. Las Stories con encuestas y preguntas generan señales de engagement que el algoritmo premia
4. Un post de "proceso" (cómo empaqué el pedido, qué llegó del proveedor) genera 3x más confianza que un post de producto
5. Los martes y jueves al mediodía tienen el mejor alcance orgánico en Paraguay
6. Contestar todos los comentarios en las primeras 2hs después de publicar es crítico para el alcance
7. El contenido que muestra la persona detrás de la cuenta vende más que el que solo muestra el producto

ESTRATEGIA CLAVE — ORGÁNICO COMO CALENTADOR DEL PAID:
El objetivo real del orgánico no es solo vender — es crear una audiencia personalizada GRATIS para luego apuntar con paid. Cada persona que interactúa con tu contenido orgánico se puede retargetear en Meta Ads a CPM mucho menor. Una cuenta con 200 interacciones por post te da una audiencia personalizada de calidad sin gastar un peso en ads.

Respondé SOLO con JSON válido y completo:
{
  "estrategia_cuenta": {
    "nombre_perfil": "nombre de usuario sugerido para Instagram y Facebook en el nicho de ${product.category}",
    "bio": "bio de Instagram de 150 chars con emoji, propuesta de valor específica y CTA al WhatsApp o link",
    "link_bio": "qué poner en el link — Linktree, WhatsApp directo, o landing",
    "foto_perfil": "descripción de cómo debe ser la foto de perfil para generar confianza en Paraguay",
    "highlights_sugeridos": ["nombre de highlight 1", "nombre de highlight 2", "nombre de highlight 3", "nombre de highlight 4"],
    "primer_paso": "la primera acción concreta a hacer hoy para arrancar la cuenta"
  },
  "pilares_contenido": [
    {
      "nombre": "nombre del pilar de contenido",
      "porcentaje": 30,
      "descripcion": "qué tipo de contenido es y por qué funciona para este producto en Paraguay",
      "ejemplos": ["idea concreta de post 1", "idea concreta de post 2", "idea concreta de post 3"],
      "frecuencia": "X veces por semana",
      "objetivo": "qué logra este pilar (confianza / alcance / conversión / engagement)"
    },
    { "nombre": "pilar 2", "porcentaje": 25, "descripcion": "...", "ejemplos": ["...","...","..."], "frecuencia": "...", "objetivo": "..." },
    { "nombre": "pilar 3", "porcentaje": 20, "descripcion": "...", "ejemplos": ["...","...","..."], "frecuencia": "...", "objetivo": "..." },
    { "nombre": "pilar 4", "porcentaje": 15, "descripcion": "...", "ejemplos": ["...","...","..."], "frecuencia": "...", "objetivo": "..." },
    { "nombre": "pilar 5 — Social Proof", "porcentaje": 10, "descripcion": "testimonios, unboxings de clientes, resultados reales", "ejemplos": ["...","...","..."], "frecuencia": "...", "objetivo": "..." }
  ],
  "plan_semanal": {
    "lunes": { "formato": "Reel / Carrusel / Story / Post imagen", "tema": "tema específico del post", "caption": "caption completo listo para copiar y pegar — con emojis, conversacional, en español paraguayo, con pregunta final para generar comentarios", "hashtags": ["#hashtag1","#hashtag2","#hashtag3","#hashtag4","#hashtag5","#hashtag6","#hashtag7","#hashtag8"], "hora": "HH:MM (hora Paraguay)" },
    "martes": { "formato": "...", "tema": "...", "caption": "caption completo...", "hashtags": ["..."], "hora": "..." },
    "miercoles": { "formato": "...", "tema": "...", "caption": "caption completo...", "hashtags": ["..."], "hora": "..." },
    "jueves": { "formato": "...", "tema": "...", "caption": "caption completo...", "hashtags": ["..."], "hora": "..." },
    "viernes": { "formato": "...", "tema": "...", "caption": "caption completo...", "hashtags": ["..."], "hora": "..." },
    "sabado": { "formato": "...", "tema": "...", "caption": "caption completo...", "hashtags": ["..."], "hora": "..." },
    "domingo": { "formato": "...", "tema": "...", "caption": "caption completo...", "hashtags": ["..."], "hora": "..." }
  },
  "reels_hooks": [
    {
      "tema": "tema del Reel",
      "hook_visual": "qué se ve en pantalla en el primer frame — sin audio. Esto decide si para el scroll.",
      "hook_audio": "las primeras palabras exactas que se dicen o aparecen en texto en 0-2 segundos",
      "desarrollo": "qué pasa en el video — segundo a segundo en 15-30 segundos",
      "cta": "CTA final del Reel — natural, no forzado",
      "por_que_viral": "por qué este tipo de contenido tiene alto alcance orgánico en Paraguay"
    },
    { "tema": "...", "hook_visual": "...", "hook_audio": "...", "desarrollo": "...", "cta": "...", "por_que_viral": "..." },
    { "tema": "...", "hook_visual": "...", "hook_audio": "...", "desarrollo": "...", "cta": "...", "por_que_viral": "..." },
    { "tema": "...", "hook_visual": "...", "hook_audio": "...", "desarrollo": "...", "cta": "...", "por_que_viral": "..." },
    { "tema": "...", "hook_visual": "...", "hook_audio": "...", "desarrollo": "...", "cta": "...", "por_que_viral": "..." }
  ],
  "captions_listos": [
    {
      "tipo": "Caption de lanzamiento de producto",
      "formato": "Post imagen o carrusel",
      "caption": "caption completo listo para copiar — con emojis, storytelling, precio, CTA al WhatsApp, en español paraguayo natural",
      "hashtags": ["#Paraguay","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8","#tag9","#tag10"],
      "cuando_publicar": "descripción de en qué momento del ciclo usar este caption"
    },
    { "tipo": "Caption de testimonio de cliente", "formato": "...", "caption": "caption completo...", "hashtags": ["..."], "cuando_publicar": "..." },
    { "tipo": "Caption de proceso / detrás de escena", "formato": "...", "caption": "caption completo...", "hashtags": ["..."], "cuando_publicar": "..." },
    { "tipo": "Caption educativo / valor", "formato": "...", "caption": "caption completo...", "hashtags": ["..."], "cuando_publicar": "..." },
    { "tipo": "Caption de urgencia / oferta", "formato": "...", "caption": "caption completo...", "hashtags": ["..."], "cuando_publicar": "..." }
  ],
  "estrategia_stories": {
    "frecuencia": "cuántas stories por día y cuándo",
    "tipos": [
      { "tipo": "Story de producto", "descripcion": "qué mostrar y cómo", "frecuencia": "X por semana" },
      { "tipo": "Story de proceso", "descripcion": "...", "frecuencia": "..." },
      { "tipo": "Story de interacción", "descripcion": "encuestas, preguntas, quiz — cómo usarlas estratégicamente", "frecuencia": "..." },
      { "tipo": "Story de prueba social", "descripcion": "...", "frecuencia": "..." }
    ],
    "encuesta_sugerida": "pregunta específica de encuesta para tu producto que genera alta participación",
    "stickers_clave": ["sticker 1 con instrucción", "sticker 2", "sticker 3"]
  },
  "hashtags_estrategia": {
    "pequeños": ["#hashtag menos de 50k posts — máximo alcance porcentual"],
    "medianos": ["#hashtag 50k-500k posts — balance alcance/competencia"],
    "grandes": ["#hashtag 500k+ posts — visibilidad masiva pero difícil"],
    "de_nicho": ["#hashtag específico de Paraguay o LATAM para este producto"],
    "estrategia": "cómo combinar estos 4 tipos para maximizar el alcance orgánico — cuántos de cada tipo por post"
  },
  "como_calentar_para_paid": "explicación de cómo el contenido orgánico crea audiencias personalizadas en Meta para luego apuntar con paid ads a menor CPM — pasos concretos para configurar en Ads Manager",
  "metricas_organico": [
    { "metrica": "Tasa de engagement (likes+comments/seguidores)", "bueno": "> 3%", "excelente": "> 6%" },
    { "metrica": "Alcance orgánico / seguidores", "bueno": "> 15%", "excelente": "> 30%" },
    { "metrica": "Guardados por post", "bueno": "> 2% de los que lo vieron", "excelente": "> 5%" },
    { "metrica": "Clics al link en bio", "bueno": "> 1% de impresiones", "excelente": "> 3%" }
  ],
  "errores_comunes": [
    "error típico que arruina el crecimiento orgánico en Paraguay y cómo evitarlo",
    "error 2",
    "error 3",
    "error 4",
    "error 5"
  ]
}`
}
