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
