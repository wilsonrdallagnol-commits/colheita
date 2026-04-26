/**
 * Seed — tenant Argho + portfólio completo de produtos (dados oficiais MAPA).
 *
 * Uso: pnpm db:seed
 * Idempotente: INSERT ... ON CONFLICT DO NOTHING / DO UPDATE.
 */

import { ARGHO_TENANT_NAME, ARGHO_TENANT_SLUG, ARGHO_THEME_TOKENS } from '@colheita/tokens';
import postgres from 'postgres';

const DB_URL = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;

if (!DB_URL) {
  console.error('❌  DATABASE_URL_DIRECT or DATABASE_URL must be set');
  process.exit(1);
}

// ============================================================================
// Categorias
// ============================================================================
const CATEGORIES = [
  { slug: 'fertilizantes-minerais', name: 'Fertilizantes Minerais', sortOrder: 1 },
  { slug: 'organominerais', name: 'Organominerais', sortOrder: 2 },
  { slug: 'biologicos', name: 'Biológicos', sortOrder: 3 },
  { slug: 'adjuvantes', name: 'Adjuvantes', sortOrder: 4 },
] as const;

// ============================================================================
// Portfólio Argho — dados baseados nos Certificados de Registro MAPA
// ============================================================================
const PRODUCTS = [
  // ── FERTILIZANTES MINERAIS ────────────────────────────────────────────────
  {
    slug: 'xcensis',
    name: 'Xcensis',
    category: 'fertilizantes-minerais',
    tagline: 'Multi-micronutriente foliar com EDTA e Lignossulfonatos',
    description:
      'Fertilizante mineral misto de alta concentração em micronutrientes, complexados com EDTA e Lignossulfonatos para máxima absorção foliar e por fertirrigação. Formulação europeia com pH controlado, compatível com biológicos. Indicado para banana, café, milho irrigado, soja, HF e outras culturas exigentes em micronutrientes.',
    status: 'published' as const,
    composition: {
      micros: { Fe: 7.0, Mn: 3.5, Zn: 0.8, B: 0.7, Cu: 0.4, Mo: 0.3 },
      macros: { K2O: 4.0 },
    },
    technicalSpecs: {
      registration_mapa: 'PR 002049-4.000006',
      registration_date: '2023-02-28',
      physical_state: 'sólido',
      origin_country: 'Espanha',
      product_type: 'Fertilizante Mineral Misto',
      application_modes: ['Via Foliar', 'Via Fertirrigação'],
      raw_materials: [
        'Sacarídeos',
        'Formiato de Potássio',
        'Lignossulfonatos',
        'Sulfato de Manganês',
        'EDTA (Etilenodiaminotetraacético)',
        'Sulfato Ferroso',
        'Ácido Bórico',
        'Sulfato de Zinco',
        'Sulfato de Cobre',
        'Molibdato de Amônio',
      ],
      ph: 6,
      compatibility: 'Compatível com biológicos',
    },
    packaging: [
      { type: 'bag', weightKg: 1, sku: 'XCENSIS-1KG' },
      { type: 'bag', weightKg: 5, sku: 'XCENSIS-5KG' },
    ],
  },
  {
    slug: 'stron',
    name: 'Stron',
    category: 'fertilizantes-minerais',
    tagline: 'Fertilizante NPK foliar com aminoácidos e ácidos carboxílicos',
    description:
      'Fertilizante mineral misto fluido com nitrogênio, fósforo e potássio em formulação foliar de alta eficiência. Enriquecido com aminoácidos e ácidos carboxílicos que potencializam a absorção e o metabolismo da planta. Indicado em fases de intensa demanda nutricional.',
    status: 'published' as const,
    composition: {
      macros: { N: 4.5, P2O5: 2.0, K2O: 7.2 },
    },
    technicalSpecs: {
      registration_mapa: 'PR 002049-4.000014',
      registration_date: '2023-08-01',
      physical_state: 'fluido',
      origin_country: 'Espanha',
      product_type: 'Fertilizante Mineral Misto',
      application_modes: ['Via Foliar'],
      raw_materials: [
        'Água',
        'Hidróxido de Potássio',
        'Conservante',
        'Aminoácido',
        'Fosfato Tripotássio',
        'Ácidos Carboxílicos',
        'Ureia',
      ],
    },
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
      'Fertilizante mineral misto sólido de alta concentração em potássio (K2O 35%) com sacarídeos e aminoácidos. Formulado para atender a demanda intensiva de K na fase de enchimento de grãos em soja, milho, trigo e outras culturas. Aplicação foliar e por fertirrigação.',
    status: 'published' as const,
    composition: {
      macros: { N: 2.0, K2O: 35.0 },
    },
    technicalSpecs: {
      registration_mapa: 'PR 002049-4.000003',
      registration_date: '2023-02-28',
      physical_state: 'sólido',
      origin_country: 'Espanha',
      product_type: 'Fertilizante Mineral Misto',
      application_modes: ['Via Foliar', 'Via Fertirrigação'],
      raw_materials: ['Sacarídeos', 'Sulfato de Potássio', 'Aminoácido', 'Acetato de Amônio'],
    },
    packaging: [
      { type: 'bag', weightKg: 1, sku: 'GROW-FILLING-1KG' },
      { type: 'bag', weightKg: 5, sku: 'GROW-FILLING-5KG' },
    ],
  },
  {
    slug: 'grow-calcium',
    name: 'Grow Calcium',
    category: 'fertilizantes-minerais',
    tagline: 'Cálcio-nitrogenado com substâncias húmicas e aminoácidos',
    description:
      'Fertilizante mineral simples em solução com cálcio e nitrogênio, enriquecido com substâncias húmicas e aminoácidos para melhorar a absorção e a translocação do cálcio na planta. Indicado para prevenção de distúrbios fisiológicos relacionados à deficiência de Ca em frutas e hortaliças.',
    status: 'published' as const,
    composition: {
      macros: { N: 1.4, Ca: 1.6 },
    },
    technicalSpecs: {
      registration_mapa: 'PR 002049-4.000004',
      registration_date: '2023-02-28',
      physical_state: 'fluido',
      origin_country: 'Espanha',
      product_type: 'Fertilizante Mineral Simples em Solução',
      application_modes: ['Via Foliar', 'Via Fertirrigação'],
      raw_materials: ['Aminoácido', 'Substâncias Húmicas', 'Água', 'Nitrato de Cálcio'],
    },
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
      'Fertilizante mineral simples em solução com cobre (2,4%) complexado por ácido glucônico, que garante alta solubilidade, estabilidade em calda e absorção foliar superior à do sulfato de cobre convencional. Indicado para correção e manutenção de cobre em culturas exigentes como café, citrus, tomate e cana.',
    status: 'published' as const,
    composition: {
      micros: { Cu: 2.4 },
      others: { S: 1.1 },
    },
    technicalSpecs: {
      registration_mapa: 'PR 002049-4.000001',
      registration_date: '2023-02-28',
      physical_state: 'fluido',
      origin_country: 'Espanha',
      product_type: 'Fertilizante Mineral Simples em Solução',
      application_modes: ['Via Foliar', 'Via Fertirrigação'],
      raw_materials: ['Água', 'Ácido Glucônico', 'Sulfato de Cobre'],
    },
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
      'Fertilizante mineral misto fluido com extrato de algas marinhas, fósforo (P2O5 14%) e potássio (K2O 21%). O extrato de algas fornece citocininas, auxinas e betaínas que estimulam o enraizamento, a divisão celular e a resistência a estresses abióticos. Indicado em transplantio, florescimento e situações de estresse.',
    status: 'published' as const,
    composition: {
      macros: { P2O5: 14.0, K2O: 21.0 },
    },
    technicalSpecs: {
      registration_mapa: 'PR 002049-4.000002',
      registration_date: '2023-02-28',
      physical_state: 'fluido',
      origin_country: 'Espanha',
      product_type: 'Fertilizante Mineral Misto',
      application_modes: ['Via Foliar', 'Via Fertirrigação'],
      raw_materials: ['Água', 'Extrato de Algas', 'Fosfato Tripotássio', 'Formiato de Potássio'],
    },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'ALGEN-1L' },
      { type: 'drum', volumeL: 20, sku: 'ALGEN-20L' },
    ],
  },
  {
    slug: 'grow-mob',
    name: 'Grow Mob',
    category: 'fertilizantes-minerais',
    tagline: 'Fósforo, boro e molibdênio concentrados para fixação biológica e florescimento',
    description:
      'Fertilizante mineral misto sólido com alta concentração de P2O5 (24%), boro (8%), molibdênio (7%) e nitrogênio (4,5%). O molibdênio é cofator essencial da enzima nitrogenase, sendo crítico para a fixação biológica de N em soja. O boro é fundamental para a formação de paredes celulares, polinização e translocação de açúcares.',
    status: 'published' as const,
    composition: {
      macros: { N: 4.5, P2O5: 24.0 },
      micros: { Mo: 7.0, B: 8.0 },
    },
    technicalSpecs: {
      registration_mapa: 'PR 002049-4.000005',
      registration_date: '2023-02-28',
      physical_state: 'sólido',
      origin_country: 'Espanha',
      product_type: 'Fertilizante Mineral Misto',
      application_modes: ['Via Foliar', 'Via Fertirrigação'],
      raw_materials: [
        'Molibdato de Amônio',
        'Ácido Bórico',
        'Fosfato Monoamônico Cristal (MAP)',
        'Dióxido de Silício',
      ],
    },
    packaging: [{ type: 'bag', weightKg: 1, sku: 'GROW-MOB-1KG' }],
  },
  {
    slug: 'grow-sulfur',
    name: 'Grow Sulfur',
    category: 'fertilizantes-minerais',
    tagline: 'Enxofre e nitrogênio em solução para manutenção nutricional',
    description:
      'Fertilizante mineral simples em solução com nitrogênio amoniacal (2%) e enxofre (2,2%). O enxofre é essencial para a síntese de aminoácidos sulfurados (metionina e cisteína), proteínas e glucosinolatos. Aplicação foliar e fertirrigação em culturas que exigem manutenção contínua de S.',
    status: 'published' as const,
    composition: {
      macros: { N: 2.0 },
      others: { S: 2.2 },
    },
    technicalSpecs: {
      registration_mapa: 'PR 002049-4.000007',
      registration_date: '2023-03-01',
      physical_state: 'fluido',
      origin_country: 'Espanha',
      product_type: 'Fertilizante Mineral Simples em Solução',
      application_modes: ['Via Foliar', 'Via Fertirrigação'],
      raw_materials: ['Água', 'Sulfato de Amônio'],
    },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'GROW-SULFUR-1L' },
      { type: 'drum', volumeL: 20, sku: 'GROW-SULFUR-20L' },
    ],
  },

  // ── ORGANOMINERAIS ────────────────────────────────────────────────────────
  {
    slug: 'impuch',
    name: 'Impuch',
    category: 'organominerais',
    tagline: 'Organomineral com vinhaça, substâncias húmicas e aminoácidos',
    description:
      'Fertilizante orgânico organomineral Classe A com nitrogênio (5%), potássio (2%) e carbono orgânico (11%). Combina vinhaça fermentada, substâncias húmicas, óleos vegetais e aminoácidos para melhorar a biologia do solo, a retenção de nutrientes e a eficiência de absorção radicular. Uso foliar em programas de nutrição integrada.',
    status: 'published' as const,
    composition: {
      macros: { N: 5.0, K2O: 2.0 },
      others: { 'Carbono Orgânico': 11.0 },
    },
    technicalSpecs: {
      registration_mapa: 'PR 002049-4.000013',
      registration_date: '2023-04-12',
      physical_state: 'fluido',
      origin_country: 'Espanha',
      product_type: 'Fertilizante Orgânico Organomineral Classe A',
      application_modes: ['Via Foliar'],
      raw_materials: [
        'Água',
        'Formiato de Potássio',
        'Acetato de Amônio',
        'Vinhaça',
        'Óleos Vegetais',
        'Substâncias Húmicas',
        'Aminoácido',
      ],
    },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'IMPUCH-1L' },
      { type: 'drum', volumeL: 20, sku: 'IMPUCH-20L' },
    ],
  },
  {
    slug: 'life-on',
    name: 'Life On',
    category: 'organominerais',
    tagline: 'Bioestimulante organomineral com torta vegetal e glicerina',
    description:
      'Fertilizante orgânico organomineral Classe A com nitrogênio (6%) e carbono orgânico (14%). Formulado com ácidos carboxílicos, aminoácidos, glicerina e torta vegetal para estimular a microbiota do solo e a capacidade de absorção da planta. Indicado em programas de transição agroecológica e produção integrada.',
    status: 'published' as const,
    composition: {
      macros: { N: 6.0 },
      others: { 'Carbono Orgânico': 14.0 },
    },
    technicalSpecs: {
      registration_mapa: 'PR 002049-4.000011',
      registration_date: '2023-03-22',
      physical_state: 'fluido',
      origin_country: 'Espanha',
      product_type: 'Fertilizante Orgânico Organomineral Classe A',
      application_modes: ['Via Foliar'],
      raw_materials: [
        'Água',
        'Ácidos Carboxílicos',
        'Aminoácido',
        'Glicerina',
        'Torta Vegetal',
        'Acetato de Amônio',
      ],
    },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'LIFEON-1L' },
      { type: 'drum', volumeL: 20, sku: 'LIFEON-20L' },
    ],
  },
  {
    slug: 'grow-nitro-p',
    name: 'Grow Nitro P',
    category: 'organominerais',
    tagline: 'Organomineral nitrogenado concentrado com vinhaça e substâncias húmicas',
    description:
      'Fertilizante orgânico organomineral Classe A com alto teor de nitrogênio (20%) e carbono orgânico (7%). Formulado com vinhaça, substâncias húmicas, aminoácidos e ureia para suprir demanda intensa de N em estádios críticos. Uso foliar e fertirrigação em culturas de alta produtividade.',
    status: 'published' as const,
    composition: {
      macros: { N: 20.0 },
      others: { 'Carbono Orgânico': 7.0 },
    },
    technicalSpecs: {
      registration_mapa: 'PR 002049-4.000012',
      registration_date: '2023-04-12',
      physical_state: 'fluido',
      origin_country: 'Espanha',
      product_type: 'Fertilizante Orgânico Organomineral Classe A',
      application_modes: ['Via Foliar', 'Via Fertirrigação'],
      raw_materials: [
        'Vinhaça',
        'Aminoácido',
        'Água',
        'Substâncias Húmicas',
        'Nitrato de Amônio',
        'Ureia',
      ],
    },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'GROW-NITROP-1L' },
      { type: 'drum', volumeL: 5, sku: 'GROW-NITROP-5L' },
    ],
  },
  {
    slug: 'up-soil',
    name: 'Up Soil',
    category: 'organominerais',
    tagline: 'Condicionador de solo organomineral via fertirrigação',
    description:
      'Fertilizante orgânico organomineral Classe A com N total (6%) e elevado carbono orgânico (20%). Formulado com substâncias húmicas, acetato de amônio, aminoácidos e torta vegetal para recuperar e manter a biologia e a estrutura do solo. Aplicação via fertirrigação em sistemas irrigados.',
    status: 'published' as const,
    composition: {
      macros: { N: 6.0 },
      others: { 'Carbono Orgânico': 20.0 },
    },
    technicalSpecs: {
      registration_mapa: 'PR 002049-4.000010',
      registration_date: '2023-03-22',
      physical_state: 'fluido',
      origin_country: 'Espanha',
      product_type: 'Fertilizante Orgânico Organomineral Classe A',
      application_modes: ['Via Fertirrigação'],
      raw_materials: [
        'Água',
        'Acetato de Amônio',
        'Aminoácido',
        'Substâncias Húmicas',
        'Ureia',
        'Torta Vegetal',
      ],
    },
    packaging: [{ type: 'drum', volumeL: 20, sku: 'UPSOIL-20L' }],
  },

  // ── BIOLÓGICOS ────────────────────────────────────────────────────────────
  {
    slug: 'troian',
    name: 'Troian',
    category: 'biologicos',
    tagline: 'Trichoderma + Bacillus multicepa para controle biológico e promoção de crescimento',
    description:
      'Biológico com consórcio de Bacillus subtilis, Bacillus velezensis e Bacillus amyloliquefaciens. Atua no controle biológico de fitopatógenos de solo e parte aérea, além de promover crescimento radicular por produção de auxinas e citocininas. Substitui com vantagem produtos mono-cepa do mercado.',
    status: 'published' as const,
    composition: {
      others: {
        'Bacillus subtilis': 1,
        'Bacillus velezensis': 1,
        'Bacillus amyloliquefaciens': 1,
      },
    },
    technicalSpecs: {
      product_type: 'Biológico — Consórcio Bacillus',
      strains: ['Bacillus subtilis', 'Bacillus velezensis', 'Bacillus amyloliquefaciens'],
      application_modes: ['Via Foliar', 'Tratamento de Sementes', 'Drench'],
    },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'TROIAN-1L' },
      { type: 'drum', volumeL: 20, sku: 'TROIAN-20L' },
    ],
  },
  {
    slug: 'biovas',
    name: 'Biovas',
    category: 'biologicos',
    tagline: 'Consórcio de 5 espécies de Bacillus para máxima atividade biológica',
    description:
      'Biológico com consórcio de 5 espécies de Bacillus: subtilis, aryabhattai, amyloliquefaciens, licheniformis e megaterium. Combina atividade de controle biológico (subtilis + amyloliquefaciens), solubilização de fosfato (megaterium + licheniformis) e fixação de nitrogênio atmosférico (aryabhattai). O consórcio mais amplo do portfólio Argho.',
    status: 'published' as const,
    composition: {
      others: {
        'Bacillus subtilis': 1,
        'Bacillus aryabhattai': 1,
        'Bacillus amyloliquefaciens': 1,
        'Bacillus licheniformis': 1,
        'Bacillus megaterium': 1,
      },
    },
    technicalSpecs: {
      product_type: 'Biológico — Consórcio Bacillus (5 espécies)',
      strains: [
        'Bacillus subtilis',
        'Bacillus aryabhattai',
        'Bacillus amyloliquefaciens',
        'Bacillus licheniformis',
        'Bacillus megaterium',
      ],
      application_modes: ['Via Foliar', 'Tratamento de Sementes', 'Drench', 'Via Fertirrigação'],
    },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'BIOVAS-1L' },
      { type: 'drum', volumeL: 20, sku: 'BIOVAS-20L' },
    ],
  },

  // ── ADJUVANTES ────────────────────────────────────────────────────────────
  {
    slug: 'operate-plus',
    name: 'Operate Plus',
    category: 'adjuvantes',
    tagline: 'Adjuvante espalhante adesivo premium com condicionador de pH',
    description:
      'Adjuvante espalhante adesivo de alto desempenho com condicionador de pH para caldas fitossanitárias e nutricionais. Reduz a tensão superficial da calda, aumenta a cobertura e penetração foliar e estabiliza o pH na faixa ideal de eficácia dos ativos. Formulação premium da linha Operate.',
    status: 'published' as const,
    composition: {},
    technicalSpecs: {
      product_type: 'Adjuvante Espalhante Adesivo / Condicionador de pH',
      application_modes: ['Calda Fitossanitária', 'Calda Foliar Nutricional'],
      linha: 'Operate',
    },
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
      'Adjuvante espalhante adesivo com óleo essencial de citronela. Combina a função de espalhante e condicionador de pH com o efeito repelente natural da citronela, indicado para programas de manejo integrado que valorizam insumos de menor impacto ambiental.',
    status: 'published' as const,
    composition: {},
    technicalSpecs: {
      product_type: 'Adjuvante Espalhante Adesivo com Óleo Essencial',
      application_modes: ['Calda Fitossanitária', 'Calda Foliar Nutricional'],
      linha: 'Operate',
      active_ingredient: 'Óleo essencial de citronela',
    },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'OPERATE-CITRONELA-1L' },
      { type: 'drum', volumeL: 20, sku: 'OPERATE-CITRONELA-20L' },
    ],
  },
  {
    slug: 'operate-4em1',
    name: 'Operate 4em1',
    category: 'adjuvantes',
    tagline: 'Adjuvante multifuncional: espalhante, adesivo, condicionador e anti-espumante',
    description:
      'Adjuvante multifuncional que reúne em uma única solução 4 funções: espalhante, adesivo, condicionador de pH e anti-espumante. Simplifica o preparo de caldas e garante máxima eficiência fitossanitária e nutricional com uma só adição ao tanque.',
    status: 'published' as const,
    composition: {},
    technicalSpecs: {
      product_type:
        'Adjuvante Multifuncional (Espalhante + Adesivo + Condicionador + Anti-espumante)',
      application_modes: ['Calda Fitossanitária', 'Calda Foliar Nutricional'],
      linha: 'Operate',
      functions: ['Espalhante', 'Adesivo', 'Condicionador de pH', 'Anti-espumante'],
    },
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
      'Adjuvante espalhante adesivo com óleo essencial de laranja (D-limoneno). Combina a eficiência do espalhante convencional com o poder solvente e penetrante do D-limoneno, potencializando a absorção cuticular de defensivos e nutrientes. Indicado para culturas de alto valor e programas de produção integrada.',
    status: 'published' as const,
    composition: {},
    technicalSpecs: {
      product_type: 'Adjuvante Espalhante Adesivo com Óleo Essencial',
      application_modes: ['Calda Fitossanitária', 'Calda Foliar Nutricional'],
      linha: 'Operate',
      active_ingredient: 'Óleo essencial de laranja (D-limoneno)',
    },
    packaging: [
      { type: 'bottle', volumeL: 1, sku: 'OPERATE-ORANGE-1L' },
      { type: 'drum', volumeL: 20, sku: 'OPERATE-ORANGE-20L' },
    ],
  },
] as const;

