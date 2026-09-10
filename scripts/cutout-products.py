"""Freistellen der flachen Produktbilder (weißer Hintergrund) mit rembg → WebP mit Alpha.
Schreibt <name>.webp neben das JPG und aktualisiert die Pfade in src/data/products.json.
Nur Bilder mit rein weißem Rand werden verarbeitet; Model-Fotos bleiben unangetastet.

v2 (2026-09-11): Kantenreinigung gegen weißen Saum, farbsicher (funktioniert auch bei weißen Shirts):
  1. Randband (bis ~6 px nach innen): Pixel, die dem Hintergrundweiß entsprechen (alle Kanäle >= 238), fliegen raus.
  2. Alpha 1 px erodieren + weiche Kante.
  3. Un-Premultiply gegen Weiß: Randpixel, die mit Weiß vermischt sind, werden auf ihre echte Farbe zurückgerechnet.
Aufruf: python3 scripts/cutout-products.py [--force]  (--force überschreibt vorhandene WebPs)"""
import json, os, sys, time
import numpy as np
from PIL import Image, ImageFilter
from rembg import remove, new_session

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'src/data/products.json')
FORCE = '--force' in sys.argv
d = json.load(open(DATA))
ps = d if isinstance(d, list) else list(d.values())

def is_white(path):
    a = np.asarray(Image.open(path).convert('L'))
    return np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]).min() >= 240

def clean_cutout(im_rgb, sess):
    src = np.asarray(im_rgb).astype(np.float32)
    out = remove(im_rgb.convert('RGBA'), session=sess, post_process_mask=True)
    al = np.asarray(out)[:, :, 3].astype(np.float32) / 255.0
    white = (src.min(axis=2) >= 238)
    core = np.asarray(Image.fromarray((al * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(13))).astype(np.float32) / 255.0
    # Kleidungsfarbe: Median der Kernpixel. Bei weißer/sehr heller Kleidung keine Weiß-Regel (sonst frisst sie den Rand an).
    core_px = src[core > 0.9]
    garment_light = len(core_px) > 0 and np.median(core_px.min(axis=1)) >= 150
    # 1) Randband: Hintergrundweiß raus (nur am Rand, nur bei nicht-weißer Kleidung)
    if not garment_light:
        band = (al > 0) & (core < 0.5)
        al[band & white] = 0
    # 2) 1 px erodieren, weiche Kante
    A = Image.fromarray((al * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
    al2 = np.asarray(A).astype(np.float32) / 255.0
    # 3) Un-Premultiply gegen Weiß am Rand: c_true = (c - (1-a)*255) / a
    edge = (al2 > 0.02) & (al2 < 0.98)
    a = np.clip(al2[edge], 0.05, 1.0)[:, None]
    rgb = src.copy()
    rgb[edge] = np.clip((src[edge] - (1 - a) * 255.0) / a, 0, 255)
    return Image.fromarray(np.dstack([rgb, al2 * 255]).astype(np.uint8), 'RGBA')

def frame(out):
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

targets = []
for p in ps:
    slots = [(p, 'image')]
    for c in p.get('colors', []):
        slots += [(c, 'image'), (c, 'back')]
    for obj, key in slots:
        v = obj.get(key)
        if v and (v.endswith('.jpg') or v.endswith('.webp')) and 'model' not in v:
            targets.append((obj, key, v))
uniq = sorted({v[:-5] + '.jpg' if v.endswith('.webp') else v for _, _, v in targets})
print('images', len(uniq), 'force', FORCE, flush=True)
sess = new_session('isnet-general-use')
done = {}
t0 = time.time()
for i, v in enumerate(uniq):
    src = os.path.join(ROOT, 'public', v.lstrip('/'))
    dst = src[:-4] + '.webp'
    if os.path.exists(dst) and not FORCE:
        done[v] = v[:-4] + '.webp'; continue
    if not os.path.exists(src) or not is_white(src):
        continue
    im = Image.open(src).convert('RGB')
    out = frame(clean_cutout(im, sess))
    out.save(dst, 'WEBP', quality=88, method=4)
    done[v] = v[:-4] + '.webp'
    if i % 25 == 0:
        print(f'{i}/{len(uniq)} {round(time.time()-t0)}s', flush=True)

for obj, key, v in targets:
    j = v[:-5] + '.jpg' if v.endswith('.webp') else v
    if j in done:
        obj[key] = done[j]
json.dump(d, open(DATA, 'w'), ensure_ascii=False, indent=None)
print('done', len(done), 'of', len(uniq), 'in', round(time.time()-t0), 's', flush=True)
