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
import { generateFromRenderSpec } from '@colheita/generator';
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

  // ── 3. Upload pra Storage (bucket assets) ───────────────────────────────
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = (path.extname(file.name) || '').toLowerCase();
  const safeBase = path
    .basename(file.name, ext)
    .replace(/[^a-z0-9-_]/gi, '-')
    .slice(0, 60);
  const storagePath = `${tenantId}/layout-references/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeBase}${ext}`;

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

  // ── 5. INSERT em layout_references ──────────────────────────────────────
  const referenceInsert: Record<string, unknown> = {
    tenant_id: tenantId,
    asset_id: asset.id,
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
    // Rollback storage + asset
    await admin.from('assets').delete().eq('id', asset.id);
    await admin.storage
      .from('assets')
      .remove([storagePath])
      .catch(() => undefined);
    return { ok: false, error: 'Falha ao registrar referência. Tente novamente.' };
  }

  // ── 6. URL publica pra passar pra Claude vision ─────────────────────────
  const { data: publicUrlData } = admin.storage.from('assets').getPublicUrl(storagePath);
  const publicUrl = publicUrlData.publicUrl;

  // ── 7. Vision analysis ──────────────────────────────────────────────────
  const startedAt = Date.now();
  const result = await analyzeLayout({
    input: { kind: 'url', url: publicUrl, mimeType: file.type },
    timeoutMs: 60_000,
    maxRetries: 2,
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
      `id, tenant_id, blueprint, version,
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

  // Bindings 'auto' — componentes do @colheita/ui aplicam fallbacks razoaveis.
  // Sprint futura: editor de bindings (atrelar produtos do PIM a regions).
  const bindings: ContentBindings = {};
  for (const region of blueprint.regions) {
    bindings[region.id] = { kind: 'auto' };
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
