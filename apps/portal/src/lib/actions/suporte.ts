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

type Category = 'agronomic' | 'commercial' | 'product' | 'logistics' | 'platform' | 'other';
type Urgency = 'low' | 'normal' | 'high' | 'urgent';

const VALID_CATEGORIES: Category[] = [
  'agronomic',
  'commercial',
  'product',
  'logistics',
  'platform',
  'other',
];
const VALID_URGENCIES: Urgency[] = ['low', 'normal', 'high', 'urgent'];

const CATEGORY_LABEL: Record<Category, string> = {
  agronomic: 'Recomendação agronômica',
  commercial: 'Comercial / pedido',
  product: 'Produto específico',
  logistics: 'Logística / entrega',
  platform: 'Plataforma Colheita',
  other: 'Outros',
};

const URGENCY_LABEL: Record<Urgency, string> = {
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

  // Pega tenant_id do JWT (app_tenant_id)
  const { data: tenantRow, error: tenantErr } = await supabase.rpc('app_tenant_id');
  if (tenantErr || !tenantRow) {
    captureError(tenantErr ?? new Error('app_tenant_id retornou null'), {
      context: 'portal.suporte.createSupportTicket.tenant',
    });
    return { error: 'Sessão sem tenant — refaça login.' };
  }
  const tenantId = String(tenantRow);

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

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'Argho <noreply@argho.com.br>',
        to: SUPPORT_INBOX,
        subject: `[${URGENCY_LABEL[urgency]}] ${subject}`,
        html: `
          <h2>Novo chamado de suporte</h2>
          <p><strong>Distribuidor:</strong> ${user.email}</p>
          <p><strong>Categoria:</strong> ${CATEGORY_LABEL[category]}</p>
          <p><strong>Urgência:</strong> ${URGENCY_LABEL[urgency]}</p>
          ${productSlug ? `<p><strong>Produto:</strong> ${productSlug}</p>` : ''}
          <hr/>
          <h3>${escapeHtml(subject)}</h3>
          <pre style="white-space:pre-wrap;font-family:inherit;font-size:14px;line-height:1.5">${escapeHtml(body)}</pre>
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
