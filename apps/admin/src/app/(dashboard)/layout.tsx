// apps/admin/src/app/(dashboard)/layout.tsx
import { createServerClient, requireAuth } from '@colheita/auth';
import { SidebarMobileTrigger, SidebarProvider } from '@colheita/ui';
import { cookies } from 'next/headers';
import { AgentDock } from '@/components/agent/agent-dock';
import { AppSidebar } from '@/components/nav/app-sidebar';
import { getNotifications } from '@/lib/notifications';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createServerClient(cookieStore);

  // Carrega notificacoes em paralelo com qualquer render filho.
  // Pode ser lento em tenants grandes (3 queries) — em sprint futura,
  // memoizar via cookie/header com TTL curto. Hoje (~20 produtos) eh trivial.
  const notifications = await getNotifications(supabase, user.id);

  return (
    <SidebarProvider>
      {/* Trigger hamburger - so visivel em viewport mobile via CSS @media */}
      <SidebarMobileTrigger />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar userEmail={user.email} notifications={notifications} />
        <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>{children}</main>
      </div>
      {/* Agent dock onipresente — agent-first arquitetural (vide /hm-designer).
          Sugestoes contextuais por rota; chat real em sprint dedicado. */}
      <AgentDock />
    </SidebarProvider>
  );
}
