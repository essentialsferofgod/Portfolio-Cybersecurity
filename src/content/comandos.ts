/**
 * Registro único de seções e comandos (seção 9.2).
 * Menu do cabeçalho, chips, saída de `help` e o próprio terminal derivam daqui.
 * Uma seção só aparece, e seu comando só existe, se ela for renderizada.
 */

export type IdSecao =
  | 'problema'
  | 'servicos'
  | 'laboratorio'
  | 'abordagem'
  | 'principios'
  | 'sobre'
  | 'depoimentos'
  | 'confianca'
  | 'faq'
  | 'contato';

export interface DefinicaoSecao {
  id: IdSecao;
  /** Título visível (h2). */
  titulo: string;
  /** Rótulo curto em mono, usado no menu e em `01 / serviços`. */
  rotulo: string;
  /** Aparece no menu do cabeçalho (seções de apoio ficam fora para o menu caber). */
  menu: boolean;
}

/** Ordem da arquitetura de informação (seção 5). */
export const SECOES: readonly DefinicaoSecao[] = [
  { id: 'problema', titulo: 'O problema', rotulo: 'problema', menu: false },
  { id: 'servicos', titulo: 'Serviços', rotulo: 'serviços', menu: true },
  { id: 'laboratorio', titulo: 'Laboratório', rotulo: 'laboratório', menu: true },
  { id: 'abordagem', titulo: 'Metodologia', rotulo: 'metodologia', menu: true },
  { id: 'principios', titulo: 'Princípios', rotulo: 'princípios', menu: false },
  { id: 'sobre', titulo: 'Sobre', rotulo: 'sobre', menu: true },
  { id: 'depoimentos', titulo: 'Depoimentos', rotulo: 'depoimentos', menu: false },
  { id: 'confianca', titulo: 'Confiança', rotulo: 'confiança', menu: false },
  { id: 'faq', titulo: 'Perguntas frequentes', rotulo: 'faq', menu: true },
  { id: 'contato', titulo: 'Contato', rotulo: 'contato', menu: true },
];

export interface DefinicaoComando {
  nome: string;
  aliases: readonly string[];
  /** Seção que o comando resume; `null` para comandos gerais. */
  secao: IdSecao | null;
  descricao: string;
}

/** A ordem também desempata sugestões (seção 9.3). */
export const COMANDOS: readonly DefinicaoComando[] = [
  { nome: 'help', aliases: ['ajuda'], secao: null, descricao: 'lista os comandos' },
  { nome: 'services', aliases: ['servicos'], secao: 'servicos', descricao: 'serviços oferecidos' },
  { nome: 'lab', aliases: ['laboratorio'], secao: 'laboratorio', descricao: 'simulação de rede' },
  { nome: 'approach', aliases: ['abordagem', 'metodologia'], secao: 'abordagem', descricao: 'como o trabalho acontece' },
  { nome: 'about', aliases: ['sobre'], secao: 'sobre', descricao: 'sobre a organização' },
  { nome: 'faq', aliases: [], secao: 'faq', descricao: 'perguntas frequentes' },
  { nome: 'contact', aliases: ['contato'], secao: 'contato', descricao: 'canais de contato' },
  { nome: 'clear', aliases: ['limpar'], secao: null, descricao: 'limpa a saída' },
];

export interface SecaoNumerada extends DefinicaoSecao {
  /** "01", "02"… recalculado sem lacunas. */
  numero: string;
}

export function numerarSecoes(renderizadas: ReadonlySet<IdSecao>): SecaoNumerada[] {
  return SECOES.filter((s) => renderizadas.has(s.id)).map((s, i) => ({
    ...s,
    numero: String(i + 1).padStart(2, '0'),
  }));
}

export function comandosAtivos(renderizadas: ReadonlySet<IdSecao>): DefinicaoComando[] {
  return COMANDOS.filter((c) => c.secao === null || renderizadas.has(c.secao));
}
