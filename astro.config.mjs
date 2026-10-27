// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// SITE_URL só existe quando houver domínio próprio (seção 12).
const site = process.env.SITE_URL || undefined;

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    // CSP sem 'unsafe-inline': todo CSS vai para arquivos externos.
    inlineStylesheets: 'never',
  },
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Astro embute scripts menores que este limite; 0 mantém todos externos (CSP).
      assetsInlineLimit: 0,
    },
  },
});
