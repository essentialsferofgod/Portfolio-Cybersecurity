/**
 * Laboratório de ameaças: um ambiente de rede SIMULADO, com dados fictícios gerados aqui.
 * Ao entrar na tela, um log "digita" a varredura e os nós aparecem um a um; uma linha de
 * varredura acompanha a rolagem pela seção; clicar num nó abre o inspetor. Os nós são
 * botões reais (nome acessível, aria-pressed) e o inspetor anuncia a seleção (aria-live).
 * Selecionar um ativo dispara uma propagação simulada: um pulso percorre as conexões, um
 * salto a cada 120 ms; o inspetor e o log registram só o resumo final ("N ativos em K saltos").
 * Nada aqui representa um sistema real.
 */

type Exposicao = 'baixa' | 'média' | 'alta';

interface No {
  id: string;
  tipo: string;
  x: number;
  y: number;
  exposicao: Exposicao;
  conexao: string;
  evento: string;
  ligacoes: number[];
  /** Pertence ao segmento sem ligação direta com o gateway. */
  segmento: boolean;
}

const TIPOS = ['servidor web', 'banco de dados', 'estação de trabalho', 'serviço em nuvem', 'API', 'dispositivo IoT', 'e-mail', 'VPN'];
/** Atraso entre saltos da propagação. */
const SALTO_MS = 120;

/**
 * Segmento: ativos sem ligação direta com o gateway, pela posição na grade 3 × 5 (linha, coluna).
 * Ficam encadeados (0,3)–(0,4)–(1,4)–(2,4)–(2,3) e entram na rede por (1,3), que segue
 * ligado ao gateway. Assim o caminho até o gateway tem de 3 a 4 saltos.
 */
const SEGMENTO = ['0,3', '0,4', '1,4', '2,4', '2,3'];
const ENTRADA_SEGMENTO = '1,3';

const LOG_INICIO = [
  'inicializando rede simulada...',
  'escaneando ativos digitais...',
  'analisando conexões...',
  'mapeando superfície de ataque...',
];

