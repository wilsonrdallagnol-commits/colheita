// apps/portal/src/app/(auth)/entrar/login-form.tsx
'use client';

import Link from 'next/link';
import { useActionState, useId } from 'react';
import { signInWithMagicLink } from './actions';

interface LoginFormProps {
  next?: string;
}

export function LoginForm({ next }: LoginFormProps) {
  const [state, action, pending] = useActionState(signInWithMagicLink, null);
  const emailId = useId();

  // ── Sucesso ──────────────────────────────────────────────────────────────
  if (state !== null && !state.error) {
    return (
      <Shell>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: '#e9f5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <svg
              width={26}
              height={26}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#489030"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="Sucesso"
              role="img"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#0a0a0a',
              marginBottom: 8,
              letterSpacing: '-0.02em',
            }}
          >
            Link enviado
          </h1>
          <p
            style={{
              fontSize: '0.9375rem',
              color: '#4b5563',
              lineHeight: 1.6,
              maxWidth: 320,
              margin: '0 auto',
            }}
          >
            Verifique seu email e clique no link para acessar a Plataforma Colheita. O link expira
            em 1 hora.
          </p>
        </div>
      </Shell>
    );
  }

  // ── Formulário ───────────────────────────────────────────────────────────
  return (
    <Shell>
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#183090',
            marginBottom: 14,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 24,
              height: 2,
              background: '#489030',
              marginRight: 12,
              verticalAlign: 'middle',
            }}
          />
          Acesso de distribuidor
        </p>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#0a0a0a',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: 8,
          }}
        >
          Entrar na Plataforma <span style={{ color: '#489030' }}>Colheita</span>.
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: '#4b5563',
            lineHeight: 1.6,
          }}
        >
          Receba um link de acesso seguro no seu email — sem senha.
        </p>
      </div>

      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {next && <input type="hidden" name="next" value={next} />}
        <div>
          <label
            htmlFor={emailId}
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#0a0a0a',
              marginBottom: 8,
            }}
          >
            Email
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            placeholder="distribuidor@empresa.com.br"
            autoComplete="email"
            required
            disabled={pending}
            style={{
              width: '100%',
              height: 48,
              padding: '0 16px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: '#fff',
              color: '#0a0a0a',
              fontSize: '0.9375rem',
              outline: 'none',
              transition: 'border 150ms',
            }}
          />
        </div>

        {state?.error && (
          <p
            style={{
              fontSize: '0.8125rem',
              color: '#b91c1c',
              padding: '10px 12px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 6,
            }}
          >
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          style={{
            height: 48,
            background: pending ? '#6b7280' : '#183090',
            color: '#fff',
            fontSize: '0.9375rem',
            fontWeight: 600,
            border: 'none',
            borderRadius: 8,
            cursor: pending ? 'wait' : 'pointer',
            marginTop: 4,
          }}
        >
          {pending ? 'Enviando link…' : 'Enviar link de acesso'}
        </button>
      </form>

      <p
        style={{
          marginTop: 28,
          fontSize: '0.8125rem',
          color: '#6b7280',
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        Ainda não é distribuidor Argho?{' '}
        <a
          href="https://arghoagrosciences.com/contato"
          style={{ color: '#183090', textDecoration: 'underline', fontWeight: 500 }}
        >
          Fale com nossa equipe comercial
        </a>
        .
      </p>
    </Shell>
  );
}

// ── Shell visual reutilizado ────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        background: '#fff',
      }}
    >
      {/* Coluna esquerda — branding */}
      <aside
        style={{
          background: 'linear-gradient(160deg, #183090 0%, #0e1f5e 100%)',
          color: '#fff',
          padding: '64px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          aria-label="Voltar para o catálogo"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            color: '#fff',
            textDecoration: 'none',
          }}
        >
          {/* <img> direto em vez de <Image>: PNG pequeno (126KB) e Next/Image
              estava omitindo a render quando width/height conflitavam com style. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/argho-logo-white.png"
            alt="Argho"
            style={{ height: 32, width: 'auto', display: 'block' }}
          />
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              borderLeft: '1px solid rgba(255,255,255,0.4)',
              paddingLeft: 12,
            }}
          >
            Plataforma
            <br />
            Colheita
          </span>
        </Link>

        <div>
          <p
            className="argho-display"
            style={{
              fontSize: 'clamp(1.75rem, 2.5vw, 2.5rem)',
              maxWidth: 460,
              marginBottom: 24,
            }}
          >
            Tecnologia viva
            <br />
            <span style={{ color: '#a8d18d' }}>para o agro brasileiro</span>.
          </p>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'rgba(255,255,255,0.78)',
              maxWidth: 420,
              lineHeight: 1.6,
            }}
          >
            Catálogo digital, ficha técnica completa, indicações por cultura e dados regulatórios
            MAPA — em um único lugar.
          </p>
        </div>

        <p
          style={{
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          © {new Date().getFullYear()} Argho Agrosciences
        </p>
      </aside>

      {/* Coluna direita — formulário */}
      <main
        style={{
          padding: '64px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>{children}</div>
      </main>
    </div>
  );
}
