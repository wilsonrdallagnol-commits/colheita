-- infra/supabase/migrations/0036_support_tickets.sql
--
-- Suporte humano: distribuidor abre chamado pra agrônomo da Argho
-- quando a IA não basta (questão complexa, recomendação personalizada,
-- garantia de produto, dúvida operacional Safra/entrega).
--
-- RLS: distribuidor só vê/cria os próprios tickets; admin com role
-- 'sales' ou 'admin' ou 'tenant_owner' vê todos do tenant.

CREATE TYPE support_ticket_status AS ENUM (
  'open',          -- aguardando triagem
  'in_progress',   -- agronomo trabalhando
  'waiting_user',  -- aguardando resposta do distribuidor
  'resolved',      -- resolvido
  'closed'         -- fechado/arquivado
);

CREATE TYPE support_ticket_urgency AS ENUM (
  'low',     -- duvida geral, sem urgencia
  'normal',  -- precisa resposta em ~1 dia util
  'high',    -- problema operacional, mesma janela do plantio
  'urgent'   -- emergencia (perda iminente, mortandade, contaminacao)
);

CREATE TYPE support_ticket_category AS ENUM (
  'agronomic',     -- recomendacao/diagnostico tecnico
  'commercial',   -- pedido, preco, prazo, faturamento
  'product',      -- duvida sobre produto especifico, MSDS, rotulo
  'logistics',    -- entrega, sync Safra, devolucao
  'platform',     -- bug/duvida sobre a Plataforma Colheita
  'other'
);

CREATE TABLE support_tickets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Conteúdo do chamado
  subject       text NOT NULL CHECK (length(subject) BETWEEN 4 AND 200),
  body          text NOT NULL CHECK (length(body) BETWEEN 10 AND 5000),
  category      support_ticket_category NOT NULL DEFAULT 'agronomic',
  urgency       support_ticket_urgency NOT NULL DEFAULT 'normal',

  -- Contexto opcional (produto referenciado, cultura, etc)
  product_slug  text,
  context       jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Estado
  status        support_ticket_status NOT NULL DEFAULT 'open',
  assigned_to   uuid REFERENCES public.users(id) ON DELETE SET NULL,

  -- Auditoria
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  resolved_at   timestamptz,
  closed_at     timestamptz
);

CREATE INDEX support_tickets_tenant_status_idx
  ON support_tickets (tenant_id, status, created_at DESC);
CREATE INDEX support_tickets_user_idx
  ON support_tickets (user_id, created_at DESC);
CREATE INDEX support_tickets_assigned_idx
  ON support_tickets (assigned_to) WHERE assigned_to IS NOT NULL;

-- Trigger pra atualizar updated_at
CREATE OR REPLACE FUNCTION trg_support_tickets_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION trg_support_tickets_updated_at();

-- RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Distribuidor: vê e cria os próprios
CREATE POLICY support_tickets_owner_select ON support_tickets
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND tenant_id = app_tenant_id());

CREATE POLICY support_tickets_owner_insert ON support_tickets
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND tenant_id = app_tenant_id());

-- Admin Argho (sales/admin/tenant_owner): vê e atualiza tudo do tenant
CREATE POLICY support_tickets_admin_all ON support_tickets
  FOR ALL TO authenticated
  USING (
    tenant_id = app_tenant_id() AND (
      app_has_role('admin') OR app_has_role('tenant_owner') OR app_has_role('sales')
    )
  )
  WITH CHECK (
    tenant_id = app_tenant_id() AND (
      app_has_role('admin') OR app_has_role('tenant_owner') OR app_has_role('sales')
    )
  );

-- Service role e authenticated/anon GRANTs (segue padrão das migrations 0028+0029)
GRANT SELECT, INSERT ON support_tickets TO authenticated;
GRANT ALL ON support_tickets TO service_role;

COMMENT ON TABLE support_tickets IS
  'Chamados de suporte humano abertos pelo distribuidor (Plataforma Colheita).';
