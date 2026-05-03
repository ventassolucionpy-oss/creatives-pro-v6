-- =============================================
-- SCHEMA ADICIONAL v4 — Ejecutar en Supabase SQL Editor
-- Agregar estas tablas al schema existente
-- =============================================

-- A/B Tracker: registrar copies usados en campañas y sus resultados
CREATE TABLE IF NOT EXISTS ab_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  plataforma TEXT NOT NULL DEFAULT 'meta',
  estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'pausada', 'finalizada')),
  fecha_inicio DATE DEFAULT CURRENT_DATE,
  fecha_fin DATE,
  presupuesto_total DECIMAL(10,2),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Variantes de copy dentro de cada campaña
CREATE TABLE IF NOT EXISTS ab_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES ab_campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  framework TEXT,
  angulo TEXT,
  nivel_conciencia INTEGER,
  hook TEXT,
  titular TEXT NOT NULL,
  cuerpo TEXT NOT NULL,
  cta TEXT NOT NULL,
  -- Métricas de rendimiento (se actualizan manualmente o via webhook)
  impresiones INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversiones INTEGER DEFAULT 0,
  gasto DECIMAL(10,2) DEFAULT 0,
  ingresos DECIMAL(10,2) DEFAULT 0,
  -- Métricas calculadas
  ctr DECIMAL(6,4) GENERATED ALWAYS AS (
    CASE WHEN impresiones > 0 THEN clicks::DECIMAL / impresiones ELSE 0 END
  ) STORED,
  cpa DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE WHEN conversiones > 0 THEN gasto / conversiones ELSE NULL END
  ) STORED,
  roas DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE WHEN gasto > 0 THEN ingresos / gasto ELSE NULL END
  ) STORED,
  estado TEXT NOT NULL DEFAULT 'en_prueba' CHECK (estado IN ('en_prueba', 'ganadora', 'perdedora', 'pausada')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hotmart webhook events
CREATE TABLE IF NOT EXISTS hotmart_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotmart_id TEXT UNIQUE,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL,
  product_id_hotmart TEXT,
  buyer_email TEXT,
  buyer_name TEXT,
  value DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  commission DECIMAL(10,2),
  -- Link a generación que originó la conversión
  generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
  ab_variant_id UUID REFERENCES ab_variants(id) ON DELETE SET NULL,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para las nuevas tablas
ALTER TABLE ab_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotmart_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own campaigns" ON ab_campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own variants" ON ab_variants FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see hotmart events" ON hotmart_events FOR SELECT USING (true);
CREATE POLICY "Service can insert hotmart events" ON hotmart_events FOR INSERT WITH CHECK (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ab_campaigns_user ON ab_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_variants_campaign ON ab_variants(campaign_id);
CREATE INDEX IF NOT EXISTS idx_hotmart_events_type ON hotmart_events(event_type);
CREATE INDEX IF NOT EXISTS idx_hotmart_events_generation ON hotmart_events(generation_id);

-- Actualizar constraint en generations para incluir nuevas herramientas
ALTER TABLE generations DROP CONSTRAINT IF EXISTS generations_tool_check;
ALTER TABLE generations ADD CONSTRAINT generations_tool_check
  CHECK (tool IN ('ugc-anuncios','ugc-secuencias','ugc-catalogo','meta-ads','tiktok','hotmart','andromeda','ugc-creator'));
