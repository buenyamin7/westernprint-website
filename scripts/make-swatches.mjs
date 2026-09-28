// Erzeugt kleine Vorschaubilder für die Produktseiten (/shop/<handle>), damit Farbmuster und
// Galerie-Thumbnails nicht das volle Produktfoto laden (auf /shop/creator-2-0 sonst rund 1,1 MB nur für Farbmuster).
//
// Quelle: src/data/products.json, dieselbe Datei, die src/lib/shopify.ts liest.
//   colors[].image                    -> Farbmuster (64 x 80 px Anzeige)
//   image, modelImage, extraImages    -> Galerie-Thumbnails unter der Bühne
// Ziel: public/img/products/sw/<name>.webp, 128 x 160 px (cover, 2x für die Anzeige), Transparenz bleibt.
// Die Bühne und der Farbwechsel laden weiter das volle Bild (data-image / data-thumb in [handle].astro).
//
// Aufruf:  node scripts/make-swatches.mjs [--force]
// Idempotent: vorhandene Dateien werden übersprungen, --force erzeugt alles neu.
// Pfadregel in src/lib/imgsize.mjs (swatchPathFor), dort fällt swatchSrc() bei fehlender Datei aufs Original zurück.
import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { swatchPathFor } from '../src/lib/imgsize.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC = path.join(ROOT, 'public');
const force = process.argv.includes('--force');
const W = 128, H = 160;

const products = JSON.parse(readFileSync(path.join(ROOT, 'src/data/products.json'), 'utf8'));
const sources = new Set();
for (const p of products) {
  for (const c of p.colors ?? []) if (c.image) sources.add(c.image);
  for (const g of [p.image, p.modelImage, ...(p.extraImages ?? [])]) if (g) sources.add(g);
}

// Zwei verschiedene Quellen dürfen nicht auf dieselbe Zieldatei fallen (z. B. foo.jpg und foo.webp mit anderem Inhalt).
const byTarget = new Map();
for (const src of sources) {
  const t = swatchPathFor(src);
  if (byTarget.has(t) && byTarget.get(t) !== src) throw new Error(`Namenskonflikt: ${byTarget.get(t)} und ${src} -> ${t}`);
  byTarget.set(t, src);
}

mkdirSync(path.join(PUBLIC, 'img/products/sw'), { recursive: true });
let made = 0, skipped = 0, missing = 0, bytesIn = 0, bytesOut = 0;
const jobs = [...byTarget].map(([target, src]) => async () => {
  const input = path.join(PUBLIC, src), out = path.join(PUBLIC, target);
  if (!existsSync(input)) { missing++; console.warn(`FEHLT  ${src}`); return; }
  if (existsSync(out) && !force) { skipped++; return; }
  const info = await sharp(input).rotate().resize(W, H, { fit: 'cover', position: 'centre' }).webp({ quality: 80, effort: 5 }).toFile(out);
  made++; bytesIn += statSync(input).size; bytesOut += info.size;
});

// kleiner Pool, damit sharp nicht hunderte Dateien gleichzeitig öffnet
const queue = [...jobs];
await Promise.all(Array.from({ length: 8 }, async () => { while (queue.length) await queue.shift()(); }));

const mb = (n) => (n / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
console.log(`${byTarget.size} Bilder aus ${products.length} Produkten: ${made} erzeugt, ${skipped} vorhanden und übersprungen, ${missing} fehlen.`);
if (made) console.log(`Erzeugte Vorschauen: ${mb(bytesOut)} statt ${mb(bytesIn)} für die Originale.`);
