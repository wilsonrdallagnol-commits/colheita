// packages/ui/src/components/sidebar.tsx
'use client';

import { Slot } from '@radix-ui/react-slot';
import { Menu, X } from 'lucide-react';
import * as React from 'react';
import { cn } from '../lib/utils.js';

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  toggleMobile: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => undefined,
  mobileOpen: false,
  setMobileOpen: () => undefined,
  toggleMobile: () => undefined,
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const toggleMobile = React.useCallback(() => setMobileOpen((v) => !v), []);

  // Fecha drawer mobile quando muda viewport pra desktop
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 769px)');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Bloqueia scroll do body quando drawer aberto
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Fecha drawer com tecla Escape
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileOpen) setMobileOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <SidebarContext.Provider
      value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen, toggleMobile }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return React.useContext(SidebarContext);
}

/**
 * Trigger button para abrir o drawer mobile. Renderizado dentro do `<main>`,
 * fica visível apenas em viewport mobile (CSS controla via data-sidebar-mobile-trigger).
 * Posicionamento fixed top-left, padding generoso pra touch.
 */
export function SidebarMobileTrigger() {
  const { toggleMobile, mobileOpen } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggleMobile}
      aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
      data-sidebar-mobile-trigger
      style={{
        position: 'fixed',
        top: '12px',
        left: '12px',
        zIndex: 60,
        width: '40px',
        height: '40px',
        display: 'none', // ativado por CSS @media
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--colheita-surface-elevated)',
        border: '1px solid var(--colheita-border)',
        borderRadius: 'var(--colheita-radius-md)',
        color: 'var(--colheita-text-primary)',
        cursor: 'pointer',
        boxShadow: 'var(--colheita-shadow-md, 0 4px 12px rgba(0,0,0,0.08))',
      }}
    >
      {mobileOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  );
}

export function Sidebar({ className, children }: React.HTMLAttributes<HTMLElement>) {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();
  return (
    <>
      {/* Backdrop mobile - aparece quando drawer aberto */}
      {mobileOpen && (
        <div
          aria-hidden
          onClick={() => setMobileOpen(false)}
          data-sidebar-backdrop
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 49,
            display: 'none', // ativado por CSS @media
          }}
        />
      )}
      <aside
        data-sidebar
        data-mobile-open={mobileOpen ? 'true' : 'false'}
        style={{
          width: collapsed ? '60px' : '240px',
          backgroundColor: 'var(--colheita-surface-elevated)',
          borderRight: '1px solid var(--colheita-border-subtle)',
          transition: 'width var(--colheita-transition-base), transform 0.3s ease',
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
    </>
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
  const { setMobileOpen } = useSidebar();
  const Comp = asChild ? Slot : 'button';
  // Fecha drawer mobile quando usuario clica em item de navegacao
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMobileOpen(false);
    props.onClick?.(e);
  };
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
      onClick={handleClick}
      className={cn(className)}
      {...props}
    >
      {children}
    </Comp>
  );
}
