'use client';

// apps/admin/src/components/assistente/admin-chat-panel.tsx
/**
 * Painel de chat do assistente IA para o admin.
 * Chama POST NEXT_PUBLIC_API_URL/api/v1/agent.
 */

import { ChatMarkdown } from '@colheita/ui';
import { Send } from 'lucide-react';
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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3003';

const SUGGESTED_QUERIES = [
  'Quais produtos têm indicação para soja?',
  'Qual a dose de Xcensis para algodão?',
  'Quais trilhas de aprendizado estão publicadas?',
  'Quais produtos têm registro MAPA?',
];

export function AdminChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: 'Olá! Sou o assistente da Argho. Posso responder perguntas sobre produtos do catálogo e trilhas de aprendizado da Academia. O que deseja saber?',
    },
  ]);
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
      const res = await fetch(`${API_URL}/api/v1/agent`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, topK: 5, conversationHistory, stream: true }),
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
