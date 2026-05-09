// packages/generator/src/index.ts
import { createElement } from 'react';
import { renderToPdf, renderToPng } from './render.js';
import { BannerSocial } from './templates/BannerSocial.js';
import { Catalogo } from './templates/Catalogo.js';
import { Dossie } from './templates/Dossie.js';
import { FichaTecnica } from './templates/FichaTecnica.js';
import { Proposta } from './templates/Proposta.js';
import type {
  BannerOptions,
  BannerResult,
  BannerSocialData,
  CatalogoData,
  DossieData,
  FichaTecnicaData,
  GenerateOptions,
  GenerateResult,
  PropostaData,
} from './types.js';

export {
  type GenerateFromSpecOptions,
  type GeneratePngFromSpecOptions,
  generateFromRenderSpec,
  generatePngFromRenderSpec,
  PNG_PRESETS,
  type PngPreset,
} from './generate-spec.js';
export { BannerSocial } from './templates/BannerSocial.js';
export { Catalogo } from './templates/Catalogo.js';
export { Dossie } from './templates/Dossie.js';
export { FichaTecnica } from './templates/FichaTecnica.js';
export { Proposta } from './templates/Proposta.js';
export { RenderSpecLayout } from './templates/RenderSpecLayout.js';
export type {
  BannerOptions,
  BannerResult,
  BannerSocialData,
  CatalogoData,
  CatalogoProduto,
  DossieData,
  DossieRegistration,
  FichaTecnicaData,
  GenerateOptions,
  GenerateResult,
  PackagingUnit,
  ProductApplication,
  ProductComposition,
  PropostaData,
  PropostaItem,
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

/**
 * Gera o Banner Social (PNG 1200x630, deviceScaleFactor=2 → 2400x1260) de um
 * produto. Formato pensado pra LinkedIn / Instagram link sticker / WhatsApp
 * preview / Open Graph.
 *
 * Layout fixo editorial Argho — copy à esquerda (eyebrow + nome em CAPS +
 * tagline + tenant lockup) e accent verde à direita (NPK gigante quando
 * fornecido, ou fallback "Tecnologia Argho").
 *
 * @example
 * ```ts
 * const { png } = await generateBannerSocial({
 *   productName: 'Xcensis 10-00-06',
 *   tagline: 'Folialização de alta performance',
 *   categoryName: 'FERTILIZANTE FOLIAR',
 *   npkLabel: '10-00-06',
 *   mapaRegistration: '12345',
 *   tenantName: 'Argho AgriSciences',
 * });
 * await fs.writeFile('banner-xcensis.png', png);
 * ```
 */
export async function generateBannerSocial(
  data: BannerSocialData,
  options?: BannerOptions,
): Promise<BannerResult> {
  const element = createElement(BannerSocial, { data });
  return renderToPng(element, { width: 1200, height: 630, deviceScaleFactor: 2 }, options);
}

/**
 * Gera o Dossiê de Compliance Regulatório — PDF compilado com TODOS os
 * registros (MAPA + ANVISA + IBAMA + estaduais + outros) agrupados por
 * autoridade emissora, com capa institucional + stats + tabela paginada.
 *
 * Uso típico (Camada 9):
 *   - Auditoria MAPA presencial: regulatório imprime e leva à reunião
 *   - Renovação de processo: comprovação de status do portfólio
 *   - Diligência B2B grande: comprova compliance contínuo
 *   - Backup mensal arquivado: snapshot regulatório
 *
 * @example
 * ```ts
 * const result = await generateDossie({
 *   tenantName: 'Argho AgriSciences',
 *   registrations: [...],
 *   stats: { total: 12, active: 10, expired: 1, pending: 1, expiringIn30d: 2 },
 * });
 * await fs.writeFile('dossie-argho.pdf', result.pdf);
 * ```
 */
export async function generateDossie(
  data: DossieData,
  options?: GenerateOptions,
): Promise<GenerateResult> {
  const element = createElement(Dossie, { data });
  return renderToPdf(element, options);
}

/**
 * Gera Proposta Comercial em PDF — link entre CRM (lead) e PIM (produtos).
 *
 * Items vem do PIM (selecao no admin /leads/[id]/proposta) com:
 *   - Quantidade + unit
 *   - Preço unitário em BRL
 *   - Dose recomendada por hectare (calculo manual no form)
 *   - NPK + MAPA do produto (vem de products.composition.macros + registrations)
 *
 * @example
 * ```ts
 * const { pdf } = await generateProposta({
 *   tenantName: 'Argho AgriSciences',
 *   clientName: 'Fazenda Boa Esperança',
 *   cultura: 'soja',
 *   areaHectares: 2500,
 *   items: [...],
 *   proposalNumber: 'PROP-2026-0042',
 *   issuedAtLabel: '08/05/2026',
 *   ...
 * });
 * ```
 */
export async function generateProposta(
  data: PropostaData,
  options?: GenerateOptions,
): Promise<GenerateResult> {
  const element = createElement(Proposta, { data });
  return renderToPdf(element, options);
}
