/**
 * Capturas da Fase 4: a seção Metodologia em quatro pontos da rolagem, e a medição de
 * altura, fixação e etapa ativa. Uso: node scripts/capturas-fase4.ts <pasta> [url]
 */
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const [saida = 'capturas/fase4', url = 'http://localhost:4420/'] = process.argv.slice(2);
mkdirSync(saida, { recursive: true });
const navegador = await chromium.launch({ channel: 'chrome' });

for (const [largura, altura, rotulo] of [
  [1470, 889, 'desktop'],
  [390, 844, 'mobile'],
] as const) {
  const p = await navegador.newPage({ viewport: { width: largura, height: altura } });
  await p.goto(url, { waitUntil: 'networkidle' });
  const secao = p.locator('#abordagem');
  const caixa = await secao.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { topo: r.top + scrollY, altura: r.height };
  });
  console.log(`${rotulo} · altura da seção: ${Math.round(caixa.altura)}px (${(caixa.altura / altura).toFixed(2)} telas)`);
  const pontos = [0.05, 0.35, 0.65, 0.95];
  for (const [k, f] of pontos.entries()) {
    await p.evaluate((y) => window.scrollTo(0, y), caixa.topo + (caixa.altura - altura) * f);
    await p.waitForTimeout(900);
    const estado = await p.evaluate(() => {
      const ativa = [...document.querySelectorAll('.etapa')].findIndex((e) => e.classList.contains('etapa-ativa'));
      const orbita = document.querySelector<HTMLElement>('[data-orbita]');
      const visivel = orbita ? getComputedStyle(orbita).display !== 'none' : false;
      const palco = document.querySelector<HTMLElement>('.palco');
      return { ativa: ativa + 1, orbita: visivel, palcoTopo: palco ? Math.round(palco.getBoundingClientRect().top) : null };
    });
    console.log(`  ${Math.round(f * 100)}% · etapa ativa ${estado.ativa} · órbita ${estado.orbita ? 'visível' : 'oculta'} · topo do palco ${estado.palcoTopo}`);
    await p.screenshot({ path: `${saida}/${rotulo}-${k + 1}-progresso-${Math.round(f * 100)}.png` });
  }
  await p.close();
}
await navegador.close();
