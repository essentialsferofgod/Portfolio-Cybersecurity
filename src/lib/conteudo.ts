/**
 * Carrega o conteúdo (real ou de exemplo), valida com o schema e aplica a regra de ausência:
 * seção sem dados suficientes não é renderizada, e seu link, comando e número somem junto.
 */
import { z } from 'astro/zod';
import { organizacao } from '../content/organizacao.ts';
import { exemplos, type NomeFixture } from '../content/organizacao.exemplo.ts';
import { comandosAtivos, numerarSecoes, type DefinicaoComando, type IdSecao, type SecaoNumerada } from '../content/comandos.ts';
import {
  CANAIS,
  ehPendente,
  organizacaoSchema,
  verificarOrcamentos,
  type Canal,
  type Organizacao,
  type Servico,
} from '../content/schema.ts';

export interface Conteudo {
  dados: Organizacao;
  fixture: NomeFixture | null;
  secoes: SecaoNumerada[];
  renderizadas: ReadonlySet<IdSecao>;
  comandos: DefinicaoComando[];
}

/** Regras da coluna "Renderiza quando" da seção 5. */
const REGRAS: Record<IdSecao, (d: Organizacao) => boolean> = {
  problema: (d) => Boolean(d.problema),
  servicos: (d) => d.servicos.length >= 1,
  laboratorio: (d) => d.laboratorio,
  principios: (d) => Boolean(d.principios),
  abordagem: (d) => d.abordagem.length >= 2,
  sobre: (d) => Boolean(d.sobre),
  depoimentos: (d) => d.depoimentos.length >= 1,
  confianca: (d) => d.confianca.length >= 1,
  faq: (d) => d.faq.length >= 2,
  contato: (d) => canaisDisponiveis(d).length >= 1,
};

export function ehFixture(valor: string): valor is NomeFixture {
  return Object.hasOwn(exemplos, valor);
}

export function canaisDisponiveis(d: Organizacao): Canal[] {
  return CANAIS.filter((canal) => Boolean(d.contato[canal]));
}

export function montarConteudo(entrada: unknown, fixture: NomeFixture | null = null): Conteudo {
  const resultado = organizacaoSchema.safeParse(entrada);
  if (!resultado.success) {
    throw new Error(`Dados da organização inválidos:\n${z.prettifyError(resultado.error)}`);
  }
  const dados = resultado.data;
  const renderizadas = new Set((Object.keys(REGRAS) as IdSecao[]).filter((id) => REGRAS[id](dados)));
  return {
    dados,
    fixture,
    secoes: numerarSecoes(renderizadas),
    renderizadas,
    comandos: comandosAtivos(renderizadas),
  };
}

let avisosExibidos = false;

/** Usa os dados de exemplo só quando FIXTURE estiver definida. */
export function carregarConteudo(fixture: string | undefined = process.env.FIXTURE): Conteudo {
  let entrada: unknown = organizacao;
  let nome: NomeFixture | null = null;
  if (fixture) {
    if (!ehFixture(fixture)) {
      throw new Error(`FIXTURE inválida: "${fixture}". Use: ${Object.keys(exemplos).join(', ')}.`);
    }
    entrada = exemplos[fixture];
    nome = fixture;
  }
  const conteudo = montarConteudo(entrada, nome);
  if (!avisosExibidos) {
    avisosExibidos = true;
    for (const aviso of verificarOrcamentos(conteudo.dados)) console.warn(`aviso: orçamento de layout excedido — ${aviso}`);
  }
  return conteudo;
}

export interface LinkCanal {
  canal: Canal;
  /** `null` quando o valor ainda é uma pendência. */
  href: string | null;
  exibicao: string;
  externo: boolean;
}

function formatarWhatsapp(digitos: string): string {
  const m = /^55(\d{2})(\d{4,5})(\d{4})$/.exec(digitos);
  return m ? `+55 ${m[1]} ${m[2]}-${m[3]}` : `+${digitos}`;
}

export function linkCanal(canal: Canal, d: Organizacao): LinkCanal | null {
  const valor = d.contato[canal];
  if (!valor) return null;
  if (ehPendente(valor)) return { canal, href: null, exibicao: valor, externo: false };
  switch (canal) {
    case 'email':
      return { canal, href: `mailto:${valor}`, exibicao: valor, externo: false };
    case 'telefone':
      return { canal, href: `tel:${valor.replace(/[^\d+]/g, '')}`, exibicao: valor, externo: false };
    case 'whatsapp':
      return { canal, href: `https://wa.me/${valor}`, exibicao: formatarWhatsapp(valor), externo: true };
    case 'linkedin':
      return { canal, href: valor, exibicao: valor.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, ''), externo: true };
  }
}

export const ROTULO_CANAL: Record<Canal, string> = {
  email: 'e-mail',
  telefone: 'telefone',
  whatsapp: 'whatsapp',
  linkedin: 'linkedin',
};

/** Complemento para leitores de tela: o que acontece ao ativar o link. */
export const ACAO_CANAL: Record<Canal, string> = {
  email: 'abre o aplicativo de e-mail',
  telefone: 'inicia uma ligação',
  whatsapp: 'abre o WhatsApp',
  linkedin: 'abre o LinkedIn',
};

/** Canal usado pelo CTA principal da seção de contato. */
const PRIORIDADE_CTA: readonly Canal[] = ['email', 'whatsapp', 'telefone', 'linkedin'];

export function canalPrincipal(d: Organizacao): LinkCanal | null {
  for (const canal of PRIORIDADE_CTA) {
    const link = linkCanal(canal, d);
    if (link?.href) return link;
  }
  return null;
}

export interface LinkProximoPasso {
  href: string | null;
  externo: boolean;
  canal: Canal | null;
}

export function linkProximoPasso(passo: Servico['proximoPasso'], d: Organizacao): LinkProximoPasso {
  if (passo.destino === 'contato') return { href: '#contato', externo: false, canal: null };
  const link = linkCanal(passo.destino, d);
  return { href: link?.href ?? null, externo: link?.externo ?? false, canal: passo.destino };
}

export function slug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
