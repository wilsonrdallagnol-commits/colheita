// apps/academia/src/app/layout.tsx
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
  return (
    <html lang="pt-BR" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
