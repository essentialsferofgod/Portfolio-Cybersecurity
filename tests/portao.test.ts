import { describe, expect, it } from 'vitest';
import { organizacao } from '../src/content/organizacao.ts';
import { exemplos } from '../src/content/organizacao.exemplo.ts';
import { verificarPortao } from '../src/lib/portao.ts';

/** Dados completos sintéticos, só para o teste; nunca são renderizados. */
const completos = {
  nome: 'Organização de teste',
  propostaDeValor: 'Texto de teste para a proposta de valor.',
  sobre: 'Texto de teste para a seção sobre.',
  servicos: [
    {
      titulo: 'Serviço de teste',
      problema: 'Problema de teste',
      paraQuem: 'Público de teste',
      inclui: ['Entrega um', 'Entrega dois'],
      proximoPasso: { texto: 'Falar com a equipe', destino: 'contato' },
    },
  ],
  contato: { email: 'contato@organizacao-teste.invalid' },
};

const semFixture = { FIXTURE: undefined };

describe('portão de publicação (V03)', () => {
  it('passa com dados completos e sem FIXTURE', () => {
    expect(verificarPortao(completos, semFixture).erros).toEqual([]);
  });

  it('falha com FIXTURE definida, mesmo com dados completos', () => {
    const { erros } = verificarPortao(completos, { FIXTURE: 'completo' });
    expect(erros).toHaveLength(1);
    expect(erros[0]).toMatch(/FIXTURE="completo"/);
  });

  it('falha com campos PENDENTE', () => {
    const dados = { ...completos, nome: 'PENDENTE: nome', contato: { email: 'PENDENTE: e-mail' } };
    const { erros } = verificarPortao(dados, semFixture);
    expect(erros.some((e) => e.startsWith('nome: PENDENTE:'))).toBe(true);
    expect(erros.some((e) => e.startsWith('contato.email: PENDENTE:'))).toBe(true);
  });

  it('os dados atuais de organizacao.ts passam no portão', () => {
    expect(verificarPortao(organizacao, semFixture).erros).toEqual([]);
  });

  it.each(Object.keys(exemplos) as (keyof typeof exemplos)[])('falha com os dados de exemplo "%s" copiados para organizacao.ts', (nome) => {
    const { erros } = verificarPortao(exemplos[nome], semFixture);
    expect(erros.some((e) => e.includes('parece dado de exemplo'))).toBe(true);
  });

  it('falha sem "sobre"', () => {
    const { sobre: _, ...semSobre } = completos;
    expect(verificarPortao(semSobre, semFixture).erros).toEqual(['falta "sobre".']);
  });

  it('falha sem serviço', () => {
    expect(verificarPortao({ ...completos, servicos: [] }, semFixture).erros).toEqual([
      'é preciso pelo menos um serviço completo.',
    ]);
  });

  it('falha sem canal de contato real (endereço não é canal)', () => {
    const { erros } = verificarPortao({ ...completos, contato: { endereco: 'Rua de teste, 1' } }, semFixture);
    expect(erros).toHaveLength(1);
    expect(erros[0]).toMatch(/canal de contato/);
  });

  it('falha com formulário sem política de privacidade', () => {
    const dados = { ...completos, contato: { ...completos.contato, formularioEndpoint: 'https://formularios.invalid/envio' } };
    expect(verificarPortao(dados, semFixture).erros).toEqual(['formulário exige legal.politicaPrivacidadeUrl.']);
  });

  it('falha com serviço incompleto (menos de 2 itens em "inclui")', () => {
    const servico = { ...completos.servicos[0]!, inclui: ['Entrega única'] };
    const { erros } = verificarPortao({ ...completos, servicos: [servico] }, semFixture);
    expect(erros[0]).toMatch(/Dados da organização inválidos/);
  });

  it('orçamento de layout excedido gera aviso, não erro', () => {
    const { erros, avisos } = verificarPortao({ ...completos, nome: 'N'.repeat(41) }, semFixture);
    expect(erros).toEqual([]);
    expect(avisos).toEqual(['orçamento de layout excedido — nome: 41 caracteres (orçamento: 40)']);
  });
});
