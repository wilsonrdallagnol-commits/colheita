/**
 * Tema Argho — identidade visual do tenant primário da plataforma.
 *
 * Argho Agrosciences: precisão técnica + agro premium brasileiro.
 * Produzido por /hm-designer (2026-04-26).
 *
 * Filosofia visual:
 *   Não é "verde natureza". É precisão agrícola — a cor de um campo
 *   ao anoitecer visto de um dashboard de satélite. Técnico, sofisticado,
 *   enraizado no território sem ser folclórico.
 *
 * Referências: Linear × Stripe × campo às 22h com dados na tela.
 *
 * Validado contra:
 *   - Dark-first: ✅ surfaces definidas em system.ts com undertone brand
 *   - Tipografia editorial: ✅ Geist display + Inter body + letter-spacing negativo
 *   - Diferenciação: ✅ paleta exclusiva — verde floresta técnico + ouro da colheita
 *   - Sem energia de template: ✅ combinação de cores não existe em nenhum UI kit padrão
 *   - Sem generic SaaS: ✅ sem azul padrão, sem cinza neutro, sem verde "sucesso" genérico
 */

import type { TenantThemeTokens } from './theme.js';

export const ARGHO_THEME_TOKENS: TenantThemeTokens = {
  version: 1,

  brand: {
    // Verde floresta técnico
    // oklch(0.58 0.165 148) — chroma alto o suficiente pra ser vibrante em dark mode,
    // hue 148 (verde com leve teal). Não é o verde-limão de "eco", não é o verde-folha
    // de "natural". É o verde de um display de análise de solo às 3 da manhã.
    primary: 'oklch(0.58 0.165 148)',
    primaryForeground: 'oklch(0.98 0 0)',

    // Ouro da colheita
    // oklch(0.73 0.135 78) — trigo maduro, yield confirmado, resultado.
    // Não é amarelo, não é laranja. É ouro quente com dignidade.
    // Usado em CTAs secundários, badges de aprovação, estados de conclusão.
    secondary: 'oklch(0.73 0.135 78)',
    secondaryForeground: 'oklch(0.10 0 0)',

    // Teal técnico — AI, análise, dados em movimento
    // oklch(0.64 0.13 195) — posicionado entre o verde do brand e o azul de informação.
    // Reservado para elementos relacionados à IA: spinner de inferência, blueprint status,
    // indicadores de processamento. Não usar em texto ou elementos estáticos.
    accent: 'oklch(0.64 0.13 195)',
    accentForeground: 'oklch(0.98 0 0)',
  },

  semantic: {
    // Verde success não é o mesmo do brand — mais saturado, mais próximo do "certo"
    success: 'oklch(0.65 0.18 145)',
    // Warning em âmbar — lê naturalmente como atenção sem alarme
    warning: 'oklch(0.75 0.16 78)',
    // Danger: vermelho com leve hue para reduzir harshness no dark mode
    danger: 'oklch(0.58 0.21 22)',
    // Info: azul técnico — relatórios, dados, referências
    info: 'oklch(0.64 0.14 250)',
  },

  typography: {
    // Geist: headings e display — preciso, sem serifas ornamentais, desenvolvido pela Vercel
    // Inter como fallback universal — o padrão de facto de UI de qualidade
    fontDisplay: '"Geist", "Inter", -apple-system, system-ui, sans-serif',

    // Inter puro: corpo de texto, parágrafos, labels
    // Consistência máxima em leitura corrida
    fontBody: '"Inter", -apple-system, system-ui, sans-serif',

    // JetBrains Mono: código, dados de composição química, valores técnicos
    // Diferencia visualmente qualquer número ou código de texto editorial
    fontMono: '"JetBrains Mono", "Fira Code", "Cascadia Code", ui-monospace, monospace',
  },

  radius: {
    // 8px como base — inputs, botões, badges
    // Sistema derivado de system.ts: sm=4px, md=8px, lg=12px, xl=16px
    base: '8px',
  },
};

/**
 * Argho como string de seed (para pnpm db:seed).
 * Validado pelo TenantThemeTokensSchema em runtime.
 */
export const ARGHO_TENANT_SLUG = 'argho' as const;
export const ARGHO_TENANT_NAME = 'Argho Agrosciences' as const;
