/** V14 — com prefers-reduced-motion: reduce, nenhuma transição ou animação perceptível. */
import { expect, test, type Page } from '@playwright/test';
import { COMPLETO } from './variantes.ts';

async function duracoes(pagina: Page): Promise<string[]> {
  await pagina.locator('.chip', { hasText: 'services' }).click();
  await pagina.locator('#faq-1 summary').click();
  return pagina.evaluate(() =>
    [
      document.querySelector('.botao'),
      document.querySelector('.chip'),
      document.querySelector('.link-discreto'),
      document.querySelector('[role="log"] .bloco'),
      document.querySelector('#faq-1 .resposta'),
    ].map((el) => {
      const estilo = getComputedStyle(el!);
      return `${estilo.transitionDuration}|${estilo.animationDuration}`;
    }),
  );
}

test.describe('com movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('transições e animações ficam em 0s', async ({ page }) => {
    await page.goto(COMPLETO);
    for (const par of await duracoes(page)) {
      expect(par.split('|').every((d) => d.split(',').every((v) => parseFloat(v) === 0))).toBe(true);
    }
  });
});

test('sem preferência, as transições existem e duram até 200ms', async ({ page }) => {
  await page.goto(COMPLETO);
  const valores = (await duracoes(page)).flatMap((par) => par.split('|')).flatMap((d) => d.split(',').map(parseFloat));
  expect(valores.some((v) => v > 0)).toBe(true);
  expect(valores.every((v) => v <= 0.2)).toBe(true);
});
