// apps/academia/src/app/(privado)/meu-progresso/page.tsx
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const metadata = { title: 'Meu Progresso' };

export default async function MeuProgressoPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Busca progresso e certificações do aluno
  const [{ data: progressData }, { data: certData }] = await Promise.all([
    supabase
      .from('learning_progress')
      .select(
        `status, completed_at, score,
         learning_lessons(title, type,
           learning_modules(title, learning_tracks(slug, title)))`,
      )
      .eq('user_id', user?.id ?? '')
      .order('updated_at', { ascending: false })
      .limit(10),

    supabase
      .from('certifications')
      .select(
        `certificate_no, issued_at, expires_at, status, final_score,
         learning_tracks(slug, title)`,
      )
      .eq('user_id', user?.id ?? '')
      .eq('status', 'active')
      .order('issued_at', { ascending: false }),
  ]);

  const progressList = progressData ?? [];
  const certList = certData ?? [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1
          style={{
            fontSize: '1.875rem',
            fontWeight: '600',
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.025em',
            marginBottom: '8px',
          }}
        >
          Meu Progresso
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)' }}>
          {user?.email}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {/* Atividade recente */}
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
            Atividade recente
          </h2>

          <div
            style={{
              border: '1px solid var(--colheita-border)',
              borderRadius: 'var(--colheita-radius-lg)',
              overflow: 'hidden',
            }}
          >
            {progressList.length > 0 ? (
              progressList.map((p, i) => {
                const lesson = Array.isArray(p.learning_lessons)
                  ? p.learning_lessons[0]
                  : p.learning_lessons;
                const mod = lesson
                  ? Array.isArray(lesson.learning_modules)
                    ? lesson.learning_modules[0]
                    : lesson.learning_modules
                  : null;
                const track = mod
                  ? Array.isArray(mod.learning_tracks)
                    ? mod.learning_tracks[0]
                    : mod.learning_tracks
                  : null;

                return (
                  <div
                    key={`${p.status}-${i}`}
                    style={{
                      padding: '14px 20px',
                      borderBottom:
                        i < progressList.length - 1
                          ? '1px solid var(--colheita-border-subtle)'
                          : 'none',
                      backgroundColor: 'var(--colheita-surface-elevated)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: 'var(--colheita-text-primary)',
                          marginBottom: '2px',
                        }}
                      >
                        {lesson?.title ?? '—'}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--colheita-text-tertiary)' }}>
                        {track?.title ?? 'Trilha desconhecida'}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: '600',
                        color:
                          p.status === 'completed'
                            ? 'var(--colheita-brand-primary)'
                            : 'var(--colheita-text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {p.status === 'completed' ? '✓ Concluída' : 'Em andamento'}
                    </span>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  padding: '32px',
                  textAlign: 'center',
                  color: 'var(--colheita-text-tertiary)',
                  backgroundColor: 'var(--colheita-surface-elevated)',
                }}
              >
                <p style={{ fontSize: '0.875rem' }}>Nenhuma atividade ainda.</p>
                <Link
                  href="/"
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--colheita-brand-primary)',
                    textDecoration: 'none',
                    display: 'inline-block',
                    marginTop: '8px',
                  }}
                >
                  Explorar trilhas →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Certificações */}
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
            Certificações ({certList.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {certList.length > 0 ? (
              certList.map((cert) => {
                const track = Array.isArray(cert.learning_tracks)
                  ? cert.learning_tracks[0]
                  : cert.learning_tracks;
                const issuedDate = cert.issued_at
                  ? new Date(cert.issued_at).toLocaleDateString('pt-BR')
                  : '—';

                return (
                  <div
                    key={cert.certificate_no}
                    style={{
                      padding: '16px 20px',
                      border: '1px solid var(--colheita-border)',
                      borderRadius: 'var(--colheita-radius-lg)',
                      backgroundColor: 'var(--colheita-surface-elevated)',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        color: 'var(--colheita-text-primary)',
                        marginBottom: '6px',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {track?.title ?? 'Trilha desconhecida'}
                    </p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--colheita-text-tertiary)' }}>
                        Emitido em {issuedDate}
                      </p>
                      {cert.final_score && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--colheita-text-tertiary)' }}>
                          Score: {cert.final_score}%
                        </p>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: '0.6875rem',
                        color: 'var(--colheita-text-tertiary)',
                        fontFamily: 'var(--font-mono)',
                        marginTop: '8px',
                      }}
                    >
                      #{cert.certificate_no}
                    </p>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  padding: '32px',
                  border: '1px solid var(--colheita-border)',
                  borderRadius: 'var(--colheita-radius-lg)',
                  textAlign: 'center',
                  color: 'var(--colheita-text-tertiary)',
                  backgroundColor: 'var(--colheita-surface-elevated)',
                }}
              >
                <p style={{ fontSize: '0.875rem' }}>Nenhuma certificação ainda.</p>
                <p style={{ fontSize: '0.8125rem', marginTop: '4px', lineHeight: 1.5 }}>
                  Conclua uma trilha com emissão de certificado para ver aqui.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
