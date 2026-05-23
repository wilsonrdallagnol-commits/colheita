-- ============================================================================
-- 0034_fichas_tecnicas_sync.sql
-- ============================================================================
-- Sincronização do Supabase prod com os dados das 16 fichas técnicas oficiais
-- Argho (lidas em 2026-05-22). Foco: alimentar o RAG (/api/agent/ask) com a
-- composição correta dos produtos pro agente PhD agronômico responder com
-- precisão técnica.
--
-- Mudanças aplicadas:
--   1. UPSERT 4 produtos novos: titan, bovex, controx, nemax
--      - Todos sao biológicos categoria 'Complexo microbiologico' (modelo neutro
--        compliance MAPA — ver apps/website/docs/biologicos-compliance.md).
--   2. UPDATE composição correta de troian
--      - Antes: Trichoderma harzianum + Bacillus subtilis (errado nas fichas)
--      - Depois: multi-Bacillus subtilis + velezensis + amyloliquefaciens
--
-- Idempotente: ON CONFLICT (tenant_id, slug) DO UPDATE.
-- Não hardcoda UUIDs — resolve tenant + categoria via slug.
--
-- APÓS APLICAR EM PROD (psql via Supavisor session mode conforme MEMORY.md):
--   pnpm --filter @colheita/jobs reindex-all
-- Re-indexa 5 produtos no pgvector (custo ~$0.02 Voyage embeddings).
-- ============================================================================

