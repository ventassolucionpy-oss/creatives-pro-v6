import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─────────────────────────────────────────────
// COPYWRITING FRAMEWORK REFERENCE
// Used across all prompts for maximum conversion
// ─────────────────────────────────────────────
const COPY_FRAMEWORK = `
FRAMEWORKS DE COPYWRITING QUE DEBES APLICAR (elegí el más adecuado para cada variante):

1. AIDA — Atención · Interés · Deseo · Acción
   El más clásico y probado. El hook DETIENE el scroll. El cuerpo despierta interés real con datos o historias. Luego construye deseo apelando a la transformación. El CTA convierte.

2. PAS — Problema · Agitación · Solución
   El más poderoso para cold traffic (público frío). Nombra el dolor exacto, lo hace más intenso describiendo consecuencias, y luego presenta el producto como la salida. Funciona porque el lector siente que lo entendés.

3. FAB — Features · Advantages · Benefits
   Para públicos que ya conocen el problema pero comparan soluciones. Muestra lo que tiene el producto, qué ventaja le da eso al usuario, y qué beneficio concreto obtiene en su vida.

4. HOOK + STORY + OFFER (HSO)
   Formato nativo de Meta. Hook que para el scroll en 1.5 segundos, historia corta con la que el público se identifica, oferta clara con lo que obtienen.

5. BEFORE / AFTER / BRIDGE (BAB)
   Muestra cómo es la vida ANTES (con el problema), cómo sería DESPUÉS (con la solución), y presenta el producto como el puente entre ambos.

NIVELES DE CONCIENCIA (Eugene Schwartz) — fundamental para el targeting:
- Nivel 1 "No consciente": No sabe que tiene el problema → usar historias, curiosidad, datos disruptivos
- Nivel 2 "Consciente del problema": Sabe que sufre pero no busca solución → nombrar el dolor exacto (PAS)
- Nivel 3 "Consciente de la solución": Sabe que hay soluciones pero no conoce tu producto → mostrar la solución ideal (FAB/AIDA)
- Nivel 4 "Consciente del producto": Conoce tu producto pero no decidió → prueba social, garantías, urgencia
- Nivel 5 "Más consciente": Listo para comprar → oferta directa, descuento, escasez

REGLAS DE ORO para Meta Ads que convierte:
- El hook (primera línea) es TODO. Si no para el scroll, el resto no importa. Debe ser disruptivo, específico o generar curiosidad inmediata.
- Hablar SIEMPRE en segunda persona (vos/tú). Nunca hablar del producto en tercera persona.
- Beneficios > Features. No digas "tiene vitamina C", di "tu piel va a notar la diferencia en 2 semanas".
- Especificidad > Generalidad. No "pierde peso", sino "bajá 5 kilos en 30 días sin dejar de comer lo que te gusta".
- El tono debe sonar HUMANO, como si un amigo te contara algo. No corporativo, no vendedor. Natural.
- Emojis estratégicos: uno al inicio del hook si es texto primary, y en los bullets si los hay. No abusar.
- CTA específico y orientado a resultado, no genérico. No "Comprar ahora", sino "Quiero mi crema" o "Empezar hoy".
`

