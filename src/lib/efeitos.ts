/**
 * Efeitos ligados à rolagem, com linguagem de terminal: entrada linha a linha, prompt
 * digitado, contadores, faixa de comandos e barra de progresso. Tudo é decorativo:
 * o conteúdo já está no HTML, e com prefers-reduced-motion nada anima.
 */

const reduzir = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function entradas(): void {
  const alvos = [...document.querySelectorAll<HTMLElement>('[data-revelar]')];
  for (const alvo of alvos) {
    if (alvo.dataset.atraso) alvo.style.setProperty('--atraso', `${alvo.dataset.atraso}ms`);
  }
  if (reduzir() || !('IntersectionObserver' in window)) {
    alvos.forEach((a) => a.classList.add('revelado'));
    return;
  }
  const observador = new IntersectionObserver(
    (itens) => {
      for (const item of itens) {
        if (!item.isIntersecting) continue;
        item.target.classList.add('revelado');
        observador.unobserve(item.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  alvos.forEach((a) => observador.observe(a));
}

/** Digita o texto de `data-digitar` quando o elemento entra na tela. */
function digitacao(): void {
  const alvos = [...document.querySelectorAll<HTMLElement>('[data-digitar]')];
  if (reduzir() || !('IntersectionObserver' in window)) return;

  for (const alvo of alvos) alvo.textContent = '';
  const observador = new IntersectionObserver(
    (itens) => {
      for (const item of itens) {
        if (!item.isIntersecting) continue;
        const alvo = item.target as HTMLElement;
        observador.unobserve(alvo);
        const texto = alvo.dataset.digitar ?? '';
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        alvo.append(cursor);
        let i = 0;
        const passo = () => {
          i++;
          alvo.firstChild instanceof Text
            ? (alvo.firstChild.data = texto.slice(0, i))
            : alvo.prepend(document.createTextNode(texto.slice(0, i)));
          if (i < texto.length) setTimeout(passo, 38);
          else setTimeout(() => cursor.remove(), 1400);
        };
        setTimeout(passo, 160);
      }
    },
    { threshold: 0.9 },
  );
  alvos.forEach((a) => observador.observe(a));
}

function formatar(n: number): string {
  return n.toLocaleString('pt-BR');
}

/** Números contam de 0 ao valor e a barra ASCII enche em passos. */
function contadores(): void {
  const alvos = [...document.querySelectorAll<HTMLElement>('[data-contar]')];
  for (const barra of document.querySelectorAll<HTMLElement>('[data-nivel]')) {
    barra.style.setProperty('--nivel', `${barra.dataset.nivel}%`);
  }
  if (reduzir() || !('IntersectionObserver' in window)) return;

  for (const alvo of alvos) alvo.textContent = '0';
  const observador = new IntersectionObserver(
    (itens) => {
      for (const item of itens) {
        if (!item.isIntersecting) continue;
        const alvo = item.target as HTMLElement;
        observador.unobserve(alvo);
        const final = Number(alvo.dataset.contar);
        const inicio = performance.now();
        const quadro = (agora: number) => {
          const p = Math.min(1, (agora - inicio) / 1600);
          // Em degraus, como um contador de terminal.
          alvo.textContent = formatar(Math.round((final * Math.round((1 - (1 - p) ** 3) * 24)) / 24));
          if (p < 1) requestAnimationFrame(quadro);
          else alvo.textContent = formatar(final);
        };
        requestAnimationFrame(quadro);
      }
    },
    { threshold: 0.6 },
  );
  alvos.forEach((a) => observador.observe(a));
}

/** Faixa de comandos: o deslocamento horizontal acompanha a rolagem vertical. */
function faixas(): void {
  const faixa = document.querySelector<HTMLElement>('[data-rolagem-x]');
  const lista = faixa?.firstElementChild as HTMLElement | null;
  if (!faixa || !lista || reduzir()) return;
  const atualizar = () => {
    const volta = lista.getBoundingClientRect().width;
    if (volta > 0) faixa.style.transform = `translateX(${-((scrollY * 0.55) % volta)}px)`;
  };
  addEventListener('scroll', () => requestAnimationFrame(atualizar), { passive: true });
  addEventListener('resize', atualizar);
  atualizar();
}

function progresso(): void {
  const raiz = document.documentElement;
  let pendente = false;
  const atualizar = () => {
    pendente = false;
    const total = raiz.scrollHeight - innerHeight;
    raiz.style.setProperty('--progresso', total > 0 ? String(Math.min(1, scrollY / total)) : '0');
  };
  addEventListener(
    'scroll',
    () => {
      if (!pendente) {
        pendente = true;
        requestAnimationFrame(atualizar);
      }
    },
    { passive: true },
  );
  atualizar();
}

export function iniciarEfeitos(): void {
  document.documentElement.dataset.efeitos = 'ok';
  entradas();
  digitacao();
  contadores();
  faixas();
  progresso();
}
