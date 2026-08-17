// apps/portal/src/app/(public)/produtos/[slug]/page.tsx
import { createServerClient, getSession } from '@colheita/auth';
import type { ProductApplication, ProductComposition, ProductPackaging } from '@colheita/db';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data } = await supabase
    .from('products')
    .select('name, tagline')
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single();

  if (!data) return { title: slug.replace(/-/g, ' ') };

  return {
    title: data.name,
    description: data.tagline ?? undefined,
  };
}

function packagingLabel(p: ProductPackaging[number]) {
  if (p.weightKg) return `${p.type} ${p.weightKg} kg`;
  if (p.volumeL) return `${p.type} ${p.volumeL} L`;
  return p.type;
}

/**
 * Composição microbiológica: a chave vem do banco como
 * "<Gênero> <espécie>[ subsp. <subespécie>] [<código da cepa>]" — a cepa entra
 * na chave (migration 0050) porque é o único jeito de distinguir duas cepas da
 * mesma espécie (Nemax tem 2x Trichoderma harzianum; Troian, 2x B. velezensis).
 *
 * Convenção de nomenclatura: só gênero e epíteto vão em itálico. Conectores
 * ("sp.", "subsp.", "var.") e código de cepa ("DC 101", "IB 19/17", "SEMIA 658")
 * ficam em romano. Sem cepa na chave, o nome inteiro segue itálico como antes.
 */
const NAME_CONNECTORS = new Set(['sp.', 'spp.', 'subsp.', 'ssp.', 'var.', 'f.']);

function microbialNameSegments(raw: string): { text: string; italic: boolean }[] {
  const segments: { text: string; italic: boolean }[] = [];
  for (const token of raw.split(/\s+/).filter(Boolean)) {
    // Epíteto/gênero = só letras (o gênero vem capitalizado). Conector e código
    // de cepa (tem dígito, barra ou caixa alta no meio) nunca são itálico.
    const italic = !NAME_CONNECTORS.has(token) && /^[A-Za-zÀ-ÿ][a-zà-ÿ-]*$/.test(token);
    const last = segments[segments.length - 1];
    if (last && last.italic === italic) last.text += ` ${token}`;
    else segments.push({ text: token, italic });
  }
  return segments;
}

