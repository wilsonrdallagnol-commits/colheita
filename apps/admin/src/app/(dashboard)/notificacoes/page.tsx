// apps/admin/src/app/(dashboard)/notificacoes/page.tsx
//
// Inbox completa de notificacoes do user admin (espelha portal). Lista
// 50 mais recentes separadas em nao-lidas + anteriores, action pra
// marcar todas como lidas.

import { createServerClient, requireAuth } from '@colheita/auth';
import { CheckCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { NotificationItem } from '@/components/notifications/notification-item';
import { markAllNotificationsRead } from '@/lib/actions/notifications';

export const metadata: Metadata = { title: 'Notificações' };

const TYPE_ICON: Record<string, string> = {
  'support.reply': '💬',
  'support.user_reply': '💬',
  'certification.issued': '🎓',
  'order.synced': '📦',
};

export default async function NotificacoesAdminPage() {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { data: notifsData } = await supabase
    .from('notifications')
    .select('id, type, title, body, link, read_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const notifs = notifsData ?? [];
  const unread = notifs.filter((n) => !n.read_at);
  const read = notifs.filter((n) => n.read_at);

  return (
    <div style={{ padding: '32px 24px', maxWidth: '720px', margin: '0 auto' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '16px',
          marginBottom: '28px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--colheita-brand-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '8px',
            }}
          >
            Inbox pessoal
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(1.5rem, 2.4vw, 1.875rem)',
              fontWeight: 600,
              color: 'var(--colheita-text-primary)',
              letterSpacing: '-0.025em',
            }}
          >
            {unread.length > 0 ? `${unread.length} novas` : 'Tudo em dia'}
          </h1>
        </div>
        {unread.length > 0 && (
          <form action={markAllNotificationsRead}>
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--colheita-radius-md)',
                border: '1px solid var(--colheita-border)',
                backgroundColor: 'var(--colheita-surface-elevated)',
                color: 'var(--colheita-text-secondary)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <CheckCheck size={14} strokeWidth={2} />
              Marcar todas como lidas
            </button>
          </form>
        )}
      </header>

      {notifs.length === 0 ? (
        <div
          style={{
            padding: '40px 24px',
            textAlign: 'center',
            color: 'var(--colheita-text-tertiary)',
            backgroundColor: 'var(--colheita-surface-elevated)',
            border: '1px solid var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
            fontSize: '0.875rem',
          }}
        >
          Nenhuma notificação pessoal. Avisos operacionais (compliance, leads, materiais) aparecem
          no sino do sidebar.
        </div>
      ) : (
        <>
          {unread.length > 0 && (
            <section style={{ marginBottom: '32px' }}>
              <h2
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '12px',
                }}
              >
                Não lidas ({unread.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {unread.map((n) => (
                  <NotificationItem
                    key={n.id}
                    id={n.id}
                    type={n.type}
                    title={n.title}
                    body={n.body}
                    link={n.link}
                    createdAt={n.created_at}
                    readAt={null}
                    icon={TYPE_ICON[n.type] ?? '🔔'}
                  />
                ))}
              </div>
            </section>
          )}

          {read.length > 0 && (
            <section>
              <h2
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '12px',
                }}
              >
                Anteriores ({read.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {read.map((n) => (
                  <NotificationItem
                    key={n.id}
                    id={n.id}
                    type={n.type}
                    title={n.title}
                    body={n.body}
                    link={n.link}
                    createdAt={n.created_at}
                    readAt={n.read_at}
                    icon={TYPE_ICON[n.type] ?? '🔔'}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
