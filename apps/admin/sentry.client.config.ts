// apps/admin/sentry.client.config.ts
// Inicialização do Sentry no lado do cliente (browser).
// Este arquivo é carregado automaticamente pelo Next.js.
import { initSentryClient } from '@colheita/observability/sentry-init';

initSentryClient({ service: 'admin', enableReplay: true });
