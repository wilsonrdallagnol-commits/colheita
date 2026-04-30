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
    safraCodigo: 'ARG-XCENSIS',
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
  },
  {
    slug: 'stron',
    safraCodigo: 'ARG-STRON',
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
    safraCodigo: 'ARG-GROW-FILL',
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
    applications: [
      {
        crop: 'Tomate',
        stage: 'Frutificação até maturação',
        dosePerHa: 1.5,
        unit: 'l',
        notes: 'Previne podridão apical. Intervalo de 7–10 dias.',
      },
      {
        crop: 'Alface',
        stage: 'Toda a produção',
        dosePerHa: 0.5,
        unit: 'l',
        notes: 'Via fertirrigação semanal.',
      },
      {
        crop: 'Maçã',
        stage: 'Pós-florescimento e pré-colheita',
        dosePerHa: 1.0,
        unit: 'l',
        notes: 'Reduz bitter-pit e russeting.',
      },
      {
        crop: 'Banana',
        stage: 'Desenvolvimento do cacho',
        dosePerHa: 1.0,
        unit: 'l',
        notes: 'Aplicar via foliar no coração do cacho.',
      },
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
    applications: [
      {
        crop: 'Soja',
        stage: 'V3 (pré-inoculação)',
        dosePerHa: 500,
        unit: 'g',
        notes: 'Não misturar com inoculante no tanque. Aplicar separadamente.',
      },
      {
        crop: 'Milho',
        stage: 'V4–V6',
        dosePerHa: 400,
        unit: 'g',
        notes: 'Favorece enraizamento e antecipa o florescimento.',
      },
      {
        crop: 'Girassol',
        stage: 'Pré-florescimento',
        dosePerHa: 400,
        unit: 'g',
        notes: 'B essencial para fertilização do grão.',
      },
    ],
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
// Academia — Trilhas, Módulos e Lições
// ============================================================================

const TRACKS = [
  {
    slug: 'micronutrientes-na-agricultura',
    title: 'Micronutrientes na Agricultura Moderna',
    subtitle: 'Fundamentos, deficiências e correção com produtos de alta eficiência',
    description:
      'Trilha completa sobre o papel dos micronutrientes na nutrição vegetal, diagnóstico de deficiências e correção com fertilizantes minerais complexados. Ao final, o aluno será capaz de indicar o produto certo para cada situação.',
    audience: ['Vendedores Técnicos', 'Distribuidores', 'Técnicos Agrícolas'],
    level: 'beginner' as const,
    estimated_minutes: 90,
    grants_certification: true,
    certification_validity_days: 730,
    sort_order: 1,
    modules: [
      {
        slug: 'fundamentos-de-micronutrientes',
        title: 'Fundamentos dos Micronutrientes',
        description: 'O que são, por que importam e como diagnosticar deficiências no campo.',
        sort_order: 1,
        lessons: [
          {
            slug: 'o-que-sao-micronutrientes',
            title: 'O Que São Micronutrientes?',
            type: 'article' as const,
            estimated_minutes: 10,
            is_required: true,
            sort_order: 1,
            content: {
              markdown: `# O Que São Micronutrientes?

Micronutrientes são elementos essenciais absorvidos pelas plantas em pequenas quantidades — tipicamente menos de 100 mg/kg de matéria seca. Apesar da quantidade diminuta, sua ausência compromete funções metabólicas críticas que não podem ser substituídas por nenhum outro elemento.

## Os 8 micronutrientes essenciais

| Elemento | Símbolo | Função principal |
|---|---|---|
| Boro | B | Formação de parede celular, polinização, transporte de açúcares |
| Cobre | Cu | Fotossíntese, síntese de lignina, respiração celular |
| Ferro | Fe | Síntese de clorofila, transporte de elétrons |
| Manganês | Mn | Fotossíntese (fotossistema II), ativação enzimática |
| Molibdênio | Mo | Fixação biológica de N, redução de nitrato |
| Zinco | Zn | Síntese de auxinas, ativação de mais de 300 enzimas |
| Cloro | Cl | Osmorregulaçãoo, turgor |
| Níquel | Ni | Metabolismo do nitrogênio (urease) |

## Por que a quantidade não é tudo

A relação entre micronutrientes e produtividade não é linear. A **Lei do Mínimo de Liebig** ainda se aplica: o crescimento é limitado pelo nutriente mais escasso, independentemente da abundância dos demais.

Em solos com alta tecnologia agronômica — alta produtividade, alta exportação de grãos, sistema radicular comprimido por compactação — os micronutrientes se tornam fatores limitantes com frequência crescente.

## Formas de fornecimento

Há três formas principais de fornecer micronutrientes:

1. **Via Solo**: maior reservatório, mas disponibilidade limitada por pH, oxidação e imobilização.
2. **Via Semente**: eficiente para Mo e Zn em doses baixas.
3. **Via Foliar**: rota direta — contorna limitações do solo. É aqui que os produtos Argho se destacam.

A foliar é especialmente eficiente quando o solo está limitante (seca, pH inadequado, compactação) ou quando a demanda é pontual e intensa (florescimento, enchimento de grãos).`,
            },
          },
          {
            slug: 'diagnostico-de-deficiencias',
            title: 'Diagnóstico de Deficiências no Campo',
            type: 'article' as const,
            estimated_minutes: 15,
            is_required: true,
            sort_order: 2,
            content: {
              markdown: `# Diagnóstico de Deficiências no Campo

Identificar deficiências de micronutrientes precocemente é o que separa um programa nutricional reativo de um proativo. Os sintomas visuais surgem após a deficiência já ter impactado a fisiologia da planta — antecipar via análise foliar e histórico de área é sempre mais eficiente.

## Sintomas visuais por elemento

### Ferro (Fe)
**Clorose internerval em folhas novas.** O Fe é pouco móvel no floema — quando falta, os tecidos jovens são afetados primeiro. Soja em solos com pH elevado é altamente suscetível.

### Manganês (Mn)
**Clorose internerval com manutenção do verde nas nervuras** — diferente do Fe, o Mn causa um mosaico mais difuso. Frequente em solos arenosos e com alto pH.

### Zinco (Zn)
**Folhas pequenas, entrenós curtos, bronzeamento em milho.** O Zn inibe a síntese de auxinas (IAA), causando internódios curtos ("canivete" em milho jovem).

### Boro (B)
**Morte do meristema apical, frutos deformados, casca rachada.** O B é essencial para a elongação celular e polinização. Em soja: vagens vazias e irregulares.

### Cobre (Cu)
**Folhas enroladas, azuladas ou com manchas necróticas nas pontas.** Frequente em solos orgânicos onde o Cu é quelado pela matéria orgânica.

### Molibdênio (Mo)
**Clorose generalizada + margeamento em folhas mais velhas (Mb é móvel).** Crítico para fixação de N em soja — deficiência de Mo mimetiza deficiência de N.

## Análise foliar: o método objetivo

A visualização de sintomas é útil, mas a análise foliar quantifica a real disponibilidade do elemento na planta:

- **Coleta**: folha diagnóstica (3° folha do topo) em estádio específico por cultura
- **Timing**: durante período crítico de demanda
- **Interpretação**: comparar com faixas de suficiência da literatura (EMBRAPA, IAC)

O ideal é cruzar análise foliar com análise de solo para entender se o problema é de disponibilidade no solo ou de absorção pela planta.`,
            },
          },
        ],
      },
      {
        slug: 'xcensis-aplicacoes-e-resultados',
        title: 'Xcensis — Aplicações e Resultados',
        description: 'Protocolo de uso, doses e resultados documentados do Xcensis em campo.',
        sort_order: 2,
        lessons: [
          {
            slug: 'xcensis-perfil-do-produto',
            title: 'Xcensis — Perfil Completo do Produto',
            type: 'article' as const,
            estimated_minutes: 12,
            is_required: true,
            sort_order: 1,
            content: {
              markdown: `# Xcensis — Perfil Completo do Produto

**Número de Registro MAPA: PR 002049-4.000006**

## O que é o Xcensis?

O Xcensis é um fertilizante mineral misto com formulação europeia (Espanha) especialmente desenvolvido para fornecer múltiplos micronutrientes via foliar e fertirrigação com alta eficiência de absorção.

## Composição Garantida

| Nutriente | Teor | Complexante |
|---|---|---|
| Ferro (Fe) | 7,0% | EDTA + Lignossulfonatos |
| Manganês (Mn) | 3,5% | EDTA + Lignossulfonatos |
| Zinco (Zn) | 0,8% | EDTA + Lignossulfonatos |
| Boro (B) | 0,7% | Sacarídeos |
| Cobre (Cu) | 0,4% | EDTA |
| Molibdênio (Mo) | 0,3% | — |
| Potássio (K₂O) | 4,0% | — |

## Por que a complexação importa?

Os micronutrientes no Xcensis são complexados com **EDTA (Etilenodiaminotetraacético)** e **Lignossulfonatos** — moléculas orgânicas que formam anéis ao redor do íon metálico, protegendo-o de:

- **Precipitação**: o Fe2+ livre oxida a Fe3+ e precipita rapidamente. Complexado, mantém-se solúvel.
- **Antagonismo iônico**: Ca²⁺ e Mg²⁺ em alta concentração competem com micronutrientes na absorção foliar. O complexo EDTA reduz esse efeito.
- **Degradação UV**: em caldas expostas ao sol, micronutrientes livres degradam mais rápido.

## pH 6 — compatibilidade com biológicos

O pH 6 do Xcensis é cuidadosamente controlado para:
1. Manter a solubilidade de todos os micronutrientes
2. Ser compatível com a maioria dos biológicos (Bacillus spp. prosperam entre pH 6–8)
3. Minimizar corrosão de tanques e bicos

## Apresentações comerciais

- **Saco 1 kg** (SKU: XCENSIS-1KG): ideal para testes em parcelas e pequenas áreas
- **Saco 5 kg** (SKU: XCENSIS-5KG): volume para propriedades médias

## Dose e modo de aplicação

| Cultura | Estádio | Dose | Intervalo |
|---|---|---|---|
| Soja | V3–R1 | 300–500 g/ha | 14–21 dias |
| Milho | V4–VT | 400–600 g/ha | 14–21 dias |
| Café | Vegetativo/Granação | 500–700 g/ha | 21–28 dias |
| Hortaliças | Todas as fases | 300–400 g/ha | 7–14 dias |

Misturar em calda com adjuvante Operate Plus (100 mL/100 L de calda) para maximizar cobertura e penetração foliar.`,
            },
          },
          {
            slug: 'xcensis-programa-nutricional',
            title: 'Montando um Programa Nutricional com Xcensis',
            type: 'article' as const,
            estimated_minutes: 15,
            is_required: true,
            sort_order: 2,
            content: {
              markdown: `# Montando um Programa Nutricional com Xcensis

## O conceito de programa nutricional

Aplicação única raramente resolve deficiências crônicas. Um programa nutricional eficaz distribui as aplicações ao longo do ciclo da cultura, suprindo a demanda no momento de maior necessidade fisiológica.

## Programa básico para soja

**Objetivo**: garantir suprimento de micronutrientes desde a emergência até o enchimento de grãos.

### Aplicação 1 — V3 (3 folhas trifolioladas)
- **Produto**: Xcensis 400 g/ha
- **Mistura**: Algen 0,5 L/ha + Operate Plus 100 mL/100 L
- **Objetivo**: estimular sistema radicular (P + K do Algen) + corrigir micronutrientes iniciais

### Aplicação 2 — V6
- **Produto**: Xcensis 500 g/ha + Stron 0,5 L/ha
- **Objetivo**: manutenção nutricional + NPK em dose baixa para intensificar metabolismo

### Aplicação 3 — R1 (início do florescimento)
- **Produto**: Xcensis 400 g/ha + Grow Mob 400 g/ha
- **Objetivo**: B e Mo para florescimento + fixação biológica de N

### Aplicação 4 — R3 (início do enchimento)
- **Produto**: Grow Filling 400 g/ha
- **Objetivo**: K concentrado para enchimento de grãos

## Mistura em tanque — checklist

Antes de preparar a calda:
- [ ] Verificar pH da água (ideal 5,5–6,5). Se necessário, usar Operate Plus para corrigir
- [ ] Ordem de adição: água → produtos sólidos → líquidos → adjuvante por último
- [ ] Fazer teste de jar (mistura em balde de 5 L antes do tanque)
- [ ] Observar temperatura (acima de 30°C aumenta risco de precipitação)

## Compatibilidade

O Xcensis é **compatível** com:
- Troian e Biovas (biológicos Bacillus)
- Stron, Grow Filling, Grow Calcium, Grow Mob
- A maioria dos fungicidas e inseticidas (verificar bula)

**Evitar** mistura com:
- Fosfatos concentrados (risco de precipitação de micronutrientes)
- Produtos com pH < 4 (desnaturação dos complexantes)`,
            },
          },
        ],
      },
    ],
  },
  {
    slug: 'nutricao-foliar-de-alta-eficiencia',
    title: 'Nutrição Foliar de Alta Eficiência',
    subtitle: 'Princípios, tecnologias e resultados práticos com o portfólio Argho',
    description:
      'Trilha intermediária que aprofunda os princípios da nutrição foliar e apresenta o portfólio completo de nutrição Argho. Para quem já conhece os fundamentos e quer dominar a argumentação técnica de vendas.',
    audience: ['Vendedores Técnicos', 'Técnicos Agrícolas'],
    level: 'intermediate' as const,
    estimated_minutes: 120,
    grants_certification: true,
    certification_validity_days: 365,
    sort_order: 2,
    modules: [
      {
        slug: 'principios-da-nutricao-foliar',
        title: 'Princípios da Nutrição Foliar',
        description: 'Como os nutrientes penetram na folha e o que determina a eficiência.',
        sort_order: 1,
        lessons: [
          {
            slug: 'como-nutrientes-penetram-na-folha',
            title: 'Como os Nutrientes Penetram na Folha',
            type: 'article' as const,
            estimated_minutes: 15,
            is_required: true,
            sort_order: 1,
            content: {
              markdown: `# Como os Nutrientes Penetram na Folha

A nutrição foliar é frequentemente mal compreendida no mercado. Não é "qualquer líquido jogado na planta" — é uma rota metabólica específica com princípios biofísicos bem definidos.

## A cutícula: a principal barreira

A superfície foliar é coberta por uma cutícula composta por:
- **Ceras epicuticulares**: camada exterior hidrofóbica (barreira primária)
- **Cutina**: polímero de ácidos graxos (barreira secundária)
- **Pectina**: zona aquosa na base (via de entrada de íons hidrofílicos)

## Duas vias de entrada

### Via estomática
Os estômatos são poros naturais para trocas gasosas. São hidrofílicos e permitem entrada de soluções aquosas. **Limitação**: fecham com calor (acima de 30°C) e durante a noite.

**Recomendação prática**: aplicar nas horas mais frescas do dia — cedo pela manhã ou fim da tarde. Temperatura de calda abaixo de 28°C.

### Via cuticular apoplástica
Íons podem penetrar através de "buracos aquosos" (aqueous pores) na cutícula. Esta via é favorecida por:
- **Tamanho molecular pequeno**: moléculas menores penetram mais
- **Surfactantes**: reduzem a tensão superficial, aumentando molhamento e penetração
- **Hidratação da cera**: temperaturas amenas + umidade relativa acima de 60%

## O papel dos adjuvantes

Aqui entra o Operate Plus. Um adjuvante espalhante adesivo:
1. **Reduz tensão superficial** de ~70 mN/m (água pura) para ~30 mN/m
2. **Aumenta área de cobertura**: gotas se espalham em vez de escorrer
3. **Prolonga tempo de secagem**: mais tempo de contato = mais absorção
4. **Corrige pH**: pH ácido favorece a forma não ionizada de muitos nutrientes (maior lipossolubilidade)

## Fatores que determinam eficiência

| Fator | Impacto | Recomendação |
|---|---|---|
| Temperatura | Alto | Aplicar abaixo de 28°C |
| Umidade relativa | Alto | >60% UR ideal |
| Estádio da planta | Médio | Folhas jovens absorvem mais |
| pH da calda | Alto | 5,5–6,5 ideal |
| Tamanho de gota | Alto | 200–400 μm, cobertura uniforme |
| Adjuvante | Muito alto | Sempre usar com foliar |`,
            },
          },
        ],
      },
      {
        slug: 'portfolio-foliar-argho',
        title: 'Portfólio de Nutrição Foliar Argho',
        description: 'Cada produto, quando usar e como argumentar tecnicamente.',
        sort_order: 2,
        lessons: [
          {
            slug: 'npk-foliar-stron',
            title: 'NPK Foliar: Stron e suas Aplicações',
            type: 'article' as const,
            estimated_minutes: 12,
            is_required: true,
            sort_order: 1,
            content: {
              markdown: `# NPK Foliar: Stron e suas Aplicações

## O que é o Stron?

O **Stron** (N 4,5% | P₂O₅ 2% | K₂O 7,2%) é um fertilizante mineral misto fluido com NPK equilibrado para nutrição foliar, enriquecido com **aminoácidos** e **ácidos carboxílicos** de origem orgânica.

**Registro MAPA: PR 002049-4.000014**

## Diferenciais técnicos

### Aminoácidos: mais que um rótulo
Os aminoácidos no Stron (de origem hidrolisada) não são apenas "biostimulantes de marketing". Eles:
- Fornecem N pré-formado (não precisa de fixação ou redução de nitrato)
- Atuam como agentes quelantes fracos, melhorando a absorção de cátions
- Estimulam atividade rizosférica quando chegam ao solo via escorrimento

### Ácidos carboxílicos
Aumentam a permeabilidade da cutícula e agem como veículo para os íons NPK — similar ao mecanismo de surfactante natural.

## Quando usar Stron?

### Situação 1: Demanda intensa de K no enchimento
O K₂O 7,2% posiciona o Stron como suporte ao Grow Filling em programas mais intensivos. Combinar: **Stron 0,5 L/ha + Grow Filling 300 g/ha** em R3.

### Situação 2: Corrida de safra — produto único para NPK
Em situações de logística difícil ou baixo custo por hectare, o Stron oferece N+P+K em um único produto. Dose: 1–1,5 L/ha.

### Situação 3: Pós-estresse
Após geadas, granizos ou períodos de seca, o N+aminoácidos do Stron acelera a recuperação metabólica da planta.

## Embalagens
- Frasco 1 L (SKU: STRON-1L)
- Tambor 20 L (SKU: STRON-20L)`,
            },
          },
          {
            slug: 'potassio-para-enchimento-grow-filling',
            title: 'Potássio para Enchimento de Grãos: Grow Filling',
            type: 'article' as const,
            estimated_minutes: 10,
            is_required: true,
            sort_order: 2,
            content: {
              markdown: `# Potássio para Enchimento de Grãos: Grow Filling

## O diferencial do K₂O 35%

O **Grow Filling** (N 2% | K₂O 35%) é o produto mais concentrado em potássio do portfólio Argho. Com 35% de K₂O na formulação sólida, uma dose de 500 g/ha fornece 175 g de K₂O por hectare — equivalente a aplicações via solo que levam semanas para serem absorvidas.

**Registro MAPA: PR 002049-4.000003**

## Por que K no enchimento de grãos?

Durante R3–R6 (enchimento) em soja, a demanda de K é máxima porque:
1. **Transporte de fotoassimilados**: K é essencial para a abertura e fechamento do floema (carregamento de sacarose para os grãos)
2. **Qualidade proteica**: K regula a síntese de proteínas de reserva
3. **Turgor celular**: mantém as vagens tensionadas, reduzindo aborto de sementes

Em solos com histórico de alta produtividade, o K disponível pode ser esgotado antes do final do ciclo — especialmente em solos arenosos com alta lixiviação.

## Aplicação prática

**Dose**: 400–600 g/ha
**Estádio**: R3 (início do enchimento) em soja; R4–R5 em milho
**Mistura**: Grow Filling + Xcensis (micronutrientes) + Operate Plus

A combinação Grow Filling + Xcensis é chamada de "dupla final" no portfólio Argho — K concentrado + micronutrientes quelados em uma só passagem.

## Forma sólida — por quê?

A forma sólida permite maior concentração de K₂O sem os problemas de viscosidade e pH que líquidos concentrados em K teriam. Dissolve completamente em água a 20°C em menos de 2 minutos com agitação leve.`,
            },
          },
        ],
      },
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
          safra_codigo, published_at
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
          ${sql.json(JSON.parse(JSON.stringify('applications' in product ? product.applications : [])))},
          ${'safraCodigo' in product ? product.safraCodigo : null},
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
            applications    = EXCLUDED.applications,
            safra_codigo    = EXCLUDED.safra_codigo,
            updated_at      = now()
      `;
      console.log(`  ✅  Produto: ${product.name}`);
    }

    // ── Registros MAPA ────────────────────────────────────────────────────
    // Produto lookup por slug para obter IDs
    const productRows = await sql<{ id: string; slug: string }[]>`
      SELECT id, slug FROM public.products WHERE tenant_id = ${tenantId}
    `;
    const productIdBySlug: Record<string, string> = {};
    for (const row of productRows) productIdBySlug[row.slug] = row.id;

    for (const product of PRODUCTS) {
      const regNo =
        'technicalSpecs' in product &&
        typeof product.technicalSpecs === 'object' &&
        product.technicalSpecs !== null &&
        'registration_mapa' in product.technicalSpecs
          ? (product.technicalSpecs.registration_mapa as string)
          : null;

      if (!regNo) continue;

      const productId = productIdBySlug[product.slug];
      if (!productId) continue;

      const regDate =
        'technicalSpecs' in product &&
        typeof product.technicalSpecs === 'object' &&
        product.technicalSpecs !== null &&
        'registration_date' in product.technicalSpecs
          ? (product.technicalSpecs.registration_date as string)
          : null;

      await sql`
        INSERT INTO public.regulatory_registrations (
          tenant_id, product_id, authority, registration_no, issued_at, status
        )
        SELECT ${tenantId}, ${productId}, 'MAPA', ${regNo}, ${regDate}, 'active'
        WHERE NOT EXISTS (
          SELECT 1 FROM public.regulatory_registrations
          WHERE tenant_id = ${tenantId}
            AND product_id = ${productId}
            AND authority = 'MAPA'
        )
      `;
      console.log(`  ✅  MAPA: ${product.name} — ${regNo}`);
    }

    // ── Trilhas de aprendizado ────────────────────────────────────────────
    let totalLessons = 0;
    for (const track of TRACKS) {
      const [trackRow] = await sql`
        INSERT INTO public.learning_tracks (
          tenant_id, slug, title, subtitle, description,
          audience, level, estimated_minutes,
          grants_certification, certification_validity_days,
          sort_order, status, published_at
        )
        VALUES (
          ${tenantId},
          ${track.slug},
          ${track.title},
          ${track.subtitle},
          ${track.description},
          ${sql.array(track.audience as unknown as string[])},
          ${track.level},
          ${track.estimated_minutes},
          ${track.grants_certification},
          ${track.certification_validity_days},
          ${track.sort_order},
          'published',
          now()
        )
        ON CONFLICT (tenant_id, slug) DO UPDATE
          SET
            title                        = EXCLUDED.title,
            subtitle                     = EXCLUDED.subtitle,
            description                  = EXCLUDED.description,
            level                        = EXCLUDED.level,
            estimated_minutes            = EXCLUDED.estimated_minutes,
            grants_certification         = EXCLUDED.grants_certification,
            certification_validity_days  = EXCLUDED.certification_validity_days,
            sort_order                   = EXCLUDED.sort_order,
            updated_at                   = now()
        RETURNING id, slug
      `;
      const trackId = trackRow?.id as string;
      console.log(`  ✅  Trilha: ${track.title}`);

      for (const mod of track.modules) {
        const [modRow] = await sql`
          INSERT INTO public.learning_modules (
            tenant_id, track_id, slug, title, description, sort_order
          )
          VALUES (
            ${tenantId}, ${trackId}, ${mod.slug},
            ${mod.title}, ${mod.description}, ${mod.sort_order}
          )
          ON CONFLICT (track_id, slug) DO UPDATE
            SET title = EXCLUDED.title,
                description = EXCLUDED.description,
                sort_order = EXCLUDED.sort_order,
                updated_at = now()
          RETURNING id, slug
        `;
        const moduleId = modRow?.id as string;

        for (const lesson of mod.lessons) {
          await sql`
            INSERT INTO public.learning_lessons (
              tenant_id, module_id, slug, title, type,
              content, estimated_minutes, is_required, sort_order
            )
            VALUES (
              ${tenantId}, ${moduleId}, ${lesson.slug},
              ${lesson.title}, ${lesson.type},
              ${sql.json(lesson.content)},
              ${lesson.estimated_minutes},
              ${lesson.is_required},
              ${lesson.sort_order}
            )
            ON CONFLICT (module_id, slug) DO UPDATE
              SET title = EXCLUDED.title,
                  content = EXCLUDED.content,
                  estimated_minutes = EXCLUDED.estimated_minutes,
                  is_required = EXCLUDED.is_required,
                  sort_order = EXCLUDED.sort_order,
                  updated_at = now()
          `;
          totalLessons++;
        }
      }
    }

    console.log(
      `\n✅  Seed concluído — ${PRODUCTS.length} produtos, ${CATEGORIES.length} categorias, ${TRACKS.length} trilhas, ${totalLessons} lições.`,
    );
  } catch (err) {
    console.error('❌  Seed failed:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
