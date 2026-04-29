// packages/ui/src/components/cta-block.tsx
import type { CompilerTheme, CtaContent } from './compiler-types.js';
import { deriveColors } from './compiler-types.js';

interface CtaBlockProps {
  content: CtaContent;
  theme: CompilerTheme;
  /** Alinhamento horizontal do botão. Default: 'left' */
  align?: 'left' | 'center' | 'right';
}

/**
 * Bloco de call-to-action. Renderiza um botão/link com a cor principal do
 * tenant. Em PDF não há interatividade — o `href` é impresso ao lado se
 * fornecido.
 */
export function CtaBlock({ content, theme, align = 'left' }: CtaBlockProps) {
  const c = deriveColors(theme);

  return (
    <div
      style={{
        fontFamily: theme.fontFamily,
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        gap: '4pt',
        marginBottom: '16pt',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          padding: '8pt 20pt',
          backgroundColor: c.brand,
          borderRadius: '4pt',
          fontSize: '9.5pt',
          fontWeight: 600,
          color: '#ffffff',
          letterSpacing: '0.01em',
        }}
      >
        {content.label}
      </div>
      {content.href ? (
        <span
          style={{
            fontSize: '7pt',
            color: c.textMuted,
          }}
        >
          {content.href}
        </span>
      ) : null}
    </div>
  );
}
