// apps/admin/src/app/(dashboard)/layout-inference/[id]/page.tsx
//
// Detalhe de uma referência — mostra:
//  - Imagem original (do bucket assets via storage_path publico)
//  - Blueprint extraido (regions, format, grid, visual_intent)
//  - Metricas do modelo (custo, tempo, tokens)
//  - Workflow de status (draft → reviewed → approved → archived)
//  - Acoes: Approve, Archive, Re-analyze (placeholder)
//
// O parametro [id] eh o reference_id (layout_references), nao blueprint_id.
// Resolvemos o blueprint current via reference + is_current=true.

import { createServerClient, requireAuth } from '@colheita/auth';
import type { LayoutBlueprint, LayoutRegion } from '@colheita/layout-inference';
import { ArrowLeft, Brain, Clock, DollarSign } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RenderButton } from '@/components/layout-inference/render-button';
import { ReviewActions } from '@/components/layout-inference/review-actions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: 'Blueprint · Layout Inference' };

const REGION_TYPE_LABEL: Record<string, string> = {
  brand_header: 'Header de marca',
  headline_block: 'Bloco de headline',
  product_centerpiece: 'Produto central',
  product_grid: 'Grid de produtos',
  data_grid: 'Grid de dados',
  feature_list: 'Lista de features',
  cta_block: 'CTA',
  footer: 'Rodapé',
  logo_zone: 'Zona de logo',
  hero_image: 'Imagem hero',
  testimonial: 'Depoimento',
  gallery: 'Galeria',
  text_body: 'Corpo de texto',
  metric_block: 'Métrica',
  badge_strip: 'Faixa de badges',
  decorative: 'Decorativo',
};

const POSITION_LABEL: Record<string, string> = {
  top: 'Topo',
  upper: 'Superior',
  center: 'Centro',
  lower: 'Inferior',
  bottom: 'Base',
  left: 'Esquerda',
  right: 'Direita',
};

const STATUS_LABEL: Record<string, string> = {
  analyzing: 'Analisando',
  draft: 'Rascunho',
  reviewed: 'Revisado',
  approved: 'Aprovado',
  archived: 'Arquivado',
};

const STATUS_TONE: Record<string, { color: string; bg: string; line: string }> = {
  analyzing: {
    color: 'var(--colheita-brand-primary)',
    bg: 'var(--colheita-brand-primary-soft)',
    line: 'var(--colheita-brand-primary-line)',
  },
  draft: {
    color: 'var(--colheita-text-secondary)',
    bg: 'var(--colheita-surface-muted)',
    line: 'var(--colheita-border)',
  },
  reviewed: {
    color: 'var(--colheita-brand-primary)',
    bg: 'var(--colheita-brand-primary-soft)',
    line: 'var(--colheita-brand-primary-line)',
  },
  approved: {
    color: 'var(--colheita-brand-secondary)',
    bg: 'var(--colheita-brand-secondary-soft)',
    line: 'var(--colheita-brand-secondary-line)',
  },
  archived: {
    color: 'var(--colheita-text-tertiary)',
    bg: 'var(--colheita-surface-muted)',
    line: 'var(--colheita-border)',
  },
};

