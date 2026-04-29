// packages/observability/tests/sentry.test.ts
/**
 * Testes dos helpers Sentry — sem chamadas reais à API.
 */
import { describe, expect, it, vi } from 'vitest';

// Mock @sentry/nextjs antes de importar
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  withScope: vi.fn((cb: (scope: unknown) => void) => cb({ setTag: vi.fn(), setContext: vi.fn() })),
  setUser: vi.fn(),
  addBreadcrumb: vi.fn(),
}));

import * as SentrySDK from '@sentry/nextjs';
import { captureError, captureWarning, setSentryUser } from '../src/sentry.js';

describe('captureError', () => {
  it('chama Sentry.captureException com o erro', () => {
    const err = new Error('falha grave');
    captureError(err);
    expect(SentrySDK.captureException).toHaveBeenCalledWith(err, expect.any(Object));
  });

  it('chama Sentry.captureException com contexto extra quando fornecido', () => {
    const err = new Error('falha');
    captureError(err, { tenant: 'argho', endpoint: '/api/v1/agent' });
    expect(SentrySDK.captureException).toHaveBeenCalledWith(
      err,
      expect.objectContaining({
        extra: expect.objectContaining({ tenant: 'argho' }),
      }),
    );
  });

  it('aceita string como erro', () => {
    captureError('erro string');
    expect(SentrySDK.captureException).toHaveBeenCalled();
  });
});

describe('captureWarning', () => {
  it('chama Sentry.captureMessage com level warning', () => {
    captureWarning('rate limit atingido', { endpoint: '/api' });
    expect(SentrySDK.captureMessage).toHaveBeenCalledWith(
      'rate limit atingido',
      expect.objectContaining({ level: 'warning' }),
    );
  });
});

describe('setSentryUser', () => {
  it('chama Sentry.setUser com id e tenant_id', () => {
    setSentryUser({ id: 'user-123', tenant_id: 'tenant-abc', email: 'user@test.com' });
    expect(SentrySDK.setUser).toHaveBeenCalledWith({
      id: 'user-123',
      tenant_id: 'tenant-abc',
      email: 'user@test.com',
    });
  });

  it('aceita null para limpar o usuário', () => {
    setSentryUser(null);
    expect(SentrySDK.setUser).toHaveBeenCalledWith(null);
  });
});
