// packages/ui/src/components/feature-list.tsx
import type { CompilerTheme, FeatureListContent } from './compiler-types.js';
import { deriveColors, sectionTitleStyle } from './compiler-types.js';

interface FeatureListProps {
  content: FeatureListContent;
  theme: CompilerTheme;
  title?: string;
}

/**
 * Lista de funcionalidades / diferenciais. Cada item pode ter um ícone emoji,
 * título em negrito e descrição opcional.
 */
export function FeatureList({ content, theme, title }: FeatureListProps) {
  const c = deriveColors(theme);

  return (
    <div style={{ fontFamily: theme.fontFamily, marginBottom: '16pt' }}>
      {title ? <p style={sectionTitleStyle(theme)}>{title}</p> : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8pt' }}>
        {content.items.map((item) => (
          <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '8pt' }}>
            {item.icon ? (
              <span
                style={{
                  fontSize: '12pt',
                  lineHeight: 1,
                  flexShrink: 0,
                  marginTop: '1pt',
                }}
              >
                {item.icon}
              </span>
            ) : (
              <span
                style={{
                  width: '5pt',
                  height: '5pt',
                  borderRadius: '50%',
                  backgroundColor: c.brand,
                  flexShrink: 0,
                  marginTop: '4pt',
                }}
              />
            )}
            <div>
              <span
                style={{
                  fontSize: '9pt',
                  fontWeight: 600,
                  color: c.textPrimary,
                }}
              >
                {item.title}
              </span>
              {item.description ? (
                <p
                  style={{
                    fontSize: '8.5pt',
                    color: c.textSecondary,
                    margin: 0,
                    marginTop: '1pt',
                    lineHeight: 1.5,
                  }}
                >
                  {item.description}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
