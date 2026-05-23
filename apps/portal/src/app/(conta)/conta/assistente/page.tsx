// apps/portal/src/app/(conta)/conta/assistente/page.tsx
//
// IA agronômica do portal — distribuidor logado consulta o Agrônomo Argho
// (PhD em Fertilidade, Fisiologia, Biológicos) via chat com streaming SSE.

import { requireAuth } from '@colheita/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { PortalChatPanel } from '@/components/assistente/portal-chat-panel';

export const metadata: Metadata = {
  title: 'Agrônomo Argho — IA',
};

export default async function AssistentePage() {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)', // 64px = altura TopNav
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <header
        style={{
          padding: '24px 24px 16px',
          borderBottom: '1px solid var(--colheita-border-subtle)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '8px',
          }}
        >
          <p
            className="argho-eyebrow"
            style={{
              display: 'inline-block',
              margin: 0,
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--colheita-brand-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            Suporte técnico · IA
          </p>
          <Link
            href="/conta/assistente/historico"
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--colheita-text-tertiary)',
              textDecoration: 'none',
              borderBottom: '1px dashed var(--colheita-border)',
            }}
          >
            Histórico →
          </Link>
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(1.5rem, 2.4vw, 1.875rem)',
            fontWeight: '600',
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.025em',
          }}
        >
          Agrônomo Argho
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: '0.875rem',
            color: 'var(--colheita-text-secondary)',
            lineHeight: 1.55,
            maxWidth: '62ch',
          }}
        >
          Consultor técnico-científico com perfil de Doutor em Agronomia (fertilidade de solos,
          fisiologia vegetal, biológicos). Pergunte dose, janela de aplicação, compatibilidade de
          calda, programa Argho integrado, ou qualquer dúvida agronômica de campo.
        </p>
      </header>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PortalChatPanel />
      </div>
    </div>
  );
}
