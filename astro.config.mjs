import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { sourceFilesFor, gitDates } from './src/lib/lastmod.mjs';

// Seiten ohne eigenen Suchwert: Kasse, Warenkorb, Bestätigungen, Fehlerseite.
// /sample bleibt noindex und draußen, bis die Versandbeträge geklärt sind (Seite und llms.txt nennen verschiedene Beträge).
// /cart ist nur ein Weiterleitungs-Stub der alten Shopify-URL.
const EXCLUDED = new Set(['/404', '/warenkorb', '/kasse', '/bestellung-erfolgreich', '/sample', '/sample-danke', '/cart']);

export default defineConfig({
  site: 'https://westernprint.de',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/$/, '') || '/';
        // Nicht-HTML-Routen (z. B. /llms-full.txt) gehören nicht in die Sitemap.
        if (/\.[a-z0-9]+$/i.test(path)) return false;
        // Weiterleitungs-Stubs der alten Shopify-URLs und die 50 Produktseiten /shop/<handle> (noindex).
        // Die Shop-Übersicht /shop bleibt drin.
        if (/^\/(pages|products|collections|policies)(\/|$)/.test(path) || path.startsWith('/shop/')) return false;
        return !EXCLUDED.has(path);
      },
      // lastmod ehrlich aus git (letzter Commit der Quelldateien). Ohne git bleibt das Feld weg.
      serialize(item) {
        delete item.changefreq;
        delete item.priority;
        const modified = gitDates(sourceFilesFor(item.url))?.modified;
        if (modified) item.lastmod = modified;
        return item;
      },
    }),
  ],
});
