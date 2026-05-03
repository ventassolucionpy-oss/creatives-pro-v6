// ─── PAÍSES Y MONEDAS ────────────────────────────────────────────
export const PAISES = [
  { code: 'PY', label: 'Paraguay', moneda: 'PYG', simbolo: 'Gs.', nombre_moneda: 'Guaraníes' },
  { code: 'US', label: 'Estados Unidos', moneda: 'USD', simbolo: '$', nombre_moneda: 'Dólares' },
]

export type Pais = typeof PAISES[number]

// ─── BENEFICIOS PREDEFINIDOS ─────────────────────────────────────
export const BENEFICIOS_PREDEFINIDOS = [
  'Envío gratis a todo Paraguay',
  'Pagás al recibir',
  'Últimas unidades',
  'Oferta por tiempo limitado',
  'Escribinos por WhatsApp',
  'Garantía incluida',
  'Envío en 24hs',
  'Stock limitado',
  'Precio especial hoy',
  'Producto original',
]

// ─── NIVELES DE CONCIENCIA CON SUGERENCIAS INTELIGENTES ──────────
export const NIVELES_CONCIENCIA = [
  {
    value: '1',
    label: 'Nivel 1 — No sabe que tiene el problema',
    descripcion: 'Público completamente frío. No identifica su dolor aún.',
    sugerencias: {
      angulos: ['Curiosidad / Dato disruptivo', 'Miedo a quedarse atrás (FOMO)'],
      objetivos: ['Reconocimiento de marca', 'Tráfico al sitio web'],
      razon: 'Con público frío que no reconoce su problema, interrumpir con un dato sorprendente o generar curiosidad es más efectivo que hablar del producto. El objetivo debe ser awareness, no conversión directa — todavía no están listos para comprar.',
    },
  },
  {
    value: '2',
    label: 'Nivel 2 — Sabe que sufre, no busca solución',
    descripcion: 'Siente el dolor pero no lo prioriza ni busca activamente.',
    sugerencias: {
      angulos: ['Dolor / Frustración actual', 'Resultado / Transformación específica'],
      objetivos: ['Tráfico al sitio web', 'Generación de leads'],
      razon: 'Nombrá el dolor exacto que sienten pero no verbalizan. El framework PAS (Problema-Agitación-Solución) funciona muy bien aquí. El objetivo ideal es llevarlos a tu web para que descubran la solución, todavía no pedirles que compren.',
    },
  },
  {
    value: '3',
    label: 'Nivel 3 — Busca solución, no conoce tu producto',
    descripcion: 'Ya está buscando activamente cómo resolver su problema.',
    sugerencias: {
      angulos: ['Resultado / Transformación específica', 'Simplicidad / Sin esfuerzo'],
      objetivos: ['Conversiones / Ventas', 'Tráfico al sitio web'],
      razon: 'Este es el punto dulce para convertir. Ya quieren una solución — solo tenés que mostrarles que la tuya es la mejor. AIDA o BAB funcionan perfecto. Podés ir directo a conversión.',
    },
  },
  {
    value: '4',
    label: 'Nivel 4 — Conoce tu producto, no decidió',
    descripcion: 'Ya te conoce pero no compró. Compara con alternativas.',
    sugerencias: {
      angulos: ['Prueba social / Comunidad que ya lo usa', 'Velocidad / Ahorro de tiempo'],
      objetivos: ['Conversiones / Ventas', 'Retargeting — ya visitaron mi tienda'],
      razon: 'El mayor freno aquí es la duda y la comparación. Testimonios reales, garantías claras y diferenciadores concretos eliminan objeciones. El retargeting con prueba social convierte muy bien en este nivel.',
    },
  },
  {
    value: '5',
    label: 'Nivel 5 — Listo para comprar (retargeting)',
    descripcion: 'Visitó tu tienda, agregó al carrito o ya compró antes.',
    sugerencias: {
      angulos: ['Miedo a quedarse atrás (FOMO)', 'Dinero / ROI / Ahorro económico'],
      objetivos: ['Retargeting — ya visitaron mi tienda', 'Conversiones / Ventas'],
      razon: 'Solo necesita un empujón final. Urgencia real (stock limitado, oferta que vence) o un descuento exclusivo para quienes ya mostraron interés. El copy debe ser directo y la oferta muy clara.',
    },
  },
]

// ─── ÁNGULOS DE VENTA ────────────────────────────────────────────
export const ANGULOS = [
  'IA elige el más efectivo para este producto',
  'Resultado / Transformación específica',
  'Dolor / Frustración actual del público',
  'Miedo a quedarse atrás (FOMO)',
  'Curiosidad / Dato disruptivo',
  'Prueba social / Comunidad que ya lo usa',
  'Velocidad / Ahorro de tiempo',
  'Dinero / ROI / Ahorro económico',
  'Simplicidad / Sin esfuerzo',
  'Exclusividad / Estatus / Premium',
]

// ─── OBJETIVOS DE CAMPAÑA ────────────────────────────────────────
export const OBJETIVOS = [
  'Conversiones / Ventas',
  'Tráfico al sitio web',
  'Generación de leads',
  'Reconocimiento de marca',
  'Retargeting — ya visitaron mi tienda',
]

