// packages/ui/src/components/input.tsx
'use client';

import * as React from 'react';
import { cn } from '../lib/utils.js';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-[var(--colheita-radius-md)] border border-[var(--colheita-border)] bg-[var(--colheita-surface-elevated)] px-3 py-1 text-sm text-[var(--colheita-text-primary)] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--colheita-text-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--colheita-brand-primary)] focus-visible:border-[var(--colheita-brand-primary)] disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
