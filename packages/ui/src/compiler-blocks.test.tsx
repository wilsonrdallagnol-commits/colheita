// packages/ui/src/compiler-blocks.test.tsx
/**
 * Testes de unidade para os 16 compiler blocks.
 * Usam renderToStaticMarkup — sem browser, sem Playwright.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { BadgeStrip } from './components/badge-strip.js';
import type { CompilerTheme } from './components/compiler-types.js';
import { CtaBlock } from './components/cta-block.js';
import { DataGrid } from './components/data-grid.js';
import { Decorative } from './components/decorative.js';
import { FeatureList } from './components/feature-list.js';
import { HeadlineBlock } from './components/headline-block.js';
import { IconGrid } from './components/icon-grid.js';
import { LegalBlock } from './components/legal-block.js';
import { MediaBlock } from './components/media-block.js';
import { ProductCenterpiece } from './components/product-centerpiece.js';
import { ProductGallery } from './components/product-gallery.js';
import { QrCode } from './components/qr-code.js';
import { SubheadlineBlock } from './components/subheadline-block.js';
import { TenantBrandHeader } from './components/tenant-brand-header.js';
import { TenantFooter } from './components/tenant-footer.js';
import { Testimonial } from './components/testimonial.js';

const THEME: CompilerTheme = {
  brandColor: '#166534',
  fontFamily: "'Inter', sans-serif",
  tenantName: 'Argho AgriSciences',
  tagline: 'Ciência que colhe',
};

// ---------------------------------------------------------------------------
// TenantBrandHeader
// ---------------------------------------------------------------------------
describe('TenantBrandHeader', () => {
  it('renderiza nome do tenant', () => {
    const html = renderToStaticMarkup(
      createElement(TenantBrandHeader, { content: { kind: 'auto' }, theme: THEME }),
    );
    expect(html).toContain('Argho AgriSciences');
  });

  it('renderiza tagline quando fornecida', () => {
    const html = renderToStaticMarkup(
      createElement(TenantBrandHeader, { content: { kind: 'auto' }, theme: THEME }),
    );
    expect(html).toContain('Ciência que colhe');
  });

  it('renderiza docLabel customizado', () => {
    const html = renderToStaticMarkup(
      createElement(TenantBrandHeader, {
        content: { kind: 'auto' },
        theme: THEME,
        docLabel: 'Catálogo 2026',
      }),
    );
    expect(html).toContain('Catálogo 2026');
  });

  it('não quebra sem tagline', () => {
    const themeNoTagline: CompilerTheme = { ...THEME, tagline: undefined };
    expect(() =>
      renderToStaticMarkup(
        createElement(TenantBrandHeader, { content: { kind: 'auto' }, theme: themeNoTagline }),
      ),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// TenantFooter
// ---------------------------------------------------------------------------
describe('TenantFooter', () => {
  it('renderiza copyright com nome do tenant', () => {
    const html = renderToStaticMarkup(
      createElement(TenantFooter, {
        content: { kind: 'footer', tenantBranding: true },
        theme: THEME,
        year: 2026,
      }),
    );
    expect(html).toContain('© 2026');
    expect(html).toContain('Argho AgriSciences');
  });

  it('renderiza documentTitle quando fornecido', () => {
    const html = renderToStaticMarkup(
      createElement(TenantFooter, {
        content: { kind: 'footer', tenantBranding: true },
        theme: THEME,
        documentTitle: 'Xcensis 10-00-06',
        year: 2026,
      }),
    );
    expect(html).toContain('Xcensis 10-00-06');
  });
});

// ---------------------------------------------------------------------------
// HeadlineBlock
// ---------------------------------------------------------------------------
describe('HeadlineBlock', () => {
  it('renderiza primeira linha como h1', () => {
    const html = renderToStaticMarkup(
      createElement(HeadlineBlock, {
        content: { kind: 'headline', lines: ['Título principal', 'Subtítulo'] },
        theme: THEME,
      }),
    );
    expect(html).toContain('<h1');
    expect(html).toContain('Título principal');
    expect(html).toContain('Subtítulo');
  });

  it('renderiza sem erros com linha única', () => {
    expect(() =>
      renderToStaticMarkup(
        createElement(HeadlineBlock, {
          content: { kind: 'headline', lines: ['Só uma linha'] },
          theme: THEME,
        }),
      ),
    ).not.toThrow();
  });

  it('renderiza sem erros com lista vazia', () => {
    expect(() =>
      renderToStaticMarkup(
        createElement(HeadlineBlock, {
          content: { kind: 'headline', lines: [] },
          theme: THEME,
        }),
      ),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// SubheadlineBlock
// ---------------------------------------------------------------------------
describe('SubheadlineBlock', () => {
  it('renderiza primeira linha como h2', () => {
    const html = renderToStaticMarkup(
      createElement(SubheadlineBlock, {
        content: { kind: 'headline', lines: ['Seção', 'Descrição'] },
        theme: THEME,
      }),
    );
    expect(html).toContain('<h2');
    expect(html).toContain('Seção');
    expect(html).toContain('Descrição');
  });
});

// ---------------------------------------------------------------------------
// Testimonial
// ---------------------------------------------------------------------------
describe('Testimonial', () => {
  it('renderiza citação com aspas', () => {
    const html = renderToStaticMarkup(
      createElement(Testimonial, {
        content: { kind: 'headline', lines: ['Produto excelente', 'João Silva, Agrônomo'] },
        theme: THEME,
      }),
    );
    expect(html).toContain('Produto excelente');
    expect(html).toContain('João Silva');
    expect(html).toContain('"');
  });
});

// ---------------------------------------------------------------------------
// LegalBlock
// ---------------------------------------------------------------------------
describe('LegalBlock', () => {
  it('renderiza texto legal completo', () => {
    const html = renderToStaticMarkup(
      createElement(LegalBlock, {
        content: { kind: 'legal', text: 'Ler o rótulo antes do uso. MAPA n° 12345.' },
        theme: THEME,
      }),
    );
    expect(html).toContain('Ler o rótulo');
    expect(html).toContain('MAPA n° 12345');
  });
});

// ---------------------------------------------------------------------------
// FeatureList
// ---------------------------------------------------------------------------
describe('FeatureList', () => {
  it('renderiza itens com título e descrição', () => {
    const html = renderToStaticMarkup(
      createElement(FeatureList, {
        content: {
          kind: 'feature_list',
          items: [
            { icon: '🌱', title: 'Alta eficiência', description: 'Absorção rápida' },
            { title: 'Compatível com adjuvantes' },
          ],
        },
        theme: THEME,
      }),
    );
    expect(html).toContain('Alta eficiência');
    expect(html).toContain('Absorção rápida');
    expect(html).toContain('Compatível com adjuvantes');
    expect(html).toContain('🌱');
  });

  it('renderiza bullet padrão quando sem ícone', () => {
    const html = renderToStaticMarkup(
      createElement(FeatureList, {
        content: {
          kind: 'feature_list',
          items: [{ title: 'Sem ícone' }],
        },
        theme: THEME,
      }),
    );
    expect(html).toContain('Sem ícone');
  });
});

// ---------------------------------------------------------------------------
// IconGrid
// ---------------------------------------------------------------------------
describe('IconGrid', () => {
  it('renderiza símbolos, labels e valores', () => {
    const html = renderToStaticMarkup(
      createElement(IconGrid, {
        content: {
          kind: 'icon_grid',
          items: [
            { symbol: '🔬', label: 'Nitrogênio', value: '10%' },
            { symbol: '💧', label: 'Potássio' },
          ],
        },
        theme: THEME,
      }),
    );
    expect(html).toContain('🔬');
    expect(html).toContain('Nitrogênio');
    expect(html).toContain('10%');
    expect(html).toContain('💧');
    expect(html).toContain('Potássio');
  });
});

// ---------------------------------------------------------------------------
// BadgeStrip
// ---------------------------------------------------------------------------
describe('BadgeStrip', () => {
  it('renderiza badges como chips', () => {
    const html = renderToStaticMarkup(
      createElement(BadgeStrip, {
        content: {
          kind: 'icon_grid',
          items: [
            { symbol: '✅', label: 'MAPA', value: '00123/2024' },
            { symbol: '', label: 'ISO 9001' },
          ],
        },
        theme: THEME,
      }),
    );
    expect(html).toContain('MAPA');
    expect(html).toContain('00123/2024');
    expect(html).toContain('ISO 9001');
  });
});

// ---------------------------------------------------------------------------
// DataGrid — product_data_grid mode
// ---------------------------------------------------------------------------
describe('DataGrid (product_data_grid)', () => {
  it('renderiza campos como placeholders quando sem resolvedRows', () => {
    const html = renderToStaticMarkup(
      createElement(DataGrid, {
        content: {
          kind: 'product_data_grid',
          productId: 'prod_xcensis',
          fields: ['pH', 'Densidade', 'Formulação'],
        },
        theme: THEME,
      }),
    );
    expect(html).toContain('pH');
    expect(html).toContain('Densidade');
    expect(html).toContain('Formulação');
  });

  it('renderiza resolvedRows quando fornecidos', () => {
    const html = renderToStaticMarkup(
      createElement(DataGrid, {
        content: {
          kind: 'product_data_grid',
          productId: 'prod_xcensis',
          fields: ['pH'],
        },
        theme: THEME,
        resolvedRows: [{ key: 'pH', value: '6.5–7.0' }],
      }),
    );
    expect(html).toContain('pH');
    expect(html).toContain('6.5–7.0');
  });
});

// ---------------------------------------------------------------------------
// DataGrid — icon_grid mode
// ---------------------------------------------------------------------------
describe('DataGrid (icon_grid)', () => {
  it('renderiza grid de ícones', () => {
    const html = renderToStaticMarkup(
      createElement(DataGrid, {
        content: {
          kind: 'icon_grid',
          items: [{ symbol: '🌿', label: 'N', value: '10%' }],
        },
        theme: THEME,
        title: 'Composição',
      }),
    );
    expect(html).toContain('🌿');
    expect(html).toContain('Composição');
  });
});

// ---------------------------------------------------------------------------
// CtaBlock
// ---------------------------------------------------------------------------
describe('CtaBlock', () => {
  it('renderiza label do botão', () => {
    const html = renderToStaticMarkup(
      createElement(CtaBlock, {
        content: { kind: 'cta', label: 'Solicitar amostra', href: 'https://argho.com.br' },
        theme: THEME,
      }),
    );
    expect(html).toContain('Solicitar amostra');
    expect(html).toContain('argho.com.br');
  });

  it('renderiza sem href', () => {
    expect(() =>
      renderToStaticMarkup(
        createElement(CtaBlock, {
          content: { kind: 'cta', label: 'Contato' },
          theme: THEME,
        }),
      ),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// ProductCenterpiece
// ---------------------------------------------------------------------------
describe('ProductCenterpiece', () => {
  it('renderiza placeholder quando sem resolved', () => {
    const html = renderToStaticMarkup(
      createElement(ProductCenterpiece, {
        content: { kind: 'product_ref', productId: 'prod_123' },
        theme: THEME,
      }),
    );
    expect(html).toContain('prod_123');
  });

  it('renderiza dados resolvidos', () => {
    const html = renderToStaticMarkup(
      createElement(ProductCenterpiece, {
        content: { kind: 'product_ref', productId: 'prod_123' },
        theme: THEME,
        resolved: {
          name: 'Xcensis 10-00-06',
          tagline: 'Nutrição foliar',
          mapaRegistration: '00123/2024',
        },
      }),
    );
    expect(html).toContain('Xcensis 10-00-06');
    expect(html).toContain('Nutrição foliar');
    expect(html).toContain('MAPA N° 00123/2024');
  });
});

// ---------------------------------------------------------------------------
// ProductGallery
// ---------------------------------------------------------------------------
describe('ProductGallery', () => {
  it('renderiza placeholder quando sem resolved', () => {
    const html = renderToStaticMarkup(
      createElement(ProductGallery, {
        content: { kind: 'product_ref', productId: 'prod_gallery' },
        theme: THEME,
      }),
    );
    expect(html).toContain('prod_gallery');
  });

  it('renderiza imagens quando resolved fornecido', () => {
    const html = renderToStaticMarkup(
      createElement(ProductGallery, {
        content: { kind: 'product_ref', productId: 'prod_gallery' },
        theme: THEME,
        resolved: [{ url: 'https://cdn.argho.com.br/xcensis.jpg', alt: 'Xcensis' }],
      }),
    );
    expect(html).toContain('cdn.argho.com.br');
    expect(html).toContain('Xcensis');
  });
});

// ---------------------------------------------------------------------------
// MediaBlock
// ---------------------------------------------------------------------------
describe('MediaBlock', () => {
  it('renderiza placeholder quando sem resolvedUrl', () => {
    const html = renderToStaticMarkup(
      createElement(MediaBlock, {
        content: { kind: 'media', assetId: 'asset_hero' },
        theme: THEME,
      }),
    );
    expect(html).toContain('asset_hero');
  });

  it('renderiza imagem quando resolvedUrl fornecida', () => {
    const html = renderToStaticMarkup(
      createElement(MediaBlock, {
        content: { kind: 'media', assetId: 'asset_hero' },
        theme: THEME,
        resolvedUrl: 'https://cdn.argho.com.br/hero.jpg',
        caption: 'Xcensis em campo',
      }),
    );
    expect(html).toContain('cdn.argho.com.br/hero.jpg');
    expect(html).toContain('Xcensis em campo');
  });
});

// ---------------------------------------------------------------------------
// QrCode
// ---------------------------------------------------------------------------
describe('QrCode', () => {
  it('renderiza placeholder quando sem resolvedDataUrl', () => {
    const html = renderToStaticMarkup(
      createElement(QrCode, {
        content: { kind: 'qr', data: 'https://argho.com.br/xcensis' },
        theme: THEME,
      }),
    );
    expect(html).toContain('argho.com.br');
  });

  it('renderiza img quando resolvedDataUrl fornecido', () => {
    const fakeDataUrl = 'data:image/png;base64,abc123';
    const html = renderToStaticMarkup(
      createElement(QrCode, {
        content: { kind: 'qr', data: 'https://argho.com.br/xcensis' },
        theme: THEME,
        resolvedDataUrl: fakeDataUrl,
        label: 'Acesse agora',
      }),
    );
    expect(html).toContain('data:image/png');
    expect(html).toContain('Acesse agora');
  });
});

// ---------------------------------------------------------------------------
// Decorative
// ---------------------------------------------------------------------------
describe('Decorative', () => {
  it('renderiza hr (rule) por padrão', () => {
    const html = renderToStaticMarkup(
      createElement(Decorative, { content: { kind: 'auto' }, theme: THEME }),
    );
    expect(html).toContain('<hr');
  });

  it('renderiza spacer como div com altura', () => {
    const html = renderToStaticMarkup(
      createElement(Decorative, {
        content: { kind: 'auto' },
        theme: THEME,
        variant: 'spacer',
        heightPt: 32,
      }),
    );
    expect(html).toContain('32pt');
  });

  it('renderiza accent-bar com cor do tema', () => {
    const html = renderToStaticMarkup(
      createElement(Decorative, {
        content: { kind: 'auto' },
        theme: THEME,
        variant: 'accent-bar',
      }),
    );
    expect(html).toContain('#166534');
  });
});
