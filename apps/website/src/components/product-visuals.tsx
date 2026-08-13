// apps/website/src/components/product-visuals.tsx
// Inline SVG illustration components — zero external image dependencies.
// All coordinates pre-calculated; no runtime math inside render.

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
      attr: 'Óleo essencial de citronela 3%',
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

// ─── Digital Heart Ecosystem ──────────────────────────────────────────────────
// Massive anatomical particle heart — Argho's living technology core.
// Standard heart parametric: x=16·sin³t, y=13·cost − 5·cos2t − 2·cos3t − cos4t
// viewBox 1200×680. Heart center (600, 310), scale S=14.
// 160 outline particles + 90 interior (Vogel spiral) + 32 binary bits.
// 4-layer bloom: ultra halo (σ=55) → large (σ=20) → medium (σ=7) → tight (σ=2.5)

// ── Module-level particle data (computed once at module load, never re-computed) ──

const _HCX = 600;
const _HCY = 310;
const _HS = 14;

const _HEART_DOTS: ReadonlyArray<{ id: string; x: number; y: number }> = Array.from(
  { length: 160 },
  (_, i) => {
    const t = (i / 160) * 2 * Math.PI;
    return {
      id: `hd${i}`,
      x: Math.round(_HCX + 16 * Math.sin(t) ** 3 * _HS),
      y: Math.round(
        _HCY -
          (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * _HS,
      ),
    };
  },
);

const _GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ≈ 137.508°

const _INNER_DOTS: ReadonlyArray<{ id: string; x: number; y: number; s: number; o: number }> =
  Array.from({ length: 90 }, (_, i) => {
    const r = 148 * Math.sqrt(i / 90);
    const theta = i * _GOLDEN_ANGLE;
    const x = Math.round(_HCX + r * Math.cos(theta) * 0.83);
    const y = Math.round(_HCY - 20 + r * Math.sin(theta) * 0.65);
    const d = r / 148;
    return {
      id: `id${i}`,
      x,
      y,
      s: Math.round((2.1 - d * 0.9) * 10) / 10,
      o: Math.round((0.88 - d * 0.38) * 100) / 100,
    };
  });

const _BINARY_BITS: ReadonlyArray<{ id: string; x: number; y: number; v: string }> = Array.from(
  { length: 32 },
  (_, i) => {
    const r = 92 * Math.sqrt(i / 32);
    const theta = i * _GOLDEN_ANGLE * 1.27;
    return {
      id: `bb${i}`,
      x: Math.round(_HCX + r * Math.cos(theta) * 0.7),
      y: Math.round(_HCY - 36 + r * Math.sin(theta) * 0.52),
      v: i % 2 === 0 ? '1' : '0',
    };
  },
);

// 16-point polygon approximation of the heart (for bloom fill layer).
// Computed from exact parametric formula at t = k·π/8, k=0..15.
const _H_POLY =
  'M 600,240 L 613,202 L 679,148 L 777,165 L 824,264 L 777,356 L 679,445 L 613,517 L 600,548 L 587,517 L 521,445 L 423,356 L 376,254 L 423,165 L 521,148 L 587,202 Z';

export function DigitalHeartEcosystem() {
  const nodes = [
    {
      cx: 92,
      cy: 105,
      color: 'oklch(0.58 0.165 148)',
      bg: 'oklch(0.10 0.035 148)',
      cat: 'MINERAL',
      sub: 'Fert. Minerais',
      sym: 'Fe',
      count: '7',
      lx1: 500,
      ly1: 175,
      lx2: 148,
      ly2: 138,
      dashDelay: '0s',
    },
    {
      cx: 1108,
      cy: 105,
      color: 'oklch(0.64 0.13 195)',
      bg: 'oklch(0.10 0.033 195)',
      cat: 'ORGANO',
      sub: 'Organominerais',
      sym: 'Mo',
      count: '4',
      lx1: 700,
      ly1: 175,
      lx2: 1052,
      ly2: 138,
      dashDelay: '0.2s',
    },
    {
      cx: 92,
      cy: 575,
      color: 'oklch(0.66 0.150 150)',
      bg: 'oklch(0.10 0.038 150)',
      cat: 'BIOLÓGICO',
      sub: 'Bioestimulantes',
      sym: 'N',
      count: '4',
      lx1: 476,
      ly1: 470,
      lx2: 148,
      ly2: 542,
      dashDelay: '0.35s',
    },
    {
      cx: 1108,
      cy: 575,
      color: 'oklch(0.73 0.135 78)',
      bg: 'oklch(0.12 0.038 78)',
      cat: 'ADJUVANTE',
      sub: 'Linha Operate',
      sym: 'K',
      count: '4',
      lx1: 724,
      ly1: 470,
      lx2: 1052,
      ly2: 542,
      dashDelay: '0.15s',
    },
  ] as const;

  return (
    <svg
      viewBox="0 0 1200 680"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      <defs>
        {/* ── Bloom / glow filters ── */}

        {/* Ultra halo — massive atmospheric bloom */}
        <filter id="h-ultra" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="55" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
          </feMerge>
        </filter>

        {/* Large bloom — particle halo */}
        <filter id="h-large" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="20" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
          </feMerge>
        </filter>

        {/* Medium glow — with source visible */}
        <filter id="h-med" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Tight crisp glow — sharp particle edges */}
        <filter id="h-tight" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Node glow */}
        <filter id="h-nglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Line glow for connection traces */}
        <filter id="h-line" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ── Background gradient ── */}
        <radialGradient id="h-bg" cx="50%" cy="46%" r="46%">
          <stop offset="0%" stopColor="oklch(0.20 0.065 148)" stopOpacity="0.90" />
          <stop offset="42%" stopColor="oklch(0.12 0.035 148)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="oklch(0.07 0.018 148)" stopOpacity="0" />
        </radialGradient>

        {/* Teal secondary glow at lower half */}
        <radialGradient id="h-bg2" cx="50%" cy="72%" r="38%">
          <stop offset="0%" stopColor="oklch(0.64 0.13 195)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="oklch(0.64 0.13 195)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Atmospheric background ── */}
      <rect width="1200" height="680" fill="url(#h-bg)" />
      <rect width="1200" height="680" fill="url(#h-bg2)" />

      {/* ── Diagnostic grid (very subtle — tech/precision aesthetic) ── */}
      {Array.from({ length: 22 }, (_, i) => (i + 1) * 30).map((y) => (
        <line
          key={`hg-${y}`}
          x1="0"
          y1={y}
          x2="1200"
          y2={y}
          stroke="oklch(0.22 0.025 148)"
          strokeWidth="0.4"
          opacity="0.13"
        />
      ))}
      {Array.from({ length: 39 }, (_, i) => (i + 1) * 30).map((x) => (
        <line
          key={`vg-${x}`}
          x1={x}
          y1="0"
          x2={x}
          y2="680"
          stroke="oklch(0.22 0.025 148)"
          strokeWidth="0.4"
          opacity="0.13"
        />
      ))}

      {/* ════════════════════════════════════════════════════════════════════
          HEART RENDERING — 4 bloom layers, bottom to top
          ════════════════════════════════════════════════════════════════════ */}

      {/* Layer 1 — Ultra atmospheric halo (huge diffuse bloom behind heart) */}
      <g filter="url(#h-ultra)" opacity="0.38">
        <path d={_H_POLY} fill="oklch(0.58 0.165 148)" />
      </g>

      {/* Layer 2 — Large bloom on outline (creates glowing outline halo) */}
      <g filter="url(#h-large)" opacity="0.58">
        {_HEART_DOTS.map((d) => (
          <circle key={`lb-${d.id}`} cx={d.x} cy={d.y} r="4" fill="oklch(0.58 0.165 148)" />
        ))}
      </g>

      {/* ── Interior volumetric particles with medium glow ── */}
      <g filter="url(#h-med)">
        {_INNER_DOTS.map((d) => (
          <circle
            key={`in-${d.id}`}
            cx={d.x}
            cy={d.y}
            r={d.s}
            fill="oklch(0.64 0.13 175)"
            opacity={d.o}
          />
        ))}
      </g>

      {/* ── Binary code overlay inside heart ── */}
      {_BINARY_BITS.map((d) => (
        <text
          key={`bb-${d.id}`}
          x={d.x}
          y={d.y}
          fontFamily="monospace"
          fontSize="7"
          fill="oklch(0.80 0.100 148)"
          opacity="0.50"
          textAnchor="middle"
        >
          {d.v}
        </text>
      ))}

      {/* ── Animated heartbeat group ── */}
      <g className="eco-heartbeat">
        {/* Layer 3 — Medium glow on outline particles */}
        <g filter="url(#h-med)" opacity="0.88">
          {_HEART_DOTS.map((d) => (
            <circle key={`mo-${d.id}`} cx={d.x} cy={d.y} r="2.4" fill="oklch(0.70 0.148 148)" />
          ))}
        </g>

        {/* Layer 4 — Crisp sharp outline (gold accents every 6th particle) */}
        <g filter="url(#h-tight)">
          {_HEART_DOTS.map((d, i) => (
            <circle
              key={`sh-${d.id}`}
              cx={d.x}
              cy={d.y}
              r="1.7"
              fill={i % 6 === 0 ? 'oklch(0.93 0.08 78)' : 'oklch(0.96 0.022 148)'}
              opacity={i % 6 === 0 ? 0.98 : 0.9}
            />
          ))}
        </g>

        {/* Expanding pulse rings (CSS animations from globals.css) */}
        <circle
          cx="600"
          cy="310"
          r="110"
          stroke="oklch(0.58 0.165 148)"
          strokeWidth="1.5"
          fill="none"
          className="eco-ring-1"
        />
        <circle
          cx="600"
          cy="310"
          r="110"
          stroke="oklch(0.64 0.13 195)"
          strokeWidth="1"
          fill="none"
          className="eco-ring-2"
        />
      </g>

      {/* ── Connection lines from heart to orbital nodes ── */}
      {nodes.map((n) => (
        <line
          key={`cl-${n.cat}`}
          x1={n.lx1}
          y1={n.ly1}
          x2={n.lx2}
          y2={n.ly2}
          stroke={n.color}
          strokeWidth="1.5"
          strokeDasharray="7 4"
          strokeOpacity="0.70"
          filter="url(#h-line)"
          className="eco-dash"
          style={{ animationDelay: n.dashDelay }}
        />
      ))}

      {/* ── Orbital category nodes ── */}
      {nodes.map((n) => (
        <g key={`nd-${n.cat}`} className="eco-node-glow">
          {/* Outer decorative rings */}
          <circle
            cx={n.cx}
            cy={n.cy}
            r="48"
            stroke={n.color}
            strokeWidth="1"
            fill="none"
            opacity="0.28"
          />
          <circle
            cx={n.cx}
            cy={n.cy}
            r="38"
            stroke={n.color}
            strokeWidth="0.5"
            fill="none"
            opacity="0.18"
          />
          {/* Node body with glow */}
          <circle
            cx={n.cx}
            cy={n.cy}
            r="28"
            fill={n.bg}
            stroke={n.color}
            strokeWidth="1.5"
            opacity="0.96"
            filter="url(#h-nglow)"
          />
          {/* Element symbol */}
          <text
            x={n.cx}
            y={n.cy - 3}
            textAnchor="middle"
            fontFamily="monospace"
            fontWeight="700"
            fontSize="14"
            fill={n.color}
          >
            {n.sym}
          </text>
          <text
            x={n.cx}
            y={n.cy + 10}
            textAnchor="middle"
            fontFamily="monospace"
            fontSize="7.5"
            fill={n.color}
            opacity="0.68"
          >
            {n.count} prod
          </text>
          {/* Category label below node */}
          <text
            x={n.cx}
            y={n.cy + 48}
            textAnchor="middle"
            fontFamily="monospace"
            fontWeight="700"
            fontSize="8"
            fill={n.color}
            letterSpacing="0.08em"
          >
            {n.cat}
          </text>
          <text
            x={n.cx}
            y={n.cy + 61}
            textAnchor="middle"
            fontFamily="sans-serif"
            fontSize="7.5"
            fill="oklch(0.52 0.018 148)"
          >
            {n.sub}
          </text>
        </g>
      ))}

      {/* ── Center label ── */}
      <text
        x="600"
        y="620"
        textAnchor="middle"
        fontFamily="monospace"
        fontWeight="600"
        fontSize="9"
        fill="oklch(0.52 0.020 148)"
        letterSpacing="0.14em"
      >
        ECOSSISTEMA · ARGHO · AGROSCIENCES
      </text>
    </svg>
  );
}

