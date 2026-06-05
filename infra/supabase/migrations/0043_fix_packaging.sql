-- ============================================================================
-- 0043_fix_packaging.sql
-- ============================================================================
-- Normaliza as embalagens (coluna products.packaging) conforme a regra
-- comercial Argho confirmada em 2026-06-05:
--
--   • Biológicos + Fertilizantes (minerais e organominerais):
--       fluidos  → 1 L e 5 L        (bottle)
--       sólidos  → 1 kg e 5 kg      (bag)
--   • Adjuvantes (linha Operate):
--       1 L, 5 L, 20 L, 200 L, 1000 L
--       (1-5 L = bottle, 20-200 L = drum, 1000 L = ibc)
--
-- Contexto: o seed original trazia tambores de 20 L em fertilizantes/biológicos
-- (ex.: STRON 20 L) e faltavam o 5 L. Esta migration alinha o banco ao mapa.
--
-- Idempotente: UPDATE por slug, resolve tenant via slug 'argho'. Cobre os 20
-- produtos (inclui bovex/controx/nemax/titan da 0034 — se ainda não existirem,
-- o UPDATE simplesmente não afeta linha nenhuma).
--
-- Aplicar via psql (Supavisor session mode, porta 5432):
--   psql "$DATABASE_URL_DIRECT" -f infra/supabase/migrations/0043_fix_packaging.sql
-- ============================================================================

