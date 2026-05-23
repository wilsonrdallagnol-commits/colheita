// apps/portal/src/lib/actions/notifications.ts
//
// Server actions pra marcar notif como lida (uma ou todas).

'use server';

import { createServerClient, requireAuth } from '@colheita/auth';
import { captureError } from '@colheita/observability';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

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
  // Sem revalidate layout, bell mostra contagem stale ate proxima
  // navegacao client-side. revalidatePath('/', 'layout') força
  // re-render do layout root (cobre /conta + /public).
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

  revalidatePath('/', 'layout');
  revalidatePath('/conta/notificacoes');
  revalidatePath('/conta');
}
