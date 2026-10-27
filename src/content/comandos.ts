/**
 * Registro único de seções e comandos (seção 9.2).
 * Menu do cabeçalho, chips, saída de `help` e o próprio terminal derivam daqui.
 * Uma seção só aparece, e seu comando só existe, se ela for renderizada.
 */

export type IdSecao = 'servicos' | 'abordagem' | 'sobre' | 'confianca' | 'faq' | 'contato';

export interface DefinicaoSecao {
  id: IdSecao;
  /** Título visível (h2). */
  titulo: string;
  /** Rótulo curto em mono, usado no menu e em `01 / serviços`. */
  rotulo: string;
}

/** Ordem da arquitetura de informação (seção 5). */
export const SECOES: readonly DefinicaoSecao[] = [
  { id: 'servicos', titulo: 'Serviços', rotulo: 'serviços' },
  { id: 'abordagem', titulo: 'Abordagem', rotulo: 'abordagem' },
  { id: 'sobre', titulo: 'Sobre', rotulo: 'sobre' },
  { id: 'confianca', titulo: 'Confiança', rotulo: 'confiança' },
  { id: 'faq', titulo: 'Perguntas frequentes', rotulo: 'faq' },
  { id: 'contato', titulo: 'Contato', rotulo: 'contato' },
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
  { nome: 'approach', aliases: ['abordagem'], secao: 'abordagem', descricao: 'como o trabalho acontece' },
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
