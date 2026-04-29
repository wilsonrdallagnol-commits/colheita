// apps/admin/sentry.edge.config.ts
// Inicialização do Sentry no Edge runtime (middleware Next.js).
import { initSentryEdge } from '@colheita/observability/sentry-init';

initSentryEdge({ service: 'admin' });
