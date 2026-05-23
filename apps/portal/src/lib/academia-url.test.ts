// apps/portal/src/lib/academia-url.test.ts
//
// Garante que helpers de URL da Academia sao deterministicos e
// constroem paths corretos, independente do BASE configurado.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('academia-url helpers', () => {
  const originalEnv = process.env.NEXT_PUBLIC_ACADEMIA_URL;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_ACADEMIA_URL;
    } else {
      process.env.NEXT_PUBLIC_ACADEMIA_URL = originalEnv;
    }
    vi.resetModules();
  });

  describe('com NEXT_PUBLIC_ACADEMIA_URL configurado', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_ACADEMIA_URL = 'https://academia.argho.com.br';
      vi.resetModules();
    });

    it('academiaTrackUrl gera path de trilha', async () => {
      const mod = await import('./academia-url');
      expect(mod.academiaTrackUrl('soja-v3-v5')).toBe(
        'https://academia.argho.com.br/trilhas/soja-v3-v5',
      );
    });

    it('academiaTrackStartUrl adiciona /iniciar', async () => {
      const mod = await import('./academia-url');
      expect(mod.academiaTrackStartUrl('biologicos-fundamentos')).toBe(
        'https://academia.argho.com.br/trilhas/biologicos-fundamentos/iniciar',
      );
    });

    it('academiaProgressUrl aponta pra /meu-progresso', async () => {
      const mod = await import('./academia-url');
      expect(mod.academiaProgressUrl()).toBe('https://academia.argho.com.br/meu-progresso');
    });

    it('academiaCertificateUrl inclui o certificate_no', async () => {
      const mod = await import('./academia-url');
      expect(mod.academiaCertificateUrl('ARGHO-2026-0042')).toBe(
        'https://academia.argho.com.br/meu-progresso/certificados/ARGHO-2026-0042',
      );
    });
  });

  describe('sem env (fallback dev localhost:3002)', () => {
    beforeEach(() => {
      delete process.env.NEXT_PUBLIC_ACADEMIA_URL;
      vi.resetModules();
    });

    it('usa localhost:3002 como fallback', async () => {
      const mod = await import('./academia-url');
      expect(mod.academiaTrackUrl('xcensis')).toBe('http://localhost:3002/trilhas/xcensis');
    });
  });

  describe('edge cases de slug', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_ACADEMIA_URL = 'https://test.com';
      vi.resetModules();
    });

    it('preserva slug com hifens', async () => {
      const mod = await import('./academia-url');
      expect(mod.academiaTrackUrl('manejo-fertilidade-soja')).toBe(
        'https://test.com/trilhas/manejo-fertilidade-soja',
      );
    });

    it('aceita string vazia (deixa caller validar)', async () => {
      const mod = await import('./academia-url');
      expect(mod.academiaTrackUrl('')).toBe('https://test.com/trilhas/');
    });
  });
});
