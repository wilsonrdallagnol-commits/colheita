// apps/admin/src/components/produtos/asset-picker.tsx
'use client';

// Camada 4 (DAM) — galeria de assets vinculada ao editor de produto.
//
// Substitui o input de URL bruta para hero/packshot por um seletor visual:
//   - Mostra preview do asset atualmente selecionado (thumb + nome)
//   - Botao "Trocar" abre grid inline de assets do tenant (filtraveis)
//   - Click em asset seta hidden input com asset_id (form submit pega)
//   - Inclui botao "Limpar" pra desvincular o asset
//
// Performance: renderiza grid client-side a partir de array passado por props
// (server-loaded). Sem fetch dinamico — Argho hoje tem ~50 assets, cabe na
// memoria. Quando crescer pra ~500+, refatorar pra modal com paginacao.

import { Button } from '@colheita/ui';
import { useId, useMemo, useState } from 'react';

export interface PickableAsset {
  id: string;
  title: string | null;
  originalName: string;
  publicUrl: string | null;
  width: number | null;
  height: number | null;
  tags: string[];
}

interface AssetPickerProps {
  /** Nome do campo no form — vira <input name=... value={selectedId} hidden /> */
  name: string;
  /** Label visivel acima do picker */
  label: string;
  /** Texto auxiliar abaixo do label */
  hint?: string;
  /** asset_id selecionado inicialmente (vindo do banco) */
  defaultValue: string | null;
  /** Lista de assets escolhiveis (apenas type='image' faz sentido aqui) */
  availableAssets: PickableAsset[];
  disabled?: boolean;
}

export function AssetPicker({
  name,
  label,
  hint,
  defaultValue,
  availableAssets,
  disabled,
}: AssetPickerProps) {
  const inputId = useId();
  const [selectedId, setSelectedId] = useState<string | null>(defaultValue);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedAsset = useMemo(
    () => availableAssets.find((a) => a.id === selectedId) ?? null,
    [availableAssets, selectedId],
  );

  // Filtro client-side por title, originalName ou tag — case-insensitive,
  // accent-insensitive seria ideal mas e pra refactor futuro com Intl.Collator.
  const filteredAssets = useMemo(() => {
    const trimmed = search.trim().toLowerCase();
    if (!trimmed) return availableAssets;
    return availableAssets.filter((a) => {
      if (a.title?.toLowerCase().includes(trimmed)) return true;
      if (a.originalName.toLowerCase().includes(trimmed)) return true;
      if (a.tags.some((t) => t.toLowerCase().includes(trimmed))) return true;
      return false;
    });
  }, [availableAssets, search]);

  return (
    <div>
      <label
        htmlFor={inputId}
        style={{
          display: 'block',
          fontSize: '0.8125rem',
          fontWeight: '500',
          color: 'var(--colheita-text-secondary)',
          marginBottom: '6px',
        }}
      >
        {label}
      </label>

      {/* Hidden input com o id selecionado — o form submit le isto */}
      <input id={inputId} type="hidden" name={name} value={selectedId ?? ''} />

      {/* Slot do asset selecionado */}
      <div
        style={{
          padding: '12px',
          borderRadius: 'var(--colheita-radius-md)',
          border: '1px solid var(--colheita-border)',
          backgroundColor: 'var(--colheita-surface-elevated)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {selectedAsset?.publicUrl ? (
          // Thumbnail do asset selecionado. <Image> de next/image otimiza,
          // mas aqui usamos <img> direto pra evitar dor com remotePatterns
          // (URLs Supabase Storage rotativas).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={selectedAsset.publicUrl}
            alt={selectedAsset.title ?? selectedAsset.originalName}
            width={56}
            height={56}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--colheita-radius-sm)',
              objectFit: 'cover',
              flexShrink: 0,
              border: '1px solid var(--colheita-border-subtle)',
            }}
          />
        ) : (
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--colheita-radius-sm)',
              backgroundColor: 'var(--colheita-surface-sunken, #f5f5f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              color: 'var(--colheita-text-tertiary)',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            🖼
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--colheita-text-primary)',
              margin: '0 0 2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {selectedAsset?.title ?? selectedAsset?.originalName ?? 'Nenhum asset selecionado'}
          </p>
          {selectedAsset && (
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--colheita-text-tertiary)',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {selectedAsset.width && selectedAsset.height
                ? `${selectedAsset.width}×${selectedAsset.height} · `
                : ''}
              {selectedAsset.tags.slice(0, 3).join(' · ') || selectedAsset.originalName}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => setIsPickerOpen((v) => !v)}
          >
            {isPickerOpen ? 'Fechar' : selectedAsset ? 'Trocar' : 'Escolher'}
          </Button>
          {selectedAsset && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={disabled}
              onClick={() => setSelectedId(null)}
            >
              Limpar
            </Button>
          )}
        </div>
      </div>

      {hint && !isPickerOpen && (
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--colheita-text-tertiary)',
            marginTop: '4px',
          }}
        >
          {hint}
        </p>
      )}

      {/* Picker inline — grid de assets */}
      {isPickerOpen && (
        <div
          style={{
            marginTop: '8px',
            padding: '12px',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border)',
            backgroundColor: 'var(--colheita-surface-elevated)',
            maxHeight: '420px',
            overflowY: 'auto',
          }}
        >
          {/* Search */}
          <input
            type="search"
            placeholder="Buscar por título, nome ou tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              height: '34px',
              padding: '0 12px',
              borderRadius: 'var(--colheita-radius-sm)',
              border: '1px solid var(--colheita-border)',
              backgroundColor: 'var(--colheita-surface-sunken, #ffffff)',
              fontSize: '0.875rem',
              marginBottom: '12px',
              outline: 'none',
            }}
          />

          {availableAssets.length === 0 ? (
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--colheita-text-tertiary)',
                margin: 0,
                padding: '16px 0',
                textAlign: 'center',
              }}
            >
              Nenhuma imagem disponível. Faça upload em /midias.
            </p>
          ) : filteredAssets.length === 0 ? (
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--colheita-text-tertiary)',
                margin: 0,
                padding: '16px 0',
                textAlign: 'center',
              }}
            >
              Nenhum asset bate com &ldquo;{search}&rdquo;.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '8px',
              }}
            >
              {filteredAssets.map((asset) => {
                const isSelected = asset.id === selectedId;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setSelectedId(asset.id);
                      setIsPickerOpen(false);
                    }}
                    style={{
                      display: 'block',
                      padding: 0,
                      backgroundColor: 'transparent',
                      border: isSelected
                        ? '2px solid var(--colheita-brand-primary)'
                        : '1px solid var(--colheita-border-subtle)',
                      borderRadius: 'var(--colheita-radius-sm)',
                      overflow: 'hidden',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                    aria-pressed={isSelected}
                  >
                    {asset.publicUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.publicUrl}
                        alt={asset.title ?? asset.originalName}
                        style={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          backgroundColor: 'var(--colheita-surface-sunken, #f5f5f7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.25rem',
                          color: 'var(--colheita-text-tertiary)',
                        }}
                      >
                        🖼
                      </div>
                    )}
                    <div
                      style={{
                        padding: '6px 8px',
                        backgroundColor: isSelected
                          ? 'color-mix(in srgb, var(--colheita-brand-primary) 8%, transparent)'
                          : 'transparent',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 500,
                          color: 'var(--colheita-text-primary)',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {asset.title ?? asset.originalName}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
