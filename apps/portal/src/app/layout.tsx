import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Argho Agrosciences',
    template: '%s — Argho',
  },
  description: 'Portfólio de produtos Argho Agrosciences — fertilizantes, biológicos e adjuvantes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
