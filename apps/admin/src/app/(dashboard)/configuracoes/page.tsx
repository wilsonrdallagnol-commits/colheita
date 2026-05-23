// apps/admin/src/app/(dashboard)/configuracoes/page.tsx
//
// Configurações do tenant + operações de manutenção (reindex RAG).

import { createServerClient, getSession, requireAuth } from '@colheita/auth';
import { isSentryEnabled } from '@colheita/observability/sentry-init';
import { Activity, Brain, Plug, ShieldCheck } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ChangePasswordForm } from '@/components/configuracoes/change-password-form';
import { ReindexButton } from '@/components/configuracoes/reindex-button';
import { StaleSessionBanner } from '@/components/configuracoes/stale-session-banner';

export const metadata = { title: 'Configurações' };

/**
 * Decodifica o payload de um JWT base64 sem validacao. So usado pra ler
 * claims customizadas (roles, tenant_id) — a validacao do token em si
 * eh feita pelo Supabase via supabase.auth.getUser() antes deste call.
 *
 * Robusto a JWT malformado: retorna {} em qualquer falha.
 */
function decodeJwtClaims(accessToken: string | undefined | null): Record<string, unknown> {
  if (!accessToken) return {};
  try {
    const parts = accessToken.split('.');
    if (parts.length !== 3) return {};
    const payload = parts[1];
    if (!payload) return {};
    // base64url -> base64 (replace - and _, pad =)
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const json = Buffer.from(padded, 'base64').toString('utf8');
    const parsed = JSON.parse(json);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export default async function ConfiguracoesPage() {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);
  const session = await getSession(cookieStore);

  // Detecta JWT stale: faltam claims customizadas (tenant_id, roles).
  // Pos-migration 0032 o hook injeta ambas — sessoes velhas precisam refresh.
  const claims = decodeJwtClaims(session?.access_token);
  const hasRoles = Array.isArray(claims.roles) && (claims.roles as unknown[]).length > 0;
  const hasTenantClaim = typeof claims.tenant_id === 'string';
  const sessionIsStale = !hasRoles || !hasTenantClaim;

  // Status operacional — sinaliza ao admin se observabilidade/rate limiting
  // estao ativos. Cliente pediu visibilidade dos integrations criticos.
  const sentryOk = isSentryEnabled();
  const upstashOk = Boolean(process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL);
  const anthropicOk = Boolean(process.env.ANTHROPIC_API_KEY);
  const embeddingsOk = Boolean(
    process.env.VOYAGE_API_KEY ?? process.env.OPENAI_API_KEY ?? process.env.OPENAI,
  );
  const geminiOk = Boolean(process.env.GEMINI_API_KEY);
  const resendOk = Boolean(process.env.RESEND_API_KEY);
  // Distinção qual provider de embedding está ativo (info pra debug)
  const embeddingsProvider = process.env.VOYAGE_API_KEY
    ? 'Voyage'
    : process.env.OPENAI_API_KEY || process.env.OPENAI
      ? 'OpenAI'
      : null;

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

      {sessionIsStale ? <StaleSessionBanner /> : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Conta */}
        <SettingsCard icon={ShieldCheck} title="Conta">
          <Field label="Email" value={user.email ?? '—'} />
          <Field label="Tenant" value={(tenant?.name as string | undefined) ?? '—'} />
          <Field label="Slug" value={(tenant?.slug as string | undefined) ?? '—'} mono />
          <Field
            label="Permissões no JWT"
            value={
              hasRoles
                ? (claims.roles as string[]).join(', ')
                : 'nenhuma — refaça login pra atualizar'
            }
            mono
          />
          <div
            style={{
              paddingTop: '12px',
              borderTop: '1px solid var(--colheita-border-subtle)',
              marginTop: '8px',
            }}
          >
            <ChangePasswordForm />
          </div>
        </SettingsCard>

        {/* Operacao — status dos integrations criticos */}
        <SettingsCard
          icon={Activity}
          title="Status operacional"
          description="Integrações críticas. Indicador verde = OK, cinza = não configurado."
        >
          <StatusRow
            label="Sentry (rastreamento de erros)"
            ok={sentryOk}
            hint={sentryOk ? 'erros são reportados' : 'erros invisíveis em prod — setar SENTRY_DSN'}
          />
          <StatusRow
            label="Upstash Redis (rate limiting)"
            ok={upstashOk}
            hint={
              upstashOk
                ? 'limites aplicados'
                : 'sem limite — agent vulnerável a abuso — setar UPSTASH_REDIS_REST_URL'
            }
          />
          <StatusRow
            label="Anthropic (IA agente + Layout Inference)"
            ok={anthropicOk}
            hint={
              anthropicOk ? 'agente IA ativo' : 'agente IA indisponível — setar ANTHROPIC_API_KEY'
            }
          />
          <StatusRow
            label="Embeddings (Voyage ou OpenAI)"
            ok={embeddingsOk}
            hint={
              embeddingsOk
                ? `RAG funcional (provider ativo: ${embeddingsProvider})`
                : 'reindex falha — setar VOYAGE_API_KEY ou OPENAI_API_KEY'
            }
          />
          <StatusRow
            label="Gemini Nano Banana (geração de imagens)"
            ok={geminiOk}
            hint={
              geminiOk
                ? 'endpoint /api/imagens/gerar pronto'
                : '/imagens não gera — setar GEMINI_API_KEY (aistudio.google.com/apikey)'
            }
          />
          <StatusRow
            label="Resend (envio de e-mails transacionais)"
            ok={resendOk}
            hint={
              resendOk
                ? 'emails de certificado/pedido ativos'
                : 'emails não enviados — setar RESEND_API_KEY'
            }
          />
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

function StatusRow({ label, ok, hint }: { label: string; ok: boolean; hint: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 0',
        borderTop: '1px solid var(--colheita-border-subtle)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: ok ? 'var(--colheita-brand-secondary)' : 'var(--colheita-text-tertiary)',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--colheita-text-primary)',
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: '0.6875rem',
            color: 'var(--colheita-text-tertiary)',
            margin: '2px 0 0',
            lineHeight: 1.3,
          }}
        >
          {hint}
        </p>
      </div>
      <span
        style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: ok ? 'var(--colheita-brand-secondary)' : 'var(--colheita-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {ok ? 'OK' : 'OFF'}
      </span>
    </div>
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
