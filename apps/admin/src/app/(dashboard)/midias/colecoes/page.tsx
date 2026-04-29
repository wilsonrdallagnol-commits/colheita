// apps/admin/src/app/(dashboard)/midias/colecoes/page.tsx
import { createServerClient, requireAuth } from '@colheita/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
} from '@colheita/ui';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const metadata = { title: 'Coleções de Mídia' };

export default async function ColecoesPage() {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { data: colecoes } = await supabase
    .from('asset_collections')
    .select('id, slug, name, description, created_at')
    .order('name');

  const list = colecoes ?? [];

  return (
    <div style={{ padding: '32px' }}>
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span style={{ color: 'var(--colheita-text-tertiary)', fontSize: '0.8125rem' }}>
              Argho
            </span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link
              href="/midias"
              style={{
                color: 'var(--colheita-text-tertiary)',
                fontSize: '0.8125rem',
                textDecoration: 'none',
              }}
            >
              Mídias
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>Coleções</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div
        style={{
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'var(--colheita-text-primary)',
              letterSpacing: '-0.025em',
              marginBottom: '4px',
            }}
          >
            Coleções
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
            {list.length} {list.length === 1 ? 'coleção' : 'coleções'}
          </p>
        </div>

        <Button asChild size="sm">
          <Link href="/midias/colecoes/nova">+ Nova coleção</Link>
        </Button>
      </div>

      <div
        style={{
          border: '1px solid var(--colheita-border-subtle)',
          borderRadius: 'var(--colheita-radius-lg)',
          overflow: 'hidden',
        }}
      >
        {list.length === 0 ? (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--colheita-text-tertiary)',
              fontSize: '0.875rem',
            }}
          >
            Nenhuma coleção ainda.{' '}
            <Link
              href="/midias/colecoes/nova"
              style={{ color: 'var(--colheita-brand-primary)', textDecoration: 'none' }}
            >
              Criar a primeira
            </Link>
            .
          </div>
        ) : (
          list.map((col, idx) => (
            <Link
              key={col.id as string}
              href={`/midias?colecao=${col.slug as string}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  borderBottom:
                    idx < list.length - 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--colheita-radius-md)',
                    backgroundColor: 'var(--colheita-surface-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.125rem',
                    flexShrink: 0,
                  }}
                >
                  📁
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'var(--colheita-text-primary)',
                      marginBottom: '2px',
                    }}
                  >
                    {col.name as string}
                  </div>
                  {col.description && (
                    <div
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--colheita-text-tertiary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col.description as string}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--colheita-text-tertiary)',
                    fontFamily: 'var(--font-mono)',
                    flexShrink: 0,
                  }}
                >
                  {col.slug as string}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
