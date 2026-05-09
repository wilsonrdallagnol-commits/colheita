// apps/admin/src/lib/layout-inference/bindings-validator.test.ts

import { describe, expect, it } from 'vitest';
import {
  type BindingsMap,
  countActiveBindings,
  isBindingCompatible,
  sanitizeBinding,
  sanitizeBindings,
} from './bindings-validator';

describe('sanitizeBinding', () => {
  it('passa "auto" sem mudar', () => {
    expect(sanitizeBinding({ kind: 'auto' })).toEqual({ kind: 'auto' });
  });

  it('vira "auto" quando undefined', () => {
    expect(sanitizeBinding(undefined)).toEqual({ kind: 'auto' });
  });

  it('product_ref com productId valido', () => {
    expect(sanitizeBinding({ kind: 'product_ref', productId: 'uuid-123' })).toEqual({
      kind: 'product_ref',
      productId: 'uuid-123',
    });
  });

  it('product_ref com productId vazio vira auto', () => {
    expect(sanitizeBinding({ kind: 'product_ref', productId: '' })).toEqual({ kind: 'auto' });
    expect(sanitizeBinding({ kind: 'product_ref', productId: '   ' })).toEqual({ kind: 'auto' });
  });

  it('headline filtra linhas vazias', () => {
    expect(sanitizeBinding({ kind: 'headline', lines: ['Linha 1', '', '  ', 'Linha 2'] })).toEqual({
      kind: 'headline',
      lines: ['Linha 1', 'Linha 2'],
    });
  });

  it('headline sem nenhuma linha valida vira auto', () => {
    expect(sanitizeBinding({ kind: 'headline', lines: ['', '   ', ''] })).toEqual({ kind: 'auto' });
    expect(sanitizeBinding({ kind: 'headline', lines: [] })).toEqual({ kind: 'auto' });
  });

  it('cta com label preserva href', () => {
    expect(
      sanitizeBinding({ kind: 'cta', label: 'Saiba mais', href: 'https://argho.com' }),
    ).toEqual({ kind: 'cta', label: 'Saiba mais', href: 'https://argho.com' });
  });

  it('cta sem label vira auto', () => {
    expect(sanitizeBinding({ kind: 'cta', label: '' })).toEqual({ kind: 'auto' });
  });

  it('media valida e trimuje assetId', () => {
    expect(sanitizeBinding({ kind: 'media', assetId: ' uuid-x ' })).toEqual({
      kind: 'media',
      assetId: 'uuid-x',
    });
  });

  it('media sem assetId vira auto', () => {
    expect(sanitizeBinding({ kind: 'media', assetId: '' })).toEqual({ kind: 'auto' });
  });
});

describe('sanitizeBindings', () => {
  it('processa mapa inteiro preservando regionIds', () => {
    const input: BindingsMap = {
      header: { kind: 'auto' },
      hero: { kind: 'product_ref', productId: 'uuid-A' },
      footer: { kind: 'product_ref', productId: '' }, // vai virar auto
    };
    const output = sanitizeBindings(input);
    expect(output.header).toEqual({ kind: 'auto' });
    expect(output.hero).toEqual({ kind: 'product_ref', productId: 'uuid-A' });
    expect(output.footer).toEqual({ kind: 'auto' });
  });
});

describe('isBindingCompatible', () => {
  it('auto compativel com qualquer region', () => {
    expect(isBindingCompatible('product_centerpiece', 'auto')).toBe(true);
    expect(isBindingCompatible('decorative', 'auto')).toBe(true);
    expect(isBindingCompatible('footer', 'auto')).toBe(true);
  });

  it('product_ref so em centerpiece/gallery', () => {
    expect(isBindingCompatible('product_centerpiece', 'product_ref')).toBe(true);
    expect(isBindingCompatible('product_gallery', 'product_ref')).toBe(true);
    expect(isBindingCompatible('headline_block', 'product_ref')).toBe(false);
    expect(isBindingCompatible('footer', 'product_ref')).toBe(false);
  });

  it('headline so em headline/subheadline/testimonial', () => {
    expect(isBindingCompatible('headline_block', 'headline')).toBe(true);
    expect(isBindingCompatible('subheadline_block', 'headline')).toBe(true);
    expect(isBindingCompatible('testimonial', 'headline')).toBe(true);
    expect(isBindingCompatible('product_centerpiece', 'headline')).toBe(false);
  });

  it('cta so em cta_block', () => {
    expect(isBindingCompatible('cta_block', 'cta')).toBe(true);
    expect(isBindingCompatible('headline_block', 'cta')).toBe(false);
  });

  it('media so em media_block', () => {
    expect(isBindingCompatible('media_block', 'media')).toBe(true);
    expect(isBindingCompatible('decorative', 'media')).toBe(false);
  });

  it('icon_grid em icon_grid + data_grid + badge_strip', () => {
    expect(isBindingCompatible('icon_grid', 'icon_grid')).toBe(true);
    expect(isBindingCompatible('data_grid', 'icon_grid')).toBe(true);
    expect(isBindingCompatible('badge_strip', 'icon_grid')).toBe(true);
    expect(isBindingCompatible('headline_block', 'icon_grid')).toBe(false);
  });
});

describe('countActiveBindings', () => {
  it('conta apenas bindings nao-auto', () => {
    const input: BindingsMap = {
      header: { kind: 'auto' },
      hero: { kind: 'product_ref', productId: 'uuid' },
      sub: { kind: 'headline', lines: ['Linha 1'] },
      footer: { kind: 'auto' },
    };
    expect(countActiveBindings(input)).toBe(2);
  });

  it('zero quando todos sao auto', () => {
    expect(
      countActiveBindings({
        a: { kind: 'auto' },
        b: { kind: 'auto' },
      }),
    ).toBe(0);
  });

  it('zero em mapa vazio', () => {
    expect(countActiveBindings({})).toBe(0);
  });
});
