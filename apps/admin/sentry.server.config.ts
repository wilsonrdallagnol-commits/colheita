// apps/admin/sentry.server.config.ts
// Inicialização do Sentry no servidor (Node.js runtime).
import { initSentryServer } from '@colheita/observability/sentry-init';

initSentryServer({ service: 'admin' });
