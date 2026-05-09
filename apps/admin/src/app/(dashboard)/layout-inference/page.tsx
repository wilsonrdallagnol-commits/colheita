// apps/admin/src/app/(dashboard)/layout-inference/page.tsx
//
// Camada 5 — Layout Inference Engine. Pipeline real: upload + Claude vision +
// blueprint extraido + persistencia. UI client em LayoutInferenceUploader.

import { createServerClient, requireAuth } from '@colheita/auth';
import { Brain, FileImage, Layers, Palette, Sparkles, Upload } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { LayoutInferenceUploader } from '@/components/layout-inference/uploader';

export const metadata = { title: 'Layout Inference' };

interface PipelineStep {
  icon: typeof Upload;
  title: string;
  description: string;
}

const PIPELINE: PipelineStep[] = [
  {
    icon: Upload,
    title: '1. Upload da referência',
    description:
      'Marketing sobe imagem do material — peça de concorrente, inspiração externa, layout antigo, screenshot.',
  },
  {
    icon: Brain,
    title: '2. Análise por Claude vision',
    description:
      'Claude Sonnet 4.5 extrai a estrutura abstrata: regiões, hierarquia, peso visual, intenção tipográfica.',
  },
  {
    icon: Layers,
    title: '3. Mapeamento estrutural',
    description:
      'Sistema converte em DSL (regions, slots, type roles) — desconectado de qualquer brand específica.',
  },
  {
    icon: Palette,
    title: '4. Re-render com identidade Argho',
    description:
      'Mesma estrutura ganha tokens visuais Argho — paleta blue/green, Geist, fotos do PIM/DAM.',
  },
  {
    icon: FileImage,
    title: '5. Output em qualidade print-ready',
    description:
      'PDF 300dpi via Playwright + PNG retina pra redes sociais. Versionado em generated_materials.',
  },
];

interface BlueprintRow {
  id: string;
  status: string;
  cost_usd: number | null;
  duration_ms: number | null;
  created_at: string;
  reference:
    | {
        id: string;
        title: string;
        intended_category: string | null;
        asset: { storage_path: string } | { storage_path: string }[] | null;
      }
    | {
        id: string;
        title: string;
        intended_category: string | null;
        asset: { storage_path: string } | { storage_path: string }[] | null;
      }[]
    | null;
}

const CATEGORY_LABEL: Record<string, string> = {
  datasheet: 'Ficha técnica',
  banner: 'Banner',
  social_post: 'Post social',
  catalog: 'Catálogo',
  presentation: 'Apresentação',
  flyer: 'Flyer',
  other: 'Outro',
};

const STATUS_LABEL: Record<string, string> = {
  analyzing: 'Analisando',
  draft: 'Rascunho',
  reviewed: 'Revisado',
  approved: 'Aprovado',
  archived: 'Arquivado',
};

