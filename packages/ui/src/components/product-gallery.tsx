// packages/ui/src/components/product-gallery.tsx
import type { CompilerTheme, ProductRefContent } from './compiler-types.js';
import { deriveColors } from './compiler-types.js';

interface ProductGalleryProps {
  content: ProductRefContent;
  theme: CompilerTheme;
  /** Imagens resolvidas do produto (preenchidas pelo generator antes do render) */
  resolved?: Array<{ url: string; alt?: string }>;
}

/**
 * Galeria de imagens do produto em grid horizontal.
 * Quando `resolved` não é fornecido, exibe placeholder.
 */
export function ProductGallery({ content, theme, resolved }: ProductGalleryProps) {
  const c = deriveColors(theme);

  if (!resolved || resolved.length === 0) {
    return (
      <div
        style={{
          fontFamily: theme.fontFamily,
          padding: '16pt',
          border: `1px dashed ${c.border}`,
          borderRadius: '4pt',
          textAlign: 'center',
          color: c.textMuted,
          fontSize: '8.5pt',
          marginBottom: '16pt',
        }}
      >
        [Galeria: {content.productId}]
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: theme.fontFamily,
        display: 'flex',
        gap: '8pt',
        flexWrap: 'wrap',
        marginBottom: '16pt',
      }}
    >
      {resolved.map((img) => (
        <img
          key={img.url}
          src={img.url}
          alt={img.alt ?? ''}
          style={{
            height: '72pt',
            width: 'auto',
            objectFit: 'cover',
            borderRadius: '3pt',
            border: `1px solid ${c.border}`,
          }}
        />
      ))}
    </div>
  );
}
