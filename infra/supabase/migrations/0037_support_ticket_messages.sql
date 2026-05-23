-- infra/supabase/migrations/0037_support_ticket_messages.sql
--
-- Thread de respostas dentro de um support_ticket. Permite:
--   - Distribuidor responder ao agronomo
--   - Agronomo responder ao distribuidor (publica)
--   - Agronomo deixar notas internas (is_internal=true) visiveis so pro time
--
-- Status do ticket pai atualiza via trigger quando ha nova mensagem
-- (open → waiting_user quando agronomo responde, waiting_user →
-- in_progress quando user responde).

CREATE TABLE support_ticket_messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  tenant_id     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  author_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,

  body          text NOT NULL CHECK (length(body) BETWEEN 1 AND 10000),
  is_internal   boolean NOT NULL DEFAULT false,
  is_from_staff boolean NOT NULL DEFAULT false,

  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX support_ticket_messages_ticket_idx
  ON support_ticket_messages (ticket_id, created_at);
CREATE INDEX support_ticket_messages_author_idx
  ON support_ticket_messages (author_id);

-- Trigger: atualiza updated_at do ticket pai + status quando ha nova msg
CREATE OR REPLACE FUNCTION trg_support_ticket_messages_on_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_ticket_status support_ticket_status;
  v_ticket_user uuid;
BEGIN
  SELECT status, user_id INTO v_ticket_status, v_ticket_user
  FROM support_tickets WHERE id = NEW.ticket_id;

  IF v_ticket_status IS NULL THEN
    RETURN NEW;
  END IF;

  -- Nao mexe em ticket resolved/closed
  IF v_ticket_status IN ('resolved', 'closed') THEN
    UPDATE support_tickets SET updated_at = now() WHERE id = NEW.ticket_id;
    RETURN NEW;
  END IF;

  -- Mensagem do dono do ticket → status volta pra in_progress (precisa atendente ver)
  IF NEW.author_id = v_ticket_user AND v_ticket_status = 'waiting_user' THEN
    UPDATE support_tickets
    SET status = 'in_progress', updated_at = now()
    WHERE id = NEW.ticket_id;
  -- Mensagem do staff publica → status vai pra waiting_user
  ELSIF NEW.is_from_staff = true AND NEW.is_internal = false THEN
    UPDATE support_tickets
    SET status = 'waiting_user', updated_at = now()
    WHERE id = NEW.ticket_id;
  ELSE
    UPDATE support_tickets SET updated_at = now() WHERE id = NEW.ticket_id;
  END IF;

  RETURN NEW;
END $$;

CREATE TRIGGER support_ticket_messages_on_insert
  AFTER INSERT ON support_ticket_messages
  FOR EACH ROW EXECUTE FUNCTION trg_support_ticket_messages_on_insert();

-- RLS
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- Owner (distribuidor): SELECT/INSERT em mensagens NAO internas dos
-- proprios tickets
CREATE POLICY support_ticket_messages_owner_select ON support_ticket_messages
  FOR SELECT TO authenticated
  USING (
    tenant_id = app_tenant_id()
    AND is_internal = false
    AND EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = support_ticket_messages.ticket_id
        AND t.user_id = auth.uid()
    )
  );

CREATE POLICY support_ticket_messages_owner_insert ON support_ticket_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = app_tenant_id()
    AND is_internal = false
    AND is_from_staff = false
    AND author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = support_ticket_messages.ticket_id
        AND t.user_id = auth.uid()
        AND t.status NOT IN ('resolved', 'closed')
    )
  );

-- Staff (admin/tenant_owner/sales): vê tudo + insere com is_from_staff=true
CREATE POLICY support_ticket_messages_staff_all ON support_ticket_messages
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

GRANT SELECT, INSERT ON support_ticket_messages TO authenticated;
GRANT ALL ON support_ticket_messages TO service_role;

COMMENT ON TABLE support_ticket_messages IS
  'Thread de mensagens de um support_ticket. is_internal=true visivel so pro staff.';
