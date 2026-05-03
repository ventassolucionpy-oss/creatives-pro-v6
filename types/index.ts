// =============================================
// TIPOS GLOBALES DE LA APP
// =============================================

export type User = {
  id: string
  email: string
  name: string
  avatar_url?: string
  role: 'admin' | 'editor' | 'viewer'
  created_at: string
}

export type Product = {
  id: string
  user_id: string
  name: string
  description: string
  price?: number
  currency?: string
  category: 'fisico' | 'digital' | 'servicio'
  platform?: 'hotmart' | 'shopify' | 'mercadolibre' | 'otro'
  image_url?: string
  url?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export type Generation = {
  id: string
  user_id: string
  product_id?: string
  tool: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  input: Record<string, unknown>
  output?: GenerationOutput
  created_at: string
}

export type PerfilAudiencia = {
  id: number
  nombre: string
  temperatura: 'frio' | 'tibio' | 'caliente' | 'muy_caliente'
  descripcion: string
  demografia: { edad: string; genero: string; ubicacion: string[]; nivel_socioeconomico: string }
  intereses: string[]
  comportamientos: string[]
  exclusiones: string[]
  lookalike_fuente: string
  copy_recomendado: string
  presupuesto_sugerido: string
  objetivo_meta: string
}

export type EstructuraCampana = {
  tipo: string
  razon: string
  campana: string
  objetivo_meta: string
  presupuesto_total_diario: string
  ad_sets: { nombre: string; audiencia_id: number; presupuesto_diario: string; copies_asignados: number[]; objetivo: string }[]
  fase_aprendizaje: string
  cuando_escalar: string
  cuando_matar: string
}

export type HookAlternativo = {
  copy_id: number
  hook_original: string
  variantes: { id: string; hook: string; tipo: string; por_que_probar: string }[]
}

export type ChecklistItem = { item: string; critico: boolean }

export type ChecklistLanzamiento = {
  pixel: ChecklistItem[]
  cuenta: ChecklistItem[]
  creatividades: ChecklistItem[]
  pagina_destino: ChecklistItem[]
  estrategia: ChecklistItem[]
}

export type KPIMetrica = {
  metrica: string
  rango_malo: string
  rango_bueno: string
  rango_excelente: string
  accion_si_malo: string
}

export type AnalisisMetricas = {
  kpis_principales: KPIMetrica[]
  cuando_escalar: string
  cuando_matar: string
  señales_de_fatiga: string[]
  dias_para_decidir: string
}

export type SemanaRotacion = {
  objetivo: string
  acciones: string[]
  que_mirar: string
  decision_al_final: string
}

export type CalendarioRotacion = {
  semana_1: SemanaRotacion
  semana_2: SemanaRotacion
  semana_3: SemanaRotacion
  semana_4: SemanaRotacion
  reglas_generales: string[]
}

export type GenerationOutput = {
  copies?: CopyVariant[]
  leonardoPrompts?: LeonardoPrompt[]
  guionVideo?: GuionVideo
  imageUrl?: string
  metaAds?: MetaAdsOutput
  tiktokScript?: TikTokOutput
  hotmartFunnel?: HotmartOutput
  secuencias?: Secuencia[]
  catalogoPrompts?: CatalogoPrompt[]
  perfilesAudiencia?: PerfilAudiencia[]
  estructuraCampana?: EstructuraCampana
  hooksAlternativos?: HookAlternativo[]
  checklistLanzamiento?: ChecklistLanzamiento
  analisisMetricas?: AnalisisMetricas
  calendarioRotacion?: CalendarioRotacion
}

export type NanaBananaPromptItem = {
  formato: '16:9' | '1:1' | '4:5'
  tipo: 'imagen' | 'video'
  prompt: string
  negativePrompt: string
}

export type NanaBananaPrompts = {
  imagen: NanaBananaPromptItem[]
  video: NanaBananaPromptItem[]
}

export type CopyVariant = {
  id: number
  tipo?: string
  estrategia?: string
  // New framework fields
  framework?: string
  angulo?: string
  nivel_conciencia?: number
  hook?: string
  por_que_funciona?: string
  // Common fields
  titular: string
  cuerpo: string
  cta: string
  hashtags: string[]
  // Nano Banana Pro prompts
  nanoBananaPrompts?: NanaBananaPrompts
}

export type LeonardoPrompt = {
  id: number
  uso: string
  prompt: string
  negativePrompt: string
  settings: {
    model: string
    style: string
    ratio: string
  }
}

export type GuionVideo = {
  duracion: string
  estructura: {
    segundo: string
    escena: string
    texto: string
    accion: string
  }[]
}

export type MetaAdsOutput = {
  campana: string
  objetivo: string
  audiencia: {
    edad: string
    intereses: string[]
    comportamientos: string[]
    ubicaciones: string[]
  }
  copies: {
    primario: string
    titular: string
    descripcion: string
    cta: string
  }[]
  presupuesto: {
    diario_recomendado: string
    cpm_estimado: string
    cpc_estimado: string
  }
  leonardoPrompts: LeonardoPrompt[]
}

export type TikTokOutput = {
  guion: {
    hook: string
    desarrollo: string
    cta: string
    duracion: string
    musica_sugerida: string
  }[]
  hashtags: string[]
  caption: string
  leonardoPrompts: LeonardoPrompt[]
}

export type HotmartOutput = {
  producto: {
    nombre: string
    promesa: string
    publico: string
    precio_sugerido: string
    garantia: string
  }
  pagina_ventas: {
    headline: string
    subheadline: string
    beneficios: string[]
    objeciones: string[]
    testimonios_ficticios: string[]
    cta_principal: string
  }
  emails: {
    asunto: string
    cuerpo: string
    tipo: string
  }[]
  whatsapp_scripts: string[]
  leonardoPrompts: LeonardoPrompt[]
}

export type Secuencia = {
  id: number
  orden: number
  tipo: string
  titulo: string
  descripcion: string
  prompt: string
  negativePrompt: string
  ratio: string
  nanoBananaPrompts?: NanaBananaPrompts
}

export type CatalogoPrompt = {
  id: number
  angulo: string
  fondo: string
  prompt: string
  negativePrompt: string
  settings: {
    model: string
    ratio: string
  }
  nanoBananaPrompts?: NanaBananaPrompts
}

export type WizardStep = {
  id: number
  label: string
  completed: boolean
  current: boolean
}

// Tool definitions
export type ToolType = {
  id: string
  nombre: string
  descripcion: string
  icono: string
  color: string
  pasos: string[]
  disponible: boolean
}

// A/B Tracker types
export type ABCampaign = {
  id: string
  user_id: string
  generation_id?: string
  product_id?: string
  nombre: string
  plataforma: string
  estado: 'activa' | 'pausada' | 'finalizada'
  fecha_inicio: string
  fecha_fin?: string
  presupuesto_total?: number
  notas?: string
  ab_variants: ABVariant[]
  created_at: string
}

export type ABVariant = {
  id: string
  campaign_id: string
  user_id: string
  nombre: string
  framework?: string
  angulo?: string
  nivel_conciencia?: number
  hook?: string
  titular: string
  cuerpo: string
  cta: string
  impresiones: number
  clicks: number
  conversiones: number
  gasto: number
  ingresos: number
  ctr: number
  cpa: number
  roas: number
  estado: 'en_prueba' | 'ganadora' | 'perdedora' | 'pausada'
  created_at: string
}

export type HotmartEvent = {
  id: string
  hotmart_id: string
  event_type: string
  status: string
  product_id_hotmart?: string
  buyer_email?: string
  buyer_name?: string
  value: number
  currency: string
  generation_id?: string
  ab_variant_id?: string
  created_at: string
}

// UGC Creator output type
export type UGCGuion = {
  id: number
  tipo: string
  angulo: string
  duracion_estimada: string
  hook_principal: string
  hook_alternativo: string
  guion: {
    apertura: { segundos: string; texto: string; visual: string; nota_actuacion: string }
    desarrollo: { segundos: string; texto: string; visual: string; nota_actuacion: string }
    cierre_cta: { segundos: string; texto: string; visual: string; nota_actuacion: string }
  }
  briefing_creador: string
  variante_b: string
}
