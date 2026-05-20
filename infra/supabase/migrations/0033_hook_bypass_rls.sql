-- ============================================================================
-- Migration 0033 — Hook precisa bypassar RLS pra ler users/user_roles
-- ============================================================================
-- BUG descoberto pos-0032:
--
-- O hook app_custom_access_token_hook era SECURITY DEFINER mas ainda assim
-- as queries internas (select public.users, select public.user_roles) sao
-- afetadas por RLS porque o owner da funcao (postgres.htoqhomunwkrnizibusc
-- = role de projeto Supabase) NAO eh superuser real e portanto nao bypassa
-- RLS. Como o hook roda SEM JWT (eh chamado pelo supabase_auth_admin antes
-- do JWT existir), public.users.users_select (tenant_id = auth.tenant_id())
-- denegava — _tenant_id sempre vinha NULL e _roles vinha [].
--
-- Confirmado via _verify.mjs:
--   tenant direto (select user_id): retorna o UUID
--   hook simulado: retorna NULL pra _tenant_id
--
-- FIX: adicionar `SET row_security = off` na funcao. Como ela ja eh SECURITY
-- DEFINER + owned by postgres role, esse SET permite as queries internas
-- ignorarem RLS (postgres ja tem privilegio pra isso).
-- ============================================================================

create or replace function public.app_custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
set row_security = off  -- <<< FIX: bypassa RLS dentro do hook
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
  -- Falha silenciosa: nao bloqueia login. Pior caso eh user sem claims extras
  -- (mesma fallback dos releases anteriores).
  return event;
end;
$$;

revoke all on function public.app_custom_access_token_hook(jsonb) from public;
grant execute on function public.app_custom_access_token_hook(jsonb) to supabase_auth_admin;
