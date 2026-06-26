-- ============================================================================
-- 0048_seed_nimport.sql
-- ============================================================================
-- Adiciona o produto biológico N-import ao catálogo (tenant argho, categoria
-- biologicos). Espécie declarada: Herbaspirillum seropedicae (bactéria
-- diazotrófica), concentração 1,0 × 10⁹ UFC/mL.
--
-- Modelo NEUTRO de compliance MAPA — composição declarada + concentração, sem
-- claim de função/dose/cultura/modo de uso. Ver apps/website/docs/biologicos-compliance.md.
--
-- Idempotente: ON CONFLICT (tenant_id, slug) DO UPDATE.
-- Não hardcoda UUIDs — resolve tenant + categoria via slug (padrão 0034).
--
-- Aplicar em prod via psql (Supavisor session mode), conforme 0034.
-- APÓS APLICAR: pnpm --filter @colheita/jobs reindex-all (re-indexa pgvector).
-- ============================================================================

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

  -- ── N-IMPORT ──────────────────────────────────────────────────────────────
  INSERT INTO products (
    tenant_id, category_id, slug, safra_codigo, name, tagline, description,
    status, composition, technical_specs, packaging, applications
  ) VALUES (
    v_tenant_id, v_cat_bio_id, 'n-import', 'ARG-NIMPORT', 'N-import',
    'Matriz microbiológica à base de Herbaspirillum seropedicae',
    'N-import é uma matriz microbiológica fluida à base de Herbaspirillum seropedicae, bactéria diazotrófica, formulada dentro da linha de biotecnologias da Argho Agrosciences com foco em composição declarada e padronização microbiológica. A proposta tecnológica do produto está na combinação entre base bacteriana monoespécie, formulação fluida e identidade técnica clara dentro do portfólio biológico Argho. A presença declarada de Herbaspirillum seropedicae confere ao produto uma identidade biológica singular, valorizando consistência microbiológica, estabilidade de formulação e precisão técnica na composição declarada. Concentração total: 1,0 × 10⁹.',
    'published',
    '{"others": {"Herbaspirillum seropedicae": 1}}'::jsonb,
    '{"physical_state": "fluido", "origin_country": "Brasil", "product_type": "Complexo microbiológico", "concentration_total": "1,0 × 10⁹ UFC/mL"}'::jsonb,
    '[{"type": "bottle", "volumeL": 1.8, "sku": "NIMPORT-1.8L"}, {"type": "bottle", "volumeL": 5, "sku": "NIMPORT-5L"}]'::jsonb,
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

  RAISE NOTICE 'Migration 0048: produto n-import inserido/atualizado (biologico, Herbaspirillum seropedicae, 1,0 × 10⁹ UFC/mL).';
END $$;