DO $$
DECLARE
  v_tenant_id uuid;
  v_count int;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'argho' LIMIT 1;
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant argho nao existe — rode db:seed primeiro';
  END IF;

  -- ── FERTILIZANTES MINERAIS ─────────────────────────────────────────────
  -- Sólidos (saco, kg)
  UPDATE products SET packaging =
    '[{"type":"bag","weightKg":1,"sku":"XCENSIS-1KG"},{"type":"bag","weightKg":5,"sku":"XCENSIS-5KG"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'xcensis';
  UPDATE products SET packaging =
    '[{"type":"bag","weightKg":1,"sku":"GROW-MOB-1KG"},{"type":"bag","weightKg":5,"sku":"GROW-MOB-5KG"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'grow-mob';
  UPDATE products SET packaging =
    '[{"type":"bag","weightKg":1,"sku":"GROW-FILLING-1KG"},{"type":"bag","weightKg":5,"sku":"GROW-FILLING-5KG"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'grow-filling';
  -- Fluidos (frasco, L)
  UPDATE products SET packaging =
    '[{"type":"bottle","volumeL":1,"sku":"STRON-1L"},{"type":"bottle","volumeL":5,"sku":"STRON-5L"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'stron';
  UPDATE products SET packaging =
    '[{"type":"bottle","volumeL":1,"sku":"GROW-CALCIUM-1L"},{"type":"bottle","volumeL":5,"sku":"GROW-CALCIUM-5L"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'grow-calcium';
  UPDATE products SET packaging =
    '[{"type":"bottle","volumeL":1,"sku":"DEFON-1L"},{"type":"bottle","volumeL":5,"sku":"DEFON-5L"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'defon';

  -- ── ORGANOMINERAIS (tratados como fertilizante → 1 e 5 L) ──────────────
  UPDATE products SET packaging =
    '[{"type":"bottle","volumeL":1,"sku":"IMPUCH-1L"},{"type":"bottle","volumeL":5,"sku":"IMPUCH-5L"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'impuch';
  UPDATE products SET packaging =
    '[{"type":"bottle","volumeL":1,"sku":"LIFEON-1L"},{"type":"bottle","volumeL":5,"sku":"LIFEON-5L"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'life-on';
  UPDATE products SET packaging =
    '[{"type":"bottle","volumeL":1,"sku":"GROW-NITROP-1L"},{"type":"bottle","volumeL":5,"sku":"GROW-NITROP-5L"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'grow-nitro-p';
  UPDATE products SET packaging =
    '[{"type":"bottle","volumeL":1,"sku":"UPSOIL-1L"},{"type":"bottle","volumeL":5,"sku":"UPSOIL-5L"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'up-soil';

  -- ── BIOLÓGICOS (1 e 5 L) ───────────────────────────────────────────────
  UPDATE products SET packaging =
    '[{"type":"bottle","volumeL":1,"sku":"TROIAN-1L"},{"type":"bottle","volumeL":5,"sku":"TROIAN-5L"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'troian';
  UPDATE products SET packaging =
    '[{"type":"bottle","volumeL":1,"sku":"BIOVAS-1L"},{"type":"bottle","volumeL":5,"sku":"BIOVAS-5L"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'biovas';
  UPDATE products SET packaging =
    '[{"type":"bottle","volumeL":1,"sku":"BOVEX-1L"},{"type":"bottle","volumeL":5,"sku":"BOVEX-5L"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'bovex';
  UPDATE products SET packaging =
    '[{"type":"bottle","volumeL":1,"sku":"CONTROX-1L"},{"type":"bottle","volumeL":5,"sku":"CONTROX-5L"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'controx';
  UPDATE products SET packaging =
    '[{"type":"bottle","volumeL":1,"sku":"NEMAX-1L"},{"type":"bottle","volumeL":5,"sku":"NEMAX-5L"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'nemax';
  UPDATE products SET packaging =
    '[{"type":"bottle","volumeL":1,"sku":"TITAN-1L"},{"type":"bottle","volumeL":5,"sku":"TITAN-5L"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'titan';

  -- ── ADJUVANTES (1, 5, 20, 200, 1000 L) ─────────────────────────────────
  UPDATE products SET packaging =
    '[{"type":"bottle","volumeL":1,"sku":"OPERATE-PLUS-1L"},{"type":"bottle","volumeL":5,"sku":"OPERATE-PLUS-5L"},{"type":"drum","volumeL":20,"sku":"OPERATE-PLUS-20L"},{"type":"drum","volumeL":200,"sku":"OPERATE-PLUS-200L"},{"type":"ibc","volumeL":1000,"sku":"OPERATE-PLUS-1000L"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'operate-plus';
  UPDATE products SET packaging =
    '[{"type":"bottle","volumeL":1,"sku":"OPERATE-CITRONELA-1L"},{"type":"bottle","volumeL":5,"sku":"OPERATE-CITRONELA-5L"},{"type":"drum","volumeL":20,"sku":"OPERATE-CITRONELA-20L"},{"type":"drum","volumeL":200,"sku":"OPERATE-CITRONELA-200L"},{"type":"ibc","volumeL":1000,"sku":"OPERATE-CITRONELA-1000L"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'operate-citronela';
  UPDATE products SET packaging =
    '[{"type":"bottle","volumeL":1,"sku":"OPERATE-4EM1-1L"},{"type":"bottle","volumeL":5,"sku":"OPERATE-4EM1-5L"},{"type":"drum","volumeL":20,"sku":"OPERATE-4EM1-20L"},{"type":"drum","volumeL":200,"sku":"OPERATE-4EM1-200L"},{"type":"ibc","volumeL":1000,"sku":"OPERATE-4EM1-1000L"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'operate-4em1';
  UPDATE products SET packaging =
    '[{"type":"bottle","volumeL":1,"sku":"OPERATE-ORANGE-1L"},{"type":"bottle","volumeL":5,"sku":"OPERATE-ORANGE-5L"},{"type":"drum","volumeL":20,"sku":"OPERATE-ORANGE-20L"},{"type":"drum","volumeL":200,"sku":"OPERATE-ORANGE-200L"},{"type":"ibc","volumeL":1000,"sku":"OPERATE-ORANGE-1000L"}]'::jsonb,
    updated_at = now() WHERE tenant_id = v_tenant_id AND slug = 'operate-orange';

  SELECT count(*) INTO v_count FROM products
    WHERE tenant_id = v_tenant_id
      AND slug IN ('xcensis','grow-mob','grow-filling','stron','grow-calcium','defon',
                   'impuch','life-on','grow-nitro-p','up-soil','troian','biovas',
                   'bovex','controx','nemax','titan',
                   'operate-plus','operate-citronela','operate-4em1','operate-orange');
  RAISE NOTICE 'Migration 0043: embalagens normalizadas em % produtos (de 20 esperados; biológicos da 0034 só contam se já aplicada).', v_count;
END $$;
