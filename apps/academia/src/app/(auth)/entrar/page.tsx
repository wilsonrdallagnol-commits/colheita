// apps/academia/src/app/(auth)/entrar/page.tsx
import { LoginForm } from './login-form.js';

export const metadata = { title: 'Entrar' };

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function EntrarPage({ searchParams }: PageProps) {
  const { next } = await searchParams;

  // Valida que `next` é um path relativo seguro (evita open redirect)
  const safeNext = next?.startsWith('/') && !next.startsWith('//') ? next : undefined;

  return <LoginForm next={safeNext} />;
}
