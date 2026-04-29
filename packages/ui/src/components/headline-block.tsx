// packages/ui/src/components/headline-block.tsx
import type { CompilerTheme, HeadlineContent } from './compiler-types.js';
import { deriveColors } from './compiler-types.js';

interface HeadlineBlockProps {
  content: HeadlineContent;
  theme: CompilerTheme;
}

/**
 * Bloco de headline principal. Exibe cada linha em tamanho decrescente:
 * primeira linha é o H1 (grande e bold), linhas seguintes são subtítulos.
 */
export function HeadlineBlock({ content, theme }: HeadlineBlockProps) {
  const c = deriveColors(theme);
  const [first, ...rest] = content.lines;

  return (
    <div style={{ fontFamily: theme.fontFamily, marginBottom: '16pt' }}>
      {first ? (
        <h1
          style={{
            fontSize: '28pt',
            fontWeight: 700,
            color: c.textPrimary,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            margin: 0,
            marginBottom: rest.length > 0 ? '6pt' : 0,
          }}
        >
          {first}
        </h1>
      ) : null}
      {rest.map((line) => (
        <p
          key={line}
          style={{
            fontSize: '13pt',
            color: c.textSecondary,
            margin: 0,
            marginBottom: '3pt',
            lineHeight: 1.4,
          }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}
