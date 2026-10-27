import { describe, expect, it } from 'vitest';
import { COMANDOS, comandosAtivos, numerarSecoes, type IdSecao } from '../src/content/comandos.ts';
import { distancia, filtrar, gerarSaida, normalizar, primeiraFrase, resolver, sugerir, type ContextoSaida } from '../src/lib/terminal.ts';

const todas = new Set<IdSecao>(['servicos', 'abordagem', 'sobre', 'confianca', 'faq', 'contato']);
const ativos = comandosAtivos(todas);

describe('normalização', () => {
  it('remove espaços nas pontas, maiúsculas e acentos', () => {
    expect(normalizar('  Serviços  ')).toBe('servicos');
    expect(normalizar('ÁBOUT')).toBe('about');
  });
});

describe('distância de edição', () => {
  it('conta inserções, remoções e trocas', () => {
    expect(distancia('services', 'services')).toBe(0);
    expect(distancia('sevices', 'services')).toBe(1);
    expect(distancia('srvices', 'services')).toBe(1);
    expect(distancia('servixes', 'services')).toBe(1);
    expect(distancia('srvics', 'services')).toBe(2);
    expect(distancia('', 'faq')).toBe(3);
  });
});

describe('correspondência (V02)', () => {
  it('nome exato executa', () => {
    expect(resolver('services', ativos)).toMatchObject({ tipo: 'executar', comando: { nome: 'services' } });
  });

  it('alias executa o comando correspondente', () => {
    expect(resolver('ajuda', ativos)).toMatchObject({ tipo: 'executar', comando: { nome: 'help' } });
    expect(resolver('contato', ativos)).toMatchObject({ tipo: 'executar', comando: { nome: 'contact' } });
    expect(resolver('limpar', ativos)).toMatchObject({ tipo: 'executar', comando: { nome: 'clear' } });
  });

  it('acento: "Serviços" equivale a "servicos"', () => {
    expect(resolver('Serviços', ativos)).toMatchObject({ tipo: 'executar', comando: { nome: 'services' } });
  });

  it('maiúsculas: "HELP" executa help', () => {
    expect(resolver('HELP', ativos)).toMatchObject({ tipo: 'executar', comando: { nome: 'help' } });
  });

  it('espaços nas pontas são ignorados', () => {
    expect(resolver('   faq   ', ativos)).toMatchObject({ tipo: 'executar', comando: { nome: 'faq' } });
  });

  it('erro de 1 letra sugere o comando', () => {
    expect(resolver('sevices', ativos)).toMatchObject({ tipo: 'erro', entrada: 'sevices', sugestao: { nome: 'services' } });
  });

  it('erro de 2 letras sugere o comando', () => {
    expect(resolver('srvics', ativos)).toMatchObject({ tipo: 'erro', sugestao: { nome: 'services' } });
    expect(resolver('abuto', ativos)).toMatchObject({ tipo: 'erro', sugestao: { nome: 'about' } });
  });

  it('erro de 3 letras ou mais não sugere', () => {
    expect(resolver('svcs', ativos)).toMatchObject({ tipo: 'erro', sugestao: null });
  });

  it('comando desconhecido gera erro sem sugestão', () => {
    expect(resolver('xyzzy', ativos)).toEqual({ tipo: 'erro', entrada: 'xyzzy', sugestao: null });
  });

  it('entrada com menos de 3 caracteres não recebe sugestão', () => {
    expect(resolver('hl', ativos)).toEqual({ tipo: 'erro', entrada: 'hl', sugestao: null });
  });

  it('entrada vazia não faz nada', () => {
    expect(resolver('', ativos)).toEqual({ tipo: 'vazio' });
    expect(resolver('    ', ativos)).toEqual({ tipo: 'vazio' });
  });

  it('comando de seção ausente não existe', () => {
    const semFaq = comandosAtivos(new Set<IdSecao>(['servicos', 'contato']));
    expect(semFaq.map((c) => c.nome)).toEqual(['help', 'services', 'contact', 'clear']);
    expect(resolver('faq', semFaq)).toMatchObject({ tipo: 'erro', entrada: 'faq' });
    expect(resolver('abordagem', semFaq).tipo).toBe('erro');
  });

  it('empate na distância: vale a ordem do registro', () => {
    const registro = [
      { nome: 'abc', aliases: [], descricao: '' },
      { nome: 'abd', aliases: [], descricao: '' },
    ];
    expect(sugerir('abx', registro)?.nome).toBe('abc');
    expect(sugerir('abx', [...registro].reverse())?.nome).toBe('abd');
  });

  it('o registro tem nomes e aliases já normalizados e sem repetição', () => {
    const vistos = COMANDOS.flatMap((c) => [c.nome, ...c.aliases]);
    expect(vistos.every((t) => normalizar(t) === t)).toBe(true);
    expect(new Set(vistos).size).toBe(vistos.length);
  });
});

