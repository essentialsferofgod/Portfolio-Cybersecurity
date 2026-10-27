/** robots.txt; a linha de sitemap só existe com domínio próprio (seção 12). */
import type { APIRoute } from 'astro';
import { carregarConteudo } from '../lib/conteudo.ts';
import { urlDoSite } from '../lib/seo.ts';

export const GET: APIRoute = () => {
  const site = urlDoSite(carregarConteudo().dados);
  const linhas = ['User-agent: *', 'Allow: /', ...(site ? ['', `Sitemap: ${site}/sitemap.xml`] : [])];
  return new Response(`${linhas.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
