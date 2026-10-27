/** V08 — sem JavaScript: todas as seções e os links de `help` continuam acessíveis. */
import { expect, test } from '@playwright/test';
import { VARIANTES } from './variantes.ts';

test.use({ javaScriptEnabled: false });

for (const { nome, url } of VARIANTES) {
  test(`${nome} sem JS: seções visíveis e índice do terminal como links`, async ({ page }) => {
    await page.goto(url);
    const terminal = page.locator('#terminal');
    await expect(terminal).toHaveAttribute('data-estado', 'sem-js');
    await expect(page.getByRole('combobox')).toBeHidden();
    await expect(terminal.locator('.chips')).toBeHidden();

    const ids = await page.locator('main section[id]:not(#terminal)').evaluateAll((s) => s.map((el) => el.id));
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) await expect(page.locator(`#${id}`)).toBeVisible();

    const atalhos = terminal.locator('.atalhos a');
    await expect(atalhos).toHaveCount(ids.filter((id) => id !== 'confianca').length);
    for (const href of await atalhos.evaluateAll((links) => links.map((a) => a.getAttribute('href')))) {
      await expect(page.locator(href!)).toBeVisible();
    }

    // Detalhes nativos funcionam sem JS.
    const resumo = page.locator('details summary').first();
    if (await resumo.isVisible()) {
      await resumo.click();
      await expect(page.locator('details').first()).toHaveAttribute('open', '');
    }
  });
}
