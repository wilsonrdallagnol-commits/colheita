/**
 * Testes de integridade de dados — layout_blueprints.
 *
 * Cobertos aqui (identificados no /hm-qa):
 *   1. Cascade delete com conflito de CHECK constraint:
 *      Deletar blueprint com material vinculado SÓ ao blueprint (sem template_id)
 *      → ON DELETE SET NULL seta blueprint_id=NULL → viola CHECK → DELETE deve falhar.
 *
 *   2. Race condition de is_current:
 *      Inserir dois blueprints com is_current=true para o mesmo reference_id
 *      → viola unique partial index → segundo INSERT deve falhar.
 *
 * Executam como superuser (sem RLS) — testamos constraints de schema,
 * não isolamento de tenant.
 */

import postgres from 'postgres';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closeDb, setupDb } from './helpers/setup.js';

const DB_URL =
  process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/colheita_test';

const describeBp = DB_URL ? describe : describe.skip;

let sql: postgres.Sql;

// ============================================================================
// Blueprint mínimo válido para os testes (objeto, não array)
// ============================================================================
const MINIMAL_BLUEPRINT = {
  format: { aspectRatio: '9:16', orientation: 'portrait', intendedDpi: 72 },
  grid: { columns: 12, rows: 'auto', density: 'medium' },
  regions: [],
  visual_intent: {
    mood: 'technical',
    density: 'medium',
    balance: 'centered',
    emphasis: 'product_first',
  },
};

// ============================================================================
// Fixtures — criadas como superuser (bypassa RLS)
// Cada teste cria seu próprio tenant com slug único pra evitar conflitos de PK
// ============================================================================
let fixtureCounter = 0;

async function createBlueprintFixture() {
  const slug = `bp-test-${++fixtureCounter}`;

  const [tenant] = await sql`
    INSERT INTO public.tenants (slug, name, display_name, theme_tokens)
    VALUES (${slug}, ${slug}, ${slug}, ${sql.json({})})
    RETURNING id
  `;
  const tenantId = tenant?.id as string;

  const [asset] = await sql`
    INSERT INTO public.assets (tenant_id, filename, original_name, mime_type, file_size, storage_path, type)
    VALUES (${tenantId}, 'ref.png', 'ref.png', 'image/png', 100000, ${`${slug}/ref.png`}, 'image')
    RETURNING id
  `;
  const assetId = asset?.id as string;

  const [ref] = await sql`
    INSERT INTO public.layout_references (tenant_id, asset_id, title, source_type)
    VALUES (${tenantId}, ${assetId}, 'Referência de teste', 'upload')
    RETURNING id
  `;
  const referenceId = ref?.id as string;

  return { tenantId, assetId, referenceId };
}

// ============================================================================
// Setup / Teardown
// ============================================================================

beforeAll(async () => {
  await setupDb();
  // Conexão superuser separada para os testes de constraint (sem SET ROLE)
  sql = postgres(DB_URL, { max: 1, onnotice: () => {} });
});

afterAll(async () => {
  if (sql) await sql.end();
  await closeDb();
});

// ============================================================================
// 1. CASCADE DELETE + CHECK CONSTRAINT
// ============================================================================

