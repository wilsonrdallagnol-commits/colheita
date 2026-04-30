// apps/admin/src/app/(dashboard)/academia/page.tsx
import { createServerClient, requireAuth } from '@colheita/auth';
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
} from '@colheita/ui';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const metadata = { title: 'Academia' };

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
  expert: 'Especialista',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  published: 'default',
  draft: 'secondary',
  archived: 'secondary',
};

export default async function AcademiaPage() {
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { data: trilhas } = await supabase
    .from('learning_tracks')
    .select(
      `id, slug, title, subtitle, level, status, sort_order, grants_certification,
       modules:learning_modules(count)`,
    )
    .order('sort_order')
    .order('title');

  const trilhasList = (trilhas ?? []).map((t) => ({
    ...t,
    modulesCount: Array.isArray(t.modules)
      ? ((t.modules[0] as { count?: number } | undefined)?.count ?? 0)
      : 0,
  }));

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
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>Academia</BreadcrumbPage>
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
            Academia
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
            {trilhasList.length} {trilhasList.length === 1 ? 'trilha' : 'trilhas'} de aprendizado
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            href="/academia/certificados"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--colheita-radius-md)',
              border: '1px solid var(--colheita-border)',
              backgroundColor: 'var(--colheita-surface-elevated)',
              color: 'var(--colheita-text-secondary)',
              fontSize: '0.8125rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            🎓 Certificações
          </Link>
          <Button asChild size="sm">
            <Link href="/academia/nova">+ Nova trilha</Link>
          </Button>
        </div>
      </div>

      <div
        style={{
          border: '1px solid var(--colheita-border-subtle)',
          borderRadius: 'var(--colheita-radius-lg)',
          overflow: 'hidden',
        }}
      >
        {trilhasList.length === 0 ? (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--colheita-text-tertiary)',
              fontSize: '0.875rem',
            }}
          >
            Nenhuma trilha ainda.{' '}
            <Link
              href="/academia/nova"
              style={{ color: 'var(--colheita-brand-primary)', textDecoration: 'none' }}
            >
              Criar a primeira
            </Link>
            .
          </div>
        ) : (
          trilhasList.map((trilha, idx) => (
            <div
              key={trilha.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom:
                  idx < trilhasList.length - 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
                backgroundColor: 'var(--colheita-surface-elevated)',
                gap: '16px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Link
                    href={`/academia/${trilha.slug}`}
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      color: 'var(--colheita-text-primary)',
                      textDecoration: 'none',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {trilha.title}
                  </Link>
                  <Badge variant={STATUS_VARIANT[trilha.status] ?? 'secondary'}>
                    {trilha.status}
                  </Badge>
                  {trilha.grants_certification && (
                    <Badge variant="secondary" style={{ fontSize: '0.6875rem' }}>
                      Certificado
                    </Badge>
                  )}
                </div>
                {trilha.subtitle && (
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--colheita-text-secondary)',
                      marginTop: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {trilha.subtitle}
                  </p>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '0.8125rem', color: 'var(--colheita-text-tertiary)' }}>
                  {LEVEL_LABELS[trilha.level] ?? trilha.level}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--colheita-text-tertiary)' }}>
                  {trilha.modulesCount} {trilha.modulesCount === 1 ? 'módulo' : 'módulos'}
                </span>
                <Link
                  href={`/academia/${trilha.slug}/editar`}
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--colheita-brand-primary)',
                    textDecoration: 'none',
                  }}
                >
                  Editar
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
