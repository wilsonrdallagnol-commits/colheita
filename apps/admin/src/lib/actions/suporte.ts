// apps/admin/src/lib/actions/suporte.ts
//
// Server actions admin pra gerenciar support_tickets:
//   - replyToTicket: responde publicamente OU adiciona nota interna
//   - updateTicketStatus: muda status (in_progress, waiting_user, resolved, closed)
//   - assignTicket: define agronomo responsavel
//
// RLS garante isolamento por tenant. Audit log em cada mudanca.

'use server';

import { createServerClient, requireAuth } from '@colheita/auth';
import { getResendClient } from '@colheita/email';
import { captureError } from '@colheita/observability';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { logAuditEvent } from '@/lib/audit';

type TicketStatus = 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
const VALID_STATUSES: TicketStatus[] = [
  'open',
  'in_progress',
  'waiting_user',
  'resolved',
  'closed',
];

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Aberto',
  in_progress: 'Em andamento',
  waiting_user: 'Aguardando distribuidor',
  resolved: 'Resolvido',
  closed: 'Fechado',
};

// ── replyToTicket ────────────────────────────────────────────────────────────

export type ReplyTicketState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Partial<Record<'body', string>>;
} | null;

export async function replyToTicket(
  ticketId: string,
  _prev: ReplyTicketState,
  formData: FormData,
): Promise<ReplyTicketState> {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const body = String(formData.get('body') ?? '').trim();
  const isInternal = formData.get('is_internal') === 'on';

  if (body.length < 1) return { fieldErrors: { body: 'Mensagem vazia.' } };
  if (body.length > 10000) return { fieldErrors: { body: 'Mensagem muito longa (máx 10000).' } };

  // Busca ticket pra obter tenant_id + email do dono (notification)
  const { data: ticket, error: fetchErr } = await supabase
    .from('support_tickets')
    .select('id, tenant_id, user_id, subject, status, assigned_to, users:user_id(email)')
    .eq('id', ticketId)
    .maybeSingle();

  if (fetchErr || !ticket) {
    return { error: 'Chamado não encontrado.' };
  }

  if (ticket.status === 'closed') {
    return { error: 'Chamado fechado não aceita novas mensagens.' };
  }

  const { error: insertErr } = await supabase.from('support_ticket_messages').insert({
    ticket_id: ticketId,
    tenant_id: ticket.tenant_id,
    author_id: user.id,
    body,
    is_internal: isInternal,
    is_from_staff: true,
  });

  if (insertErr) {
    captureError(insertErr, { context: 'admin.suporte.replyToTicket' });
    return { error: 'Erro ao enviar resposta. Tente novamente.' };
  }

  // Auto-assign: primeira resposta de staff sem assignee → atribui pra si.
  // Garante visibilidade clara de quem está cuidando do chamado.
  if (!ticket.assigned_to) {
    const { error: assignErr } = await supabase
      .from('support_tickets')
      .update({ assigned_to: user.id })
      .eq('id', ticketId)
      .is('assigned_to', null); // race-safe: só atualiza se ainda não foi atribuído
    if (assignErr) {
      // Não bloqueia o reply — só loga
      captureError(assignErr, { context: 'admin.suporte.replyToTicket.autoAssign' });
    }
  }

  // Audit
  await logAuditEvent({
    cookieStore,
    user,
    action: isInternal ? 'internal_note.support_ticket' : 'reply.support_ticket',
    resource: 'support_ticket',
    resource_id: ticketId,
    payload: { body_length: body.length },
  });

  // Email pro distribuidor se foi resposta publica
  if (!isInternal && process.env.RESEND_API_KEY) {
    const ownerData = Array.isArray(ticket.users) ? ticket.users[0] : ticket.users;
    const ownerEmail = (ownerData as { email?: string } | null)?.email;
    if (ownerEmail) {
      try {
        const resend = getResendClient();
        const portalUrl =
          process.env.NEXT_PUBLIC_PORTAL_URL ?? 'https://colheita.arghoagrosciences.com';
        const ticketUrl = `${portalUrl}/conta/suporte/${ticketId}`;

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? 'Argho <noreply@argho.com.br>',
          to: ownerEmail,
          subject: `[Argho] Resposta no chamado: ${ticket.subject}`,
          html: `
            <p>Você recebeu uma resposta no seu chamado de suporte.</p>
            <h3>${escapeHtml(ticket.subject)}</h3>
            <pre style="white-space:pre-wrap;font-family:inherit;font-size:14px;line-height:1.5;background:#f5f5f5;padding:16px;border-radius:6px">${escapeHtml(body)}</pre>
            <p><a href="${ticketUrl}" style="display:inline-block;background:#183090;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600">Abrir chamado no portal →</a></p>
          `,
        });
      } catch (emailErr) {
        captureError(emailErr, { context: 'admin.suporte.replyToTicket.email' });
      }
    }
  }

  revalidatePath(`/suporte/${ticketId}`);
  revalidatePath('/suporte');
  return { success: true };
}

// ── updateTicketStatus ───────────────────────────────────────────────────────

export async function updateTicketStatus(ticketId: string, newStatus: TicketStatus): Promise<void> {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new Error('Status inválido');
  }

  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const updates: Record<string, unknown> = { status: newStatus };
  if (newStatus === 'resolved') updates.resolved_at = new Date().toISOString();
  if (newStatus === 'closed') updates.closed_at = new Date().toISOString();

  const { error } = await supabase.from('support_tickets').update(updates).eq('id', ticketId);

  if (error) {
    captureError(error, { context: 'admin.suporte.updateTicketStatus' });
    throw new Error('Erro ao atualizar status');
  }

  await logAuditEvent({
    cookieStore,
    user,
    action: 'status.support_ticket',
    resource: 'support_ticket',
    resource_id: ticketId,
    payload: { new_status: newStatus, label: STATUS_LABEL[newStatus] },
  });

  revalidatePath(`/suporte/${ticketId}`);
  revalidatePath('/suporte');
}

// ── assignTicket ─────────────────────────────────────────────────────────────

export async function assignTicket(ticketId: string, assigneeId: string | null): Promise<void> {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase
    .from('support_tickets')
    .update({ assigned_to: assigneeId })
    .eq('id', ticketId);

  if (error) {
    captureError(error, { context: 'admin.suporte.assignTicket' });
    throw new Error('Erro ao atribuir chamado');
  }

  await logAuditEvent({
    cookieStore,
    user,
    action: 'assign.support_ticket',
    resource: 'support_ticket',
    resource_id: ticketId,
    payload: { assignee_id: assigneeId },
  });

  revalidatePath(`/suporte/${ticketId}`);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
