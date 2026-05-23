// apps/portal/src/lib/actions/suporte-reply.ts
//
// Server action pra distribuidor responder em um chamado proprio
// (suport_ticket_messages com is_internal=false, is_from_staff=false).

'use server';

import { createServerClient, requireAuth } from '@colheita/auth';
import { captureError } from '@colheita/observability';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { buildRateLimiter, checkRateLimit } from '@/lib/rate-limit';

// Rate limit: 30 replies/h por user (mais permissivo — replies sao
// mensagens curtas e nao disparam email).
const replyLimiter = buildRateLimiter({
  prefix: '@colheita/portal/replyToOwnTicket',
  limit: 30,
  window: '1 h',
});

export type ReplyTicketState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Partial<Record<'body', string>>;
} | null;

export async function replyToOwnTicket(
  ticketId: string,
  _prev: ReplyTicketState,
  formData: FormData,
): Promise<ReplyTicketState> {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Rate limit: 30 replies/h por user
  const rl = await checkRateLimit(replyLimiter, `user:${user.id}`);
  if (!rl.ok) {
    return { error: 'Muitas respostas rapidas. Aguarde alguns minutos.' };
  }

  const body = String(formData.get('body') ?? '').trim();

  if (body.length < 1) return { fieldErrors: { body: 'Mensagem vazia.' } };
  if (body.length > 10000) return { fieldErrors: { body: 'Mensagem muito longa (máx 10000).' } };

  // Busca ticket pra obter tenant_id + confirmar ownership e status
  const { data: ticket, error: fetchErr } = await supabase
    .from('support_tickets')
    .select('id, tenant_id, user_id, status')
    .eq('id', ticketId)
    .maybeSingle();

  if (fetchErr || !ticket) {
    return { error: 'Chamado não encontrado.' };
  }
  if (ticket.user_id !== user.id) {
    return { error: 'Você não pode responder este chamado.' };
  }
  if (ticket.status === 'closed') {
    return { error: 'Chamado fechado não aceita novas mensagens. Abra um novo.' };
  }

  const { error: insertErr } = await supabase.from('support_ticket_messages').insert({
    ticket_id: ticketId,
    tenant_id: ticket.tenant_id,
    author_id: user.id,
    body,
    is_internal: false,
    is_from_staff: false,
  });

  if (insertErr) {
    captureError(insertErr, { context: 'portal.suporte-reply.replyToOwnTicket' });
    return { error: 'Erro ao enviar resposta. Tente novamente.' };
  }

  revalidatePath(`/conta/suporte/${ticketId}`);
  revalidatePath('/conta/suporte');
  return { success: true };
}
