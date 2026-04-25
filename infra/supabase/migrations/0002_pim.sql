-- ============================================================================
-- Migration 0002 — PIM (Product Information Management)
-- ============================================================================

-- Categorias de produto (fertilizante, biológico, adjuvante, etc)
create table public.product_categories (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  slug        text not null,
  name        text not null,
  description text,
  parent_id   uuid references public.product_categories(id) on delete set null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tenant_id, slug)
);

create trigger product_categories_updated_at before update on public.product_categories
  for each row execute function set_updated_at();

create index product_categories_tenant_idx on public.product_categories (tenant_id);

alter table public.product_categories enable row level security;

create policy product_categories_select on public.product_categories
  for select using (tenant_id = auth.tenant_id());

create policy product_categories_write on public.product_categories
  for all using (tenant_id = auth.tenant_id() and auth.has_role('product_manager'));

-- ============================================================================
-- PRODUCTS
-- ============================================================================
create table public.products (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,
  category_id       uuid references public.product_categories(id) on delete set null,
  slug              text not null,
  name              text not null,
  tagline           text,
  description       text,

  -- Status e ciclo de vida
  status            text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at      timestamptz,

  -- Composição (estrutura genérica jsonb pra flexibilidade)
  -- Ex: { "macros": { "N": 10, "P2O5": 5, "K2O": 6 }, "micros": { "Fe": 7.0, "Zn": 0.8 } }
  -- Validação semântica completa via Zod no app — aqui garantimos apenas o tipo estrutural.
  composition       jsonb not null default '{}'::jsonb
                    check (jsonb_typeof(composition) = 'object'),

  -- Características técnicas
  technical_specs   jsonb not null default '{}'::jsonb
                    check (jsonb_typeof(technical_specs) = 'object'),

  -- Apresentações comerciais (embalagens disponíveis)
  -- Ex: [{ "type": "bag", "weight_kg": 25 }, { "type": "ibc", "volume_l": 1000 }]
  packaging         jsonb not null default '[]'::jsonb
                    check (jsonb_typeof(packaging) = 'array'),

  -- Indicações por cultura
  -- Ex: [{ "crop": "soja", "stage": "V4", "dose_per_ha": 2, "unit": "kg" }]
  applications      jsonb not null default '[]'::jsonb
                    check (jsonb_typeof(applications) = 'array'),

  -- Conteúdo de marketing
  marketing         jsonb not null default '{}'::jsonb
                    check (jsonb_typeof(marketing) = 'object'),

  -- Mídia principal (referências a assets do DAM)
  hero_asset_id     uuid,
  packshot_asset_id uuid,

  -- SEO/portal
  meta_title        text,
  meta_description  text,

  -- Auditoria
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid references public.users(id),
  updated_by        uuid references public.users(id),
  deleted_at        timestamptz,

  unique (tenant_id, slug)
);

create trigger products_updated_at before update on public.products
  for each row execute function set_updated_at();

create index products_tenant_status_idx on public.products (tenant_id, status) where deleted_at is null;
create index products_category_idx on public.products (tenant_id, category_id) where deleted_at is null;
create index products_search_idx on public.products using gin (
  to_tsvector('portuguese', coalesce(name, '') || ' ' || coalesce(tagline, '') || ' ' || coalesce(description, ''))
);

alter table public.products enable row level security;

create policy products_select on public.products
  for select using (tenant_id = auth.tenant_id() and deleted_at is null);

create policy products_write on public.products
  for all using (tenant_id = auth.tenant_id() and auth.has_role('product_manager'));

-- ============================================================================
-- REGULATORY REGISTRATIONS — registros MAPA/ANVISA/IBAMA
-- ============================================================================
create table public.regulatory_registrations (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  product_id      uuid not null references public.products(id) on delete cascade,
  authority       text not null check (authority in ('MAPA', 'ANVISA', 'IBAMA', 'STATE', 'OTHER')),
  registration_no text not null,
  issued_at       date,
  expires_at      date,
  status          text not null default 'active' check (status in ('active', 'expired', 'pending', 'revoked')),
  document_url    text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger regulatory_updated_at before update on public.regulatory_registrations
  for each row execute function set_updated_at();

create index regulatory_product_idx on public.regulatory_registrations (tenant_id, product_id);
create index regulatory_expires_idx on public.regulatory_registrations (tenant_id, expires_at)
  where status = 'active';

alter table public.regulatory_registrations enable row level security;

create policy regulatory_select on public.regulatory_registrations
  for select using (tenant_id = auth.tenant_id());

create policy regulatory_write on public.regulatory_registrations
  for all using (tenant_id = auth.tenant_id() and auth.has_role('product_manager'));

comment on table public.products is 'Catálogo de produtos. composition/applications/packaging são jsonb pra flexibilidade entre tenants.';
comment on table public.regulatory_registrations is 'Registros regulatórios com alertas de vencimento.';
