#!/usr/bin/env python3
"""Registriert jedes Farbfoto (vorne und hinten) auf das Referenzfoto seines Modells.

Warum: Die Kalibrierung in print-areas.json (pxPerCm, originPx) ist am Referenzfoto je Modell gemessen
(packshots.json, views.*.image). Die Fotos der anderen Farben sind teils anders gerahmt (Textil größer/kleiner,
höher/tiefer im Bild). Ohne Ausgleich zeigt der Designer dort bis ca. 9 % falschen Maßstab und bis 4,5 cm
falsche Kragennaht (Messung 09.11.2026).

Verfahren: Abgleich über die Mittellinie (Kragen bzw. Kapuze oben, Saum unten, Körpermitte), siehe register().
Bewusst anders als register() im Korrekturabzug (westernprint-ops/korrekturabzug_v2.py), der die ganze Silhouette
abgleicht: Das scheitert an Farbfotos, die anders gerendert sind (Ärmel, Schulterbreite).

Ergebnis je Foto: [s, dx, dy, iou] mit  Pixel im Farbfoto * s + (dx, dy) = Pixel im Referenzfoto.
Daraus rechnet der Kern (calForColor): pxPerCm_Farbe = pxPerCm / s, originPx_Farbe = (originPx - (dx, dy)) / s.

Ausgabe: src/data/designer/color-fix.json, wird von build-print-areas.mjs in print-areas.json übernommen.
Aufruf: python3 scripts/designer/register-colors.py [handle ...]
"""
import json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PUB = os.path.join(ROOT, 'public')
STAGE = (720, 900)  # Koordinatensystem der Bühne (DesignerStage.astro)


