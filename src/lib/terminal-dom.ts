/**
 * Liga o terminal ao DOM (seções 9.4 a 9.8). A lógica de correspondência vem de terminal.ts;
 * as saídas dos comandos chegam prontas em <template data-saida="…">, geradas no build.
 * O terminal nunca rola a página, nunca move o foco sozinho e nunca captura o Tab.
 */
import { filtrar, resolver, type ComandoBasico } from './terminal.ts';

const LIMITE_BLOCOS = 6;

type Estado = 'inicial' | 'digitando' | 'executado' | 'erro';

function elemento<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  classe?: string,
  ...filhos: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  el.append(...filhos);
  return el;
}

function botaoComando(nome: string, rotulo = nome, nomeAcessivel?: string): HTMLButtonElement {
  const botao = elemento('button', 'botao-comando', rotulo);
  botao.type = 'button';
  botao.dataset.comando = nome;
  if (nomeAcessivel) botao.setAttribute('aria-label', nomeAcessivel);
  return botao;
}

function eco(texto: string): HTMLParagraphElement {
  const prompt = elemento('span', 'prompt', '$');
  prompt.setAttribute('aria-hidden', 'true');
  return elemento('p', 'eco', prompt, ' ', texto);
}

export function iniciarTerminal(raiz: HTMLElement): void {
  const campo = raiz.querySelector<HTMLInputElement>('.terminal-campo');
  const formulario = raiz.querySelector<HTMLFormElement>('.terminal-entrada');
  const lista = raiz.querySelector<HTMLUListElement>('[role="listbox"]');
  const registro = raiz.querySelector<HTMLElement>('[role="log"]');
  const saida = raiz.querySelector<HTMLElement>('.terminal-saida');
  if (!campo || !formulario || !lista || !registro || !saida) return;

  const comandos = JSON.parse(raiz.dataset.comandos ?? '[]') as ComandoBasico[];
  const modelos = new Map(
    [...raiz.querySelectorAll<HTMLTemplateElement>('template[data-saida]')].map((t) => [t.dataset.saida, t]),
  );
  let sugestoes: ComandoBasico[] = [];
  let ativa = -1;

  const definirEstado = (estado: Estado) => {
    raiz.dataset.estado = estado;
  };

  function idSugestao(comando: ComandoBasico): string {
    return `terminal-sugestao-${comando.nome}`;
  }

  function desenharSugestoes(): void {
    lista!.replaceChildren(
      ...sugestoes.map((comando, i) => {
        const opcao = elemento(
          'li',
          'sugestao',
          elemento('span', 'comando', comando.nome),
          elemento('span', 'descricao', comando.descricao),
        );
        opcao.id = idSugestao(comando);
        opcao.setAttribute('role', 'option');
        opcao.setAttribute('aria-selected', String(i === ativa));
        opcao.dataset.comando = comando.nome;
        return opcao;
      }),
    );
    const aberta = sugestoes.length > 0;
    lista!.hidden = !aberta;
    campo!.setAttribute('aria-expanded', String(aberta));
    const atual = sugestoes[ativa];
    if (atual) campo!.setAttribute('aria-activedescendant', idSugestao(atual));
    else campo!.removeAttribute('aria-activedescendant');
  }

  function atualizarSugestoes(): void {
    sugestoes = filtrar(campo!.value, comandos);
    ativa = -1;
    desenharSugestoes();
  }

  function fecharSugestoes(): void {
    sugestoes = [];
    ativa = -1;
    desenharSugestoes();
  }

  function adicionarBloco(...conteudo: Node[]): void {
    registro!.append(elemento('div', 'bloco', ...conteudo));
    while (registro!.children.length > LIMITE_BLOCOS) registro!.firstElementChild?.remove();
    // Rola só a área de saída do painel, nunca a página.
    saida!.scrollTop = saida!.scrollHeight;
  }

  function blocoDeErro(entrada: string, sugestao: ComandoBasico | null): Node[] {
    const linhas: Node[] = [eco(entrada), elemento('p', 'erro', `erro: comando não encontrado: "${entrada}"`)];
    if (sugestao) {
      linhas.push(
        elemento(
          'p',
          '',
          'você quis dizer: ',
          elemento('span', 'comando', sugestao.nome),
          ' ',
          botaoComando(sugestao.nome, 'executar', `executar ${sugestao.nome}`),
        ),
      );
    }
    linhas.push(elemento('p', 'suave', 'digite ', botaoComando('help'), ' para ver os comandos'));
    return linhas;
  }

  function executar(entrada: string): void {
    const resolucao = resolver(entrada, comandos);
    if (resolucao.tipo === 'vazio') return;
    const focoAnterior = document.activeElement;

    if (resolucao.tipo === 'erro') {
      adicionarBloco(...blocoDeErro(resolucao.entrada, resolucao.sugestao));
      definirEstado('erro');
    } else if (resolucao.comando.nome === 'clear') {
      registro!.replaceChildren();
      saida!.scrollTop = 0;
      definirEstado('inicial');
    } else {
      const modelo = modelos.get(resolucao.comando.nome);
      adicionarBloco(eco(entrada.trim()), ...(modelo ? [modelo.content.cloneNode(true)] : []));
      definirEstado('executado');
    }

    // Se o botão que disparou o comando saiu do DOM (clear, limite de blocos), o foco não se perde.
    if (focoAnterior instanceof HTMLElement && !focoAnterior.isConnected) campo!.focus();
  }

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const escolhida = sugestoes[ativa];
    executar(escolhida ? escolhida.nome : campo.value);
    campo.value = '';
    fecharSugestoes();
  });

  campo.addEventListener('input', () => {
    atualizarSugestoes();
    definirEstado(campo.value.trim() ? 'digitando' : 'inicial');
  });

  campo.addEventListener('keydown', (evento) => {
    const aberta = sugestoes.length > 0;
    switch (evento.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        if (!aberta) return;
        evento.preventDefault();
        ativa =
          evento.key === 'ArrowDown'
            ? (ativa + 1) % sugestoes.length
            : (ativa - 1 + sugestoes.length) % sugestoes.length;
        desenharSugestoes();
        break;
      case 'ArrowRight': {
        const escolhida = sugestoes[ativa];
        if (!aberta || !escolhida || campo.selectionStart !== campo.value.length) return;
        evento.preventDefault();
        campo.value = escolhida.nome;
        atualizarSugestoes();
        ativa = sugestoes.indexOf(escolhida);
        desenharSugestoes();
        break;
      }
      case 'Escape':
        if (aberta) {
          evento.preventDefault();
          fecharSugestoes();
        } else if (campo.value) {
          evento.preventDefault();
          campo.value = '';
          definirEstado('inicial');
        }
        break;
      // Tab fica com o comportamento nativo (WCAG 2.1.2).
    }
  });

  campo.addEventListener('blur', fecharSugestoes);

  // Clique numa sugestão: mousedown cancelado mantém o foco no campo.
  lista.addEventListener('mousedown', (evento) => evento.preventDefault());
  lista.addEventListener('click', (evento) => {
    const opcao = (evento.target as Element).closest<HTMLElement>('[data-comando]');
    if (!opcao?.dataset.comando) return;
    executar(opcao.dataset.comando);
    campo.value = '';
    fecharSugestoes();
  });

  // Chips, botões da saída de help e o "executar" das sugestões de erro.
  raiz.addEventListener('click', (evento) => {
    const botao = (evento.target as Element).closest<HTMLButtonElement>('button[data-comando]');
    if (botao?.dataset.comando) executar(botao.dataset.comando);
  });

  definirEstado('inicial');
}
