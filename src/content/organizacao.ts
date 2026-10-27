/**
 * Dados reais da organização: a fonte única do conteúdo institucional.
 *
 * - Dado necessário ainda não fornecido: "PENDENTE: <o que falta>".
 *   Em desenvolvimento aparece com borda tracejada; `npm run build` falha enquanto existir.
 * - Campo opcional sem dado: remova a chave (ou deixe a lista vazia).
 *   A seção correspondente, seu link e seu comando simplesmente não são renderizados.
 *
 * Os dados de exemplo ficam em organizacao.exemplo.ts e só valem com a variável FIXTURE.
 *
 * Este site é uma demonstração criada pela Spike Media: os serviços abaixo são dados
 * demonstrativos e o texto "sobre" diz isso de forma explícita.
 */
import type { OrganizacaoEntrada } from './schema.ts';

export const organizacao = {
  nome: 'Spike Security',
  propostaDeValor: 'Reduzimos riscos digitais do seu negócio com análise técnica e orientação objetiva.',
  sobre:
    'A Spike Security é uma organização de cibersegurança. Ajudamos negócios a entender onde estão seus riscos digitais e o que fazer a respeito, com linguagem direta e recomendações em ordem de prioridade. Este site é uma demonstração criada pela Spike Media; os serviços descritos são dados demonstrativos.',
  servicos: [
    {
      titulo: 'Diagnóstico de segurança',
      problema: 'Não saber quais riscos digitais o negócio tem nem por onde começar a corrigir.',
      paraQuem: 'Empresas que ainda não fizeram uma avaliação de segurança.',
      inclui: [
        'Levantamento dos sistemas, contas e dados mais importantes',
        'Identificação dos riscos mais relevantes',
        'Relatório com prioridades e recomendações',
        'Reunião para apresentar os resultados',
      ],
      proximoPasso: { texto: 'Falar com a equipe', destino: 'contato' },
    },
    {
      titulo: 'Orientação para a equipe',
      problema: 'Funcionários sem orientação clara sobre senhas, e-mails suspeitos e boas práticas.',
      paraQuem: 'Empresas que querem preparar a equipe para o uso seguro dos sistemas.',
      inclui: ['Conversa ou treinamento sobre os riscos do dia a dia', 'Guia curto de boas práticas para a equipe'],
      proximoPasso: { texto: 'Falar com a equipe', destino: 'contato' },
    },
  ],
  abordagem: [],
  confianca: [],
  faq: [],
  contato: {
    email: 'spike.media.agencia@gmail.com',
  },
  legal: {},
  marca: {},
} satisfies OrganizacaoEntrada;