export default async function ProdutoDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data, error } = await supabase
    .from('products')
    .select(
      'id, name, tagline, description, safra_codigo, composition, technical_specs, packaging, applications, category:product_categories(name)',
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    notFound();
  }

  // Disponibilidade de estoque (somente se produto mapeado ao Safra)
  const { data: stockRows } = data.safra_codigo
    ? await supabase
        .from('product_stock')
        .select('deposito, estoque, unidade')
        .eq('safra_codigo', data.safra_codigo)
    : { data: null };

  const totalEstoque = stockRows?.reduce((acc, r) => acc + Number(r.estoque), 0) ?? null;
  const hasStock = totalEstoque !== null && totalEstoque > 0;
  const stockTracked = stockRows !== null;

  const category = Array.isArray(data.category)
    ? (data.category[0] ?? null)
    : (data.category ?? null);

  const session = await getSession(cookieStore);
  const isAuthenticated = !!session;

  const composition = (data.composition ?? {}) as ProductComposition;
  const technicalSpecs = (data.technical_specs ?? {}) as Record<string, unknown>;
  const packaging = (data.packaging ?? []) as ProductPackaging;
  const applications = (data.applications ?? []) as ProductApplication[];

  // Resolve nutrients from structured or flat format
  const structured = {
    ...composition.macros,
    ...composition.micros,
    ...composition.others,
  };
  const isStructured = Object.keys(structured).length > 0;
  const flat = Object.fromEntries(
    Object.entries(composition as Record<string, unknown>).filter(
      ([k]) => !['macros', 'micros', 'others'].includes(k),
    ),
  );
  const nutrients = isStructured ? structured : flat;
  const hasNutrients = Object.keys(nutrients).length > 0;

  // Produtos biologicos no modelo neutro (compliance MAPA) - composicao
  // ja vem com valor placeholder 1 (sem %), so o nome cientifico importa.
  // Ver apps/website/docs/biologicos-compliance.md.
  // biome-ignore lint/complexity/useLiteralKeys: snake_case DB field
  const productType = technicalSpecs['product_type'] as string | undefined;
  const isMicrobialComplex = productType === 'Complexo microbiológico';

  // Technical specs to display (exclude internal fields)
  const specEntries = Object.entries(technicalSpecs).filter(
    ([k]) => !k.startsWith('registration_'),
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>
      {/* Back link */}
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.875rem',
          color: 'var(--colheita-text-tertiary)',
          textDecoration: 'none',
          marginBottom: '32px',
        }}
      >
        ← Voltar ao catálogo
      </Link>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '48px',
          alignItems: 'start',
        }}
      >
        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* Header */}
          <div>
            {category && (
              <p
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'var(--colheita-brand-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 24,
                    height: 2,
                    background: 'var(--colheita-brand-secondary)',
                  }}
                />
                {category.name}
              </p>
            )}
            <h1
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                color: 'var(--colheita-text-primary)',
                letterSpacing: '-0.04em',
                marginBottom: 14,
                lineHeight: 1.05,
                textTransform: 'uppercase',
              }}
            >
              {data.name}
            </h1>
            {data.tagline && (
              <p
                style={{
                  fontSize: '1.125rem',
                  color: 'var(--colheita-text-secondary)',
                  lineHeight: 1.6,
                  maxWidth: 640,
                }}
              >
                {data.tagline}
              </p>
            )}
          </div>

          {/* Description */}
          {data.description && (
            <div>
              <h2
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '14px',
                }}
              >
                Descrição
              </h2>
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--colheita-text-secondary)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line',
                }}
              >
                {data.description}
              </p>
            </div>
          )}

          {/* Composition - renderer padrao (minerais/organominerais com %) */}
          {hasNutrients && !isMicrobialComplex && (
            <div>
              <h2
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '14px',
                }}
              >
                Composição garantida
              </h2>
              <div
                style={{
                  border: '1px solid var(--colheita-border)',
                  borderRadius: 'var(--colheita-radius-lg)',
                  overflow: 'hidden',
                }}
              >
                {Object.entries(nutrients).map(([nutrient, value], i, arr) => (
                  <div
                    key={nutrient}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px 20px',
                      borderBottom:
                        i < arr.length - 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--colheita-text-secondary)',
                      }}
                    >
                      {nutrient}
                    </span>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--colheita-text-primary)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Composition - renderer alternativo modelo neutro (biologicos) */}
          {hasNutrients && isMicrobialComplex && (
            <div>
              <h2
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '14px',
                }}
              >
                Composição microbiológica
              </h2>
              <div
                style={{
                  border: '1px solid var(--colheita-border)',
                  borderRadius: 'var(--colheita-radius-lg)',
                  overflow: 'hidden',
                }}
              >
                {Object.keys(nutrients).map((species, i, arr) => (
                  <div
                    key={species}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '10px',
                      padding: '12px 20px',
                      borderBottom:
                        i < arr.length - 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--colheita-brand-primary)',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.9375rem',
                        color: 'var(--colheita-text-primary)',
                      }}
                    >
                      {microbialNameSegments(species).map((seg, idx) => (
                        <span
                          // biome-ignore lint/suspicious/noArrayIndexKey: segmentos derivam da string, sem id proprio
                          key={`${species}-${idx}`}
                          style={{ fontStyle: seg.italic ? 'italic' : 'normal' }}
                        >
                          {idx > 0 ? ' ' : ''}
                          {seg.text}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
              <p
                style={{
                  marginTop: '10px',
                  fontSize: '0.6875rem',
                  color: 'var(--colheita-text-tertiary)',
                  lineHeight: 1.5,
                }}
              >
                Composição microbiológica declarada conforme padrão Argho de formulação.
              </p>
            </div>
          )}
          {/* Applications */}
          {applications.length > 0 && (
            <div>
              <h2
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '14px',
                }}
              >
                Indicações por Cultura
              </h2>
              <div
                style={{
                  border: '1px solid var(--colheita-border)',
                  borderRadius: 'var(--colheita-radius-lg)',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 100px 1.5fr',
                    padding: '10px 20px',
                    backgroundColor: 'var(--colheita-surface-elevated)',
                    borderBottom: '1px solid var(--colheita-border)',
                    gap: '12px',
                  }}
                >
                  {['Cultura', 'Estádio', 'Dose/ha', 'Observações'].map((h) => (
                    <span
                      key={h}
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: '600',
                        color: 'var(--colheita-text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {h}
                    </span>
                  ))}
                </div>
                {applications.map((app, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: stable positional list
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 100px 1.5fr',
                      padding: '12px 20px',
                      gap: '12px',
                      borderBottom:
                        i < applications.length - 1
                          ? '1px solid var(--colheita-border-subtle)'
                          : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--colheita-text-primary)',
                      }}
                    >
                      {app.crop}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
                      {app.stage ?? '—'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--colheita-text-secondary)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {app.dosePerHa} {app.unit}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--colheita-text-tertiary)' }}>
                      {app.notes ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div
          style={{
            backgroundColor: 'var(--colheita-surface-elevated)',
            border: '1px solid var(--colheita-border)',
            borderRadius: 'var(--colheita-radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'sticky',
            top: '72px',
          }}
        >
          {/* Technical specs */}
          {specEntries.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: '600',
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '14px',
                }}
              >
                Especificações
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {specEntries.map(([key, value]) => (
                  <div key={key}>
                    <p
                      style={{
                        fontSize: '0.6875rem',
                        color: 'var(--colheita-text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '2px',
                      }}
                    >
                      {translateSpecKey(key)}
                    </p>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--colheita-text-primary)',
                      }}
                    >
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Packaging */}
          {packaging.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: '600',
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '14px',
                }}
              >
                Embalagens
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {packaging.map((p) => (
                  <span
                    key={packagingLabel(p)}
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--colheita-text-secondary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {packagingLabel(p)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Disponibilidade de estoque */}
          {stockTracked && (
            <div
              style={{
                paddingTop: '16px',
                borderTop: '1px solid var(--colheita-border-subtle)',
              }}
            >
              <p
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: '600',
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '10px',
                }}
              >
                Disponibilidade
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: hasStock
                      ? 'var(--colheita-success)'
                      : 'var(--colheita-text-tertiary)',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: hasStock ? 'var(--colheita-success)' : 'var(--colheita-text-tertiary)',
                  }}
                >
                  {hasStock ? 'Disponível' : 'Esgotado'}
                </span>
              </div>
              {stockRows && stockRows.length > 1 && (
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--colheita-text-tertiary)',
                    marginTop: '6px',
                  }}
                >
                  {stockRows.filter((r) => Number(r.estoque) > 0).length} de {stockRows.length}{' '}
                  depósitos com estoque
                </p>
              )}
            </div>
          )}

          {/* Ficha técnica download */}
          <div
            style={{
              paddingTop: '4px',
              borderTop: '1px solid var(--colheita-border-subtle)',
            }}
          >
            {isAuthenticated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a
                  href={`/produtos/${slug}/ficha-tecnica`}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: 'var(--colheita-radius-md)',
                    backgroundColor: 'var(--colheita-brand-primary)',
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textDecoration: 'none',
                    textAlign: 'center',
                    letterSpacing: '-0.01em',
                  }}
                >
                  ↓ Baixar Ficha Técnica (PDF)
                </a>
                <Link
                  href="/conta/assistente"
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: 'var(--colheita-radius-md)',
                    backgroundColor: 'var(--colheita-brand-secondary)',
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textDecoration: 'none',
                    textAlign: 'center',
                    letterSpacing: '-0.01em',
                  }}
                >
                  ✨ Perguntar ao Agrônomo IA
                </Link>
                <Link
                  href={`/conta/suporte?produto=${slug}`}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: 'var(--colheita-radius-md)',
                    border: '1px solid var(--colheita-border)',
                    backgroundColor: 'transparent',
                    color: 'var(--colheita-text-secondary)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textDecoration: 'none',
                    textAlign: 'center',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Falar com agrônomo humano
                </Link>
              </div>
            ) : (
              <Link
                href={`/entrar?next=/produtos/${slug}`}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 'var(--colheita-radius-md)',
                  border: '1px solid var(--colheita-border)',
                  backgroundColor: 'transparent',
                  color: 'var(--colheita-text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  textAlign: 'center',
                  letterSpacing: '-0.01em',
                }}
              >
                Entrar para baixar a ficha técnica
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Nota legal — fora do container principal para aparecer em TODA página de produto,
          inclusive nas que não têm bloco de composição. */}
      {category?.name && NOTA_LEGAL[category.name] && (
        <div
          style={{
            maxWidth: '1200px',
            margin: '32px auto 0',
            padding: '16px 20px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '8px',
            background: 'rgba(0,0,0,0.02)',
          }}
        >
          <span aria-hidden style={{ fontWeight: 700, flexShrink: 0, opacity: 0.55 }}>
            §
          </span>
          <p style={{ fontSize: '0.8125rem', lineHeight: 1.65, margin: 0, opacity: 0.75 }}>
            {NOTA_LEGAL[category.name]}
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Nota legal por categoria. Até 17/08/2026 a página de produto do portal não tinha
// NENHUMA — nem a do site tinha, e foi corrigida no mesmo dia. Aqui pesa mais: o portal
// é a superfície do cliente logado, que é quem de fato compra.
//
// Enquadramento dos biológicos = o MESMO dos 8 rótulos impressos (decisão do Wilson,
// 17/08/2026): art. 36 da Lei 15.070/2024. Ele é transitório (Cap. X) e vige até sair a
// regulamentação — quando sair, o parágrafo único dá 12 meses: revisar rótulo, catálogo,
// site e portal JUNTOS.
//
// A vedação de comercializar o produzido vai SEM citação de artigo: ela é do art. 10,
// caput (regime permanente), e amarrá-la ao art. 36 seria atribuir a norma errada.
const NOTA_LEGAL: Record<string, string> = {
  Biológicos:
    'Inóculo fornecido como insumo para produção de bioinsumos para uso próprio, nos termos ' +
    'do art. 36 da Lei Federal nº 15.070/2024; vedada a comercialização do bioinsumo ' +
    'produzido. Composição microbiológica declarada. Este material não substitui o rótulo — ' +
    'consulte nossa equipe técnica.',
  'Fertilizantes Minerais':
    'Fertilizante mineral com Registro no MAPA (Ministério da Agricultura, Pecuária e ' +
    'Abastecimento) e composição garantida conforme Certificado de Análise. O uso de ' +
    'fertilizantes requer acompanhamento de Engenheiro Agrônomo ou Florestal habilitado, ' +
    'conforme Lei 5.194/66. As recomendações de dose são orientativas. Este material não ' +
    'substitui o rótulo — consulte nossa equipe técnica.',
  Organominerais:
    'Fertilizante organomineral com Registro no MAPA (Ministério da Agricultura, Pecuária e ' +
    'Abastecimento) e composição garantida conforme Certificado de Análise. O uso de ' +
    'fertilizantes requer acompanhamento de Engenheiro Agrônomo ou Florestal habilitado, ' +
    'conforme Lei 5.194/66. As recomendações de dose são orientativas. Este material não ' +
    'substitui o rótulo — consulte nossa equipe técnica.',
  Adjuvantes:
    'Adjuvante isento de registro no MAPA, nos termos da legislação vigente. As recomendações ' +
    'de dose são orientativas. Este material não substitui o rótulo — consulte nossa equipe ' +
    'técnica.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Tradução de chaves de specs técnicas (vem do JSONB do banco em ingles).
// Fallback: replace underscores -> spaces.
const SPEC_LABEL_PT: Record<string, string> = {
  ph: 'pH',
  product_type: 'Tipo de produto',
  concentration_total: 'Concentração',
  compatibility: 'Compatibilidade',
  raw_materials: 'Matérias-primas',
  origin_country: 'País de origem',
  physical_state: 'Estado físico',
  application_modes: 'Modos de aplicação',
  density: 'Densidade',
  shelf_life: 'Validade',
  storage: 'Armazenamento',
  classification: 'Classificação',
};

function translateSpecKey(key: string): string {
  return SPEC_LABEL_PT[key] ?? key.replace(/_/g, ' ');
}
