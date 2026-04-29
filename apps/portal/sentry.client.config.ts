// apps/portal/sentry.client.config.ts
import { initSentryClient } from '@colheita/observability/sentry-init';

initSentryClient({ service: 'portal', enableReplay: false });
