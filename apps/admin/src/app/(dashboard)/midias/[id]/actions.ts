'use server';

// apps/admin/src/app/(dashboard)/midias/[id]/actions.ts

import { createAdminClient, requireAuth } from '@colheita/auth';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

interface ActionState {
  success?: boolean;
  error?: string;
}

const VALID_LICENSES = ['internal', 'public', 'restricted', 'licensed'] as const;
type AssetLicense = (typeof VALID_LICENSES)[number];

/**
 * Parse de tags vindo do form: aceita lista CSV ("agro, soja, hero") OU
 * input <input name="tags" value="json:[...]" /> serializado.
 * Normaliza: lowercase, sem duplicatas, sem espaços extras, max 30 chars cada,
 * limite de 30 tags por asset (defesa contra abuso).
 */
function parseTags(raw: FormDataEntryValue | null): string[] | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (trimmed === '') return [];

  const parts = trimmed.split(',').map((t) => t.trim().toLowerCase());
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    if (!p || p.length > 30 || seen.has(p)) continue;
    // Permite letras, números, hífen e espaço dentro da tag (multi-palavra)
    if (!/^[a-z0-9çáéíóúâêôãõà][a-z0-9çáéíóúâêôãõà\s-]*$/i.test(p)) continue;
    seen.add(p);
    out.push(p);
    if (out.length >= 30) break;
  }
  return out;
}

function parseLicense(raw: FormDataEntryValue | null): AssetLicense | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return (VALID_LICENSES as readonly string[]).includes(trimmed) ? (trimmed as AssetLicense) : null;
}

/**
 * Valida data ISO (YYYY-MM-DD) ou retorna null. Empty string vira null
 * pra remover expiração quando user limpa o campo.
 */
function parseExpiresAt(raw: FormDataEntryValue | null): string | null | undefined {
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  // YYYY-MM-DD strict
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return undefined;
  // Confirma que é data parseable
  const date = new Date(`${trimmed}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return undefined;
  return trimmed;
}

export async function updateAsset(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const cookieStore = await cookies();
  try {
    await requireAuth(cookieStore);
  } catch {
    return { error: 'Não autorizado.' };
  }

  const id = formData.get('id');
  const title = formData.get('title');
  const altText = formData.get('alt_text');
  const tagsRaw = formData.get('tags');
  const licenseRaw = formData.get('license');
  const licenseNotesRaw = formData.get('license_notes');
  const expiresAtRaw = formData.get('expires_at');

  if (!id || typeof id !== 'string') {
    return { error: 'ID inválido.' };
  }

  // Update payload defensivo: campos não enviados ficam de fora (não setam null
  // acidental). Cada parser retorna undefined pra "ignorar", null pra "limpar",
  // ou valor pra "atualizar".
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (typeof title === 'string') updatePayload.title = title.trim() || null;
  if (typeof altText === 'string') updatePayload.alt_text = altText.trim() || null;

  const tags = parseTags(tagsRaw);
  if (tags !== null) updatePayload.tags = tags;

  const license = parseLicense(licenseRaw);
  if (license !== null) updatePayload.license = license;

  if (typeof licenseNotesRaw === 'string') {
    updatePayload.license_notes = licenseNotesRaw.trim() || null;
  }

  const expiresAt = parseExpiresAt(expiresAtRaw);
  if (expiresAt !== undefined) updatePayload.expires_at = expiresAt;

  // Usa adminClient para bypassar RLS (admin já autenticado via requireAuth acima)
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('assets')
    .update(updatePayload)
    .eq('id', id)
    .is('deleted_at', null);

  if (error) {
    return { error: 'Erro ao salvar alterações.' };
  }

  revalidatePath(`/midias/${id}`);
  revalidatePath('/midias');

  return { success: true };
}
