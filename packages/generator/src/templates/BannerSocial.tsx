// packages/generator/src/templates/BannerSocial.tsx
// Banner social Argho — formato OG/LinkedIn 1200x630px (retina = 2400x1260).
//
// Layout editorial fixo, paleta Argho consistente com FichaTecnica/Catalogo.
// Pensado pra:
//   - LinkedIn: posts orgânicos + sponsored content
//   - Instagram: link sticker em stories
//   - WhatsApp: preview link
//   - Open Graph: <meta property="og:image">
//
// Estrutura:
//   - Eyebrow (categoria) topo-esquerda
//   - Hero do produto em CAPS (peso 700) — preenche metade esquerda
//   - Tagline em peso menor logo abaixo
//   - Stripe verde lateral direito com NPK label gigante (se houver)
//   - Footer fixo com tenant + lockup MAPA
//
// Sem dependência externa de imagem — tudo CSS puro pra Playwright render
// rápido e estável (sem race condition de imagem ainda carregando).

import type { CSSProperties } from 'react';
import type { BannerSocialData } from '../types.js';

const GREEN = '#166534';
const GREEN_LIGHT = '#bbf7d0';
const GREEN_LIGHT_BG = '#f0fdf4';
const TEXT_PRIMARY = '#0f1117';
const TEXT_SECONDARY = '#374151';
const TEXT_TERTIARY = '#6b7280';

const s: Record<string, CSSProperties> = {
  body: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    background: '#ffffff',
    margin: 0,
    padding: 0,
    width: '1200px',
    height: '630px',
    overflow: 'hidden',
  },
  frame: {
    width: '1200px',
    height: '630px',
    display: 'grid',
    // 60/40 — copy à esquerda, accent visual à direita
    gridTemplateColumns: '720px 480px',
    boxSizing: 'border-box',
    position: 'relative',
    background: '#ffffff',
  },

  // ── Coluna esquerda — copy ─────────────────────────────────────────────────
  left: {
    padding: '64px 56px 56px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
  },
  eyebrow: {
    fontSize: '13px',
    fontWeight: 700,
    color: GREEN,
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    marginBottom: '24px',
  },
  productName: {
    fontSize: '76px',
    fontWeight: 700,
    color: TEXT_PRIMARY,
    letterSpacing: '-0.04em',
    lineHeight: 0.95,
    textTransform: 'uppercase',
    marginBottom: '20px',
  },
  tagline: {
    fontSize: '22px',
    fontWeight: 400,
    color: TEXT_SECONDARY,
    lineHeight: 1.35,
    maxWidth: '600px',
  },

  // ── Footer — tenant + MAPA badge ───────────────────────────────────────────
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    paddingTop: '24px',
    borderTop: `2px solid ${GREEN}`,
  },
  tenantLockup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  tenantName: {
    fontSize: '20px',
    fontWeight: 700,
    color: GREEN,
    letterSpacing: '-0.01em',
  },
  tenantHost: {
    fontSize: '12px',
    color: TEXT_TERTIARY,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  mapaBadge: {
    padding: '6px 12px',
    background: GREEN_LIGHT_BG,
    border: `1px solid ${GREEN_LIGHT}`,
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: GREEN,
    letterSpacing: '0.04em',
  },

  // ── Coluna direita — accent visual ─────────────────────────────────────────
  right: {
    background: `linear-gradient(135deg, ${GREEN} 0%, #14532d 100%)`,
    color: '#ffffff',
    padding: '64px 48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  rightDecor: {
    // "Folha" decorativa em SVG inline — abstrato, evita stock
    position: 'absolute',
    top: '-80px',
    right: '-80px',
    width: '420px',
    height: '420px',
    opacity: 0.08,
  },
  rightEyebrow: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#ffffff',
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    marginBottom: '16px',
  },
  npkBig: {
    fontSize: '120px',
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: '-0.05em',
    lineHeight: 0.95,
    fontVariantNumeric: 'tabular-nums',
  },
  npkLabel: {
    fontSize: '15px',
    color: '#ffffff',
    opacity: 0.8,
    fontWeight: 500,
    marginTop: '12px',
    letterSpacing: '0.05em',
  },
  rightFooter: {
    fontSize: '13px',
    color: '#ffffff',
    opacity: 0.7,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },

  // ── Sem NPK: layout right side mostra só o tenant em destaque ──────────────
  rightFallback: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: '100%',
  },
  fallbackBig: {
    fontSize: '64px',
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: '-0.03em',
    lineHeight: 1.0,
  },
  fallbackSub: {
    fontSize: '16px',
    color: '#ffffff',
    opacity: 0.8,
    marginTop: '16px',
    letterSpacing: '0.04em',
  },
};

function tenantHostFromName(tenantName: string): string {
  // "Argho AgriSciences" → "arghoagrosciences.com" — heurística simples pra
  // mostrar o domínio no lockup. Domain real customizável quando passarmos
  // primary_domain do tenant pelo template (futuro).
  return `${tenantName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
}

export function BannerSocial({ data }: { data: BannerSocialData }) {
  const hasNpk = Boolean(data.npkLabel);

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <title>{`${data.productName} · ${data.tenantName}`}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          html, body { width: 1200px; height: 630px; }
        `}</style>
      </head>
      <body style={s.body}>
        <div style={s.frame}>
          {/* ─────────── Esquerda — copy ─────────── */}
          <div style={s.left}>
            <div>
              {data.categoryName && <p style={s.eyebrow}>{data.categoryName}</p>}
              <h1 style={s.productName}>{data.productName}</h1>
              {data.tagline && <p style={s.tagline}>{data.tagline}</p>}
            </div>

            <div style={s.footer}>
              <div style={s.tenantLockup}>
                <span style={s.tenantName}>{data.tenantName}</span>
                <span style={s.tenantHost}>{tenantHostFromName(data.tenantName)}</span>
              </div>
              {data.mapaRegistration && (
                <span style={s.mapaBadge}>MAPA {data.mapaRegistration}</span>
              )}
            </div>
          </div>

          {/* ─────────── Direita — accent ─────────── */}
          <div style={s.right}>
            {/* Decorativo de fundo — SVG abstrato em opacidade baixa */}
            <svg style={s.rightDecor} viewBox="0 0 200 200" fill="none" aria-hidden="true">
              <title>decorative</title>
              <circle cx="100" cy="100" r="98" stroke="#ffffff" strokeWidth="2" />
              <circle cx="100" cy="100" r="70" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="42" stroke="#ffffff" strokeWidth="1" />
            </svg>

            {hasNpk ? (
              <>
                <div>
                  <p style={s.rightEyebrow}>Composição garantida</p>
                  <p style={s.npkBig}>{data.npkLabel}</p>
                  <p style={s.npkLabel}>N — P₂O₅ — K₂O</p>
                </div>
                <p style={s.rightFooter}>Argho · Safra {new Date().getFullYear()}</p>
              </>
            ) : (
              <div style={s.rightFallback}>
                <span style={s.fallbackBig}>
                  Tecnologia
                  <br />
                  Argho
                </span>
                <span style={s.fallbackSub}>Para nutrir e proteger sua lavoura.</span>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