export default async function BlueprintDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Busca reference + asset + blueprint atual + materiais ja renderizados
  const [{ data: reference }, { data: blueprint }, { data: renderedMaterials }] = await Promise.all(
    [
      supabase
        .from('layout_references')
        .select(
          `id, title, description, source_type, intended_category, tags, created_at,
         asset:assets!inner(id, storage_path, width, height, mime_type, file_size, original_name)`,
        )
        .eq('id', id)
        .is('deleted_at', null)
        .maybeSingle(),
      supabase
        .from('layout_blueprints')
        .select(
          `id, status, blueprint, raw_analysis, version, model_used, tokens_input, tokens_output,
         duration_ms, cost_usd, created_at, reviewed_at, review_notes`,
        )
        .eq('reference_id', id)
        .eq('is_current', true)
        .maybeSingle(),
      supabase
        .from('generated_materials')
        .select('id, output_url, duration_ms, generated_at, input_data')
        .filter('input_data->>reference_id', 'eq', id)
        .order('generated_at', { ascending: false })
        .limit(10),
    ],
  );

  if (!reference) notFound();

  const asset = Array.isArray(reference.asset) ? reference.asset[0] : reference.asset;
  const storagePath = (asset?.storage_path as string | undefined) ?? '';
  const imageUrl = storagePath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${storagePath}`
    : null;

  const bp = blueprint?.blueprint as LayoutBlueprint | undefined;
  const regions = (bp?.regions ?? []) as LayoutRegion[];
  const status = (blueprint?.status as string | undefined) ?? 'draft';
  const tone = STATUS_TONE[status] ?? STATUS_TONE.draft;

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)' }}>
      <Link
        href="/layout-inference"
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
        <ArrowLeft size={12} strokeWidth={1.75} />
        Layout Inference
      </Link>

      {/* Header */}
      <header
        style={{
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
              flexWrap: 'wrap',
            }}
          >
            <p className="argho-eyebrow" style={{ display: 'inline-block', margin: 0 }}>
              Blueprint
            </p>
            {tone ? (
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 'var(--colheita-radius-full)',
                  backgroundColor: tone.bg,
                  color: tone.color,
                  border: `1px solid ${tone.line}`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {STATUS_LABEL[status] ?? status}
              </span>
            ) : null}
          </div>
          <h1
            className="argho-display"
            style={{
              fontSize: 'clamp(1.875rem, 2.4vw, 2.375rem)',
              color: '#0a0a0a',
              margin: '0 0 8px',
            }}
          >
            {reference.title}
          </h1>
          {reference.description ? (
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--colheita-text-secondary)',
                margin: 0,
                maxWidth: '60ch',
                lineHeight: 1.55,
              }}
            >
              {reference.description}
            </p>
          ) : null}
        </div>

        {blueprint ? (
          <ReviewActions
            blueprintId={blueprint.id as string}
            currentStatus={status}
            referenceId={id}
          />
        ) : null}
      </header>

      {/* Grid principal: imagem original | blueprint */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        {/* Imagem original */}
        <div
          style={{
            borderRadius: 'var(--colheita-radius-lg)',
            border: '1px solid var(--colheita-border)',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--colheita-border-subtle)',
            }}
          >
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--colheita-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                margin: 0,
              }}
            >
              Referência original
            </p>
          </div>
          <div
            style={{
              padding: '20px',
              minHeight: '400px',
              backgroundColor: 'var(--colheita-surface-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={reference.title}
                style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }}
              />
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-tertiary)' }}>
                Asset indisponível
              </p>
            )}
          </div>
        </div>

        {/* Blueprint extraído */}
        <div
          style={{
            borderRadius: 'var(--colheita-radius-lg)',
            border: '1px solid var(--colheita-border)',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--colheita-border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--colheita-brand-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                margin: 0,
              }}
            >
              Estrutura extraída
            </p>
            {blueprint?.version ? (
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  color: 'var(--colheita-text-tertiary)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                v{blueprint.version}
              </span>
            ) : null}
          </div>

          {bp ? (
            <div style={{ padding: '20px' }}>
              {/* Format + grid + visual intent */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '12px',
                  marginBottom: '24px',
                }}
              >
                <MetaPill label="Aspect" value={bp.format?.aspectRatio ?? '—'} />
                <MetaPill label="Orientação" value={bp.format?.orientation ?? '—'} />
                <MetaPill label="Densidade" value={bp.grid?.density ?? '—'} />
                <MetaPill label="Mood" value={bp.visualIntent?.mood ?? '—'} />
              </div>

              {/* Regions */}
              {regions.length > 0 ? (
                <>
                  <p
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: 'var(--colheita-text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      margin: '0 0 12px',
                    }}
                  >
                    Regiões · {regions.length}
                  </p>
                  <ol
                    style={{
                      listStyle: 'none',
                      margin: 0,
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {regions.map((region) => (
                      <RegionRow key={region.id} region={region} />
                    ))}
                  </ol>
                </>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-tertiary)' }}>
                  Nenhuma região extraída.
                </p>
              )}
            </div>
          ) : (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--colheita-text-tertiary)',
                fontSize: '0.875rem',
              }}
            >
              Análise ainda não foi executada nesta referência.
            </div>
          )}
        </div>
      </div>

      {/* Render com identidade Argho — fecha o ciclo do Layout Inference */}
      {blueprint && status !== 'archived' ? (
        <section
          style={{
            padding: '24px 28px',
            marginBottom: '32px',
            borderRadius: 'var(--colheita-radius-lg)',
            border: '1px solid var(--colheita-brand-primary-line)',
            backgroundColor: 'var(--colheita-brand-primary-soft)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="argho-eyebrow" style={{ display: 'inline-block', margin: '0 0 8px' }}>
                Render Argho
              </p>
              <h2
                className="argho-display"
                style={{
                  fontSize: '1.25rem',
                  color: '#0a0a0a',
                  margin: '0 0 6px',
                }}
              >
                Aplicar identidade visual blindada
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--colheita-text-secondary)',
                  margin: 0,
                  maxWidth: '54ch',
                  lineHeight: 1.55,
                }}
              >
                Compila o blueprint com tokens Argho (azul #183090, verde #489030, Geist) e
                renderiza o PDF print-ready via Playwright. O resultado vai pro histórico de
                materiais.
              </p>
            </div>
            <RenderButton blueprintId={blueprint.id as string} />
          </div>
        </section>
      ) : null}

      {/* Materiais ja renderizados */}
      {renderedMaterials && renderedMaterials.length > 0 ? (
        <section style={{ marginBottom: '40px' }}>
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--colheita-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              margin: '0 0 14px',
            }}
          >
            Renders Argho · {renderedMaterials.length}
          </p>
          <ol
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {renderedMaterials.map((m) => {
              const inputData = m.input_data as {
                blueprint_version?: number;
                blueprint_hash?: string;
              } | null;
              const generatedAt = new Date(m.generated_at as string);
              const duration = (Number(m.duration_ms) / 1000).toFixed(1);
              return (
                <li
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--colheita-radius-md)',
                    border: '1px solid var(--colheita-border)',
                    backgroundColor: '#ffffff',
                    boxShadow: 'var(--shadow-card)',
                    gap: '12px',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#0a0a0a',
                        margin: '0 0 2px',
                        letterSpacing: '-0.005em',
                      }}
                    >
                      Render v{inputData?.blueprint_version ?? '—'} ·{' '}
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 500,
                          color: 'var(--colheita-text-tertiary)',
                          fontSize: '0.75rem',
                        }}
                      >
                        {inputData?.blueprint_hash ?? ''}
                      </span>
                    </p>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--colheita-text-tertiary)',
                        margin: 0,
                      }}
                    >
                      {generatedAt.toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      · {duration}s
                    </p>
                  </div>
                  {m.output_url ? (
                    <a
                      href={m.output_url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: 'var(--colheita-brand-primary)',
                        textDecoration: 'none',
                        flexShrink: 0,
                      }}
                    >
                      Abrir PDF →
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      {/* Metricas */}
      {blueprint ? (
        <section style={{ marginBottom: '40px' }}>
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--colheita-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              margin: '0 0 14px',
            }}
          >
            Métricas do modelo
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
            }}
          >
            <MetricCard
              icon={Brain}
              label="Modelo"
              value={(blueprint.model_used as string | null) ?? '—'}
            />
            <MetricCard
              icon={Clock}
              label="Latência"
              value={
                blueprint.duration_ms
                  ? `${(Number(blueprint.duration_ms) / 1000).toFixed(1)}s`
                  : '—'
              }
            />
            <MetricCard
              icon={DollarSign}
              label="Custo"
              value={blueprint.cost_usd ? `$${Number(blueprint.cost_usd).toFixed(4)}` : '—'}
            />
            <MetricCard
              label="Tokens"
              value={
                blueprint.tokens_input && blueprint.tokens_output
                  ? `${blueprint.tokens_input} in / ${blueprint.tokens_output} out`
                  : '—'
              }
            />
          </div>
        </section>
      ) : null}

      {/* Raw blueprint (JSON dump pra debug) */}
      {bp ? (
        <details
          style={{
            marginBottom: '32px',
            padding: '14px 18px',
            borderRadius: 'var(--colheita-radius-lg)',
            border: '1px solid var(--colheita-border)',
            backgroundColor: '#ffffff',
          }}
        >
          <summary
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--colheita-text-secondary)',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            JSON cru do blueprint
          </summary>
          <pre
            style={{
              marginTop: '12px',
              padding: '14px',
              borderRadius: 'var(--colheita-radius-md)',
              backgroundColor: 'var(--colheita-surface-muted)',
              border: '1px solid var(--colheita-border-subtle)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--colheita-text-primary)',
              overflow: 'auto',
              maxHeight: '400px',
              lineHeight: 1.5,
            }}
          >
            {JSON.stringify(bp, null, 2)}
          </pre>
        </details>
      ) : null}
    </div>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────────

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 'var(--colheita-radius-md)',
        backgroundColor: 'var(--colheita-surface-muted)',
        border: '1px solid var(--colheita-border-subtle)',
      }}
    >
      <p
        style={{
          fontSize: '0.625rem',
          fontWeight: 600,
          color: 'var(--colheita-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: '0 0 2px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: '#0a0a0a',
          letterSpacing: '-0.005em',
          margin: 0,
          textTransform: value.length < 20 ? 'capitalize' : undefined,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function RegionRow({ region }: { region: LayoutRegion }) {
  const widthPercent = `${Math.max(4, Math.round(region.weight * 100))}%`;
  return (
    <li
      style={{
        padding: '10px 12px',
        borderRadius: 'var(--colheita-radius-md)',
        backgroundColor: 'var(--colheita-surface-muted)',
        border: '1px solid var(--colheita-border-subtle)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#0a0a0a',
              letterSpacing: '-0.005em',
            }}
          >
            {REGION_TYPE_LABEL[region.type] ?? region.type}
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--colheita-text-tertiary)',
            }}
          >
            #{region.id}
          </span>
        </div>
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--colheita-brand-primary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {(region.weight * 100).toFixed(0)}%
        </span>
      </div>

      {/* Barra visual de peso */}
      <div
        style={{
          height: '4px',
          borderRadius: '2px',
          backgroundColor: 'var(--colheita-border-subtle)',
          overflow: 'hidden',
          marginBottom: '6px',
        }}
      >
        <div
          style={{
            width: widthPercent,
            height: '100%',
            backgroundColor: 'var(--colheita-brand-primary)',
          }}
        />
      </div>

      <div
        style={{
          fontSize: '0.6875rem',
          color: 'var(--colheita-text-tertiary)',
        }}
      >
        Posição:{' '}
        <strong style={{ color: 'var(--colheita-text-secondary)' }}>
          {POSITION_LABEL[region.position] ?? region.position}
        </strong>
        {region.hierarchy && region.hierarchy.length > 0 ? (
          <>
            {' · '}
            <span>{region.hierarchy.join(', ')}</span>
          </>
        ) : null}
      </div>
    </li>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Brain;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 'var(--colheita-radius-lg)',
        border: '1px solid var(--colheita-border)',
        backgroundColor: '#ffffff',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '6px',
        }}
      >
        {Icon ? <Icon size={12} strokeWidth={1.75} color="var(--colheita-text-tertiary)" /> : null}
        <p
          style={{
            fontSize: '0.625rem',
            fontWeight: 600,
            color: 'var(--colheita-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            margin: 0,
          }}
        >
          {label}
        </p>
      </div>
      <p
        style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#0a0a0a',
          letterSpacing: '-0.01em',
          margin: 0,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </p>
    </div>
  );
}
