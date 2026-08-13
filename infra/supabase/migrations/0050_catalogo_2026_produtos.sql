-- ============================================================================
-- 0050_catalogo_2026_produtos.sql
-- ============================================================================
-- Alinha o BANCO (portal + admin + RAG) ao CATÁLOGO ARGHO 2026, declarado por
-- Wilson Dall Agnol em 2026-08-13 como a FONTE DA VERDADE do portfólio.
-- Fonte primária lida para escrever esta migration:
--   ARGHO AGROSCIENCES/CATALOGO BIOLOGICOS 2026/conteudo/site-data.json
--   ARGHO AGROSCIENCES/CATALOGO BIOLOGICOS 2026/conteudo/copy/produto-*.json
--   ARGHO AGROSCIENCES/CATALOGO BIOLOGICOS 2026/conteudo/matriz-produtos.md
-- Espelha o que o site institucional está recebendo em
--   apps/website/src/lib/products.ts
-- e é replicada no seed (packages/db/src/scripts/seed.ts) para banco novo
-- nascer certo.
--
-- ── O QUE FAZ ───────────────────────────────────────────────────────────────
--
-- 1. LINHA BIOLÓGICA — 3 renomeações + correção factual dos 8 produtos:
--      biovas -> biotas | bovex -> sporax | titan -> harzon
--    Correções (o banco estava factualmente errado):
--      • BIOTAS  : DC 101 é Bacillus velezensis (não amyloliquefaciens);
--                  megaterium e aryabhattai foram reclassificados para o
--                  gênero Priestia. 5,0 × 10⁹ UFC/mL.
--      • SPORAX  : 5,0 × 10⁸ UFC/mL (o banco tinha 2,5 × 10¹⁰ — 50× maior).
--      • HARZON  : cepa única IB 19/17; 1,0 × 10⁹; embalagem SÓ 5 L.
--      • TROIAN  : espécies erradas (subtilis/amyloliquefaciens) -> duas cepas
--                  de velezensis + pumilus; 3,0 × 10⁸ (era 2,0 × 10¹⁰).
--      • CONTROX : subespécie errada (var. thuringiensis) -> subsp. aizawai
--                  DC 38 + subsp. kurstaki DC 41; 1,0 × 10⁹.
--      • NEMAX   : Purpureocillium lilacinum SAIU da formulação; entram
--                  T. harzianum DC 133 e M. anisopliae IBCB 425; 2,0 × 10⁹.
--      • N-IMPORT: NÃO é Herbaspirillum seropedicae — é Methylobacterium sp.
--                  SEMIA 658 (gênero completamente diferente); 1,0 × 10⁸;
--                  embalagem SÓ 1 L (o banco tinha 1,8 L + 5 L).
--      • CHROM   : produto NOVO — Chromobacterium subtsugae DC 43; 1,0 × 10⁸;
--                  embalagem SÓ 1 L.
--    A composição passa a declarar espécie + CEPA (chave do jsonb), única forma
--    de distinguir cepas da mesma espécie (Nemax tem 2× T. harzianum, Troian
--    tem 2× B. velezensis). Valor segue o placeholder 1 do modelo neutro — o
--    portal renderiza só o nome (product_type = 'Complexo microbiológico'
--    aciona o bloco "Composição microbiológica"; NÃO alterar essa string).
--    Texto segue o modelo composição-only da 0049: identidade + composição
--    declarada + concentração. SEM dose, SEM cultura, SEM destinação de uso,
--    SEM categoria funcional. Ver apps/website/docs/biologicos-compliance.md.
--
-- 2. ORGANOMINERAIS (impuch, life-on, grow-nitro-p, up-soil):
--      'Fertilizante orgânico organomineral Classe A'
--      -> 'Fertilizante Organomineral Classe A'   (IN 61/2020 art. 17 §7º)
--    em description E em technical_specs.product_type.
--
-- 3. ADJUVANTES OPERATE — a dose FICA (linha isenta de registro no MAPA), mas
--    com os valores e o formato do catálogo:
--      Plus e 4em1      : 0,5–1,0 mL/L de calda · em baixa vazão, 50–100 mL/ha
--      Citronela/Orange : 1,5–2,0 mL/L de calda · em baixa vazão, 100–200 mL/ha
--    Os mL/ha do banco estavam errados (100–200 e 150–200) e apresentados como
--    equivalência entre parênteses — são REGIMES diferentes (vazão normal ×
--    baixa vazão), por isso a forma do catálogo com "·".
--    OPERATE CITRONELA: removida QUALQUER menção a repelência/repelente
--    (o catálogo fala só da composição: óleo essencial de citronela 3%).
--
-- 4. APPLICATIONS (dose/posicionamento POR CULTURA): zerado em TODOS os
--    produtos. Conferido no catálogo: dose existe SOMENTE nos 4 adjuvantes, e
--    lá é dose de calda — não há dose nem posicionamento por cultura em
--    fertilizantes, organominerais ou biológicos. O site espelha o catálogo,
--    nada além dele. Junto vão os chunks 'application' do pgvector, senão a
--    dose por cultura continuaria viva na resposta do agente (o reindex só faz
--    upsert, nunca apaga).
--
-- ── O QUE NÃO FAZ (decisão consciente) ──────────────────────────────────────
--   • NÃO mexe em products.safra_codigo. Ele é o mapeamento para o código do
--     produto no ERP Safra/Omie (JOIN com product_stock.safra_codigo). Trocar
--     'ARG-BOVEX' por 'ARG-SPORAX' aqui quebraria a exibição de estoque
--     enquanto o ERP não for renomeado. ⚠️ AÇÃO PARA O WILSON: renomear os
--     itens no ERP e, depois, uma migration curta atualiza os códigos.
--   • NÃO altera as descrições de stron, grow-calcium, defon, grow-mob e
--     grow-filling. Elas seguem com a copy legada do seed, divergente do
--     catálogo (inclusive citando culturas em prosa). Fora do escopo dos itens
--     que o Wilson listou em 13/08 — sinalizado para decisão dele.
--   • NÃO altera product_type dos biológicos ('Complexo microbiológico'): é o
--     seletor do renderer de compliance no portal.
--
-- Idempotente: renomeação protegida por NOT EXISTS do slug novo; todo o resto
-- é UPDATE por (tenant_id, slug novo) e INSERT ... ON CONFLICT DO UPDATE.
-- Rodar N vezes = mesmo resultado. Não hardcoda UUIDs (padrão 0034/0048/0049).
--
-- Aplicar em prod via psql (Supavisor session mode, porta 5432 — 6543 não
-- aceita bloco DO):
--   psql "$DATABASE_URL_DIRECT" -f infra/supabase/migrations/0050_catalogo_2026_produtos.sql
--
-- APÓS APLICAR (obrigatório): pnpm --filter @colheita/jobs reindex-all
--   16 produtos mudam aqui (8 biológicos + 4 organominerais + 4 adjuvantes):
--   nome, descrição, composição e applications alimentam o pgvector
--   (product_embeddings). Sem o reindex, o agente segue respondendo com os
--   nomes e as espécies antigos e ainda devolve as doses por cultura que foram
--   removidas. O reindex faz upsert por (product_id, chunk_type); como o CHROM
--   é produto novo, ele só entra no RAG depois desse comando.
-- ============================================================================

