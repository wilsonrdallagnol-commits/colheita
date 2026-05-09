// apps/admin/src/app/(dashboard)/leads/[id]/proposta/page.tsx
//
// Camada 7 mov 3 — UI de geracao de proposta.
//
// Form que combina:
//   - Lista de produtos publicados do tenant (selecao via checkbox)
//   - Pra cada produto selecionado: qty + unit + dose + preco unitario
//   - Campos globais: desconto %, validade, condicoes de pagamento, observacoes
//   - Submit chama POST /leads/[id]/proposta -> retorna PDF download
//
// O form em si vive num client component pra reactivity (toggle produtos, totals).

import { createServerClient, requireAuth } from '@colheita/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@colheita/ui';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { PropostaForm, type PropostaProduct } from '@/components/leads/proposta-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: 'Gerar proposta' };

export default async function GerarPropostaPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Carrega lead + produtos publicados em paralelo
  const [{ data: lead, error: leadErr }, { data: rawProducts }] = await Promise.all([
    supabase
      .from('leads')
      .select('id, name, company, cultura, area_hectares')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle(),
    supabase
      .from('products')
      .select(
        `id, name, tagline, composition, packaging,
         category:product_categories(name)`,
      )
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('name')
      .limit(200),
  ]);

  if (leadErr || !lead) {
    notFound();
  }

  // Mapeia produtos pra forma simplificada do form
  const products: PropostaProduct[] = (rawProducts ?? []).map((p) => {
    const macros = (p.composition as { macros?: Record<string, number> } | null)?.macros ?? {};
    const npk =
      macros.N != null || macros.P2O5 != null || macros.K2O != null
        ? `${macros.N ?? 0}-${macros.P2O5 ?? 0}-${macros.K2O ?? 0}`
        : null;
    const packaging = Array.isArray(p.packaging) ? p.packaging : [];
    const firstPack = packaging[0] as
      | { type?: string; weightKg?: number; volumeL?: number }
      | undefined;
    let packagingLabel: string | null = null;
    if (firstPack) {
      if (firstPack.weightKg) packagingLabel = `${firstPack.type ?? 'sc'} ${firstPack.weightKg}kg`;
      else if (firstPack.volumeL)
        packagingLabel = `${firstPack.type ?? 'fr'} ${firstPack.volumeL}L`;
      else packagingLabel = firstPack.type ?? null;
    }
    const category = Array.isArray(p.category) ? p.category[0] : p.category;

    return {
      id: p.id as string,
      name: p.name as string,
      tagline: (p.tagline as string | null) ?? null,
      categoryName: (category as { name?: string } | null)?.name ?? null,
      npkLabel: npk,
      packagingLabel,
    };
  });

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)', maxWidth: '1100px' }}>
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span style={{ color: 'var(--colheita-text-tertiary)', fontSize: '0.8125rem' }}>
              Argho
            </span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/leads" style={{ fontSize: '0.8125rem' }}>
              Leads
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/leads/${id}`} style={{ fontSize: '0.8125rem' }}>
              {lead.name as string}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>Proposta</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--colheita-text-primary)',
            letterSpacing: '-0.025em',
            marginBottom: '4px',
          }}
        >
          Gerar proposta — {lead.name as string}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-secondary)', margin: 0 }}>
          {[lead.company, lead.cultura, lead.area_hectares ? `${lead.area_hectares} ha` : null]
            .filter(Boolean)
            .join(' · ') || 'Selecione produtos do catálogo e gere o PDF.'}
        </p>
      </div>

      <PropostaForm leadId={id} products={products} cancelHref={`/leads/${id}`} />
    </div>
  );
}
