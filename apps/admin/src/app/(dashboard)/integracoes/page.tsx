// apps/admin/src/app/(dashboard)/integracoes/page.tsx
//
// Camada 9 (Integracoes) — pagina de conectores externos.
// v1: lista estatica do que o sistema integra/preparou pra integrar.
// Cada conector vai ganhar pagina dedicada (configurar credenciais, ver
// historico de eventos, status de saude) em sprints futuras.

import { requireAuth } from '@colheita/auth';
import {
  ArrowUpRight,
  Bot,
  Cloud,
  CreditCard,
  GitBranch,
  Globe,
  type LucideIcon,
  MessageSquare,
  Plug,
  Sprout,
  Workflow,
} from 'lucide-react';
import { cookies } from 'next/headers';

export const metadata = { title: 'Integrações' };

interface Connector {
  name: string;
  category: 'live' | 'soon' | 'roadmap';
  icon: LucideIcon;
  description: string;
  href?: string;
  hint?: string;
}

const CONNECTORS: Connector[] = [
  {
    name: 'Safra ARGHO',
    category: 'live',
    icon: Sprout,
    description: 'Webhooks de pedidos + sincronização de estoque. HMAC SHA-256 por evento.',
    hint: 'Eventos · Pedidos · Estoque',
  },
  {
    name: 'WhatsApp Business',
    category: 'live',
    icon: MessageSquare,
    description: 'Captura de leads via webhook Meta. Idempotência por message_id.',
    hint: 'Leads · LGPD',
  },
  {
    name: 'Sentry · Observability',
    category: 'live',
    icon: Bot,
    description: 'Captura de erros em produção com contexto enriquecido (sem PII).',
    hint: 'Erros · Métricas',
  },
  {
    name: 'Resend · Transactional',
    category: 'live',
    icon: Cloud,
    description: 'Email transacional pra alertas (compliance, certificados Academia).',
    hint: 'Email · Alertas',
  },
  {
    name: 'Trigger.dev · Schedules',
    category: 'live',
    icon: Workflow,
    description: 'Cron jobs (alertas regulatórios diários, reindex embeddings semanal).',
    hint: 'Cron · Background',
  },
  {
    name: 'Google Workspace · OAuth',
    category: 'roadmap',
    icon: Globe,
    description: 'SSO para vendedores Argho. MFA obrigatório em roles admin.',
    hint: 'OAuth · Identity',
  },
  {
    name: 'ERP · Conta Azul · Omie',
    category: 'roadmap',
    icon: CreditCard,
    description: 'Sincronização bidirecional de pedidos e faturamento.',
    hint: 'Financeiro · ERP',
  },
  {
    name: 'n8n · Workflows',
    category: 'roadmap',
    icon: GitBranch,
    description: 'Automação visual entre Colheita, ERP, CRM e canais externos.',
    hint: 'Automação',
  },
  {
    name: 'AgroTools · Climate FieldView',
    category: 'roadmap',
    icon: Sprout,
    description: 'Dados de talhão + recomendação por cultura para o agente agronômico.',
    hint: 'Agro · Recomendação',
  },
];

const CATEGORY_META: Record<
  Connector['category'],
  { label: string; color: string; bg: string; line: string }
> = {
  live: {
    label: 'Ativo',
    color: 'var(--colheita-brand-secondary)',
    bg: 'var(--colheita-brand-secondary-soft)',
    line: 'var(--colheita-brand-secondary-line)',
  },
  soon: {
    label: 'Em breve',
    color: 'var(--colheita-brand-primary)',
    bg: 'var(--colheita-brand-primary-soft)',
    line: 'var(--colheita-brand-primary-line)',
  },
  roadmap: {
    label: 'Roadmap',
    color: 'var(--colheita-text-tertiary)',
    bg: 'var(--colheita-surface-muted)',
    line: 'var(--colheita-border)',
  },
};

export default async function IntegracoesPage() {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);

  const live = CONNECTORS.filter((c) => c.category === 'live');
  const roadmap = CONNECTORS.filter((c) => c.category === 'roadmap');

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)' }}>
      <header style={{ marginBottom: '40px' }}>
        <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
          Integrações · Conectores
        </p>
        <h1
          className="argho-display"
          style={{
            fontSize: 'clamp(1.875rem, 2.4vw, 2.375rem)',
            color: '#0a0a0a',
            margin: '0 0 8px',
          }}
        >
          Onde a Colheita conversa com o resto do mundo
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--colheita-text-secondary)',
            margin: 0,
            maxWidth: '64ch',
          }}
        >
          Webhooks, OAuth, ERP, automações — contratos prontos hoje, arquitetura preparada para
          EVOFIT e demais tenants amanhã.
        </p>
      </header>

      <ConnectorGroup title="Ativos no ambiente Argho" items={live} />
      <ConnectorGroup title="Roadmap (Fase 2 e além)" items={roadmap} />
    </div>
  );
}

function ConnectorGroup({ title, items }: { title: string; items: Connector[] }) {
  return (
    <section style={{ marginBottom: '40px' }}>
      <h2
        style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'var(--colheita-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          margin: '0 0 16px',
        }}
      >
        {title} · {items.length}
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
        }}
      >
        {items.map((c) => (
          <ConnectorCard key={c.name} connector={c} />
        ))}
      </div>
    </section>
  );
}

function ConnectorCard({ connector }: { connector: Connector }) {
  const meta = CATEGORY_META[connector.category];
  const Icon = connector.icon ?? Plug;
  return (
    <article
      style={{
        padding: '20px 22px',
        borderRadius: 'var(--colheita-radius-lg)',
        border: '1px solid var(--colheita-border)',
        backgroundColor: '#ffffff',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: meta.bg,
            color: meta.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={18} strokeWidth={1.75} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: '#0a0a0a',
              letterSpacing: '-0.01em',
              margin: '0 0 2px',
            }}
          >
            {connector.name}
          </p>
          {connector.hint ? (
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: meta.color,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: 0,
              }}
            >
              {connector.hint}
            </p>
          ) : null}
        </div>
        <span
          style={{
            fontSize: '0.625rem',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: 'var(--colheita-radius-full)',
            backgroundColor: meta.bg,
            color: meta.color,
            border: `1px solid ${meta.line}`,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            flexShrink: 0,
          }}
        >
          {meta.label}
        </span>
      </div>

      <p
        style={{
          fontSize: '0.8125rem',
          color: 'var(--colheita-text-secondary)',
          lineHeight: 1.55,
          margin: 0,
        }}
      >
        {connector.description}
      </p>

      {connector.href ? (
        <a
          href={connector.href}
          style={{
            marginTop: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--colheita-brand-primary)',
            textDecoration: 'none',
          }}
        >
          Configurar
          <ArrowUpRight size={13} strokeWidth={2} />
        </a>
      ) : null}
    </article>
  );
}
