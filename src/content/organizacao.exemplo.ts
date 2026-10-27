/**
 * Dados de exemplo para desenvolvimento e verificação (seção 6.3).
 * Usados somente quando a variável FIXTURE estiver definida: minimo | completo | extremo.
 *
 * Todo texto é visivelmente fictício, entre colchetes. Endereços usam example.com
 * (domínio reservado para documentação) e números com DDD 00, que não existe.
 * Nunca coloque aqui nomes de empresas, normas, certificações ou números reais.
 */
import type { OrganizacaoEntrada } from './schema.ts';

const minimo = {
  nome: '[Nome da organização]',
  propostaDeValor: '[O que a organização faz] para [quem], [diferencial verificável].',
  servicos: [
    {
      titulo: '[Serviço A]',
      problema: '[Problema que o serviço resolve, em uma frase]',
      paraQuem: '[Para quem é o serviço A]',
      inclui: ['[Entrega 1 do serviço A]', '[Entrega 2 do serviço A]'],
      proximoPasso: { texto: 'Falar com a equipe', destino: 'contato' },
    },
  ],
  contato: { email: 'contato@example.com' },
} satisfies OrganizacaoEntrada;

const completo = {
  nome: '[Nome da organização]',
  razaoSocial: '[Razão social da organização]',
  cnpj: '[CNPJ]',
  propostaDeValor: '[O que a organização faz] para [quem], [diferencial verificável].',
  subtitulo:
    '[Complemento da proposta: como o trabalho acontece e o que o cliente recebe ao final, em até duas linhas.]',
  publicoAlvo: '[Público-alvo]',
  atuacao: '[Região] · [modelo de atendimento]',
  sobre:
    '[Parágrafo sobre a organização: origem, foco de atuação e forma de trabalho. Este texto existe só para avaliar o layout e será substituído pelos dados reais fornecidos pela organização.]',
  servicos: [
    {
      titulo: '[Serviço A]',
      problema: '[Problema que o serviço A resolve, em uma frase]',
      paraQuem: '[Para quem é o serviço A]',
      inclui: ['[Entrega 1 do serviço A]', '[Entrega 2 do serviço A]', '[Entrega 3 do serviço A]'],
      proximoPasso: { texto: 'Falar com a equipe', destino: 'contato' },
    },
    {
      titulo: '[Serviço B]',
      problema: '[Problema que o serviço B resolve, em uma frase]',
      paraQuem: '[Para quem é o serviço B]',
      inclui: ['[Entrega 1 do serviço B]', '[Entrega 2 do serviço B]'],
      proximoPasso: { texto: 'Enviar e-mail', destino: 'email' },
    },
    {
      titulo: '[Serviço C]',
      problema: '[Problema que o serviço C resolve, em uma frase]',
      paraQuem: '[Para quem é o serviço C]',
      inclui: ['[Entrega 1 do serviço C]', '[Entrega 2 do serviço C]', '[Entrega 3 do serviço C]', '[Entrega 4 do serviço C]'],
      proximoPasso: { texto: 'Conversar no WhatsApp', destino: 'whatsapp' },
    },
  ],
  abordagem: [
    { etapa: '[Etapa 1]', descricao: '[O que acontece na etapa 1, em uma frase.]' },
    { etapa: '[Etapa 2]', descricao: '[O que acontece na etapa 2, em uma frase.]' },
    { etapa: '[Etapa 3]', descricao: '[O que acontece na etapa 3, em uma frase.]' },
    { etapa: '[Etapa 4]', descricao: '[O que acontece na etapa 4, em uma frase.]' },
  ],
  confianca: [
    {
      tipo: 'certificacao',
      titulo: '[Certificação X]',
      emissor: '[Emissor da certificação X]',
      urlVerificacao: 'https://example.com/verificacao/certificacao-x',
      autorizadoPublicar: true,
    },
    {
      tipo: 'caso',
      titulo: '[Caso publicado Y]',
      urlVerificacao: 'https://example.com/casos/caso-y',
      autorizadoPublicar: true,
    },
  ],
  aviso: '[Aviso: site de demonstração com dados fictícios]',
  chamada: '[Linha curta acima do título]',
  pilares: ['[Pilar 1]', '[Pilar 2]', '[Pilar 3]'],
  slogan: '[Slogan do rodapé]',
  problema: { titulo: '[Frase sobre o problema.]', texto: ['[Parágrafo 1 sobre o problema.]', '[Parágrafo 2 sobre o problema.]'] },
  laboratorio: true,
  principios: {
    titulo: '[Frase sobre os princípios.]',
    texto: '[Parágrafo sobre os princípios.]',
    itens: [
      { nome: '[Princípio 1]', descricao: '[Descrição curta.]' },
      { nome: '[Princípio 2]', descricao: '[Descrição curta.]' },
      { nome: '[Princípio 3]', descricao: '[Descrição curta.]' },
    ],
  },
  chamadaFinal: { titulo: '[Chamada final.]', texto: ['[Frase de apoio da chamada final.]'] },
  formularioDemo: true,
  numeros: [
    { valor: 120, sufixo: '+', rotulo: '[Indicador A]' },
    { valor: 35, rotulo: '[Indicador B]' },
    { valor: 90, sufixo: '%', rotulo: '[Indicador C]' },
  ],
  depoimentos: [
    { texto: '[Depoimento 1: frase curta sobre a experiência com o serviço.]', autor: '[Função da pessoa]', empresa: '[Empresa]' },
    { texto: '[Depoimento 2: frase curta sobre a experiência com o serviço.]', autor: '[Função da pessoa]' },
  ],
  faq: [
    { pergunta: '[Pergunta frequente 1?]', resposta: '[Resposta objetiva à pergunta 1, em até três frases.]' },
    { pergunta: '[Pergunta frequente 2?]', resposta: '[Resposta objetiva à pergunta 2, em até três frases.]' },
    { pergunta: '[Pergunta frequente 3?]', resposta: '[Resposta objetiva à pergunta 3, em até três frases.]' },
  ],
  contato: {
    email: 'contato@example.com',
    telefone: '+55 00 0000-0000',
    whatsapp: '5500000000000',
    endereco: '[Endereço: rua, número, cidade e UF]',
    contatoSeguranca: 'seguranca@example.com',
  },
  legal: { politicaPrivacidadeUrl: 'https://example.com/privacidade' },
} satisfies OrganizacaoEntrada;

