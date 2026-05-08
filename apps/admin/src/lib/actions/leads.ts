// apps/admin/src/lib/actions/leads.ts
'use server';

// Camada 7 (CRM) — server actions de leads.
//
// Cobertura:
//   createLead — captura inicial (status=novo)
//   updateLead — edicao livre de campos (mantem status atual)
//   changeStatus — transicao explicita no pipeline (com timestamps)
//   softDeleteLead — marca deleted_at (RLS continua filtrando)
//
// Padrao consistente com lib/actions/produtos.ts: ProdutoFormState shape,
// fieldErrors granular, redirect via revalidatePath.

import { createServerClient, requireAuth } from '@colheita/auth';
import { captureError } from '@colheita/observability';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type LeadFormState = {
  error?: string;
  fieldErrors?: Partial<
    Record<
      | 'name'
      | 'company'
      | 'email'
      | 'phone'
      | 'cpf_cnpj'
      | 'source'
      | 'state'
      | 'city'
      | 'cultura'
      | 'area_hectares'
      | 'notes'
      | 'next_followup_at',
      string
    >
  >;
} | null;

const VALID_SOURCES = [
  'website',
  'whatsapp',
  'evento',
  'indicacao',
  'cold-outreach',
  'distribuidor',
  'feira',
  'other',
] as const;
type LeadSource = (typeof VALID_SOURCES)[number];

const VALID_STATUSES = ['novo', 'qualificado', 'proposta', 'ganho', 'perdido'] as const;
export type LeadStatus = (typeof VALID_STATUSES)[number];

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseSource(raw: FormDataEntryValue | null): LeadSource | null {
  if (typeof raw !== 'string') return null;
  return (VALID_SOURCES as readonly string[]).includes(raw) ? (raw as LeadSource) : null;
}

function parseState(raw: FormDataEntryValue | null): string | null | undefined {
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim().toUpperCase();
  if (trimmed === '') return null;
  if (!/^[A-Z]{2}$/.test(trimmed)) return undefined;
  return trimmed;
}

function parseAreaHectares(raw: FormDataEntryValue | null): number | null | undefined {
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const num = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(num) || num < 0) return undefined;
  return num;
}

function parseDateTime(raw: FormDataEntryValue | null): string | null | undefined {
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

// ── createLead ────────────────────────────────────────────────────────────────

export async function createLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { fieldErrors: { name: 'Nome é obrigatório.' } };
  if (name.length > 200) return { fieldErrors: { name: 'Máximo 200 caracteres.' } };

  const email = String(formData.get('email') ?? '').trim();
  if (email && !EMAIL_REGEX.test(email)) {
    return { fieldErrors: { email: 'Email inválido.' } };
  }

  const source = parseSource(formData.get('source')) ?? 'other';
  const state = parseState(formData.get('state'));
  if (state === undefined) return { fieldErrors: { state: 'Use UF de 2 letras (ex: MT).' } };

  const areaHectares = parseAreaHectares(formData.get('area_hectares'));
  if (areaHectares === undefined) {
    return { fieldErrors: { area_hectares: 'Número inválido. Use ponto ou vírgula.' } };
  }

  const followup = parseDateTime(formData.get('next_followup_at'));
  if (followup === undefined) {
    return { fieldErrors: { next_followup_at: 'Data inválida.' } };
  }

  // Resolve tenant_id pela sessao (RLS exige tenant_id no insert)
  const { data: userRow } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle();
  const tenantId = userRow?.tenant_id as string | undefined;
  if (!tenantId) {
    return { error: 'Tenant não resolvido na sessão. Refaça login.' };
  }

  const insertPayload: Record<string, unknown> = {
    tenant_id: tenantId,
    name,
    company: String(formData.get('company') ?? '').trim() || null,
    email: email || null,
    phone: String(formData.get('phone') ?? '').trim() || null,
    cpf_cnpj: String(formData.get('cpf_cnpj') ?? '').trim() || null,
    source,
    state,
    city: String(formData.get('city') ?? '').trim() || null,
    cultura: String(formData.get('cultura') ?? '').trim() || null,
    area_hectares: areaHectares,
    notes: String(formData.get('notes') ?? '').trim() || null,
    next_followup_at: followup,
    created_by: user.id,
  };

  const { data: created, error } = await supabase
    .from('leads')
    .insert(insertPayload)
    .select('id')
    .single();

  if (error || !created) {
    captureError(error ?? new Error('lead insert returned no data'), {
      context: 'admin.leads.create',
    });
    return { error: 'Erro ao criar lead. Tente novamente.' };
  }

  revalidatePath('/leads');
  redirect(`/leads/${created.id}`);
}

// ── updateLead ────────────────────────────────────────────────────────────────

