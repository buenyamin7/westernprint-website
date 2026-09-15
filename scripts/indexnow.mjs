// Meldet geänderte Seiten per IndexNow an Bing (und Yandex, Seznam, Naver). Läuft nach dem Deploy in GitHub Actions.
// Aufruf: node scripts/indexnow.mjs <sitemap.xml> [geänderte Dateien ...]
import { readFileSync } from 'node:fs';

const KEY = '1788f334d97c227d9a9abf9403a8ffda';
const HOST = 'westernprint.de';
const [sitemapPath, ...changed] = process.argv.slice(2);

const all = [...readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
// Layout, Komponenten, Daten oder Styles geändert: alle Seiten melden. Sonst nur die geänderten Seiten.
const global = changed.length === 0 || changed.some((f) => /^src\/(layouts|components|data|styles|content)\//.test(f) || f === 'astro.config.mjs');
let urls = all;
if (!global) {
  const paths = changed
    .filter((f) => f.startsWith('src/pages/') && f.endsWith('.astro') && !f.includes('['))
    .map((f) => '/' + f.replace(/^src\/pages\//, '').replace(/\.astro$/, '').replace(/(^|\/)index$/, ''))
    .map((p) => (p === '/' ? '' : p.replace(/\/$/, '')));
  urls = all.filter((u) => paths.includes(new URL(u).pathname.replace(/\/$/, '')));
}
if (!urls.length) { console.log('IndexNow: keine Seiten zu melden'); process.exit(0); }

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls.slice(0, 10000) }),
});
console.log(`IndexNow: ${urls.length} URLs gemeldet, Status ${res.status}`);
if (res.status >= 400) { console.log(await res.text()); process.exit(1); }
