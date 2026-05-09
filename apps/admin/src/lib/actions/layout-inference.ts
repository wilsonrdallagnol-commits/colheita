// apps/admin/src/lib/actions/layout-inference.ts
'use server';

// Camada 5 — Layout Inference Engine.
//
// Pipeline completo do upload ate o blueprint persistido:
//   1. Upload imagem -> Supabase Storage (bucket assets)
//   2. INSERT em assets (DAM versionado)
//   3. INSERT em layout_references (metadados editoriais)
//   4. analyzeLayout() -> Claude Sonnet 4.5 vision -> blueprint
//   5. INSERT em layout_blueprints (blueprint estruturado + metricas)
//
// Cada step trata erro e faz rollback sensato (asset/reference orfaos sao
// limpos pra nao acumular lixo no DAM).

import crypto from 'node:crypto';
import path from 'node:path';
import { createAdminClient, createServerClient, requireAuth } from '@colheita/auth';
import {
  generateFromRenderSpec,
  generatePngFromRenderSpec,
  type PngPreset,
} from '@colheita/generator';
import {
  analyzeLayout,
  type ContentBindings,
  compileBlueprint,
  type LayoutBlueprint,
} from '@colheita/layout-inference';
import { captureError } from '@colheita/observability';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// Limite editorial — referencias > 8MB sao arquivos com metadado pesado
// (dpi alto, layers PSD exportados). Geralmente compactaveis com ganho zero.
const MAX_FILE_BYTES = 8 * 1024 * 1024;

const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'application/pdf']);

export interface AnalyzeResult {
  ok: true;
  referenceId: string;
  blueprintId: string;
  durationMs: number;
  costUsd: number;
}

export interface AnalyzeError {
  ok: false;
  error: string;
}

export type AnalyzeResponse = AnalyzeResult | AnalyzeError;

