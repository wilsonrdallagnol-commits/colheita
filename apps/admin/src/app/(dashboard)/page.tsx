// apps/admin/src/app/(dashboard)/page.tsx
//
// Visao geral — home do admin Colheita.
// Estrutura por camadas Fase 1 do Programa Colheita (vide MEMORY.md):
// PIM (catalogo) · DAM (midias) · Generator (materiais) · Academia · Compliance.
// Identidade visual Argho oficial — eyebrows editoriais, .argho-display,
// paleta blue/green, nomes de produto em CAPS preto.

import { createServerClient, requireAuth } from '@colheita/auth';
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Boxes,
  FileWarning,
  Image as ImageIcon,
  Layers,
  Package,
  ShieldAlert,
  Sparkles,
  Tag,
} from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const metadata = { title: 'Visão geral' };

// ── Subcomponents ────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number;
  href: string;
  accent?: string;
  hint?: string;
}

function KpiCard({ label, value, href, accent, hint }: KpiCardProps) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: '20px 22px',
        borderRadius: 'var(--colheita-radius-lg)',
        border: '1px solid var(--colheita-border)',
        backgroundColor: '#ffffff',
        textDecoration: 'none',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        transition: 'box-shadow 200ms ease, border-color 200ms ease',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          backgroundColor: accent ?? 'var(--colheita-brand-primary)',
        }}
      />
      <p
        style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'var(--colheita-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          margin: '0 0 12px',
        }}
      >
        {label}
      </p>
      <p
        className="argho-display"
        style={{
          fontSize: '2rem',
          color: '#0a0a0a',
          margin: '0 0 4px',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </p>
      {hint ? (
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--colheita-text-tertiary)',
            margin: 0,
          }}
        >
          {hint}
        </p>
      ) : null}
    </Link>
  );
}

