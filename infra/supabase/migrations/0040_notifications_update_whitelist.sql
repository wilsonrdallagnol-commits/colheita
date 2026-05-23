-- infra/supabase/migrations/0040_notifications_update_whitelist.sql
--
-- FIX ALTO (auditoria hm-engineer 2026-05-23):
--   Migration 0038 fez `GRANT SELECT, UPDATE ON notifications TO authenticated`
--   sem column whitelist. RLS policy `notifications_owner_update` permite
--   UPDATE de qualquer coluna pelo dono.
--
--   Risco: cliente Supabase com JWT do user pode UPDATE arbitrario em
--   title/body/link da propria notif (notif envenenada / phishing).
--   Mesmo que o app só chame `update({ read_at })`, atacante pode bypass
--   o app e chamar update direto via PostgREST.
--
-- Fix: REVOKE UPDATE total + GRANT UPDATE apenas em `read_at`.
--   Postgres respeita column-level grants mesmo com RLS habilitado.
--   `markNotificationRead` em portal/admin continua funcionando porque
--   só atualiza essa coluna.

-- Revoga update amplo (concedido pela 0038)
REVOKE UPDATE ON public.notifications FROM authenticated;

-- Concede apenas na coluna read_at
GRANT UPDATE (read_at) ON public.notifications TO authenticated;

-- Service role mantem ALL (triggers continuam podendo INSERT/UPDATE qualquer coluna)
-- Nao precisa re-grant — `GRANT ALL ... TO service_role` da 0038 ja cobre.

COMMENT ON COLUMN public.notifications.read_at IS
  'Marcado quando user le. Unica coluna mutavel pelo dono via portal/admin
   (column-level grant restringe UPDATE — auditoria fix #6 2026-05-23).';
