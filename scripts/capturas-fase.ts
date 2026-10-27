/**
 * Capturas de comparação por fase (antes/depois), no build servido em `url`.
 * Uso: node scripts/capturas-fase.ts <pasta-de-saída> [url]
 */
import { mkdirSync } from 'node:fs';
import { chromium, type Page } from '@playwright/test';

const [saida = 'capturas/fase', url = 'http://localhost:4420/'] = process.argv.slice(2);
mkdirSync(saida, { recursive: true });

async function ir(pagina: Page, seletor: string, folga = 90): Promise<void> {
  await pagina.locator(seletor).evaluate((el, f) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - f), folga);
  await pagina.waitForTimeout(1800);
}

const navegador = await chromium.launch({ channel: 'chrome' });

for (const [largura, altura, rotulo] of [
  [1470, 889, 'desktop'],
  [390, 844, 'mobile'],
] as const) {
  const p = await navegador.newPage({ viewport: { width: largura, height: altura } });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(4200);
  await p.screenshot({ path: `${saida}/${rotulo}-1-hero.png` });

  await ir(p, '#problema');
  await p.screenshot({ path: `${saida}/${rotulo}-2-problema-status.png` });

  await ir(p, '#laboratorio');
  await p.waitForTimeout(3500);
  await ir(p, '[data-lab]', 120);
  await p.screenshot({ path: `${saida}/${rotulo}-3-lab-rede.png` });
  await p.locator('[data-visao="exposicao"]').click();
  await p.locator('.lab-no').first().click();
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${saida}/${rotulo}-4-lab-exposicao.png` });

  await ir(p, '#principios');
  await p.screenshot({ path: `${saida}/${rotulo}-5-principios-status.png` });

  await ir(p, '#depoimentos');
  await p.screenshot({ path: `${saida}/${rotulo}-6-depoimentos.png` });

  await p.evaluate(() => window.scrollTo(0, document.querySelector('.numeros')!.getBoundingClientRect().top + scrollY - 200));
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `${saida}/${rotulo}-7-numeros.png` });
  await p.close();
}

const p = await navegador.newPage();
await p.goto(url);
const meta = await p.evaluate(() => ({
  title: document.title,
  description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
  ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? null,
  canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
  favicon: document.querySelector('link[rel="icon"]')?.getAttribute('href'),
}));
console.log(JSON.stringify(meta, null, 2));
await navegador.close();
