// apps/website/src/app/opengraph-image.tsx
// OG image dinâmica — Argho Agrosciences (white-first + blue/green)
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Argho Agrosciences — Nutrição de precisão para o agro brasileiro';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const ARGHO_BLUE = '#183090';
const ARGHO_GREEN = '#489030';
const TEXT_PRIMARY = '#0a0e0c';
const TEXT_SECONDARY = '#5a6a5a';
const SURFACE = '#fafbfa';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: SURFACE,
        padding: '64px 72px',
        position: 'relative',
      }}
    >
      {/* Faixa decorativa superior — eco do scan-line tricolor */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          display: 'flex',
        }}
      >
        <div style={{ flex: 1, background: ARGHO_BLUE }} />
        <div style={{ flex: 1, background: ARGHO_GREEN }} />
        <div style={{ flex: 1, background: TEXT_PRIMARY }} />
      </div>

      {/* Grid técnico sutil */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(10,14,12,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(10,14,12,0.04) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          opacity: 0.6,
        }}
      />

      {/* Topo: marca */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', zIndex: 1 }}>
        <span
          style={{
            fontFamily: 'system-ui',
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            color: ARGHO_BLUE,
            textTransform: 'uppercase',
          }}
        >
          Argho Agrosciences
        </span>
      </div>

      {/* Centro: headline split blue/green */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', zIndex: 1 }}>
        <div
          style={{
            fontFamily: 'system-ui',
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: TEXT_SECONDARY,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ width: '32px', height: '2px', background: ARGHO_GREEN }} />
          Origem europeia · Registro MAPA · Ciência aplicada
        </div>
        <div
          style={{
            fontFamily: 'system-ui',
            fontSize: '88px',
            fontWeight: 700,
            letterSpacing: '-0.045em',
            lineHeight: 0.95,
            color: ARGHO_BLUE,
          }}
        >
          Nutrição de
        </div>
        <div
          style={{
            fontFamily: 'system-ui',
            fontSize: '88px',
            fontWeight: 700,
            letterSpacing: '-0.045em',
            lineHeight: 0.95,
            color: ARGHO_GREEN,
          }}
        >
          precisão.
        </div>
      </div>

      {/* Rodapé: stats */}
      <div
        style={{
          display: 'flex',
          gap: '56px',
          alignItems: 'flex-end',
          zIndex: 1,
        }}
      >
        {[
          { value: '18', label: 'Produtos' },
          { value: '4', label: 'Linhas' },
          { value: 'MAPA', label: 'Registros' },
          { value: 'ES', label: 'Origem europeia' },
        ].map(({ value, label }) => (
          <div
            key={label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              borderLeft: `2px solid ${ARGHO_BLUE}`,
              paddingLeft: '14px',
            }}
          >
            <span
              style={{
                fontFamily: 'system-ui',
                fontSize: '32px',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                color: TEXT_PRIMARY,
                lineHeight: 1,
              }}
            >
              {value}
            </span>
            <span
              style={{
                fontFamily: 'system-ui',
                fontSize: '12px',
                fontWeight: 500,
                color: TEXT_SECONDARY,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}
