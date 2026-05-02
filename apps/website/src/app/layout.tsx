// apps/website/src/app/layout.tsx

import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata, Viewport } from 'next';
import { Footer } from '@/components/footer';
import { Nav } from '@/components/nav';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Argho Agrosciences — Nutrição de precisão para o agro brasileiro',
    template: '%s | Argho Agrosciences',
  },
  description:
    'Portfólio de fertilizantes minerais, organominerais, biológicos e adjuvantes com origem europeia e registro MAPA. Ciência aplicada ao campo.',
  keywords: [
    'fertilizante',
    'nutrição foliar',
    'agro',
    'MAPA',
    'micronutrientes',
    'biológicos',
    'adjuvante',
  ],
  openGraph: {
    title: 'Argho Agrosciences',
    description: 'Nutrição de precisão para a agricultura brasileira.',
    locale: 'pt_BR',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0b1510',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <Nav />
        <main style={{ paddingTop: '64px' }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
