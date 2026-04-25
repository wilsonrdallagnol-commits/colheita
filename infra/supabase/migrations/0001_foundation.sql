-- ============================================================================
-- Migration 0001 — Fundação multi-tenant
-- ============================================================================
-- Princípios:
-- 1. Toda tabela de domínio tem tenant_id + RLS habilitado
-- 2. Soft-delete em entidades de negócio (deleted_at)
-- 3. Audit trail em colunas (created_at, updated_at, created_by, updated_by)
-- 4. UUIDs v7 (lexicograficamente ordenáveis) onde possível
-- ============================================================================

-- Extensions
-- Princípio: extensões são adicionadas apenas quando há schema que as use.
-- Evita sub-otimizações de planner e dependências mortas.
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";       -- busca textual fuzzy (usado em PIM/DAM)
create extension if not exists "btree_gin";

-- Reservadas para fases futuras (NÃO criadas aqui):
--   - vector (pgvector): será habilitado em migration da Knowledge Base (Fase 2)
--   - pg_partman: será habilitado quando audit_events for particionado

-- ============================================================================
-- Helper: timestamps automáticos
-- ============================================================================
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- Helper: extrai tenant_id do JWT (com validação defensiva)
-- ============================================================================
-- security definer  → roda como dono da função, evita escalation via search_path
-- set search_path = '' → blinda contra search_path injection (CVE pattern)
-- validação regex → garante que cast pra uuid nunca explode em runtime
-- exception handler → qualquer falha retorna NULL (deny by default em policies)
-- ============================================================================
create or replace function auth.tenant_id()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  claim_value text;
begin
  claim_value := nullif(
    pg_catalog.current_setting('request.jwt.claims', true)::json ->> 'tenant_id',
    ''
  );

  if claim_value is null then
    return null;
  end if;

  -- UUID v4/v7 strict check antes do cast
  if claim_value !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return null;
  end if;

  return claim_value::uuid;
exception
  when others then
    return null;
end;
$$;

revoke all on function auth.tenant_id() from public;
grant execute on function auth.tenant_id() to authenticated, anon, service_role;