const TOOL_PROMPTS: Record<string, (data: Record<string, string>) => string> = {

  'ugc-anuncios': ({ producto, descripcion, publico, objetivo, plataforma, tono, nivel_conciencia, angulo, categoria, precio }) => `
Sos un Media Buyer y Copywriter experto en Meta Ads con 10+ años y más de $2M en ad spend gestionado. Especializado en campañas de alto ROAS para ecommerce y dropshipping en LATAM.

${COPY_FRAMEWORK}

BRIEF DEL CLIENTE:
- Producto: ${producto}
- Descripción: ${descripcion}
- Categoría: ${categoria || 'general'}
- Precio: ${precio || 'no especificado'}
- Público objetivo: ${publico || 'audiencia general'}
- Objetivo de campaña: ${objetivo || 'Conversiones / Ventas'}
- Plataforma: ${plataforma || 'Facebook e Instagram'}
- Tono deseado: ${tono || 'cercano y persuasivo, como un amigo que recomienda'}
- Nivel de conciencia del público: ${nivel_conciencia || 'Nivel 2-3'}
- Ángulo de venta preferido: ${angulo || 'IA elige el más efectivo'}

INSTRUCCIÓN:
Generá el paquete completo de experto Meta Ads. Cada sección debe ser específica para este producto y audiencia.

Respondé SOLO con este JSON exacto (sin texto fuera del JSON):
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
      "hashtags": ["#tag1","#tag2","#tag3","#tag4"],
      "nanoBananaPrompts": {
        "imagen": [
          { "formato": "16:9", "tipo": "imagen", "prompt": "photorealistic product ad, [scene inspired by this copy angle]...", "negativePrompt": "text, watermark, logo, blurry" },
          { "formato": "1:1", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, logo, blurry" },
          { "formato": "4:5", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, logo, blurry" }
        ],
        "video": [
          { "formato": "16:9", "tipo": "video", "prompt": "cinematic product ad, [action aligned with hook]...", "negativePrompt": "text overlay, static, blurry" },
          { "formato": "1:1", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, static, blurry" },
          { "formato": "4:5", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, static, blurry" }
        ]
      }
    },
    { "id": 2, "framework": "PAS", "angulo": "Dolor / Público frío", "nivel_conciencia": 2, "hook": "...", "titular": "...", "cuerpo": "...", "cta": "...", "por_que_funciona": "...", "hashtags": ["#tag1","#tag2","#tag3","#tag4"], "nanoBananaPrompts": { "imagen": [{"formato":"16:9","tipo":"imagen","prompt":"...","negativePrompt":"text,watermark,blurry"},{"formato":"1:1","tipo":"imagen","prompt":"...","negativePrompt":"text,watermark,blurry"},{"formato":"4:5","tipo":"imagen","prompt":"...","negativePrompt":"text,watermark,blurry"}], "video": [{"formato":"16:9","tipo":"video","prompt":"...","negativePrompt":"text overlay,blurry"},{"formato":"1:1","tipo":"video","prompt":"...","negativePrompt":"text overlay,blurry"},{"formato":"4:5","tipo":"video","prompt":"...","negativePrompt":"text overlay,blurry"}] } },
    { "id": 3, "framework": "HSO", "angulo": "Historia de identificación", "nivel_conciencia": 2, "hook": "...", "titular": "...", "cuerpo": "...", "cta": "...", "por_que_funciona": "...", "hashtags": ["#tag1","#tag2","#tag3","#tag4"], "nanoBananaPrompts": { "imagen": [{"formato":"16:9","tipo":"imagen","prompt":"...","negativePrompt":"text,watermark,blurry"},{"formato":"1:1","tipo":"imagen","prompt":"...","negativePrompt":"text,watermark,blurry"},{"formato":"4:5","tipo":"imagen","prompt":"...","negativePrompt":"text,watermark,blurry"}], "video": [{"formato":"16:9","tipo":"video","prompt":"...","negativePrompt":"text overlay,blurry"},{"formato":"1:1","tipo":"video","prompt":"...","negativePrompt":"text overlay,blurry"},{"formato":"4:5","tipo":"video","prompt":"...","negativePrompt":"text overlay,blurry"}] } },
    { "id": 4, "framework": "BAB", "angulo": "Before/After/Bridge", "nivel_conciencia": 3, "hook": "...", "titular": "...", "cuerpo": "...", "cta": "...", "por_que_funciona": "...", "hashtags": ["#tag1","#tag2","#tag3","#tag4"], "nanoBananaPrompts": { "imagen": [{"formato":"16:9","tipo":"imagen","prompt":"...","negativePrompt":"text,watermark,blurry"},{"formato":"1:1","tipo":"imagen","prompt":"...","negativePrompt":"text,watermark,blurry"},{"formato":"4:5","tipo":"imagen","prompt":"...","negativePrompt":"text,watermark,blurry"}], "video": [{"formato":"16:9","tipo":"video","prompt":"...","negativePrompt":"text overlay,blurry"},{"formato":"1:1","tipo":"video","prompt":"...","negativePrompt":"text overlay,blurry"},{"formato":"4:5","tipo":"video","prompt":"...","negativePrompt":"text overlay,blurry"}] } },
    { "id": 5, "framework": "FAB + Urgencia", "angulo": "Prueba social + Escasez", "nivel_conciencia": 4, "hook": "...", "titular": "...", "cuerpo": "...", "cta": "...", "por_que_funciona": "...", "hashtags": ["#tag1","#tag2","#tag3","#tag4"], "nanoBananaPrompts": { "imagen": [{"formato":"16:9","tipo":"imagen","prompt":"...","negativePrompt":"text,watermark,blurry"},{"formato":"1:1","tipo":"imagen","prompt":"...","negativePrompt":"text,watermark,blurry"},{"formato":"4:5","tipo":"imagen","prompt":"...","negativePrompt":"text,watermark,blurry"}], "video": [{"formato":"16:9","tipo":"video","prompt":"...","negativePrompt":"text overlay,blurry"},{"formato":"1:1","tipo":"video","prompt":"...","negativePrompt":"text overlay,blurry"},{"formato":"4:5","tipo":"video","prompt":"...","negativePrompt":"text overlay,blurry"}] } }
  ],
  "perfilesAudiencia": [
    {
      "id": 1,
      "nombre": "Nombre descriptivo del perfil (ej: Mujeres activas 25-35)",
      "temperatura": "frio",
      "descripcion": "Descripción de quiénes son, qué les importa y por qué comprarían este producto",
      "demografia": {
        "edad": "rango específico",
        "genero": "Todos / Mujeres / Hombres",
        "ubicacion": ["País1", "País2"],
        "nivel_socioeconomico": "Medio / Medio-alto / Alto"
      },
      "intereses": ["interés muy específico 1", "interés 2", "interés 3", "interés 4", "interés 5", "interés 6"],
      "comportamientos": ["Compradores online", "comportamiento relevante 2", "comportamiento 3"],
      "exclusiones": ["audiencia a excluir 1", "exclusión 2"],
      "lookalike_fuente": "De dónde sacar el lookalike: compradores existentes / visitantes web / lista emails / fans de página",
      "copy_recomendado": "ID del copy (1-5) que mejor conecta con este perfil y por qué",
      "presupuesto_sugerido": "USD X/día para este ad set",
      "objetivo_meta": "CONVERSIONS / TRAFFIC / AWARENESS"
    },
    { "id": 2, "nombre": "...", "temperatura": "tibio", "descripcion": "...", "demografia": { "edad": "...", "genero": "...", "ubicacion": ["..."], "nivel_socioeconomico": "..." }, "intereses": ["...","...","...","..."], "comportamientos": ["...","..."], "exclusiones": ["..."], "lookalike_fuente": "...", "copy_recomendado": "...", "presupuesto_sugerido": "...", "objetivo_meta": "..." },
    { "id": 3, "nombre": "...", "temperatura": "tibio", "descripcion": "...", "demografia": { "edad": "...", "genero": "...", "ubicacion": ["..."], "nivel_socioeconomico": "..." }, "intereses": ["...","...","...","..."], "comportamientos": ["...","..."], "exclusiones": ["..."], "lookalike_fuente": "...", "copy_recomendado": "...", "presupuesto_sugerido": "...", "objetivo_meta": "..." },
    { "id": 4, "nombre": "...", "temperatura": "caliente", "descripcion": "...", "demografia": { "edad": "...", "genero": "...", "ubicacion": ["..."], "nivel_socioeconomico": "..." }, "intereses": ["...","...","...","..."], "comportamientos": ["...","..."], "exclusiones": ["..."], "lookalike_fuente": "...", "copy_recomendado": "...", "presupuesto_sugerido": "...", "objetivo_meta": "..." },
    { "id": 5, "nombre": "Retargeting — visitantes web", "temperatura": "muy_caliente", "descripcion": "Personas que ya vieron el producto pero no compraron", "demografia": { "edad": "mismo rango", "genero": "Todos", "ubicacion": ["mismo país"], "nivel_socioeconomico": "..." }, "intereses": [], "comportamientos": ["Visitaron página de producto", "Agregaron al carrito sin comprar"], "exclusiones": ["Compradores existentes"], "lookalike_fuente": "Pixel de retargeting — visitantes últimos 30 días", "copy_recomendado": "Copy 5 (FAB + Urgencia) — ya conocen el producto, necesitan el empujón final", "presupuesto_sugerido": "USD 5-15/día", "objetivo_meta": "CONVERSIONS" }
  ],
  "estructuraCampana": {
    "tipo": "CBO o ABO — indicá cuál recomendás para este caso y por qué",
    "razon": "Explicación de por qué CBO o ABO es mejor para este producto y presupuesto",
    "campana": "Nombre técnico de la campaña para Ads Manager",
    "objetivo_meta": "CONVERSIONS / TRAFFIC / AWARENESS",
    "presupuesto_total_diario": "USD X/día total",
    "ad_sets": [
      {
        "nombre": "Ad Set 1 — [tipo de audiencia]",
        "audiencia_id": 1,
        "presupuesto_diario": "USD X/día",
        "copies_asignados": [1, 2],
        "objetivo": "Por qué estos copies para esta audiencia"
      },
      { "nombre": "Ad Set 2 — [tipo]", "audiencia_id": 2, "presupuesto_diario": "USD X/día", "copies_asignados": [3, 4], "objetivo": "..." },
      { "nombre": "Ad Set 3 — Retargeting", "audiencia_id": 5, "presupuesto_diario": "USD X/día", "copies_asignados": [5], "objetivo": "Cerrar ventas de quienes ya vieron el producto" }
    ],
    "fase_aprendizaje": "Explicación de cuántos días y conversiones necesitás para salir de la fase de aprendizaje",
    "cuando_escalar": "Regla concreta: cuándo y cuánto escalar el presupuesto (ej: si ROAS > X en 3 días, subí 20%)",
    "cuando_matar": "Regla concreta: cuándo matar un ad set (ej: si CPM > $X o CTR < X% a los 3 días)"
  },
  "hooksAlternativos": [
    {
      "copy_id": 1,
      "hook_original": "el hook del copy 1",
      "variantes": [
        { "id": "1a", "hook": "variante A — mismo ángulo, diferente apertura", "tipo": "Pregunta directa", "por_que_probar": "Las preguntas generan pausa cognitiva — el cerebro no puede ignorar una pregunta" },
        { "id": "1b", "hook": "variante B — dato o estadística disruptiva", "tipo": "Dato estadístico", "por_que_probar": "Los números crean credibilidad instantánea y paran el scroll por curiosidad" },
        { "id": "1c", "hook": "variante C — statement controversial o contraintuitivo", "tipo": "Contraintuitivo", "por_que_probar": "Rompe expectativas — el cerebro se detiene ante información que contradice creencias" }
      ]
    },
    { "copy_id": 2, "hook_original": "...", "variantes": [ { "id": "2a", "hook": "...", "tipo": "...", "por_que_probar": "..." }, { "id": "2b", "hook": "...", "tipo": "...", "por_que_probar": "..." }, { "id": "2c", "hook": "...", "tipo": "...", "por_que_probar": "..." } ] },
    { "copy_id": 3, "hook_original": "...", "variantes": [ { "id": "3a", "hook": "...", "tipo": "...", "por_que_probar": "..." }, { "id": "3b", "hook": "...", "tipo": "...", "por_que_probar": "..." }, { "id": "3c", "hook": "...", "tipo": "...", "por_que_probar": "..." } ] }
  ],
  "checklistLanzamiento": {
    "pixel": [
      { "item": "Pixel instalado y verificado en el sitio", "critico": true },
      { "item": "Eventos de conversión configurados (ViewContent, AddToCart, Purchase)", "critico": true },
      { "item": "Test Events verificados en Events Manager", "critico": true },
      { "item": "Conversions API (CAPI) configurada para reducir pérdida por iOS 14+", "critico": true }
    ],
    "cuenta": [
      { "item": "Cuenta publicitaria verificada y sin restricciones", "critico": true },
      { "item": "Método de pago cargado y activo", "critico": true },
      { "item": "Business Manager configurado correctamente", "critico": false },
      { "item": "Dominio verificado en Business Manager", "critico": true }
    ],
    "creatividades": [
      { "item": "Imágenes en formato correcto (1:1, 4:5, 9:16) sin texto excesivo", "critico": true },
      { "item": "Videos con captions/subtítulos (85% se ve sin sonido)", "critico": false },
      { "item": "Miniaturas de video optimizadas para el hook visual", "critico": false },
      { "item": "Copies revisados sin caracteres especiales que bloqueen aprobación", "critico": true }
    ],
    "pagina_destino": [
      { "item": "Landing page / Tienda carga en menos de 3 segundos en móvil", "critico": true },
      { "item": "Botón de compra visible sin scroll en móvil", "critico": true },
      { "item": "Precio y CTA claros en la primera pantalla", "critico": true },
      { "item": "URL de destino con parámetros UTM para tracking", "critico": false }
    ],
    "estrategia": [
      { "item": "Presupuesto mínimo calculado para salir de la fase de aprendizaje", "critico": true },
      { "item": "Audiencias de exclusión cargadas (compradores actuales)", "critico": true },
      { "item": "Audiencias de retargeting configuradas (visitantes 30 días)", "critico": false },
      { "item": "Budget caps por ad set para proteger el presupuesto en las primeras 48hs", "critico": false }
    ]
  },
  "analisisMetricas": {
    "kpis_principales": [
      { "metrica": "CTR (Click Through Rate)", "rango_malo": "< 0.5%", "rango_bueno": "1-2%", "rango_excelente": "> 3%", "accion_si_malo": "El problema está en la creatividad o el hook. Testear nuevas imágenes/videos o cambiar el hook principal." },
      { "metrica": "CPM (Costo por 1000 impresiones)", "rango_malo": "> $15", "rango_bueno": "$5-$12", "rango_excelente": "< $5", "accion_si_malo": "Audiencia muy competida o baja relevance score. Ampliar audiencia o mejorar el creative." },
      { "metrica": "CPC (Costo por click)", "rango_malo": "> $1.5", "rango_bueno": "$0.3-$0.8", "rango_excelente": "< $0.3", "accion_si_malo": "CTR bajo o CPM alto. Optimizar el hook o ampliar audiencia." },
      { "metrica": "ROAS (Return on Ad Spend)", "rango_malo": "< 1.5x", "rango_bueno": "2-4x", "rango_excelente": "> 5x", "accion_si_malo": "Revisar precio, copy, oferta o landing page. No escalar hasta ROAS positivo." },
      { "metrica": "Tasa de conversión (landing)", "rango_malo": "< 0.5%", "rango_bueno": "1-3%", "rango_excelente": "> 5%", "accion_si_malo": "El problema está en la landing, no en el ad. Mejorar oferta, velocidad o diseño de la página." },
      { "metrica": "Frequency (frecuencia)", "rango_malo": "> 4 en 7 días", "rango_bueno": "1.5-2.5", "rango_excelente": "< 1.5 en audiencias frías", "accion_si_malo": "Audience fatigue. Ampliar audiencia, rotar creatividades o pausar 3-5 días." }
    ],
    "cuando_escalar": "Regla específica para este producto: si ROAS > X durante 3 días consecutivos con mínimo 5 compras/día, subí presupuesto 20% cada 3-4 días. Nunca más del 30% de golpe.",
    "cuando_matar": "Matar ad set si: CPM > $15 a las 48hs sin compras, o CTR < 0.5% con más de 2000 impresiones, o si gastaste 2x el precio del producto sin convertir.",
    "señales_de_fatiga": ["CTR bajando más del 30% semana a semana", "CPM subiendo sin cambios de presupuesto", "Frequency > 4 en audiencias de menos de 50k personas", "Comentarios negativos o 'ver menos de esto' creciendo"],
    "dias_para_decidir": "Esperá mínimo 3-7 días antes de juzgar un ad set. Meta necesita datos para optimizar. No toques nada en las primeras 48hs (fase de aprendizaje activa)."
  },
  "calendarioRotacion": {
    "semana_1": {
      "objetivo": "Testing inicial — encontrar el copy y audiencia ganadores",
      "acciones": ["Lanzar los 5 copies con las 3 audiencias frías", "Presupuesto conservador para recolectar datos", "No tocar nada en las primeras 48hs"],
      "que_mirar": "CTR y CPM principalmente. ¿Cuál creatividad genera más clicks?",
      "decision_al_final": "Identificar el copy con mejor CTR y la audiencia con menor CPM"
    },
    "semana_2": {
      "objetivo": "Optimizar — pausar lo que no funciona, escalar lo que sí",
      "acciones": ["Pausar copies con CTR < 0.8% o sin conversiones", "Duplicar el ad set ganador con 20% más de presupuesto", "Lanzar audiencias tibia (visitantes web, lookalike 1%)"],
      "que_mirar": "ROAS y conversiones. ¿Hay ventas rentables?",
      "decision_al_final": "Si ROAS > 2x, escalar. Si no, revisar landing y oferta antes de continuar."
    },
    "semana_3": {
      "objetivo": "Escalar lo ganador, refrescar creatividades",
      "acciones": ["Escalar presupuesto del ganador 20% cada 3 días", "Introducir 2-3 hooks alternativos para evitar fatiga", "Activar retargeting si hay suficiente tráfico (500+ visitantes/semana)"],
      "que_mirar": "Frequency y CPM. ¿Hay señales de fatiga?",
      "decision_al_final": "Si frequency > 3, rotar creatividades. Preparar nuevas variantes para semana 4."
    },
    "semana_4": {
      "objetivo": "Mantenimiento y refreshing creativo",
      "acciones": ["Rotar al menos 2 creatividades nuevas", "Testear nuevo ángulo de venta en audiencia probada", "Revisar y actualizar audiencias de retargeting"],
      "que_mirar": "ROAS sostenido. ¿Se mantiene por encima del target?",
      "decision_al_final": "Documentar qué funcionó. Iniciar ciclo de testing con nuevos ángulos."
    },
    "reglas_generales": [
      "Nunca cambies más de 1 variable a la vez — no sabrás qué funcionó",
      "Rotá creatividades cada 2-3 semanas o cuando CTR baje más del 30%",
      "Guardá siempre una copia del ad set ganador antes de hacer cambios",
      "Lunes y martes son malos días para juzgar resultados (menor actividad de compra)",
      "Los mejores días para convertir en LATAM: miércoles a sábado"
    ]
  },
  "leonardoPrompts": [
    { "id": 1, "uso": "Imagen principal — Feed 1:1", "prompt": "...(inglés, muy detallado)...", "negativePrompt": "...", "settings": { "model": "Leonardo Kino XL", "style": "Commercial Photography", "ratio": "1:1" } },
    { "id": 2, "uso": "Story/Reels 9:16 — vertical", "prompt": "...", "negativePrompt": "...", "settings": { "model": "Leonardo Kino XL", "style": "Lifestyle Photography", "ratio": "9:16" } },
    { "id": 3, "uso": "Banner 4:5 — feed principal", "prompt": "...", "negativePrompt": "...", "settings": { "model": "Leonardo Diffusion XL", "style": "Advertising Photography", "ratio": "4:5" } }
  ],
  "guionVideo": {
    "duracion": "30-45 segundos",
    "estructura": [
      { "segundo": "0-3", "escena": "HOOK visual — para el scroll en 1.5s", "texto": "...", "accion": "..." },
      { "segundo": "3-8", "escena": "Problema / Identificación", "texto": "...", "accion": "..." },
      { "segundo": "8-20", "escena": "Solución — mostrar producto en uso", "texto": "...", "accion": "..." },
      { "segundo": "20-30", "escena": "Prueba social / Resultado específico", "texto": "...", "accion": "..." },
      { "segundo": "30-40", "escena": "CTA directo con urgencia", "texto": "...", "accion": "..." }
    ]
  },
  "dallePrompt": "photorealistic product advertisement for [producto], [describe scene], professional studio lighting, commercial photography style, high resolution, no text"
}`,

    'ugc-secuencias': ({ producto, descripcion, tipo_secuencia, publico, categoria, precio, precio_comparacion, beneficios, nivel_conciencia }) => `
Eres experto en diseño de contenido para landing pages y carruseles de Instagram.

BRIEF:
- Producto: ${producto}
- Descripción: ${descripcion}
- Tipo: ${tipo_secuencia || 'Landing vertical 9:16'}
- Público: ${publico}
- Categoría: ${categoria}
- Precio: ${precio || 'no especificado'}
- Precio tachado (comparación): ${precio_comparacion || 'no especificado'}
- Beneficios clave: ${beneficios || 'no especificados'}
- Nivel de conciencia: ${nivel_conciencia || 'Nivel 3'}

Genera una secuencia de slides con prompts Leonardo.ai Y prompts Nano Banana Pro en los 3 formatos (16:9, 1:1, 4:5) para imagen y video por cada slide.

Los prompts de Nano Banana Pro para imagen deben describir la escena visual de ese slide específico. Los de video deben describir la acción, movimiento de cámara y mood que acompaña ese slide como parte de un ad de secuencia.

JSON exacto:
{
  "secuencias": [
    {
      "id": 1, "orden": 1, "tipo": "Portada/Hook", "titulo": "...", "descripcion": "...",
      "prompt": "...(Leonardo.ai en inglés, detallado)...", "negativePrompt": "...", "ratio": "9:16",
      "nanoBananaPrompts": {
        "imagen": [
          { "formato": "16:9", "tipo": "imagen", "prompt": "photorealistic slide visual, hook scene for [producto]...", "negativePrompt": "text, watermark, blurry, low quality" },
          { "formato": "1:1", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry, low quality" },
          { "formato": "4:5", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry, low quality" }
        ],
        "video": [
          { "formato": "16:9", "tipo": "video", "prompt": "cinematic hook scene for product ad, dynamic camera movement...", "negativePrompt": "text overlay, static, blurry" },
          { "formato": "1:1", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, static, blurry" },
          { "formato": "4:5", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, static, blurry" }
        ]
      }
    },
    { "id": 2, "orden": 2, "tipo": "Problema", "titulo": "...", "descripcion": "...", "prompt": "...", "negativePrompt": "...", "ratio": "9:16", "nanoBananaPrompts": { "imagen": [ { "formato": "16:9", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry, low quality" }, { "formato": "1:1", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry, low quality" }, { "formato": "4:5", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry, low quality" } ], "video": [ { "formato": "16:9", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, static, blurry" }, { "formato": "1:1", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, static, blurry" }, { "formato": "4:5", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, static, blurry" } ] } },
    { "id": 3, "orden": 3, "tipo": "Solución", "titulo": "...", "descripcion": "...", "prompt": "...", "negativePrompt": "...", "ratio": "9:16", "nanoBananaPrompts": { "imagen": [ { "formato": "16:9", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry, low quality" }, { "formato": "1:1", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry, low quality" }, { "formato": "4:5", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry, low quality" } ], "video": [ { "formato": "16:9", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, static, blurry" }, { "formato": "1:1", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, static, blurry" }, { "formato": "4:5", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, static, blurry" } ] } },
    { "id": 4, "orden": 4, "tipo": "Beneficios", "titulo": "...", "descripcion": "...", "prompt": "...", "negativePrompt": "...", "ratio": "9:16", "nanoBananaPrompts": { "imagen": [ { "formato": "16:9", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry, low quality" }, { "formato": "1:1", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry, low quality" }, { "formato": "4:5", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry, low quality" } ], "video": [ { "formato": "16:9", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, static, blurry" }, { "formato": "1:1", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, static, blurry" }, { "formato": "4:5", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, static, blurry" } ] } },
    { "id": 5, "orden": 5, "tipo": "CTA final", "titulo": "...", "descripcion": "...", "prompt": "...", "negativePrompt": "...", "ratio": "9:16", "nanoBananaPrompts": { "imagen": [ { "formato": "16:9", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry, low quality" }, { "formato": "1:1", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry, low quality" }, { "formato": "4:5", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry, low quality" } ], "video": [ { "formato": "16:9", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, static, blurry" }, { "formato": "1:1", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, static, blurry" }, { "formato": "4:5", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, static, blurry" } ] } }
  ],
  "copies": [
    { "id": 1, "tipo": "Caption para carrusel", "titular": "...", "cuerpo": "...", "cta": "...", "estrategia": "...", "hashtags": ["#tag1","#tag2"] }
  ],
  "dallePrompt": "..."
}
Responde SOLO con el JSON.`,

  'ugc-catalogo': ({ producto, descripcion, angulo, fondo, categoria }) => `
Eres experto en fotografía de producto para catálogos de ecommerce y tiendas online.

BRIEF:
- Producto: ${producto}
- Descripción: ${descripcion}
- Ángulo: ${angulo || 'múltiples ángulos'}
- Fondo: ${fondo || 'blanco limpio y lifestyle'}
- Categoría: ${categoria}

Genera prompts de catálogo con Leonardo.ai Y prompts Nano Banana Pro en 3 formatos (16:9, 1:1, 4:5) para imagen y video por cada ángulo de producto.

Los prompts Nano Banana Pro para imagen deben mostrar el producto desde ese ángulo específico. Los de video deben describir una toma cinematográfica del producto en movimiento suave (orbit, zoom, reveal).

JSON exacto:
{
  "catalogoPrompts": [
    {
      "id": 1, "angulo": "Frontal", "fondo": "Blanco puro",
      "prompt": "...(Leonardo.ai en inglés, product photography estilo Amazon)...", "negativePrompt": "...", "settings": { "model": "Leonardo Diffusion XL", "ratio": "1:1" },
      "nanoBananaPrompts": {
        "imagen": [
          { "formato": "16:9", "tipo": "imagen", "prompt": "professional product photography, frontal view of [producto], pure white background, studio lighting, sharp focus, commercial catalog style, 16:9", "negativePrompt": "text, watermark, shadow artifacts, blurry, person, hand" },
          { "formato": "1:1", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, shadow artifacts, blurry, person, hand" },
          { "formato": "4:5", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, shadow artifacts, blurry, person, hand" }
        ],
        "video": [
          { "formato": "16:9", "tipo": "video", "prompt": "smooth product reveal video, slow 360 orbit around [producto], white background, studio lighting, ecommerce style, subtle shadow, 16:9", "negativePrompt": "text overlay, person, hand, fast movement, blurry" },
          { "formato": "1:1", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, person, hand, fast movement, blurry" },
          { "formato": "4:5", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, person, hand, fast movement, blurry" }
        ]
      }
    },
    { "id": 2, "angulo": "3/4 vista", "fondo": "Lifestyle", "prompt": "...", "negativePrompt": "...", "settings": { "model": "Leonardo Kino XL", "ratio": "4:3" }, "nanoBananaPrompts": { "imagen": [ { "formato": "16:9", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry" }, { "formato": "1:1", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry" }, { "formato": "4:5", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry" } ], "video": [ { "formato": "16:9", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, blurry" }, { "formato": "1:1", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, blurry" }, { "formato": "4:5", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, blurry" } ] } },
    { "id": 3, "angulo": "Detalle/Zoom", "fondo": "Degradado suave", "prompt": "...", "negativePrompt": "...", "settings": { "model": "Leonardo Diffusion XL", "ratio": "1:1" }, "nanoBananaPrompts": { "imagen": [ { "formato": "16:9", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry" }, { "formato": "1:1", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry" }, { "formato": "4:5", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry" } ], "video": [ { "formato": "16:9", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, blurry" }, { "formato": "1:1", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, blurry" }, { "formato": "4:5", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, blurry" } ] } },
    { "id": 4, "angulo": "Lifestyle en uso", "fondo": "Ambiente natural", "prompt": "...", "negativePrompt": "...", "settings": { "model": "Leonardo Kino XL", "ratio": "16:9" }, "nanoBananaPrompts": { "imagen": [ { "formato": "16:9", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry" }, { "formato": "1:1", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry" }, { "formato": "4:5", "tipo": "imagen", "prompt": "...", "negativePrompt": "text, watermark, blurry" } ], "video": [ { "formato": "16:9", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, blurry" }, { "formato": "1:1", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, blurry" }, { "formato": "4:5", "tipo": "video", "prompt": "...", "negativePrompt": "text overlay, blurry" } ] } }
  ],
  "copies": [
    { "id": 1, "tipo": "Descripción de producto", "titular": "...", "cuerpo": "...", "cta": "...", "estrategia": "...", "hashtags": [] }
  ],
  "dallePrompt": "..."
}
Responde SOLO con el JSON.`,

  'meta-ads': ({ producto, descripcion, publico, objetivo, presupuesto, categoria, pais, nivel_conciencia, angulo }) => `
Sos un Media Buyer y Copywriter experto en Meta Ads con más de $1M en ad spend gestionado. Especializado en campañas de alto ROAS para ecommerce y productos digitales en LATAM.

${COPY_FRAMEWORK}

BRIEF:
- Producto: ${producto}
- Descripción: ${descripcion}
- Categoría: ${categoria}
- Público objetivo: ${publico}
- Objetivo de campaña: ${objetivo || 'Conversiones / Ventas'}
- Presupuesto diario disponible: ${presupuesto || 'USD 10-50'}
- País/Región: ${pais || 'LATAM'}
- Nivel de conciencia del público: ${nivel_conciencia || 'Nivel 2-3'}
- Ángulo preferido: ${angulo || 'IA elige el más efectivo'}

Generá una estrategia completa de Meta Ads con copies profesionales que apliquen los frameworks indicados. Incluí 4 variantes de copy para A/B testing real, cada una con un framework y ángulo distinto.

Respondé SOLO con este JSON:
{
  "metaAds": {
    "campana": "nombre técnico de campaña para el Ads Manager",
    "objetivo_meta": "CONVERSIONS",
    "estructura_recomendada": "1 campaña → 2-3 ad sets con distintas audiencias → 4 ads por ad set",
    "audiencia": {
      "edad": "rango de edad específico",
      "genero": "Todos / Solo mujeres / Solo hombres",
      "intereses": ["interés detallado 1","interés 2","interés 3","interés 4","interés 5","interés 6"],
      "comportamientos": ["Compradores online","Usuarios de dispositivos iOS","Otro comportamiento relevante"],
      "ubicaciones": ["País1","País2"],
      "excluir": ["audiencias a excluir para no desperdiciar presupuesto"]
    },
    "copies": [
      {
        "id": 1,
        "framework": "AIDA",
        "angulo": "Transformación / Resultado final",
        "nivel_conciencia": 3,
        "hook": "primera línea que para el scroll (con emoji si aplica)",
        "primario": "Texto principal completo del anuncio. Varios párrafos cortos con saltos de línea. Natural, conversacional, en segunda persona. Con el hook integrado al inicio.",
        "titular": "Titular del anuncio (máx 40 chars)",
        "descripcion": "Descripción debajo del titular (máx 30 chars)",
        "cta_boton": "SHOP_NOW",
        "por_que_funciona": "Explicación de la psicología usada"
      },
      { "id": 2, "framework": "PAS", "angulo": "Dolor / Público frío", "nivel_conciencia": 2, "hook": "...", "primario": "...", "titular": "...", "descripcion": "...", "cta_boton": "LEARN_MORE", "por_que_funciona": "..." },
      { "id": 3, "framework": "HSO", "angulo": "Historia de identificación", "nivel_conciencia": 2, "hook": "...", "primario": "...", "titular": "...", "descripcion": "...", "cta_boton": "GET_OFFER", "por_que_funciona": "..." },
      { "id": 4, "framework": "BAB + Urgencia", "angulo": "Before/After + Escasez", "nivel_conciencia": 4, "hook": "...", "primario": "...", "titular": "...", "descripcion": "...", "cta_boton": "SHOP_NOW", "por_que_funciona": "..." }
    ],
    "presupuesto": {
      "diario_recomendado": "USD X-Y",
      "fase_aprendizaje": "Necesitás mínimo 50 conversiones en 7 días para salir del aprendizaje. Calculá: 50 ÷ tasa de conversión estimada = visitas necesarias",
      "cpm_estimado": "USD X-Y para ${pais || 'LATAM'}",
      "cpc_estimado": "USD X-Y",
      "roas_objetivo": "X:1 para ser rentable con este producto"
    },
    "estrategia_ab": "Instrucciones específicas de qué testear primero y cómo interpretar resultados"
  },
  "leonardoPrompts": [
    { "id": 1, "uso": "Creatividad feed 1:1 — estática principal", "prompt": "...(inglés, muy detallado)...", "negativePrompt": "...", "settings": { "model": "Leonardo Kino XL", "style": "Commercial Photography", "ratio": "1:1" } },
    { "id": 2, "uso": "Story/Reels 9:16 — vertical", "prompt": "...", "negativePrompt": "...", "settings": { "model": "Leonardo Kino XL", "style": "Lifestyle Photography", "ratio": "9:16" } },
    { "id": 3, "uso": "Banner 1.91:1 — para campaña de tráfico", "prompt": "...", "negativePrompt": "...", "settings": { "model": "Leonardo Diffusion XL", "style": "Advertising Photography", "ratio": "16:9" } }
  ],
  "guionVideo": {
    "duracion": "15-30 segundos",
    "estructura": [
      { "segundo": "0-3", "escena": "HOOK — para el scroll en 1.5s", "texto": "...", "accion": "..." },
      { "segundo": "3-10", "escena": "Problema / Identificación", "texto": "...", "accion": "..." },
      { "segundo": "10-20", "escena": "Solución + Demostración del producto", "texto": "...", "accion": "..." },
      { "segundo": "20-25", "escena": "Prueba social / Resultado específico", "texto": "...", "accion": "..." },
      { "segundo": "25-30", "escena": "CTA directo con urgencia", "texto": "...", "accion": "..." }
    ]
  },
  "copies": [
    { "id": 1, "framework": "AIDA", "angulo": "Transformación", "nivel_conciencia": 3, "hook": "...", "titular": "...", "cuerpo": "...", "cta": "...", "por_que_funciona": "...", "hashtags": [] },
    { "id": 2, "framework": "PAS", "angulo": "Dolor", "nivel_conciencia": 2, "hook": "...", "titular": "...", "cuerpo": "...", "cta": "...", "por_que_funciona": "...", "hashtags": [] }
  ],
  "dallePrompt": "..."
}`,

  'tiktok': ({ producto, descripcion, publico, objetivo, categoria, estilo }) => `
Eres un experto en TikTok Ads y contenido viral para TikTok Shop.

BRIEF:
- Producto: ${producto}
- Descripción: ${descripcion}
- Categoría: ${categoria}
- Público: ${publico}
- Objetivo: ${objetivo || 'ventas en TikTok Shop'}
- Estilo de video: ${estilo || 'UGC auténtico'}

Genera una estrategia completa de TikTok en JSON:
{
  "tiktokScript": {
    "guion": [
      {
        "hook": "Frase de hook 0-3 segundos (debe parar el scroll)...",
        "desarrollo": "Desarrollo del contenido 3-20 segundos...",
        "cta": "Llamada a la acción final...",
        "duracion": "30 segundos",
        "musica_sugerida": "Tipo de música o tendencia actual sugerida"
      },
      {
        "hook": "Variante 2 del hook...",
        "desarrollo": "...",
        "cta": "...",
        "duracion": "45 segundos",
        "musica_sugerida": "..."
      }
    ],
    "hashtags": ["#fyp","#viral","#tiktokshop","#tag4","#tag5","#tag6","#tag7","#tag8"],
    "caption": "Caption completo para el video con emojis y hashtags..."
  },
  "leonardoPrompts": [
    { "id": 1, "uso": "Thumbnail/miniatura del video", "prompt": "...", "negativePrompt": "...", "settings": { "model": "Leonardo Kino XL", "style": "Cinematic", "ratio": "9:16" } },
    { "id": 2, "uso": "Creatividad para TikTok Ads", "prompt": "...", "negativePrompt": "...", "settings": { "model": "Leonardo Diffusion XL", "style": "Photography", "ratio": "9:16" } }
  ],
  "copies": [
    { "id": 1, "tipo": "Ad copy para TikTok Ads", "titular": "...", "cuerpo": "...", "cta": "...", "estrategia": "...", "hashtags": ["#fyp","#viral"] }
  ],
  "dallePrompt": "..."
}
Responde SOLO con el JSON.`,

  'hotmart': ({ producto, descripcion, publico, precio, garantia, categoria }) => `
Eres un experto en marketing digital, copywriting de alta conversión y ventas de productos digitales en Hotmart.

BRIEF:
- Producto digital: ${producto}
- Descripción: ${descripcion}
- Categoría: ${categoria}
- Público objetivo: ${publico}
- Precio sugerido: ${precio || 'USD 47-197'}
- Garantía: ${garantia || '7 días'}

Genera un funnel completo de ventas en JSON:
{
  "hotmartFunnel": {
    "producto": {
      "nombre": "nombre comercial optimizado para conversión",
      "promesa": "promesa de transformación en 1 línea poderosa",
      "publico": "${publico}",
      "precio_sugerido": "...",
      "garantia": "${garantia || '7 días'}"
    },
    "pagina_ventas": {
      "headline": "Headline principal de la página de ventas (poderoso, orientado a transformación)...",
      "subheadline": "Subheadline que amplifica la promesa...",
      "beneficios": ["Beneficio 1 orientado a resultado", "Beneficio 2", "Beneficio 3", "Beneficio 4", "Beneficio 5"],
      "objeciones": ["Objeción común 1 y cómo rebatirla", "Objeción 2"],
      "testimonios_ficticios": ["Testimonio ficticio 1 con nombre y resultado específico", "Testimonio 2", "Testimonio 3"],
      "cta_principal": "Texto del botón de compra..."
    },
    "emails": [
      { "tipo": "Bienvenida/Confirmación", "asunto": "...", "cuerpo": "Cuerpo completo del email (3-4 párrafos)..." },
      { "tipo": "Seguimiento día 2", "asunto": "...", "cuerpo": "..." },
      { "tipo": "Urgencia/Cierre", "asunto": "...", "cuerpo": "..." }
    ],
    "whatsapp_scripts": [
      "Script completo de WhatsApp para primer contacto (natural, no spam)...",
      "Script de seguimiento para quien no respondió..."
    ]
  },
  "leonardoPrompts": [
    { "id": 1, "uso": "Banner/mockup del producto digital", "prompt": "...", "negativePrompt": "...", "settings": { "model": "Leonardo Diffusion XL", "style": "Digital Art", "ratio": "16:9" } },
    { "id": 2, "uso": "Foto de autor/instructor", "prompt": "...", "negativePrompt": "...", "settings": { "model": "Leonardo Kino XL", "style": "Photography", "ratio": "1:1" } }
  ],
  "copies": [
    { "id": 1, "tipo": "Anuncio Meta Ads para producto digital", "titular": "...", "cuerpo": "...", "cta": "...", "estrategia": "...", "hashtags": [] }
  ],
  "dallePrompt": "..."
}
Responde SOLO con el JSON.`,

  'ugc-creator': ({ producto, descripcion, publico, tipo_ugc, duracion, perfil_creador, angulo, plataforma, categoria }) => `
Sos un director creativo de UGC para publicidad de alto rendimiento en LATAM. El UGC que vende suena a una persona real, confiada, específica y humana — nunca a un comercial. Hook imposible de skipear, desarrollo con detalles reales que generan credibilidad, CTA que suena a recomendación genuina.

BRIEF: Producto: ${producto} | Descripción: ${descripcion} | Público: ${publico} | Tipo: ${tipo_ugc} | Duración: ${duracion} | Perfil creador: ${perfil_creador} | Ángulo: ${angulo} | Plataforma: ${plataforma}

Generá 3 guiones UGC completos con ángulos distintos. Respondé SOLO con JSON con esta estructura: { "guionesUGC": [ { "id": 1, "tipo": "...", "angulo": "...", "duracion_estimada": "30s", "hook_principal": "primeras palabras exactas sin punto", "hook_alternativo": "variante para A/B", "guion": { "apertura": { "segundos": "0-3", "texto": "lo que dice el creador", "visual": "descripcion camara", "nota_actuacion": "como debe sonar" }, "desarrollo": { "segundos": "3-24", "texto": "texto completo conversacional especifico", "visual": "planos acciones", "nota_actuacion": "tono energia" }, "cierre_cta": { "segundos": "24-30", "texto": "CTA como recomendacion", "visual": "cierre", "nota_actuacion": "conviccion" } }, "briefing_creador": "instrucciones completas actitud ropa fondo que no decir", "variante_b": "hook alternativo" }, { "id": 2, ... }, { "id": 3, ... } ], "leonardoPrompts": [ { "id": 1, "uso": "Thumbnail 9:16", "prompt": "english detailed lifestyle ugc", "negativePrompt": "...", "settings": { "model": "Leonardo Kino XL", "style": "Lifestyle Photography", "ratio": "9:16" } } ], "copies": [ { "id": 1, "framework": "PAS", "angulo": "Copy para pautar el UGC", "nivel_conciencia": 2, "hook": "...", "titular": "...", "cuerpo": "...", "cta": "...", "por_que_funciona": "...", "hashtags": [] } ], "dallePrompt": "..." }`,
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tool, ...formData } = body

    if (!tool || !TOOL_PROMPTS[tool]) {
      return NextResponse.json({ error: 'Herramienta no válida.' }, { status: 400 })
    }

    const supabase = await createServerComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

    // Create generation record
    const { data: gen } = await supabase.from('generations').insert({
      user_id: user.id,
      product_id: formData.product_id || null,
      tool, status: 'processing', input: formData,
    }).select().single()

    const prompt = TOOL_PROMPTS[tool](formData)

    const message = await claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    // Robust JSON extraction: strip markdown fences, then find the outermost JSON object
    let clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    // If the response has text before the JSON, extract just the JSON object
    const jsonStart = clean.indexOf('{')
    const jsonEnd = clean.lastIndexOf('}')
    if (jsonStart > 0 && jsonEnd > jsonStart) {
      clean = clean.slice(jsonStart, jsonEnd + 1)
    }
    let output: Record<string, unknown>
    try {
      output = JSON.parse(clean)
    } catch (parseErr) {
      // If still fails, log raw for debugging and return a useful error
      console.error('JSON parse failed. Stop reason:', message.stop_reason, 'Raw length:', raw.length)
      console.error('Raw preview:', raw.slice(0, 500))
      throw new Error(`La IA generó una respuesta demasiado larga. Intentá con menos campos opcionales o un producto con descripción más corta.`)
    }

    // Update generation with output
    if (gen) {
      await supabase.from('generations').update({ status: 'completed', output }).eq('id', gen.id)
    }

    return NextResponse.json({ ...output, generationId: gen?.id })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error desconocido' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')

    const { data: generations, error } = await supabase
      .from('generations')
      .select('*, products(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({ generations: generations || [] })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Error cargando historial' }, { status: 500 })
  }
}
