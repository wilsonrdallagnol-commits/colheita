// apps/admin/src/app/(dashboard)/midias/page.tsx
import { createAdminClient, createServerClient, requireAuth } from '@colheita/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
} from '@colheita/ui';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { AssetGrid } from '@/components/midias/asset-grid';
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
}

export default async function MidiasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { tipo, q } = await searchParams;
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const validTypes: AssetType[] = ['image', 'video', 'document', 'audio', 'other'];
  const activeType = validTypes.includes(tipo as AssetType) ? (tipo as AssetType) : undefined;

  let query = supabase
    .from('assets')
    .select(
      'id, filename, original_name, mime_type, file_size, storage_path, type, title, alt_text, width, height, created_at',
    )
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (activeType) {
    query = query.eq('type', activeType);
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
      createdAt: a.created_at as string,
    };
  });

  const activeTab = activeType ?? 'all';

  return (
    <div style={{ padding: '32px' }}>
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span style={{ color: 'var(--colheita-text-tertiary)', fontSize: '0.8125rem' }}>
              Argho
            </span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>Mídias</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div
        style={{
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'var(--colheita-text-primary)',
              letterSpacing: '-0.025em',
              marginBottom: '4px',
            }}
          >
            Mídias
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
            {assets.length} {assets.length === 1 ? 'arquivo' : 'arquivos'}
            {activeType ? ` · filtrado por ${activeType}` : ''}
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
      {q && (
        <div
          style={{
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8125rem',
            color: 'var(--colheita-text-secondary)',
          }}
        >
          <span>Resultados para &ldquo;{q}&rdquo;</span>
          <Link
            href={activeType ? `/midias?tipo=${activeType}` : '/midias'}
            style={{
              color: 'var(--colheita-text-tertiary)',
              textDecoration: 'none',
              fontSize: '0.75rem',
            }}
          >
            ✕ limpar
          </Link>
        </div>
      )}

      {/* Grid */}
      <AssetGrid assets={assets} />
    </div>
  );
}
