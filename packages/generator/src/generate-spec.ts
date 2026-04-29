// packages/generator/src/generate-spec.ts
/**
 * Renderiza um RenderSpec produzido pelo @colheita/layout-inference compiler
 * em PDF usando o template genérico RenderSpecLayout.
 *
 * @example
 * ```ts
 * import { generateFromRenderSpec } from '@colheita/generator';
 * import { compileBlueprint } from '@colheita/layout-inference/compiler';
 *
 * const compileResult = compileBlueprint({ blueprint, theme, bindings, blueprintHash });
 * if (!compileResult.ok) throw new Error('Compile failed');
 *
 * const result = await generateFromRenderSpec({
 *   spec: compileResult.spec,
 *   compilerTheme: { brandColor: '#166534', fontFamily: 'Inter', tenantName: 'Argho' },
 *   title: 'Catálogo Xcensis 2026',
 * });
 *
 * await fs.writeFile('catalogo.pdf', result.pdf);
 * ```
 */

import type { RenderSpec } from '@colheita/layout-inference/compiler';
import type { CompilerTheme } from '@colheita/ui';
import { createElement } from 'react';
import { renderToPdf } from './render.js';
import { RenderSpecLayout } from './templates/RenderSpecLayout.js';
import type { GenerateOptions, GenerateResult } from './types.js';

export interface GenerateFromSpecOptions extends GenerateOptions {
  /** Tokens de tema visual do tenant para os compiler blocks. */
  compilerTheme?: CompilerTheme;
  /** Título do documento (exibido na aba do browser e em meta tags). */
  title?: string;
}

/**
 * Gera um PDF a partir de um RenderSpec do layout-inference compiler.
 * Compatível com qualquer blueprint gerado pelo vision analyzer.
 */
export async function generateFromRenderSpec(
  spec: RenderSpec,
  options: GenerateFromSpecOptions = {},
): Promise<GenerateResult> {
  const element = createElement(RenderSpecLayout, {
    regions: spec.regions,
    theme: options.compilerTheme,
    title: options.title ?? `Documento — ${spec.tenantId}`,
  });

  return renderToPdf(element, {
    format: options.format,
    landscape: options.landscape,
    executablePath: options.executablePath,
  });
}
