import { PostHogProvider } from '@colheita/observability/posthog';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_PORTAL_URL ?? 'https://colheita.arghoagrosciences.com',
  ),
  title: {
    default: 'Plataforma Colheita — Argho Agrosciences',
    template: '%s — Plataforma Colheita',
  },
  description:
    'Catálogo digital de fertilizantes, biológicos e adjuvantes Argho — ficha técnica, indicações por cultura e dados regulatórios MAPA em um único lugar.',
  applicationName: 'Plataforma Colheita',
  authors: [{ name: 'Argho Agrosciences', url: 'https://arghoagrosciences.com' }],
  keywords: [
    'Argho',
    'Plataforma Colheita',
    'fertilizantes',
    'biológicos',
    'adjuvantes',
    'agronomia',
    'distribuidor agro',
    'ficha técnica',
    'MAPA',
  ],
  icons: {
    icon: [{ url: '/argho-logo-color.png', type: 'image/png' }],
    shortcut: '/argho-logo-color.png',
    apple: '/argho-logo-color.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Plataforma Colheita',
    title: 'Plataforma Colheita — Argho Agrosciences',
    description:
      'Catálogo digital de fertilizantes, biológicos e adjuvantes Argho — ficha técnica, indicações por cultura e dados regulatórios MAPA.',
    locale: 'pt_BR',
    url: '/',
    images: [{ url: '/argho-logo-color.png', alt: 'Argho Agrosciences' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plataforma Colheita — Argho Agrosciences',
    description: 'Catálogo digital de fertilizantes, biológicos e adjuvantes Argho.',
    images: ['/argho-logo-color.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
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
