// apps/admin/src/app/(auth)/auth/recover/page.tsx
//
// Pagina pra setar senha nova via link enviado por resetPasswordForEmail.
// Quando o user clica no email, Supabase recovery hash sai na URL — que é
// trocada por session ja autenticada pelo client-side handler abaixo. A partir
// dai o user pode chamar updateUser({ password }).

'use client';

import { createBrowserClient } from '@colheita/auth';
import { Button, Input } from '@colheita/ui';
import { CheckCircle2, KeyRound, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useState } from 'react';

type Status = 'awaiting' | 'ready' | 'submitting' | 'done' | 'error';

export default function RecoverPage() {
  const router = useRouter();
  const passwordId = useId();
  const confirmId = useId();
  const [status, setStatus] = useState<Status>('awaiting');
  const [error, setError] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  // Supabase entrega o hash de recovery via URL fragment quando user vem do email.
  // O client SDK detecta automaticamente em onAuthStateChange. Esperamos o evento
  // PASSWORD_RECOVERY pra liberar o form.
  useEffect(() => {
    const supabase = createBrowserClient();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setStatus('ready');
      }
    });

    // Fallback: se ja temos session, libera. Cobre caso de evento ja ter fired
    // antes do listener montar.
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus('ready');
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('A senha precisa de no mínimo 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    setStatus('submitting');
    const supabase = createBrowserClient();
    const { error: updateErr } = await supabase.auth.updateUser({ password });

    if (updateErr) {
      setError('Não foi possível atualizar. Tente o link novamente.');
      setStatus('error');
      return;
    }

    setStatus('done');
    setTimeout(() => router.push('/produtos'), 1500);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--colheita-surface-background)',
        padding: 'clamp(24px, 4vw, 48px)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '32px',
          }}
        >
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
            Argho · Painel
          </span>
        </div>

        {status === 'done' ? (
          <Done />
        ) : (
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
                Definir nova senha
              </h1>
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--colheita-text-secondary)',
                  letterSpacing: '-0.005em',
                  margin: 0,
                }}
              >
                {status === 'awaiting'
                  ? 'Validando link de recuperação…'
                  : 'Escolha uma senha com no mínimo 8 caracteres.'}
              </p>
            </div>

            <form
              onSubmit={onSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <FieldGroup id={passwordId} label="Nova senha">
                <Input
                  id={passwordId}
                  type="password"
                  placeholder="•••••••••"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={status !== 'ready' && status !== 'error'}
                  required
                  minLength={8}
                />
              </FieldGroup>

              <FieldGroup id={confirmId} label="Confirme a senha">
                <Input
                  id={confirmId}
                  type="password"
                  placeholder="•••••••••"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={status !== 'ready' && status !== 'error'}
                  required
                  minLength={8}
                />
              </FieldGroup>

              {error ? (
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
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={status === 'submitting' || status === 'awaiting'}
                style={{ marginTop: '4px' }}
              >
                {status === 'submitting' ? 'Salvando…' : 'Atualizar senha'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Done() {
  return (
    <div style={{ textAlign: 'center', paddingTop: '40px' }}>
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
        Senha atualizada
      </h1>
      <p
        style={{
          fontSize: '0.9375rem',
          color: 'var(--colheita-text-secondary)',
          letterSpacing: '-0.005em',
          margin: 0,
        }}
      >
        Redirecionando pro painel…
      </p>
    </div>
  );
}

function FieldGroup({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
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
          marginBottom: '6px',
        }}
      >
        <KeyRound size={12} strokeWidth={1.5} color="var(--colheita-text-tertiary)" />
        {label}
      </label>
      {children}
    </div>
  );
}
