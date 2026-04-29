// packages/ui/src/components/testimonial.tsx
import type { CompilerTheme, HeadlineContent } from './compiler-types.js';
import { deriveColors } from './compiler-types.js';

interface TestimonialProps {
  content: HeadlineContent;
  theme: CompilerTheme;
  /** Atribuição (nome, cargo, empresa). Usa a última linha de content.lines. */
  attribution?: string;
}

/**
 * Bloco de depoimento / citação. A primeira linha é o texto da citação
 * (exibido em destaque itálico com aspas), a segunda linha é a atribuição.
 */
export function Testimonial({ content, theme }: TestimonialProps) {
  const c = deriveColors(theme);
  const [quote, attribution] = content.lines;

  return (
    <div
      style={{
        fontFamily: theme.fontFamily,
        padding: '14pt 18pt',
        borderLeft: `4px solid ${c.brand}`,
        backgroundColor: c.brandLight,
        borderRadius: '0 4pt 4pt 0',
        marginBottom: '16pt',
      }}
    >
      {quote ? (
        <p
          style={{
            fontSize: '11pt',
            fontStyle: 'italic',
            color: c.textPrimary,
            lineHeight: 1.6,
            margin: 0,
            marginBottom: attribution ? '8pt' : 0,
          }}
        >
          "{quote}"
        </p>
      ) : null}
      {attribution ? (
        <p
          style={{
            fontSize: '8pt',
            fontWeight: 600,
            color: c.textTertiary,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          — {attribution}
        </p>
      ) : null}
    </div>
  );
}
