// Erzeugt WebP-Varianten für Hero- und Kachelbilder, damit Browser per srcset die passende Größe laden.
//
// Welche Bilder: alles, was an PageHero geht (image="..." in src/pages, image: in src/data/zielgruppen.ts),
// alles, was an Tiles geht (img: in Seiten mit <Tiles>), und jedes Bild der Startseite (src/pages/index.astro).
// Produktfotos unter /img/products/ sind ausgenommen, dafür gibt es scripts/make-swatches.mjs.
//
// Ausgabe neben dem Original: <name>-640.webp, <name>-960.webp, <name>-1400.webp. Nie hochskaliert:
// Ist das Original schmaler als 1400 px, gibt es stattdessen eine Variante in Originalbreite
// (Regel und Dateinamen in src/lib/imgsize.mjs, dort liest auch PageHero/Tiles das srcset).
// Dazu das Logo für Header und Footer: public/img/logo-300.webp (300 px breit, verlustfrei).
//
// Aufruf:  node scripts/make-image-variants.mjs [--force] [/img/weiteres-bild.jpg ...]
// Idempotent: vorhandene Dateien werden übersprungen, --force erzeugt alles neu.
import sharp from 'sharp';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { variantSrc, variantWidths } from '../src/lib/imgsize.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC = path.join(ROOT, 'public');
const args = process.argv.slice(2);
const force = args.includes('--force');
const extra = args.filter((a) => a.startsWith('/img/'));

const QUALITY = 78; // Fotos: kaum sichtbarer Unterschied zum JPG, rund 40 bis 70 % kleiner
const MIN_WIDTH = 640; // kleinere Bilder (Icons, Produktkacheln) brauchen keine Varianten

const rel = (f) => path.relative(ROOT, f);
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const IMG = String.raw`(\/img\/(?!products\/)[\w\/.-]+?\.(?:jpe?g|png))`;
const matches = (text, re) => [...text.matchAll(re)].map((m) => m[1]);

// 1. Bildpfade sammeln
/** @type {Map<string, Set<string>>} Bild -> Fundstellen */
const found = new Map();
const add = (src, where) => { if (!found.has(src)) found.set(src, new Set()); found.get(src).add(where); };

for (const file of walk(path.join(ROOT, 'src/pages')).filter((f) => f.endsWith('.astro'))) {
  const text = readFileSync(file, 'utf8');
  if (text.includes('<PageHero')) matches(text, new RegExp(String.raw`\bimage=["']` + IMG, 'g')).forEach((s) => add(s, `PageHero ${rel(file)}`));
  if (text.includes('<Tiles')) matches(text, new RegExp(String.raw`\bimg:\s*["']` + IMG, 'g')).forEach((s) => add(s, `Tiles ${rel(file)}`));
}
const zg = path.join(ROOT, 'src/data/zielgruppen.ts');
matches(readFileSync(zg, 'utf8'), new RegExp(String.raw`\bimage:\s*["']` + IMG, 'g')).forEach((s) => add(s, `PageHero/Tiles ${rel(zg)}`));
const home = path.join(ROOT, 'src/pages/index.astro');
matches(readFileSync(home, 'utf8'), new RegExp(IMG, 'g')).forEach((s) => add(s, `Startseite ${rel(home)}`));
extra.forEach((s) => add(s, 'Aufruf'));

// 2. Varianten erzeugen
const kb = (n) => `${Math.round(n / 1024)} KB`;
let made = 0, skipped = 0;
async function write(input, out, pipeline) {
  if (existsSync(out) && !force) { skipped++; return null; }
  const info = await pipeline(sharp(input)).toFile(out);
  made++;
  return info;
}

console.log(`${found.size} Bilder gefunden\n`);
for (const [src, where] of [...found].sort(([a], [b]) => a.localeCompare(b))) {
  const input = path.join(PUBLIC, src);
  if (!existsSync(input)) { console.warn(`FEHLT  ${src} (${[...where].join(', ')})`); continue; }
  const meta = await sharp(input).metadata();
  const turned = (meta.orientation ?? 1) >= 5;
  const width = turned ? meta.height : meta.width;
  if (!width || width < MIN_WIDTH) { console.log(`klein  ${src} (${width} px), keine Varianten`); continue; }
  const row = [];
  for (const w of variantWidths(width)) {
    const out = path.join(PUBLIC, variantSrc(src, w));
    await write(input, out, (s) => s.rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: QUALITY, effort: 5 }));
    row.push(`${w}: ${kb(statSync(out).size)}`);
  }
  console.log(`${src} (${width} px, ${kb(statSync(input).size)})  ->  ${row.join(', ')}`);
}

// 3. Logo
const logoIn = path.join(PUBLIC, 'img/logo.png');
const logoOut = path.join(PUBLIC, 'img/logo-300.webp');
if (existsSync(logoIn)) {
  await write(logoIn, logoOut, (s) => s.resize({ width: 300, withoutEnlargement: true }).webp({ lossless: true, effort: 6 }));
  const m = await sharp(logoOut).metadata();
  console.log(`\n/img/logo.png (${kb(statSync(logoIn).size)})  ->  /img/logo-300.webp ${m.width} x ${m.height}, ${kb(statSync(logoOut).size)}`);
}

console.log(`\n${made} Dateien erzeugt, ${skipped} vorhanden und übersprungen${skipped ? ' (--force erzeugt sie neu)' : ''}.`);
