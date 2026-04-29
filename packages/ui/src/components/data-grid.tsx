// packages/ui/src/components/data-grid.tsx
import type { CompilerTheme, IconGridContent, ProductDataGridContent } from './compiler-types.js';
import { deriveColors, sectionTitleStyle } from './compiler-types.js';

interface DataGridProps {
  content: ProductDataGridContent | IconGridContent;
  theme: CompilerTheme;
  title?: string;
  /** Linhas resolvidas para product_data_grid (campo → valor). */
  resolvedRows?: Array<{ key: string; value: string }>;
}

/**
 * Grade de dados estruturados: tabela de especificações técnicas (key/value)
 * ou grade de ícones. Usa layout flex com separadores sutis.
 */
export function DataGrid({ content, theme, title, resolvedRows }: DataGridProps) {
  const c = deriveColors(theme);

  // icon_grid mode
  if (content.kind === 'icon_grid') {
    return (
      <div style={{ fontFamily: theme.fontFamily, marginBottom: '16pt' }}>
        {title ? <p style={sectionTitleStyle(theme)}>{title}</p> : null}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80pt, 1fr))',
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
                gap: '3pt',
                padding: '8pt 4pt',
                border: `1px solid ${c.border}`,
                borderRadius: '4pt',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '16pt' }}>{item.symbol}</span>
              <span style={{ fontSize: '7pt', color: c.textTertiary, fontWeight: 600 }}>
                {item.label}
              </span>
              {item.value ? (
                <span style={{ fontSize: '8.5pt', fontWeight: 700, color: c.textPrimary }}>
                  {item.value}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // product_data_grid mode
  const rows = resolvedRows ?? content.fields.map((f) => ({ key: f, value: '—' }));

  return (
    <div style={{ fontFamily: theme.fontFamily, marginBottom: '16pt' }}>
      {title ? <p style={sectionTitleStyle(theme)}>{title}</p> : null}
      <div>
        {rows.map((row) => (
          <div
            key={row.key}
            style={{
              display: 'flex',
              padding: '4pt 0',
              borderBottom: `1px solid ${c.borderSubtle}`,
              gap: '12pt',
            }}
          >
            <span
              style={{
                fontSize: '8.5pt',
                color: c.textSecondary,
                fontWeight: 500,
                minWidth: '45%',
                flexShrink: 0,
              }}
            >
              {row.key}
            </span>
            <span style={{ fontSize: '8.5pt', color: c.textPrimary }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
