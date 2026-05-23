'use client';

// apps/portal/src/components/assistente/portal-chat-panel.tsx
//
// Painel de chat IA agronômica do PORTAL (distribuidor).
// Adapta apps/admin/src/components/assistente/admin-chat-panel.tsx com:
//   - Mensagem inicial direcionada a distribuidor (não admin Argho)
//   - SUGGESTED_QUERIES focadas em decisão de campo (dose, programa, compatibilidade)
//   - Mesma IA agronômica PhD via /api/agent/ask (system prompt em packages/ai/generator)

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
  error?: string;
}

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUERIES = [
  'Dose de Xcensis pra soja V3-V5 com déficit de Mn',
  'Posso misturar Defon com Operate Plus na mesma calda?',
  'Programa antiestresse pra café em pré-florada com calor',
  'Quando usar Stron em milho? Janela e dose',
  'Diferença entre Grow Filling e Grow MoB+ no enchimento',
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: '0',
    role: 'assistant',
    text: 'Olá. Sou o **Agrônomo Argho** — Doutor em Fertilidade de Solos, Fisiologia Vegetal e Biológicos. Posso te ajudar com **recomendação de produto por cultura/fase**, **compatibilidade de calda**, **janela fenológica**, **programa Argho integrado** (raiz → arquitetura → defesa → enchimento). Quanto mais info de campo você der (cultura, fase, sintoma, condição climática), mais precisa a resposta.',
  },
];

export function PortalChatPanel() {
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll quando nova mensagem
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-scroll quando messages array muda
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
      const res = await fetch('/api/agent/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          history: conversationHistory,
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

          // Parse SSE: separa por \n\n
          const lines = buffer.split('\n\n');
          buffer = lines.pop() ?? '';

          for (const block of lines) {
            const dataLine = block.split('\n').find((l) => l.startsWith('data:'));
            if (!dataLine) continue;
            const raw = dataLine.slice(5).trim();
            if (!raw || raw === '{}') continue;

            try {
              const event = JSON.parse(raw) as { type?: string; text?: string; message?: string };
              if (event.type === 'delta' && typeof event.text === 'string') {
                finalText += event.text;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, text: finalText } : m)),
                );
              } else if (event.type === 'error') {
                finalText = event.message ?? 'Erro processando resposta.';
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, text: finalText } : m)),
                );
              }
            } catch {
              // SSE comment, ignore
            }
          }
        }
      }

      // Atualiza histórico pra próxima rodada (até 10 turnos)
      setConversationHistory((prev) =>
        [
          ...prev,
          { role: 'user' as const, content: text },
          { role: 'assistant' as const, content: finalText },
        ].slice(-20),
      );
    } catch (err) {
      finalText = err instanceof Error ? err.message : 'Erro inesperado.';
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, text: finalText } : m)),
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleReset() {
    setMessages(INITIAL_MESSAGES);
    setConversationHistory([]);
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              maxWidth: m.role === 'user' ? '85%' : '100%',
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              padding: m.role === 'user' ? '10px 14px' : '0',
              borderRadius: m.role === 'user' ? 'var(--colheita-radius-md)' : '0',
              backgroundColor: m.role === 'user' ? 'var(--colheita-brand-primary)' : 'transparent',
              color: m.role === 'user' ? '#ffffff' : 'var(--colheita-text-primary)',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
            }}
          >
            {m.role === 'assistant' ? (
              m.text ? (
                <ChatMarkdown>{m.text}</ChatMarkdown>
              ) : (
                <span style={{ color: 'var(--colheita-text-tertiary)' }}>
                  <span className="dot-pulse" /> pensando…
                </span>
              )
            ) : (
              m.text
            )}
          </div>
        ))}

        {/* Sugestões aparecem só na 1ª mensagem (sem histórico) */}
        {messages.length === 1 && (
          <div style={{ marginTop: '12px' }}>
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--colheita-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '10px',
              }}
            >
              Exemplos pra começar
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {SUGGESTED_QUERIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    borderRadius: 'var(--colheita-radius-md)',
                    border: '1px solid var(--colheita-border)',
                    backgroundColor: 'var(--colheita-surface-elevated)',
                    color: 'var(--colheita-text-secondary)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--colheita-border-subtle)',
          backgroundColor: 'var(--colheita-surface)',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Descreva a situação de campo… ex: soja R2 com sintoma de deficiência de B"
            disabled={loading}
            rows={2}
            maxLength={1000}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--colheita-radius-md)',
              border: '1px solid var(--colheita-border)',
              backgroundColor: 'var(--colheita-surface-elevated)',
              color: 'var(--colheita-text-primary)',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              resize: 'none',
              minHeight: '50px',
              maxHeight: '160px',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              aria-label="Enviar"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--colheita-radius-md)',
                border: 'none',
                backgroundColor: input.trim()
                  ? 'var(--colheita-brand-primary)'
                  : 'var(--colheita-text-tertiary)',
                color: '#ffffff',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={16} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={loading || messages.length === 1}
              aria-label="Limpar conversa"
              title="Nova conversa"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--colheita-radius-md)',
                border: '1px solid var(--colheita-border)',
                backgroundColor: 'var(--colheita-surface-elevated)',
                color: 'var(--colheita-text-secondary)',
                cursor: messages.length === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RotateCcw size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
        <p
          style={{
            fontSize: '0.6875rem',
            color: 'var(--colheita-text-tertiary)',
            margin: '6px 0 0',
            textAlign: 'right',
          }}
        >
          {input.length}/1000 · Enter envia, Shift+Enter quebra linha
        </p>
      </div>

      <style>{`
        .dot-pulse {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--colheita-text-tertiary);
          margin-right: 6px;
          animation: dotPulse 1.2s ease-in-out infinite;
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
