/** Metadados derivados do conteúdo (seção 12). Só dados reais; nunca Review ou AggregateRating. */
import { ehPendente, type Organizacao } from '../content/schema.ts';
import type { Conteudo } from './conteudo.ts';

export function cortar(texto: string, limite: number): string {
  if (texto.length <= limite) return texto;
  const corte = texto.slice(0, limite - 1);
  const ultimoEspaco = corte.lastIndexOf(' ');
  return `${(ultimoEspaco > limite * 0.6 ? corte.slice(0, ultimoEspaco) : corte).replace(/[\s,.;:—-]+$/, '')}…`;
}

/**
 * Título com até 60 caracteres, sempre completo: `seo.titulo` se existir; senão
 * `<nome> — <proposta>` quando couber inteiro; senão só o nome. Nunca corta com "…".
 */
export function tituloPagina(d: Organizacao): string {
  if (d.seo?.titulo) return d.seo.titulo;
  const completo = `${d.nome} — ${d.propostaDeValor.replace(/\.$/, '')}`;
  return completo.length <= 60 ? completo : d.nome;
}

/** Descrição com até 155 caracteres, sempre uma frase inteira (sem "…"). */
export function descricaoPagina(d: Organizacao): string {
  const opcoes = [d.seo?.descricao, d.subtitulo, d.propostaDeValor];
  return opcoes.find((t): t is string => Boolean(t) && t!.length <= 155) ?? d.nome;
}

/**
 * URL do site, para canonical, og:url e og:image absolutos. Ordem: `siteUrl` em
 * organizacao.ts, a variável SITE_URL e, nos builds da Vercel, o domínio de produção
 * do projeto (VERCEL_PROJECT_PRODUCTION_URL, sem protocolo). Sem nenhum: sem URL absoluta.
 */
export function urlDoSite(d: Organizacao): string | undefined {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const url =
    d.siteUrl && !ehPendente(d.siteUrl) ? d.siteUrl : (process.env.SITE_URL ?? (vercel ? `https://${vercel}` : undefined));
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