export async function uploadAndAnalyze(formData: FormData): Promise<AnalyzeResponse> {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);
  const admin = createAdminClient();

  // ── 1. Validacao do upload ──────────────────────────────────────────────
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false, error: 'Arquivo não enviado.' };
  }
  if (file.size === 0) {
    return { ok: false, error: 'Arquivo vazio.' };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, error: `Arquivo excede ${MAX_FILE_BYTES / 1024 / 1024}MB.` };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return {
      ok: false,
      error: `Formato não suportado: ${file.type}. Use PNG, JPEG, WebP ou PDF.`,
    };
  }

  const titleRaw = formData.get('title');
  const title =
    typeof titleRaw === 'string' && titleRaw.trim() !== ''
      ? titleRaw.trim().slice(0, 120)
      : file.name.replace(/\.[^.]+$/, '').slice(0, 120);

  const sourceTypeRaw = formData.get('sourceType');
  const sourceType =
    typeof sourceTypeRaw === 'string' &&
    ['upload', 'url', 'historical', 'competitor', 'inspiration'].includes(sourceTypeRaw)
      ? sourceTypeRaw
      : 'upload';

  const intendedCategoryRaw = formData.get('intendedCategory');
  const intendedCategory =
    typeof intendedCategoryRaw === 'string' &&
    ['datasheet', 'banner', 'social_post', 'catalog', 'presentation', 'flyer', 'other'].includes(
      intendedCategoryRaw,
    )
      ? intendedCategoryRaw
      : null;

  // ── 2. Resolve tenant_id do usuario logado ──────────────────────────────
  const { data: userRow } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle();

  const tenantId = userRow?.tenant_id as string | undefined;
  if (!tenantId) {
    return { ok: false, error: 'Tenant não associado ao usuário.' };
  }

  // ── 3. Hash de conteudo + dedup check (A2 sha256) ───────────────────────
  const buffer = Buffer.from(await file.arrayBuffer());
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

  // Se o tenant ja subiu este arquivo, reusa o asset (dedup por conteudo)
  const { data: existingAsset } = await admin
    .from('assets')
    .select('id, storage_path, original_name')
    .eq('tenant_id', tenantId)
    .eq('sha256', sha256)
    .is('deleted_at', null)
    .maybeSingle();

  let assetId: string;
  let storagePath: string;

  if (existingAsset) {
    assetId = existingAsset.id as string;
    storagePath = existingAsset.storage_path as string;
  } else {
    const ext = (path.extname(file.name) || '').toLowerCase();
    const safeBase = path
      .basename(file.name, ext)
      .replace(/[^a-z0-9-_]/gi, '-')
      .slice(0, 60);
    storagePath = `${tenantId}/layout-references/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeBase}${ext}`;

    const { error: uploadErr } = await admin.storage.from('assets').upload(storagePath, buffer, {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000',
      upsert: false,
    });

    if (uploadErr) {
      captureError(uploadErr, { context: 'layout-inference.upload', mimeType: file.type });
      return { ok: false, error: 'Falha ao subir o arquivo. Tente novamente.' };
    }

    // ── 4. INSERT em assets (DAM) ────────────────────────────────────────────
    const assetType: 'image' | 'document' = file.type === 'application/pdf' ? 'document' : 'image';
    const { data: asset, error: assetErr } = await admin
      .from('assets')
      .insert({
        tenant_id: tenantId,
        filename: path.basename(storagePath),
        original_name: file.name,
        mime_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
        sha256,
        type: assetType,
        title,
        tags: ['layout-reference'],
        created_by: user.id,
      })
      .select('id')
      .single();

    if (assetErr || !asset) {
      captureError(assetErr ?? new Error('asset insert returned no data'), {
        context: 'layout-inference.assetInsert',
      });
      // Rollback storage
      await admin.storage
        .from('assets')
        .remove([storagePath])
        .catch(() => undefined);
      return { ok: false, error: 'Falha ao registrar mídia. Tente novamente.' };
    }
    assetId = asset.id as string;
  }

  // ── 5. INSERT em layout_references ──────────────────────────────────────
  const referenceInsert: Record<string, unknown> = {
    tenant_id: tenantId,
    asset_id: assetId,
    title,
    source_type: sourceType,
    tags: [],
    created_by: user.id,
  };
  if (intendedCategory) referenceInsert.intended_category = intendedCategory;

  const { data: reference, error: refErr } = await admin
    .from('layout_references')
    .insert(referenceInsert)
    .select('id')
    .single();

  if (refErr || !reference) {
    captureError(refErr ?? new Error('reference insert returned no data'), {
      context: 'layout-inference.referenceInsert',
    });
    // Rollback so do asset/storage se NAO foi reuso de dedup
    if (!existingAsset) {
      await admin.from('assets').delete().eq('id', assetId);
      await admin.storage
        .from('assets')
        .remove([storagePath])
        .catch(() => undefined);
    }
    return { ok: false, error: 'Falha ao registrar referência. Tente novamente.' };
  }

  // ── 6. URL publica pra passar pra Claude vision ─────────────────────────
  const { data: publicUrlData } = admin.storage.from('assets').getPublicUrl(storagePath);
  const publicUrl = publicUrlData.publicUrl;

  // ── 7. Vision analysis (com cost ceiling acumulado por tenant) ────────────
  // Soma cost_usd dos blueprints do tenant nas ultimas 24h.
  // Default ceiling: $20 USD/dia por tenant. Override via env LAYOUT_INFERENCE_DAILY_USD.
  const dailyCeiling = Number(process.env.LAYOUT_INFERENCE_DAILY_CEILING_USD ?? '20') || 20;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: usage } = await admin
    .from('layout_blueprints')
    .select('cost_usd')
    .eq('tenant_id', tenantId)
    .gte('created_at', since);
  const consumedCostUsd = (usage ?? []).reduce(
    (sum, row) => sum + Number((row as { cost_usd: number | null }).cost_usd ?? 0),
    0,
  );

  const startedAt = Date.now();
  const result = await analyzeLayout({
    input: { kind: 'url', url: publicUrl, mimeType: file.type },
    timeoutMs: 60_000,
    maxRetries: 2,
    maxCostUsd: dailyCeiling,
    consumedCostUsd,
  });

  if (!result.ok) {
    captureError(new Error(`vision analysis failed: ${result.error}`), {
      context: 'layout-inference.analyze',
      details: result.details,
    });
    // Nao limpa asset/reference — user pode ver e tentar reanalisar depois
    return {
      ok: false,
      error:
        result.error === 'invalid_blueprint'
          ? 'A análise voltou inválida. Tente outra imagem ou re-analise depois.'
          : result.error === 'timeout'
            ? 'A análise demorou demais. Tente de novo.'
            : result.error === 'cost_ceiling_exceeded'
              ? 'Limite de custo de análise atingido neste período.'
              : 'Falha ao analisar a imagem.',
    };
  }

  // ── 8. INSERT em layout_blueprints ──────────────────────────────────────
  const { data: blueprint, error: bpErr } = await admin
    .from('layout_blueprints')
    .insert({
      tenant_id: tenantId,
      reference_id: reference.id,
      version: 1,
      is_current: true,
      blueprint: result.blueprint as unknown as Record<string, unknown>,
      raw_analysis: { rawText: result.raw.rawText },
      status: 'draft',
      model_used: result.metrics.modelUsed,
      tokens_input: result.metrics.tokensInput,
      tokens_output: result.metrics.tokensOutput,
      duration_ms: result.metrics.durationMs,
      cost_usd: result.metrics.costUsd,
      created_by: user.id,
    })
    .select('id')
    .single();

  if (bpErr || !blueprint) {
    captureError(bpErr ?? new Error('blueprint insert returned no data'), {
      context: 'layout-inference.blueprintInsert',
    });
    return { ok: false, error: 'Análise feita mas falha ao salvar. Recarregue.' };
  }

  revalidatePath('/layout-inference');

  return {
    ok: true,
    referenceId: reference.id as string,
    blueprintId: blueprint.id as string,
    durationMs: Date.now() - startedAt,
    costUsd: result.metrics.costUsd,
  };
}

