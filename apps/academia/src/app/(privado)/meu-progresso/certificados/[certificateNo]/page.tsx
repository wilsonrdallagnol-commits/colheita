// apps/academia/src/app/(privado)/meu-progresso/certificados/[certificateNo]/page.tsx
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ certificateNo: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { certificateNo } = await params;
  return { title: `Certificado ${certificateNo}` };
}

export default async function CertificadoPage({ params }: PageProps) {
  const { certificateNo } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: cert } = await supabase
    .from('certifications')
    .select(
      `certificate_no, issued_at, expires_at, status, final_score,
       learning_tracks(slug, title)`,
    )
    .eq('certificate_no', certificateNo)
    .eq('user_id', user?.id ?? '')
    .single();

  if (!cert) {
    notFound();
  }

  const track = Array.isArray(cert.learning_tracks)
    ? cert.learning_tracks[0]
    : cert.learning_tracks;

  const issuedDate = cert.issued_at
    ? new Date(cert.issued_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  const expiresDate = cert.expires_at
    ? new Date(cert.expires_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const isExpired = cert.expires_at ? new Date(cert.expires_at) < new Date() : false;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 32px' }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.8125rem' }}>
          <Link
            href="/meu-progresso"
            style={{ color: 'var(--colheita-text-secondary)', textDecoration: 'none' }}
          >
            Meu Progresso
          </Link>
          <span style={{ color: 'var(--colheita-text-tertiary)' }}>/</span>
          <span style={{ color: 'var(--colheita-text-tertiary)' }}>Certificados</span>
          <span style={{ color: 'var(--colheita-text-tertiary)' }}>/</span>
          <span style={{ color: 'var(--colheita-text-primary)', fontFamily: 'var(--font-mono)' }}>
            {certificateNo}
          </span>
        </div>
      </nav>

      {/* Status banner se expirado */}
      {isExpired && (
        <div
          style={{
            marginBottom: '24px',
            padding: '12px 16px',
            backgroundColor:
              'color-mix(in srgb, var(--colheita-warning, #f59e0b) 12%, transparent)',
            border:
              '1px solid color-mix(in srgb, var(--colheita-warning, #f59e0b) 30%, transparent)',
            borderRadius: 'var(--colheita-radius-md)',
            fontSize: '0.875rem',
            color: 'var(--colheita-text-secondary)',
          }}
        >
          ⚠️ Este certificado expirou em {expiresDate}.
        </div>
      )}

      {/* Certificado visual */}
      <div
        style={{
          border: '1px solid var(--colheita-border)',
          borderRadius: 'var(--colheita-radius-xl, 16px)',
          backgroundColor: 'var(--colheita-surface-card)',
          overflow: 'hidden',
        }}
      >
        {/* Faixa superior decorativa */}
        <div
          style={{
            height: '6px',
            background:
              'linear-gradient(90deg, var(--colheita-brand-primary) 0%, var(--colheita-brand-accent, var(--colheita-brand-primary)) 100%)',
          }}
        />

        <div style={{ padding: '48px 56px' }}>
          {/* Header da empresa */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '48px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--colheita-radius-md)',
                  backgroundColor: 'var(--colheita-brand-primary)',
                  flexShrink: 0,
                }}
              />
              <div>
                <p
                  style={{
                    fontSize: '1.0625rem',
                    fontWeight: '700',
                    color: 'var(--colheita-text-primary)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                  }}
                >
                  Argho
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--colheita-text-tertiary)' }}>
                  Academia Argho
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
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
                Certificado Nº
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--colheita-brand-primary)',
                  fontWeight: '600',
                }}
              >
                {cert.certificate_no}
              </p>
            </div>
          </div>

          {/* Corpo do certificado */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: '600',
                color: 'var(--colheita-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '20px',
              }}
            >
              Certificado de Conclusão
            </p>

            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--colheita-text-secondary)',
                marginBottom: '8px',
              }}
            >
              Certificamos que
            </p>

            <p
              style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'var(--colheita-text-primary)',
                letterSpacing: '-0.025em',
                marginBottom: '20px',
                fontStyle: 'italic',
              }}
            >
              {user?.email}
            </p>

            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--colheita-text-secondary)',
                marginBottom: '8px',
              }}
            >
              concluiu com êxito a trilha de aprendizado
            </p>

            <p
              style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: 'var(--colheita-text-primary)',
                letterSpacing: '-0.03em',
                lineHeight: '1.2',
              }}
            >
              {track?.title ?? 'Trilha de Aprendizado'}
            </p>

            {cert.final_score && (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--colheita-text-tertiary)',
                  marginTop: '12px',
                }}
              >
                Pontuação final: <strong>{cert.final_score}%</strong>
              </p>
            )}
          </div>

          {/* Rodapé com datas */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              paddingTop: '32px',
              borderTop: '1px solid var(--colheita-border-subtle)',
            }}
          >
            <div>
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
                Data de emissão
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--colheita-text-primary)',
                  fontWeight: '500',
                }}
              >
                {issuedDate}
              </p>
            </div>

            {expiresDate && (
              <div style={{ textAlign: 'right' }}>
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
                  {isExpired ? 'Expirado em' : 'Válido até'}
                </p>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: isExpired
                      ? 'var(--colheita-danger, #ef4444)'
                      : 'var(--colheita-text-primary)',
                    fontWeight: '500',
                  }}
                >
                  {expiresDate}
                </p>
              </div>
            )}

            {!expiresDate && (
              <div style={{ textAlign: 'right' }}>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--colheita-text-tertiary)',
                    fontStyle: 'italic',
                  }}
                >
                  Sem prazo de validade
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ações */}
      <div
        style={{
          marginTop: '24px',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}
      >
        {track?.slug && (
          <Link
            href={`/trilhas/${track.slug}`}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--colheita-radius-md)',
              border: '1px solid var(--colheita-border)',
              backgroundColor: 'transparent',
              color: 'var(--colheita-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: '500',
              textDecoration: 'none',
            }}
          >
            Ver trilha
          </Link>
        )}
        <Link
          href="/meu-progresso"
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border)',
            backgroundColor: 'var(--colheita-surface-elevated)',
            color: 'var(--colheita-text-secondary)',
            fontSize: '0.8125rem',
            fontWeight: '500',
            textDecoration: 'none',
          }}
        >
          ← Meu Progresso
        </Link>
      </div>
    </div>
  );
}
