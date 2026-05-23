// apps/admin/src/components/produtos/produto-form.tsx
'use client';

import type { ProductApplication } from '@colheita/db';
import { Button, Input, Textarea } from '@colheita/ui';
import Link from 'next/link';
import { useActionState, useId } from 'react';
import type { ProdutoFormState } from '@/lib/actions/produtos';
import { ApplicationsEditor } from './applications-editor';
import { AssetPicker, type PickableAsset } from './asset-picker';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Categoria {
  id: string;
  name: string;
  slug: string;
}

interface ProdutoFormProps {
  action: (prevState: ProdutoFormState, formData: FormData) => Promise<ProdutoFormState>;
  categorias: Categoria[];
  cancelHref: string;
  submitLabel?: string;
  /**
   * Assets disponíveis (image type) do tenant — server-loaded e passados pra
   * popular os AssetPickers de hero/packshot. Lista vazia desativa os pickers
   * com mensagem "faça upload em /midias".
   */
  availableAssets?: PickableAsset[];
  defaultValues?: {
    name?: string;
    tagline?: string | null;
    description?: string | null;
    category_id?: string | null;
    safra_codigo?: string | null;
    composition?: Record<string, unknown> | null;
    technical_specs?: Record<string, unknown> | null;
    packaging?: unknown[] | null;
    applications?: ProductApplication[] | null;
    hero_asset_id?: string | null;
    packshot_asset_id?: string | null;
  };
}

// ── Estilos inline compartilhados ─────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: '500',
  color: 'var(--colheita-text-secondary)',
  marginBottom: '6px',
};

const errorStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--colheita-danger)',
  marginTop: '4px',
};

const hintStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--colheita-text-tertiary)',
  marginTop: '4px',
};

// ── Componente ────────────────────────────────────────────────────────────────

