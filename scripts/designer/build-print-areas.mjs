#!/usr/bin/env node
// Baut src/data/designer/print-areas.json: Druckbereiche in cm je Produkt, Kleidergröße und Ansicht.
//
// Quellen:
//   size-charts.json         Hersteller-Maßtabellen (halbe Brustweite, Rückenlänge ab Schulter, Alter)
//   packshots.json           automatisch vermessene Produktfotos (measure-packshots.py)
//   packshot-overrides.json  von Hand gesetzte Kragennaht, Taschen, Knopfleisten, Reißverschlüsse
//   approvals.json           vom Inhaber freigegebene Produkte (nur diese sind bestellbar)
//
// Regeln (RULES unten) sind vom Inhaber freizugeben. Alle Längen im Ergebnis in Hundertstel-cm (U).
// Aufruf: node scripts/designer/build-print-areas.mjs  (danach Kontaktbögen: python3 scripts/designer/qa-sheets.py)

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const products = read('src/data/products.json');
const charts = read('src/data/designer/size-charts.json').products;
const shots = read('src/data/designer/packshots.json');
const overrides = read('src/data/designer/packshot-overrides.json');
const approvals = fs.existsSync(path.join(ROOT, 'src/data/designer/approvals.json')) ? read('src/data/designer/approvals.json') : { products: {} };

export const RULES = {
  version: '2026-10-28.1',
  /** Abstand Motiv zu Kragen, Kapuze, Bündchen, Knopfleiste, Reißverschluss, Tasche (cm) */
  marginCm: 1.5,
  /** Seitlicher Abstand zur Seitennaht: max(3 cm, 12 % der halben Brustweite) je Seite */
  sideMinCm: 3,
  sideShare: 0.12,
  /** Saum bzw. Bündchen unten (cm), kommt zum Abstand dazu */
  hemCm: { tee: 2.5, rib: { adult: 6, kids: 4.5, baby: 3.5 } },
  /** Größte Druckfläche der Presse (cm), gilt zusätzlich */
  pressMaxCm: [40, 50],
  /** Startplatzierung: Oberkante unter der Kragennaht bzw. Kapuze (cm, Erwachsene; Kinder/Baby anteilig) */
  startTopCm: { collar: 7, 'hood-v': 4, 'hood-tip': 4 },
  startWidthCm: { front: 25, back: 28, chest: 10 },
};

const RIB_TYPES = new Set(['Hoodie', 'Sweatshirt', 'Jacke', 'Jacket', 'Sweatjacke']);
const U = (cm) => Math.round(cm * 100);
const r2 = (n) => Math.round(n * 100) / 100;

const isHoodie = (p) => p.category === 'Hoodies' || ['baby-cruiser', 'mini-cruiser-2-0', 'classic-hoodie-kinder'].includes(p.handle);

function group(p) {
  if (p.category === 'Baby') return 'baby';
  if (p.category === 'Kinder') return 'kids';
  return 'adult';
}

function hemCmFor(p) {
  const rib = RIB_TYPES.has(p.productType) || ['Hoodies', 'Sweatshirts', 'Jacken'].includes(p.category);
  return rib ? RULES.hemCm.rib[group(p)] : RULES.hemCm.tee;
}

// Höhenmaßstab k = (Pixel je cm aus der Länge) / (Pixel je cm aus der Breite).
// k je Produkt aus Rundhals-Ansichten (oberster Punkt ~ Schulter), sonst Median der Marke und Gruppe.
const kOwn = {};
for (const p of products) {
  const ov = overrides[p.handle], sh = shots[p.handle], ch = charts[p.style];
  if (!ov || !sh || !ch || isHoodie(p) || ov.front?.zip) continue;
  const ks = [];
  for (const s of p.sizes) { const c = ch.sizes[s]; const m = sh.views.front; if (!c?.halfChestCm || !c.bodyLengthCm || !m?.bodyR) continue; ks.push(((m.hemY - m.topY) / c.bodyLengthCm) / ((m.bodyR - m.bodyL + 1) / c.halfChestCm)); }
  if (ks.length) kOwn[p.handle] = ks.sort((a, b) => a - b)[Math.floor(ks.length / 2)];
}
const median = (a) => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
function kFor(p) {
  if (kOwn[p.handle]) return kOwn[p.handle];
  const same = products.filter((q) => kOwn[q.handle] && q.brand === p.brand && group(q) === group(p)).map((q) => kOwn[q.handle]);
  const brand = products.filter((q) => kOwn[q.handle] && q.brand === p.brand).map((q) => kOwn[q.handle]);
  return median(same.length ? same : brand);
}

