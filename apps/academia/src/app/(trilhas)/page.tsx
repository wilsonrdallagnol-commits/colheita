// apps/academia/src/app/(trilhas)/page.tsx
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const metadata = { title: 'Trilhas de Aprendizado' };

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
  expert: 'Especialista',
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'var(--colheita-brand-primary)',
  intermediate: '#2563eb',
  advanced: '#7c3aed',
  expert: '#dc2626',
};

export default async function TrilhasPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: trilhas } = await supabase
    .from('learning_tracks')
    .select('id, slug, title, subtitle, level, estimated_minutes, grants_certification, audience')
    .eq('status', 'published')
    .order('sort_order')
    .order('title');

  const trilhasList = trilhas ?? [];

  // Group by level
  const levels = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
  const grouped = new Map<string, typeof trilhasList>();
  for (const level of levels) {
    const items = trilhasList.filter((t) => t.level === level);
    if (items.length > 0) grouped.set(level, items);
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>
      {/* Hero */}
      <div style={{ marginBottom: '56px', maxWidth: '640px' }}>
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
          Academia Argho
        </h1>
        <p
          style={{
            fontSize: '1.0625rem',
            color: 'var(--colheita-text-secondary)',
            lineHeight: 1.6,
          }}
        >
          Capacitação técnica em nutrição de plantas, biológicos e adjuvantes — do fundamento ao
          especialista.
        </p>
      </div>

      {/* Trilhas por nível */}
      {Array.from(grouped.entries()).map(([level, items]) => (
        <section key={level} style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: LEVEL_COLORS[level] ?? 'var(--colheita-brand-primary)',
                flexShrink: 0,
              }}
            />
            <h2
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'var(--colheita-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: 0,
              }}
            >
              {LEVEL_LABELS[level] ?? level}
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px',
            }}
          >
            {items.map((t) => (
              <TrackCard key={t.slug} trilha={t} />
            ))}
          </div>
        </section>
      ))}

      {trilhasList.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 0',
            color: 'var(--colheita-text-tertiary)',
          }}
        >
          <p style={{ fontSize: '1rem' }}>Nenhuma trilha disponível no momento.</p>
        </div>
      )}
    </div>
  );
}

function TrackCard({
  trilha,
}: {
  trilha: {
    slug: string;
    title: string;
    subtitle: string | null;
    level: string;
    estimated_minutes: number | null;
    grants_certification: boolean;
    audience: string[];
  };
}) {
  return (
    <Link
      href={`/trilhas/${trilha.slug}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        borderRadius: 'var(--colheita-radius-lg)',
        border: '1px solid var(--colheita-border)',
        backgroundColor: 'var(--colheita-surface-elevated)',
        textDecoration: 'none',
        gap: '12px',
      }}
    >
      <div>
        <p
          style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.01em',
            marginBottom: '6px',
          }}
        >
          {trilha.title}
        </p>
        {trilha.subtitle && (
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--colheita-text-secondary)',
              lineHeight: 1.5,
            }}
          >
            {trilha.subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
        {trilha.estimated_minutes && (
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: '500',
              color: 'var(--colheita-text-tertiary)',
              backgroundColor: 'var(--colheita-surface-card)',
              border: '1px solid var(--colheita-border-subtle)',
              borderRadius: 'var(--colheita-radius-sm)',
              padding: '2px 8px',
            }}
          >
            {trilha.estimated_minutes >= 60
              ? `${Math.round(trilha.estimated_minutes / 60)}h`
              : `${trilha.estimated_minutes}min`}
          </span>
        )}
        {trilha.grants_certification && (
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: '500',
              color: 'var(--colheita-brand-primary)',
              backgroundColor: 'color-mix(in srgb, var(--colheita-brand-primary) 10%, transparent)',
              borderRadius: 'var(--colheita-radius-sm)',
              padding: '2px 8px',
            }}
          >
            Certificado
          </span>
        )}
        {trilha.audience.slice(0, 2).map((a) => (
          <span
            key={a}
            style={{
              fontSize: '0.6875rem',
              color: 'var(--colheita-text-tertiary)',
              backgroundColor: 'var(--colheita-surface-card)',
              border: '1px solid var(--colheita-border-subtle)',
              borderRadius: 'var(--colheita-radius-sm)',
              padding: '2px 8px',
            }}
          >
            {a}
          </span>
        ))}
      </div>
    </Link>
  );
}
