/**
 * Capturas de tela para checkpoints, usando o Chrome instalado (sem baixar Chromium).
 * Requer o(s) servidor(es) rodando (ex.: npm run dev:completo).
 * Uso: node scripts/capturas.ts <pasta-de-saída> <rótulo=url>...
 * Ex.: node scripts/capturas.ts capturas/secoes completo=http://localhost:4321
 */
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const [saida = 'capturas', ...alvos] = process.argv.slice(2);
const ALVOS = (alvos.length ? alvos : ['pagina=http://localhost:4321']).map((alvo) => {
  const [rotulo, url] = alvo.split(/=(.*)/s) as [string, string];
  return { rotulo, url };
});

const LARGURAS = [
  { largura: 375, altura: 812 },
  { largura: 1440, altura: 900 },
];

async function aguardarServidor(url: string, tentativas = 60): Promise<void> {
  for (let i = 0; i < tentativas; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // servidor ainda subindo
    }
    await new Promise((resolver) => setTimeout(resolver, 1000));
  }
  throw new Error(`servidor não respondeu em ${url}`);
}

for (const { url } of ALVOS) await aguardarServidor(url);
mkdirSync(saida, { recursive: true });
const navegador = await chromium.launch({ channel: 'chrome' });

for (const { rotulo, url } of ALVOS) {
  for (const { largura, altura } of LARGURAS) {
    const pagina = await navegador.newPage({ viewport: { width: largura, height: altura }, deviceScaleFactor: 1 });
    await pagina.goto(url, { waitUntil: 'networkidle' });
    await pagina.evaluate(() => document.fonts.ready);
    const nome = `${saida}/${rotulo}-${largura}`;
    await pagina.screenshot({ path: `${nome}.png` });
    await pagina.screenshot({ path: `${nome}-pagina.png`, fullPage: true });
    const familias = await pagina.evaluate(() =>
      [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`),
    );
    console.log(`${nome}.png — fontes carregadas: ${familias.join(', ')}`);
    await pagina.close();
  }
}

await navegador.close();
