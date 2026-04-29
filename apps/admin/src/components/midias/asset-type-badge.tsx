// apps/admin/src/components/midias/asset-type-badge.tsx
import type { CSSProperties } from 'react';

type AssetType = 'image' | 'video' | 'document' | 'audio' | 'other';

const TYPE_LABEL: Record<AssetType, string> = {
  image: 'Imagem',
  video: 'Vídeo',
  document: 'Documento',
  audio: 'Áudio',
  other: 'Outro',
};

const TYPE_COLOR: Record<AssetType, string> = {
  image: 'var(--colheita-brand-primary)',
  video: '#6366f1',
  document: '#0284c7',
  audio: '#d97706',
  other: 'var(--colheita-text-tertiary)',
};

interface AssetTypeBadgeProps {
  type: AssetType;
  style?: CSSProperties;
}

export function AssetTypeBadge({ type, style }: AssetTypeBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '0.6875rem',
        fontWeight: 500,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        padding: '2px 6px',
        borderRadius: 'var(--colheita-radius-sm)',
        color: TYPE_COLOR[type],
        backgroundColor: `${TYPE_COLOR[type]}18`,
        ...style,
      }}
    >
      {TYPE_LABEL[type]}
    </span>
  );
}
