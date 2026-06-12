-- 0047_align_products_seed.sql
-- Alinha a PLATAFORMA (Supabase/portal) aos valores canonicos de exibicao do
-- site institucional (apps/website/src/lib/products.ts) e ao seed
-- (packages/db/src/scripts/seed.ts). Uma auditoria encontrou desalinhamentos
-- entre seed.ts, products.ts e as migrations ja aplicadas (0034/0043/0044/0045/0046).
--
-- O QUE FAZ:
--   1. Completa composition.others de 8 produtos (xcensis, stron, grow-mob,
--      grow-filling, impuch, life-on, grow-nitro-p, up-soil) com os teores
--      declarados que faltavam (EDTA/lignossulfonatos, aminoacidos, acidos
--      carboxilicos, substancias humicas, oleo vegetal, glicerina, sacarideos,
--      dioxido de silicio, carbono organico). Tambem padroniza a chave para
--      'Carbono organico' (c minusculo no 2o termo), antes 'Carbono Organico'.
--   2. Corrige names canonicos: grow-mob -> 'Grow MoB+'; life-on -> 'Lifeon';
--      grow-nitro-p -> 'Grow NitroP'. (SLUGS NAO MUDAM — URLs do portal dependem.)
--   3. technical_specs dos 4 adjuvantes operate-*: adiciona origin_country='Brasil'
--      e physical_state='fluido' (merge || preserva product_type/linha/etc.).
--   4. Ortografia AO90 (super- antes de 'm' sem hifen): operate-orange
--      'super-molhante'/'Super-molhante' -> 'supermolhante'/'Supermolhante'
--      (description + technical_specs.product_type).
--
-- POR QUE: o seed se declara "portfolio completo" / fonte de verdade do banco;
-- products.ts e a fonte canonica dos VALORES de exibicao. Esta migration leva o
-- prod ao mesmo estado, espelhando o seed.ts ja alinhado.
--
-- NAO INSERE os 4 biologicos (bovex/controx/nemax/titan): ja existem em prod
-- via 0034 + 0044. Esta migration so toca os campos desalinhados acima.
--
-- Idempotente: apenas UPDATEs por slug (pode rodar mais de uma vez).
-- Composition e escrita COMPLETA (macros/micros atuais + others novos).
-- O || em technical_specs faz MERGE (preserva as demais chaves).
-- Single-tenant Argho: o WHERE por slug cobre a(s) linha(s) do produto.

BEGIN;

-- ── 1. Composition completa (macros/micros atuais + others) ──────────────────

-- xcensis: + others EDTA 9,9 / Lignossulfonatos 23,0 / Sacarideos 10,0
UPDATE public.products
SET composition = '{"micros":{"Fe":7.0,"Mn":3.5,"Zn":0.8,"B":0.7,"Cu":0.4,"Mo":0.3},"macros":{"K2O":4.0},"others":{"EDTA":9.9,"Lignossulfonatos":23.0,"Sacarídeos":10.0}}'::jsonb,
    updated_at = now()
WHERE slug = 'xcensis';

-- stron: + others Aminoacidos 2,0 / Acidos carboxilicos 4,6
UPDATE public.products
SET composition = '{"macros":{"N":4.5,"P2O5":2.0,"K2O":7.2},"others":{"Aminoácidos":2.0,"Ácidos carboxílicos":4.6}}'::jsonb,
    updated_at = now()
WHERE slug = 'stron';

-- grow-mob: + others Dioxido de silicio 1,6
UPDATE public.products
SET composition = '{"macros":{"N":4.5,"P2O5":24.0},"micros":{"Mo":7.0,"B":8.0},"others":{"Dióxido de silício":1.6}}'::jsonb,
    updated_at = now()
WHERE slug = 'grow-mob';

-- grow-filling: + others Aminoacidos 6,0 / Sacarideos 8,0
UPDATE public.products
SET composition = '{"macros":{"N":2.0,"K2O":35.0},"others":{"Aminoácidos":6.0,"Sacarídeos":8.0}}'::jsonb,
    updated_at = now()
WHERE slug = 'grow-filling';

-- impuch: + others Carbono organico 11,0 / Aminoacidos 8,7 / Substancias humicas 15,0 / Oleo vegetal 0,7
UPDATE public.products
SET composition = '{"macros":{"N":5.0,"K2O":2.0},"others":{"Carbono orgânico":11.0,"Aminoácidos":8.7,"Substâncias húmicas":15.0,"Óleo vegetal":0.7}}'::jsonb,
    updated_at = now()
WHERE slug = 'impuch';

-- life-on: + others Carbono organico 14,0 / Aminoacidos 12,5 / Acidos carboxilicos 20,0 / Glicerina 3,0
UPDATE public.products
SET composition = '{"macros":{"N":6.0},"others":{"Carbono orgânico":14.0,"Aminoácidos":12.5,"Ácidos carboxílicos":20.0,"Glicerina":3.0}}'::jsonb,
    updated_at = now()
WHERE slug = 'life-on';

-- grow-nitro-p (slug do db com hifens): + others Carbono organico 7,0 / Aminoacidos 3,0 / Substancias humicas 15,0
UPDATE public.products
SET composition = '{"macros":{"N":20.0},"others":{"Carbono orgânico":7.0,"Aminoácidos":3.0,"Substâncias húmicas":15.0}}'::jsonb,
    updated_at = now()
WHERE slug = 'grow-nitro-p';

-- up-soil: + others Carbono organico 20,0 / Aminoacidos 10,0 / Substancias humicas 24,0
UPDATE public.products
SET composition = '{"macros":{"N":6.0},"others":{"Carbono orgânico":20.0,"Aminoácidos":10.0,"Substâncias húmicas":24.0}}'::jsonb,
    updated_at = now()
