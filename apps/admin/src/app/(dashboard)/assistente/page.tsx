// apps/admin/src/app/(dashboard)/assistente/page.tsx
import type { Metadata } from 'next';
import { AdminChatPanel } from '@/components/assistente/admin-chat-panel';

export const metadata: Metadata = {
  title: 'Assistente IA',
};

export default function AssistentePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Page header */}
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
          Assistente IA
        </h1>
        <p
          style={{
            margin: '4px 0 0',
            fontSize: '0.8125rem',
            color: 'var(--colheita-text-tertiary)',
          }}
        >
          Consulte produtos, doses, indicações por cultura e trilhas de aprendizado.
        </p>
      </header>

      {/* Chat panel — flex 1 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <AdminChatPanel />
      </div>
    </div>
  );
}
