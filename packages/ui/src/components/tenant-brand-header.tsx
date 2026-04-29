// packages/ui/src/components/tenant-brand-header.tsx
import type { AutoContent, CompilerTheme } from './compiler-types.js';
import { deriveColors } from './compiler-types.js';

interface TenantBrandHeaderProps {
  content: AutoContent;
  theme: CompilerTheme;
  /** Rótulo do documento exibido no canto direito (ex: "Ficha Técnica") */
  docLabel?: string;
  /** Ano do documento */
  year?: number;
}

/**
 * Cabeçalho da identidade do tenant: logotipo + nome + tagline, com rótulo
 * do tipo de documento no canto oposto. Equivale ao <header> do FichaTecnica.
 */
export function TenantBrandHeader({
  theme,
  docLabel = 'Documento Técnico',
  year,
}: TenantBrandHeaderProps) {
  const c = deriveColors(theme);
  const displayYear = year ?? new Date().getFullYear();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: '12pt',
        borderBottom: `2px solid ${c.brand}`,
        marginBottom: '20pt',
        fontFamily: theme.fontFamily,
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10pt' }}>
        {theme.logoUrl ? (
          <img
            src={theme.logoUrl}
            alt={theme.tenantName}
            style={{ height: '32pt', width: 'auto' }}
          />
        ) : null}
        <div>
          <div
            style={{
              fontSize: '11pt',
              fontWeight: 700,
              color: c.brand,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {theme.tenantName}
          </div>
          {theme.tagline ? (
            <div
              style={{
                fontSize: '7.5pt',
                color: c.textTertiary,
                fontStyle: 'italic',
                marginTop: '1pt',
              }}
            >
              {theme.tagline}
            </div>
          ) : null}
        </div>
      </div>

      {/* Doc label */}
      <div
        style={{
          fontSize: '7.5pt',
          fontWeight: 600,
          color: c.textTertiary,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          textAlign: 'right',
          lineHeight: 1.6,
        }}
      >
        {docLabel}
        <br />
        {displayYear}
      </div>
    </div>
  );
}
