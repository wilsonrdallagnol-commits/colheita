// apps/admin/src/app/(dashboard)/leads/[id]/proposta/route.ts
//
// Camada 7 mov 3 — gera Proposta Comercial PDF a partir do POST do form.
//
// POST /leads/[id]/proposta
//   Body: form data com items[] (productId + qty + unitPrice + dose + unit)
//        + paymentTerms + notes + discountPercent + validUntilLabel
//   Resposta: application/pdf (download direto)
//
// Side effects:
//   - Persiste em generated_materials (snapshot completo do input pra audit)
//   - Cria lead_activity kind='note' com link pro material
//   - Atualiza lead.status -> 'proposta' + lead.proposal_sent_at = now()
//   - Atualiza lead.next_followup_at = +7 dias se nao tiver follow-up no futuro

export const runtime = 'nodejs';

import { createServerClient, requireAuth } from '@colheita/auth';
import type { ProductComposition, ProductPackaging } from '@colheita/db';
import type { PropostaData, PropostaItem } from '@colheita/generator';
import { generateProposta } from '@colheita/generator';
import { captureError } from '@colheita/observability';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { recordGeneratedMaterial } from '@/lib/materiais';
import { buildRateLimiter, checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const MAX_ITEMS = 20;
const PDF_TIMEOUT_MS = 30_000;

// Rate limit: 5 propostas/min/user. Comercial num form com bug nao derruba host.
const propostaRateLimiter = buildRateLimiter({
  prefix: '@colheita/admin/proposta',
  limit: 5,
  window: '1 m',
});

/**
 * Executa fn com AbortController atado a um timeout. Quando vencer, sinaliza
 * abort — fn precisa propagar o signal pro Playwright pra fechar o browser
 * imediatamente. Sem isso, Promise continua rodando e processo Chromium vaza
 * RAM (~250MB/timeout) ate Vercel function morrer por OOM.
 */
async function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const result = await fn(ctrl.signal);
    if (ctrl.signal.aborted) {
      throw new Error(`${label} timeout after ${ms}ms`);
    }
    return result;
  } catch (err) {
    if (ctrl.signal.aborted) {
      throw new Error(`${label} timeout after ${ms}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

interface PostedItem {
  productId: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  dose: string;
}

function parsePostedItems(formData: FormData): PostedItem[] {
  // Form data esperado: items[0][productId], items[0][quantity], etc.
  // A4 fix: usa `continue` em vez de `break` quando productId vazio — items
  // intercalados (gaps no index após user remover linha do meio) sao aceitos.
  const items: PostedItem[] = [];
  for (let i = 0; i < MAX_ITEMS; i++) {
    const productId = formData.get(`items[${i}][productId]`);
    if (typeof productId !== 'string' || !productId) continue;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId))
      continue;

    const quantityRaw = formData.get(`items[${i}][quantity]`);
    const unitPriceRaw = formData.get(`items[${i}][unitPrice]`);
    const unitRaw = formData.get(`items[${i}][unit]`);
    const doseRaw = formData.get(`items[${i}][dose]`);

    const quantity = Number(typeof quantityRaw === 'string' ? quantityRaw.replace(',', '.') : '0');
    const unitPrice = Number(
      typeof unitPriceRaw === 'string' ? unitPriceRaw.replace(',', '.') : '0',
    );
    if (!Number.isFinite(quantity) || quantity <= 0) continue;
    // M3 fix 2026-05-09: rejeita price <= 0 (proposta com linha gratuita = bug).
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) continue;

    items.push({
      productId,
      quantity,
      unit: typeof unitRaw === 'string' ? unitRaw.trim() : 'un',
      unitPrice,
      dose: typeof doseRaw === 'string' ? doseRaw.trim() : '',
    });
  }
  return items;
}

function npkLabelFrom(composition: ProductComposition | undefined): string | undefined {
  if (!composition?.macros) return undefined;
  const m = composition.macros;
  if (m.N == null && m.P2O5 == null && m.K2O == null) return undefined;
  const fmt = (v: number | undefined): string => {
    if (v == null) return '00';
    return Number.isInteger(v) ? String(v).padStart(2, '0') : String(v);
  };
  return `${fmt(m.N)}-${fmt(m.P2O5)}-${fmt(m.K2O)}`;
}

function packagingLabelFrom(packaging: ProductPackaging | undefined): string | undefined {
  if (!packaging || packaging.length === 0) return undefined;
  const p = packaging[0];
  if (!p) return undefined;
  if (p.weightKg) return `${p.type} ${p.weightKg} kg`;
  if (p.volumeL) return `${p.type} ${p.volumeL} L`;
  return p.type;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id: leadId } = await params;
  const cookieStore = await cookies();

  let user: Awaited<ReturnType<typeof requireAuth>>;
  try {
    user = await requireAuth(cookieStore);
  } catch {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  // A3: Rate limit por user (Playwright = ~3-8s + ~250MB RAM por chamada).
  // Sem isso, comercial num form com bug derruba host pra todos os tenants.
  const rate = await checkRateLimit(propostaRateLimiter, `proposta:${user.id}`);
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'Limite de propostas excedido. Tente novamente em alguns minutos.' },
      { status: 429, headers: rateLimitHeaders(rate) },
    );
  }

  const supabase = createServerClient(cookieStore);

  // Parse form data
  const formData = await request.formData();
  const postedItems = parsePostedItems(formData);
  if (postedItems.length === 0) {
    return NextResponse.json({ error: 'Adicione pelo menos um item à proposta.' }, { status: 400 });
  }

  const discountRaw = formData.get('discountPercent');
  const discountPercent =
    typeof discountRaw === 'string' && discountRaw.trim() !== ''
      ? Math.max(0, Math.min(100, Number(discountRaw.replace(',', '.')) || 0))
      : undefined;
  const paymentTerms = String(formData.get('paymentTerms') ?? '').trim() || undefined;
  const notes = String(formData.get('notes') ?? '').trim() || undefined;
  const validUntilLabel = String(formData.get('validUntilLabel') ?? '').trim() || undefined;

  // Carrega lead + produtos selecionados + tenant em paralelo
  const productIds = postedItems.map((it) => it.productId);

  const [{ data: lead, error: leadErr }, { data: products }, { data: tenant }] = await Promise.all([
    supabase
      .from('leads')
      .select('id, name, company, cpf_cnpj, city, state, cultura, area_hectares, next_followup_at')
      .eq('id', leadId)
      .is('deleted_at', null)
      .maybeSingle(),
    supabase
      .from('products')
      .select(
        `id, name, tagline, composition, packaging,
         registrations:regulatory_registrations(registration_no)`,
      )
      .in('id', productIds)
      .is('deleted_at', null),
    supabase.from('tenants').select('name, logo_url').limit(1).maybeSingle(),
  ]);

  if (leadErr || !lead) {
    return NextResponse.json({ error: 'Lead não encontrado.' }, { status: 404 });
  }

  // Resolve produtos por id pra montar items completos
  const productsById = new Map(
    (products ?? []).map((p) => [p.id as string, p as Record<string, unknown>]),
  );

  const items: PropostaItem[] = [];
  for (const posted of postedItems) {
    const product = productsById.get(posted.productId);
    if (!product) continue;
    const composition = product.composition as ProductComposition | null;
    const packaging = product.packaging as ProductPackaging | null;
    const registrations = Array.isArray(product.registrations) ? product.registrations : [];
    const firstReg = registrations[0] as { registration_no?: string } | undefined;

    const item: PropostaItem = {
      productName: (product.name as string) ?? 'Produto',
      quantity: posted.quantity,
      unit: posted.unit,
      unitPrice: posted.unitPrice,
    };
    const tagline = product.tagline as string | null;
    if (tagline) item.tagline = tagline;
    const pkgLabel = packagingLabelFrom(packaging ?? undefined);
    if (pkgLabel) item.packaging = pkgLabel;
    if (posted.dose) item.dose = posted.dose;
    const npk = npkLabelFrom(composition ?? undefined);
    if (npk) item.npkLabel = npk;
    if (firstReg?.registration_no) item.mapaRegistration = firstReg.registration_no;

    items.push(item);
  }

  if (items.length === 0) {
    return NextResponse.json({ error: 'Nenhum produto válido na seleção.' }, { status: 400 });
  }

  // Numero da proposta — usa timestamp + leadId truncado pra unicidade
  const proposalNumber = `PROP-${new Date().getFullYear()}-${(lead.id as string).slice(0, 6).toUpperCase()}`;

  const tenantName = (tenant?.name as string | undefined) ?? 'Argho AgriSciences';

  const propostaInput: PropostaData = {
    tenantName,
    tenantLogoUrl: (tenant?.logo_url as string | null) ?? undefined,
    clientName: lead.name as string,
    clientCompany: (lead.company as string | null) ?? undefined,
    clientCpfCnpj: (lead.cpf_cnpj as string | null) ?? undefined,
    clientCity: (lead.city as string | null) ?? undefined,
    clientState: (lead.state as string | null) ?? undefined,
    cultura: (lead.cultura as string | null) ?? undefined,
    areaHectares: (lead.area_hectares as number | null) ?? undefined,
    items,
    discountPercent,
    paymentTerms,
    validUntilLabel,
    notes,
    proposalNumber,
    issuedAtLabel: new Date().toLocaleDateString('pt-BR'),
    salesPersonName: undefined,
    salesPersonEmail: undefined,
  };

  try {
    const startedAt = Date.now();
    const { pdf } = await withTimeout(
      (signal) => generateProposta(propostaInput, { signal }),
      PDF_TIMEOUT_MS,
      'generateProposta',
    );
    const durationMs = Date.now() - startedAt;

    // Persistencia em generated_materials
    await recordGeneratedMaterial({
      supabase,
      templateSlug: 'proposta-comercial',
      inputData: propostaInput as unknown as Record<string, unknown>,
      productIds,
      durationMs,
      pages: 1,
      generatedBy: user.id,
    });

    // Atualiza status do lead -> 'proposta' (idempotente — se ja era, marca timestamp novo)
    const now = new Date().toISOString();
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const followupNeeded =
      !lead.next_followup_at || new Date(lead.next_followup_at as string).getTime() < Date.now();

    await supabase
      .from('leads')
      .update({
        status: 'proposta',
        proposal_sent_at: now,
        next_followup_at: followupNeeded ? sevenDaysFromNow : lead.next_followup_at,
        updated_at: now,
      })
      .eq('id', leadId);

    // Activity registrando a proposta
    const { data: userRow } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .maybeSingle();
    const tenantId = userRow?.tenant_id as string | undefined;
    if (tenantId) {
      await supabase.from('lead_activities').insert({
        tenant_id: tenantId,
        lead_id: leadId,
        kind: 'note',
        body: `Proposta ${proposalNumber} gerada (${items.length} ${items.length === 1 ? 'item' : 'itens'}).`,
        metadata: { proposalNumber, itemsCount: items.length },
      });
    }

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="proposta-${proposalNumber}.pdf"`,
        'Content-Length': String(pdf.length),
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'erro desconhecido';
    captureError(err, { context: 'admin.lead.proposta', leadId, items: items.length });
    return NextResponse.json(
      {
        error: 'Erro ao gerar proposta.',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 503 },
    );
  }
}
