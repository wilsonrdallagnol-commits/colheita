// apps/admin/src/components/nav/app-sidebar.tsx
'use client';

// Navegação organizada pelas camadas do Programa Colheita (Fase 1).
// Vide MEMORY.md para escopo Fase 1 vs Fase 2.

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@colheita/ui';
import {
  BarChart3,
  Bot,
  ClipboardList,
  FolderOpen,
  GraduationCap,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  type LucideIcon,
  Package,
  Plug,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { signOut } from '@/lib/actions/auth';

interface NavLeaf {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  phase?: 2;
}

interface NavGroup {
  label: string;
  items: NavLeaf[];
}

// Estrutura por camadas do Programa Colheita.
// Itens marcados phase=2 sao Fase 2 (CRM/BI/Distribuidores) — visiveis pra
// continuidade da operacao MVP atual mas indicados como "futuras" no badge.
const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Geral',
    items: [{ href: '/', label: 'Visão geral', icon: LayoutDashboard, exact: true }],
  },
  {
    label: 'PIM — Catálogo',
    items: [
      { href: '/produtos', label: 'Produtos', icon: Package },
      { href: '/categorias', label: 'Categorias', icon: FolderOpen },
      { href: '/compliance', label: 'Compliance regulatório', icon: ShieldCheck },
    ],
  },
  {
    label: 'DAM — Mídia',
    items: [{ href: '/midias', label: 'Biblioteca', icon: ImageIcon }],
  },
  {
    label: 'Geração',
    items: [
      { href: '/materiais', label: 'Materiais gerados', icon: Sparkles },
      { href: '/assistente', label: 'Layout Inference', icon: LayoutTemplate },
    ],
  },
  {
    label: 'Academia',
    items: [{ href: '/academia', label: 'Trilhas e lições', icon: GraduationCap }],
  },
  {
    label: 'Identity & Access',
    items: [{ href: '/auditoria', label: 'Auditoria', icon: ClipboardList }],
  },
  {
    label: 'Comercial · Fase 2',
    items: [
      { href: '/leads', label: 'Leads', icon: Target, phase: 2 },
      { href: '/distribuidores', label: 'Distribuidores', icon: Users, phase: 2 },
      { href: '/pedidos', label: 'Pedidos', icon: ShoppingCart, phase: 2 },
      { href: '/bi', label: 'Inteligência', icon: BarChart3, phase: 2 },
      { href: '/assistente', label: 'Assistente IA', icon: Bot, phase: 2 },
    ],
  },
  {
    label: 'Integrações',
    items: [{ href: '/integracoes', label: 'Conectores', icon: Plug }],
  },
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

  function isItemActive(item: NavLeaf): boolean {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            width: '100%',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--colheita-radius-md)',
              backgroundColor: 'var(--colheita-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={14} strokeWidth={1.75} color="#ffffff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--colheita-brand-primary)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              Argho
            </span>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#0a0a0a',
                letterSpacing: '-0.015em',
                lineHeight: 1.2,
              }}
            >
              Colheita
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '12px 0' }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: 'var(--colheita-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  margin: '0 0 6px',
                  padding: '0 16px',
                }}
              >
                {group.label}
              </p>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isItemActive(item);
                  return (
                    <SidebarMenuItem key={`${group.label}-${item.href}-${item.label}`}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link
                          href={item.href}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                          }}
                        >
                          <item.icon
                            size={15}
                            strokeWidth={1.75}
                            style={{ flexShrink: 0, color: 'inherit' }}
                          />
                          <span
                            style={{
                              whiteSpace: 'nowrap',
                              flex: 1,
                              fontSize: '0.8125rem',
                              fontWeight: active ? 600 : 500,
                            }}
                          >
                            {item.label}
                          </span>
                          {item.phase === 2 ? (
                            <span
                              style={{
                                fontSize: '0.625rem',
                                color: 'var(--colheita-text-tertiary)',
                                fontWeight: 500,
                                letterSpacing: '0.04em',
                              }}
                            >
                              ·
                            </span>
                          ) : null}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          ))}
        </div>
      </SidebarContent>

      <SidebarFooter>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {userEmail && (
            <Link
              href="/configuracoes"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.75rem',
                color: 'var(--colheita-text-tertiary)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                padding: '6px 8px',
                borderRadius: 'var(--colheita-radius-md)',
              }}
            >
              <Settings size={13} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</span>
            </Link>
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
            <LogOut size={13} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            <span>{isPending ? 'Saindo...' : 'Sair'}</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
