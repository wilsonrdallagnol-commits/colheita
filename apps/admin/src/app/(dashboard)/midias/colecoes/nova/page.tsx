// apps/admin/src/app/(dashboard)/midias/colecoes/nova/page.tsx
'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Input,
  Textarea,
} from '@colheita/ui';
import Link from 'next/link';
import { useActionState, useId } from 'react';
import { createColecao } from './actions';

export default function NovaColecaoPage() {
  const [state, formAction, isPending] = useActionState(createColecao, undefined);
  const nameId = useId();
  const descriptionId = useId();

  return (
    <div style={{ padding: 'clamp(28px, 3vw, 56px) clamp(24px, 4vw, 72px)', maxWidth: '560px' }}>
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span style={{ color: 'var(--colheita-text-tertiary)', fontSize: '0.8125rem' }}>
              Argho
            </span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link
              href="/midias"
              style={{
                color: 'var(--colheita-text-tertiary)',
                fontSize: '0.8125rem',
                textDecoration: 'none',
              }}
            >
              Mídias
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link
              href="/midias/colecoes"
              style={{
                color: 'var(--colheita-text-tertiary)',
                fontSize: '0.8125rem',
                textDecoration: 'none',
              }}
            >
              Coleções
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: '0.8125rem' }}>Nova coleção</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: 'var(--colheita-text-primary)',
          letterSpacing: '-0.025em',
          marginBottom: '28px',
        }}
      >
        Nova coleção
      </h1>

      {state?.error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--colheita-radius-md)',
            backgroundColor: 'rgba(220,38,38,0.08)',
            border: '1px solid rgba(220,38,38,0.2)',
            color: '#dc2626',
            fontSize: '0.875rem',
            marginBottom: '20px',
          }}
        >
          {state.error}
        </div>
      )}

      <form action={formAction}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label
              htmlFor={nameId}
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--colheita-text-primary)',
                marginBottom: '6px',
              }}
            >
              Nome <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <Input
              id={nameId}
              name="name"
              placeholder="ex: Fotos de Produtos 2026"
              required
              minLength={2}
              disabled={isPending}
            />
          </div>

          <div>
            <label
              htmlFor={descriptionId}
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--colheita-text-primary)',
                marginBottom: '6px',
              }}
            >
              Descrição
            </label>
            <Textarea
              id={descriptionId}
              name="description"
              placeholder="Descrição opcional da coleção"
              rows={3}
              disabled={isPending}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Criando...' : 'Criar coleção'}
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/midias/colecoes">Cancelar</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
