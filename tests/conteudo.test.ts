import { describe, expect, it } from 'vitest';
import { exemplos } from '../src/content/organizacao.exemplo.ts';
import { carregarConteudo, linkCanal, montarConteudo, slug } from '../src/lib/conteudo.ts';

describe('regra de ausência e numeração', () => {
  it('variante mínima: só serviços e contato, numerados sem lacunas', () => {
    const c = carregarConteudo('minimo');
    expect(c.secoes.map((s) => `${s.numero} ${s.id}`)).toEqual(['01 servicos', '02 contato']);
    expect(c.comandos.map((cmd) => cmd.nome)).toEqual(['help', 'services', 'contact', 'clear']);
  });

  it('variante completa: todas as seções, na ordem da arquitetura', () => {
    const c = carregarConteudo('completo');
    expect(c.secoes.map((s) => s.id)).toEqual(['problema', 'servicos', 'laboratorio', 'abordagem', 'principios', 'sobre', 'depoimentos', 'confianca', 'faq', 'contato']);
    expect(c.comandos).toHaveLength(8);
  });

  it('abordagem com 1 etapa e FAQ com 1 pergunta não são renderizadas', () => {
    const base = exemplos.completo;
    const c = montarConteudo({ ...base, abordagem: base.abordagem.slice(0, 1), faq: base.faq.slice(0, 1) });
    expect(c.secoes.map((s) => `${s.numero} ${s.id}`)).toEqual(['01 problema', '02 servicos', '03 laboratorio', '04 principios', '05 sobre', '06 depoimentos', '07 confianca', '08 contato']);
    expect(c.comandos.map((cmd) => cmd.nome)).not.toContain('approach');
    expect(c.comandos.map((cmd) => cmd.nome)).not.toContain('faq');
  });

  it('item de confiança sem autorização de publicação é rejeitado', () => {
    const item = { ...exemplos.completo.confianca[0]!, autorizadoPublicar: false };
    expect(() => montarConteudo({ ...exemplos.completo, confianca: [item] })).toThrow(/inválidos/);
  });

  it('próximo passo apontando para canal não preenchido é rejeitado', () => {
    const servico = { ...exemplos.minimo.servicos[0]!, proximoPasso: { texto: 'Conversar', destino: 'whatsapp' as const } };
    expect(() => montarConteudo({ ...exemplos.minimo, servicos: [servico] })).toThrow(/canal "whatsapp" não está preenchido/);
  });

  it('FIXTURE desconhecida gera erro claro', () => {
    expect(() => carregarConteudo('qualquer')).toThrow(/FIXTURE inválida/);
  });
});

describe('links de contato', () => {
  const { dados } = carregarConteudo('completo');

  it('gera mailto, tel e wa.me a partir dos dados', () => {
    expect(linkCanal('email', dados)?.href).toBe('mailto:contato@example.com');
    expect(linkCanal('telefone', dados)?.href).toBe('tel:+550000000000');
    expect(linkCanal('whatsapp', dados)).toMatchObject({ href: 'https://wa.me/5500000000000', exibicao: '+55 00 00000-0000' });
  });

  it('canal ausente não gera link', () => {
    expect(linkCanal('linkedin', dados)).toBeNull();
  });

  it('pendência não vira link', () => {
    const c = montarConteudo({ ...exemplos.minimo, contato: { email: 'PENDENTE: e-mail de contato' } });
    expect(linkCanal('email', c.dados)).toMatchObject({ href: null });
  });
});

describe('slug', () => {
  it('remove acentos, colchetes e espaços', () => {
    expect(slug('[Nome da Organização]')).toBe('nome-da-organizacao');
  });
});
