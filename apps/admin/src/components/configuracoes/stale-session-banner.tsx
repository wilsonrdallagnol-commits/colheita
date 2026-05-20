'use client';

// apps/admin/src/components/configuracoes/stale-session-banner.tsx
//
// Banner que aparece quando o JWT do usuario nao tem o claim 'roles' ou
// 'tenant_id'. Acontece quando uma sessao foi emitida antes da migration
// 0032 (que atualizou o app_custom_access_token_hook pra injetar essas
// claims). Sem refresh do token, todas as escritas via RLS sao denegadas.
//
// O botao "Atualizar permissoes" forca signOut + redireciona pro /login,
// o que renova o JWT com as claims corretas no proximo login.

import { Button } from '@colheita/ui';
import { AlertTriangle, LogOut } from 'lucide-react';
import { useTransition } from 'react';
import { signOut } from '@/lib/actions/auth';

export function StaleSessionBanner() {
  const [isPending, startTransition] = useTransition();

  function handleRefresh() {
    startTransition(async () => {
      await signOut();
    });
  }

  return (
    <aside
      role="alert"
      style={{
        marginBottom: '24px',
        padding: '16px 20px',
        borderRadius: 'var(--colheita-radius-lg)',
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--colheita-radius-md)',
          backgroundColor: '#fde68a',
          color: '#b45309',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <AlertTriangle size={18} strokeWidth={1.75} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: '#b45309',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            margin: '0 0 6px',
          }}
        >
          Sessão desatualizada
        </p>
        <p
          style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: '#0a0a0a',
            margin: '0 0 4px',
            letterSpacing: '-0.01em',
          }}
        >
          Seu JWT não tem as permissões atuais.
        </p>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--colheita-text-secondary)',
            lineHeight: 1.55,
            margin: '0 0 12px',
          }}
        >
          A plataforma atualizou as regras de acesso. Sua sessão foi emitida antes da atualização,
          então criar produtos, leads e coleções pode falhar com erro de permissão. Refaça o login
          pra renovar.
        </p>
        <Button type="button" onClick={handleRefresh} disabled={isPending} size="sm">
          <LogOut size={14} strokeWidth={1.75} style={{ marginRight: 6 }} />
          {isPending ? 'Saindo…' : 'Atualizar permissões (sair e entrar)'}
        </Button>
      </div>
    </aside>
  );
}
