/**
 * V11 (local) — com os cabeçalhos de vercel.json aplicados pelo servidor de teste,
 * nenhuma violação de CSP nem erro no console, em uso real (comandos, menu, 404).
 * Não substitui a checagem num deploy de preview da Vercel.
 */
import { expect, test } from '@playwright/test';
import { COMPLETO, VARIANTES } from './variantes.ts';

for (const { nome, url } of VARIANTES) {
  test(`${nome}: cabeçalhos presentes e 0 erros de CSP no console`, async ({ page }) => {
    const erros: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') erros.push(m.text());
    });
    page.on('pageerror', (e) => erros.push(e.message));

    const resposta = await page.goto(url);
    const cabecalhos = resposta!.headers();
    expect(cabecalhos['content-security-policy']).toContain("script-src 'self'");
    expect(cabecalhos['x-content-type-options']).toBe('nosniff');

    await page.setViewportSize({ width: 375, height: 812 });
    for (const chip of await page.locator('.chip').allTextContents()) {
      await page.locator('.chip', { hasText: chip.trim() }).click();
    }
    await page.getByRole('button', { name: 'menu' }).click();
    await page.keyboard.press('Escape');
    expect(erros).toEqual([]);
  });
}

test('404: 0 erros de CSP', async ({ page }) => {
  const erros: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().includes('404')) erros.push(m.text());
  });
  await page.goto(`${COMPLETO}nao-existe`);
  expect(erros).toEqual([]);
});
