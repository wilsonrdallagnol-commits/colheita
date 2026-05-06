// apps/portal/src/lib/portal-config.ts
// Helpers puros (testaveis sem mock) para detectar configuracao do portal
// e sanitizar inputs do usuario antes de queries Supabase.

/**
 * True quando NEXT_PUBLIC_SUPABASE_URL aponta para um Supabase de producao real.
 * False quando esta vazio, eh placeholder, ou aponta para localhost (dev).
 *
 * Usado pela home (e futuras telas) para decidir se mostra catalogo
 * ou um PlaceholderHero "em construcao" quando o user ainda nao
 * configurou Supabase prod no Vercel.
 */
export function isSupabaseConfigured(url: string | undefined | null): boolean {
  if (!url) return false;
  if (url.length === 0) return false;
  if (url.includes('placeholder')) return false;
  if (url.includes('localhost')) return false;
  if (url.includes('127.0.0.1')) return false;
  return true;
}

/**
 * Sanitiza input do usuario antes de interpolar em filtro PostgREST `or()`.
 *
 * PostgREST tem uma DSL onde virgulas separam predicados, parenteses agrupam
 * e asteriscos podem aparecer em ilike. Input do user pode quebrar a DSL ou
 * injetar predicados extras se interpolado direto. Esta funcao remove esses
 * caracteres e limita o tamanho a 200 chars (longo o suficiente para qualquer
 * busca legitima, curto o suficiente pra evitar abuse).
 *
 * Exemplo de attack neutralizado:
 *   input: "x),deleted_at.is.null"
 *   raw:   query.or("name.ilike.%x),deleted_at.is.null%, ...")  // mostra deletados
 *   safe:  query.or("name.ilike.%xdeleted_at.is.null%, ...")    // ilike literal
 */
export function sanitizeSearchQuery(q: string): string {
  return q.replace(/[,*()]/g, '').slice(0, 200);
}