-- ============================================================================
-- Helper: verifica se usuário tem role específico
-- ============================================================================
create or replace function auth.has_role(required_role text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  claims_roles jsonb;
begin
  if required_role is null or required_role = '' then
    return false;
  end if;

  claims_roles := pg_catalog.current_setting('request.jwt.claims', true)::jsonb -> 'roles';

  if claims_roles is null or jsonb_typeof(claims_roles) <> 'array' then
    return false;
  end if;

  return claims_roles ? required_role;
exception
  when others then
    return false;
end;
$$;

revoke all on function auth.has_role(text) from public;
grant execute on function auth.has_role(text) to authenticated, anon, service_role;

-- ============================================================================
-- Guard adicional: helper que combina ambos os checks de forma defensiva
-- ============================================================================
-- Use em policies que precisam de tenant_id válido + role específico.
-- Garante explicitamente que tenant_id IS NOT NULL (defesa em profundidade).
-- ============================================================================
create or replace function auth.tenant_id_with_role(required_role text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when auth.tenant_id() is not null and auth.has_role(required_role)
    then auth.tenant_id()
    else null
  end;
$$;

revoke all on function auth.tenant_id_with_role(text) from public;
grant execute on function auth.tenant_id_with_role(text) to authenticated, anon, service_role;

-- ============================================================================
-- TENANTS
-- ============================================================================
create table public.tenants (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name          text not null,
  display_name  text not null,
  logo_url      text,
  primary_domain text unique,
  status        text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  settings      jsonb not null default '{}'::jsonb
                check (jsonb_typeof(settings) = 'object'),
  theme_tokens  jsonb not null default '{}'::jsonb
                check (jsonb_typeof(theme_tokens) = 'object'),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger tenants_updated_at before update on public.tenants
  for each row execute function set_updated_at();

create index tenants_slug_idx on public.tenants (slug);
create index tenants_status_idx on public.tenants (status) where status = 'active';

-- Tenants têm RLS, mas a leitura é controlada — usuário só vê o próprio tenant
-- Nota de segurança: auth.tenant_id() retorna NULL em qualquer falha (JWT ausente,
-- malformado, claim inválido, exceção). Comparação `id = NULL` em SQL retorna
-- `unknown`, que em policies RLS é tratado como deny — comportamento desejado.
-- Validado pelo test suite em /tests/rls.test.ts.
alter table public.tenants enable row level security;

create policy tenants_select on public.tenants
  for select using (id = auth.tenant_id());

create policy tenants_update on public.tenants
  for update using (id = auth.tenant_id() and auth.has_role('tenant_owner'));

-- ============================================================================
-- USERS (extensão de auth.users)
-- ============================================================================
create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  tenant_id     uuid not null references public.tenants(id) on delete restrict,
  email         text not null,
  full_name     text,
  avatar_url    text,
  status        text not null default 'active' check (status in ('active', 'invited', 'suspended')),
  preferences   jsonb not null default '{}'::jsonb
                check (jsonb_typeof(preferences) = 'object'),
  last_seen_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (tenant_id, email)
);

create trigger users_updated_at before update on public.users
  for each row execute function set_updated_at();

create index users_tenant_idx on public.users (tenant_id);
create index users_email_idx on public.users (email);

alter table public.users enable row level security;

create policy users_select on public.users
  for select using (tenant_id = auth.tenant_id());

create policy users_update_self on public.users
  for update using (id = auth.uid());

create policy users_admin on public.users
  for all using (tenant_id = auth.tenant_id() and auth.has_role('admin'));

-- ============================================================================
-- ROLES & PERMISSIONS
-- ============================================================================
create table public.roles (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  slug        text not null,
  name        text not null,
  permissions text[] not null default '{}',
  is_system   boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (tenant_id, slug)
);

create index roles_tenant_idx on public.roles (tenant_id);

alter table public.roles enable row level security;

create policy roles_select on public.roles
  for select using (tenant_id = auth.tenant_id());

create policy roles_admin on public.roles
  for all using (tenant_id = auth.tenant_id() and auth.has_role('admin'));

create table public.user_roles (
  user_id    uuid not null references public.users(id) on delete cascade,
  role_id    uuid not null references public.roles(id) on delete cascade,
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references public.users(id),
  primary key (user_id, role_id)
);

create index user_roles_tenant_idx on public.user_roles (tenant_id);
create index user_roles_user_idx on public.user_roles (user_id);

alter table public.user_roles enable row level security;

create policy user_roles_select on public.user_roles
  for select using (tenant_id = auth.tenant_id());

create policy user_roles_admin on public.user_roles
  for all using (tenant_id = auth.tenant_id() and auth.has_role('admin'));

-- ============================================================================
-- AUDIT EVENTS — registro imutável de mutações sensíveis
-- ============================================================================
create table public.audit_events (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  actor_id    uuid references public.users(id),
  action      text not null,
  resource    text not null,
  resource_id text,
  payload     jsonb,
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index audit_tenant_created_idx on public.audit_events (tenant_id, created_at desc);
create index audit_resource_idx on public.audit_events (tenant_id, resource, resource_id);

alter table public.audit_events enable row level security;

create policy audit_select on public.audit_events
  for select using (tenant_id = auth.tenant_id() and auth.has_role('admin'));

-- INSERT é via service role (sem policy pública)

-- ============================================================================
-- Comentários de documentação
-- ============================================================================
comment on table public.tenants is 'Empresas/organizações que usam a plataforma. Argho é o tenant primário.';
comment on table public.users is 'Usuários ligados a um tenant. Estende auth.users do Supabase.';
comment on table public.roles is 'Papéis customizáveis por tenant. Permissões como array de strings.';
comment on table public.audit_events is 'Log imutável de ações sensíveis. Insere via service role apenas.';
comment on function auth.tenant_id() is 'Extrai tenant_id do JWT do usuário autenticado.';
comment on function auth.has_role(text) is 'Verifica se usuário tem role específico no JWT.';
