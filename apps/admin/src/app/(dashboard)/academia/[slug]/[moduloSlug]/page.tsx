// apps/admin/src/app/(dashboard)/academia/[slug]/[moduloSlug]/page.tsx
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
import { LicaoActions } from '@/components/academia/licao-actions';
import { LicaoForm } from '@/components/academia/licao-form';
import { createLicao } from '@/lib/actions/academia';

interface PageProps {
  params: Promise<{ slug: string; moduloSlug: string }>;
}

const LESSON_TYPE_LABELS: Record<string, string> = {
  article: 'Artigo',
  video: 'Vídeo',
  quiz: 'Quiz',
  simulation: 'Simulação',
  document: 'Documento',
  interactive: 'Interativo',
};

export async function generateMetadata({ params }: PageProps) {
  const { moduloSlug } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const { data } = await supabase
    .from('learning_modules')
    .select('title')
    .eq('slug', moduloSlug)
    .single();
  return { title: data?.title ?? moduloSlug };
}

export default async function ModuloDetailPage({ params }: PageProps) {
  const { slug, moduloSlug } = await params;
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Fetch module with track info and lessons
  const { data: modulo, error } = await supabase
    .from('learning_modules')
    .select(
      `id, slug, title, description, sort_order,
       learning_tracks!inner(id, slug, title),
       learning_lessons(
         id, slug, title, type, estimated_minutes, is_required, sort_order
       )`,
    )
    .eq('slug', moduloSlug)
    .eq('learning_tracks.slug', slug)
    .single();

  if (error || !modulo) notFound();

  const track = Array.isArray(modulo.learning_tracks)
    ? modulo.learning_tracks[0]
    : modulo.learning_tracks;

  if (!track) notFound();

  const lessons = [...(modulo.learning_lessons ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  const createLicaoForModule = createLicao.bind(null, modulo.id);

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)', maxWidth: '900px' }}>
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
            <Link
              href={`/academia/${slug}`}
              style={{
                fontSize: '0.8125rem',
                color: 'var(--colheita-text-secondary)',
                textDecoration: 'none',
              }}
            >
              {track.title}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>{modulo.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '32px',
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
            {modulo.title}
          </h1>
          {modulo.description && (
            <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
              {modulo.description}
            </p>
          )}
        </div>
        <Button asChild variant="outline" size="sm" style={{ flexShrink: 0 }}>
          <Link href={`/academia/${slug}/${moduloSlug}/editar`}>Editar módulo</Link>
        </Button>
      </div>

      {/* Lições */}
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
          Lições ({lessons.length})
        </h2>

        {lessons.length > 0 && (
          <div
            style={{
              border: '1px solid var(--colheita-border-subtle)',
              borderRadius: 'var(--colheita-radius-lg)',
              overflow: 'hidden',
              marginBottom: '24px',
            }}
          >
            {lessons.map((licao, idx) => (
              <div
                key={licao.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderBottom:
                    idx < lessons.length - 1 ? '1px solid var(--colheita-border-subtle)' : 'none',
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
                    <span
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        color: 'var(--colheita-text-primary)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {licao.title}
                    </span>
                    <Badge variant="secondary" style={{ fontSize: '0.6875rem' }}>
                      {LESSON_TYPE_LABELS[licao.type] ?? licao.type}
                    </Badge>
                    {!licao.is_required && (
                      <Badge variant="secondary" style={{ fontSize: '0.6875rem' }}>
                        Opcional
                      </Badge>
                    )}
                  </div>
                  {licao.estimated_minutes && (
                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--colheita-text-tertiary)',
                        marginTop: '2px',
                        marginLeft: '28px',
                      }}
                    >
                      {licao.estimated_minutes} min
                    </p>
                  )}
                </div>

                <LicaoActions
                  licaoId={licao.id}
                  editHref={`/academia/${slug}/${moduloSlug}/${licao.slug}/editar`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Nova lição */}
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
            Adicionar lição
          </h3>
          <LicaoForm action={createLicaoForModule} nextSortOrder={lessons.length} />
        </div>
      </div>
    </div>
  );
}