// ── Workflow de revisao ──────────────────────────────────────────────────────

type AllowedStatus = 'draft' | 'reviewed' | 'approved' | 'archived';

interface UpdateStatusResult {
  ok: boolean;
  error?: string;
}

/**
 * Muda o status do blueprint dentro do workflow de revisao.
 * Transicoes validas:
 *   draft → reviewed | archived
 *   reviewed → approved | draft | archived
 *   approved → archived
 *   archived → draft (re-abrir)
 */
export async function updateBlueprintStatus(
  blueprintId: string,
  nextStatus: AllowedStatus,
  notes?: string,
): Promise<UpdateStatusResult> {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  if (!['draft', 'reviewed', 'approved', 'archived'].includes(nextStatus)) {
    return { ok: false, error: 'Status inválido.' };
  }

  const updates: Record<string, unknown> = { status: nextStatus };
  if (nextStatus === 'reviewed' || nextStatus === 'approved') {
    updates.reviewed_by = user.id;
    updates.reviewed_at = new Date().toISOString();
    if (notes) updates.review_notes = notes.slice(0, 1000);
  }

  const { error } = await supabase.from('layout_blueprints').update(updates).eq('id', blueprintId);

  if (error) {
    captureError(error, {
      context: 'layout-inference.updateBlueprintStatus',
      nextStatus,
    });
    return { ok: false, error: 'Falha ao atualizar status.' };
  }

  revalidatePath('/layout-inference');
  revalidatePath(`/layout-inference/[id]`, 'page');
  return { ok: true };
}

// ── Bindings: atrelar produto/conteudo a regions do blueprint ─────────────────

interface SaveBindingsResult {
  ok: boolean;
  error?: string;
}

/**
 * Salva os bindings (produto/conteudo por region) num blueprint.
 * Persiste em layout_blueprints.bindings (jsonb) — coluna nao existe ainda
 * na migration 0006, vamos usar raw_analysis.bindings como fallback enquanto
 * nao adicionamos a coluna.
 *
 * v1: aceita bindings na shape { regionId: { kind, ...payload } }
 * Validation: kind compativel com region.type (mesma logica do compileBlueprint)
 */
export async function saveBlueprintBindings(
  blueprintId: string,
  bindings: ContentBindings,
): Promise<SaveBindingsResult> {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const admin = createAdminClient();

  const { error } = await admin
    .from('layout_blueprints')
    .update({
      raw_analysis: { bindings },
    })
    .eq('id', blueprintId);

  if (error) {
    captureError(error, { context: 'layout-inference.saveBindings' });
    return { ok: false, error: 'Falha ao salvar bindings.' };
  }

  revalidatePath('/layout-inference');
  return { ok: true };
}

// ── Re-analyze: roda Claude vision novamente, cria nova versao ────────────────

interface ReAnalyzeResult {
  ok: true;
  blueprintId: string;
  version: number;
  costUsd: number;
}

