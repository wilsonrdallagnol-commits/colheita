/**
 * System Design Tokens — Programa Colheita
 *
 * Tokens globais de sistema — não customizáveis por tenant.
 * Definem superfícies, tipografia (escala), espaçamento, elevação, glow
 * e transições. Publicados como CSS custom properties no global stylesheet
 * de cada app.
 *
 * Padrão de referência: Linear, Stripe, Vercel, Apple.
 * Princípios:
 *   - Dark-first: todas as superfícies são dark, light deriva disso
 *   - Cada pixel tem razão de existir
 *   - Tipografia editorial com letter-spacing negativo em headings
 *   - Glow com intenção — cada efeito tem um propósito semântico
 *   - Whitespace é elemento de design, não ausência de conteúdo
 */

// ============================================================================
// SUPERFÍCIES
// Background com undertone mínimo verde (oklch hue 148) — imperceptível
// isolado, mas cria coerência sutil quando a brand color aparece sobre ele.
// Padrão de contraste: Linear (#0A0A0B) + leve identidade de marca.
// ============================================================================
export const SURFACE = {
  background: 'oklch(0.08 0.004 148)', // base da app — near-black com tint brand
  elevated: 'oklch(0.11 0.004 148)', // sidebar, nav, painéis laterais
  card: 'oklch(0.13 0.004 148)', // cards, linhas de tabela, itens de lista
  overlay: 'oklch(0.16 0.004 148)', // dropdowns, tooltips, popovers
  hover: 'oklch(0.18 0.004 148)', // hover state em itens interativos
  borderSubtle: 'oklch(0.22 0.003 148)', // divisórias internas, separadores
  border: 'oklch(0.27 0.003 148)', // bordas de input, card, select
  borderStrong: 'oklch(0.38 0.003 148)', // foco, emphasis, selected state
} as const;

// ============================================================================
// TEXTO
// Hierarquia via peso e opacidade — nunca via cor chamativa.
// Padrão Vercel/Linear: primary quase-branco, secondary meio-cinza,
// tertiary discreto, disabled quase-invisível.
// ============================================================================
export const TEXT = {
  primary: 'oklch(0.97 0 0)', // conteúdo principal, headings
  secondary: 'oklch(0.65 0 0)', // texto de suporte, subtítulos
  tertiary: 'oklch(0.48 0 0)', // metadados, timestamps, labels
  disabled: 'oklch(0.35 0 0)', // estados desabilitados
  inverse: 'oklch(0.10 0 0)', // texto sobre fundos claros (ex: botão primário)
} as const;

// ============================================================================
// ESCALA TIPOGRÁFICA
// Base 16px (1rem). Progressão modular ~1.25.
// xs-sm: metadata e apoio / base-lg: corpo / xl+: hierarquia de headings.
// ============================================================================
export const TYPE_SCALE = {
  xs: '0.75rem', // 12px — labels, badges, carimbo de tempo
  sm: '0.875rem', // 14px — corpo secundário, caption, helper text
  base: '1rem', // 16px — corpo principal, parágrafos
  lg: '1.125rem', // 18px — lead, destaque inline
  xl: '1.25rem', // 20px — título de seção menor
  '2xl': '1.5rem', // 24px — heading de card, título de modal
  '3xl': '1.875rem', // 30px — heading de página, título de painel
  '4xl': '2.25rem', // 36px — hero secundário
  '5xl': '3rem', // 48px — hero principal, landing
  '6xl': '3.75rem', // 60px — display, splash
} as const;

// ============================================================================
// LETTER-SPACING
// Negativo em headings — padrão Stripe/Linear.
// Nunca usar positivo em texto de parágrafo.
// ============================================================================
export const TRACKING = {
  tightest: '-0.04em', // display, headings ≥ 5xl
  tight: '-0.025em', // headings 3xl–4xl
  snug: '-0.01em', // headings xl–2xl
  normal: '0em', // corpo, texto corrido
  wide: '0.03em', // labels em uppercase (sparingly)
  wider: '0.08em', // all-caps metadata
} as const;

// ============================================================================
// LINE-HEIGHT
// ============================================================================
export const LEADING = {
  none: '1', // display unitário — nunca em multilinha
  tight: '1.25', // headings grandes
  snug: '1.375', // headings médios
  normal: '1.5', // corpo padrão
  relaxed: '1.625', // corpo com breathing room (artigos, docs)
  loose: '2', // código, pre-formatado
} as const;

// ============================================================================
// FONT-WEIGHT
// Restraint: usar poucos pesos. 400 corpo, 500-600 emphasis, 700 headings.
// ============================================================================
export const WEIGHT = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// ============================================================================
// ESPAÇAMENTO
// Base 4px. Escala linear até 8, depois múltiplos de 8.
// Usar com intenção — whitespace é elemento de design.
// ============================================================================
export const SPACING = {
  px: '1px',
  '0.5': '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
} as const;

// ============================================================================
// BORDER RADIUS
// md (8px) é o padrão — inputs, botões. lg (12px) para cards.
// xl+ apenas modais e superfícies grandes. full para avatares/badges.
// ============================================================================
export const RADIUS = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
} as const;

