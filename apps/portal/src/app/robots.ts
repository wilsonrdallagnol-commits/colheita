// apps/portal/src/app/robots.ts
//
// robots.txt da Plataforma Colheita.
// - Permite indexar paginas publicas (/, /produtos/*, /sobre)
// - Bloqueia tudo de /conta/* (area logada — nao deve aparecer em search)
// - Bloqueia /entrar e /auth/* (form de login nao precisa indexacao)
// - Bloqueia /api/* (endpoints internos)

import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_PORTAL_URL ?? 'https://colheita.arghoagrosciences.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/produtos/', '/sobre'],
        disallow: ['/conta/', '/entrar', '/auth/', '/api/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
