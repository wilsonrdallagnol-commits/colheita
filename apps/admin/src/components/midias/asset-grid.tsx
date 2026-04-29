// apps/admin/src/components/midias/asset-grid.tsx
import Link from 'next/link';
import { AssetTypeBadge } from './asset-type-badge';

type AssetType = 'image' | 'video' | 'document' | 'audio' | 'other';

export interface AssetSummary {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  type: AssetType;
  title: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  createdAt: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Placeholder thumbnail for non-image types
function AssetThumbnail({ asset }: { asset: AssetSummary }) {
  const iconMap: Record<AssetType, string> = {
    image: '🖼',
    video: '🎬',
    document: '📄',
    audio: '🔊',
    other: '📦',
  };

  if (asset.type === 'image') {
    // In production, we'd use a Supabase Storage signed URL here.
    // For now, show a placeholder with dimensions.
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '4/3',
          backgroundColor: 'var(--colheita-surface-elevated)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          borderRadius: 'var(--colheita-radius-md) var(--colheita-radius-md) 0 0',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <span style={{ fontSize: '2rem' }}>{iconMap[asset.type]}</span>
        {asset.width && asset.height && (
          <span style={{ fontSize: '0.6875rem', color: 'var(--colheita-text-tertiary)' }}>
            {asset.width}×{asset.height}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '4/3',
        backgroundColor: 'var(--colheita-surface-elevated)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--colheita-radius-md) var(--colheita-radius-md) 0 0',
        overflow: 'hidden',
      }}
    >
      <span style={{ fontSize: '2.5rem' }}>{iconMap[asset.type]}</span>
    </div>
  );
}

interface AssetGridProps {
  assets: AssetSummary[];
}

export function AssetGrid({ assets }: AssetGridProps) {
  if (assets.length === 0) {
    return (
      <div
        style={{
          padding: '64px 24px',
          textAlign: 'center',
          color: 'var(--colheita-text-tertiary)',
          fontSize: '0.875rem',
          border: '1px dashed var(--colheita-border-subtle)',
          borderRadius: 'var(--colheita-radius-lg)',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📂</div>
        <div
          style={{ fontWeight: 500, color: 'var(--colheita-text-secondary)', marginBottom: '6px' }}
        >
          Nenhum arquivo ainda
        </div>
        <div style={{ fontSize: '0.8125rem' }}>
          Faça upload de imagens, documentos e outros arquivos para usar em materiais e produtos.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
      }}
    >
      {assets.map((asset) => (
        <Link
          key={asset.id}
          href={`/midias/${asset.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div
            style={{
              border: '1px solid var(--colheita-border-subtle)',
              borderRadius: 'var(--colheita-radius-md)',
              overflow: 'hidden',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
          >
            <AssetThumbnail asset={asset} />
            <div style={{ padding: '10px 12px 12px' }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--colheita-text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: '4px',
                }}
                title={asset.title ?? asset.originalName}
              >
                {asset.title ?? asset.originalName}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <AssetTypeBadge type={asset.type} />
                <span
                  style={{
                    fontSize: '0.6875rem',
                    color: 'var(--colheita-text-tertiary)',
                    flexShrink: 0,
                  }}
                >
                  {formatFileSize(asset.fileSize)}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
