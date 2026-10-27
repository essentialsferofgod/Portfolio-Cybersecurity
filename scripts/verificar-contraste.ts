/**
 * V04 — contraste dos pares de tokens usados (WCAG 2.2: 1.4.3 e 1.4.11).
 * Lê as cores de src/styles/tokens.css, calcula a razão de contraste de cada par
 * e falha se algum par de texto ficar abaixo de 4.5:1 ou de componente/foco abaixo de 3:1.
 * Também falha se --color-detail aparecer como cor de texto ou borda no código.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));

type Token = 'bg' | 'surface' | 'line' | 'detail' | 'text' | 'text-muted' | 'accent' | 'error';
type Tipo = 'texto' | 'componente' | 'decorativo';

interface Par {
  frente: Token;
  fundo: Token;
  tipo: Tipo;
  uso: string;
}

const MINIMO: Record<Tipo, number> = { texto: 4.5, componente: 3, decorativo: 0 };

const PARES: Par[] = [
  { frente: 'text', fundo: 'bg', tipo: 'texto', uso: 'texto principal' },
  { frente: 'text', fundo: 'surface', tipo: 'texto', uso: 'texto no painel do terminal' },
  { frente: 'text-muted', fundo: 'bg', tipo: 'texto', uso: 'texto secundário e rótulos' },
  { frente: 'text-muted', fundo: 'surface', tipo: 'texto', uso: 'rótulos e saída no terminal' },
  { frente: 'accent', fundo: 'surface', tipo: 'texto', uso: 'glifo do prompt ($) no terminal' },
  { frente: 'bg', fundo: 'accent', tipo: 'texto', uso: 'texto do CTA principal' },
  { frente: 'error', fundo: 'bg', tipo: 'texto', uso: 'mensagens de erro' },
  { frente: 'error', fundo: 'surface', tipo: 'texto', uso: 'erro no terminal' },
  { frente: 'accent', fundo: 'bg', tipo: 'componente', uso: 'anel de foco e marca de seção ativa' },
  { frente: 'accent', fundo: 'surface', tipo: 'componente', uso: 'anel de foco e caret no terminal' },
  { frente: 'text', fundo: 'bg', tipo: 'componente', uso: 'borda do CTA em contorno' },
  { frente: 'text-muted', fundo: 'bg', tipo: 'componente', uso: 'borda do CTA secundário e de campos' },
  { frente: 'text-muted', fundo: 'surface', tipo: 'componente', uso: 'borda do campo e dos chips' },
  { frente: 'accent', fundo: 'bg', tipo: 'componente', uso: 'CTA principal contra o fundo' },
  { frente: 'line', fundo: 'bg', tipo: 'decorativo', uso: 'filetes' },
  { frente: 'detail', fundo: 'bg', tipo: 'decorativo', uso: 'marcas decorativas' },
];

export function lerTokens(css: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const m of css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    tokens[m[1]!] = m[2]!.toLowerCase();
  }
  return tokens;
}

function luminancia(hex: string): number {
  const canais = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = canais.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [
    number,
    number,
    number,
  ];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a: string, b: string): number {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x) as [number, number];
  return (claro + 0.05) / (escuro + 0.05);
}

function arquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    return statSync(caminho).isDirectory() ? arquivos(caminho) : [caminho];
  });
}

function main(): void {
  const tokens = lerTokens(readFileSync(join(RAIZ, 'src/styles/tokens.css'), 'utf8'));
  let falhas = 0;

  console.log('V04 — contraste dos tokens\n');
  console.log('par'.padEnd(26) + 'razão'.padStart(8) + '  mínimo  resultado  uso');
  for (const par of PARES) {
    const frente = tokens[par.frente];
    const fundo = tokens[par.fundo];
    if (!frente || !fundo) {
      console.log(`erro: token ausente em tokens.css: ${!frente ? par.frente : par.fundo}`);
      falhas++;
      continue;
    }
    const razao = contraste(frente, fundo);
    const minimo = MINIMO[par.tipo];
    const ok = razao >= minimo;
    if (!ok) falhas++;
    const resultado = par.tipo === 'decorativo' ? 'decorativo' : ok ? 'ok' : 'FALHA';
    console.log(
      `${par.frente} / ${par.fundo}`.padEnd(26) +
        `${razao.toFixed(2)}:1`.padStart(8) +
        `  ${minimo ? `${minimo}:1` : '—'}`.padEnd(10) +
        resultado.padEnd(11) +
        par.uso,
    );
  }

  // --color-detail nunca pode ser texto nem borda de componente.
  // Fundo de marca decorativa (background-color) é permitido; cor de texto, borda e contorno, não.
  const usoProibido =
    /\b(text|border|outline|ring)-detail\b|(^|[^-])color:\s*var\(--color-detail\)|(border|outline)(-[a-z]+)?:[^;]*var\(--color-detail\)/;
  for (const arquivo of arquivos(join(RAIZ, 'src'))) {
    if (!/\.(astro|ts|css)$/.test(arquivo) || arquivo.endsWith('tokens.css')) continue;
    readFileSync(arquivo, 'utf8')
      .split('\n')
      .forEach((linha, i) => {
        if (usoProibido.test(linha)) {
          console.log(`erro: --color-detail usado como texto ou borda em ${relative(RAIZ, arquivo)}:${i + 1}`);
          falhas++;
        }
      });
  }

  console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os pares atendem aos mínimos.');
  process.exit(falhas ? 1 : 0);
}

main();
