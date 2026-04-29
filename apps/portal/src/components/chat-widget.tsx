'use client';
// apps/portal/src/components/chat-widget.tsx
/**
 * Chat Widget — assistente IA para distribuidores autenticados.
 *
 * Floating button (bottom-right) → painel de chat → chama POST /api/v1/agent.
 * Só renderizado quando o usuário está autenticado.
 */

import { ChatMarkdown } from '@colheita/ui';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface AgentResponse {
  answer: string;
  sources?: {
    documentId: string;
    kind: string;
    metadata?: Record<string, unknown>;
  }[];
  usage?: { inputTokens: number; outputTokens: number };
  error?: string;
}

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3003';

function ChatIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <title>Chat</title>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <title>Fechar</title>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <title>Enviar</title>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: 'Olá! Sou o assistente da Argho. Pergunte sobre produtos, doses, culturas ou trilhas de aprendizado.',
    },
  ]);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: messagesEndRef é estável (useRef)
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  async function handleSend() {
    const query = input.trim();
    if (!query || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Placeholder de streaming — texto vai sendo acumulado
    const assistantId = `${Date.now()}-a`;
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', text: '' }]);

    let finalText = '';

    try {
      const res = await fetch(`${API_URL}/api/v1/agent`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, topK: 5, conversationHistory, stream: true }),
      });

      if (!res.ok || !res.body) {
        const data = (await res.json()) as AgentResponse;
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
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const event = JSON.parse(line.slice(6)) as { type: string; text?: string };
              if (event.type === 'delta' && event.text) {
                finalText += event.text;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, text: finalText } : m)),
                );
              }
            } catch {
              // linha malformada — ignorar
            }
          }
        }
      }

      // Atualiza histórico para próxima mensagem (max 10 turnos)
      if (finalText) {
        setConversationHistory((prev) =>
          [
            ...prev,
            { role: 'user' as const, content: query },
            { role: 'assistant' as const, content: finalText },
          ].slice(-10),
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, text: 'Não consegui conectar ao servidor. Tente novamente.' }
            : m,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Fechar assistente' : 'Abrir assistente IA'}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: 'var(--colheita-brand-primary)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.24)',
          transition: 'transform 150ms ease, box-shadow 150ms ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        }}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Assistente IA Argho"
          style={{
            position: 'fixed',
            bottom: '88px',
            right: '24px',
            zIndex: 999,
            width: '360px',
            maxHeight: '520px',
            borderRadius: '16px',
            backgroundColor: 'var(--colheita-surface-background)',
            border: '1px solid var(--colheita-border-subtle)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--colheita-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--colheita-brand-primary)',
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--colheita-text-primary)',
                  lineHeight: 1.3,
                }}
              >
                Assistente Argho
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--colheita-text-tertiary)' }}>
                Produtos · Academia
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '8px 12px',
                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    backgroundColor:
                      msg.role === 'user'
                        ? 'var(--colheita-brand-primary)'
                        : 'var(--colheita-surface-elevated)',
                    color: msg.role === 'user' ? '#fff' : 'var(--colheita-text-primary)',
                    fontSize: '0.8125rem',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.role === 'user' ? (
                    <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
                  ) : (
                    <ChatMarkdown>{msg.text || '▋'}</ChatMarkdown>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: '14px 14px 14px 4px',
                    backgroundColor: 'var(--colheita-surface-elevated)',
                    color: 'var(--colheita-text-tertiary)',
                    fontSize: '0.8125rem',
                  }}
                >
                  Pensando…
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: '10px 12px',
              borderTop: '1px solid var(--colheita-border-subtle)',
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-end',
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte sobre produtos, doses, culturas…"
              rows={1}
              disabled={loading}
              style={{
                flex: 1,
                resize: 'none',
                border: '1px solid var(--colheita-border)',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '0.8125rem',
                color: 'var(--colheita-text-primary)',
                backgroundColor: 'var(--colheita-surface-elevated)',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.5,
                maxHeight: '100px',
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
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor:
                  !input.trim() || loading
                    ? 'var(--colheita-border)'
                    : 'var(--colheita-brand-primary)',
                color: '#fff',
                border: 'none',
                cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 150ms',
              }}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
