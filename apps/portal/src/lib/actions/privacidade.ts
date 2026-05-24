// apps/portal/src/lib/actions/privacidade.ts
//
// LGPD self-service:
//   - exportMyData: retorna JSON com todos os dados pessoais do user
//     (perfil + pedidos + progresso academia + tickets + conversas IA +
//     notificacoes). Streaming via Response Blob no client.
//   - requestAccountDeletion: cria support_ticket categoria=platform
//     urgency=high pra time Argho processar manualmente (LGPD exige
//     verificacao antes de deletar — nao podemos deletar direto pra
//     proteger contra account takeover).

'use server';

import { createServerClient, requireAuth } from '@colheita/auth';
import { captureError } from '@colheita/observability';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { buildRateLimiter, checkRateLimit } from '@/lib/rate-limit';
import { resolveTenantId } from '@/lib/tenant';

// Rate limit: 2 exports/h por user (9 selects em paralelo — protege DB)
const exportLimiter = buildRateLimiter({
  prefix: '@colheita/portal/exportMyData',
  limit: 2,
  window: '1 h',
});

// Rate limit: 1 solicitacao de delecao/h (limite generoso pq via humano de ticket)
const deletionLimiter = buildRateLimiter({
  prefix: '@colheita/portal/requestAccountDeletion',
  limit: 1,
  window: '1 h',
});

// ── exportMyData ─────────────────────────────────────────────────────────────

export type ExportDataState =
  | { error: string; success?: undefined; data?: undefined }
  | { success: true; data: string; error?: undefined }
  | null;

export async function exportMyData(
  _prev: ExportDataState,
  _formData: FormData,
): Promise<ExportDataState> {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Rate limit: 2/h por user (export agrega 9 selects + serializa JSON)
  const rl = await checkRateLimit(exportLimiter, `user:${user.id}`);
  if (!rl.ok) {
    return { error: 'Export já solicitado recentemente. Tente novamente em uma hora.' };
  }

  try {
    // Tudo em paralelo
    const [profile, prefs, orders, progress, certs, tickets, ticketMsgs, convs, notifs] =
      await Promise.all([
        supabase.auth.getUser().then((r) => ({
          id: r.data.user?.id,
          email: r.data.user?.email,
          created_at: r.data.user?.created_at,
          last_sign_in_at: r.data.user?.last_sign_in_at,
        })),
        supabase
          .from('users')
          .select('full_name, preferences, created_at, updated_at')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('orders')
          .select('id, numero, status, total_liquido, emitido_em, prazo_entrega')
          .eq('distribuidor_id', user.id),
        supabase
          .from('learning_progress')
          .select('lesson_id, status, started_at, updated_at')
          .eq('user_id', user.id),
        supabase
          .from('certifications')
          .select('certificate_no, track_id, status, issued_at, final_score')
          .eq('user_id', user.id),
        supabase
          .from('support_tickets')
          .select('id, subject, body, category, urgency, status, created_at')
          .eq('user_id', user.id),
        supabase
          .from('support_ticket_messages')
          .select('id, ticket_id, body, is_from_staff, created_at')
          .eq('author_id', user.id),
        supabase
          .from('conversation_logs')
          .select('id, query, answer, status, created_at, sources')
          .eq('user_id', user.id),
        supabase
          .from('notifications')
          .select('id, type, title, body, link, read_at, created_at')
          .eq('user_id', user.id),
      ]);

    const exportPayload = {
      _meta: {
        generated_at: new Date().toISOString(),
        scope: 'lgpd.self_service.export',
        note: 'Dados pessoais armazenados na Plataforma Colheita. Para solicitar exclusão, use o formulário em /conta/privacidade.',
      },
      account: profile,
      profile: prefs.data ?? null,
      orders: orders.data ?? [],
      academia_progress: progress.data ?? [],
      certifications: certs.data ?? [],
      support_tickets: tickets.data ?? [],
      support_ticket_messages: ticketMsgs.data ?? [],
      ai_conversations: convs.data ?? [],
      notifications: notifs.data ?? [],
    };

    return { success: true, data: JSON.stringify(exportPayload, null, 2) };
  } catch (err) {
    captureError(err, { context: 'portal.privacidade.exportMyData' });
    return { error: 'Erro ao gerar export. Tente novamente em alguns instantes.' };
  }
}

// ── requestAccountDeletion ───────────────────────────────────────────────────
// LGPD: nao deletamos direto. Criamos ticket pro time Argho processar
// manualmente (verifica identidade + checa FKs criticas em pedidos/certificações
// antes de anonimizar). Tempo de resposta SLA: 15 dias uteis (LGPD art 18).

export type DeleteRequestState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Partial<Record<'reason', string>>;
} | null;

export async function requestAccountDeletion(
  _prev: DeleteRequestState,
  formData: FormData,
): Promise<DeleteRequestState> {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Rate limit: 1/h por user (nao queremos spam de ticket LGPD)
  const rl = await checkRateLimit(deletionLimiter, `user:${user.id}`);
  if (!rl.ok) {
    return { error: 'Solicitação já registrada recentemente. Aguarde resposta do time Argho.' };
  }

  const reason = String(formData.get('reason') ?? '').trim();
  if (reason.length < 10) {
    return { fieldErrors: { reason: 'Descreva o motivo (mín 10 caracteres).' } };
  }
  if (reason.length > 1000) {
    return { fieldErrors: { reason: 'Motivo muito longo (máx 1000 caracteres).' } };
  }

  const tenantId = await resolveTenantId(
    supabase,
    'portal.privacidade.requestAccountDeletion.tenant',
  );
  if (!tenantId) return { error: 'Sessão sem tenant — refaça login.' };

  // FIX ALTO #7 (auditoria): emails RFC5321 podem ter ate 254 chars,
  // estourando o CHECK BETWEEN 4 AND 200 do support_tickets.subject.
  // Trunca defensivamente com slice.
  const rawSubject = `[LGPD] Solicitação de exclusão de conta · ${user.email ?? user.id}`;
  const subject = rawSubject.slice(0, 200);
  const body = `O distribuidor solicita exclusão da própria conta sob LGPD art 18 IV.

Motivo declarado:
${reason}

Email: ${user.email ?? '—'}
User ID: ${user.id}
Solicitado em: ${new Date().toISOString()}

SLA: 15 dias úteis para resposta (LGPD).
Procedimento: verificar identidade → checar FKs em orders/certifications → anonimizar (não hard-delete pra preservar histórico transacional).`;

  const { error: insertErr } = await supabase.from('support_tickets').insert({
    tenant_id: tenantId,
    user_id: user.id,
    subject,
    body,
    category: 'platform',
    urgency: 'high',
    context: { lgpd_request: 'deletion', requested_at: new Date().toISOString() },
  });

  if (insertErr) {
    captureError(insertErr, { context: 'portal.privacidade.requestAccountDeletion.insert' });
    return { error: 'Erro ao registrar solicitação. Tente novamente.' };
  }

  revalidatePath('/conta/privacidade');
  revalidatePath('/conta/suporte');
  return { success: true };
}
