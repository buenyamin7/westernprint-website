// Designer-Kern V2: gemeinsame Rechenlogik für Shop (Browser) und Kassen-Worker.
// Reine Funktionen ohne DOM. Diese Datei wird unverändert nach westernprint-checkout/src/designer-core.mjs kopiert
// (scripts/sync-designer-core.mjs prüft, dass beide Kopien identisch sind).
//
// Längen intern in ganzzahligen Hundertstel-Zentimetern (U, 1 U = 0,1 mm), damit Shop und Kasse
// ohne Gleitkomma-Drift dieselben Grenzen prüfen. Geld bleibt in der bestehenden Preislogik (priceLine).
//
// Koordinaten je Druckfläche (Frame): Ursprung auf der Mittellinie des Textils an der Kragennaht
// (vorne: vordere Kragennaht, hinten: hintere Kragennaht). x positiv nach rechts im Bild, y positiv nach unten.
// Links/rechts in Texten immer aus Sicht der tragenden Person.

export const CORE_VERSION = '2.0.0';

/** cm -> ganzzahlige Hundertstel-cm */
export const toU = (cm) => Math.round(Number(cm) * 100);
/** Hundertstel-cm -> cm */
export const fromU = (u) => u / 100;
/** Anzeige mit einer Nachkommastelle, deutsches Komma */
export const fmtCm = (u, digits = 1) => (u / 100).toFixed(digits).replace('.', ',');

