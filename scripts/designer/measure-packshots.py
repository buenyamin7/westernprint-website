#!/usr/bin/env python3
"""Vermisst die Produktfotos (freigestellte PNG/WebP, 720 x 900) für den Designer V2.

Liefert je Produkt und Ansicht (vorne/hinten) Bildpunkte, aus denen build-print-areas.mjs
die Abbildung cm <-> Pixel berechnet:
  centerX   Mittellinie des Textils
  topY      oberster Punkt an der Mittellinie (Kragen bzw. Kapuze)
  bodyY     Messzeile der Körperbreite (unterer Rumpf, Ärmel liegen dort nicht mehr an)
  bodyL/R   Körperkanten auf Höhe bodyY (gerade geschnittene Textilien: entspricht der Brustweite)
  hemY      unterste Kante an der Mittellinie
Die Kragennaht (Ursprung) wird NICHT automatisch erkannt: sie steht in packshot-overrides.json
(von Hand am Foto gesetzt, siehe Kontaktbögen). Ausgabe: src/data/designer/packshots.json

Aufruf: python3 scripts/designer/measure-packshots.py [--sheet OUT_DIR]
"""
import json, sys, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PUB = os.path.join(ROOT, 'public')
ALPHA = 128  # Pixel ab dieser Deckkraft zählen zum Textil


def runs(row, w):
    out, start = [], None
    for x in range(w):
        on = row[x] >= ALPHA
        if on and start is None: start = x
        if not on and start is not None: out.append((start, x - 1)); start = None
    if start is not None: out.append((start, w - 1))
    return out


def measure(path, ov=None):
    ov = ov or {}
    im = Image.open(path).convert('RGBA')
    w, h = im.size
    a = im.getchannel('A').load()
    rows = [[a[x, y] for x in range(w)] for y in range(h)]
    ys = [y for y in range(h) if any(v >= ALPHA for v in rows[y])]
    if not ys: return None
    top, bottom = ys[0], ys[-1]
    # Mittellinie: Mitte der Körperkanten im unteren Drittel (Ärmel stören dort meist nicht mehr)
    probe = top + int((bottom - top) * 0.8)
    rr = runs(rows[probe], w)
    body = max(rr, key=lambda r: r[1] - r[0]) if rr else (0, w - 1)
    cx = (body[0] + body[1]) / 2
    ci = int(round(cx))
    col = [y for y in range(h) if rows[y][ci] >= ALPHA]
    topc, hemc = (col[0], col[-1]) if col else (top, bottom)
    # Körperbreite: Lauf durch die Mitte zwischen 55 % und 88 % der Höhe. Zeilen, in denen die Ärmel noch am Körper
    # anliegen, sind deutlich breiter und fallen heraus (nur Breiten nahe dem unteren Fünftel zählen).
    widths = []
    for y in range(top + int((bottom - top) * 0.55), top + int((bottom - top) * 0.88)):
        rr = runs(rows[y], w)
        mid = next((r for r in rr if r[0] <= ci <= r[1]), None)
        if mid: widths.append((mid[1] - mid[0] + 1, y, mid))
    chest = None
    if widths:
        ws = sorted(x[0] for x in widths)
        ref = ws[len(ws) // 5]
        body_rows = [x for x in widths if x[0] <= ref * 1.06]
        body_rows.sort(key=lambda x: x[1])
        mid_row = body_rows[len(body_rows) // 2]
        chest = mid_row
    if ov.get('bodyY'):
        y = ov['bodyY']; rr = runs(rows[y], w)
        mid = next((r for r in rr if r[0] <= ci <= r[1]), None)
        if mid: chest = (mid[1] - mid[0] + 1, y, mid)
    if ov.get('bodyFactor') and chest:
        rr = runs(rows[chest[1]], w); full = (rr[0][0], rr[-1][1]); half = (full[1] - full[0] + 1) * ov['bodyFactor'] / 2
        chest = (int(half * 2), chest[1], (int(round(cx - half)), int(round(cx + half))))
    # Körperbreite knapp unter der Kragennaht (Tanktops: Armausschnitte begrenzen die Breite oben)
    topW = None
    if ov.get('originY') is not None:
        y = min(h - 1, ov['originY'] + 12); rr = runs(rows[y], w)
        mid = next((r for r in rr if r[0] <= ci <= r[1]), None)
        if mid: topW = mid[1] - mid[0] + 1
    return {
        'topBodyW': topW,
        'w': w, 'h': h, 'centerX': round(cx, 1), 'topY': topc, 'hemY': hemc, 'bboxTop': top, 'bboxBottom': bottom,
        'bodyY': chest[1] if chest else None, 'bodyL': chest[2][0] if chest else None, 'bodyR': chest[2][1] if chest else None,
    }


def main():
    products = json.load(open(os.path.join(ROOT, 'src/data/products.json')))
    overrides = json.load(open(os.path.join(ROOT, 'src/data/designer/packshot-overrides.json')))
    out = {}
    for p in products:
        if not p.get('image'): continue
        c0 = next((c for c in p['colors'] if c.get('image') == p['image']), p['colors'][0] if p['colors'] else {})
        views = {'front': p['image'], 'back': c0.get('back')}
        entry = {'style': p['style'], 'handle': p['handle'], 'views': {}}
        for v, src in views.items():
            if not src: continue
            fp = os.path.join(PUB, src.lstrip('/'))
            if not os.path.exists(fp): continue
            m = measure(fp, overrides.get(p['handle'], {}).get(v))
            if m: entry['views'][v] = {'image': src, **m}
        out[p['handle']] = entry
    dest = os.path.join(ROOT, 'src/data/designer/packshots.json')
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    json.dump(out, open(dest, 'w'), indent=1, ensure_ascii=False)
    print(f'{len(out)} Produkte vermessen -> {dest}')


if __name__ == '__main__':
    main()