interface SectionProps {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

function Section({ eyebrow, title, description, children }: SectionProps) {
  return (
    <section style={{ marginBottom: '40px' }}>
      <div style={{ marginBottom: '16px' }}>
        <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '8px' }}>
          {eyebrow}
        </p>
        <h2
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: '#0a0a0a',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          {title}
        </h2>
        {description ? (
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--colheita-text-secondary)',
              margin: '4px 0 0',
              maxWidth: '64ch',
            }}
          >
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const [
    { count: totalProdutos },
    { count: publicados },
    { count: rascunhos },
    { count: totalCategorias },
    { count: totalAssets },
    { count: totalMateriais },
    { count: totalTrilhas },
    { count: trilhasPublicadas },
    { count: totalLicoes },
    { data: expiringRegs },
  ] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .is('deleted_at', null),
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'draft')
      .is('deleted_at', null),
    supabase.from('product_categories').select('id', { count: 'exact', head: true }),
    supabase.from('assets').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('generated_materials').select('id', { count: 'exact', head: true }),
    supabase.from('learning_tracks').select('id', { count: 'exact', head: true }),
    supabase
      .from('learning_tracks')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase.from('learning_lessons').select('id', { count: 'exact', head: true }),
    supabase
      .from('regulatory_registrations')
      .select('id, expires_at, registration_no, authority, products!inner(name, slug)')
      .eq('status', 'active')
      .not('expires_at', 'is', null)
      .lte(
        'expires_at',
        new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      )
      .order('expires_at', { ascending: true })
      .limit(50),
  ]);

  const now = Date.now();
  const expired: typeof expiringRegs = [];
  const critical15d: typeof expiringRegs = [];
  const warning30d: typeof expiringRegs = [];
  const notice60d: typeof expiringRegs = [];

  for (const reg of expiringRegs ?? []) {
    if (!reg.expires_at) continue;
    const daysLeft = Math.ceil(
      (new Date(reg.expires_at as string).getTime() - now) / (1000 * 60 * 60 * 24),
    );
    if (daysLeft < 0) expired.push(reg);
    else if (daysLeft <= 15) critical15d.push(reg);
    else if (daysLeft <= 30) warning30d.push(reg);
    else if (daysLeft <= 60) notice60d.push(reg);
  }

  const topUrgent = [...expired, ...critical15d].slice(0, 3);
  const hasUrgentReg = expired.length > 0 || critical15d.length > 0;

  const { data: recentes } = await supabase
    .from('products')
    .select('slug, name, status, updated_at')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(5);

  const statusLabel: Record<string, string> = {
    draft: 'Rascunho',
    published: 'Publicado',
    archived: 'Arquivado',
  };

  return (
    <div
      style={{
        padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)',
      }}
    >
      {/* Header editorial Argho */}
      <header style={{ marginBottom: '40px' }}>
        <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
          Argho · Painel de gestão
        </p>
        <h1
          className="argho-display"
          style={{
            fontSize: 'clamp(2rem, 2.8vw, 2.75rem)',
            color: '#0a0a0a',
            margin: '0 0 10px',
          }}
        >
          Programa <span style={{ color: 'var(--colheita-brand-primary)' }}>Colheita</span>
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--colheita-text-secondary)',
            margin: 0,
            maxWidth: '64ch',
          }}
        >
          Catálogo, geração de materiais, biblioteca de mídia e Academia — sob a identidade visual
          blindada da Argho AgriSciences.
        </p>
      </header>

      {/* Banner regulatorio — so quando ha urgencia, alta prioridade visual */}
      {hasUrgentReg ? (
        <aside
          role="alert"
          style={{
            marginBottom: '40px',
            padding: '20px 24px',
            borderRadius: 'var(--colheita-radius-lg)',
            backgroundColor: expired.length > 0 ? '#fef2f2' : '#fffbeb',
            border: `1px solid ${expired.length > 0 ? '#fecaca' : '#fde68a'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--colheita-radius-md)',
                backgroundColor: expired.length > 0 ? '#fecaca' : '#fde68a',
                color: expired.length > 0 ? 'var(--colheita-danger)' : '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {expired.length > 0 ? (
                <ShieldAlert size={18} strokeWidth={1.75} />
              ) : (
                <AlertTriangle size={18} strokeWidth={1.75} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: expired.length > 0 ? 'var(--colheita-danger)' : '#b45309',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  margin: '0 0 6px',
                }}
              >
                Compliance regulatório
              </p>
              <p
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: '#0a0a0a',
                  margin: '0 0 4px',
                  letterSpacing: '-0.01em',
                }}
              >
                {expired.length > 0
                  ? `${expired.length} registro${expired.length === 1 ? '' : 's'} EXPIRADO${
                      expired.length === 1 ? '' : 'S'
                    }`
                  : `${critical15d.length} registro${critical15d.length === 1 ? '' : 's'} crítico${
                      critical15d.length === 1 ? '' : 's'
                    } — vence${critical15d.length === 1 ? '' : 'm'} em ≤15 dias`}
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--colheita-text-secondary)',
                  lineHeight: 1.55,
                  margin: '0 0 12px',
                }}
              >
                {expired.length > 0
                  ? 'Produtos com registro expirado não podem ser comercializados. Renove imediatamente ou suspenda a publicação.'
                  : 'Janela curta de renovação. Acione o regulatório agora pra evitar interrupção de comercialização.'}
              </p>

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                {topUrgent.map((reg) => {
                  const product = Array.isArray(reg.products) ? reg.products[0] : reg.products;
                  const daysLeft = reg.expires_at
                    ? Math.ceil(
                        (new Date(reg.expires_at as string).getTime() - now) /
                          (1000 * 60 * 60 * 24),
                      )
                    : null;
                  return (
                    <li
                      key={reg.id}
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '8px',
                        flexWrap: 'wrap',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <span className="argho-product-name" style={{ fontSize: '0.8125rem' }}>
                        {(product as { name?: string } | null)?.name ?? '—'}
                      </span>
                      <span
                        style={{
                          color: 'var(--colheita-text-tertiary)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {reg.authority} {reg.registration_no} ·{' '}
                        {daysLeft !== null && daysLeft < 0
                          ? `vencido há ${Math.abs(daysLeft)}d`
                          : daysLeft !== null
                            ? `${daysLeft}d restantes`
                            : '—'}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <Link
                href="/compliance"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: expired.length > 0 ? 'var(--colheita-danger)' : '#b45309',
                  textDecoration: 'none',
                }}
              >
                Ver compliance
                <ArrowUpRight size={13} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </aside>
      ) : null}

      {/* PIM — Catalogo de Produtos */}
      <Section
        eyebrow="PIM · Catálogo"
        title="Single source of truth dos produtos Argho"
        description="Composição NPK, dosagem, registros MAPA, hero shots — tudo num lugar só."
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
          }}
        >
          <KpiCard
            label="Total produtos"
            value={totalProdutos ?? 0}
            href="/produtos"
            accent="var(--colheita-brand-primary)"
            hint="todas as fichas no PIM"
          />
          <KpiCard
            label="Publicados"
            value={publicados ?? 0}
            href="/produtos?status=published"
            accent="var(--colheita-brand-secondary)"
            hint="visíveis no portal"
          />
          <KpiCard
            label="Rascunhos"
            value={rascunhos ?? 0}
            href="/produtos?status=draft"
            accent="var(--colheita-text-tertiary)"
            hint="em construção"
          />
          <KpiCard
            label="Categorias"
            value={totalCategorias ?? 0}
            href="/categorias"
            accent="var(--colheita-brand-primary)"
            hint="taxonomia do catálogo"
          />
          <KpiCard
            label="Reg. ≤15d"
            value={critical15d.length}
            href="/compliance?status=active"
            accent={
              critical15d.length > 0 ? 'var(--colheita-danger)' : 'var(--colheita-text-tertiary)'
            }
            hint="vencimento crítico"
          />
          <KpiCard
            label="Reg. ≤30d"
            value={warning30d.length}
            href="/compliance?status=active"
            accent={warning30d.length > 0 ? '#b45309' : 'var(--colheita-text-tertiary)'}
            hint="janela curta"
          />
          <KpiCard
            label="Reg. ≤60d"
            value={notice60d.length}
            href="/compliance?status=active"
            accent={
              notice60d.length > 0
                ? 'var(--colheita-brand-secondary)'
                : 'var(--colheita-text-tertiary)'
            }
            hint="acompanhar"
          />
        </div>
      </Section>

      {/* DAM + Generator + Academia em uma linha de KPIs secundarios */}
      <Section
        eyebrow="Operação"
        title="Mídia, geração de materiais e Academia"
        description="DAM versionado, materiais gerados em segundos com identidade Argho e LMS interno."
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
          }}
        >
          <KpiCard
            label="Biblioteca DAM"
            value={totalAssets ?? 0}
            href="/midias"
            accent="var(--colheita-brand-primary)"
            hint="imagens · vídeos · docs"
          />
          <KpiCard
            label="Materiais gerados"
            value={totalMateriais ?? 0}
            href="/materiais/historico"
            accent="var(--colheita-brand-secondary)"
            hint="ficha · banner · catálogo"
          />
          <KpiCard
            label="Trilhas Academia"
            value={totalTrilhas ?? 0}
            href="/academia"
            accent="var(--colheita-brand-primary)"
            hint={`${trilhasPublicadas ?? 0} publicadas`}
          />
          <KpiCard
            label="Lições"
            value={totalLicoes ?? 0}
            href="/academia"
            accent="var(--colheita-brand-secondary)"
            hint="conteúdo da Academia"
          />
        </div>
      </Section>

      {/* Atalhos rapidos pelas camadas */}
      <Section eyebrow="Atalhos" title="Camadas Fase 1">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
          }}
        >
          <ShortcutTile href="/produtos" icon={Package} title="Catálogo de produtos" sub="PIM" />
          <ShortcutTile href="/midias" icon={ImageIcon} title="Biblioteca de mídia" sub="DAM" />
          <ShortcutTile
            href="/materiais/historico"
            icon={Sparkles}
            title="Materiais gerados"
            sub="Generator"
          />
          <ShortcutTile
            href="/layout-inference"
            icon={Layers}
            title="Layout Inference"
            sub="Refs → Argho"
          />
          <ShortcutTile href="/academia" icon={BookOpen} title="Academia" sub="LMS" />
          <ShortcutTile href="/categorias" icon={Tag} title="Categorias" sub="Taxonomia" />
          <ShortcutTile
            href="/compliance"
            icon={FileWarning}
            title="Compliance"
            sub="MAPA · ANVISA · IBAMA"
          />
          <ShortcutTile href="/auditoria" icon={Boxes} title="Auditoria" sub="Identity & Access" />
        </div>
      </Section>

      {/* Atualizados recentemente */}
      {recentes && recentes.length > 0 ? (
        <Section eyebrow="Atividade" title="Atualizados recentemente">
          <div
            style={{
              border: '1px solid var(--colheita-border)',
              borderRadius: 'var(--colheita-radius-lg)',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {recentes.map((p, i) => (
              <Link
                key={p.slug}
                href={`/produtos/${p.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '16px 20px',
                  borderBottom:
                    i < recentes.length - 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
                  textDecoration: 'none',
                  transition: 'background-color 0.15s',
                }}
              >
                <span
                  className="argho-product-name"
                  style={{ fontSize: '0.875rem', flex: 1, minWidth: 0 }}
                >
                  {p.name}
                </span>
                <StatusPill status={p.status} label={statusLabel[p.status] ?? p.status} />
              </Link>
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function ShortcutTile({
  href,
  icon: Icon,
  title,
  sub,
}: {
  href: string;
  icon: typeof Package;
  title: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '16px 18px',
        borderRadius: 'var(--colheita-radius-lg)',
        border: '1px solid var(--colheita-border)',
        backgroundColor: '#ffffff',
        textDecoration: 'none',
        boxShadow: 'var(--shadow-card)',
        transition: 'border-color 200ms ease, box-shadow 200ms ease',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--colheita-radius-md)',
          backgroundColor: 'var(--colheita-brand-primary-soft)',
          color: 'var(--colheita-brand-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} strokeWidth={1.75} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#0a0a0a',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--colheita-brand-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            margin: '2px 0 0',
          }}
        >
          {sub}
        </p>
      </div>
    </Link>
  );
}

function StatusPill({ status, label }: { status: string; label: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    published: {
      bg: 'var(--colheita-brand-secondary-soft)',
      fg: 'var(--colheita-brand-secondary)',
    },
    draft: { bg: 'var(--colheita-surface-muted)', fg: 'var(--colheita-text-secondary)' },
    archived: { bg: '#fef3c7', fg: '#b45309' },
  };
  const tone = map[status] ?? map.draft;
  if (!tone) return null;
  return (
    <span
      style={{
        flexShrink: 0,
        fontSize: '0.6875rem',
        fontWeight: 600,
        padding: '4px 10px',
        borderRadius: 'var(--colheita-radius-full)',
        backgroundColor: tone.bg,
        color: tone.fg,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      {label}
    </span>
  );
}
