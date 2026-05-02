// apps/website/src/components/product-visuals.tsx
// Inline SVG illustration components — zero external image dependencies.
// All coordinates pre-calculated; no runtime math.

// ─── Stron NPK Chart ─────────────────────────────────────────────────────────
// Horizontal bar chart: N 4.5%, P₂O₅ 2.0%, K₂O 7.2%
// viewBox 360×170, chart area x=80..355, scale 275px = 10%

export function StronNpkChart() {
  return (
    <svg
      viewBox="0 0 360 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      {/* Panel background */}
      <rect width="360" height="170" fill="oklch(0.08 0.018 148)" />

      {/* Grid lines (dashed) at 25%, 50%, 75% — solid at 100% */}
      <line
        x1="149"
        y1="10"
        x2="149"
        y2="152"
        stroke="oklch(0.20 0.022 148)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <line
        x1="218"
        y1="10"
        x2="218"
        y2="152"
        stroke="oklch(0.20 0.022 148)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <line
        x1="286"
        y1="10"
        x2="286"
        y2="152"
        stroke="oklch(0.20 0.022 148)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <line x1="355" y1="10" x2="355" y2="152" stroke="oklch(0.20 0.022 148)" strokeWidth="1" />

      {/* Origin vertical rule */}
      <line x1="80" y1="10" x2="80" y2="152" stroke="oklch(0.24 0.024 148)" strokeWidth="1" />

      {/* ── N bar (4.5% → width=124px) ── */}
      <text
        x="72"
        y="38"
        textAnchor="end"
        fill="oklch(0.72 0.025 148)"
        fontSize="12"
        fontFamily="monospace"
        fontWeight="600"
      >
        N
      </text>
      {/* track */}
      <rect x="80" y="24" width="275" height="24" fill="oklch(0.11 0.020 148)" rx="3" />
      {/* fill */}
      <rect x="80" y="24" width="124" height="24" fill="oklch(0.58 0.165 148)" rx="3" />
      {/* end cap dot */}
      <circle cx="204" cy="36" r="4" fill="oklch(0.73 0.135 78)" />
      {/* value */}
      <text
        x="212"
        y="41"
        fill="oklch(0.73 0.135 78)"
        fontSize="10"
        fontFamily="monospace"
        fontWeight="600"
      >
        4,5%
      </text>

      {/* ── P₂O₅ bar (2.0% → width=55px) ── */}
      <text
        x="72"
        y="86"
        textAnchor="end"
        fill="oklch(0.72 0.025 148)"
        fontSize="10"
        fontFamily="monospace"
        fontWeight="600"
      >
        P₂O₅
      </text>
      <rect x="80" y="72" width="275" height="24" fill="oklch(0.11 0.020 148)" rx="3" />
      <rect x="80" y="72" width="55" height="24" fill="oklch(0.64 0.13 195)" rx="3" />
      <circle cx="135" cy="84" r="4" fill="oklch(0.73 0.135 78)" />
      <text
        x="143"
        y="89"
        fill="oklch(0.73 0.135 78)"
        fontSize="10"
        fontFamily="monospace"
        fontWeight="600"
      >
        2,0%
      </text>

      {/* ── K₂O bar (7.2% → width=198px) ── */}
      <text
        x="72"
        y="134"
        textAnchor="end"
        fill="oklch(0.72 0.025 148)"
        fontSize="10"
        fontFamily="monospace"
        fontWeight="600"
      >
        K₂O
      </text>
      <rect x="80" y="120" width="275" height="24" fill="oklch(0.11 0.020 148)" rx="3" />
      <rect x="80" y="120" width="198" height="24" fill="oklch(0.66 0.150 150)" rx="3" />
      <circle cx="278" cy="132" r="4" fill="oklch(0.73 0.135 78)" />
      <text
        x="286"
        y="137"
        fill="oklch(0.73 0.135 78)"
        fontSize="10"
        fontFamily="monospace"
        fontWeight="600"
      >
        7,2%
      </text>

      {/* Scale labels */}
      <text
        x="80"
        y="164"
        textAnchor="middle"
        fill="oklch(0.38 0.012 148)"
        fontSize="9"
        fontFamily="monospace"
      >
        0
      </text>
      <text
        x="149"
        y="164"
        textAnchor="middle"
        fill="oklch(0.38 0.012 148)"
        fontSize="9"
        fontFamily="monospace"
      >
        2,5
      </text>
      <text
        x="218"
        y="164"
        textAnchor="middle"
        fill="oklch(0.38 0.012 148)"
        fontSize="9"
        fontFamily="monospace"
      >
        5,0
      </text>
      <text
        x="286"
        y="164"
        textAnchor="middle"
        fill="oklch(0.38 0.012 148)"
        fontSize="9"
        fontFamily="monospace"
      >
        7,5
      </text>
      <text
        x="355"
        y="164"
        textAnchor="middle"
        fill="oklch(0.38 0.012 148)"
        fontSize="9"
        fontFamily="monospace"
      >
        10%
      </text>

      {/* Header label */}
      <text
        x="352"
        y="14"
        textAnchor="end"
        fill="oklch(0.45 0.015 148)"
        fontSize="9"
        fontFamily="monospace"
        letterSpacing="0.06em"
      >
        NPK FOLIAR
      </text>

      {/* Amino indicator (presence badge) */}
      <rect x="80" y="10" width="52" height="14" fill="oklch(0.16 0.040 78)" rx="3" />
      <text
        x="106"
        y="21"
        textAnchor="middle"
        fill="oklch(0.73 0.135 78)"
        fontSize="8"
        fontFamily="monospace"
      >
        AMINO
      </text>
    </svg>
  );
}

