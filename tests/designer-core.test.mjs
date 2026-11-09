// node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  toU, parseCm, classifyPrint, heightFor, widthForHeight, sourceDpi, qualityFor, productionPx,
  checkPlacement, constrainMove, maxWidthAt, fitSuggestion, cmToPx, pxToU, verifyPlacement,
} from '../src/lib/designer-core/core.mjs';

const SUR = { Brust: 500, A6: 500, A5: 600, A4: 700, 'A3+': 900 };
const cls = (w, h, side = 'front', allowBrust = true) => classifyPrint({ widthU: toU(w), heightU: toU(h), side, allowBrust, surcharges: SUR });

test('parseCm akzeptiert Komma und Punkt, lehnt Unsinn ab', () => {
  assert.equal(parseCm('12,5'), 12.5);
  assert.equal(parseCm(' 12.5 '), 12.5);
  assert.equal(parseCm('7'), 7);
  for (const bad of ['', '-3', '1,2,3', 'abc', '12 cm', '.5']) assert.equal(parseCm(bad), null, bad);
});

test('Preisstufen: knapp darunter, genau darauf, knapp darüber, hoch und quer', () => {
  const edges = [['A6', 10.5, 14.8, 'A5'], ['A5', 14.8, 21, 'A4'], ['A4', 21, 29.7, 'A3+']];
  for (const [key, w, h, next] of edges) {
    assert.equal(cls(w - 0.01, h - 0.01).key, key);
    assert.equal(cls(w, h).key, key, `${key} genau`);
    assert.equal(cls(h, w).key, key, `${key} quer`);
    assert.equal(cls(w + 0.05, h).key, key, `${key} innerhalb 0,5 mm Toleranz`);
    assert.equal(cls(w + 0.06, h).key, next, `${key} knapp drüber`);
  }
  assert.equal(cls(33, 48).key, 'A3+');
  assert.equal(cls(48, 33).key, 'A3+');
  assert.ok('error' in cls(33.06, 48));
  // Echte A4-Datei 2480 x 3508 px auf 21 cm Breite
  assert.equal(classifyPrint({ widthU: 2100, heightU: heightFor(2100, 2480, 3508).checkU, side: 'front', allowBrust: true, surcharges: SUR }).key, 'A4');
  assert.ok('error' in cls(34, 34));
});

test('Brust 12 x 12 nur vorne und nur bei Textilien mit Brust', () => {
  assert.equal(cls(12, 12).key, 'Brust');
  assert.equal(cls(10, 10).key, 'A6', 'gleicher Preis: A6 hat Vorrang');
  assert.equal(cls(12, 12, 'back').key, 'A5');
  assert.equal(cls(12, 12, 'front', false).key, 'A5');
  assert.equal(cls(12.06, 12).key, 'A5');
});

test('Höhe proportional, gespeichert max. 0,005 cm daneben, Prüfhöhe aufgerundet', () => {
  const h = heightFor(toU(12.5), 1000, 333);
  assert.ok(Math.abs(h.storedCm * 100 - h.exact) <= 0.5);
  assert.ok(h.checkU >= h.exact && h.checkU - h.exact < 1);
  assert.equal(heightFor(1000, 100, 100).checkU, 1000);
  // Breite -> Höhe -> Breite weicht höchstens eine Einheit (0,1 mm) ab und driftet nicht weiter
  for (const [bw, bh] of [[1200, 800], [1000, 333], [37, 1999]]) {
    let w = toU(12.5);
    for (let i = 0; i < 50; i++) w = widthForHeight(Math.round(heightFor(w, bw, bh).exact), bw, bh);
    assert.ok(Math.abs(w - toU(12.5)) <= 1 || bh / bw > 10, `${bw}x${bh}: ${w}`);
  }
});

test('dpi: 1200 Pixel auf 10,16 cm = 300 dpi, auf 20,32 cm = 150 dpi', () => {
  assert.ok(Math.abs(sourceDpi(1200, 1200, toU(10.16), toU(10.16)).min - 300) < 1e-9);
  assert.ok(Math.abs(sourceDpi(1200, 1200, toU(20.32), toU(20.32)).min - 150) < 1e-9);
  assert.equal(qualityFor(150).code, null);
  assert.equal(qualityFor(149.9).code, 'LOW_DPI');
  assert.equal(productionPx(toU(10.16)), 1200);
});

// Zone: 26 cm breit, ab 1,5 cm unter dem Kragen bis 30 cm, Knopfleiste 3 cm breit bis 12 cm
const zone = { xMinU: -1300, xMaxU: 1300, yMinU: 150, yMaxU: 3000 };
const polo = { ...zone, exclude: [{ x0U: -150, x1U: 150, y0U: 0, y1U: 1200, label: 'der Knopfleiste' }] };

