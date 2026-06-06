-- ============================================================================
-- 0044_biologicos_brasil_ufc.sql
-- ============================================================================
-- Decisão do fundador (Wilson Dall Agnol, 2026-06-06):
--   1. Origem dos 6 biológicos corrigida de "Espanha" para "Brasil"
--      (só os fertilizantes minerais/organominerais são da Espanha).
--   2. Exibir concentração microbiológica em UFC/mL (total por produto) —
--      revertendo a diretriz "não exibir UFC" do compliance doc. Risco
--      regulatório assumido pelo fundador. Ver apps/website/docs/biologicos-compliance.md.
--   3. Garante product_type = 'Complexo microbiológico' nos 6.
--   4. Corrige Biovas, que ainda estava no modelo antigo não-compliant (vinha só
--      do seed: tagline/descrição com claims de função, technical_specs com
--      strains/application_modes). Reescreve para o modelo neutro.
--
-- Idempotente: UPDATE por slug; merge JSONB (||) preserva as demais chaves.
-- Aplicar em prod via psql (Supavisor session mode), conforme 0034.
-- APÓS APLICAR: pnpm --filter @colheita/jobs reindex-all (re-indexa pgvector).
-- ============================================================================

DO $$
DECLARE
  v_tenant_id uuid;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'argho' LIMIT 1;
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant argho nao existe — rode db:seed primeiro';
  END IF;

  -- ── Origem Brasil + product_type + concentração UFC/mL (merge preserva physical_state etc.)
  UPDATE products SET technical_specs = technical_specs ||
    '{"origin_country":"Brasil","product_type":"Complexo microbiológico","concentration_total":"2,0 × 10¹⁰ UFC/mL"}'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'troian';

  UPDATE products SET technical_specs = technical_specs ||
    '{"origin_country":"Brasil","product_type":"Complexo microbiológico","concentration_total":"2,5 × 10¹⁰ UFC/mL"}'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'bovex';

  UPDATE products SET technical_specs = technical_specs ||
    '{"origin_country":"Brasil","product_type":"Complexo microbiológico","concentration_total":"2,5 × 10⁹ UFC/mL"}'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'controx';

  UPDATE products SET technical_specs = technical_specs ||
    '{"origin_country":"Brasil","product_type":"Complexo microbiológico","concentration_total":"2,5 × 10¹⁰ UFC/mL"}'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'nemax';

  UPDATE products SET technical_specs = technical_specs ||
    '{"origin_country":"Brasil","product_type":"Complexo microbiológico","concentration_total":"2,5 × 10⁹ UFC/mL"}'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'titan';

  -- ── BIOVAS: ainda no modelo antigo (só seed). Reescreve neutro/compliant + Brasil + UFC.
  --    technical_specs: remove só os legados (strains/application_modes) e faz MERGE dos campos
  --    compliant — preserva quaisquer outras chaves inesperadas (defensivo p/ dados de prod).
  UPDATE products SET
    tagline = 'Complexo microbiológico multi-Bacillus',
    description = 'Biovas reúne cinco espécies do gênero Bacillus em uma formulação biotecnológica de alta complexidade microbiológica: Bacillus subtilis, Bacillus amyloliquefaciens, Bacillus licheniformis, Bacillus aryabhattai e Bacillus megaterium. Desenvolvido dentro da linha de biotecnologias da Argho Agrosciences, o Biovas se destaca pela combinação de diferentes espécies bacterianas em uma única matriz microbiológica, oferecendo uma composição robusta, tecnicamente diferenciada e alinhada ao avanço dos bioinsumos de base microbiana. A presença de múltiplas espécies de Bacillus confere ao produto uma identidade biológica singular dentro do portfólio Argho, valorizando diversidade microbiana, estabilidade de formulação e precisão técnica na composição declarada. Concentração total: 5,0 × 10⁹.',
    composition = '{"others": {"Bacillus subtilis": 1, "Bacillus amyloliquefaciens": 1, "Bacillus licheniformis": 1, "Bacillus aryabhattai": 1, "Bacillus megaterium": 1}}'::jsonb,
    technical_specs = (COALESCE(technical_specs, '{}'::jsonb) - 'strains' - 'application_modes')
      || '{"physical_state":"fluido","origin_country":"Brasil","product_type":"Complexo microbiológico","concentration_total":"5,0 × 10⁹ UFC/mL"}'::jsonb,
    updated_at = now()
  WHERE tenant_id = v_tenant_id AND slug = 'biovas';

  RAISE NOTICE 'Migration 0044: 6 biologicos -> origem Brasil + product_type + concentracao UFC/mL; biovas reescrito para modelo neutro.';
END $$;
