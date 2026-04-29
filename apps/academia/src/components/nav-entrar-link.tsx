// apps/academia/src/components/nav-entrar-link.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Link "Entrar" que preserva a página atual como ?next= para redirecionar
 * o usuário de volta após o login via magic link.
 */
export function NavEntrarLink() {
  const pathname = usePathname();
  const href =
    pathname && pathname !== '/' ? `/entrar?next=${encodeURIComponent(pathname)}` : '/entrar';

  return (
    <Link
      href={href}
      style={{
        padding: '6px 14px',
        borderRadius: 'var(--colheita-radius-md)',
        backgroundColor: 'var(--colheita-brand-primary)',
        color: 'white',
        fontSize: '0.8125rem',
        fontWeight: '600',
        textDecoration: 'none',
        letterSpacing: '-0.01em',
      }}
    >
      Entrar
    </Link>
  );
}
