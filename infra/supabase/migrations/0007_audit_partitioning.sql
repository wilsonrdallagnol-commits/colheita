-- ============================================================================
-- Migration 0007 — audit_events: range partitioning por mês
-- ============================================================================
-- Converte audit_events para PARTITION BY RANGE (created_at).
-- Seguro em Fase 0: tabela criada em 0001 está vazia e sem FKs externas.
--
-- Estratégia:
--   - Particionamento nativo do Postgres 16 (sem pg_partman na Fase 0)
--   - pg_partman será adicionado na Fase 1 via Supabase Cloud para
--     automatizar criação de partições mensais e arquivamento após 12 meses
--   - Partição DEFAULT como safety net enquanto automação não está ativa
--
-- PK composta (id, created_at): exigência do Postgres — a partition key
-- deve fazer parte de qualquer constraint de unicidade na tabela particionada.
-- audit_events não é referenciada por FK em nenhuma outra tabela, portanto
-- a mudança da PK não tem impacto em cascata.
-- ============================================================================

BEGIN;

-- Remove tabela original criada em 0001 (vazia em Fase 0)
DROP TABLE IF EXISTS public.audit_events;

-- ============================================================================
-- Tabela particionada
-- ============================================================================
CREATE TABLE public.audit_events (
  id          uuid        NOT NULL DEFAULT gen_random_uuid(),
  tenant_id   uuid        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  actor_id    uuid        REFERENCES public.users(id),
  action      text        NOT NULL,
  resource    text        NOT NULL,
  resource_id text,
  payload     jsonb,
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now(),

  -- PK inclui partition key (obrigatório para partitioned tables no Postgres)
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- ============================================================================
-- Partições mensais pré-criadas (mês atual + 3 meses)
-- Novas partições devem ser criadas antecipadamente (job mensal via Trigger.dev — Fase 1)
-- ============================================================================
CREATE TABLE public.audit_events_2026_04 PARTITION OF public.audit_events
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE public.audit_events_2026_05 PARTITION OF public.audit_events
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE public.audit_events_2026_06 PARTITION OF public.audit_events
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE public.audit_events_2026_07 PARTITION OF public.audit_events
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- Partição default: captura datas fora do range (fallback enquanto automação não está ativa)
CREATE TABLE public.audit_events_default PARTITION OF public.audit_events DEFAULT;

-- ============================================================================
-- Índices (definidos no parent → criados automaticamente em cada partição)
-- ============================================================================
CREATE INDEX audit_tenant_created_idx  ON public.audit_events (tenant_id, created_at DESC);
CREATE INDEX audit_resource_idx        ON public.audit_events (tenant_id, resource, resource_id);

-- ============================================================================
-- RLS (definida no parent → herdada pelas partições)
-- INSERT via service role apenas — sem policy pública de escrita
-- ============================================================================
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_select ON public.audit_events
  FOR SELECT USING (tenant_id = auth.tenant_id() AND auth.has_role('admin'));

COMMENT ON TABLE public.audit_events IS
  'Log imutável de ações sensíveis. Particionado por mês (created_at). '
  'INSERT via service role apenas. Partições criadas mensalmente; '
  'arquivamento automático após 12 meses via pg_partman (Fase 1).';

COMMIT;
