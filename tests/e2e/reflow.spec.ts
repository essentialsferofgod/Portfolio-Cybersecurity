/** V07 — reflow a 320 px nas 3 variantes, inclusive com menu aberto e saída do terminal cheia. */
import { expect, test, type Page } from '@playwright/test';
import { VARIANTES, comandosAtivos } from './variantes.ts';

async function semRolagemHorizontal(pagina: Page): Promise<{ scrollWidth: number; innerWidth: number }> {
  return pagina.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth }));
}

for (const { nome, url } of VARIANTES) {
  test(`${nome} em 320px: scrollWidth ≤ innerWidth`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(url);
    let medida = await semRolagemHorizontal(page);
    expect(medida.scrollWidth).toBeLessThanOrEqual(medida.innerWidth);

    for (const comando of await comandosAtivos(page)) {
      if (comando !== 'clear') await page.locator('.chip', { hasText: comando }).click();
    }
    await page.locator('details summary').evaluateAll((resumos) => resumos.forEach((s) => (s as HTMLElement).click()));
    await page.getByRole('button', { name: 'menu' }).click();
    medida = await semRolagemHorizontal(page);
    expect(medida.scrollWidth).toBeLessThanOrEqual(medida.innerWidth);
  });
}
