/**
 * Blueprint Compiler
 *
 * Recebe um LayoutBlueprint (estrutura abstrata, tenant-agnostic) +
 * tokens visuais do tenant, e produz uma RenderSpec — descrição completa
 * que o @colheita/generator transforma em PDF/PNG via Playwright.
 *
 * Esta é a peça que aplica a IDENTIDADE do tenant.
 *
 * Pipeline:
 *   LayoutBlueprint  +  TenantTheme  +  ContentBindings  →  RenderSpec
 *
 * - LayoutBlueprint: o "esqueleto" extraído da referência
 * - TenantTheme: tokens (cores, fontes, espaçamento, ícones) do tenant
 * - ContentBindings: o que vai em cada região (produto do PIM, textos, etc)
 */

import type { LayoutBlueprint, LayoutRegion } from '../blueprint/schema.js';

// ============================================================================
// Inputs do compiler
// ============================================================================

export type TenantTheme = {
  tenantId: string;
  tokensVersion: string;
  // Referência opaca aos tokens — o pacote @colheita/tokens resolve no render
  themeRef: string;
};

/**
 * ContentBindings: o que vai dentro de cada região do blueprint.
 *
 * Chaves devem corresponder aos region.id do blueprint.
 * Valor é o conteúdo a ser renderizado, no formato esperado pelo region.type.
 */
export type ContentBindings = Record<string, RegionContent>;

export type RegionContent =
  | { kind: 'product_ref'; productId: string }
  | { kind: 'product_data_grid'; productId: string; fields: string[] }
  | { kind: 'headline'; lines: string[] }
  | { kind: 'feature_list'; items: Array<{ icon?: string; title: string; description?: string }> }
  | { kind: 'icon_grid'; items: Array<{ symbol: string; label: string; value?: string }> }
  | { kind: 'media'; assetId: string }
  | { kind: 'cta'; label: string; href?: string }
  | { kind: 'footer'; tenantBranding: true }
  | { kind: 'qr'; data: string }
  | { kind: 'legal'; text: string }
  | { kind: 'auto' };

// ============================================================================
// Output: RenderSpec
// ============================================================================

export type RenderSpec = {
  blueprintHash: string;
  tenantId: string;
  themeRef: string;
  format: LayoutBlueprint['format'];
  grid: LayoutBlueprint['grid'];
  visualIntent: LayoutBlueprint['visualIntent'];
  regions: ResolvedRegion[];
  // Estimativa de páginas (pra catálogos/multi-page)
  estimatedPages: number;
};

export type ResolvedRegion = LayoutRegion & {
  content: RegionContent;
  // Componente React do @colheita/ui que renderiza este region.type
  componentRef: string;
};

// ============================================================================
// Compiler
// ============================================================================

/**
 * Mapa de tipos de região → componente React do @colheita/ui.
 *
 * Fonte de verdade da relação entre estrutura abstrata e componentes concretos.
 * Adicionar novo tipo de região exige adicionar componente correspondente.
 */
const REGION_COMPONENT_MAP: Record<LayoutRegion['type'], string> = {
  brand_header: 'TenantBrandHeader',
  headline_block: 'HeadlineBlock',
  subheadline_block: 'SubheadlineBlock',
  product_centerpiece: 'ProductCenterpiece',
  product_gallery: 'ProductGallery',
  data_grid: 'DataGrid',
  feature_list: 'FeatureList',
  icon_grid: 'IconGrid',
  testimonial: 'Testimonial',
  cta_block: 'CtaBlock',
  footer: 'TenantFooter',
  badge_strip: 'BadgeStrip',
  media_block: 'MediaBlock',
  qr_code: 'QrCode',
  legal_block: 'LegalBlock',
  decorative: 'Decorative',
};

export type CompileError = {
  code: 'missing_binding' | 'incompatible_binding' | 'unknown_region_type';
  regionId: string;
  details: string;
};

export type CompileResult = { ok: true; spec: RenderSpec } | { ok: false; errors: CompileError[] };

export function compileBlueprint(opts: {
  blueprint: LayoutBlueprint;
  theme: TenantTheme;
  bindings: ContentBindings;
  blueprintHash: string;
}): CompileResult {
  const { blueprint, theme, bindings, blueprintHash } = opts;
  const errors: CompileError[] = [];
  const resolved: ResolvedRegion[] = [];

  for (const region of blueprint.regions) {
    const componentRef = REGION_COMPONENT_MAP[region.type];
    if (!componentRef) {
      errors.push({
        code: 'unknown_region_type',
        regionId: region.id,
        details: `Tipo de região não mapeado: ${region.type}`,
      });
      continue;
    }

    const binding = bindings[region.id] ?? { kind: 'auto' as const };

    const compatibility = checkBindingCompatibility(region.type, binding);
    if (!compatibility.ok) {
      errors.push({
        code: 'incompatible_binding',
        regionId: region.id,
        details: compatibility.reason,
      });
      continue;
    }

    resolved.push({
      ...region,
      content: binding,
      componentRef,
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    spec: {
      blueprintHash,
      tenantId: theme.tenantId,
      themeRef: theme.themeRef,
      format: blueprint.format,
      grid: blueprint.grid,
      visualIntent: blueprint.visualIntent,
      regions: resolved,
      estimatedPages: 1,
    },
  };
}

// ============================================================================
// Compatibilidade tipo de região × tipo de binding
// ============================================================================

function checkBindingCompatibility(
  regionType: LayoutRegion['type'],
  binding: RegionContent,
): { ok: true } | { ok: false; reason: string } {
  // 'auto' é sempre permitido — o componente decide o fallback
  if (binding.kind === 'auto') return { ok: true };

  const allowed: Record<LayoutRegion['type'], RegionContent['kind'][]> = {
    brand_header: ['auto'],
    headline_block: ['headline'],
    subheadline_block: ['headline'],
    product_centerpiece: ['product_ref'],
    product_gallery: ['product_ref'],
    data_grid: ['product_data_grid', 'icon_grid'],
    feature_list: ['feature_list'],
    icon_grid: ['icon_grid'],
    testimonial: ['headline'],
    cta_block: ['cta'],
    footer: ['footer'],
    badge_strip: ['icon_grid'],
    media_block: ['media'],
    qr_code: ['qr'],
    legal_block: ['legal'],
    decorative: ['auto'],
  };

  const allowedKinds = allowed[regionType] ?? [];
  if (!allowedKinds.includes(binding.kind)) {
    return {
      ok: false,
      reason: `Binding "${binding.kind}" não é compatível com região "${regionType}". Permitidos: ${allowedKinds.join(', ')}`,
    };
  }

  return { ok: true };
}