/** Gerador pseudoaleatório com semente: a mesma simulação a cada carga. */
function sorteador(semente: number): () => number {
  let s = semente;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function gerarRede(semente: number): No[] {
  const aleatorio = sorteador(semente);
  const nos: No[] = [
    // O gateway é o ponto central: não gera sinais próprios, e o inspetor diz isso.
    { id: 'GW-0001', tipo: 'gateway', x: 50, y: 30, exposicao: 'média', conexao: 'estabelecida', evento: 'sem eventos próprios · ponto central da rede', ligacoes: [], segmento: false },
  ];
  const posicao = new Map<string, number>(); // "linha,coluna" → índice do nó
  for (let linha = 0; linha < 3; linha++) {
    for (let coluna = 0; coluna < 5; coluna++) {
      if (linha === 1 && coluna === 2) continue; // lugar do gateway
      const sorte = aleatorio();
      const chave = `${linha},${coluna}`;
      const segmento = SEGMENTO.includes(chave);
      posicao.set(chave, nos.length);
      // A ordem das chamadas ao sorteador não muda: o layout continua reproduzível.
      nos.push({
        id: `AT-${Math.floor(aleatorio() * 0xffff).toString(16).toUpperCase().padStart(4, '0')}`,
        tipo: TIPOS[Math.floor(aleatorio() * TIPOS.length)]!,
        x: 10 + coluna * 20 + (aleatorio() - 0.5) * 8,
        y: 9 + linha * 21 + (aleatorio() - 0.5) * 8,
        exposicao: sorte > 0.8 ? 'alta' : sorte > 0.45 ? 'média' : 'baixa',
        conexao: aleatorio() > 0.15 ? 'estabelecida' : 'intermitente',
        evento: '—',
        ligacoes: segmento ? [] : [0],
        segmento,
      });
    }
  }
  // Segmento encadeado, com uma única entrada para o resto da rede.
  const cadeia = SEGMENTO.map((chave) => posicao.get(chave)!);
  cadeia.slice(1).forEach((indice, k) => nos[indice]!.ligacoes.push(cadeia[k]!));
  nos[posicao.get('1,4')!]!.ligacoes.push(posicao.get(ENTRADA_SEGMENTO)!);

  // Ligações laterais entre vizinhos próximos, fora do segmento (para não criar atalhos).
  // O sorteador é chamado para todo nó, como antes, para manter a sequência.
  nos.forEach((no, i) => {
    if (i === 0) return;
    const sorteio = aleatorio();
    if (no.segmento) return;
    const vizinho = nos
      .map((outro, j) => ({ j, d: Math.hypot(outro.x - no.x, outro.y - no.y) }))
      .filter(({ j }) => j !== i && j !== 0 && !nos[j]!.segmento)
      .sort((a, b) => a.d - b.d)[0];
    if (vizinho && sorteio > 0.4) no.ligacoes.push(vizinho.j);
  });
  return nos;
}

/** Adjacência não direcionada a partir de `ligacoes`. */
function adjacencia(nos: No[]): Set<number>[] {
  const vizinhos = nos.map(() => new Set<number>());
  nos.forEach((no, i) =>
    no.ligacoes.forEach((j) => {
      vizinhos[i]!.add(j);
      vizinhos[j]?.add(i);
    }),
  );
  return vizinhos;
}

/** Distância em saltos a partir de `origem` (busca em largura); -1 = inalcançável. */
function saltos(nos: No[], origem: number): number[] {
  const vizinhos = adjacencia(nos);
  const distancia = nos.map(() => -1);
  distancia[origem] = 0;
  const fila = [origem];
  while (fila.length) {
    const atual = fila.shift()!;
    for (const j of vizinhos[atual]!) {
      if (distancia[j] !== -1) continue;
      distancia[j] = distancia[atual]! + 1;
      fila.push(j);
    }
  }
  return distancia;
}

export function iniciarLaboratorio(raiz: HTMLElement): void {
  const mapa = raiz.querySelector<HTMLElement>('[data-lab-mapa]');
  const linhas = raiz.querySelector<SVGSVGElement>('[data-lab-linhas]');
  const log = raiz.querySelector<HTMLElement>('[data-lab-log]');
  const vazio = raiz.querySelector<HTMLElement>('[data-lab-vazio]');
  const dados = raiz.querySelector<HTMLElement>('[data-lab-dados]');
  const status = raiz.querySelector<HTMLElement>('[data-lab-status]');
  const secao = raiz.closest('section');
  if (!mapa || !linhas || !log || !vazio || !dados || !secao) return;

  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let nos: No[] = [];
  let botoes: HTMLButtonElement[] = [];
  let selecionado = -1;
  let temporizadores: number[] = [];
  let intervalo = 0;
  let visivel = false;
  let rodada = 0;

  const relogio = () => new Date().toLocaleTimeString('pt-BR', { hour12: false });

  function registrar(texto: string, destaque = false): void {
    const linha = document.createElement('p');
    if (destaque) linha.className = 'destaque';
    linha.textContent = `[${relogio()}] ${texto}`;
    log!.append(linha);
    while (log!.children.length > 6) log!.firstElementChild?.remove();
  }

  function depois(ms: number, acao: () => void): void {
    temporizadores.push(window.setTimeout(acao, reduzir ? 0 : ms));
  }

  /**
   * Propagação simulada: só alterna classes; o atraso de cada nó e aresta vem de --atraso-pulso
   * (salto × 120 ms). Com movimento reduzido a regra global zera os atrasos e o caminho
   * inteiro acende de uma vez. O resumo vai para o inspetor (aria-live) só no final.
   */
  let fimPropagacao = 0;
  function propagar(origem: number): void {
    clearTimeout(fimPropagacao);
    const distancia = saltos(nos, origem);
    const alcancados = distancia.filter((d) => d > 0).length;
    const maximo = Math.max(0, ...distancia);
    const alcance = dados!.querySelector<HTMLElement>('[data-campo="alcance"]');
    if (alcance) alcance.textContent = '';

    // Reinicia: tira as classes, força o recálculo e aplica de novo com os novos atrasos.
    botoes.forEach((b) => b.classList.remove('alcancado'));
    linhas!.querySelectorAll('line').forEach((l) => l.classList.remove('alcancada'));
    void mapa!.offsetWidth;

    botoes.forEach((botao, i) => {
      const d = distancia[i]!;
      if (d < 1) return;
      botao.style.setProperty('--atraso-pulso', `${d * SALTO_MS}ms`);
      botao.classList.add('alcancado');
    });
    linhas!.querySelectorAll<SVGLineElement>('line').forEach((linha) => {
      const a = distancia[Number(linha.dataset.de)]!;
      const b = distancia[Number(linha.dataset.para)]!;
      if (a < 0 || b < 0) return;
      linha.style.setProperty('--atraso-pulso', `${Math.min(a, b) * SALTO_MS + SALTO_MS / 2}ms`);
      linha.classList.add('alcancada');
    });

    const ativos = alcancados === 1 ? 'ativo' : 'ativos';
    const unidade = maximo === 1 ? 'salto' : 'saltos';
    const resumo = `${alcancados} ${ativos} em ${maximo} ${unidade}`;
    fimPropagacao = window.setTimeout(
      () => {
        if (alcance) alcance.textContent = resumo;
        registrar(`propagação simulada · ${nos[origem]!.id} · ${resumo}`, true);
      },
      reduzir ? 0 : maximo * SALTO_MS + 200,
    );
  }

  function inspecionar(indice: number): void {
    selecionado = indice;
    const no = nos[indice];
    botoes.forEach((b, i) => b.setAttribute('aria-pressed', String(i === indice)));
    if (!no) return;
    vazio!.hidden = true;
    dados!.hidden = false;
    const campos: Record<string, string> = {
      id: no.id,
      tipo: no.tipo,
      conexao: no.conexao,
      exposicao: no.exposicao,
      evento: no.evento,
    };
    for (const [campo, valor] of Object.entries(campos)) {
      const alvo = dados!.querySelector<HTMLElement>(`[data-campo="${campo}"]`);
      if (alvo) alvo.textContent = valor;
    }
    registrar(`nó identificado · ${no.id}`);
    if (no.exposicao === 'alta') registrar(`revisão de exposição necessária · ${no.id}`, true);
    propagar(indice);
  }

  function desenhar(): void {
    linhas!.replaceChildren();
    botoes.forEach((b) => b.remove());
    const ns = 'http://www.w3.org/2000/svg';
    nos.forEach((no, i) => {
      for (const j of no.ligacoes) {
        const destino = nos[j];
        if (!destino) continue;
        const linha = document.createElementNS(ns, 'line');
        linha.setAttribute('x1', String(no.x));
        linha.setAttribute('y1', String(no.y));
        linha.setAttribute('x2', String(destino.x));
        linha.setAttribute('y2', String(destino.y));
        linha.setAttribute('pathLength', '1');
        linha.setAttribute('vector-effect', 'non-scaling-stroke');
        linha.dataset.de = String(i);
        linha.dataset.para = String(j);
        // Cada aresta acende um pouco depois da anterior.
        linha.style.setProperty('--atraso-linha', `${linhas!.childElementCount * 35}ms`);
        linhas!.append(linha);
      }
    });
    botoes = nos.map((no, i) => {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = `lab-no exposicao-${no.exposicao === 'média' ? 'media' : no.exposicao}`;
      botao.style.left = `${no.x}%`;
      botao.style.top = `${(no.y / 60) * 100}%`;
      botao.setAttribute('aria-pressed', 'false');
      botao.setAttribute('aria-label', `${no.id}, ${no.tipo}, exposição ${no.exposicao}`);
      if (no.segmento) botao.dataset.segmento = 'sim';
      const rotulo = document.createElement('span');
      rotulo.className = 'lab-no-rotulo';
      rotulo.textContent = no.tipo;
      botao.append(rotulo);
      botao.addEventListener('click', () => inspecionar(i));
      mapa!.append(botao);
      return botao;
    });
  }

  function iniciar(): void {
    temporizadores.forEach(clearTimeout);
    temporizadores = [];
    clearInterval(intervalo);
    rodada++;
    nos = gerarRede(20261027 + rodada);
    selecionado = -1;
    log!.replaceChildren();
    vazio!.hidden = false;
    dados!.hidden = true;
    raiz.dataset.fase = 'varrendo';
    if (status) status.textContent = 'simulação em andamento';
    desenhar();

    LOG_INICIO.forEach((texto, i) => depois(i * 450, () => registrar(texto)));
    const base = LOG_INICIO.length * 450;
    botoes.forEach((botao, i) => depois(base + i * 90, () => botao.classList.add('visivel')));
    depois(base + 200, () => linhas!.classList.add('visivel'));
    depois(base + botoes.length * 90 + 300, () => {
      raiz.dataset.fase = 'pronto';
      if (status) status.textContent = 'simulação ativa';
      registrar('análise concluída · aguardando seleção...', true);
      if (!reduzir) intervalo = window.setInterval(eventoAleatorio, 2600);
    });
  }

  function eventoAleatorio(): void {
    if (!visivel || nos.length < 2) return;
    const i = 1 + Math.floor(Math.random() * (nos.length - 1));
    const no = nos[i];
    const botao = botoes[i];
    if (!no || !botao) return;
    no.evento = `${relogio()} · sinal detectado`;
    registrar(`sinal detectado · ${no.id}`);
    botao.classList.remove('pulso');
    void botao.offsetWidth; // reinicia a animação
    botao.classList.add('pulso');
    if (i === selecionado) {
      const alvo = dados!.querySelector<HTMLElement>('[data-campo="evento"]');
      if (alvo) alvo.textContent = no.evento;
    }
  }

  // Linha de varredura ligada à rolagem pela seção.
  function varrer(): void {
    const caixa = secao!.getBoundingClientRect();
    const progresso = Math.min(1, Math.max(0, (innerHeight * 0.75 - caixa.top) / (caixa.height + innerHeight * 0.25)));
    const posicao = progresso * 100;
    mapa!.style.setProperty('--varredura', `${posicao}%`);
    nos.forEach((no, i) => botoes[i]?.classList.toggle('varrido', Math.abs(no.x - posicao) < 4));
  }

  raiz.querySelectorAll<HTMLButtonElement>('[data-visao]').forEach((botao) =>
    botao.addEventListener('click', () => {
      raiz.dataset.visao = botao.dataset.visao;
      raiz.querySelectorAll('[data-visao]').forEach((b) => b.setAttribute('aria-pressed', String(b === botao)));
    }),
  );
  raiz.querySelector('[data-lab-reiniciar]')?.addEventListener('click', iniciar);

  let iniciado = false;
  new IntersectionObserver(
    (itens) => {
      visivel = itens.some((i) => i.isIntersecting);
      if (visivel && !iniciado) {
        iniciado = true;
        iniciar();
      }
    },
    { threshold: 0.3 },
  ).observe(raiz);
  addEventListener('scroll', () => requestAnimationFrame(varrer), { passive: true });
  raiz.dataset.pronto = 'sim';
  varrer();
}
