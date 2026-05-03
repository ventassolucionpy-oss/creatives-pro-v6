-- =============================================
-- SCHEMA ADDITIONS — Campaña Completa & Mejoras
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

-- Agregar 'campana-completa' al check constraint de generations
ALTER TABLE generations DROP CONSTRAINT IF EXISTS generations_tool_check;
ALTER TABLE generations ADD CONSTRAINT generations_tool_check 
  CHECK (tool IN (
    'ugc-anuncios', 'ugc-secuencias', 'ugc-catalogo', 
    'meta-ads', 'tiktok', 'hotmart', 'ugc-creator',
    'andromeda', 'andromeda-meta-ads', 'campana-completa'
  ));

-- Índice para búsqueda por herramienta más rápida
CREATE INDEX IF NOT EXISTS idx_generations_tool_user ON generations(tool, user_id);
CREATE INDEX IF NOT EXISTS idx_generations_product ON generations(product_id) WHERE product_id IS NOT NULL;

-- Vista para analytics de uso por framework
CREATE OR REPLACE VIEW framework_analytics AS
SELECT 
  user_id,
  tool,
  jsonb_array_elements(output->'copies')->>'framework' as framework,
  count(*) as uses,
  max(created_at) as last_used
FROM generations
WHERE output IS NOT NULL AND output ? 'copies'
GROUP BY user_id, tool, framework;

COMMENT ON VIEW framework_analytics IS 'Analytics de qué frameworks de copywriting usa más cada usuario';

-- Agregar todos los nuevos tools al constraint
ALTER TABLE generations DROP CONSTRAINT IF EXISTS generations_tool_check;
ALTER TABLE generations ADD CONSTRAINT generations_tool_check 
  CHECK (tool IN (
    'ugc-anuncios', 'ugc-secuencias', 'ugc-catalogo', 
    'meta-ads', 'tiktok', 'hotmart', 'ugc-creator',
    'andromeda', 'andromeda-meta-ads', 'campana-completa',
    'landing-page', 'spy-anuncio', 'analisis-nicho', 'email-flows'
  ));

-- Todos los tools nuevos
ALTER TABLE generations DROP CONSTRAINT IF EXISTS generations_tool_check;
ALTER TABLE generations ADD CONSTRAINT generations_tool_check 
  CHECK (tool IN (
    'ugc-anuncios','ugc-secuencias','ugc-catalogo','meta-ads','tiktok','hotmart',
    'ugc-creator','andromeda','andromeda-meta-ads','campana-completa',
    'landing-page','spy-anuncio','analisis-nicho','email-flows','tiktok-shop'
  ));

-- Todos los tools incluyendo los nuevos
ALTER TABLE generations DROP CONSTRAINT IF EXISTS generations_tool_check;
ALTER TABLE generations ADD CONSTRAINT generations_tool_check 
  CHECK (tool IN (
    'ugc-anuncios','ugc-secuencias','ugc-catalogo','meta-ads','tiktok','hotmart',
    'ugc-creator','andromeda','andromeda-meta-ads','campana-completa',
    'landing-page','spy-anuncio','analisis-nicho','email-flows','tiktok-shop',
    'customer-service','whatsapp-biz','temporadas','lanzar-producto','copy-intelligence'
  ));

-- Agregar nuevos tools
ALTER TABLE generations DROP CONSTRAINT IF EXISTS generations_tool_check;
ALTER TABLE generations ADD CONSTRAINT generations_tool_check 
  CHECK (tool IN (
    'ugc-anuncios','ugc-secuencias','ugc-catalogo','meta-ads','tiktok','hotmart',
    'ugc-creator','andromeda','andromeda-meta-ads','campana-completa',
    'landing-page','spy-anuncio','analisis-nicho','email-flows','tiktok-shop',
    'customer-service','whatsapp-biz','temporadas','lanzar-producto','copy-intelligence',
    'organico'
  ));

ALTER TABLE generations DROP CONSTRAINT IF EXISTS generations_tool_check;
ALTER TABLE generations ADD CONSTRAINT generations_tool_check 
  CHECK (tool IN (
    'ugc-anuncios','ugc-secuencias','ugc-catalogo','meta-ads','tiktok','hotmart',
    'ugc-creator','andromeda','andromeda-meta-ads','campana-completa',
    'landing-page','spy-anuncio','analisis-nicho','email-flows','tiktok-shop',
    'customer-service','whatsapp-biz','temporadas','lanzar-producto','copy-intelligence',
    'organico','buyer-persona'
  ));
