// apps/api/sentry.server.config.ts
import { initSentryServer } from '@colheita/observability/sentry-init';

initSentryServer({ service: 'api' });
