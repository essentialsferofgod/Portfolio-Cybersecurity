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
  await expect(status).toContainText('09/10 faq');
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

test('comandos de seção conduzem a página; o link impresso continua como alternativa', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(COMPLETO);
  await page.locator('.chip', { hasText: 'lab' }).click();
  await expect(page.locator('#laboratorio-titulo')).toBeFocused();
  await expect(page.locator('#laboratorio-titulo')).toBeInViewport();
  await expect(page.locator('#linha-status')).toContainText('03/10 laboratório');
  await expect(page.getByRole('log').getByRole('link', { name: /abrir simulação em 03/ })).toHaveAttribute('href', '#laboratorio');

  // Voltar do navegador continua funcionando com os links da saída.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole('log').getByRole('link', { name: /abrir simulação em/ }).click();
  await expect(page).toHaveURL(/#laboratorio$/);
  await page.goBack();
  await expect(page).toHaveURL(COMPLETO);
});

test('com movimento reduzido, a navegação pelo terminal é instantânea', async ({ browser }) => {
  const contexto = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await contexto.newPage();
  await page.goto(COMPLETO);
  await page.locator('.chip', { hasText: 'faq' }).click();
  // Sem espera de animação: no mesmo instante o título já está focado e visível.
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('faq-titulo');
  await expect(page.locator('#faq-titulo')).toBeInViewport();
  await contexto.close();
});

test('CTA de um serviço leva ao formulário com a área de interesse pré-selecionada', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(COMPLETO);
  // No exemplo "completo", o 1º serviço tem destino "contato" (o 2º usa e-mail).
  const card = page.locator('.servico').nth(0);
  const titulo = (await card.locator('h3').textContent())!.trim();
  await card.locator('a.link-acao:visible').click();
  await expect(page.locator('#f-area')).toBeFocused();
  await expect(page.locator('#f-area')).toHaveValue(titulo);
  await expect(page.locator('#f-area')).toBeInViewport();
});
