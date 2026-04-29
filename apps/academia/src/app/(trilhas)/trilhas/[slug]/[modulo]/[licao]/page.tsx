// apps/academia/src/app/(trilhas)/trilhas/[slug]/[modulo]/[licao]/page.tsx
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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

  // Fetch lesson via joined query
  const { data, error } = await supabase
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
    .single();

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
          <div style={{ whiteSpace: 'pre-line' }}>{markdown}</div>
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

      {/* Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '48px',
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
        <button
          type="button"
          style={{
            padding: '8px 20px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'var(--colheita-brand-primary)',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Marcar como concluída
        </button>
      </div>
    </div>
  );
}
