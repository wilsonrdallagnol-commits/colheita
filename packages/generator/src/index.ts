// packages/generator/src/index.ts
import { createElement } from 'react';
import { renderToPdf } from './render.js';
import { FichaTecnica } from './templates/FichaTecnica.js';
import type { FichaTecnicaData, GenerateOptions, GenerateResult } from './types.js';

export { FichaTecnica } from './templates/FichaTecnica.js';
export type {
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
