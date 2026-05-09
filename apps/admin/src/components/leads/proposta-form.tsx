// apps/admin/src/components/leads/proposta-form.tsx
'use client';

// Camada 7 mov 3 — form de geracao de proposta.
//
// State client-side: produtos selecionados + qty/preco/dose por produto.
// Submit normal (action="POST" pra route handler) — browser baixa PDF direto
// quando route retorna application/pdf attachment.
//
// Subtotal/desconto/total calculados em real-time pra feedback visual.

import { Button, Input, Textarea } from '@colheita/ui';
import Link from 'next/link';
import { useId, useMemo, useState } from 'react';

export interface PropostaProduct {
  id: string;
  name: string;
  tagline: string | null;
  categoryName: string | null;
  npkLabel: string | null;
  packagingLabel: string | null;
}

interface PropostaFormProps {
  leadId: string;
  products: PropostaProduct[];
  cancelHref: string;
}

interface ItemLine {
  productId: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  dose: string;
}

function parseNumber(s: string): number {
  return Number(s.replace(',', '.')) || 0;
}

function formatBRL(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function PropostaForm({ leadId, products, cancelHref }: PropostaFormProps) {
  const uid = useId();
  const [items, setItems] = useState<Record<string, ItemLine>>({});
  const [discountPercent, setDiscountPercent] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [validUntilLabel, setValidUntilLabel] = useState('');
  const [notes, setNotes] = useState('');

  const selectedIds = Object.keys(items);

  function toggleProduct(productId: string) {
    setItems((prev) => {
      const next = { ...prev };
      if (next[productId]) {
        delete next[productId];
      } else {
        next[productId] = {
          productId,
          quantity: '1',
          unit: 'un',
          unitPrice: '0',
          dose: '',
        };
      }
      return next;
    });
  }

  function updateItem(productId: string, field: keyof Omit<ItemLine, 'productId'>, value: string) {
    setItems((prev) => {
      const cur = prev[productId];
      if (!cur) return prev;
      return { ...prev, [productId]: { ...cur, [field]: value } };
    });
  }

  // Totais reativos
  const { subtotal, discount, total } = useMemo(() => {
    const sub = Object.values(items).reduce(
      (acc, it) => acc + parseNumber(it.quantity) * parseNumber(it.unitPrice),
      0,
    );
    const disc = (sub * (parseNumber(discountPercent) || 0)) / 100;
    return { subtotal: sub, discount: disc, total: sub - disc };
  }, [items, discountPercent]);

  const canSubmit = selectedIds.length > 0;

  return (
    <form
      method="POST"
      action={`/leads/${leadId}/proposta/gerar`}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* Lista de produtos com checkbox + inputs inline pros selecionados */}
      <Section
        title={`Produtos (${selectedIds.length} ${selectedIds.length === 1 ? 'selecionado' : 'selecionados'})`}
      >
        {products.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--colheita-text-tertiary)', margin: 0 }}>
            Nenhum produto publicado disponível. Publique pelo menos 1 produto em /produtos.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {products.map((p, idx) => {
              const item = items[p.id];
              const isSelected = Boolean(item);
              const lineTotal = item ? parseNumber(item.quantity) * parseNumber(item.unitPrice) : 0;
              const checkboxId = `${uid}-cb-${p.id}`;

              return (
                <div
                  key={p.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--colheita-radius-md)',
                    border: `1px solid ${isSelected ? 'var(--colheita-brand-primary)' : 'var(--colheita-border-subtle)'}`,
                    backgroundColor: isSelected
                      ? 'color-mix(in srgb, var(--colheita-brand-primary) 4%, var(--colheita-surface-elevated))'
                      : 'var(--colheita-surface-elevated)',
                  }}
                >
                  {/* Header com checkbox + nome */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      id={checkboxId}
                      checked={isSelected}
                      onChange={() => toggleProduct(p.id)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label
                      htmlFor={checkboxId}
                      style={{
                        flex: 1,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                          color: 'var(--colheita-text-primary)',
                        }}
                      >
                        {p.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--colheita-text-tertiary)',
                        }}
                      >
                        {[p.categoryName, p.npkLabel, p.packagingLabel].filter(Boolean).join(' · ')}
                      </span>
                    </label>
                    {isSelected && (
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'var(--colheita-brand-primary)',
                          fontVariantNumeric: 'tabular-nums',
                          flexShrink: 0,
                        }}
                      >
                        {formatBRL(lineTotal)}
                      </span>
                    )}
                  </div>

                  {/* Inputs inline quando selecionado */}
                  {isSelected && item && (
                    <div
                      style={{
                        marginTop: '10px',
                        display: 'grid',
                        gridTemplateColumns: '110px 90px 130px 1fr',
                        gap: '8px',
                      }}
                    >
                      {/* Hidden index pra route parsing */}
                      <input type="hidden" name={`items[${idx}][productId]`} value={p.id} />
                      <div>
                        <SmallLabel>Quantidade</SmallLabel>
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={item.quantity}
                          onChange={(e) => updateItem(p.id, 'quantity', e.target.value)}
                          name={`items[${idx}][quantity]`}
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <SmallLabel>Unidade</SmallLabel>
                        <Input
                          type="text"
                          value={item.unit}
                          onChange={(e) => updateItem(p.id, 'unit', e.target.value)}
                          name={`items[${idx}][unit]`}
                          placeholder="tambores"
                        />
                      </div>
                      <div>
                        <SmallLabel>Preço unit. (R$)</SmallLabel>
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(p.id, 'unitPrice', e.target.value)}
                          name={`items[${idx}][unitPrice]`}
                          placeholder="350,00"
                        />
                      </div>
                      <div>
                        <SmallLabel>Dose recomendada</SmallLabel>
                        <Input
                          type="text"
                          value={item.dose}
                          onChange={(e) => updateItem(p.id, 'dose', e.target.value)}
                          name={`items[${idx}][dose]`}
                          placeholder="1.5 L/ha em V4"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Termos comerciais */}
      <Section title="Termos comerciais">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 1fr',
            gap: '12px',
          }}
        >
          <div>
            <SmallLabel>Desconto (%)</SmallLabel>
            <Input
              type="text"
              inputMode="decimal"
              name="discountPercent"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              placeholder="5"
            />
          </div>
          <div>
            <SmallLabel>Validade</SmallLabel>
            <Input
              type="text"
              name="validUntilLabel"
              value={validUntilLabel}
              onChange={(e) => setValidUntilLabel(e.target.value)}
              placeholder="Válida até 30/05/2026"
            />
          </div>
          <div>
            <SmallLabel>Pagamento</SmallLabel>
            <Input
              type="text"
              name="paymentTerms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="30/60/90 dias após a entrega"
            />
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <SmallLabel>Observações</SmallLabel>
          <Textarea
            name="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Frete, prazo de entrega, garantias, etc."
          />
        </div>
      </Section>

      {/* Sumario financeiro reativo */}
      <Section title="Resumo">
        <SummaryRow label="Subtotal" value={formatBRL(subtotal)} />
        {discount > 0 && (
          <SummaryRow
            label={`Desconto (${parseNumber(discountPercent)}%)`}
            value={`− ${formatBRL(discount)}`}
            color="#dc2626"
          />
        )}
        <SummaryRow
          label="Total da proposta"
          value={formatBRL(total)}
          color="var(--colheita-brand-primary)"
          bold
        />
      </Section>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <Button type="submit" disabled={!canSubmit}>
          Gerar proposta (PDF)
        </Button>
        <Button asChild variant="outline">
          <Link href={cancelHref}>Cancelar</Link>
        </Button>
        {canSubmit && (
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--colheita-text-tertiary)',
              margin: 'auto 0',
            }}
          >
            O lead será movido pra status &ldquo;Proposta&rdquo; após gerar.
          </p>
        )}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: 'var(--colheita-radius-lg)',
        border: '1px solid var(--colheita-border-subtle)',
        backgroundColor: 'var(--colheita-surface-elevated)',
      }}
    >
      <p
        style={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          color: 'var(--colheita-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '14px',
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function SmallLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: '0.6875rem',
        fontWeight: 600,
        color: 'var(--colheita-text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: '4px',
      }}
    >
      {children}
    </p>
  );
}

function SummaryRow({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderTop: '1px solid var(--colheita-border-subtle)',
        fontSize: bold ? '1rem' : '0.875rem',
        fontWeight: bold ? 700 : 400,
        color: color ?? 'var(--colheita-text-primary)',
      }}
    >
      <span>{label}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}
