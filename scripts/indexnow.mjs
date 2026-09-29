// Meldet geänderte Seiten per IndexNow an Bing (und Yandex, Seznam, Naver). Läuft nach dem Deploy in GitHub Actions.
// Aufruf: node scripts/indexnow.mjs [<sitemap-0.xml>] [--all] [--dry-run] [geänderte Dateien ...]
//   <sitemap-0.xml>  Standard: dist/sitemap-0.xml. Die Weiterleitungs-Stubs liest das Skript aus demselben Ordner.
//   --all            Alles melden: alle Sitemap-URLs, alle Weiterleitungen alter Shopify-URLs und die bekannten gelöschten Alt-URLs.
//                    Gleiche Wirkung: Umgebungsvariable INDEXNOW_ALL=1. Passiert außerdem einmal von selbst,
//                    wenn dieses Skript im gemeldeten Push geändert wurde.
//   --dry-run        Nur die URL-Liste ausgeben, nichts senden.
//
// Warum auch Weiterleitungen und gelöschte URLs: Bing hat alte Shopify- und WordPress-URLs mit veralteten Angaben im Index
// (z. B. /pages/versand-und-zahlungsbedingungen mit falscher Versandgrenze). Sie stehen nicht in der Sitemap, also hat
// IndexNow sie nie gemeldet. Nach der Meldung crawlt Bing sie neu, sieht noindex mit Weiterleitung bzw. 404 und nimmt sie heraus.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const KEY = '1788f334d97c227d9a9abf9403a8ffda';
const HOST = 'westernprint.de';
const SITE = `https://${HOST}`;

// Alt-URLs im Bing-Index, die live schon 404 liefern und kein Gegenstück in dist/ haben (Audit vom 29.09.2026,
// geprüft per curl). Werden nur mit --all gemeldet, damit Bing sie als gelöscht erkennt.
const KNOWN_DEAD = [
  '/921-2/',
  '/produkt/hi-fi-headphones/',
  '/pages/gdpr',
  '/pages/stedman',
  '/products/classic-t-stedman-damen',
  '/products/creator-2-0-white-l',
  '/products/druck-aufschlag',
  '/products/aufpreis-a3',
  '/products/aufpreis-a4',
  '/products/aufpreis-a5-1',
  '/products/aufpreis-a6-1',
  // Seitenzahlen der alten Kollektion: liefern den Stub /collections/produkte, stehen aber als eigene URLs im Index.
  '/collections/produkte?page=2',
  '/collections/produkte?page=3',
];

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const positional = args.filter((a) => !a.startsWith('--'));
const sitemapPath = positional[0]?.endsWith('.xml')
  ? positional.shift()
  : fileURLToPath(new URL('../dist/sitemap-0.xml', import.meta.url));
const changed = positional;
const dryRun = flags.has('--dry-run');
const reportAll = flags.has('--all') || process.env.INDEXNOW_ALL === '1' || changed.includes('scripts/indexnow.mjs');

if (!existsSync(sitemapPath)) { console.log(`IndexNow: ${sitemapPath} fehlt, zuerst npm run build ausführen`); process.exit(1); }
const sitemapUrls = [...readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

// Weiterleitungs-Stubs der alten Shopify-URLs, wie Astro sie gebaut hat (src/pages/pages, products, collections, policies, cart.astro).
// Sie fehlen absichtlich in der Sitemap (astro.config.mjs), deshalb kommen sie aus dem Build-Ordner.
const DIST = dirname(sitemapPath);
function* htmlFiles(dir, rel) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const relPath = `${rel}/${entry.name}`;
    if (entry.isDirectory()) yield* htmlFiles(join(dir, entry.name), relPath);
    // index.html wären Schrägstrich-Weiterleitungen (scripts/trailing-slash-stubs.mjs), die gehören nicht dazu.
    else if (entry.isFile() && entry.name.endsWith('.html') && entry.name !== 'index.html') yield relPath;
  }
}
const redirectUrls = [];
for (const dir of ['pages', 'products', 'collections', 'policies']) {
  if (existsSync(join(DIST, dir))) {
    for (const rel of htmlFiles(join(DIST, dir), dir)) redirectUrls.push(`${SITE}/${rel.slice(0, -'.html'.length)}`);
  }
}
if (existsSync(join(DIST, 'cart.html'))) redirectUrls.push(`${SITE}/cart`);
if (!redirectUrls.length) console.log(`IndexNow: keine Weiterleitungs-Stubs in ${DIST} gefunden`);

let urls;
if (reportAll) {
  urls = [...sitemapUrls, ...redirectUrls, ...KNOWN_DEAD.map((p) => SITE + p)];
} else {
  // Layout, Komponenten, Daten, Hilfsfunktionen oder Styles geändert: alle Sitemap-Seiten melden. Sonst nur die geänderten Seiten.
  const global = changed.length === 0 || changed.some((f) => /^src\/(layouts|components|data|styles|content|lib)\//.test(f) || f === 'astro.config.mjs');
  const pages = changed.filter((f) => f.startsWith('src/pages/') && f.endsWith('.astro'));
  const paths = pages
    .filter((f) => !f.includes('['))
    .map((f) => '/' + f.replace(/^src\/pages\//, '').replace(/\.astro$/, '').replace(/(^|\/)index$/, ''))
    .map((p) => (p === '/' ? '' : p.replace(/\/$/, '')));
  // Dynamische Routen wie src/pages/fuer/[slug].astro: alle URLs unter /fuer/ melden.
  const prefixes = pages
    .filter((f) => f.includes('['))
    .map((f) => '/' + f.replace(/^src\/pages\//, '').replace(/\/?\[[^\]]+\]\.astro$/, '') + '/')
    .map((p) => p.replace(/\/{2,}/g, '/'));
  const touched = (u) => {
    const p = new URL(u).pathname.replace(/\/$/, '');
    return paths.includes(p) || prefixes.some((pre) => p.startsWith(pre));
  };
  // Die Stubs hängen nur an ihrer eigenen Route und an src/components/Redirect.astro, nicht an Layout oder Daten.
  const redirectChanged = changed.includes('src/components/Redirect.astro');
  urls = [...(global ? sitemapUrls : sitemapUrls.filter(touched)), ...(redirectChanged ? redirectUrls : redirectUrls.filter(touched))];
}
urls = [...new Set(urls)];
if (!urls.length) { console.log('IndexNow: keine Seiten zu melden'); process.exit(0); }

if (dryRun) {
  console.log(urls.join('\n'));
  console.log(`IndexNow (Probelauf, nichts gesendet): ${urls.length} URLs`);
  process.exit(0);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls.slice(0, 10000) }),
});
console.log(`IndexNow: ${urls.length} URLs gemeldet${reportAll ? ' (alle)' : ''}, Status ${res.status}`);
if (res.status >= 400) { console.log(await res.text()); process.exit(1); }
