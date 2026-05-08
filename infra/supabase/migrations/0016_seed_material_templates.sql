-- ============================================================================
-- Migration 0016 — Seed dos 2 templates ja em producao no @colheita/generator
-- ============================================================================
-- Camada 3 (Geracao de Materiais) ja esta no ar com 2 templates renderizando:
--   - FichaTecnica (1 produto, A4, ~1 pagina)
--   - Catalogo (todos produtos publicados, A4, capa + sumario + N paginas)
--
-- Mas ate aqui geracoes nao estavam sendo persistidas em generated_materials
-- porque material_templates estava vazio (template_id NOT NULL FK).
--
-- Esta migration popula os 2 registros canonicos pro tenant Argho. component_ref
-- bate com os exports do package @colheita/generator.
-- ============================================================================

-- Idempotente: re-runs da migration nao duplicam.
insert into public.material_templates
  (tenant_id, slug, name, description, category, format, component_ref, status, version)
select
  t.id,
  'ficha-tecnica',
  'Ficha Tecnica',
  'PDF de 1 pagina com composicao garantida, especificacoes tecnicas, embalagens, indicacoes por cultura e badge MAPA. Padrao Argho — paleta verde, Inter, A4 portrait.',
  'datasheet',
  '{"width": 210, "height": 297, "unit": "mm", "dpi": 300, "pages": "1"}'::jsonb,
  '@colheita/generator:FichaTecnica',
  'active',
  1
from public.tenants t
where t.slug = 'argho'
on conflict (tenant_id, slug, version) do nothing;

insert into public.material_templates
  (tenant_id, slug, name, description, category, format, component_ref, status, version)
select
  t.id,
  'catalogo-consolidado',
  'Catalogo Consolidado',
  'PDF com capa Argho + sumario agrupado por categoria + 1 pagina resumida por produto publicado. Limite atual de 200 produtos por geracao. Padrao Argho — A4 portrait.',
  'catalog',
  '{"width": 210, "height": 297, "unit": "mm", "dpi": 300, "pages": "variable"}'::jsonb,
  '@colheita/generator:Catalogo',
  'active',
  1
from public.tenants t
where t.slug = 'argho'
on conflict (tenant_id, slug, version) do nothing;

comment on column public.material_templates.component_ref is
  'Referencia <package>:<NomeExportado>. App resolve para componente React no @colheita/generator.';
