-- ============================================================================
-- Migration 0021 — Fix dos CRITICOS C1+C3 e ALTO A3 (SPRINT-6-BLOCKERS)
-- ============================================================================
-- Origem: docs/PHASE-2/SPRINT-6-BLOCKERS.md (auditoria /hm-engineer scope B,
-- 2026-05-08). Esses 3 buracos eram dormentes em single-tenant Argho mas
-- ativam quando 2+ tenants reais entrarem.
--
-- Aplicada em prod via Supabase Management API com adaptacao de auth.* ->
-- public.app_* (Supabase Free 2025+ nao permite DDL no schema auth).
-- ============================================================================

-- ── C1: Privilege escalation entre tenants via users_update_self ────────────
--
-- Antes: policy `for update using (id = auth.uid())` SEM `with check` permitia
-- user mudar `tenant_id` da propria row. Combinado com o auth hook que le
-- tenant_id de public.users, atacante migrava-se entre tenants no proximo login.
--
-- Fix: WITH CHECK explicito + trigger backstop que bloqueia mudanca de tenant_id
-- mesmo via service role (defesa em profundidade).

drop policy if exists users_update_self on public.users;

create policy users_update_self on public.users
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

create or replace function public.prevent_user_tenant_change()
returns trigger
language plpgsql
as $$
begin
  if old.tenant_id is distinct from new.tenant_id then
    raise exception 'tenant_id is immutable on users';
  end if;
  return new;
end;
$$;

drop trigger if exists users_no_tenant_change on public.users;
create trigger users_no_tenant_change
  before update on public.users
  for each row execute function public.prevent_user_tenant_change();

-- ── A3: Tenant owner pode mudar slug/primary_domain sem WITH CHECK ──────────
--
-- Antes: tenant_owner alterava `slug` ou `primary_domain` via UI legitimamente.
-- Mas slug e primary_domain sao identidade — mudanca quebra URLs externas
-- salvas, links de email, e pode causar colisao com outros tenants.
-- Esses campos devem ser geridos pelo platform admin (service role).

create or replace function public.prevent_tenant_identity_change()
returns trigger
language plpgsql
as $$
begin
  if old.slug is distinct from new.slug then
    raise exception 'tenant slug is immutable';
  end if;
  if old.primary_domain is distinct from new.primary_domain then
    raise exception 'tenant primary_domain managed by platform admin';
  end if;
  return new;
end;
$$;

drop trigger if exists tenants_no_identity_change on public.tenants;
create trigger tenants_no_identity_change
  before update on public.tenants
  for each row execute function public.prevent_tenant_identity_change();

-- ── C3: Fallback silencioso pro "primeiro tenant" em handle_new_auth_user ──
--
-- Antes: novo signup sem `raw_app_meta_data.tenant_id` era atribuido ao tenant
-- mais antigo (Argho hoje). Em multi-tenant maduro, atacante registra email
-- aleatorio e vira user da Argho com role default.
--
-- Fix: quando ha > 1 tenant ativo, rejeitar signup sem tenant_id explicito.
-- Single-tenant continua com fallback (deployment Argho atual nao impacta).

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  _tenant_raw text;
  _tenant_id uuid;
  _active_count int;
begin
  _tenant_raw := new.raw_app_meta_data->>'tenant_id';

  -- Validacao regex strict ANTES do cast (evita exception caro)
  if _tenant_raw is not null
     and _tenant_raw ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    _tenant_id := _tenant_raw::uuid;
  end if;

  if _tenant_id is null then
    select count(*) into _active_count from public.tenants where status = 'active';

    if _active_count > 1 then
      -- Multi-tenant: rejeita signup sem tenant_id explicito.
      -- auth.users continua criado mas sem public.users -> login falha
      -- no JWT hook (sem tenant_id no claim) -> user fica orfao bloqueado.
      raise warning '[handle_new_auth_user] signup without tenant_id rejected (multi-tenant: % active tenants)', _active_count;
      return new;
    end if;

    -- Single-tenant: fallback aceitavel (Argho deployment).
    select id into _tenant_id from public.tenants where status = 'active' limit 1;
  end if;

  if _tenant_id is not null then
    insert into public.users (
      id, tenant_id, email, full_name, avatar_url, status, created_at, updated_at
    )
    values (
      new.id,
      _tenant_id,
      new.email,
      coalesce(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        null
      ),
      new.raw_user_meta_data->>'avatar_url',
      'active',
      now(),
      now()
    )
    on conflict (id) do nothing;
  end if;

  return new;
exception when others then
  -- Falha silenciosa: autenticacao nunca deve ser bloqueada por erro
  return new;
end;
$$;

comment on function public.handle_new_auth_user() is
  'Sync auth.users -> public.users. Rejeita signup sem tenant_id em multi-tenant (C3 fix 2026-05-08).';
