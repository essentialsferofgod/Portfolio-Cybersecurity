/**
 * Capturas da Fase 3 (propagação no laboratório) e posições dos nós, para comparar o
 * layout antes/depois. Uso: node scripts/capturas-fase3.ts <pasta-de-saída> [url]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium, type Page } from '@playwright/test';

const [saida = 'capturas/fase3', url = 'http://localhost:4420/'] = process.argv.slice(2);
mkdirSync(saida, { recursive: true });
const navegador = await chromium.launch({ channel: 'chrome' });

async function abrirLab(p: Page): Promise<void> {
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.locator('#laboratorio').scrollIntoViewIfNeeded();
  await p.waitForFunction(() => document.querySelector('[data-lab]')?.getAttribute('data-fase') === 'pronto', null, { timeout: 15000 });
  await p.locator('[data-lab]').evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 120));
  await p.waitForTimeout(300);
}

for (const [largura, altura, rotulo] of [
  [1470, 889, 'desktop'],
  [390, 844, 'mobile'],
] as const) {
  const p = await navegador.newPage({ viewport: { width: largura, height: altura } });
  await abrirLab(p);
  if (rotulo === 'desktop') {
    const posicoes = await p.locator('.lab-no').evaluateAll((nos) =>
      nos.map((n) => ({ rotulo: n.getAttribute('aria-label'), left: (n as HTMLElement).style.left, top: (n as HTMLElement).style.top })),
    );
    writeFileSync(`${saida}/posicoes.json`, JSON.stringify(posicoes, null, 2));
  }
  // Ativo do canto inferior direito (o mais distante do gateway no layout).
  const indice = await p.locator('.lab-no').evaluateAll((nos) => {
    let melhor = 0;
    let maior = -1;
    nos.forEach((n, i) => {
      const s = (n as HTMLElement).style;
      const soma = parseFloat(s.left) + parseFloat(s.top);
      if (soma > maior) {
        maior = soma;
        melhor = i;
      }
    });
    return melhor;
  });
  await p.locator('.lab-no').nth(indice).click();
  await p.waitForTimeout(250);
  await p.screenshot({ path: `${saida}/${rotulo}-1-propagando.png` });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${saida}/${rotulo}-2-alcance.png` });
  const inspetor = (await p.locator('.lab-inspetor').textContent())?.replace(/\s+/g, ' ').trim();
  console.log(`${rotulo} · inspetor: ${inspetor}`);
  await p.close();
}

const contexto = await navegador.newContext({ viewport: { width: 1470, height: 889 }, reducedMotion: 'reduce' });
const p = await contexto.newPage();
await abrirLab(p);
await p.locator('.lab-no').nth(5).click();
await p.screenshot({ path: `${saida}/desktop-3-movimento-reduzido.png` });
console.log('reduzido · acesos no mesmo instante:', await p.locator('.lab-no.alcancado').count());
await navegador.close();
