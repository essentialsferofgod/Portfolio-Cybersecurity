/**
 * Gera public/og.png (1200×630), a imagem de prévia para redes, no estilo do site:
 * fundo #0a0a0a, grade de pontos, proposta de valor em Schibsted Grotesk e linha de
 * terminal em JetBrains Mono. Usa o Chrome via Playwright, já presente no projeto.
 * Rode de novo se o nome ou a proposta de valor mudarem: node scripts/gerar-og.ts
 */
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { organizacao } from '../src/content/organizacao.ts';

const fonte = (arquivo: string) => readFileSync(`public/fonts/${arquivo}`).toString('base64');
const escapar = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const slug = organizacao.nome
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: S; src: url(data:font/woff2;base64,${fonte('schibsted-grotesk-latin-600-normal.woff2')}) format('woff2'); font-weight: 600; }
@font-face { font-family: M; src: url(data:font/woff2;base64,${fonte('jetbrains-mono-latin-400-normal.woff2')}) format('woff2'); font-weight: 400; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #0a0a0a; color: #f2f2f0; position: relative; overflow: hidden; }
.pontos { position: absolute; inset: 0; background-image: radial-gradient(#3a5a00 1.6px, transparent 1.6px); background-size: 24px 24px;
  -webkit-mask-image: linear-gradient(120deg, transparent 35%, #000 95%); }
.quadro { position: absolute; inset: 56px 64px; display: flex; flex-direction: column; justify-content: space-between; }
.topo, .base { font-family: M; font-size: 24px; white-space: nowrap; color: #8a8a87; display: flex; justify-content: space-between; }
.topo { border-bottom: 2px solid #232323; padding-bottom: 20px; }
.cifrao { color: #aaff00; }
h1 { font-family: S; font-weight: 600; font-size: 84px; line-height: 1.02; letter-spacing: -0.03em; max-width: 960px; }
.cursor { display: inline-block; width: 0.42ch; height: 0.78em; background: #aaff00; margin-left: 0.12em; vertical-align: -0.04em; }
.selo { border: 2px solid #8a8a87; color: #f2f2f0; padding: 2px 14px; }
</style></head><body><div class="pontos"></div><div class="quadro">
<div class="topo"><span>~/${slug}</span><span class="selo">demonstração</span></div>
<h1>${escapar(organizacao.propostaDeValor)}<span class="cursor"></span></h1>
<div class="base"><span><span class="cifrao">$</span> ${escapar(organizacao.nome.toLowerCase())} · cibersegurança</span><span>ofensiva / inteligência / resiliência</span></div>
</div></body></html>`;

const navegador = await chromium.launch({ channel: 'chrome' });
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
await pagina.setContent(html);
await pagina.evaluate(() => document.fonts.ready);
await pagina.screenshot({ path: 'public/og.png' });
await navegador.close();
console.log('public/og.png gerado (1200×630)');
