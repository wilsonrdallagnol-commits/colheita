-- ============================================================================
-- Migration 0015 — Fix CRITICO C2 da auditoria 2026-05-08
-- ============================================================================
-- Vazamento de PII e dados financeiros entre distribuidores em orders.
--
-- A policy original incluia `or distribuidor_id is null`, expondo pedidos
-- nao-mapeados (estado normal segundo o proprio comentario da migration 0014)
-- com CPF/CNPJ, totais financeiros e observacoes a TODOS distribuidores
-- autenticados do tenant.
--
-- LGPD: CPF/CNPJ sao dados pessoais protegidos. Vazamento entre
-- distribuidores concorrentes do mesmo tenant viola a Lei.
--
-- Fix: pedidos sem distribuidor_id sao admin-only (service role bypassa RLS).
-- Distribuidor autenticado ve APENAS pedidos onde distribuidor_id = auth.uid().
-- ============================================================================

drop policy if exists "Distribuidores veem seus próprios pedidos" on public.orders;
drop policy if exists "Distribuidores veem itens dos próprios pedidos" on public.order_items;

create policy "Distribuidores veem seus próprios pedidos"
  on public.orders
  for select
  using (
    tenant_id = auth.tenant_id()
    and distribuidor_id = auth.uid()
  );

create policy "Distribuidores veem itens dos próprios pedidos"
  on public.order_items
  for select
  using (
    tenant_id = auth.tenant_id()
    and exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.tenant_id = auth.tenant_id()
        and o.distribuidor_id = auth.uid()
    )
  );

comment on policy "Distribuidores veem seus próprios pedidos" on public.orders is
  'C2 fix 2026-05-08: removido or distribuidor_id is null que vazava PII/financeiro entre distribuidores.';
