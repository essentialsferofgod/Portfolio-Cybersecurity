/**
 * Portão de publicação (seção 6.5). Lógica pura, usada por scripts/verificar-pendencias.ts
 * antes de `npm run build` e coberta por tests/portao.test.ts.
 */
import { ehPendente, percorrerTextos, verificarOrcamentos } from '../content/schema.ts';
import { canaisDisponiveis, montarConteudo } from './conteudo.ts';

export interface ResultadoPortao {
  erros: string[];
  avisos: string[];
}

/** Texto entre colchetes ou domínio reservado: sinais de dado de exemplo. */
const TEXTO_DE_EXEMPLO = /\[[^\]]+\]/;
const DOMINIO_DE_EXEMPLO = /(^|[@./])example\.(com|org|net)\b/i;

function resumir(texto: string): string {
  return texto.length > 48 ? `${texto.slice(0, 45)}...` : texto;
}

export function verificarPortao(entrada: unknown, env: { FIXTURE?: string | undefined }): ResultadoPortao {
  const erros: string[] = [];
  const avisos: string[] = [];

  if (env.FIXTURE) {
    erros.push(`FIXTURE="${env.FIXTURE}" está definida: o build de produção não aceita dados de exemplo.`);
  }

  percorrerTextos(entrada, (texto, _normalizado, caminho) => {
    if (ehPendente(texto)) {
      erros.push(`${caminho}: ${texto}`);
    } else if (TEXTO_DE_EXEMPLO.test(texto) || DOMINIO_DE_EXEMPLO.test(texto)) {
      erros.push(`${caminho}: parece dado de exemplo ("${resumir(texto)}")`);
    }
  });

  let conteudo;
  try {
    conteudo = montarConteudo(entrada);
  } catch (erro) {
    erros.push(erro instanceof Error ? erro.message : String(erro));
    return { erros, avisos };
  }

  const d = conteudo.dados;
  if (!d.sobre) erros.push('falta "sobre".');
  if (d.servicos.length === 0) erros.push('é preciso pelo menos um serviço completo.');
  if (canaisDisponiveis(d).length === 0) {
    erros.push('é preciso pelo menos um canal de contato real (email, telefone, whatsapp ou linkedin).');
  }
  if (d.contato.formularioEndpoint && !d.legal.politicaPrivacidadeUrl) {
    erros.push('formulário exige legal.politicaPrivacidadeUrl.');
  }

  avisos.push(...verificarOrcamentos(d).map((a) => `orçamento de layout excedido — ${a}`));
  return { erros, avisos };
}