DO $$
DECLARE
  v_tenant_id  uuid;
  v_cat_bio_id uuid;
  v_count      int;
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

  -- ══════════════════════════════════════════════════════════════════════════
  -- 1. RENOMEAÇÕES DE SLUG (idempotentes)
  --    O slug antigo só é trocado se o novo ainda não existir. Depois daqui
  --    todo o resto da migration referencia SOMENTE o slug novo.
  -- ══════════════════════════════════════════════════════════════════════════
  UPDATE products SET slug = 'biotas', name = 'Biotas', updated_at = now()
   WHERE tenant_id = v_tenant_id AND slug = 'biovas'
     AND NOT EXISTS (SELECT 1 FROM products p2
                      WHERE p2.tenant_id = v_tenant_id AND p2.slug = 'biotas');

  UPDATE products SET slug = 'sporax', name = 'Sporax', updated_at = now()
   WHERE tenant_id = v_tenant_id AND slug = 'bovex'
     AND NOT EXISTS (SELECT 1 FROM products p2
                      WHERE p2.tenant_id = v_tenant_id AND p2.slug = 'sporax');

  UPDATE products SET slug = 'harzon', name = 'Harzon', updated_at = now()
   WHERE tenant_id = v_tenant_id AND slug = 'titan'
     AND NOT EXISTS (SELECT 1 FROM products p2
                      WHERE p2.tenant_id = v_tenant_id AND p2.slug = 'harzon');

  -- Contexto de produto nos chamados de suporte guarda o slug em texto puro
  -- (support_tickets.product_slug) — sem FK, então precisa ser reapontado.
  UPDATE support_tickets SET product_slug = 'biotas'
   WHERE tenant_id = v_tenant_id AND product_slug = 'biovas';
  UPDATE support_tickets SET product_slug = 'sporax'
   WHERE tenant_id = v_tenant_id AND product_slug = 'bovex';
  UPDATE support_tickets SET product_slug = 'harzon'
   WHERE tenant_id = v_tenant_id AND product_slug = 'titan';

  -- ══════════════════════════════════════════════════════════════════════════
  -- 2. LINHA BIOLÓGICA — identidade, cepas, concentração e embalagens
  -- ══════════════════════════════════════════════════════════════════════════

  -- ── BIOTAS (ex-Biovas) ── 5 cepas / 5 espécies / 2 gêneros ────────────────
  UPDATE products SET
    name = 'Biotas',
    tagline = 'Complexo microbiológico multiespécie de Bacillus e Priestia',
    description = 'Biotas é uma matriz microbiológica de composição declarada, formada por cinco cepas de cinco espécies dos gêneros Bacillus e Priestia: Bacillus velezensis DC 101, Bacillus subtilis DC 107, Priestia megaterium DC 93, Bacillus licheniformis DC 40 e Priestia aryabhattai DC 26. Formulação fluida desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade multiespécie, diversidade bacteriana e padrão de formulação declarado. Concentração total declarada: 5,0 × 10⁹ UFC/mL.',
    composition = '{"others":{"Bacillus velezensis DC 101":1,"Bacillus subtilis DC 107":1,"Priestia megaterium DC 93":1,"Bacillus licheniformis DC 40":1,"Priestia aryabhattai DC 26":1}}'::jsonb,
    technical_specs = COALESCE(technical_specs, '{}'::jsonb) ||
      '{"physical_state":"fluido","origin_country":"Brasil","product_type":"Complexo microbiológico","concentration_total":"5,0 × 10⁹ UFC/mL"}'::jsonb,
    packaging = '[{"type":"bottle","volumeL":1,"sku":"BIOTAS-1L"},{"type":"bottle","volumeL":5,"sku":"BIOTAS-5L"}]'::jsonb,
    updated_at = now()
  WHERE tenant_id = v_tenant_id AND slug = 'biotas';

  -- ── SPORAX (ex-Bovex) ── 3 cepas / 3 gêneros fúngicos ─────────────────────
  UPDATE products SET
    name = 'Sporax',
    tagline = 'Complexo microbiológico multi-gênero fúngico',
    description = 'Sporax é uma matriz microbiológica de composição declarada, formada por três cepas de três gêneros de fungos: Beauveria bassiana IBCB 66, Metarhizium anisopliae IBCB 425 e Cordyceps fumosorosea DC 134. Formulação fluida desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade multi-gênero fúngica, diversidade fúngica e padrão de formulação declarado. Concentração total declarada: 5,0 × 10⁸ UFC/mL.',
    composition = '{"others":{"Beauveria bassiana IBCB 66":1,"Metarhizium anisopliae IBCB 425":1,"Cordyceps fumosorosea DC 134":1}}'::jsonb,
    technical_specs = COALESCE(technical_specs, '{}'::jsonb) ||
      '{"physical_state":"fluido","origin_country":"Brasil","product_type":"Complexo microbiológico","concentration_total":"5,0 × 10⁸ UFC/mL"}'::jsonb,
    packaging = '[{"type":"bottle","volumeL":1,"sku":"SPORAX-1L"},{"type":"bottle","volumeL":5,"sku":"SPORAX-5L"}]'::jsonb,
    updated_at = now()
  WHERE tenant_id = v_tenant_id AND slug = 'sporax';

  -- ── HARZON (ex-Titan) ── cepa única IB 19/17 · embalagem SÓ 5 L ───────────
  UPDATE products SET
    name = 'Harzon',
    tagline = 'Matriz microbiológica fúngica à base de Trichoderma harzianum',
    description = 'Harzon é uma matriz microbiológica fluida de composição declarada, à base de uma única cepa de Trichoderma harzianum: IB 19/17. Formulação monoespécie desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade fúngica declarada e padrão de formulação. Concentração total declarada: 1,0 × 10⁹ UFC/mL.',
    composition = '{"others":{"Trichoderma harzianum IB 19/17":1}}'::jsonb,
    technical_specs = COALESCE(technical_specs, '{}'::jsonb) ||
      '{"physical_state":"fluido","origin_country":"Brasil","product_type":"Complexo microbiológico","concentration_total":"1,0 × 10⁹ UFC/mL"}'::jsonb,
    packaging = '[{"type":"bottle","volumeL":1,"sku":"HARZON-1L"},{"type":"bottle","volumeL":5,"sku":"HARZON-5L"}]'::jsonb,
    updated_at = now()
  WHERE tenant_id = v_tenant_id AND slug = 'harzon';

  -- ── TROIAN ── matriz velezensis-dominante (3 cepas) ───────────────────────
  UPDATE products SET
    tagline = 'Complexo microbiológico multi-Bacillus',
    description = 'Troian é uma matriz microbiológica de composição declarada, formada por três cepas do gênero Bacillus: Bacillus velezensis DC 81, Bacillus velezensis DC 88 e Bacillus pumilus DC 61. Formulação fluida desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade multi-Bacillus, diversidade bacteriana e padrão de formulação declarado. Concentração total declarada: 3,0 × 10⁸ UFC/mL.',
    composition = '{"others":{"Bacillus velezensis DC 81":1,"Bacillus velezensis DC 88":1,"Bacillus pumilus DC 61":1}}'::jsonb,
    technical_specs = COALESCE(technical_specs, '{}'::jsonb) ||
      '{"physical_state":"fluido","origin_country":"Brasil","product_type":"Complexo microbiológico","concentration_total":"3,0 × 10⁸ UFC/mL"}'::jsonb,
    packaging = '[{"type":"bottle","volumeL":1,"sku":"TROIAN-1L"},{"type":"bottle","volumeL":5,"sku":"TROIAN-5L"}]'::jsonb,
    updated_at = now()
  WHERE tenant_id = v_tenant_id AND slug = 'troian';

  -- ── CONTROX ── duas SUBespécies (aizawai + kurstaki), não "var." ──────────
  UPDATE products SET
    tagline = 'Complexo microbiológico de duas subespécies de Bacillus thuringiensis',
    description = 'Controx é uma matriz microbiológica de composição declarada, formada por duas subespécies de Bacillus thuringiensis: Bacillus thuringiensis subsp. aizawai DC 38 e Bacillus thuringiensis subsp. kurstaki DC 41. Formulação fluida desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade multi-subespécie, diversidade intra-específica e padrão de formulação declarado. Concentração total declarada: 1,0 × 10⁹ UFC/mL.',
    composition = '{"others":{"Bacillus thuringiensis subsp. aizawai DC 38":1,"Bacillus thuringiensis subsp. kurstaki DC 41":1}}'::jsonb,
    technical_specs = COALESCE(technical_specs, '{}'::jsonb) ||
      '{"physical_state":"fluido","origin_country":"Brasil","product_type":"Complexo microbiológico","concentration_total":"1,0 × 10⁹ UFC/mL"}'::jsonb,
    packaging = '[{"type":"bottle","volumeL":1,"sku":"CONTROX-1L"},{"type":"bottle","volumeL":5,"sku":"CONTROX-5L"}]'::jsonb,
    updated_at = now()
  WHERE tenant_id = v_tenant_id AND slug = 'controx';

  -- ── NEMAX ── 4 cepas; Purpureocillium lilacinum SAIU da formulação ────────
  UPDATE products SET
    tagline = 'Complexo microbiológico multi-gênero de fungos filamentosos',
    description = 'Nemax é uma matriz microbiológica de composição declarada, formada por quatro cepas de fungos filamentosos: Trichoderma harzianum IB 19/17, Trichoderma harzianum DC 133, Trichoderma asperellum URM 5911 e Metarhizium anisopliae IBCB 425. Formulação fluida desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade multi-gênero fúngica, diversidade microbiana e padrão de formulação declarado. Concentração total declarada: 2,0 × 10⁹ UFC/mL.',
    composition = '{"others":{"Trichoderma harzianum IB 19/17":1,"Trichoderma harzianum DC 133":1,"Trichoderma asperellum URM 5911":1,"Metarhizium anisopliae IBCB 425":1}}'::jsonb,
    technical_specs = COALESCE(technical_specs, '{}'::jsonb) ||
      '{"physical_state":"fluido","origin_country":"Brasil","product_type":"Complexo microbiológico","concentration_total":"2,0 × 10⁹ UFC/mL"}'::jsonb,
    packaging = '[{"type":"bottle","volumeL":1,"sku":"NEMAX-1L"},{"type":"bottle","volumeL":5,"sku":"NEMAX-5L"}]'::jsonb,
    updated_at = now()
  WHERE tenant_id = v_tenant_id AND slug = 'nemax';

  -- ── N-IMPORT ── Methylobacterium sp. SEMIA 658 · embalagem SÓ 1 L ─────────
  UPDATE products SET
    tagline = 'Matriz microbiológica à base de Methylobacterium sp.',
    description = 'N-import é uma matriz microbiológica fluida de composição declarada, à base de uma única cepa de Methylobacterium sp.: SEMIA 658, código de coleção de referência brasileira. Formulação monoespécie desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade bacteriana declarada e padrão de formulação. Concentração total declarada: 1,0 × 10⁸ UFC/mL.',
    composition = '{"others":{"Methylobacterium sp. SEMIA 658":1}}'::jsonb,
    technical_specs = COALESCE(technical_specs, '{}'::jsonb) ||
      '{"physical_state":"fluido","origin_country":"Brasil","product_type":"Complexo microbiológico","concentration_total":"1,0 × 10⁸ UFC/mL"}'::jsonb,
    packaging = '[{"type":"bottle","volumeL":1,"sku":"NIMPORT-1L"}]'::jsonb,
    updated_at = now()
  WHERE tenant_id = v_tenant_id AND slug = 'n-import';

  -- ── CHROM ── produto NOVO do catálogo 2026 · embalagem SÓ 1 L ─────────────
  -- safra_codigo segue o padrão inventado nas 0034/0048 (ARG-<NOME>): sem
  -- linha correspondente em product_stock ele apenas não exibe estoque.
  INSERT INTO products (
    tenant_id, category_id, slug, safra_codigo, name, tagline, description,
    status, composition, technical_specs, packaging, applications, published_at
  ) VALUES (
    v_tenant_id, v_cat_bio_id, 'chrom', 'ARG-CHROM', 'Chrom',
    'Matriz microbiológica à base de Chromobacterium subtsugae',
    'Chrom é uma matriz microbiológica fluida de composição declarada, à base de uma única cepa de Chromobacterium subtsugae: DC 43. Formulação monoespécie desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade bacteriana declarada e padrão de formulação. Concentração total declarada: 1,0 × 10⁸ UFC/mL.',
    'published',
    '{"others":{"Chromobacterium subtsugae DC 43":1}}'::jsonb,
    '{"physical_state":"fluido","origin_country":"Brasil","product_type":"Complexo microbiológico","concentration_total":"1,0 × 10⁸ UFC/mL"}'::jsonb,
    '[{"type":"bottle","volumeL":1,"sku":"CHROM-1L"}]'::jsonb,
    '[]'::jsonb,
    now()
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    category_id     = EXCLUDED.category_id,
    name            = EXCLUDED.name,
    tagline         = EXCLUDED.tagline,
    description     = EXCLUDED.description,
    composition     = EXCLUDED.composition,
    technical_specs = EXCLUDED.technical_specs,
    packaging       = EXCLUDED.packaging,
    applications    = EXCLUDED.applications,
    status          = EXCLUDED.status,
    updated_at      = now();

  -- ══════════════════════════════════════════════════════════════════════════
  -- 3. ORGANOMINERAIS — "Fertilizante Organomineral Classe A" (IN 61/2020)
  --    replace() no texto: idempotente e imune a drift do resto da descrição.
  -- ══════════════════════════════════════════════════════════════════════════
  UPDATE products SET
    description = replace(description,
      'Fertilizante orgânico organomineral Classe A',
      'Fertilizante Organomineral Classe A'),
    technical_specs = COALESCE(technical_specs, '{}'::jsonb) ||
      '{"product_type":"Fertilizante Organomineral Classe A"}'::jsonb,
    updated_at = now()
  WHERE tenant_id = v_tenant_id
    AND slug IN ('impuch', 'life-on', 'grow-nitro-p', 'up-soil');

  -- ══════════════════════════════════════════════════════════════════════════
  -- 4. ADJUVANTES OPERATE — dose do catálogo (regime de calda × baixa vazão)
  -- ══════════════════════════════════════════════════════════════════════════

  -- Operate Plus — 0,5–1,0 mL/L de calda · baixa vazão 50–100 mL/ha
  UPDATE products SET
    description = 'Condicionador multifuncional de calda que reúne sequestrante de cátions, blend de surfactantes não-iônicos, agente antideriva e antiespumante. Melhora a qualidade da água de pulverização, a cobertura e a estabilidade da calda, reduzindo perdas por deriva e formação de espuma. Adicionar primeiro no tanque, na dose de 0,5–1,0 mL/L de calda · em baixa vazão, 50–100 mL/ha. Produto isento de registro no MAPA.',
    updated_at = now()
  WHERE tenant_id = v_tenant_id AND slug = 'operate-plus';

  -- Operate Citronela — SEM qualquer menção a repelência; só a composição
  UPDATE products SET
    description = 'Adjuvante surfactante formulado com óleo essencial de citronela (3%). Reduz a tensão superficial da calda, melhorando o espalhamento e a absorção dos ativos. Adicionar por último no tanque (produto oleoso), na dose de 1,5–2,0 mL/L de calda · em baixa vazão, 100–200 mL/ha. Produto isento de registro no MAPA.',
    composition = '{"others":{"Óleo essencial de citronela":3.0}}'::jsonb,
    updated_at = now()
  WHERE tenant_id = v_tenant_id AND slug = 'operate-citronela';

  -- Operate 4em1 — 0,5–1,0 mL/L de calda · baixa vazão 50–100 mL/ha
  UPDATE products SET
    description = 'O mais completo da família Operate: condicionador multifuncional que reúne sequestrante de cátions, redutor de pH à base de ácido fosfórico, surfactantes não-iônicos, antideriva e antiespumante. Ajusta o pH da calda para a faixa ideal de 4,0 a 6,5 e melhora a qualidade da aplicação em uma única adição ao tanque. Adicionar primeiro, na dose de 0,5–1,0 mL/L de calda · em baixa vazão, 50–100 mL/ha. Por conter ácido fosfórico, redobrar a atenção em misturas alcalinas e com produtos à base de cobre. Produto isento de registro no MAPA.',
    updated_at = now()
  WHERE tenant_id = v_tenant_id AND slug = 'operate-4em1';

  -- Operate Orange — 1,5–2,0 mL/L de calda · baixa vazão 100–200 mL/ha
  UPDATE products SET
    description = 'Adjuvante supermolhante e penetrante à base de óleo da casca de laranja, com 6% de D-limoneno. Potencializa o molhamento das folhas e a penetração cuticular de defensivos e nutrientes sistêmicos. Adicionar por último no tanque, na dose de 1,5–2,0 mL/L de calda · em baixa vazão, 100–200 mL/ha. Produto isento de registro no MAPA.',
    updated_at = now()
  WHERE tenant_id = v_tenant_id AND slug = 'operate-orange';

  -- ══════════════════════════════════════════════════════════════════════════
  -- 5. APPLICATIONS — remove dose e posicionamento POR CULTURA de todo mundo
  --    (hoje só xcensis, grow-filling, grow-calcium e grow-mob tinham).
  -- ══════════════════════════════════════════════════════════════════════════
  UPDATE products SET applications = '[]'::jsonb, updated_at = now()
   WHERE tenant_id = v_tenant_id AND applications <> '[]'::jsonb;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Migration 0050: applications zerado em % produto(s).', v_count;

  -- O reindex do pgvector é UPSERT por (product_id, chunk_type) e NUNCA apaga
  -- (packages/ai/src/vector-retriever.ts). Sem produto com applications, o
  -- chunk_type 'application' deixa de ser gerado — e os antigos, com cultura e
  -- dose/ha, ficariam vivos no RAG para sempre. Removê-los aqui é o que faz a
  -- dose por cultura sumir DE VERDADE também na resposta do agente.
  DELETE FROM product_embeddings
   WHERE tenant_id = v_tenant_id AND chunk_type = 'application';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Migration 0050: % chunk(s) "application" removidos do pgvector.', v_count;

  -- ══════════════════════════════════════════════════════════════════════════
  -- 6. ACADEMIA — conteúdo de lição citando o nome descontinuado
  --    (learning_lessons.content->>'markdown', vindo do seed).
  -- ══════════════════════════════════════════════════════════════════════════
  UPDATE learning_lessons SET
    content = jsonb_set(content, '{markdown}',
      to_jsonb(replace(content->>'markdown', 'Troian e Biovas', 'Troian e Biotas')), false),
    updated_at = now()
  WHERE tenant_id = v_tenant_id
    AND content->>'markdown' LIKE '%Troian e Biovas%';

  SELECT count(*) INTO v_count FROM learning_lessons
   WHERE tenant_id = v_tenant_id
     AND (content->>'markdown' ILIKE '%biovas%'
       OR content->>'markdown' ILIKE '%bovex%');
  IF v_count <> 0 THEN
    RAISE WARNING 'Migration 0050: % licao(oes) da Academia ainda citam Biovas/Bovex — revisar conteudo manualmente.', v_count;
  END IF;

  -- ══════════════════════════════════════════════════════════════════════════
  -- 7. Verificações (não abortam — só denunciam drift em prod)
  -- ══════════════════════════════════════════════════════════════════════════
  SELECT count(*) INTO v_count FROM products
   WHERE tenant_id = v_tenant_id AND deleted_at IS NULL
     AND slug IN ('biotas','sporax','harzon','troian','controx','nemax','n-import','chrom');
  IF v_count <> 8 THEN
    RAISE WARNING 'Migration 0050: esperava 8 biologicos, encontrei % — confira slugs antigos remanescentes.', v_count;
  END IF;

  SELECT count(*) INTO v_count FROM products
   WHERE tenant_id = v_tenant_id AND deleted_at IS NULL
     AND slug IN ('biovas','bovex','titan');
  IF v_count <> 0 THEN
    RAISE WARNING 'Migration 0050: % produto(s) ainda com slug antigo (biovas/bovex/titan) — provavel colisao com o slug novo.', v_count;
  END IF;

  SELECT count(*) INTO v_count FROM products
   WHERE tenant_id = v_tenant_id AND deleted_at IS NULL
     AND (description ILIKE '%repelen%'
       OR description ILIKE '%organico organomineral%'
       OR description ILIKE '%orgânico organomineral%'
       OR description ILIKE '%Herbaspirillum%'
       OR description ILIKE '%Purpureocillium%');
  IF v_count <> 0 THEN
    RAISE WARNING 'Migration 0050: % descricao(oes) ainda com termo corrigido (repelente / organico organomineral / Herbaspirillum / Purpureocillium).', v_count;
  END IF;

  RAISE NOTICE 'Migration 0050 concluida: biologicos renomeados e corrigidos (+CHROM), organominerais e doses Operate alinhados ao catalogo 2026. RODAR AGORA: pnpm --filter @colheita/jobs reindex-all';
END $$;
