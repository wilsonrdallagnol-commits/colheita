// apps/admin/src/components/nav/app-sidebar.tsx
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@colheita/ui';
import { FolderOpen, LayoutDashboard, LogOut, Package } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { signOut } from '@/lib/actions/auth';

const NAV_ITEMS = [
  { href: '/', label: 'Visão geral', icon: LayoutDashboard, exact: true },
  { href: '/produtos', label: 'Produtos', icon: Package, exact: false },
  { href: '/categorias', label: 'Categorias', icon: FolderOpen, exact: false },
];

interface AppSidebarProps {
  userEmail?: string;
}

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOut();
    });
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--colheita-radius-md)',
              backgroundColor: 'var(--colheita-brand-primary)',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: '0.9375rem',
              fontWeight: '600',
              color: 'var(--colheita-text-primary)',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            Argho
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={item.exact ? pathname === item.href : pathname.startsWith(item.href)}
              >
                <Link
                  href={item.href}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}
                >
                  <item.icon size={16} style={{ flexShrink: 0, color: 'inherit' }} />
                  <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {userEmail && (
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--colheita-text-tertiary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {userEmail}
            </div>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isPending}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 8px',
              borderRadius: 'var(--colheita-radius-md)',
              border: 'none',
              background: 'none',
              cursor: isPending ? 'not-allowed' : 'pointer',
              color: 'var(--colheita-text-tertiary)',
              fontSize: '0.8125rem',
              width: '100%',
              textAlign: 'left',
              opacity: isPending ? 0.5 : 1,
              transition: 'color 0.15s, background-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--colheita-surface-hover)';
              e.currentTarget.style.color = 'var(--colheita-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--colheita-text-tertiary)';
            }}
          >
            <LogOut size={14} style={{ flexShrink: 0 }} />
            <span>{isPending ? 'Saindo...' : 'Sair'}</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
