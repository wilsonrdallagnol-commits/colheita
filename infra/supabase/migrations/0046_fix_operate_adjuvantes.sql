-- 0046_fix_operate_adjuvantes.sql
-- Corrige os dados dos 4 adjuvantes Operate (plus, citronela, 4em1, orange)
-- conforme as Fichas Tecnicas oficiais Argho. Espelha:
--   - packages/db/src/scripts/seed.ts
--   - apps/website/src/lib/products.ts (site institucional)
--
-- Pontos-chave das fichas:
--   - TODOS isentos de registro no MAPA (atos 104/108 nov/2017). Sem registro a declarar.
--   - PLUS: condicionador multifuncional de calda; NAO ajusta pH (remove claim errado anterior
--     de "buffer acido 4,5-5,5").
--   - CITRONELA: adjuvante surfactante, oleo de citronela 3%; repelente NATURAL (sem claim de
--     inseticida/repelente registrado).
--   - 4EM1: o UNICO que ajusta pH (redutor a base de acido fosforico; calda-alvo pH 4,0-6,5).
--   - ORANGE: super-molhante/penetrante, D-limoneno 6%.
--
-- Idempotente: apenas UPDATEs por slug (pode rodar mais de uma vez).
-- O || em technical_specs faz MERGE (preserva linha/active_ingredient/application_modes).
-- Single-tenant Argho: WHERE por slug cobre a(s) linha(s) do produto.

BEGIN;

-- ── Operate Plus ─ condicionador multifuncional (NAO ajusta pH) ───────────────
UPDATE public.products
SET description = 'Condicionador multifuncional de calda que reúne sequestrante de cátions, blend de surfactantes não-iônicos, agente antideriva e antiespumante. Melhora a qualidade da água de pulverização, a cobertura e a estabilidade da calda, reduzindo perdas por deriva e formação de espuma. Adicionar primeiro no tanque, na dose de 0,5–1,0 mL/L (100–200 mL/ha). Produto isento de registro no MAPA.',
    technical_specs = COALESCE(technical_specs, '{}'::jsonb) || '{"product_type":"Condicionador Multifuncional de Calda"}'::jsonb,
    updated_at = now()
WHERE slug = 'operate-plus';

-- ── Operate Citronela ─ surfactante + oleo citronela 3% (repelente natural) ───
UPDATE public.products
SET description = 'Adjuvante surfactante formulado com óleo essencial de citronela (3%). Reduz a tensão superficial da calda, melhorando o espalhamento e a absorção dos ativos, e agrega o efeito repelente natural da citronela à aplicação. Adicionar por último no tanque (produto oleoso), na dose de 1,5–2,0 mL/L (150–200 mL/ha) — aplicação convencional, baixa vazão ou drone. Produto isento de registro no MAPA.',
    composition = '{"others":{"Óleo essencial de citronela":3.0}}'::jsonb,
    technical_specs = COALESCE(technical_specs, '{}'::jsonb) || '{"product_type":"Adjuvante Surfactante com Óleo Essencial"}'::jsonb,
    updated_at = now()
WHERE slug = 'operate-citronela';

-- ── Operate 4em1 ─ UNICO que ajusta pH (acido fosforico; calda 4,0–6,5) ───────
UPDATE public.products
SET description = 'O mais completo da família Operate: condicionador multifuncional que reúne sequestrante de cátions, redutor de pH à base de ácido fosfórico, surfactantes não-iônicos, antideriva e antiespumante. Ajusta o pH da calda para a faixa ideal de 4,0 a 6,5 e melhora a qualidade da aplicação em uma única adição ao tanque. Adicionar primeiro, na dose de 0,5–1,0 mL/L. Por conter ácido fosfórico, redobrar a atenção em misturas alcalinas e com produtos à base de cobre. Produto isento de registro no MAPA.',
    technical_specs = COALESCE(technical_specs, '{}'::jsonb) || '{"product_type":"Condicionador Multifuncional de Calda","functions":["Sequestrante de cátions","Redutor de pH (ácido fosfórico)","Surfactante não-iônico","Antideriva","Antiespumante"]}'::jsonb,
    updated_at = now()
WHERE slug = 'operate-4em1';

-- ── Operate Orange ─ super-molhante/penetrante, D-limoneno 6% ─────────────────
UPDATE public.products
SET description = 'Adjuvante super-molhante e penetrante à base de óleo da casca de laranja, com 6% de D-limoneno. Potencializa o molhamento das folhas e a penetração cuticular de defensivos e nutrientes sistêmicos. Adicionar por último no tanque, na dose de 1,5–2,0 mL/L (150–200 mL/ha). Produto isento de registro no MAPA.',
    composition = '{"others":{"D-limoneno":6.0}}'::jsonb,
    technical_specs = COALESCE(technical_specs, '{}'::jsonb) || '{"product_type":"Adjuvante Super-molhante e Penetrante"}'::jsonb,
    updated_at = now()
WHERE slug = 'operate-orange';

COMMIT;
