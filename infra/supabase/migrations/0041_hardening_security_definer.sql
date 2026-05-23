-- infra/supabase/migrations/0041_hardening_security_definer.sql
--
-- FIX MÉDIO (auditoria hm-engineer 2026-05-23):
--   3 funções SECURITY DEFINER criadas nas 0037-0038 sem SET search_path.
--   Padrão hardening Supabase: SECURITY DEFINER + search_path explícito
--   garante que atacante com permissão de criar schema não pode
--   shadowar tabelas (ex: criar `support_tickets` em schema próprio).
--
-- Mesmo no Supabase managed (onde nenhum role tem CREATE SCHEMA por
-- padrão), é flag no Security Advisor e padrão obrigatório.
--
-- Fix idempotente: ALTER FUNCTION ... SET search_path. Não recria
-- as funções (preserva triggers existentes).

-- 0037: trigger ticket message → atualiza status pai
ALTER FUNCTION public.trg_support_ticket_messages_on_insert()
  SET search_path = public, pg_temp;

-- 0038: trigger ticket message → cria notif
ALTER FUNCTION public.trg_notify_on_ticket_message()
  SET search_path = public, pg_temp;

-- 0038: trigger certificação → cria notif
ALTER FUNCTION public.trg_notify_on_certification_issued()
  SET search_path = public, pg_temp;
