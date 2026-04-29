// packages/jobs/src/jobs/gerar-ficha-tecnica.ts
/**
 * Job: gerar-ficha-tecnica
 *
 * Gera PDF da ficha técnica de um produto via @colheita/generator (Playwright).
 * Jobs longos (até 5min) sem hacks de timeout HTTP.
 *
 * Fase 1: Retorna o HTML e tamanho do PDF.
 * Fase 2: Fará upload automático para Supabase Storage e criará asset no DB.
 */
import type { FichaTecnicaData } from '@colheita/generator';
import { generateFichaTecnica } from '@colheita/generator';
import { task } from '@trigger.dev/sdk/v3';
import { z } from 'zod';

// ─── Payload schema ────────────────────────────────────────────────────────────

const packagingUnitSchema = z.object({
  type: z.enum(['bag', 'ibc', 'drum', 'bottle', 'other']),
  weightKg: z.number().positive().optional(),
  volumeL: z.number().positive().optional(),
  sku: z.string().optional(),
});

const productApplicationSchema = z.object({
  crop: z.string(),
  stage: z.string().optional(),
  dosePerHa: z.number().positive(),
  unit: z.enum(['kg', 'l', 'g', 'ml']),
  notes: z.string().optional(),
});

const compositionSchema = z.object({
  macros: z.record(z.string(), z.number()).optional(),
  micros: z.record(z.string(), z.number()).optional(),
  others: z.record(z.string(), z.number()).optional(),
});

export const gerarFichaTecnicaPayloadSchema = z.object({
  /** ID do produto no banco (para logging/rastreio) */
  productId: z.string().uuid(),
  /** ID do tenant */
  tenantId: z.string().uuid(),
  /** Dados completos para o template FichaTecnica */
  fichaTecnica: z.object({
    productName: z.string().min(1),
    tagline: z.string().optional(),
    description: z.string().optional(),
    composition: compositionSchema,
    technicalSpecs: z.record(z.string(), z.unknown()).default({}),
    packaging: z.array(packagingUnitSchema).default([]),
    applications: z.array(productApplicationSchema).default([]),
    tenantName: z.string(),
    tenantLogoUrl: z.string().url().optional(),
    mapaRegistration: z.string().optional(),
    year: z.number().int().optional(),
  }),
});

export type GerarFichaTecnicaPayload = z.infer<typeof gerarFichaTecnicaPayloadSchema>;

// ─── Task ─────────────────────────────────────────────────────────────────────

export const gerarFichaTecnicaJob = task({
  id: 'gerar-ficha-tecnica',

  // PDF generation pode demorar; 2 tentativas com intervalo maior
  retry: {
    maxAttempts: 2,
    minTimeoutInMs: 5_000,
    maxTimeoutInMs: 60_000,
    factor: 2,
    randomize: false,
  },

  // Playwright precisa de memória suficiente
  machine: { preset: 'medium-1x' },

  run: async (rawPayload: unknown): Promise<{ html: string; pdfSizeBytes: number }> => {
    const { fichaTecnica } = gerarFichaTecnicaPayloadSchema.parse(rawPayload);

    const data: FichaTecnicaData = fichaTecnica;

    const { pdf, html } = await generateFichaTecnica(data);

    // Fase 2: fazer upload do pdf para Supabase Storage e criar asset no DB.
    // Por ora, retornamos o HTML e tamanho do PDF para confirmação.
    return { html, pdfSizeBytes: pdf.length };
  },
});
