// apps/admin/src/app/(auth)/login/page.tsx
'use client';

// Login com email + senha. Substitui magic link (loop infinito reportado pelo
// fundador 2026-05-09). Visual aplicando /hm-designer:
//  - Sem caixa cinza padrao SaaS — split editorial brand/form
//  - Tipografia editorial (clamp, tracking -0.035em, weight 500)
//  - Tokens OKLCH, zero hex hardcoded
//  - Lucide icons strokeWidth 1.5
//  - Empty/feedback states desenhados

import { Button, Input } from '@colheita/ui';
import { ArrowLeft, CheckCircle2, KeyRound, Mail, Sparkles } from 'lucide-react';
import { useActionState, useId, useState } from 'react';
import { requestPasswordReset, signInWithPassword } from './actions.js';

type Mode = 'signin' | 'reset';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin');
  const [signinState, signinAction, signinPending] = useActionState(signInWithPassword, null);
  const [resetState, resetAction, resetPending] = useActionState(requestPasswordReset, null);
  const emailId = useId();
  const passwordId = useId();
  const resetEmailId = useId();

  const error = mode === 'signin' ? signinState?.error : resetState?.error;
  const resetSent = resetState?.resetSent === true;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        backgroundColor: 'var(--colheita-surface-background)',
      }}
    >
      {/* Lado esquerdo — brand editorial Argho */}
      <aside
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(32px, 4vw, 64px)',
          backgroundColor: 'var(--colheita-surface-card)',
          backgroundImage:
            'radial-gradient(ellipse at top right, color-mix(in srgb, var(--colheita-brand-primary) 14%, transparent), transparent 60%)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--colheita-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} strokeWidth={1.5} color="var(--colheita-text-inverse)" />
          </div>
          <span
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--colheita-text-primary)',
              letterSpacing: '-0.005em',
            }}
          >
            Argho
          </span>
        </div>

        <div style={{ maxWidth: '480px' }}>
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 500,
              color: 'var(--colheita-text-tertiary)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              margin: '0 0 16px',
            }}
          >
            Painel administrativo
          </p>
          <h2
            style={{
              fontSize: 'clamp(2rem, 3vw, 3rem)',
              fontWeight: 500,
              color: 'var(--colheita-text-primary)',
              letterSpacing: '-0.045em',
              lineHeight: 1.05,
              margin: '0 0 20px',
            }}
          >
            Catálogo, propostas e compliance —{' '}
            <span style={{ color: 'var(--colheita-brand-primary)' }}>em um lugar só.</span>
          </h2>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--colheita-text-secondary)',
              letterSpacing: '-0.005em',
              maxWidth: '52ch',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            A Colheita orquestra o ciclo comercial agro: do registro MAPA ao pedido faturado. Cada
            lead, cada material, cada decisão — auditável e contextual.
          </p>
        </div>

        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--colheita-text-tertiary)',
            letterSpacing: '-0.005em',
            margin: 0,
          }}
        >
          © Argho AgriSciences · {new Date().getFullYear()}
        </p>
      </aside>

      {/* Lado direito — form */}
      <section
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(24px, 4vw, 48px)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '380px' }}>
          {mode === 'reset' && resetSent ? (
            <ResetSentState onBack={() => setMode('signin')} />
          ) : mode === 'reset' ? (
            <ResetForm
              emailId={resetEmailId}
              action={resetAction}
              pending={resetPending}
              error={resetState?.error}
              onBack={() => setMode('signin')}
            />
          ) : (
            <SignInForm
              emailId={emailId}
              passwordId={passwordId}
              action={signinAction}
              pending={signinPending}
              error={error}
              onForgot={() => setMode('reset')}
            />
          )}
        </div>
      </section>
    </div>
  );
}

// ── Sign in form ─────────────────────────────────────────────────────────────

