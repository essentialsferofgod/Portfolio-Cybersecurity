/**
 * Servidor estático mínimo para as verificações (e2e, Lighthouse, capturas).
 * Ao contrário de `astro preview`, permite várias instâncias ao mesmo tempo,
 * uma por variante de dist-verificacao/.
 * Com --cabecalhos, aplica os cabeçalhos de vercel.json (CSP e demais), para testar a
 * política localmente; a validação definitiva continua sendo um deploy de preview.
 * Uso: node scripts/servir.ts <pasta> <porta> [--cabecalhos]
 */
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';

const [pasta = 'dist-verificacao/completo', porta = '4321', opcao] = process.argv.slice(2);
const raiz = resolve(pasta);

interface RegraVercel {
  source: string;
  headers: { key: string; value: string }[];
}

const regras: RegraVercel[] =
  opcao === '--cabecalhos' ? (JSON.parse(readFileSync('vercel.json', 'utf8')) as { headers: RegraVercel[] }).headers : [];

function cabecalhosPara(caminho: string): Record<string, string> {
  const cabecalhos: Record<string, string> = {};
  for (const regra of regras) {
    if (new RegExp(`^${regra.source}$`).test(caminho)) {
      for (const { key, value } of regra.headers) cabecalhos[key] = value;
    }
  }
  return cabecalhos;
}

const TIPOS: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function arquivoPara(caminhoUrl: string): string | null {
  const relativo = normalize(decodeURIComponent(caminhoUrl.split('?')[0] ?? '/'));
  const candidato = join(raiz, relativo);
  if (candidato !== raiz && !candidato.startsWith(raiz + sep)) return null;
  for (const opcao of [candidato, join(candidato, 'index.html'), `${candidato}.html`]) {
    if (existsSync(opcao) && statSync(opcao).isFile()) return opcao;
  }
  return null;
}

createServer((req, res) => {
  const arquivo = arquivoPara(req.url ?? '/');
  const destino = arquivo ?? join(raiz, '404.html');
  res.writeHead(arquivo ? 200 : 404, {
    ...cabecalhosPara((req.url ?? '/').split('?')[0] ?? '/'),
    'content-type': TIPOS[extname(destino)] ?? 'application/octet-stream',
  });
  createReadStream(destino).pipe(res);
}).listen(Number(porta), () => console.log(`servindo ${pasta} em http://localhost:${porta}`));
