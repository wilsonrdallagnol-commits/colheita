// packages/ui/src/components/skeleton.tsx
import type * as React from 'react';
import { cn } from '../lib/utils.js';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[var(--colheita-radius-md)] bg-[var(--colheita-surface-hover)]',
        className,
      )}
      {...props}
    />
  );
}