// ─── Impuch Soil Visualization ───────────────────────────────────────────────
// Soil cross-section: 5 horizon bands + golden humic threads
// viewBox 360×170

export function ImpuchSoilViz() {
  return (
    <svg
      viewBox="0 0 360 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      {/* ── Soil horizon bands ── */}
      {/* O: surface / root zone */}
      <rect x="0" y="0" width="360" height="28" fill="oklch(0.09 0.020 148)" />
      {/* A: humic-rich upper (dark gold-brown) */}
      <rect x="0" y="28" width="360" height="46" fill="oklch(0.13 0.028 75)" />
      {/* B: organic rich / M.O. high */}
      <rect x="0" y="74" width="360" height="52" fill="oklch(0.16 0.040 74)" />
      {/* B2: mineral transition */}
      <rect x="0" y="126" width="360" height="28" fill="oklch(0.10 0.018 148)" />
      {/* C: bedrock */}
      <rect x="0" y="154" width="360" height="16" fill="oklch(0.08 0.012 148)" />

      {/* Horizon dividers (subtle) */}
      <line x1="0" y1="28" x2="260" y2="28" stroke="oklch(0.22 0.025 148 / 0.5)" strokeWidth="1" />
      <line x1="0" y1="74" x2="260" y2="74" stroke="oklch(0.22 0.025 148 / 0.5)" strokeWidth="1" />
      <line
        x1="0"
        y1="126"
        x2="260"
        y2="126"
        stroke="oklch(0.22 0.025 148 / 0.5)"
        strokeWidth="1"
      />
      <line
        x1="0"
        y1="154"
        x2="260"
        y2="154"
        stroke="oklch(0.22 0.025 148 / 0.5)"
        strokeWidth="1"
      />

      {/* ── Golden humic threads (bezier waves) ── */}
      {/* Thread 1 — in A horizon */}
      <path
        d="M 0,42 C 45,36 90,48 135,42 C 180,36 225,48 270,42"
        stroke="oklch(0.73 0.135 78 / 0.45)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Thread 2 — in A horizon, lower */}
      <path
        d="M 0,58 C 50,52 100,64 150,58 C 200,52 250,64 270,58"
        stroke="oklch(0.73 0.135 78 / 0.30)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Thread 3 — in B horizon */}
      <path
        d="M 0,88 C 40,82 80,94 120,88 C 160,82 200,94 240,88 C 255,85 265,88 270,88"
        stroke="oklch(0.73 0.135 78 / 0.50)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Thread 4 — in B horizon, middle */}
      <path
        d="M 0,106 C 55,100 110,112 165,106 C 220,100 260,112 270,108"
        stroke="oklch(0.73 0.135 78 / 0.35)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Thread 5 — in B horizon, lower */}
      <path
        d="M 0,122 C 45,116 90,128 135,122 C 180,116 225,126 260,122"
        stroke="oklch(0.73 0.135 78 / 0.25)"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* ── Annotation panel (right side) ── */}
      <rect x="270" y="0" width="90" height="170" fill="oklch(0.08 0.016 148 / 0.85)" />
      <line x1="270" y1="0" x2="270" y2="170" stroke="oklch(0.24 0.024 148)" strokeWidth="1" />

      {/* Húm. annotation → A horizon (center ~51) */}
      <line x1="270" y1="51" x2="282" y2="51" stroke="oklch(0.73 0.135 78 / 0.6)" strokeWidth="1" />
      <circle cx="270" cy="51" r="2.5" fill="oklch(0.73 0.135 78)" />
      <text
        x="287"
        y="47"
        fill="oklch(0.73 0.135 78)"
        fontSize="8"
        fontFamily="monospace"
        fontWeight="600"
      >
        Húm.
      </text>
      <text
        x="287"
        y="57"
        fill="oklch(0.73 0.135 78)"
        fontSize="9"
        fontFamily="monospace"
        fontWeight="700"
      >
        2,0%
      </text>

      {/* M.O. annotation → B horizon (center ~100) */}
      <line
        x1="270"
        y1="100"
        x2="282"
        y2="100"
        stroke="oklch(0.73 0.135 78 / 0.6)"
        strokeWidth="1"
      />
      <circle cx="270" cy="100" r="2.5" fill="oklch(0.73 0.135 78)" />
      <text
        x="287"
        y="96"
        fill="oklch(0.73 0.135 78)"
        fontSize="8"
        fontFamily="monospace"
        fontWeight="600"
      >
        M.O.
      </text>
      <text
        x="287"
        y="106"
        fill="oklch(0.73 0.135 78)"
        fontSize="9"
        fontFamily="monospace"
        fontWeight="700"
      >
        8,0%
      </text>

      {/* K₂O annotation → B horizon */}
      <text
        x="287"
        y="117"
        fill="oklch(0.64 0.13 195)"
        fontSize="8"
        fontFamily="monospace"
        fontWeight="600"
      >
        K₂O 2,5%
      </text>

      {/* Header label */}
      <text
        x="287"
        y="14"
        fill="oklch(0.45 0.015 148)"
        fontSize="8"
        fontFamily="monospace"
        letterSpacing="0.05em"
      >
        ORGANO
      </text>
      <text
        x="287"
        y="24"
        fill="oklch(0.45 0.015 148)"
        fontSize="8"
        fontFamily="monospace"
        letterSpacing="0.05em"
      >
        MINERAL
      </text>

      {/* Surface root symbols */}
      <text x="14" y="19" fill="oklch(0.58 0.165 148 / 0.6)" fontSize="10" fontFamily="monospace">
        ⌾
      </text>
      <text x="40" y="21" fill="oklch(0.58 0.165 148 / 0.4)" fontSize="8" fontFamily="monospace">
        ⌾
      </text>
      <text x="62" y="18" fill="oklch(0.58 0.165 148 / 0.5)" fontSize="9" fontFamily="monospace">
        ⌾
      </text>
    </svg>
  );
}

