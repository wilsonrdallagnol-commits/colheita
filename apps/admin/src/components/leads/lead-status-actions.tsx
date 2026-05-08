// apps/admin/src/components/leads/lead-status-actions.tsx
'use client';

// Camada 7 (CRM) — controles de transicao de status do lead.
//
// 5 botoes principais (novo/qualificado/proposta/ganho/perdido). Botao do
// status atual fica selected. Click em "Perdido" abre prompt nativo
// pra capturar lostReason — se cancel, transicao nao acontece.

import { Button } from '@colheita/ui';
import { useState, useTransition } from 'react';
import { changeLeadStatus, type LeadStatus } from '@/lib/actions/leads';

interface LeadStatusActionsProps {
  leadId: string;
  currentStatus: LeadStatus;
}

const STATUS_FLOW: Array<{
  value: LeadStatus;
  label: string;
  tone: 'neutral' | 'primary' | 'gold' | 'success' | 'danger';
}> = [
  { value: 'novo', label: 'Novo', tone: 'neutral' },
  { value: 'qualificado', label: 'Qualificar', tone: 'primary' },
  { value: 'proposta', label: 'Proposta', tone: 'gold' },
  { value: 'ganho', label: 'Ganho', tone: 'success' },
  { value: 'perdido', label: 'Perdido', tone: 'danger' },
];

const TONE_COLOR: Record<string, string> = {
  neutral: 'var(--colheita-text-tertiary)',
  primary: 'var(--colheita-brand-primary)',
  gold: 'var(--colheita-brand-gold)',
  success: 'var(--colheita-success)',
  danger: 'var(--colheita-danger)',
};

export function LeadStatusActions({ leadId, currentStatus }: LeadStatusActionsProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick(newStatus: LeadStatus) {
    setError(null);

    let lostReason: string | undefined;
    if (newStatus === 'perdido') {
      // window.prompt em client component apenas. Cancel retorna null -> aborta.
      const reason = window.prompt(
        'Motivo da perda (obrigatório):\nEx: preço, concorrente, timing, sem fit',
        '',
      );
      if (reason === null) return; // cancel
      lostReason = reason.trim() || 'Não informado';
    }

    startTransition(async () => {
      const result = await changeLeadStatus(leadId, newStatus, lostReason);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {STATUS_FLOW.map((s) => {
          const isCurrent = s.value === currentStatus;
          return (
            <Button
              key={s.value}
              variant={isCurrent ? 'default' : 'outline'}
              size="sm"
              disabled={pending || isCurrent}
              onClick={() => handleClick(s.value)}
              style={
                isCurrent
                  ? {
                      backgroundColor: TONE_COLOR[s.tone],
                      borderColor: TONE_COLOR[s.tone],
                      color: '#fff',
                      cursor: 'default',
                    }
                  : { color: TONE_COLOR[s.tone] }
              }
            >
              {isCurrent ? `● ${s.label}` : s.label}
            </Button>
          );
        })}
      </div>

      {error && (
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--colheita-danger)',
            margin: 0,
          }}
        >
          {error}
        </p>
      )}

      {pending && (
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--colheita-text-tertiary)',
            margin: 0,
          }}
        >
          Atualizando status…
        </p>
      )}
    </div>
  );
}
