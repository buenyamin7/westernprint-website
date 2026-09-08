"""Freistellen der flachen Produktbilder (weißer Hintergrund) mit rembg → WebP mit Alpha.
Schreibt <name>.webp neben das JPG und aktualisiert die Pfade in src/data/products.json.
Nur Bilder mit rein weißem Rand werden verarbeitet; Model-Fotos bleiben unangetastet."""
import json, os, sys, time
import numpy as np
from PIL import Image
from rembg import remove, new_session

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'src/data/products.json')
d = json.load(open(DATA))
ps = d if isinstance(d, list) else list(d.values())

def is_white(path):
    a = np.asarray(Image.open(path).convert('L'))
    return np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]).min() >= 240

targets = []
for p in ps:
    slots = [(p, 'image')]
    for c in p.get('colors', []):
        slots += [(c, 'image'), (c, 'back')]
    for obj, key in slots:
        v = obj.get(key)
        if v and v.endswith('.jpg') and 'model' not in v:
            targets.append((obj, key, v))
uniq = sorted({v for _, _, v in targets})
print('images', len(uniq), flush=True)
sess = new_session('isnet-general-use')
done = {}
t0 = time.time()
for i, v in enumerate(uniq):
    src = os.path.join(ROOT, 'public', v.lstrip('/'))
    dst = src[:-4] + '.webp'
    if os.path.exists(dst):
        done[v] = v[:-4] + '.webp'; continue
    if not os.path.exists(src) or not is_white(src):
        continue
    im = Image.open(src).convert('RGB')
    out = remove(im, session=sess, post_process_mask=True)
    # Trim bounding box with margin so all products sit equally large
    bbox = out.getbbox()
    if bbox:
        w, h = out.size
        pad = int(min(w, h) * 0.04)
        box = (max(0, bbox[0]-pad), max(0, bbox[1]-pad), min(w, bbox[2]+pad), min(h, bbox[3]+pad))
        crop = out.crop(box)
        # back into 4:5 canvas, centered
        cw, ch = crop.size
        target = max(cw / 4, ch / 5)
        W, H = int(target * 4), int(target * 5)
        canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        canvas.paste(crop, ((W - cw) // 2, (H - ch) // 2), crop)
        out = canvas.resize((720, 900), Image.LANCZOS)
    out.save(dst, 'WEBP', quality=86, method=4)
    done[v] = v[:-4] + '.webp'
    if i % 25 == 0:
        print(f'{i}/{len(uniq)} {round(time.time()-t0)}s', flush=True)

for obj, key, v in targets:
    if v in done:
        obj[key] = done[v]
json.dump(d, open(DATA, 'w'), ensure_ascii=False, indent=None)
print('done', len(done), 'of', len(uniq), 'in', round(time.time()-t0), 's', flush=True)
