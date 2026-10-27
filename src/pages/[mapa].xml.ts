/**
 * sitemap.xml, gerado só com domínio próprio. Com uma única página, um endpoint
 * dispensa a dependência @astrojs/sitemap.
 */
import type { APIRoute } from 'astro';
import { carregarConteudo } from '../lib/conteudo.ts';
import { urlDoSite } from '../lib/seo.ts';

export function getStaticPaths() {
  return urlDoSite(carregarConteudo().dados) ? [{ params: { mapa: 'sitemap' } }] : [];
}

export const GET: APIRoute = () => {
  const site = urlDoSite(carregarConteudo().dados);
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <url><loc>${site}/</loc></url>`,
    '</urlset>',
  ].join('\n');
  return new Response(`${xml}\n`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
