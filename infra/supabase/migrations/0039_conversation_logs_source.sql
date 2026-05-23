-- infra/supabase/migrations/0039_conversation_logs_source.sql
--
-- FIX CRÍTICO (auditoria hm-engineer 2026-05-23):
--   apps/portal/src/app/api/agent/ask/route.ts faz
--     INSERT INTO conversation_logs (..., source) VALUES (..., 'portal')
--   e a página /conta/assistente/historico filtra
--     WHERE source = 'portal'
--
--   Mas a coluna `source` NÃO EXISTE em conversation_logs (migration
--   0027 não criou). Em prod, todo turno do portal falha persistência
--   silenciosamente (Sentry captura mas chat aparenta funcionar) e
--   o histórico do distribuidor fica sempre vazio.
--
-- Fix: ADD COLUMN com default 'admin' (back-compat com rows antigas
-- + admin client sem source explicito vai pra 'admin').
-- Idempotente via IF NOT EXISTS.

ALTER TABLE public.conversation_logs
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'admin'
  CHECK (source IN ('admin', 'portal', 'api'));

-- Index pra histórico filtrado por user + source (uso primário no
-- portal /conta/assistente/historico).
CREATE INDEX IF NOT EXISTS conversation_logs_user_source_created_idx
  ON public.conversation_logs (user_id, source, created_at DESC)
  WHERE user_id IS NOT NULL;

COMMENT ON COLUMN public.conversation_logs.source IS
  'Origem do turno: admin (/assistente), portal (/conta/assistente), api (futuro endpoint público).';