// ============================================================================
// SOMBRAS / ELEVAÇÃO
// Dark-first: sombras são opacidade preta sobre fundo escuro.
// Nunca coloridas — o glow é o sistema para cor com luz.
// xs: feedback tátil mínimo / sm–md: cards / lg–2xl: modais e sheets.
// ============================================================================
export const SHADOW = {
  none: 'none',
  xs: '0 1px 2px oklch(0 0 0 / 0.35)',
  sm: '0 2px 4px oklch(0 0 0 / 0.35), 0 1px 2px oklch(0 0 0 / 0.25)',
  md: '0 4px 12px oklch(0 0 0 / 0.4), 0 2px 4px oklch(0 0 0 / 0.3)',
  lg: '0 8px 24px oklch(0 0 0 / 0.45), 0 4px 8px oklch(0 0 0 / 0.3)',
  xl: '0 16px 48px oklch(0 0 0 / 0.5), 0 8px 16px oklch(0 0 0 / 0.35)',
  '2xl': '0 24px 64px oklch(0 0 0 / 0.55), 0 12px 24px oklch(0 0 0 / 0.4)',
} as const;

// ============================================================================
// GLOW
// Usado com extrema moderação — cada valor tem semântica estrita.
// Nunca decorativo. Sempre comunica estado ou intenção.
//
// brand  → ação primária concluída, elemento brand em destaque
// ai     → processamento de IA, blueprint sendo gerado, inferência ativa
// gold   → conquista, certificação emitida, material exportado, milestone
// danger → erro crítico, ação destrutiva, perda de dados iminente
// ============================================================================
export const GLOW = {
  brand: '0 0 24px oklch(0.58 0.165 148 / 0.35), 0 0 6px oklch(0.58 0.165 148 / 0.2)',
  ai: '0 0 32px oklch(0.65 0.14 250 / 0.35), 0 0 8px oklch(0.65 0.14 250 / 0.2)',
  gold: '0 0 24px oklch(0.73 0.135 78 / 0.3), 0 0 6px oklch(0.73 0.135 78 / 0.15)',
  danger: '0 0 20px oklch(0.58 0.21 22 / 0.35), 0 0 6px oklch(0.58 0.21 22 / 0.2)',
} as const;

// ============================================================================
// TRANSIÇÕES
// fast: feedback imediato (hover, check) / base: padrão / slow: layout shifts
// spring: entrada de modais e drawers — cubic-bezier com micro-bounce
// ============================================================================
export const TRANSITION = {
  fast: '100ms ease',
  base: '200ms ease',
  slow: '300ms ease',
  spring: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// ============================================================================
// CSS CUSTOM PROPERTY MAP
// Referência canônica para o global stylesheet das apps.
// Formato: '--colheita-{categoria}-{nome}': valor
// ============================================================================
export const CSS_VAR_MAP = {
  // Superfícies
  '--colheita-surface-background': SURFACE.background,
  '--colheita-surface-elevated': SURFACE.elevated,
  '--colheita-surface-card': SURFACE.card,
  '--colheita-surface-overlay': SURFACE.overlay,
  '--colheita-surface-hover': SURFACE.hover,
  '--colheita-border-subtle': SURFACE.borderSubtle,
  '--colheita-border': SURFACE.border,
  '--colheita-border-strong': SURFACE.borderStrong,
  // Texto
  '--colheita-text-primary': TEXT.primary,
  '--colheita-text-secondary': TEXT.secondary,
  '--colheita-text-tertiary': TEXT.tertiary,
  '--colheita-text-disabled': TEXT.disabled,
  '--colheita-text-inverse': TEXT.inverse,
  // Radius
  '--colheita-radius-sm': RADIUS.sm,
  '--colheita-radius-md': RADIUS.md,
  '--colheita-radius-lg': RADIUS.lg,
  '--colheita-radius-xl': RADIUS.xl,
  '--colheita-radius-full': RADIUS.full,
  // Sombras
  '--colheita-shadow-xs': SHADOW.xs,
  '--colheita-shadow-sm': SHADOW.sm,
  '--colheita-shadow-md': SHADOW.md,
  '--colheita-shadow-lg': SHADOW.lg,
  '--colheita-shadow-xl': SHADOW.xl,
  // Transições
  '--colheita-transition-fast': TRANSITION.fast,
  '--colheita-transition-base': TRANSITION.base,
  '--colheita-transition-slow': TRANSITION.slow,
  '--colheita-transition-spring': TRANSITION.spring,
} as const;

export type SystemTokens = {
  surface: typeof SURFACE;
  text: typeof TEXT;
  typeScale: typeof TYPE_SCALE;
  tracking: typeof TRACKING;
  leading: typeof LEADING;
  weight: typeof WEIGHT;
  spacing: typeof SPACING;
  radius: typeof RADIUS;
  shadow: typeof SHADOW;
  glow: typeof GLOW;
  transition: typeof TRANSITION;
};

export const SYSTEM_TOKENS: SystemTokens = {
  surface: SURFACE,
  text: TEXT,
  typeScale: TYPE_SCALE,
  tracking: TRACKING,
  leading: LEADING,
  weight: WEIGHT,
  spacing: SPACING,
  radius: RADIUS,
  shadow: SHADOW,
  glow: GLOW,
  transition: TRANSITION,
};
