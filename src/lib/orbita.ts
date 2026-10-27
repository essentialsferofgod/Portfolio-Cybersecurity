/**
 * Órbita da seção Metodologia, adaptada da "radial orbital timeline" do pacote de animações,
 * sem React. É decorativa (aria-hidden): a lista ordenada ao lado é o conteúdo.
 *
 * Modo fixado (≥ 64rem e sem movimento reduzido): a seção ganha um trilho alto e o palco
 * (órbita, cartão central e lista) fica preso com position: sticky. O progresso da rolagem
 * pelo trilho (0 a 1) gira a órbita de forma contínua — sem interpolação por quadro, que
 * dependia do FPS —, destaca a etapa na lista e o cartão digita `cat etapa_0N.md`.
 * Clicar numa etapa (botão na lista ou nó da órbita) rola até o ponto correspondente.
 *
 * Fora desse modo (movimento reduzido), a etapa acompanha a rolagem pela seção, sem animação.
 */
import { rolarAte, rolarPara } from './rolagem.ts';

const FIXADO = '(min-width: 64rem) and (prefers-reduced-motion: no-preference)';

export function iniciarOrbita(raiz: HTMLElement): void {
  const nos = [...raiz.querySelectorAll<HTMLElement>('[data-no]')];
  const titulo = raiz.querySelector<HTMLElement>('[data-orbita-titulo]');
  const descricao = raiz.querySelector<HTMLElement>('[data-orbita-descricao]');
  const comando = raiz.querySelector<HTMLElement>('[data-orbita-comando]');
  const secao = raiz.closest('section');
  const trilho = secao?.querySelector<HTMLElement>('[data-trilho]');
  const palco = secao?.querySelector<HTMLElement>('[data-palco]');
  const lista = secao ? [...secao.querySelectorAll<HTMLElement>('.etapa')] : [];
  if (nos.length === 0 || !secao || !trilho || !palco) return;

  const total = nos.length;
  const fixado = () => matchMedia(FIXADO).matches;
  const reduzir = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ativa = -1;
  let digitacao = 0;

  const limitar = (v: number) => Math.min(1, Math.max(0, v));
  /** Ângulo que leva a etapa `posicao` (fracionária) para baixo (90°), perto do cartão. */
  const angulo = (posicao: number) => 90 - (posicao / total) * 360;

  function posicionar(rotacao: number): void {
    const raio = raiz.getBoundingClientRect().width / 2 - 34;
    nos.forEach((no, i) => {
      const a = ((i / total) * 360 + rotacao) * (Math.PI / 180);
      no.style.transform = `translate(${Math.cos(a) * raio}px, ${Math.sin(a) * raio}px)`;
      // Nós na parte de cima do círculo ficam mais apagados.
      no.style.opacity = String(0.55 + 0.45 * ((1 + Math.sin(a)) / 2));
    });
  }

  function digitar(texto: string): void {
    if (!comando) return;
    clearInterval(digitacao);
    if (reduzir()) {
      comando.textContent = texto;
      return;
    }
    let k = 0;
    comando.textContent = '';
    digitacao = window.setInterval(() => {
      k++;
      comando.textContent = texto.slice(0, k);
      if (k >= texto.length) clearInterval(digitacao);
    }, 32);
  }

  function ativar(indice: number): void {
    if (indice === ativa) return;
    ativa = indice;
    nos.forEach((no, i) => no.classList.toggle('ativo', i === indice));
    lista.forEach((item, i) => item.classList.toggle('etapa-ativa', i === indice));
    const no = nos[indice];
    if (titulo && no) titulo.textContent = no.dataset.titulo ?? '';
    if (descricao && no) descricao.textContent = no.dataset.descricao ?? '';
    digitar(`cat etapa_${String(indice + 1).padStart(2, '0')}.md`);
  }

  /** Distância percorrida pelo palco preso e posição de início, em px do documento. */
  function curso(): { inicio: number; extensao: number } {
    const topoFixo = parseFloat(getComputedStyle(palco!).top) || 0;
    const caixa = trilho!.getBoundingClientRect();
    return { inicio: caixa.top + scrollY - topoFixo, extensao: Math.max(1, caixa.height - palco!.offsetHeight) };
  }

  function atualizar(): void {
    if (fixado()) {
      const { inicio, extensao } = curso();
      const p = limitar((scrollY - inicio) / extensao);
      posicionar(angulo(p * (total - 1)));
      ativar(Math.round(p * (total - 1)));
      return;
    }
    // Sem fixação: a etapa avança conforme a seção passa pela tela, sem animação.
    const caixa = secao!.getBoundingClientRect();
    const p = limitar((innerHeight * 0.6 - caixa.top) / caixa.height);
    const indice = Math.min(total - 1, Math.floor(p * total));
    ativar(indice);
    posicionar(angulo(indice));
  }

  function irPara(indice: number, foco?: HTMLElement | null): void {
    if (fixado()) {
      const { inicio, extensao } = curso();
      rolarPara(inicio + (indice / (total - 1)) * extensao, foco);
    } else {
      const item = lista[indice];
      if (item) rolarAte(item, foco);
    }
  }

  // Etapas da lista viram botões (teclado) que levam ao ponto da rolagem correspondente.
  lista.forEach((item, i) => {
    const h3 = item.querySelector('h3');
    if (!h3 || h3.querySelector('button')) return;
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'etapa-botao';
    botao.append(...h3.childNodes);
    h3.append(botao);
    botao.addEventListener('click', () => irPara(i, botao));
  });
  nos.forEach((no, i) => no.addEventListener('click', () => irPara(i)));

  addEventListener('scroll', () => requestAnimationFrame(atualizar), { passive: true });
  addEventListener('resize', atualizar);
  atualizar();
}
