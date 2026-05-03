// apps/website/src/app/opengraph-image.tsx
// Dynamic OG image for Argho Agrosciences homepage
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Argho Agrosciences — Nutrição de precisão para o agro brasileiro';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#0b1510',
        padding: '64px 72px',
        position: 'relative',
      }}
    >
      {/* Background gradient orbs */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(ellipse 60% 55% at 10% 15%, rgba(60,120,60,0.20) 0%, transparent 60%), radial-gradient(ellipse 45% 40% at 90% 85%, rgba(40,110,130,0.15) 0%, transparent 55%)',
        }}
      />

      {/* Top: Logo text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
        <span
          style={{
            fontFamily: 'system-ui',
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#e8f2e8',
          }}
        >
          ARGHO AGROSCIENCES
        </span>
      </div>

      {/* Center: Headline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            fontFamily: 'system-ui',
            fontSize: '14px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#c4a84a',
          }}
        >
          Origem europeia · Registro MAPA · Ciência aplicada ao campo
        </div>
        <div
          style={{
            fontFamily: 'system-ui',
            fontSize: '72px',
            fontWeight: 700,
            letterSpacing: '-0.045em',
            lineHeight: 1.0,
            color: '#f0f7f0',
          }}
        >
          Nutrição de
        </div>
        <div
          style={{
            fontFamily: 'system-ui',
            fontSize: '72px',
            fontWeight: 700,
            letterSpacing: '-0.045em',
            lineHeight: 1.0,
            color: '#5aad5a',
          }}
        >
          precisão.
        </div>
      </div>

      {/* Bottom: Stats */}
      <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
        {[
          { value: '18', label: 'Produtos' },
          { value: '4', label: 'Linhas' },
          { value: 'MAPA', label: 'Registros' },
          { value: 'ES', label: 'Origem Européia' },
        ].map(({ value, label }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span
              style={{
                fontFamily: 'system-ui',
                fontSize: '28px',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                color: '#c4a84a',
              }}
            >
              {value}
            </span>
            <span
              style={{
                fontFamily: 'system-ui',
                fontSize: '13px',
                color: '#5a7a5a',
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
