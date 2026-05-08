-- ============================================================================
-- Migration 0017 — Seed do template Banner Social (Camada 3 movimento 4)
-- ============================================================================
-- Banner social Argho 1200x630 (formato OG/LinkedIn). Idempotente.
-- ============================================================================

insert into public.material_templates
  (tenant_id, slug, name, description, category, format, component_ref, status, version)
select
  t.id,
  'banner-social',
  'Banner Social',
  'PNG 1200x630 (retina 2400x1260) com identidade Argho — eyebrow + nome em CAPS + tagline + accent verde com NPK ou tecnologia Argho. Pensado pra LinkedIn, Instagram link sticker, WhatsApp preview e OpenGraph.',
  'banner',
  '{"width": 1200, "height": 630, "unit": "px", "dpi": 144, "deviceScaleFactor": 2}'::jsonb,
  '@colheita/generator:BannerSocial',
  'active',
  1
from public.tenants t
where t.slug = 'argho'
on conflict (tenant_id, slug, version) do nothing;
