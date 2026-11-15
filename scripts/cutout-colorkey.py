"""Freisteller per Farbschlüssel: Packshots auf rein weißem Hintergrund → WebP mit Alpha (720x900).
Für Motive mit dünnen Teilen (z. B. die Henkel der Stoffbeutel), die rembg in cutout-products.py wegschneidet.
Alles, was sich vom Hintergrundweiß abhebt, bleibt stehen. Randpixel werden gegen Weiß zurückgerechnet (kein heller Saum).
Rahmen und Ausgabeformat wie cutout-products.py. Vorhandene WebPs werden überschrieben.
Achtung: cutout-products.py --force erzeugt diese Dateien wieder mit rembg, danach dieses Skript erneut laufen lassen.
Aufruf: python3 scripts/cutout-colorkey.py [--out <Ordner>] <bild.jpg> [...]"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

def is_white(im):
    a = np.asarray(im.convert('L'))
    return np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]).min() >= 240

def keyed(im_rgb):
    src = np.asarray(im_rgb).astype(np.float32)
    d = 255.0 - src.min(axis=2)                # Abstand zum Hintergrundweiß
    obj = d[d >= 6]
    if obj.size == 0:
        return None
    fabric = float(np.median(obj))             # typischer Abstand des Stoffs: bei Weiß ca. 17, bei Farben 100 und mehr
    t = max(6.0, 0.3 * fabric)
    m = d >= t
    # einzelne Störpixel außerhalb entfernen
    lab, n = ndimage.label(m)
    if n > 1:
        sizes = ndimage.sum(m, lab, range(1, n + 1))
        m = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= 12])
    # kleine Löcher im Stoff schließen, die Henkelöffnung bleibt offen
    holes, n = ndimage.label(~m)
    if n > 1:
        sizes = ndimage.sum(~m, holes, range(1, n + 1))
        outside = set(np.unique(np.concatenate([holes[0], holes[-1], holes[:, 0], holes[:, -1]])).tolist())
        m |= np.isin(holes, [i + 1 for i, s in enumerate(sizes) if (i + 1) not in outside and s < 400])
    inner = ndimage.binary_erosion(m)
    zone = ndimage.binary_dilation(m) & ~inner
    local = ndimage.maximum_filter(d, size=5)  # unvermischte Stofffarbe direkt neben der Kante
    al = np.zeros(d.shape, np.float32)
    al[inner] = 1.0
    al[zone] = np.clip(d[zone] / np.maximum(local[zone], t), 0, 1)
    # Un-Premultiply gegen Weiß am Rand: c_true = (c - (1-a)*255) / a
    edge = (al > 0.02) & (al < 0.98)
    a = np.clip(al[edge], 0.05, 1.0)[:, None]
    rgb = src.copy()
    rgb[edge] = np.clip((src[edge] - (1 - a) * 255.0) / a, 0, 255)
    return Image.fromarray(np.dstack([rgb, al * 255]).astype(np.uint8), 'RGBA')

def frame(out):  # wie cutout-products.py
    a = np.asarray(out)[:, :, 3]
    ys, xs = np.where(a > 12)
    if len(ys) == 0:
        return out.resize((720, 900), Image.LANCZOS)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    crop = out.crop((x0, y0, x1 + 1, y1 + 1))
    cw, ch = crop.size
    pad = int(max(cw, ch) * 0.04)
    W, H = cw + 2 * pad, ch + 2 * pad
    if W / H < 0.8: W = int(H * 0.8)
    else: H = int(W / 0.8)
    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    canvas.paste(crop, ((W - cw) // 2, (H - ch) // 2), crop)
    return canvas.resize((720, 900), Image.LANCZOS)

args = sys.argv[1:]
out_dir = None
if args[:1] == ['--out']:
    out_dir, args = args[1], args[2:]
if not args:
    sys.exit(__doc__)
for src in args:
    im = Image.open(src).convert('RGB')
    if not is_white(im):
        print('übersprungen (Rand nicht weiß):', src); continue
    cut = keyed(im)
    if cut is None:
        print('übersprungen (kein Motiv gefunden):', src); continue
    dst = os.path.join(out_dir or os.path.dirname(src), os.path.basename(src)[:-4] + '.webp')
    frame(cut).save(dst, 'WEBP', quality=88, method=4)
    print('ok', dst)
