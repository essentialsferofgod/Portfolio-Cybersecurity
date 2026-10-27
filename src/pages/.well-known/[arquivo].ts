/**
 * /.well-known/security.txt (RFC 9116), gerado só quando `contato.contatoSeguranca` existe.
 * Expires fica a 364 dias da data do build: publicar de novo renova o prazo.
 */
import type { APIRoute } from 'astro';
import { ehPendente } from '../../content/schema.ts';
import { carregarConteudo } from '../../lib/conteudo.ts';
import { urlDoSite } from '../../lib/seo.ts';

function contatoSeguranca(): string | null {
  const contato = carregarConteudo().dados.contato.contatoSeguranca;
  return contato && !ehPendente(contato) ? contato : null;
}

export function getStaticPaths() {
  return contatoSeguranca() ? [{ params: { arquivo: 'security.txt' } }] : [];
}

export const GET: APIRoute = () => {
  const site = urlDoSite(carregarConteudo().dados);
  const expira = new Date(Date.now() + 364 * 24 * 60 * 60 * 1000);
  expira.setUTCHours(0, 0, 0, 0);
  const linhas = [
    `Contact: mailto:${contatoSeguranca()}`,
    `Expires: ${expira.toISOString()}`,
    'Preferred-Languages: pt, en',
    ...(site ? [`Canonical: ${site}/.well-known/security.txt`] : []),
  ];
  return new Response(`${linhas.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
