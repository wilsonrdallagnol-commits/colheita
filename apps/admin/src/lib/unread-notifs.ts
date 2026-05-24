// apps/admin/src/lib/unread-notifs.ts
//
// Cache do count de notificacoes nao lidas (FIX MÉDIO #12 auditoria).
// Espelha apps/portal/src/lib/unread-notifs.ts pra simetria.

import { createAdminClient } from '@colheita/auth';
import { unstable_cache } from 'next/cache';

const TTL_SECONDS = 30;

export function notifsTag(userId: string): string {
  return `notif:${userId}`;
}

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
    ['admin:unread-notifs-count', userId],
    { revalidate: TTL_SECONDS, tags: [notifsTag(userId)] },
  );
  return cachedFn(userId);
}
