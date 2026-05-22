// apps/website/src/lib/products.ts
// Dados estáticos do portfólio Argho — espelhado do seed Colheita.
// Fonte de verdade: packages/db/src/scripts/seed.ts + Certificados MAPA.

export type ProductCategory =
  | 'fertilizantes-minerais'
  | 'organominerais'
  | 'biologicos'
  | 'adjuvantes';

export type ApplicationMode = 'Via Foliar' | 'Via Fertirrigação' | 'Via Solo';

export interface ProductComposition {
  macros?: Record<string, number>;
  micros?: Record<string, number>;
  others?: Record<string, number>;
}

export interface ProductApplication {
  crop: string;
  stage: string;
  dosePerHa: number;
  unit: string;
  notes?: string;
}

export interface ProductPackaging {
  type: 'bag' | 'bottle' | 'drum' | 'box';
  weightKg?: number;
  volumeL?: number;
  sku: string;
}

export interface Product {
  slug: string;
  name: string;
  category: ProductCategory;
  tagline: string;
  description: string;
  physicalState: 'sólido' | 'fluido' | 'pó';
  originCountry: string;
  productType: string;
  registrationMapa?: string;
  applicationModes: ApplicationMode[];
  composition: ProductComposition;
  packaging: ProductPackaging[];
  applications?: ProductApplication[];
  /**
   * Diferenciais técnicos da composição (NÃO inclui claim de uso ou eficácia).
   * Usado em produtos da linha biológica enquadrados como "Complexo microbiológico":
   * foca em composição declarada + formulação + padrão de qualidade, sem
   * destinação de uso. Conformidade MAPA — ver doc apps/website/docs/biologicos-compliance.md
   */
  technicalDifferentials?: string[];
  featured?: boolean;
}

// ─── Categorias ──────────────────────────────────────────────────────────────

export const CATEGORIES: Record<ProductCategory, { label: string; description: string }> = {
  'fertilizantes-minerais': {
    label: 'Fertilizantes Minerais',
    description:
      'Soluções minerais de alta concentração para nutrição foliar e fertirrigação — micronutrientes quelados, macros e complexos específicos por fase fenológica.',
  },
  organominerais: {
    label: 'Organominerais',
    description:
      'A sinergia entre a matéria orgânica e os minerais: vinhaça, substâncias húmicas, aminoácidos e torta vegetal potencializando a vida do solo e a absorção radicular.',
  },
  biologicos: {
    label: 'Biológicos',
    description:
      'Complexos microbiológicos de alta complexidade — consórcios multi-espécie de Bacillus, Trichoderma e fungos filamentosos formulados na linha de biotecnologias Argho com foco em diversidade microbiana, estabilidade de formulação e precisão técnica na composição declarada.',
  },
  adjuvantes: {
    label: 'Adjuvantes',
    description:
      'A família Operate: espalhantes adesivos premium com óleos essenciais, condicionamento de pH e ação antideriva para potencializar a eficiência de qualquer calda.',
  },
};

// ─── Portfólio ───────────────────────────────────────────────────────────────

