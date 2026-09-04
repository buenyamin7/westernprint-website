#!/usr/bin/env python3
"""Baut src/data/products.json aus dem POD-App-Export (src/data/pod-catalog.json).
Lädt Packshots (Stanley/Stella Cloudinary SFM0/SFM1, Stedman CDN) nach public/img/products/ und verkleinert sie."""
import json, os, re, subprocess, urllib.request, concurrent.futures, math
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POD = json.load(open(f"{ROOT}/src/data/pod-catalog.json"))
OLD = json.load(open(f"{ROOT}/src/data/products.shopify-backup.json"))
IMG_DIR = f"{ROOT}/public/img/products"; os.makedirs(IMG_DIR, exist_ok=True)
STYLE_OF_HANDLE = {'crafter':'STTU170','stella-muser':'STTW172','stanley-coaster':'STPM224','drummer-2-0':'STSU168','brooker':'STJU248','stanley-stancer':'STTM961','mover-2-0':'STBU185','stanley-quester':'STJM240','stella-guider':'STJW241','breezer':'STTU964','chaser':'STSU077','radder-2-0':'STSU208','puffer':'STJU247'}
old_by_style = {STYLE_OF_HANDLE[p['handle']]: p for p in OLD if p['handle'] in STYLE_OF_HANDLE}
SIZE_ORDER = ["3XS","2XS","XXS","XS","S","M","L","XL","XXL","2XL","3XL","4XL","5XL","6XL","OS"]
def size_rank(s):
    s2 = s.strip()
    if s2 in SIZE_ORDER: return (0, SIZE_ORDER.index(s2))
    m = re.match(r'(\d+)', s2)
    return (1, int(m.group(1)) if m else 999)
def slug(s): return re.sub(r'-+','-',re.sub(r'[^a-z0-9]+','-',s.lower().replace('ä','ae').replace('ö','oe').replace('ü','ue').replace('ß','ss'))).strip('-')
def cat_of(b):
    g = (b['gender'] or '').lower(); c = b['category']
    if g == 'baby' or c == 'Body': return 'Baby'
    if g in ('kids','kinder'): return 'Kinder'
    return {'T-Shirt':'T-Shirts','Hoodie':'Hoodies','Sweatshirt':'Sweatshirts','Polo':'Polos','Tank Top':'Tank Tops','Hose':'Hosen','Jacke':'Jacken','Bag':'Taschen','Accessoire':'Accessoires','Sonstiges':'Jacken'}.get(c, c)
def gender_label(g):
    return {'unisex':'Unisex','male':'Herren','herren':'Herren','female':'Damen','damen':'Damen','baby':'Baby','kids':'Kinder','kinder':'Kinder'}.get((g or '').lower(), g or 'Unisex')
def shop_price(b):
    old = old_by_style.get(b['style'])
    if old: return old['minPrice']
    net = b['ekMin'] * 1.25 + 3.0
    return math.ceil(net * 1.19 * 2) / 2
def fetch(url, path):
    if os.path.exists(path): return True
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        data = urllib.request.urlopen(req, timeout=30).read()
        if len(data) < 2000: return False
        tmp = path + '.tmp.jpg'; open(tmp, 'wb').write(data)
        subprocess.run(['sips', '-s', 'format', 'jpeg', '-Z', '900', '-s', 'formatOptions', '78', tmp, '--out', path], capture_output=True)
        os.remove(tmp); return os.path.exists(path)
    except Exception: return False
