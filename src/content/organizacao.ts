/**
 * Dados reais da organização: a fonte única do conteúdo institucional.
 *
 * - Dado necessário ainda não fornecido: "PENDENTE: <o que falta>".
 *   Em desenvolvimento aparece com borda tracejada; `npm run build` falha enquanto existir.
 * - Campo opcional sem dado: remova a chave (ou deixe a lista vazia).
 *   A seção correspondente, seu link e seu comando simplesmente não são renderizados.
 *
 * Os dados de exemplo ficam em organizacao.exemplo.ts e só valem com a variável FIXTURE.
 */
import type { OrganizacaoEntrada } from './schema.ts';

export const organizacao = {
  nome: 'PENDENTE: nome da organização (até 40 caracteres)',
  propostaDeValor: 'PENDENTE: o que a organização faz e para quem, em uma frase (até 90 caracteres)',
  subtitulo: 'PENDENTE: complemento da proposta de valor (até 160 caracteres)',
  sobre: 'PENDENTE: texto sobre a organização (até 600 caracteres)',
  servicos: [
    {
      titulo: 'PENDENTE: título do serviço',
      problema: 'PENDENTE: problema que o serviço resolve',
      paraQuem: 'PENDENTE: para quem é o serviço',
      inclui: ['PENDENTE: primeira entrega', 'PENDENTE: segunda entrega'],
      proximoPasso: { texto: 'Falar com a equipe', destino: 'contato' },
    },
  ],
  abordagem: [],
  confianca: [],
  faq: [],
  contato: {
    email: 'PENDENTE: e-mail de contato',
  },
  legal: {},
  marca: {},
} satisfies OrganizacaoEntrada;
