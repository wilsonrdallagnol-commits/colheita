-- ============================================================================
-- Migration 0022 — Seed do template Proposta Comercial (Camada 7 mov 3)
-- ============================================================================
-- Documento que liga CRM (lead) ao PIM (produtos selecionados) ao Generator.
-- Aplicada em prod via Management API. 5 templates ativos no tenant Argho.
-- ============================================================================

insert into public.material_templates
  (tenant_id, slug, name, description, category, format, component_ref, status, version)
select
  t.id,
  'proposta-comercial',
  'Proposta Comercial',
  'PDF de proposta gerada do PIM com itens (qty + preco) + cliente do CRM. Tabela de produtos com dose por hectare, NPK, MAPA + sumario financeiro com desconto + termos + assinatura do vendedor.',
  'other',
  '{"width": 210, "height": 297, "unit": "mm", "dpi": 300}'::jsonb,
  '@colheita/generator:Proposta',
  'active',
  1
from public.tenants t
where t.slug = 'argho'
on conflict (tenant_id, slug, version) do nothing;
