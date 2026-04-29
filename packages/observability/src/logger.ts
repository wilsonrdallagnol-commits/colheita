// packages/observability/src/logger.ts
/**
 * ColheitaLogger — wrapper tipado sobre next-axiom.
 *
 * Adiciona contexto automático (service, env) e serialização de erros.
 * Uso:
 *   const log = createLogger('api', { version: '1.0.0' });
 *   log.info('request received', { path: '/api/v1/agent' });
 *   log.error('handler failed', err);
 */
import { Logger } from 'next-axiom';

type LogData = Record<string, unknown>;

export class ColheitaLogger {
  /** @internal — exposto para testes */
  readonly _axiom: Logger;
  private readonly _context: LogData;

  constructor(service: string, context: LogData = {}) {
    this._axiom = new Logger();
    this._context = { service, ...context };
  }

  info(message: string, data: LogData = {}): void {
    this._axiom.info(message, { ...this._context, ...data });
  }

  warn(message: string, data: LogData = {}): void {
    this._axiom.warn(message, { ...this._context, ...data });
  }

  error(message: string, errorOrData?: Error | string | LogData, extra: LogData = {}): void {
    let errorStr: string | undefined;
    let extraData = extra;

    if (errorOrData instanceof Error) {
      errorStr = `${errorOrData.name}: ${errorOrData.message}`;
      if (errorOrData.stack) errorStr += `\n${errorOrData.stack}`;
    } else if (typeof errorOrData === 'string') {
      errorStr = errorOrData;
    } else if (errorOrData != null) {
      extraData = { ...errorOrData, ...extra };
    }

    this._axiom.error(message, {
      ...this._context,
      ...extraData,
      ...(errorStr ? { error: errorStr } : {}),
    });
  }

  debug(message: string, data: LogData = {}): void {
    this._axiom.debug(message, { ...this._context, ...data });
  }

  async flush(): Promise<void> {
    await this._axiom.flush();
  }
}

export function createLogger(service: string, context: LogData = {}): ColheitaLogger {
  return new ColheitaLogger(service, context);
}
