// apps/admin/src/lib/search.ts
//
// Helpers de sanitizacao de input para queries Supabase / PostgREST no admin.
//
// Por que existe: PostgREST tem uma DSL onde virgulas separam predicados,
// parenteses agrupam e asteriscos funcionam como wildcard. Quando o input do
// usuario (?q=) eh interpolado direto em `query.or(`name.ilike.%${q}%, ...`)`,
// um termo com virgula quebra a query (UX bug) e em teoria poderia injetar
// predicados extras pra burlar filtros (security bug, mesmo que o endpoint
// seja auth-gated).
//
// Espelha o helper `sanitizeSearchQuery` do portal (apps/portal/src/lib/portal-config.ts).
// Mantidos separados porque admin/portal sao apps independentes — duplicar 4
// linhas eh barato e evita uma dependencia compartilhada so pra isso.

/**
 * Sanitiza input de busca antes de interpolar em filtro PostgREST `or()`.
 *
 * - Remove `,*()` que sao caracteres de controle da DSL do PostgREST
 * - Limita a 100 chars (longo o suficiente pra qualquer busca legitima)
 *
 * Exemplo: "trichoderma, (Sp.)*" -> "trichoderma  Sp"
 */
export function sanitizeSearchQuery(q: string): string {
  return q.replace(/[,*()]/g, '').slice(0, 100);
}