interface ReAnalyzeError {
  ok: false;
  error: string;
}

export type ReAnalyzeResponse = ReAnalyzeResult | ReAnalyzeError;

/**
 * Re-roda a analise vision na referencia. Marca o blueprint atual como
 * is_current=false e cria um novo com version=N+1 e is_current=true.
 *
 * Util quando:
 *  - Modelo melhorou (nova versao do prompt)
 *  - Primeiro blueprint saiu invalido/incompleto
 *  - User quer comparar interpretacoes diferentes
 */
export async function reAnalyzeBlueprint(referenceId: string): Promise<ReAnalyzeResponse> {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);
  const admin = createAdminClient();

  // 1. Carrega reference + asset + blueprint atual
  const { data: refRow } = await supabase
    .from('layout_references')
    .select(
      `id, tenant_id, asset:assets!inner(storage_path, mime_type),
       blueprints:layout_blueprints(version, is_current)`,
    )
    .eq('id', referenceId)
    .is('deleted_at', null)
    .maybeSingle();

  if (!refRow) {
    return { ok: false, error: 'Referência não encontrada.' };
  }

  const tenantId = refRow.tenant_id as string;
  const asset = Array.isArray(refRow.asset) ? refRow.asset[0] : refRow.asset;
  const blueprintsList = (refRow.blueprints ?? []) as Array<{
    version: number;
    is_current: boolean;
  }>;

  if (!asset?.storage_path || !asset.mime_type) {
    return { ok: false, error: 'Asset da referência indisponível.' };
  }

  const maxVersion = blueprintsList.reduce((max, b) => Math.max(max, b.version ?? 0), 0);
  const currentBlueprint = blueprintsList.find((b) => b.is_current);

  // 2. URL publica
  const { data: publicUrlData } = admin.storage
    .from('assets')
    .getPublicUrl(asset.storage_path as string);
  const publicUrl = publicUrlData.publicUrl;

  // 3. Vision analysis com cost ceiling acumulado tenant
  const dailyCeiling = Number(process.env.LAYOUT_INFERENCE_DAILY_CEILING_USD ?? '20') || 20;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: usage } = await admin
    .from('layout_blueprints')
    .select('cost_usd')
    .eq('tenant_id', tenantId)
    .gte('created_at', since);
  const consumedCostUsd = (usage ?? []).reduce(
    (sum, row) => sum + Number((row as { cost_usd: number | null }).cost_usd ?? 0),
    0,
  );

  const result = await analyzeLayout({
    input: { kind: 'url', url: publicUrl, mimeType: asset.mime_type as string },
    timeoutMs: 60_000,
    maxRetries: 2,
    maxCostUsd: dailyCeiling,
    consumedCostUsd,
  });

  if (!result.ok) {
    captureError(new Error(`re-analyze failed: ${result.error}`), {
      context: 'layout-inference.reAnalyze',
      details: result.details,
    });
    return {
      ok: false,
      error:
        result.error === 'invalid_blueprint'
          ? 'A análise voltou inválida.'
          : result.error === 'timeout'
            ? 'A análise demorou demais.'
            : 'Falha ao analisar.',
    };
  }

  // 4. Marca blueprint atual como is_current=false (UNIQUE index garante 1 current/ref)
  if (currentBlueprint) {
    await admin
      .from('layout_blueprints')
      .update({ is_current: false })
      .eq('reference_id', referenceId)
      .eq('is_current', true);
  }

  // 5. INSERT novo blueprint com version+1
  const newVersion = maxVersion + 1;
  const { data: blueprint, error: bpErr } = await admin
    .from('layout_blueprints')
    .insert({
      tenant_id: tenantId,
      reference_id: referenceId,
      version: newVersion,
      is_current: true,
      blueprint: result.blueprint as unknown as Record<string, unknown>,
      raw_analysis: { rawText: result.raw.rawText },
      status: 'draft',
      model_used: result.metrics.modelUsed,
      tokens_input: result.metrics.tokensInput,
      tokens_output: result.metrics.tokensOutput,
      duration_ms: result.metrics.durationMs,
      cost_usd: result.metrics.costUsd,
      created_by: user.id,
    })
    .select('id')
    .single();

  if (bpErr || !blueprint) {
    captureError(bpErr ?? new Error('blueprint insert returned no data'), {
      context: 'layout-inference.reAnalyze.insert',
    });
    return { ok: false, error: 'Análise feita mas falha ao salvar nova versão.' };
  }

  revalidatePath('/layout-inference');
  revalidatePath(`/layout-inference/${referenceId}`);

  return {
    ok: true,
    blueprintId: blueprint.id as string,
    version: newVersion,
    costUsd: result.metrics.costUsd,
  };
}

