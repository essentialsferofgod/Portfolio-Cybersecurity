/**
 * Executa um comando com FIXTURE definida, sem depender da sintaxe do shell (Windows ou Unix).
 * Uso: node scripts/com-fixture.ts <minimo|completo|extremo> <comando...>
 */
import { spawn } from 'node:child_process';

const [variante, ...comando] = process.argv.slice(2);

if (!variante || comando.length === 0) {
  console.error('uso: node scripts/com-fixture.ts <minimo|completo|extremo> <comando...>');
  process.exit(1);
}

spawn(comando.join(' '), { shell: true, stdio: 'inherit', env: { ...process.env, FIXTURE: variante } }).on(
  'exit',
  (codigo) => process.exit(codigo ?? 1),
);