test('Zonengrenzen: alle vier Kanten, 1,5 cm zum Kragen', () => {
  const ok = { centerXU: 0, topYU: 150, widthU: 2600, heightU: 2850 };
  assert.ok(checkPlacement(zone, ok).ok);
  assert.equal(checkPlacement(zone, { ...ok, topYU: 149 }).code, 'TOP');
  assert.equal(checkPlacement(zone, { ...ok, heightU: 2851 }).code, 'BOTTOM');
  assert.equal(checkPlacement(zone, { ...ok, centerXU: 1 }).code, 'SIDE');
  assert.equal(checkPlacement(zone, { ...ok, widthU: 2601 }).code, 'SIDE');
  // ungerade Breite: Halbe Einheiten werden exakt geprüft
  assert.ok(checkPlacement(zone, { centerXU: 0, topYU: 150, widthU: 2599, heightU: 100 }).ok);
});

test('Verschieben bleibt in der Zone und weicht der Knopfleiste aus', () => {
  const size = { widthU: 1000, heightU: 1000 };
  const p = constrainMove(zone, size, 5000, -500);
  assert.deepEqual([p.centerXU, p.topYU], [800, 150]);
  const q = constrainMove(polo, size, 0, 200);
  assert.ok(checkPlacement(polo, q).ok);
  assert.ok(q.centerXU >= 650 || q.centerXU <= -650 || q.topYU >= 1200);
  assert.equal(constrainMove(zone, { widthU: 2700, heightU: 100 }, 0, 0), null);
});

test('Größte Breite am Anker und Einpass-Vorschlag', () => {
  assert.equal(maxWidthAt(zone, 100, 100, 0, 150), 2600);
  const s = fitSuggestion(zone, 2000, 1000, 0, 150);
  assert.equal(s.widthU, 2600);
  assert.ok(checkPlacement(zone, s).ok);
  const t = fitSuggestion(zone, 1000, 2000, 0, 150);
  assert.equal(t.heightU, 2850);
});

test('cm <-> Foto-Pixel ohne Drift', () => {
  const cal = { originPx: [360.4, 118.2], pxPerCm: 7.31 };
  for (const [x, y] of [[0, 0], [-1234, 567], [987, 2999]]) {
    const [px, py] = cmToPx(cal, x, y);
    assert.deepEqual(pxToU(cal, px, py), [x, y]);
  }
});

test('Serverprüfung rechnet nach und lehnt Manipulation ab', () => {
  const area = { status: 'approved', zone };
  const base = { side: 'front', widthCm: 10.16, heightCm: 10.16, centerXCm: 0, topYCm: 5, px: { w: 1400, h: 1400, bx: 100, by: 100, bw: 1200, bh: 1200 }, ack: [] };
  const r = verifyPlacement(base, area, { allowBrust: true, surcharges: SUR });
  assert.equal(r.ok, true);
  assert.equal(r.tariff, 'A6');
  assert.equal(r.dpi, 300);
  assert.equal(verifyPlacement({ ...base, heightCm: 5 }, area, { allowBrust: true, surcharges: SUR }).ok, false, 'falsche Höhe');
  assert.equal(verifyPlacement({ ...base, topYCm: 1 }, area, { allowBrust: true, surcharges: SUR }).ok, false, 'zu nah am Kragen');
  assert.equal(verifyPlacement({ ...base, px: { ...base.px, bw: 1500 } }, area, { allowBrust: true, surcharges: SUR }).ok, false, 'Bounds außerhalb');
  assert.equal(verifyPlacement(base, { ...area, status: 'estimated' }, { allowBrust: true, surcharges: SUR }).ok, false, 'nicht freigegeben');
  const big = { ...base, widthCm: 21, heightCm: 21 };
  assert.equal(verifyPlacement(big, area, { allowBrust: true, surcharges: SUR }).ok, false, 'dpi-Hinweis nicht bestätigt');
  const bigAck = verifyPlacement({ ...big, ack: ['LOW_DPI'] }, area, { allowBrust: true, surcharges: SUR });
  assert.equal(bigAck.ok, true);
  assert.equal(bigAck.tariff, 'A4');
});

