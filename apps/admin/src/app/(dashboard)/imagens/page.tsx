// apps/admin/src/app/(dashboard)/imagens/page.tsx
//
// Página de geração de imagens via Nano Banana Pro (Gemini 2.5 Flash Image).
// Server component para metadata + header; ImagenGeneratorPanel é client.

import type { Metadata } from 'next';
import { ImagenGeneratorPanel } from '@/components/imagens/imagen-generator-panel';

export const metadata: Metadata = {
  title: 'Gerar imagem',
};

export default function ImagensPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header
        style={{
          padding: '20px 32px 16px',
          borderBottom: '1px solid var(--colheita-border-subtle)',
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          Gerar imagem
        </h1>
        <p
          style={{
            margin: '4px 0 0',
            fontSize: '0.8125rem',
            color: 'var(--colheita-text-tertiary)',
          }}
        >
          Mockups de embalagem, fotos de produto, ilustrações técnicas via Nano Banana Pro (Gemini
          2.5 Flash Image). Custo aproximado: $0,04 por imagem.
        </p>
      </header>

      <div style={{ flex: 1, padding: '24px 32px', overflow: 'auto' }}>
        <ImagenGeneratorPanel />
      </div>
    </div>
  );
}