function SignInForm({
  emailId,
  passwordId,
  action,
  pending,
  error,
  onForgot,
}: {
  emailId: string;
  passwordId: string;
  action: (payload: FormData) => void;
  pending: boolean;
  error?: string;
  onForgot: () => void;
}) {
  return (
    <>
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: 'clamp(1.5rem, 2.2vw, 2rem)',
            fontWeight: 500,
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.035em',
            lineHeight: 1.1,
            margin: '0 0 8px',
          }}
        >
          Bem-vindo de volta
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--colheita-text-secondary)',
            letterSpacing: '-0.005em',
            margin: 0,
          }}
        >
          Acesse com seu email corporativo e senha.
        </p>
      </div>

      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <FieldGroup id={emailId} label="Email" icon={<Mail size={14} strokeWidth={1.5} />}>
          <Input
            id={emailId}
            name="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            required
            disabled={pending}
          />
        </FieldGroup>

        <FieldGroup
          id={passwordId}
          label="Senha"
          icon={<KeyRound size={14} strokeWidth={1.5} />}
          rightAction={
            <button
              type="button"
              onClick={onForgot}
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--colheita-text-tertiary)',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                letterSpacing: '-0.005em',
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
            placeholder="•••••••••"
            autoComplete="current-password"
            required
            minLength={6}
            disabled={pending}
          />
        </FieldGroup>

        {error ? <ErrorMessage>{error}</ErrorMessage> : null}

        <Button type="submit" disabled={pending} style={{ marginTop: '4px' }}>
          {pending ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </>
  );
}

// ── Reset form ───────────────────────────────────────────────────────────────

function ResetForm({
  emailId,
  action,
  pending,
  error,
  onBack,
}: {
  emailId: string;
  action: (payload: FormData) => void;
  pending: boolean;
  error?: string;
  onBack: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: 'var(--colheita-text-tertiary)',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          marginBottom: '24px',
          letterSpacing: '-0.005em',
        }}
      >
        <ArrowLeft size={12} strokeWidth={1.5} />
        Voltar
      </button>

      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: 'clamp(1.5rem, 2.2vw, 2rem)',
            fontWeight: 500,
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.035em',
            lineHeight: 1.1,
            margin: '0 0 8px',
          }}
        >
          Redefinir senha
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--colheita-text-secondary)',
            letterSpacing: '-0.005em',
            margin: 0,
          }}
        >
          Enviaremos um link pra você criar uma senha nova.
        </p>
      </div>

      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <FieldGroup id={emailId} label="Email" icon={<Mail size={14} strokeWidth={1.5} />}>
          <Input
            id={emailId}
            name="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            required
            disabled={pending}
          />
        </FieldGroup>

        {error ? <ErrorMessage>{error}</ErrorMessage> : null}

        <Button type="submit" disabled={pending} style={{ marginTop: '4px' }}>
          {pending ? 'Enviando…' : 'Enviar link de redefinição'}
        </Button>
      </form>
    </>
  );
}

// ── Reset sent state ─────────────────────────────────────────────────────────

function ResetSentState({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: `color-mix(in srgb, var(--admin-positive) 18%, transparent)`,
          color: 'var(--admin-positive)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}
      >
        <CheckCircle2 size={22} strokeWidth={1.5} />
      </div>
      <h1
        style={{
          fontSize: 'clamp(1.5rem, 2.2vw, 2rem)',
          fontWeight: 500,
          color: 'var(--colheita-text-primary)',
          letterSpacing: '-0.035em',
          lineHeight: 1.1,
          margin: '0 0 12px',
        }}
      >
        Link enviado
      </h1>
      <p
        style={{
          fontSize: '0.9375rem',
          color: 'var(--colheita-text-secondary)',
          letterSpacing: '-0.005em',
          maxWidth: '34ch',
          margin: '0 auto 28px',
          lineHeight: 1.55,
        }}
      >
        Se o email estiver cadastrado, você recebe o link de redefinição em alguns segundos.
      </p>
      <button
        type="button"
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'var(--colheita-brand-primary)',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          letterSpacing: '-0.005em',
        }}
      >
        <ArrowLeft size={13} strokeWidth={1.5} />
        Voltar pro login
      </button>
    </div>
  );
}

// ── Building blocks ──────────────────────────────────────────────────────────

function FieldGroup({
  id,
  label,
  icon,
  rightAction,
  children,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
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
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--colheita-text-secondary)',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          <span aria-hidden="true" style={{ color: 'var(--colheita-text-tertiary)' }}>
            {icon}
          </span>
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
        color: 'var(--admin-critical)',
        letterSpacing: '-0.005em',
        margin: 0,
        padding: '10px 12px',
        borderRadius: '8px',
        backgroundColor: `color-mix(in srgb, var(--admin-critical) 10%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(--admin-critical) 24%, transparent)`,
      }}
    >
      {children}
    </p>
  );
}
