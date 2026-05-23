// apps/website/src/lib/features.ts
//
// Feature flags do site institucional Argho.
// Para reativar uma feature, mude `false` para `true` e faça novo deploy.

export const FEATURES = {
  /**
   * Plataforma Colheita (admin/portal) — colheita.arghoagrosciences.com
   *
   * Quando true: aparecem CTAs, nav button, footer link e secao
   *   dedicada na home apontando para a plataforma.
   * Quando false: tudo escondido. Plataforma continua acessivel pela
   *   URL direta mas o site institucional nao a expoe.
   *
   * Bloqueado em 2026-05-22 a pedido do fundador ate a plataforma
   * estar pronta para acesso publico.
   */
  colheitaPlatform: false,
} as const;
