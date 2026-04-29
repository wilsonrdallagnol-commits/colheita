// apps/api/src/app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Argho API',
  description: 'API pública Argho Agrosciences — catálogo e integrações',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          fontFamily: 'monospace',
          backgroundColor: '#0a0a0b',
          color: '#e5e5e5',
          margin: 0,
          padding: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}
