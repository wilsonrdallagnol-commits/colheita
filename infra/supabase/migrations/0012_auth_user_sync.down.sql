-- infra/supabase/migrations/0012_auth_user_sync.down.sql
-- Reverte sincronização auth.users → public.users

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user();
