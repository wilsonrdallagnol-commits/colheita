// apps/portal/src/components/TopNav.tsx
// Nav superior da Plataforma Colheita — identidade Argho.

import { Bell } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface TopNavProps {
  /** Quando o usuario esta logado, exibe link para /conta. */
  userEmail?: string | null;
  /** Quantidade de notificacoes nao lidas (exibe badge no sino). */
  unreadNotifs?: number;
}

export function TopNav({ userEmail, unreadNotifs = 0 }: TopNavProps) {
  return (
    <header
      style={{
        borderBottom: '1px solid #e5e7eb',
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'saturate(180%) blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '14px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <Link
          href="/"
          aria-label="Plataforma Colheita — Argho"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}
        >
          <Image
            src="/argho-logo-color.png"
            alt="Argho"
            width={144}
            height={38}
            style={{ height: 28, width: 'auto' }}
            priority
          />
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--colheita-brand-secondary)',
              borderLeft: '1px solid #d1d5db',
              paddingLeft: 12,
              lineHeight: 1.2,
            }}
          >
            Plataforma
            <br />
            Colheita
          </span>
        </Link>

        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <Link href="/" style={{ color: 'var(--colheita-text-primary)', textDecoration: 'none' }}>
            Catálogo
          </Link>
          {userEmail && (
            <Link
              href="/conta/assistente"
              style={{
                color: 'var(--colheita-brand-primary)',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              ✨ Agrônomo IA
            </Link>
          )}
          <Link
            href="/sobre"
            style={{ color: 'var(--colheita-text-secondary)', textDecoration: 'none' }}
          >
            Sobre
          </Link>
          <a
            href="https://arghoagrosciences.com"
            style={{
              color: 'var(--colheita-text-tertiary)',
              textDecoration: 'none',
              fontSize: '0.8125rem',
            }}
          >
            arghoagrosciences.com ↗
          </a>
          {userEmail ? (
            <>
              <Link
                href="/conta/notificacoes"
                aria-label={
                  unreadNotifs > 0 ? `${unreadNotifs} notificações não lidas` : 'Notificações'
                }
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  color: 'var(--colheita-text-secondary)',
                  textDecoration: 'none',
                  border: '1px solid var(--colheita-border-subtle, #e5e7eb)',
                  backgroundColor: 'rgba(255,255,255,0.6)',
                }}
              >
                <Bell size={16} strokeWidth={1.75} />
                {unreadNotifs > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      minWidth: 18,
                      height: 18,
                      padding: '0 5px',
                      borderRadius: 9,
                      background: 'var(--colheita-brand-primary)',
                      color: '#fff',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      lineHeight: '18px',
                      textAlign: 'center',
                    }}
                  >
                    {unreadNotifs > 99 ? '99+' : unreadNotifs}
                  </span>
                )}
              </Link>
              <Link
                href="/conta"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'var(--colheita-brand-primary)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Minha conta
              </Link>
            </>
          ) : (
            <Link
              href="/entrar"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 8,
                background: 'var(--colheita-brand-primary)',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
