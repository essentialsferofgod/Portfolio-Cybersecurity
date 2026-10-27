/**
 * Fundo do hero: grade de caracteres de terminal (. + 0 1) que acende perto do mouse e é
 * varrida por uma linha que desce conforme a página rola. Só redesenha quando o ponteiro
 * ou a rolagem mudam (sem laço contínuo), e pausa fora da tela. Decorativo (aria-hidden).
 */
const CARACTERES = ['.', '.', '.', '+', '·', '0', '1'];
const PASSO = 26;
const RAIO = 170;
const BANDA = 90;

export function iniciarFundo(canvas: HTMLCanvasElement, area: HTMLElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const estilo = getComputedStyle(document.documentElement);
  const corBase = estilo.getPropertyValue('--color-text-muted').trim() || '#8a8a87';
  const corAcento = estilo.getPropertyValue('--color-accent').trim() || '#aaff00';

  let largura = 0;
  let altura = 0;
  let ponteiro = { x: -9999, y: -9999 };
  let visivel = true;
  let agendado = false;
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)');

  function semente(coluna: number, linha: number): string {
    return CARACTERES[(coluna * 7 + linha * 13 + ((coluna * linha) % 5)) % CARACTERES.length] ?? '.';
  }

  function desenhar(): void {
    agendado = false;
    ctx!.clearRect(0, 0, largura, altura);
    ctx!.font = '12px "JetBrains Mono", ui-monospace, monospace';
    ctx!.textAlign = 'center';
    ctx!.textBaseline = 'middle';
    const topo = area.getBoundingClientRect().top;
    // Linha de varredura: acompanha a rolagem dentro do hero.
    const varredura = reduzir.matches ? -9999 : -topo * 1.15 + 140;
    for (let linha = 0, y = PASSO / 2; y < altura; linha++, y += PASSO) {
      for (let coluna = 0, x = PASSO / 2; x < largura; coluna++, x += PASSO) {
        const d = Math.hypot(x - ponteiro.x, y - ponteiro.y);
        const proximo = Math.max(0, 1 - d / RAIO);
        const onda = Math.max(0, 1 - Math.abs(y - varredura) / BANDA);
        const forca = Math.max(proximo, onda * 0.7);
        ctx!.globalAlpha = 0.1 + forca * 0.8;
        ctx!.fillStyle = forca > 0.35 ? corAcento : corBase;
        ctx!.fillText(forca > 0.55 ? (coluna + linha) % 2 ? '1' : '0' : semente(coluna, linha), x, y);
      }
    }
    ctx!.globalAlpha = 1;
  }

  function agendar(): void {
    if (agendado || !visivel) return;
    agendado = true;
    requestAnimationFrame(desenhar);
  }

  function ajustar(): void {
    const caixa = area.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    largura = caixa.width;
    altura = caixa.height;
    canvas.width = Math.round(largura * dpr);
    canvas.height = Math.round(altura * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    agendar();
  }

  addEventListener('resize', ajustar);
  addEventListener('scroll', agendar, { passive: true });
  if (!reduzir.matches) {
    area.addEventListener('pointermove', (e) => {
      const caixa = area.getBoundingClientRect();
      ponteiro = { x: e.clientX - caixa.left, y: e.clientY - caixa.top };
      agendar();
    });
    area.addEventListener('pointerleave', () => {
      ponteiro = { x: -9999, y: -9999 };
      agendar();
    });
  }
  new IntersectionObserver((itens) => {
    visivel = itens.some((i) => i.isIntersecting);
    agendar();
  }).observe(area);
  document.fonts?.ready.then(ajustar);
  ajustar();
}
