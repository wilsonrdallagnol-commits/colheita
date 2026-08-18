// apps/website/src/lib/products.ts
// Dados estáticos do portfólio Argho.
// Fonte de verdade: Catálogo Argho 2026 (conteudo/site-data.json + conteudo/copy/
// produto-*.json) + Certificados MAPA. O site espelha o catálogo — nada além dele.

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

/**
 * Cepa declarada de um produto biológico.
 * `species` = nome científico (renderizado em itálico: gênero maiúsculo,
 * espécie minúscula). `strain` = código da cepa (romano, nunca itálico).
 * Fonte: catálogo Argho 2026 — conteudo/copy/produto-*.json.
 */
export interface MicrobialStrain {
  species: string;
  strain: string;
}

export interface ProductPackaging {
  type: 'bag' | 'bottle' | 'drum' | 'ibc' | 'box';
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
  /**
   * Concentração microbiológica declarada (UFC/mL) — exibida nos biológicos
   * por decisão do fundador (Wilson, 2026-06-06). Ver biologicos-compliance.md.
   */
  concentrationUfc?: string;
  registrationMapa?: string;
  applicationModes: ApplicationMode[];
  composition: ProductComposition;
  packaging: ProductPackaging[];
  /**
   * Espécies + cepas declaradas da linha biológica. Substitui a composição
   * quantificada nesses produtos: identidade microbiológica declarada, sem
   * dose, sem cultura e sem destinação de uso (ver biologicos-compliance.md).
   */
  microbialStrains?: MicrobialStrain[];
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

// ─── Classificação e enquadramento legal por categoria ───────────────────────
// Fonte única: a ficha do produto, a listagem e as notas legais leem daqui, para as três
// não voltarem a divergir. Os textos vêm do CATÁLOGO ARGHO 2026 e dos rótulos impressos.
//
// Biológicos: a classificação é "inóculo de bioinsumo" e a base é o art. 36 da Lei
// 15.070/2024 — a mesma dos 8 rótulos (decisão do Wilson, 17/08/2026). O art. 36 é
// transitório: quando a regulamentação sair, o parágrafo único dá 12 meses para adequar.
// Organominerais: "Classe A" na grafia literal do art. 17, §7º da IN MAPA 61/2020 — sem a
// palavra "Orgânico", que funde duas alíneas excludentes.
export const ENQUADRAMENTO: Record<
  ProductCategory,
  { classificacao: string; base: string }
> = {
  'fertilizantes-minerais': {
    classificacao: 'Fertilizante mineral',
    base: 'Registro no MAPA',
  },
  organominerais: {
    classificacao: 'Fertilizante Organomineral Classe A',
    base: 'Registro no MAPA',
  },
  biologicos: {
    classificacao: 'Inóculo de bioinsumo',
    base: 'Uso próprio — art. 36, Lei 15.070/2024',
  },
  adjuvantes: {
    classificacao: 'Adjuvante',
    base: 'Isento de registro no MAPA',
  },
};

export const CATEGORIES: Record<ProductCategory, { label: string; description: string }> = {
  'fertilizantes-minerais': {
    label: 'Fertilizantes Minerais',
    description:
      'Fertilizantes minerais com Registro no MAPA e composição garantida conforme Certificado de Análise. Soluções de alta concentração para nutrição foliar e fertirrigação — micronutrientes quelados, macros e complexos específicos por fase fenológica.',
  },
  organominerais: {
    label: 'Organominerais',
    description:
      'Fertilizantes Organominerais Classe A (IN MAPA 61/2020) com Registro no MAPA. A sinergia entre a matéria orgânica e os minerais: vinhaça, substâncias húmicas, aminoácidos e torta vegetal potencializando a vida do solo e a absorção radicular.',
  },
  biologicos: {
    label: 'Biológicos',
    description:
      'Inóculos de bioinsumo: microrganismos vivos com identidade de cepa declarada, fornecidos como insumo para produção de bioinsumos para uso próprio, nos termos do art. 36 da Lei Federal nº 15.070/2024 — vedada a comercialização do bioinsumo produzido. Oito matrizes de Bacillus, Priestia, Trichoderma e outros gêneros bacterianos e fúngicos, 100% nacionais, com foco em diversidade microbiana e precisão na composição declarada.',
  },
  adjuvantes: {
    label: 'Adjuvantes',
    description:
      'Adjuvantes isentos de registro no MAPA, nos termos da legislação vigente. A família Operate: surfactantes com óleos essenciais, condicionadores de calda e ação antideriva — para potencializar a eficiência de qualquer aplicação.',
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
      'Micronutrição funcional de alta densidade com matriz EDTA, lignossulfonatos e sacarídeos',
    description:
      'Fertilizante mineral misto sólido microgranulado com micronutrientes solúveis em água — Fe (7,0%), Mn (3,5%), K2O (4,0%), Zn (0,8%), B (0,7%), Cu (0,4%) e Mo (0,3%) — complexados em matriz com EDTA (9,9%), lignossulfonatos (23,0%) e sacarídeos (10,0%). Posicionamento como ferramenta de micronutrição funcional para janelas de alta exigência metabólica: Fe e Mn sustentam fotossíntese e transporte de elétrons; Zn, B e Mo formam eixo crítico para florescimento, pegamento e enchimento; Cu (cuproenzimas) e Mn (enzimas Mn-dependentes) atuam na lignificação e na homeostase oxidativa. Compatível com biológicos quando bem posicionada.',
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
        Lignossulfonatos: 23.0,
        Sacarídeos: 10.0,
      },
    },
    packaging: [
      { type: 'bag', weightKg: 1, sku: 'XCENSIS-1KG' },
      { type: 'bag', weightKg: 5, sku: 'XCENSIS-5KG' },
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
      { type: 'bottle', volumeL: 5, sku: 'STRON-5L' },
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
      { type: 'bottle', volumeL: 5, sku: 'GROW-CALCIUM-5L' },
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
      { type: 'bottle', volumeL: 5, sku: 'DEFON-5L' },
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
      'Fertilizante Organomineral Classe A foliar com nitrogênio (5,0%), óxido de potássio (2,0%), carbono orgânico (11,0%), aminoácidos (8,7%), substâncias húmicas (15,0%) e óleo vegetal (0,7%). Posicionamento como estabilizador fisiológico e antiestresse — especialmente em calor, seca, DPV elevado, florada, pegamento e recuperação vegetativa. Matriz com vinhaça, acetato de amônio e formiato de potássio sustenta osmorregulação e continuidade metabólica quando ainda há folha funcional, água mínima e raiz ativa.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Fertilizante Organomineral Classe A',
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
      { type: 'bottle', volumeL: 5, sku: 'IMPUCH-5L' },
    ],
  },
  {
    slug: 'life-on',
    name: 'Lifeon',
    category: 'organominerais',
    tagline: 'Tecnologia de bioativação da rizosfera para a interface raiz-microbioma',
    description:
      'Fertilizante Organomineral Classe A foliar com nitrogênio (6,0%), carbono orgânico (14,0%), aminoácidos (12,5%), ácidos carboxílicos (20,0%) e glicerina (3,0%). Posicionamento de "exsudação funcional" — entrega de carbono orgânico e compostos de baixo peso molecular que simulam parte da rizodeposição natural, sustentando metabolismo radicular, atividade da rizosfera e interface planta-microbioma. Não é biológico: prepara o ambiente para que biológicos (Biotas, Nemax) performem melhor.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Fertilizante Organomineral Classe A',
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
      { type: 'bottle', volumeL: 1, sku: 'LIFEON-1L' },
      { type: 'bottle', volumeL: 5, sku: 'LIFEON-5L' },
    ],
  },
  {
    slug: 'grow-nitrop',
    name: 'Grow NitroP',
    category: 'organominerais',
    tagline: 'Nitrogênio funcional 20% com carbono orgânico para crescimento e recuperação',
    description:
      'Fertilizante Organomineral Classe A líquido com 20,0% de nitrogênio solúvel em água e 7,0% de carbono orgânico, aminoácidos (3,0%) e substâncias húmicas (15,0%). Posicionado para fases de alta demanda de N — crescimento vegetativo ativo, expansão foliar, retomada metabólica e construção de área foliar. Matriz com vinhaça e ureia para resposta funcional em janelas críticas.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Fertilizante Organomineral Classe A',
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
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'GROW-NITROP-1L' },
      { type: 'bottle', volumeL: 5, sku: 'GROW-NITROP-5L' },
    ],
  },
  {
    slug: 'up-soil',
    name: 'Up Soil',
    category: 'organominerais',
    tagline: 'Fertirrigação organomineral para rizosfera ativa e raiz funcional',
    description:
      'Fertilizante Organomineral Classe A para fertirrigação, com carbono orgânico (20,0%), nitrogênio (6,0%), aminoácidos (10,0%) e substâncias húmicas (24,0%). Posicionado como tecnologia de suporte ao ambiente rizosférico — favorece a dinâmica da solução do solo, o funcionamento da zona de absorção e a retomada de vigor em programas de manejo radicular. Indicado em culturas de alta tecnologia: hortaliças, frutíferas e cereais irrigados.',
    physicalState: 'fluido',
    originCountry: 'Espanha',
    productType: 'Fertilizante Organomineral Classe A',
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
      { type: 'bottle', volumeL: 1, sku: 'UPSOIL-1L' },
      { type: 'bottle', volumeL: 5, sku: 'UPSOIL-5L' },
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
  // descrevem a formulação microbiológica declarada (espécie + cepa), a
  // complexidade do consórcio e o padrão Argho de qualidade, sem destinação
  // de uso, modo de aplicação ou claim de eficácia. Ver doc
  // apps/website/docs/biologicos-compliance.md.
  // Espécies, cepas, concentrações e embalagens: Catálogo Argho 2026.
  {
    slug: 'troian',
    name: 'Troian',
    category: 'biologicos',
    tagline: 'Complexo microbiológico multi-Bacillus',
    description:
      'Troian é uma matriz microbiológica de composição declarada, formada por três cepas do gênero Bacillus: Bacillus velezensis DC 81, Bacillus velezensis DC 88 e Bacillus pumilus DC 61. Formulação fluida desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade multi-Bacillus, diversidade bacteriana e padrão de formulação declarado. Concentração total declarada: 3,0×10⁸ UFC/mL · 3,0×10¹¹ UFC/L.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Complexo microbiológico',
    concentrationUfc: '3,0 × 10⁸ UFC/mL',
    applicationModes: [],
    composition: {},
    microbialStrains: [
      { species: 'Bacillus velezensis', strain: 'DC 81' },
      { species: 'Bacillus velezensis', strain: 'DC 88' },
      { species: 'Bacillus pumilus', strain: 'DC 61' },
    ],
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'TROIAN-1L' },
      { type: 'bottle', volumeL: 5, sku: 'TROIAN-5L' },
    ],
    technicalDifferentials: [
      'Complexo microbiológico multi-Bacillus',
      'Formulação com três cepas identificadas',
      'Composição com duas espécies bacterianas declaradas',
      'Padrão Argho de qualidade, rastreabilidade e formulação',
    ],
  },
  {
    slug: 'biotas',
    name: 'Biotas',
    category: 'biologicos',
    tagline: 'Complexo microbiológico multi-espécie de Bacillus e Priestia',
    description:
      'Biotas é uma matriz microbiológica de composição declarada, formada por cinco cepas de cinco espécies — três do gênero Bacillus e duas do gênero Priestia: Bacillus velezensis DC 101, Bacillus subtilis DC 107, Priestia megaterium DC 93, Bacillus licheniformis DC 40 e Priestia aryabhattai DC 26. Formulação fluida desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade multi-espécie, diversidade bacteriana e padrão de formulação declarado. Concentração total declarada: 5,0×10⁹ UFC/mL · 5,0×10¹² UFC/L.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Complexo microbiológico',
    concentrationUfc: '5,0 × 10⁹ UFC/mL',
    applicationModes: [],
    composition: {},
    microbialStrains: [
      { species: 'Bacillus velezensis', strain: 'DC 101' },
      { species: 'Bacillus subtilis', strain: 'DC 107' },
      { species: 'Priestia megaterium', strain: 'DC 93' },
      { species: 'Bacillus licheniformis', strain: 'DC 40' },
      { species: 'Priestia aryabhattai', strain: 'DC 26' },
    ],
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'BIOTAS-1L' },
      { type: 'bottle', volumeL: 5, sku: 'BIOTAS-5L' },
    ],
    technicalDifferentials: [
      'Complexo microbiológico multi-espécie',
      'Formulação com cinco cepas identificadas',
      'Composição com cinco espécies declaradas de Bacillus e Priestia',
      'Padrão Argho de qualidade, rastreabilidade e formulação',
    ],
  },
  {
    slug: 'sporax',
    name: 'Sporax',
    category: 'biologicos',
    tagline: 'Complexo microbiológico multi-gênero fúngico',
    description:
      'Sporax é uma matriz microbiológica de composição declarada, formada por três cepas de três gêneros de fungos: Beauveria bassiana IBCB 66, Metarhizium anisopliae IBCB 425 e Cordyceps fumosorosea DC 134. Formulação fluida desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade multi-gênero fúngica, diversidade fúngica e padrão de formulação declarado. Concentração total declarada: 5,0×10⁸ UFC/mL · 5,0×10¹¹ UFC/L.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Complexo microbiológico',
    concentrationUfc: '5,0 × 10⁸ UFC/mL',
    applicationModes: [],
    composition: {},
    microbialStrains: [
      { species: 'Beauveria bassiana', strain: 'IBCB 66' },
      { species: 'Metarhizium anisopliae', strain: 'IBCB 425' },
      { species: 'Cordyceps fumosorosea', strain: 'DC 134' },
    ],
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'SPORAX-1L' },
      { type: 'bottle', volumeL: 5, sku: 'SPORAX-5L' },
    ],
    technicalDifferentials: [
      'Complexo multi-gênero fúngico',
      'Formulação com três cepas identificadas',
      'Composição com três gêneros fúngicos declarados',
      'Padrão Argho de qualidade, rastreabilidade e formulação',
    ],
  },
  {
    slug: 'controx',
    name: 'Controx',
    category: 'biologicos',
    tagline: 'Complexo microbiológico multi-subespécie de Bacillus thuringiensis',
    description:
      'Controx é uma matriz microbiológica de composição declarada, formada por duas subespécies de Bacillus thuringiensis: Bacillus thuringiensis subsp. aizawai DC 38 e Bacillus thuringiensis subsp. kurstaki DC 41. Formulação fluida desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade multi-subespécie, diversidade intraespecífica e padrão de formulação declarado. Concentração total declarada: 1,0×10⁹ UFC/mL · 1,0×10¹² UFC/L.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Complexo microbiológico',
    concentrationUfc: '1,0 × 10⁹ UFC/mL',
    applicationModes: [],
    composition: {},
    microbialStrains: [
      { species: 'Bacillus thuringiensis subsp. aizawai', strain: 'DC 38' },
      { species: 'Bacillus thuringiensis subsp. kurstaki', strain: 'DC 41' },
    ],
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'CONTROX-1L' },
      { type: 'bottle', volumeL: 5, sku: 'CONTROX-5L' },
    ],
    technicalDifferentials: [
      'Complexo microbiológico multi-subespécie',
      'Formulação com duas cepas identificadas',
      'Composição com duas subespécies de B. thuringiensis declaradas',
      'Padrão Argho de qualidade, rastreabilidade e formulação',
    ],
  },
  {
    slug: 'nemax',
    name: 'Nemax',
    category: 'biologicos',
    tagline: 'Complexo microbiológico multi-gênero de fungos filamentosos',
    description:
      'Nemax é uma matriz microbiológica de composição declarada, formada por quatro cepas de fungos filamentosos: Trichoderma harzianum IB 19/17, Trichoderma harzianum DC 133, Trichoderma asperellum URM 5911 e Metarhizium anisopliae IBCB 425. Formulação fluida desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade multi-gênero fúngica, diversidade microbiana e padrão de formulação declarado. Concentração total declarada: 2,0×10⁹ UFC/mL · 2,0×10¹² UFC/L.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Complexo microbiológico',
    concentrationUfc: '2,0 × 10⁹ UFC/mL',
    applicationModes: [],
    composition: {},
    microbialStrains: [
      { species: 'Trichoderma harzianum', strain: 'IB 19/17' },
      { species: 'Trichoderma harzianum', strain: 'DC 133' },
      { species: 'Trichoderma asperellum', strain: 'URM 5911' },
      { species: 'Metarhizium anisopliae', strain: 'IBCB 425' },
    ],
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'NEMAX-1L' },
      { type: 'bottle', volumeL: 5, sku: 'NEMAX-5L' },
    ],
    technicalDifferentials: [
      'Complexo multi-gênero fúngico',
      'Formulação com quatro cepas identificadas',
      'Composição com três espécies fúngicas declaradas',
      'Padrão Argho de qualidade, rastreabilidade e formulação',
    ],
  },
  {
    slug: 'harzon',
    name: 'Harzon',
    category: 'biologicos',
    tagline: 'Matriz microbiológica fúngica líquida à base de Trichoderma harzianum',
    description:
      'Harzon é uma matriz microbiológica fluida de composição declarada, à base da cepa IB 19/17 de Trichoderma harzianum. Formulação de cepa única desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade fúngica declarada e padrão de formulação. Concentração total declarada: 1,0×10⁹ UFC/mL · 1,0×10¹² UFC/L.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Complexo microbiológico',
    concentrationUfc: '1,0 × 10⁹ UFC/mL',
    applicationModes: [],
    composition: {},
    microbialStrains: [{ species: 'Trichoderma harzianum', strain: 'IB 19/17' }],
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'HARZON-1L' },
      { type: 'bottle', volumeL: 5, sku: 'HARZON-5L' },
    ],
    technicalDifferentials: [
      'Matriz microbiológica fúngica líquida de cepa única',
      'Cepa identificada: IB 19/17',
      'Base fúngica Trichoderma harzianum declarada',
      'Padrão Argho de qualidade, rastreabilidade e formulação',
    ],
  },
  {
    slug: 'n-import',
    name: 'N-import',
    category: 'biologicos',
    tagline: 'Matriz microbiológica à base de Methylobacterium sp.',
    description:
      'N-import é uma matriz microbiológica fluida de composição declarada, à base da cepa SEMIA 658 de Methylobacterium sp. Formulação de cepa única desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade bacteriana declarada e padrão de formulação. Concentração total declarada: 1,0×10⁸ UFC/mL · 1,0×10¹¹ UFC/L.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Complexo microbiológico',
    concentrationUfc: '1,0 × 10⁸ UFC/mL',
    applicationModes: [],
    composition: {},
    microbialStrains: [{ species: 'Methylobacterium sp.', strain: 'SEMIA 658' }],
    packaging: [{ type: 'bottle', volumeL: 1, sku: 'NIMPORT-1L' }],
    technicalDifferentials: [
      'Matriz microbiológica fluida de cepa única',
      'Cepa de coleção de referência declarada: SEMIA 658',
      'Base bacteriana Methylobacterium sp. declarada',
      'Padrão Argho de qualidade, rastreabilidade e formulação',
    ],
  },
  {
    slug: 'chrom',
    name: 'Chrom',
    category: 'biologicos',
    tagline: 'Matriz microbiológica à base de Chromobacterium subtsugae',
    description:
      'Chrom é uma matriz microbiológica fluida de composição declarada, à base da cepa DC 43 de Chromobacterium subtsugae. Formulação de cepa única desenvolvida dentro da linha de biotecnologias da Argho Agrosciences, com identidade bacteriana declarada e padrão de formulação. Concentração total declarada: 1,0×10⁸ UFC/mL · 1,0×10¹¹ UFC/L.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Complexo microbiológico',
    concentrationUfc: '1,0 × 10⁸ UFC/mL',
    applicationModes: [],
    composition: {},
    microbialStrains: [{ species: 'Chromobacterium subtsugae', strain: 'DC 43' }],
    packaging: [{ type: 'bottle', volumeL: 1, sku: 'CHROM-1L' }],
    technicalDifferentials: [
      'Matriz microbiológica fluida de cepa única',
      'Cepa identificada: DC 43',
      'Base bacteriana Chromobacterium subtsugae declarada',
      'Padrão Argho de qualidade, rastreabilidade e formulação',
    ],
  },

  // ADJUVANTES
  {
    slug: 'operate-plus',
    name: 'Operate Plus',
    category: 'adjuvantes',
    tagline: 'Condicionador multifuncional de calda — qualidade da água e eficiência na aplicação',
    description:
      'Condicionador multifuncional de calda que reúne sequestrante de cátions, blend de surfactantes não-iônicos, agente antideriva e antiespumante. Melhora a qualidade da água de pulverização, a cobertura e a estabilidade da calda, reduzindo perdas por deriva e formação de espuma. Adicionar primeiro no tanque. Dose: 0,5–1,0 mL/L de calda · em baixa vazão, 50–100 mL/ha. Produto isento de registro no MAPA.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Condicionador Multifuncional de Calda',
    applicationModes: ['Via Foliar'],
    composition: {},
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'OPERATE-PLUS-1L' },
      { type: 'bottle', volumeL: 5, sku: 'OPERATE-PLUS-5L' },
      { type: 'drum', volumeL: 20, sku: 'OPERATE-PLUS-20L' },
      { type: 'drum', volumeL: 200, sku: 'OPERATE-PLUS-200L' },
      { type: 'ibc', volumeL: 1000, sku: 'OPERATE-PLUS-1000L' },
    ],
  },
  {
    slug: 'operate-citronela',
    name: 'Operate Citronela',
    category: 'adjuvantes',
    tagline: 'Adjuvante surfactante com óleo essencial de citronela (3%)',
    description:
      'Adjuvante surfactante formulado com óleo essencial de citronela (3%). Reduz a tensão superficial da calda, melhorando o molhamento, o espalhamento e a absorção dos ativos. Adicionar por último no tanque (produto oleoso) — aplicação convencional, baixa vazão ou drone. Dose: 1,5–2,0 mL/L de calda · em baixa vazão, 100–200 mL/ha. Produto isento de registro no MAPA.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Adjuvante Surfactante com Óleo Essencial',
    applicationModes: ['Via Foliar'],
    composition: { others: { 'Óleo essencial de citronela': 3.0 } },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'OPERATE-CITRONELA-1L' },
      { type: 'bottle', volumeL: 5, sku: 'OPERATE-CITRONELA-5L' },
      { type: 'drum', volumeL: 20, sku: 'OPERATE-CITRONELA-20L' },
      { type: 'drum', volumeL: 200, sku: 'OPERATE-CITRONELA-200L' },
      { type: 'ibc', volumeL: 1000, sku: 'OPERATE-CITRONELA-1000L' },
    ],
  },
  {
    slug: 'operate-4em1',
    name: 'Operate 4em1',
    category: 'adjuvantes',
    tagline: 'Condicionador multifuncional 4em1 — ajusta o pH e prepara a calda',
    description:
      'O mais completo da família Operate: condicionador multifuncional que reúne sequestrante de cátions, redutor de pH à base de ácido fosfórico, surfactantes não-iônicos, antideriva e antiespumante. Ajusta o pH da calda para a faixa ideal de 4,0 a 6,5 e melhora a qualidade da aplicação em uma única adição ao tanque. Adicionar primeiro. Dose: 0,5–1,0 mL/L de calda · em baixa vazão, 50–100 mL/ha. Por conter ácido fosfórico, redobrar a atenção em misturas alcalinas e com produtos à base de cobre. Produto isento de registro no MAPA.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Condicionador Multifuncional de Calda',
    applicationModes: ['Via Foliar'],
    composition: {},
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'OPERATE-4EM1-1L' },
      { type: 'bottle', volumeL: 5, sku: 'OPERATE-4EM1-5L' },
      { type: 'drum', volumeL: 20, sku: 'OPERATE-4EM1-20L' },
      { type: 'drum', volumeL: 200, sku: 'OPERATE-4EM1-200L' },
      { type: 'ibc', volumeL: 1000, sku: 'OPERATE-4EM1-1000L' },
    ],
  },
  {
    slug: 'operate-orange',
    name: 'Operate Orange',
    category: 'adjuvantes',
    tagline: 'Adjuvante supermolhante e penetrante com óleo de laranja (D-limoneno 6%)',
    description:
      'Adjuvante supermolhante e penetrante à base de óleo da casca de laranja, com 6% de D-limoneno. Potencializa o molhamento das folhas e a penetração cuticular de defensivos e nutrientes sistêmicos. Adicionar por último no tanque. Dose: 1,5–2,0 mL/L de calda · em baixa vazão, 100–200 mL/ha. Produto isento de registro no MAPA.',
    physicalState: 'fluido',
    originCountry: 'Brasil',
    productType: 'Adjuvante Supermolhante e Penetrante',
    applicationModes: ['Via Foliar'],
    composition: { others: { 'D-limoneno': 6.0 } },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'OPERATE-ORANGE-1L' },
      { type: 'bottle', volumeL: 5, sku: 'OPERATE-ORANGE-5L' },
      { type: 'drum', volumeL: 20, sku: 'OPERATE-ORANGE-20L' },
      { type: 'drum', volumeL: 200, sku: 'OPERATE-ORANGE-200L' },
      { type: 'ibc', volumeL: 1000, sku: 'OPERATE-ORANGE-1000L' },
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
