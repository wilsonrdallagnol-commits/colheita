// packages/generator/src/types.ts

export interface ProductComposition {
  macros?: Record<string, number>; // { N: 10, P2O5: 5, K2O: 6 }
  micros?: Record<string, number>; // { Fe: 7.0, Zn: 0.8 }
  others?: Record<string, number>;
}

export type PackagingUnit = {
  type: 'bag' | 'ibc' | 'drum' | 'bottle' | 'other';
  weightKg?: number;
  volumeL?: number;
  sku?: string;
};

export interface ProductApplication {
  crop: string;
  stage?: string;
  dosePerHa: number;
  unit: 'kg' | 'l' | 'g' | 'ml';
  notes?: string;
}

export interface FichaTecnicaData {
  /** Nome comercial do produto */
  productName: string;
  tagline?: string;
  description?: string;
  /** Composição garantida — macros, micros e outros */
  composition: ProductComposition;
  /** Especificações técnicas livres (pH, densidade, formulação, etc.) */
  technicalSpecs: Record<string, unknown>;
  /** Apresentações comerciais */
  packaging: PackagingUnit[];
  /** Indicações por cultura */
  applications: ProductApplication[];
  /** Nome do fabricante/tenant */
  tenantName: string;
  tenantLogoUrl?: string;
  /** Número de registro MAPA (opcional) */
  mapaRegistration?: string;
  /** Ano de emissão para o rodapé */
  year?: number;
}

export interface GenerateOptions {
  /** Formato do papel. Padrão: A4 */
  format?: 'A4' | 'Letter';
  /** Orientação. Padrão: portrait */
  landscape?: boolean;
  /** Caminho do executável Chromium (para ambientes CI sem browser instalado) */
  executablePath?: string;
}

// ---------------------------------------------------------------------------
// Catálogo consolidado (Camada 3 — Geração de Materiais)
// ---------------------------------------------------------------------------

export interface CatalogoProduto {
  /** ID interno (referência para auditoria em generated_materials) */
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  categoryName?: string;
  composition: ProductComposition;
  packaging: PackagingUnit[];
  applications: ProductApplication[];
  mapaRegistration?: string;
}

export interface CatalogoData {
  /** Nome do tenant (Argho) — vai no header de toda página */
  tenantName: string;
  tenantLogoUrl?: string;
  /** Lista de produtos publicados a incluir no catálogo */
  produtos: CatalogoProduto[];
  /** Ano para o rodapé */
  year?: number;
  /** Texto de subtítulo opcional (ex: "Linha completa Argho — Safra 2026") */
  subtitle?: string;
}

// ---------------------------------------------------------------------------
// Banner Social (Camada 3 — formato OG/LinkedIn 1200x630)
// ---------------------------------------------------------------------------

export interface BannerSocialData {
  /** Nome comercial do produto (vira hero do banner em CAPS) */
  productName: string;
  /** Tagline curta (até ~80 chars). Aparece abaixo do nome em peso menor. */
  tagline?: string;
  /** Categoria do produto — vira eyebrow no topo (ex: "FERTILIZANTE FOLIAR") */
  categoryName?: string;
  /** Composição NPK resumida (ex: "10-00-06") — opcional, vira chip destaque */
  npkLabel?: string;
  /** Número de registro MAPA — opcional, vira badge pequeno no rodapé */
  mapaRegistration?: string;
  /** Nome do tenant — vira lockup no canto inferior */
  tenantName: string;
  /** Logo do tenant (PNG/SVG via URL absoluta). Se omitido, usa só o nome. */
  tenantLogoUrl?: string;
}

export interface BannerOptions {
  /** Caminho do executável Chromium (CI sem browser instalado) */
  executablePath?: string;
}

export interface BannerResult {
  /** PNG do banner em formato OG/LinkedIn (1200x630px @ 2x = 2400x1260) */
  png: Buffer;
  /** HTML renderizado (debug) */
  html: string;
}

