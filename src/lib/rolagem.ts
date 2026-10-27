/**
 * Rolagem conduzida pelo terminal e pelos CTAs: ~600 ms com desaceleração, ou instantânea
 * com prefers-reduced-motion. Respeita o scroll-padding-top do <html> (cabeçalho fixo).
 * Ao terminar, foca o alvo sem rolar de novo.
 */
const DURACAO = 600;

export function rolarAte(alvo: HTMLElement, foco?: HTMLElement | null): void {
  const folga = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const destino = Math.max(0, alvo.getBoundingClientRect().top + scrollY - folga);
  const focar = () => foco?.focus({ preventScroll: true });

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    scrollTo(0, destino);
    focar();
    return;
  }

  const inicio = scrollY;
  const distancia = destino - inicio;
  const comeco = performance.now();
  const quadro = (agora: number) => {
    const p = Math.min(1, (agora - comeco) / DURACAO);
    scrollTo(0, inicio + distancia * (1 - (1 - p) ** 3));
    if (p < 1) requestAnimationFrame(quadro);
    else focar();
  };
  requestAnimationFrame(quadro);
}
