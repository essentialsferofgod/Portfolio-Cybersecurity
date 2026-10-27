/** Navegação (seção 10): menu do celular, seção ativa e linha de status. */
import { expect, test } from '@playwright/test';
import { COMPLETO } from './variantes.ts';

test('menu do celular: abre, Esc fecha e devolve o foco ao botão', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(COMPLETO);
  const botao = page.getByRole('button', { name: 'menu' });
  const painel = page.locator('#menu-navegacao');
  await expect(botao).toHaveAttribute('aria-expanded', 'false');
  await expect(painel).toBeHidden();

  await botao.click();
  await expect(botao).toHaveAttribute('aria-expanded', 'true');
  await expect(painel).toBeVisible();
  await expect(painel.getByRole('link', { name: 'Falar com a equipe' })).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(painel.getByRole('link').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(painel).toBeHidden();
  await expect(botao).toHaveAttribute('aria-expanded', 'false');
  await expect(botao).toBeFocused();
});

test('menu do celular: escolher uma seção fecha o menu e leva à âncora', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(COMPLETO);
  await page.getByRole('button', { name: 'menu' }).click();
  await page.locator('#menu-navegacao').getByRole('link', { name: /Serviços/ }).click();
  await expect(page.locator('#menu-navegacao')).toBeHidden();
  await expect(page).toHaveURL(/#servicos$/);
});

test('seção ativa: aria-current no menu e linha de status em 1440px', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(COMPLETO);
  const status = page.locator('#linha-status');
  await expect(status).toBeHidden(); // no hero não há seção ativa

  await page.locator('#faq').evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 120));
  const linkFaq = page.locator('header nav').first().getByRole('link', { name: /faq/ });
  await expect(linkFaq).toHaveAttribute('aria-current', 'true');
  await expect(status).toContainText('05/06 faq');
  await expect(page.locator('[aria-current="true"]')).toHaveCount(2); // menu do desktop e painel do celular (oculto)

  await expect(status).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(linkFaq).not.toHaveAttribute('aria-current', 'true');
  await expect(status).toBeHidden();
});

test('linha de status não aparece abaixo de 1024px', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto(COMPLETO);
  await expect(page.locator('#linha-status')).toBeHidden();
});

test('o terminal não rola a página: links da saída usam âncoras e Voltar retorna', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(COMPLETO);
  const chip = page.locator('.chip', { hasText: 'services' });
  await chip.scrollIntoViewIfNeeded();
  const rolagem = await page.evaluate(() => scrollY);
  await chip.click();
  await expect(page.getByRole('log').locator('.bloco')).toHaveCount(1);
  expect(await page.evaluate(() => scrollY)).toBe(rolagem);
  await page.getByRole('log').getByRole('link', { name: /ver detalhes em 01/ }).click();
  await expect(page).toHaveURL(/#servicos$/);
  await page.goBack();
  await expect(page).toHaveURL(COMPLETO);
  expect(await page.evaluate(() => scrollY)).toBe(rolagem);
});
