import type { Page } from '@playwright/test';

export const PORTAS = { minimo: 4401, completo: 4402, extremo: 4403 } as const;

export type Variante = keyof typeof PORTAS;

export const VARIANTES = (Object.keys(PORTAS) as Variante[]).map((nome) => ({
  nome,
  url: `http://localhost:${PORTAS[nome]}/`,
}));

export const COMPLETO = `http://localhost:${PORTAS.completo}/`;

/** Comandos ativos, lidos do atributo que o terminal usa no cliente. */
export async function comandosAtivos(pagina: Page): Promise<string[]> {
  const dados = await pagina.locator('#terminal').getAttribute('data-comandos');
  return (JSON.parse(dados ?? '[]') as { nome: string }[]).map((c) => c.nome);
}