jobs = []; products = []; seen = set()
for b in POD:
    old = old_by_style.get(b['style'])
    name = b['name'].strip()
    handle = old['handle'] if old else slug(name)
    if handle in seen: handle = f"{slug(name)}-{slug(gender_label(b['gender']))}"
    if handle in seen: handle = f"{slug(name)}-{b['style'].lower()}"
    seen.add(handle)
    sizes = sorted(dict.fromkeys(s.strip() for s in b['sizes']), key=size_rank)
    price = shop_price(b)
    colors = []
    for c in b['colors']:
        cid, cname = c['id'], c['name']; cs = slug(cname) or cid.lower()
        front = f"{handle}-{cs}.jpg"; back = f"{handle}-{cs}-back.jpg"
        if b['supplier'] == 'STANLEY_STELLA':
            jobs.append((f"https://res.cloudinary.com/www-stanleystella-com/t_pim/TechnicalNames/SFM0_{b['style']}_{cid}.jpg", f"{IMG_DIR}/{front}"))
            jobs.append((f"https://res.cloudinary.com/www-stanleystella-com/t_pim/TechnicalNames/SFM1_{b['style']}_{cid}.jpg", f"{IMG_DIR}/{back}"))
        elif c.get('image'):
            jobs.append((c['image'], f"{IMG_DIR}/{front}"))
        colors.append({'id': cid, 'name': cname, 'hex': (c.get('hex') or '').strip() or None, 'image': f"/img/products/{front}", 'back': f"/img/products/{back}" if b['supplier']=='STANLEY_STELLA' else None})
    model = f"{handle}-model.jpg"
    if b['modelImage']: jobs.append((b['modelImage'], f"{IMG_DIR}/{model}"))
    desc_lines = [l.strip(' -•') for l in (b['description'] or '').splitlines() if l.strip()]
    products.append({
        'id': b['style'], 'handle': handle, 'title': name, 'brand': 'Stanley/Stella' if b['supplier']=='STANLEY_STELLA' else 'Stedman',
        'style': b['style'], 'category': cat_of(b), 'gender': gender_label(b['gender']), 'productType': b['category'],
        'description': desc_lines, 'grammage': b.get('grammage'), 'fit': b.get('fit'), 'composition': b.get('composition'),
        'modelImage': f"/img/products/{model}" if b['modelImage'] else None,
        'extraImages': [i['url'] for i in old['images']] if old else [],
        'colors': colors, 'sizes': sizes, 'price': price, 'minPrice': price,
        'variants': [{'id': f"{b['style']}-{c['id']}-{s}", 'color': c['id'], 'size': s, 'price': price, 'available': True} for c in b['colors'] for s in sizes],
    })
print(len(products), 'Produkte,', sum(len(p['variants']) for p in products), 'Varianten,', len(jobs), 'Bilder zu laden', flush=True)
with concurrent.futures.ThreadPoolExecutor(12) as ex:
    results = list(ex.map(lambda j: fetch(*j), jobs))
ok = sum(1 for r in results if r); print('Bilder geladen:', ok, 'fehlgeschlagen:', len(results) - ok, flush=True)
for p in products:
    for c in p['colors']:
        if not os.path.exists(f"{ROOT}/public{c['image']}"): c['image'] = None
        if c.get('back') and not os.path.exists(f"{ROOT}/public{c['back']}"): c['back'] = None
    if p['modelImage'] and not os.path.exists(f"{ROOT}/public{p['modelImage']}"): p['modelImage'] = None
    with_img = [c for c in p['colors'] if c['image']]
    if with_img: p['colors'] = with_img
    valid = {c['id'] for c in p['colors']}
    p['variants'] = [v for v in p['variants'] if v['color'] in valid]
    p['image'] = next((c['image'] for c in p['colors'] if c['image']), None) or p['modelImage'] or (p['extraImages'][0] if p['extraImages'] else None)
json.dump(products, open(f"{ROOT}/src/data/products.json", 'w'), ensure_ascii=False, indent=1)
print('products.json geschrieben')
for p in products: print(f"  {p['brand'][:7]:7} {p['handle']:32} {p['category']:12} {p['gender']:7} {len(p['colors']):2} Farben {len(p['sizes']):2} Größen {p['price']:6.2f} € img={'ja' if p['image'] else 'NEIN'} back={sum(1 for c in p['colors'] if c.get('back'))}")
