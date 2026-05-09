// apps/admin/src/app/(dashboard)/midias/page.tsx
import { createAdminClient, createServerClient, requireAuth } from '@colheita/auth';
import { Button } from '@colheita/ui';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { AssetGrid } from '@/components/midias/asset-grid';
import { SearchInput } from '@/components/midias/search-input';
import { UploadButton } from '@/components/midias/upload-button';

export const metadata = { title: 'Mídias' };

type AssetType = 'image' | 'video' | 'document' | 'audio' | 'other';

const ALL_TYPES: { value: AssetType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'image', label: 'Imagens' },
  { value: 'video', label: 'Vídeos' },
  { value: 'document', label: 'Documentos' },
  { value: 'audio', label: 'Áudio' },
  { value: 'other', label: 'Outros' },
];

interface SearchParams {
  tipo?: string;
  q?: string;
  tag?: string;
}

/**
 * Sanitiza tag vinda da URL (?tag=...) antes de passar pra Postgres.contains().
 * Lowercase, sem caracteres que poderiam quebrar a sintaxe text[]. Limita 30
 * chars consistente com o validator do form de edicao de asset.
 */
function sanitizeTagFilter(raw: string | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase().slice(0, 30);
  if (trimmed === '') return null;
  if (!/^[a-z0-9çáéíóúâêôãõà][a-z0-9çáéíóúâêôãõà\s-]*$/i.test(trimmed)) return null;
  return trimmed;
}

export default async function MidiasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { tipo, q, tag } = await searchParams;
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const validTypes: AssetType[] = ['image', 'video', 'document', 'audio', 'other'];
  const activeType = validTypes.includes(tipo as AssetType) ? (tipo as AssetType) : undefined;
  const activeTag = sanitizeTagFilter(tag);

  let query = supabase
    .from('assets')
    .select(
      'id, filename, original_name, mime_type, file_size, storage_path, type, title, alt_text, width, height, tags, created_at',
    )
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (activeType) {
    query = query.eq('type', activeType);
  }

  // Filtro por tag — usa contains do PostgREST sobre text[]
  // (gera "tags=cs.{value}" no wire). Index GIN ja existe (assets_tags_idx).
  if (activeTag) {
    query = query.contains('tags', [activeTag]);
  }

  if (q) {
    query = query.or(`title.ilike.%${q}%,original_name.ilike.%${q}%`);
  }

  const { data: rawAssets } = await query;

  // Gera URL pública para cada asset via Storage admin (service role)
  // Se o bucket "assets" não for público, publicUrl ainda é retornada mas a URL
  // retornará 400 — nesse caso, o componente exibe placeholder automaticamente.
  const adminClient = createAdminClient();
  const assets = (rawAssets ?? []).map((a) => {
    const storagePath = a.storage_path as string;
    const { data: urlData } = adminClient.storage.from('assets').getPublicUrl(storagePath);
    return {
      id: a.id as string,
      filename: a.filename as string,
      originalName: a.original_name as string,
      mimeType: a.mime_type as string,
      fileSize: a.file_size as number,
      storagePath,
      publicUrl: urlData?.publicUrl ?? null,
      type: a.type as AssetType,
      title: a.title as string | null,
      altText: a.alt_text as string | null,
      width: a.width as number | null,
      height: a.height as number | null,
      tags: ((a.tags as string[] | null) ?? []) as string[],
      createdAt: a.created_at as string,
    };
  });

  const activeTab = activeType ?? 'all';

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)' }}>
      {/* Header editorial */}
      <div
        style={{
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
            DAM · Biblioteca
          </p>
          <h1
            className="argho-display"
            style={{
              fontSize: 'clamp(1.875rem, 2.4vw, 2.375rem)',
              color: '#0a0a0a',
              margin: '0 0 8px',
            }}
          >
            Mídias da Argho
          </h1>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--colheita-text-secondary)',
              margin: 0,
              maxWidth: '60ch',
            }}
          >
            {assets.length} {assets.length === 1 ? 'arquivo' : 'arquivos'}
            {activeType ? ` · ${activeType}` : ''}
            {activeTag ? (
              <>
                {' · tag '}
                <span
                  style={{
                    display: 'inline-block',
                    padding: '1px 8px',
                    borderRadius: '999px',
                    backgroundColor: 'var(--colheita-surface-elevated)',
                    border: '1px solid var(--colheita-border)',
                    fontSize: '0.75rem',
                    color: 'var(--colheita-text-primary)',
                    fontWeight: 500,
                    marginLeft: '4px',
                  }}
                >
                  {activeTag}
                </span>{' '}
                <Link
                  href={activeType ? `/midias?tipo=${activeType}` : '/midias'}
                  style={{
                    color: 'var(--colheita-text-tertiary)',
                    textDecoration: 'none',
                    fontSize: '0.75rem',
                    marginLeft: '6px',
                  }}
                >
                  ✕ remover
                </Link>
              </>
            ) : null}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button asChild variant="outline" size="sm">
            <Link href="/midias/colecoes">Coleções</Link>
          </Button>
          <UploadButton />
        </div>
      </div>

      {/* Type filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--colheita-border-subtle)',
          paddingBottom: '0',
        }}
      >
        {ALL_TYPES.map((t) => {
          const isActive = t.value === activeTab;
          const href = t.value === 'all' ? '/midias' : `/midias?tipo=${t.value}`;
          return (
            <Link
              key={t.value}
              href={href}
              style={{
                padding: '8px 14px',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--colheita-text-primary)' : 'var(--colheita-text-tertiary)',
                textDecoration: 'none',
                borderBottom: isActive
                  ? '2px solid var(--colheita-brand-primary)'
                  : '2px solid transparent',
                marginBottom: '-1px',
                transition: 'color 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Search */}
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <SearchInput
          defaultValue={q ?? ''}
          baseHref={activeType ? `/midias?tipo=${activeType}` : '/midias'}
        />
        {q && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8125rem',
              color: 'var(--colheita-text-secondary)',
            }}
          >
            <span>
              {assets.length} resultado{assets.length !== 1 ? 's' : ''} para &ldquo;{q}&rdquo;
            </span>
            <Link
              href={activeType ? `/midias?tipo=${activeType}` : '/midias'}
              style={{
                color: 'var(--colheita-text-tertiary)',
                textDecoration: 'none',
                fontSize: '0.75rem',
              }}
            >
              ✕
            </Link>
          </div>
        )}
      </div>

      {/* Grid */}
      <AssetGrid assets={assets} />
    </div>
  );
}