// ─── Operate Line Grid ────────────────────────────────────────────────────────
// 2×2 grid of spray fan illustrations, one per adjuvant product.
// Fan = arc sector pointing upward, radius 42px
// viewBox 360×180

export function OperateLineGrid() {
  // Spray fan path: M left_x,arc_y A 42,42 0 0 1 right_x,arc_y L cx,nozzle_y Z
  // For r=42, spread=60°: arc_y = nozzle_y - 42*cos(60°) = nozzle_y - 21
  //                        left_x = cx - 42*sin(60°) = cx - 36.4
  //                        right_x = cx + 36.4

  const cells = [
    {
      label: 'Plus',
      attr: 'Condicionador de pH',
      cx: 90,
      ny: 68,
      color: 'oklch(0.64 0.13 195)',
      colorDim: 'oklch(0.64 0.13 195 / 0.18)',
    },
    {
      label: 'Citronela',
      attr: 'Óleo essencial repelente',
      cx: 270,
      ny: 68,
      color: 'oklch(0.58 0.165 148)',
      colorDim: 'oklch(0.58 0.165 148 / 0.18)',
    },
    {
      label: '4em1',
      attr: '4 funções, 1 produto',
      cx: 90,
      ny: 158,
      color: 'oklch(0.73 0.135 78)',
      colorDim: 'oklch(0.73 0.135 78 / 0.18)',
    },
    {
      label: 'Orange',
      attr: 'd-Limonene adjuvante',
      cx: 270,
      ny: 158,
      color: 'oklch(0.75 0.14 55)',
      colorDim: 'oklch(0.75 0.14 55 / 0.18)',
    },
  ] as const;

  return (
    <svg
      viewBox="0 0 360 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      {/* Grid dividers */}
      <line x1="180" y1="0" x2="180" y2="180" stroke="oklch(0.20 0.020 148)" strokeWidth="1" />
      <line x1="0" y1="90" x2="360" y2="90" stroke="oklch(0.20 0.020 148)" strokeWidth="1" />

      {cells.map((cell) => {
        const lx = cell.cx - 36.4;
        const rx = cell.cx + 36.4;
        const ay = cell.ny - 21;
        return (
          <g key={cell.label}>
            {/* Cell background */}
            <rect
              x={cell.cx - 90}
              y={cell.ny - 79}
              width="180"
              height="90"
              fill="oklch(0.09 0.018 148)"
            />
            {/* Fan fill */}
            <path
              d={`M ${lx},${ay} A 42,42 0 0 1 ${rx},${ay} L ${cell.cx},${cell.ny} Z`}
              fill={cell.colorDim}
              stroke={cell.color}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Nozzle dot */}
            <circle cx={cell.cx} cy={cell.ny} r="3" fill={cell.color} />
            {/* Centre ray */}
            <line
              x1={cell.cx}
              y1={cell.ny}
              x2={cell.cx}
              y2={cell.ny - 38}
              stroke={cell.color}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            {/* Droplet dots on arc */}
            <circle cx={cell.cx} cy={cell.ny - 42} r="2" fill={cell.color} opacity="0.7" />
            <circle cx={lx + 6} cy={ay + 3} r="1.5" fill={cell.color} opacity="0.5" />
            <circle cx={rx - 6} cy={ay + 3} r="1.5" fill={cell.color} opacity="0.5" />
            {/* Product label */}
            <text
              x={cell.cx}
              y={cell.ny + 16}
              textAnchor="middle"
              fill="oklch(0.96 0.004 148)"
              fontSize="11"
              fontFamily="monospace"
              fontWeight="700"
              letterSpacing="0.04em"
            >
              Operate {cell.label}
            </text>
            <text
              x={cell.cx}
              y={cell.ny + 28}
              textAnchor="middle"
              fill="oklch(0.52 0.018 148)"
              fontSize="8"
              fontFamily="monospace"
            >
              {cell.attr}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Hero floating element badges ────────────────────────────────────────────
// Decorative element symbols for hero background.
// Rendered as absolutely-positioned divs; positioned by parent.

interface ElementBadgeProps {
  symbol: string;
  number: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  opacity?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ElementBadge({
  symbol,
  number,
  top,
  right,
  bottom,
  left,
  opacity = 0.22,
  size = 'md',
}: ElementBadgeProps) {
  const dim = size === 'sm' ? 40 : size === 'lg' ? 64 : 52;
  const symbolSize = size === 'sm' ? '0.9rem' : size === 'lg' ? '1.5rem' : '1.125rem';
  const numSize = size === 'sm' ? '0.45rem' : '0.5rem';

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top,
        right,
        bottom,
        left,
        width: `${dim}px`,
        height: `${dim}px`,
        borderRadius: '50%',
        border: `1px solid oklch(0.58 0.165 148 / ${opacity * 2})`,
        backgroundColor: `oklch(0.58 0.165 148 / ${opacity * 0.3})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        opacity,
        userSelect: 'none',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: symbolSize,
          fontWeight: 700,
          color: 'oklch(0.58 0.165 148)',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        {symbol}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: numSize,
          color: 'oklch(0.73 0.135 78)',
          lineHeight: 1,
          marginTop: '1px',
        }}
      >
        {number}
      </span>
    </div>
  );
}
