/** Metodologia fixada e guiada pela rolagem (≥ 64rem, sem movimento reduzido). */
import { expect, test, type Page } from '@playwright/test';
import { COMPLETO } from './variantes.ts';

const etapaAtiva = (p: Page) =>
  p.evaluate(() => [...document.querySelectorAll('.etapa')].findIndex((e) => e.classList.contains('etapa-ativa')) + 1);

test('desktop: palco preso, etapas em ordem ao rolar e altura de 2 a 4 telas', async ({ page }) => {
  await page.setViewportSize({ width: 1470, height: 889 });
  await page.goto(COMPLETO);
  const { topo, altura } = await page.locator('#abordagem').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { topo: r.top + scrollY, altura: r.height };
  });
  expect(altura / 889).toBeGreaterThan(2);
  expect(altura / 889).toBeLessThanOrEqual(4);
  await expect(page.locator('[data-palco]')).toHaveCSS('position', 'sticky');

  const vistas: number[] = [];
  for (const f of [0.05, 0.35, 0.65, 0.95]) {
    await page.evaluate((y) => window.scrollTo(0, y), topo + (altura - 889) * f);
    await page.waitForTimeout(250);
    vistas.push(await etapaAtiva(page));
  }
  expect(vistas).toEqual([1, 2, 3, 4]);
  // O cartão central digita o comando da etapa ativa.
  await expect(page.locator('[data-orbita-comando]')).toHaveText('cat etapa_04.md');
});

test('clicar numa etapa da lista rola até o ponto correspondente (mouse e teclado)', async ({ page }) => {
  await page.setViewportSize({ width: 1470, height: 889 });
  await page.goto(COMPLETO);
  await page.locator('#abordagem').scrollIntoViewIfNeeded();
  const botoes = page.locator('.etapa-botao');
  await botoes.nth(2).click();
  await expect.poll(() => etapaAtiva(page)).toBe(3);
  await expect(botoes.nth(2)).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect.poll(() => etapaAtiva(page)).toBe(4);
});

test('com movimento reduzido, a seção não fica presa', async ({ browser }) => {
  const contexto = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1470, height: 889 } });
  const page = await contexto.newPage();
  await page.goto(COMPLETO);
  await expect(page.locator('[data-palco]')).toHaveCSS('position', 'static');
  const altura = await page.locator('#abordagem').evaluate((el) => el.getBoundingClientRect().height);
  expect(altura).toBeLessThan(889 * 1.2);
  await contexto.close();
});

test('abaixo de 64rem: só a lista, sem órbita nem fixação', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(COMPLETO);
  await expect(page.locator('[data-orbita]')).toBeHidden();
  await expect(page.locator('[data-palco]')).toHaveCSS('position', 'static');
  await expect(page.locator('.etapa')).toHaveCount(4);
});
