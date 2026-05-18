-- ============================================================================
-- Migration 0030 — match_*_embeddings aceitam tenant_id explícito
-- ============================================================================
-- Bug: match_product_embeddings / match_lesson_embeddings filtravam por
--   `tenant_id = public.app_tenant_id()`.
-- O app_tenant_id() lê o tenant das claims do JWT do usuário. Mas o AgentDock
-- (/api/agent/ask) chama essas funções via client service_role — que NÃO tem
-- JWT de usuário. Resultado: app_tenant_id() retorna NULL, o filtro vira
-- `tenant_id = NULL` e a busca vetorial retorna SEMPRE 0 linhas. O agente RAG
-- respondia "não tenho informação suficiente" para qualquer pergunta.
--
-- Fix: as funções passam a aceitar p_tenant_id. O filtro usa
-- coalesce(p_tenant_id, public.app_tenant_id()):
--   - caller service_role (AgentDock) passa o tenant explicitamente;
--   - contexto RLS/JWT cai no app_tenant_id();
--   - sem nenhum dos dois → NULL → 0 linhas (falha segura, nunca vaza tenant).
--
-- Segurança: as funções são SECURITY DEFINER. Para evitar que um usuário
-- `authenticated` chame com um p_tenant_id arbitrário e leia embeddings de
-- outro tenant, o EXECUTE é concedido SÓ a service_role (o retriever roda
-- sempre via service_role). anon/authenticated não executam mais.
-- ============================================================================

drop function if exists public.match_product_embeddings(vector, integer, double precision);
drop function if exists public.match_lesson_embeddings(vector, integer, double precision);

create function public.match_product_embeddings(
  query_embedding vector,
  match_count integer default 5,
  similarity_threshold double precision default 0.7,
  p_tenant_id uuid default null
)
returns table(product_id uuid, chunk_text text, chunk_type text, similarity double precision)
language sql
stable
security definer
set search_path to 'public', 'extensions'
as $$
  select
    pe.product_id,
    pe.chunk_text,
    pe.chunk_type,
    1 - (pe.embedding <=> query_embedding) as similarity
  from public.product_embeddings pe
  where
    pe.tenant_id = coalesce(p_tenant_id, public.app_tenant_id())
    and 1 - (pe.embedding <=> query_embedding) >= similarity_threshold
  order by pe.embedding <=> query_embedding
  limit match_count;
$$;

create function public.match_lesson_embeddings(
  query_embedding vector,
  match_count integer default 5,
  similarity_threshold double precision default 0.7,
  p_tenant_id uuid default null
)
returns table(lesson_id uuid, chunk_text text, chunk_type text, similarity double precision)
language sql
stable
security definer
set search_path to 'public', 'extensions'
as $$
  select
    le.lesson_id,
    le.chunk_text,
    le.chunk_type,
    1 - (le.embedding <=> query_embedding) as similarity
  from public.lesson_embeddings le
  where
    le.tenant_id = coalesce(p_tenant_id, public.app_tenant_id())
    and 1 - (le.embedding <=> query_embedding) >= similarity_threshold
  order by le.embedding <=> query_embedding
  limit match_count;
$$;

-- Lockdown: só service_role executa (retriever roda server-side via service_role).
revoke all on function public.match_product_embeddings(vector, integer, double precision, uuid)
  from public, anon, authenticated;
revoke all on function public.match_lesson_embeddings(vector, integer, double precision, uuid)
  from public, anon, authenticated;
grant execute on function public.match_product_embeddings(vector, integer, double precision, uuid)
  to service_role;
grant execute on function public.match_lesson_embeddings(vector, integer, double precision, uuid)
  to service_role;
