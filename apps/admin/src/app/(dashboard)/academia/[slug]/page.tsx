// apps/admin/src/app/(dashboard)/academia/[slug]/page.tsx
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
import { notFound } from 'next/navigation';
import { ModuloActions } from '@/components/academia/modulo-actions';
import { ModuloForm } from '@/components/academia/modulo-form';
import { TrilhaActions } from '@/components/academia/trilha-actions';
import { createModulo } from '@/lib/actions/academia';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
  expert: 'Especialista',
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return { title: slug };
}

export default async function TrilhaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { data: trilha, error } = await supabase
    .from('learning_tracks')
    .select(
      `id, slug, title, subtitle, level, status, grants_certification, audience, estimated_minutes,
       learning_modules(
         id, slug, title, description, sort_order,
         learning_lessons(count)
       )`,
    )
    .eq('slug', slug)
    .single();

  if (error || !trilha) notFound();

  const modules = [...(trilha.learning_modules ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  const createModuloForTrack = createModulo.bind(null, trilha.id);

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
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
              href="/academia"
              style={{
                fontSize: '0.8125rem',
                color: 'var(--colheita-text-secondary)',
                textDecoration: 'none',
              }}
            >
              Academia
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>{trilha.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '32px',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'var(--colheita-text-primary)',
                letterSpacing: '-0.025em',
              }}
            >
              {trilha.title}
            </h1>
            <Badge variant={trilha.status === 'published' ? 'default' : 'secondary'}>
              {trilha.status}
            </Badge>
          </div>
          {trilha.subtitle && (
            <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
              {trilha.subtitle}
            </p>
          )}
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--colheita-text-tertiary)' }}>
              {LEVEL_LABELS[trilha.level] ?? trilha.level}
            </span>
            {trilha.estimated_minutes && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--colheita-text-tertiary)' }}>
                {trilha.estimated_minutes}min
              </span>
            )}
            {trilha.grants_certification && (
              <Badge variant="secondary" style={{ fontSize: '0.6875rem' }}>
                Certificado
              </Badge>
            )}
            {trilha.audience.length > 0 && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--colheita-text-tertiary)' }}>
                Público: {trilha.audience.join(', ')}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <TrilhaActions trilhaId={trilha.id} currentStatus={trilha.status} />
          <Button asChild variant="outline" size="sm">
            <Link href={`/academia/${slug}/editar`}>Editar trilha</Link>
          </Button>
        </div>
      </div>

      {/* Módulos */}
      <div>
        <h2
          style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: 'var(--colheita-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '16px',
          }}
        >
          Módulos ({modules.length})
        </h2>

        {modules.length > 0 && (
          <div
            style={{
              border: '1px solid var(--colheita-border-subtle)',
              borderRadius: 'var(--colheita-radius-lg)',
              overflow: 'hidden',
              marginBottom: '24px',
            }}
          >
            {modules.map((mod, idx) => {
              const lessonsCount = Array.isArray(mod.learning_lessons)
                ? ((mod.learning_lessons[0] as { count?: number } | undefined)?.count ?? 0)
                : 0;

              return (
                <div
                  key={mod.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderBottom:
                      idx < modules.length - 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
                    backgroundColor: 'var(--colheita-surface-elevated)',
                    gap: '16px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          color: 'var(--colheita-text-tertiary)',
                          fontWeight: '600',
                          minWidth: '20px',
                        }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <Link
                        href={`/academia/${slug}/${mod.slug}`}
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: '600',
                          color: 'var(--colheita-text-primary)',
                          letterSpacing: '-0.01em',
                          textDecoration: 'none',
                        }}
                      >
                        {mod.title}
                      </Link>
                    </div>
                    {mod.description && (
                      <p
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--colheita-text-secondary)',
                          marginTop: '2px',
                          marginLeft: '28px',
                        }}
                      >
                        {mod.description}
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
                      {lessonsCount} {lessonsCount === 1 ? 'lição' : 'lições'}
                    </span>
                    <ModuloActions moduloId={mod.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Novo módulo */}
        <div
          style={{
            border: '1px solid var(--colheita-border-subtle)',
            borderRadius: 'var(--colheita-radius-lg)',
            padding: '20px',
            backgroundColor: 'var(--colheita-surface-card)',
          }}
        >
          <h3
            style={{
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: 'var(--colheita-text-secondary)',
              marginBottom: '16px',
            }}
          >
            Adicionar módulo
          </h3>
          <ModuloForm action={createModuloForTrack} nextSortOrder={modules.length} />
        </div>
      </div>
    </div>
  );
}
