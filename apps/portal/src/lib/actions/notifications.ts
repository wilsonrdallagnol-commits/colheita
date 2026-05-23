// apps/portal/src/lib/actions/notifications.ts
//
// Server actions pra marcar notif como lida (uma ou todas).

'use server';

import { createServerClient, requireAuth } from '@colheita/auth';
import { captureError } from '@colheita/observability';
import { revalidatePath, revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { notifsTag } from '@/lib/unread-notifs';

export async function markNotificationRead(notificationId: string): Promise<void> {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', user.id)
    .is('read_at', null);

  if (error) {
    captureError(error, { context: 'portal.notifications.markRead' });
  }

  // FIX MÉDIO #11 (auditoria): badge no TopNav vem do layout SSR.
  // Sem revalidate, bell mostra contagem stale ate proxima nav.
  // FIX MÉDIO #12: invalida tag do cache unstable_cache (count notif).
  revalidateTag(notifsTag(user.id));
  revalidatePath('/', 'layout');
  revalidatePath('/conta/notificacoes');
}

export async function markAllNotificationsRead(): Promise<void> {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null);

  if (error) {
    captureError(error, { context: 'portal.notifications.markAllRead' });
  }

  revalidateTag(notifsTag(user.id));
  revalidatePath('/', 'layout');
  revalidatePath('/conta/notificacoes');
  revalidatePath('/conta');
}
