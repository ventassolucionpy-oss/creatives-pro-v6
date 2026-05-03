-- =============================================
-- SCHEMA PERSONAL — Ejecutar en Supabase SQL Editor
-- Nuevas tablas para uso personal
-- =============================================

-- Tabla para guardar resultados reales de ads
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
  estado TEXT DEFAULT 'en_prueba' CHECK (estado IN ('en_prueba', 'ganadora', 'perdedora', 'pausada')),
  notas TEXT,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  producto_nombre TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Biblioteca de prompts
CREATE TABLE IF NOT EXISTS prompt_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT DEFAULT '',
  tipo TEXT NOT NULL CHECK (tipo IN ('imagen', 'video', 'leonardo', 'copy')),
  formato TEXT DEFAULT '',
  angulo TEXT DEFAULT '',
  producto_nombre TEXT DEFAULT '',
  herramienta TEXT DEFAULT '',
  destacado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE ad_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own ad results" ON ad_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own prompt library" ON prompt_library FOR ALL USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ad_results_user ON ad_results(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_results_generation ON ad_results(generation_id);
CREATE INDEX IF NOT EXISTS idx_prompt_library_user ON prompt_library(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_library_tipo ON prompt_library(tipo);
CREATE INDEX IF NOT EXISTS idx_prompt_library_destacado ON prompt_library(destacado);

-- Actualizar la tabla de generaciones para incluir ugc-creator si no está
ALTER TABLE generations DROP CONSTRAINT IF EXISTS generations_tool_check;
ALTER TABLE generations ADD CONSTRAINT generations_tool_check
  CHECK (tool IN ('ugc-anuncios','ugc-secuencias','ugc-catalogo','meta-ads','tiktok','hotmart','andromeda','ugc-creator'));
