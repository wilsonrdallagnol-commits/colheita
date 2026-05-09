// apps/admin/src/app/(dashboard)/academia/[slug]/[moduloSlug]/editar/page.tsx
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
import { ModuloEditForm } from '@/components/academia/modulo-edit-form';
import { updateModulo } from '@/lib/actions/academia';

interface PageProps {
  params: Promise<{ slug: string; moduloSlug: string }>;
}

export const metadata = { title: 'Editar Módulo' };

export default async function EditarModuloPage({ params }: PageProps) {
  const { slug, moduloSlug } = await params;
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { data: modulo, error } = await supabase
    .from('learning_modules')
    .select(
      `id, title, description,
       learning_tracks!inner(id, slug, title)`,
    )
    .eq('slug', moduloSlug)
    .eq('learning_tracks.slug', slug)
    .single();

  if (error || !modulo) notFound();

  const track = Array.isArray(modulo.learning_tracks)
    ? modulo.learning_tracks[0]
    : modulo.learning_tracks;

  if (!track) notFound();

  const updateModuloWithId = updateModulo.bind(null, modulo.id);
  const cancelHref = `/academia/${slug}/${moduloSlug}`;

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)', maxWidth: '720px' }}>
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
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>Editar</BreadcrumbPage>
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
        Editar: {modulo.title}
      </h1>

      <ModuloEditForm
        action={updateModuloWithId}
        defaultValues={{ title: modulo.title, description: modulo.description }}
        cancelHref={cancelHref}
      />
    </div>
  );
}
