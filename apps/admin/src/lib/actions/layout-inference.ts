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
import { analyzeLayout } from '@colheita/layout-inference';
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
