/** V06 — teclado: Tab pela página, Enter/↓/→/Esc no terminal, Tab para sair. */
import { expect, test, type Page } from '@playwright/test';
import { COMPLETO, comandosAtivos } from './variantes.ts';

interface Parada {
  descricao: string;
  focoVisivel: boolean;
  encoberto: boolean;
}

/** Descreve o elemento focado: indicador visível e se está sob o cabeçalho ou a linha de status. */
async function paradaAtual(pagina: Page): Promise<Parada | null> {
  return pagina.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    const temAnel = (alvo: Element | null) => {
      if (!alvo) return false;
      const estilo = getComputedStyle(alvo);
      return estilo.outlineStyle !== 'none' && parseFloat(estilo.outlineWidth) >= 2;
    };
    const focoVisivel = temAnel(el) || temAnel(el.closest('.terminal-entrada'));
    let fixo = false;
    for (let a: Element | null = el; a; a = a.parentElement) {
      if (getComputedStyle(a).position === 'fixed') fixo = true;
    }
    const caixa = el.getBoundingClientRect();
    const cabecalho = document.querySelector('header')!.getBoundingClientRect().bottom;
    const status = document.getElementById('linha-status');
    const rodape = status && getComputedStyle(status).display !== 'none' ? status.getBoundingClientRect().top : innerHeight;
    // WCAG 2.4.11 (AA): o foco não pode ficar sob o cabeçalho fixo nem totalmente fora da área visível.
    // Um textarea alto pode ter a base abaixo da janela: o navegador rola só até o cursor de texto.
    const encoberto = !fixo && (caixa.top < cabecalho - 1 || caixa.top >= rodape);
    const texto = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return { descricao: `${el.tagName.toLowerCase()} "${texto}"`, focoVisivel, encoberto };
  });
}

for (const largura of [375, 1440]) {
  test(`Tab percorre a página em ${largura}px: foco sempre visível, nunca encoberto, sem armadilha`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 800 });
    await page.goto(COMPLETO);
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);

    const paradas: Parada[] = [];
    for (let i = 0; i < 300; i++) {
      await page.keyboard.press('Tab');
      const parada = await paradaAtual(page);
      if (!parada) break; // voltou ao documento: o ciclo terminou
      paradas.push(parada);
    }

    expect(paradas.length).toBeGreaterThan(10);
    expect(paradas.length).toBeLessThan(300);
    expect(paradas.some((p) => p.descricao.startsWith('input'))).toBe(true);
    expect(paradas.filter((p) => !p.focoVisivel).map((p) => p.descricao)).toEqual([]);
    expect(paradas.filter((p) => p.encoberto).map((p) => p.descricao)).toEqual([]);
  });
}

test('o campo do terminal nunca recebe foco no carregamento', async ({ page }) => {
  await page.goto(COMPLETO);
  await expect(page.getByRole('combobox', { name: 'Comando' })).not.toBeFocused();
});

test('terminal: ↓ escolhe, Enter executa, → completa, Esc fecha e limpa, Tab sai', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(COMPLETO);
  const campo = page.getByRole('combobox', { name: 'Comando' });
  const registro = page.getByRole('log');
  await campo.focus();
  const rolagemAntes = await page.evaluate(() => scrollY);

  await page.keyboard.type('serv');
  await expect(campo).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#terminal-sugestoes').getByRole('option')).toHaveCount(1);
  await page.keyboard.press('ArrowDown');
  await expect(campo).toHaveAttribute('aria-activedescendant', 'terminal-sugestao-services');
  await page.keyboard.press('Enter');
  await expect(registro.locator('.bloco').last()).toContainText('$ services');
  await expect(registro.locator('.bloco').last()).toContainText('3 serviços');
  await expect(campo).toHaveValue('');
  await expect(campo).toBeFocused();
  await expect(campo).toHaveAttribute('aria-expanded', 'false');
  expect(await page.evaluate(() => scrollY)).toBe(rolagemAntes);

  // "abo" também casa com approach (alias "abordagem"); "abou", só com about.
  await page.keyboard.type('abou');
  await expect(page.locator('#terminal-sugestoes').getByRole('option')).toHaveCount(1);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowRight');
  await expect(campo).toHaveValue('about');
  await page.keyboard.press('Enter');
  await expect(registro.locator('.bloco').last()).toContainText('ler mais em 06 / sobre');

  await page.keyboard.type('a');
  await expect(campo).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(campo).toHaveAttribute('aria-expanded', 'false');
  await expect(campo).toHaveValue('a');
  await page.keyboard.press('Escape');
  await expect(campo).toHaveValue('');

  await page.keyboard.press('Tab');
  await expect(campo).not.toBeFocused();
  await expect(page.locator('.chip').first()).toBeFocused();
});

