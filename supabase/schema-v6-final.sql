-- =============================================
-- SCHEMA v6 FINAL — Creatives Pro
-- EJECUTAR COMPLETO en Supabase SQL Editor
-- Incluye: multi-país, ad_spend, upsell tracking,
-- y constraint de tools DEFINITIVO y completo.
-- =============================================

-- ─────────────────────────────────────────────
-- 1. AGREGAR CAMPO PAÍS A TABLAS EXISTENTES
-- ─────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pais TEXT DEFAULT 'PY' CHECK (pais IN ('PY','CO','MX')),
  ADD COLUMN IF NOT EXISTS moneda TEXT DEFAULT 'PYG';

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS pais TEXT DEFAULT 'PY' CHECK (pais IN ('PY','CO','MX'));

ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS pais TEXT DEFAULT 'PY' CHECK (pais IN ('PY','CO','MX')),
  ADD COLUMN IF NOT EXISTS upsell_aceptado BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS upsell_producto TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS dropi_order_id TEXT DEFAULT NULL,  -- para webhook matching
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_pedidos_dropi_order ON pedidos(dropi_order_id) WHERE dropi_order_id IS NOT NULL;

ALTER TABLE ab_campaigns
  ADD COLUMN IF NOT EXISTS pais TEXT DEFAULT 'PY' CHECK (pais IN ('PY','CO','MX'));

-- ─────────────────────────────────────────────
-- 2. TABLA AD_SPEND_ENTRIES (P&L real)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ad_spend_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  monto_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
  monto_local DECIMAL(14,2) NOT NULL DEFAULT 0,
  moneda TEXT NOT NULL DEFAULT 'PYG',
  plataforma TEXT NOT NULL DEFAULT 'meta' CHECK (plataforma IN ('meta','tiktok','google','otro')),
  pais TEXT DEFAULT 'PY' CHECK (pais IN ('PY','CO','MX')),
  notas TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_spend_user_fecha ON ad_spend_entries(user_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_ad_spend_product ON ad_spend_entries(product_id) WHERE product_id IS NOT NULL;

ALTER TABLE ad_spend_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ad_spend_own" ON ad_spend_entries;
CREATE POLICY "ad_spend_own" ON ad_spend_entries
  FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 3. CONSTRAINT DE TOOLS — VERSIÓN DEFINITIVA
--    Incluye TODOS los tools de la app v6
-- ─────────────────────────────────────────────
ALTER TABLE generations DROP CONSTRAINT IF EXISTS generations_tool_check;
ALTER TABLE generations ADD CONSTRAINT generations_tool_check
  CHECK (tool IN (
    -- Creativos y copies
    'ugc-anuncios','ugc-secuencias','ugc-catalogo','ugc-creator',
    'meta-ads','tiktok','hotmart','andromeda','andromeda-meta-ads',
    -- Flujos de campaña
    'campana-completa','lanzar-producto',
    -- Páginas y conversión
    'landing-page','cro','oferta','upsell','checkout-dropi',
    -- Research y estrategia
    'spy-anuncio','analisis-nicho','buyer-persona','sourcing',
    'validador-producto','precios-psicologicos','rentabilidad',
    -- Contenido orgánico y social
    'organico','tiktok-shop','contenido-imagen','creativo-visual',
    'testimonios','temporadas',
    -- Emails, WhatsApp y retención
    'email-flows','whatsapp-biz','whatsapp-flows','whatsapp-ventas',
    'customer-service','retencion',
    -- Analytics y gestión
    'copy-intelligence','comparador-copies','postmortem',
    'presupuesto-escalado','ab-tracker',
    -- Nuevos en v6
    'oferta-flash','copy-scorer','logistica-cod','ugc-review',
    'roas-simulator','audiencia-heat'
  ));

-- ─────────────────────────────────────────────
-- 4. TABLA CREADORES UGC
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS creadores_ugc (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  instagram TEXT DEFAULT '',
  tiktok TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  nicho TEXT DEFAULT '',
  tarifa_usd DECIMAL(8,2) DEFAULT 0,
  moneda_pago TEXT DEFAULT 'USD',
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo','inactivo','en_prueba')),
  pais TEXT DEFAULT 'PY' CHECK (pais IN ('PY','CO','MX')),
  notas TEXT DEFAULT '',
  guiones_asignados INTEGER DEFAULT 0,
  guiones_entregados INTEGER DEFAULT 0,
  ultima_entrega DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE creadores_ugc ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "creadores_own" ON creadores_ugc;
CREATE POLICY "creadores_own" ON creadores_ugc
  FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 5. TABLA ALERTAS (para Web Push futuro)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alertas_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('roas_bajo','roas_alto','frecuencia_alta','tasa_entrega_baja','sin_copy','presupuesto_agotado')),
  umbral DECIMAL(10,2) NOT NULL,
  activa BOOLEAN DEFAULT TRUE,
  canal TEXT DEFAULT 'app' CHECK (canal IN ('app','whatsapp','email')),
  whatsapp_numero TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE alertas_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "alertas_own" ON alertas_config;
CREATE POLICY "alertas_own" ON alertas_config
  FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 6. ÍNDICES DE PERFORMANCE
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_pais ON products(user_id, pais);
CREATE INDEX IF NOT EXISTS idx_pedidos_pais ON pedidos(user_id, pais);
CREATE INDEX IF NOT EXISTS idx_ab_campaigns_pais ON ab_campaigns(user_id, pais) WHERE pais IS NOT NULL;

-- ─────────────────────────────────────────────
-- 7. FUNCIÓN HELPER: GASTO ADS HOY
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_gasto_ads_hoy(p_user_id UUID, p_pais TEXT DEFAULT 'PY')
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(monto_usd), 0)
  FROM ad_spend_entries
  WHERE user_id = p_user_id
    AND fecha = CURRENT_DATE
    AND pais = p_pais;
$$ LANGUAGE sql SECURITY DEFINER;

-- Fin del schema v6
SELECT 'Schema v6 aplicado correctamente' as status;
