/** V05 — axe via Playwright em 375 e 1440 px, nas 3 variantes e nos estados interativos. */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { COMPLETO, VARIANTES } from './variantes.ts';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

async function analisar(pagina: Page, rotulo: string): Promise<string[]> {
  // As entradas animadas começam transparentes; o contraste é avaliado no estado final.
  await pagina.evaluate(async () => {
    document.querySelectorAll('[data-revelar]').forEach((el) => el.classList.add('revelado'));
    await new Promise((r) => requestAnimationFrame(r));
    // Espera transições e animações finitas (entradas, digitação) chegarem ao estado final.
    await Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    );
  });
  const { violations } = await new AxeBuilder({ page: pagina }).withTags(TAGS).analyze();
  for (const v of violations) {
    console.log(`[axe] ${rotulo}: ${v.impact} ${v.id} (${v.nodes.length}) — ${v.help}`);
  }
  return violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.impact} ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

for (const { nome, url } of VARIANTES) {
  for (const largura of [375, 1440]) {
    test(`${nome} em ${largura}px: 0 violações serious/critical`, async ({ page }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.goto(url);
      expect(await analisar(page, `${nome} ${largura}px`)).toEqual([]);
    });
  }
}

test('estados interativos (saída do terminal, sugestões, erro, detalhes) em 1440px', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(COMPLETO);
  const campo = page.getByRole('combobox', { name: 'Comando' });
  for (const comando of ['services', 'faq', 'contact', 'sevices']) {
    await campo.fill(comando);
    await campo.press('Enter');
  }
  await campo.fill('a');
  await campo.press('ArrowDown');
  await page.locator('#faq-1 summary').click();
  expect(await analisar(page, 'estados interativos')).toEqual([]);
});

test('menu aberto e detalhes de serviço em 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(COMPLETO);
  await page.locator('#servicos details summary').first().click();
  await page.getByRole('button', { name: 'menu' }).click();
  expect(await analisar(page, 'menu aberto 375px')).toEqual([]);
});

test('página 404', async ({ page }) => {
  await page.goto(`${COMPLETO}caminho-que-nao-existe`);
  await expect(page.getByText('erro 404: caminho não encontrado')).toBeVisible();
  expect(await analisar(page, '404')).toEqual([]);
});
