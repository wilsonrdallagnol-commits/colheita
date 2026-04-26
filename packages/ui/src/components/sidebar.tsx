// packages/ui/src/components/sidebar.tsx
'use client';

import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';
import { cn } from '../lib/utils.js';

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => undefined,
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return React.useContext(SidebarContext);
}

export function Sidebar({ className, children }: React.HTMLAttributes<HTMLElement>) {
  const { collapsed } = useSidebar();
  return (
    <aside
      style={{
        width: collapsed ? '60px' : '240px',
        backgroundColor: 'var(--colheita-surface-elevated)',
        borderRight: '1px solid var(--colheita-border-subtle)',
        transition: 'width var(--colheita-transition-base)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
      className={cn(className)}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center px-4 py-4 border-b border-[var(--colheita-border-subtle)]',
        className,
      )}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex-1 overflow-y-auto py-2', className)} {...props} />;
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('border-t border-[var(--colheita-border-subtle)] px-4 py-3', className)}
      {...props}
    />
  );
}

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn('flex flex-col gap-0.5 px-2', className)} {...props} />;
}

export function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn('', className)} {...props} />;
}

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  asChild?: boolean;
}

export function SidebarMenuButton({
  className,
  isActive,
  asChild = false,
  children,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '6px 10px',
        borderRadius: 'var(--colheita-radius-md)',
        fontSize: '0.875rem',
        fontWeight: isActive ? '500' : '400',
        color: isActive ? 'var(--colheita-text-primary)' : 'var(--colheita-text-secondary)',
        backgroundColor: isActive ? 'var(--colheita-surface-hover)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition:
          'background-color var(--colheita-transition-fast), color var(--colheita-transition-fast)',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'var(--colheita-surface-hover)';
          e.currentTarget.style.color = 'var(--colheita-text-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--colheita-text-secondary)';
        }
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Comp>
  );
}