export function ProdutoForm({
  action,
  categorias,
  cancelHref,
  submitLabel = 'Salvar',
  availableAssets,
  defaultValues = {},
}: ProdutoFormProps) {
  const [state, formAction, pending] = useActionState(action, null);

  // IDs únicos gerados por React — evita colisões em SSR e múltiplas instâncias
  const uid = useId();
  const nameId = `${uid}-name`;
  const nameErrorId = `${uid}-name-error`;
  const taglineId = `${uid}-tagline`;
  const categoryId = `${uid}-category`;
  const descriptionId = `${uid}-description`;
  const compositionId = `${uid}-composition`;
  const technicalSpecsId = `${uid}-technical-specs`;
  const packagingId = `${uid}-packaging`;
  const applicationsId = `${uid}-applications`;
  const safraCodigoId = `${uid}-safra-codigo`;

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Erro global */}
      {state?.error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'color-mix(in srgb, var(--colheita-danger) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--colheita-danger) 30%, transparent)',
            borderRadius: 'var(--colheita-radius-md)',
            fontSize: '0.875rem',
            color: 'var(--colheita-danger)',
          }}
        >
          {state.error}
        </div>
      )}

      {/* Nome */}
      <div>
        <label htmlFor={nameId} style={labelStyle}>
          Nome <span style={{ color: 'var(--colheita-danger)' }}>*</span>
        </label>
        <Input
          id={nameId}
          name="name"
          type="text"
          required
          disabled={pending}
          defaultValue={defaultValues.name ?? ''}
          placeholder="Ex: Xcensis"
          aria-describedby={state?.fieldErrors?.name ? nameErrorId : undefined}
        />
        {state?.fieldErrors?.name ? (
          <p id={nameErrorId} style={errorStyle}>
            {state.fieldErrors.name}
          </p>
        ) : (
          <p style={hintStyle}>O slug é gerado automaticamente a partir do nome.</p>
        )}
      </div>

      {/* Tagline */}
      <div>
        <label htmlFor={taglineId} style={labelStyle}>
          Tagline
        </label>
        <Input
          id={taglineId}
          name="tagline"
          type="text"
          disabled={pending}
          defaultValue={defaultValues.tagline ?? ''}
          placeholder="Ex: Multi-micronutriente foliar com EDTA e Lignossulfonatos"
        />
        {state?.fieldErrors?.tagline && <p style={errorStyle}>{state.fieldErrors.tagline}</p>}
      </div>

      {/* Categoria */}
      <div>
        <label htmlFor={categoryId} style={labelStyle}>
          Categoria
        </label>
        <select
          id={categoryId}
          name="category_id"
          disabled={pending}
          defaultValue={defaultValues.category_id ?? ''}
          style={{
            width: '100%',
            height: '36px',
            padding: '0 12px',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border)',
            backgroundColor: 'var(--colheita-surface-elevated)',
            color: 'var(--colheita-text-primary)',
            fontSize: '0.875rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">— Sem categoria —</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Mídia principal — Camada 4 (DAM): hero + packshot via AssetPicker.
          Renderizado apenas em modo edicao (createProduto nao recebe availableAssets,
          assets ficam pra atribuir depois quando o produto ja existe). */}
      {availableAssets !== undefined && (
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border-subtle)',
            backgroundColor: 'var(--colheita-surface-elevated)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--colheita-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: 0,
            }}
          >
            Mídia principal
          </p>

          <AssetPicker
            name="hero_asset_id"
            label="Hero (imagem principal)"
            hint="Imagem grande exibida no topo da ficha técnica e portal. Recomendado: 1600×900 ou superior."
            defaultValue={defaultValues.hero_asset_id ?? null}
            availableAssets={availableAssets}
            disabled={pending}
          />

          <AssetPicker
            name="packshot_asset_id"
            label="Packshot (foto da embalagem)"
            hint="Imagem da embalagem real do produto. Usada em catálogos e listas."
            defaultValue={defaultValues.packshot_asset_id ?? null}
            availableAssets={availableAssets}
            disabled={pending}
          />
        </div>
      )}

      {/* Descrição */}
      <div>
        <label htmlFor={descriptionId} style={labelStyle}>
          Descrição
        </label>
        <Textarea
          id={descriptionId}
          name="description"
          rows={6}
          disabled={pending}
          defaultValue={defaultValues.description ?? ''}
          placeholder="Descrição técnica completa do produto..."
        />
        {state?.fieldErrors?.description && (
          <p style={errorStyle}>{state.fieldErrors.description}</p>
        )}
      </div>

      {/* Composição (JSON) */}
      <div>
        <label htmlFor={compositionId} style={labelStyle}>
          Composição{' '}
          <span
            style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--colheita-text-tertiary)' }}
          >
            (JSON)
          </span>
        </label>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--colheita-text-tertiary)',
            marginTop: '-4px',
            marginBottom: '6px',
            lineHeight: 1.5,
          }}
        >
          Mineral/organomineral:{' '}
          <code
            style={{ fontSize: '0.6875rem' }}
          >{`{"macros": {"K2O": 35.0}, "others": {"Aminoácidos": 6.0}}`}</code>
          <br />
          Complexo microbiológico (biológicos):{' '}
          <code
            style={{ fontSize: '0.6875rem' }}
          >{`{"others": {"Bacillus subtilis": 1, "B. velezensis": 1}}`}</code>
          {
            ' — valor 1 = presença declarada, sem teor numérico (compliance MAPA, ver docs/biologicos-compliance.md).'
          }
        </p>
        <Textarea
          id={compositionId}
          name="composition"
          rows={6}
          disabled={pending}
          defaultValue={
            defaultValues.composition && Object.keys(defaultValues.composition).length > 0
              ? JSON.stringify(defaultValues.composition, null, 2)
              : ''
          }
          placeholder={
            '{\n  "macros": { "K2O": 35.0, "N": 2.0 },\n  "others": { "Aminoácidos": 6.0 }\n}'
          }
          style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}
        />
        {state?.fieldErrors?.composition && (
          <p style={errorStyle}>{state.fieldErrors.composition}</p>
        )}
      </div>

      {/* Especificações técnicas (JSON) */}
      <div>
        <label htmlFor={technicalSpecsId} style={labelStyle}>
          Especificações técnicas{' '}
          <span
            style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--colheita-text-tertiary)' }}
          >
            (JSON)
          </span>
        </label>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--colheita-text-tertiary)',
            marginTop: '-4px',
            marginBottom: '6px',
            lineHeight: 1.5,
          }}
        >
          Campos esperados: <code style={{ fontSize: '0.6875rem' }}>physical_state</code> (sólido /
          fluido / pó), <code style={{ fontSize: '0.6875rem' }}>origin_country</code>,{' '}
          <code style={{ fontSize: '0.6875rem' }}>product_type</code>. Para biológicos use{' '}
          <code style={{ fontSize: '0.6875rem' }}>"product_type": "Complexo microbiológico"</code>{' '}
          (aciona renderer alternativo nas paginas /produtos/[slug] do admin e portal).
        </p>
        <Textarea
          id={technicalSpecsId}
          name="technical_specs"
          rows={6}
          disabled={pending}
          defaultValue={
            defaultValues.technical_specs && Object.keys(defaultValues.technical_specs).length > 0
              ? JSON.stringify(defaultValues.technical_specs, null, 2)
              : ''
          }
          placeholder={
            '{\n  "physical_state": "fluido",\n  "origin_country": "Espanha",\n  "product_type": "Fertilizante Mineral Misto"\n}'
          }
          style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}
        />
        {state?.fieldErrors?.technical_specs && (
          <p style={errorStyle}>{state.fieldErrors.technical_specs}</p>
        )}
      </div>

      {/* Embalagens (JSON array) */}
      <div>
        <label htmlFor={packagingId} style={labelStyle}>
          Embalagens{' '}
          <span
            style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--colheita-text-tertiary)' }}
          >
            (JSON)
          </span>
        </label>
        <Textarea
          id={packagingId}
          name="packaging"
          rows={4}
          disabled={pending}
          defaultValue={
            defaultValues.packaging && defaultValues.packaging.length > 0
              ? JSON.stringify(defaultValues.packaging, null, 2)
              : ''
          }
          placeholder={
            '[\n  {"type": "frasco", "volumeL": 1},\n  {"type": "galão", "volumeL": 5}\n]'
          }
          style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}
        />
        {state?.fieldErrors?.packaging && <p style={errorStyle}>{state.fieldErrors.packaging}</p>}
        <p style={hintStyle}>Array de objetos com type + weightKg ou volumeL.</p>
      </div>

      {/* Indicações por Cultura */}
      <div>
        <p
          id={applicationsId}
          style={{
            ...labelStyle,
            marginBottom: '10px',
          }}
        >
          Indicações por Cultura
        </p>
        <ApplicationsEditor
          defaultValue={(defaultValues.applications ?? []) as ProductApplication[]}
          disabled={pending}
          errorMessage={state?.fieldErrors?.applications}
        />
      </div>

      {/* Integração ERP Safra */}
      <div
        style={{
          paddingTop: '16px',
          borderTop: '1px solid var(--colheita-border-subtle)',
        }}
      >
        <p
          style={{
            fontSize: '0.75rem',
            fontWeight: '500',
            color: 'var(--colheita-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '12px',
          }}
        >
          Integração ERP
        </p>
        <div>
          <label htmlFor={safraCodigoId} style={labelStyle}>
            Código Safra
          </label>
          <Input
            id={safraCodigoId}
            name="safra_codigo"
            type="text"
            disabled={pending}
            defaultValue={defaultValues.safra_codigo ?? ''}
            placeholder="Ex: ARG-FOLIAR-10"
            style={{ fontFamily: 'monospace' }}
          />
          {state?.fieldErrors?.safra_codigo ? (
            <p style={errorStyle}>{state.fieldErrors.safra_codigo}</p>
          ) : (
            <p style={hintStyle}>
              Código do produto no ERP Safra. Quando configurado, o estoque e status são
              sincronizados automaticamente via webhook.
            </p>
          )}
        </div>
      </div>

      {/* Ações */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          paddingTop: '8px',
          borderTop: '1px solid var(--colheita-border-subtle)',
        }}
      >
        <Button type="submit" disabled={pending}>
          {pending ? 'Salvando...' : submitLabel}
        </Button>
        <Button variant="ghost" asChild>
          <Link href={cancelHref}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