def load_alpha(src):
    """Alpha-Kanal so, wie die Bühne das Foto zeigt: 720 x 900, abweichende Formate eingepasst und mittig (xMidYMid meet)."""
    im = Image.open(os.path.join(PUB, src.lstrip('/'))).convert('RGBA')
    if im.getchannel('A').getextrema()[0] == 255:
        # JPG ohne Freistellung (weißer Hintergrund): Silhouette = alles, was sichtbar vom Weiß abweicht
        rgb = np.asarray(im.convert('RGB')).astype(int)
        im.putalpha(Image.fromarray(((255 - rgb.min(axis=2)) > 14).astype(np.uint8) * 255))
    if im.size != STAGE:
        f = min(STAGE[0] / im.width, STAGE[1] / im.height)
        im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
        c = Image.new('RGBA', STAGE, (0, 0, 0, 0))
        c.paste(im, ((STAGE[0] - im.width) // 2, (STAGE[1] - im.height) // 2))
        im = c
    return im.getchannel('A')


def body_center(mask):
    """Mitte des Körpers auf 80 % der Höhe (Ärmel liegen dort nicht mehr an), wie measure-packshots.py."""
    ys = np.where(mask.any(axis=1))[0]
    y = ys[0] + int((ys[-1] - ys[0]) * 0.8)
    row = mask[y]
    xs = np.where(row)[0]
    # längster zusammenhängender Lauf
    breaks = np.where(np.diff(xs) > 1)[0]
    starts = np.r_[xs[0], xs[breaks + 1]]
    ends = np.r_[xs[breaks], xs[-1]]
    i = int(np.argmax(ends - starts))
    return (starts[i] + ends[i]) / 2


def neck_center(mask):
    """Mitte am Kragen bzw. an der Kapuze: Mittelpunkt der Silhouette in den obersten 4 % (Median). Robuster als die
    Körpermitte unten, wo ein Ärmel am Körper anliegen und die Mitte verschieben kann (z. B. Changer 2.0 Natural Raw hinten)."""
    ys = np.where(mask.any(axis=1))[0]
    mids = []
    for y in range(ys[0], ys[0] + max(3, int((ys[-1] - ys[0]) * 0.04))):
        xs = np.where(mask[y])[0]
        if len(xs):
            mids.append((xs[0] + xs[-1]) / 2)
    return float(np.median(mids))


def centerline(mask):
    """Mittellinie des Textils: Mitte (x) am Kragen, oberster und unterster Punkt an der Mitte (Kragen bzw. Kapuze, Saum)."""
    cx = neck_center(mask)
    col = np.where(mask[:, int(round(cx))])[0]
    return cx, int(col[0]), int(col[-1])


def silhouette_iou(fa, ia, sc, dx, dy):
    """Übereinstimmung der Silhouetten (untere 75 %) nach dem Ausgleich, nur zur Information im Kontrollbogen."""
    h, w = fa.shape
    ys, xs = np.where(ia)
    yy, xx = np.floor(ys * sc + dy + 0.5).astype(int), np.floor(xs * sc + dx + 0.5).astype(int)
    ok = (yy >= 0) & (yy < h) & (xx >= 0) & (xx < w)
    canvas = np.zeros_like(fa); canvas[yy[ok], xx[ok]] = True
    fy = np.where(fa.any(axis=1))[0]
    rows = np.arange(h)[:, None] >= fy[0] + (fy[-1] - fy[0]) * 0.25
    union = ((canvas | fa) & rows).sum()
    return float(((canvas & fa) & rows).sum() / union) if union else 0.0


def register(ref_a, im_a):
    """Ausgleich über die Mittellinie: Kragen (bzw. Kapuze) oben und Saum unten an der Körpermitte liegen danach exakt
    auf dem Referenzfoto, die Mitte ebenso. Der Maßstab kommt damit aus der Länge, wie die Kalibrierung selbst
    (build-print-areas.mjs: Maßstab aus der Länge, weil die Fotos die Breite räumlich verkürzt zeigen).

    Nicht über die ganze Silhouette wie register() im Korrekturabzug: Manche Farbfotos sind anders gerendert
    (Ärmel anders gelegt, Schultern breiter, z. B. Drummer 2.0 Blue Ice), dort zieht der Silhouetten-Abgleich den
    Maßstab um bis zu 8 % weg und verschiebt die Kragennaht um mehrere cm (am Ärmelbündchen statt am Saum ausgerichtet)."""
    ra, ia = np.asarray(ref_a) >= 128, np.asarray(im_a) >= 128
    rcx, rtop, rhem = centerline(ra)
    icx, itop, ihem = centerline(ia)
    sc = (rhem - rtop) / (ihem - itop)
    dx, dy = rcx - icx * sc, rtop - itop * sc
    return [round(float(sc), 4), round(float(dx), 2), round(float(dy), 2), round(silhouette_iou(ra, ia, sc, dx, dy), 4)]


def main():
    only = set(sys.argv[1:])
    products = {p['handle']: p for p in json.load(open(os.path.join(ROOT, 'src/data/products.json')))}
    shots = json.load(open(os.path.join(ROOT, 'src/data/designer/packshots.json')))
    overrides = json.load(open(os.path.join(ROOT, 'src/data/designer/packshot-overrides.json')))
    dest = os.path.join(ROOT, 'src/data/designer/color-fix.json')
    out = json.load(open(dest)) if os.path.exists(dest) and only else {}
    n = 0
    for h, sh in shots.items():
        if h not in overrides or h not in products or (only and h not in only):
            continue
        p = products[h]
        entry = {}
        for view, key in (('front', 'image'), ('back', 'back')):
            ref = sh['views'].get(view)
            if not ref:
                continue  # Rückseite schematisch: die Bühne zeigt das Frontfoto der Farbe, es gilt der Ausgleich von vorne
            ref_a = load_alpha(ref['image'])
            fixes = {}
            for c in p['colors']:
                src = c.get(key)
                if not src or src == ref['image'] or src in fixes:
                    continue
                if not os.path.exists(os.path.join(PUB, src.lstrip('/'))):
                    continue
                fixes[src] = register(ref_a, load_alpha(src))
                n += 1
            entry[view] = fixes
        out[h] = entry
        print(h, {v: len(f) for v, f in entry.items()}, flush=True)
    json.dump(out, open(dest, 'w'), indent=1, ensure_ascii=False)
    print(f'{n} Farbfotos registriert -> {dest}')


if __name__ == '__main__':
    main()
