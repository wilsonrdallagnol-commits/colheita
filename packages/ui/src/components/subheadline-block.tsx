// packages/ui/src/components/subheadline-block.tsx
import type { CompilerTheme, HeadlineContent } from './compiler-types.js';
import { deriveColors } from './compiler-types.js';

interface SubheadlineBlockProps {
  content: HeadlineContent;
  theme: CompilerTheme;
}

/**
 * Bloco de subheadline / seção secundária. Menor que HeadlineBlock,
 * usado para títulos de seção ou mensagens de apoio.
 */
export function SubheadlineBlock({ content, theme }: SubheadlineBlockProps) {
  const c = deriveColors(theme);
  const [first, ...rest] = content.lines;

  return (
    <div style={{ fontFamily: theme.fontFamily, marginBottom: '12pt' }}>
      {first ? (
        <h2
          style={{
            fontSize: '16pt',
            fontWeight: 600,
            color: c.textPrimary,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            margin: 0,
            marginBottom: rest.length > 0 ? '4pt' : 0,
          }}
        >
          {first}
        </h2>
      ) : null}
      {rest.map((line) => (
        <p
          key={line}
          style={{
            fontSize: '10pt',
            color: c.textSecondary,
            margin: 0,
            marginBottom: '2pt',
            lineHeight: 1.5,
          }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}
