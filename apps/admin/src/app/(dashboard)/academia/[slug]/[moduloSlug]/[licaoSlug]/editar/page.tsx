// apps/admin/src/app/(dashboard)/academia/[slug]/[moduloSlug]/[licaoSlug]/editar/page.tsx
import { createServerClient, requireAuth } from '@colheita/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@colheita/ui';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LicaoForm } from '@/components/academia/licao-form';
import { updateLicao } from '@/lib/actions/academia';

interface PageProps {
  params: Promise<{ slug: string; moduloSlug: string; licaoSlug: string }>;
}

export const metadata = { title: 'Editar Lição' };

export default async function EditarLicaoPage({ params }: PageProps) {
  const { slug, moduloSlug, licaoSlug } = await params;
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Fetch lesson with module + track info
  const { data: licao, error } = await supabase
    .from('learning_lessons')
    .select(
      `id, slug, title, type, estimated_minutes, is_required, content,
       learning_modules!inner(
         id, slug, title,
         learning_tracks!inner(id, slug, title)
       )`,
    )
    .eq('slug', licaoSlug)
    .eq('learning_modules.slug', moduloSlug)
    .eq('learning_modules.learning_tracks.slug', slug)
    .single();

  if (error || !licao) notFound();

  const modulo = Array.isArray(licao.learning_modules)
    ? licao.learning_modules[0]
    : licao.learning_modules;

  if (!modulo) notFound();

  const track = Array.isArray(modulo.learning_tracks)
    ? modulo.learning_tracks[0]
    : modulo.learning_tracks;

  if (!track) notFound();

  // Extract content fields
  const content = (licao.content ?? {}) as Record<string, unknown>;
  const contentMarkdown = typeof content.markdown === 'string' ? content.markdown : undefined;
  const contentUrl = typeof content.url === 'string' ? content.url : undefined;

  const updateLicaoWithId = updateLicao.bind(null, licao.id);
  const cancelHref = `/academia/${slug}/${moduloSlug}`;

  return (
    <div style={{ padding: '32px', maxWidth: '800px' }}>
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
            <Link
              href={`/academia/${slug}/${moduloSlug}`}
              style={{
                fontSize: '0.8125rem',
                color: 'var(--colheita-text-secondary)',
                textDecoration: 'none',
              }}
            >
              {modulo.title}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>Editar lição</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: 'var(--colheita-text-primary)',
          letterSpacing: '-0.025em',
          marginBottom: '32px',
        }}
      >
        Editar: {licao.title}
      </h1>

      <LicaoForm
        action={updateLicaoWithId}
        defaultValues={{
          title: licao.title,
          type: licao.type,
          estimated_minutes: licao.estimated_minutes,
          is_required: licao.is_required,
          content_markdown: contentMarkdown,
          content_url: contentUrl,
        }}
        submitLabel="Salvar alterações"
        cancelHref={cancelHref}
      />
    </div>
  );
}
