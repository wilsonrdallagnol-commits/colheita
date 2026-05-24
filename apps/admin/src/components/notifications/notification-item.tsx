'use client';

// apps/admin/src/components/notifications/notification-item.tsx
//
// Click marca como lida + redireciona pro link. Espelha portal mas
// com paleta admin (sem brand-secondary subtleness — direto ao ponto).

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { markNotificationRead } from '@/lib/actions/notifications';
import { formatRelativeTime } from '@/lib/format-relative-time';

interface NotificationItemProps {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  createdAt: string;
  readAt: string | null;
  icon: string;
}

export function NotificationItem({
  id,
  title,
  body,
  link,
  createdAt,
  readAt,
  icon,
}: NotificationItemProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isUnread = !readAt;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (isUnread) await markNotificationRead(id);
      if (link) router.push(link);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: '14px',
        alignItems: 'flex-start',
        padding: '14px 18px',
        border: '1px solid var(--colheita-border-subtle)',
        borderLeft: isUnread
          ? '3px solid var(--colheita-brand-primary)'
          : '1px solid var(--colheita-border-subtle)',
        borderRadius: 'var(--colheita-radius-md)',
        backgroundColor: isUnread
          ? 'var(--colheita-surface-card)'
          : 'var(--colheita-surface-elevated)',
        textAlign: 'left',
        cursor: pending ? 'wait' : 'pointer',
        fontFamily: 'inherit',
        opacity: pending ? 0.6 : 1,
      }}
    >
      <span style={{ fontSize: '1.25rem', lineHeight: 1, marginTop: '2px' }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: '0.9375rem',
            fontWeight: isUnread ? 600 : 500,
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.01em',
            marginBottom: '2px',
          }}
        >
          {title}
        </p>
        {body && (
          <p
            style={{
              margin: 0,
              fontSize: '0.8125rem',
              color: 'var(--colheita-text-secondary)',
              lineHeight: 1.45,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {body}
          </p>
        )}
      </div>
      <time
        style={{
          fontSize: '0.6875rem',
          color: 'var(--colheita-text-tertiary)',
          flexShrink: 0,
          fontFamily: 'var(--font-mono)',
        }}
        dateTime={createdAt}
      >
        {formatRelativeTime(createdAt)}
      </time>
    </button>
  );
}
