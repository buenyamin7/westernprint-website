#!/usr/bin/env python3
"""Baut src/data/products.json aus dem POD-App-Export (src/data/pod-catalog.json).
Lädt Packshots (Stanley/Stella Cloudinary SFM0/SFM1, Stedman CDN) nach public/img/products/ und verkleinert sie."""
import json, os, re, subprocess, urllib.request, concurrent.futures, math
from decimal import Decimal, ROUND_HALF_UP
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
# Sonderpreise Changer-Familie (03.10.2026, der Kundin schriftlich zugesagt): pricing "pod".
# variant.price = Bruttopreis inkl. EINER Druckseite in beliebiger Druckgröße. Zweite Seite +5,95 €, Ärmel je +3,57 €
# (rechnen Shop-Seite src/pages/shop/[handle].astro und Kassen-Worker westernprint-checkout/src/catalog.js).
# 'ek': True = (EK der Variante + 7) x 1,19 kaufmännisch auf Cent, mindestens 'min' (Changer 2.0 "ab 23,63 €").
POD_PRICING = {'STSB920': {'min': 16.45}, 'STSK181': {'min': 19.71}, 'STSU178': {'min': 23.63, 'ek': True}}
def norm_size(s): return re.sub(r'\s+', '', s.lower())
def size_keys(db_size):
    """S/S-Größe aus der DB ('6-12 m/68-80cm', '3-4/98-104cm', 'XL') -> mögliche Shop-Schreibweisen ('6-12m', '3-4y', '98/104', 'xl')."""
    head, _, cm = db_size.partition('/')
    keys = {norm_size(db_size), norm_size(head), norm_size(head) + 'y'}
    if cm: keys.add(norm_size(cm).replace('cm', '').replace('-', '/'))
    return keys
def variant_ek(b):
    """{(Farbe, Shop-Größe): EK} aus den S/S-Varianten des POD-Exports."""
    out = {}
    for v in b.get('variants') or []:
        if v.get('ek') is None: continue
        for s in b['sizes']:
            if norm_size(s.strip()) in size_keys(v['size']): out[(v['color'], s.strip())] = v['ek']
    return out
def round_cent(x): return float(Decimal(str(x)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))
def pod_variant_price(rule, ek, color, size):
    if not rule.get('ek'): return rule['min']
    e = ek.get((color, size))
    if e is None:  # Kombination fehlt bei S/S: höchster EK dieser Größe, sonst dieser Farbe
        e = max([x for (c, s), x in ek.items() if s == size] or [x for (c, s), x in ek.items() if c == color] or [0])
    return max(rule['min'], round_cent((Decimal(str(e)) + 7) * Decimal('1.19')))
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
    rule = POD_PRICING.get(b['style']); ek = variant_ek(b); ek_colors = {c for c, _ in ek}
    colors = []
    for c in b['colors']:
        cid, cname = c['id'], c['name']; cs = slug(cname) or cid.lower()
        front = f"{handle}-{cs}.jpg"; back = f"{handle}-{cs}-back.jpg"
        if b['supplier'] == 'STANLEY_STELLA':
            # PFM0/PBM0 = Flat-Lay-Packshots (Vorder-/Rückseite) für Mockup und Farbfelder, SFM0/SFM1 = Studiofotos am Model
            flat = f"{handle}-{cs}-flat.jpg"; flatb = f"{handle}-{cs}-flat-back.jpg"
            base = "https://res.cloudinary.com/www-stanleystella-com/t_pim/TechnicalNames"
            jobs += [(f"{base}/PFM0_{b['style']}_{cid}.jpg", f"{IMG_DIR}/{flat}"), (f"{base}/PBM0_{b['style']}_{cid}.jpg", f"{IMG_DIR}/{flatb}"),
                     (f"{base}/SFM0_{b['style']}_{cid}.jpg", f"{IMG_DIR}/{front}"), (f"{base}/SFM1_{b['style']}_{cid}.jpg", f"{IMG_DIR}/{back}")]
            colors.append({'id': cid, 'name': cname, 'hex': (c.get('hex') or '').strip() or None, 'image': f"/img/products/{flat}", 'back': f"/img/products/{flatb}", 'model': f"/img/products/{front}", 'modelBack': f"/img/products/{back}", 'fallback': f"/img/products/{front}", 'fallbackBack': f"/img/products/{back}"})
            continue
        elif c.get('image'):
            jobs.append((c['image'], f"{IMG_DIR}/{front}"))
        colors.append({'id': cid, 'name': cname, 'hex': (c.get('hex') or '').strip() or None, 'image': f"/img/products/{front}", 'back': None})
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
        'variants': [{'id': f"{b['style']}-{c['id']}-{s}", 'color': c['id'], 'size': s, 'price': pod_variant_price(rule, ek, c['id'], s) if rule else price,
                      # S/S: Farbe/Größe, die es bei Stanley/Stella nicht gibt (z. B. 4XL in Modefarben), ist nicht bestellbar
                      'available': not (b['supplier'] == 'STANLEY_STELLA' and c['id'] in ek_colors and (c['id'], s) not in ek)} for c in b['colors'] for s in sizes],
    })
    if rule:
        products[-1]['pricing'] = 'pod'
        products[-1]['price'] = products[-1]['minPrice'] = min(v['price'] for v in products[-1]['variants'])
print(len(products), 'Produkte,', sum(len(p['variants']) for p in products), 'Varianten,', len(jobs), 'Bilder zu laden', flush=True)
with concurrent.futures.ThreadPoolExecutor(12) as ex:
    results = list(ex.map(lambda j: fetch(*j), jobs))
ok = sum(1 for r in results if r); print('Bilder geladen:', ok, 'fehlgeschlagen:', len(results) - ok, flush=True)
for p in products:
    for c in p['colors']:
        ex = lambda u: bool(u) and os.path.exists(f"{ROOT}/public{u}")
        if not ex(c['image']): c['image'] = c.get('fallback') if ex(c.get('fallback')) else None
        if not ex(c.get('back')): c['back'] = c.get('fallbackBack') if ex(c.get('fallbackBack')) else None
        if not ex(c.get('model')): c.pop('model', None)
        if not ex(c.get('modelBack')): c.pop('modelBack', None)
        c.pop('fallback', None); c.pop('fallbackBack', None)
    if p['modelImage'] and not os.path.exists(f"{ROOT}/public{p['modelImage']}"): p['modelImage'] = None
    with_img = [c for c in p['colors'] if c['image']]
    if with_img: p['colors'] = with_img
    valid = {c['id'] for c in p['colors']}
    p['variants'] = [v for v in p['variants'] if v['color'] in valid]
    p['image'] = next((c['image'] for c in p['colors'] if c['image']), None) or p['modelImage'] or (p['extraImages'][0] if p['extraImages'] else None)
json.dump(products, open(f"{ROOT}/src/data/products.json", 'w'), ensure_ascii=False, indent=1)
print('products.json geschrieben')
for p in products: print(f"  {p['brand'][:7]:7} {p['handle']:32} {p['category']:12} {p['gender']:7} {len(p['colors']):2} Farben {len(p['sizes']):2} Größen {p['price']:6.2f} € img={'ja' if p['image'] else 'NEIN'} back={sum(1 for c in p['colors'] if c.get('back'))}")
