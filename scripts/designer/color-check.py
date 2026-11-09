#!/usr/bin/env python3
"""Kontrollbogen je Farbe: Stimmen Maßstab und Kragennaht der Vorschau auf jedem Farbfoto?

Prüft das, was der Shop zeichnet (print-areas.json inkl. colorFix, gleiche Formel wie calForColor im Kern),
gegen eine Messung jedes Farbfotos. Ein Punkt auf dem Referenzfoto wird mit der Kalibrierung in cm und von dort ins
Farbfoto gerechnet und mit dem verglichen, was im Farbfoto tatsächlich dort ist:
  Maßstab:     Länge an der Mittellinie (Kragen bzw. Kapuze bis Saum), wie die Kalibrierung selbst (Maßstab aus der Länge).
  Kragennaht:  oberster Punkt an der Mittellinie.
  Schulter:    Oberkante der Schulter neben dem Kragen (je 20 % der Länge links und rechts der Mitte). Unabhängige
               Gegenprobe: register-colors.py gleicht nur an der Mittellinie ab.
  Breite:      Körperbreite auf Brusthöhe, nur als Hinweis. Weicht sie stark ab, ist das Farbfoto anders gerendert
               (z. B. Schultern breiter), das lässt sich mit einem Maßstab je Foto nicht ausgleichen.
Ziel: unter 2 % Maßstab und unter 1 cm an der Kragennaht (mittlere Größe, wie die Vorschau ohne gewählte Größe).
Schulter und Breite sind Hinweise auf anders gerenderte Fotos, kein Prüfkriterium.
Zum Vergleich steht daneben, was ohne Ausgleich herauskäme (Stand bis 09.11.2026).

Aufruf: python3 scripts/designer/color-check.py ZIELORDNER [handle ...]
Ausgabe: ZIELORDNER/<handle>.jpg (Bogen je Modell), ZIELORDNER/kontrollbogen.md (Tabelle), Rückgabe 1 bei Überschreitung.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PUB = os.path.join(ROOT, 'public')
STAGE = (720, 900)
MAX_SCALE, MAX_CM = 0.02, 1.0

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importlib.util
_spec = importlib.util.spec_from_file_location('regc', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'register-colors.py'))
regc = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(regc)


def load_rgba(src):
    im = Image.open(os.path.join(PUB, src.lstrip('/'))).convert('RGBA')
    a = regc.load_alpha(src)  # gleiche Silhouette und Einpassung wie beim Abgleich
    if im.size != STAGE:
        f = min(STAGE[0] / im.width, STAGE[1] / im.height)
        im2 = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
        im = Image.new('RGBA', STAGE, (0, 0, 0, 0)); im.paste(im2, ((STAGE[0] - im2.width) // 2, (STAGE[1] - im2.height) // 2))
    im.putalpha(a)
    return im


def runs(row):
    xs = np.where(row)[0]
    if not len(xs):
        return []
    br = np.where(np.diff(xs) > 1)[0]
    return list(zip(np.r_[xs[0], xs[br + 1]], np.r_[xs[br], xs[-1]]))


def mask(im):
    return np.asarray(im.getchannel('A')) >= 128


def top_at(A, x):
    x = int(round(x))
    if not 0 <= x < A.shape[1]:
        return None
    col = np.where(A[:, x])[0]
    return float(col[0]) if len(col) else None


def width_at(A, y, cx):
    y = int(round(y))
    if not 0 <= y < A.shape[0]:
        return None
    mid = next((r for r in runs(A[y]) if r[0] <= cx <= r[1]), None)
    return float(mid[1] - mid[0] + 1) if mid else None


def evaluate(Ar, Ac, k0, o0, k, o):
    """Abweichungen im Farbfoto für die Kalibrierung (k, o). Referenzpunkte (k0, o0) -> cm -> Farbfoto."""
    f = k / k0
    to_c = lambda x, y: (o[0] + (x - o0[0]) * f, o[1] + (y - o0[1]) * f)
    rcx, rtop, rhem = regc.centerline(Ar)
    ccx, ctop, chem = regc.centerline(Ac)
    L = rhem - rtop
    scale = (chem - ctop) / ((rhem - rtop) * f) - 1
    collar = (ctop - to_c(rcx, rtop)[1]) / k
    sh = []
    for d in (-0.2 * L, 0.2 * L):
        yr = top_at(Ar, rcx + d)
        if yr is None:
            continue
        xc, yc = to_c(rcx + d, yr)
        ym = top_at(Ac, xc)
        if ym is not None:
            sh.append((ym - yc) / k)
    shoulder = float(np.mean(sh)) if sh else 0.0
    yr = rtop + 0.3 * L
    wr, wc = width_at(Ar, yr, rcx), width_at(Ac, to_c(rcx, yr)[1], ccx)
    width = wc / (wr * f) - 1 if wr and wc else 0.0
    return scale, collar, shoulder, width


def cal_for(area, fix):
    if not fix:
        return area['pxPerCm'], area['originPx']
    s, dx, dy = fix
    return area['pxPerCm'] / s, [(area['originPx'][0] - dx) / s, (area['originPx'][1] - dy) / s]


def font(n):
    try:
        return ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', n)
    except Exception:
        return ImageFont.load_default()


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    only = set(sys.argv[2:])
    os.makedirs(out, exist_ok=True)
    pa = json.load(open(os.path.join(ROOT, 'src/data/designer/print-areas.json')))['products']
    products = {p['handle']: p for p in json.load(open(os.path.join(ROOT, 'src/data/products.json')))}
    F, Fs = font(15), font(13)
    rows, bad, n = [], [], 0
    worst = {'before': [0, 0, 0], 'after': [0, 0, 0]}
    shape_n = 0
    for h, e in pa.items():
        if only and h not in only:
            continue
        p = products[h]
        sizes = list(e['sizes'].keys())
        mid = p['sizes'][len(p['sizes']) // 2]
        if mid not in e['sizes']:
            mid = sizes[len(sizes) // 2]
        tiles = []
        for view, key in (('front', 'image'), ('back', 'back')):
            vw = e['views'].get(view)
            area = e['sizes'][mid]['areas'].get(view)
            if not vw or not area or not area.get('zone') or vw.get('schematic'):
                continue  # schematische Rückseite zeigt das Frontfoto der Farbe, gleicher Ausgleich wie vorne (dort geprüft)
            fixes = vw.get('colorFix', {})
            Ar = mask(load_rgba(vw['image']))
            k0, o0 = area['pxPerCm'], area['originPx']
            seen = set()
            for c in p['colors']:
                src = c.get(key) or (p['image'] if view == 'front' else None)
                if not src or src in seen or not os.path.exists(os.path.join(PUB, src.lstrip('/'))):
                    continue
                seen.add(src)
                im = load_rgba(src); Ac = mask(im)
                k1, o1 = cal_for(area, fixes.get(src))
                before = evaluate(Ar, Ac, k0, o0, k0, o0)
                after = evaluate(Ar, Ac, k0, o0, k1, o1)
                ok = abs(after[0]) < MAX_SCALE and abs(after[1]) < MAX_CM
                # Schulter und Breite: nur Hinweis. Weichen sie ab, ist das Foto anders gerendert (Form), nicht falsch kalibriert.
                shape = abs(after[3]) > 0.05 or abs(after[2]) >= MAX_CM
                shape_n += shape
                n += 1
                for kk, v in (('before', before), ('after', after)):
                    for i in range(3):
                        worst[kk][i] = max(worst[kk][i], abs(v[i]))
                rows.append((p['title'], 'vorne' if view == 'front' else 'hinten', c['name'], before, after, ok, shape))
                if not ok:
                    bad.append(f"{p['title']} {'vorne' if view == 'front' else 'hinten'} {c['name']}: Maßstab {after[0] * 100:+.1f} %, Kragen {after[1]:+.1f} cm")
                # Kachel: grün = Vorschau jetzt (mit Ausgleich), rot = ohne Ausgleich; Strich = Kragennaht (Nullpunkt)
                bg = Image.new('RGBA', STAGE, (205, 205, 205, 255)); bg.alpha_composite(im)
                d = ImageDraw.Draw(bg)
                z = area['zone']
                for (k, o, col, w) in ((k0, o0, (230, 40, 40, 255), 2), (k1, o1, (0, 170, 90, 255), 4)):
                    X = lambda u: o[0] + u / 100 * k; Y = lambda u: o[1] + u / 100 * k
                    d.rectangle([X(z['xMinU']), Y(z['yMinU']), X(z['xMaxU']), Y(z['yMaxU'])], outline=col, width=w)
                    d.line([o[0] - 24, o[1], o[0] + 24, o[1]], fill=col, width=w)
                t = bg.convert('RGB').resize((240, 300)); td = ImageDraw.Draw(t)
                td.rectangle([0, 0, 240, 52], fill=(255, 255, 255))
                td.text((5, 2), f"{c['name']} {'vorne' if view == 'front' else 'hinten'}", fill=(0, 0, 0), font=F)
                td.text((5, 20), f"jetzt: {after[0] * 100:+.1f} %  {after[1]:+.1f} / {after[2]:+.1f} cm", fill=(0, 130, 60) if ok else (200, 0, 0), font=Fs)
                td.text((5, 36), f"vorher: {before[0] * 100:+.1f} %  {before[1]:+.1f} / {before[2]:+.1f} cm", fill=(150, 150, 150), font=Fs)
                if shape:
                    td.text((5, 280), f"anders gerendert: Breite {after[3] * 100:+.0f} %", fill=(160, 90, 0), font=Fs)
                tiles.append(t)
        if tiles:
            cols = 6
            sheet = Image.new('RGB', (240 * cols, 300 * ((len(tiles) + cols - 1) // cols) + 34), (255, 255, 255))
            ImageDraw.Draw(sheet).text((8, 8), f"{p['title']}, Größe {mid}. Grün = Vorschau mit Farbausgleich, Rot = ohne. Werte: Maßstab, Kragen / Schulter.", fill=(0, 0, 0), font=F)
            for j, t in enumerate(tiles):
                sheet.paste(t, ((j % cols) * 240, 34 + (j // cols) * 300))
            sheet.save(os.path.join(out, f'{h}.jpg'), quality=82)
        print(h, len(tiles), flush=True)
    de = lambda t: t.replace('.', ',')
    pc = lambda v: de(f'{v * 100:+.1f} %')
    cm = lambda v: de(f'{v:+.1f} cm')
    wb, wa = worst['before'], worst['after']
    md = ['# Kontrollbogen Farbfotos Designer V2', '',
          f'{n} Farbfotos geprüft, je Modell bei der mittleren Größe. Ziel: Maßstab unter 2 %, Kragennaht unter 1 cm.', '',
          '- Ohne Farbausgleich (bis 09.11.2026): ' + de(f'bis {wb[0] * 100:.1f} % Maßstab, bis {wb[1]:.1f} cm Kragennaht, {sum(1 for r in rows if abs(r[3][0]) >= MAX_SCALE or abs(r[3][1]) >= MAX_CM)} Fotos über dem Ziel'),
          de(f'- Mit Farbausgleich: bis {wa[0] * 100:.1f} % Maßstab, bis {wa[1]:.1f} cm Kragennaht'),
          f'- Über dem Ziel: {len(bad)}',
          f'- Anders gerendert (Schulter 1 cm oder mehr bzw. Breite auf Brusthöhe mehr als 5 % anders als auf dem Referenzfoto, nur Hinweis): {shape_n}. '
          'Das ist die Form im Foto (Schultern, Kapuze, Ärmel), kein Rechenfehler: Kragennaht und Länge sitzen auch dort.', '']
    md += [f'  - {b}' for b in bad]
    md += ['', '| Produkt | Seite | Farbe | vorher Maßstab | vorher Kragen | jetzt Maßstab | jetzt Kragen | ok | Hinweis: Schulter / Breite |', '|---|---|---|---|---|---|---|---|---|']
    md += [f'| {r[0]} | {r[1]} | {r[2]} | {pc(r[3][0])} | {cm(r[3][1])} | {pc(r[4][0])} | {cm(r[4][1])} | {"ja" if r[5] else "NEIN"} | {cm(r[4][2])} / {pc(r[4][3])}{" (anders gerendert)" if r[6] else ""} |' for r in rows]
    open(os.path.join(out, 'kontrollbogen.md'), 'w').write('\n'.join(md) + '\n')
    print('\n'.join(md[:9 + len(bad)]))
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
