// apps/admin/src/app/api/midias/upload/route.ts
//
// POST /api/midias/upload — recebe um arquivo via multipart/form-data,
// faz upload para o Supabase Storage bucket "assets" e registra na tabela assets.
//
// Requer autenticação de admin. Usa service role para storage (bypassa RLS).

import crypto from 'node:crypto';
import path from 'node:path';
import { createAdminClient, createServerClient, requireAuth } from '@colheita/auth';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const runtime = 'nodejs';

// Tamanho máximo: 50 MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const MIME_TO_TYPE: Record<string, 'image' | 'video' | 'document' | 'audio' | 'other'> = {
  // Imagens
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'image/svg+xml': 'image',
  'image/avif': 'image',
  // Vídeos
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/ogg': 'video',
  // Áudio
  'audio/mpeg': 'audio',
  'audio/ogg': 'audio',
  'audio/wav': 'audio',
  // Documentos
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.ms-excel': 'document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
  'text/plain': 'document',
};

function getAssetType(mimeType: string): 'image' | 'video' | 'document' | 'audio' | 'other' {
  return MIME_TO_TYPE[mimeType] ?? 'other';
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[àáâãä]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: NextRequest) {
  // 1. Autenticação
  const cookieStore = await cookies();
  try {
    await requireAuth(cookieStore);
  } catch {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  // 2. Parse do multipart
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Requisição inválida — esperado multipart/form-data.' },
      { status: 400 },
    );
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Campo "file" ausente ou inválido.' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Arquivo excede o limite de 50 MB.' }, { status: 413 });
  }

  if (!file.name || file.size === 0) {
    return NextResponse.json({ error: 'Arquivo vazio ou sem nome.' }, { status: 400 });
  }

  // 3. Prepara metadados
  const ext = path.extname(file.name) || '';
  const baseName = path.basename(file.name, ext);
  const safeBase = sanitizeFilename(baseName) || 'arquivo';
  const uniqueId = crypto.randomBytes(8).toString('hex');
  const filename = `${safeBase}-${uniqueId}${ext}`;
  const mimeType = file.type || 'application/octet-stream';
  const assetType = getAssetType(mimeType);

  // 4. Busca tenant_id
  const userClient = createServerClient(cookieStore);
  const { data: tenantData } = await userClient.from('tenants').select('id').limit(1).single();

  if (!tenantData?.id) {
    return NextResponse.json({ error: 'Tenant não encontrado.' }, { status: 500 });
  }
  const tenantId = tenantData.id as string;

  // 5. Upload para Supabase Storage (service role — bypassa RLS)
  const adminClient = createAdminClient();
  const storagePath = `${tenantId}/${filename}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 5a. Extrai dimensões para imagens raster (exclui SVG — sharp não processa)
  let imageWidth: number | null = null;
  let imageHeight: number | null = null;
  if (assetType === 'image' && mimeType !== 'image/svg+xml') {
    try {
      const meta = await sharp(buffer).metadata();
      imageWidth = meta.width ?? null;
      imageHeight = meta.height ?? null;
    } catch {
      // Não bloqueia o upload se a extração falhar
    }
  }

  const { error: storageError } = await adminClient.storage
    .from('assets')
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (storageError) {
    console.error('[upload] storage error:', storageError);
    // Tenta dar uma mensagem útil para o caso mais comum (bucket não existe)
    if (
      storageError.message?.includes('Bucket not found') ||
      storageError.message?.includes('bucket')
    ) {
      return NextResponse.json(
        {
          error:
            'Bucket "assets" não encontrado no Supabase Storage. Crie-o no dashboard do Supabase.',
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: `Erro no storage: ${storageError.message}` },
      { status: 500 },
    );
  }

  // 6a. Versionamento (Camada 4 mov 3): se ja existe asset com mesmo
  // original_name no tenant (nao deletado), criar como nova versao linkada
  // ao parent (v1) em vez de duplicar como asset independente.
  //
  // Logica:
  //   - Busca asset com original_name match + nao deletado, ordenado por
  //     version desc -> pega a v atual mais alta
  //   - Se encontrou: nova row com version = old.version + 1, parent_id =
  //     old.parent_id ?? old.id (mantem cadeia linkada na v1 raiz)
  //   - Se nao encontrou: insert normal com version=1, parent_id=null
  const { data: existingVersion } = await adminClient
    .from('assets')
    .select('id, version, parent_id')
    .eq('tenant_id', tenantId)
    .eq('original_name', file.name)
    .is('deleted_at', null)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const newVersion = existingVersion ? ((existingVersion.version as number) ?? 1) + 1 : 1;
  const parentId = existingVersion
    ? ((existingVersion.parent_id as string | null) ?? (existingVersion.id as string))
    : null;

  // 6b. Cria registro na tabela assets
  const { data: asset, error: dbError } = await adminClient
    .from('assets')
    .insert({
      tenant_id: tenantId,
      filename,
      original_name: file.name,
      mime_type: mimeType,
      file_size: file.size,
      storage_path: storagePath,
      type: assetType,
      version: newVersion,
      parent_id: parentId,
      ...(imageWidth !== null && { width: imageWidth }),
      ...(imageHeight !== null && { height: imageHeight }),
    })
    .select(
      'id, filename, original_name, mime_type, file_size, storage_path, type, version, parent_id, created_at',
    )
    .single();

  if (dbError) {
    // Rollback: remove o arquivo do storage se o insert falhou
    await adminClient.storage.from('assets').remove([storagePath]);
    console.error('[upload] db error:', dbError);
    return NextResponse.json({ error: 'Erro ao registrar asset no banco.' }, { status: 500 });
  }

  return NextResponse.json({ asset }, { status: 201 });
}
