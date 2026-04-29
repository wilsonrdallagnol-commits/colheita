// packages/ui/src/components/badge-strip.tsx
import type { CompilerTheme, IconGridContent } from './compiler-types.js';
import { deriveColors } from './compiler-types.js';

interface BadgeStripProps {
  content: IconGridContent;
  theme: CompilerTheme;
}

/**
 * Faixa horizontal de badges/certificações. Cada item do icon_grid é exibido
 * como um chip com símbolo + label + valor opcional.
 */
export function BadgeStrip({ content, theme }: BadgeStripProps) {
  const c = deriveColors(theme);

  return (
    <div
      style={{
        fontFamily: theme.fontFamily,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6pt',
        marginBottom: '12pt',
      }}
    >
      {content.items.map((item) => (
        <div
          key={item.label}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4pt',
            padding: '3pt 8pt',
            backgroundColor: c.brandLight,
            border: `1px solid ${c.brandBorder}`,
            borderRadius: '20pt',
            fontSize: '7.5pt',
            color: c.brand,
            fontWeight: 600,
          }}
        >
          {item.symbol ? (
            <span style={{ fontSize: '10pt', lineHeight: 1 }}>{item.symbol}</span>
          ) : null}
          <span>{item.label}</span>
          {item.value ? <span style={{ opacity: 0.75 }}>· {item.value}</span> : null}
        </div>
      ))}
    </div>
  );
}
