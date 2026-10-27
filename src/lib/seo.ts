/** Metadados derivados do conteúdo (seção 12). Só dados reais; nunca Review ou AggregateRating. */
import { ehPendente, type Organizacao } from '../content/schema.ts';
import type { Conteudo } from './conteudo.ts';

export function cortar(texto: string, limite: number): string {
  if (texto.length <= limite) return texto;
  const corte = texto.slice(0, limite - 1);
  const ultimoEspaco = corte.lastIndexOf(' ');
  return `${(ultimoEspaco > limite * 0.6 ? corte.slice(0, ultimoEspaco) : corte).replace(/[\s,.;:—-]+$/, '')}…`;
}

/** `<nome> — <proposta resumida>`, com até 60 caracteres. */
export function tituloPagina(d: Organizacao): string {
  const prefixo = `${d.nome} — `;
  const espaco = 60 - prefixo.length;
  if (espaco < 12) return cortar(d.nome, 60);
  return prefixo + cortar(d.propostaDeValor.replace(/\.$/, ''), espaco);
}

/** A partir do subtítulo (ou da proposta de valor), com até 155 caracteres. */
export function descricaoPagina(d: Organizacao): string {
  return cortar(d.subtitulo ?? d.propostaDeValor, 155);
}

/** Domínio próprio: `siteUrl` em organizacao.ts ou a variável SITE_URL. Sem ele, nada de URL absoluta. */
export function urlDoSite(d: Organizacao): string | undefined {
  const url = d.siteUrl && !ehPendente(d.siteUrl) ? d.siteUrl : process.env.SITE_URL;
  return url ? url.replace(/\/+$/, '') : undefined;
}

type Valor = string | number | boolean | Valor[] | { [chave: string]: Valor | undefined } | undefined;

/** Remove campos vazios e pendências, para o JSON-LD conter só dados reais. */
function limpar<T extends { [chave: string]: Valor }>(objeto: T): T {
  return Object.fromEntries(
    Object.entries(objeto).filter(([, v]) => v !== undefined && !ehPendente(v) && !(Array.isArray(v) && v.length === 0)),
  ) as T;
}

export function dadosEstruturados(conteudo: Conteudo, siteUrl: string | undefined): object[] {
  const { dados: d, renderizadas } = conteudo;
  const c = d.contato;
  const estruturados: object[] = [
    limpar({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: d.nome,
      legalName: d.razaoSocial,
      taxID: d.cnpj,
      description: d.propostaDeValor,
      url: siteUrl ? `${siteUrl}/` : undefined,
      email: c.email,
      telephone: c.telefone,
      address: c.endereco,
      sameAs: c.linkedin && !ehPendente(c.linkedin) ? [c.linkedin] : undefined,
    }),
  ];
  if (renderizadas.has('faq')) {
    estruturados.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: d.faq.map((p) => ({
        '@type': 'Question',
        name: p.pergunta,
        acceptedAnswer: { '@type': 'Answer', text: p.resposta },
      })),
    });
  }
  return estruturados;
}

/** JSON seguro dentro de <script type="application/ld+json">. */
export function serializarJsonLd(dados: object): string {
  return JSON.stringify(dados).replace(/</g, '\\u003c');
}