/** Kalibrierung einer Ansicht für eine Größe: Pixel je cm aus Körperbreite im Foto und halber Brustweite */
function viewGeometry(p, view, m, ov, size, chart) {
  const bodyW = ov.bodyFrom ? null : m.bodyR - m.bodyL + 1;
  // Die Fotos zeigen das Textil wie getragen (räumlich): zur Seite hin wird der Stoff verkürzt abgebildet, in der Mitte nicht.
  // Maßstab deshalb aus der Länge (Breitenmaßstab x k), einheitlich für Bühne, Zone und Motiv.
  const k = kFor(p);
  const pxPerCm = (bodyW / chart.halfChestCm) * k;
  const originPx = [m.centerX, ov.originY];
  const cm = (px) => px / pxPerCm;
  const cmY = cm;
  const g = group(p);
  const scale = g === 'adult' ? 1 : Math.min(1, chart.halfChestCm / 52);
  const frame = ov.frame || (view === 'front' && isHoodie(p) ? 'hood-v' : 'collar');

  // Breite: Regel aus der Maßtabelle, oben zusätzlich durch Armausschnitt begrenzt (Tanktops)
  const side = Math.max(RULES.sideMinCm, RULES.sideShare * chart.halfChestCm);
  let half = chart.halfChestCm / 2 - side;
  if (m.topBodyW && (p.productType === 'Tank Top' || p.category === 'Tank Tops' || p.handle === 'stanley-stancer')) half = Math.min(half, cm(m.topBodyW) / 2 - RULES.marginCm);
  half = Math.min(half, RULES.pressMaxCm[0] / 2);

  // Länge: aus der Maßtabelle (Rückenlänge ab Schulter minus Abstand Schulter -> Kragennaht im Foto) und aus dem Foto
  const drop = cmY(ov.originY - m.topY);
  const limits = [];
  // Bei Kapuzen liegt der oberste Bildpunkt über der Schulter: der Abstand wird dadurch größer geschätzt, die Grenze also vorsichtiger
  if (chart.bodyLengthCm) limits.push(chart.bodyLengthCm - drop - hemCmFor(p) - RULES.marginCm);
  limits.push(cmY(m.hemY - ov.originY) - hemCmFor(p) - RULES.marginCm);
  if (ov.bottomY) limits.push(cmY(ov.bottomY - ov.originY) - RULES.marginCm);
  limits.push(RULES.pressMaxCm[1] + RULES.marginCm);
  const yMax = Math.min(...limits);

  const exclude = [];
  if (ov.placket) exclude.push({ x0U: U(-cm(ov.placket) - RULES.marginCm), x1U: U(cm(ov.placket) + RULES.marginCm), y0U: 0, y1U: U(cmY(ov.exclY - ov.originY) + RULES.marginCm), label: 'der Knopfleiste' });
  if (ov.zip) exclude.push({ x0U: U(-cm(ov.zip) - RULES.marginCm), x1U: U(cm(ov.zip) + RULES.marginCm), y0U: 0, y1U: U(yMax + 1), label: 'dem Reißverschluss' });

  const zone = { xMinU: U(-half), xMaxU: U(half), yMinU: U(RULES.marginCm), yMaxU: U(yMax), exclude };
  const ok = half > 2 && yMax > RULES.marginCm + 2;

  // Startplatzierungen
  const top = Math.max(RULES.marginCm, RULES.startTopCm[frame] * scale);
  const presets = {};
  const fitW = (w, cx, t) => Math.max(0, Math.min(w, 2 * (half - Math.abs(cx)), (yMax - t)));
  if (!ov.zip && !ov.placket) presets.center = { centerXU: 0, topYU: U(top), widthU: U(fitW(RULES.startWidthCm[view] * scale, 0, top)) };
  if (view === 'front' && p.productType !== 'Tank Top' && p.handle !== 'stanley-stancer') {
    // Brust links aus Sicht der tragenden Person = im Bild rechts (x positiv)
    const cx = Math.min(half - RULES.startWidthCm.chest * scale / 2, chart.halfChestCm * 0.22);
    const t = Math.max(RULES.marginCm, 5 * scale);
    presets.chest_left = { centerXU: U(cx), topYU: U(t), widthU: U(Math.min(RULES.startWidthCm.chest * scale, 2 * (half - cx))) };
  }
  if (view === 'front' && (ov.zip || ov.placket)) {
    // Bei Knopfleiste/Reißverschluss nur seitliche Brustplatzierungen und unterhalb der Knopfleiste mittig
    if (ov.placket) presets.center = { centerXU: 0, topYU: U(cmY(ov.exclY - ov.originY) + RULES.marginCm), widthU: U(fitW(20 * scale, 0, cmY(ov.exclY - ov.originY) + RULES.marginCm)) };
  }
  return { frame, pxPerCm: r2(pxPerCm), heightScale: r2(k), originPx, zone: ok ? zone : null, presets, dropCm: r2(drop) };
}

