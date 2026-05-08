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

export type GenerateResult = {
  pdf: Buffer;
  /** HTML renderizado (útil para debug) */
  html: string;
};
