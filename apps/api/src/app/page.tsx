// apps/api/src/app/page.tsx
import { type NextRequest, NextResponse } from 'next/server';

// Redirect to API docs / index JSON
export async function GET(_request: NextRequest) {
  return NextResponse.json(
    {
      name: 'Argho Agrosciences API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        catalog: '/api/v1/catalog',
        catalogItem: '/api/v1/catalog/:slug',
        webhooks: {
          safra: '/api/webhooks/safra',
        },
      },
      docs: 'https://docs.argho.com.br/api',
    },
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

export default function ApiRoot() {
  return (
    <pre
      style={{
        padding: '32px',
        fontSize: '0.875rem',
        lineHeight: 1.7,
        color: '#a3e635',
        maxWidth: '600px',
      }}
    >
      {JSON.stringify(
        {
          name: 'Argho Agrosciences API',
          version: '1.0.0',
          endpoints: {
            health: '/api/health',
            catalog: '/api/v1/catalog',
            catalogItem: '/api/v1/catalog/:slug',
            webhooks: { safra: '/api/webhooks/safra' },
          },
        },
        null,
        2,
      )}
    </pre>
  );
}
