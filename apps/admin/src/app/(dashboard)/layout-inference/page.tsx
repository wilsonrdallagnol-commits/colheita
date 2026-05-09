// apps/admin/src/app/(dashboard)/layout-inference/page.tsx
//
// Camada 5 — Layout Inference Engine.
//
// FEATURE DIFERENCIADA do Programa Colheita: marketing sobe um layout de
// referencia (peca de concorrente, inspiracao externa, material antigo).
// Claude Sonnet 4.5 vision extrai a estrutura abstrata (regioes, hierarquia,
// intencao visual). Sistema re-renderiza com identidade da Argho.
//
// Mesma referencia gera material Argho hoje e EVOFIT amanha sem retrabalho.
//
// v1: pagina explicativa + uploader placeholder. Implementacao real do
// pipeline (vision API + render) em sprint dedicado, requer brainstorming.

import { requireAuth } from '@colheita/auth';
import { Brain, FileImage, Layers, Palette, Sparkles, Upload, Wand2 } from 'lucide-react';
import { cookies } from 'next/headers';

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

export default async function LayoutInferencePage() {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);

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

      {/* Uploader placeholder */}
      <div
        style={{
          marginBottom: '48px',
          padding: '48px 32px',
          borderRadius: 'var(--colheita-radius-lg)',
          border: '2px dashed var(--colheita-brand-primary-line)',
          backgroundColor: 'var(--colheita-brand-primary-soft)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--colheita-radius-lg)',
            backgroundColor: '#ffffff',
            color: 'var(--colheita-brand-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-blue-glow)',
          }}
        >
          <Wand2 size={26} strokeWidth={1.5} />
        </div>
        <h2
          className="argho-display"
          style={{
            fontSize: '1.375rem',
            color: '#0a0a0a',
            margin: '0 0 8px',
          }}
        >
          Pipeline em construção
        </h2>
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--colheita-text-secondary)',
            margin: '0 auto 20px',
            maxWidth: '52ch',
            lineHeight: 1.55,
          }}
        >
          O upload + análise visual entram em produção em sprint dedicado. A arquitetura do pacote{' '}
          <code
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--colheita-brand-primary-line)',
              color: 'var(--colheita-brand-primary)',
            }}
          >
            @colheita/layout-inference
          </code>{' '}
          já está pronta — só falta plugar Claude vision.
        </p>
        <button
          type="button"
          disabled
          aria-disabled="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--colheita-radius-md)',
            border: 'none',
            backgroundColor: 'var(--colheita-brand-primary)',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'not-allowed',
            opacity: 0.5,
            letterSpacing: '-0.005em',
          }}
        >
          <Upload size={14} strokeWidth={1.75} />
          Subir referência
        </button>
      </div>

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
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
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

      {/* Casos de uso */}
      <section
        style={{
          padding: '28px 32px',
          borderRadius: 'var(--colheita-radius-lg)',
          backgroundColor: 'var(--colheita-brand-secondary-soft)',
          border: '1px solid var(--colheita-brand-secondary-line)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
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
    </div>
  );
}
