-- ============================================================================
-- Migration 0005 — Academia (Trilhas, Certificações, Simulações)
-- ============================================================================

-- Trilhas de aprendizado (tracks)
create table public.learning_tracks (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  slug            text not null,
  title           text not null,
  subtitle        text,
  description     text,

  -- Público-alvo (vendedores, distribuidores, técnicos, etc)
  audience        text[] not null default '{}',
  -- Nível
  level           text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced', 'expert')),

  -- Estimativa de tempo (em minutos)
  estimated_minutes integer,

  -- Mídia
  cover_asset_id  uuid references public.assets(id) on delete set null,

  -- Certificação ao concluir
  grants_certification boolean not null default false,
  certification_validity_days integer,         -- null = sem expiração

  -- Status
  status          text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at    timestamptz,
  sort_order      integer not null default 0,

  -- Pré-requisitos (outras trilhas)
  prerequisite_track_ids uuid[] default '{}',

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (tenant_id, slug)
);

create trigger learning_tracks_updated_at before update on public.learning_tracks
  for each row execute function set_updated_at();

create index learning_tracks_tenant_status_idx on public.learning_tracks (tenant_id, status);

alter table public.learning_tracks enable row level security;

create policy learning_tracks_select on public.learning_tracks
  for select using (tenant_id = auth.tenant_id());

create policy learning_tracks_write on public.learning_tracks
  for all using (tenant_id = auth.tenant_id() and auth.has_role('academy_admin'));

-- ============================================================================
-- MODULES (capítulos dentro de uma trilha)
-- ============================================================================
create table public.learning_modules (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  track_id    uuid not null references public.learning_tracks(id) on delete cascade,
  slug        text not null,
  title       text not null,
  description text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (track_id, slug)
);

create trigger learning_modules_updated_at before update on public.learning_modules
  for each row execute function set_updated_at();

create index learning_modules_track_idx on public.learning_modules (track_id, sort_order);

alter table public.learning_modules enable row level security;

create policy learning_modules_select on public.learning_modules
  for select using (tenant_id = auth.tenant_id());

create policy learning_modules_write on public.learning_modules
  for all using (tenant_id = auth.tenant_id() and auth.has_role('academy_admin'));

-- ============================================================================
-- LESSONS (conteúdo individual)
-- ============================================================================
create table public.learning_lessons (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  module_id       uuid not null references public.learning_modules(id) on delete cascade,
  slug            text not null,
  title           text not null,
  type            text not null check (type in ('video', 'article', 'quiz', 'simulation', 'document', 'interactive')),

  -- Conteúdo (varia por tipo)
  content         jsonb not null default '{}'::jsonb
                  check (jsonb_typeof(content) = 'object'),
  -- video: { "asset_id": "...", "duration_s": 300, "transcript": "..." }
  -- article: { "markdown": "..." }
  -- quiz: { "questions": [...], "passing_score": 70 }
  -- simulation: { "scenario_id": "...", "config": {...} }

  -- Referências a produtos do PIM (pra acoplar conteúdo a produtos)
  related_product_ids uuid[] default '{}',

  -- Estimativa de duração
  estimated_minutes integer,

  -- Obrigatória ou opcional
  is_required     boolean not null default true,
  sort_order      integer not null default 0,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (module_id, slug)
);

create trigger learning_lessons_updated_at before update on public.learning_lessons
  for each row execute function set_updated_at();

create index learning_lessons_module_idx on public.learning_lessons (module_id, sort_order);

alter table public.learning_lessons enable row level security;

create policy learning_lessons_select on public.learning_lessons
  for select using (tenant_id = auth.tenant_id());

create policy learning_lessons_write on public.learning_lessons
  for all using (tenant_id = auth.tenant_id() and auth.has_role('academy_admin'));

-- ============================================================================
-- USER PROGRESS
-- ============================================================================
create table public.learning_progress (
  user_id     uuid not null references public.users(id) on delete cascade,
  lesson_id   uuid not null references public.learning_lessons(id) on delete cascade,
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  status      text not null default 'in_progress' check (status in ('not_started', 'in_progress', 'completed', 'failed')),
  score       numeric(5,2),
  attempts    integer not null default 0,
  data        jsonb not null default '{}'::jsonb
              check (jsonb_typeof(data) = 'object'),  -- respostas de quiz, eventos de simulação
  started_at  timestamptz default now(),
  completed_at timestamptz,
  updated_at  timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create trigger learning_progress_updated_at before update on public.learning_progress
  for each row execute function set_updated_at();

create index learning_progress_user_idx on public.learning_progress (user_id, tenant_id);
create index learning_progress_lesson_idx on public.learning_progress (lesson_id, status);

alter table public.learning_progress enable row level security;

create policy learning_progress_select_own on public.learning_progress
  for select using (user_id = auth.uid() or auth.has_role('academy_admin'));

create policy learning_progress_write_own on public.learning_progress
  for all using (user_id = auth.uid() and tenant_id = auth.tenant_id());

-- ============================================================================
-- CERTIFICATIONS
-- ============================================================================
create table public.certifications (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  user_id       uuid not null references public.users(id) on delete cascade,
  track_id      uuid not null references public.learning_tracks(id) on delete restrict,

  -- Identificação única e verificável
  certificate_no text not null unique,
  verification_code text not null unique default encode(gen_random_bytes(8), 'hex'),

  -- Score final
  final_score   numeric(5,2),

  -- Validade
  issued_at     timestamptz not null default now(),
  expires_at    timestamptz,
  status        text not null default 'active' check (status in ('active', 'expired', 'revoked')),

  -- Asset gerado (PDF do certificado)
  certificate_asset_id uuid references public.assets(id) on delete set null,

  created_at    timestamptz not null default now()
);

create index certifications_user_idx on public.certifications (user_id, tenant_id);
create index certifications_track_idx on public.certifications (tenant_id, track_id);
create index certifications_verify_idx on public.certifications (verification_code);

alter table public.certifications enable row level security;

create policy certifications_select_own on public.certifications
  for select using (user_id = auth.uid() or auth.has_role('academy_admin'));

-- Verificação pública por código (sem auth) — feita via service role + endpoint dedicado

comment on table public.learning_tracks is 'Trilhas de aprendizado da Academia Argho. Podem ter pré-requisitos e gerar certificação.';
comment on table public.certifications is 'Certificações emitidas. verification_code permite validação pública via endpoint.';
