// apps/admin/src/lib/format-currency.ts
//
// Espelho de apps/portal/src/lib/format-currency.ts.
// Mantém cópia local pra evitar @colheita/ui agora.

export function formatCurrency(value: string | number | null | undefined): string {
  const n = value === null || value === undefined ? 0 : Number(value);
  if (Number.isNaN(n)) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0);
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}
