// apps/admin/src/app/(auth)/auth/recover/page.tsx
//
// Pagina pra setar senha nova via link de recovery do Supabase.
// Visual alinhado com identidade Argho (white-first editorial).

'use client';

import { createBrowserClient } from '@colheita/auth';
import { Button, Input } from '@colheita/ui';
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

  useEffect(() => {
    const supabase = createBrowserClient();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setStatus('ready');
      }
    });

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
        <header style={{ marginBottom: '32px', textAlign: 'center' }}>
          <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
            Argho · Painel
          </p>
          <h1
            className="argho-display"
            style={{
              fontSize: 'clamp(1.5rem, 2vw, 1.875rem)',
              color: '#0a0a0a',
              margin: 0,
            }}
          >
            {status === 'done' ? 'Senha atualizada' : 'Definir nova senha'}
          </h1>
        </header>

        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--colheita-border)',
            borderRadius: 'var(--colheita-radius-lg)',
            padding: '28px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {status === 'done' ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
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
                  marginBottom: '12px',
                }}
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
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--colheita-text-secondary)',
                  margin: 0,
                }}
              >
                Redirecionando pro painel…
              </p>
            </div>
          ) : (
            <>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--colheita-text-secondary)',
                  margin: '0 0 20px',
                }}
              >
                {status === 'awaiting'
                  ? 'Validando link de recuperação…'
                  : 'Escolha uma senha com no mínimo 8 caracteres.'}
              </p>

              <form
                onSubmit={onSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <div>
                  <label
                    htmlFor={passwordId}
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--colheita-text-secondary)',
                      marginBottom: '6px',
                    }}
                  >
                    Nova senha
                  </label>
                  <Input
                    id={passwordId}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={status !== 'ready' && status !== 'error'}
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label
                    htmlFor={confirmId}
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--colheita-text-secondary)',
                      marginBottom: '6px',
                    }}
                  >
                    Confirme a senha
                  </label>
                  <Input
                    id={confirmId}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    disabled={status !== 'ready' && status !== 'error'}
                    required
                    minLength={8}
                  />
                </div>

                {error ? (
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
                    {error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={status === 'submitting' || status === 'awaiting'}
                  style={{ marginTop: '6px' }}
                >
                  {status === 'submitting' ? 'Salvando…' : 'Atualizar senha'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
