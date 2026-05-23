// apps/portal/src/lib/unread-notifs.test.ts
//
// Tests da função pura notifsTag (helper de invalidação de cache).
// getUnreadNotifsCount não é testado aqui — depende de Supabase real
// e cache do Next runtime. Cobertura via teste e2e em outra sprint.

import { describe, expect, it } from 'vitest';
import { notifsTag } from './unread-notifs';

describe('notifsTag', () => {
  it('gera tag previsível a partir do user_id', () => {
    expect(notifsTag('abc-123')).toBe('notif:abc-123');
  });

  it('preserva UUID format completo', () => {
    expect(notifsTag('550e8400-e29b-41d4-a716-446655440000')).toBe(
      'notif:550e8400-e29b-41d4-a716-446655440000',
    );
  });

  it('aceita strings com caracteres especiais sem escape', () => {
    // Não escapamos — caller é responsável por passar IDs válidos.
    // Em produção sempre vem do JWT auth.uid() que é UUID v4.
    expect(notifsTag('user@email.com')).toBe('notif:user@email.com');
  });

  it('é determinístico (mesmo input → mesma tag)', () => {
    const tag1 = notifsTag('xyz');
    const tag2 = notifsTag('xyz');
    expect(tag1).toBe(tag2);
  });

  it('tags diferentes pra users diferentes (invalidacao não cross-user)', () => {
    expect(notifsTag('user-a')).not.toBe(notifsTag('user-b'));
  });

  it('aceita string vazia (degenerate, mas não quebra)', () => {
    expect(notifsTag('')).toBe('notif:');
  });
});