const FRASE =
  'Texto fictício no limite de caracteres para testar o layout, com acentuação completa: ação, gestão, núcleo, você, além, órgão. ';

/** Texto entre colchetes com exatamente `limite` caracteres. */
function noLimite(rotulo: string, limite: number): string {
  let corpo = `${rotulo}: `;
  while (corpo.length < limite) corpo += FRASE;
  return `[${corpo.slice(0, limite - 2).trimEnd().padEnd(limite - 2, '.')}]`;
}

const extremo = {
  nome: noLimite('Nome', 40),
  razaoSocial: noLimite('Razão social', 80),
  cnpj: '[CNPJ]',
  propostaDeValor: noLimite('Proposta de valor', 90),
  subtitulo: noLimite('Subtítulo', 160),
  publicoAlvo: noLimite('Público-alvo', 80),
  atuacao: noLimite('Atuação', 60),
  sobre: noLimite('Sobre', 600),
  servicos: Array.from({ length: 8 }, (_, i) => ({
    titulo: noLimite(`Serviço ${i + 1}`, 40),
    problema: noLimite('Problema', 160),
    paraQuem: noLimite('Para quem', 120),
    inclui: Array.from({ length: 6 }, (_, j) => noLimite(`Entrega ${j + 1}`, 80)),
    proximoPasso: { texto: 'Falar com a equipe', destino: 'contato' as const },
  })),
  abordagem: Array.from({ length: 6 }, (_, i) => ({
    etapa: noLimite(`Etapa ${i + 1}`, 30),
    descricao: noLimite('Descrição', 160),
  })),
  confianca: Array.from({ length: 4 }, (_, i) => ({
    tipo: 'outro' as const,
    titulo: noLimite(`Item ${i + 1}`, 80),
    emissor: noLimite('Emissor', 60),
    urlVerificacao: `https://example.com/verificacao/item-${i + 1}`,
    autorizadoPublicar: true as const,
  })),
  aviso: noLimite('Aviso', 160),
  numeros: Array.from({ length: 4 }, (_, i) => ({ valor: 999999 - i, sufixo: '+', rotulo: noLimite(`Indicador ${i + 1}`, 60) })),
  depoimentos: Array.from({ length: 3 }, (_, i) => ({
    texto: noLimite(`Depoimento ${i + 1}`, 240),
    autor: noLimite('Função', 60),
    empresa: noLimite('Empresa', 60),
  })),
  faq: Array.from({ length: 8 }, (_, i) => ({
    pergunta: noLimite(`Pergunta ${i + 1}`, 100),
    resposta: noLimite('Resposta', 400),
  })),
  contato: {
    email: 'contato.atendimento.comercial@departamento.example.com',
    telefone: '+55 00 0000-0000',
    whatsapp: '5500000000000',
    endereco: noLimite('Endereço', 120),
    contatoSeguranca: 'relato.de.vulnerabilidades@departamento.example.com',
  },
  legal: { politicaPrivacidadeUrl: 'https://example.com/politica-de-privacidade-e-protecao-de-dados' },
} satisfies OrganizacaoEntrada;

export const exemplos = { minimo, completo, extremo } satisfies Record<string, OrganizacaoEntrada>;

export type NomeFixture = keyof typeof exemplos;
