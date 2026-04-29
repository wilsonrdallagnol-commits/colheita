// apps/academia/sentry.edge.config.ts
import { initSentryEdge } from '@colheita/observability/sentry-init';

initSentryEdge({ service: 'academia' });
