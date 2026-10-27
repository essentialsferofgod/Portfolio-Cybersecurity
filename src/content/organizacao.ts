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
 * Este site é uma demonstração de portfólio criada pela Spike Media: serviços, números e
 * depoimentos são dados demonstrativos, e a página diz isso no `aviso` e no `sobre`.
 */
import type { OrganizacaoEntrada } from './schema.ts';

export const organizacao = {
  nome: 'Spike Security',
  propostaDeValor: 'A invasão começa onde a visibilidade termina.',
  subtitulo:
    'Inteligência de segurança para um mundo em que cada conexão amplia a superfície de ataque. Encontramos exposições, testamos premissas e fortalecemos defesas.',
  chamada: 'Estúdio independente de cibersegurança',
  pilares: ['Segurança ofensiva', 'Inteligência de ameaças', 'Resiliência digital'],
  slogan: 'Clareza na complexidade. Resiliência por design.',
  publicoAlvo: 'Pequenas e médias empresas',
  atuacao: 'Brasil · atendimento remoto',
  aviso:
    'Site de demonstração criado pela Spike Media. Serviços, números, depoimentos e a simulação são fictícios e servem apenas para mostrar o layout.',
  problema: {
    titulo: 'Não dá para defender o que não se vê.',
    texto: [
      'Todo ambiente digital tem pontos cegos. Ativos não mapeados, vulnerabilidades esquecidas e visibilidade fragmentada abrem caminho para um atacante.',
      'Segurança eficaz começa por entender a sua exposição. Transformamos superfícies de ataque complexas em prioridades claras e acionáveis.',
    ],
  },
  laboratorio: true,
  principios: {
    titulo: 'Segurança é prática, não promessa.',
    texto:
      'Nenhum sistema pode ser garantido imune a todas as ameaças. Nosso trabalho se apoia em visibilidade, evidência, testes disciplinados e melhoria contínua.',
    itens: [
      { nome: 'Visibilidade', descricao: 'Conheça seus ativos. Entenda sua exposição.' },
      { nome: 'Evidência', descricao: 'Valide os achados. Separe suposições de fatos.' },
      { nome: 'Resiliência', descricao: 'Reduza riscos. Prepare-se para o que vem a seguir.' },
    ],
  },
  chamadaFinal: {
    titulo: 'Conheça sua exposição. Fortaleça sua defesa.',
    texto: ['Todo ambiente resiliente começa pelas perguntas certas. Vamos identificar as suas.'],
  },
  formularioDemo: true,
  sobre:
    'A Spike Security é uma organização de cibersegurança. Ajudamos negócios a entender onde estão seus riscos digitais e o que fazer a respeito, com linguagem direta e recomendações em ordem de prioridade.\n\nAtuamos em segurança ofensiva, inteligência de ameaças, gestão da superfície de ataque, prontidão para incidentes, conscientização de equipes e apoio à LGPD.\n\nEste site é uma demonstração criada pela Spike Media; os dados exibidos são demonstrativos.',
  servicos: [
    {
      titulo: 'Segurança ofensiva',
      problema: 'Falhas que só aparecem quando alguém tenta explorá-las de verdade.',
      paraQuem: 'Empresas com sistemas, sites ou aplicativos expostos à internet.',
      inclui: [
        'Testes de invasão autorizados, dentro de um escopo combinado',
        'Segurança de aplicações web e móveis',
        'Relatório técnico com evidências',
        'Novo teste para validar as correções'
      ],
      proximoPasso: {
        texto: 'Falar com a equipe',
        destino: 'contato'
      }
    },
    {
      titulo: 'Inteligência de ameaças',
      problema: 'Excesso de alertas e pouca clareza sobre quais ameaças importam para o seu negócio.',
      paraQuem: 'Equipes de TI e segurança que precisam priorizar ações de defesa.',
      inclui: [
        'Pesquisa de ameaças relevantes ao seu setor',
        'Análise de indicadores',
        'Panorama de adversários e técnicas',
        'Recomendações de defesa em ordem de prioridade'
      ],
      proximoPasso: {
        texto: 'Falar com a equipe',
        destino: 'contato'
      }
    },
    {
      titulo: 'Gestão da superfície de ataque',
      problema: 'Ativos esquecidos, serviços expostos e visibilidade fragmentada abrem portas para ataques.',
      paraQuem: 'Empresas com ambientes distribuídos entre escritório, nuvem e fornecedores.',
      inclui: [
        'Descoberta de ativos expostos',
        'Análise de exposição',
        'Mapa das relações entre ativos',
        'Priorização por risco'
      ],
      proximoPasso: {
        texto: 'Falar com a equipe',
        destino: 'contato'
      }
    },
    {
      titulo: 'Prontidão para incidentes',
      problema: 'Sem um plano claro do que fazer quando algo dá errado, a empresa perde tempo e dados.',
      paraQuem: 'Empresas que querem se preparar para ataques, vazamentos e fraudes.',
      inclui: [
        'Plano de resposta com responsáveis e etapas',
        'Revisões de segurança',
        'Simulação para treinar o plano',
        'Estratégia de resiliência'
      ],
      proximoPasso: {
        texto: 'Falar com a equipe',
        destino: 'contato'
      }
    },
    {
      titulo: 'Conscientização da equipe',
      problema: 'Funcionários sem orientação clara sobre senhas, e-mails suspeitos e boas práticas.',
      paraQuem: 'Empresas que querem preparar a equipe para o uso seguro dos sistemas.',
      inclui: [
        'Treinamentos curtos e práticos',
        'Simulação de e-mails fraudulentos',
        'Guia de boas práticas para o dia a dia'
      ],
      proximoPasso: {
        texto: 'Falar com a equipe',
        destino: 'contato'
      }
    },
    {
      titulo: 'Apoio à adequação à LGPD',
      problema: 'Dúvidas sobre como tratar dados pessoais de clientes e funcionários dentro da lei.',
      paraQuem: 'Empresas que coletam ou guardam dados pessoais de clientes e funcionários.',
      inclui: [
        'Mapeamento dos dados pessoais tratados',
        'Apontamento de lacunas e riscos',
        'Plano de adequação por prioridade',
        'Modelos de documentos e políticas internas'
      ],
      proximoPasso: {
        texto: 'Falar com a equipe',
        destino: 'contato'
      }
    }
  ],
  abordagem: [
    {
      etapa: 'Descobrir',
      descricao: 'Mapeamos o ambiente e entendemos o que precisa de proteção.'
    },
    {
      etapa: 'Validar',
      descricao: 'Avaliamos possíveis falhas com testes controlados e autorizados.'
    },
    {
      etapa: 'Priorizar',
      descricao: 'Traduzimos achados técnicos em prioridades claras, baseadas em risco.'
    },
    {
      etapa: 'Fortalecer',
      descricao: 'Melhoramos as defesas, validamos as correções e construímos resiliência.'
    }
  ],
  numeros: [
    { valor: 150, sufixo: '+', rotulo: 'diagnósticos realizados' },
    { valor: 40, sufixo: '+', rotulo: 'empresas atendidas' },
    { valor: 8, rotulo: 'anos de experiência' },
    { valor: 98, sufixo: '%', rotulo: 'clientes que recomendam' },
  ],
  depoimentos: [
    {
      texto:
        'O relatório veio em linguagem simples e com uma lista do que corrigir primeiro. Em poucas semanas a equipe já sabia o que fazer.',
      autor: 'Diretora de operações',
      empresa: 'Empresa de logística (fictícia)',
    },
    {
      texto: 'Fizeram o teste de invasão sem atrapalhar o nosso dia a dia e acompanharam as correções até o fim.',
      autor: 'Gerente de TI',
      empresa: 'Rede de clínicas (fictícia)',
    },
    {
      texto: 'O treinamento foi curto e prático. As pessoas passaram a desconfiar de e-mails estranhos e a avisar o time.',
      autor: 'Sócio-fundador',
      empresa: 'Agência de marketing (fictícia)',
    },
  ],
  confianca: [],
  faq: [
    {
      pergunta: 'Preciso entender de tecnologia para contratar?',
      resposta:
        'Não. Explicamos cada achado em linguagem direta e indicamos o que corrigir primeiro. A parte técnica fica com a nossa equipe.',
    },
    {
      pergunta: 'Como funciona o primeiro contato?',
      resposta:
        'Você escreve para o e-mail do site, contamos como trabalhamos e combinamos uma conversa para entender o seu cenário. Não há compromisso nessa etapa.',
    },
    {
      pergunta: 'Quanto tempo leva um diagnóstico?',
      resposta: 'Depende do tamanho do ambiente e do escopo. O prazo é combinado por escrito antes de começar.',
    },
    {
      pergunta: 'Vocês acessam meus dados?',
      resposta:
        'Só o necessário para o trabalho combinado, dentro do escopo acordado. Tudo é definido antes do início e tratado com sigilo.',
    },
    {
      pergunta: 'O que acontece depois do relatório?',
      resposta:
        'Apresentamos os resultados e podemos apoiar a aplicação das correções. Depois, conferimos se os problemas foram resolvidos.',
    },
    {
      pergunta: 'Atendem empresas de qualquer porte?',
      resposta:
        'A proposta é adaptar o serviço ao porte e à realidade de cada negócio. Conte seu cenário e indicamos o caminho mais adequado.',
    },
  ],
  contato: {
    email: 'spike.media.agencia@gmail.com',
  },
  legal: {},
  marca: {
    favicon: '/favicon.svg',
    imagemSocial: '/og.png',
    imagemSocialAlt: 'Spike Security: "A invasão começa onde a visibilidade termina." em fundo escuro com pontos verdes.',
  },
  seo: {
    titulo: 'Spike Security — Cibersegurança com visibilidade',
    descricao:
      'Demonstração de estúdio de cibersegurança: testes de invasão, inteligência de ameaças e superfície de ataque com prioridades claras.',
  },
} satisfies OrganizacaoEntrada;
