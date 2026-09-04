import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://westernprint.de',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404') && !page.endsWith('/warenkorb') && !page.endsWith('/bestellung-erfolgreich') && !page.endsWith('/kasse') && !/\/(pages|products|collections|policies)\//.test(page), changefreq: 'weekly', priority: 0.7 })],
});