export async function updateLead(
  id: string,
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { fieldErrors: { name: 'Nome é obrigatório.' } };

  const email = String(formData.get('email') ?? '').trim();
  if (email && !EMAIL_REGEX.test(email)) {
    return { fieldErrors: { email: 'Email inválido.' } };
  }

  const source = parseSource(formData.get('source')) ?? 'other';
  const state = parseState(formData.get('state'));
  if (state === undefined) return { fieldErrors: { state: 'Use UF de 2 letras.' } };

  const areaHectares = parseAreaHectares(formData.get('area_hectares'));
  if (areaHectares === undefined) {
    return { fieldErrors: { area_hectares: 'Número inválido.' } };
  }

  const followup = parseDateTime(formData.get('next_followup_at'));
  if (followup === undefined) return { fieldErrors: { next_followup_at: 'Data inválida.' } };

  const updatePayload: Record<string, unknown> = {
    name,
    company: String(formData.get('company') ?? '').trim() || null,
    email: email || null,
    phone: String(formData.get('phone') ?? '').trim() || null,
    cpf_cnpj: String(formData.get('cpf_cnpj') ?? '').trim() || null,
    source,
    state,
    city: String(formData.get('city') ?? '').trim() || null,
    cultura: String(formData.get('cultura') ?? '').trim() || null,
    area_hectares: areaHectares,
    notes: String(formData.get('notes') ?? '').trim() || null,
    next_followup_at: followup,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('leads')
    .update(updatePayload)
    .eq('id', id)
    .is('deleted_at', null);

  if (error) {
    captureError(error, { context: 'admin.leads.update', leadId: id });
    return { error: 'Erro ao salvar lead.' };
  }

  revalidatePath('/leads');
  revalidatePath(`/leads/${id}`);
  redirect(`/leads/${id}`);
}

// ── changeStatus ──────────────────────────────────────────────────────────────
//
// Transicao explicita no pipeline. Marca timestamp correspondente
// (qualified_at / proposal_sent_at / closed_at) automaticamente.
// Se vai pra 'perdido', exige lostReason via formData.

export async function changeLeadStatus(
  id: string,
  newStatus: LeadStatus,
  lostReason?: string,
): Promise<{ error?: string }> {
  if (!(VALID_STATUSES as readonly string[]).includes(newStatus)) {
    return { error: 'Status inválido.' };
  }

  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const now = new Date().toISOString();
  const update: Record<string, unknown> = {
    status: newStatus,
    updated_at: now,
  };

  // Timestamps progressivos — uma vez setados ficam (audit trail).
  if (newStatus === 'qualificado') update.qualified_at = now;
  if (newStatus === 'proposta') update.proposal_sent_at = now;
  if (newStatus === 'ganho' || newStatus === 'perdido') update.closed_at = now;
  if (newStatus === 'perdido') {
    update.lost_reason = (lostReason ?? '').trim() || 'Não informado';
  } else {
    // Se voltar de perdido pra outro status, limpa razao
    update.lost_reason = null;
  }

  const { error } = await supabase.from('leads').update(update).eq('id', id).is('deleted_at', null);

  if (error) {
    captureError(error, { context: 'admin.leads.changeStatus', leadId: id, newStatus });
    return { error: 'Erro ao alterar status.' };
  }

  revalidatePath('/leads');
  revalidatePath(`/leads/${id}`);
  return {};
}

// ── softDeleteLead ────────────────────────────────────────────────────────────

export async function softDeleteLead(id: string): Promise<{ error?: string }> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase
    .from('leads')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null);

  if (error) {
    captureError(error, { context: 'admin.leads.softDelete', leadId: id });
    return { error: 'Erro ao excluir lead.' };
  }

  revalidatePath('/leads');
  return {};
}

// ── createLeadActivity ───────────────────────────────────────────────────────
//
// Camada 7 mov 2 — append-only timeline. Cada activity vira historico imutavel.

const VALID_ACTIVITY_KINDS = ['call', 'email', 'whatsapp', 'meeting', 'note', 'other'] as const;
export type LeadActivityKind = (typeof VALID_ACTIVITY_KINDS)[number];

export type CreateActivityState = {
  error?: string;
  fieldErrors?: { kind?: string; body?: string };
} | null;

export async function createLeadActivity(
  leadId: string,
  _prev: CreateActivityState,
  formData: FormData,
): Promise<CreateActivityState> {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const kindRaw = formData.get('kind');
  const bodyRaw = formData.get('body');

  const kind =
    typeof kindRaw === 'string' && (VALID_ACTIVITY_KINDS as readonly string[]).includes(kindRaw)
      ? (kindRaw as LeadActivityKind)
      : null;
  if (!kind) return { fieldErrors: { kind: 'Tipo de atividade inválido.' } };

  const body = typeof bodyRaw === 'string' ? bodyRaw.trim() : '';
  if (body.length === 0) return { fieldErrors: { body: 'Descreva a atividade.' } };
  if (body.length > 5000) {
    return { fieldErrors: { body: 'Máximo 5000 caracteres.' } };
  }

  // Resolve tenant_id da sessao pra preencher RLS check
  const { data: userRow } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle();
  const tenantId = userRow?.tenant_id as string | undefined;
  if (!tenantId) return { error: 'Sessão sem tenant. Refaça login.' };

  const { error } = await supabase.from('lead_activities').insert({
    tenant_id: tenantId,
    lead_id: leadId,
    kind,
    body,
    created_by: user.id,
  });

  if (error) {
    captureError(error, { context: 'admin.leads.createActivity', leadId });
    return { error: 'Erro ao registrar atividade.' };
  }

  revalidatePath(`/leads/${leadId}`);
  return {};
}
