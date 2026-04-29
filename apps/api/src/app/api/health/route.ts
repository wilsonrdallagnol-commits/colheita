// apps/api/src/app/api/health/route.ts
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  return NextResponse.json(
    {
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      service: 'argho-api',
    },
    { status: 200 },
  );
}
