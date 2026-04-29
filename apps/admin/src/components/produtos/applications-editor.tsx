// apps/admin/src/components/produtos/applications-editor.tsx
'use client';

import type { ProductApplication } from '@colheita/db';
import { useId, useState } from 'react';

// ── Tipos ─────────────────────────────────────────────────────────────────────

type ApplicationRow = {
  id: string;
  crop: string;
  stage: string;
  dosePerHa: string;
  unit: 'kg' | 'l' | 'g' | 'ml';
  notes: string;
};

interface ApplicationsEditorProps {
  defaultValue?: ProductApplication[];
  disabled?: boolean;
  errorMessage?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function toRow(app: ProductApplication): ApplicationRow {
  return {
    id: makeId(),
    crop: app.crop,
    stage: app.stage ?? '',
    dosePerHa: String(app.dosePerHa),
    unit: app.unit,
    notes: app.notes ?? '',
  };
}

function toApplication(row: ApplicationRow): ProductApplication | null {
  const crop = row.crop.trim();
  const dosePerHa = Number.parseFloat(row.dosePerHa);
  if (!crop || Number.isNaN(dosePerHa)) return null;
  return {
    crop,
    stage: row.stage.trim() || undefined,
    dosePerHa,
    unit: row.unit,
    notes: row.notes.trim() || undefined,
  };
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '32px',
  padding: '0 8px',
  borderRadius: 'var(--colheita-radius-sm)',
  border: '1px solid var(--colheita-border)',
  backgroundColor: 'var(--colheita-surface-elevated)',
  color: 'var(--colheita-text-primary)',
  fontSize: '0.8125rem',
  outline: 'none',
};

const thStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: '600',
  color: 'var(--colheita-text-tertiary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  padding: '0 0 8px 0',
  textAlign: 'left',
  whiteSpace: 'nowrap',
};

// ── Componente ────────────────────────────────────────────────────────────────

export function ApplicationsEditor({
  defaultValue = [],
  disabled = false,
  errorMessage,
}: ApplicationsEditorProps) {
  const uid = useId();
  const [rows, setRows] = useState<ApplicationRow[]>(() => defaultValue.map(toRow));

  const serialized = JSON.stringify(
    rows.flatMap((r) => {
      const a = toApplication(r);
      return a ? [a] : [];
    }),
  );

  function updateRow(id: string, field: keyof ApplicationRow, value: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, [field]: field === 'unit' ? (value as ApplicationRow['unit']) : value }
          : r,
      ),
    );
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { id: makeId(), crop: '', stage: '', dosePerHa: '', unit: 'l', notes: '' },
    ]);
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div>
      {/* Hidden input que serializa todas as linhas como JSON */}
      <input type="hidden" name="applications" value={serialized} />

      {rows.length > 0 && (
        <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.8125rem',
            }}
          >
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '22%' }}>Cultura *</th>
                <th style={{ ...thStyle, width: '18%' }}>Estádio</th>
                <th style={{ ...thStyle, width: '12%' }}>Dose/ha *</th>
                <th style={{ ...thStyle, width: '10%' }}>Unidade</th>
                <th style={{ ...thStyle, width: '28%' }}>Observações</th>
                <th style={{ ...thStyle, width: '10%' }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id}>
                  <td style={{ padding: '4px 8px 4px 0' }}>
                    <input
                      aria-label={`Cultura linha ${idx + 1}`}
                      style={inputStyle}
                      value={row.crop}
                      disabled={disabled}
                      placeholder="Soja"
                      onChange={(e) => updateRow(row.id, 'crop', e.target.value)}
                    />
                  </td>
                  <td style={{ padding: '4px 8px 4px 0' }}>
                    <input
                      aria-label={`Estádio linha ${idx + 1}`}
                      style={inputStyle}
                      value={row.stage}
                      disabled={disabled}
                      placeholder="V3–V5"
                      onChange={(e) => updateRow(row.id, 'stage', e.target.value)}
                    />
                  </td>
                  <td style={{ padding: '4px 8px 4px 0' }}>
                    <input
                      aria-label={`Dose por hectare linha ${idx + 1}`}
                      style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.dosePerHa}
                      disabled={disabled}
                      placeholder="0.5"
                      onChange={(e) => updateRow(row.id, 'dosePerHa', e.target.value)}
                    />
                  </td>
                  <td style={{ padding: '4px 8px 4px 0' }}>
                    <select
                      aria-label={`Unidade linha ${idx + 1}`}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                      value={row.unit}
                      disabled={disabled}
                      onChange={(e) => updateRow(row.id, 'unit', e.target.value)}
                    >
                      <option value="l">L</option>
                      <option value="ml">mL</option>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                    </select>
                  </td>
                  <td style={{ padding: '4px 8px 4px 0' }}>
                    <input
                      aria-label={`Observações linha ${idx + 1}`}
                      style={inputStyle}
                      value={row.notes}
                      disabled={disabled}
                      placeholder="Aplicar via foliar..."
                      onChange={(e) => updateRow(row.id, 'notes', e.target.value)}
                    />
                  </td>
                  <td style={{ padding: '4px 0', textAlign: 'right' }}>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => removeRow(row.id)}
                      aria-label="Remover linha"
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--colheita-radius-sm)',
                        border: '1px solid var(--colheita-border)',
                        backgroundColor: 'transparent',
                        color: 'var(--colheita-text-tertiary)',
                        fontSize: '0.75rem',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        lineHeight: '1',
                      }}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length === 0 && (
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--colheita-text-tertiary)',
            fontStyle: 'italic',
            marginBottom: '12px',
          }}
        >
          Nenhuma indicação adicionada.
        </p>
      )}

      <button
        id={uid}
        type="button"
        disabled={disabled}
        onClick={addRow}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: 'var(--colheita-radius-md)',
          border: '1px solid var(--colheita-border)',
          backgroundColor: 'var(--colheita-surface-elevated)',
          color: 'var(--colheita-text-secondary)',
          fontSize: '0.8125rem',
          fontWeight: '500',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        + Adicionar indicação
      </button>

      {errorMessage && (
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--colheita-danger)',
            marginTop: '6px',
          }}
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
