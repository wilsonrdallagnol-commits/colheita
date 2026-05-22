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
    tagline:
      'Micronutrição funcional de alta densidade com matriz EDTA, lignosulfonatos e sacarídeos',
    description:
      'Fertilizante mineral misto sólido microgranulado com micronutrientes solúveis em água — Fe (7,0%), Mn (3,5%), K2O (4,0%), Zn (0,8%), B (0,7%), Cu (0,4%) e Mo (0,3%) — complexados em matriz com EDTA (9,9%), lignosulfonatos (23,0%) e sacarídeos (10,0%). Posicionamento como ferramenta de micronutrição funcional para janelas de alta exigência metabólica: Fe e Mn sustentam fotossíntese e transporte de elétrons; Zn, B e Mo formam eixo crítico para florescimento, pegamento e enchimento; Cu e Mn participam de cuproenzimas, lignificação e homeostase oxidativa. Compatível com biológicos quando bem posicionada.',
    physicalState: 'sólido',
    originCountry: 'Espanha',
    productType: 'Fertilizante Mineral Misto',
    registrationMapa: 'PR 002049-4.000006',
    applicationModes: ['Via Foliar', 'Via Fertirrigação'],
    composition: {
      micros: { Fe: 7.0, Mn: 3.5, Zn: 0.8, B: 0.7, Cu: 0.4, Mo: 0.3 },
      macros: { K2O: 4.0 },
      others: {
        EDTA: 9.9,
        Lignosulfonatos: 23.0,
        Sacarídeos: 10.0,
      },
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
    tagline: 'Tecnologia de arquitetura produtiva e sinalização fisiológica',
    description:
      'Fertilizante mineral misto fluido foliar para modulação fisiológica, arquitetura produtiva, ramificação, floração e suporte à formação de estruturas reprodutivas. Combina N (4,5%), P2O5 (2,0%) e K2O (7,2%) com aminoácidos (2,0%) e ácidos carboxílicos (4,6%) em matriz alcalina (pH 9,5-11,5) para sinalização fisiológica em janelas de plasticidade morfológica — soja V2-V3, vegetativo de cereais, pré-florada de frutíferas. Não atua como hormônio exógeno: posiciona-se como modulador endógeno de respostas de crescimento.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Fertilizante Mineral Misto',
    registrationMapa: 'PR 002049-4.000014',
    applicationModes: ['Via Foliar'],
    composition: {
      macros: { N: 4.5, P2O5: 2.0, K2O: 7.2 },
      others: { Aminoácidos: 2.0, 'Ácidos carboxílicos': 4.6 },
    },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'STRON-1L' },
      { type: 'drum', volumeL: 5, sku: 'STRON-5L' },
    ],
  },
  {
    slug: 'grow-calcium',
    name: 'Grow Calcium',
    category: 'fertilizantes-minerais',
    tagline: 'Cálcio funcional com matriz orgânica para tecidos firmes e frutos consistentes',
    description:
      'Fertilizante mineral simples em solução à base de cálcio (5,5%) e nitrogênio (4,8%), com aminoácidos (4,6%) e substâncias húmicas (4,0%), para suporte à integridade de tecidos, firmeza e qualidade pós-colheita. Posicionamento preventivo: fornecer Ca a tecidos em formação, fortalecer parede celular e membranas, reduzir distúrbios fisiológicos ligados à deficiência localizada (rachaduras, necrose apical, tip burn) e melhorar consistência e vida pós-colheita de frutos e hortaliças.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Fertilizante Mineral Simples em Solução',
    registrationMapa: 'PR 002049-4.000004',
    applicationModes: ['Via Foliar', 'Via Fertirrigação'],
    composition: {
      macros: { Ca: 5.5, N: 4.8 },
      others: { Aminoácidos: 4.6, 'Substâncias húmicas': 4.0 },
    },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'GROW-CALCIUM-1L' },
      { type: 'drum', volumeL: 5, sku: 'GROW-CALCIUM-5L' },
    ],
  },
  {
    slug: 'defon',
    name: 'Defon',
    category: 'fertilizantes-minerais',
    tagline: 'Cobre funcional complexado por ácido glucônico para defesa estrutural',
    description:
      'Fertilizante mineral simples em solução à base de cobre (5,5%) e enxofre (2,5%), com agente complexante ácido glucônico (10,0%), para correção nutricional e suporte à defesa estrutural da planta. Posicionado como tecnologia de cobre funcional — não como cobre de choque: dose fisiológica, lignificação, integridade de tecidos e resposta preventiva em momentos de maior risco fisiológico e sanitário. Eixo técnico: nutrição cúprica + complexação orgânica + lignificação + defesa estrutural.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Fertilizante Mineral Simples em Solução',
    registrationMapa: 'PR 002049-4.000001',
    applicationModes: ['Via Foliar', 'Via Fertirrigação'],
    composition: {
      micros: { Cu: 5.5 },
      others: { S: 2.5, 'Ácido glucônico': 10.0 },
    },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'DEFON-1L' },
      { type: 'drum', volumeL: 5, sku: 'DEFON-5L' },
    ],
  },
  {
    slug: 'grow-mob',
    name: 'Grow MoB+',
    category: 'fertilizantes-minerais',
    tagline: 'Tecnologia B + Mo para florada, fertilidade do pólen e metabolismo do nitrogênio',
    description:
      'Fertilizante mineral misto sólido microgranulado à base de molibdênio (7,0%), boro (8,0%), pentóxido de fósforo (24,0%) e nitrogênio (4,5%), com dióxido de silício (1,6%), para suporte à floração, fertilidade floral, metabolismo do nitrogênio e pegamento inicial. O boro atua em parede celular, integridade de membranas, crescimento do tubo polínico e dinâmica de açúcares; o molibdênio participa de enzimas-chave da redução de nitrato e da fixação biológica de nitrogênio em leguminosas. Aplicação preventiva, antes ou no início da fase reprodutiva.',
    physicalState: 'sólido',
    originCountry: 'Espanha',
    productType: 'Fertilizante Mineral Misto',
    registrationMapa: 'PR 002049-4.000005',
    applicationModes: ['Via Foliar', 'Via Fertirrigação'],
    composition: {
      macros: { N: 4.5, P2O5: 24.0 },
      micros: { B: 8.0, Mo: 7.0 },
      others: { 'Dióxido de silício': 1.6 },
    },
    packaging: [
      { type: 'bag', weightKg: 1, sku: 'GROW-MOB-1KG' },
      { type: 'bag', weightKg: 5, sku: 'GROW-MOB-5KG' },
    ],
  },

  // ORGANOMINERAIS
  {
    slug: 'impuch',
    name: 'Impuch',
    category: 'organominerais',
    tagline: 'Tecnologia antiestresse para preservar metabolismo em janelas críticas',
    description:
      'Fertilizante orgânico organomineral Classe A foliar com nitrogênio (5,0%), óxido de potássio (2,0%), carbono orgânico (11,0%), aminoácidos (8,7%), substâncias húmicas (15,0%) e óleo vegetal (0,7%). Posicionamento como estabilizador fisiológico e antiestresse — especialmente em calor, seca, DPV elevado, florada, pegamento e recuperação vegetativa. Matriz com vinhaça, acetato de amônio e formiato de potássio sustenta osmorregulação e continuidade metabólica quando ainda há folha funcional, água mínima e raiz ativa.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Fertilizante orgânico organomineral Classe A',
    registrationMapa: 'PR 002049-4.000013',
    applicationModes: ['Via Foliar'],
    composition: {
      macros: { N: 5.0, K2O: 2.0 },
      others: {
        'Carbono orgânico': 11.0,
        Aminoácidos: 8.7,
        'Substâncias húmicas': 15.0,
        'Óleo vegetal': 0.7,
      },
    },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'IMPUCH-1L' },
      { type: 'drum', volumeL: 5, sku: 'IMPUCH-5L' },
      { type: 'drum', volumeL: 20, sku: 'IMPUCH-20L' },
    ],
  },
  {
    slug: 'life-on',
    name: 'Lifeon',
    category: 'organominerais',
    tagline: 'Tecnologia de bioativação da rizosfera para a interface raiz-microbioma',
    description:
      'Fertilizante orgânico organomineral Classe A foliar com nitrogênio (6,0%), carbono orgânico (14,0%), aminoácidos (12,5%), ácidos carboxílicos (20,0%) e glicerina (3,0%). Posicionamento de "exsudação funcional" — entrega de carbono orgânico e compostos de baixo peso molecular que simulam parte da rizodeposição natural, sustentando metabolismo radicular, atividade da rizosfera e interface planta-microbioma. Não é biológico: prepara o ambiente para que biológicos (Biovas, Nemax) performem melhor.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Fertilizante orgânico organomineral Classe A',
    registrationMapa: 'PR 002049-4.000011',
    applicationModes: ['Via Foliar'],
    composition: {
      macros: { N: 6.0 },
      others: {
        'Carbono orgânico': 14.0,
        Aminoácidos: 12.5,
        'Ácidos carboxílicos': 20.0,
        Glicerina: 3.0,
      },
    },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'LIFE-ON-1L' },
      { type: 'drum', volumeL: 5, sku: 'LIFE-ON-5L' },
      { type: 'drum', volumeL: 20, sku: 'LIFE-ON-20L' },
    ],
  },
  {
    slug: 'grow-nitrop',
    name: 'Grow NitroP',
    category: 'organominerais',
    tagline: 'Nitrogênio funcional 20% com carbono orgânico para crescimento e recuperação',
    description:
      'Fertilizante orgânico organomineral Classe A líquido com 20,0% de nitrogênio solúvel em água e 7,0% de carbono orgânico, aminoácidos (3,0%) e substâncias húmicas (15,0%). Posicionado para fases de alta demanda de N — crescimento vegetativo ativo, expansão foliar, retomada metabólica e construção de área foliar. Matriz com vinhaça e ureia para resposta funcional em janelas críticas.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Fertilizante orgânico organomineral Classe A',
    registrationMapa: 'PR 002049-4.000012',
    applicationModes: ['Via Foliar', 'Via Fertirrigação'],
    composition: {
      macros: { N: 20.0 },
      others: {
        'Carbono orgânico': 7.0,
        Aminoácidos: 3.0,
        'Substâncias húmicas': 15.0,
      },
    },
    packaging: [{ type: 'drum', volumeL: 5, sku: 'GROW-NITROP-5L' }],
  },
  {
    slug: 'up-soil',
    name: 'Up Soil',
    category: 'organominerais',
    tagline: 'Fertirrigação organomineral para rizosfera ativa e raiz funcional',
    description:
      'Fertilizante orgânico organomineral Classe A para fertirrigação, com carbono orgânico (20,0%), nitrogênio (6,0%), aminoácidos (10,0%) e substâncias húmicas (24,0%). Posicionado como tecnologia de suporte ao ambiente rizosférico — favorece a dinâmica da solução do solo, o funcionamento da zona de absorção e a retomada de vigor em programas de manejo radicular. Indicado em culturas de alta tecnologia: hortaliças, frutíferas e cereais irrigados.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Fertilizante orgânico organomineral Classe A',
    registrationMapa: 'PR 002049-4.000010',
    applicationModes: ['Via Fertirrigação'],
    composition: {
      macros: { N: 6.0 },
      others: {
        'Carbono orgânico': 20.0,
        Aminoácidos: 10.0,
        'Substâncias húmicas': 24.0,
      },
    },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'UP-SOIL-1L' },
      { type: 'drum', volumeL: 5, sku: 'UP-SOIL-5L' },
    ],
  },
  {
    slug: 'grow-filling',
    name: 'Grow Filling',
    category: 'fertilizantes-minerais',
    tagline: 'Tecnologia de finalização para enchimento, calibre e maturação homogênea',
    description:
      'Fertilizante mineral misto sólido solúvel à base de potássio (K2O 35,0%), nitrogênio (2,0%), aminoácidos (6,0%) e sacarídeos (8,0%) — finalizador fisiológico para fases de forte demanda de dreno, quando grãos e frutos exigem maior fluxo de fotoassimilados, maior regulação osmótica e melhor eficiência de enchimento. Matriz com sulfato de potássio e acetato de amônio para suporte ao eixo fonte-dreno em culturas como soja R4-R5, milho R1-R3, frutíferas em calibre/maturação e café em granação.',
    physicalState: 'sólido',
    originCountry: 'Espanha',
    productType: 'Fertilizante Mineral Misto',
    registrationMapa: 'PR 002049-4.000003',
    applicationModes: ['Via Foliar', 'Via Fertirrigação'],
    composition: {
      macros: { K2O: 35.0, N: 2.0 },
      others: { Aminoácidos: 6.0, Sacarídeos: 8.0 },
    },
    packaging: [
      { type: 'bag', weightKg: 1, sku: 'GROW-FILLING-1KG' },
      { type: 'bag', weightKg: 5, sku: 'GROW-FILLING-5KG' },
    ],
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
    tagline: 'Complexo microbiológico multi-Bacillus',
    description:
      'Troian reúne três espécies do gênero Bacillus em uma formulação biotecnológica de composição declarada: Bacillus subtilis, Bacillus velezensis e Bacillus amyloliquefaciens. Desenvolvido dentro da linha de biotecnologias da Argho Agrosciences, o Troian se destaca pela arquitetura multi-Bacillus em uma única matriz microbiológica, oferecendo uma composição robusta, tecnicamente diferenciada e alinhada ao avanço dos consórcios microbiológicos. A presença simultânea de três espécies bacterianas declaradas confere ao produto uma identidade biológica singular dentro do portfólio Argho, valorizando diversidade bacteriana, consistência microbiológica e precisão técnica na composição declarada. Concentração total: 2,0 × 10¹⁰.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Complexo microbiológico',
    applicationModes: [],
    composition: {
      others: {
        'Bacillus subtilis': 1,
        'Bacillus velezensis': 1,
        'Bacillus amyloliquefaciens': 1,
      },
    },
    packaging: [{ type: 'bottle', volumeL: 1, sku: 'TROIAN-1L' }],
    technicalDifferentials: [
      'Complexo microbiológico multi-Bacillus',
      'Formulação biotecnológica de composição declarada',
      'Composição com três espécies bacterianas declaradas',
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
      'Biovas reúne cinco espécies do gênero Bacillus em uma formulação biotecnológica de alta complexidade microbiológica: Bacillus subtilis, Bacillus amyloliquefaciens, Bacillus licheniformis, Bacillus aryabhattai e Bacillus megaterium. Desenvolvido dentro da linha de biotecnologias da Argho Agrosciences, o Biovas se destaca pela combinação de diferentes espécies bacterianas em uma única matriz microbiológica, oferecendo uma composição robusta, tecnicamente diferenciada e alinhada ao avanço dos bioinsumos de base microbiana. A presença de múltiplas espécies de Bacillus confere ao produto uma identidade biológica singular dentro do portfólio Argho, valorizando diversidade microbiana, estabilidade de formulação e precisão técnica na composição declarada. Concentração total: 5,0 × 10⁹.',
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
    tagline: 'Complexo microbiológico fúngico entomopatogênico',
    description:
      'Bovex reúne três espécies de fungos entomopatogênicos em uma formulação biotecnológica de alta complexidade microbiológica: Beauveria bassiana, Metarhizium anisopliae e Cordyceps fumosorosea. Desenvolvido dentro da linha de biotecnologias da Argho Agrosciences, o Bovex se destaca pela combinação de três gêneros fúngicos distintos em uma única matriz biológica, oferecendo uma composição robusta, tecnicamente diferenciada e alinhada ao avanço dos consórcios microbiológicos de base fúngica. A presença simultânea de três gêneros fúngicos declarados confere ao produto uma identidade biológica singular dentro do portfólio Argho, valorizando diversidade fúngica, estabilidade de formulação e precisão técnica na composição declarada. Concentração total: 2,5 × 10¹⁰.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Complexo microbiológico',
    applicationModes: [],
    composition: {
      others: {
        'Beauveria bassiana': 1,
        'Metarhizium anisopliae': 1,
        'Cordyceps fumosorosea': 1,
      },
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
      'Controx reúne duas variedades distintas de Bacillus thuringiensis em uma formulação biotecnológica de alta complexidade microbiológica: Bacillus thuringiensis var. thuringiensis e Bacillus thuringiensis var. kurstaki. Desenvolvido dentro da linha de biotecnologias da Argho Agrosciences, o Controx se destaca pela combinação de duas variedades distintas dentro da mesma espécie em uma única matriz microbiológica, oferecendo uma composição robusta, tecnicamente diferenciada e alinhada ao avanço dos consórcios microbiológicos multivariantes. A presença simultânea das variedades thuringiensis e kurstaki confere ao produto uma identidade biológica singular dentro do portfólio Argho, valorizando diversidade intra-específica, estabilidade de formulação e precisão técnica na composição declarada. Concentração total: 2,5 × 10⁹.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Complexo microbiológico',
    applicationModes: [],
    composition: {
      others: {
        'Bacillus thuringiensis var. thuringiensis': 1,
        'Bacillus thuringiensis var. kurstaki': 1,
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
      'Nemax reúne três espécies de fungos filamentosos em uma formulação biotecnológica de alta complexidade microbiológica: Trichoderma harzianum, Trichoderma asperellum e Purpureocillium lilacinum. Desenvolvido dentro da linha de biotecnologias da Argho Agrosciences, o Nemax se destaca pela combinação de três espécies de fungos filamentosos em uma única matriz microbiológica, oferecendo uma composição robusta, tecnicamente diferenciada e alinhada ao avanço dos consórcios microbiológicos de base fúngica. A presença simultânea de duas espécies do gênero Trichoderma com Purpureocillium lilacinum confere ao produto uma identidade biológica singular dentro do portfólio Argho, valorizando diversidade microbiana, estabilidade de formulação e precisão técnica na composição declarada. Concentração total: 2,5 × 10¹⁰.',
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
  {
    slug: 'titan',
    name: 'Titan',
    category: 'biologicos',
    tagline: 'Matriz microbiológica fúngica líquida à base de Trichoderma harzianum',
    description:
      'Titan é uma matriz microbiológica fúngica líquida à base de Trichoderma harzianum, estruturada para apresentar identidade técnica clara, facilidade operacional e padronização microbiológica dentro da linha de biotecnologias da Argho Agrosciences. A proposta tecnológica do produto está na combinação entre base fúngica, formulação líquida e comunicação técnica voltada à construção de programas microbiológicos, respeitando a finalidade e as condições previstas no registro vigente. Concentração total: 2,5 × 10⁹.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Complexo microbiológico',
    applicationModes: [],
    composition: {
      others: { 'Trichoderma harzianum': 1 },
    },
    packaging: [{ type: 'bottle', volumeL: 1, sku: 'TITAN-1L' }],
    technicalDifferentials: [
      'Matriz microbiológica fúngica líquida monoespécie',
      'Formulação líquida de alta praticidade operacional',
      'Base fúngica Trichoderma harzianum declarada',
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
