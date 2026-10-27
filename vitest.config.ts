import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Testes unitários; os e2e (Playwright) ficam em tests/e2e/.
    include: ['tests/*.test.ts'],
  },
});
