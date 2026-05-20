-- ============================================================================
-- Migration 0032 — Bootstrap roles + hook injeta roles no JWT
-- ============================================================================
-- Por que existe:
--
-- Antes desta migration:
--   1. public.roles estava VAZIA (0 records) em prod
--   2. public.user_roles estava VAZIA (0 records)
--   3. app_custom_access_token_hook so injetava tenant_id, nao roles
--
-- Resultado: 22 RLS policies que usam app_has_role('xxx') sempre retornavam
-- false. Toda escrita autenticada via supabase client (createProduto,
-- createLeadActivity, createLearningTrack, createAssetCollection, etc.) era
-- bloqueada por RLS — UI mostrava "Erro ao criar" sem explicacao.
--
-- Esta migration:
--   1. Atualiza o hook pra injetar roles array no JWT (alem de tenant_id)
--   2. Seed 7 system roles para o tenant 'argho' (slugs ja referenciados em policies)
--   3. Atribui TODAS as roles ao admin existente (wilsonrdallagnol@gmail.com)
--
-- Como rodar: aplicada via packages/db/_apply_0032.mjs (Postgres direct, session
-- mode pooler) por que Supabase Free 2025+ removeu DDL no schema auth via PAT.
-- Funcoes public.app_* sao chamadas equivalentes (vide 0009_auth_hook.down.sql).
-- ============================================================================

-- ── 1. Hook atualizado: injeta tenant_id + roles ─────────────────────────────
create or replace function public.app_custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  _tenant_id uuid;
  _roles jsonb;
begin
  -- Resolve tenant_id do user.
  select u.tenant_id into _tenant_id
  from public.users u
  where u.id = (event->>'user_id')::uuid
  limit 1;

  if _tenant_id is not null then
    event := jsonb_set(event, '{claims,tenant_id}', to_jsonb(_tenant_id::text));
  end if;

  -- Resolve roles do user (array de slugs).
  select coalesce(jsonb_agg(r.slug), '[]'::jsonb)
    into _roles
  from public.user_roles ur
  join public.roles r on r.id = ur.role_id
  where ur.user_id = (event->>'user_id')::uuid;

  event := jsonb_set(event, '{claims,roles}', _roles);

  return event;
exception when others then
  -- Falha silenciosa: nao bloqueia login. Sem claims extras, RLS continua
  -- aplicando deny-by-default — pior caso eh user nao conseguir escrever
  -- (mesmo comportamento que tinha antes desta migration).
  return event;
end;
$$;

revoke all on function public.app_custom_access_token_hook(jsonb) from public;
grant execute on function public.app_custom_access_token_hook(jsonb) to supabase_auth_admin;

-- ── 2. Seed system roles pro tenant argho ────────────────────────────────────
do $$
declare
  _argho_id uuid;
begin
  select id into _argho_id from public.tenants where slug = 'argho' limit 1;
  if _argho_id is null then
    raise notice 'tenant argho nao existe, skip seed de roles';
    return;
  end if;

  insert into public.roles (tenant_id, slug, name, permissions, is_system)
  values
    (_argho_id, 'tenant_owner',   'Proprietario do tenant', array['*'], true),
    (_argho_id, 'admin',          'Administrador',          array['*'], true),
    (_argho_id, 'product_manager','Gerente de Produto',     array['products:*','categories:*','regulatory:*'], true),
    (_argho_id, 'asset_manager',  'Gerente de Midia',       array['assets:*','collections:*'], true),
    (_argho_id, 'design_admin',   'Admin de Design',        array['layout:*','templates:*'], true),
    (_argho_id, 'academy_admin',  'Admin Academia',         array['learning:*'], true),
    (_argho_id, 'sales',          'Comercial',              array['leads:*','orders:read'], true)
  on conflict (tenant_id, slug) do nothing;
end $$;

-- ── 3. Atribui TODAS as roles ao admin Argho ─────────────────────────────────
-- Bootstrap: wilsonrdallagnol@gmail.com eh o primeiro admin. Dar todas as
-- roles garante acesso total. Em multi-user real, segregar (sales so leads, etc).
do $$
declare
  _user_id uuid;
  _tenant_id uuid;
  _role record;
begin
  select id into _tenant_id from public.tenants where slug = 'argho' limit 1;
  if _tenant_id is null then return; end if;

  select id into _user_id
  from public.users
  where tenant_id = _tenant_id
    and email = 'wilsonrdallagnol@gmail.com'
  limit 1;

  if _user_id is null then
    raise notice 'admin wilsonrdallagnol nao encontrado, skip user_roles';
    return;
  end if;

  for _role in select id from public.roles where tenant_id = _tenant_id loop
    insert into public.user_roles (user_id, role_id, tenant_id)
    values (_user_id, _role.id, _tenant_id)
    on conflict do nothing;
  end loop;
end $$;
