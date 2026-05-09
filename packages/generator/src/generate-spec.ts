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
import { renderToPdf, renderToPng } from './render.js';
import { RenderSpecLayout } from './templates/RenderSpecLayout.js';
import type { BannerOptions, BannerResult, GenerateOptions, GenerateResult } from './types.js';

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

// ─── PNG export (multi-format social) ────────────────────────────────────────

/**
 * Presets de viewport pra PNG social. Multi-platform editorial.
 */
export const PNG_PRESETS = {
  social_landscape: { width: 1200, height: 630, deviceScaleFactor: 2 },
  social_square: { width: 1080, height: 1080, deviceScaleFactor: 2 },
  social_story: { width: 1080, height: 1920, deviceScaleFactor: 2 },
  banner_wide: { width: 1920, height: 1080, deviceScaleFactor: 2 },
  thumbnail: { width: 800, height: 800, deviceScaleFactor: 2 },
} as const;

export type PngPreset = keyof typeof PNG_PRESETS;

export interface GeneratePngFromSpecOptions extends BannerOptions {
  compilerTheme?: CompilerTheme;
  title?: string;
  preset?: PngPreset;
  /** Override manual de viewport (sobrepõe preset) */
  viewport?: { width: number; height: number; deviceScaleFactor?: number };
}

/**
 * Gera um PNG retina a partir de um RenderSpec. Usado pra exportar o mesmo
 * blueprint em formatos sociais (Instagram square, Stories vertical, LinkedIn
 * landscape) sem retrabalho de layout.
 */
export async function generatePngFromRenderSpec(
  spec: RenderSpec,
  options: GeneratePngFromSpecOptions = {},
): Promise<BannerResult> {
  const element = createElement(RenderSpecLayout, {
    regions: spec.regions,
    theme: options.compilerTheme,
    title: options.title ?? `PNG — ${spec.tenantId}`,
  });

  const viewport = options.viewport ?? PNG_PRESETS[options.preset ?? 'social_landscape'];

  return renderToPng(element, viewport, { executablePath: options.executablePath });
}
