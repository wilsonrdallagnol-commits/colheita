// packages/ui/src/components/media-block.tsx
import type { CompilerTheme, MediaContent } from './compiler-types.js';
import { deriveColors } from './compiler-types.js';

interface MediaBlockProps {
  content: MediaContent;
  theme: CompilerTheme;
  /** URL resolvida do asset (preenchida pelo generator). */
  resolvedUrl?: string;
  /** Alt text do asset. */
  alt?: string;
  /** Altura máxima da imagem em pt. Default: 160. */
  maxHeightPt?: number;
  caption?: string;
}

/**
 * Bloco de imagem/mídia. Exibe a imagem se `resolvedUrl` for fornecida;
 * caso contrário, exibe um placeholder com o assetId.
 */
export function MediaBlock({
  content,
  theme,
  resolvedUrl,
  alt,
  maxHeightPt = 160,
  caption,
}: MediaBlockProps) {
  const c = deriveColors(theme);

  return (
    <div
      style={{
        fontFamily: theme.fontFamily,
        marginBottom: '16pt',
      }}
    >
      {resolvedUrl ? (
        <img
          src={resolvedUrl}
          alt={alt ?? ''}
          style={{
            width: '100%',
            maxHeight: `${maxHeightPt}pt`,
            objectFit: 'contain',
            display: 'block',
            borderRadius: '3pt',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: `${maxHeightPt * 0.5}pt`,
            backgroundColor: c.surfaceSubtle,
            border: `1px dashed ${c.border}`,
            borderRadius: '3pt',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: c.textMuted,
            fontSize: '8pt',
          }}
        >
          [Asset: {content.assetId}]
        </div>
      )}
      {caption ? (
        <p
          style={{
            fontSize: '7pt',
            color: c.textMuted,
            margin: 0,
            marginTop: '4pt',
            textAlign: 'center',
          }}
        >
          {caption}
        </p>
      ) : null}
    </div>
  );
}
