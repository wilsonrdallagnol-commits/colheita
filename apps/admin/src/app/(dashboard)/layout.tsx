// apps/admin/src/app/(dashboard)/layout.tsx
import { requireAuth } from '@colheita/auth';
import { SidebarProvider } from '@colheita/ui';
import { cookies } from 'next/headers';
import { AgentDock } from '@/components/agent/agent-dock';
import { AppSidebar } from '@/components/nav/app-sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const user = await requireAuth(cookieStore);

  return (
    <SidebarProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar userEmail={user.email} />
        <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
      </div>
      {/* Agent dock onipresente — agent-first arquitetural (vide /hm-designer).
          Sugestoes contextuais por rota; chat real em sprint dedicado. */}
      <AgentDock />
    </SidebarProvider>
  );
}
