// apps/academia/src/app/(trilhas)/trilhas/[slug]/page.tsx
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return { title: slug.replace(/-/g, ' ') };
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
  expert: 'Especialista',
};

const LESSON_TYPE_LABELS: Record<string, string> = {
  video: 'Vídeo',
  article: 'Artigo',
  quiz: 'Quiz',
  simulation: 'Simulação',
  document: 'Documento',
  interactive: 'Interativo',
};

export default async function TrilhaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: trilha, error } = await supabase
    .from('learning_tracks')
    .select(
      `id, title, subtitle, description, level, estimated_minutes,
       grants_certification, certification_validity_days, audience,
       learning_modules(
         id, slug, title, description, sort_order,
         learning_lessons(id, slug, title, type, estimated_minutes, is_required, sort_order)
       )`,
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !trilha) {
    notFound();
  }

  // Sort modules and lessons
  const modules = [...(trilha.learning_modules ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  for (const mod of modules) {
    if (Array.isArray(mod.learning_lessons)) {
      mod.learning_lessons = [...mod.learning_lessons].sort((a, b) => a.sort_order - b.sort_order);
    }
  }

  const totalLessons = modules.reduce(
    (acc, m) => acc + (Array.isArray(m.learning_lessons) ? m.learning_lessons.length : 0),
    0,
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>
      {/* Back */}
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.875rem',
          color: 'var(--colheita-text-tertiary)',
          textDecoration: 'none',
          marginBottom: '32px',
        }}
      >
        ← Todas as trilhas
      </Link>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '48px',
          alignItems: 'start',
        }}
      >
        {/* Main */}
        <div>
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'var(--colheita-brand-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '10px',
              }}
            >
              {LEVEL_LABELS[trilha.level] ?? trilha.level}
            </p>
            <h1
              style={{
                fontSize: '2.25rem',
                fontWeight: '600',
                color: 'var(--colheita-text-primary)',
                letterSpacing: '-0.03em',
                marginBottom: '12px',
                lineHeight: 1.2,
              }}
            >
              {trilha.title}
            </h1>
            {trilha.subtitle && (
              <p
                style={{
                  fontSize: '1.0625rem',
                  color: 'var(--colheita-text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '16px',
                }}
              >
                {trilha.subtitle}
              </p>
            )}
            {trilha.description && (
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--colheita-text-secondary)',
                  lineHeight: 1.7,
                }}
              >
                {trilha.description}
              </p>
            )}
          </div>

          {/* Modules */}
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
              Conteúdo ({totalLessons} {totalLessons === 1 ? 'lição' : 'lições'})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {modules.map((mod, modIndex) => (
                <div
                  key={mod.id}
                  style={{
                    border: '1px solid var(--colheita-border)',
                    borderRadius: 'var(--colheita-radius-lg)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Module header */}
                  <div
                    style={{
                      padding: '16px 20px',
                      backgroundColor: 'var(--colheita-surface-card)',
                      borderBottom:
                        Array.isArray(mod.learning_lessons) && mod.learning_lessons.length > 0
                          ? '1px solid var(--colheita-border-subtle)'
                          : 'none',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: '600',
                        color: 'var(--colheita-text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: '4px',
                      }}
                    >
                      Módulo {modIndex + 1}
                    </p>
                    <p
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        color: 'var(--colheita-text-primary)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {mod.title}
                    </p>
                    {mod.description && (
                      <p
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--colheita-text-secondary)',
                          marginTop: '4px',
                          lineHeight: 1.5,
                        }}
                      >
                        {mod.description}
                      </p>
                    )}
                  </div>

                  {/* Lessons */}
                  {Array.isArray(mod.learning_lessons) &&
                    mod.learning_lessons.map((lesson, lessonIndex) => (
                      <Link
                        key={lesson.id}
                        href={`/trilhas/${slug}/${mod.slug}/${lesson.slug}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 20px',
                          textDecoration: 'none',
                          borderBottom:
                            lessonIndex < mod.learning_lessons.length - 1
                              ? '1px solid var(--colheita-border-subtle)'
                              : 'none',
                          backgroundColor: 'var(--colheita-surface-elevated)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              color: 'var(--colheita-text-tertiary)',
                              width: '20px',
                              textAlign: 'right',
                              flexShrink: 0,
                            }}
                          >
                            {lessonIndex + 1}
                          </span>
                          <div>
                            <p
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'var(--colheita-text-primary)',
                              }}
                            >
                              {lesson.title}
                            </p>
                            <p
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--colheita-text-tertiary)',
                                marginTop: '2px',
                              }}
                            >
                              {LESSON_TYPE_LABELS[lesson.type] ?? lesson.type}
                              {lesson.estimated_minutes ? ` · ${lesson.estimated_minutes}min` : ''}
                              {!lesson.is_required ? ' · Opcional' : ''}
                            </p>
                          </div>
                        </div>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ color: 'var(--colheita-text-tertiary)', flexShrink: 0 }}
                          aria-hidden="true"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </Link>
                    ))}
                </div>
              ))}

              {modules.length === 0 && (
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--colheita-text-tertiary)',
                    padding: '24px 0',
                  }}
                >
                  Conteúdo em preparação.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div
          style={{
            backgroundColor: 'var(--colheita-surface-elevated)',
            border: '1px solid var(--colheita-border)',
            borderRadius: 'var(--colheita-radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'sticky',
            top: '72px',
          }}
        >
          <Link
            href={`/trilhas/${slug}/iniciar`}
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '10px 20px',
              borderRadius: 'var(--colheita-radius-md)',
              backgroundColor: 'var(--colheita-brand-primary)',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600',
              textDecoration: 'none',
              letterSpacing: '-0.01em',
            }}
          >
            Iniciar trilha
          </Link>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {trilha.estimated_minutes && (
              <div>
                <p
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: '600',
                    color: 'var(--colheita-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '4px',
                  }}
                >
                  Duração
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-primary)' }}>
                  {trilha.estimated_minutes >= 60
                    ? `${Math.round(trilha.estimated_minutes / 60)}h`
                    : `${trilha.estimated_minutes} minutos`}
                </p>
              </div>
            )}

            <div>
              <p
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: '600',
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '4px',
                }}
              >
                Nível
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-primary)' }}>
                {LEVEL_LABELS[trilha.level] ?? trilha.level}
              </p>
            </div>

            {trilha.audience.length > 0 && (
              <div>
                <p
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: '600',
                    color: 'var(--colheita-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '4px',
                  }}
                >
                  Público-alvo
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-primary)' }}>
                  {trilha.audience.join(', ')}
                </p>
              </div>
            )}

            {trilha.grants_certification && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--colheita-radius-md)',
                  backgroundColor:
                    'color-mix(in srgb, var(--colheita-brand-primary) 10%, transparent)',
                  border:
                    '1px solid color-mix(in srgb, var(--colheita-brand-primary) 20%, transparent)',
                }}
              >
                <p
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    color: 'var(--colheita-brand-primary)',
                    marginBottom: '4px',
                  }}
                >
                  Emite certificado
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--colheita-text-secondary)' }}>
                  {trilha.certification_validity_days
                    ? `Válido por ${trilha.certification_validity_days} dias`
                    : 'Validade permanente'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
