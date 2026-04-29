// apps/academia/src/app/(trilhas)/trilhas/[slug]/[modulo]/[licao]/page.tsx
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Markdown } from '@/components/markdown';
import { MarkCompleteButton } from './mark-complete-button.js';

interface PageProps {
  params: Promise<{ slug: string; modulo: string; licao: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { licao } = await params;
  return { title: licao.replace(/-/g, ' ') };
}

export default async function LicaoPage({ params }: PageProps) {
  const { slug, modulo, licao } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // Fetch lesson + all siblings for prev/next navigation in parallel
  const [{ data, error }, { data: allLessons }, { data: authData }] = await Promise.all([
    supabase
      .from('learning_lessons')
      .select(
        `id, title, type, content, estimated_minutes, is_required,
         learning_modules!inner(
           slug, title,
           learning_tracks!inner(slug, title)
         )`,
      )
      .eq('slug', licao)
      .eq('learning_modules.slug', modulo)
      .eq('learning_modules.learning_tracks.slug', slug)
      .single(),

    // All lessons in this track — for prev/next links
    supabase
      .from('learning_lessons')
      .select(
        `slug, sort_order,
         learning_modules!inner(slug, sort_order, learning_tracks!inner(slug))`,
      )
      .eq('learning_modules.learning_tracks.slug', slug),

    supabase.auth.getUser(),
  ]);

  if (error || !data) {
    notFound();
  }

  const mod = Array.isArray(data.learning_modules)
    ? data.learning_modules[0]
    : data.learning_modules;
  const track = mod
    ? Array.isArray(mod.learning_tracks)
      ? mod.learning_tracks[0]
      : mod.learning_tracks
    : null;

  const content = data.content as Record<string, unknown>;
  const markdown = typeof content.markdown === 'string' ? content.markdown : null;

  // Build flat sorted lesson list for prev/next navigation
  type LessonNav = {
    lessonSlug: string;
    moduleSlug: string;
    moduleSortOrder: number;
    lessonSortOrder: number;
  };
  const lessonList: LessonNav[] = (allLessons ?? [])
    .map((l) => {
      const lMod = Array.isArray(l.learning_modules) ? l.learning_modules[0] : l.learning_modules;
      if (!lMod) return null;
      return {
        lessonSlug: l.slug,
        moduleSlug: lMod.slug,
        moduleSortOrder: lMod.sort_order ?? 0,
        lessonSortOrder: l.sort_order ?? 0,
      };
    })
    .filter((l): l is LessonNav => l !== null)
    .sort((a, b) =>
      a.moduleSortOrder !== b.moduleSortOrder
        ? a.moduleSortOrder - b.moduleSortOrder
        : a.lessonSortOrder - b.lessonSortOrder,
    );

  const currentIdx = lessonList.findIndex((l) => l.lessonSlug === licao && l.moduleSlug === modulo);
  const prevLesson = currentIdx > 0 ? lessonList[currentIdx - 1] : null;
  const nextLesson =
    currentIdx >= 0 && currentIdx < lessonList.length - 1 ? lessonList[currentIdx + 1] : null;

  const user = authData?.user ?? null;

  // Check if the logged-in user has already completed this lesson

  let isCompleted = false;
  if (user) {
    const { data: progress } = await supabase
      .from('learning_progress')
      .select('status')
      .eq('user_id', user.id)
      .eq('lesson_id', data.id)
      .single();
    isCompleted = progress?.status === 'completed';
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 32px' }}>
      {/* Breadcrumb */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.8125rem',
          color: 'var(--colheita-text-tertiary)',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}
      >
        <Link href="/" style={{ color: 'var(--colheita-text-tertiary)', textDecoration: 'none' }}>
          Trilhas
        </Link>
        <span>›</span>
        {track && (
          <>
            <Link
              href={`/trilhas/${slug}`}
              style={{ color: 'var(--colheita-text-tertiary)', textDecoration: 'none' }}
            >
              {track.title}
            </Link>
            <span>›</span>
          </>
        )}
        {mod && <span style={{ color: 'var(--colheita-text-secondary)' }}>{mod.title}</span>}
      </nav>

      {/* Lesson header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'var(--colheita-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {data.type}
          </span>
          {data.estimated_minutes && (
            <span style={{ fontSize: '0.75rem', color: 'var(--colheita-text-tertiary)' }}>
              · {data.estimated_minutes}min
            </span>
          )}
          {!data.is_required && (
            <span style={{ fontSize: '0.75rem', color: 'var(--colheita-text-tertiary)' }}>
              · Opcional
            </span>
          )}
        </div>
        <h1
          style={{
            fontSize: '1.875rem',
            fontWeight: '600',
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.025em',
            lineHeight: 1.3,
          }}
        >
          {data.title}
        </h1>
      </div>

      {/* Content */}
      <div
        style={{
          fontSize: '0.9375rem',
          color: 'var(--colheita-text-secondary)',
          lineHeight: 1.8,
        }}
      >
        {data.type === 'article' && markdown ? (
          <Markdown content={markdown} />
        ) : data.type === 'video' ? (
          <div
            style={{
              backgroundColor: 'var(--colheita-surface-card)',
              border: '1px solid var(--colheita-border)',
              borderRadius: 'var(--colheita-radius-lg)',
              padding: '32px',
              textAlign: 'center',
              color: 'var(--colheita-text-tertiary)',
            }}
          >
            <p>Conteúdo em vídeo — player em desenvolvimento.</p>
          </div>
        ) : data.type === 'quiz' ? (
          <div
            style={{
              backgroundColor: 'var(--colheita-surface-card)',
              border: '1px solid var(--colheita-border)',
              borderRadius: 'var(--colheita-radius-lg)',
              padding: '32px',
              textAlign: 'center',
              color: 'var(--colheita-text-tertiary)',
            }}
          >
            <p>Quiz — módulo interativo em desenvolvimento.</p>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: 'var(--colheita-surface-card)',
              border: '1px solid var(--colheita-border)',
              borderRadius: 'var(--colheita-radius-lg)',
              padding: '32px',
              textAlign: 'center',
              color: 'var(--colheita-text-tertiary)',
            }}
          >
            <p>Tipo de conteúdo não suportado nesta versão.</p>
          </div>
        )}
      </div>

