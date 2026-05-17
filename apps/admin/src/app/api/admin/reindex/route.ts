// apps/admin/src/app/api/admin/reindex/route.ts
//
// Dispara a indexação de embeddings (produtos + lições) no pgvector.
// Usa as env vars JÁ configuradas no Vercel (SUPABASE_SERVICE_ROLE_KEY +
// OPENAI_API_KEY/VOYAGE_API_KEY) — sem precisar de credenciais locais.
//
// Idempotente: o retriever faz upsert por (documentId, chunkType).
// Pode ser re-chamado com segurança (ex: após adicionar produtos novos).

import {
  buildLessonChunk,
  buildProductChunks,
  type LessonRow,
  OpenAIEmbeddingProvider,
  type ProductRow,
  SupabaseVectorRetriever,
  VoyageEmbeddingProvider,
} from '@colheita/ai';
import { createAdminClient, requireAuth } from '@colheita/auth';
import { captureError } from '@colheita/observability';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Indexação pode levar alguns segundos (chamadas à API de embeddings).
// 60s cobre o catálogo Argho atual (~25 chunks) com folga.
export const maxDuration = 60;

export async function POST() {
  const cookieStore = await cookies();

  try {
    await requireAuth(cookieStore);
  } catch {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  // Provider de embedding — Voyage tem prioridade, OpenAI fallback
  const hasVoyage = Boolean(process.env.VOYAGE_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  if (!hasVoyage && !hasOpenAI) {
    return NextResponse.json(
      {
        error:
          'Nenhum provider de embedding configurado. Defina VOYAGE_API_KEY ou OPENAI_API_KEY no Vercel.',
      },
      { status: 503 },
    );
  }

  const provider = hasVoyage ? new VoyageEmbeddingProvider() : new OpenAIEmbeddingProvider();

  try {
    const admin = createAdminClient();
    const retriever = new SupabaseVectorRetriever(admin, provider);

    // ── Produtos ──────────────────────────────────────────────────────────
    const { data: products, error: prodErr } = await admin
      .from('products')
      .select('id, tenant_id, name, tagline, description, composition, applications')
      .is('deleted_at', null)
      .order('name');

    if (prodErr) {
      throw new Error(`fetch produtos: ${prodErr.message}`);
    }

    const productChunks = (products ?? []).flatMap((p) =>
      buildProductChunks(p as unknown as ProductRow),
    );
    if (productChunks.length > 0) {
      await retriever.index(productChunks);
    }

    // ── Lições ────────────────────────────────────────────────────────────
    const { data: lessons, error: lessErr } = await admin
      .from('learning_lessons')
      .select('id, tenant_id, title, content')
      .order('title');

    if (lessErr) {
      throw new Error(`fetch lições: ${lessErr.message}`);
    }

    const lessonChunks = (lessons ?? [])
      .map((l) => buildLessonChunk(l as unknown as LessonRow))
      .filter((chunk) => chunk.text.trim().length > 0);
    if (lessonChunks.length > 0) {
      await retriever.index(lessonChunks);
    }

    return NextResponse.json({
      ok: true,
      provider: hasVoyage ? 'voyage' : 'openai',
      products: products?.length ?? 0,
      productChunks: productChunks.length,
      lessons: lessons?.length ?? 0,
      lessonChunks: lessonChunks.length,
      totalChunks: productChunks.length + lessonChunks.length,
    });
  } catch (err) {
    captureError(err instanceof Error ? err : new Error(String(err)), {
      context: 'admin.api.reindex',
    });
    return NextResponse.json(
      { error: `Falha na indexação: ${err instanceof Error ? err.message : 'erro'}` },
      { status: 500 },
    );
  }
}
