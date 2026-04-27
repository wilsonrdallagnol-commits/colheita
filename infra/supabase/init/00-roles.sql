-- ============================================================================
-- Supabase role bootstrap — DEV LOCAL ONLY
-- Criado automaticamente para inicializar o stack Supabase self-hosted.
-- Equivale ao que o Supabase CLI configura em "supabase start".
-- ============================================================================

-- Superuser postgres (alias conveniente para supabase_admin)
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres') THEN
    CREATE ROLE postgres SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS LOGIN
      PASSWORD 'DEV_ONLY_postgres_password';
  END IF;
END $$;

-- Roles sem login (grupos de permissão)
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
END $$;

-- Roles com login usados pelos serviços
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT LOGIN
      PASSWORD 'DEV_ONLY_postgres_password';
  END IF;
END $$;
GRANT anon, authenticated, service_role TO authenticator;

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin NOINHERIT CREATEROLE LOGIN
      PASSWORD 'DEV_ONLY_postgres_password';
  END IF;
END $$;
-- Garante que migrations do GoTrue sejam criadas no schema auth, não em public
ALTER ROLE supabase_auth_admin SET search_path = auth;

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
    CREATE ROLE supabase_storage_admin NOINHERIT CREATEROLE LOGIN
      PASSWORD 'DEV_ONLY_postgres_password';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'dashboard_user') THEN
    CREATE ROLE dashboard_user NOINHERIT CREATEROLE LOGIN
      PASSWORD 'DEV_ONLY_postgres_password';
  END IF;
END $$;
GRANT ALL PRIVILEGES ON DATABASE postgres TO dashboard_user;
GRANT CONNECT ON DATABASE postgres TO
  postgres, authenticator, supabase_auth_admin, supabase_storage_admin,
  anon, authenticated, service_role;
GRANT TEMP ON DATABASE postgres TO
  postgres, authenticator, supabase_auth_admin, supabase_storage_admin;
-- Storage API precisa de ALL PRIVILEGES no banco para poder criar extensões e schemas
GRANT ALL PRIVILEGES ON DATABASE postgres TO supabase_storage_admin, supabase_auth_admin;

-- Schema extensions deve existir antes das extensões
CREATE SCHEMA IF NOT EXISTS extensions;

-- Extensões básicas necessárias pelo Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;
-- pgjwt pode não estar disponível em todas as imagens; ignorar falha
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pgjwt não disponível — pulando';
END $$;

-- Schema auth (usado pelo GoTrue/supabase-auth)
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth
  GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth
  GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- Schema storage
CREATE SCHEMA IF NOT EXISTS storage AUTHORIZATION supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT USAGE ON SCHEMA storage TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_storage_admin IN SCHEMA storage
  GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_storage_admin IN SCHEMA storage
  GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- Permissões no schema extensions
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role, supabase_auth_admin, supabase_storage_admin;

-- Adiciona extensions ao search_path padrão para que funções como gen_random_bytes
-- e uuid_generate_v4 funcionem sem prefixo de schema
ALTER DATABASE postgres SET search_path TO public, extensions;

-- Permissões básicas no schema public
GRANT USAGE, CREATE ON SCHEMA public TO anon, authenticated, service_role, supabase_auth_admin, supabase_storage_admin;
GRANT ALL ON SCHEMA public TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
