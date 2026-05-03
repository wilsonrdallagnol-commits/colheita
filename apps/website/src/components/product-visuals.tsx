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

// ─── Digital Heart Ecosystem ──────────────────────────────────────────────────
// SVG central heart — circuits (AI/Tech, upper half) fused with root veins
// (Agro/Biologia, lower half). 4 orbital nodes for product categories.
// viewBox 800×490. Heart centered at (400, 238).
// Heart path: scale 1.6 from canonical heart, translated (320, 162).

export function DigitalHeartEcosystem() {
  const H =
    'M 400,210 C 400,186 376,170 352,186 C 320,202 320,242 400,290 C 480,242 480,202 448,186 C 424,170 400,186 400,210 Z';

  // ── Pre-calculated particle positions along the heart bezier outline ──────
  // 30 points traced clockwise along all 4 bezier segments
  const heartDots = [
    { x: 400, y: 210 },
    { x: 397, y: 200 },
    { x: 390, y: 191 },
    { x: 381, y: 184 },
    { x: 370, y: 179 },
    { x: 360, y: 181 },
    { x: 352, y: 186 },
    { x: 337, y: 196 },
    { x: 327, y: 210 },
    { x: 323, y: 224 },
    { x: 328, y: 239 },
    { x: 339, y: 252 },
    { x: 354, y: 263 },
    { x: 370, y: 273 },
    { x: 385, y: 281 },
    { x: 400, y: 290 },
    { x: 415, y: 281 },
    { x: 430, y: 273 },
    { x: 446, y: 263 },
    { x: 461, y: 252 },
    { x: 472, y: 239 },
    { x: 477, y: 224 },
    { x: 473, y: 210 },
    { x: 463, y: 196 },
    { x: 448, y: 186 },
    { x: 440, y: 181 },
    { x: 430, y: 179 },
    { x: 419, y: 184 },
    { x: 410, y: 191 },
    { x: 404, y: 200 },
  ];

  // ── Interior scatter particles ─────────────────────────────────────────────
  const innerDots = [
    { x: 375, y: 208, s: 1.4, o: 0.7 },
    { x: 393, y: 194, s: 1.2, o: 0.62 },
    { x: 407, y: 194, s: 1.2, o: 0.62 },
    { x: 425, y: 208, s: 1.4, o: 0.7 },
    { x: 366, y: 218, s: 1.2, o: 0.58 },
    { x: 434, y: 218, s: 1.2, o: 0.58 },
    { x: 360, y: 230, s: 1.0, o: 0.52 },
    { x: 380, y: 224, s: 1.1, o: 0.6 },
    { x: 400, y: 218, s: 1.8, o: 0.78 },
    { x: 420, y: 224, s: 1.1, o: 0.6 },
    { x: 440, y: 230, s: 1.0, o: 0.52 },
    { x: 355, y: 243, s: 1.0, o: 0.48 },
    { x: 380, y: 237, s: 1.0, o: 0.55 },
    { x: 400, y: 236, s: 2.2, o: 0.88 },
    { x: 420, y: 237, s: 1.0, o: 0.55 },
    { x: 445, y: 243, s: 1.0, o: 0.48 },
    { x: 362, y: 255, s: 1.0, o: 0.45 },
    { x: 381, y: 249, s: 0.9, o: 0.48 },
    { x: 400, y: 255, s: 1.4, o: 0.62 },
    { x: 419, y: 249, s: 0.9, o: 0.48 },
    { x: 438, y: 255, s: 1.0, o: 0.45 },
    { x: 373, y: 265, s: 1.0, o: 0.4 },
    { x: 400, y: 268, s: 1.2, o: 0.5 },
    { x: 427, y: 265, s: 1.0, o: 0.4 },
    { x: 385, y: 277, s: 0.9, o: 0.38 },
    { x: 415, y: 277, s: 0.9, o: 0.38 },
    { x: 388, y: 215, s: 0.8, o: 0.42 },
    { x: 412, y: 215, s: 0.8, o: 0.42 },
    { x: 392, y: 228, s: 0.8, o: 0.45 },
    { x: 408, y: 228, s: 0.8, o: 0.45 },
    { x: 375, y: 245, s: 0.7, o: 0.38 },
    { x: 425, y: 245, s: 0.7, o: 0.38 },
  ];

  // ── Binary code dots scattered in upper heart half ─────────────────────────
  const binaryBits = [
    { x: 373, y: 207, v: '1' },
    { x: 382, y: 200, v: '0' },
    { x: 393, y: 205, v: '1' },
    { x: 407, y: 205, v: '0' },
    { x: 418, y: 200, v: '1' },
    { x: 427, y: 207, v: '0' },
    { x: 367, y: 218, v: '0' },
    { x: 433, y: 218, v: '1' },
    { x: 363, y: 230, v: '1' },
    { x: 437, y: 230, v: '0' },
    { x: 358, y: 242, v: '0' },
    { x: 442, y: 242, v: '1' },
  ];

  // Orbital nodes
  const nodes = [
    {
      cx: 182,
      cy: 112,
      color: 'oklch(0.58 0.165 148)',
      bg: 'oklch(0.11 0.035 148)',
      cat: 'MINERAL',
      sub: 'Fert. Minerais',
      sym: 'Fe',
      count: '7',
      lx1: 355,
      ly1: 198,
      lx2: 218,
      ly2: 143,
      dashDelay: '0s',
    },
    {
      cx: 618,
      cy: 112,
      color: 'oklch(0.64 0.13 195)',
      bg: 'oklch(0.11 0.033 195)',
      cat: 'ORGANO',
      sub: 'Organominerais',
      sym: 'Mo',
      count: '4',
      lx1: 445,
      ly1: 198,
      lx2: 582,
      ly2: 143,
      dashDelay: '0.2s',
    },
    {
      cx: 182,
      cy: 368,
      color: 'oklch(0.66 0.150 150)',
      bg: 'oklch(0.11 0.038 150)',
      cat: 'BIOLÓGICO',
      sub: 'Bioestimulantes',
      sym: 'N',
      count: '4',
      lx1: 348,
      ly1: 272,
      lx2: 218,
      ly2: 335,
      dashDelay: '0.35s',
    },
    {
      cx: 618,
      cy: 368,
      color: 'oklch(0.73 0.135 78)',
      bg: 'oklch(0.13 0.038 78)',
      cat: 'ADJUVANTE',
      sub: 'Linha Operate',
      sym: 'K',
      count: '4',
      lx1: 452,
      ly1: 272,
      lx2: 582,
      ly2: 335,
      dashDelay: '0.15s',
    },
  ] as const;

  return (
    <svg
      viewBox="0 0 800 490"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      <defs>
        {/* Heart clip path */}
        <clipPath id="eco-hclip">
          <path d={H} />
        </clipPath>

        {/* Heart background — vivid green at center */}
        <radialGradient id="eco-hfill" cx="50%" cy="32%" r="62%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="oklch(0.26 0.085 148)" />
          <stop offset="55%" stopColor="oklch(0.14 0.048 148)" />
          <stop offset="100%" stopColor="oklch(0.08 0.020 148)" />
        </radialGradient>

        {/* Bloom: large diffuse glow behind the whole heart */}
        <filter id="eco-bloom" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="20" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
          </feMerge>
        </filter>

        {/* Medium glow for outline + core */}
        <filter id="eco-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft glow for particle dots */}
        <filter id="eco-dot-glow" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Node outer ring glow */}
        <filter id="eco-nglow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Atmospheric background gradient */}
        <radialGradient id="eco-atm" cx="50%" cy="49%" r="44%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="oklch(0.24 0.078 148)" stopOpacity="0.95" />
          <stop offset="40%" stopColor="oklch(0.15 0.046 148)" stopOpacity="0.65" />
          <stop offset="100%" stopColor="oklch(0.065 0.016 148)" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="eco-gold-atm"
          cx="50%"
          cy="49%"
          r="30%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="oklch(0.73 0.135 78)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="oklch(0.73 0.135 78)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Atmospheric background glows ── */}
      <rect width="800" height="490" fill="url(#eco-atm)" />
      <rect width="800" height="490" fill="url(#eco-gold-atm)" />

      {/* ── Diagnostic grid ── */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450, 480].map((y) => (
        <line
          key={`hg-${y}`}
          x1="0"
          y1={y}
          x2="800"
          y2={y}
          stroke="oklch(0.22 0.025 148)"
          strokeWidth="0.5"
          opacity="0.20"
        />
      ))}
      {[
        0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450, 480, 510, 540,
        570, 600, 630, 660, 690, 720, 750, 780,
      ].map((x) => (
        <line
          key={`vg-${x}`}
          x1={x}
          y1="0"
          x2={x}
          y2="490"
          stroke="oklch(0.22 0.025 148)"
          strokeWidth="0.5"
          opacity="0.20"
        />
      ))}

      {/* ── Connection lines (dashed, flow animation) ── */}
      {nodes.map((n) => (
        <line
          key={`conn-${n.cat}`}
          x1={n.lx1}
          y1={n.ly1}
          x2={n.lx2}
          y2={n.ly2}
          stroke={n.color}
          strokeWidth="2"
          strokeDasharray="8 5"
          strokeOpacity="0.82"
          className="eco-dash"
          style={{ animationDelay: n.dashDelay }}
        />
      ))}

      {/* ── Expanding pulse rings ── */}
      <circle
        cx="400"
        cy="238"
        r="100"
        stroke="oklch(0.58 0.165 148)"
        strokeWidth="1.5"
        fill="none"
        className="eco-ring-1"
      />
      <circle
        cx="400"
        cy="238"
        r="100"
        stroke="oklch(0.64 0.13 195)"
        strokeWidth="1"
        fill="none"
        className="eco-ring-2"
      />

      {/* ── HEART (heartbeat animation) ── */}
      <g className="eco-heartbeat">
        {/* ① Bloom: large soft halo behind the whole heart */}
        <circle
          cx="400"
          cy="238"
          r="72"
          fill="oklch(0.50 0.145 148)"
          opacity="0.22"
          filter="url(#eco-bloom)"
        />

        {/* ② Heart body fill */}
        <path d={H} fill="url(#eco-hfill)" />

        {/* ③ Circuit grid inside — upper tech half (clipped) */}
        <g clipPath="url(#eco-hclip)" opacity="0.92">
          {/* Horizontal traces */}
          <line
            x1="326"
            y1="198"
            x2="474"
            y2="198"
            stroke="oklch(0.58 0.165 148)"
            strokeWidth="0.9"
            opacity="0.80"
          />
          <line
            x1="326"
            y1="210"
            x2="474"
            y2="210"
            stroke="oklch(0.58 0.165 148)"
            strokeWidth="0.8"
            opacity="0.62"
          />
          <line
            x1="330"
            y1="222"
            x2="470"
            y2="222"
            stroke="oklch(0.64 0.13 195)"
            strokeWidth="0.7"
            opacity="0.50"
          />
          <line
            x1="336"
            y1="234"
            x2="464"
            y2="234"
            stroke="oklch(0.58 0.165 148)"
            strokeWidth="0.7"
            opacity="0.40"
          />
          {/* Vertical traces */}
          <line
            x1="362"
            y1="184"
            x2="362"
            y2="262"
            stroke="oklch(0.58 0.165 148)"
            strokeWidth="0.9"
            opacity="0.72"
          />
          <line
            x1="381"
            y1="181"
            x2="381"
            y2="262"
            stroke="oklch(0.58 0.165 148)"
            strokeWidth="0.8"
            opacity="0.58"
          />
          <line
            x1="400"
            y1="174"
            x2="400"
            y2="268"
            stroke="oklch(0.73 0.135 78)"
            strokeWidth="1.1"
            opacity="0.82"
          />
          <line
            x1="419"
            y1="181"
            x2="419"
            y2="262"
            stroke="oklch(0.58 0.165 148)"
            strokeWidth="0.8"
            opacity="0.58"
          />
          <line
            x1="438"
            y1="184"
            x2="438"
            y2="262"
            stroke="oklch(0.58 0.165 148)"
            strokeWidth="0.9"
            opacity="0.72"
          />
          {/* L-bends at lobe lips */}
          <path
            d="M 352,186 L 362,186 L 362,198"
            stroke="oklch(0.58 0.165 148)"
            strokeWidth="0.9"
            opacity="0.55"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 448,186 L 438,186 L 438,198"
            stroke="oklch(0.58 0.165 148)"
            strokeWidth="0.9"
            opacity="0.55"
            fill="none"
            strokeLinecap="round"
          />
          {/* Intersection vias */}
          <circle cx="362" cy="198" r="2.8" fill="oklch(0.58 0.165 148)" opacity="0.88" />
          <circle cx="381" cy="210" r="2.2" fill="oklch(0.64 0.13 195)" opacity="0.80" />
          <circle cx="400" cy="198" r="3.2" fill="oklch(0.73 0.135 78)" opacity="0.95" />
          <circle cx="419" cy="210" r="2.2" fill="oklch(0.64 0.13 195)" opacity="0.80" />
          <circle cx="438" cy="198" r="2.8" fill="oklch(0.58 0.165 148)" opacity="0.88" />
          <circle cx="381" cy="198" r="1.8" fill="oklch(0.58 0.165 148)" opacity="0.62" />
          <circle cx="419" cy="198" r="1.8" fill="oklch(0.58 0.165 148)" opacity="0.62" />
          <circle cx="400" cy="210" r="2.0" fill="oklch(0.58 0.165 148)" opacity="0.58" />
          <circle cx="362" cy="222" r="1.8" fill="oklch(0.64 0.13 195)" opacity="0.55" />
          <circle cx="438" cy="222" r="1.8" fill="oklch(0.64 0.13 195)" opacity="0.55" />
          <circle cx="381" cy="222" r="1.5" fill="oklch(0.58 0.165 148)" opacity="0.48" />
          <circle cx="419" cy="222" r="1.5" fill="oklch(0.58 0.165 148)" opacity="0.48" />
          {/* CPU chip */}
          <rect
            x="388"
            y="205"
            width="24"
            height="14"
            rx="2.5"
            fill="none"
            stroke="oklch(0.73 0.135 78)"
            strokeWidth="1.4"
            opacity="0.95"
          />
          <rect
            x="392"
            y="208"
            width="16"
            height="8"
            rx="1.5"
            fill="oklch(0.73 0.135 78 / 0.18)"
            stroke="oklch(0.73 0.135 78)"
            strokeWidth="0.8"
            opacity="0.80"
          />
          <line
            x1="394"
            y1="205"
            x2="394"
            y2="200"
            stroke="oklch(0.73 0.135 78)"
            strokeWidth="0.9"
            opacity="0.85"
          />
          <line
            x1="400"
            y1="205"
            x2="400"
            y2="200"
            stroke="oklch(0.73 0.135 78)"
            strokeWidth="0.9"
            opacity="0.85"
          />
          <line
            x1="406"
            y1="205"
            x2="406"
            y2="200"
            stroke="oklch(0.73 0.135 78)"
            strokeWidth="0.9"
            opacity="0.85"
          />
          <line
            x1="388"
            y1="210"
            x2="383"
            y2="210"
            stroke="oklch(0.73 0.135 78)"
            strokeWidth="0.9"
            opacity="0.85"
          />
          <line
            x1="388"
            y1="215"
            x2="383"
            y2="215"
            stroke="oklch(0.73 0.135 78)"
            strokeWidth="0.9"
            opacity="0.85"
          />
          <line
            x1="412"
            y1="210"
            x2="417"
            y2="210"
            stroke="oklch(0.73 0.135 78)"
            strokeWidth="0.9"
            opacity="0.85"
          />
          <line
            x1="412"
            y1="215"
            x2="417"
            y2="215"
            stroke="oklch(0.73 0.135 78)"
            strokeWidth="0.9"
            opacity="0.85"
          />
        </g>

        {/* ④ Root veins — lower bio half (clipped) */}
        <g clipPath="url(#eco-hclip)" opacity="0.88">
          <path
            d="M 400,287 C 400,271 400,257 400,243"
            stroke="oklch(0.58 0.165 148)"
            strokeWidth="2.2"
            opacity="0.78"
          />
          <path
            d="M 400,270 C 387,258 371,254 356,248"
            stroke="oklch(0.66 0.150 150)"
            strokeWidth="1.7"
            opacity="0.75"
          />
          <path
            d="M 400,270 C 413,258 429,254 444,248"
            stroke="oklch(0.66 0.150 150)"
            strokeWidth="1.7"
            opacity="0.75"
          />
          <path
            d="M 356,248 C 348,243 342,238 337,234"
            stroke="oklch(0.66 0.150 150)"
            strokeWidth="1.1"
            opacity="0.62"
          />
          <path
            d="M 356,248 C 351,242 348,237 345,231"
            stroke="oklch(0.66 0.150 150)"
            strokeWidth="1.1"
            opacity="0.58"
          />
          <path
            d="M 444,248 C 452,243 458,238 463,234"
            stroke="oklch(0.66 0.150 150)"
            strokeWidth="1.1"
            opacity="0.62"
          />
          <path
            d="M 444,248 C 449,242 452,237 455,231"
            stroke="oklch(0.66 0.150 150)"
            strokeWidth="1.1"
            opacity="0.58"
          />
          {/* Micro root tendrils */}
          <path
            d="M 337,234 C 331,229 326,226 322,224"
            stroke="oklch(0.66 0.150 150)"
            strokeWidth="0.7"
            opacity="0.42"
          />
          <path
            d="M 463,234 C 469,229 474,226 478,224"
            stroke="oklch(0.66 0.150 150)"
            strokeWidth="0.7"
            opacity="0.42"
          />
          {/* Branch-tip nodes */}
          <circle cx="337" cy="234" r="3.0" fill="oklch(0.66 0.150 150)" opacity="0.80" />
          <circle cx="345" cy="231" r="2.2" fill="oklch(0.66 0.150 150)" opacity="0.72" />
          <circle cx="463" cy="234" r="3.0" fill="oklch(0.66 0.150 150)" opacity="0.80" />
          <circle cx="455" cy="231" r="2.2" fill="oklch(0.66 0.150 150)" opacity="0.72" />
          {/* Gold humic nutrient particles */}
          <circle cx="367" cy="276" r="2.0" fill="oklch(0.73 0.135 78)" opacity="0.62" />
          <circle cx="384" cy="281" r="1.6" fill="oklch(0.73 0.135 78)" opacity="0.55" />
          <circle cx="416" cy="281" r="1.6" fill="oklch(0.73 0.135 78)" opacity="0.55" />
          <circle cx="433" cy="276" r="2.0" fill="oklch(0.73 0.135 78)" opacity="0.62" />
          <circle cx="400" cy="283" r="1.4" fill="oklch(0.73 0.135 78)" opacity="0.50" />
        </g>

        {/* ⑤ Heart outline — bright stroke with glow */}
        <path
          d={H}
          stroke="oklch(0.58 0.165 148)"
          strokeWidth="0.6"
          fill="none"
          opacity="0.30"
          filter="url(#eco-glow)"
        />
        <path d={H} stroke="oklch(0.72 0.175 148)" strokeWidth="1.8" fill="none" opacity="0.92" />

        {/* ⑥ Particle dots along heart outline */}
        {heartDots.map((d) => (
          <circle
            key={`hd-${d.x}-${d.y}`}
            cx={d.x}
            cy={d.y}
            r="2.2"
            fill="white"
            opacity="0.88"
            filter="url(#eco-dot-glow)"
            className="eco-node-glow"
          />
        ))}
        {/* Accent particles — bigger at key positions */}
        <circle
          cx="400"
          cy="210"
          r="3.2"
          fill="oklch(0.73 0.135 78)"
          opacity="0.95"
          filter="url(#eco-dot-glow)"
        />
        <circle
          cx="400"
          cy="290"
          r="3.2"
          fill="oklch(0.64 0.13 195)"
          opacity="0.95"
          filter="url(#eco-dot-glow)"
        />
        <circle
          cx="352"
          cy="186"
          r="2.8"
          fill="oklch(0.66 0.150 150)"
          opacity="0.90"
          filter="url(#eco-dot-glow)"
        />
        <circle
          cx="448"
          cy="186"
          r="2.8"
          fill="oklch(0.66 0.150 150)"
          opacity="0.90"
          filter="url(#eco-dot-glow)"
        />

        {/* ⑦ Inner scatter dots */}
        {innerDots.map((d) => (
          <circle
            key={`id-${d.x}-${d.y}`}
            cx={d.x}
            cy={d.y}
            r={d.s}
            fill="oklch(0.78 0.160 148)"
            opacity={d.o}
          />
        ))}

        {/* ⑧ Binary code text in upper half */}
        {binaryBits.map((b) => (
          <text
            key={`bb-${b.x}-${b.y}`}
            x={b.x}
            y={b.y}
            textAnchor="middle"
            fontSize="5.5"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="700"
            fill="oklch(0.58 0.165 148)"
            opacity="0.60"
            letterSpacing="0"
          >
            {b.v}
          </text>
        ))}

        {/* ⑨ Glow core — the AI↔Soil junction point */}
        <circle
          cx="400"
          cy="234"
          r="22"
          fill="oklch(0.73 0.135 78)"
          opacity="0.12"
          filter="url(#eco-bloom)"
        />
        <circle
          cx="400"
          cy="234"
          r="8"
          fill="oklch(0.73 0.135 78)"
          opacity="0.30"
          filter="url(#eco-glow)"
        />
        <circle cx="400" cy="234" r="4" fill="oklch(0.73 0.135 78)" opacity="0.72" />
        <circle cx="400" cy="234" r="1.8" fill="white" opacity="0.95" />
      </g>

      {/* ── 4 orbital ecosystem nodes ── */}
      {nodes.map((n) => (
        <g key={n.cat} filter="url(#eco-nglow)">
          <circle
            cx={n.cx}
            cy={n.cy}
            r="42"
            fill="none"
            stroke={n.color}
            strokeWidth="0.75"
            opacity="0.28"
            className="eco-node-glow"
          />
          <circle
            cx={n.cx}
            cy={n.cy}
            r="34"
            fill={n.bg}
            stroke={n.color}
            strokeWidth="1.8"
            opacity="0.96"
          />
          <text
            x={n.cx}
            y={n.cy + 5}
            textAnchor="middle"
            fontSize="15"
            fontFamily="'JetBrains Mono', 'Fira Code', monospace"
            fontWeight="600"
            fill={n.color}
            letterSpacing="0.04em"
          >
            {n.sym}
          </text>
          <text
            x={n.cx}
            y={n.cy + 54}
            textAnchor="middle"
            fontSize="8.5"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="700"
            fill={n.color}
            letterSpacing="0.10em"
            opacity="0.95"
          >
            {n.cat}
          </text>
          <text
            x={n.cx}
            y={n.cy + 66}
            textAnchor="middle"
            fontSize="7.5"
            fontFamily="monospace"
            fill="oklch(0.58 0.022 148)"
          >
            {n.sub}
          </text>
          <text
            x={n.cx}
            y={n.cy + 78}
            textAnchor="middle"
            fontSize="7"
            fontFamily="monospace"
            fill="oklch(0.42 0.016 148)"
          >
            {n.count} produtos
          </text>
        </g>
      ))}

      {/* ── Center label ── */}
      <text
        x="400"
        y="318"
        textAnchor="middle"
        fontSize="9"
        fontFamily="'JetBrains Mono', monospace"
        fontWeight="700"
        fill="oklch(0.68 0.165 148)"
        letterSpacing="0.14em"
        opacity="0.88"
      >
        AGRICULTURA 7.0
      </text>
      <text
        x="400"
        y="330"
        textAnchor="middle"
        fontSize="7.5"
        fontFamily="monospace"
        fill="oklch(0.48 0.018 148)"
        letterSpacing="0.06em"
      >
        IA · FISIOLOGIA · SOLO
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
