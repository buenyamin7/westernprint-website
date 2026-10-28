#!/usr/bin/env python3
"""Freigabe-Bögen für den Inhaber: je Produkt das Foto mit Druckbereich (mittlere Größe) und eine Tabelle
mit dem größten Druckbereich je Kleidergröße. Aufruf: python3 scripts/designer/qa-sheets.py ZIELORDNER"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
out = sys.argv[1] if len(sys.argv) > 1 else '.'
pa = json.load(open(os.path.join(ROOT, 'src/data/designer/print-areas.json')))['products']
products = {p['handle']: p for p in json.load(open(os.path.join(ROOT, 'src/data/products.json')))}
try: font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 15); small = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 13)
except Exception: font = small = ImageFont.load_default()
f = lambda u: f"{u/100:.1f}".replace('.', ',')
TW, TH = 300, 375
tiles, rows = [], ['| Produkt | Größe | Alter | vorne max. (B × H cm) | hinten max. (B × H cm) |', '|---|---|---|---|---|']
for h, e in pa.items():
    p = products[h]; sizes = list(e['sizes'].keys()); mid = sizes[len(sizes) // 2]
    for s in sizes:
        a = e['sizes'][s]['areas']; dims = []
        for v in ('front', 'back'):
            z = a.get(v, {}).get('zone') if a.get(v) else None
            dims.append(f"{f(z['xMaxU']-z['xMinU'])} × {f(z['yMaxU']-z['yMinU'])}" if z else '–')
        rows.append(f"| {p['title']} | {s} | {e['sizes'][s].get('ageLabel') or ''} | {dims[0]} | {dims[1]} |")
    for v in ('front', 'back'):
        a = e['sizes'][mid]['areas'].get(v); vw = e['views'].get(v)
        if not a or not a.get('zone'): continue
        im = Image.open(os.path.join(ROOT, 'public', vw['image'].lstrip('/'))).convert('RGBA')
        bg = Image.new('RGBA', im.size, (200, 200, 200, 255)); bg.alpha_composite(im)
        d = ImageDraw.Draw(bg); z = a['zone']; ppc = a['pxPerCm']; ox, oy = a['originPx']
        X = lambda u: ox + u / 100 * ppc; Y = lambda u: oy + u / 100 * ppc
        d.rectangle([X(z['xMinU']), Y(z['yMinU']), X(z['xMaxU']), Y(z['yMaxU'])], outline=(255, 40, 40, 255), width=4)
        for ex in z['exclude']: d.rectangle([X(ex['x0U']), Y(max(ex['y0U'], z['yMinU'])), X(ex['x1U']), Y(min(ex['y1U'], z['yMaxU']))], outline=(255, 160, 0, 255), width=3)
        d.ellipse([ox - 6, oy - 6, ox + 6, oy + 6], fill=(0, 140, 255, 255))
        for k, pr in a['presets'].items():
            d.rectangle([X(pr['centerXU'] - pr['widthU'] / 2), Y(pr['topYU']), X(pr['centerXU'] + pr['widthU'] / 2), Y(pr['topYU']) + 3], fill=(0, 200, 120, 255))
        t = bg.resize((TW, TH)); td = ImageDraw.Draw(t)
        td.rectangle([0, 0, TW, 40], fill=(255, 255, 255, 230))
        td.text((6, 3), f"{p['title']} {'vorne' if v == 'front' else 'hinten'}{' (schematisch)' if vw.get('schematic') else ''}", fill=(0, 0, 0), font=font)
        td.text((6, 21), f"Größe {mid}: max. {f(z['xMaxU']-z['xMinU'])} × {f(z['yMaxU']-z['yMinU'])} cm", fill=(180, 0, 0), font=small)
        tiles.append(t)
per = 20
for i in range(0, len(tiles), per):
    chunk = tiles[i:i + per]; cols = 5; sheet = Image.new('RGB', (TW * cols, TH * ((len(chunk) + cols - 1) // cols)), (255, 255, 255))
    for j, t in enumerate(chunk): sheet.paste(t.convert('RGB'), ((j % cols) * TW, (j // cols) * TH))
    sheet.save(os.path.join(out, f'druckbereiche-{i // per + 1}.jpg'), quality=85)
open(os.path.join(out, 'druckbereiche-tabelle.md'), 'w').write('# Druckbereiche je Größe (Entwurf zur Freigabe)\n\nRot = Druckbereich, Blau = Kragennaht (Nullpunkt), Grün = Startplatzierungen, Orange = gesperrt (Knopfleiste, Reißverschluss).\n\n' + '\n'.join(rows) + '\n')
print(len(tiles), 'Ansichten,', len(rows) - 2, 'Größen')
