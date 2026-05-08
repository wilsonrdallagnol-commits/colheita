// apps/admin/src/app/(dashboard)/materiais/historico/page.tsx
//
// Camada 3 (Geracao de Materiais) — visibilidade historica.
//
// Lista as ultimas geracoes de materiais (ficha tecnica + catalogo) com:
//   - Quem gerou (email do user)
//   - Quando
//   - Que template foi usado
//   - Quantos produtos cobriu
//   - Tempo de render (debug de performance)
//
// Snapshot do input fica em generated_materials.input_data — futuro botao
// "regerar com mesmo input" usa esse snapshot pra reproduzir PDF identico.

import { createServerClient, requireAuth } from '@colheita/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@colheita/ui';
import { cookies } from 'next/headers';

export const metadata = { title: 'Histórico de Materiais' };

const HISTORICO_LIMIT = 100;

interface MaterialRow {
  id: string;
  generated_at: string;
  duration_ms: number | null;
  pages: number | null;
  product_ids: string[] | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  template: { slug: string; name: string; category: string } | null;
  generator: { email: string | null; full_name: string | null } | null;
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const TEMPLATE_LABEL: Record<string, string> = {
  datasheet: 'Ficha técnica',
  catalog: 'Catálogo',
  banner: 'Banner',
  social_post: 'Post social',
  presentation: 'Apresentação',
  flyer: 'Flyer',
  other: 'Outro',
};

const STATUS_COLOR: Record<MaterialRow['status'], string> = {
  completed: 'var(--colheita-success)',
  pending: 'var(--colheita-text-tertiary)',
  processing: 'var(--colheita-brand-primary)',
  failed: 'var(--colheita-danger)',
};

const STATUS_LABEL: Record<MaterialRow['status'], string> = {
  completed: 'OK',
  pending: 'Pendente',
  processing: 'Processando',
  failed: 'Falhou',
};

export default async function HistoricoPage() {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);

  const supabase = createServerClient(cookieStore);

  // Join com material_templates pra trazer nome/category, e users pra trazer
  // email do gerador. RLS filtra por tenant_id automaticamente.
  const { data: rows } = await supabase
    .from('generated_materials')
    .select(
      `id, generated_at, duration_ms, pages, product_ids, status,
       template:material_templates(slug, name, category),
       generator:users!generated_by(email, full_name)`,
    )
    .order('generated_at', { ascending: false })
    .limit(HISTORICO_LIMIT);

  const materiais: MaterialRow[] = (rows ?? []).map((r) => ({
    id: r.id as string,
    generated_at: r.generated_at as string,
    duration_ms: r.duration_ms as number | null,
    pages: r.pages as number | null,
    product_ids: (r.product_ids as string[] | null) ?? [],
    status: r.status as MaterialRow['status'],
    template: Array.isArray(r.template)
      ? ((r.template[0] as MaterialRow['template']) ?? null)
      : ((r.template as MaterialRow['template']) ?? null),
    generator: Array.isArray(r.generator)
      ? ((r.generator[0] as MaterialRow['generator']) ?? null)
      : ((r.generator as MaterialRow['generator']) ?? null),
  }));

  return (
    <div style={{ padding: '32px' }}>
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span style={{ color: 'var(--colheita-text-tertiary)', fontSize: '0.8125rem' }}>
              Argho
            </span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span style={{ color: 'var(--colheita-text-tertiary)', fontSize: '0.8125rem' }}>
              Materiais
            </span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>Histórico</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.025em',
            marginBottom: '4px',
          }}
        >
          Histórico de Materiais
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
          {materiais.length === 0
            ? 'Nenhum material gerado ainda. Baixe uma ficha técnica ou o catálogo para começar.'
            : `${materiais.length} última${materiais.length === 1 ? '' : 's'} geração${materiais.length === 1 ? '' : 'ões'} (limite: ${HISTORICO_LIMIT})`}
        </p>
      </div>

      {materiais.length > 0 && (
        <div
          style={{
            border: '1px solid var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
            overflow: 'hidden',
            backgroundColor: 'var(--colheita-surface-card)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr 200px 80px 80px 90px',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: 'var(--colheita-surface-elevated)',
              borderBottom: '1px solid var(--colheita-border-subtle)',
              fontSize: '0.6875rem',
              fontWeight: '700',
              color: 'var(--colheita-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            <div>Quando</div>
            <div>Template / Material</div>
            <div>Por</div>
            <div style={{ textAlign: 'right' as const }}>Produtos</div>
            <div style={{ textAlign: 'right' as const }}>Páginas</div>
            <div style={{ textAlign: 'right' as const }}>Tempo</div>
          </div>

          {/* Rows */}
          {materiais.map((m, i) => (
            <div
              key={m.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr 200px 80px 80px 90px',
                gap: '12px',
                padding: '12px 16px',
                borderBottom:
                  i < materiais.length - 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
                fontSize: '0.875rem',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  color: 'var(--colheita-text-secondary)',
                  fontVariantNumeric: 'tabular-nums' as const,
                }}
              >
                {formatDateTime(m.generated_at)}
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    color: 'var(--colheita-text-primary)',
                    fontWeight: '500',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {m.template?.name ?? 'Template removido'}
                </div>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    color: 'var(--colheita-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginTop: '2px',
                  }}
                >
                  {m.template?.category
                    ? (TEMPLATE_LABEL[m.template.category] ?? m.template.category)
                    : '—'}
                  {' · '}
                  <span style={{ color: STATUS_COLOR[m.status] }}>{STATUS_LABEL[m.status]}</span>
                </div>
              </div>

              <div
                style={{
                  color: 'var(--colheita-text-secondary)',
                  fontSize: '0.8125rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {m.generator?.full_name ?? m.generator?.email ?? '—'}
              </div>

              <div
                style={{
                  textAlign: 'right' as const,
                  color: 'var(--colheita-text-secondary)',
                  fontVariantNumeric: 'tabular-nums' as const,
                }}
              >
                {m.product_ids?.length ?? 0}
              </div>

              <div
                style={{
                  textAlign: 'right' as const,
                  color: 'var(--colheita-text-secondary)',
                  fontVariantNumeric: 'tabular-nums' as const,
                }}
              >
                {m.pages ?? '—'}
              </div>

              <div
                style={{
                  textAlign: 'right' as const,
                  color: 'var(--colheita-text-tertiary)',
                  fontVariantNumeric: 'tabular-nums' as const,
                  fontSize: '0.8125rem',
                }}
              >
                {formatDuration(m.duration_ms)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
