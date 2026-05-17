-- ============================================================================
-- Migration 0029 — GRANTs dos roles de API (authenticated/anon)
-- ============================================================================
-- Continuação do bug da 0028. Além do service_role, os roles `authenticated`
-- e `anon` também perderam os GRANTs padrão do Supabase no refactor das
-- migrations. 23 tabelas (users, leads, orders, layout_blueprints,
-- generated_materials, conversation_logs, roles, user_roles, etc) NÃO tinham
-- GRANT SELECT pro `authenticated`.
--
-- Sintoma: /api/agent/ask → "Tenant não associado ao usuário" (o SELECT em
-- public.users dava permission denied silencioso). Páginas do admin que leem
-- essas tabelas com user-context (leads, pedidos, academia, etc) retornavam
-- vazio ou erro.
--
-- Fix: concede o GRANT padrão do Supabase. RLS está ON em todas as tabelas —
-- é a RLS (policies) que faz o controle de acesso fino por tenant/role.
-- O GRANT só dá a permissão de tabela; a RLS filtra as linhas.
-- ============================================================================

grant usage on schema public to anon, authenticated;

-- authenticated: CRUD completo — a RLS de cada tabela filtra o que de fato
-- pode ser lido/escrito (todas as tabelas têm RLS habilitado).
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated;

-- anon: apenas leitura (portal público, catálogo). RLS filtra por tenant.
grant select on all tables in schema public to anon;
grant execute on all functions in schema public to anon;

-- Tabelas/sequences futuras
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant usage, select on sequences to authenticated;
alter default privileges in schema public
  grant execute on functions to anon, authenticated;
