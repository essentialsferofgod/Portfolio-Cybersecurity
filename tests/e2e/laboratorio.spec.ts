/** Laboratório: arestas sólidas, propagação de comprometimento e topologia com segmento. */
import { expect, test, type Page } from '@playwright/test';
import { COMPLETO } from './variantes.ts';

async function abrirLab(pagina: Page): Promise<void> {
  await pagina.setViewportSize({ width: 1470, height: 889 });
  await pagina.goto(COMPLETO);
  await pagina.locator('[data-lab]').scrollIntoViewIfNeeded();
  await expect(pagina.locator('[data-lab]')).toHaveAttribute('data-fase', 'pronto', { timeout: 15000 });
}

function resumo(texto: string | null): { ativos: number; saltos: number } {
  const m = /(\d+) ativos? em (\d+) saltos?/.exec(texto ?? '');
  return { ativos: Number(m?.[1]), saltos: Number(m?.[2]) };
}

test('arestas terminam sólidas (sem tracejado) e com contraste do token --color-traco', async ({ page }) => {
  await abrirLab(page);
  const estilos = await page.locator('.lab-linhas line').evaluateAll((linhas) =>
    linhas.map((l) => `${getComputedStyle(l).strokeDasharray}|${getComputedStyle(l).opacity}`),
  );
  expect(estilos.length).toBeGreaterThan(10);
  expect(new Set(estilos)).toEqual(new Set(['none|1']));
});

test('selecionar um ativo propaga pela rede e o resumo só aparece no final', async ({ page }) => {
  await abrirLab(page);
  const alcance = page.locator('[data-campo="alcance"]');
  const comum = page.locator('.lab-no:not([data-segmento])').nth(1);
  await comum.click();
  // Logo após o clique o resumo ainda está vazio: o aria-live só recebe o final.
  await expect(alcance).toHaveText('');
  await expect(alcance).toHaveText(/\d+ ativos? em \d+ saltos?/);
  const { ativos, saltos } = resumo(await alcance.textContent());
  expect(ativos).toBe((await page.locator('.lab-no').count()) - 1);
  await expect(page.locator('.lab-no.alcancado')).toHaveCount(ativos);
  expect(await page.locator('.lab-linhas line.alcancada').count()).toBeGreaterThan(0);
  await expect(page.locator('[data-lab-log]')).toContainText(`${ativos} ativos em ${saltos} saltos`.toUpperCase(), {
    ignoreCase: true,
  });

  // "K saltos" é a distância até o ativo mais distante, e varia com a origem:
  // a partir do gateway a rede inteira fica mais perto do que a partir da ponta do segmento.
  await page.locator('.lab-no').first().click(); // gateway
  await expect(alcance).toHaveText(/\d+ ativos? em \d+ saltos?/);
  const doGateway = resumo(await alcance.textContent()).saltos;
  await page.locator('.lab-no[data-segmento]').first().click(); // ponta do segmento
  await expect(alcance).not.toHaveText('');
  await expect(alcance).toHaveText(/\d+ ativos? em \d+ saltos?/);
  expect(resumo(await alcance.textContent()).saltos).toBeGreaterThan(doGateway);
});

test('o segmento não tem ligação direta com o gateway', async ({ page }) => {
  await abrirLab(page);
  const segmento = await page.locator('.lab-no[data-segmento]').count();
  expect(segmento).toBe(5);
  // Cada aresta do gateway (índice 0) liga a um ativo fora do segmento.
  const ligadosAoGateway = await page.evaluate(() => {
    const botoes = [...document.querySelectorAll<HTMLElement>('.lab-no')];
    return [...document.querySelectorAll<SVGLineElement>('.lab-linhas line')]
      .filter((l) => l.dataset.de === '0' || l.dataset.para === '0')
      .map((l) => botoes[Number(l.dataset.de === '0' ? l.dataset.para : l.dataset.de)]?.dataset.segmento ?? 'nao');
  });
  expect(ligadosAoGateway.length).toBeGreaterThan(0);
  expect(ligadosAoGateway.every((s) => s === 'nao')).toBe(true);
});

test('com movimento reduzido, o caminho inteiro acende de uma vez', async ({ browser }) => {
  const contexto = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await contexto.newPage();
  await abrirLab(page);
  await page.locator('.lab-no').nth(3).click();
  const total = (await page.locator('.lab-no').count()) - 1;
  // No mesmo instante: todos acesos, atraso zerado e o resumo já presente.
  expect(await page.locator('.lab-no.alcancado').count()).toBe(total);
  const atrasos = await page.locator('.lab-no.alcancado').evaluateAll((nos) => [...new Set(nos.map((n) => getComputedStyle(n).transitionDelay))]);
  expect(atrasos.every((a) => a.split(',').every((v) => parseFloat(v) === 0))).toBe(true);
  await expect(page.locator('[data-campo="alcance"]')).toHaveText(/\d+ ativos? em \d+ saltos?/);
  await contexto.close();
});
