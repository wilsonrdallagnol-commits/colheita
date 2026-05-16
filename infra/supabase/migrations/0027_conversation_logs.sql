-- ============================================================================
-- Migration 0027 — conversation_logs (persistência do chat do agente)
-- ============================================================================
-- O AgentDock chama /api/agent/ask via SSE. Sem persistência:
--   - Zero analytics (quais perguntas vendedores fazem mais?)
--   - Zero auditoria (LGPD: que dados o agente acessou pra responder?)
--   - Zero feedback loop (melhorar RAG sem saber o que falha)
--
-- Esta tabela registra cada turno pergunta→resposta. Idempotente —
-- pode rodar várias vezes (if not exists / drop policy if exists).
-- ============================================================================

create table if not exists public.conversation_logs (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  user_id         uuid references public.users(id) on delete set null,

  -- Conteúdo do turno
  query           text not null,
  answer          text not null default '',

  -- Contexto e fontes
  context_path    text,
  sources         jsonb not null default '[]'::jsonb
                  check (jsonb_typeof(sources) = 'array'),

  -- Métricas
  tokens_input    integer,
  tokens_output   integer,
  duration_ms     integer,
  model_used      text,

  -- Resultado
  status          text not null default 'ok' check (
    status in ('ok', 'error', 'rate_limited', 'no_context')
  ),

  created_at      timestamptz not null default now()
);

create index if not exists conversation_logs_tenant_idx
  on public.conversation_logs (tenant_id, created_at desc);
create index if not exists conversation_logs_user_idx
  on public.conversation_logs (user_id, created_at desc);
create index if not exists conversation_logs_created_idx
  on public.conversation_logs (created_at);

alter table public.conversation_logs enable row level security;

-- SELECT: usuário vê logs do próprio tenant (analytics interno).
-- Supabase Free 2025+ removeu DDL no schema auth — função custom mora em
-- public.app_tenant_id() (vide refactor documentado em MEMORY.md).
drop policy if exists conversation_logs_select on public.conversation_logs;
create policy conversation_logs_select on public.conversation_logs
  for select using (tenant_id = public.app_tenant_id());

-- INSERT feito via service role no route handler (bypassa RLS).

comment on table public.conversation_logs is
  '0027: log de turnos do agente RAG. Analytics + auditoria LGPD + feedback loop.';
