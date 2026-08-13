'use client';

// apps/admin/src/components/assistente/admin-chat-panel.tsx
/**
 * Painel de chat do assistente IA para o admin.
 * Chama POST same-origin /api/agent/ask (SSE stream).
 * Contrato do evento: { type:'delta', text } | { type:'done', sources, usage }.
 */

import { ChatMarkdown } from '@colheita/ui';
import { RotateCcw, Send } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface AgentResponse {
  answer?: string;
  error?: string;
}

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

// Antes apontava para um @colheita/api separado (port 3003) que nao esta
// deployado. Agora usa o endpoint same-origin /api/agent/ask do proprio admin.

const SUGGESTED_QUERIES = [
  'Programa para soja R3-R5 com estresse hídrico moderado',
  'Diferença técnica entre Stron e Grow MoB+ na pré-florada',
  'Quando indicar Defon vs cobre tradicional? Janela e dose',
  'Combinação Lifeon + Biotas: lógica e compatibilidade de calda',
  'Composição do Biotas e diferenciação técnica',
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: '0',
    role: 'assistant',
    text: 'Olá. Sou o **Agrônomo Argho** — consultor técnico-científico com perfil de Doutor em Agronomia (fertilidade de solos, fisiologia vegetal, biológicos). Pergunte sobre janela fenológica, modo de ação, combinações estratégicas do Programa Argho, ou composição declarada dos 20 produtos do portfólio. Quando útil, descreva também cultura, fase fenológica, sintoma observado ou condição de campo — assim posso recomendar com mais precisão.',
  },
];

