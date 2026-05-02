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
      'Consórcios microbianos de alta viabilidade — Trichoderma, Bacillus spp. — para controle biológico, solubilização de nutrientes e promoção de crescimento.',
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
    slug: 'grow-filling',
    name: 'Grow Filling',
    category: 'fertilizantes-minerais',
    tagline: 'Fertilizante potássico concentrado para enchimento de grãos',
    description:
      'Fertilizante mineral misto sólido de alta concentração em potássio (K₂O 35%) com sacarídeos e aminoácidos. Formulado para atender a demanda intensiva de K na fase de enchimento de grãos em soja, milho, trigo e outras culturas.',
    physicalState: 'sólido',
    originCountry: 'Espanha',
    productType: 'Fertilizante Mineral Misto',
    registrationMapa: 'PR 002049-4.000003',
    applicationModes: ['Via Foliar', 'Via Fertirrigação'],
    composition: { macros: { N: 2.0, K2O: 35.0 } },
    packaging: [
      { type: 'bag', weightKg: 1, sku: 'GROW-FILLING-1KG' },
      { type: 'bag', weightKg: 5, sku: 'GROW-FILLING-5KG' },
    ],
    applications: [
      {
        crop: 'Soja',
        stage: 'R3–R5 (enchimento de grãos)',
        dosePerHa: 500,
        unit: 'g',
        notes: 'Combinar com Xcensis ("dupla final") para máxima eficiência.',
      },
      {
        crop: 'Milho',
        stage: 'R2–R4',
        dosePerHa: 600,
        unit: 'g',
        notes: 'Aplicar antes das 9h ou após as 17h.',
      },
      {
        crop: 'Trigo',
        stage: 'Espigamento',
        dosePerHa: 400,
        unit: 'g',
        notes: 'Dissolver em 200 L de água por hectare.',
      },
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
    slug: 'algen',
    name: 'Algen',
    category: 'fertilizantes-minerais',
    tagline: 'Extrato de algas com fósforo e potássio para enraizamento e florescimento',
    description:
      'Fertilizante mineral misto fluido com extrato de algas marinhas, fósforo e potássio. Os polissacarídeos e betaínas do extrato de algas estimulam o desenvolvimento radicular e o florescimento, especialmente em condições de estresse hídrico ou térmico.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Fertilizante Mineral Misto',
    registrationMapa: 'PR 002049-4.000002',
    applicationModes: ['Via Foliar', 'Via Fertirrigação'],
    composition: { macros: { P2O5: 3.0, K2O: 3.0 } },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'ALGEN-1L' },
      { type: 'drum', volumeL: 20, sku: 'ALGEN-20L' },
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
  {
    slug: 'grow-sulfur',
    name: 'Grow Sulfur',
    category: 'fertilizantes-minerais',
    tagline: 'Enxofre e nitrogênio em solução para manutenção nutricional',
    description:
      'Fertilizante mineral misto fluido com enxofre e nitrogênio. O enxofre é constituinte de aminoácidos (cisteína, metionina) e vitaminas, essencial para formação de proteínas e atividade enzimática. Indicado para culturas com alta demanda em S como canola, brássicas e cana-de-açúcar.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Fertilizante Mineral Misto',
    registrationMapa: 'PR 002049-4.000008',
    applicationModes: ['Via Foliar', 'Via Fertirrigação'],
    composition: { macros: { N: 5.0 }, others: { S: 8.0 } },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'GROW-SULFUR-1L' },
      { type: 'drum', volumeL: 20, sku: 'GROW-SULFUR-20L' },
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
  {
    slug: 'grow-nitro-p',
    name: 'Grow Nitro P',
    category: 'organominerais',
    tagline: 'Organomineral nitrogenado concentrado com vinhaça e substâncias húmicas',
    description:
      'Fertilizante organomineral fluido com alto teor de nitrogênio (8%), vinhaça concentrada e ácidos húmicos e fúlvicos. Fornece N de liberação controlada pela matéria orgânica, reduzindo perdas por lixiviação e volatilização em solos tropicais.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Fertilizante Organomineral Simples',
    applicationModes: ['Via Fertirrigação', 'Via Solo'],
    composition: { macros: { N: 8.0 }, others: { 'M.O.': 10.0, 'Ác. Fúlvicos': 1.5 } },
    packaging: [{ type: 'drum', volumeL: 20, sku: 'GROW-NITRO-P-20L' }],
  },
  {
    slug: 'up-soil',
    name: 'Up Soil',
    category: 'organominerais',
    tagline: 'Condicionador de solo organomineral via fertirrigação',
    description:
      'Condicionador de solo organomineral com substâncias húmicas de leonardita, ácidos fúlvicos e silício. Melhora a estrutura do solo, aumenta a retenção hídrica e a CTC, e estimula a atividade biológica — especialmente em solos compactados ou degradados por uso intensivo.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Condicionador de Solo',
    applicationModes: ['Via Fertirrigação', 'Via Solo'],
    composition: { others: { 'Ác. Húmicos': 6.0, 'Ác. Fúlvicos': 3.0, Si: 1.0 } },
    packaging: [{ type: 'drum', volumeL: 20, sku: 'UP-SOIL-20L' }],
  },

  // BIOLÓGICOS
  {
    slug: 'troian',
    name: 'Troian',
    category: 'biologicos',
    tagline: 'Trichoderma + Bacillus multicepa para controle biológico e promoção de crescimento',
    description:
      'Bioinsumo com consórcio de Trichoderma harzianum e Bacillus subtilis de alta viabilidade celular. Atua no controle biológico de fitopatógenos radiculares (Fusarium, Rhizoctonia, Sclerotinia) e na promoção de crescimento via produção de auxinas, citocininas e solubilização de fosfato.',
    physicalState: 'pó',
    originCountry: 'Brasil',
    productType: 'Bioinsumo',
    applicationModes: ['Via Solo', 'Via Fertirrigação'],
    composition: { others: { 'Trichoderma harzianum': 1e8, 'Bacillus subtilis': 1e8 } },
    packaging: [
      { type: 'bag', weightKg: 0.5, sku: 'TROIAN-500G' },
      { type: 'bag', weightKg: 1, sku: 'TROIAN-1KG' },
    ],
  },
  {
    slug: 'biovas',
    name: 'Biovas',
    category: 'biologicos',
    tagline: 'Consórcio de 5 espécies de Bacillus para máxima atividade biológica',
    description:
      'Bioinsumo com consórcio de 5 espécies de Bacillus (B. subtilis, B. licheniformis, B. amyloliquefaciens, B. pumilus, B. megaterium) selecionadas para ação sinérgica. Produz antibióticos naturais, enzimas quitinolíticas e lipopeptídeos que controlam patógenos e estimulam o crescimento radicular.',
    physicalState: 'pó',
    originCountry: 'Brasil',
    productType: 'Bioinsumo',
    applicationModes: ['Via Solo', 'Via Fertirrigação'],
    composition: { others: { 'Consórcio Bacillus spp.': 2e8 } },
    packaging: [
      { type: 'bag', weightKg: 0.5, sku: 'BIOVAS-500G' },
      { type: 'bag', weightKg: 1, sku: 'BIOVAS-1KG' },
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
