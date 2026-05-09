// apps/admin/src/app/(auth)/login/page.tsx
'use client';

// Login alinhado com identidade Argho oficial (white-first editorial,
// blue/green, Geist 700, sem dark/Linear). Email + senha em vez de magic link.

import { Button, Input } from '@colheita/ui';
import { useActionState, useId, useState } from 'react';
import { requestPasswordReset, signInWithPassword } from './actions.js';

type Mode = 'signin' | 'reset';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin');
  const [signinState, signinAction, signinPending] = useActionState(signInWithPassword, null);
  const [resetState, resetAction, resetPending] = useActionState(requestPasswordReset, null);

  const resetSent = resetState?.resetSent === true;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        padding: '24px',
        backgroundImage:
          'radial-gradient(ellipse at top, rgba(24, 48, 144, 0.04), transparent 60%)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '380px' }}>
        {/* Marca Argho — header simples editorial */}
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
            Argho · Painel
          </p>
          <h1
            className="argho-display"
            style={{
              fontSize: 'clamp(1.75rem, 2.4vw, 2.25rem)',
              color: '#0a0a0a',
              margin: 0,
            }}
          >
            Programa <span style={{ color: 'var(--colheita-brand-primary)' }}>Colheita</span>
          </h1>
        </header>

        {mode === 'reset' && resetSent ? (
          <ResetSentState onBack={() => setMode('signin')} />
        ) : mode === 'reset' ? (
          <ResetForm
            action={resetAction}
            pending={resetPending}
            error={resetState?.error}
            onBack={() => setMode('signin')}
          />
        ) : (
          <SignInForm
            action={signinAction}
            pending={signinPending}
            error={signinState?.error}
            onForgot={() => setMode('reset')}
          />
        )}

        <p
          style={{
            marginTop: '32px',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--colheita-text-tertiary)',
          }}
        >
          © Argho AgriSciences · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

// ── Sign in form ─────────────────────────────────────────────────────────────

function SignInForm({
  action,
  pending,
  error,
  onForgot,
}: {
  action: (payload: FormData) => void;
  pending: boolean;
  error?: string;
  onForgot: () => void;
}) {
  const emailId = useId();
  const passwordId = useId();

  return (
    <Card>
      <h2
        style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: '#0a0a0a',
          letterSpacing: '-0.015em',
          margin: '0 0 4px',
        }}
      >
        Entrar
      </h2>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--colheita-text-secondary)',
          margin: '0 0 24px',
        }}
      >
        Acesse com seu email corporativo e senha.
      </p>

      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Field id={emailId} label="Email">
          <Input
            id={emailId}
            name="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            required
            disabled={pending}
          />
        </Field>

        <Field
          id={passwordId}
          label="Senha"
          rightAction={
            <button
              type="button"
              onClick={onForgot}
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--colheita-brand-primary)',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              Esqueci a senha
            </button>
          }
        >
          <Input
            id={passwordId}
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            minLength={6}
            disabled={pending}
          />
        </Field>

        {error ? <ErrorMessage>{error}</ErrorMessage> : null}

        <Button type="submit" disabled={pending} style={{ marginTop: '6px' }}>
          {pending ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </Card>
  );
}

// ── Reset form ───────────────────────────────────────────────────────────────

function ResetForm({
  action,
  pending,
  error,
  onBack,
}: {
  action: (payload: FormData) => void;
  pending: boolean;
  error?: string;
  onBack: () => void;
}) {
  const emailId = useId();

  return (
    <Card>
      <button
        type="button"
        onClick={onBack}
        style={{
          fontSize: '0.75rem',
          fontWeight: 500,
          color: 'var(--colheita-text-tertiary)',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        ← Voltar
      </button>

      <h2
        style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: '#0a0a0a',
          letterSpacing: '-0.015em',
          margin: '0 0 4px',
        }}
      >
        Redefinir senha
      </h2>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--colheita-text-secondary)',
          margin: '0 0 24px',
        }}
      >
        Enviaremos um link pra você criar uma senha nova.
      </p>

      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Field id={emailId} label="Email">
          <Input
            id={emailId}
            name="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            required
            disabled={pending}
          />
        </Field>

        {error ? <ErrorMessage>{error}</ErrorMessage> : null}

        <Button type="submit" disabled={pending} style={{ marginTop: '6px' }}>
          {pending ? 'Enviando…' : 'Enviar link de redefinição'}
        </Button>
      </form>
    </Card>
  );
}

// ── Reset sent state ─────────────────────────────────────────────────────────

function ResetSentState({ onBack }: { onBack: () => void }) {
  return (
    <Card>
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '999px',
          backgroundColor: 'var(--colheita-brand-secondary-soft)',
          color: 'var(--colheita-brand-secondary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="Sucesso"
        >
          <title>Sucesso</title>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2
        style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: '#0a0a0a',
          letterSpacing: '-0.015em',
          margin: '0 0 6px',
        }}
      >
        Link enviado
      </h2>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--colheita-text-secondary)',
          margin: '0 0 20px',
          lineHeight: 1.55,
        }}
      >
        Se o email estiver cadastrado, você recebe o link de redefinição em alguns segundos.
      </p>
      <button
        type="button"
        onClick={onBack}
        style={{
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'var(--colheita-brand-primary)',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        ← Voltar pro login
      </button>
    </Card>
  );
}

// ── Building blocks ──────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--colheita-border)',
        borderRadius: 'var(--colheita-radius-lg)',
        padding: '28px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {children}
    </div>
  );
}

function Field({
  id,
  label,
  rightAction,
  children,
}: {
  id: string;
  label: string;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px',
        }}
      >
        <label
          htmlFor={id}
          style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--colheita-text-secondary)',
          }}
        >
          {label}
        </label>
        {rightAction}
      </div>
      {children}
    </div>
  );
}

function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      style={{
        fontSize: '0.8125rem',
        color: 'var(--colheita-danger)',
        margin: 0,
        padding: '10px 12px',
        borderRadius: '8px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
      }}
    >
      {children}
    </p>
  );
}
