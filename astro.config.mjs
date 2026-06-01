// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const owner = process.env.GITHUB_REPOSITORY_OWNER;
const isUserSite = Boolean(repository && owner && repository.toLowerCase() === `${owner.toLowerCase()}.github.io`);
const base = process.env.BASE_PATH ?? (repository && !isUserSite ? `/${repository}` : '/');
const site = process.env.SITE_URL ?? 'https://www.ai-compass.jp';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  output: 'static',
  integrations: [react(), sitemap()],

  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      },
      wrap: true
    }
  },

  vite: {
    plugins: [tailwindcss()]
  }
});
