/**
 * Órbita da seção Abordagem, adaptada da "radial orbital timeline" do pacote de animações,
 * sem React. As etapas giram em volta de um painel central de terminal; a etapa ativa
 * acompanha a rolagem pela seção, e clicar num nó a seleciona. É decorativa (aria-hidden):
 * a lista ordenada ao lado é a versão acessível e a única exibida no celular e sem JS.
 */
export function iniciarOrbita(raiz: HTMLElement): void {
  const nos = [...raiz.querySelectorAll<HTMLElement>('[data-no]')];
  const titulo = raiz.querySelector<HTMLElement>('[data-orbita-titulo]');
  const descricao = raiz.querySelector<HTMLElement>('[data-orbita-descricao]');
  const comando = raiz.querySelector<HTMLElement>('[data-orbita-comando]');
  const secao = raiz.closest('section');
  const lista = secao ? [...secao.querySelectorAll<HTMLElement>('.etapa')] : [];
  if (nos.length === 0 || !secao) return;

  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const total = nos.length;
  let ativa = 0;
  let rotacao = -90;
  let alvo = -90;
  let fixadaAte = 0;
  let raf = 0;

  function posicionar(): void {
    const raio = raiz.getBoundingClientRect().width / 2 - 34;
    nos.forEach((no, i) => {
      const angulo = ((i / total) * 360 + rotacao) * (Math.PI / 180);
      const x = Math.cos(angulo) * raio;
      const y = Math.sin(angulo) * raio;
      no.style.transform = `translate(${x}px, ${y}px)`;
      // Nós "atrás" (parte de cima do círculo) ficam mais apagados.
      no.style.opacity = String(0.55 + 0.45 * ((1 + Math.sin(angulo)) / 2));
    });
  }

  function ativar(indice: number): void {
    ativa = indice;
    nos.forEach((no, i) => no.classList.toggle('ativo', i === indice));
    lista.forEach((item, i) => item.classList.toggle('etapa-ativa', i === indice));
    const no = nos[indice];
    if (titulo && no) titulo.textContent = no.dataset.titulo ?? '';
    if (descricao && no) descricao.textContent = no.dataset.descricao ?? '';
    if (comando) comando.textContent = `cat etapa_${String(indice + 1).padStart(2, '0')}.md`;
    // O nó ativo vai para a posição de baixo (90°), perto do painel de texto.
    alvo = 90 - (indice / total) * 360;
  }

  function quadro(): void {
    let diferenca = (((alvo - rotacao) % 360) + 540) % 360 - 180;
    rotacao += reduzir ? diferenca : diferenca * 0.08;
    posicionar();
    if (Math.abs(diferenca) > 0.05) raf = requestAnimationFrame(quadro);
    else raf = 0;
  }

  function animar(): void {
    if (!raf) raf = requestAnimationFrame(quadro);
  }

  function porRolagem(): void {
    if (performance.now() < fixadaAte) return;
    const caixa = secao!.getBoundingClientRect();
    const progresso = Math.min(0.999, Math.max(0, (innerHeight * 0.6 - caixa.top) / caixa.height));
    const indice = Math.floor(progresso * total);
    if (indice !== ativa) {
      ativar(indice);
      animar();
    }
  }

  nos.forEach((no, i) =>
    no.addEventListener('click', () => {
      fixadaAte = performance.now() + 2500;
      ativar(i);
      animar();
    }),
  );
  addEventListener('scroll', () => requestAnimationFrame(porRolagem), { passive: true });
  addEventListener('resize', posicionar);

  ativar(0);
  rotacao = alvo;
  posicionar();
  porRolagem();
}
