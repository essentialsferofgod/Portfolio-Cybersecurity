/**
 * Formulário de contato DE DEMONSTRAÇÃO: valida os campos e mostra a confirmação, mas não
 * envia nem guarda nada (nenhuma requisição, nada em URL ou armazenamento local).
 * Estados anunciados em role="status"; erros ligados a cada campo por aria-describedby.
 * Links com data-area (CTAs dos serviços) rolam até o formulário e pré-selecionam a área.
 */
import { rolarAte } from './rolagem.ts';

export function iniciarFormulario(formulario: HTMLFormElement): void {
  const status = formulario.querySelector<HTMLElement>('[role="status"]');
  const campos = [...formulario.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[data-obrigatorio]')];

  function erroDe(campo: HTMLElement): HTMLElement | null {
    return formulario.querySelector(`#${campo.id}-erro`);
  }

  function validar(campo: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean {
    const valor = campo.value.trim();
    let mensagem = '';
    if (!valor) mensagem = 'erro: campo obrigatório.';
    else if (campo.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) mensagem = 'erro: informe um e-mail válido.';
    const erro = erroDe(campo);
    if (erro) erro.textContent = mensagem;
    campo.setAttribute('aria-invalid', String(Boolean(mensagem)));
    return !mensagem;
  }

  campos.forEach((campo) => campo.addEventListener('blur', () => validar(campo)));

  const area = formulario.querySelector<HTMLSelectElement>('#f-area');
  document.addEventListener('click', (evento) => {
    const link = (evento.target as Element).closest<HTMLAnchorElement>('a[data-area]');
    if (!link || !area) return;
    const opcao = [...area.options].find((o) => o.text === link.dataset.area);
    if (!opcao) return;
    evento.preventDefault();
    area.value = opcao.value;
    area.dispatchEvent(new Event('change', { bubbles: true }));
    rolarAte(formulario, area);
  });

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const invalidos = campos.filter((campo) => !validar(campo));
    if (invalidos.length) {
      formulario.dataset.estado = 'erro';
      if (status) status.textContent = 'Revise os campos obrigatórios e tente de novo.';
      invalidos[0]?.focus();
      return;
    }
    formulario.dataset.estado = 'enviando';
    if (status) status.textContent = 'Registrando…';
    window.setTimeout(() => {
      formulario.dataset.estado = 'sucesso';
      if (status) {
        status.textContent =
          'Mensagem registrada nesta demonstração. Nada foi enviado: para falar de verdade com a equipe, use o e-mail acima.';
      }
      formulario.reset();
    }, 700);
  });
}
