// apps/admin/src/app/(dashboard)/academia/[slug]/editar/page.tsx
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
import { TrilhaForm } from '@/components/academia/trilha-form';
import { updateTrilha } from '@/lib/actions/academia';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = { title: 'Editar Trilha' };

export default async function EditarTrilhaPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  const { data: trilha, error } = await supabase
    .from('learning_tracks')
    .select(
      'id, title, subtitle, description, level, status, audience, grants_certification, certification_validity_days',
    )
    .eq('slug', slug)
    .single();

  if (error || !trilha) notFound();

  const updateTrilhaWithId = updateTrilha.bind(null, trilha.id);

  return (
    <div style={{ padding: '32px', maxWidth: '720px' }}>
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
              {trilha.title}
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
        Editar: {trilha.title}
      </h1>

      <TrilhaForm
        action={updateTrilhaWithId}
        defaultValues={{
          title: trilha.title,
          subtitle: trilha.subtitle,
          description: trilha.description,
          level: trilha.level,
          status: trilha.status,
          audience: trilha.audience,
          grants_certification: trilha.grants_certification,
          certification_validity_days: trilha.certification_validity_days,
        }}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
