// apps/website/src/app/produtos/[slug]/page.tsx
// Detalhe de produto — Argho Agrosciences (Redesign 2026)
// White-first. Ficha técnica como instrumento de precisão (light panel).
// Espelho da home: tipografia editorial bold + paleta oficial Argho.

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CATEGORIES, getProductBySlug, PRODUCTS, type ProductCategory } from '@/lib/products';

const CAT_COLORS: Record<ProductCategory, string> = {
  'fertilizantes-minerais': 'var(--cat-mineral)',
  organominerais: 'var(--cat-organo)',
  biologicos: 'var(--cat-bio)',
  adjuvantes: 'var(--cat-adj)',
};

const CAT_RAW: Record<ProductCategory, string> = {
  'fertilizantes-minerais': 'oklch(0.586 0.150 138.8)',
  organominerais: 'oklch(0.362 0.160 266.7)',
  biologicos: 'oklch(0.55 0.150 145)',
  adjuvantes: 'oklch(0.62 0.130 78)',
};

const CAT_BG_SOFT: Record<ProductCategory, string> = {
  'fertilizantes-minerais': 'var(--cat-mineral-soft)',
  organominerais: 'var(--cat-organo-soft)',
  biologicos: 'var(--cat-bio-soft)',
  adjuvantes: 'var(--cat-adj-soft)',
};

const CAT_LINE: Record<ProductCategory, string> = {
  'fertilizantes-minerais': 'var(--cat-mineral-line)',
  organominerais: 'var(--cat-organo-line)',
  biologicos: 'var(--cat-bio-line)',
  adjuvantes: 'var(--cat-adj-line)',
};

const APP_MODE_LABELS: Record<string, string> = {
  'Via Foliar': 'Foliar',
  'Via Fertirrigação': 'Fertirrigação',
  'Via Solo': 'Solo',
};

// Max scale for composition bars per type
const MAX_SCALE = { macro: 40, micro: 10, other: 10 };

// Nomenclatura cientifica: so genero e epiteto vao em italico. Conectores
// ("sp.", "subsp.", "var.") ficam em romano — e o codigo de cepa nunca entra
// aqui (vem no campo `strain`). Ex.: *Bacillus thuringiensis* subsp. *aizawai*.
const NAME_CONNECTORS = new Set(['sp.', 'spp.', 'subsp.', 'ssp.', 'var.', 'f.']);

function speciesSegments(raw: string): { text: string; italic: boolean }[] {
  const segments: { text: string; italic: boolean }[] = [];
  for (const token of raw.split(/\s+/).filter(Boolean)) {
    const italic = !NAME_CONNECTORS.has(token) && /^[A-Za-zÀ-ÿ][a-zà-ÿ-]*$/.test(token);
    const last = segments[segments.length - 1];
    if (last && last.italic === italic) last.text += ` ${token}`;
    else segments.push({ text: token, italic });
  }
  return segments;
}

