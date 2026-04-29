// packages/jobs/trigger.config.ts
/**
 * Configuração do projeto Trigger.dev v3 para o Colheita.
 *
 * Deploy: pnpm --filter @colheita/jobs deploy
 * Dev:    pnpm --filter @colheita/jobs dev
 *
 * Requer:
 *   TRIGGER_SECRET_KEY=tr_dev_... (projeto no Trigger.dev dashboard)
 *   TRIGGER_PROJECT_REF=proj_...
 */
import { defineConfig } from '@trigger.dev/sdk/v3';

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? 'proj_colheita',
  // Duração máxima global dos tasks em segundos (300s = 5min)
  maxDuration: 300,
  // Diretório onde os tasks estão definidos
  dirs: ['./src/jobs'],
  // Retry global padrão (cada task pode sobrescrever)
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1_000,
      maxTimeoutInMs: 30_000,
      factor: 2,
      randomize: true,
    },
  },
});