test('todos os comandos ativos funcionam pelo teclado', async ({ page }) => {
  await page.goto(COMPLETO);
  const campo = page.getByRole('combobox', { name: 'Comando' });
  const registro = page.getByRole('log');
  for (const comando of await comandosAtivos(page)) {
    await campo.fill(comando);
    await campo.press('Enter');
    if (comando === 'clear') {
      await expect(registro.locator('.bloco')).toHaveCount(0);
    } else {
      await expect(registro.locator('.bloco').last().locator('.eco')).toHaveText(`$ ${comando}`);
      expect(await registro.locator('.bloco').last().locator('p, li').count()).toBeGreaterThan(1);
    }
  }
});

test('aliases com acento e maiúsculas executam o comando', async ({ page }) => {
  await page.goto(COMPLETO);
  const campo = page.getByRole('combobox', { name: 'Comando' });
  await campo.fill('  Serviços ');
  await campo.press('Enter');
  await expect(page.getByRole('log').locator('.bloco').last()).toContainText('3 serviços');
});

test('erro mostra a sugestão como botão e a menção a help', async ({ page }) => {
  await page.goto(COMPLETO);
  const campo = page.getByRole('combobox', { name: 'Comando' });
  await campo.fill('sevices');
  await campo.press('Enter');
  const bloco = page.getByRole('log').locator('.bloco').last();
  await expect(bloco.locator('.erro')).toHaveText('erro: comando não encontrado: "sevices"');
  await bloco.getByRole('button', { name: 'executar services' }).click();
  await expect(page.getByRole('log').locator('.bloco').last()).toContainText('3 serviços');
});

test('entrada vazia não faz nada', async ({ page }) => {
  await page.goto(COMPLETO);
  const campo = page.getByRole('combobox', { name: 'Comando' });
  await campo.fill('   ');
  await campo.press('Enter');
  await expect(page.getByRole('log').locator('.bloco')).toHaveCount(0);
});

test('chips ecoam o comando, a saída guarda 6 blocos e clear não perde o foco', async ({ page }) => {
  await page.goto(COMPLETO);
  const registro = page.getByRole('log');
  await page.locator('.chip', { hasText: 'faq' }).click();
  await expect(registro.locator('.eco').last()).toHaveText('$ faq');
  for (const chip of ['services', 'approach', 'about', 'contact', 'help', 'faq', 'services']) {
    await page.locator('.chip', { hasText: chip }).click();
  }
  await expect(registro.locator('.bloco')).toHaveCount(6);

  // clear disparado de dentro de um bloco que some: o foco vai para o campo, não para o vazio.
  await page.locator('.chip', { hasText: 'help' }).click();
  await registro.locator('.bloco').last().getByRole('button', { name: 'clear' }).click();
  await expect(registro.locator('.bloco')).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'Comando' })).toBeFocused();
});

test('links da saída são âncoras para seções e itens existentes', async ({ page }) => {
  await page.goto(COMPLETO);
  await page.locator('.chip', { hasText: 'faq' }).click();
  const hrefs = await page.getByRole('log').locator('a').evaluateAll((links) => links.map((a) => a.getAttribute('href')));
  expect(hrefs).toEqual(['#faq-1', '#faq-2', '#faq-3', '#faq']);
  for (const href of hrefs) await expect(page.locator(href!)).toHaveCount(1);
});
