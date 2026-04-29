// apps/academia/src/app/layout.tsx
import { PostHogProvider } from '@colheita/observability/posthog';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Academia Argho',
    template: '%s — Academia Argho',
  },
  description:
    'Capacitação técnica em nutrição de plantas, biológicos e adjuvantes Argho Agrosciences',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '';
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

  return (
    <html lang="pt-BR" className={GeistSans.variable}>
      <body>
        <PostHogProvider apiKey={posthogKey} host={posthogHost}>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
