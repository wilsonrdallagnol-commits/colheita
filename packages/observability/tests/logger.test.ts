// packages/observability/tests/logger.test.ts
/**
 * Testes do ColheitaLogger — wrapper tipado sobre next-axiom.
 * Sem dependências externas (Axiom SDK é mockado).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock next-axiom antes de importar o módulo
vi.mock('next-axiom', () => ({
  Logger: vi.fn().mockImplementation(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    flush: vi.fn().mockResolvedValue(undefined),
  })),
}));

import { ColheitaLogger, createLogger } from '../src/logger.js';

describe('ColheitaLogger — factory', () => {
  it('createLogger retorna instância de ColheitaLogger', () => {
    const logger = createLogger('test-service');
    expect(logger).toBeInstanceOf(ColheitaLogger);
  });

  it('createLogger aceita service + contexto extra', () => {
    const logger = createLogger('api', { version: '1.0.0' });
    expect(logger).toBeInstanceOf(ColheitaLogger);
  });
});

describe('ColheitaLogger — métodos de log', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('info() chama axiom.info com service e dados', () => {
    const logger = createLogger('api');
    const spy = vi.spyOn(logger._axiom, 'info');
    logger.info('health check', { status: 'ok' });
    expect(spy).toHaveBeenCalledOnce();
    const call = spy.mock.calls.at(0) ?? [];
    const [message, data] = call;
    expect(message).toBe('health check');
    expect((data as Record<string, unknown>).service).toBe('api');
  });

  it('error() inclui erro serializado como string quando Error é passado', () => {
    const logger = createLogger('api');
    const spy = vi.spyOn(logger._axiom, 'error');
    const err = new Error('algo falhou');
    logger.error('request failed', err);
    expect(spy).toHaveBeenCalledOnce();
    const [, data] = spy.mock.calls.at(0) ?? [];
    expect((data as Record<string, unknown>).error).toContain('algo falhou');
  });

  it('warn() passa dados sem modificar', () => {
    const logger = createLogger('webhook');
    const spy = vi.spyOn(logger._axiom, 'warn');
    logger.warn('rate limit', { retryAfter: 60 });
    expect(spy).toHaveBeenCalledOnce();
    const [, data] = spy.mock.calls.at(0) ?? [];
    expect((data as Record<string, unknown>).retryAfter).toBe(60);
  });

  it('flush() retorna Promise', async () => {
    const logger = createLogger('api');
    await expect(logger.flush()).resolves.toBeUndefined();
  });
});

describe('ColheitaLogger — contexto base', () => {
  it('contexto do factory é mesclado em cada log', () => {
    const logger = createLogger('academia', { env: 'test' });
    const spy = vi.spyOn(logger._axiom, 'info');
    logger.info('trilha concluída', { trilhaId: 'abc' });
    const [, data] = spy.mock.calls.at(0) ?? [];
    expect((data as Record<string, unknown>).env).toBe('test');
    expect((data as Record<string, unknown>).trilhaId).toBe('abc');
  });
});
