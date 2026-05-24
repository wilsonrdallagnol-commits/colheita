'use client';

// apps/admin/src/components/suporte/status-select.tsx
//
// Dropdown rapido pra mudar status do ticket. Submete inline via
// startTransition (sem reload). Server action: updateTicketStatus.

import { useId, useState, useTransition } from 'react';
import { updateTicketStatus } from '@/lib/actions/suporte';
import { STATUS_LABEL, type TicketStatus, VALID_STATUSES } from '@/lib/support-labels';

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = VALID_STATUSES.map((s) => ({
  value: s,
  label: STATUS_LABEL[s],
}));

interface StatusSelectProps {
  ticketId: string;
  currentStatus: TicketStatus;
}

export function StatusSelect({ ticketId, currentStatus }: StatusSelectProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const selectId = useId();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as TicketStatus;
    if (newStatus === currentStatus) return;
    setError(null);
    startTransition(async () => {
      try {
        await updateTicketStatus(ticketId, newStatus);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao mudar status');
      }
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label
        htmlFor={selectId}
        style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'var(--colheita-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        Status
      </label>
      <select
        id={selectId}
        defaultValue={currentStatus}
        onChange={handleChange}
        disabled={pending}
        style={{
          padding: '8px 12px',
          borderRadius: 'var(--colheita-radius-md)',
          border: '1px solid var(--colheita-border)',
          backgroundColor: 'var(--colheita-surface-elevated)',
          color: 'var(--colheita-text-primary)',
          fontSize: '0.875rem',
          cursor: pending ? 'not-allowed' : 'pointer',
          minWidth: '180px',
        }}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <p style={{ fontSize: '0.75rem', color: 'var(--colheita-danger, #dc2626)', margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}
