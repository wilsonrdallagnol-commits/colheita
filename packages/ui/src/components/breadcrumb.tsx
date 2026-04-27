// packages/ui/src/components/breadcrumb.tsx
import { ChevronRight } from 'lucide-react';
import type * as React from 'react';
import { cn } from '../lib/utils.js';

export function Breadcrumb({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <nav aria-label="breadcrumb" className={cn('flex items-center', className)} {...props} />;
}

export function BreadcrumbList({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) {
  return (
    <ol
      className={cn(
        'flex flex-wrap items-center gap-1.5 text-sm text-[var(--colheita-text-tertiary)]',
        className,
      )}
      {...props}
    />
  );
}

export function BreadcrumbItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn('inline-flex items-center gap-1.5', className)} {...props} />;
}

export function BreadcrumbLink({
  className,
  href,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      className={cn('hover:text-[var(--colheita-text-primary)] transition-colors', className)}
      {...props}
    />
  );
}

export function BreadcrumbSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span aria-hidden className={cn('text-[var(--colheita-border-strong)]', className)} {...props}>
      <ChevronRight className="h-3.5 w-3.5" />
    </span>
  );
}

export function BreadcrumbPage({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-current="page"
      className={cn('text-[var(--colheita-text-primary)] font-medium', className)}
      {...props}
    />
  );
}
