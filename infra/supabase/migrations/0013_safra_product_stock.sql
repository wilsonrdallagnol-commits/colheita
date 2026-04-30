-- ============================================================================
-- Migration 0013 — Safra Integration: product_stock + products.safra_codigo
-- ============================================================================
--
-- Adiciona suporte à sincronização bidirecional com o ERP Safra:
--
-- 1. products.safra_codigo — campo opcional para mapear um produto PIM ao
--    código interno do Safra. Sem esse mapeamento, eventos de inventário e
--    produto do Safra são ignorados (sem produto correspondente no PIM).
--
-- 2. product_stock — tabela de estoque sincronizado via evento
--    inventario.atualizado. Guarda o estoque por depósito + safra_codigo.
--    Permite JOIN com products via safra_codigo para exibição no portal/admin.
--
-- ============================================================================

-- 1. Campo safra_codigo em products (nullable — mapeamento opcional)
alter table public.products
  add column if not exists safra_codigo text;

create index if not exists products_safra_codigo_idx
  on public.products (tenant_id, safra_codigo)
  where safra_codigo is not null;

-- ============================================================================
-- 2. Tabela product_stock
-- ============================================================================

create table if not exists public.product_stock (
  id            uuid           primary key default gen_random_uuid(),
  tenant_id     uuid           not null references public.tenants(id) on delete cascade,

  -- Referência ao produto no PIM (nullable — pode existir no Safra sem produto mapeado)
  product_id    uuid           references public.products(id) on delete set null,

  -- Código do produto no Safra (fonte da verdade)
  safra_codigo  text           not null,

  -- Depósito/armazém (ex: "principal", "cd-sp", etc.)
  deposito      text           not null default 'principal',

  -- Quantidade disponível
  estoque       numeric(12,3)  not null default 0 check (estoque >= 0),

  -- Unidade de medida (kg, L, sc, un, ...)
  unidade       text           not null default 'un',

  -- Quando o Safra enviou o último evento para esta combinação
  synced_at     timestamptz    not null default now(),

  created_at    timestamptz    not null default now(),
  updated_at    timestamptz    not null default now(),

  unique (tenant_id, safra_codigo, deposito)
);

create trigger product_stock_updated_at
  before update on public.product_stock
  for each row execute function set_updated_at();

create index if not exists product_stock_tenant_idx
  on public.product_stock (tenant_id);

create index if not exists product_stock_product_idx
  on public.product_stock (product_id)
  where product_id is not null;

create index if not exists product_stock_safra_codigo_idx
  on public.product_stock (tenant_id, safra_codigo);

-- ── RLS ──────────────────────────────────────────────────────────────────────

alter table public.product_stock enable row level security;

-- Distribuidores veem o estoque do seu tenant (útil para portal)
create policy product_stock_select
  on public.product_stock for select
  using (tenant_id = auth.tenant_id());

-- Apenas product_manager pode escrever (jobs usam service role, bypass RLS)
create policy product_stock_write
  on public.product_stock for all
  using (tenant_id = auth.tenant_id() and auth.has_role('product_manager'));