export const PRODUCTS: Product[] = [
  // FERTILIZANTES MINERAIS
  {
    slug: 'xcensis',
    name: 'Xcensis',
    category: 'fertilizantes-minerais',
    tagline: 'Multi-micronutriente foliar com EDTA e Lignossulfonatos',
    description:
      'Fertilizante mineral misto de alta concentração em micronutrientes, complexados com EDTA e Lignossulfonatos para máxima absorção foliar e por fertirrigação. Formulação europeia com pH controlado, compatível com biológicos. Indicado para banana, café, milho irrigado, soja, HF e outras culturas exigentes em micronutrientes.',
    physicalState: 'sólido',
    originCountry: 'Espanha',
    productType: 'Fertilizante Mineral Misto',
    registrationMapa: 'PR 002049-4.000006',
    applicationModes: ['Via Foliar', 'Via Fertirrigação'],
    composition: {
      micros: { Fe: 7.0, Mn: 3.5, Zn: 0.8, B: 0.7, Cu: 0.4, Mo: 0.3 },
      macros: { K2O: 4.0 },
    },
    packaging: [
      { type: 'bag', weightKg: 1, sku: 'XCENSIS-1KG' },
      { type: 'bag', weightKg: 5, sku: 'XCENSIS-5KG' },
    ],
    applications: [
      {
        crop: 'Soja',
        stage: 'V3–V5',
        dosePerHa: 500,
        unit: 'g',
        notes: 'Aplicar com Operate Plus. Compatível com biológicos.',
      },
      {
        crop: 'Milho',
        stage: 'V4–V6',
        dosePerHa: 600,
        unit: 'g',
        notes: 'Pode ser misturado com herbicidas pós-emergentes.',
      },
      {
        crop: 'Café',
        stage: 'Florescimento e enchimento de grãos',
        dosePerHa: 400,
        unit: 'g',
        notes: 'Repetir a cada 30 dias em períodos críticos.',
      },
      {
        crop: 'Banana',
        stage: 'Produção mensal',
        dosePerHa: 300,
        unit: 'g',
        notes: 'Via fertirrigação: diluir 1 kg em 200 L.',
      },
      {
        crop: 'Tomate',
        stage: 'Florescimento ao início de maturação',
        dosePerHa: 500,
        unit: 'g',
        notes: 'Evitar aplicação em horas de maior insolação.',
      },
    ],
    featured: true,
  },
  {
    slug: 'stron',
    name: 'Stron',
    category: 'fertilizantes-minerais',
    tagline: 'Fertilizante NPK foliar com aminoácidos e ácidos carboxílicos',
    description:
      'Fertilizante mineral misto fluido com nitrogênio, fósforo e potássio em formulação foliar de alta eficiência. Enriquecido com aminoácidos e ácidos carboxílicos que potencializam a absorção e o metabolismo da planta. Indicado em fases de intensa demanda nutricional.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Fertilizante Mineral Misto',
    registrationMapa: 'PR 002049-4.000014',
    applicationModes: ['Via Foliar'],
    composition: { macros: { N: 4.5, P2O5: 2.0, K2O: 7.2 } },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'STRON-1L' },
      { type: 'drum', volumeL: 20, sku: 'STRON-20L' },
    ],
  },
  {
    slug: 'grow-calcium',
    name: 'Grow Calcium',
    category: 'fertilizantes-minerais',
    tagline: 'Cálcio-nitrogenado com substâncias húmicas e aminoácidos',
    description:
      'Fertilizante mineral simples em solução com cálcio e nitrogênio, enriquecido com substâncias húmicas e aminoácidos. Indicado para prevenção de distúrbios fisiológicos relacionados à deficiência de Ca em frutas e hortaliças.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Fertilizante Mineral Simples em Solução',
    registrationMapa: 'PR 002049-4.000004',
    applicationModes: ['Via Foliar', 'Via Fertirrigação'],
    composition: { macros: { N: 1.4, Ca: 1.6 } },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'GROW-CALCIUM-1L' },
      { type: 'drum', volumeL: 20, sku: 'GROW-CALCIUM-20L' },
    ],
  },
  {
    slug: 'defon',
    name: 'Defon',
    category: 'fertilizantes-minerais',
    tagline: 'Cobre complexado com ácido glucônico de alta absorção',
    description:
      'Fertilizante mineral simples em solução com cobre (2,4%) complexado por ácido glucônico — alta solubilidade, estabilidade em calda e absorção foliar superior ao sulfato de cobre convencional.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Fertilizante Mineral Simples em Solução',
    registrationMapa: 'PR 002049-4.000001',
    applicationModes: ['Via Foliar', 'Via Fertirrigação'],
    composition: { micros: { Cu: 2.4 }, others: { S: 1.1 } },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'DEFON-1L' },
      { type: 'drum', volumeL: 5, sku: 'DEFON-5L' },
    ],
  },
  {
    slug: 'grow-mob',
    name: 'Grow Mob',
    category: 'fertilizantes-minerais',
    tagline: 'Fósforo, boro e molibdênio para fixação biológica e florescimento',
    description:
      'Fertilizante mineral misto fluido com fósforo, boro e molibdênio em formulação sinérgica. O molibdênio é cofator da nitrogenase (fixação biológica de N) e da nitrato redutase, enquanto o boro suporta o transporte de açúcares e o desenvolvimento do pólen.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Fertilizante Mineral Misto',
    registrationMapa: 'PR 002049-4.000007',
    applicationModes: ['Via Foliar', 'Via Fertirrigação'],
    composition: { macros: { P2O5: 5.0 }, micros: { B: 1.5, Mo: 0.5 } },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'GROW-MOB-1L' },
      { type: 'drum', volumeL: 20, sku: 'GROW-MOB-20L' },
    ],
  },

  // ORGANOMINERAIS
  {
    slug: 'impuch',
    name: 'Impuch',
    category: 'organominerais',
    tagline: 'Organomineral com vinhaça, substâncias húmicas e aminoácidos',
    description:
      'Fertilizante organomineral fluido produzido com vinhaça fermentada, substâncias húmicas e aminoácidos de origem vegetal. Melhora a CTC do solo, estimula a microbiota benéfica e potencializa a disponibilidade de nutrientes via fertirrigação.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Fertilizante Organomineral Simples',
    applicationModes: ['Via Fertirrigação', 'Via Solo'],
    composition: { macros: { K2O: 2.5 }, others: { 'M.O.': 8.0, 'Ác. Húmicos': 2.0 } },
    packaging: [{ type: 'drum', volumeL: 20, sku: 'IMPUCH-20L' }],
  },
  {
    slug: 'life-on',
    name: 'Life On',
    category: 'organominerais',
    tagline: 'Bioestimulante organomineral com torta vegetal e glicerina',
    description:
      'Fertilizante organomineral fluido com torta de mamona hidrolisada, glicerina vegetal e micronutrientes. Combina o efeito bioestimulante da torta com o fornecimento mineral balanceado, promovendo desenvolvimento radicular e resistência ao estresse abiótico.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Fertilizante Organomineral Misto',
    applicationModes: ['Via Fertirrigação', 'Via Solo'],
    composition: { macros: { N: 2.0, K2O: 1.5 }, others: { 'M.O.': 12.0 } },
    packaging: [{ type: 'drum', volumeL: 20, sku: 'LIFE-ON-20L' }],
  },

  // BIOLÓGICOS — Complexos microbiológicos
  // Os produtos desta seção seguem o modelo "datasheet de composição":
  // descrevem a formulação microbiológica declarada, a complexidade do
  // consórcio e o padrão Argho de qualidade, sem destinação de uso, modo
  // de aplicação ou claim de eficácia. Ver doc apps/website/docs/biologicos-compliance.md.
  {
    slug: 'troian',
    name: 'Troian',
    category: 'biologicos',
    tagline: 'Complexo microbiológico fungo + bactéria (Trichoderma + Bacillus)',
    description:
      'Troian combina um fungo filamentoso e uma bactéria do solo em uma formulação biotecnológica de composição declarada: Trichoderma harzianum e Bacillus subtilis. Desenvolvido dentro da linha de biotecnologias da Argho Agrosciences, o Troian se destaca pela combinação de um agente fúngico com um agente bacteriano em uma única matriz microbiológica, oferecendo uma composição robusta, tecnicamente diferenciada e alinhada ao avanço dos consórcios microbiológicos mistos. A presença simultânea de dois grupos microbianos distintos confere ao produto uma identidade biológica singular dentro do portfólio Argho, valorizando diversidade microbiana, estabilidade de formulação e precisão técnica na composição declarada.',
    physicalState: 'pó',
    originCountry: 'Brasil',
    productType: 'Complexo microbiológico',
    applicationModes: [],
    composition: { others: { 'Trichoderma harzianum': 1e8, 'Bacillus subtilis': 1e8 } },
    packaging: [
      { type: 'bag', weightKg: 0.5, sku: 'TROIAN-500G' },
      { type: 'bag', weightKg: 1, sku: 'TROIAN-1KG' },
    ],
    technicalDifferentials: [
      'Complexo microbiológico fungo + bactéria',
      'Formulação biotecnológica de composição declarada',
      'Composição com duas espécies de grupos microbianos distintos',
      'Tecnologia biológica desenvolvida para sistemas técnicos controlados',
      'Padrão Argho de qualidade, rastreabilidade e formulação',
    ],
  },
  {
    slug: 'biovas',
    name: 'Biovas',
    category: 'biologicos',
    tagline: 'Complexo microbiológico multi-Bacillus',
    description:
      'Biovas reúne cinco espécies do gênero Bacillus em uma formulação biotecnológica de alta complexidade microbiológica: Bacillus subtilis, Bacillus amyloliquefaciens, Bacillus licheniformis, Bacillus aryabhattai e Bacillus megaterium. Desenvolvido dentro da linha de biotecnologias da Argho Agrosciences, o Biovas se destaca pela combinação de diferentes espécies bacterianas em uma única matriz microbiológica, oferecendo uma composição robusta, tecnicamente diferenciada e alinhada ao avanço dos bioinsumos de base microbiana. A presença de múltiplas espécies de Bacillus confere ao produto uma identidade biológica singular dentro do portfólio Argho, valorizando diversidade microbiana, estabilidade de formulação e precisão técnica na composição declarada.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Complexo microbiológico',
    applicationModes: [],
    composition: {
      others: {
        'Bacillus subtilis': 1,
        'Bacillus amyloliquefaciens': 1,
        'Bacillus licheniformis': 1,
        'Bacillus aryabhattai': 1,
        'Bacillus megaterium': 1,
      },
    },
    packaging: [{ type: 'bottle', volumeL: 1, sku: 'BIOVAS-1L' }],
    technicalDifferentials: [
      'Complexo multi-Bacillus',
      'Formulação microbiológica de alta complexidade',
      'Composição com cinco espécies bacterianas declaradas',
      'Tecnologia biológica desenvolvida para sistemas técnicos controlados',
      'Padrão Argho de qualidade, rastreabilidade e formulação',
    ],
  },
  {
    slug: 'bovex',
    name: 'Bovex',
    category: 'biologicos',
    tagline: 'Complexo biológico multi-gênero fúngico',
    description:
      'Bovex reúne três gêneros distintos de fungos em uma formulação biotecnológica de alta complexidade microbiológica: Beauveria bassiana, Metarhizium spp. e Cordyceps spp. Desenvolvido dentro da linha de biotecnologias da Argho Agrosciences, o Bovex se destaca pela combinação de três gêneros fúngicos diferentes em uma única matriz biológica, oferecendo uma composição robusta, tecnicamente diferenciada e alinhada ao avanço dos consórcios microbiológicos de base fúngica. A presença simultânea de gêneros fúngicos múltiplos confere ao produto uma identidade biológica singular dentro do portfólio Argho, valorizando diversidade microbiana, estabilidade de formulação e precisão técnica na composição declarada.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Complexo microbiológico',
    applicationModes: [],
    composition: {
      others: { 'Beauveria bassiana': 1, 'Metarhizium spp.': 1, 'Cordyceps spp.': 1 },
    },
    packaging: [{ type: 'bottle', volumeL: 1, sku: 'BOVEX-1L' }],
    technicalDifferentials: [
      'Complexo multi-gênero fúngico',
      'Formulação microbiológica de alta complexidade',
      'Composição com três gêneros fúngicos declarados',
      'Tecnologia biológica desenvolvida para sistemas técnicos controlados',
      'Padrão Argho de qualidade, rastreabilidade e formulação',
    ],
  },
  {
    slug: 'controx',
    name: 'Controx',
    category: 'biologicos',
    tagline: 'Complexo microbiológico multivariante de Bacillus thuringiensis',
    description:
      'Controx reúne duas variedades distintas de Bacillus thuringiensis em uma formulação biotecnológica de alta complexidade microbiológica: Bacillus thuringiensis var. kurstaki e Bacillus thuringiensis var. israelensis. Desenvolvido dentro da linha de biotecnologias da Argho Agrosciences, o Controx se destaca pela combinação de duas variedades distintas dentro da mesma espécie em uma única matriz microbiológica, oferecendo uma composição robusta, tecnicamente diferenciada e alinhada ao avanço dos consórcios microbiológicos multivariantes. A presença simultânea das variedades kurstaki e israelensis confere ao produto uma identidade biológica singular dentro do portfólio Argho, valorizando diversidade intra-específica, estabilidade de formulação e precisão técnica na composição declarada.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Complexo microbiológico',
    applicationModes: [],
    composition: {
      others: {
        'Bacillus thuringiensis var. kurstaki': 1,
        'Bacillus thuringiensis var. israelensis': 1,
      },
    },
    packaging: [{ type: 'bottle', volumeL: 1, sku: 'CONTROX-1L' }],
    technicalDifferentials: [
      'Complexo microbiológico multivariante',
      'Formulação microbiológica de alta complexidade',
      'Composição com duas variedades de B. thuringiensis declaradas',
      'Tecnologia biológica desenvolvida para sistemas técnicos controlados',
      'Padrão Argho de qualidade, rastreabilidade e formulação',
    ],
  },
  {
    slug: 'nemax',
    name: 'Nemax',
    category: 'biologicos',
    tagline: 'Complexo microbiológico multi-gênero de fungos filamentosos',
    description:
      'Nemax reúne três espécies de fungos filamentosos em uma formulação biotecnológica de alta complexidade microbiológica: Trichoderma harzianum, Trichoderma asperellum e Purpureocillium lilacinum. Desenvolvido dentro da linha de biotecnologias da Argho Agrosciences, o Nemax se destaca pela combinação de três espécies de fungos filamentosos em uma única matriz microbiológica, oferecendo uma composição robusta, tecnicamente diferenciada e alinhada ao avanço dos consórcios microbiológicos de base fúngica. A presença simultânea de duas espécies do gênero Trichoderma com Purpureocillium lilacinum confere ao produto uma identidade biológica singular dentro do portfólio Argho, valorizando diversidade microbiana, estabilidade de formulação e precisão técnica na composição declarada.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Complexo microbiológico',
    applicationModes: [],
    composition: {
      others: {
        'Trichoderma harzianum': 1,
        'Trichoderma asperellum': 1,
        'Purpureocillium lilacinum': 1,
      },
    },
    packaging: [{ type: 'bottle', volumeL: 1, sku: 'NEMAX-1L' }],
    technicalDifferentials: [
      'Complexo multi-gênero fúngico',
      'Formulação microbiológica de alta complexidade',
      'Composição com três espécies fúngicas declaradas',
      'Tecnologia biológica desenvolvida para sistemas técnicos controlados',
      'Padrão Argho de qualidade, rastreabilidade e formulação',
    ],
  },

  // ADJUVANTES
  {
    slug: 'operate-plus',
    name: 'Operate Plus',
    category: 'adjuvantes',
    tagline: 'Adjuvante espalhante adesivo premium com condicionador de pH',
    description:
      'Adjuvante espalhante adesivo de última geração com surfactante não-iônico de baixa tensão superficial, condicionador de pH (buffer ácido para 4,5–5,5) e agente antiespumante. Garante cobertura foliar uniforme, aderência superior e proteção contra hidrólise alcalina de agroquímicos.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Adjuvante Espalhante Adesivo',
    applicationModes: ['Via Foliar'],
    composition: {},
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'OPERATE-PLUS-1L' },
      { type: 'drum', volumeL: 20, sku: 'OPERATE-PLUS-20L' },
    ],
  },
  {
    slug: 'operate-citronela',
    name: 'Operate Citronela',
    category: 'adjuvantes',
    tagline: 'Adjuvante espalhante com óleo essencial de citronela',
    description:
      'Adjuvante espalhante adesivo formulado com óleo essencial de citronela (Cymbopogon nardus). Além da função de espalhante, o óleo essencial atua como repelente de insetos na calda, agregando efeito antipraga sem resistência. Aroma característico marca a passagem da aplicação.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Adjuvante Espalhante Adesivo',
    applicationModes: ['Via Foliar'],
    composition: {},
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'OPERATE-CIT-1L' },
      { type: 'drum', volumeL: 20, sku: 'OPERATE-CIT-20L' },
    ],
  },
  {
    slug: 'operate-4em1',
    name: 'Operate 4em1',
    category: 'adjuvantes',
    tagline: 'Adjuvante multifuncional: espalhante, adesivo, condicionador e anti-espumante',
    description:
      'O mais completo da família Operate. Combina quatro funções em um único produto: espalhante não-iônico, adesivo polimérico, condicionador de pH e antiespumante de silicone. Reduz o volume de adjuvantes na mochila e simplifica o preparo da calda sem perda de eficiência.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Adjuvante Multifuncional',
    applicationModes: ['Via Foliar'],
    composition: {},
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'OPERATE-4EM1-1L' },
      { type: 'drum', volumeL: 20, sku: 'OPERATE-4EM1-20L' },
    ],
  },
  {
    slug: 'operate-orange',
    name: 'Operate Orange',
    category: 'adjuvantes',
    tagline: 'Adjuvante espalhante com óleo essencial de laranja',
    description:
      'Adjuvante espalhante adesivo com óleo essencial de laranja (Citrus sinensis). O d-Limoneno presente no óleo de laranja potencializa a penetração cuticular de herbicidas e fungicidas sistêmicos, além de exercer ação de choque sobre insetos de corpo mole.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Adjuvante Espalhante Adesivo',
    applicationModes: ['Via Foliar'],
    composition: {},
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'OPERATE-ORANGE-1L' },
      { type: 'drum', volumeL: 20, sku: 'OPERATE-ORANGE-20L' },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getFeaturedProduct(): Product {
  return PRODUCTS.find((p) => p.featured) ?? (PRODUCTS[0] as Product);
}

export function formatComposition(composition: ProductComposition): string {
  const entries: string[] = [];
  if (composition.macros) {
    for (const [k, v] of Object.entries(composition.macros)) {
      entries.push(`${k} ${v}%`);
    }
  }
  if (composition.micros) {
    for (const [k, v] of Object.entries(composition.micros)) {
      entries.push(`${k} ${v}%`);
    }
  }
  return entries.join(' · ');
}
