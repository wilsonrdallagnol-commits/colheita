// apps/admin/src/lib/escape-html.ts
//
// Espelho de apps/portal/src/lib/escape-html.ts.
// Usado em apps/admin/src/lib/actions/suporte.ts pra escapar
// content antes de interpolar em HTML do email Resend pro
// distribuidor.

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(s: string): string {
  if (!s) return '';
  return s.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
}
