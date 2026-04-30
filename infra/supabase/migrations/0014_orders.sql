-- ============================================================================
-- Migration 0014 — Orders: pedidos sincronizados via Safra ERP
-- ============================================================================
--
-- Armazena pedidos recebidos via webhook Safra (pedido.criado e
-- pedido.atualizado). Permite ao admin visualizar e rastrear o histórico
-- completo de pedidos dos distribuidores diretamente no painel Colheita.
--
-- Design:
-- - orders: cabeçalho do pedido (status, totais, datas, distribuidor)
-- - order_items: linhas do pedido (produto, quantidade, preço)
-- - safra_pedido_id é a chave natural do ERP — usada para upsert idempotente
-- - distribuidor_id é nullable (mapeia para public.users quando disponível)
-- - RLS: admin via service role (bypassa RLS); distribuidores veem
--   apenas seus próprios pedidos via select policy
-- ============================================================================

-- ============================================================================
-- 1. Tabela orders
-- ============================================================================

create table if not exists public.orders (
  id                  uuid          primary key default gen_random_uuid(),
  tenant_id           uuid          not null references public.tenants(id) on delete cascade,
  distribuidor_id     uuid          references public.users(id) on delete set null,

  -- Dados do ERP Safra
  safra_pedido_id     text          not null,
  numero              text          not null,
  status              text          not null
                        check (status in ('rascunho','confirmado','faturado','entregue','cancelado')),
  status_anterior     text,

  -- Dados do distribuidor (denormalizados — imutáveis após criação do pedido)
  distribuidor_nome       text      not null,
  distribuidor_cpf_cnpj   text,

  -- Financeiro
  total_bruto         numeric(14,2) not null default 0 check (total_bruto >= 0),
  total_desconto      numeric(14,2) not null default 0 check (total_desconto >= 0),
  total_liquido       numeric(14,2) not null default 0 check (total_liquido >= 0),

  observacoes         text,
  motivo_ultima_atualizacao text,

  -- Datas
  emitido_em          timestamptz   not null,
  prazo_entrega       timestamptz,
  synced_at           timestamptz   not null default now(),
  created_at          timestamptz   not null default now(),
  updated_at          timestamptz   not null default now(),

  unique (tenant_id, safra_pedido_id)
);

create index if not exists orders_tenant_status_idx
  on public.orders (tenant_id, status);

create index if not exists orders_tenant_distribuidor_idx
  on public.orders (tenant_id, distribuidor_id)
  where distribuidor_id is not null;

create index if not exists orders_tenant_emitido_idx
  on public.orders (tenant_id, emitido_em desc);

-- ============================================================================
-- 2. Tabela order_items
-- ============================================================================

create table if not exists public.order_items (
  id              uuid          primary key default gen_random_uuid(),
  tenant_id       uuid          not null references public.tenants(id) on delete cascade,
  order_id        uuid          not null references public.orders(id) on delete cascade,

  -- Dados do item (denormalizados — snapshot do momento do pedido)
  produto_codigo  text          not null,
  produto_nome    text          not null,
  quantidade      numeric(12,3) not null check (quantidade > 0),
  unidade         text          not null,
  preco_unitario  numeric(14,2) not null check (preco_unitario >= 0),
  desconto_pct    numeric(5,2)  not null default 0 check (desconto_pct >= 0 and desconto_pct <= 100),
  total           numeric(14,2) not null check (total >= 0),

  created_at      timestamptz   not null default now()
);

create index if not exists order_items_order_idx
  on public.order_items (order_id);

create index if not exists order_items_tenant_idx
  on public.order_items (tenant_id);

-- ============================================================================
-- 3. Updated_at trigger
-- ============================================================================

create trigger set_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 4. RLS
-- ============================================================================

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Admin: service_role bypassa RLS automaticamente.
-- Portal distribuidor: vê apenas seus próprios pedidos.

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
