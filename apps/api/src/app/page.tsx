// apps/api/src/app/page.tsx
const API_INDEX = {
  name: 'Argho Agrosciences API',
  version: '1.0.0',
  endpoints: {
    health: '/api/health',
    catalog: '/api/v1/catalog',
    catalogItem: '/api/v1/catalog/:slug',
    webhooks: { safra: '/api/webhooks/safra' },
  },
  docs: 'https://docs.argho.com.br/api',
};

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
      {JSON.stringify(API_INDEX, null, 2)}
    </pre>
  );
}