// ============================================================================
// Seed runner
// ============================================================================
async function run() {
  const sql = postgres(DB_URL!, { max: 1, onnotice: () => {} });

  try {
    console.log('🌱  Seeding database…');

    // ── Tenant Argho ──────────────────────────────────────────────────────
    const [tenant] = await sql`
      INSERT INTO public.tenants (slug, name, display_name, theme_tokens)
      VALUES (
        ${ARGHO_TENANT_SLUG},
        ${ARGHO_TENANT_NAME},
        ${ARGHO_TENANT_NAME},
        ${sql.json(JSON.parse(JSON.stringify(ARGHO_THEME_TOKENS)))}
      )
      ON CONFLICT (slug) DO UPDATE
        SET theme_tokens = EXCLUDED.theme_tokens,
            display_name = EXCLUDED.display_name
      RETURNING id, slug
    `;
    console.log(`  ✅  Tenant: ${tenant?.slug} (${tenant?.id})`);
    const tenantId = tenant?.id as string;

    // ── Categorias ────────────────────────────────────────────────────────
    const categoryIds: Record<string, string> = {};
    for (const cat of CATEGORIES) {
      const [row] = await sql`
        INSERT INTO public.product_categories (tenant_id, slug, name, sort_order)
        VALUES (${tenantId}, ${cat.slug}, ${cat.name}, ${cat.sortOrder})
        ON CONFLICT (tenant_id, slug) DO UPDATE
          SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order
        RETURNING id, slug
      `;
      categoryIds[cat.slug] = row?.id as string;
      console.log(`  ✅  Categoria: ${cat.name}`);
    }

    // ── Produtos ──────────────────────────────────────────────────────────
    for (const product of PRODUCTS) {
      const catId = categoryIds[product.category];
      await sql`
        INSERT INTO public.products (
          tenant_id, category_id, slug, name, tagline, description,
          status, composition, technical_specs, packaging, applications,
          published_at
        )
        VALUES (
          ${tenantId},
          ${catId ?? null},
          ${product.slug},
          ${product.name},
          ${product.tagline},
          ${product.description},
          ${product.status},
          ${sql.json(JSON.parse(JSON.stringify(product.composition)))},
          ${sql.json(JSON.parse(JSON.stringify(product.technicalSpecs)))},
          ${sql.json(JSON.parse(JSON.stringify(product.packaging)))},
          ${sql.json([])},
          ${product.status === 'published' ? new Date().toISOString() : null}
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE
          SET
            name            = EXCLUDED.name,
            tagline         = EXCLUDED.tagline,
            description     = EXCLUDED.description,
            status          = EXCLUDED.status,
            composition     = EXCLUDED.composition,
            technical_specs = EXCLUDED.technical_specs,
            packaging       = EXCLUDED.packaging,
            updated_at      = now()
      `;
      console.log(`  ✅  Produto: ${product.name}`);
    }

    console.log(
      `\n✅  Seed concluído — ${PRODUCTS.length} produtos, ${CATEGORIES.length} categorias.`,
    );
  } catch (err) {
    console.error('❌  Seed failed:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
