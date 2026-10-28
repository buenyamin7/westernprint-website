#!/usr/bin/env node
// Kopiert den Designer-Kern und die Druckbereiche in den Kassen-Worker, damit Shop und Kasse dieselbe Version prüfen.
// Aufruf: node scripts/designer/sync-to-checkout.mjs [Pfad zum westernprint-checkout]   (--check: nur vergleichen)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const args = process.argv.slice(2);
const check = args.includes('--check');
const target = path.resolve(args.find((a) => !a.startsWith('--')) || path.join(ROOT, '../westernprint-checkout'));
const pairs = [
  ['src/lib/designer-core/core.mjs', 'src/designer-core.mjs'],
  ['src/data/designer/print-areas.json', 'src/print-areas.json'],
];
const hash = (p) => (fs.existsSync(p) ? crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 12) : 'fehlt');
let diff = 0;
for (const [from, to] of pairs) {
  const a = path.join(ROOT, from), b = path.join(target, to);
  const ha = hash(a), hb = hash(b);
  if (ha === hb) { console.log(`gleich   ${to} (${ha})`); continue; }
  diff++;
  if (check) console.log(`ANDERS   ${to}: Shop ${ha}, Kasse ${hb}`);
  else { fs.copyFileSync(a, b); console.log(`kopiert  ${to} (${ha})`); }
}
if (check && diff) process.exit(1);
