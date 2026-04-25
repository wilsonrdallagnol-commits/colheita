-- ============================================================================
-- Migration 0004 — Generator (Materiais)
-- ============================================================================

-- Templates de materiais (ficha técnica, banner, post, catálogo)
create table public.material_templates (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  slug          text not null,
  name          text not null,
  description   text,
  category      text not null check (category in ('datasheet', 'banner', 'social_post', 'catalog', 'presentation', 'flyer', 'other')),

  -- Formato/dimensões
  format        jsonb not null,
  -- { "width": 1080, "height": 1350, "unit": "px", "dpi": 72 }
  -- ou { "width": 210, "height": 297, "unit": "mm", "dpi": 300 }

  -- Schema esperado de input (zod-compatible JSON Schema)
  input_schema  jsonb not null default '{}'::jsonb,

  -- Componente React responsável pelo render (referência ao package generator)
  component_ref text not null,

  -- Status
  status        text not null default 'active' check (status in ('active', 'draft', 'deprecated')),
  version       integer not null default 1,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (tenant_id, slug, version)
);

create trigger material_templates_updated_at before update on public.material_templates
  for each row execute function set_updated_at();

create index material_templates_tenant_idx on public.material_templates (tenant_id);
create index material_templates_category_idx on public.material_templates (tenant_id, category) where status = 'active';

alter table public.material_templates enable row level security;

create policy material_templates_select on public.material_templates
  for select using (tenant_id = auth.tenant_id());

create policy material_templates_write on public.material_templates
  for all using (tenant_id = auth.tenant_id() and auth.has_role('design_admin'));

-- ============================================================================
-- GENERATED MATERIALS — output de cada geração
-- ============================================================================
create table public.generated_materials (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  template_id   uuid not null references public.material_templates(id) on delete restrict,

  -- Input usado na geração (snapshot — não muda mesmo se source mudar)
  input_data    jsonb not null,

  -- Referências de origem (pra auditoria e relacionamento)
  product_ids   uuid[] default '{}',

  -- Outputs gerados (pode haver múltiplos formatos: PDF + PNG)
  outputs       jsonb not null default '[]'::jsonb,
  -- [{ "format": "pdf", "asset_id": "...", "url": "..." }, { "format": "png", ... }]

  -- Status do job
  status        text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  error         text,

  -- Métricas de custo/performance
  duration_ms   integer,
  pages         integer,

  -- Acesso
  generated_by  uuid references public.users(id),
  generated_at  timestamptz not null default now(),
  expires_at    timestamptz,             -- pra materiais com prazo de validade

  -- Compartilhamento público (opcional)
  public_token  text unique,             -- se setado, acessível sem auth
  public_views  integer not null default 0,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger generated_materials_updated_at before update on public.generated_materials
  for each row execute function set_updated_at();

create index generated_materials_tenant_idx on public.generated_materials (tenant_id, generated_at desc);
create index generated_materials_template_idx on public.generated_materials (tenant_id, template_id);
create index generated_materials_status_idx on public.generated_materials (status) where status in ('pending', 'processing');
create index generated_materials_public_token_idx on public.generated_materials (public_token) where public_token is not null;

alter table public.generated_materials enable row level security;

create policy generated_materials_select on public.generated_materials
  for select using (tenant_id = auth.tenant_id());

create policy generated_materials_insert on public.generated_materials
  for insert with check (tenant_id = auth.tenant_id());

create policy generated_materials_update_own on public.generated_materials
  for update using (tenant_id = auth.tenant_id() and generated_by = auth.uid());

comment on table public.material_templates is 'Templates versionados de materiais. component_ref aponta pro componente React no package generator.';
comment on table public.generated_materials is 'Histórico de materiais gerados. input_data é snapshot pra reprodutibilidade.';
