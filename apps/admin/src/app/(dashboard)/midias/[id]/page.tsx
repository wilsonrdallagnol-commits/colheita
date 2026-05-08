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
      `id, filename, original_name, mime_type, file_size, storage_path, type, title, alt_text,
       width, height, created_at, tags, license, license_notes, expires_at`,
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

          {/* Tags atuais — chips read-only (edicao via formulario a direita) */}
          {((asset.tags as string[] | null)?.length ?? 0) > 0 && (
            <div style={{ marginTop: '16px' }}>
              <p
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '8px',
                }}
              >
                Tags
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(asset.tags as string[]).map((tag) => (
                  <Link
                    key={tag}
                    href={`/midias?tag=${encodeURIComponent(tag)}`}
                    style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      backgroundColor: 'var(--colheita-surface-elevated)',
                      border: '1px solid var(--colheita-border-subtle)',
                      fontSize: '0.75rem',
                      color: 'var(--colheita-text-secondary)',
                      textDecoration: 'none',
                    }}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Licenca + expiracao — badge informativo */}
          {asset.license && (
            <div style={{ marginTop: '16px' }}>
              <p
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '8px',
                }}
              >
                Licença
              </p>
              {(() => {
                const lic = asset.license as 'internal' | 'public' | 'restricted' | 'licensed';
                const expIso = asset.expires_at as string | null;
                const daysLeft = expIso
                  ? Math.ceil((new Date(expIso).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : null;
                const expired = daysLeft !== null && daysLeft < 0;
                const expiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;

                const labelMap = {
                  internal: 'Interno (Argho)',
                  public: 'Público',
                  restricted: 'Restrito',
                  licensed: 'Licenciado de terceiro',
                };
                const colorMap = {
                  internal: {
                    bg: 'rgba(52,199,89,0.1)',
                    color: '#34c759',
                    border: 'rgba(52,199,89,0.25)',
                  },
                  public: {
                    bg: 'rgba(59,130,246,0.1)',
                    color: '#3b82f6',
                    border: 'rgba(59,130,246,0.25)',
                  },
                  restricted: {
                    bg: 'rgba(212,175,55,0.12)',
                    color: 'var(--colheita-brand-gold)',
                    border: 'rgba(212,175,55,0.25)',
                  },
                  licensed: {
                    bg: 'rgba(139,92,246,0.1)',
                    color: '#8b5cf6',
                    border: 'rgba(139,92,246,0.25)',
                  },
                };
                const c = colorMap[lic];

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        alignSelf: 'flex-start',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        backgroundColor: c.bg,
                        color: c.color,
                        border: `1px solid ${c.border}`,
                        fontSize: '0.75rem',
                        fontWeight: '500',
                      }}
                    >
                      {labelMap[lic]}
                    </span>
                    {expIso && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: expired
                            ? '#ef4444'
                            : expiringSoon
                              ? '#f97316'
                              : 'var(--colheita-text-tertiary)',
                        }}
                      >
                        {expired
                          ? `⚠ Licença expirada há ${Math.abs(daysLeft as number)}d`
                          : expiringSoon
                            ? `⚠ Vence em ${daysLeft}d`
                            : `Válida até ${new Date(expIso).toLocaleDateString('pt-BR')}`}
                      </span>
                    )}
                    {asset.license_notes && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--colheita-text-tertiary)',
                          fontStyle: 'italic',
                        }}
                      >
                        {asset.license_notes as string}
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

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
            tags={(asset.tags as string[] | null) ?? []}
            license={
              (asset.license as 'internal' | 'public' | 'restricted' | 'licensed') ?? 'internal'
            }
            licenseNotes={(asset.license_notes as string | null) ?? ''}
            expiresAt={(asset.expires_at as string | null) ?? null}
            isImage={assetType === 'image'}
          />
        </div>
      </div>
    </div>
  );
}