-- ── Helper: garante que tenant + categoria existem antes de inserir
DO $$
DECLARE
  v_tenant_id uuid;
  v_cat_bio_id uuid;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'argho' LIMIT 1;
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant argho nao existe — rode db:seed primeiro';
  END IF;

  SELECT id INTO v_cat_bio_id FROM product_categories
    WHERE slug = 'biologicos' AND tenant_id = v_tenant_id LIMIT 1;
  IF v_cat_bio_id IS NULL THEN
    RAISE EXCEPTION 'Categoria biologicos nao existe pro tenant argho';
  END IF;

  -- ── 1. BOVEX ──────────────────────────────────────────────────────────────
  INSERT INTO products (
    tenant_id, category_id, slug, safra_codigo, name, tagline, description,
    status, composition, technical_specs, packaging, applications
  ) VALUES (
    v_tenant_id, v_cat_bio_id, 'bovex', 'ARG-BOVEX', 'Bovex',
    'Complexo microbiológico fúngico entomopatogênico',
    'Bovex reúne três espécies de fungos entomopatogênicos em uma formulação biotecnológica de alta complexidade microbiológica: Beauveria bassiana, Metarhizium anisopliae e Cordyceps fumosorosea. Desenvolvido dentro da linha de biotecnologias da Argho Agrosciences, o Bovex se destaca pela combinação de três gêneros fúngicos distintos em uma única matriz biológica. Concentração total: 2,5 × 10¹⁰.',
    'published',
    '{"others": {"Beauveria bassiana": 1, "Metarhizium anisopliae": 1, "Cordyceps fumosorosea": 1}}'::jsonb,
    '{"physical_state": "fluido", "origin_country": "Espanha", "product_type": "Complexo microbiológico", "concentration_total": "2,5e10"}'::jsonb,
    '[{"type": "bottle", "volumeL": 1, "sku": "BOVEX-1L"}]'::jsonb,
    '[]'::jsonb
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    composition = EXCLUDED.composition,
    technical_specs = EXCLUDED.technical_specs,
    packaging = EXCLUDED.packaging,
    applications = EXCLUDED.applications,
    status = EXCLUDED.status,
    updated_at = now();

  -- ── 2. CONTROX ────────────────────────────────────────────────────────────
  INSERT INTO products (
    tenant_id, category_id, slug, safra_codigo, name, tagline, description,
    status, composition, technical_specs, packaging, applications
  ) VALUES (
    v_tenant_id, v_cat_bio_id, 'controx', 'ARG-CONTROX', 'Controx',
    'Complexo microbiológico multivariante de Bacillus thuringiensis',
    'Controx reúne duas variedades distintas de Bacillus thuringiensis em uma formulação biotecnológica de alta complexidade microbiológica: Bacillus thuringiensis var. thuringiensis e Bacillus thuringiensis var. kurstaki. Desenvolvido dentro da linha de biotecnologias da Argho Agrosciences. Concentração total: 2,5 × 10⁹.',
    'published',
    '{"others": {"Bacillus thuringiensis var. thuringiensis": 1, "Bacillus thuringiensis var. kurstaki": 1}}'::jsonb,
    '{"physical_state": "fluido", "origin_country": "Espanha", "product_type": "Complexo microbiológico", "concentration_total": "2,5e9"}'::jsonb,
    '[{"type": "bottle", "volumeL": 1, "sku": "CONTROX-1L"}]'::jsonb,
    '[]'::jsonb
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    category_id = EXCLUDED.category_id, name = EXCLUDED.name,
    tagline = EXCLUDED.tagline, description = EXCLUDED.description,
    composition = EXCLUDED.composition, technical_specs = EXCLUDED.technical_specs,
    packaging = EXCLUDED.packaging, applications = EXCLUDED.applications,
    status = EXCLUDED.status, updated_at = now();

  -- ── 3. NEMAX ──────────────────────────────────────────────────────────────
  INSERT INTO products (
    tenant_id, category_id, slug, safra_codigo, name, tagline, description,
    status, composition, technical_specs, packaging, applications
  ) VALUES (
    v_tenant_id, v_cat_bio_id, 'nemax', 'ARG-NEMAX', 'Nemax',
    'Complexo microbiológico multi-gênero de fungos filamentosos',
    'Nemax reúne três espécies de fungos filamentosos em uma formulação biotecnológica de alta complexidade microbiológica: Trichoderma harzianum, Trichoderma asperellum e Purpureocillium lilacinum. Desenvolvido dentro da linha de biotecnologias da Argho Agrosciences. Concentração total: 2,5 × 10¹⁰.',
    'published',
    '{"others": {"Trichoderma harzianum": 1, "Trichoderma asperellum": 1, "Purpureocillium lilacinum": 1}}'::jsonb,
    '{"physical_state": "fluido", "origin_country": "Espanha", "product_type": "Complexo microbiológico", "concentration_total": "2,5e10"}'::jsonb,
    '[{"type": "bottle", "volumeL": 1, "sku": "NEMAX-1L"}]'::jsonb,
    '[]'::jsonb
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    category_id = EXCLUDED.category_id, name = EXCLUDED.name,
    tagline = EXCLUDED.tagline, description = EXCLUDED.description,
    composition = EXCLUDED.composition, technical_specs = EXCLUDED.technical_specs,
    packaging = EXCLUDED.packaging, applications = EXCLUDED.applications,
    status = EXCLUDED.status, updated_at = now();

  -- ── 4. TITAN ──────────────────────────────────────────────────────────────
  INSERT INTO products (
    tenant_id, category_id, slug, safra_codigo, name, tagline, description,
    status, composition, technical_specs, packaging, applications
  ) VALUES (
    v_tenant_id, v_cat_bio_id, 'titan', 'ARG-TITAN', 'Titan',
    'Matriz microbiológica fúngica líquida à base de Trichoderma harzianum',
    'Titan é uma matriz microbiológica fúngica líquida à base de Trichoderma harzianum, estruturada para apresentar identidade técnica clara, facilidade operacional e padronização microbiológica dentro da linha de biotecnologias da Argho Agrosciences. Concentração total: 2,5 × 10⁹.',
    'published',
    '{"others": {"Trichoderma harzianum": 1}}'::jsonb,
    '{"physical_state": "fluido", "origin_country": "Espanha", "product_type": "Complexo microbiológico", "concentration_total": "2,5e9"}'::jsonb,
    '[{"type": "bottle", "volumeL": 1, "sku": "TITAN-1L"}]'::jsonb,
    '[]'::jsonb
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    category_id = EXCLUDED.category_id, name = EXCLUDED.name,
    tagline = EXCLUDED.tagline, description = EXCLUDED.description,
    composition = EXCLUDED.composition, technical_specs = EXCLUDED.technical_specs,
    packaging = EXCLUDED.packaging, applications = EXCLUDED.applications,
    status = EXCLUDED.status, updated_at = now();

  -- ── 5. TROIAN: corrige composição (era Trichoderma+Bacillus, é multi-Bacillus)
  UPDATE products SET
    tagline = 'Complexo microbiológico multi-Bacillus',
    description = 'Troian reúne três espécies do gênero Bacillus em uma formulação biotecnológica de composição declarada: Bacillus subtilis, Bacillus velezensis e Bacillus amyloliquefaciens. Desenvolvido dentro da linha de biotecnologias da Argho Agrosciences. Concentração total: 2,0 × 10¹⁰.',
    composition = '{"others": {"Bacillus subtilis": 1, "Bacillus velezensis": 1, "Bacillus amyloliquefaciens": 1}}'::jsonb,
    technical_specs = jsonb_build_object(
      'physical_state', 'fluido',
      'origin_country', 'Espanha',
      'product_type', 'Complexo microbiológico',
      'concentration_total', '2,0e10'
    ),
    updated_at = now()
  WHERE tenant_id = v_tenant_id AND slug = 'troian';

  RAISE NOTICE 'Migration 0034: 4 produtos novos inseridos/atualizados (bovex, controx, nemax, titan) + composição troian corrigida.';
END $$;