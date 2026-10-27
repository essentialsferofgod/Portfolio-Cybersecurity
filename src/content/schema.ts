/**
 * Schema do conteúdo institucional (seção 6.1), validado em tempo de build.
 * Os limites de tamanho são orçamentos de layout: geram aviso, não erro (ver ORCAMENTOS).
 */
import { z } from 'astro/zod';

export const PREFIXO_PENDENTE = 'PENDENTE:';

/** Dado necessário ainda não fornecido: "PENDENTE: <o que falta>". */
const pendente = z.string().startsWith(PREFIXO_PENDENTE);
const texto = z.string().trim().min(1);
const urlHttps = z.union([z.url({ protocol: /^https$/ }), pendente]);
const email = z.union([z.email(), pendente]);

export const CANAIS = ['email', 'telefone', 'whatsapp', 'linkedin'] as const;
export type Canal = (typeof CANAIS)[number];

const servico = z.object({
  titulo: texto,
  problema: texto,
  paraQuem: texto,
  inclui: z.array(texto).min(2).max(6),
  proximoPasso: z.object({
    texto,
    /** "contato" leva à seção de contato; os demais usam o canal correspondente em `contato`. */
    destino: z.enum(['contato', ...CANAIS]),
  }),
});

const etapa = z.object({
  etapa: texto,
  descricao: texto,
});

const itemConfianca = z.object({
  tipo: z.enum(['certificacao', 'caso', 'outro']),
  titulo: texto,
  emissor: texto.optional(),
  urlVerificacao: urlHttps,
  autorizadoPublicar: z.literal(true),
});

const pergunta = z.object({
  pergunta: texto,
  resposta: texto,
});

const contato = z.object({
  email: email.optional(),
  /** Como deve aparecer na página, por exemplo "+55 11 3333-4444". */
  telefone: texto.optional(),
  /** Número internacional só com dígitos, por exemplo "5511999999999". */
  whatsapp: z.union([z.string().regex(/^\d{10,15}$/), pendente]).optional(),
  linkedin: z.union([z.url({ protocol: /^https$/, hostname: /(^|\.)linkedin\.com$/ }), pendente]).optional(),
  endereco: texto.optional(),
  /** Contato para relato de vulnerabilidades; habilita /.well-known/security.txt. */
  contatoSeguranca: email.optional(),
  formularioEndpoint: urlHttps.optional(),
});

export const organizacaoSchema = z.object({
  nome: texto,
  razaoSocial: texto.optional(),
  cnpj: texto.optional(),
  propostaDeValor: texto,
  subtitulo: texto.optional(),
  publicoAlvo: texto.optional(),
  atuacao: texto.optional(),
  sobre: texto.optional(),
  servicos: z.array(servico).default([]),
  abordagem: z.array(etapa).default([]),
  confianca: z.array(itemConfianca).default([]),
  faq: z.array(pergunta).default([]),
  contato: contato.default({}),
  legal: z.object({ politicaPrivacidadeUrl: urlHttps.optional() }).default({}),
  marca: z
    .object({
      /** Caminho, dentro de public/, de um arquivo fornecido pela organização. */
      logo: texto.optional(),
      favicon: texto.optional(),
      cores: z.record(z.string(), z.string()).optional(),
      fontes: z.record(z.string(), z.string()).optional(),
    })
    .default({}),
  siteUrl: urlHttps.optional(),
}).superRefine((d, ctx) => {
  // O próximo passo de um serviço só pode apontar para um canal que exista.
  d.servicos.forEach((s, i) => {
    const destino = s.proximoPasso.destino;
    if (destino !== 'contato' && !d.contato[destino]) {
      ctx.addIssue({
        code: 'custom',
        path: ['servicos', i, 'proximoPasso', 'destino'],
        message: `o canal "${destino}" não está preenchido em contato`,
      });
    }
  });
});

export type OrganizacaoEntrada = z.input<typeof organizacaoSchema>;
export type Organizacao = z.output<typeof organizacaoSchema>;
export type Servico = Organizacao['servicos'][number];

export function ehPendente(valor: unknown): boolean {
  return typeof valor === 'string' && valor.startsWith(PREFIXO_PENDENTE);
}

/** Orçamentos de layout por caminho; `[]` vale para cada item da lista. */
export const ORCAMENTOS: Record<string, number> = {
  nome: 40,
  propostaDeValor: 90,
  subtitulo: 160,
  sobre: 600,
  'servicos[].titulo': 40,
  'servicos[].problema': 160,
  'servicos[].paraQuem': 120,
  'servicos[].inclui[]': 80,
  'abordagem[].etapa': 30,
  'abordagem[].descricao': 160,
  'faq[].pergunta': 100,
  'faq[].resposta': 400,
};

/** Percorre o objeto e chama `visitar` para cada string, com o caminho normalizado e o real. */
export function percorrerTextos(
  valor: unknown,
  visitar: (texto: string, caminhoNormalizado: string, caminho: string) => void,
  normalizado = '',
  real = '',
): void {
  if (typeof valor === 'string') {
    visitar(valor, normalizado, real);
  } else if (Array.isArray(valor)) {
    valor.forEach((item, i) => percorrerTextos(item, visitar, `${normalizado}[]`, `${real}[${i}]`));
  } else if (valor && typeof valor === 'object') {
    for (const [chave, item] of Object.entries(valor)) {
      const prefixoN = normalizado ? `${normalizado}.` : '';
      const prefixoR = real ? `${real}.` : '';
      percorrerTextos(item, visitar, `${prefixoN}${chave}`, `${prefixoR}${chave}`);
    }
  }
}

export function verificarOrcamentos(dados: unknown): string[] {
  const avisos: string[] = [];
  percorrerTextos(dados, (texto, normalizado, real) => {
    const limite = ORCAMENTOS[normalizado];
    if (limite !== undefined && !ehPendente(texto) && texto.length > limite) {
      avisos.push(`${real}: ${texto.length} caracteres (orçamento: ${limite})`);
    }
  });
  return avisos;
}
