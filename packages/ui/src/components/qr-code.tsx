// packages/ui/src/components/qr-code.tsx
import type { CompilerTheme, QrContent } from './compiler-types.js';
import { deriveColors } from './compiler-types.js';

interface QrCodeProps {
  content: QrContent;
  theme: CompilerTheme;
  /**
   * QR code como data URL (image/png ou image/svg+xml em base64).
   * Gerado externamente antes do render (ex: via `qrcode` npm package).
   * Se não fornecido, exibe placeholder com a URL abreviada.
   */
  resolvedDataUrl?: string;
  label?: string;
  sizePt?: number;
}

/**
 * Bloco de QR code. Em PDF, o QR code é pré-gerado como data URL (base64)
 * e renderizado como <img>. Sem dangerouslySetInnerHTML.
 */
export function QrCode({ content, theme, resolvedDataUrl, label, sizePt = 64 }: QrCodeProps) {
  const c = deriveColors(theme);

  return (
    <div
      style={{
        fontFamily: theme.fontFamily,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4pt',
        marginBottom: '12pt',
      }}
    >
      {resolvedDataUrl ? (
        <img
          src={resolvedDataUrl}
          alt={`QR: ${content.data}`}
          style={{
            width: `${sizePt}pt`,
            height: `${sizePt}pt`,
            display: 'block',
          }}
        />
      ) : (
        <div
          style={{
            width: `${sizePt}pt`,
            height: `${sizePt}pt`,
            border: `1px solid ${c.border}`,
            borderRadius: '3pt',
            backgroundColor: c.surfaceSubtle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: c.textMuted,
            fontSize: '6pt',
            textAlign: 'center',
            padding: '4pt',
          }}
        >
          QR
          <br />
          {content.data.length > 24 ? `${content.data.slice(0, 24)}…` : content.data}
        </div>
      )}
      {label ? (
        <span
          style={{
            fontSize: '6.5pt',
            color: c.textTertiary,
            textAlign: 'center',
            maxWidth: `${sizePt + 16}pt`,
          }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}
