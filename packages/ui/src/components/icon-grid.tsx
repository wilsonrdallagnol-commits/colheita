// packages/ui/src/components/icon-grid.tsx
import type { CompilerTheme, IconGridContent } from './compiler-types.js';
import { deriveColors, sectionTitleStyle } from './compiler-types.js';

interface IconGridProps {
  content: IconGridContent;
  theme: CompilerTheme;
  title?: string;
  /** Número de colunas. Default: auto (responsive). */
  columns?: number;
}

/**
 * Grid de ícones com rótulo e valor opcional. Cada célula exibe um símbolo
 * (emoji ou texto), label e valor numérico/string.
 */
export function IconGrid({ content, theme, title, columns }: IconGridProps) {
  const c = deriveColors(theme);
  const gridCols = columns ? `repeat(${columns}, 1fr)` : 'repeat(auto-fill, minmax(72pt, 1fr))';

  return (
    <div style={{ fontFamily: theme.fontFamily, marginBottom: '16pt' }}>
      {title ? <p style={sectionTitleStyle(theme)}>{title}</p> : null}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: gridCols,
          gap: '8pt',
        }}
      >
        {content.items.map((item) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4pt',
              padding: '10pt 6pt',
              backgroundColor: c.surfaceSubtle,
              borderRadius: '4pt',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '18pt', lineHeight: 1 }}>{item.symbol}</span>
            <span
              style={{
                fontSize: '7pt',
                fontWeight: 600,
                color: c.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {item.label}
            </span>
            {item.value ? (
              <span
                style={{
                  fontSize: '9pt',
                  fontWeight: 700,
                  color: c.textPrimary,
                }}
              >
                {item.value}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
