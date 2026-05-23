// apps/portal/src/lib/unread-notifs.ts
//
// Cache do count de notificacoes nao lidas (FIX MÉDIO #12 auditoria).
//
// Problema: cada page render dispara select head:true count em
// `notifications` pro badge no TopNav. Em catálogo público com user
// logado, 10 produtos navegados = 10 round-trips DB.
//
// Solução: unstable_cache do Next por user_id com TTL 30s + tag
// `notif:${user_id}`. Mark-read invalida via revalidateTag.
// Tradeoff aceito: badge pode ficar até 30s stale entre criação de
// notif (via trigger SQL) e exibição. Mesma janela que email Resend
// já tem, então não introduz UX nova.

import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@colheita/auth';

const TTL_SECONDS = 30;

export function notifsTag(userId: string): string {
  return `notif:${userId}`;
}

/**
 * Conta notif nao lidas do user. Cached por 30s via unstable_cache.
 * Usa admin client (service_role) pra evitar passar cookieStore no
 * fn cacheada — RLS bypass OK aqui pq filtramos explicitamente por
 * user_id que vem do JWT validado upstream em requireAuth/getUser.
 */
export async function getUnreadNotifsCount(userId: string): Promise<number> {
  const cachedFn = unstable_cache(
    async (uid: string) => {
      try {
        const admin = createAdminClient();
        const { count } = await admin
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', uid)
          .is('read_at', null);
        return count ?? 0;
      } catch {
        return 0;
      }
    },
    ['portal:unread-notifs-count', userId],
    { revalidate: TTL_SECONDS, tags: [notifsTag(userId)] },
  );
  return cachedFn(userId);
}
