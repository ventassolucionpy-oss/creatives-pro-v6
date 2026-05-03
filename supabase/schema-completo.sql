-- =============================================
-- SCHEMA COMPLETO CONSOLIDADO — Creatives Pro v5
-- Ejecutar en el SQL Editor de Supabase (en orden)
-- =============================================

-- ─────────────────────────────────────────────
-- SECCIÓN 1: TABLAS BASE
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 'editor');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Tabla de productos — unificada con datos de portfolio
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  category TEXT NOT NULL CHECK (category IN ('fisico', 'digital', 'servicio')),
  platform TEXT CHECK (platform IN ('hotmart', 'shopify', 'mercadolibre', 'otro')),
  image_url TEXT,
  url TEXT,
  tags TEXT[],
  -- Campos de dropshipping Paraguay
  costo_gs INTEGER DEFAULT 0,
  precio_venta_gs INTEGER DEFAULT 0,
  precio_tachado_gs INTEGER DEFAULT 0,
  audiencia TEXT DEFAULT '',
  beneficio_principal TEXT DEFAULT '',
  angulos_de_venta TEXT[] DEFAULT '{}',
  prompts_gemini JSONB DEFAULT '[]',
  -- Estado y métricas del portfolio
  portfolio_estado TEXT DEFAULT 'testeando' CHECK (portfolio_estado IN ('testeando','escalando','mantenimiento','pausado','muerto')),
  portfolio_plataforma TEXT DEFAULT 'meta' CHECK (portfolio_plataforma IN ('meta','tiktok','ambas')),
  roas_actual DECIMAL(6,2) DEFAULT 0,
  roas_semana_pasada DECIMAL(6,2) DEFAULT 0,
  gasto_total DECIMAL(12,2) DEFAULT 0,
  ingresos_total DECIMAL(12,2) DEFAULT 0,
  pedidos_totales INTEGER DEFAULT 0,
  tasa_entrega DECIMAL(5,2) DEFAULT 75,
  dias_activo INTEGER DEFAULT 0,
  presupuesto_diario DECIMAL(10,2) DEFAULT 0,
  portfolio_notas TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLA GENERACIONES — CHECK constraint con TODOS los tools
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  tool TEXT NOT NULL CHECK (tool IN (
    'ugc-anuncios','ugc-secuencias','ugc-catalogo',
    'meta-ads','tiktok','hotmart','andromeda','ugc-creator',
    'campana-completa','lanzar-producto','buyer-persona',
    'organico','spy-anuncio','email-flows','tiktok-shop',
    'whatsapp-flows','customer-service','analisis-nicho',
    'temporada','contenido-imagen','creativo-visual',
    'testimonios','upsell','checkout-dropi','landing-page',
    'sourcing','precios-psicologicos','validador-producto',
    'whatsapp-ventas','postmortem','comparador-copies'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  input JSONB NOT NULL DEFAULT '{}',
  output JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SECCIÓN 2: A/B TRACKER
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ab_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  plataforma TEXT NOT NULL DEFAULT 'meta',
  estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa','pausada','finalizada')),
  fecha_inicio DATE DEFAULT CURRENT_DATE,
  fecha_fin DATE,
  presupuesto_total DECIMAL(10,2),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
  impresiones INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversiones INTEGER DEFAULT 0,
  gasto DECIMAL(10,2) DEFAULT 0,
  ingresos DECIMAL(10,2) DEFAULT 0,
  ctr DECIMAL(6,4) GENERATED ALWAYS AS (
    CASE WHEN impresiones > 0 THEN clicks::DECIMAL / impresiones ELSE 0 END
  ) STORED,
  cpa DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE WHEN conversiones > 0 THEN gasto / conversiones ELSE NULL END
  ) STORED,
  roas DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE WHEN gasto > 0 THEN ingresos / gasto ELSE NULL END
  ) STORED,
  estado TEXT NOT NULL DEFAULT 'en_prueba' CHECK (estado IN ('en_prueba','ganadora','perdedora','pausada')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SECCIÓN 3: PEDIDOS COD
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  producto TEXT NOT NULL,
  ciudad TEXT NOT NULL DEFAULT 'Asunción',
  precio INTEGER NOT NULL,
  telefono TEXT DEFAULT '',
  notas TEXT DEFAULT '',
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','en_camino','entregado','devuelto','rechazado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SECCIÓN 4: HOOKS BIBLIOTECA
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hooks_biblioteca (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  texto TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'Curiosidad',
  producto TEXT NOT NULL DEFAULT 'General',
  plataforma TEXT NOT NULL DEFAULT 'meta' CHECK (plataforma IN ('meta','tiktok','ambas')),
  roas DECIMAL(6,2),
  votos INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SECCIÓN 5: KPI SNAPSHOTS
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS kpi_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  periodo TEXT NOT NULL DEFAULT 'hoy' CHECK (periodo IN ('hoy','semana','mes')),
  plataforma TEXT NOT NULL DEFAULT 'ambas' CHECK (plataforma IN ('meta','tiktok','ambas')),
  gasto_total DECIMAL(12,2) DEFAULT 0,
  ingresos_total DECIMAL(12,2) DEFAULT 0,
  ventas_total INTEGER DEFAULT 0,
  entregadas INTEGER DEFAULT 0,
  pedidos_totales INTEGER DEFAULT 0,
  cpa DECIMAL(10,2) DEFAULT 0,
  roas DECIMAL(6,2) DEFAULT 0,
  tasa_entrega DECIMAL(5,2) DEFAULT 75,
  margen_neto DECIMAL(12,2) DEFAULT 0,
  costo_producto DECIMAL(10,2) DEFAULT 0,
  precio_venta DECIMAL(10,2) DEFAULT 0,
  top_producto TEXT DEFAULT '',
  notas TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SECCIÓN 6: HOTMART WEBHOOK
-- ─────────────────────────────────────────────

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
  generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
  ab_variant_id UUID REFERENCES ab_variants(id) ON DELETE SET NULL,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SECCIÓN 7: MÓDULO PERSONAL
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ad_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
  copy_id INTEGER,
  framework TEXT,
  angulo TEXT,
  hook TEXT,
  nivel_conciencia INTEGER,
  impresiones INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversiones INTEGER DEFAULT 0,
  gasto DECIMAL(10,2) DEFAULT 0,
  ingresos DECIMAL(10,2) DEFAULT 0,
  ctr DECIMAL(8,6) DEFAULT 0,
  cpc DECIMAL(10,2) DEFAULT 0,
  cpa DECIMAL(10,2) DEFAULT 0,
  roas DECIMAL(10,2) DEFAULT 0,
  estado TEXT DEFAULT 'en_prueba' CHECK (estado IN ('en_prueba','ganadora','perdedora','pausada')),
  notas TEXT,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  producto_nombre TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prompt_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT DEFAULT '',
  tipo TEXT NOT NULL CHECK (tipo IN ('imagen','video','leonardo','copy')),
  formato TEXT DEFAULT '',
  angulo TEXT DEFAULT '',
  producto_nombre TEXT DEFAULT '',
  herramienta TEXT DEFAULT '',
  destacado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SECCIÓN 8: ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotmart_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE hooks_biblioteca ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own products" ON products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create products" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products" ON products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own products" ON products FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own generations" ON generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create generations" ON generations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own generations" ON generations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users see own campaigns" ON ab_campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own variants" ON ab_variants FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see hotmart events" ON hotmart_events FOR SELECT USING (true);
CREATE POLICY "Service can insert hotmart events" ON hotmart_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Users see own ad results" ON ad_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own prompt library" ON prompt_library FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own pedidos" ON pedidos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own hooks" ON hooks_biblioteca FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own kpis" ON kpi_snapshots FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- SECCIÓN 9: ÍNDICES
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_tool ON generations(tool);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ab_campaigns_user ON ab_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_variants_campaign ON ab_variants(campaign_id);
CREATE INDEX IF NOT EXISTS idx_hotmart_events_type ON hotmart_events(event_type);
CREATE INDEX IF NOT EXISTS idx_hotmart_events_generation ON hotmart_events(generation_id);
CREATE INDEX IF NOT EXISTS idx_ad_results_user ON ad_results(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_results_generation ON ad_results(generation_id);
CREATE INDEX IF NOT EXISTS idx_prompt_library_user ON prompt_library(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_library_tipo ON prompt_library(tipo);
CREATE INDEX IF NOT EXISTS idx_prompt_library_destacado ON prompt_library(destacado);
CREATE INDEX IF NOT EXISTS idx_pedidos_user ON pedidos(user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON pedidos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hooks_biblioteca_user ON hooks_biblioteca(user_id);
CREATE INDEX IF NOT EXISTS idx_hooks_biblioteca_votos ON hooks_biblioteca(votos DESC);
CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_user ON kpi_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_created_at ON kpi_snapshots(created_at DESC);

-- ─────────────────────────────────────────────
-- SECCIÓN 10: STORAGE
-- ─────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Product images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Users can delete own product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ─────────────────────────────────────────────
-- SECCIÓN 11: MIGRATION SCRIPT
-- Ejecutar SOLO si ya tenés la BD existente (no en instalación nueva)
-- ─────────────────────────────────────────────

-- ALTER TABLE generations DROP CONSTRAINT IF EXISTS generations_tool_check;
-- ALTER TABLE generations ADD CONSTRAINT generations_tool_check CHECK (tool IN (
--   'ugc-anuncios','ugc-secuencias','ugc-catalogo',
--   'meta-ads','tiktok','hotmart','andromeda','ugc-creator',
--   'campana-completa','lanzar-producto','buyer-persona',
--   'organico','spy-anuncio','email-flows','tiktok-shop',
--   'whatsapp-flows','customer-service','analisis-nicho',
--   'temporada','contenido-imagen','creativo-visual',
--   'testimonios','upsell','checkout-dropi','landing-page',
--   'sourcing','precios-psicologicos','validador-producto',
--   'whatsapp-ventas','postmortem','comparador-copies'
-- ));
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS costo_gs INTEGER DEFAULT 0;
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS precio_venta_gs INTEGER DEFAULT 0;
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS precio_tachado_gs INTEGER DEFAULT 0;
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS audiencia TEXT DEFAULT '';
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS beneficio_principal TEXT DEFAULT '';
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS angulos_de_venta TEXT[] DEFAULT '{}';
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS prompts_gemini JSONB DEFAULT '[]';
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS portfolio_estado TEXT DEFAULT 'testeando';
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS portfolio_plataforma TEXT DEFAULT 'meta';
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS roas_actual DECIMAL(6,2) DEFAULT 0;
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS roas_semana_pasada DECIMAL(6,2) DEFAULT 0;
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS gasto_total DECIMAL(12,2) DEFAULT 0;
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS ingresos_total DECIMAL(12,2) DEFAULT 0;
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS pedidos_totales INTEGER DEFAULT 0;
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS tasa_entrega DECIMAL(5,2) DEFAULT 75;
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS dias_activo INTEGER DEFAULT 0;
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS presupuesto_diario DECIMAL(10,2) DEFAULT 0;
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS portfolio_notas TEXT DEFAULT '';
-- CREATE TABLE IF NOT EXISTS pedidos (...); -- ver arriba
-- CREATE TABLE IF NOT EXISTS hooks_biblioteca (...); -- ver arriba
-- CREATE TABLE IF NOT EXISTS kpi_snapshots (...); -- ver arriba
