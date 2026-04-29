// apps/academia/sentry.server.config.ts
import { initSentryServer } from '@colheita/observability/sentry-init';

initSentryServer({ service: 'academia' });
