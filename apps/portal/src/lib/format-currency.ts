// apps/portal/src/lib/format-currency.ts
//
// Formata valor numerico/string como BRL no formato PT-BR.
// Antes duplicado inline em 3 arquivos do portal (/conta/page,
// /conta/pedidos/page, /conta/pedidos/[id]/page). Mantém comportamento
// idêntico: usa Intl.NumberFormat com style currency BRL.

/**
 * Formata como BRL PT-BR. Aceita string (DB retorna numeric como string)
 * ou number. NaN/null/undefined retornam 'R$ 0,00'.
 *
 * @example
 *   formatCurrency('123.45') // 'R$ 123,45'
 *   formatCurrency(1500) // 'R$ 1.500,00'
 */
export function formatCurrency(value: string | number | null | undefined): string {
  const n = value === null || value === undefined ? 0 : Number(value);
  if (Number.isNaN(n)) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0);
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}
