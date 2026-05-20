'use client';

// apps/admin/src/app/(dashboard)/distribuidores/[id]/role-manager.tsx
//
// Painel de gerenciamento de permissoes do user. Checkboxes pra cada role,
// botao "Salvar" submete o array completo via setUserRoles().
//
// Cliente do agro precisa convidar vendedor + dar role 'sales' sem ter que
// abrir SQL. Esta UI fecha esse gap.

import { Button } from '@colheita/ui';
import { Check, ShieldAlert } from 'lucide-react';
import { useState, useTransition } from 'react';
import { setUserRoles } from '../actions';

interface RoleManagerProps {
  userId: string;
  /** Roles que o user TEM atualmente (slugs) */
  currentRoles: string[];
  /** Email do user pra exibir no aviso (post-save precisa relogar) */
  userEmail: string;
}

interface RoleOption {
  slug: string;
  label: string;
  description: string;
  destructive?: boolean;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    slug: 'tenant_owner',
    label: 'Proprietário',
    description: 'Controle total do tenant — configurações, billing, exclusão.',
    destructive: true,
  },
  {
    slug: 'admin',
    label: 'Admin',
    description: 'Gerencia usuários, permissões e configurações operacionais.',
    destructive: true,
  },
  {
    slug: 'product_manager',
    label: 'Gerente de Produto',
    description: 'Cria/edita produtos, categorias e registros regulatórios.',
  },
  {
    slug: 'asset_manager',
    label: 'Gerente de Mídia',
    description: 'Upload e organização da biblioteca DAM e coleções.',
  },
  {
    slug: 'design_admin',
    label: 'Admin de Design',
    description: 'Layout Inference, templates de materiais.',
  },
  {
    slug: 'academy_admin',
    label: 'Admin Academia',
    description: 'Trilhas, módulos, lições e certificados.',
  },
  {
    slug: 'sales',
    label: 'Comercial',
    description: 'Leads, pipeline, propostas, pedidos (read-only).',
  },
];

export function RoleManager({ userId, currentRoles, userEmail }: RoleManagerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(currentRoles));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function toggle(slug: string) {
    setSuccess(false);
    setError(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function handleSave() {
    setSuccess(false);
    setError(null);
    startTransition(async () => {
      const result = await setUserRoles(userId, [...selected]);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    });
  }

  // Detecta mudanca em relacao ao estado inicial (pra habilitar/desabilitar Save)
  const hasChanges =
    selected.size !== currentRoles.length ||
    [...selected].some((s) => !currentRoles.includes(s)) ||
    currentRoles.some((s) => !selected.has(s));

  return (
    <section style={{ marginBottom: '32px' }}>
      <h2
        style={{
          fontSize: '0.75rem',
          fontWeight: 500,
          color: 'var(--colheita-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '12px',
        }}
      >
        Permissões ({selected.size})
      </h2>

      <div
        style={{
          borderRadius: 'var(--colheita-radius-lg)',
          border: '1px solid var(--colheita-border)',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {ROLE_OPTIONS.map((opt, idx) => {
          const checked = selected.has(opt.slug);
          return (
            <label
              key={opt.slug}
              htmlFor={`role-${opt.slug}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 18px',
                cursor: 'pointer',
                borderBottom:
                  idx < ROLE_OPTIONS.length - 1
                    ? '1px solid var(--colheita-border-subtle)'
                    : 'none',
                backgroundColor: checked ? 'var(--colheita-brand-primary-soft)' : 'transparent',
                transition: 'background-color 150ms ease',
              }}
            >
              <input
                id={`role-${opt.slug}`}
                type="checkbox"
                checked={checked}
                onChange={() => toggle(opt.slug)}
                disabled={isPending}
                style={{
                  marginTop: '3px',
                  width: '16px',
                  height: '16px',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  accentColor: 'var(--colheita-brand-primary)',
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--colheita-text-primary)',
                    margin: '0 0 2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {opt.label}
                  {opt.destructive ? (
                    <span
                      title="Role privilegiado — só atribua a pessoas de confiança"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: '#b45309',
                      }}
                    >
                      <ShieldAlert size={12} strokeWidth={2} />
                    </span>
                  ) : null}
                </p>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--colheita-text-secondary)',
                    margin: 0,
                    lineHeight: 1.45,
                  }}
                >
                  {opt.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--colheita-text-tertiary)',
            margin: 0,
            flex: 1,
            minWidth: '240px',
          }}
        >
          Mudanças aplicam quando <strong>{userEmail}</strong> fizer logout + login (o JWT é
          renovado com os novos roles).
        </p>

        <Button type="button" size="sm" onClick={handleSave} disabled={isPending || !hasChanges}>
          {isPending ? 'Salvando…' : hasChanges ? 'Salvar permissões' : 'Sem mudanças'}
        </Button>
      </div>

      {error ? (
        <p
          role="alert"
          style={{
            marginTop: '12px',
            fontSize: '0.8125rem',
            color: 'var(--colheita-danger)',
            padding: '10px 12px',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
          }}
        >
          {error}
        </p>
      ) : null}

      {success ? (
        <p
          style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8125rem',
            color: 'var(--colheita-brand-secondary)',
            padding: '10px 12px',
            borderRadius: '8px',
            backgroundColor: 'var(--colheita-brand-secondary-soft)',
            border: '1px solid var(--colheita-brand-secondary-line)',
          }}
        >
          <Check size={14} strokeWidth={1.75} />
          Permissões salvas. {userEmail} precisa relogar pra novo JWT carregar.
        </p>
      ) : null}
    </section>
  );
}