// ─── Hero Bio Background ──────────────────────────────────────────────────────
// Full-bleed decorative SVG: PCB circuit traces (top) + organic root system
// (bottom) fused at center. Positioned absolute, covers right portion of hero.

export function HeroBioBackground() {
  return (
    <svg
      viewBox="0 0 680 760"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
    >
      <defs>
        <radialGradient id="hbb-g1" cx="62%" cy="30%" r="48%">
          <stop offset="0%" stopColor="oklch(0.58 0.165 148)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="oklch(0.58 0.165 148)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hbb-g2" cx="38%" cy="78%" r="44%">
          <stop offset="0%" stopColor="oklch(0.66 0.150 150)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="oklch(0.66 0.150 150)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hbb-fusion" cx="50%" cy="50%" r="30%">
          <stop offset="0%" stopColor="oklch(0.73 0.135 78)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="oklch(0.73 0.135 78)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Atmospheric glows */}
      <rect width="680" height="760" fill="url(#hbb-g1)" />
      <rect width="680" height="760" fill="url(#hbb-g2)" />

      {/* ── CIRCUIT ZONE (upper portion) ── */}
      {/* Primary horizontal PCB traces */}
      <line
        x1="60"
        y1="110"
        x2="580"
        y2="110"
        stroke="oklch(0.58 0.165 148)"
        strokeWidth="1.8"
        opacity="0.42"
      />
      <line
        x1="100"
        y1="175"
        x2="520"
        y2="175"
        stroke="oklch(0.58 0.165 148)"
        strokeWidth="1.2"
        opacity="0.30"
      />
      <line
        x1="60"
        y1="250"
        x2="480"
        y2="250"
        stroke="oklch(0.64 0.13 195)"
        strokeWidth="1"
        opacity="0.25"
      />
      <line
        x1="140"
        y1="320"
        x2="540"
        y2="320"
        stroke="oklch(0.58 0.165 148)"
        strokeWidth="0.8"
        opacity="0.20"
      />

      {/* Vertical connecting traces */}
      <line
        x1="160"
        y1="68"
        x2="160"
        y2="390"
        stroke="oklch(0.58 0.165 148)"
        strokeWidth="1.2"
        opacity="0.28"
      />
      <line
        x1="300"
        y1="48"
        x2="300"
        y2="380"
        stroke="oklch(0.58 0.165 148)"
        strokeWidth="1.8"
        opacity="0.36"
      />
      <line
        x1="440"
        y1="68"
        x2="440"
        y2="360"
        stroke="oklch(0.64 0.13 195)"
        strokeWidth="1.2"
        opacity="0.26"
      />
      <line
        x1="540"
        y1="90"
        x2="540"
        y2="310"
        stroke="oklch(0.58 0.165 148)"
        strokeWidth="0.8"
        opacity="0.20"
      />

      {/* L-shaped trace corners */}
      <path
        d="M 60,110 L 60,68 L 100,68"
        stroke="oklch(0.58 0.165 148)"
        strokeWidth="1.8"
        opacity="0.45"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 580,110 L 580,68 L 540,68"
        stroke="oklch(0.58 0.165 148)"
        strokeWidth="1.8"
        opacity="0.45"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 300,175 L 380,175 L 380,250"
        stroke="oklch(0.64 0.13 195)"
        strokeWidth="1.2"
        opacity="0.32"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 160,175 L 100,175 L 100,250"
        stroke="oklch(0.58 0.165 148)"
        strokeWidth="1"
        opacity="0.24"
        fill="none"
        strokeLinecap="round"
      />

      {/* Via dots at intersections */}
      <circle cx="160" cy="110" r="5" fill="oklch(0.58 0.165 148)" opacity="0.65" />
      <circle cx="300" cy="110" r="6.5" fill="oklch(0.73 0.135 78)" opacity="0.75" />
      <circle cx="440" cy="110" r="5" fill="oklch(0.64 0.13 195)" opacity="0.62" />
      <circle cx="540" cy="110" r="4" fill="oklch(0.58 0.165 148)" opacity="0.55" />
      <circle cx="160" cy="175" r="4" fill="oklch(0.58 0.165 148)" opacity="0.50" />
      <circle cx="300" cy="175" r="5" fill="oklch(0.73 0.135 78)" opacity="0.60" />
      <circle cx="440" cy="175" r="4" fill="oklch(0.64 0.13 195)" opacity="0.50" />
      <circle cx="380" cy="250" r="4.5" fill="oklch(0.64 0.13 195)" opacity="0.55" />
      <circle cx="160" cy="250" r="3.5" fill="oklch(0.58 0.165 148)" opacity="0.44" />

      {/* CPU component rectangle */}
      <rect
        x="260"
        y="90"
        width="80"
        height="40"
        rx="5"
        fill="none"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="2"
        opacity="0.62"
      />
      <rect
        x="272"
        y="97"
        width="56"
        height="26"
        rx="3"
        fill="oklch(0.73 0.135 78 / 0.10)"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="1"
        opacity="0.52"
      />
      {/* CPU pins top */}
      <line
        x1="276"
        y1="90"
        x2="276"
        y2="82"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="1.2"
        opacity="0.62"
      />
      <line
        x1="288"
        y1="90"
        x2="288"
        y2="82"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="1.2"
        opacity="0.62"
      />
      <line
        x1="300"
        y1="90"
        x2="300"
        y2="82"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="1.2"
        opacity="0.62"
      />
      <line
        x1="312"
        y1="90"
        x2="312"
        y2="82"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="1.2"
        opacity="0.62"
      />
      <line
        x1="324"
        y1="90"
        x2="324"
        y2="82"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="1.2"
        opacity="0.62"
      />
      {/* CPU pins bottom */}
      <line
        x1="276"
        y1="130"
        x2="276"
        y2="138"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="1.2"
        opacity="0.62"
      />
      <line
        x1="288"
        y1="130"
        x2="288"
        y2="138"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="1.2"
        opacity="0.62"
      />
      <line
        x1="300"
        y1="130"
        x2="300"
        y2="138"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="1.2"
        opacity="0.62"
      />
      <line
        x1="312"
        y1="130"
        x2="312"
        y2="138"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="1.2"
        opacity="0.62"
      />
      <line
        x1="324"
        y1="130"
        x2="324"
        y2="138"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="1.2"
        opacity="0.62"
      />
      {/* CPU pins left */}
      <line
        x1="260"
        y1="100"
        x2="250"
        y2="100"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="1.2"
        opacity="0.62"
      />
      <line
        x1="260"
        y1="112"
        x2="250"
        y2="112"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="1.2"
        opacity="0.62"
      />
      <line
        x1="260"
        y1="124"
        x2="250"
        y2="124"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="1.2"
        opacity="0.62"
      />
      {/* CPU pins right */}
      <line
        x1="340"
        y1="100"
        x2="350"
        y2="100"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="1.2"
        opacity="0.62"
      />
      <line
        x1="340"
        y1="112"
        x2="350"
        y2="112"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="1.2"
        opacity="0.62"
      />
      <line
        x1="340"
        y1="124"
        x2="350"
        y2="124"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="1.2"
        opacity="0.62"
      />

      {/* Small capacitor at 440,175 */}
      <rect
        x="424"
        y="163"
        width="32"
        height="24"
        rx="4"
        fill="none"
        stroke="oklch(0.64 0.13 195)"
        strokeWidth="1.2"
        opacity="0.48"
      />

      {/* Measurement tick marks on main trace */}
      {[130, 200, 260, 380, 480].map((x) => (
        <line
          key={`tk-${x}`}
          x1={x}
          y1="104"
          x2={x}
          y2="116"
          stroke="oklch(0.58 0.165 148)"
          strokeWidth="1"
          opacity="0.32"
        />
      ))}

      {/* Dashed trace (data bus) */}
      <line
        x1="60"
        y1="68"
        x2="580"
        y2="68"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="0.8"
        opacity="0.22"
        strokeDasharray="6 5"
      />

      {/* ── FUSION ZONE ── */}
      <rect width="680" height="760" fill="url(#hbb-fusion)" />
      <circle
        cx="300"
        cy="420"
        r="22"
        fill="none"
        stroke="oklch(0.58 0.165 148)"
        strokeWidth="2"
        opacity="0.42"
      />
      <circle
        cx="300"
        cy="420"
        r="10"
        fill="oklch(0.58 0.165 148 / 0.15)"
        stroke="oklch(0.73 0.135 78)"
        strokeWidth="1.5"
        opacity="0.70"
      />
      <circle cx="300" cy="420" r="4" fill="oklch(0.73 0.135 78)" opacity="0.88" />
      {/* Vertical connector from circuit to organic */}
      <line
        x1="300"
        y1="380"
        x2="300"
        y2="398"
        stroke="oklch(0.58 0.165 148)"
        strokeWidth="2"
        opacity="0.50"
      />
      <line
        x1="300"
        y1="442"
        x2="300"
        y2="465"
        stroke="oklch(0.66 0.150 150)"
        strokeWidth="2.5"
        opacity="0.55"
        strokeLinecap="round"
      />

      {/* ── ORGANIC / ROOT ZONE (lower portion) ── */}
      {/* Main stem */}
      <path
        d="M 300,465 C 298,492 290,515 278,538 C 265,562 248,578 235,598"
        stroke="oklch(0.66 0.150 150)"
        strokeWidth="3"
        opacity="0.60"
        strokeLinecap="round"
      />
      {/* Primary left branch */}
      <path
        d="M 278,525 C 250,510 220,508 188,516"
        stroke="oklch(0.66 0.150 150)"
        strokeWidth="2.2"
        opacity="0.52"
        strokeLinecap="round"
      />
      {/* Primary right branch */}
      <path
        d="M 275,548 C 308,530 338,528 368,540"
        stroke="oklch(0.66 0.150 150)"
        strokeWidth="2"
        opacity="0.48"
        strokeLinecap="round"
      />
      {/* Secondary branches left */}
      <path
        d="M 218,515 C 198,502 178,498 158,506"
        stroke="oklch(0.66 0.150 150)"
        strokeWidth="1.4"
        opacity="0.40"
        strokeLinecap="round"
      />
      <path
        d="M 200,516 C 188,530 182,548 185,564"
        stroke="oklch(0.66 0.150 150)"
        strokeWidth="1.2"
        opacity="0.34"
        strokeLinecap="round"
      />
      {/* Secondary branches right */}
      <path
        d="M 342,535 C 362,522 378,520 392,530"
        stroke="oklch(0.66 0.150 150)"
        strokeWidth="1.4"
        opacity="0.38"
        strokeLinecap="round"
      />
      <path
        d="M 355,540 C 368,558 372,576 366,594"
        stroke="oklch(0.66 0.150 150)"
        strokeWidth="1"
        opacity="0.30"
        strokeLinecap="round"
      />
      {/* Tertiary micro-roots */}
      <path
        d="M 158,506 C 142,498 130,500 118,510"
        stroke="oklch(0.66 0.150 150)"
        strokeWidth="0.8"
        opacity="0.28"
        strokeLinecap="round"
      />
      <path
        d="M 392,530 C 408,520 420,522 430,532"
        stroke="oklch(0.66 0.150 150)"
        strokeWidth="0.8"
        opacity="0.26"
        strokeLinecap="round"
      />
      <path
        d="M 235,598 C 224,616 220,634 225,650"
        stroke="oklch(0.66 0.150 150)"
        strokeWidth="1.2"
        opacity="0.30"
        strokeLinecap="round"
      />
      {/* Root tip nodes */}
      <circle cx="118" cy="510" r="4" fill="oklch(0.66 0.150 150)" opacity="0.68" />
      <circle cx="185" cy="564" r="3.5" fill="oklch(0.66 0.150 150)" opacity="0.60" />
      <circle cx="430" cy="532" r="4" fill="oklch(0.66 0.150 150)" opacity="0.65" />
      <circle cx="366" cy="594" r="3" fill="oklch(0.66 0.150 150)" opacity="0.55" />
      <circle cx="225" cy="650" r="3.5" fill="oklch(0.66 0.150 150)" opacity="0.55" />
      {/* Leaf shapes at branch ends */}
      <path
        d="M 158,506 C 140,494 130,480 140,472 C 150,464 165,474 162,488 Z"
        fill="oklch(0.66 0.150 150 / 0.18)"
        stroke="oklch(0.66 0.150 150)"
        strokeWidth="1"
        opacity="0.52"
      />
      <path
        d="M 392,530 C 410,518 422,506 414,498 C 406,490 393,502 396,516 Z"
        fill="oklch(0.66 0.150 150 / 0.18)"
        stroke="oklch(0.66 0.150 150)"
        strokeWidth="1"
        opacity="0.48"
      />
      {/* Humic gold particles (soil nutrients) */}
      <circle cx="260" cy="548" r="2.5" fill="oklch(0.73 0.135 78)" opacity="0.58" />
      <circle cx="320" cy="560" r="2" fill="oklch(0.73 0.135 78)" opacity="0.50" />
      <circle cx="215" cy="580" r="2.2" fill="oklch(0.73 0.135 78)" opacity="0.52" />
      <circle cx="348" cy="575" r="1.8" fill="oklch(0.73 0.135 78)" opacity="0.45" />
      <circle cx="245" cy="622" r="2" fill="oklch(0.73 0.135 78)" opacity="0.42" />

      {/* ── Floating particles scattered throughout ── */}
      <circle cx="120" cy="148" r="2" fill="oklch(0.58 0.165 148)" opacity="0.48" />
      <circle cx="498" cy="195" r="2" fill="oklch(0.64 0.13 195)" opacity="0.42" />
      <circle cx="558" cy="148" r="1.5" fill="oklch(0.73 0.135 78)" opacity="0.55" />
      <circle cx="92" cy="238" r="1.5" fill="oklch(0.58 0.165 148)" opacity="0.38" />
      <circle cx="460" cy="340" r="2" fill="oklch(0.58 0.165 148)" opacity="0.36" />
      <circle cx="168" cy="385" r="1.5" fill="oklch(0.66 0.150 150)" opacity="0.44" />
      <circle cx="408" cy="465" r="2" fill="oklch(0.66 0.150 150)" opacity="0.40" />
      <circle cx="480" cy="520" r="1.5" fill="oklch(0.73 0.135 78)" opacity="0.38" />
      <circle cx="142" cy="460" r="1.5" fill="oklch(0.66 0.150 150)" opacity="0.35" />
      <circle cx="82" cy="548" r="2" fill="oklch(0.66 0.150 150)" opacity="0.30" />
      <circle cx="540" cy="580" r="1.5" fill="oklch(0.73 0.135 78)" opacity="0.35" />
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
