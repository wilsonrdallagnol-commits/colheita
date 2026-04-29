// apps/academia/sentry.client.config.ts
import { initSentryClient } from '@colheita/observability/sentry-init';

initSentryClient({ service: 'academia', enableReplay: false });
