// apps/admin/src/app/layout.tsx
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Argho Admin',
    template: '%s — Argho Admin',
  },
  description: 'Painel administrativo Argho Agrosciences',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