const out = { version: RULES.version, rules: RULES, generatedFrom: { sizeCharts: read('src/data/designer/size-charts.json').fetchedAt }, products: {} };
const report = [];

for (const p of products) {
  const ovAll = overrides[p.handle];
  const chart = charts[p.style];
  const shot = shots[p.handle];
  if (!ovAll || !chart || !shot) { report.push(`${p.handle}: nicht im Designer V2 (kein Oberteil oder keine Daten), bleibt beim bisherigen Designer`); continue; }
  const approved = approvals.products?.[p.handle] || null;
  const entry = { style: p.style, status: approved ? 'approved' : 'estimated', approvedAt: approved?.date || null, views: {}, sizes: {} };
  for (const view of ['front', 'back']) {
    const ov = ovAll[view] || (view === 'back' ? null : null);
    const m = shot.views[view] || (view === 'back' ? shot.views.front : null);
    if (!m) continue;
    // Ohne eigenes Rückenfoto: schematische Rückansicht aus der Silhouette der Vorderseite, Rückseiten-Kragennaht geschätzt
    const schematic = view === 'back' && !shot.views.back;
    // Hoodie: Kapuzenspitze hinten etwa auf Höhe des Kapuzenansatzes vorne; sonst hintere Kragennaht knapp unter dem obersten Punkt
    const ovView = ov || (schematic ? (isHoodie(p) ? { originY: ovAll.front.originY, frame: 'hood-tip' } : { originY: shot.views.front.topY + Math.round((ovAll.front.originY - shot.views.front.topY) * 0.3) }) : null);
    if (!ovView) continue;
    const mm = ovView.bodyFrom ? { ...m, bodyL: shot.views[ovView.bodyFrom].bodyL, bodyR: shot.views[ovView.bodyFrom].bodyR } : m;
    entry.views[view] = { image: m.image, schematic, imageSize: [m.w, m.h], centerX: m.centerX };
    for (const size of p.sizes) {
      const c = chart.sizes[size];
      if (!c?.halfChestCm) { report.push(`${p.handle} ${size}: Maßtabelle fehlt, Größe gesperrt`); continue; }
      const sz = (entry.sizes[size] ||= { halfChestCm: c.halfChestCm, bodyLengthCm: c.bodyLengthCm, ageLabel: c.ageLabel || null, areas: {} });
      const g = viewGeometry(p, view, mm, { ...ovView, bodyFrom: undefined }, size, c);
      sz.areas[view] = { status: entry.status, ...g };
      if (!g.zone) report.push(`${p.handle} ${size} ${view}: kein Druckbereich nach den Regeln, gesperrt`);
    }
  }
  // Kinder- und Babygrößen brauchen eine Altersangabe
  if (['baby', 'kids'].includes(group(p))) for (const [s, sz] of Object.entries(entry.sizes)) if (!sz.ageLabel) report.push(`${p.handle} ${s}: Altersangabe fehlt`);
  out.products[p.handle] = entry;
}

fs.writeFileSync(path.join(ROOT, 'src/data/designer/print-areas.json'), JSON.stringify(out));
const n = Object.keys(out.products).length;
const approvedN = Object.values(out.products).filter((e) => e.status === 'approved').length;
fs.writeFileSync(path.join(ROOT, 'src/data/designer/coverage.txt'), [`Designer V2 Abdeckung, Regeln ${RULES.version}`, `${n} Produkte im Designer V2, davon ${approvedN} freigegeben`, '', ...report].join('\n') + '\n');
console.log(`${n} Produkte, ${approvedN} freigegeben, ${report.length} Hinweise (coverage.txt)`);
