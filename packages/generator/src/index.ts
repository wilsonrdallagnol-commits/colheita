// packages/generator/src/index.ts
import { createElement } from 'react';
import { renderToPdf } from './render.js';
import { Catalogo } from './templates/Catalogo.js';
import { FichaTecnica } from './templates/FichaTecnica.js';
import type { CatalogoData, FichaTecnicaData, GenerateOptions, GenerateResult } from './types.js';

export { type GenerateFromSpecOptions, generateFromRenderSpec } from './generate-spec.js';
export { Catalogo } from './templates/Catalogo.js';
export { FichaTecnica } from './templates/FichaTecnica.js';
export { RenderSpecLayout } from './templates/RenderSpecLayout.js';
export type {
  CatalogoData,
  CatalogoProduto,
  FichaTecnicaData,
  GenerateOptions,
  GenerateResult,
  PackagingUnit,
  ProductApplication,
  ProductComposition,
} from './types.js';

/**
 * Gera o PDF de uma Ficha Técnica de produto.
 *
 * @example
 * ```ts
 * import { generateFichaTecnica } from '@colheita/generator';
 *
 * const result = await generateFichaTecnica({
 *   productName: 'Xcensis 10-00-06',
 *   tenantName: 'Argho AgriSciences',
 *   composition: { macros: { N: 10, K2O: 6 }, micros: { Zn: 0.5 } },
 *   technicalSpecs: { 'Formulação': 'Líquida', 'pH': '6.5–7.0', 'Densidade': '1.25 g/mL' },
 *   packaging: [{ type: 'bottle', volumeL: 1 }, { type: 'drum', volumeL: 200 }],
 *   applications: [{ crop: 'Soja', stage: 'V3–V6', dosePerHa: 1.5, unit: 'l' }],
 * });
 *
 * await fs.writeFile('ficha-xcensis.pdf', result.pdf);
 * ```
 */
export async function generateFichaTecnica(
  data: FichaTecnicaData,
  options?: GenerateOptions,
): Promise<GenerateResult> {
  const element = createElement(FichaTecnica, { data });
  return renderToPdf(element, options);
}

/**
 * Gera o Catálogo consolidado da Argho — todos os produtos publicados em 1 PDF
 * com capa, sumário e 1 página resumida por produto.
 *
 * Útil para distribuição em massa pelo comercial/marketing ("manda o catálogo
 * Argho atualizado") sem ter que mandar 18 fichas técnicas separadas.
 *
 * Para detalhe técnico completo de um único produto, use `generateFichaTecnica`.
 *
 * @example
 * ```ts
 * const result = await generateCatalogo({
 *   tenantName: 'Argho AgriSciences',
 *   year: 2026,
 *   subtitle: 'Linha completa Safra 2026',
 *   produtos: [...],
 * });
 * await fs.writeFile('catalogo-argho-2026.pdf', result.pdf);
 * ```
 */
export async function generateCatalogo(
  data: CatalogoData,
  options?: GenerateOptions,
): Promise<GenerateResult> {
  const element = createElement(Catalogo, { data });
  return renderToPdf(element, options);
}
