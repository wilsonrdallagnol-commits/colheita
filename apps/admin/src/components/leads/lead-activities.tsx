// apps/admin/src/components/leads/lead-activities.tsx
'use client';

// Camada 7 mov 2 — timeline de activities do lead.
// Form inline (textarea + select kind + submit) + lista vertical com icone
// por kind. Append-only — atividades viram historico imutavel.

import { Button, Textarea } from '@colheita/ui';
import {
  Circle,
  FileText,
  type LucideIcon,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  Users,
} from 'lucide-react';
import { useActionState, useEffect, useId, useRef } from 'react';
import { createLeadActivity, type LeadActivityKind } from '@/lib/actions/leads';

interface ActivityRow {
  id: string;
  kind: LeadActivityKind;
  body: string;
  created_at: string;
  author: { full_name: string | null; email: string | null } | null;
}

interface LeadActivitiesProps {
  leadId: string;
  activities: ActivityRow[];
}

// Icones Lucide com strokeWidth 1.5 (Linear-style editorial), nao emoji.
// Emoji renderiza diferente em Win/Mac/iOS/Android — quebra craft cross-platform.
interface KindMeta {
  label: string;
  Icon: LucideIcon;
  color: string;
}

const KIND_META: Record<LeadActivityKind, KindMeta> = {
  call: { label: 'Ligação', Icon: Phone, color: 'var(--admin-pipeline)' },
  whatsapp: { label: 'WhatsApp', Icon: MessageCircle, color: 'var(--admin-positive)' },
  email: { label: 'Email', Icon: Mail, color: 'var(--admin-pipeline)' },
  meeting: { label: 'Reunião', Icon: Users, color: 'var(--admin-attention)' },
  note: { label: 'Anotação', Icon: FileText, color: 'var(--admin-neutral)' },
  other: { label: 'Outro', Icon: Circle, color: 'var(--admin-neutral)' },
};

const KIND_OPTIONS: LeadActivityKind[] = ['call', 'whatsapp', 'email', 'meeting', 'note', 'other'];

function formatRelative(iso: string): string {
  const now = Date.now();
  const target = new Date(iso).getTime();
  const diffMin = Math.round((now - target) / (1000 * 60));
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min atrás`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h atrás`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d atrás`;
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function LeadActivities({ leadId, activities }: LeadActivitiesProps) {
  const action = createLeadActivity.bind(null, leadId);
  const [state, formAction, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  const uid = useId();

  // M2 fix 2026-05-09: reset em useEffect, nao durante render (anti-pattern React).
  // Reset apos submit bem-sucedido (state vazio = sem fieldErrors + sem error).
  useEffect(() => {
    const isSuccess =
      state !== null &&
      state !== undefined &&
      !state.error &&
      !state.fieldErrors?.kind &&
      !state.fieldErrors?.body;
    if (isSuccess && formRef.current) {
      formRef.current.reset();
    }
  }, [state]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Form de nova activity */}
      <form
        ref={formRef}
        action={formAction}
        style={{
          padding: '18px',
          borderRadius: '12px',
          boxShadow: 'var(--admin-shadow-card)',
          backgroundColor: 'var(--colheita-surface-elevated)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Kind selector — pills horizontais */}
        <div>
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--colheita-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '8px',
            }}
          >
            Tipo
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {KIND_OPTIONS.map((kind, idx) => {
              const meta = KIND_META[kind];
              const Icon = meta.Icon;
              const id = `${uid}-kind-${kind}`;
              return (
                <span key={kind}>
                  <input
                    type="radio"
                    id={id}
                    name="kind"
                    value={kind}
                    defaultChecked={idx === 0}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    disabled={pending}
                  />
                  <label
                    htmlFor={id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      boxShadow: 'inset 0 0 0 1px var(--colheita-border-subtle)',
                      fontSize: '0.75rem',
                      letterSpacing: '-0.005em',
                      cursor: pending ? 'not-allowed' : 'pointer',
                      backgroundColor: 'var(--colheita-surface-elevated)',
                      color: 'var(--colheita-text-secondary)',
                      transition: 'box-shadow 150ms ease, color 150ms ease',
                    }}
                  >
                    <Icon size={13} strokeWidth={1.5} aria-hidden="true" />
                    {meta.label}
                  </label>
                </span>
              );
            })}
          </div>
          {state?.fieldErrors?.kind && (
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--colheita-danger)',
                marginTop: '4px',
              }}
            >
              {state.fieldErrors.kind}
            </p>
          )}
        </div>

        {/* Body */}
        <div>
          <Textarea
            name="body"
            placeholder="O que aconteceu? (max 5000 chars)"
            rows={3}
            disabled={pending}
            required
          />
          {state?.fieldErrors?.body && (
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--colheita-danger)',
                marginTop: '4px',
              }}
            >
              {state.fieldErrors.body}
            </p>
          )}
        </div>

        {state?.error && (
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--colheita-danger)',
              margin: 0,
            }}
          >
            {state.error}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? 'Registrando…' : 'Registrar atividade'}
          </Button>
        </div>
      </form>

      {/* Timeline — empty state desenhado, nao texto generico centralizado */}
      {activities.length === 0 ? (
        <div
          style={{
            padding: '40px 24px',
            borderRadius: '12px',
            boxShadow: 'inset 0 0 0 1px var(--colheita-border-subtle)',
            backgroundColor: 'transparent',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Sparkles
            size={20}
            strokeWidth={1.5}
            color="var(--colheita-text-tertiary)"
            style={{ opacity: 0.6 }}
            aria-hidden="true"
          />
          <p
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--colheita-text-secondary)',
              letterSpacing: '-0.005em',
              margin: 0,
            }}
          >
            Sem histórico ainda
          </p>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--colheita-text-tertiary)',
              maxWidth: '36ch',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Registre a primeira ligação ou peça pro agente capturar o último contato do WhatsApp.
          </p>
        </div>
      ) : (
        <ol
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {activities.map((activity) => {
            const meta = KIND_META[activity.kind] ?? KIND_META.other;
            const Icon = meta.Icon;
            const author = activity.author?.full_name ?? activity.author?.email ?? '—';
            return (
              <li
                key={activity.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  boxShadow: 'var(--admin-shadow-card)',
                  backgroundColor: 'var(--colheita-surface-elevated)',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
                    color: meta.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-hidden="true"
                >
                  <Icon size={14} strokeWidth={1.5} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '8px',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                        color: meta.color,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {meta.label}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        color: 'var(--colheita-text-tertiary)',
                        letterSpacing: '-0.005em',
                      }}
                    >
                      {formatRelative(activity.created_at)} · {author}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--colheita-text-primary)',
                      lineHeight: 1.55,
                      letterSpacing: '-0.005em',
                      whiteSpace: 'pre-wrap' as const,
                      margin: 0,
                      wordBreak: 'break-word',
                    }}
                  >
                    {activity.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
