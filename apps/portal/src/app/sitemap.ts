// apps/portal/src/app/sitemap.ts
//
// Sitemap dinamico: paginas estaticas + produtos publicados. Cada
// produto vira /produtos/[slug] com lastmod = updated_at. Sem
// `/conta/*` (area logada — robots.ts ja bloqueia).
//
// Fallback resiliente: se Supabase indisponivel em build/runtime,
// retorna so as estaticas pra nao falhar build.

import { createAdminClient } from '@colheita/auth';
import { captureError } from '@colheita/observability';
import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_PORTAL_URL ?? 'https://colheita.arghoagrosciences.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Produtos publicados — usa admin client (sitemap roda sem cookie auth).
  // Bypassa RLS via service role, OK aqui porque so seleciona campos publicos.
  let productPages: MetadataRoute.Sitemap = [];
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from('products')
        .select('slug, updated_at')
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(500);

      productPages = (data ?? []).map((p) => ({
        url: `${BASE_URL}/produtos/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at as string) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }));
    }
  } catch (err) {
    captureError(err, { context: 'portal.sitemap' });
  }

  return [...staticPages, ...productPages];
}
