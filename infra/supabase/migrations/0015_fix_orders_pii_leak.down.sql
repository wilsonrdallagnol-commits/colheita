-- Down migration 0015: restaura policies vulneraveis (apenas para testes/rollback).
-- AVISO: NAO rodar em producao — restaura a vulnerabilidade C2 (vazamento PII).

drop policy if exists "Distribuidores veem seus próprios pedidos" on public.orders;
drop policy if exists "Distribuidores veem itens dos próprios pedidos" on public.order_items;

create policy "Distribuidores veem seus próprios pedidos"
  on public.orders
  for select
  using (
    tenant_id = auth.tenant_id()
    and (
      distribuidor_id = auth.uid()
      or distribuidor_id is null
    )
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
        and (o.distribuidor_id = auth.uid() or o.distribuidor_id is null)
    )
  );
