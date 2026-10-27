/**
 * Verificações estáticas sobre dist-verificacao/ (seção 15):
 * V10 orçamento de JS · V11 código inline incompatível com a CSP · V12 linguagem proibida · V13 links.
 * Uso: node scripts/verificar-build.ts (depois de npm run build:verificacao)
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { CANAIS } from '../src/content/schema.ts';
import { carregarConteudo, linkCanal } from '../src/lib/conteudo.ts';

const BASE = 'dist-verificacao';
const ORCAMENTO_JS = 15 * 1024;

/** R3 (promessas absolutas) e R2 (dados operacionais simulados). */
const PROIBIDAS = [
  'proteção total',
  '100% seguro',
  'à prova de ataques',
  'risco zero',
  'garantimos conformidade',
  'sistema seguro',
  '0 incidentes',
  'uptime',
];

const normalizar = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function arquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    return statSync(caminho).isDirectory() ? arquivos(caminho) : [caminho];
  });
}

function decodificar(href: string): string {
  return href.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
}

let falhas = 0;
const falhar = (mensagem: string) => {
  falhas++;
  console.log(`  FALHA ${mensagem}`);
};

if (!existsSync(BASE)) {
  console.error('dist-verificacao/ não existe: rode npm run build:verificacao antes.');
  process.exit(1);
}

for (const variante of readdirSync(BASE)) {
  const dir = join(BASE, variante);
  const todos = arquivos(dir);
  const paginas = todos.filter((f) => f.endsWith('.html'));
  console.log(`\n${variante}`);

  // V10 — soma dos scripts, gzip.
  const scripts = todos.filter((f) => f.endsWith('.js'));
  const totalGzip = scripts.reduce((soma, f) => soma + gzipSync(readFileSync(f)).length, 0);
  console.log(`  V10 JS: ${scripts.length} arquivo(s), ${(totalGzip / 1024).toFixed(2)} KB gzip (orçamento 15 KB)`);
  if (totalGzip > ORCAMENTO_JS) falhar('V10 orçamento de JS excedido');

  // V13 — destinos externos permitidos: só os que vêm dos dados da variante.
  const { dados } = carregarConteudo(variante);
  const permitidos = new Set<string>([
    ...CANAIS.flatMap((c) => linkCanal(c, dados)?.href ?? []),
    ...dados.confianca.map((i) => i.urlVerificacao),
    ...(dados.contato.contatoSeguranca ? [`mailto:${dados.contato.contatoSeguranca}`] : []),
    ...(dados.legal.politicaPrivacidadeUrl ? [dados.legal.politicaPrivacidadeUrl] : []),
  ]);

  for (const pagina of paginas) {
    const html = readFileSync(pagina, 'utf8');
    const nome = pagina.slice(dir.length + 1);

    // V11 — nada inline que a CSP bloquearia (JSON-LD é bloco de dados, não executa).
    const scriptsInline = [...html.matchAll(/<script\b([^>]*)>/g)].filter(
      ([, atributos]) => !/\bsrc=/.test(atributos!) && !/type="application\/ld\+json"/.test(atributos!),
    ).length;
    const estilos = (html.match(/<style\b/g) ?? []).length;
    const atributosStyle = (html.match(/\sstyle="/g) ?? []).length;
    const eventos = (html.match(/\son[a-z]+="/g) ?? []).length;
    const inline = scriptsInline + estilos + atributosStyle + eventos;
    console.log(
      `  V11 ${nome}: script inline ${scriptsInline}, <style> ${estilos}, style="" ${atributosStyle}, on*="" ${eventos}`,
    );
    if (inline > 0) falhar(`V11 código inline em ${nome}`);

    // V12 — linguagem proibida no texto e nos atributos.
    const texto = normalizar(html);
    const encontradas = PROIBIDAS.filter((p) => texto.includes(normalizar(p)));
    console.log(`  V12 ${nome}: ${encontradas.length} ocorrência(s) proibida(s)`);
    if (encontradas.length) falhar(`V12 ${encontradas.join(', ')} em ${nome}`);

    // V13 — âncoras apontam para IDs existentes; externos só dos dados.
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    const idsInicio = new Set(
      [...readFileSync(join(dir, 'index.html'), 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]),
    );
    const hrefs = [...html.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)].map((m) => decodificar(m[1]!));
    let quebrados = 0;
    for (const href of hrefs) {
      if (href.startsWith('#')) {
        if (!ids.has(href.slice(1))) quebrados++, falhar(`V13 âncora sem destino ${href} em ${nome}`);
      } else if (href.startsWith('/')) {
        const [caminho, ancora] = href.split('#');
        if (caminho !== '/' || (ancora && !idsInicio.has(ancora))) quebrados++, falhar(`V13 link interno ${href} em ${nome}`);
      } else if (!permitidos.has(href)) {
        quebrados++;
        falhar(`V13 link externo fora de organizacao.ts: ${href} em ${nome}`);
      }
    }
    console.log(`  V13 ${nome}: ${hrefs.length} links, ${quebrados} quebrado(s) ou não autorizado(s)`);
  }
}

console.log(falhas ? `\n${falhas} falha(s).` : '\nV10, V11, V12 e V13: todas as checagens passaram.');
process.exit(falhas ? 1 : 0);
