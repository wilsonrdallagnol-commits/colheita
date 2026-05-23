'use client';

// apps/admin/src/components/nav/notifications-inbox.tsx
//
// Inbox de notificacoes operacionais no header do sidebar. Mostra:
//   - Badge com contagem total de urgent (critical + warning)
//   - Click expande dropdown com lista
//
// Notificacoes vem ja pre-processadas do server (lib/notifications.ts).
// Sem estado de "lido" persistido — toda navegacao re-buscar do server.

import {
  Bell,
  FileWarning,
  MessageSquare,
  ShieldAlert,
  ShoppingCart,
  Sparkles,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Notification } from '@/lib/notifications';

interface NotificationsInboxProps {
  notifications: Notification[];
}

const KIND_META = {
  compliance: { label: 'Compliance', icon: ShieldAlert, color: '#b45309' },
  lead: { label: 'Comercial', icon: ShoppingCart, color: 'var(--colheita-brand-primary)' },
  material: { label: 'Materiais', icon: Sparkles, color: 'var(--colheita-text-secondary)' },
  personal: { label: 'Pra você', icon: MessageSquare, color: 'var(--colheita-brand-primary)' },
} as const;

const URGENCY_COLOR = {
  critical: 'var(--colheita-danger, #ef4444)',
  warning: '#b45309',
  info: 'var(--colheita-text-tertiary)',
} as const;

export function NotificationsInbox({ notifications }: NotificationsInboxProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const urgentCount = notifications.filter(
    (n) => n.urgency === 'critical' || n.urgency === 'warning',
  ).length;

  // Click fora fecha
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // ESC fecha
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={toggle}
        aria-label={`Notificações (${notifications.length})`}
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: 'var(--colheita-radius-md)',
          border: '1px solid var(--colheita-border-subtle)',
          backgroundColor: open ? 'var(--colheita-surface-elevated)' : 'transparent',
          cursor: 'pointer',
          color: 'var(--colheita-text-secondary)',
          position: 'relative',
          padding: 0,
          transition: 'background-color 150ms ease, border-color 150ms ease',
        }}
      >
        <Bell size={14} strokeWidth={1.75} />
        {urgentCount > 0 ? (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              minWidth: '16px',
              height: '16px',
              borderRadius: '8px',
              padding: '0 4px',
              backgroundColor: 'var(--colheita-danger, #ef4444)',
              color: '#ffffff',
              fontSize: '0.625rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
              border: '2px solid var(--colheita-surface-card, #fff)',
            }}
          >
            {urgentCount > 99 ? '99+' : urgentCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notificações"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 60,
            width: 'min(360px, calc(100vw - 48px))',
            maxHeight: '480px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--colheita-border)',
            borderRadius: 'var(--colheita-radius-lg)',
            boxShadow: 'var(--shadow-card-elevated, 0 8px 24px rgba(0,0,0,0.12))',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderBottom: '1px solid var(--colheita-border-subtle)',
            }}
          >
            <p
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--colheita-text-primary)',
                margin: 0,
              }}
            >
              Inbox · {notifications.length} {notifications.length === 1 ? 'alerta' : 'alertas'}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              style={{
                border: 'none',
                background: 'none',
                color: 'var(--colheita-text-tertiary)',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>

          {/* Lista */}
          {notifications.length === 0 ? (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: 'var(--colheita-text-tertiary)',
              }}
            >
              <FileWarning
                size={24}
                strokeWidth={1.5}
                style={{ marginBottom: '8px', opacity: 0.5 }}
              />
              <p style={{ fontSize: '0.8125rem', margin: '0 0 4px' }}>Nada urgente agora.</p>
              <p style={{ fontSize: '0.6875rem', margin: 0 }}>
                Alertas de compliance, leads parados e gerações com erro aparecem aqui.
              </p>
            </div>
          ) : (
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {notifications.map((n, i) => {
                const meta = KIND_META[n.kind];
                const Icon = meta.icon;
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '12px 14px',
                      textDecoration: 'none',
                      borderBottom:
                        i < notifications.length - 1
                          ? '1px solid var(--colheita-border-subtle)'
                          : 'none',
                      transition: 'background-color 150ms ease',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: 'var(--colheita-radius-sm)',
                        backgroundColor: 'color-mix(in srgb, currentColor 12%, transparent)',
                        color: meta.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      <Icon size={12} strokeWidth={1.75} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          color: meta.color,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          margin: '0 0 2px',
                        }}
                      >
                        {meta.label}
                      </p>
                      <p
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'var(--colheita-text-primary)',
                          margin: '0 0 2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {n.title}
                      </p>
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: URGENCY_COLOR[n.urgency],
                          margin: 0,
                          lineHeight: 1.4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {n.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