describe('sugestões enquanto digita', () => {
  it('filtra por prefixo de nome ou alias, sem repetir comando', () => {
    expect(filtrar('s', ativos).map((c) => c.nome)).toEqual(['services', 'about']);
    expect(filtrar('serv', ativos).map((c) => c.nome)).toEqual(['services']);
  });

  it('traz por trecho depois dos prefixos', () => {
    expect(filtrar('act', ativos).map((c) => c.nome)).toEqual(['contact']);
  });

  it('limita a 5 e ignora entrada vazia', () => {
    expect(filtrar('a', ativos, 5).length).toBeLessThanOrEqual(5);
    expect(filtrar('', ativos)).toEqual([]);
  });
});

describe('geração de saída', () => {
  const secoes = numerarSecoes(todas);
  const ctx: ContextoSaida = {
    comandos: ativos,
    secoes,
    servicos: [{ titulo: '[Título A]' }, { titulo: '[Título B]' }, { titulo: '[Título C]' }],
    abordagem: [{ etapa: '[Etapa 1]' }, { etapa: '[Etapa 2]' }],
    sobre: '[Primeira frase.] Segunda frase que não aparece.',
    faq: [{ pergunta: '[Pergunta 1?]' }, { pergunta: '[Pergunta 2?]' }],
    canais: [{ rotulo: 'e-mail', exibicao: 'contato@example.com', href: 'mailto:contato@example.com', externo: false }],
  };

  it('services: quantidade, títulos numerados e link para a seção', () => {
    expect(gerarSaida('services', ctx)).toEqual([
      { tipo: 'texto', texto: '3 serviços' },
      {
        tipo: 'itens',
        itens: [
          { indice: '01', texto: '[Título A]' },
          { indice: '02', texto: '[Título B]' },
          { indice: '03', texto: '[Título C]' },
        ],
      },
      { tipo: 'link', texto: 'ver detalhes em 01 / serviços', href: '#servicos' },
    ]);
  });

  it('help: comandos ativos', () => {
    const [, lista] = gerarSaida('help', ctx);
    expect(lista).toMatchObject({ tipo: 'comandos' });
    expect(lista?.tipo === 'comandos' && lista.comandos.map((c) => c.nome)).toEqual(ativos.map((c) => c.nome));
  });

  it('about: só a primeira frase', () => {
    expect(gerarSaida('about', ctx)[0]).toEqual({ tipo: 'texto', texto: '[Primeira frase.]' });
  });

  it('faq: perguntas como links para cada item', () => {
    const itens = gerarSaida('faq', ctx)[1];
    expect(itens?.tipo === 'itens' && itens.itens.map((i) => i.href)).toEqual(['#faq-1', '#faq-2']);
  });

  it('contact: canais reais como links', () => {
    expect(gerarSaida('contact', ctx)[1]).toEqual({
      tipo: 'itens',
      itens: [{ rotulo: 'e-mail', texto: 'contato@example.com', href: 'mailto:contato@example.com', externo: false }],
    });
  });

  it('numeração do link acompanha a seção renderizada', () => {
    const semAbordagem = numerarSecoes(new Set<IdSecao>(['servicos', 'faq', 'contato']));
    expect(gerarSaida('faq', { ...ctx, secoes: semAbordagem }).at(-1)).toEqual({
      tipo: 'link',
      texto: 'ver respostas em 02 / faq',
      href: '#faq',
    });
  });

  it('comando sem seção renderizada não gera saída', () => {
    expect(gerarSaida('approach', { ...ctx, secoes: numerarSecoes(new Set<IdSecao>(['servicos'])) })).toEqual([]);
  });

  it('primeira frase longa é cortada', () => {
    const longa = `${'palavra '.repeat(60)}fim.`;
    const frase = primeiraFrase(longa, 80);
    expect(frase.length).toBeLessThanOrEqual(80);
    expect(frase.endsWith('…')).toBe(true);
  });
});
