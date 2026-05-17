// apps/admin/src/app/(dashboard)/configuracoes/page.tsx
//
// Configurações do tenant + operações de manutenção (reindex RAG).

import { createServerClient, requireAuth } from '@colheita/auth';
import { Brain, Plug, ShieldCheck } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ReindexButton } from '@/components/configuracoes/reindex-button';

export const metadata = { title: 'Configurações' };

export default async function ConfiguracoesPage() {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, slug')
    .limit(1)
    .maybeSingle();

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)', maxWidth: '760px' }}>
      <header style={{ marginBottom: '40px' }}>
        <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
          Identity & Access
        </p>
        <h1
          className="argho-display"
          style={{
            fontSize: 'clamp(1.875rem, 2.4vw, 2.375rem)',
            color: '#0a0a0a',
            margin: '0 0 8px',
          }}
        >
          Configurações
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--colheita-text-secondary)',
            margin: 0,
          }}
        >
          Conta, tenant e operações de manutenção da plataforma.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Conta */}
        <SettingsCard icon={ShieldCheck} title="Conta">
          <Field label="Email" value={user.email ?? '—'} />
          <Field label="Tenant" value={(tenant?.name as string | undefined) ?? '—'} />
          <Field label="Slug" value={(tenant?.slug as string | undefined) ?? '—'} mono />
        </SettingsCard>

        {/* RAG / Knowledge Base */}
        <SettingsCard
          icon={Brain}
          title="Knowledge Base (RAG)"
          description="Indexa produtos e lições como embeddings no pgvector. O agente do AgentDock usa esse índice pra responder perguntas."
        >
          <ReindexButton />
        </SettingsCard>

        {/* Integrações */}
        <SettingsCard
          icon={Plug}
          title="Integrações"
          description="Conectores ativos e roadmap de integração."
        >
          <Link
            href="/integracoes"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--colheita-brand-primary)',
              textDecoration: 'none',
            }}
          >
            Ver conectores →
          </Link>
        </SettingsCard>
      </div>
    </div>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────────

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Brain;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        padding: '24px',
        borderRadius: 'var(--colheita-radius-lg)',
        border: '1px solid var(--colheita-border)',
        backgroundColor: '#ffffff',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'var(--colheita-brand-primary-soft)',
            color: 'var(--colheita-brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={15} strokeWidth={1.75} />
        </div>
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#0a0a0a',
            letterSpacing: '-0.015em',
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      {description ? (
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--colheita-text-secondary)',
            margin: '0 0 16px',
            lineHeight: 1.55,
            maxWidth: '60ch',
          }}
        >
          {description}
        </p>
      ) : (
        <div style={{ height: '12px' }} />
      )}
      {children}
    </section>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '8px 0',
        borderTop: '1px solid var(--colheita-border-subtle)',
        gap: '16px',
      }}
    >
      <span style={{ fontSize: '0.8125rem', color: 'var(--colheita-text-tertiary)' }}>{label}</span>
      <span
        style={{
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'var(--colheita-text-primary)',
          fontFamily: mono ? 'var(--font-mono)' : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}