describeBp('blueprint cascade delete vs CHECK constraint', () => {
  it('deletar blueprint falha quando material vinculado não tem template_id', async () => {
    const { tenantId, referenceId } = await createBlueprintFixture();

    const [bp] = await sql`
      INSERT INTO public.layout_blueprints (tenant_id, reference_id, blueprint)
      VALUES (${tenantId}, ${referenceId}, ${sql.json(MINIMAL_BLUEPRINT)})
      RETURNING id
    `;
    const blueprintId = bp?.id as string;

    // Material vinculado APENAS ao blueprint (template_id NULL)
    // CHECK: template_id IS NOT NULL OR blueprint_id IS NOT NULL
    // Ao deletar o blueprint, ON DELETE SET NULL vai setar blueprint_id=NULL → viola CHECK
    await sql`
      INSERT INTO public.generated_materials
        (tenant_id, template_id, blueprint_id, input_data)
      VALUES
        (${tenantId}, NULL, ${blueprintId}, ${sql.json({})})
    `;

    // A tentativa de delete deve falhar com violação de CHECK constraint
    await expect(
      sql`DELETE FROM public.layout_blueprints WHERE id = ${blueprintId}`,
    ).rejects.toThrow();
  });

  it('deletar blueprint com material que TEM template_id funciona (SET NULL seguro)', async () => {
    const { tenantId, referenceId } = await createBlueprintFixture();

    const [tmpl] = await sql`
      INSERT INTO public.material_templates (tenant_id, slug, name, category, format, component_ref)
      VALUES (
        ${tenantId}, 'ficha-v1', 'Ficha Técnica v1', 'datasheet',
        ${sql.json({ width: 1080, height: 1350, unit: 'px', dpi: 72 })},
        'FichaTecnica'
      )
      RETURNING id
    `;
    const templateId = tmpl?.id as string;

    const [bp] = await sql`
      INSERT INTO public.layout_blueprints (tenant_id, reference_id, blueprint)
      VALUES (${tenantId}, ${referenceId}, ${sql.json(MINIMAL_BLUEPRINT)})
      RETURNING id
    `;
    const blueprintId = bp?.id as string;

    // Material COM template_id — ao deletar o blueprint, blueprint_id vira NULL
    // mas template_id continua preenchido → CHECK OK
    await sql`
      INSERT INTO public.generated_materials
        (tenant_id, template_id, blueprint_id, input_data)
      VALUES
        (${tenantId}, ${templateId}, ${blueprintId}, ${sql.json({})})
    `;

    // Deve funcionar sem erros
    await expect(
      sql`DELETE FROM public.layout_blueprints WHERE id = ${blueprintId}`,
    ).resolves.toBeDefined();

    // Confirma que material sobreviveu com blueprint_id NULL
    const [mat] = await sql`
      SELECT blueprint_id FROM public.generated_materials
      WHERE tenant_id = ${tenantId} AND template_id = ${templateId}
    `;
    expect(mat?.blueprint_id).toBeNull();
  });
});

// ============================================================================
// 2. RACE CONDITION — is_current unique partial index
// ============================================================================

describeBp('blueprint is_current race condition', () => {
  it('inserir segundo blueprint com is_current=true para mesma referência viola unique index', async () => {
    const { tenantId, referenceId } = await createBlueprintFixture();

    await sql`
      INSERT INTO public.layout_blueprints (tenant_id, reference_id, blueprint, is_current)
      VALUES (${tenantId}, ${referenceId}, ${sql.json(MINIMAL_BLUEPRINT)}, true)
    `;

    // Segundo blueprint is_current=true para MESMA referência → viola unique partial index
    await expect(
      sql`
        INSERT INTO public.layout_blueprints (tenant_id, reference_id, blueprint, is_current, version)
        VALUES (${tenantId}, ${referenceId}, ${sql.json(MINIMAL_BLUEPRINT)}, true, 2)
      `,
    ).rejects.toThrow();
  });

  it('dois blueprints com is_current=false para mesma referência é permitido', async () => {
    const { tenantId, referenceId } = await createBlueprintFixture();

    // Ambos is_current=false — unique partial index não se aplica (só cobre WHERE is_current=true)
    await sql`
      INSERT INTO public.layout_blueprints (tenant_id, reference_id, blueprint, is_current, version)
      VALUES (${tenantId}, ${referenceId}, ${sql.json(MINIMAL_BLUEPRINT)}, false, 1)
    `;

    await expect(
      sql`
        INSERT INTO public.layout_blueprints (tenant_id, reference_id, blueprint, is_current, version)
        VALUES (${tenantId}, ${referenceId}, ${sql.json(MINIMAL_BLUEPRINT)}, false, 2)
      `,
    ).resolves.toBeDefined();
  });

  it('rotacionar is_current: unset antigo, set novo — funciona em sequência', async () => {
    const { tenantId, referenceId } = await createBlueprintFixture();

    const [v1] = await sql`
      INSERT INTO public.layout_blueprints (tenant_id, reference_id, blueprint, is_current, version)
      VALUES (${tenantId}, ${referenceId}, ${sql.json(MINIMAL_BLUEPRINT)}, true, 1)
      RETURNING id
    `;
    const v1Id = v1?.id as string;

    // Rotação correta: primeiro unset o current, depois set o novo
    await sql`UPDATE public.layout_blueprints SET is_current = false WHERE id = ${v1Id}`;

    await expect(
      sql`
        INSERT INTO public.layout_blueprints (tenant_id, reference_id, blueprint, is_current, version)
        VALUES (${tenantId}, ${referenceId}, ${sql.json(MINIMAL_BLUEPRINT)}, true, 2)
      `,
    ).resolves.toBeDefined();
  });
});
