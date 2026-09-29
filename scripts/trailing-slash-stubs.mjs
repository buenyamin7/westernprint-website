// Läuft nach `astro build` (siehe package.json, "build").
// GitHub Pages liefert /kontakt aus kontakt.html, aber /kontakt/ mit Schrägstrich endet auf 404, und einen 301 kann GitHub Pages nicht senden.
// Darum bekommt jede Seite dist/<pfad>.html eine Weiterleitung dist/<pfad>/index.html auf /<pfad>:
// Meta-Refresh 0 und location.replace (Suchparameter und Anker bleiben erhalten), noindex, Canonical auf die Zielseite.
// Ausgenommen: index.html, 404.html, Dateien ohne HTML-Dokument (Google-Bestätigungsdatei) und Seiten,
// die selbst Weiterleitungen sind (alte Shopify-URLs unter /pages, /products, /collections, /policies, /cart).
// Eine vorhandene index.html wird nie überschrieben. Die Sitemap bleibt unverändert.
// Aufruf: node scripts/trailing-slash-stubs.mjs [dist-Ordner]
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://westernprint.de';
const DIST = process.argv[2] ?? fileURLToPath(new URL('../dist/', import.meta.url));

function* htmlFiles(dir, rel = '') {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) yield* htmlFiles(join(dir, entry.name), relPath);
    else if (entry.isFile() && entry.name.endsWith('.html')) yield relPath;
  }
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const stub = (path) => `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <title>Weiterleitung</title>
    <meta name="robots" content="noindex" />
    <link rel="canonical" href="${esc(SITE + path)}" />
    <script>location.replace(${JSON.stringify(path)} + location.search + location.hash)</script>
    <meta http-equiv="refresh" content="0; url=${esc(path)}" />
  </head>
  <body style="font-family:system-ui;padding:40px;background:#111312;color:#ebeae5">
    <p>Weiter zu <a style="color:#8fd3a0" href="${esc(path)}">${esc(`westernprint.de${decodeURI(path)}`)}</a></p>
  </body>
</html>
`;

let created = 0;
let kept = 0;
for (const rel of htmlFiles(DIST)) {
  const name = rel.split('/').pop();
  if (name === 'index.html' || rel === '404.html') continue;
  const html = readFileSync(join(DIST, rel), 'utf8');
  if (!/<html[\s>]/i.test(html)) continue; // z. B. googlebab76f3ffcdc1270.html
  if (/http-equiv=["']?refresh/i.test(html)) continue; // Weiterleitungs-Stub, kein eigener Inhalt
  const slug = rel.slice(0, -'.html'.length);
  const target = join(DIST, slug, 'index.html');
  if (existsSync(target)) { kept++; continue; }
  const path = '/' + slug.split('/').map(encodeURIComponent).join('/');
  mkdirSync(join(DIST, slug), { recursive: true });
  writeFileSync(target, stub(path));
  created++;
}
console.log(`Schrägstrich-Weiterleitungen: ${created} angelegt${kept ? `, ${kept} vorhandene index.html behalten` : ''}`);
