'use client';

// apps/admin/src/components/configuracoes/reindex-button.tsx
//
// Dispara POST /api/admin/reindex — indexa produtos + lições no pgvector.
// O endpoint usa as credenciais do Vercel (sem chave local).

import { Button } from '@colheita/ui';
import { ArrowRight, CheckCircle2, Database, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState, useTransition } from 'react';

interface ReindexResult {
  ok: true;
  provider: string;
  products: number;
  productChunks: number;
  lessons: number;
  lessonChunks: number;
  totalChunks: number;
}

export function ReindexButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ReindexResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = useCallback(() => {
    startTransition(async () => {
      setError(null);
      setResult(null);
      try {
        const res = await fetch('/api/admin/reindex', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'Falha na indexação.');
          return;
        }
        setResult(data as ReindexResult);
      } catch {
        setError('Falha de rede ao chamar a indexação.');
      }
    });
  }, []);

  return (
    <div>
      <Button type="button" onClick={handleClick} disabled={isPending}>
        <RefreshCw
          size={14}
          strokeWidth={1.75}
          style={{
            marginRight: 6,
            animation: isPending ? 'spin 1s linear infinite' : undefined,
          }}
        />
        {isPending ? 'Indexando…' : 'Reindexar conteúdo (RAG)'}
        <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      </Button>

      {result ? (
        <div
          style={{
            marginTop: '12px',
            padding: '12px 14px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'var(--colheita-brand-secondary-soft)',
            border: '1px solid var(--colheita-brand-secondary-line)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <CheckCircle2
            size={16}
            strokeWidth={1.75}
            color="var(--colheita-brand-secondary)"
            style={{ flexShrink: 0, marginTop: '1px' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#0a0a0a',
                margin: '0 0 2px',
              }}
            >
              {result.totalChunks} chunks indexados no pgvector
            </p>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--colheita-text-secondary)',
                margin: '0 0 8px',
              }}
            >
              {result.products} produtos ({result.productChunks} chunks) · {result.lessons} lições (
              {result.lessonChunks} chunks) · provider {result.provider}
            </p>
            {result.provider === 'MockEmbeddingProvider' && (
              <p
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--colheita-danger)',
                  margin: '0 0 8px',
                  fontStyle: 'italic',
                }}
              >
                ⚠ Provider mock detectado — RAG não funcional. Configure VOYAGE_API_KEY ou
                OPENAI_API_KEY na Vercel.
              </p>
            )}
            <Link
              href="/assistente"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--colheita-brand-primary)',
                textDecoration: 'none',
              }}
            >
              Testar no Assistente IA
              <ArrowRight size={12} strokeWidth={2} />
            </Link>
          </div>
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          style={{
            marginTop: '12px',
            fontSize: '0.8125rem',
            color: 'var(--colheita-danger)',
            padding: '10px 12px',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
          }}
        >
          {error}
        </p>
      ) : null}

      <p
        style={{
          marginTop: '10px',
          fontSize: '0.75rem',
          color: 'var(--colheita-text-tertiary)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <Database size={12} strokeWidth={1.75} />
        Idempotente — rode após adicionar produtos ou lições novas.
      </p>
    </div>
  );
}
