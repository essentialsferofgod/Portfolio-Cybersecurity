import { defineConfig } from '@playwright/test';
import { PORTAS } from './tests/e2e/variantes.ts';

/**
 * Testes e2e sobre dist-verificacao/ (gerado por `npm run build:verificacao`).
 * Usa o Chrome instalado (channel: 'chrome'), sem baixar Chromium.
 * O servidor de teste aplica os cabeçalhos de vercel.json, inclusive a CSP.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { browserName: 'chromium', channel: 'chrome' },
  webServer: Object.entries(PORTAS).map(([variante, porta]) => ({
    command: `node scripts/servir.ts dist-verificacao/${variante} ${porta} --cabecalhos`,
    url: `http://localhost:${porta}/`,
    reuseExistingServer: false,
    stdout: 'ignore' as const,
  })),
});
