// packages/observability/src/posthog.tsx
/**
 * PostHog provider + helpers para analytics no Colheita.
 *
 * Uso no layout.tsx de cada app:
 *   import { PostHogProvider } from '@colheita/observability/posthog';
 *   <PostHogProvider apiKey={process.env.NEXT_PUBLIC_POSTHOG_KEY!} host={...}>
 *     {children}
 *   </PostHogProvider>
 */
'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { type ReactNode, useEffect } from 'react';

// ── Provider ──────────────────────────────────────────────────────────────────

export interface PostHogProviderProps {
  children: ReactNode;
  apiKey: string;
  host?: string;
}

/**
 * Inicializa PostHog e provê contexto para `usePostHog()` em client components.
 * Deve envolver o `<body>` no root layout de cada app.
 */
export function PostHogProvider({
  children,
  apiKey,
  host = 'https://us.i.posthog.com',
}: PostHogProviderProps) {
  useEffect(() => {
    if (!apiKey) return;

    posthog.init(apiKey, {
      api_host: host,
      person_profiles: 'identified_only',
      capture_pageview: false, // gerenciado via usePageview abaixo
      capture_pageleave: true,
      autocapture: false,
    });
  }, [apiKey, host]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

// ── Hook de pageview ──────────────────────────────────────────────────────────

/**
 * Captura pageviews manualmente (necessário com `capture_pageview: false`).
 * Use em um layout ou component de navegação.
 */
export function usePageview(pathname: string): void {
  const ph = usePostHog();

  useEffect(() => {
    if (ph) {
      ph.capture('$pageview', { $current_url: pathname });
    }
  }, [pathname, ph]);
}

// ── Helper server-side (identificação) ───────────────────────────────────────

export { usePostHog };
