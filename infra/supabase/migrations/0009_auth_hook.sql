-- infra/supabase/migrations/0009_auth_hook.sql
-- Auth Hook: injeta tenant_id no JWT de cada usuário autenticado.
-- Ativado em: Supabase Dashboard → Authentication → Hooks → custom_access_token_hook
-- SEGURANÇA: SECURITY DEFINER + search_path = '' + exception handler defensivo.

CREATE OR REPLACE FUNCTION auth.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE _tenant_id uuid;
BEGIN
  SELECT u.tenant_id INTO _tenant_id
  FROM public.users u
  WHERE u.id = (event->>'user_id')::uuid
  LIMIT 1;

  IF _tenant_id IS NOT NULL THEN
    event := jsonb_set(event, '{claims,tenant_id}', to_jsonb(_tenant_id::text));
  END IF;

  RETURN event;
EXCEPTION WHEN OTHERS THEN
  -- Falha silenciosa: token emitido sem o claim extra em vez de bloquear o login
  RETURN event;
END;
$$;

-- supabase_auth_admin é o role que invoca o hook
GRANT EXECUTE ON FUNCTION auth.custom_access_token_hook TO supabase_auth_admin;
GRANT SELECT ON public.users TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION auth.custom_access_token_hook FROM authenticated, anon, public;
