// packages/ui/src/components/compiler-types.ts
/**
 * Tipos compartilhados pelos componentes do compiler (@colheita/ui/compiler-blocks).
 *
 * Esses componentes são usados pelo @colheita/generator para renderizar layouts
 * extraídos pelo @colheita/layout-inference em PDF/PNG via Playwright.
 * Usam EXCLUSIVAMENTE inline styles — sem Tailwind, sem classes CSS.
 */

import type { CSSProperties } from 'react';

// ============================================================================
// Theme
// ============================================================================

/**
 * Tokens mínimos de tema passados do tenant para cada bloco compiler.
 * Extraídos do Supabase (tenants.theme_tokens) antes da renderização.
 */
export interface CompilerTheme {
  /** Cor principal do tenant (hex). Ex: '#166534' */
  brandColor: string;
  /** Cor de acento/destaque (hex). Default: brandColor com 15% opacity */
  accentColor?: string;
  /** Família tipográfica principal. Ex: 'Inter' */
  fontFamily: string;
  /** Nome do tenant para branding */
  tenantName: string;
  /** URL pública do logotipo do tenant (opcional) */
  logoUrl?: string;
  /** Tagline do tenant (opcional) */
  tagline?: string;
}

export const DEFAULT_THEME: CompilerTheme = {
  brandColor: '#166534',
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  tenantName: 'Argho AgriSciences',
};

// ============================================================================
// Content kinds (espelhando RegionContent do compiler)
// ============================================================================

export interface HeadlineContent {
  kind: 'headline';
  lines: string[];
}

export interface FeatureListContent {
  kind: 'feature_list';
  items: Array<{ icon?: string; title: string; description?: string }>;
}

export interface IconGridContent {
  kind: 'icon_grid';
  items: Array<{ symbol: string; label: string; value?: string }>;
}

export interface ProductRefContent {
  kind: 'product_ref';
  productId: string;
}

export interface ProductDataGridContent {
  kind: 'product_data_grid';
  productId: string;
  fields: string[];
}

export interface MediaContent {
  kind: 'media';
  assetId: string;
}

export interface CtaContent {
  kind: 'cta';
  label: string;
  href?: string;
}

export interface FooterContent {
  kind: 'footer';
  tenantBranding: true;
}

export interface QrContent {
  kind: 'qr';
  data: string;
}

export interface LegalContent {
  kind: 'legal';
  text: string;
}

export interface AutoContent {
  kind: 'auto';
}

// ============================================================================
// Shared color helpers
// ============================================================================

/** Deriva tokens de cor comuns a partir da cor principal do tema. */
export function deriveColors(theme: CompilerTheme) {
  const brand = theme.brandColor;
  return {
    brand,
    brandLight: hexWithOpacity(brand, 0.08),
    brandBorder: hexWithOpacity(brand, 0.25),
    textPrimary: '#0f1117',
    textSecondary: '#374151',
    textTertiary: '#6b7280',
    textMuted: '#9ca3af',
    border: '#e5e7eb',
    borderSubtle: '#f3f4f6',
    surfaceSubtle: '#f9fafb',
  };
}

/** Constrói um background rgba a partir de hex + alpha (0–1). */
function hexWithOpacity(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return hex;
  return `rgba(${r},${g},${b},${alpha})`;
}

// ============================================================================
// Shared style factory
// ============================================================================

export function sectionTitleStyle(theme: CompilerTheme): CSSProperties {
  return {
    fontSize: '7pt',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: theme.brandColor,
    marginBottom: '8pt',
    paddingBottom: '3pt',
    borderBottom: `1px solid ${hexWithOpacity(theme.brandColor, 0.2)}`,
  };
}
