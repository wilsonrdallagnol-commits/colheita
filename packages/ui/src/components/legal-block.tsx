// packages/ui/src/components/legal-block.tsx
import type { CompilerTheme, LegalContent } from './compiler-types.js';
import { deriveColors } from './compiler-types.js';

interface LegalBlockProps {
  content: LegalContent;
  theme: CompilerTheme;
}

/**
 * Bloco de texto legal / disclaimer. Fontes pequenas, cor muted,
 * sem decoração visual pesada. Usado em rodapés ou seções regulatórias.
 */
export function LegalBlock({ content, theme }: LegalBlockProps) {
  const c = deriveColors(theme);

  return (
    <div
      style={{
        fontFamily: theme.fontFamily,
        padding: '8pt 0',
        borderTop: `1px solid ${c.borderSubtle}`,
        marginTop: '8pt',
      }}
    >
      <p
        style={{
          fontSize: '7pt',
          color: c.textMuted,
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {content.text}
      </p>
    </div>
  );
}
