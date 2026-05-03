// =============================================
// CONSTANTS CENTRALIZADAS — Creatives Pro v6
// Fuente única de verdad para todos los valores
// operativos por país. NUNCA hardcodear estos
// valores en los componentes individuales.
// =============================================

export type Pais = 'PY' | 'CO' | 'MX'

export type PaisConfig = {
  codigo: Pais
  nombre: string
  bandera: string
  moneda: string
  simbolo: string
  fx_usd: number           // unidades de moneda local por 1 USD
  flete_dropi: number      // costo flete en moneda local
  tasa_entrega_default: number  // % default COD
  precio_min: number       // sweet spot mínimo en moneda local
  precio_max: number       // sweet spot máximo en moneda local
  precio_round_base: number    // base para redondeo psicológico
  locale: string           // para Intl.NumberFormat
  url_dropi: string
  contexto_cultural: string  // para prompts de IA
}

export const PAISES: Record<Pais, PaisConfig> = {
  PY: {
    codigo: 'PY',
    nombre: 'Paraguay',
    bandera: '🇵🇾',
    moneda: 'PYG',
    simbolo: 'Gs.',
    fx_usd: 6350,
    flete_dropi: 38000,
    tasa_entrega_default: 75,
    precio_min: 80000,
    precio_max: 250000,
    precio_round_base: 7000,
    locale: 'es-PY',
    url_dropi: 'https://dropi.co/py',
    contexto_cultural: 'Paraguay, Asunción y ciudades del interior. Clima subtropical, 40°C en verano. Compradores muy desconfiados del ecommerce — la garantía COD es clave. Precio en Guaraníes (Gs.). El 90%+ del contacto es por WhatsApp. Entrega 1-3 días hábiles en Asunción, 3-5 días en interior.',
  },
  CO: {
    codigo: 'CO',
    nombre: 'Colombia',
    bandera: '🇨🇴',
    moneda: 'COP',
    simbolo: '$',
    fx_usd: 4200,
    flete_dropi: 15000,
    tasa_entrega_default: 72,
    precio_min: 60000,
    precio_max: 250000,
    precio_round_base: 9000,
    locale: 'es-CO',
    url_dropi: 'https://dropi.co/co',
    contexto_cultural: 'Colombia. Mercado grande y competitivo. Bogotá, Medellín, Cali y ciudades intermedias. El comprador colombiano es price-sensitive pero responde bien a urgencia y prueba social. Precio en Pesos colombianos ($). WhatsApp domina el servicio post-venta. Entrega 2-4 días en ciudades principales.',
  },
  MX: {
    codigo: 'MX',
    nombre: 'México',
    bandera: '🇲🇽',
    moneda: 'MXN',
    simbolo: '$',
    fx_usd: 17.2,
    flete_dropi: 89,
    tasa_entrega_default: 68,
    precio_min: 350,
    precio_max: 1200,
    precio_round_base: 9,
    locale: 'es-MX',
    url_dropi: 'https://dropi.co/mx',
    contexto_cultural: 'México. Mercado más grande de LATAM. CDMX, Guadalajara, Monterrey y resto de la república. El comprador mexicano es escéptico — valoran mucho los testimonios reales. Precio en Pesos mexicanos ($). Competencia alta. Entrega 2-5 días según zona.',
  },
}

export const PAIS_DEFAULT: Pais = 'PY'

// Helper: obtener config del país del usuario
export function getPaisConfig(pais?: string | null): PaisConfig {
  return PAISES[(pais as Pais) || PAIS_DEFAULT] || PAISES.PY
}

// Helper: formatear precio en moneda local
export function formatPrecio(amount: number, pais: Pais): string {
  const cfg = PAISES[pais]
  const rounded = Math.round(amount)
  if (pais === 'PY') {
    return `Gs. ${rounded.toLocaleString('es-PY')}`
  }
  return `${cfg.simbolo}${rounded.toLocaleString(cfg.locale)}`
}

// Helper: convertir USD a moneda local
export function usdToLocal(usd: number, pais: Pais): number {
  return usd * PAISES[pais].fx_usd
}

// Helper: convertir moneda local a USD
export function localToUsd(local: number, pais: Pais): number {
  return local / PAISES[pais].fx_usd
}

// Helper: redondear precio al estilo psicológico del país
export function redondearPrecioPsicologico(precio: number, pais: Pais): number {
  const cfg = PAISES[pais]
  if (pais === 'PY') {
    // Redondear al X7.000 más cercano arriba
    return Math.ceil(precio / cfg.precio_round_base) * cfg.precio_round_base
  }
  if (pais === 'CO') {
    // Redondear al X9.000 más cercano
    return Math.ceil(precio / 9000) * 9000
  }
  if (pais === 'MX') {
    // Redondear al X9 o X5 más cercano
    const base = precio < 100 ? 5 : precio < 500 ? 9 : 50
    return Math.ceil(precio / base) * base - (precio < 500 ? 0 : 1)
  }
  return Math.round(precio)
}

// Colores y labels comunes en la UI
export const ESTADO_COLORS: Record<string, string> = {
  escalando: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  estable: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  fatiga: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  muriendo: 'text-red-400 bg-red-500/10 border-red-500/30',
  nueva: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  testeando: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  escalando_prod: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  mantenimiento: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  pausado: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  muerto: 'text-red-400 bg-red-500/10 border-red-500/30',
}

// ROAS break-even por tasa de margen
export function calcBreakEven(precioVenta: number, costoTotal: number): number {
  const margen = precioVenta - costoTotal
  if (margen <= 0) return 999
  return precioVenta / margen
}
