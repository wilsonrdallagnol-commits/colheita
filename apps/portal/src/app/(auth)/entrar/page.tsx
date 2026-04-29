// apps/portal/src/app/(auth)/entrar/page.tsx
'use client';

import { Button, Input } from '@colheita/ui';
import { useActionState, useId } from 'react';
import { signInWithMagicLink } from './actions.js';

export const metadata = { title: 'Entrar' };

export default function EntrarPage() {
  const [state, action, pending] = useActionState(signInWithMagicLink, null);
  const emailId = useId();

  if (state !== null && !state.error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--colheita-surface-background)',
          padding: '24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--colheita-radius-full)',
              backgroundColor: 'var(--colheita-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="Link enviado com sucesso"
              role="img"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'var(--colheita-text-primary)',
              marginBottom: '8px',
              letterSpacing: '-0.01em',
            }}
          >
            Link enviado
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--colheita-text-secondary)',
              lineHeight: '1.5',
            }}
          >
            Verifique seu email e clique no link para acessar a área exclusiva.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--colheita-surface-background)',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '360px' }}>
        {/* Marca */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--colheita-radius-md)',
                backgroundColor: 'var(--colheita-brand-primary)',
              }}
            />
            <span
              style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'var(--colheita-text-primary)',
                letterSpacing: '-0.025em',
              }}
            >
              Argho
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-tertiary)' }}>
            Portal de distribuidores
          </p>
        </div>

        {/* Formulário */}
        <div
          style={{
            backgroundColor: 'var(--colheita-surface-card)',
            border: '1px solid var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
            padding: '28px',
          }}
        >
          <h1
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--colheita-text-primary)',
              marginBottom: '4px',
              letterSpacing: '-0.015em',
            }}
          >
            Entrar
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--colheita-text-secondary)',
              marginBottom: '24px',
            }}
          >
            Receba um link de acesso no seu email.
          </p>

          <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label
                htmlFor={emailId}
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: '500',
                  color: 'var(--colheita-text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Email
              </label>
              <Input
                id={emailId}
                name="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                required
                disabled={pending}
              />
            </div>

            {state?.error && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--colheita-danger)' }}>
                {state.error}
              </p>
            )}

            <Button type="submit" disabled={pending} style={{ marginTop: '4px' }}>
              {pending ? 'Enviando...' : 'Enviar link de acesso'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