      {/* Prev/Next lesson navigation */}
      {(prevLesson ?? nextLesson) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginTop: '48px',
          }}
        >
          {prevLesson ? (
            <Link
              href={`/trilhas/${slug}/${prevLesson.moduleSlug}/${prevLesson.lessonSlug}`}
              style={{
                display: 'block',
                padding: '14px 18px',
                borderRadius: 'var(--colheita-radius-md)',
                border: '1px solid var(--colheita-border)',
                backgroundColor: 'var(--colheita-surface-card)',
                textDecoration: 'none',
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
                ← Anterior
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--colheita-text-secondary)',
                  lineHeight: 1.4,
                }}
              >
                {prevLesson.lessonSlug.replace(/-/g, ' ')}
              </p>
            </Link>
          ) : (
            <div />
          )}
          {nextLesson ? (
            <Link
              href={`/trilhas/${slug}/${nextLesson.moduleSlug}/${nextLesson.lessonSlug}`}
              style={{
                display: 'block',
                padding: '14px 18px',
                borderRadius: 'var(--colheita-radius-md)',
                border: '1px solid var(--colheita-border)',
                backgroundColor: 'var(--colheita-surface-card)',
                textDecoration: 'none',
                textAlign: 'right',
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
                Próxima →
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--colheita-text-secondary)',
                  lineHeight: 1.4,
                }}
              >
                {nextLesson.lessonSlug.replace(/-/g, ' ')}
              </p>
            </Link>
          ) : (
            <div />
          )}
        </div>
      )}

      {/* Action bar — mark complete / sign in */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid var(--colheita-border-subtle)',
        }}
      >
        <Link
          href={`/trilhas/${slug}`}
          style={{
            fontSize: '0.875rem',
            color: 'var(--colheita-text-secondary)',
            textDecoration: 'none',
          }}
        >
          ← Voltar à trilha
        </Link>
        {user ? (
          <MarkCompleteButton lessonId={data.id} isCompleted={isCompleted} />
        ) : (
          <Link
            href={`/entrar?next=/trilhas/${slug}/${modulo}/${licao}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 20px',
              borderRadius: 'var(--colheita-radius-md)',
              backgroundColor: 'var(--colheita-brand-primary)',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              textDecoration: 'none',
            }}
          >
            Entrar para acompanhar progresso
          </Link>
        )}
      </div>
    </div>
  );
}
