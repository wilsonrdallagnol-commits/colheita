// packages/ui/src/components/tenant-footer.tsx
import type { CompilerTheme, FooterContent } from './compiler-types.js';
import { deriveColors } from './compiler-types.js';

interface TenantFooterProps {
  content: FooterContent;
  theme: CompilerTheme;
  /** Nome do documento ou produto exibido à direita */
  documentTitle?: string;
  year?: number;
}

/**
 * Rodapé padronizado do tenant: copyright à esquerda, título do documento
 * à direita. Posicionamento absoluto — use dentro de um container relativo.
 */
export function TenantFooter({ theme, documentTitle, year }: TenantFooterProps) {
  const c = deriveColors(theme);
  const displayYear = year ?? new Date().getFullYear();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '6pt',
        borderTop: `1px solid ${c.border}`,
        fontFamily: theme.fontFamily,
      }}
    >
      <span
        style={{
          fontSize: '7pt',
          color: c.textMuted,
        }}
      >
        © {displayYear} {theme.tenantName} — Documento de uso técnico e comercial.
      </span>
      {documentTitle ? (
        <span
          style={{
            fontSize: '7pt',
            color: c.textMuted,
          }}
        >
          {documentTitle}
        </span>
      ) : null}
    </div>
  );
}
