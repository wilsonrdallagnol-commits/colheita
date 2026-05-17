-- ============================================================================
-- Migration 0028 — GRANTs do service_role no schema public
-- ============================================================================
-- BUG descoberto 2026-05-17: o role `service_role` (usado por todo backend
-- via createAdminClient / service key) NÃO tinha GRANT em nenhuma tabela do
-- schema public — só o role `postgres` tinha.
--
-- Sintoma: /api/admin/reindex → "permission denied for table products".
-- Qualquer operação de service role (webhook WhatsApp, Safra sync, uploads,
-- reindex de embeddings) que dependa de createAdminClient estava quebrada.
--
-- Causa: as migrations foram refatoradas pra contornar o Supabase Free 2025+
-- (que removeu DDL no schema auth). Nesse refactor, os GRANTs padrão que o
-- Supabase concede ao service_role se perderam.
--
-- Fix: concede ao service_role acesso total ao schema public — que é
-- EXATAMENTE o comportamento padrão do Supabase. service_role é o role de
-- backend que opera com a service key secreta e bypassa RLS por design.
-- ============================================================================

grant usage on schema public to service_role;

-- Tabelas existentes
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant all privileges on all functions in schema public to service_role;

-- Tabelas/sequences futuras criadas pelo role que roda as migrations
alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant all on sequences to service_role;
alter default privileges in schema public
  grant all on functions to service_role;

-- Garante também os roles de API (anon/authenticated) com leitura nas tabelas
-- que o RAG/portal público consome. RLS continua filtrando por tenant.
grant select on public.learning_lessons to anon, authenticated;
grant select on public.learning_tracks to anon, authenticated;
grant select on public.learning_modules to anon, authenticated;