export default async function LayoutInferencePage() {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Lista os ultimos 12 blueprints + reference + asset thumbnail
  const { data: rawBlueprints } = await supabase
    .from('layout_blueprints')
    .select(
      `id, status, cost_usd, duration_ms, created_at,
       reference:layout_references!inner(id, title, intended_category,
         asset:assets!inner(storage_path))`,
    )
    .eq('is_current', true)
    .order('created_at', { ascending: false })
    .limit(12);

  const blueprints = (rawBlueprints ?? []) as unknown as BlueprintRow[];

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)' }}>
      <header style={{ marginBottom: '40px' }}>
        <p className="argho-eyebrow" style={{ display: 'inline-block', marginBottom: '12px' }}>
          Geração · Layout Inference
        </p>
        <h1
          className="argho-display"
          style={{
            fontSize: 'clamp(2rem, 2.8vw, 2.75rem)',
            color: '#0a0a0a',
            margin: '0 0 12px',
          }}
        >
          Suba uma referência —{' '}
          <span style={{ color: 'var(--colheita-brand-primary)' }}>
            renderize com a cara da Argho.
          </span>
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--colheita-text-secondary)',
            margin: 0,
            maxWidth: '64ch',
            lineHeight: 1.55,
          }}
        >
          Feature diferenciada do Colheita. Claude Sonnet 4.5 vision lê a estrutura, sistema
          re-renderiza com identidade visual blindada. Mesma referência gera material Argho hoje e
          EVOFIT amanhã, sem retrabalho.
        </p>
      </header>

      <div style={{ marginBottom: '48px' }}>
        <LayoutInferenceUploader />
      </div>

      {/* Lista de blueprints recentes */}
      {blueprints.length > 0 ? (
        <section style={{ marginBottom: '48px' }}>
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
            Blueprints recentes · {blueprints.length}
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px',
            }}
          >
            {blueprints.map((bp) => {
              const ref = Array.isArray(bp.reference) ? bp.reference[0] : bp.reference;
              if (!ref) return null;
              const asset = Array.isArray(ref.asset) ? ref.asset[0] : ref.asset;
              const storagePath = asset?.storage_path ?? '';
              const thumbnailUrl = storagePath
                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${storagePath}`
                : null;

              return (
                <Link
                  key={bp.id}
                  href={`/layout-inference/${ref.id}`}
                  style={{
                    display: 'block',
                    borderRadius: 'var(--colheita-radius-lg)',
                    border: '1px solid var(--colheita-border)',
                    backgroundColor: '#ffffff',
                    boxShadow: 'var(--shadow-card)',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    transition: 'box-shadow 200ms ease',
                  }}
                >
                  <div
                    style={{
                      aspectRatio: '4 / 3',
                      backgroundColor: 'var(--colheita-surface-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={ref.title}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <FileImage
                        size={28}
                        color="var(--colheita-text-tertiary)"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#0a0a0a',
                        margin: '0 0 4px',
                        letterSpacing: '-0.01em',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {ref.title}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexWrap: 'wrap',
                        fontSize: '0.6875rem',
                        color: 'var(--colheita-text-tertiary)',
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          color: 'var(--colheita-brand-primary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        {ref.intended_category
                          ? (CATEGORY_LABEL[ref.intended_category] ?? ref.intended_category)
                          : 'Auto'}
                      </span>
                      <span>·</span>
                      <span>{STATUS_LABEL[bp.status] ?? bp.status}</span>
                      {bp.cost_usd ? (
                        <>
                          <span>·</span>
                          <span>${bp.cost_usd.toFixed(4)}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Pipeline editorial */}
      <section style={{ marginBottom: '40px' }}>
        <h2
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--colheita-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            margin: '0 0 20px',
          }}
        >
          Como funciona
        </h2>

        <ol
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
          }}
        >
          {PIPELINE.map((step) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
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
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--colheita-radius-md)',
                    backgroundColor: 'var(--colheita-brand-primary-soft)',
                    color: 'var(--colheita-brand-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <Icon size={16} strokeWidth={1.75} />
                </div>
                <p
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    color: '#0a0a0a',
                    letterSpacing: '-0.01em',
                    margin: '0 0 6px',
                  }}
                >
                  {step.title}
                </p>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--colheita-text-secondary)',
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Manifesto multi-tenant */}
      <section
        style={{
          padding: '28px 32px',
          borderRadius: 'var(--colheita-radius-lg)',
          backgroundColor: 'var(--colheita-brand-secondary-soft)',
          border: '1px solid var(--colheita-brand-secondary-line)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--colheita-radius-md)',
              backgroundColor: '#ffffff',
              color: 'var(--colheita-brand-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={16} strokeWidth={1.75} />
          </div>
          <div>
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--colheita-brand-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                margin: '0 0 8px',
              }}
            >
              Por que isso importa
            </p>
            <p
              style={{
                fontSize: '0.9375rem',
                color: '#0a0a0a',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                margin: '0 0 8px',
              }}
            >
              Multi-tenant nativo desde o primeiro byte.
            </p>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--colheita-text-secondary)',
                lineHeight: 1.55,
                margin: 0,
                maxWidth: '64ch',
              }}
            >
              Quando EVOFIT entrar como tenant, marketing não precisa redesenhar nada. A mesma
              referência que rendou um banner Argho hoje rende um banner EVOFIT amanhã com 1 clique
              — apenas trocando os tokens visuais e o catálogo de produtos.
            </p>
          </div>
        </div>
      </section>

      {/* Link arquitetural */}
      <p
        style={{
          marginTop: '32px',
          fontSize: '0.8125rem',
          color: 'var(--colheita-text-tertiary)',
          textAlign: 'center',
        }}
      >
        Pacote{' '}
        <code
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--colheita-brand-primary)',
          }}
        >
          @colheita/layout-inference
        </code>{' '}
        — analyzer (Claude vision) + blueprint schema (Zod) + compiler (blueprint → render spec).
      </p>
    </div>
  );
}