/** Eingabe "12,5" / "12.5" / " 12 " -> 12.5; leer oder ungültig -> null */
export function parseCm(text) {
  const s = String(text ?? '').trim().replace(/\s+/g, '').replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

// ── Preisstufen ──────────────────────────────────────────────────────────────
// Freigegeben 28.10.2026: DIN-Maße, Motiv hoch oder quer. Maßgeblich ist das sichtbare Motiv.
// Die Aufschläge selbst stehen unverändert in PRINT_SIZES (Shop) bzw. catalog.js (Kasse).
export const TARIFF_VERSION = '2026-10-28';
export const TARIFFS = [
  { key: 'A6', maxU: [1050, 1480] },
  { key: 'Brust', maxU: [1200, 1200], frontOnly: true },
  { key: 'A5', maxU: [1480, 2100] },
  { key: 'A4', maxU: [2100, 2970] },
  { key: 'A3+', maxU: [3300, 4800] },
];
/** Ärmel: max. 8 x 8 cm (wie SLEEVE im Shop und in der Kasse) */
export const SLEEVE_MAX_U = [800, 800];
/** Ärmel bei Kinder- und Babygrößen: schrumpft mit demselben Faktor wie die Formate, auf 0,5 cm gerundet, Preis gleich */
export const sleeveMaxFor = (scale = 1) => (!(scale > 0) || scale >= 1 ? SLEEVE_MAX_U : SLEEVE_MAX_U.map((u) => Math.max(100, Math.round((u * scale) / 50) * 50)));
/** Text für Ärmelgröße, z. B. „max. 4,5 x 4,5 cm“ */
export const sleeveText = (scale = 1) => { const [a, b] = sleeveMaxFor(scale); return `max. ${fmtCm(a)} x ${fmtCm(b)} cm`; };

/**
 * Formate für Kinder- und Babygrößen: gleiche Stufen und gleiche Preise wie bei Erwachsenen, aber die Maße schrumpfen
 * mit dem Textil. Faktor = halbe Brustweite / 52 cm (Erwachsene M), höchstens 1. Maße auf 0,5 cm gerundet.
 * Freigegeben 28.10.2026 („gleiche Preise wie bei Erwachsenen“).
 */
export const ADULT_REF_HALF_CHEST_CM = 52;
export const tariffScaleFor = (halfChestCm, isAdult) => (isAdult || !(halfChestCm > 0) ? 1 : Math.min(1, Math.round((halfChestCm / ADULT_REF_HALF_CHEST_CM) * 100) / 100));
/** Formate für einen Größenfaktor (1 = Erwachsene) */
export function tariffsFor(scale = 1) {
  if (!(scale > 0) || scale >= 1) return TARIFFS;
  const r = (u) => Math.max(100, Math.round((u * scale) / 50) * 50);
  return TARIFFS.map((t) => ({ ...t, maxU: [r(t.maxU[0]), r(t.maxU[1])] }));
}

/** Toleranz der Preisstufen: 0,5 mm. Eine echte A4-Datei (2480 x 3508 px) ist bei 21 cm Breite 29,704 cm hoch und bleibt A4. */
export const TARIFF_TOLERANCE_U = 5;
const fitsBox = (w, h, [a, b]) => { const t = TARIFF_TOLERANCE_U; return (w <= a + t && h <= b + t) || (w <= b + t && h <= a + t); };

/**
 * Kleinste passende Preisstufe für ein sichtbares Motiv.
 * @param {{widthU:number,heightU:number,side:'front'|'back',allowBrust:boolean,surcharges:Record<string,number>}} p
 * @returns {{key:string}|{error:string}}
 */
export function classifyPrint({ widthU, heightU, side, allowBrust, surcharges, scale = 1 }) {
  if (!(widthU > 0 && heightU > 0)) return { error: 'Motivmaße fehlen' };
  const list = tariffsFor(scale);
  const options = list.filter((t) => fitsBox(widthU, heightU, t.maxU) && (!t.frontOnly || (side === 'front' && allowBrust)));
  if (!options.length) { const big = list[list.length - 1].maxU; return { error: `Das Motiv ist größer als die größte Druckgröße (${fmtCm(big[0])} x ${fmtCm(big[1])} cm).` }; }
  // Günstigste Stufe; bei gleichem Preis die Reihenfolge in TARIFFS (A6 vor Brust).
  options.sort((a, b) => (surcharges[a.key] ?? 0) - (surcharges[b.key] ?? 0) || list.indexOf(a) - list.indexOf(b));
  return { key: options[0].key, maxU: options[0].maxU };
}

/** Wählbare Stufen für „Motiv später schicken“: eine Stufe zählt, wenn ein Motiv größer als die vorige Stufe in die Zone passt. */
export function reachableTariffs(zone, side, allowBrust, scale = 1) {
  const list = tariffsFor(scale).filter((t) => !t.frontOnly || (side === 'front' && allowBrust));
  const w = zone.xMaxU - zone.xMinU, h = zone.yMaxU - zone.yMinU;
  // Erreichbar, solange der Druckbereich nicht vollständig in die vorige Stufe passt
  return list.filter((t, i) => { const prev = list.slice(0, i).filter((x) => !x.frontOnly).pop(); return !prev || !fitsBox(w, h, prev.maxU); });
}

// ── Motivmaße ────────────────────────────────────────────────────────────────

/**
 * Sichtbare Höhe zu einer sichtbaren Breite, proportional zu den sichtbaren Pixeln.
 * exact: genaue Höhe in U (Gleitkomma), checkU: aufgerundet für Grenz- und Tarifprüfung, storedCm: 2 Nachkommastellen.
 */
export function heightFor(widthU, bw, bh) {
  const exact = (widthU * bh) / bw;
  return { exact, checkU: Math.ceil(exact - 1e-9), storedCm: Math.round(exact) / 100 };
}

/** Breite zu einer gewünschten sichtbaren Höhe (für die Höheneingabe) */
export const widthForHeight = (heightU, bw, bh) => Math.round((heightU * bw) / bh);

/** Effektive Auflösung des sichtbaren Motivs in dpi */
export function sourceDpi(bw, bh, widthU, heightExactU) {
  const x = bw / (widthU / 100 / 2.54), y = bh / (heightExactU / 100 / 2.54);
  return { x, y, min: Math.min(x, y) };
}

// Freigegeben 28.10.2026: nur Hinweis, nie sperren. Unter 150 dpi muss der Kunde den Hinweis bestätigen.
export const QUALITY_POLICY = { version: '2026-10-28', warnBelowDpi: 150 };
export const qualityFor = (dpiMin) => (dpiMin < QUALITY_POLICY.warnBelowDpi ? { code: 'LOW_DPI', level: 'warn' } : { code: null, level: 'ok' });

/** Pixel des Druckrasters je Achse bei 300 dpi */
export const productionPx = (u) => Math.round((u / 100 / 2.54) * 300);

// ── Druckbereich ─────────────────────────────────────────────────────────────
// zone: { xMinU, xMaxU, yMinU, yMaxU, exclude?: [{x0U,x1U,y0U,y1U,label}] } im Frame der Druckfläche.
// Die Zone enthält bereits alle Sicherheitsabstände (1,5 cm zu Kragen und Bündchen usw.).

/** Rechteck des sichtbaren Motivs in doppelten U (vermeidet halbe Einheiten bei ungerader Breite) */
const rect2 = ({ centerXU, topYU, widthU, heightU }) => ({ l: 2 * centerXU - widthU, r: 2 * centerXU + widthU, t: 2 * topYU, b: 2 * (topYU + heightU) });

/** Liegt das Motiv vollständig in der Zone und außerhalb aller Aussparungen? Gibt den ersten Verstoß zurück. */
export function checkPlacement(zone, pl) {
  const r = rect2(pl);
  if (r.t < 2 * zone.yMinU) return { ok: false, code: 'TOP', message: 'Das Motiv liegt zu nah am Kragen.' };
  if (r.b > 2 * zone.yMaxU) return { ok: false, code: 'BOTTOM', message: 'Das Motiv reicht zu weit nach unten.' };
  if (r.l < 2 * zone.xMinU || r.r > 2 * zone.xMaxU) return { ok: false, code: 'SIDE', message: 'Das Motiv reicht über den Druckbereich an der Seite.' };
  for (const e of zone.exclude || []) {
    if (r.l < 2 * e.x1U && 2 * e.x0U < r.r && r.t < 2 * e.y1U && 2 * e.y0U < r.b) return { ok: false, code: 'EXCLUDE', message: `Das Motiv liegt auf ${e.label || 'einem nicht bedruckbaren Bereich'}.` };
  }
  return { ok: true };
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * Verschieben: nächste gültige Position zur Wunschposition bei gleicher Größe, oder null, wenn die Größe nirgends passt.
 * Erst in die Zonengrenzen klemmen, dann bei Aussparungen an die nächste freie Kante schieben.
 */
export function constrainMove(zone, { widthU, heightU }, wantX, wantTop) {
  const minX = Math.ceil((2 * zone.xMinU + widthU) / 2), maxX = Math.floor((2 * zone.xMaxU - widthU) / 2);
  const minT = zone.yMinU, maxT = zone.yMaxU - heightU;
  if (minX > maxX || minT > maxT) return null;
  let cx = clamp(Math.round(wantX), minX, maxX), top = clamp(Math.round(wantTop), minT, maxT);
  const pl = { centerXU: cx, topYU: top, widthU, heightU };
  if (checkPlacement(zone, pl).ok) return pl;
  // Kandidaten: an jede Kante jeder Aussparung schieben, den nächsten gültigen nehmen
  const cands = [];
  for (const e of zone.exclude || []) {
    cands.push({ cx: Math.floor((2 * e.x0U - widthU) / 2), top }, { cx: Math.ceil((2 * e.x1U + widthU) / 2), top }, { cx, top: e.y1U }, { cx, top: e.y0U - heightU });
  }
  let best = null, bestD = Infinity;
  for (const c of cands) {
    const p = { centerXU: clamp(c.cx, minX, maxX), topYU: clamp(c.top, minT, maxT), widthU, heightU };
    if (!checkPlacement(zone, p).ok) continue;
    const d = (p.centerXU - wantX) ** 2 + (p.topYU - wantTop) ** 2;
    if (d < bestD) { bestD = d; best = p; }
  }
  return best;
}

/**
 * Größte Breite (U) an derselben Ankerposition, bei der das Motiv noch gültig liegt.
 * anchor 'center': Mittelpunkt x bleibt, Oberkante bleibt. Gibt 0 zurück, wenn nichts passt.
 */
export function maxWidthAt(zone, bw, bh, centerXU, topYU, limitU = 5000) {
  let lo = 0, hi = limitU;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const h = heightFor(mid, bw, bh).checkU;
    if (checkPlacement(zone, { centerXU, topYU, widthU: mid, heightU: h }).ok) lo = mid; else hi = mid - 1;
  }
  return lo;
}

/** Größte Breite, die irgendwo in der Zone passt (Vorschlag „verkleinern auf …“), mit Position. */
export function fitSuggestion(zone, bw, bh, wantX, wantTop) {
  let lo = 0, hi = Math.max(0, zone.xMaxU - zone.xMinU);
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (constrainMove(zone, { widthU: mid, heightU: heightFor(mid, bw, bh).checkU }, wantX, wantTop)) lo = mid; else hi = mid - 1;
  }
  return lo ? constrainMove(zone, { widthU: lo, heightU: heightFor(lo, bw, bh).checkU }, wantX, wantTop) : null;
}

