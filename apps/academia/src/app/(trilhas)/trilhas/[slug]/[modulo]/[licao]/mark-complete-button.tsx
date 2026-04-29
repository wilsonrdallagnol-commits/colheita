// apps/academia/src/app/(trilhas)/trilhas/[slug]/[modulo]/[licao]/mark-complete-button.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { markLessonComplete } from './actions.js';

interface MarkCompleteButtonProps {
  lessonId: string;
  isCompleted: boolean;
}

export function MarkCompleteButton({ lessonId, isCompleted }: MarkCompleteButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (isCompleted) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 20px',
          borderRadius: 'var(--colheita-radius-md)',
          backgroundColor: 'color-mix(in srgb, var(--colheita-brand-primary) 10%, transparent)',
          color: 'var(--colheita-brand-primary)',
          fontSize: '0.875rem',
          fontWeight: '600',
          border: '1px solid color-mix(in srgb, var(--colheita-brand-primary) 25%, transparent)',
        }}
      >
        ✓ Concluída
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await markLessonComplete(lessonId);
          router.refresh();
        });
      }}
      style={{
        padding: '8px 20px',
        borderRadius: 'var(--colheita-radius-md)',
        backgroundColor: pending ? 'var(--colheita-surface-card)' : 'var(--colheita-brand-primary)',
        color: pending ? 'var(--colheita-text-secondary)' : 'white',
        fontSize: '0.875rem',
        fontWeight: '500',
        border: 'none',
        cursor: pending ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.15s',
      }}
    >
      {pending ? 'Salvando...' : 'Marcar como concluída'}
    </button>
  );
}
