// apps/portal/sentry.edge.config.ts
import { initSentryEdge } from '@colheita/observability/sentry-init';

initSentryEdge({ service: 'portal' });