// ── Abbildung Frame (cm) <-> Produktfoto (Pixel) ─────────────────────────────
// cal: { originPx: [x, y], pxPerCm } für das Referenzfoto (intrinsische Pixel) und die gewählte Kleidergröße.

export const cmToPx = (cal, xU, yU) => [cal.originPx[0] + (xU / 100) * cal.pxPerCm, cal.originPx[1] + (yU / 100) * cal.pxPerCm];
export const pxToU = (cal, px, py) => [Math.round(((px - cal.originPx[0]) / cal.pxPerCm) * 100), Math.round(((py - cal.originPx[1]) / cal.pxPerCm) * 100)];

// ── Serverseitige Prüfung einer V2-Druckposition ─────────────────────────────

const SIDES_V2 = ['front', 'back'];
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : NaN);

/**
 * Prüft eine Druckposition aus dem Warenkorb gegen die Katalogdaten und berechnet daraus die Preisstufe neu.
 * Clientwerte (Maße, Pixel, dpi) werden nachgerechnet, nicht übernommen.
 * @param {object} pl  Position aus dem Warenkorb (siehe docs/designer-v2.md)
 * @param {object} area  Katalog: printAreas[style].sizes[size].areas[pl.side]
 * @param {{allowBrust:boolean,surcharges:Record<string,number>}} opts
 * @returns {{ok:true, tariff:string, widthU:number, heightU:number, heightCm:number, dpi:number, quality:object}|{ok:false,error:string}}
 */
