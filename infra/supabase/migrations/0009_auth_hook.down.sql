-- infra/supabase/migrations/0009_auth_hook.down.sql
REVOKE EXECUTE ON FUNCTION auth.custom_access_token_hook FROM supabase_auth_admin;
REVOKE SELECT ON public.users FROM supabase_auth_admin;
DROP FUNCTION IF EXISTS auth.custom_access_token_hook;
