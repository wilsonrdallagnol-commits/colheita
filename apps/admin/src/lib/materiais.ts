// apps/admin/src/lib/materiais.ts
// Persistencia de geracoes de materiais em public.generated_materials.
//
// Camada 3 (Geracao de Materiais) — movimento 3: versionamento + auditoria.
//
// Cada chamada bem-sucedida de generateFichaTecnica/generateCatalogo passa por
// recordGeneratedMaterial pra:
//   1. Resolver template_id pelo slug (busca em material_templates)
//   2. Insertar row em generated_materials com input_data como snapshot completo
//      (permite re-gerar PDF identico no futuro mesmo se o produto for editado)
//   3. Registrar product_ids[] pra cross-link com PIM (relatorios futuros)
//   4. Capturar duration_ms pra metricas de performance
//
// Falha silenciosa: erros de persistencia NAO bloqueiam o download do PDF
// (UX > telemetria). Erros vao pro Sentry com contexto.
//
// v2 deste modulo (proximo movimento): upload do PDF binario pro Storage
// + cache por SHA-256 do input_data (re-download de mesma versao sem regerar).

import type { createServerClient } from '@colheita/auth';
import { captureError } from '@colheita/observability';

type SupabaseClient = ReturnType<typeof createServerClient>;

export type MaterialTemplateSlug = 'ficha-tecnica' | 'catalogo-consolidado' | 'banner-social';

interface RecordParams {
  /** Cliente Supabase ja autenticado (RLS aplicado via tenant_id do JWT) */
  supabase: SupabaseClient;
  /** Slug do template registrado em material_templates */
  templateSlug: MaterialTemplateSlug;
  /** Snapshot completo do input usado na geracao (jsonb) */
  inputData: Record<string, unknown>;
  /** UUIDs dos produtos cobertos por essa geracao (vazio = nenhum produto especifico) */
  productIds?: string[];
  /** Duracao do render Playwright em ms */
  durationMs?: number;
  /** Numero de paginas do PDF */
  pages?: number;
  /** UUID do user que disparou (auth.uid()). Se omitido, fica null. */
  generatedBy?: string;
}

interface RecordResult {
  /** ID do registro em generated_materials, ou null se a persistencia falhou */
  materialId: string | null;
}

/**
 * Resolve o template_id ativo a partir do slug. Memoizado por request — cada
 * route handler resolve apenas uma vez mesmo gerando varios materiais.
 */
async function resolveTemplateId(
  supabase: SupabaseClient,
  slug: MaterialTemplateSlug,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('material_templates')
    .select('id')
    .eq('slug', slug)
    .eq('status', 'active')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data.id as string;
}

/**
 * Resolve o tenant_id da sessao autenticada via JWT (custom_access_token_hook
 * injeta no claim). Necessario pra preencher tenant_id em generated_materials
 * porque o cliente postgres-js do Supabase nao reescreve a coluna a partir
 * do JWT — RLS apenas filtra rows visiveis.
 */
async function resolveTenantId(supabase: SupabaseClient): Promise<string | null> {
  const { data: tenantRow } = await supabase.from('tenants').select('id').limit(1).maybeSingle();
  return (tenantRow?.id as string | undefined) ?? null;
}

export async function recordGeneratedMaterial(params: RecordParams): Promise<RecordResult> {
  const { supabase, templateSlug, inputData, productIds, durationMs, pages, generatedBy } = params;

  try {
    const [templateId, tenantId] = await Promise.all([
      resolveTemplateId(supabase, templateSlug),
      resolveTenantId(supabase),
    ]);

    if (!templateId) {
      captureError(new Error(`Template not found: ${templateSlug}`), {
        context: 'admin.materiais.record.template',
        templateSlug,
      });
      return { materialId: null };
    }

    if (!tenantId) {
      captureError(new Error('Tenant not resolvable from session'), {
        context: 'admin.materiais.record.tenant',
        templateSlug,
      });
      return { materialId: null };
    }

    const { data, error } = await supabase
      .from('generated_materials')
      .insert({
        tenant_id: tenantId,
        template_id: templateId,
        input_data: inputData,
        product_ids: productIds ?? [],
        outputs: [],
        status: 'completed',
        duration_ms: durationMs ?? null,
        pages: pages ?? null,
        generated_by: generatedBy ?? null,
      })
      .select('id')
      .single();

    if (error || !data) {
      captureError(error ?? new Error('insert returned no data'), {
        context: 'admin.materiais.record.insert',
        templateSlug,
      });
      return { materialId: null };
    }

    return { materialId: data.id as string };
  } catch (err) {
    captureError(err, {
      context: 'admin.materiais.record.exception',
      templateSlug,
    });
    return { materialId: null };
  }
}
