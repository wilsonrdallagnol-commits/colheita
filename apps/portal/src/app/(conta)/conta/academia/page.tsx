// apps/portal/src/app/(conta)/conta/academia/page.tsx
//
// Hub de aprendizado dentro do portal distribuidor.
// Lista trilhas publicadas + progresso pessoal + certificações ativas.
// Botões de "Continuar" / "Começar" levam pro app academia (subdomínio
// separado em prod; cookie supabase compartilhado então sessão propaga).

import { createServerClient, requireAuth } from '@colheita/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { academiaCertificateUrl, academiaTrackUrl } from '@/lib/academia-url';
import { formatDate } from '@/lib/format-date';

export const metadata: Metadata = {
  title: 'Academia',
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
  expert: 'Especialista',
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--colheita-text-tertiary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '12px',
};

export default async function AcademiaPage() {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Paralelo: trilhas publicadas, progresso, certificações
  // FIX MÉDIO #13: usa lessons_count materializado (migration 0042)
  // em vez do triple-nested join. Evita transferir 10k rows pra
  // calcular um sum em catálogos de academia grandes.
  const [{ data: tracksData }, { data: progressData }, { data: certsData }] = await Promise.all([
    supabase
      .from('learning_tracks')
      .select(
        'id, slug, title, subtitle, level, estimated_minutes, grants_certification, lessons_count',
      )
      .eq('status', 'published')
      .order('created_at', { ascending: true }),

    supabase
      .from('learning_progress')
      .select(
        `lesson_id, status, updated_at,
         learning_lessons(id, module_id,
           learning_modules(track_id))`,
      )
      .eq('user_id', user.id),

    supabase
      .from('certifications')
      .select(`certificate_no, issued_at, final_score, status, learning_tracks(slug, title)`)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('issued_at', { ascending: false }),
  ]);

  const tracks = tracksData ?? [];
  const progress = progressData ?? [];
  const certs = certsData ?? [];

  // Agrupa progresso por track_id pra calcular % por trilha.
  // Supabase retorna joins como array OU objeto dependendo da multiplicidade;
  // normaliza pra extrair track_id de forma segura sem assumir formato.
  const progressByTrack = new Map<string, { completed: number; total: number }>();
  for (const p of progress) {
    const lessonRaw = p.learning_lessons as unknown;
    const lesson = Array.isArray(lessonRaw) ? lessonRaw[0] : lessonRaw;
    const modRaw = (lesson as { learning_modules?: unknown } | null)?.learning_modules;
    const mod = Array.isArray(modRaw) ? modRaw[0] : modRaw;
    const trackId = (mod as { track_id?: string } | null)?.track_id;
    if (!trackId) continue;
    const entry = progressByTrack.get(trackId) ?? { completed: 0, total: 0 };
    entry.total += 1;
    if (p.status === 'completed') entry.completed += 1;
    progressByTrack.set(trackId, entry);
  }

  function trackStats(track: (typeof tracks)[number]) {
    // lessons_count vem direto da coluna materializada (migration 0042).
    // Fallback ?? 0 cobre track ainda sem trigger rodado (não deveria
    // acontecer em prod pós-backfill, mas safe).
    const totalLessons = (track as { lessons_count?: number }).lessons_count ?? 0;
    const p = progressByTrack.get(track.id);
    const completed = p?.completed ?? 0;
    const pct = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
    return { totalLessons, completed, pct };
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--colheita-surface-background)',
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Link
          href="/conta"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--colheita-text-tertiary)',
            textDecoration: 'none',
            marginBottom: '20px',
          }}
        >
          ← Minha conta
        </Link>

        <header style={{ marginBottom: '32px' }}>
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--colheita-brand-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '8px',
            }}
          >
            Conta · Academia Argho
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(1.5rem, 2.4vw, 1.875rem)',
              fontWeight: 600,
              color: 'var(--colheita-text-primary)',
              letterSpacing: '-0.025em',
            }}
          >
            Trilhas de conhecimento
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: '0.875rem',
              color: 'var(--colheita-text-secondary)',
              lineHeight: 1.55,
            }}
          >
            Fundamentos agronômicos, manejo dos produtos Argho e diagnóstico de campo. Certificação
            ao completar a trilha.
          </p>
        </header>

        {/* Trilhas */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={sectionLabelStyle}>Trilhas disponíveis ({tracks.length})</h2>
          {tracks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tracks.map((track) => {
                const { totalLessons, completed, pct } = trackStats(track);
                const isStarted = completed > 0;
                const isDone = totalLessons > 0 && completed === totalLessons;
                return (
                  <a
                    key={track.id}
                    href={academiaTrackUrl(track.slug)}
                    style={{
                      padding: '20px 22px',
                      backgroundColor: 'var(--colheita-surface-card)',
                      border: '1px solid var(--colheita-border-subtle)',
                      borderRadius: 'var(--colheita-radius-lg)',
                      textDecoration: 'none',
                      display: 'block',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '16px',
                        marginBottom: '8px',
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p
                          style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: 'var(--colheita-text-primary)',
                            letterSpacing: '-0.01em',
                            margin: 0,
                            marginBottom: '4px',
                          }}
                        >
                          {track.title}
                        </p>
                        {track.subtitle && (
                          <p
                            style={{
                              fontSize: '0.8125rem',
                              color: 'var(--colheita-text-secondary)',
                              lineHeight: 1.5,
                              margin: 0,
                            }}
                          >
                            {track.subtitle}
                          </p>
                        )}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: '6px',
                          flexShrink: 0,
                        }}
                      >
                        {track.level && (
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              color: 'var(--colheita-text-tertiary)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                            }}
                          >
                            {LEVEL_LABELS[track.level] ?? track.level}
                          </span>
                        )}
                        {track.grants_certification && (
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              color: 'var(--colheita-brand-secondary)',
                              padding: '2px 8px',
                              borderRadius: '99px',
                              backgroundColor:
                                'var(--colheita-brand-secondary-soft, rgba(72,144,48,0.08))',
                            }}
                          >
                            🎓 Certificação
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    {totalLessons > 0 && (
                      <div style={{ marginTop: '14px' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.75rem',
                            color: 'var(--colheita-text-tertiary)',
                            marginBottom: '6px',
                          }}
                        >
                          <span>
                            {completed}/{totalLessons} lições
                            {track.estimated_minutes
                              ? ` · ${Math.round(track.estimated_minutes / 60)}h`
                              : ''}
                          </span>
                          <span style={{ fontWeight: 600 }}>
                            {isDone ? '✓ Concluído' : isStarted ? `${pct}%` : 'Não iniciado'}
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '4px',
                            borderRadius: '99px',
                            backgroundColor: 'var(--colheita-border-subtle)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              backgroundColor: isDone
                                ? 'var(--colheita-brand-secondary)'
                                : 'var(--colheita-brand-primary)',
                              transition: 'width 0.3s',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: 'var(--colheita-text-tertiary)',
                backgroundColor: 'var(--colheita-surface-elevated)',
                border: '1px solid var(--colheita-border-subtle)',
                borderRadius: 'var(--colheita-radius-lg)',
              }}
            >
              <p style={{ fontSize: '0.875rem' }}>Nenhuma trilha publicada ainda.</p>
            </div>
          )}
        </section>

        {/* Certificações */}
        <section>
          <h2 style={sectionLabelStyle}>Minhas certificações ({certs.length})</h2>
          {certs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {certs.map((cert) => {
                const track = Array.isArray(cert.learning_tracks)
                  ? cert.learning_tracks[0]
                  : cert.learning_tracks;
                const issuedDate = formatDate(cert.issued_at);
                return (
                  <a
                    key={cert.certificate_no}
                    href={academiaCertificateUrl(cert.certificate_no)}
                    style={{
                      padding: '14px 18px',
                      border: '1px solid var(--colheita-border-subtle)',
                      borderRadius: 'var(--colheita-radius-lg)',
                      backgroundColor: 'var(--colheita-surface-elevated)',
                      textDecoration: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                          color: 'var(--colheita-text-primary)',
                          letterSpacing: '-0.01em',
                          margin: 0,
                          marginBottom: '4px',
                        }}
                      >
                        🎓 {track?.title ?? 'Trilha'}
                      </p>
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--colheita-text-tertiary)',
                          fontFamily: 'var(--font-mono)',
                          margin: 0,
                        }}
                      >
                        #{cert.certificate_no} · {issuedDate}
                        {cert.final_score ? ` · Score ${cert.final_score}%` : ''}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--colheita-brand-primary)',
                        flexShrink: 0,
                      }}
                    >
                      Ver →
                    </span>
                  </a>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                color: 'var(--colheita-text-tertiary)',
                backgroundColor: 'var(--colheita-surface-elevated)',
                border: '1px solid var(--colheita-border-subtle)',
                borderRadius: 'var(--colheita-radius-lg)',
              }}
            >
              <p style={{ fontSize: '0.875rem', margin: 0 }}>
                Conclua uma trilha pra ganhar sua primeira certificação.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
