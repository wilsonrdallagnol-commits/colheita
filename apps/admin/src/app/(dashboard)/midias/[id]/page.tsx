// apps/admin/src/app/(dashboard)/midias/[id]/page.tsx
//
// Detalhe de um asset de mídia.
// Mostra preview, metadados, URL pública e formulário de edição
// de título e alt text via Server Action.

import { createAdminClient, createServerClient, requireAuth } from '@colheita/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@colheita/ui';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AssetTypeBadge } from '@/components/midias/asset-type-badge';
import { AssetEditForm } from './asset-edit-form';

export const metadata = { title: 'Detalhe de Mídia' };

type AssetType = 'image' | 'video' | 'document' | 'audio' | 'other';

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const typeIcon: Record<AssetType, string> = {
  image: '🖼',
  video: '🎬',
  document: '📄',
  audio: '🔊',
  other: '📦',
};

export default async function AssetDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { data: asset, error } = await supabase
    .from('assets')
    .select(
      'id, filename, original_name, mime_type, file_size, storage_path, type, title, alt_text, width, height, created_at',
    )
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error || !asset) {
    notFound();
  }

  const adminClient = createAdminClient();
  const { data: urlData } = adminClient.storage
    .from('assets')
    .getPublicUrl(asset.storage_path as string);

  const publicUrl = urlData?.publicUrl ?? null;
  const assetType = asset.type as AssetType;

  return (
    <div style={{ padding: '32px', maxWidth: '800px' }}>
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span style={{ color: 'var(--colheita-text-tertiary)', fontSize: '0.8125rem' }}>
              Argho
            </span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link
              href="/midias"
              style={{
                color: 'var(--colheita-text-tertiary)',
                fontSize: '0.8125rem',
                textDecoration: 'none',
              }}
            >
              Mídias
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>
              {(asset.title as string | null) ?? (asset.original_name as string)}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Preview */}
        <div>
          <div
            style={{
              aspectRatio: '4/3',
              backgroundColor: 'var(--colheita-surface-elevated)',
              border: '1px solid var(--colheita-border-subtle)',
              borderRadius: 'var(--colheita-radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              marginBottom: '16px',
            }}
          >
            {assetType === 'image' && publicUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={publicUrl}
                alt={(asset.alt_text as string | null) ?? (asset.original_name as string)}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <span style={{ fontSize: '4rem' }}>{typeIcon[assetType]}</span>
            )}
          </div>

          {/* Metadados */}
          <div
            style={{
              border: '1px solid var(--colheita-border-subtle)',
              borderRadius: 'var(--colheita-radius-md)',
              overflow: 'hidden',
            }}
          >
            {[
              { label: 'Nome original', value: asset.original_name as string },
              { label: 'Tipo', value: asset.mime_type as string },
              { label: 'Tamanho', value: formatFileSize(asset.file_size as number) },
              ...(asset.width && asset.height
                ? [{ label: 'Dimensões', value: `${asset.width}×${asset.height} px` }]
                : []),
              { label: 'Enviado em', value: formatDate(asset.created_at as string) },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '10px 14px',
                  borderBottom:
                    i < arr.length - 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--colheita-text-tertiary)',
                    minWidth: '100px',
                    flexShrink: 0,
                  }}
                >
                  {row.label}
                </span>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--colheita-text-secondary)',
                    wordBreak: 'break-all',
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* URL pública */}
          {publicUrl && (
            <div style={{ marginTop: '16px' }}>
              <p
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '6px',
                }}
              >
                URL pública
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  padding: '8px 12px',
                  backgroundColor: 'var(--colheita-surface-elevated)',
                  border: '1px solid var(--colheita-border-subtle)',
                  borderRadius: 'var(--colheita-radius-sm)',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--colheita-text-tertiary)',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontFamily: 'monospace',
                  }}
                  title={publicUrl}
                >
                  {publicUrl}
                </span>
                <AssetTypeBadge type={assetType} />
              </div>
              <p
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--colheita-text-tertiary)',
                  marginTop: '4px',
                }}
              >
                Disponível somente se o bucket "assets" for público no Supabase.
              </p>
            </div>
          )}
        </div>

        {/* Formulário de edição */}
        <div>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: 'var(--colheita-text-primary)',
              marginBottom: '20px',
              letterSpacing: '-0.02em',
            }}
          >
            Informações do arquivo
          </h2>
          <AssetEditForm
            id={id}
            title={(asset.title as string | null) ?? ''}
            altText={(asset.alt_text as string | null) ?? ''}
            isImage={assetType === 'image'}
          />
        </div>
      </div>
    </div>
  );
}