export function AdminChatPanel() {
  // contextPath usado pra dar awareness da rota ao agente PhD agronomico.
  // System prompt aceita "O usuário está navegando em X. Considere isso ao
  // responder." (vide /api/agent/ask/route.ts contextHint).
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: messagesEndRef é estável (useRef)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(query?: string) {
    const text = (query ?? input).trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const assistantId = `${Date.now()}-a`;
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', text: '' }]);

    let finalText = '';

    try {
      // Contrato AiStreamEvent (packages/ai/src/types.ts):
      //   { type: 'delta', text }  |  { type: 'done', sources, usage }
      // Em falha SSE: event: error\ndata: { type:'error', message, detail }.
      const res = await fetch('/api/agent/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          history: conversationHistory,
          // contextPath alimenta system prompt do agente PhD agronomico
          // com awareness da rota - permite respostas contextuais ("voce
          // esta em /produtos/biotas, posso explicar a composicao...").
          contextPath: pathname ?? undefined,
        }),
      });

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({ error: 'Erro de rede.' }))) as AgentResponse;
        finalText = data.error ?? 'Erro ao processar pergunta.';
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, text: finalText } : m)),
        );
      } else {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          // SSE: eventos separados por \n\n; cada bloco pode ter event:/data:.
          const blocks = buffer.split('\n\n');
          buffer = blocks.pop() ?? '';

          for (const block of blocks) {
            const dataLine = block.split('\n').find((l) => l.startsWith('data: '));
            if (!dataLine) continue;
            try {
              const event = JSON.parse(dataLine.slice(6)) as {
                type?: string;
                text?: string;
                message?: string;
                detail?: string;
              };
              if (event.type === 'delta' && typeof event.text === 'string') {
                finalText += event.text;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, text: finalText } : m)),
                );
              } else if (event.type === 'error') {
                finalText = event.message ?? event.detail ?? 'Erro do agente.';
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, text: finalText } : m)),
                );
              }
              // event 'done' contém sources/usage; AdminChatPanel nao renderiza fontes ainda.
            } catch {
              // linha malformada — ignorar
            }
          }
        }
      }

      if (finalText) {
        setConversationHistory((prev) =>
          [
            ...prev,
            { role: 'user' as const, content: text },
            { role: 'assistant' as const, content: finalText },
          ].slice(-10),
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                text: 'Não consegui conectar ao servidor. Verifique se o serviço de API está rodando.',
              }
            : m,
        ),
      );
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  function handleClear() {
    if (loading) return;
    setMessages(INITIAL_MESSAGES);
    setConversationHistory([]);
  }

  const showSuggestions = messages.length === 1;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 32px',
      }}
    >
      {/* Toolbar */}
      {messages.length > 1 && !loading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: '16px',
          }}
        >
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpar conversa"
            title="Limpar conversa"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '8px',
              border: '1px solid var(--colheita-border)',
              backgroundColor: 'transparent',
              color: 'var(--colheita-text-tertiary)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'border-color 150ms, color 150ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor =
                'var(--colheita-border-hover, var(--colheita-border))';
              e.currentTarget.style.color = 'var(--colheita-text-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--colheita-border)';
              e.currentTarget.style.color = 'var(--colheita-text-tertiary)';
            }}
          >
            <RotateCcw size={12} />
            Nova conversa
          </button>
        </div>
      )}

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingTop: '24px',
          paddingBottom: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: '500',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--colheita-text-tertiary)',
                marginBottom: '4px',
                paddingLeft: msg.role === 'assistant' ? '2px' : undefined,
                paddingRight: msg.role === 'user' ? '2px' : undefined,
              }}
            >
              {msg.role === 'user' ? 'Você' : 'Assistente'}
            </div>
            <div
              style={{
                maxWidth: '86%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                backgroundColor:
                  msg.role === 'user'
                    ? 'var(--colheita-brand-primary)'
                    : 'var(--colheita-surface-elevated)',
                color: msg.role === 'user' ? '#fff' : 'var(--colheita-text-primary)',
                fontSize: '0.875rem',
                wordBreak: 'break-word',
              }}
            >
              {msg.role === 'user' ? (
                <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>{msg.text}</span>
              ) : (
                <ChatMarkdown>{msg.text || '▋'}</ChatMarkdown>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px',
            }}
          >
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: '500',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--colheita-text-tertiary)',
              }}
            >
              Assistente
            </div>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '14px 14px 14px 4px',
                backgroundColor: 'var(--colheita-surface-elevated)',
                color: 'var(--colheita-text-tertiary)',
                fontSize: '0.875rem',
              }}
            >
              Consultando catálogo…
            </div>
          </div>
        )}

        {/* Suggested queries — shown only on first message */}
        {showSuggestions && !loading && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              paddingTop: '4px',
            }}
          >
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => void handleSend(q)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid var(--colheita-border)',
                  backgroundColor: 'transparent',
                  color: 'var(--colheita-text-secondary)',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  transition: 'border-color 150ms, color 150ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--colheita-brand-primary)';
                  e.currentTarget.style.color = 'var(--colheita-brand-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--colheita-border)';
                  e.currentTarget.style.color = 'var(--colheita-text-secondary)';
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          padding: '12px 0 24px',
          borderTop: '1px solid var(--colheita-border-subtle)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-end',
            backgroundColor: 'var(--colheita-surface-elevated)',
            borderRadius: '14px',
            padding: '10px 12px 10px 16px',
            border: '1px solid var(--colheita-border)',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre produtos, doses, culturas, trilhas…"
            rows={1}
            disabled={loading}
            style={{
              flex: 1,
              resize: 'none',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.875rem',
              color: 'var(--colheita-text-primary)',
              fontFamily: 'inherit',
              lineHeight: 1.55,
              maxHeight: '120px',
              overflowY: 'auto',
            }}
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!input.trim() || loading}
            aria-label="Enviar"
            style={{
              flexShrink: 0,
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              backgroundColor:
                !input.trim() || loading
                  ? 'var(--colheita-surface-hover)'
                  : 'var(--colheita-brand-primary)',
              color: !input.trim() || loading ? 'var(--colheita-text-tertiary)' : '#fff',
              border: 'none',
              cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 150ms, color 150ms',
            }}
          >
            <Send size={15} />
          </button>
        </div>
        <p
          style={{
            margin: '6px 0 0 4px',
            fontSize: '0.75rem',
            color: 'var(--colheita-text-tertiary)',
          }}
        >
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}
