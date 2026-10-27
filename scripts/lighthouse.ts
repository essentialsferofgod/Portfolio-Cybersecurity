/**
 * V09 — Lighthouse (mobile e desktop) sobre o build de verificação servido localmente,
 * com os cabeçalhos de vercel.json. Usa o Chrome instalado.
 * Uso: node scripts/lighthouse.ts [variante]   (padrão: completo)
 * Relatórios JSON em test-results/lighthouse/.
 */
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';

const variante = process.argv[2] ?? 'completo';
const porta = 4410;
const url = `http://localhost:${porta}/`;
const saida = 'test-results/lighthouse';
const META = 95;

mkdirSync(saida, { recursive: true });
const servidor = spawn(process.execPath, ['scripts/servir.ts', `dist-verificacao/${variante}`, String(porta), '--cabecalhos'], {
  stdio: 'ignore',
});

for (let i = 0; i < 50; i++) {
  try {
    if ((await fetch(url)).ok) break;
  } catch {
    await new Promise((resolver) => setTimeout(resolver, 200));
  }
}

let abaixoDaMeta = 0;
try {
  for (const forma of ['mobile', 'desktop'] as const) {
    const arquivo = `${saida}/${variante}-${forma}.json`;
    spawnSync(
      `npx --no-install lighthouse ${url} --quiet --output=json --output-path=${arquivo} --chrome-flags="--headless=new" ${
        forma === 'desktop' ? '--preset=desktop' : ''
      }`,
      { shell: true, stdio: 'inherit' },
    );
    const relatorio = JSON.parse(readFileSync(arquivo, 'utf8')) as {
      categories: Record<string, { title: string; score: number | null }>;
      audits: Record<string, { numericValue?: number; displayValue?: string }>;
    };
    const notas = Object.values(relatorio.categories).map((c) => ({ titulo: c.title, nota: Math.round((c.score ?? 0) * 100) }));
    console.log(`\n${variante} · ${forma}`);
    for (const { titulo, nota } of notas) {
      if (nota < META) abaixoDaMeta++;
      console.log(`  ${titulo.padEnd(16)} ${String(nota).padStart(3)}${nota < META ? '  (abaixo da meta)' : ''}`);
    }
    for (const id of ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift']) {
      console.log(`  ${id.padEnd(26)} ${relatorio.audits[id]?.displayValue ?? '—'}`);
    }
  }
} finally {
  servidor.kill();
}

process.exit(abaixoDaMeta ? 1 : 0);
