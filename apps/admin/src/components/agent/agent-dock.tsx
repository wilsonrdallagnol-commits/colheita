// apps/admin/src/components/agent/agent-dock.tsx
'use client';

// Camada agente — dock flutuante onipresente no admin.
//
// Filosofia (vide /hm-designer): o mundo é de agentes, não de dashboards.
// UI = visibilidade + override. A conversa é a interface primária; formulários
// são exceção. Esta é a primeira encarnação dessa filosofia no admin Colheita.
//
// MVP escopo:
//  - Pill flutuante (canto inferior direito) em TODAS rotas do admin
//  - Click expande painel com sugestões contextuais por rota
//  - Sugestoes sao chips estaticos (regras por pathname) — sem LLM ainda
//  - Input desabilitado com placeholder "Conversa em construcao"
//
// Proximas iteracoes (sprint dedicado, requer brainstorming):
//  - LLM-backed: chips dinamicos baseados em estado do lead/produto/etc
//  - Input ativo: chat real consultando packages/ai (RAG ja existe)
//  - Acoes inline: gerar proposta, agendar follow-up, etc — sem deixar a pagina

import { Send, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface Suggestion {
  label: string;
  href?: string;
  hint?: string;
}

/**
 * Sugestões contextuais derivadas da rota atual. Estaticas por enquanto —
 * regra simples por prefixo de pathname. Sem LLM, sem state externo.
 */
function suggestionsFor(pathname: string): { context: string; items: Suggestion[] } {
  // Lead detail: /leads/[id] (mas nao /leads/[id]/proposta/gerar)
  if (/^\/leads\/[^/]+\/?$/.test(pathname)) {
    return {
      context: 'Lead em detalhe',
      items: [
        { label: 'Gerar proposta', href: '#proposta', hint: 'mix sugerido por cultura' },
        { label: 'Registrar follow-up', hint: 'em 7 dias' },
        { label: 'Marcar como ganho' },
        { label: 'Marcar como perdido' },
      ],
    };
  }

  if (pathname === '/leads' || pathname.startsWith('/leads?')) {
    return {
      context: 'Pipeline comercial',
      items: [
        { label: 'Leads parados há 14+ dias' },
        { label: 'Capturados via WhatsApp esta semana' },
        { label: 'Próximos follow-ups' },
      ],
    };
  }

  if (pathname.startsWith('/produtos')) {
    return {
      context: 'Catálogo PIM',
      items: [
        { label: 'Produtos sem ficha técnica gerada' },
        { label: 'Registros MAPA vencendo em 30 dias' },
        { label: 'Gerar catálogo consolidado' },
      ],
    };
  }

  if (pathname.startsWith('/bi')) {
    return {
      context: 'Inteligência de Mercado',
      items: [
        { label: 'Comparar trimestre vs anterior' },
        { label: 'Maiores quedas no pipeline' },
        { label: 'Exportar relatório executivo' },
      ],
    };
  }

  if (pathname.startsWith('/pedidos')) {
    return {
      context: 'Pedidos',
      items: [
        { label: 'Pedidos pendentes de faturamento' },
        { label: 'Inadimplência em 60+ dias' },
      ],
    };
  }

  if (pathname.startsWith('/compliance')) {
    return {
      context: 'Compliance regulatório',
      items: [
        { label: 'Registros MAPA críticos' },
        { label: 'Renovações em curso' },
        { label: 'Gerar dossiê regulatório' },
      ],
    };
  }

  // Fallback (home dashboard, /materiais, etc)
  return {
    context: 'Visão geral',
    items: [
      { label: 'O que mudou hoje?' },
      { label: 'Tarefas pendentes pra mim' },
      { label: 'Resumo da semana' },
    ],
  };
}

export function AgentDock() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const { context, items } = suggestionsFor(pathname);

  // ESC fecha o dock
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [expanded]);

  const toggle = useCallback(() => setExpanded((v) => !v), []);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label="Abrir agente Colheita"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 50,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          borderRadius: '999px',
          border: '1px solid var(--colheita-border)',
          backgroundColor: '#ffffff',
          color: 'var(--colheita-text-primary)',
          fontSize: '0.8125rem',
          fontWeight: 500,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-blue-glow), var(--shadow-card)',
          transition: 'transform 200ms ease, box-shadow 200ms ease',
        }}
      >
        <Sparkles size={14} strokeWidth={1.75} color="var(--colheita-brand-primary)" />
        Pergunte ao agente
      </button>
    );
  }

  return (
    <>
      {/* Backdrop sutil — clique fora fecha */}
      <button
        type="button"
        aria-label="Fechar agente"
        onClick={toggle}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 49,
          backgroundColor: 'rgba(15, 23, 42, 0.16)',
          backdropFilter: 'blur(2px)',
          border: 'none',
          padding: 0,
          cursor: 'default',
        }}
      />

      <aside
        role="dialog"
        aria-label="Agente Colheita"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 50,
          width: 'min(420px, calc(100vw - 48px))',
          maxHeight: 'calc(100vh - 96px)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--colheita-border)',
          boxShadow: '0 24px 64px -16px rgba(15, 23, 42, 0.18)',
          overflow: 'hidden',
          animation: 'agentDockIn 200ms ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px',
            boxShadow: 'inset 0 -1px 0 0 var(--colheita-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: 'var(--colheita-brand-primary-soft)',
                color: 'var(--colheita-brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={14} strokeWidth={1.75} />
            </div>
            <div>
              <p
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--colheita-text-primary)',
                  letterSpacing: '-0.005em',
                  margin: 0,
                }}
              >
                Agente Colheita
              </p>
              <p
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--colheita-text-tertiary)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                {context}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggle}
            aria-label="Fechar"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--colheita-text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        {/* Sugestões — chips clicaveis */}
        <div
          style={{
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            overflowY: 'auto',
          }}
        >
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 500,
              color: 'var(--colheita-text-tertiary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              margin: '0 0 4px',
            }}
          >
            Sugestões
          </p>
          {items.map((item) => {
            const inner = (
              <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.875rem', letterSpacing: '-0.005em' }}>
                  {item.label}
                </span>
                {item.hint ? (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--colheita-text-tertiary)',
                    }}
                  >
                    {item.hint}
                  </span>
                ) : null}
              </span>
            );

            const baseStyle: React.CSSProperties = {
              display: 'block',
              padding: '10px 14px',
              borderRadius: '10px',
              boxShadow: 'inset 0 0 0 1px var(--colheita-border-subtle)',
              backgroundColor: 'transparent',
              color: 'var(--colheita-text-primary)',
              textDecoration: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'inherit',
              border: 'none',
              width: '100%',
              transition: 'box-shadow 150ms ease, background-color 150ms ease',
            };

            if (item.href) {
              return (
                <Link key={item.label} href={item.href} style={baseStyle}>
                  {inner}
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                disabled
                aria-disabled="true"
                title="Disponível em breve"
                style={{
                  ...baseStyle,
                  cursor: 'not-allowed',
                  opacity: 0.7,
                }}
              >
                {inner}
              </button>
            );
          })}
        </div>

        {/* Input desabilitado — sinaliza onde a conversa real entra */}
        <form
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 14px',
            boxShadow: 'inset 0 1px 0 0 var(--colheita-border-subtle)',
            backgroundColor: 'var(--colheita-surface-card)',
          }}
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="text"
            placeholder="Conversa em construção — peça as sugestões acima"
            disabled
            aria-label="Mensagem para o agente"
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--colheita-surface-elevated)',
              color: 'var(--colheita-text-primary)',
              fontSize: '0.8125rem',
              fontFamily: 'inherit',
              boxShadow: 'inset 0 0 0 1px var(--colheita-border-subtle)',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled
            aria-label="Enviar"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--colheita-surface-elevated)',
              color: 'var(--colheita-text-tertiary)',
              cursor: 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5,
            }}
          >
            <Send size={14} strokeWidth={1.5} />
          </button>
        </form>
      </aside>

      <style>{`
        @keyframes agentDockIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
