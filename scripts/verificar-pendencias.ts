/**
 * Roda antes de `npm run build`. Falha se FIXTURE estiver definida, se houver "PENDENTE",
 * se restar dado de exemplo em organizacao.ts ou se o portão de publicação não for cumprido.
 */
import { organizacao } from '../src/content/organizacao.ts';
import { verificarPortao } from '../src/lib/portao.ts';

const { erros, avisos } = verificarPortao(organizacao, { FIXTURE: process.env.FIXTURE });

for (const aviso of avisos) console.warn(`aviso: ${aviso}`);

if (erros.length > 0) {
  console.error(`\nportão de publicação: ${erros.length} problema(s)\n`);
  for (const erro of erros) console.error(`  erro: ${erro}`);
  console.error('\nPreencha src/content/organizacao.ts (veja o README) e rode npm run build de novo.\n');
  process.exit(1);
}

console.log('portão de publicação: ok');
