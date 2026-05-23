// apps/portal/src/lib/escape-html.ts
//
// Escape de HTML pra interpolação segura em templates de email Resend
// (lib/actions/suporte.ts) e qualquer outro lugar que monte HTML por
// concatenação. Conjunto mínimo de chars perigosos: & < > " '.
//
// Não cobre URLs/atributos JS — pra esses, use atributos data-* ou
// montagem via DOM API. Foco aqui: conteúdo de texto dentro de <p>,
// <h3>, <pre> etc. dos emails Argho.

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
