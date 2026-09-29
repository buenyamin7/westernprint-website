// Ehrliche Datumsangaben aus der git-Historie, für die Sitemap (astro.config.mjs) und das
// WebPage-Schema samt sichtbarer "Stand"-Zeile (src/layouts/Base.astro).
//
// modified  = jüngster Commit über alle Quelldateien einer Seite
// published = ältestes Anlegedatum (erster Commit, der die Datei hinzugefügt hat)
//
// Ist git nicht verfügbar (oder das Repo nur flach geklont), kommt undefined zurück.
// Die Aufrufer lassen das Feld dann weg. Bewusst kein Builddatum als Ersatz.
// Uncommittete Änderungen zählen nicht: Eine Seite trägt das Datum ihres letzten Commits,
// nach dem nächsten Commit stimmt es automatisch.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

// astro build und astro dev laufen im Projektordner, der zugleich das git-Repo ist.
const ROOT = process.cwd();

/** @type {Map<string, { modified?: string, published?: string } | null>} */
const fileCache = new Map();
/** @type {boolean | undefined} */
let gitOk;

/** @param {string[]} args */
function git(args) {
  // --literal-pathspecs: Dateinamen wie [slug].astro nicht als Glob-Muster lesen.
  return execFileSync('git', ['--literal-pathspecs', ...args], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function gitAvailable() {
  if (gitOk === undefined) {
    try {
      // Flacher Klon (fetch-depth 1) hätte für alle Dateien dasselbe Datum: dann lieber gar keins.
      gitOk = git(['rev-parse', '--is-inside-work-tree']) === 'true' && git(['rev-parse', '--is-shallow-repository']) === 'false';
    } catch {
      gitOk = false;
    }
  }
  return gitOk;
}

/** @param {string} rel */
const exists = (rel) => existsSync(path.join(ROOT, rel));

/**
 * Inhaltsdateien, die eine Seite per Import einbindet (z. B. die Rechtstexte unter src/content/legal).
 * @param {string} pageFile
 */
function contentImports(pageFile) {
  try {
    const src = readFileSync(path.join(ROOT, pageFile), 'utf8');
    const dir = path.posix.dirname(pageFile);
    return [...src.matchAll(/from\s+['"](\.{1,2}\/(?:[^'"?]*\/)?content\/[^'"?]+)(?:\?[^'"]*)?['"]/g)]
      .map((m) => path.posix.normalize(path.posix.join(dir, m[1])))
      .filter(exists);
  } catch {
    return [];
  }
}

/**
 * Quelldateien einer URL, relativ zum Projektordner.
 * Akzeptiert Pfade ("/fuer/sportvereine") und volle URLs ("https://westernprint.de/fuer/sportvereine").
 * @param {string} pathname
 * @returns {string[]}
 */
export function sourceFilesFor(pathname) {
  let p = String(pathname || '/');
  if (/^https?:\/\//.test(p)) p = new URL(p).pathname;
  const clean = ('/' + p).replace(/\/{2,}/g, '/').replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '') || '/';

  // Startseite: Hero-Bewertung und Sternezahl kommen aus bewertungen.ts. site.ts bewusst nicht,
  // sonst springt das Datum aller Seiten bei jeder Änderung an Navigation oder Kontaktdaten.
  if (clean === '/') return ['src/pages/index.astro', 'src/data/bewertungen.ts'];

  const parts = clean.slice(1).split('/');

  if (parts[0] === 'fuer' && parts.length === 2) {
    const own = `src/pages/fuer/${parts[1]}.astro`;
    // Auch Seiten mit eigener Datei (abschlussklassen, streetwear-brands) lesen ihre Texte aus zielgruppen.ts.
    return exists(own) ? [own, 'src/data/zielgruppen.ts'] : ['src/pages/fuer/[slug].astro', 'src/data/zielgruppen.ts'];
  }

  if (parts[0] === 'shop' && parts.length === 2) {
    return ['src/pages/shop/[handle].astro', ...(exists('src/data/products.json') ? ['src/data/products.json'] : [])];
  }

  const rel = parts.join('/');
  const page = [`src/pages/${rel}.astro`, `src/pages/${rel}/index.astro`].find(exists);
  const files = page ? [page, ...contentImports(page)] : [];
  if (clean === '/bewertungen') files.push('src/data/bewertungen.ts');
  // Datendateien, aus denen die Seite ihren Inhalt zieht: Preisänderungen und neue Zielgruppen bewegen das Datum.
  if (clean === '/was-kostet-textildruck') files.push('src/data/preise.ts');
  if (clean === '/fuer') files.push('src/data/zielgruppen.ts');
  // Die Shop-Übersicht listet die Produkte aus dem Katalog-Snapshot.
  if (clean === '/shop' && exists('src/data/products.json')) files.push('src/data/products.json');
  return files;
}

/** @param {string} file */
function fileDates(file) {
  if (fileCache.has(file)) return fileCache.get(file) ?? null;
  /** @type {{ modified?: string, published?: string } | null} */
  let result = null;
  try {
    const modified = git(['log', '-1', '--format=%cI', '--', file]) || undefined;
    const added = git(['log', '--diff-filter=A', '--follow', '--format=%cI', '--', file]).split('\n').filter(Boolean);
    const published = added.length ? added[added.length - 1] : undefined;
    if (modified || published) result = { modified, published };
  } catch {
    result = null;
  }
  fileCache.set(file, result);
  return result;
}

/**
 * Datumsangaben aus git als ISO-8601-Strings mit Zeitzone (z. B. "2026-09-28T12:20:02+02:00").
 * Gibt undefined zurück, wenn git fehlt oder keine der Dateien eine Historie hat.
 * @param {string[]} files
 * @returns {{ modified?: string, published?: string } | undefined}
 */
export function gitDates(files) {
  if (!files?.length || !gitAvailable()) return undefined;
  /** @type {string | undefined} */ let modified;
  /** @type {string | undefined} */ let published;
  for (const file of files) {
    const d = fileDates(file);
    if (!d) continue;
    if (d.modified && (!modified || Date.parse(d.modified) > Date.parse(modified))) modified = d.modified;
    if (d.published && (!published || Date.parse(d.published) < Date.parse(published))) published = d.published;
  }
  if (!modified && !published) return undefined;
  return { modified, published };
}

/**
 * Erster Commit, in dem eine Zielgruppe in src/data/zielgruppen.ts auftaucht ("slug: '<slug>'").
 * Die Datendatei ist älter als viele ihrer Seiten, ihr Anlegedatum wäre für neue Zielgruppen falsch.
 * @param {string} slug
 * @returns {string | undefined}
 */
function slugAdded(slug) {
  try {
    const first = git(['log', '--reverse', '--format=%cI', '-S', `slug: '${slug}'`, '--', 'src/data/zielgruppen.ts']).split('\n').find(Boolean);
    return first || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Datumsangaben einer URL (WebPage-Schema und Stand-Zeile in Base.astro).
 * Wie gitDates(sourceFilesFor(url)), nur datePublished der /fuer/<slug>-Seiten kommt aus dem ersten
 * Commit mit diesem Slug (bzw. der eigenen Seitendatei, falls die früher da war).
 * @param {string} pathname
 * @returns {{ modified?: string, published?: string } | undefined}
 */
export function pageDates(pathname) {
  const dates = gitDates(sourceFilesFor(pathname));
  if (!dates) return dates;
  let p = String(pathname || '/');
  if (/^https?:\/\//.test(p)) p = new URL(p).pathname;
  const m = /^\/fuer\/([a-z0-9-]+?)(?:\.html)?\/?$/.exec(p);
  if (m) {
    const own = `src/pages/fuer/${m[1]}.astro`;
    const kandidaten = [slugAdded(m[1]), exists(own) ? fileDates(own)?.published : undefined].filter(Boolean);
    if (kandidaten.length) dates.published = kandidaten.sort((a, b) => Date.parse(a) - Date.parse(b))[0];
  }
  return dates;
}

/**
 * "2026-09-28T12:20:02+02:00" -> "28.09.2026" (Datum so, wie es im Commit steht, ohne Zeitzonen-Umrechnung).
 * @param {string | undefined} iso
 */
export function formatDateDe(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '');
  return m ? `${m[3]}.${m[2]}.${m[1]}` : undefined;
}
