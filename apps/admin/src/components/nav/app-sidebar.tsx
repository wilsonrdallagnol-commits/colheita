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
import { Package } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [{ href: '/produtos', label: 'Produtos', icon: Package }];

interface AppSidebarProps {
  userEmail?: string;
}

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const pathname = usePathname();

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
              <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
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

      {userEmail && (
        <SidebarFooter>
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
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
