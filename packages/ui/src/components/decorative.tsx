// packages/ui/src/components/decorative.tsx
import type { AutoContent, CompilerTheme } from './compiler-types.js';
import { deriveColors } from './compiler-types.js';

interface DecorativeProps {
  content: AutoContent;
  theme: CompilerTheme;
  /**
   * Variante do elemento decorativo:
   * - 'rule' — linha horizontal
   * - 'spacer' — espaço em branco (height em pt)
   * - 'accent-bar' — barra colorida com a cor do tenant
   */
  variant?: 'rule' | 'spacer' | 'accent-bar';
  heightPt?: number;
}

/**
 * Elemento decorativo sem conteúdo semântico: separadores, espaçadores
 * e barras coloridas de branding.
 */
export function Decorative({ theme, variant = 'rule', heightPt }: DecorativeProps) {
  const c = deriveColors(theme);

  if (variant === 'spacer') {
    return <div style={{ height: `${heightPt ?? 16}pt` }} aria-hidden="true" />;
  }

  if (variant === 'accent-bar') {
    return (
      <div
        aria-hidden="true"
        style={{
          height: `${heightPt ?? 4}pt`,
          backgroundColor: c.brand,
          borderRadius: '2pt',
          marginBottom: '16pt',
        }}
      />
    );
  }

  // rule (default)
  return (
    <hr
      style={{
        border: 'none',
        borderTop: `1px solid ${c.border}`,
        margin: `${heightPt ?? 16}pt 0`,
      }}
    />
  );
}
