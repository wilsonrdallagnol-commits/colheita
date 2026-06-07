-- 0045_fix_composition_doses.sql
-- Corrige composicao (defon, grow-calcium), descricao (defon) e doses de
-- applications (xcensis, grow-filling, grow-calcium, grow-mob) conforme as
-- Fichas Tecnicas oficiais Argho. Espelha packages/db/src/scripts/seed.ts.
--
-- Idempotente: apenas UPDATEs por slug (pode rodar mais de uma vez).
-- Single-tenant Argho: o WHERE por slug cobre a(s) linha(s) do produto.
-- O SITE institucional (apps/website/src/lib/products.ts) ja estava correto;
-- esta migration alinha a PLATAFORMA (Supabase/portal) aos mesmos valores.

BEGIN;

-- ── Composicao corrigida ─────────────────────────────────────────────────────
-- defon: Cu 2,4 -> 5,5 ; + S 2,5 ; + Acido gluconico 10,0  (MAPA PR 002049-4.000001)
UPDATE public.products
SET composition = '{"micros":{"Cu":5.5},"others":{"S":2.5,"Ácido glucônico":10.0}}'::jsonb,
    description = 'Fertilizante mineral simples em solução com cobre (5,5%) e enxofre (2,5%) complexado por ácido glucônico (10,0%), que garante alta solubilidade, estabilidade em calda e absorção foliar superior à do sulfato de cobre convencional. Indicado para correção e manutenção de cobre em culturas exigentes como café, citrus, tomate e cana.',
    updated_at = now()
WHERE slug = 'defon';

-- grow-calcium: N 1,4 / Ca 1,6 -> Ca 5,5 / N 4,8 ; + aminoacidos 4,6 / humicas 4,0  (MAPA PR 002049-4.000004)
UPDATE public.products
SET composition = '{"macros":{"Ca":5.5,"N":4.8},"others":{"Aminoácidos":4.6,"Substâncias húmicas":4.0}}'::jsonb,
    updated_at = now()
WHERE slug = 'grow-calcium';

-- ── Doses (applications) conforme ficha ──────────────────────────────────────
-- xcensis: cereais 0,2-0,3 kg/ha ; horticolas 1-2 kg/ha ; fruticolas 0,5-2 kg/ha
UPDATE public.products
SET applications = '[
  {"crop":"Soja","stage":"V3–V5","dosePerHa":250,"unit":"g","notes":"Grupo cereais (ficha): 0,2–0,3 kg/ha. Aplicar com Operate Plus. Compatível com biológicos."},
  {"crop":"Milho","stage":"V4–V6","dosePerHa":250,"unit":"g","notes":"Grupo cereais (ficha): 0,2–0,3 kg/ha. Pode ser misturado com herbicidas pós-emergentes."},
  {"crop":"Café","stage":"Florescimento e enchimento de grãos","dosePerHa":1000,"unit":"g","notes":"Grupo frutíferas/perenes (ficha): 0,5–2,0 kg/ha. Repetir a cada 30 dias em períodos críticos."},
  {"crop":"Banana","stage":"Produção mensal","dosePerHa":1000,"unit":"g","notes":"Grupo frutíferas (ficha): 0,5–2,0 kg/ha; fertirrigação 0,3–0,5 kg/ha (diluir 1 kg em 200 L)."},
  {"crop":"Tomate","stage":"Florescimento ao início de maturação","dosePerHa":1500,"unit":"g","notes":"Grupo hortaliças (ficha): 1,0–2,0 kg/ha. Evitar aplicação em horas de maior insolação."}
]'::jsonb,
    updated_at = now()
WHERE slug = 'xcensis';

-- grow-filling: cereais 0,15-0,25 kg/ha
UPDATE public.products
SET applications = '[
  {"crop":"Soja","stage":"R3–R5 (enchimento de grãos)","dosePerHa":200,"unit":"g","notes":"Ficha cereais: 0,15–0,25 kg/ha (soja R4–R5). Combinar com Xcensis (dupla final)."},
  {"crop":"Milho","stage":"R2–R4","dosePerHa":200,"unit":"g","notes":"Ficha cereais: 0,15–0,25 kg/ha (milho R1–R3). Aplicar antes das 9h ou após as 17h."},
  {"crop":"Trigo","stage":"Espigamento","dosePerHa":200,"unit":"g","notes":"Ficha cereais: 0,15–0,25 kg/ha. Dissolver em 200 L de água por hectare."}
]'::jsonb,
    updated_at = now()
WHERE slug = 'grow-filling';

-- grow-calcium: cereais 0,5-1,0 L/ha ; fruticolas 2-3 L/ha ; horticolas 3-5 mL/L
UPDATE public.products
SET applications = '[
  {"crop":"Tomate","stage":"Frutificação até maturação","dosePerHa":4,"unit":"mL/L","notes":"Ficha hortaliças de fruto: 3–5 mL/L de água. Previne podridão apical. Intervalo de 7–10 dias."},
  {"crop":"Alface","stage":"Toda a produção","dosePerHa":4,"unit":"mL/L","notes":"Ficha folhosas: 3–5 mL/L de água. Direcionar a folhas jovens; atenção a tip burn."},
  {"crop":"Maçã","stage":"Pós-florescimento e pré-colheita","dosePerHa":2.5,"unit":"l","notes":"Ficha frutíferas: 2–3 L/ha foliar. Reduz bitter-pit e russeting."},
  {"crop":"Banana","stage":"Desenvolvimento do cacho","dosePerHa":2.5,"unit":"l","notes":"Ficha: 2–3 L/ha foliar. Aplicar via foliar no coração do cacho."}
]'::jsonb,
    updated_at = now()
WHERE slug = 'grow-calcium';

-- grow-mob: cereais 0,04-0,08 kg/ha
UPDATE public.products
SET applications = '[
  {"crop":"Soja","stage":"V3 (pré-inoculação)","dosePerHa":60,"unit":"g","notes":"Ficha cereais/leguminosas: 0,04–0,08 kg/ha (V4–R1). Não misturar com inoculante no tanque."},
  {"crop":"Milho","stage":"V4–V6","dosePerHa":60,"unit":"g","notes":"Ficha cereais: 0,04–0,08 kg/ha. Favorece enraizamento e antecipa o florescimento."},
  {"crop":"Girassol","stage":"Pré-florescimento","dosePerHa":60,"unit":"g","notes":"Ficha cereais: 0,04–0,08 kg/ha. B essencial para fertilização do grão."}
]'::jsonb,
    updated_at = now()
WHERE slug = 'grow-mob';

COMMIT;