export function verifyPlacement(pl, area, opts) {
  if (!pl || !SIDES_V2.includes(pl.side)) return { ok: false, error: 'Unbekannte Druckfläche' };
  if (!area || area.status !== 'approved') return { ok: false, error: 'Für diese Größe ist der Druckbereich noch nicht freigegeben.' };
  const px = pl.px || {};
  const [W, H, bx, by, bw, bh] = [px.w, px.h, px.bx, px.by, px.bw, px.bh].map(num);
  if (![W, H, bx, by, bw, bh].every((n) => Number.isInteger(n)) || bw < 1 || bh < 1 || bx < 0 || by < 0 || bx + bw > W || by + bh > H) return { ok: false, error: 'Ungültige Motivpixel' };
  const widthU = toU(num(pl.widthCm)), centerXU = toU(num(pl.centerXCm)), topYU = toU(num(pl.topYCm));
  if (!(widthU > 0) || !Number.isFinite(centerXU) || !Number.isFinite(topYU)) return { ok: false, error: 'Ungültige Motivmaße' };
  const h = heightFor(widthU, bw, bh);
  if (Math.abs(toU(num(pl.heightCm)) - h.exact) > 1.01) return { ok: false, error: 'Motivhöhe passt nicht zur Breite' };
  const chk = checkPlacement(area.zone, { centerXU, topYU, widthU, heightU: h.checkU });
  if (!chk.ok) return { ok: false, error: chk.message };
  const t = classifyPrint({ widthU, heightU: h.checkU, side: pl.side, allowBrust: opts.allowBrust, surcharges: opts.surcharges, scale: area.tariffScale || 1 });
  if ('error' in t) return { ok: false, error: t.error };
  const dpi = sourceDpi(bw, bh, widthU, h.exact).min;
  const quality = qualityFor(dpi);
  if (quality.code && !(Array.isArray(pl.ack) && pl.ack.includes(quality.code))) return { ok: false, error: 'Der Auflösungshinweis wurde nicht bestätigt.' };
  return { ok: true, tariff: t.key, widthU, heightU: h.checkU, heightCm: h.storedCm, dpi: Math.round(dpi), quality };
}
