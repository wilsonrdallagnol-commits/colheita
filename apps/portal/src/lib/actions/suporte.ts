// apps/portal/src/lib/actions/suporte.ts
//
// Server action pra distribuidor abrir chamado de suporte humano
// (agrônomo Argho). Insere em support_tickets + dispara email pro
// time interno via Resend (se configurado).

'use server';

import { createServerClient, requireAuth } from '@colheita/auth';
import { getResendClient } from '@colheita/email';
import { captureError } from '@colheita/observability';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { escapeHtml } from '@/lib/escape-html';
import { buildRateLimiter, checkRateLimit } from '@/lib/rate-limit';
import {
  CATEGORY_LABEL,
  type TicketCategory as Category,
  type TicketUrgency as Urgency,
  VALID_CATEGORIES,
  VALID_URGENCIES,
} from '@/lib/support-labels';
import { resolveTenantId } from '@/lib/tenant';

// Rate limit: 10 chamados/hora por user (custoso — INSERT + email Resend).
const createTicketLimiter = buildRateLimiter({
  prefix: '@colheita/portal/createSupportTicket',
  limit: 10,
  window: '1 h',
});

// Versão verbosa pro email do time interno Argho (vs. label curto da
// UI em support-labels.ts). Inclui contexto entre parenteses pra
// ajudar a triagem.
const EMAIL_URGENCY_LABEL: Record<Urgency, string> = {
  low: 'Baixa (dúvida geral)',
  normal: 'Normal (~1 dia útil)',
  high: 'Alta (janela do plantio)',
  urgent: 'Urgente (perda iminente)',
};

const SUPPORT_INBOX = process.env.SUPPORT_INBOX_EMAIL ?? 'suporte@arghoagrosciences.com';

export type CreateSupportTicketState = {
  error?: string;
  success?: boolean;
  ticketId?: string;
  fieldErrors?: Partial<Record<'subject' | 'body' | 'category' | 'urgency', string>>;
} | null;

export async function createSupportTicket(
  _prev: CreateSupportTicketState,
  formData: FormData,
): Promise<CreateSupportTicketState> {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Rate limit: 10 chamados/h por user (defesa contra spam de email Resend)
  const rl = await checkRateLimit(createTicketLimiter, `user:${user.id}`);
  if (!rl.ok) {
    return { error: 'Limite de chamados atingido. Aguarde alguns minutos.' };
  }

  const subject = String(formData.get('subject') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  const categoryRaw = String(formData.get('category') ?? 'agronomic').trim();
  const urgencyRaw = String(formData.get('urgency') ?? 'normal').trim();
  const productSlug = String(formData.get('product_slug') ?? '').trim() || null;

  // Validações
  if (subject.length < 4)
    return { fieldErrors: { subject: 'Assunto muito curto (mín 4 caracteres).' } };
  if (subject.length > 200)
    return { fieldErrors: { subject: 'Assunto muito longo (máx 200 caracteres).' } };
  if (body.length < 10)
    return { fieldErrors: { body: 'Descrição muito curta (mín 10 caracteres).' } };
  if (body.length > 5000)
    return { fieldErrors: { body: 'Descrição muito longa (máx 5000 caracteres).' } };

  const category = VALID_CATEGORIES.includes(categoryRaw as Category)
    ? (categoryRaw as Category)
    : 'agronomic';
  const urgency = VALID_URGENCIES.includes(urgencyRaw as Urgency)
    ? (urgencyRaw as Urgency)
    : 'normal';

  const tenantId = await resolveTenantId(supabase, 'portal.suporte.createSupportTicket.tenant');
  if (!tenantId) return { error: 'Sessão sem tenant — refaça login.' };

  // Insert
  const { data: ticket, error: insertErr } = await supabase
    .from('support_tickets')
    .insert({
      tenant_id: tenantId,
      user_id: user.id,
      subject,
      body,
      category,
      urgency,
      product_slug: productSlug,
    })
    .select('id')
    .single();

  if (insertErr || !ticket) {
    captureError(insertErr, { context: 'portal.suporte.createSupportTicket.insert' });
    return { error: 'Erro ao abrir chamado. Tente novamente.' };
  }

  // Email pro time da Argho (best-effort — falha do email não derruba o ticket)
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = getResendClient();
      const portalUrl =
        process.env.NEXT_PUBLIC_PORTAL_URL ?? 'https://colheita.arghoagrosciences.com';
      const ticketUrl = `${portalUrl}/conta/suporte/${ticket.id}`;

      // FIX ALTO #5 (auditoria): escapar TODOS os campos interpolados.
      // user.email e productSlug vem do form/JWT — não confiar mesmo
      // se 'sanitizado por tamanho' (spear-phishing à equipe interna).
      const escSubject = escapeHtml(subject);
      const escBody = escapeHtml(body);
      const escEmail = escapeHtml(user.email ?? '');
      const escCategory = escapeHtml(CATEGORY_LABEL[category]);
      const escUrgency = escapeHtml(EMAIL_URGENCY_LABEL[urgency]);
      const escProduct = productSlug ? escapeHtml(productSlug) : '';
      // ticketUrl é construído a partir de env + uuid — seguro

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'Argho <noreply@argho.com.br>',
        to: SUPPORT_INBOX,
        subject: `[${EMAIL_URGENCY_LABEL[urgency]}] ${subject}`,
        html: `
          <h2>Novo chamado de suporte</h2>
          <p><strong>Distribuidor:</strong> ${escEmail}</p>
          <p><strong>Categoria:</strong> ${escCategory}</p>
          <p><strong>Urgência:</strong> ${escUrgency}</p>
          ${escProduct ? `<p><strong>Produto:</strong> ${escProduct}</p>` : ''}
          <hr/>
          <h3>${escSubject}</h3>
          <pre style="white-space:pre-wrap;font-family:inherit;font-size:14px;line-height:1.5">${escBody}</pre>
          <hr/>
          <p><a href="${ticketUrl}">Abrir chamado no portal →</a></p>
        `,
      });
    } catch (emailErr) {
      // Não falha o ticket — email é opcional
      captureError(emailErr, { context: 'portal.suporte.createSupportTicket.email' });
    }
  }

  revalidatePath('/conta/suporte');
  return { success: true, ticketId: ticket.id };
}
