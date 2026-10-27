/**
 * Capturas da Fase 2: o comando `lab` no terminal e o CTA de um serviço.
 * Uso: node scripts/capturas-fase2.ts <pasta-de-saída> [url]
 */
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const [saida = 'capturas/fase2', url = 'http://localhost:4420/'] = process.argv.slice(2);
mkdirSync(saida, { recursive: true });
const navegador = await chromium.launch({ channel: 'chrome' });

for (const [largura, altura, rotulo] of [
  [1470, 889, 'desktop'],
  [390, 844, 'mobile'],
] as const) {
  const p = await navegador.newPage({ viewport: { width: largura, height: altura } });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);

  const campo = p.getByRole('combobox', { name: 'Comando' });
  await campo.focus();
  await p.keyboard.type('lab');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(1200);
  const foco = await p.evaluate(() => `${document.activeElement?.tagName} #${document.activeElement?.id}`);
  console.log(`${rotulo} · após "lab": scrollY=${await p.evaluate(() => Math.round(scrollY))}, foco=${foco}`);
  await p.screenshot({ path: `${saida}/${rotulo}-1-comando-lab.png` });

  await p.locator('#servicos').scrollIntoViewIfNeeded();
  // No mobile os detalhes ficam recolhidos em <details>.
  const resumo = p.locator('.servico').nth(2).locator('summary');
  if (await resumo.isVisible()) await resumo.click();
  const cta = p.locator('.servico').nth(2).locator('a.link-acao:visible').first();
  await cta.scrollIntoViewIfNeeded();
  await cta.click();
  await p.waitForTimeout(1200);
  const area = await p.locator('#f-area').inputValue().catch(() => '(sem campo)');
  const foco2 = await p.evaluate(() => `${document.activeElement?.tagName} #${document.activeElement?.id}`);
  console.log(`${rotulo} · após CTA do 3º serviço: área="${area}", foco=${foco2}`);
  await p.screenshot({ path: `${saida}/${rotulo}-2-cta-servico.png` });
  await p.close();
}
await navegador.close();