// ---------------------------------------------------------------------------
// Dossiê Compliance (Camada 9 — Compliance & Regulatório)
// ---------------------------------------------------------------------------

export interface DossieRegistration {
  /** Nome do produto associado */
  productName: string;
  productSlug?: string;
  /** Categoria (ex: "Fertilizante mineral") */
  productCategory?: string;
  /** Autoridade emissora — MAPA, ANVISA, IBAMA, STATE, OTHER */
  authority: 'MAPA' | 'ANVISA' | 'IBAMA' | 'STATE' | 'OTHER';
  /** Número do registro */
  registrationNo: string;
  /** Data de emissão (ISO 8601 ou null) */
  issuedAt?: string;
  /** Data de vencimento (ISO 8601 ou null) */
  expiresAt?: string;
  /** Status legal: active, expired, pending, revoked */
  status: 'active' | 'expired' | 'pending' | 'revoked';
  /** URL do documento original (link no PDF) */
  documentUrl?: string;
  /** Observações regulatórias livres */
  notes?: string;
}

export interface DossieData {
  /** Nome do tenant — vai no header de toda página */
  tenantName: string;
  tenantLogoUrl?: string;
  /** Lista completa de registros regulatórios */
  registrations: DossieRegistration[];
  /** Data de geração formatada (gerado em DD/MM/YYYY) */
  generatedAtLabel?: string;
  /** Stats agregadas calculadas pelo caller (visibilidade rápida na capa) */
  stats?: {
    total: number;
    active: number;
    expired: number;
    pending: number;
    expiringIn30d: number;
  };
}

// ---------------------------------------------------------------------------
// Proposta Comercial (Camada 7 mov 3 — link CRM ↔ PIM)
// ---------------------------------------------------------------------------

export interface PropostaItem {
  /** Nome do produto */
  productName: string;
  /** Tagline opcional do produto (vai no subtítulo) */
  tagline?: string;
  /** Embalagem/apresentação selecionada (ex: "Tambor 200L") */
  packaging?: string;
  /** Dose recomendada (ex: "1.5 L/ha") */
  dose?: string;
  /** Quantidade (em unidades — bombonas, sacos, etc) */
  quantity: number;
  /** Unidade da quantity (ex: "tambores", "sacos") */
  unit?: string;
  /** Preço unitário em BRL */
  unitPrice: number;
  /** Composição NPK label (opcional, ex: "10-00-06") */
  npkLabel?: string;
  /** Registro MAPA (opcional) */
  mapaRegistration?: string;
}

export interface PropostaData {
  /** Tenant emissor (Argho) */
  tenantName: string;
  tenantLogoUrl?: string;

  /** Cliente — vem do lead */
  clientName: string;
  clientCompany?: string;
  clientCpfCnpj?: string;
  clientCity?: string;
  clientState?: string;

  /** Cultura/área pra contextualizar a recomendação */
  cultura?: string;
  areaHectares?: number;

  /** Itens da proposta (produtos do PIM com qty + preço) */
  items: PropostaItem[];

  /** Desconto global em % (0-100) opcional. Aplicado sobre subtotal. */
  discountPercent?: number;

  /** Validade da proposta (ex: "Válida até 30/05/2026") */
  validUntilLabel?: string;

  /** Termos de pagamento livres (ex: "30/60/90 dias") */
  paymentTerms?: string;

  /** Observações livres do comercial */
  notes?: string;

  /** Número da proposta (gerado pelo caller, ex: "PROP-2026-0042") */
  proposalNumber: string;

  /** Data formatada pt-BR de emissão */
  issuedAtLabel: string;

  /** Nome do vendedor responsável */
  salesPersonName?: string;
  salesPersonEmail?: string;
}

export type GenerateResult = {
  pdf: Buffer;
  /** HTML renderizado (útil para debug) */
  html: string;
};