// ── Render real: blueprint + theme Argho → PDF ───────────────────────────────

interface RenderResult {
  ok: true;
  materialId: string;
  pdfUrl: string;
  durationMs: number;
}

interface RenderError {
  ok: false;
  error: string;
}

export type RenderResponse = RenderResult | RenderError;

/**
 * Renderiza um blueprint com a identidade visual Argho.
 *
 * Pipeline:
 *  1. Carrega blueprint + reference + tenant
 *  2. compileBlueprint(blueprint, themeArgho, bindings='auto') → RenderSpec
 *  3. generateFromRenderSpec(spec) → PDF buffer (Playwright)
 *  4. Upload PDF pra Storage
 *  5. INSERT em generated_materials (linkado ao blueprint via input_data)
 *
 * v1: bindings sempre 'auto' (componentes do @colheita/ui usam fallbacks).
 * Sprint futura: editor de bindings (atrelar produtos do PIM a regiões).
 */
export async function renderBlueprintWithArgho(blueprintId: string): Promise<RenderResponse> {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);
  const admin = createAdminClient();

  // 1. Carrega blueprint + tenant
  const { data: bpRow, error: bpErr } = await supabase
    .from('layout_blueprints')
    .select(
      `id, tenant_id, blueprint, raw_analysis, version,
       reference:layout_references!inner(id, title, intended_category),
       tenant:tenants!inner(id, name, slug, theme_tokens, logo_url)`,
    )
    .eq('id', blueprintId)
    .maybeSingle();

  if (bpErr || !bpRow) {
    captureError(bpErr ?? new Error('blueprint not found'), {
      context: 'layout-inference.render.fetchBlueprint',
    });
    return { ok: false, error: 'Blueprint não encontrado.' };
  }

  const blueprint = bpRow.blueprint as unknown as LayoutBlueprint;
  const tenantId = bpRow.tenant_id as string;
  const reference = Array.isArray(bpRow.reference) ? bpRow.reference[0] : bpRow.reference;
  const tenant = Array.isArray(bpRow.tenant) ? bpRow.tenant[0] : bpRow.tenant;

  if (!reference || !tenant) {
    return { ok: false, error: 'Dados de referência ou tenant ausentes.' };
  }

  // 2. Compile com tema Argho
  // Hash do blueprint pra audit trail de reproducibilidade
  const blueprintHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(blueprint))
    .digest('hex')
    .slice(0, 16);

  // Bindings: prefere os salvos pelo editor (raw_analysis.bindings), fallback
  // pra 'auto' em todas regions. Bindings ausentes pra regions especificas
  // tambem caem em 'auto' (componentes do @colheita/ui aplicam fallbacks).
  const savedBindings =
    (bpRow.raw_analysis as { bindings?: ContentBindings } | null)?.bindings ?? {};
  const bindings: ContentBindings = {};
  for (const region of blueprint.regions) {
    bindings[region.id] = savedBindings[region.id] ?? { kind: 'auto' };
  }

  const compileResult = compileBlueprint({
    blueprint,
    theme: {
      tenantId,
      tokensVersion: '1',
      themeRef: tenant.slug as string,
    },
    bindings,
    blueprintHash,
  });

  if (!compileResult.ok) {
    captureError(new Error(`compile failed: ${compileResult.errors.length} errors`), {
      context: 'layout-inference.render.compile',
      errors: compileResult.errors,
    });
    return {
      ok: false,
      error: `Compile falhou: ${compileResult.errors[0]?.details ?? 'erro desconhecido'}`,
    };
  }

  // 3. Tema visual passado pros compiler blocks (CompilerTheme)
  // Tokens Argho oficiais (alinhados com globals.css):
  //   --colheita-brand-primary: #183090 (Argho blue)
  //   --colheita-brand-secondary: #489030 (Argho green)
  const tenantThemeTokens = tenant.theme_tokens as {
    brandColor?: string;
    accentColor?: string;
  } | null;
  const compilerTheme = {
    brandColor: tenantThemeTokens?.brandColor ?? '#183090',
    accentColor: tenantThemeTokens?.accentColor ?? '#489030',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    tenantName: (tenant.name as string) ?? 'Argho AgriSciences',
    logoUrl: (tenant.logo_url as string | null) ?? undefined,
  };

  // 4. Render PDF via Playwright
  const startedAt = Date.now();
  let pdfBuffer: Buffer;
  try {
    const result = await generateFromRenderSpec(compileResult.spec, {
      compilerTheme,
      title: `${reference.title} — ${tenant.name}`,
      format: blueprint.format?.orientation === 'landscape' ? 'A4' : 'A4',
      landscape: blueprint.format?.orientation === 'landscape',
    });
    pdfBuffer = result.pdf;
  } catch (err) {
    captureError(err instanceof Error ? err : new Error(String(err)), {
      context: 'layout-inference.render.playwright',
    });
    return { ok: false, error: 'Falha no render do PDF (Playwright).' };
  }

  const durationMs = Date.now() - startedAt;

  // 5. Upload PDF pra Storage
  const slug = (reference.title as string)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .slice(0, 60)
    .replace(/^-+|-+$/g, '');
  const pdfFilename = `${Date.now()}-${slug}-v${bpRow.version ?? 1}.pdf`;
  const pdfPath = `${tenantId}/layout-inference-renders/${pdfFilename}`;

  const { error: uploadErr } = await admin.storage.from('assets').upload(pdfPath, pdfBuffer, {
    contentType: 'application/pdf',
    cacheControl: 'public, max-age=31536000',
    upsert: false,
  });

  if (uploadErr) {
    captureError(uploadErr, { context: 'layout-inference.render.upload' });
    return { ok: false, error: 'Falha ao salvar PDF no storage.' };
  }

  const { data: publicUrlData } = admin.storage.from('assets').getPublicUrl(pdfPath);
  const pdfUrl = publicUrlData.publicUrl;

  // 6. INSERT em generated_materials
  // Resolve template_id pra 'render-spec-generic' (criar se nao existir? Por
  // enquanto, busca por slug). Se nao houver, deixa null.
  const { data: tmpl } = await admin
    .from('material_templates')
    .select('id')
    .eq('slug', 'layout-inference-render')
    .maybeSingle();

  const generatedInsert: Record<string, unknown> = {
    tenant_id: tenantId,
    template_id: tmpl?.id ?? null,
    output_url: pdfUrl,
    output_storage_path: pdfPath,
    pages: 1,
    duration_ms: durationMs,
    input_data: {
      blueprint_id: blueprintId,
      blueprint_hash: blueprintHash,
      reference_id: reference.id,
      reference_title: reference.title,
      blueprint_version: bpRow.version,
    },
    product_ids: [],
    generated_by: user.id,
  };

  const { data: material, error: matErr } = await admin
    .from('generated_materials')
    .insert(generatedInsert)
    .select('id')
    .single();

  if (matErr || !material) {
    captureError(matErr ?? new Error('material insert returned no data'), {
      context: 'layout-inference.render.materialInsert',
    });
    // PDF ja foi salvo — registra warning mas nao falha
    return {
      ok: true,
      materialId: '',
      pdfUrl,
      durationMs,
    };
  }

  revalidatePath('/layout-inference');
  revalidatePath(`/layout-inference/${reference.id}`);
  revalidatePath('/materiais/historico');

  return {
    ok: true,
    materialId: material.id as string,
    pdfUrl,
    durationMs,
  };
}

