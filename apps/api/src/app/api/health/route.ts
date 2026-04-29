// apps/api/src/app/api/health/route.ts
import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // nunca cachear health check

export async function GET(_request: NextRequest) {
  const start = Date.now();

  // Verifica conectividade com o banco
  let dbStatus: 'ok' | 'error' = 'error';
  let dbLatencyMs: number | null = null;

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const dbStart = Date.now();
    const { error } = await supabase.from('tenants').select('id').limit(1);
    dbLatencyMs = Date.now() - dbStart;
    if (!error) dbStatus = 'ok';
  } catch {
    // dbStatus permanece 'error'
  }

  const healthy = dbStatus === 'ok';

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      version: '1.0.0',
      service: 'argho-api',
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - start,
      checks: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
      },
    },
    { status: healthy ? 200 : 503 },
  );
}
