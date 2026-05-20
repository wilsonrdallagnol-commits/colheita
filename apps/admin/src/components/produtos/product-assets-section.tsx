// apps/admin/src/components/produtos/product-assets-section.tsx
//
// Mostra MSDS, certificates, photos extras, gallery, video do produto
// agrupados por role. Inclui uploader inline pra anexar novos documentos.

import { Award, Camera, FileText, ShieldCheck, Sprout, Video } from 'lucide-react';
import { ProductAssetUploader } from './product-asset-uploader';

interface ProductAsset {
  role: string;
  sort_order: number | null;
  asset:
    | {
        id: string;
        storage_path: string;
        original_name: string;
        mime_type: string;
        file_size: number;
        type: string;
        title: string | null;
      }
    | Array<{
        id: string;
        storage_path: string;
        original_name: string;
        mime_type: string;
        file_size: number;
        type: string;
        title: string | null;
      }>
    | null;
}

interface ProductAssetsSectionProps {
  assets: ProductAsset[];
  /** Slug do produto — quando passado, exibe uploader pra anexar novos docs */
  productSlug?: string;
}

interface RoleMeta {
  label: string;
  icon: typeof Camera;
  color: string;
  bg: string;
  description: string;
}

const ROLE_META: Record<string, RoleMeta> = {
  gallery: {
    label: 'Galeria de fotos',
    icon: Camera,
    color: 'var(--colheita-brand-primary)',
    bg: 'var(--colheita-brand-primary-soft)',
    description: 'Hero shots e fotos de produto em campo.',
  },
  photo: {
    label: 'Fotos extras',
    icon: Camera,
    color: 'var(--colheita-brand-primary)',
    bg: 'var(--colheita-brand-primary-soft)',
    description: 'Fotos de embalagem em uso, lifestyle.',
  },
  video: {
    label: 'Vídeos',
    icon: Video,
    color: 'var(--colheita-brand-secondary)',
    bg: 'var(--colheita-brand-secondary-soft)',
    description: 'Demos de aplicação e treinamento.',
  },
  datasheet: {
    label: 'Ficha técnica externa',
    icon: FileText,
    color: 'var(--colheita-text-secondary)',
    bg: 'var(--colheita-surface-muted)',
    description: 'Versões PDF assinadas pelo regulatório.',
  },
  msds: {
    label: 'FISPQ / MSDS',
    icon: ShieldCheck,
    color: '#b45309',
    bg: '#fef3c7',
    description: 'Material Safety Data Sheet — exigência ANVISA/MAPA.',
  },
  certificate: {
    label: 'Certificados',
    icon: Award,
    color: 'var(--colheita-brand-secondary)',
    bg: 'var(--colheita-brand-secondary-soft)',
    description: 'ISO, organic, terceiros — comprovação externa.',
  },
  spec_sheet: {
    label: 'Documentos regulatórios',
    icon: Sprout,
    color: 'var(--colheita-brand-primary)',
    bg: 'var(--colheita-brand-primary-soft)',
    description: 'MAPA, ANVISA, IBAMA — comprovantes oficiais.',
  },
  document: {
    label: 'Outros documentos',
    icon: FileText,
    color: 'var(--colheita-text-tertiary)',
    bg: 'var(--colheita-surface-muted)',
    description: 'Documentos avulsos do produto.',
  },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function publicUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return `${base}/storage/v1/object/public/assets/${storagePath}`;
}

export function ProductAssetsSection({ assets, productSlug }: ProductAssetsSectionProps) {
  // Empty state: se nao tem assets e tem productSlug, ainda renderiza pro
  // user ver o uploader. Antes retornava null e o uploader nunca aparecia.
  const hasAssets = assets && assets.length > 0;
  if (!hasAssets && !productSlug) return null;

  // Agrupa por role
  const grouped: Record<string, ProductAsset[]> = {};
  for (const a of assets ?? []) {
    if (!grouped[a.role]) grouped[a.role] = [];
    (grouped[a.role] as ProductAsset[]).push(a);
  }

  // Ordem de display: msds primeiro (mais critico), depois certs, photos, etc
  const ROLE_ORDER = [
    'msds',
    'certificate',
    'spec_sheet',
    'datasheet',
    'gallery',
    'photo',
    'video',
    'document',
  ];

  const sortedRoles = ROLE_ORDER.filter((r) => grouped[r]);

  return (
    <section
      style={{
        marginTop: '40px',
        paddingTop: '32px',
        borderTop: '1px solid var(--colheita-border-subtle)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
            Documentos & mídias
          </p>
          <h2
            className="argho-display"
            style={{
              fontSize: '1.5rem',
              color: '#0a0a0a',
              margin: 0,
            }}
          >
            Acervo do produto
          </h2>
        </div>
        {productSlug ? <ProductAssetUploader productSlug={productSlug} /> : null}
      </div>

      {!hasAssets ? (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--colheita-text-tertiary)',
            padding: '20px 0',
          }}
        >
          Nenhum documento anexado ainda. Use o botão acima pra adicionar FISPQ, certificados ou
          outros documentos.
        </p>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {sortedRoles.map((role) => {
          const meta = ROLE_META[role] ?? ROLE_META.document;
          if (!meta) return null;
          const items = grouped[role] ?? [];
          const Icon = meta.icon;

          return (
            <div key={role}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--colheita-radius-md)',
                    backgroundColor: meta.bg,
                    color: meta.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={15} strokeWidth={1.75} />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: '#0a0a0a',
                      margin: 0,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {meta.label}
                  </p>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--colheita-text-tertiary)',
                      margin: 0,
                    }}
                  >
                    {meta.description}
                  </p>
                </div>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: meta.color,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {items.length}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '10px',
                }}
              >
                {items.map((item) => {
                  const asset = Array.isArray(item.asset) ? item.asset[0] : item.asset;
                  if (!asset) return null;
                  return (
                    <a
                      key={asset.id}
                      href={publicUrl(asset.storage_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        padding: '12px 14px',
                        borderRadius: 'var(--colheita-radius-md)',
                        border: '1px solid var(--colheita-border)',
                        backgroundColor: '#ffffff',
                        textDecoration: 'none',
                        boxShadow: 'var(--shadow-card)',
                        transition: 'border-color 200ms ease',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#0a0a0a',
                          margin: '0 0 4px',
                          letterSpacing: '-0.005em',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {asset.title ?? asset.original_name}
                      </p>
                      <p
                        style={{
                          fontSize: '0.6875rem',
                          color: 'var(--colheita-text-tertiary)',
                          margin: 0,
                        }}
                      >
                        {asset.mime_type.split('/')[1]?.toUpperCase() ?? asset.type} ·{' '}
                        {formatBytes(asset.file_size)}
                      </p>
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