// ── PNG render multi-format (social) ─────────────────────────────────────────

interface PngRenderResult {
  ok: true;
  materialId: string;
  pngUrl: string;
  preset: PngPreset;
  durationMs: number;
}

interface PngRenderError {
  ok: false;
  error: string;
}

export type PngRenderResponse = PngRenderResult | PngRenderError;

/**
 * Renderiza um blueprint como PNG retina pra redes sociais.
 * Mesmo pipeline do PDF mas com viewport configurável e renderToPng.
 */
export async function renderBlueprintAsPng(
  blueprintId: string,
  preset: PngPreset = 'social_landscape',
): Promise<PngRenderResponse> {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);
  const admin = createAdminClient();

  const { data: bpRow, error: bpErr } = await supabase
    .from('layout_blueprints')
    .select(
      `id, tenant_id, blueprint, version,
       reference:layout_references!inner(id, title, intended_category),
       tenant:tenants!inner(id, name, slug, theme_tokens, logo_url)`,
    )
    .eq('id', blueprintId)
    .maybeSingle();

  if (bpErr || !bpRow) {
    return { ok: false, error: 'Blueprint não encontrado.' };
  }

  const blueprint = bpRow.blueprint as unknown as LayoutBlueprint;
  const tenantId = bpRow.tenant_id as string;
  const reference = Array.isArray(bpRow.reference) ? bpRow.reference[0] : bpRow.reference;
  const tenant = Array.isArray(bpRow.tenant) ? bpRow.tenant[0] : bpRow.tenant;

  if (!reference || !tenant) {
    return { ok: false, error: 'Dados de referência ou tenant ausentes.' };
  }

  const blueprintHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(blueprint))
    .digest('hex')
    .slice(0, 16);

  const bindings: ContentBindings = {};
  for (const region of blueprint.regions) {
    bindings[region.id] = { kind: 'auto' };
  }

  const compileResult = compileBlueprint({
    blueprint,
    theme: { tenantId, tokensVersion: '1', themeRef: tenant.slug as string },
    bindings,
    blueprintHash,
  });

  if (!compileResult.ok) {
    return {
      ok: false,
      error: `Compile falhou: ${compileResult.errors[0]?.details ?? 'erro'}`,
    };
  }

  const tenantThemeTokens = tenant.theme_tokens as {
    brandColor?: string;
    accentColor?: string;
  } | null;
  const compilerTheme = {
    brandColor: tenantThemeTokens?.brandColor ?? '#183090',
    accentColor: tenantThemeTokens?.accentColor ?? '#489030',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    tenantName: (tenant.name as string) ?? 'Argho AgriSciences',
    logoUrl: (tenant.logo_url as string | null) ?? undefined,
  };

  const startedAt = Date.now();
  let pngBuffer: Buffer;
  try {
    const result = await generatePngFromRenderSpec(compileResult.spec, {
      compilerTheme,
      title: `${reference.title} — ${tenant.name}`,
      preset,
    });
    pngBuffer = result.png;
  } catch (err) {
    captureError(err instanceof Error ? err : new Error(String(err)), {
      context: 'layout-inference.renderPng.playwright',
      preset,
    });
    return { ok: false, error: 'Falha no render do PNG.' };
  }

  const durationMs = Date.now() - startedAt;

  const slug = (reference.title as string)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .slice(0, 60)
    .replace(/^-+|-+$/g, '');
  const pngFilename = `${Date.now()}-${slug}-v${bpRow.version ?? 1}-${preset}.png`;
  const pngPath = `${tenantId}/layout-inference-renders/${pngFilename}`;

  const { error: uploadErr } = await admin.storage.from('assets').upload(pngPath, pngBuffer, {
    contentType: 'image/png',
    cacheControl: 'public, max-age=31536000',
    upsert: false,
  });

  if (uploadErr) {
    captureError(uploadErr, { context: 'layout-inference.renderPng.upload', preset });
    return { ok: false, error: 'Falha ao salvar PNG no storage.' };
  }

  const { data: publicUrlData } = admin.storage.from('assets').getPublicUrl(pngPath);
  const pngUrl = publicUrlData.publicUrl;

  const { data: tmpl } = await admin
    .from('material_templates')
    .select('id')
    .eq('slug', 'layout-inference-render')
    .maybeSingle();

  const { data: material } = await admin
    .from('generated_materials')
    .insert({
      tenant_id: tenantId,
      template_id: tmpl?.id ?? null,
      output_url: pngUrl,
      output_storage_path: pngPath,
      pages: 1,
      duration_ms: durationMs,
      input_data: {
        blueprint_id: blueprintId,
        blueprint_hash: blueprintHash,
        reference_id: reference.id,
        reference_title: reference.title,
        blueprint_version: bpRow.version,
        format: 'png',
        preset,
      },
      product_ids: [],
      generated_by: user.id,
    })
    .select('id')
    .single();

  revalidatePath('/layout-inference');
  revalidatePath(`/layout-inference/${reference.id}`);

  return {
    ok: true,
    materialId: (material?.id as string) ?? '',
    pngUrl,
    preset,
    durationMs,
  };
}
