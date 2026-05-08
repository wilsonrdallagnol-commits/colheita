-- ============================================================================
-- Migration 0018 — Seed do template Dossie Compliance (Camada 9)
-- ============================================================================
-- Compila todos os registros regulatorios em 1 PDF para auditoria externa,
-- renovacao e diligencia B2B. Idempotente.
-- ============================================================================

insert into public.material_templates
  (tenant_id, slug, name, description, category, format, component_ref, status, version)
select
  t.id,
  'dossie-compliance',
  'Dossie de Compliance',
  'PDF consolidado de todos os registros regulatorios (MAPA + ANVISA + IBAMA + estaduais), agrupado por autoridade, com capa institucional + stats agregadas + tabela. Pensado para auditoria MAPA externa, renovacao de processo e diligencia B2B. A4 portrait.',
  'other',
  '{"width": 210, "height": 297, "unit": "mm", "dpi": 300, "pages": "variable"}'::jsonb,
  '@colheita/generator:Dossie',
  'active',
  1
from public.tenants t
where t.slug = 'argho'
on conflict (tenant_id, slug, version) do nothing;
