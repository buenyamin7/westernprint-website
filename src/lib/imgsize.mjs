// Bildmaße und WebP-Varianten für Bilder unter public/, ausgewertet zur Buildzeit.
//
// imgInfo(src)   -> { width, height, srcset } eines lokalen Bildes. sharp liest nur den Dateikopf,
//                   das Ergebnis wird pro Pfad gecacht. srcset gibt es nur, wenn Varianten existieren.
// swatchSrc(src) -> 128 x 160 px Vorschau aus public/img/products/sw/, sonst das Original.
//
// Die Varianten erzeugen zwei Skripte, beide idempotent:
//   node scripts/make-image-variants.mjs   <name>-640.webp, -960.webp, -1400.webp neben dem Original
//   node scripts/make-swatches.mjs         public/img/products/sw/<name>.webp
// Fehlt eine Variante (neues Bild, Skript nicht gelaufen), fällt alles auf das Original zurück.
import { existsSync } from 'node:fs';
import path from 'node:path';

/** Zielbreiten der Varianten in px. */
export const VARIANT_WIDTHS = [640, 960, 1400];

// astro build und astro dev laufen im Projektordner (wie src/lib/lastmod.mjs).
const publicDir = () => path.resolve(process.cwd(), 'public');
/** @param {string} src Pfad ab public/, z. B. /img/packtisch.jpg */
const fsPath = (src) => path.join(publicDir(), decodeURI(src.split(/[?#]/)[0]));
const isLocal = (/** @type {string | null | undefined} */ src) => typeof src === 'string' && src.startsWith('/') && !src.startsWith('//');

/**
 * Breiten, in denen es Varianten gibt: nie größer als das Original. Ist das Original schmaler
 * als die größte Stufe, kommt eine Variante in Originalbreite dazu (z. B. 933 px: 640 und 933).
 * @param {number} originalWidth
 */
export function variantWidths(originalWidth) {
  const ws = VARIANT_WIDTHS.filter((w) => w <= originalWidth);
  const max = VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1];
  if (originalWidth < max && !ws.includes(originalWidth)) ws.push(originalWidth);
  return ws;
}

/** /img/packtisch.jpg + 640 -> /img/packtisch-640.webp
 * @param {string} src @param {number} width */
export const variantSrc = (src, width) => src.replace(/\.(jpe?g|png)$/i, `-${width}.webp`);

/** /img/products/creator-2-0-black-flat.webp -> /img/products/sw/creator-2-0-black-flat.webp
 * @param {string} src */
export const swatchPathFor = (src) => `/img/products/sw/${path.posix.basename(src).replace(/\.[^.]+$/, '')}.webp`;

/** @type {any} sharp-Modul, null wenn nicht installiert */
let sharpLib;
async function loadSharp() {
  if (sharpLib === undefined) {
    try {
      sharpLib = (await import('sharp')).default;
    } catch {
      sharpLib = null; // ohne sharp keine Maße: Aufrufer nutzen ihre Standardwerte
    }
  }
  return sharpLib;
}

/** @typedef {{ width: number | null, height: number | null, srcset: string | undefined }} ImgInfo */
/** @type {Map<string, Promise<ImgInfo>>} */
const cache = new Map();

/** @param {string} src @returns {Promise<ImgInfo>} */
async function read(src) {
  const file = fsPath(src);
  /** @type {number | null} */ let width = null;
  /** @type {number | null} */ let height = null;
  const sharp = await loadSharp();
  if (sharp && existsSync(file)) {
    try {
      const m = await sharp(file).metadata();
      width = m.width ?? null;
      height = m.height ?? null;
      // EXIF-Drehung 90/270 Grad: angezeigt wird hochkant bzw. quer
      if (width && height && (m.orientation ?? 1) >= 5) [width, height] = [height, width];
    } catch {
      width = height = null;
    }
  }
  /** @type {string | undefined} */
  let srcset;
  if (width && /\.(jpe?g|png)$/i.test(src)) {
    const parts = variantWidths(width)
      .filter((w) => existsSync(fsPath(variantSrc(src, w))))
      .map((w) => `${variantSrc(src, w)} ${w}w`);
    if (parts.length) srcset = parts.join(', ');
  }
  return { width, height, srcset };
}

/**
 * Maße und srcset eines Bildes aus public/. Externe oder leere Pfade liefern nur null-Werte.
 * @param {string | null | undefined} src
 * @returns {Promise<ImgInfo>}
 */
export function imgInfo(src) {
  if (!src || !isLocal(src)) return Promise.resolve({ width: null, height: null, srcset: undefined });
  let hit = cache.get(src);
  if (!hit) {
    hit = read(src);
    cache.set(src, hit);
  }
  return hit;
}

/**
 * Kleine Vorschau (128 x 160 px) für Farbmuster und Galerie-Thumbnails, falls erzeugt, sonst das Original.
 * @template {string | null | undefined} T
 * @param {T} src
 * @returns {T | string}
 */
export function swatchSrc(src) {
  if (!src || !isLocal(src)) return src;
  const sw = swatchPathFor(src);
  return existsSync(fsPath(sw)) ? sw : src;
}
