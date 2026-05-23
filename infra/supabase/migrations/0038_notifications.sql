-- infra/supabase/migrations/0038_notifications.sql
--
-- Inbox de notificacoes unificada (portal distribuidor + admin Argho).
-- Cada notif tem:
--   - type: agrupa categoria (support.reply, certification.issued, order.synced, …)
--   - title + body: conteudo
--   - link: deep-link pra acao (pode ser null pra notificacao informativa)
--   - read_at: null = nao lida; preencher quando user marca como lida
--
-- Triggers automaticos:
--   - support_ticket_messages: quando staff envia msg publica → notif pro owner
--   - support_ticket_messages: quando owner responde → notif pro assignee (se houver)
--   - certifications: quando emitida → notif pro user
--
-- RLS:
--   - User ve so as proprias (user_id = auth.uid())
--   - Service role insere via triggers SECURITY DEFINER

CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  type        text NOT NULL,
  title       text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  body        text CHECK (body IS NULL OR length(body) <= 1000),
  link        text CHECK (link IS NULL OR length(link) <= 500),

  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_unread_idx
  ON notifications (user_id, created_at DESC)
  WHERE read_at IS NULL;

CREATE INDEX notifications_user_all_idx
  ON notifications (user_id, created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_owner_select ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND tenant_id = app_tenant_id());

-- Owner pode marcar como lida (UPDATE) — bloqueamos modificacao
-- de outros campos via coluna whitelist no app
CREATE POLICY notifications_owner_update ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND tenant_id = app_tenant_id())
  WITH CHECK (user_id = auth.uid() AND tenant_id = app_tenant_id());

GRANT SELECT, UPDATE ON notifications TO authenticated;
GRANT ALL ON notifications TO service_role;

-- ── Trigger: nova msg publica em ticket → notif ────────────────────────────

CREATE OR REPLACE FUNCTION trg_notify_on_ticket_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_ticket_user  uuid;
  v_ticket_subject text;
  v_ticket_tenant uuid;
  v_assignee     uuid;
BEGIN
  -- Ignora notas internas
  IF NEW.is_internal = true THEN
    RETURN NEW;
  END IF;

  SELECT user_id, subject, tenant_id, assigned_to
  INTO v_ticket_user, v_ticket_subject, v_ticket_tenant, v_assignee
  FROM support_tickets
  WHERE id = NEW.ticket_id;

  IF v_ticket_user IS NULL THEN
    RETURN NEW;
  END IF;

  -- Mensagem do staff → notif pro distribuidor
  IF NEW.is_from_staff = true AND NEW.author_id != v_ticket_user THEN
    INSERT INTO notifications (tenant_id, user_id, type, title, body, link)
    VALUES (
      v_ticket_tenant,
      v_ticket_user,
      'support.reply',
      'Nova resposta no seu chamado',
      v_ticket_subject,
      '/conta/suporte/' || NEW.ticket_id::text
    );
  -- Mensagem do distribuidor → notif pro assignee (se atribuido)
  ELSIF NEW.is_from_staff = false AND v_assignee IS NOT NULL AND v_assignee != NEW.author_id THEN
    INSERT INTO notifications (tenant_id, user_id, type, title, body, link)
    VALUES (
      v_ticket_tenant,
      v_assignee,
      'support.user_reply',
      'Distribuidor respondeu',
      v_ticket_subject,
      '/suporte/' || NEW.ticket_id::text
    );
  END IF;

  RETURN NEW;
END $$;

CREATE TRIGGER notify_on_ticket_message
  AFTER INSERT ON support_ticket_messages
  FOR EACH ROW EXECUTE FUNCTION trg_notify_on_ticket_message();

-- ── Trigger: certificacao emitida → notif ──────────────────────────────────

CREATE OR REPLACE FUNCTION trg_notify_on_certification_issued()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_track_title text;
BEGIN
  IF NEW.status != 'active' THEN
    RETURN NEW;
  END IF;

  SELECT title INTO v_track_title FROM learning_tracks WHERE id = NEW.track_id;

  INSERT INTO notifications (tenant_id, user_id, type, title, body, link)
  VALUES (
    NEW.tenant_id,
    NEW.user_id,
    'certification.issued',
    'Certificação emitida 🎓',
    COALESCE(v_track_title, 'Trilha'),
    '/conta/academia'
  );

  RETURN NEW;
END $$;

CREATE TRIGGER notify_on_certification_issued
  AFTER INSERT ON certifications
  FOR EACH ROW EXECUTE FUNCTION trg_notify_on_certification_issued();

COMMENT ON TABLE notifications IS
  'Inbox unificada de notificacoes do usuario (portal + admin). Triggers automaticos populam.';
