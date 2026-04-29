// packages/generator/src/templates/RenderSpecLayout.tsx
/**
 * Template genérico para renderizar um RenderSpec produzido pelo
 * @colheita/layout-inference compiler.
 *
 * Fluxo completo:
 *   LayoutBlueprint + TenantTheme + ContentBindings
 *     → compileBlueprint()
 *     → RenderSpec
 *     → <RenderSpecLayout>
 *     → renderToPdf()
 *     → PDF
 */

import type { ResolvedRegion } from '@colheita/layout-inference/compiler';
import {
  type AutoContent,
  BadgeStrip,
  type CompilerTheme,
  CtaBlock,
  type CtaContent,
  DataGrid,
  DEFAULT_THEME,
  Decorative,
  FeatureList,
  type FeatureListContent,
  type FooterContent,
  HeadlineBlock,
  type HeadlineContent,
  IconGrid,
  type IconGridContent,
  LegalBlock,
  type LegalContent,
  MediaBlock,
  type MediaContent,
  ProductCenterpiece,
  type ProductDataGridContent,
  ProductGallery,
  type ProductRefContent,
  QrCode,
  type QrContent,
  SubheadlineBlock,
  TenantBrandHeader,
  TenantFooter,
  Testimonial,
} from '@colheita/ui';
import type { CSSProperties } from 'react';

// ============================================================================
// Region renderer
// ============================================================================

function renderRegion(region: ResolvedRegion, theme: CompilerTheme) {
  const { content, componentRef } = region;

  switch (componentRef) {
    case 'TenantBrandHeader':
      return <TenantBrandHeader key={region.id} content={content as AutoContent} theme={theme} />;

    case 'HeadlineBlock':
      return <HeadlineBlock key={region.id} content={content as HeadlineContent} theme={theme} />;

    case 'SubheadlineBlock':
      return (
        <SubheadlineBlock key={region.id} content={content as HeadlineContent} theme={theme} />
      );

    case 'ProductCenterpiece':
      return (
        <ProductCenterpiece key={region.id} content={content as ProductRefContent} theme={theme} />
      );

    case 'ProductGallery':
      return (
        <ProductGallery key={region.id} content={content as ProductRefContent} theme={theme} />
      );

    case 'DataGrid':
      return (
        <DataGrid
          key={region.id}
          content={content as ProductDataGridContent | IconGridContent}
          theme={theme}
        />
      );

    case 'FeatureList':
      return <FeatureList key={region.id} content={content as FeatureListContent} theme={theme} />;

    case 'IconGrid':
      return <IconGrid key={region.id} content={content as IconGridContent} theme={theme} />;

    case 'Testimonial':
      return <Testimonial key={region.id} content={content as HeadlineContent} theme={theme} />;

    case 'CtaBlock':
      return <CtaBlock key={region.id} content={content as CtaContent} theme={theme} />;

    case 'TenantFooter':
      return <TenantFooter key={region.id} content={content as FooterContent} theme={theme} />;

    case 'BadgeStrip':
      return <BadgeStrip key={region.id} content={content as IconGridContent} theme={theme} />;

    case 'MediaBlock':
      return <MediaBlock key={region.id} content={content as MediaContent} theme={theme} />;

    case 'QrCode':
      return <QrCode key={region.id} content={content as QrContent} theme={theme} />;

    case 'LegalBlock':
      return <LegalBlock key={region.id} content={content as LegalContent} theme={theme} />;

    case 'Decorative':
      return <Decorative key={region.id} content={content as AutoContent} theme={theme} />;

    default:
      // Região desconhecida — renderiza placeholder para não quebrar o layout
      return (
        <div
          key={region.id}
          style={{
            padding: '8pt',
            border: '1px dashed #e5e7eb',
            borderRadius: '3pt',
            color: '#9ca3af',
            fontSize: '7.5pt',
            marginBottom: '8pt',
          }}
        >
          [{componentRef}: {region.id}]
        </div>
      );
  }
}

// ============================================================================
// Props
// ============================================================================

interface RenderSpecLayoutProps {
  regions: ResolvedRegion[];
  theme?: CompilerTheme;
  title?: string;
}

// ============================================================================
// Component
// ============================================================================

const pageStyle: CSSProperties = {
  width: '210mm',
  minHeight: '297mm',
  padding: '16mm 16mm 24mm',
  margin: '0 auto',
  position: 'relative',
  boxSizing: 'border-box',
};

/**
 * Layout raiz que renderiza uma lista de ResolvedRegion em sequência vertical.
 * Produz um documento HTML completo compatível com renderToStaticMarkup → PDF.
 */
export function RenderSpecLayout({
  regions,
  theme = DEFAULT_THEME,
  title = 'Documento',
}: RenderSpecLayoutProps) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
      </head>
      <body
        style={{
          fontFamily: theme.fontFamily,
          background: '#ffffff',
          color: '#0f1117',
          lineHeight: 1.5,
          fontSize: '10pt',
          margin: 0,
          padding: 0,
        }}
      >
        <div style={pageStyle}>{regions.map((region) => renderRegion(region, theme))}</div>
      </body>
    </html>
  );
}
