// apps/api/sentry.client.config.ts
import { initSentryClient } from '@colheita/observability/sentry-init';

initSentryClient({ service: 'api', enableReplay: false });
