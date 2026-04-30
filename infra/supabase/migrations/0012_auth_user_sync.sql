-- infra/supabase/migrations/0012_auth_user_sync.sql
--
-- Sincroniza auth.users com public.users automaticamente.
--
-- Quando um novo usuário se autentica via magic link no Portal ou Academia,
-- o Supabase cria um registro em auth.users. Este trigger cria o registro
-- correspondente em public.users, associando o usuário ao tenant correto.
--
-- O tenant_id é resolvido em ordem de prioridade:
--   1. raw_app_meta_data->>'tenant_id' (passado explicitamente na criação do usuário)
--   2. Primeiro tenant por data de criação (fallback single-tenant para Argho)
--
-- SEGURANÇA: SECURITY DEFINER + SET search_path = '' (padrão C1 do projeto).
-- Exceptions são silenciadas para que falhas de sincronização nunca bloqueiem
-- o fluxo de autenticação.

-- ── Função ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _tenant_id uuid;
BEGIN
  -- 1. Tenant explícito no metadata do usuário (criação manual/API)
  _tenant_id := (NEW.raw_app_meta_data->>'tenant_id')::uuid;

  -- 2. Fallback: primeiro tenant cadastrado (deployment single-tenant)
  IF _tenant_id IS NULL THEN
    SELECT id INTO _tenant_id
    FROM public.tenants
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  -- Só insere se houver tenant disponível
  IF _tenant_id IS NOT NULL THEN
    INSERT INTO public.users (
      id,
      tenant_id,
      email,
      full_name,
      avatar_url,
      status,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      _tenant_id,
      NEW.email,
      -- Supabase armazena full_name em raw_user_meta_data (magic link não passa nome)
      COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        NULL
      ),
      NEW.raw_user_meta_data->>'avatar_url',
      'active',
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING; -- Idempotente: re-runs de migration não duplicam
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Falha silenciosa: autenticação nunca deve ser bloqueada por erro de sincronização
  RETURN NEW;
END;
$$;

-- ── Trigger ────────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ── Grants ─────────────────────────────────────────────────────────────────────

-- A função é chamada por supabase_auth_admin (role do sistema de autenticação).
-- Por ser SECURITY DEFINER, ela roda com os privilégios de quem a criou (postgres),
-- portanto não precisa de grants adicionais para INSERT em public.users.

COMMENT ON FUNCTION public.handle_new_auth_user() IS
  'Trigger function: cria public.users ao registrar novo auth.users. Associa ao tenant via metadata ou fallback.';
