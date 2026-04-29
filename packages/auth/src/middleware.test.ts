// packages/auth/src/middleware.test.ts
//
// Testa o helper de middleware do @colheita/auth.
// Mocks necessários:
//   - @supabase/ssr    → createServerClient (faz chamadas HTTP reais)
//   - next/server      → NextResponse (métodos estáticos next/redirect)
//
// O que NÃO é mockado: a função de produção updateSession.

import { beforeEach, describe, expect, test, vi } from 'vitest';

// ── Mocks de dependências externas ───────────────────────────────────────────

const mockGetUser = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

/** Resposta fake que satisfaz o contrato mínimo de NextResponse */
function makeMockResponse() {
  return { cookies: { set: vi.fn() } };
}

const mockResponseNext = makeMockResponse();
const mockResponseRedirect = makeMockResponse();

const mockNextResponseNext = vi.fn().mockReturnValue(mockResponseNext);
const mockNextResponseRedirect = vi.fn().mockReturnValue(mockResponseRedirect);

vi.mock('next/server', () => ({
  NextResponse: {
    next: mockNextResponseNext,
    redirect: mockNextResponseRedirect,
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Cria um objeto que satisfaz o contrato mínimo de NextRequest usado por
 * updateSession: `url`, `nextUrl.pathname`, `cookies.getAll()` e
 * `cookies.set()`.
 */
function makeRequest(url: string, cookies: Record<string, string> = {}) {
  const cookieList = Object.entries(cookies).map(([name, value]) => ({ name, value }));
  return {
    url,
    nextUrl: new URL(url),
    cookies: {
      getAll: () => cookieList,
      set: vi.fn(),
    },
  } as never;
}

const MOCK_USER = {
  id: 'user-123',
  email: 'test@argho.local',
  aud: 'authenticated',
  role: 'authenticated',
};

// ── Importação da função sob teste ────────────────────────────────────────────
// Importada DEPOIS dos mocks para que vi.mock() já esteja ativo.
const { updateSession } = await import('./middleware.js');

// ── Testes ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockNextResponseNext.mockReturnValue(makeMockResponse());
  mockNextResponseRedirect.mockReturnValue(makeMockResponse());
});

// ── Rotas públicas ────────────────────────────────────────────────────────────

describe('rotas públicas (sem autenticação)', () => {
  test('permite /login mesmo sem usuário autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await updateSession(makeRequest('http://localhost:3000/login'));

    expect(mockNextResponseRedirect).not.toHaveBeenCalled();
    // Deve retornar a resposta gerada por NextResponse.next()
    expect(mockNextResponseNext).toHaveBeenCalled();
    expect(response).toBeDefined();
  });

  test('permite /auth/callback mesmo sem usuário autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await updateSession(makeRequest('http://localhost:3000/auth/callback'));

    expect(mockNextResponseRedirect).not.toHaveBeenCalled();
  });

  test('permite /auth/callback/qualquer-sub-rota sem autenticação', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await updateSession(makeRequest('http://localhost:3000/auth/callback?code=abc'));

    expect(mockNextResponseRedirect).not.toHaveBeenCalled();
  });
});

// ── Rotas protegidas sem usuário ──────────────────────────────────────────────

describe('rotas protegidas sem usuário autenticado', () => {
  test('redireciona /produtos para /login quando não há sessão', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await updateSession(makeRequest('http://localhost:3000/produtos'));

    expect(mockNextResponseRedirect).toHaveBeenCalledOnce();
    const redirectUrl: URL = mockNextResponseRedirect.mock.calls[0]?.[0] as URL;
    expect(redirectUrl.pathname).toBe('/login');
  });

  test('redireciona /dashboard para /login quando não há sessão', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await updateSession(makeRequest('http://localhost:3000/dashboard'));

    expect(mockNextResponseRedirect).toHaveBeenCalledOnce();
    const redirectUrl: URL = mockNextResponseRedirect.mock.calls[0]?.[0] as URL;
    expect(redirectUrl.pathname).toBe('/login');
  });

  test('redireciona a raiz / para /login quando não há sessão', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await updateSession(makeRequest('http://localhost:3000/'));

    expect(mockNextResponseRedirect).toHaveBeenCalledOnce();
  });
});

// ── Rotas com usuário autenticado ─────────────────────────────────────────────

describe('usuário autenticado', () => {
  test('redireciona /login para / (dashboard) quando o usuário já está logado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null });

    await updateSession(makeRequest('http://localhost:3000/login'));

    expect(mockNextResponseRedirect).toHaveBeenCalledOnce();
    const redirectUrl: URL = mockNextResponseRedirect.mock.calls[0]?.[0] as URL;
    expect(redirectUrl.pathname).toBe('/');
  });

  test('permite acesso a /produtos quando o usuário está autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null });

    await updateSession(makeRequest('http://localhost:3000/produtos'));

    expect(mockNextResponseRedirect).not.toHaveBeenCalled();
  });

  test('não redireciona /dashboard quando o usuário está autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null });

    await updateSession(makeRequest('http://localhost:3000/dashboard'));

    expect(mockNextResponseRedirect).not.toHaveBeenCalled();
  });
});

// ── Propagação de cookies ─────────────────────────────────────────────────────

describe('propagação de cookies do Supabase', () => {
  test('cria o cliente Supabase passando os cookies da requisição', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null });
    const request = makeRequest('http://localhost:3000/produtos', {
      'sb-access-token': 'some-jwt',
    });

    await updateSession(request);

    const { createServerClient } = await import('@supabase/ssr');
    expect(createServerClient).toHaveBeenCalledOnce();
    // O cookie store passado a createServerClient deve ler os cookies da request
    // biome-ignore lint/style/noNonNullAssertion: toHaveBeenCalledOnce() garante que calls[0] existe
    const cookieHandlers = (createServerClient as ReturnType<typeof vi.fn>).mock.calls[0]![2]
      .cookies;
    expect(cookieHandlers.getAll()).toEqual([{ name: 'sb-access-token', value: 'some-jwt' }]);
  });
});
