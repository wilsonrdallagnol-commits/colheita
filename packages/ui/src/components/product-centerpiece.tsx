// packages/ui/src/components/product-centerpiece.tsx
import type { CompilerTheme, ProductRefContent } from './compiler-types.js';
import { deriveColors } from './compiler-types.js';

interface ProductCenterpieceProps {
  content: ProductRefContent;
  theme: CompilerTheme;
  /** Dados resolvidos do produto (preenchidos pelo generator antes do render) */
  resolved?: {
    name: string;
    tagline?: string;
    description?: string;
    imageUrl?: string;
    mapaRegistration?: string;
  };
}

/**
 * Peça central do produto: imagem em destaque + nome + tagline + descrição.
 * Quando `resolved` não é fornecido, exibe um placeholder de preview.
 */
export function ProductCenterpiece({ content, theme, resolved }: ProductCenterpieceProps) {
  const c = deriveColors(theme);

  if (!resolved) {
    // Placeholder para preview sem dados resolvidos
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
        [Produto: {content.productId}]
      </div>
    );
  }

  return (
    <section
      style={{
        fontFamily: theme.fontFamily,
        marginBottom: '18pt',
      }}
    >
      {resolved.imageUrl ? (
        <img
          src={resolved.imageUrl}
          alt={resolved.name}
          style={{
            width: '100%',
            maxHeight: '120pt',
            objectFit: 'contain',
            marginBottom: '12pt',
          }}
        />
      ) : null}
      <h1
        style={{
          fontSize: '22pt',
          fontWeight: 700,
          color: c.textPrimary,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          margin: 0,
          marginBottom: '4pt',
        }}
      >
        {resolved.name}
      </h1>
      {resolved.tagline ? (
        <p
          style={{
            fontSize: '10.5pt',
            color: c.textSecondary,
            fontStyle: 'italic',
            margin: 0,
            marginBottom: '8pt',
          }}
        >
          {resolved.tagline}
        </p>
      ) : null}
      {resolved.description ? (
        <p
          style={{
            fontSize: '9pt',
            color: '#4b5563',
            lineHeight: 1.6,
            maxWidth: '160mm',
            margin: 0,
            marginBottom: '4pt',
          }}
        >
          {resolved.description}
        </p>
      ) : null}
      {resolved.mapaRegistration ? (
        <span
          style={{
            display: 'inline-block',
            marginTop: '8pt',
            padding: '2pt 6pt',
            background: c.brandLight,
            border: `1px solid ${c.brandBorder}`,
            borderRadius: '3pt',
            fontSize: '7.5pt',
            fontWeight: 600,
            color: c.brand,
          }}
        >
          MAPA N° {resolved.mapaRegistration}
        </span>
      ) : null}
    </section>
  );
}
