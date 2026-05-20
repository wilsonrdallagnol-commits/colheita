// packages/observability/src/sentry-init.ts
/**
 * Factories para inicialização do Sentry em apps Next.js 15.
 *
 * Uso em cada app:
 *   // sentry.client.config.ts
 *   import { initSentryClient } from '@colheita/observability/sentry-init';
 *   initSentryClient({ service: 'admin' });
 */
import * as Sentry from '@sentry/nextjs';

interface SentryInitOptions {
  /** Nome do serviço (ex: 'admin', 'portal', 'api', 'academia') */
  service: string;
  /** Habilita replay de sessão no cliente (padrão: false em prod se não definido) */
  enableReplay?: boolean;
}

const DEFAULT_TRACES_SAMPLE_RATE = 0.1; // 10% de requests em prod
const DEFAULT_REPLAYS_SESSION_RATE = 0.0;
const DEFAULT_REPLAYS_ERROR_RATE = 1.0; // 100% de sessões com erro

/**
 * Logs UMA UNICA vez por processo um warn explicito quando Sentry esta
 * desabilitado em producao. Evita que cliente reporte "erro X" sem o time
 * conseguir ver no Sentry porque ninguem se ligou que o DSN nao estava setado.
 *
 * Em dev/test: silencioso (esperado nao ter DSN).
 */
const warnedRuntimes = new Set<string>();
function warnIfMissingInProd(runtime: 'client' | 'server' | 'edge', service: string): void {
  if (process.env.NODE_ENV !== 'production') return;
  const key = `${service}.${runtime}`;
  if (warnedRuntimes.has(key)) return;
  warnedRuntimes.add(key);
  // biome-ignore lint/suspicious/noConsole: aviso operacional intencional
  console.warn(
    `[sentry:${service}:${runtime}] SENTRY_DSN ausente — erros nao serao capturados em prod. ` +
      'Setar SENTRY_DSN (server/edge) e NEXT_PUBLIC_SENTRY_DSN (client) no Vercel.',
  );
}

// ── Client ────────────────────────────────────────────────────────────────────

export function initSentryClient(options: SentryInitOptions): void {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;
  if (!dsn) {
    warnIfMissingInProd('client', options.service);
    return; // Dev sem Sentry configurado: silencioso
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? 'local',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? DEFAULT_TRACES_SAMPLE_RATE : 1.0,
    replaysSessionSampleRate: options.enableReplay ? DEFAULT_REPLAYS_SESSION_RATE : 0,
    replaysOnErrorSampleRate: options.enableReplay ? DEFAULT_REPLAYS_ERROR_RATE : 0,
    integrations: options.enableReplay
      ? [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })]
      : [],
    initialScope: {
      tags: { service: options.service },
    },
  });
}

// ── Server ────────────────────────────────────────────────────────────────────

export function initSentryServer(options: SentryInitOptions): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    warnIfMissingInProd('server', options.service);
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA ?? 'local',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? DEFAULT_TRACES_SAMPLE_RATE : 1.0,
    initialScope: {
      tags: { service: options.service },
    },
  });
}

// ── Edge ─────────────────────────────────────────────────────────────────────

export function initSentryEdge(options: SentryInitOptions): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    warnIfMissingInProd('edge', options.service);
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? DEFAULT_TRACES_SAMPLE_RATE : 1.0,
    initialScope: {
      tags: { service: options.service },
    },
  });
}

/**
 * Retorna true se Sentry esta inicializado (DSN setado).
 * Util pra healthcheck UIs e pra mostrar status em /configuracoes.
 */
export function isSentryEnabled(): boolean {
  return Boolean(process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN);
}
