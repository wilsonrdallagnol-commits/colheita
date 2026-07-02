-- ============================================================================
-- 0049_biologicos_compliance_descriptions.sql
-- ============================================================================
-- Correção de compliance (base legal) das descrições dos 7 produtos biológicos
-- do tenant argho no portal/plataforma. Espelha a copy já publicada no site
-- institucional (apps/website/src/lib/products.ts, commit 35e6efe na main).
--
-- Motivo: produtos biológicos não têm registro MAPA na categoria funcional;
-- claim de uso/função pode configurar produto fitossanitário sem registro
-- (Lei 7.802/89). A nova copy fala SÓ da composição declarada (espécies +
-- formulação + concentração), sem destinação de uso, modo de aplicação,
-- função ou termos não-conformes ("bioinsumo", "registro vigente",
-- "consórcios", "programas microbiológicos"). Ver
-- apps/website/docs/biologicos-compliance.md.
--
-- NÃO altera composição, tagline, concentração UFC/mL (esta segue exibida por
-- decisão do fundador, 2026-06-06) nem qualquer outro campo — só `description`.
--
-- Idempotente: UPDATE por (tenant_id, slug); rodar N vezes = mesmo resultado.
-- Não hardcoda UUIDs — resolve tenant argho via slug (padrão 0034/0048).
--
-- Aplicar em prod via SQL Editor do Supabase (ou psql Supavisor session mode).
-- APÓS APLICAR: pnpm --filter @colheita/jobs reindex-all (re-indexa pgvector,
-- pois a descrição alimenta a busca vetorial do agente IA).
-- ============================================================================

DO $$
DECLARE
  v_tenant_id uuid;
  v_count int := 0;
  r RECORD;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'argho' LIMIT 1;
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant argho nao existe — rode db:seed primeiro';
  END IF;

  FOR r IN
    SELECT * FROM (VALUES
      ('troian',
       'Troian é uma matriz microbiológica de composição declarada, formada por três espécies do gênero Bacillus: Bacillus subtilis, Bacillus velezensis e Bacillus amyloliquefaciens. Formulação fluida desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade multi-Bacillus, diversidade bacteriana e padrão de formulação declarado. Concentração total declarada: 2,0 × 10¹⁰ UFC/mL.'),
      ('biovas',
       'Biovas é uma matriz microbiológica de composição declarada, formada por cinco espécies do gênero Bacillus: Bacillus subtilis, Bacillus amyloliquefaciens, Bacillus licheniformis, Bacillus aryabhattai e Bacillus megaterium. Formulação fluida desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade multi-Bacillus, diversidade bacteriana e padrão de formulação declarado. Concentração total declarada: 5,0 × 10⁹ UFC/mL.'),
      ('bovex',
       'Bovex é uma matriz microbiológica de composição declarada, formada por três gêneros de fungos: Beauveria bassiana, Metarhizium anisopliae e Cordyceps fumosorosea. Formulação fluida desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade multi-gênero fúngica, diversidade fúngica e padrão de formulação declarado. Concentração total declarada: 2,5 × 10¹⁰ UFC/mL.'),
      ('controx',
       'Controx é uma matriz microbiológica de composição declarada, formada por duas variedades de Bacillus thuringiensis: Bacillus thuringiensis var. thuringiensis e Bacillus thuringiensis var. kurstaki. Formulação fluida desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade multivariante, diversidade intra-específica e padrão de formulação declarado. Concentração total declarada: 2,5 × 10⁹ UFC/mL.'),
      ('nemax',
       'Nemax é uma matriz microbiológica de composição declarada, formada por três espécies de fungos filamentosos: Trichoderma harzianum, Trichoderma asperellum e Purpureocillium lilacinum. Formulação fluida desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade multi-gênero fúngica, diversidade microbiana e padrão de formulação declarado. Concentração total declarada: 2,5 × 10¹⁰ UFC/mL.'),
      ('titan',
       'Titan é uma matriz microbiológica fluida de composição declarada, à base de Trichoderma harzianum. Formulação monoespécie desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade fúngica declarada e padrão de formulação. Concentração total declarada: 2,5 × 10⁹ UFC/mL.'),
      ('n-import',
       'N-import é uma matriz microbiológica fluida de composição declarada, à base de Herbaspirillum seropedicae. Formulação monoespécie desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade bacteriana declarada e padrão de formulação. Concentração total declarada: 1,0 × 10⁹ UFC/mL.')
    ) AS t(slug, descr)
  LOOP
    UPDATE products
      SET description = r.descr, updated_at = now()
      WHERE tenant_id = v_tenant_id AND slug = r.slug;
    IF FOUND THEN
      v_count := v_count + 1;
    ELSE
      RAISE NOTICE 'Migration 0049: produto biologico "%" nao encontrado (tenant argho) — pulado.', r.slug;
    END IF;
  END LOOP;

  RAISE NOTICE 'Migration 0049: % de 7 descricoes de biologicos atualizadas (compliance, composicao-only).', v_count;
END $$;
