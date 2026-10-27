/**
 * Rolagem conduzida pelo terminal e pelos CTAs: ~600 ms com desaceleração, ou instantânea
 * com prefers-reduced-motion. Respeita o scroll-padding-top do <html> (cabeçalho fixo).
 * Ao terminar, foca o alvo sem rolar de novo.
 */
const DURACAO = 600;

/** Rola até a posição vertical `destino` (px do documento). */
export function rolarPara(destino: number, foco?: HTMLElement | null): void {
  const alvoY = Math.max(0, Math.min(destino, document.documentElement.scrollHeight - innerHeight));
  const focar = () => foco?.focus({ preventScroll: true });

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    scrollTo(0, alvoY);
    focar();
    return;
  }

  const inicio = scrollY;
  const distancia = alvoY - inicio;
  const comeco = performance.now();
  const quadro = (agora: number) => {
    const p = Math.min(1, (agora - comeco) / DURACAO);
    scrollTo(0, inicio + distancia * (1 - (1 - p) ** 3));
    if (p < 1) requestAnimationFrame(quadro);
    else focar();
  };
  requestAnimationFrame(quadro);
}

/** Rola até o topo de `alvo`, descontando o cabeçalho fixo. */
export function rolarAte(alvo: HTMLElement, foco?: HTMLElement | null): void {
  const folga = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  rolarPara(alvo.getBoundingClientRect().top + scrollY - folga, foco);
}
