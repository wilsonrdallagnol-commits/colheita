// packages/auth/src/server.test.ts
//
// Testa os helpers de servidor do @colheita/auth.
// Mocks necessários:
//   - @supabase/ssr  → createServerClient (faz chamadas HTTP reais)
//   - next/navigation → redirect (lança um erro especial do Next.js)
//
// O que NÃO é mockado: as funções de produção em si (getSession, getUser, requireAuth).

import { beforeEach, describe, expect, test, vi } from 'vitest';

// ── Mocks de dependências externas ───────────────────────────────────────────

const mockGetUser = vi.fn();
const mockGetSession = vi.fn();
const mockRedirect = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
      getSession: mockGetSession,
    },
  })),
}));

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Cookie store mínima que satisfaz ReadonlyRequestCookies */
function makeCookieStore(entries: Record<string, string> = {}) {
  return {
    getAll: () => Object.entries(entries).map(([name, value]) => ({ name, value })),
    get: (name: string) => {
      const value = entries[name];
      return value !== undefined ? { name, value } : undefined;
    },
    has: (name: string) => name in entries,
  } as never;
}

const MOCK_USER = {
  id: 'user-123',
  email: 'test@argho.local',
  aud: 'authenticated',
  role: 'authenticated',
};

const MOCK_SESSION = {
  access_token: 'mock-jwt',
  user: MOCK_USER,
};

// ── Importação das funções sob teste ─────────────────────────────────────────
// Importada DEPOIS dos mocks para que vi.mock() já esteja ativo.
const { getSession, getUser, requireAuth } = await import('./server.js');

// ── Testes ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

// ── getUser ───────────────────────────────────────────────────────────────────

describe('getUser', () => {
  test('retorna o usuário validado quando autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null });

    const result = await getUser(makeCookieStore());

    expect(result).toEqual(MOCK_USER);
    expect(mockGetUser).toHaveBeenCalledOnce();
  });

  test('retorna null quando não há sessão ativa', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await getUser(makeCookieStore());

    expect(result).toBeNull();
  });

  test('retorna null quando Supabase retorna erro de autenticação', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'JWT expired' },
    });

    const result = await getUser(makeCookieStore());

    expect(result).toBeNull();
  });

  test('usa os cookies do cookieStore para construir o cliente', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null });
    const cookieStore = makeCookieStore({ 'sb-access-token': 'abc123' });

    await getUser(cookieStore);

    // createServerClient deve ter sido chamado — o cookie store é passado a ele
    const { createServerClient } = await import('@supabase/ssr');
    expect(createServerClient).toHaveBeenCalled();
  });
});

// ── getSession ────────────────────────────────────────────────────────────────

describe('getSession', () => {
  test('retorna a sessão quando o cookie JWT existe', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: MOCK_SESSION },
      error: null,
    });

    const result = await getSession(makeCookieStore());

    expect(result).toEqual(MOCK_SESSION);
    expect(mockGetSession).toHaveBeenCalledOnce();
  });

  test('retorna null quando não há cookie de sessão', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    const result = await getSession(makeCookieStore());

    expect(result).toBeNull();
  });
});

// ── requireAuth ───────────────────────────────────────────────────────────────

describe('requireAuth', () => {
  test('retorna o usuário quando autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null });

    const result = await requireAuth(makeCookieStore());

    expect(result).toEqual(MOCK_USER);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  test('chama redirect("/login") quando não há usuário', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await requireAuth(makeCookieStore());

    expect(mockRedirect).toHaveBeenCalledOnce();
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  test('não redireciona quando o usuário está presente', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null });

    await requireAuth(makeCookieStore());

    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
