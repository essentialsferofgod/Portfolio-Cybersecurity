/**
 * Build estático com dados de exemplo, sem portão, para as verificações da seção 15.
 * Saída em dist-verificacao/<variante>/. Nunca é publicado.
 * Com FIXTURE definida, gera só aquela variante; sem ela, gera as três.
 */
import { spawnSync } from 'node:child_process';

const variantes = process.env.FIXTURE ? [process.env.FIXTURE] : ['minimo', 'completo', 'extremo'];

for (const variante of variantes) {
  console.log(`\nbuild:verificacao — ${variante}`);
  const { status } = spawnSync(`npx --no-install astro build --outDir dist-verificacao/${variante}`, {
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, FIXTURE: variante },
  });
  if (status !== 0) process.exit(status ?? 1);
}
