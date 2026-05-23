// apps/portal/src/lib/academia-url.ts
//
// Helper pra montar URLs do app Academia (Next.js separado, porta 3002 em
// dev / academia.arghoagrosciences.com em prod). Cookie auth do Supabase é
// compartilhado por domínio, então sessão já propaga sem SSO.

const BASE = process.env.NEXT_PUBLIC_ACADEMIA_URL ?? 'http://localhost:3002';

export function academiaTrackUrl(slug: string): string {
  return `${BASE}/trilhas/${slug}`;
}

export function academiaTrackStartUrl(slug: string): string {
  return `${BASE}/trilhas/${slug}/iniciar`;
}

export function academiaProgressUrl(): string {
  return `${BASE}/meu-progresso`;
}

export function academiaCertificateUrl(certificateNo: string): string {
  return `${BASE}/meu-progresso/certificados/${certificateNo}`;
}
