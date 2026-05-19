'use client';

// apps/admin/src/components/agent/agent-chat.tsx
//
// Chat real do AgentDock — fala com /api/agent/ask via SSE.
// Stream de tokens + retrieval citations + history multi-turn.

import { Send, User } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  /** Fontes citadas pelo RAG (opcional) */
  sources?: Array<{ documentId: string; kind: string }>;
}

interface AgentChatProps {
  contextPath: string;
  /** Sugestao clicada vira mensagem inicial automatica */
  initialQuery?: string;
}

export function AgentChat({ contextPath, initialQuery }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll pro fim quando chega novo conteudo (re-roda em qualquer
  // mudanca no array messages — biome reclama mas eh intencional)
  // biome-ignore lint/correctness/useExhaustiveDependencies: messages eh trigger correto
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed || isStreaming) return;

      setError(null);
      setIsStreaming(true);

      // Adiciona msg do user + placeholder do assistant
      const userMsg: Message = { role: 'user', content: trimmed };
      const assistantPlaceholder: Message = { role: 'assistant', content: '' };
      const updatedHistory = [...messages, userMsg];
      setMessages([...updatedHistory, assistantPlaceholder]);

      // Limpa input
      setInput('');

      try {
        const response = await fetch('/api/agent/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: trimmed,
            contextPath,
            // Envia historico (excluindo o placeholder vazio)
            history: updatedHistory,
          }),
        });

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({ error: 'Falha de rede' }));
          throw new Error(errBody.error ?? 'Falha de rede');
        }

        if (!response.body) {
          throw new Error('Resposta sem body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // SSE: eventos separados por \n\n
          const events = buffer.split('\n\n');
          buffer = events.pop() ?? '';

          for (const eventBlock of events) {
            const lines = eventBlock.split('\n');
            const dataLine = lines.find((l) => l.startsWith('data: '));
            if (!dataLine) continue;

            try {
              const payload = JSON.parse(dataLine.slice('data: '.length));
              // Pipeline emite `{type:'delta', text}` e `{type:'done', sources}`
              // (vide packages/ai/src/types.ts AiStreamEvent). Estes tipos sao
              // o contrato — qualquer outro nome eh drift e quebra o chat.
              if (payload.type === 'delta' && typeof payload.text === 'string') {
                setMessages((prev) => {
                  const next = [...prev];
                  const last = next[next.length - 1];
                  if (last && last.role === 'assistant') {
                    next[next.length - 1] = {
                      ...last,
                      content: last.content + payload.text,
                    };
                  }
                  return next;
                });
              } else if (payload.type === 'done' && Array.isArray(payload.sources)) {
                setMessages((prev) => {
                  const next = [...prev];
                  const last = next[next.length - 1];
                  if (last && last.role === 'assistant') {
                    next[next.length - 1] = { ...last, sources: payload.sources };
                  }
                  return next;
                });
              } else if (payload.type === 'error') {
                throw new Error(payload.message ?? 'Erro do agente');
              }
            } catch (parseErr) {
              // Ignora linhas que nao sao JSON (event: end, etc)
              if (parseErr instanceof Error && parseErr.message !== 'Erro do agente') {
                continue;
              }
              throw parseErr;
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Falha desconhecida';
        setError(msg);
        // Remove o placeholder vazio
        setMessages((prev) => prev.filter((m, i) => !(i === prev.length - 1 && m.content === '')));
      } finally {
        setIsStreaming(false);
      }
    },
    [contextPath, isStreaming, messages],
  );

  // Auto-disparo se initialQuery foi passado e ainda nao temos messages.
  // Roda 1 vez no mount com initialQuery (state messages vazio inicialmente).
  // biome-ignore lint/correctness/useExhaustiveDependencies: dispara so 1x no mount com initialQuery
  useEffect(() => {
    if (initialQuery) {
      void send(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      void send(input);
    },
    [input, send],
  );

  return (
    <>
      {/* Mensagens */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minHeight: '200px',
          maxHeight: '50vh',
        }}
      >
        {messages.length === 0 ? (
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--colheita-text-tertiary)',
              textAlign: 'center',
              margin: 'auto',
            }}
          >
            Pergunte qualquer coisa sobre produtos, doses, registros MAPA — o agente conhece todo o
            catálogo Argho.
          </p>
        ) : (
          messages.map((msg, i) => <MessageBubble key={`m-${i}-${msg.role}`} message={msg} />)
        )}

        {error ? (
          <div
            role="alert"
            style={{
              fontSize: '0.75rem',
              color: 'var(--colheita-danger)',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        ) : null}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 14px',
          boxShadow: 'inset 0 1px 0 0 var(--colheita-border-subtle)',
          backgroundColor: 'var(--colheita-surface-muted)',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isStreaming ? 'Aguarde…' : 'Pergunte ao agente…'}
          disabled={isStreaming}
          aria-label="Mensagem para o agente"
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#ffffff',
            color: 'var(--colheita-text-primary)',
            fontSize: '0.8125rem',
            fontFamily: 'inherit',
            boxShadow: 'inset 0 0 0 1px var(--colheita-border)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={isStreaming || input.trim().length === 0}
          aria-label="Enviar"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'var(--colheita-brand-primary)',
            color: '#ffffff',
            cursor: isStreaming || input.trim().length === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isStreaming || input.trim().length === 0 ? 0.5 : 1,
            transition: 'opacity 150ms ease',
          }}
        >
          <Send size={14} strokeWidth={1.75} />
        </button>
      </form>
    </>
  );
}

// ── MessageBubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: isUser
            ? 'var(--colheita-surface-muted)'
            : 'var(--colheita-brand-primary-soft)',
          color: isUser ? 'var(--colheita-text-secondary)' : 'var(--colheita-brand-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '0.6875rem',
          fontWeight: 600,
        }}
      >
        {isUser ? <User size={11} strokeWidth={1.75} /> : 'A'}
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: '8px 12px',
          borderRadius: '10px',
          backgroundColor: isUser
            ? 'var(--colheita-brand-primary-soft)'
            : 'var(--colheita-surface-muted)',
          fontSize: '0.8125rem',
          lineHeight: 1.55,
          color: 'var(--colheita-text-primary)',
          letterSpacing: '-0.005em',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {message.content || (
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '14px',
              backgroundColor: 'var(--colheita-text-tertiary)',
              animation: 'blink 1s infinite',
              verticalAlign: 'text-bottom',
            }}
          />
        )}
        {message.sources && message.sources.length > 0 ? (
          <div
            style={{
              marginTop: '6px',
              paddingTop: '6px',
              borderTop: '1px solid var(--colheita-border-subtle)',
              fontSize: '0.6875rem',
              color: 'var(--colheita-text-tertiary)',
            }}
          >
            Fontes: {message.sources.length} chunks ·{' '}
            {message.sources.map((s) => s.kind).join(', ')}
          </div>
        ) : null}
      </div>
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