test('Kinder- und Babygrößen: gleiche Stufen und Preise, Maße schrumpfen mit dem Textil', async () => {
  const { tariffsFor, tariffScaleFor, reachableTariffs } = await import('../src/lib/designer-core/core.mjs');
  assert.equal(tariffScaleFor(53.5, true), 1, 'Erwachsene immer 1');
  assert.equal(tariffScaleFor(60, false), 1, 'nie größer als Erwachsene');
  const s = tariffScaleFor(29.5, false); // Baby Changer 6-12 M
  assert.equal(s, 0.57);
  const a4 = tariffsFor(s).find((t) => t.key === 'A4').maxU;
  assert.deepEqual(a4, [1200, 1700]);
  const k = (w, h) => classifyPrint({ widthU: toU(w), heightU: toU(h), side: 'front', allowBrust: true, surcharges: SUR, scale: s }).key;
  assert.equal(k(12, 17), 'A4');
  assert.equal(k(12.1, 17), 'A3+');
  assert.equal(k(6, 8.5), 'A6');
  assert.equal(SUR[k(12, 17)], SUR.A4, 'Preis wie Erwachsenen-A4');
  assert.ok('error' in classifyPrint({ widthU: 2000, heightU: 2800, side: 'front', allowBrust: true, surcharges: SUR, scale: s }), 'größer als Baby-A3+');
  assert.deepEqual(reachableTariffs({ xMinU: -800, xMaxU: 800, yMinU: 150, yMaxU: 950 }, 'back', true, 1).map((t) => t.key), ['A6', 'A5'], 'kleiner Bereich: nur erreichbare Stufen');
});

// ── Stufe 1 (09.11.2026): Farbfotos auf das Referenzfoto registriert ─────────
test('Farbausgleich: derselbe cm-Punkt liegt im Farbfoto genau dort, wo er im Referenzfoto liegt', async () => {
  const { calForColor } = await import('../src/lib/designer-core/core.mjs');
  const cal = { originPx: [359.5, 135], pxPerCm: 7.4, frame: 'collar' };
  assert.equal(calForColor(cal, null), cal, 'ohne Ausgleich unverändert');
  assert.equal(calForColor(cal, undefined), cal);
  const fix = [0.9226, 31.79, 30.63]; // Farbfoto * s + d = Referenzfoto (Drummer 2.0 Natural Raw)
  const c = calForColor(cal, fix);
  assert.equal(c.frame, 'collar', 'übrige Felder bleiben');
  for (const [x, y] of [[0, 0], [-1250, 400], [900, 2800]]) {
    const [rx, ry] = cmToPx(cal, x, y), [cx, cy] = cmToPx(c, x, y);
    assert.ok(Math.abs(cx * fix[0] + fix[1] - rx) < 1e-9 && Math.abs(cy * fix[0] + fix[2] - ry) < 1e-9, `${x}/${y}`);
    assert.deepEqual(pxToU(c, cx, cy), [x, y], 'Rückweg ohne Drift');
  }
  assert.ok(c.pxPerCm > cal.pxPerCm, 'größer gerahmtes Foto: mehr Pixel je cm');
});

test('Farbausgleich in print-areas.json: plausibel, Fotos vorhanden', async () => {
  const fs = await import('node:fs');
  const pa = JSON.parse(fs.readFileSync(new URL('../src/data/designer/print-areas.json', import.meta.url), 'utf8'));
  let n = 0;
  for (const [h, e] of Object.entries(pa.products)) {
    for (const [view, v] of Object.entries(e.views)) {
      if (v.schematic) { assert.equal(v.colorFix, undefined, `${h} ${view}: schematisch nimmt den Ausgleich von vorne`); continue; }
      for (const [src, f] of Object.entries(v.colorFix || {})) {
        n++;
        assert.equal(f.length, 3, `${h} ${src}`);
        assert.ok(f[0] > 0.75 && f[0] < 1.25, `${h} ${src}: Faktor ${f[0]}`);
        assert.ok(Math.abs(f[1]) < 150 && Math.abs(f[2]) < 150, `${h} ${src}: Versatz`);
        assert.notEqual(src, v.image, 'Referenzfoto braucht keinen Ausgleich');
        assert.ok(fs.existsSync(new URL(`../public${src}`, import.meta.url)), `${src} fehlt`);
      }
    }
  }
  assert.ok(n > 500, `nur ${n} Farbfotos mit Ausgleich`);
  // Beispiel aus der Messung vom 09.11.: Drummer 2.0 hat anders gerahmte Farbfotos
  assert.ok(Object.keys(pa.products['drummer-2-0'].views.front.colorFix).length > 5);
});

// ── Stufe 2: Größe sichtbar machen ──────────────────────────────────────────
const tee = { xMinU: -1830, xMaxU: 1830, yMinU: 150, yMaxU: 4200, exclude: [] }; // T-Shirt M, ca. 52 cm halbe Brustweite
const teePresets = { center: { centerXU: 0, topYU: 700, widthU: 2500 }, chest_left: { centerXU: 1144, topYU: 500, widthU: 1000 } };

