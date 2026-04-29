// apps/admin/src/components/produtos/produto-detail.tsx

import type { ProductApplication, ProductComposition, ProductPackaging } from '@colheita/db';
import {
  Badge,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@colheita/ui';

interface ProdutoDetailProps {
  produto: {
    name: string;
    tagline: string | null;
    description: string | null;
    status: string;
    composition: ProductComposition;
    technicalSpecs: Record<string, unknown>;
    packaging: ProductPackaging;
    applications: ProductApplication[];
    category: { name: string } | null;
    registrationNo: string | null;
  };
}

function MetaItem({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span
        style={{
          fontSize: '0.75rem',
          color: 'var(--colheita-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '0.875rem',
          color: 'var(--colheita-text-primary)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function packagingLabel(p: ProductPackaging[number]) {
  if (p.weightKg) return `${p.type} ${p.weightKg} kg`;
  if (p.volumeL) return `${p.type} ${p.volumeL} L`;
  return p.type;
}

export function ProdutoDetail({ produto }: ProdutoDetailProps) {
  // Suporta tanto o formato estruturado {macros, micros, others} quanto JSON flat
  const structured = {
    ...produto.composition.macros,
    ...produto.composition.micros,
    ...produto.composition.others,
  };
  const isStructured = Object.keys(structured).length > 0;
  const flat = Object.fromEntries(
    Object.entries(produto.composition as Record<string, unknown>).filter(
      ([k]) => !['macros', 'micros', 'others'].includes(k),
    ),
  );
  const allNutrients = isStructured ? structured : flat;

  const hasComposition = Object.keys(allNutrients).length > 0;
  // biome-ignore lint/complexity/useLiteralKeys: snake_case key required for DB field access
  const physicalState = produto.technicalSpecs['physical_state'] as string | undefined;
  // biome-ignore lint/complexity/useLiteralKeys: snake_case key required for DB field access
  const origin = produto.technicalSpecs['origin'] as string | undefined;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gap: '40px',
        alignItems: 'start',
      }}
    >
      {/* Conteúdo principal (esquerda) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: '600',
              color: 'var(--colheita-text-primary)',
              letterSpacing: '-0.025em',
              marginBottom: '8px',
            }}
          >
            {produto.name}
          </h1>
          {produto.tagline && (
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--colheita-text-secondary)',
                lineHeight: '1.6',
              }}
            >
              {produto.tagline}
            </p>
          )}
        </div>

        {produto.description && (
          <div>
            <h2
              style={{
                fontSize: '0.8125rem',
                fontWeight: '500',
                color: 'var(--colheita-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '12px',
              }}
            >
              Descrição
            </h2>
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--colheita-text-secondary)',
                lineHeight: '1.65',
                whiteSpace: 'pre-line',
              }}
            >
              {produto.description}
            </p>
          </div>
        )}

        {hasComposition && (
          <div>
            <h2
              style={{
                fontSize: '0.8125rem',
                fontWeight: '500',
                color: 'var(--colheita-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '12px',
              }}
            >
              Composição garantida
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nutriente</TableHead>
                  <TableHead>Teor (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(allNutrients).map(([nutrient, value]) => (
                  <TableRow key={nutrient}>
                    <TableCell style={{ fontFamily: 'inherit' }}>{nutrient}</TableCell>
                    <TableCell>{String(value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Sidebar de metadados (direita) */}
      <div
        style={{
          backgroundColor: 'var(--colheita-surface-card)',
          border: '1px solid var(--colheita-border-subtle)',
          borderRadius: 'var(--colheita-radius-lg)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          position: 'sticky',
          top: '24px',
        }}
      >
        <div>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--colheita-text-tertiary)',
              marginBottom: '4px',
            }}
          >
            Status
          </p>
          <Badge
            variant={produto.status === 'published' ? 'success' : 'secondary'}
            style={{ fontSize: '0.75rem' }}
          >
            {produto.status === 'published'
              ? 'Publicado'
              : produto.status === 'draft'
                ? 'Rascunho'
                : 'Arquivado'}
          </Badge>
        </div>

        <Separator />

        {produto.category && <MetaItem label="Categoria" value={produto.category.name} />}
        {produto.registrationNo && (
          <MetaItem label="Registro MAPA" value={produto.registrationNo} />
        )}
        {physicalState && <MetaItem label="Estado físico" value={physicalState} />}
        {origin && <MetaItem label="Origem" value={origin} />}

        {produto.packaging.length > 0 && (
          <div>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--colheita-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
              }}
            >
              Embalagens
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {produto.packaging.map((p) => (
                <span
                  key={packagingLabel(p)}
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--colheita-text-secondary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {packagingLabel(p)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Indicações por Cultura */}
      {produto.applications.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <Separator style={{ marginBottom: '24px' }} />
          <h2
            style={{
              fontSize: '0.6875rem',
              fontWeight: '600',
              color: 'var(--colheita-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px',
            }}
          >
            Indicações por Cultura
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cultura</TableHead>
                <TableHead>Estádio</TableHead>
                <TableHead>Dose/ha</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produto.applications.map((app, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: stable positional list
                <TableRow key={i}>
                  <TableCell style={{ fontWeight: '500' }}>{app.crop}</TableCell>
                  <TableCell>{app.stage ?? '—'}</TableCell>
                  <TableCell style={{ fontFamily: 'var(--font-mono)' }}>
                    {app.dosePerHa} {app.unit}
                  </TableCell>
                  <TableCell
                    style={{ fontSize: '0.8125rem', color: 'var(--colheita-text-secondary)' }}
                  >
                    {app.notes ?? '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
