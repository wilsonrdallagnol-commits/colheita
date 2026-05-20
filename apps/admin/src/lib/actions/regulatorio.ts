// apps/admin/src/lib/actions/regulatorio.ts
'use server';

// Camada 9 (Compliance Regulatorio) — CRUD de regulatory_registrations.
//
// Antes: pagina /compliance era read-only. Pra adicionar registro MAPA/ANVISA
// novo, era preciso SQL direto no banco. Compliance B2B sem CRUD = bug critico
// pra cliente do agro.
//
// Cobertura:
//   createRegistro — novo registro (product + autoridade + numero + datas)
//   updateRegistro — edita campos
//   updateStatus — transicao explicita (active/expired/pending/revoked)
//   softDeleteRegistro — soft delete via status='revoked' (mantem audit trail)
//
// RLS: product_manager role pra escrever.

import { createServerClient, requireAuth } from '@colheita/auth';
import { captureError } from '@colheita/observability';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type RegistroFormState = {
  error?: string;
  fieldErrors?: Partial<
    Record<
      'product_id' | 'authority' | 'registration_no' | 'issued_at' | 'expires_at' | 'notes',
      string
    >
  >;
} | null;

const VALID_AUTHORITIES = ['MAPA', 'ANVISA', 'IBAMA', 'STATE', 'OTHER'] as const;
type Authority = (typeof VALID_AUTHORITIES)[number];

const VALID_STATUSES = ['active', 'expired', 'pending', 'revoked'] as const;
export type RegStatus = (typeof VALID_STATUSES)[number];

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseAuthority(raw: FormDataEntryValue | null): Authority | null {
  if (typeof raw !== 'string') return null;
  return (VALID_AUTHORITIES as readonly string[]).includes(raw) ? (raw as Authority) : null;
}

function parseStatus(raw: FormDataEntryValue | null): RegStatus | null {
  if (typeof raw !== 'string') return null;
  return (VALID_STATUSES as readonly string[]).includes(raw) ? (raw as RegStatus) : null;
}

function parseDate(raw: FormDataEntryValue | null): string | null | undefined {
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  // YYYY-MM-DD strict
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return undefined;
  const date = new Date(`${trimmed}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return undefined;
  return trimmed;
}

// ── createRegistro ────────────────────────────────────────────────────────────

export async function createRegistro(
  _prev: RegistroFormState,
  formData: FormData,
): Promise<RegistroFormState> {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const productId = String(formData.get('product_id') ?? '').trim();
  const authority = parseAuthority(formData.get('authority'));
  const registrationNo = String(formData.get('registration_no') ?? '').trim();
  const issuedAt = parseDate(formData.get('issued_at'));
  const expiresAt = parseDate(formData.get('expires_at'));
  const status = parseStatus(formData.get('status')) ?? 'active';
  const documentUrl = String(formData.get('document_url') ?? '').trim() || null;
  const notes = String(formData.get('notes') ?? '').trim() || null;

  if (!productId) return { fieldErrors: { product_id: 'Selecione um produto.' } };
  if (!authority) return { fieldErrors: { authority: 'Autoridade inválida.' } };
  if (!registrationNo)
    return { fieldErrors: { registration_no: 'Número do registro é obrigatório.' } };
  if (registrationNo.length > 100)
    return { fieldErrors: { registration_no: 'Máximo 100 caracteres.' } };
  if (issuedAt === undefined)
    return { fieldErrors: { issued_at: 'Data inválida (use YYYY-MM-DD).' } };
  if (expiresAt === undefined)
    return { fieldErrors: { expires_at: 'Data inválida (use YYYY-MM-DD).' } };

  // tenant_id resolvido via sessao
  const { data: userRow } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle();
  const tenantId = userRow?.tenant_id as string | undefined;
  if (!tenantId) return { error: 'Tenant não resolvido na sessão. Refaça login.' };

  // Verifica que o produto existe e pertence ao tenant (defesa contra forjamento)
  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('id', productId)
    .is('deleted_at', null)
    .maybeSingle();
  if (!product) return { fieldErrors: { product_id: 'Produto não encontrado.' } };

  const { data: created, error } = await supabase
    .from('regulatory_registrations')
    .insert({
      tenant_id: tenantId,
      product_id: productId,
      authority,
      registration_no: registrationNo,
      issued_at: issuedAt,
      expires_at: expiresAt,
      status,
      document_url: documentUrl,
      notes,
    })
    .select('id')
    .single();

  if (error || !created) {
    captureError(error ?? new Error('insert returned no data'), {
      context: 'admin.regulatorio.create',
      authority,
    });
    return { error: 'Erro ao criar registro. Tente novamente.' };
  }

  revalidatePath('/compliance');
  redirect('/compliance');
}

// ── updateRegistro ────────────────────────────────────────────────────────────

export async function updateRegistro(
  id: string,
  _prev: RegistroFormState,
  formData: FormData,
): Promise<RegistroFormState> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const authority = parseAuthority(formData.get('authority'));
  const registrationNo = String(formData.get('registration_no') ?? '').trim();
  const issuedAt = parseDate(formData.get('issued_at'));
  const expiresAt = parseDate(formData.get('expires_at'));
  const status = parseStatus(formData.get('status'));
  const documentUrl = String(formData.get('document_url') ?? '').trim() || null;
  const notes = String(formData.get('notes') ?? '').trim() || null;

  if (!authority) return { fieldErrors: { authority: 'Autoridade inválida.' } };
  if (!registrationNo) return { fieldErrors: { registration_no: 'Número é obrigatório.' } };
  if (!status) return { error: 'Status inválido.' };
  if (issuedAt === undefined) return { fieldErrors: { issued_at: 'Data inválida.' } };
  if (expiresAt === undefined) return { fieldErrors: { expires_at: 'Data inválida.' } };

  const { error } = await supabase
    .from('regulatory_registrations')
    .update({
      authority,
      registration_no: registrationNo,
      issued_at: issuedAt,
      expires_at: expiresAt,
      status,
      document_url: documentUrl,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    captureError(error, { context: 'admin.regulatorio.update', id });
    return { error: 'Erro ao salvar registro.' };
  }

  revalidatePath('/compliance');
  revalidatePath(`/compliance/${id}/editar`);
  redirect('/compliance');
}

// ── updateRegistroStatus ──────────────────────────────────────────────────────
//
// Transicao explicita de status (botoes de acao na lista, sem abrir o form).

export async function updateRegistroStatus(
  id: string,
  newStatus: RegStatus,
): Promise<{ error?: string }> {
  if (!(VALID_STATUSES as readonly string[]).includes(newStatus)) {
    return { error: 'Status inválido.' };
  }

  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase
    .from('regulatory_registrations')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    captureError(error, { context: 'admin.regulatorio.updateStatus', id, newStatus });
    return { error: 'Erro ao alterar status.' };
  }

  revalidatePath('/compliance');
  return {};
}

// ── softDeleteRegistro ────────────────────────────────────────────────────────
//
// Nao temos coluna deleted_at em regulatory_registrations (auditoria
// regulatoria exige trail imutavel). Soft delete = status='revoked'.

export async function softDeleteRegistro(id: string): Promise<{ error?: string }> {
  return updateRegistroStatus(id, 'revoked');
}
