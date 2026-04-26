// packages/ui/src/components/badge.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '../lib/utils.js';

const badgeVariants = cva(
  'inline-flex items-center rounded-[var(--colheita-radius-full)] px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--colheita-brand-primary)] text-[var(--colheita-brand-primary-fg)]',
        secondary:
          'bg-[var(--colheita-surface-elevated)] text-[var(--colheita-text-secondary)] border border-[var(--colheita-border-subtle)]',
        success: 'bg-[var(--colheita-success)]/15 text-[var(--colheita-success)]',
        warning: 'bg-[var(--colheita-warning)]/15 text-[var(--colheita-warning)]',
        destructive: 'bg-[var(--colheita-danger)]/15 text-[var(--colheita-danger)]',
      },
    },
    defaultVariants: {
      variant: 'secondary',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
