// packages/ui/src/components/textarea.tsx
'use client';

import * as React from 'react';
import { cn } from '../lib/utils.js';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-[var(--colheita-radius-md)] border border-[var(--colheita-border)] bg-[var(--colheita-surface-elevated)] px-3 py-2 text-sm text-[var(--colheita-text-primary)] shadow-sm transition-colors placeholder:text-[var(--colheita-text-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--colheita-brand-primary)] focus-visible:border-[var(--colheita-brand-primary)] disabled:cursor-not-allowed disabled:opacity-50 resize-vertical',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';
