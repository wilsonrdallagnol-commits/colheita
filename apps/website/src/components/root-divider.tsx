// apps/website/src/components/root-divider.tsx
//
// Divisor decorativo com motivo de raízes/veias — eco do coração digital
// Argho propagando pelo site (ecossistema visual).
//
// Server component (SVG estático). Animação opcional via classes utilitárias
// já definidas em globals.css (anim-fade-in-up).

interface RootDividerProps {
  /** Cor primária da raíz. Default = teal (--teal). */
  accent?: string;
  /** Variante da forma do nó central. */
  variant?: 'split' | 'single' | 'fan';
  /** Espessura visual (1 = sutil, 2 = médio, 3 = mais marcado). */
  weight?: 1 | 2 | 3;
}

export function RootDivider({
  accent = 'oklch(0.362 0.160 266.7)',
  variant = 'split',
  weight = 1,
}: RootDividerProps) {
  const stroke = weight * 0.7;
  const opacity = weight === 1 ? 0.55 : weight === 2 ? 0.7 : 0.85;

  return (
    <div
      aria-hidden
      style={{
        position: 'relative',
        height: '120px',
        margin: '0 auto',
        maxWidth: '1320px',
        padding: '0 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        role="presentation"
        viewBox="0 0 800 100"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%', opacity }}
      >
        <title>Decoração de raízes</title>
        <defs>
          <linearGradient id={`fade-${variant}-${weight}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={accent} stopOpacity="0" />
            <stop offset="50%" stopColor={accent} stopOpacity="1" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Linha base horizontal (sutil) */}
        <line
          x1="40"
          y1="50"
          x2="760"
          y2="50"
          stroke={`url(#fade-${variant}-${weight})`}
          strokeWidth={stroke * 0.6}
          strokeDasharray="2 4"
        />

        {variant === 'split' && (
          <g>
            {/* Nó central */}
            <circle cx="400" cy="50" r="3" fill={accent} />
            <circle
              cx="400"
              cy="50"
              r="8"
              fill="none"
              stroke={accent}
              strokeWidth={stroke * 0.4}
              strokeOpacity="0.5"
            />

            {/* Ramos esquerdos descendendo */}
            <path
              d="M 400 50 Q 360 60 320 75 T 240 90"
              fill="none"
              stroke={accent}
              strokeWidth={stroke}
              strokeLinecap="round"
            />
            <path
              d="M 400 50 Q 380 65 350 80"
              fill="none"
              stroke={accent}
              strokeWidth={stroke * 0.7}
              strokeLinecap="round"
              opacity="0.7"
            />

            {/* Ramos direitos descendendo */}
            <path
              d="M 400 50 Q 440 60 480 75 T 560 90"
              fill="none"
              stroke={accent}
              strokeWidth={stroke}
              strokeLinecap="round"
            />
            <path
              d="M 400 50 Q 420 65 450 80"
              fill="none"
              stroke={accent}
              strokeWidth={stroke * 0.7}
              strokeLinecap="round"
              opacity="0.7"
            />

            {/* Pontos terminais (folhas) */}
            <circle cx="240" cy="90" r="2" fill={accent} />
            <circle cx="560" cy="90" r="2" fill={accent} />
            <circle cx="350" cy="80" r="1.5" fill={accent} opacity="0.7" />
            <circle cx="450" cy="80" r="1.5" fill={accent} opacity="0.7" />

            {/* Ramos pra cima (eco do coração) */}
            <path
              d="M 400 50 Q 380 35 360 22"
              fill="none"
              stroke={accent}
              strokeWidth={stroke * 0.6}
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M 400 50 Q 420 35 440 22"
              fill="none"
              stroke={accent}
              strokeWidth={stroke * 0.6}
              strokeLinecap="round"
              opacity="0.5"
            />
            <circle cx="360" cy="22" r="1.5" fill={accent} opacity="0.5" />
            <circle cx="440" cy="22" r="1.5" fill={accent} opacity="0.5" />
          </g>
        )}

        {variant === 'single' && (
          <g>
            <circle cx="400" cy="50" r="3" fill={accent} />
            <path
              d="M 400 50 Q 400 70 400 92"
              fill="none"
              stroke={accent}
              strokeWidth={stroke}
              strokeLinecap="round"
            />
            <path
              d="M 400 70 Q 380 78 365 88"
              fill="none"
              stroke={accent}
              strokeWidth={stroke * 0.65}
              strokeLinecap="round"
              opacity="0.7"
            />
            <path
              d="M 400 70 Q 420 78 435 88"
              fill="none"
              stroke={accent}
              strokeWidth={stroke * 0.65}
              strokeLinecap="round"
              opacity="0.7"
            />
            <circle cx="400" cy="92" r="2" fill={accent} />
            <circle cx="365" cy="88" r="1.5" fill={accent} opacity="0.7" />
            <circle cx="435" cy="88" r="1.5" fill={accent} opacity="0.7" />
          </g>
        )}

        {variant === 'fan' && (
          <g>
            <circle cx="400" cy="50" r="3" fill={accent} />
            {[-60, -30, 0, 30, 60].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const x2 = 400 + Math.sin(rad) * 50;
              const y2 = 50 + Math.cos(rad) * 50;
              return (
                <g key={deg}>
                  <line
                    x1="400"
                    y1="50"
                    x2={x2}
                    y2={y2}
                    stroke={accent}
                    strokeWidth={stroke * 0.7}
                    strokeLinecap="round"
                    opacity={Math.abs(deg) < 30 ? 0.85 : 0.55}
                  />
                  <circle
                    cx={x2}
                    cy={y2}
                    r="1.5"
                    fill={accent}
                    opacity={Math.abs(deg) < 30 ? 0.85 : 0.55}
                  />
                </g>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
}