// ─── TONOS ───────────────────────────────────────────────────────
export const TONOS = [
  'Cercano y natural (como un amigo)',
  'Aspiracional / Inspirador',
  'Urgente / Directo',
  'Humorístico / Descontracturado',
  'Exclusivo / Premium',
  'Empático / Comprensivo',
]

// ─── ESTILOS VISUALES ────────────────────────────────────────────
export type EstiloVisual = {
  id: string
  nombre: string
  categoria: string
  descripcion: string
  mejor_para: string[]
}

export const ESTILOS_VISUALES: EstiloVisual[] = [
  // UGC / ORGÁNICO
  { id: 'testimonio-social', nombre: 'Testimonio Social', categoria: 'UGC / Orgánico', descripcion: 'Persona real hablando a cámara sobre el producto', mejor_para: ['skincare', 'suplementos', 'ropa'] },
  { id: 'selfie-producto', nombre: 'Selfie con Producto', categoria: 'UGC / Orgánico', descripcion: 'Foto casual con el producto en mano o en uso', mejor_para: ['belleza', 'accesorios', 'comida'] },
  { id: 'producto-anotado', nombre: 'Producto Anotado', categoria: 'UGC / Orgánico', descripcion: 'Imagen del producto con textos y flechas explicativas', mejor_para: ['electrónica', 'gadgets', 'herramientas'] },
  { id: 'story-organica', nombre: 'Story Orgánica con Opinión', categoria: 'UGC / Orgánico', descripcion: 'Formato story con texto superpuesto y reacción auténtica', mejor_para: ['moda', 'lifestyle', 'alimentos'] },
  // CONVERSIÓN DIRECTA
  { id: 'division-dinamica', nombre: 'División Dinámica', categoria: 'Conversión Directa', descripcion: 'Imagen dividida mostrando antes/después o comparación', mejor_para: ['fitness', 'belleza', 'hogar'] },
  { id: 'urgencia-regresiva', nombre: 'Urgencia y Cuenta Regresiva', categoria: 'Conversión Directa', descripcion: 'Diseño con temporizador o indicador de stock limitado', mejor_para: ['ofertas', 'lanzamientos', 'temporadas'] },
  { id: 'producto-hero-beneficios', nombre: 'Producto Hero con Beneficios', categoria: 'Conversión Directa', descripcion: 'Producto grande con bullets de beneficios alrededor', mejor_para: ['ecommerce', 'suplementos', 'tecnología'] },
  { id: 'antes-despues-dolor', nombre: 'Antes/Después con Dolor', categoria: 'Conversión Directa', descripcion: 'Contraste visual potente del problema y la solución', mejor_para: ['salud', 'fitness', 'skincare'] },
  // PREMIUM / LIFESTYLE
  { id: 'cinematografico-oscuro', nombre: 'Cinematográfico Oscuro', categoria: 'Premium / Lifestyle', descripcion: 'Fondo oscuro dramático, producto iluminado, look premium', mejor_para: ['perfumes', 'relojes', 'electrónica'] },
  { id: 'lifestyle-calido', nombre: 'Lifestyle Cálido', categoria: 'Premium / Lifestyle', descripcion: 'Tonos dorados y cálidos, ambiente hogareño y aspiracional', mejor_para: ['decoración', 'alimentos', 'bienestar'] },
  { id: 'natural-organico', nombre: 'Natural y Orgánico', categoria: 'Premium / Lifestyle', descripcion: 'Fondo natural, luz solar, ambiente ecológico y saludable', mejor_para: ['orgánicos', 'cosméticos naturales', 'bienestar'] },
  { id: 'automatico', nombre: 'Automático', categoria: 'IA Elige', descripcion: 'La IA elige el mejor estilo según tu producto y objetivo', mejor_para: ['todos'] },
]

// ─── TIPOS DE SECUENCIA ──────────────────────────────────────────
export const TIPOS_SECUENCIA = [
  { id: 'landing', label: 'Landing', subtitulo: 'Vertical 9:16', descripcion: 'Para historias, reels y landing pages móviles', icon: '▯' },
  { id: 'carrusel', label: 'Carrusel', subtitulo: 'Cuadrado 1:1', descripcion: 'Para carruseles de Instagram y Facebook', icon: '▣' },
]

// ─── TIPOS DE GENERACIÓN ANUNCIOS ────────────────────────────────
export const TIPOS_GENERACION = [
  { id: 'imagenes', label: 'Imágenes', subtitulo: 'Feed, stories, carrusel', icon: '🖼️' },
  { id: 'videos', label: 'Videos', subtitulo: 'Reels, TikTok, UGC', icon: '🎬' },
]

// ─── ÁNGULOS CATÁLOGO ────────────────────────────────────────────
export const ANGULOS_CATALOGO = [
  { id: 'todos', label: 'Frontal + 3/4 + Detalle', descripcion: 'Todos los ángulos principales' },
  { id: 'lifestyle', label: 'Lifestyle en uso', descripcion: 'Producto en contexto de uso real' },
  { id: 'blanco', label: 'Solo fondo blanco', descripcion: 'Estilo Amazon/Marketplace' },
  { id: 'degradado', label: 'Degradado suave', descripcion: 'Fondo colorido y moderno' },
]
