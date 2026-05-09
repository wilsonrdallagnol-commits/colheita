-- ============================================================================
-- Migration 0023 — WhatsApp webhook idempotency (C1 fix 2026-05-09)
-- ============================================================================
-- Meta WhatsApp Business retry automatico em qualquer 5xx ou timeout. Sem
-- protecao, mensagens duplicariam no lead_activities timeline cada vez que
-- o webhook reprocessasse o mesmo payload.
--
-- Solucao: UNIQUE index parcial em (metadata->>'message_id') WHERE kind='whatsapp'.
-- Postgres rejeita INSERT duplicado com codigo 23505. Webhook trata isso como
-- success silencioso (retry esperado).
--
-- Tambem cobre replay attack: payload com signature valida + body intacto
-- nao consegue ser inserido duas vezes mesmo que atacante repita.
-- ============================================================================

create unique index if not exists lead_activities_whatsapp_msgid_idx
  on public.lead_activities ((metadata->>'message_id'))
  where kind = 'whatsapp'
    and metadata->>'message_id' is not null;

comment on index public.lead_activities_whatsapp_msgid_idx is
  'C1 fix 2026-05-09: idempotencia de webhook WhatsApp via Meta message_id.';
