/**
 * Lógica pura do terminal de navegação (seção 9): normalização, correspondência,
 * sugestão e geração de saída. Sem acesso ao DOM; coberta por tests/terminal.test.ts.
 * Só importa tipos, para não levar dados nem o Zod ao JavaScript do cliente.
 */
import type { SecaoNumerada } from '../content/comandos.ts';

export interface ComandoBasico {
  nome: string;
  aliases: readonly string[];
  descricao: string;
}

/** Remove espaços nas pontas, passa para minúsculas e remove acentos (NFD). */
export function normalizar(entrada: string): string {
  return entrada
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Distância de edição de Levenshtein. */
export function distancia(a: string, b: string): number {
  let anterior = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const atual = [i];
    for (let j = 1; j <= b.length; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      atual[j] = Math.min(anterior[j]! + 1, atual[j - 1]! + 1, anterior[j - 1]! + custo);
    }
    anterior = atual;
  }
  return anterior[b.length]!;
}

function termos(comando: ComandoBasico): string[] {
  return [comando.nome, ...comando.aliases];
}

export type Resolucao<T extends ComandoBasico> =
  | { tipo: 'vazio' }
  | { tipo: 'executar'; comando: T }
  | { tipo: 'erro'; entrada: string; sugestao: T | null };

export const DISTANCIA_MAXIMA = 2;
export const MINIMO_PARA_SUGERIR = 3;

/** Comando com menor distância de edição, até DISTANCIA_MAXIMA; em empate, vale a ordem do registro. */
export function sugerir<T extends ComandoBasico>(normalizada: string, comandos: readonly T[]): T | null {
  let melhor: T | null = null;
  let menor = Infinity;
  for (const comando of comandos) {
    for (const termo of termos(comando)) {
      const d = distancia(normalizada, termo);
      if (d < menor) {
        menor = d;
        melhor = comando;
      }
    }
  }
  return menor <= DISTANCIA_MAXIMA ? melhor : null;
}

export function resolver<T extends ComandoBasico>(entrada: string, comandos: readonly T[]): Resolucao<T> {
  const normalizada = normalizar(entrada);
  if (!normalizada) return { tipo: 'vazio' };
  const exato = comandos.find((c) => termos(c).includes(normalizada));
  if (exato) return { tipo: 'executar', comando: exato };
  const sugestao = normalizada.length >= MINIMO_PARA_SUGERIR ? sugerir(normalizada, comandos) : null;
  return { tipo: 'erro', entrada: entrada.trim(), sugestao };
}

/** Sugestões enquanto o visitante digita: primeiro por prefixo, depois por trecho; até `limite`. */
export function filtrar<T extends ComandoBasico>(entrada: string, comandos: readonly T[], limite = 5): T[] {
  const normalizada = normalizar(entrada);
  if (!normalizada) return [];
  const porPrefixo = comandos.filter((c) => termos(c).some((t) => t.startsWith(normalizada)));
  const porTrecho = comandos.filter((c) => !porPrefixo.includes(c) && termos(c).some((t) => t.includes(normalizada)));
  return [...porPrefixo, ...porTrecho].slice(0, limite);
}

// ---------------------------------------------------------------------------
// Geração de saída (usada no build para montar os <template> de cada comando)
// ---------------------------------------------------------------------------

export interface ItemSaida {
  indice?: string;
  rotulo?: string;
  texto: string;
  /** `null` quando o destino ainda é uma pendência. */
  href?: string | null;
  externo?: boolean;
}

export type LinhaSaida =
  | { tipo: 'texto'; texto: string; suave?: boolean }
  | { tipo: 'itens'; itens: ItemSaida[] }
  | { tipo: 'link'; texto: string; href: string }
  | { tipo: 'comandos'; comandos: { nome: string; descricao: string }[] };

export interface ContextoSaida {
  comandos: readonly ComandoBasico[];
  secoes: readonly SecaoNumerada[];
  servicos: readonly { titulo: string }[];
  abordagem: readonly { etapa: string }[];
  sobre?: string | undefined;
  faq: readonly { pergunta: string }[];
  canais: readonly { rotulo: string; exibicao: string; href: string | null; externo: boolean }[];
}

const indice = (i: number) => String(i + 1).padStart(2, '0');
const plural = (n: number, singular: string, varios: string) => `${n} ${n === 1 ? singular : varios}`;

/** Primeira frase do texto, com no máximo `limite` caracteres. */
export function primeiraFrase(texto: string, limite = 200): string {
  const frase = (/^(.+?[.!?][\])"'»”]*)(\s|$)/s.exec(texto.trim())?.[1] ?? texto.trim()).replace(/\s+/g, ' ');
  if (frase.length <= limite) return frase;
  const corte = frase.slice(0, limite - 1);
  return `${corte.slice(0, Math.max(corte.lastIndexOf(' '), limite * 0.6)).trimEnd()}…`;
}

const SECAO_DO_COMANDO: Record<string, SecaoNumerada['id']> = {
  services: 'servicos',
  approach: 'abordagem',
  about: 'sobre',
  faq: 'faq',
  contact: 'contato',
};

export function gerarSaida(nome: string, ctx: ContextoSaida): LinhaSaida[] {
  if (nome === 'help') {
    return [
      { tipo: 'texto', texto: 'comandos disponíveis', suave: true },
      { tipo: 'comandos', comandos: ctx.comandos.map(({ nome, descricao }) => ({ nome, descricao })) },
    ];
  }

  const idSecao = SECAO_DO_COMANDO[nome];
  const secao = ctx.secoes.find((s) => s.id === idSecao);
  if (!secao) return [];
  const destino = (verbo: string): LinhaSaida => ({
    tipo: 'link',
    texto: `${verbo} em ${secao.numero} / ${secao.rotulo}`,
    href: `#${secao.id}`,
  });

  switch (nome) {
    case 'services':
      return [
        { tipo: 'texto', texto: plural(ctx.servicos.length, 'serviço', 'serviços') },
        { tipo: 'itens', itens: ctx.servicos.map((s, i) => ({ indice: indice(i), texto: s.titulo })) },
        destino('ver detalhes'),
      ];
    case 'approach':
      return [
        { tipo: 'texto', texto: plural(ctx.abordagem.length, 'etapa', 'etapas') },
        { tipo: 'itens', itens: ctx.abordagem.map((e, i) => ({ indice: indice(i), texto: e.etapa })) },
        destino('ver como funciona'),
      ];
    case 'about':
      return [{ tipo: 'texto', texto: primeiraFrase(ctx.sobre ?? '') }, destino('ler mais')];
    case 'faq':
      return [
        { tipo: 'texto', texto: plural(ctx.faq.length, 'pergunta', 'perguntas') },
        {
          tipo: 'itens',
          itens: ctx.faq.map((p, i) => ({ indice: indice(i), texto: p.pergunta, href: `#faq-${i + 1}` })),
        },
        destino('ver respostas'),
      ];
    case 'contact':
      return [
        { tipo: 'texto', texto: plural(ctx.canais.length, 'canal', 'canais') },
        {
          tipo: 'itens',
          itens: ctx.canais.map((c) => ({ rotulo: c.rotulo, texto: c.exibicao, href: c.href, externo: c.externo })),
        },
        destino('ver todos'),
      ];
    default:
      return [];
  }
}
