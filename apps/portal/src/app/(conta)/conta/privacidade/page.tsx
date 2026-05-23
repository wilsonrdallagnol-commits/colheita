// apps/portal/src/app/(conta)/conta/privacidade/page.tsx
//
// LGPD self-service: distribuidor exporta proprios dados (direito de
// portabilidade, art 18 V) e solicita exclusao (direito ao esquecimento,
// art 18 IV — processado manualmente pelo time Argho via support_ticket).

import { requireAuth } from '@colheita/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { DeleteAccountForm, ExportDataButton } from '@/components/conta/privacy-forms';

export const metadata: Metadata = {
  title: 'Privacidade e dados',
};

export default async function PrivacidadePage() {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--colheita-surface-background)',
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <Link
          href="/conta"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--colheita-text-tertiary)',
            textDecoration: 'none',
            marginBottom: '20px',
          }}
        >
          ← Minha conta
        </Link>

        <header style={{ marginBottom: '32px' }}>
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--colheita-brand-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '8px',
            }}
          >
            Conta · Privacidade
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(1.5rem, 2.4vw, 1.875rem)',
              fontWeight: 600,
              color: 'var(--colheita-text-primary)',
              letterSpacing: '-0.025em',
            }}
          >
            Privacidade e dados
          </h1>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: '0.875rem',
              color: 'var(--colheita-text-secondary)',
              lineHeight: 1.55,
            }}
          >
            Seus direitos sob a Lei Geral de Proteção de Dados (LGPD). Exporte seus dados ou peça a
            exclusão da conta diretamente daqui.
          </p>
        </header>

        {/* Export */}
        <section
          style={{
            padding: '24px 26px',
            backgroundColor: 'var(--colheita-surface-card)',
            border: '1px solid var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              margin: '0 0 8px',
              fontSize: '1.0625rem',
              fontWeight: 600,
              color: 'var(--colheita-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Exportar meus dados
          </h2>
          <p
            style={{
              margin: '0 0 16px',
              fontSize: '0.875rem',
              color: 'var(--colheita-text-secondary)',
              lineHeight: 1.55,
            }}
          >
            Baixe um arquivo <code>JSON</code> com tudo que mantemos sobre você: perfil, pedidos,
            progresso na Academia, certificações, chamados de suporte, conversas com o Agrônomo IA e
            notificações. <strong>LGPD art 18 V — direito de portabilidade.</strong>
          </p>
          <ExportDataButton />
        </section>

        {/* Política */}
        <section
          style={{
            padding: '24px 26px',
            backgroundColor: 'var(--colheita-surface-card)',
            border: '1px solid var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              margin: '0 0 8px',
              fontSize: '1.0625rem',
              fontWeight: 600,
              color: 'var(--colheita-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Como tratamos seus dados
          </h2>
          <ul
            style={{
              margin: 0,
              paddingLeft: '20px',
              fontSize: '0.875rem',
              color: 'var(--colheita-text-secondary)',
              lineHeight: 1.65,
            }}
          >
            <li>
              <strong>Finalidade:</strong> operar a Plataforma Colheita (catálogo, pedidos, suporte
              técnico, academia).
            </li>
            <li>
              <strong>Compartilhamento:</strong> apenas com Argho Agrosciences e parceiros estritos
              de infraestrutura (Supabase, Resend, Anthropic) sob contratos de processamento.
            </li>
            <li>
              <strong>Retenção:</strong> dados de pedidos por 5 anos (obrigação fiscal); demais,
              enquanto a conta estiver ativa.
            </li>
            <li>
              <strong>Anúncios:</strong> a Plataforma não exibe publicidade nem vende dados a
              terceiros.
            </li>
            <li>
              <strong>Encarregado:</strong> contato pelo{' '}
              <Link
                href="/conta/suporte"
                style={{ color: 'var(--colheita-brand-primary)', textDecoration: 'none' }}
              >
                suporte
              </Link>{' '}
              ou{' '}
              <a
                href="mailto:privacidade@arghoagrosciences.com"
                style={{ color: 'var(--colheita-brand-primary)', textDecoration: 'none' }}
              >
                privacidade@arghoagrosciences.com
              </a>
              .
            </li>
          </ul>
        </section>

        {/* Delete */}
        <section
          style={{
            padding: '24px 26px',
            backgroundColor: 'rgba(220, 38, 38, 0.03)',
            border: '1px solid rgba(220, 38, 38, 0.2)',
            borderRadius: 'var(--colheita-radius-lg)',
          }}
        >
          <h2
            style={{
              margin: '0 0 8px',
              fontSize: '1.0625rem',
              fontWeight: 600,
              color: 'rgb(185, 28, 28)',
              letterSpacing: '-0.01em',
            }}
          >
            Excluir minha conta
          </h2>
          <p
            style={{
              margin: '0 0 16px',
              fontSize: '0.875rem',
              color: 'var(--colheita-text-secondary)',
              lineHeight: 1.55,
            }}
          >
            Você tem direito à exclusão dos seus dados pessoais (LGPD art 18 IV). Por segurança,
            processamos manualmente: o time Argho verifica sua identidade e anonimiza dentro de 15
            dias úteis. Pedidos confirmados são preservados por obrigação fiscal, mas com seus dados
            anonimizados.
          </p>
          <DeleteAccountForm />
        </section>
      </div>
    </div>
  );
}
