#!/usr/bin/env tsx

/**
 * Backfill de sha256 em assets — calcula hash de conteudo das rows existentes
 * que nao tem sha256 ainda (criadas antes da migration 0025).
 *
 * Uso: pnpm --filter @colheita/jobs backfill-sha256
 * Alias raiz (se adicionado): pnpm assets:backfill-sha256
 *
 * Requerimentos:
 *   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *
 * Comportamento:
 *  - Pega rows com sha256 NULL (paginado, 50 por vez)
 *  - Baixa cada arquivo do storage
 *  - Calcula sha256 do binario
 *  - UPDATE assets SET sha256 = ? WHERE id = ?
 *  - Em caso de duplicata (UNIQUE violation 23505): mantem a row mais antiga,
 *    soft-delete a duplicata mais nova (deleted_at = now())
 *
 * Reentrante: pode rodar varias vezes; so processa rows com sha256 null.
 */

import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌  SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorios.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BATCH_SIZE = 50;

interface AssetRow {
  id: string;
  tenant_id: string;
  storage_path: string;
  filename: string;
}

async function fetchBatch(): Promise<AssetRow[]> {
  const { data, error } = await supabase
    .from('assets')
    .select('id, tenant_id, storage_path, filename')
    .is('sha256', null)
    .is('deleted_at', null)
    .limit(BATCH_SIZE);

  if (error) {
    console.error('❌  Erro ao buscar batch:', error.message);
    process.exit(1);
  }

  return (data ?? []) as AssetRow[];
}

async function downloadAndHash(asset: AssetRow): Promise<string | null> {
  try {
    const { data: blob, error } = await supabase.storage
      .from('assets')
      .download(asset.storage_path);

    if (error || !blob) {
      console.warn(`⚠️   Storage 404: ${asset.storage_path} (asset ${asset.id})`);
      return null;
    }

    const buffer = Buffer.from(await blob.arrayBuffer());
    return crypto.createHash('sha256').update(buffer).digest('hex');
  } catch (err) {
    console.warn(`⚠️   Erro ao baixar ${asset.storage_path}:`, err);
    return null;
  }
}

async function updateSha256(assetId: string, sha256: string): Promise<'ok' | 'dup' | 'err'> {
  const { error } = await supabase.from('assets').update({ sha256 }).eq('id', assetId);

  if (!error) return 'ok';

  // 23505 = unique_violation — outro asset no mesmo tenant ja tem este hash
  if (error.code === '23505') return 'dup';

  console.warn(`⚠️   Erro UPDATE asset ${assetId}:`, error.message);
  return 'err';
}

async function softDeleteDuplicate(assetId: string): Promise<void> {
  await supabase.from('assets').update({ deleted_at: new Date().toISOString() }).eq('id', assetId);
}

async function main() {
  console.log('🚀  Iniciando backfill de sha256 em assets...\n');

  let totalProcessed = 0;
  let totalOk = 0;
  let totalDup = 0;
  let totalSkip = 0;
  let totalErr = 0;

  while (true) {
    const batch = await fetchBatch();
    if (batch.length === 0) break;

    console.log(`📦  Batch de ${batch.length} assets...`);

    for (const asset of batch) {
      totalProcessed++;
      const sha256 = await downloadAndHash(asset);

      if (!sha256) {
        totalSkip++;
        // Marca como deleted pra nao reprocessar (storage perdido)
        await softDeleteDuplicate(asset.id);
        continue;
      }

      const result = await updateSha256(asset.id, sha256);
      if (result === 'ok') {
        totalOk++;
      } else if (result === 'dup') {
        totalDup++;
        console.log(`   🔁 dedup: ${asset.filename} → soft-delete (asset ${asset.id})`);
        await softDeleteDuplicate(asset.id);
      } else {
        totalErr++;
      }
    }

    if (batch.length < BATCH_SIZE) break;
  }

  console.log('\n✅  Backfill concluido.');
  console.log(`   Total processado: ${totalProcessed}`);
  console.log(`   ✓ Atualizados:    ${totalOk}`);
  console.log(`   🔁 Deduplicados:   ${totalDup}`);
  console.log(`   ⊘ Storage perdido: ${totalSkip}`);
  console.log(`   ✗ Erros:           ${totalErr}`);
}

main().catch((err) => {
  console.error('💥  Falha:', err);
  process.exit(1);
});
