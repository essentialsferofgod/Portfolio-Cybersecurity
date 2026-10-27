/**
 * Navegação (seção 10): menu do celular, seção ativa no menu e linha de status.
 * Sem JavaScript, o botão de menu e a linha de status continuam ocultos; a página
 * segue navegável pelos links de conteúdo, pelo rodapé e pelo índice do terminal.
 */

function iniciarMenu(): void {
  const botao = document.getElementById('botao-menu');
  const painel = document.getElementById('menu-navegacao');
  if (!(botao instanceof HTMLButtonElement) || !painel) return;

  botao.hidden = false;

  const aberto = () => botao.getAttribute('aria-expanded') === 'true';
  const definir = (abrir: boolean) => {
    botao.setAttribute('aria-expanded', String(abrir));
    painel.hidden = !abrir;
  };

  botao.addEventListener('click', () => definir(!aberto()));

  // Escolher um destino fecha o menu.
  painel.addEventListener('click', (evento) => {
    if ((evento.target as Element).closest('a')) definir(false);
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape' || !aberto()) return;
    const focoNoMenu = painel.contains(document.activeElement) || document.activeElement === botao;
    definir(false);
    if (focoNoMenu) botao.focus();
  });

  document.addEventListener('click', (evento) => {
    const alvo = evento.target as Node;
    if (aberto() && !painel.contains(alvo) && !botao.contains(alvo)) definir(false);
  });
}

function iniciarSecaoAtiva(): void {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-link-secao]')];
  const status = document.getElementById('linha-status');
  const textoStatus = status?.querySelector<HTMLElement>('[data-status-secao]');
  const caminho = status?.querySelector<HTMLElement>('[data-status-caminho]');
  const barra = status?.querySelector<HTMLElement>('[data-status-barra]');
  // Todas as seções numeradas (01 a 09), inclusive as que não estão no menu.
  const secoes = [...document.querySelectorAll<HTMLElement>('main section[data-secao]')];
  if (secoes.length === 0) return;

  const total = status?.dataset.total ?? String(secoes.length).padStart(2, '0');
  const noMenu = new Set(links.map((l) => l.dataset.linkSecao));
  let atual: string | null | undefined;

  // Ativa é a última seção cujo topo já passou de 30% da altura da janela.
  function recalcular(): void {
    const linha = window.innerHeight * 0.3;
    const indice = secoes.findLastIndex((s) => s.getBoundingClientRect().top <= linha);
    const ativa = secoes[indice] ?? null;
    const id = ativa?.id ?? null;
    if (id === atual) return;
    atual = id;

    // Menu: aria-current só no item exato. Seção fora do menu (problema, princípios,
    // depoimentos) marca, só visualmente, o item do menu anterior mais próximo.
    const proximo = id && !noMenu.has(id) ? secoes.slice(0, indice).reverse().find((s) => noMenu.has(s.id))?.id : null;
    for (const link of links) {
      const alvo = link.dataset.linkSecao;
      if (alvo === id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
      link.classList.toggle('secao-proxima', alvo === proximo);
    }

    // A linha de status só aparece com uma seção ativa: no hero cobriria a área dos CTAs.
    if (status && textoStatus) {
      status.hidden = !ativa;
      if (ativa) textoStatus.textContent = `${ativa.dataset.numero}/${total} ${ativa.dataset.rotulo}`;
      if (caminho) caminho.textContent = id ? `${caminho.dataset.base}/${id}` : (caminho.dataset.base ?? '');
    }
  }

  // Barra ASCII de progresso da rolagem: [██████░░░░░░]  42%
  const SEGMENTOS = 16;
  function progresso(): void {
    if (!barra) return;
    const altura = document.documentElement.scrollHeight - innerHeight;
    const fracao = altura > 0 ? Math.min(1, scrollY / altura) : 0;
    const cheios = Math.round(fracao * SEGMENTOS);
    barra.textContent = `[${'█'.repeat(cheios)}${'░'.repeat(SEGMENTOS - cheios)}] ${String(Math.round(fracao * 100)).padStart(3)}%`;
  }
  addEventListener('scroll', () => requestAnimationFrame(progresso), { passive: true });
  progresso();

  // O observador só dispara quando uma seção cruza a faixa de 30%; o cálculo usa a posição real.
  const observador = new IntersectionObserver(recalcular, { rootMargin: '-30% 0px -69% 0px' });
  secoes.forEach((s) => observador.observe(s));
  recalcular();
}

export function iniciarNavegacao(): void {
  iniciarMenu();
  iniciarSecaoAtiva();
}