// Arte premium (rotulo fiel + swirl categorico) — usada no showcase do produto.
// Mockup real composto sobre swirl da categoria/campo (1024², ver .tmp-renders/compose2.py).
const PRODUCT_PREMIUM: Record<string, string> = {
  xcensis: '/products/premium/xcensis.jpg',
  stron: '/products/premium/stron.jpg',
  'grow-calcium': '/products/premium/grow-calcium.jpg',
  defon: '/products/premium/defon.jpg',
  'grow-mob': '/products/premium/grow-mob.jpg',
  'grow-filling': '/products/premium/grow-filling.jpg',
  troian: '/products/premium/troian.jpg',
  biotas: '/products/premium/biotas.jpg',
  sporax: '/products/premium/sporax.jpg',
  controx: '/products/premium/controx.jpg',
  nemax: '/products/premium/nemax.jpg',
  harzon: '/products/premium/harzon.jpg',
  chrom: '/products/premium/chrom.jpg',
  'n-import': '/products/premium/n-import.jpg',
  impuch: '/products/premium/impuch.jpg',
  'life-on': '/products/premium/life-on.jpg',
  'grow-nitrop': '/products/premium/grow-nitrop.jpg',
  'up-soil': '/products/premium/up-soil.jpg',
  'operate-plus': '/products/premium/operate-plus.jpg',
  'operate-citronela': '/products/premium/operate-citronela.jpg',
  'operate-4em1': '/products/premium/operate-4em1.jpg',
  'operate-orange': '/products/premium/operate-orange.jpg',
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'Produto não encontrado' };
  const premiumSrc = PRODUCT_PREMIUM[product.slug];
  return {
    title: product.name,
    description: product.tagline,
    alternates: { canonical: `/produtos/${product.slug}` },
    openGraph: {
      title: `${product.name} | Argho Agrosciences`,
      description: product.tagline,
      url: `/produtos/${product.slug}`,
      type: 'website',
      ...(premiumSrc
        ? { images: [{ url: premiumSrc, width: 1024, height: 1024, alt: product.name }] }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Argho Agrosciences`,
      description: product.tagline,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const catColor = CAT_COLORS[product.category];
  const catRaw = CAT_RAW[product.category];
  const catBgSoft = CAT_BG_SOFT[product.category];
  const catLine = CAT_LINE[product.category];
  const catLabel = CATEGORIES[product.category].label;
  const premiumSrc: string | undefined = PRODUCT_PREMIUM[product.slug];

  // Nota legal por categoria. Ate 17/08/2026 esta pagina nao tinha NENHUMA — so a
  // listagem /produtos tinha, e e aqui que caem os links compartilhados, os redirects
  // dos slugs renomeados e a indexacao do Google.
  //
  // Enquadramento dos biologicos = o MESMO dos rotulos impressos (decisao do Wilson,
  // 17/08/2026): art. 36 da Lei 15.070/2024. O art. 36 esta no Cap. X (Disposicoes
  // Finais e Transitorias) e vige ate a regulamentacao sair — a lei segue sem
  // regulamento (o Decreto 12.502/2025 regulamenta a Lei 14.515/2022, outra). Quando
  // sair, o paragrafo unico da 12 meses de adequacao: revisar rotulo, catalogo e site
  // JUNTOS, senao um cita base vencida enquanto o outro nao.
  //
  // A vedacao de comercializar o bioinsumo produzido vai SEM citacao de artigo: ela e
  // do regime permanente (art. 10, caput), e amarra-la ao art. 36 seria atribuir a
  // norma errada. Como afirmacao isolada e correta e protege a Argho.
  const NOTA_LEGAL: Record<typeof product.category, string> = {
    biologicos:
      'Inóculo fornecido como insumo para produção de bioinsumos para uso próprio, nos termos ' +
      'do art. 36 da Lei Federal nº 15.070/2024; vedada a comercialização do bioinsumo ' +
      'produzido. Composição microbiológica declarada. Este material não substitui o rótulo — ' +
      'consulte nossa equipe técnica.',
    'fertilizantes-minerais':
      'Fertilizante mineral com Registro no MAPA (Ministério da Agricultura, Pecuária e ' +
      'Abastecimento) e composição garantida conforme Certificado de Análise. O uso de ' +
      'fertilizantes requer acompanhamento de Engenheiro Agrônomo ou Florestal habilitado, ' +
      'conforme Lei 5.194/66. As recomendações de dose são orientativas. Este material não ' +
      'substitui o rótulo — consulte nossa equipe técnica.',
    organominerais:
      'Fertilizante organomineral com Registro no MAPA (Ministério da Agricultura, Pecuária e ' +
      'Abastecimento) e composição garantida conforme Certificado de Análise. O uso de ' +
      'fertilizantes requer acompanhamento de Engenheiro Agrônomo ou Florestal habilitado, ' +
      'conforme Lei 5.194/66. As recomendações de dose são orientativas. Este material não ' +
      'substitui o rótulo — consulte nossa equipe técnica.',
    adjuvantes:
      'Adjuvante isento de registro no MAPA, nos termos da legislação vigente. As recomendações ' +
      'de dose são orientativas. Este material não substitui o rótulo — consulte nossa equipe ' +
      'técnica.',
  };
  const notaLegal = NOTA_LEGAL[product.category];

  // Produto "complexo microbiologico": modelo neutro (sem valores quantitativos
  // nem claims). Renderiza so a lista de especies declaradas + diferenciais
  // tecnicos da composicao. Ver doc apps/website/docs/biologicos-compliance.md.
  const isMicrobialComplex =
    !!product.technicalDifferentials && product.technicalDifferentials.length > 0;

  // Composition rows with bar gauge data — populated apenas para produtos
  // com composicao quantificada (minerais, organominerais, biologico Troian legado).
  const compRows: {
    label: string;
    value: string;
    numValue: number;
    maxScale: number;
    type: 'macro' | 'micro' | 'other';
  }[] = [];

  if (!isMicrobialComplex) {
    if (product.composition.macros) {
      for (const [k, v] of Object.entries(product.composition.macros)) {
        compRows.push({
          label: k,
          value: `${v}%`,
          numValue: v,
          maxScale: MAX_SCALE.macro,
          type: 'macro',
        });
      }
    }
    if (product.composition.micros) {
      for (const [k, v] of Object.entries(product.composition.micros)) {
        compRows.push({
          label: k,
          value: `${v}%`,
          numValue: v,
          maxScale: MAX_SCALE.micro,
          type: 'micro',
        });
      }
    }
    if (product.composition.others) {
      for (const [k, v] of Object.entries(product.composition.others)) {
        const isUFC = typeof v === 'number' && v >= 1e7;
        const numV = isUFC ? 100 : typeof v === 'number' ? v : 0;
        const fmt = isUFC ? `${(v / 1e8).toFixed(0)}×10⁸ UFC/g` : `${v}%`;
        compRows.push({
          label: k,
          value: fmt,
          numValue: numV,
          maxScale: isUFC ? 100 : MAX_SCALE.other,
          type: 'other',
        });
      }
    }
  }

  // Especies + cepas declaradas — usadas apenas em produtos "complexo microbiologico".
  // Nome cientifico em italico; codigo de cepa em romano (nunca italico).
  const microbialStrains = isMicrobialComplex ? (product.microbialStrains ?? []) : [];

  // Related products
  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.slug !== product.slug,
  ).slice(0, 4);

  // JSON-LD Product — dados estruturados para buscadores
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.tagline,
    ...(premiumSrc ? { image: `https://arghoagrosciences.com${premiumSrc}` } : {}),
    brand: { '@type': 'Brand', name: 'Argho Agrosciences' },
    category: catLabel,
    ...(product.packaging[0]?.sku ? { sku: product.packaging[0].sku } : {}),
    url: `https://arghoagrosciences.com/produtos/${product.slug}`,
  };

  return (
    <main style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>
      <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
      {/* ═══════════════════════════════════════════════════════════════════
          BREADCRUMB — minimal mono
      ══════════════════════════════════════════════════════════════════════ */}
      <nav
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
          padding: '32px 48px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
        }}
        aria-label="Breadcrumb"
      >
        <Link
          href="/produtos"
          style={{
            color: 'var(--text-muted)',
            textDecoration: 'none',
            letterSpacing: '0.04em',
          }}
        >
          Portfólio
        </Link>
        <span aria-hidden style={{ color: 'var(--text-faint)' }}>
          ›
        </span>
        <Link
          href={`/produtos?categoria=${product.category}`}
          style={{
            color: catColor,
            textDecoration: 'none',
            letterSpacing: '0.04em',
            fontWeight: 600,
          }}
        >
          {catLabel}
        </Link>
        <span aria-hidden style={{ color: 'var(--text-faint)' }}>
          ›
        </span>
        <span
          style={{
            color: 'var(--text-primary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          {product.name}
        </span>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — copy editorial à esquerda + ficha técnica light à direita
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingBottom: '24px',
        }}
      >
        {/* Top accent bar (categoria) */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, ${catRaw} 0%, ${catRaw.replace(')', ' / 0.4)')} 50%, transparent 100%)`,
          }}
        />

        {/* Subtle radial halo da cor da categoria */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse 60% 70% at 12% 40%, ${catRaw.replace(')', ' / 0.05)')} 0%, transparent 65%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Editorial grid bg */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(var(--border-subtle) 1px, transparent 1px),
              linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            opacity: 0.35,
            maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%)',
            pointerEvents: 'none',
          }}
        />

        <div
          className="slug-hero-grid"
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            padding: '56px 48px 72px',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 460px)',
            gap: '80px',
            alignItems: 'start',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* ── Lado esquerdo: identidade do produto ── */}
          <div>
            {/* Category badge */}
            <div
              className="anim-fade-in-up"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '28px',
                padding: '7px 14px',
                backgroundColor: catBgSoft,
                border: `1px solid ${catLine}`,
                borderRadius: '999px',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: catColor,
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${catRaw.replace(')', ' / 0.5)')}`,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: catColor,
                }}
              >
                {catLabel}
              </span>
              {product.registrationMapa && (
                <>
                  <span
                    aria-hidden
                    style={{
                      width: '1px',
                      height: '10px',
                      backgroundColor: catLine,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    MAPA {product.registrationMapa}
                  </span>
                </>
              )}
            </div>

            <h1
              className="anim-fade-in-up delay-1"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.75rem, 6.5vw, 5.25rem)',
                fontWeight: 700,
                letterSpacing: '0.005em',
                textTransform: 'uppercase',
                lineHeight: 0.95,
                color: 'var(--text-primary)',
                marginBottom: '24px',
              }}
            >
              {product.name}
            </h1>

            <p
              className="anim-fade-in-up delay-2"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.125rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '36px',
                maxWidth: '560px',
                letterSpacing: '-0.005em',
              }}
            >
              {product.tagline}
            </p>

            {/* Application mode chips — apenas quando ha modos declarados */}
            <div
              className="anim-fade-in-up delay-3"
              style={{
                display: product.applicationModes.length > 0 ? 'flex' : 'none',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '40px',
              }}
            >
              {product.applicationModes.map((mode) => (
                <span
                  key={mode}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    color: catColor,
                    backgroundColor: catBgSoft,
                    border: `1px solid ${catLine}`,
                    padding: '6px 12px',
                    borderRadius: '6px',
                  }}
                >
                  {APP_MODE_LABELS[mode] ?? mode}
                </span>
              ))}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-soft)',
                  border: '1px solid var(--border-subtle)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                }}
              >
                {product.physicalState}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-soft)',
                  border: '1px solid var(--border-subtle)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                }}
              >
                {product.originCountry}
              </span>
            </div>

            {/* Full description com border-left de categoria */}
            <p
              className="anim-fade-in-up delay-4"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.78,
                maxWidth: '600px',
                borderLeft: `2px solid ${catLine}`,
                paddingLeft: '20px',
              }}
            >
              {product.description}
            </p>

            {/* Stat strip — origem, lote, MAPA */}
            <div
              className="anim-fade-in-up delay-4"
              style={{
                marginTop: '40px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '0',
                borderTop: '1px solid var(--border-subtle)',
                borderBottom: '1px solid var(--border-subtle)',
                maxWidth: '560px',
              }}
            >
              {[
                { label: 'Origem', value: product.originCountry },
                { label: 'Estado', value: product.physicalState },
                // Reg. MAPA: mostra apenas para produtos com registro real OU produtos
                // que NÃO sao complexo microbiologico (onde MAPA nao se aplica)
                ...(isMicrobialComplex
                  ? [{ label: 'Classe', value: 'Complexo microbiológico' }]
                  : [
                      {
                        label: 'Reg. MAPA',
                        value: product.registrationMapa ? '✓ Ativo' : 'N/A',
                      },
                    ]),
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    padding: '20px 4px 20px 0',
                  }}
                >
                  <p
                    className="mono"
                    style={{
                      fontSize: 'var(--label-xs)',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--text-tertiary)',
                      marginBottom: '6px',
                    }}
                  >
                    {s.label}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      letterSpacing: '-0.025em',
                      color: 'var(--argho-blue)',
                      lineHeight: 1.1,
                    }}
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Lado direito: ficha técnica como instrumento de precisão (light) ── */}
          <aside
            className="anim-fade-in-up delay-3"
            style={{
              position: 'sticky',
              top: '120px',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border-subtle)',
              borderTop: `3px solid ${catColor}`,
              borderRadius: '12px',
              overflow: 'hidden',
              fontVariantNumeric: 'tabular-nums',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {/* Panel header */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-mist)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  aria-hidden
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: catColor,
                    display: 'inline-block',
                    boxShadow: `0 0 0 3px ${catRaw.replace(')', ' / 0.18)')}`,
                  }}
                  className="anim-pulse-ring"
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.16em',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Ficha Técnica
                </span>
              </div>
              {product.registrationMapa && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--label-xs)',
                    color: 'var(--argho-blue)',
                    letterSpacing: '0.06em',
                    fontWeight: 700,
                    backgroundColor: 'var(--argho-blue-soft)',
                    padding: '4px 9px',
                    borderRadius: '4px',
                    border: '1px solid var(--cat-organo-line)',
                  }}
                >
                  ✓ MAPA
                </span>
              )}
            </div>

            {/* Metadata rows */}
            <div>
              {[
                { label: 'Tipo', value: product.productType },
                { label: 'Origem', value: product.originCountry },
                { label: 'Estado', value: product.physicalState },
                ...(product.concentrationUfc
                  ? [{ label: 'Concentração', value: product.concentrationUfc }]
                  : []),
                ...(product.registrationMapa
                  ? [{ label: 'Reg. MAPA', value: product.registrationMapa }]
                  : []),
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 24px',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      textAlign: 'right',
                      maxWidth: '220px',
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Composição microbiológica (modelo neutro: lista de espécies declaradas) ── */}
            {isMicrobialComplex && microbialStrains.length > 0 && (
              <div>
                <div
                  style={{
                    padding: '14px 24px 10px',
                    borderTop: '1px solid var(--border-subtle)',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-mist)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--label-xs)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.16em',
                      color: 'var(--argho-blue)',
                    }}
                  >
                    Composição microbiológica
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--label-xxs)',
                      color: 'var(--text-tertiary)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    espécie · cepa
                  </span>
                </div>
                <div style={{ padding: '12px 0 8px' }}>
                  {microbialStrains.map(({ species, strain }) => (
                    <div
                      key={`${species}-${strain}`}
                      style={{
                        padding: '10px 24px',
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '12px',
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          display: 'inline-block',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: catColor,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.9375rem',
                          color: 'var(--text-primary)',
                          letterSpacing: '-0.005em',
                        }}
                      >
                        {speciesSegments(species).map((seg, idx) => (
                          <span
                            // biome-ignore lint/suspicious/noArrayIndexKey: segmento derivado da string, sem id proprio
                            key={`${species}-${idx}`}
                            style={{ fontStyle: seg.italic ? 'italic' : 'normal' }}
                          >
                            {idx > 0 ? ' ' : ''}
                            {seg.text}
                          </span>
                        ))}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--text-tertiary)',
                          letterSpacing: '0.04em',
                          marginLeft: 'auto',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {strain}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Diferenciais técnicos (apenas para complexo microbiológico) ── */}
            {isMicrobialComplex && product.technicalDifferentials && (
              <div>
                <div
                  style={{
                    padding: '14px 24px 10px',
                    borderTop: '1px solid var(--border-subtle)',
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-mist)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--label-xs)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.16em',
                      color: 'var(--argho-blue)',
                    }}
                  >
                    Diferenciais técnicos
                  </span>
                </div>
                <div style={{ padding: '12px 24px 16px' }}>
                  {product.technicalDifferentials.map((diff) => (
                    <div
                      key={diff}
                      style={{
                        padding: '6px 0',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '10px',
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          color: catColor,
                          fontWeight: 700,
                          flexShrink: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        ·
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                          letterSpacing: '-0.005em',
                          lineHeight: 1.5,
                        }}
                      >
                        {diff}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Composition bar gauges (apenas para produtos quantificados — minerais/organominerais) ── */}
            {compRows.length > 0 && (
              <div>
                <div
                  style={{
                    padding: '14px 24px 10px',
                    borderTop: '1px solid var(--border-subtle)',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-mist)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--label-xs)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.16em',
                      color: 'var(--argho-blue)',
                    }}
                  >
                    Composição Garantida
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--label-xxs)',
                      color: 'var(--text-tertiary)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    g/100g ou g/100mL
                  </span>
                </div>

                <div style={{ padding: '8px 0 12px' }}>
                  {compRows.map(({ label, value, numValue, maxScale, type }) => {
                    const fillPct = maxScale > 0 ? Math.min((numValue / maxScale) * 100, 100) : 0;
                    const barColor =
                      type === 'macro' ? catColor : type === 'micro' ? 'var(--gold)' : catColor;
                    const barTrack =
                      type === 'macro'
                        ? catBgSoft
                        : type === 'micro'
                          ? 'var(--gold-soft)'
                          : 'var(--bg-soft)';
                    return (
                      <div key={label} style={{ padding: '8px 24px 6px' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            marginBottom: '6px',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.8125rem',
                              color: 'var(--text-primary)',
                              fontWeight: type === 'macro' ? 700 : 500,
                              letterSpacing: '0.02em',
                            }}
                          >
                            {label}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.875rem',
                              fontWeight: 700,
                              color: barColor,
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {value}
                          </span>
                        </div>
                        <div
                          style={{
                            height: '4px',
                            backgroundColor: barTrack,
                            borderRadius: '2px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${fillPct}%`,
                              backgroundColor: barColor,
                              borderRadius: '2px',
                              opacity: type === 'micro' ? 0.85 : 1,
                              transition: 'width 0.6s var(--ease-out-expo)',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Packaging ── */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--label-xs)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  color: 'var(--argho-blue)',
                  marginBottom: '12px',
                }}
              >
                Embalagens
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {product.packaging.map((pkg) => {
                  const desc = pkg.weightKg ? `${pkg.weightKg} kg` : `${pkg.volumeL} L`;
                  return (
                    <span
                      key={pkg.sku}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--bg-soft)',
                        border: '1px solid var(--border-subtle)',
                        padding: '5px 10px',
                        borderRadius: '4px',
                      }}
                    >
                      {desc}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Panel footer — legal note */}
            <div
              style={{
                padding: '12px 24px',
                borderTop: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-mist)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-tertiary)',
                  lineHeight: 1.55,
                }}
              >
                {isMicrobialComplex
                  ? 'Composição microbiológica declarada conforme padrão Argho de formulação e controle de qualidade.'
                  : 'Composição conforme Certificado de Análise MAPA.'}
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SHOWCASE — mockup dramático centralizado (apenas se tiver mockup)
      ══════════════════════════════════════════════════════════════════════ */}
      {premiumSrc && (
        <section
          style={{
            position: 'relative',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-soft)',
            overflow: 'hidden',
          }}
        >

          <div
            className="slug-showcase-grid"
            style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: '1320px',
              margin: '0 auto',
              padding: '88px 48px',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              gap: '64px',
              alignItems: 'center',
            }}
          >
            {/* Arte premium do produto (rotulo real fiel + swirl categorico) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '560px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '540px',
                  aspectRatio: '1 / 1',
                  borderRadius: '16px',
                  border: '1px solid var(--border-subtle)',
                  borderTop: `3px solid ${catColor}`,
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <Image
                  src={premiumSrc}
                  alt={`Embalagem de ${product.name} — ${CATEGORIES[product.category].label} Argho Agrosciences`}
                  width={1440}
                  height={1440}
                  quality={85}
                  sizes="(max-width: 968px) 100vw, 540px"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            </div>

            {/* Copy ao lado */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: '24px',
                    height: '1px',
                    background: catColor,
                  }}
                />
                <span
                  className="mono"
                  style={{
                    fontSize: '0.6875rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: catColor,
                    fontWeight: 700,
                  }}
                >
                  Embalagem oficial · {product.physicalState}
                </span>
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                  fontWeight: 700,
                  lineHeight: 0.95,
                  marginBottom: '24px',
                }}
              >
                <span
                  style={{
                    color: 'var(--text-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.01em',
                    display: 'inline-block',
                  }}
                >
                  {product.name}.
                </span>
                <br />
                <span
                  style={{
                    color: catColor,
                    letterSpacing: '-0.05em',
                  }}
                >
                  {isMicrobialComplex ? 'Composição declarada.' : 'Pronto para o campo.'}
                </span>
              </h2>

              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '1.0625rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  marginBottom: '32px',
                  maxWidth: '480px',
                }}
              >
                {product.tagline}
              </p>

              {/* Embalagens disponíveis */}
              <div>
                <p
                  className="mono"
                  style={{
                    fontSize: 'var(--label-xs)',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--text-tertiary)',
                    fontWeight: 700,
                    marginBottom: '12px',
                  }}
                >
                  Disponível em
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {product.packaging.map((pkg) => {
                    const desc = pkg.weightKg ? `${pkg.weightKg} kg` : `${pkg.volumeL} L`;
                    return (
                      <span
                        key={pkg.sku}
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.125rem',
                          fontWeight: 700,
                          letterSpacing: '-0.025em',
                          color: 'var(--text-primary)',
                          backgroundColor: 'var(--bg)',
                          border: `1px solid ${catLine}`,
                          borderTop: `2px solid ${catColor}`,
                          padding: '12px 20px',
                          borderRadius: '6px',
                          minWidth: '72px',
                          textAlign: 'center',
                        }}
                      >
                        {desc}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          RELATED PRODUCTS — outros da mesma categoria
      ══════════════════════════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section style={{ maxWidth: '1320px', margin: '0 auto', padding: '80px 48px' }}>
          <div style={{ marginBottom: '40px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: '24px',
                  height: '1px',
                  background: 'var(--argho-green)',
                }}
              />
              <span
                className="mono"
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  color: 'var(--argho-blue)',
                }}
              >
                Outros em {catLabel}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: 'var(--bg)',
            }}
          >
            {related.map((p, i) => (
              <Link
                key={p.slug}
                href={`/produtos/${p.slug}`}
                style={{ textDecoration: 'none', display: 'block' }}
                className="related-row"
              >
                <article
                  className="slug-related-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 220px) minmax(0, 1fr) auto',
                    gap: '32px',
                    alignItems: 'center',
                    padding: '20px 24px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                    borderLeft: `3px solid ${catColor}`,
                    transition: 'background-color 0.18s ease',
                    backgroundColor: 'var(--bg)',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      color: 'var(--text-primary)',
                      lineHeight: 1.05,
                    }}
                  >
                    {p.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.9375rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    {p.tagline}
                  </p>
                  <span
                    aria-hidden
                    style={{
                      color: catColor,
                      fontSize: '1.125rem',
                      opacity: 0.7,
                    }}
                    className="related-arrow"
                  >
                    →
                  </span>
                </article>
              </Link>
            ))}
          </div>

          {/* Back to portfolio */}
          <div style={{ marginTop: '48px' }}>
            <Link
              href="/produtos"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                borderBottom: '1px solid var(--text-primary)',
                paddingBottom: '4px',
                letterSpacing: '-0.005em',
              }}
            >
              <span aria-hidden style={{ fontSize: '1.1em', lineHeight: 1 }}>
                ←
              </span>
              Voltar ao portfólio completo
            </Link>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          NOTA LEGAL — fora do bloco de relacionados de proposito: aquele so
          renderiza quando ha outros produtos da mesma categoria, e a nota
          precisa aparecer em TODA pagina de produto.
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '40px 24px 64px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px 24px',
            backgroundColor: 'var(--bg-soft)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          <span
            aria-hidden
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875rem',
              color: 'var(--argho-blue)',
              flexShrink: 0,
              fontWeight: 700,
              marginTop: '1px',
            }}
          >
            §
          </span>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {notaLegal}
          </p>
        </div>
      </section>

      <style>{`
        .related-row:hover article {
          background-color: var(--bg-warm) !important;
        }
        .related-row:hover .related-arrow {
          transform: translateX(4px);
          opacity: 1 !important;
        }
        @media (max-width: 968px) {
          .slug-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
          .slug-showcase-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
        @media (max-width: 768px) {
          .slug-related-grid {
            grid-template-columns: 1fr auto !important;
            gap: 8px 16px !important;
          }
          .slug-related-grid > p { grid-column: 1 / -1; }
        }
      `}</style>
    </main>
  );
}