test('Vorschläge Klein/Mittel/Groß/Maximal: typische Breiten, passen immer, wachsen mit der Größe', async () => {
  const { sizeSuggestions } = await import('../src/lib/designer-core/core.mjs');
  const s = sizeSuggestions({ zone: tee, presets: teePresets, halfChestCm: 52, side: 'front', bw: 1000, bh: 1000 });
  assert.deepEqual(s.map((x) => x.key), ['klein', 'mittel', 'gross', 'max']);
  const by = Object.fromEntries(s.map((x) => [x.key, x]));
  assert.equal(by.klein.widthU, 1000); assert.equal(by.klein.preset, 'chest_left'); assert.equal(by.klein.centerXU, 1144);
  assert.equal(by.mittel.widthU, 2500); assert.equal(by.gross.widthU, 2800);
  assert.equal(by.max.widthU, maxWidthAt(tee, 1000, 1000, 0, 700));
  for (const x of s) assert.ok(checkPlacement(tee, x).ok, x.key);
  // XXL (halbe Brustweite 62 cm): anteilig größer, auf 0,5 cm gerundet
  const xxl = sizeSuggestions({ zone: { ...tee, xMinU: -2200, xMaxU: 2200 }, presets: teePresets, halfChestCm: 62, side: 'front', bw: 1000, bh: 1000 });
  assert.equal(xxl.find((x) => x.key === 'mittel').widthU, 3000);
  // Hohes Motiv: Breite durch die Höhe begrenzt, Vorschläge fallen zusammen statt doppelt zu erscheinen
  const tall = sizeSuggestions({ zone: tee, presets: teePresets, halfChestCm: 52, side: 'front', bw: 500, bh: 2000 });
  for (const x of tall) assert.ok(checkPlacement(tee, x).ok, `hoch ${x.key}`);
  assert.equal(new Set(tall.map((x) => x.widthU)).size, tall.length, 'keine doppelten Breiten');
  // Rücken: Klein im Nacken (3 cm unter der Kragennaht), ohne Brust links
  const back = sizeSuggestions({ zone: tee, presets: { center: teePresets.center }, halfChestCm: 52, side: 'back', bw: 1000, bh: 1000 });
  assert.equal(back[0].key, 'klein'); assert.equal(back[0].topYU, 300); assert.equal(back[0].preset, null);
  // Tanktop ohne Brust links: Klein mittig, 12 cm
  const tank = sizeSuggestions({ zone: tee, presets: { center: teePresets.center }, halfChestCm: 52, side: 'front', bw: 1000, bh: 1000 });
  assert.equal(tank[0].widthU, 1200); assert.equal(tank[0].preset, 'center');
  assert.deepEqual(sizeSuggestions({ zone: null, presets: {}, halfChestCm: 52, side: 'front', bw: 1, bh: 1 }), []);
});

test('Vorschläge passen für jedes Produkt, jede Größe und jede Seite in den Druckbereich', async () => {
  const fs = await import('node:fs');
  const { sizeSuggestions } = await import('../src/lib/designer-core/core.mjs');
  const pa = JSON.parse(fs.readFileSync(new URL('../src/data/designer/print-areas.json', import.meta.url), 'utf8'));
  let n = 0;
  for (const [h, e] of Object.entries(pa.products)) for (const [size, sz] of Object.entries(e.sizes)) for (const [side, a] of Object.entries(sz.areas)) {
    if (!a.zone) continue;
    for (const [bw, bh] of [[1000, 1000], [3000, 1000], [800, 2400]]) {
      const s = sizeSuggestions({ zone: a.zone, presets: a.presets, halfChestCm: sz.halfChestCm, side, bw, bh });
      assert.ok(s.length >= 1, `${h} ${size} ${side}`);
      for (const x of s) { n++; assert.ok(checkPlacement(a.zone, x).ok, `${h} ${size} ${side} ${x.key}`); assert.ok(x.widthU >= 100); }
    }
  }
  assert.ok(n > 1000);
});

test('Größenvergleich: gleiche cm, Anteil an der Brustbreite sinkt mit der Größe, „passt nicht“ wird erkannt', async () => {
  const { compareSizes } = await import('../src/lib/designer-core/core.mjs');
  const small = { halfChestCm: 46, areas: { front: { zone: { ...tee, xMinU: -1500, xMaxU: 1500 } } } };
  const big = { halfChestCm: 62, areas: { front: { zone: { ...tee, xMinU: -2200, xMaxU: 2200 } } } };
  const pl = { centerXU: 0, topYU: 700, widthU: 2800, heightU: 2800 };
  const [s, b] = compareSizes({ S: small, XXL: big }, 'front', pl);
  assert.equal(s.fits, true); assert.equal(b.fits, true);
  assert.ok(s.share > b.share, 'auf XXL wirkt dasselbe Motiv kleiner');
  assert.ok(Math.abs(b.share - 28 / 62) < 1e-9);
  const [s2] = compareSizes({ S: small }, 'front', { ...pl, widthU: 3100 });
  assert.equal(s2.fits, false, 'breiter als der Druckbereich von S');
  assert.equal(compareSizes({ S: small }, 'front', null)[0].share, null);
});
