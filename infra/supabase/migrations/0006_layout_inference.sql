-- ============================================================================
-- Migration 0006 — Layout Inference Engine
-- ============================================================================
-- Permite subir layouts de referência (imagem/PDF), extrair estrutura via
-- vision model, e re-renderizar com a identidade visual do tenant.
--
-- Pipeline:
--   layout_references (upload original)
--     → layout_blueprints (estrutura extraída, versionada, editável)
--       → generated_materials (render final com tokens do tenant)
-- ============================================================================

-- ============================================================================
-- LAYOUT REFERENCES — uploads originais usados como inspiração
-- ============================================================================
create table public.layout_references (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,

  -- Asset original (sempre versionado no DAM)
  asset_id        uuid not null references public.assets(id) on delete restrict,

  -- Metadados editoriais
  title           text not null,
  description     text,
  source_url      text,                                 -- de onde veio (opcional, pra audit)
  source_type     text not null default 'upload' check (
    source_type in ('upload', 'url', 'historical', 'competitor', 'inspiration')
  ),

  -- Tags pra organização ('hero', 'ficha', 'social', 'fertilizante', etc)
  tags            text[] not null default '{}',

  -- Categoria de material que essa referência inspira
  intended_category text check (
    intended_category in ('datasheet', 'banner', 'social_post', 'catalog', 'presentation', 'flyer', 'other')
  ),

  -- Auditoria
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references public.users(id),
  deleted_at      timestamptz
);

create trigger layout_references_updated_at before update on public.layout_references
  for each row execute function set_updated_at();

create index layout_references_tenant_idx on public.layout_references (tenant_id) where deleted_at is null;
create index layout_references_category_idx on public.layout_references (tenant_id, intended_category) where deleted_at is null;
create index layout_references_tags_idx on public.layout_references using gin (tags);

alter table public.layout_references enable row level security;

create policy layout_references_select on public.layout_references
  for select using (tenant_id = auth.tenant_id() and deleted_at is null);

create policy layout_references_write on public.layout_references
  for all using (tenant_id = auth.tenant_id() and auth.has_role('design_admin'));

-- ============================================================================
-- LAYOUT BLUEPRINTS — estrutura abstrata extraída por vision model
-- ============================================================================
-- Blueprint é a representação tenant-agnostic do layout: regiões, hierarquia,
-- intenção. NÃO contém cores específicas, fontes, ou conteúdo do tenant.
-- O tema é aplicado no momento do render via tokens do @colheita/tokens.
-- ============================================================================
create table public.layout_blueprints (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  reference_id    uuid not null references public.layout_references(id) on delete cascade,

  -- Versionamento (toda edição manual cria nova versão)
  version         integer not null default 1,
  parent_id       uuid references public.layout_blueprints(id) on delete set null,
  is_current      boolean not null default true,

  -- Estrutura extraída (validada por Zod no app)
  -- {
  --   "format": { "aspectRatio": "9:16", "orientation": "portrait", "intendedDpi": 72 },
  --   "grid": { "columns": 12, "rows": "auto", "density": "medium" },
  --   "regions": [
  --     { "id": "header", "type": "brand_header", "position": "top", "weight": 0.08 },
  --     { "id": "hero", "type": "headline_block", "position": "upper", "weight": 0.18,
  --       "hierarchy": ["primary_headline", "secondary_headline", "tertiary_headline"] },
  --     { "id": "product", "type": "product_centerpiece", "position": "center", "weight": 0.35 },
  --     { "id": "specs", "type": "data_grid", "position": "lower", "weight": 0.20,
  --       "items": 7, "layout": "horizontal_chips" },
  --     ...
  --   ],
  --   "visual_intent": {
  --     "mood": "technical_premium",
  --     "density": "high",
  --     "balance": "centered",
  --     "emphasis": "product_first"
  --   }
  -- }
  blueprint       jsonb not null check (jsonb_typeof(blueprint) = 'object'),

  -- Análise bruta do vision model (preserva pra debug e melhoria contínua)
  raw_analysis    jsonb not null default '{}'::jsonb
                  check (jsonb_typeof(raw_analysis) = 'object'),

  -- Status do pipeline
  status          text not null default 'draft' check (
    status in ('analyzing', 'draft', 'reviewed', 'approved', 'archived')
  ),

  -- Aprovação (workflow de revisão humana)
  reviewed_by     uuid references public.users(id),
  reviewed_at     timestamptz,
  review_notes    text,

  -- Métricas do modelo (custo, latência, modelo usado)
  model_used      text,                          -- 'claude-sonnet-4-5'
  tokens_input    integer,
  tokens_output   integer,
  duration_ms     integer,
  cost_usd        numeric(10, 6),

  -- Auditoria
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references public.users(id)
);

create trigger layout_blueprints_updated_at before update on public.layout_blueprints
  for each row execute function set_updated_at();

create index layout_blueprints_tenant_idx on public.layout_blueprints (tenant_id);
create index layout_blueprints_reference_idx on public.layout_blueprints (reference_id, version desc);
create index layout_blueprints_current_idx on public.layout_blueprints (reference_id) where is_current = true;
create index layout_blueprints_status_idx on public.layout_blueprints (tenant_id, status);

-- Garante que só existe um blueprint "current" por reference
create unique index layout_blueprints_one_current_per_ref
  on public.layout_blueprints (reference_id) where is_current = true;

alter table public.layout_blueprints enable row level security;

create policy layout_blueprints_select on public.layout_blueprints
  for select using (tenant_id = auth.tenant_id());

create policy layout_blueprints_write on public.layout_blueprints
  for all using (tenant_id = auth.tenant_id() and auth.has_role('design_admin'));

-- ============================================================================
-- Acopla generated_materials a um blueprint (opcional)
-- ============================================================================
-- Material pode ter sido gerado a partir de:
--   (a) template fixo (template_id) — fluxo padrão
--   (b) blueprint inferido (blueprint_id) — fluxo inference
-- ============================================================================
alter table public.generated_materials
  add column blueprint_id uuid references public.layout_blueprints(id) on delete set null;

create index generated_materials_blueprint_idx on public.generated_materials (blueprint_id)
  where blueprint_id is not null;

-- Relaxa NOT NULL do template_id (agora opcional, pq pode vir de blueprint)
alter table public.generated_materials
  alter column template_id drop not null;

-- Garante que pelo menos um dos dois está setado
alter table public.generated_materials
  add constraint generated_materials_source_check
  check (template_id is not null or blueprint_id is not null);

comment on table public.layout_references is
  'Uploads de layouts de referência (imagens/PDFs) usados como inspiração para geração de novos materiais.';

comment on table public.layout_blueprints is
  'Estrutura abstrata extraída de uma referência via vision model. Tenant-agnostic — o tema é aplicado no render.';

comment on column public.layout_blueprints.blueprint is
  'JSON estruturado validado por Zod no app. Define regiões, grid, hierarquia e intenção visual sem amarrar a tokens específicos.';

comment on column public.layout_blueprints.is_current is
  'Indica a versão ativa do blueprint para uma referência. Apenas uma por reference_id.';
