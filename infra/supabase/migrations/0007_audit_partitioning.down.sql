-- ============================================================================
-- Down migration 0007 — reverte audit_events para tabela simples
-- ============================================================================
-- Dropa a tabela particionada (e todas as partições filhas automaticamente)
-- e recria no formato original da migration 0001.
-- ============================================================================

BEGIN;

DROP TABLE IF EXISTS public.audit_events CASCADE;

CREATE TABLE public.audit_events (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  actor_id    uuid        REFERENCES public.users(id),
  action      text        NOT NULL,
  resource    text        NOT NULL,
  resource_id text,
  payload     jsonb,
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_tenant_created_idx ON public.audit_events (tenant_id, created_at DESC);
CREATE INDEX audit_resource_idx       ON public.audit_events (tenant_id, resource, resource_id);

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_select ON public.audit_events
  FOR SELECT USING (tenant_id = auth.tenant_id() AND auth.has_role('admin'));

COMMENT ON TABLE public.audit_events IS
  'Log imutável de ações sensíveis. Insere via service role apenas.';

COMMIT;
