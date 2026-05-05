// apps/website/src/app/sitemap.ts
import type { MetadataRoute } from 'next';
import { PRODUCTS } from '@/lib/products';

const BASE_URL = 'https://arghoagrosciences.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const productUrls: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
    url: `${BASE_URL}/produtos/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/produtos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...productUrls,
  ];
}