WHERE slug = 'up-soil';

-- ── 2. Names canonicos (SLUGS INTOCADOS) ─────────────────────────────────────
UPDATE public.products SET name = 'Grow MoB+', updated_at = now() WHERE slug = 'grow-mob';
UPDATE public.products SET name = 'Lifeon',    updated_at = now() WHERE slug = 'life-on';
UPDATE public.products SET name = 'Grow NitroP', updated_at = now() WHERE slug = 'grow-nitro-p';

-- ── 3. technical_specs dos adjuvantes Operate (merge preserva product_type/linha/etc.) ──
UPDATE public.products
SET technical_specs = COALESCE(technical_specs, '{}'::jsonb) || '{"origin_country":"Brasil","physical_state":"fluido"}'::jsonb,
    updated_at = now()
WHERE slug = 'operate-plus';

UPDATE public.products
SET technical_specs = COALESCE(technical_specs, '{}'::jsonb) || '{"origin_country":"Brasil","physical_state":"fluido"}'::jsonb,
    updated_at = now()
WHERE slug = 'operate-citronela';

UPDATE public.products
SET technical_specs = COALESCE(technical_specs, '{}'::jsonb) || '{"origin_country":"Brasil","physical_state":"fluido"}'::jsonb,
    updated_at = now()
WHERE slug = 'operate-4em1';

-- ── 4. Operate Orange: origin/physical_state + ortografia AO90 (supermolhante) ─
UPDATE public.products
SET description = 'Adjuvante supermolhante e penetrante à base de óleo da casca de laranja, com 6% de D-limoneno. Potencializa o molhamento das folhas e a penetração cuticular de defensivos e nutrientes sistêmicos. Adicionar por último no tanque, na dose de 1,5–2,0 mL/L (150–200 mL/ha). Produto isento de registro no MAPA.',
    technical_specs = COALESCE(technical_specs, '{}'::jsonb) || '{"origin_country":"Brasil","physical_state":"fluido","product_type":"Adjuvante Supermolhante e Penetrante"}'::jsonb,
    updated_at = now()
WHERE slug = 'operate-orange';

-- ── 5. Descricoes completas dos 4 biologicos (prod tinha as curtas da 0034) ──
-- A 0034 inseriu descricoes resumidas; products.ts/seed usam as completas.
-- Alinha o portal ao texto canonico do site (sem claims de uso/eficacia).
UPDATE public.products
SET description = 'Bovex reúne três espécies de fungos entomopatogênicos em uma formulação biotecnológica de alta complexidade microbiológica: Beauveria bassiana, Metarhizium anisopliae e Cordyceps fumosorosea. Desenvolvido dentro da linha de biotecnologias da Argho Agrosciences, o Bovex se destaca pela combinação de três gêneros fúngicos distintos em uma única matriz biológica, oferecendo uma composição robusta, tecnicamente diferenciada e alinhada ao avanço dos consórcios microbiológicos de base fúngica. A presença simultânea de três gêneros fúngicos declarados confere ao produto uma identidade biológica singular dentro do portfólio Argho, valorizando diversidade fúngica, estabilidade de formulação e precisão técnica na composição declarada. Concentração total: 2,5 × 10¹⁰.',
    updated_at = now()
WHERE slug = 'bovex';

UPDATE public.products
SET description = 'Controx reúne duas variedades distintas de Bacillus thuringiensis em uma formulação biotecnológica de alta complexidade microbiológica: Bacillus thuringiensis var. thuringiensis e Bacillus thuringiensis var. kurstaki. Desenvolvido dentro da linha de biotecnologias da Argho Agrosciences, o Controx se destaca pela combinação de duas variedades distintas dentro da mesma espécie em uma única matriz microbiológica, oferecendo uma composição robusta, tecnicamente diferenciada e alinhada ao avanço dos consórcios microbiológicos multivariantes. A presença simultânea das variedades thuringiensis e kurstaki confere ao produto uma identidade biológica singular dentro do portfólio Argho, valorizando diversidade intra-específica, estabilidade de formulação e precisão técnica na composição declarada. Concentração total: 2,5 × 10⁹.',
    updated_at = now()
WHERE slug = 'controx';

UPDATE public.products
SET description = 'Nemax reúne três espécies de fungos filamentosos em uma formulação biotecnológica de alta complexidade microbiológica: Trichoderma harzianum, Trichoderma asperellum e Purpureocillium lilacinum. Desenvolvido dentro da linha de biotecnologias da Argho Agrosciences, o Nemax se destaca pela combinação de três espécies de fungos filamentosos em uma única matriz microbiológica, oferecendo uma composição robusta, tecnicamente diferenciada e alinhada ao avanço dos consórcios microbiológicos de base fúngica. A presença simultânea de duas espécies do gênero Trichoderma com Purpureocillium lilacinum confere ao produto uma identidade biológica singular dentro do portfólio Argho, valorizando diversidade microbiana, estabilidade de formulação e precisão técnica na composição declarada. Concentração total: 2,5 × 10¹⁰.',
    updated_at = now()
WHERE slug = 'nemax';

UPDATE public.products
SET description = 'Titan é uma matriz microbiológica fúngica líquida à base de Trichoderma harzianum, estruturada para apresentar identidade técnica clara, facilidade operacional e padronização microbiológica dentro da linha de biotecnologias da Argho Agrosciences. A proposta tecnológica do produto está na combinação entre base fúngica, formulação líquida e comunicação técnica voltada à construção de programas microbiológicos, respeitando a finalidade e as condições previstas no registro vigente. Concentração total: 2,5 × 10⁹.',
    updated_at = now()
WHERE slug = 'titan';

COMMIT;
