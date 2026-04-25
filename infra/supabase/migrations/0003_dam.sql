-- ============================================================================
-- Migration 0003 — DAM (Digital Asset Management)
-- ============================================================================

create table public.asset_collections (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  slug        text not null,
  name        text not null,
  description text,
  parent_id   uuid references public.asset_collections(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tenant_id, slug)
);

create trigger asset_collections_updated_at before update on public.asset_collections
  for each row execute function set_updated_at();

create index asset_collections_tenant_idx on public.asset_collections (tenant_id);

alter table public.asset_collections enable row level security;

create policy asset_collections_select on public.asset_collections
  for select using (tenant_id = auth.tenant_id());

create policy asset_collections_write on public.asset_collections
  for all using (tenant_id = auth.tenant_id() and auth.has_role('asset_manager'));

-- ============================================================================
-- ASSETS
-- ============================================================================
create table public.assets (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  collection_id   uuid references public.asset_collections(id) on delete set null,

  -- Metadata
  filename        text not null,
  original_name   text not null,
  mime_type       text not null,
  file_size       bigint not null,
  storage_path    text not null,           -- {tenant_id}/{collection}/{filename}

  -- Tipo de asset
  type            text not null check (type in ('image', 'video', 'document', 'audio', 'other')),

  -- Dimensões (imagens/vídeos)
  width           integer,
  height          integer,
  duration_ms     integer,

  -- Conteúdo
  title           text,
  description     text,
  alt_text        text,                    -- acessibilidade
  tags            text[] not null default '{}',

  -- Direitos de uso
  license         text default 'internal' check (license in ('internal', 'public', 'restricted', 'licensed')),
  license_notes   text,
  expires_at      date,                    -- pra licenças com prazo

  -- Derivativos (thumbnails, formatos otimizados)
  variants        jsonb not null default '[]'::jsonb
                  check (jsonb_typeof(variants) = 'array'),

  -- Versionamento
  version         integer not null default 1,
  parent_id       uuid references public.assets(id),

  -- Auditoria
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references public.users(id),
  deleted_at      timestamptz
);

create trigger assets_updated_at before update on public.assets
  for each row execute function set_updated_at();

create index assets_tenant_type_idx on public.assets (tenant_id, type) where deleted_at is null;
create index assets_collection_idx on public.assets (tenant_id, collection_id) where deleted_at is null;
create index assets_tags_idx on public.assets using gin (tags);
create index assets_search_idx on public.assets using gin (
  to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(alt_text, ''))
);

alter table public.assets enable row level security;

create policy assets_select on public.assets
  for select using (tenant_id = auth.tenant_id() and deleted_at is null);

create policy assets_write on public.assets
  for all using (tenant_id = auth.tenant_id() and auth.has_role('asset_manager'));

-- ============================================================================
-- FK do PIM pro DAM (agora que assets existe)
-- ============================================================================
alter table public.products
  add constraint products_hero_asset_fk foreign key (hero_asset_id) references public.assets(id) on delete set null;

alter table public.products
  add constraint products_packshot_asset_fk foreign key (packshot_asset_id) references public.assets(id) on delete set null;

-- ============================================================================
-- PRODUCT ASSETS — relação N:N com posicionamento
-- ============================================================================
create table public.product_assets (
  product_id  uuid not null references public.products(id) on delete cascade,
  asset_id    uuid not null references public.assets(id) on delete cascade,
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  role        text not null check (role in ('gallery', 'datasheet', 'video', 'document', 'certificate')),
  sort_order  integer not null default 0,
  primary key (product_id, asset_id, role)
);

create index product_assets_tenant_idx on public.product_assets (tenant_id);
create index product_assets_product_idx on public.product_assets (product_id);

alter table public.product_assets enable row level security;

create policy product_assets_select on public.product_assets
  for select using (tenant_id = auth.tenant_id());

create policy product_assets_write on public.product_assets
  for all using (tenant_id = auth.tenant_id() and auth.has_role('product_manager'));

comment on table public.assets is 'Biblioteca de mídia (DAM). Storage path segue {tenant_id}/{collection}/{filename}.';
comment on column public.assets.variants is 'Derivativos gerados (thumbnails, WebP, etc): [{ "label": "thumb", "path": "...", "w": 200 }]';
