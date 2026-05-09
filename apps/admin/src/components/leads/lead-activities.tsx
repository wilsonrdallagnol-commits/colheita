// apps/admin/src/components/leads/lead-activities.tsx
'use client';

// Camada 7 mov 2 — timeline de activities do lead.
// Form inline (textarea + select kind + submit) + lista vertical com icone
// por kind. Append-only — atividades viram historico imutavel.

import { Button, Textarea } from '@colheita/ui';
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

const KIND_OPTIONS: Array<{ value: LeadActivityKind; label: string; icon: string }> = [
  { value: 'call', label: 'Ligação', icon: '📞' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'meeting', label: 'Reunião', icon: '🤝' },
  { value: 'note', label: 'Anotação', icon: '📝' },
  { value: 'other', label: 'Outro', icon: '·' },
];

const KIND_LABEL: Record<LeadActivityKind, { label: string; icon: string; color: string }> = {
  call: { label: 'Ligação', icon: '📞', color: 'var(--colheita-brand-primary)' },
  whatsapp: { label: 'WhatsApp', icon: '💬', color: 'var(--colheita-success)' },
  email: { label: 'Email', icon: '✉️', color: 'var(--colheita-brand-primary)' },
  meeting: { label: 'Reunião', icon: '🤝', color: 'var(--colheita-brand-gold)' },
  note: { label: 'Anotação', icon: '📝', color: 'var(--colheita-text-tertiary)' },
  other: { label: 'Outro', icon: '·', color: 'var(--colheita-text-tertiary)' },
};

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
          padding: '14px',
          borderRadius: 'var(--colheita-radius-md)',
          border: '1px solid var(--colheita-border-subtle)',
          backgroundColor: 'var(--colheita-surface-elevated)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
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
            {KIND_OPTIONS.map((opt, idx) => {
              const id = `${uid}-kind-${opt.value}`;
              return (
                <span key={opt.value}>
                  <input
                    type="radio"
                    id={id}
                    name="kind"
                    value={opt.value}
                    defaultChecked={idx === 0}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    disabled={pending}
                  />
                  <label
                    htmlFor={id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      border: '1px solid var(--colheita-border)',
                      fontSize: '0.75rem',
                      cursor: pending ? 'not-allowed' : 'pointer',
                      backgroundColor: 'var(--colheita-surface-sunken, #fff)',
                      color: 'var(--colheita-text-secondary)',
                    }}
                  >
                    <span aria-hidden="true">{opt.icon}</span>
                    {opt.label}
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

      {/* Timeline */}
      {activities.length === 0 ? (
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--colheita-text-tertiary)',
            textAlign: 'center',
            padding: '16px',
            margin: 0,
          }}
        >
          Nenhuma atividade ainda. Registre o primeiro contato acima.
        </p>
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
            const meta = KIND_LABEL[activity.kind];
            const author = activity.author?.full_name ?? activity.author?.email ?? '—';
            return (
              <li
                key={activity.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: 'var(--colheita-radius-md)',
                  border: '1px solid var(--colheita-border-subtle)',
                  backgroundColor: 'var(--colheita-surface-elevated)',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'color-mix(in srgb, currentColor 8%, transparent)',
                    color: meta.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                  }}
                  aria-hidden="true"
                >
                  {meta.icon}
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
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: meta.color,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {meta.label}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        color: 'var(--colheita-text-tertiary)',
                      }}
                    >
                      {formatRelative(activity.created_at)} · {author}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--colheita-text-primary)',
                      lineHeight: 1.5,
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
