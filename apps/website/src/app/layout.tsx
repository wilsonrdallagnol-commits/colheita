// apps/website/src/app/layout.tsx

import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata, Viewport } from 'next';
import { Footer } from '@/components/footer';
import { HeartIntro } from '@/components/heart-intro';
import { Nav } from '@/components/nav';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://arghoagrosciences.com'),
  title: {
    default: 'Argho Agrosciences — Nutrição de precisão para o agro brasileiro',
    template: '%s | Argho Agrosciences',
  },
  description:
    'Portfólio de fertilizantes minerais e organominerais de origem europeia com registro MAPA, e linhas biológica e de adjuvantes nacionais. Ciência aplicada ao campo.',
  alternates: {
    canonical: './',
  },
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
    url: 'https://arghoagrosciences.com',
    siteName: 'Argho Agrosciences',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Argho Agrosciences — Nutrição de precisão',
    description:
      'Fertilizantes de origem europeia com registro MAPA; linhas biológica e de adjuvantes nacionais.',
  },
};

// JSON-LD Organization — associa marca, logo e CNPJ nos buscadores
const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Argho Agrosciences',
  url: 'https://arghoagrosciences.com',
  logo: 'https://arghoagrosciences.com/argho-logo-color.png',
  taxID: '26.686.958/0001-71',
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'PR',
    addressCountry: 'BR',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <script type="application/ld+json">{JSON.stringify(ORGANIZATION_JSONLD)}</script>
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo
        </a>
        <HeartIntro />
        <Nav />
        <div id="conteudo" style={{ paddingTop: '88px' }}>
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
