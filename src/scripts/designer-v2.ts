// Designer V2 im Shop: Motiv in echten Zentimetern platzieren. Ein Zustand ist die Quelle, Anzeige und Preis werden daraus abgeleitet.
// Geometrie und Preisstufen kommen aus dem gemeinsamen Kern (auch in der Kasse), damit beide dasselbe prüfen.
import {
  toU, fmtCm, parseCm, classifyPrint, heightFor, widthForHeight, sourceDpi, qualityFor, checkPlacement,
  constrainMove, maxWidthAt, fitSuggestion, cmToPx, tariffsFor, reachableTariffs, sleeveText, CORE_VERSION, TARIFF_VERSION,
} from '../lib/designer-core/core.mjs';
import { addItem, euro } from './cart';

type Side = 'front' | 'back';
type Zone = { xMinU: number; xMaxU: number; yMinU: number; yMaxU: number; exclude: { x0U: number; x1U: number; y0U: number; y1U: number; label: string }[] };
type Preset = { centerXU: number; topYU: number; widthU: number };
type Area = { status: string; frame: string; pxPerCm: number; originPx: [number, number]; zone: Zone | null; presets: Record<string, Preset> };
type Motif = { file: File; name: string; local: string; url: string | null; W: number; H: number; bx: number; by: number; bw: number; bh: number; opaque: boolean; status: 'uploading' | 'ready' | 'error'; token: number };
type Place = { centerXU: number; topYU: number; widthU: number; preset: string | null };

const data = JSON.parse(document.getElementById('pdata')!.textContent!);
const { product, sizes: SIZES, sleeve: SLEEVE, podSecond: POD_SECOND, cloud, dz } = data;
const POD = product.pricing === 'pod';
const SUR: Record<string, number> = Object.fromEntries(SIZES.map((s: any) => [s.key, Math.round(s.surcharge * 100)]));
const ALLOW_BRUST = !!data.chest;
const MAX_BYTES = 25 * 1024 * 1024, MAX_PIXELS = 40e6;

const form = document.querySelector<HTMLFormElement>('[data-config]')!;
const q = <T extends Element>(s: string, root: ParentNode = document) => root.querySelector<T>(s)!;
const svg = q<SVGSVGElement>('[data-dz-svg]');
const el = {
  photo: q<SVGImageElement>('[data-dz-photo]'), view: q<SVGGElement>('[data-dz-view]'), zone: q<SVGRectElement>('[data-dz-zone]'), zoneBg: q<SVGRectElement>('[data-dz-zone-bg]'),
  hole: q<SVGRectElement>('[data-dz-mask-hole]'), excl: q<SVGGElement>('[data-dz-excl]'), center: q<SVGLineElement>('[data-dz-center]'), snap: q<SVGLineElement>('[data-dz-snap-line]'),
  motifG: q<SVGGElement>('[data-dz-motif-g]'), motif: q<SVGImageElement>('[data-dz-motif]'), sel: q<SVGRectElement>('[data-dz-sel]'), flat: q<SVGFEFloodElement>('[data-dz-flat-color]'),
  badge: q<HTMLElement>('[data-dz-badge]'), measure: q<HTMLElement>('[data-dz-measure]'),
  title: q<HTMLElement>('[data-dz-side-title]'), file: q<HTMLInputElement>('[data-dz-file]'), thumb: q<HTMLElement>('[data-dz-thumb]'), upLabel: q<HTMLElement>('[data-dz-upload-label]'), upSub: q<HTMLElement>('[data-dz-upload-sub]'),
  status: q<HTMLElement>('[data-dz-status]'), edit: q<HTMLElement>('[data-dz-edit]'), w: q<HTMLInputElement>('[data-dz-w]'), h: q<HTMLInputElement>('[data-dz-h]'), range: q<HTMLInputElement>('[data-dz-range]'),
  wHint: q<HTMLElement>('[data-dz-w-hint]'), wErr: q<HTMLElement>('[data-dz-w-err]'), top: q<HTMLInputElement>('[data-dz-top]'), topLabel: q<HTMLElement>('[data-dz-top-label]'), x: q<HTMLInputElement>('[data-dz-x]'), posErr: q<HTMLElement>('[data-dz-pos-err]'),
  conflict: q<HTMLElement>('[data-dz-conflict]'), conflictText: q<HTMLElement>('[data-dz-conflict-text]'), fit: q<HTMLButtonElement>('[data-dz-fit]'),
  quality: q<HTMLElement>('[data-dz-quality]'), qualityText: q<HTMLElement>('[data-dz-quality-text]'), ack: q<HTMLInputElement>('[data-dz-ack]'), tariff: q<HTMLElement>('[data-dz-tariff]'),
  planned: q<HTMLElement>('[data-dz-planned]'), plannedChips: q<HTMLElement>('[data-dz-planned-chips]'), nosnap: q<HTMLInputElement>('[data-dz-nosnap]'),
  undo: q<HTMLButtonElement>('[data-dz-undo]'), redo: q<HTMLButtonElement>('[data-dz-redo]'), add: q<HTMLButtonElement>('[data-add]'), note: q<HTMLElement>('[data-note]'),
};

// ── Zustand ──────────────────────────────────────────────────────────────────
const state = {
  view: 'front' as Side,
  motif: { front: null, back: null } as Record<Side, Motif | null>,
  place: { front: null, back: null } as Record<Side, Place | null>,
  ack: { front: '', back: '' } as Record<Side, string>, // Schlüssel der bestätigten Auflösungswarnung (Datei + Breite)
  planned: { front: 'A4', back: 'A4' } as Record<Side, string>,
  zoomed: false,
  sleeveUploads: { left: null, right: null } as Record<'left' | 'right', { url: string; name: string } | null>,
};
const history: { past: string[]; future: string[] } = { past: [], future: [] };
let uploadSeq = 0;

const val = (name: string) => form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value ?? '';
const colorEl = () => form.querySelector<HTMLInputElement>('input[name="color"]:checked')!;
const sizeKey = () => val('size') || dz.refSize;
const activeSides = () => { const s = val('side'); return { front: s !== 'Rückseite', back: s !== 'Vorderseite' }; };
const variant = () => product.variants.find((v: any) => v.color === val('color') && v.size === val('size'));
const qty = () => Math.max(1, Math.min(99, Number(q<HTMLInputElement>('#qty').value) || 1));
const area = (side: Side = state.view): Area | null => dz.sizes[sizeKey()]?.areas?.[side] ?? null;
const visH = (m: Motif, wU: number) => heightFor(wU, m.bw, m.bh);

function snapshot() { return JSON.stringify({ place: state.place, planned: state.planned }); }
function commit() { history.past.push(lastCommitted); if (history.past.length > 40) history.past.shift(); history.future = []; lastCommitted = snapshot(); }
let lastCommitted = snapshot();
function restore(s: string) { const o = JSON.parse(s); state.place = o.place; state.planned = o.planned; lastCommitted = s; render(); }

// ── Geometrie-Helfer ─────────────────────────────────────────────────────────
function placementFor(side: Side) {
  const m = state.motif[side], p = state.place[side];
  if (!m || !p) return null;
  return { centerXU: p.centerXU, topYU: p.topYU, widthU: p.widthU, heightU: visH(m, p.widthU).checkU };
}
function validity(side: Side) {
  const a = area(side), pl = placementFor(side);
  if (!a || !a.zone) return { ok: false, code: 'NOAREA', message: 'Für diese Größe ist der Druckbereich noch nicht freigegeben. Wähle eine andere Größe oder frag uns an.' };
  if (!pl) return { ok: true };
  return checkPlacement(a.zone, pl);
}
function tariffFor(side: Side): { key?: string; error?: string } {
  const m = state.motif[side], p = state.place[side];
  if (!m || !p) return { key: state.planned[side] };
  return classifyPrint({ widthU: p.widthU, heightU: visH(m, p.widthU).checkU, side, allowBrust: ALLOW_BRUST, surcharges: SUR, scale: area(side)?.tariffScale || 1 });
}
function startPlace(side: Side, m: Motif, presetName?: string): Place | null {
  const a = area(side); if (!a?.zone) return null;
  const name = presetName && a.presets[presetName] ? presetName : a.presets.center ? 'center' : Object.keys(a.presets)[0];
  const pr = a.presets[name] ?? { centerXU: 0, topYU: a.zone.yMinU, widthU: 1000 };
  // Startbreite des Presets, aber nur so groß, wie es an dieser Stelle passt
  const maxW = maxWidthAt(a.zone, m.bw, m.bh, pr.centerXU, pr.topYU);
  let w = Math.min(pr.widthU, maxW);
  if (w >= 100) return { centerXU: pr.centerXU, topYU: pr.topYU, widthU: w, preset: name };
  const fit = fitSuggestion(a.zone, m.bw, m.bh, pr.centerXU, pr.topYU);
  return fit ? { centerXU: fit.centerXU, topYU: fit.topYU, widthU: fit.widthU, preset: null } : null;
}

// ── Darstellung ──────────────────────────────────────────────────────────────
const sideLabel = (s: Side) => (s === 'front' ? 'Vorderseite' : 'Rückseite');
const frameLabel = (f: string) => (f === 'hood-tip' ? 'Abstand zur Kapuzenspitze' : f === 'hood-v' ? 'Abstand zum Kapuzenansatz' : 'Abstand zur Kragennaht');
let pxScale = 1; // SVG-Einheiten je CSS-Pixel (für greifbare Griffe)

function photoFor(side: Side) {
  const c = colorEl(); const v = dz.views[side];
  const back = c.dataset.back && c.dataset.back !== 'null' ? c.dataset.back : null;
  if (side === 'back' && back && !v?.schematic) return { src: back, flat: false };
  const front = c.dataset.image && c.dataset.image !== 'null' ? c.dataset.image : product.image;
  return { src: front, flat: side === 'back' };
}

function renderStage() {
  const side = state.view, a = area(side);
  const ph = photoFor(side);
  if (el.photo.getAttribute('href') !== ph.src) el.photo.setAttribute('href', ph.src);
  el.flat.setAttribute('flood-color', (colorEl().closest('label') as HTMLElement)?.style.getPropertyValue('--sw') || '#777');
  el.photo.setAttribute('filter', ph.flat ? 'url(#dz-flat)' : '');
  el.badge.hidden = !ph.flat; el.badge.textContent = ph.flat ? 'Rückseite schematisch (kein Rückenfoto)' : '';
  document.querySelectorAll<HTMLButtonElement>('[data-dz-tab]').forEach((b) => {
    const s = b.dataset.dzTab as Side; const on = s === side;
    b.setAttribute('aria-selected', String(on)); b.classList.toggle('is-on', on); b.hidden = !activeSides()[s];
    (b.querySelector('[data-dz-dot]') as HTMLElement).hidden = !state.motif[s];
  });
  if (!a?.zone) { [el.zone, el.zoneBg, el.hole].forEach((r) => r.setAttribute('width', '0')); el.motifG.setAttribute('visibility', 'hidden'); el.excl.innerHTML = ''; setViewBox(); return; }
  const z = a.zone;
  const [x0, y0] = cmToPx(a, z.xMinU, z.yMinU), [x1, y1] = cmToPx(a, z.xMaxU, z.yMaxU);
  for (const r of [el.zone, el.zoneBg, el.hole]) { r.setAttribute('x', String(x0)); r.setAttribute('y', String(y0)); r.setAttribute('width', String(x1 - x0)); r.setAttribute('height', String(y1 - y0)); }
  el.center.setAttribute('x1', String(a.originPx[0])); el.center.setAttribute('x2', String(a.originPx[0])); el.center.setAttribute('y1', String(y0)); el.center.setAttribute('y2', String(y1));
  el.excl.innerHTML = z.exclude.map((e) => { const [ex0, ey0] = cmToPx(a, e.x0U, Math.max(e.y0U, z.yMinU)), [ex1, ey1] = cmToPx(a, e.x1U, Math.min(e.y1U, z.yMaxU)); return ey1 > ey0 ? `<rect x="${ex0}" y="${ey0}" width="${ex1 - ex0}" height="${ey1 - ey0}" fill="url(#dz-hatch)"><title>Nicht bedruckbar: ${e.label}</title></rect>` : ''; }).join('');
  const m = state.motif[side], p = state.place[side];
  if (!m || !p) { el.motifG.setAttribute('visibility', 'hidden'); el.measure.hidden = true; setViewBox(); return; }
  const h = visH(m, p.widthU);
  const [vx, vy] = cmToPx(a, p.centerXU - p.widthU / 2, p.topYU);
  const vw = (p.widthU / 100) * a.pxPerCm, vh = (h.exact / 100) * a.pxPerCm;
  // Ganzes Bild so legen, dass die sichtbaren Ränder genau auf vx/vy/vw/vh liegen
  const sx = vw / m.bw, sy = vh / m.bh;
  el.motif.setAttribute('href', m.local); el.motif.setAttribute('x', String(vx - m.bx * sx)); el.motif.setAttribute('y', String(vy - m.by * sy));
  el.motif.setAttribute('width', String(m.W * sx)); el.motif.setAttribute('height', String(m.H * sy));
  el.sel.setAttribute('x', String(vx)); el.sel.setAttribute('y', String(vy)); el.sel.setAttribute('width', String(vw)); el.sel.setAttribute('height', String(vh));
  const valid = validity(side).ok;
  el.sel.classList.toggle('is-bad', !valid); el.zone.classList.toggle('is-bad', !valid);
  const hr = Math.max(7, 9 * pxScale);
  for (const [k, cx, cy] of [['nw', vx, vy], ['ne', vx + vw, vy], ['sw', vx, vy + vh], ['se', vx + vw, vy + vh]] as const) {
    const c = q<SVGCircleElement>(`[data-dz-handle="${k}"]`); c.setAttribute('cx', String(cx)); c.setAttribute('cy', String(cy)); c.setAttribute('r', String(hr));
  }
  el.motifG.setAttribute('visibility', 'visible');
  el.measure.hidden = false; el.measure.textContent = `${fmtCm(p.widthU)} × ${fmtCm(Math.round(h.exact))} cm`;
  setViewBox();
}

function setViewBox() {
  const a = area();
  let vb = [0, 0, 720, 900];
  if (state.zoomed && a?.zone) {
    const [x0, y0] = cmToPx(a, a.zone.xMinU, a.zone.yMinU), [x1, y1] = cmToPx(a, a.zone.xMaxU, a.zone.yMaxU);
    const pad = 40, w = x1 - x0 + 2 * pad, h = Math.max(y1 - y0 + 2 * pad, w * 1.25);
    vb = [x0 - pad, (y0 + y1) / 2 - h / 2, w, h];
  }
  svg.setAttribute('viewBox', vb.join(' '));
  const r = svg.getBoundingClientRect(); pxScale = r.width ? vb[2] / r.width : 1;
  q<HTMLButtonElement>('[data-dz-zoom="in"]').hidden = state.zoomed; q<HTMLButtonElement>('[data-dz-zoom="out"]').hidden = !state.zoomed;
}

const fieldVal = (u: number) => fmtCm(u, 1);
function renderPanel() {
  const side = state.view, a = area(side), m = state.motif[side], p = state.place[side];
  el.title.textContent = sideLabel(side);
  el.upLabel.textContent = m ? (m.status === 'uploading' ? 'Wird hochgeladen …' : 'Motiv ersetzen') : 'Motiv hochladen';
  el.upSub.textContent = m ? m.name : 'PNG mit transparentem Hintergrund oder JPG, max. 25 MB.';
  el.thumb.innerHTML = m ? `<img src="${m.local}" alt="">` : el.thumb.dataset.empty || el.thumb.innerHTML;
  el.edit.hidden = !m || !p; el.planned.hidden = !!m;
  el.topLabel.textContent = frameLabel(a?.frame || 'collar');
  // Vorschläge für die geplante Größe ohne Motiv: nur Stufen, die in den Druckbereich passen
  if (!m) {
    const fits = a?.zone ? reachableTariffs(a.zone, side, ALLOW_BRUST, a.tariffScale || 1) : [];
    if (!fits.find((t) => t.key === state.planned[side])) state.planned[side] = fits.length ? fits[Math.min(fits.length - 1, 3)].key : '';
    el.plannedChips.innerHTML = fits.map((t) => `<label class="chip"><input type="radio" name="dz_planned" value="${t.key}" ${t.key === state.planned[side] ? 'checked' : ''}> <span>${t.key} <small>bis ${fmtCm(t.maxU[0])} × ${fmtCm(t.maxU[1])} cm${POD ? '' : `, +${euro(SUR[t.key] / 100)}`}</small></span></label>`).join('') || '<p class="muted">Für diese Größe gibt es noch keinen freigegebenen Druckbereich.</p>';
  }
  if (!m || !p || !a?.zone) { renderMessages(); return; }
  const h = visH(m, p.widthU);
  const maxW = maxWidthAt(a.zone, m.bw, m.bh, p.centerXU, p.topYU);
  if (document.activeElement !== el.w) el.w.value = fieldVal(p.widthU);
  if (document.activeElement !== el.h) el.h.value = fieldVal(Math.round(h.exact));
  if (document.activeElement !== el.top) el.top.value = fieldVal(p.topYU);
  if (document.activeElement !== el.x) el.x.value = fieldVal(p.centerXU);
  el.range.min = '100'; el.range.max = String(Math.max(100, maxW, p.widthU)); el.range.value = String(p.widthU);
  el.wHint.textContent = maxW >= 100 ? `An dieser Stelle möglich: 1,0 bis ${fmtCm(maxW)} cm breit.` : '';
  form.querySelectorAll<HTMLInputElement>('input[name="dz_preset"]').forEach((r) => { r.checked = r.value === p.preset; (r.closest('label') as HTMLElement).hidden = !a.presets[r.value]; });
  el.undo.disabled = !history.past.length; el.redo.disabled = !history.future.length;
  renderMessages();
}

function renderMessages() {
  const side = state.view, m = state.motif[side], p = state.place[side];
  const v = validity(side);
  el.conflict.hidden = v.ok || !m;
  if (!v.ok && m && p) {
    const a = area(side);
    el.conflictText.textContent = v.code === 'NOAREA' ? v.message! : `Dein Motiv passt so nicht in den Druckbereich dieser Kleidergröße: ${v.message}`;
    const fit = a?.zone ? fitSuggestion(a.zone, m.bw, m.bh, p.centerXU, p.topYU) : null;
    el.fit.hidden = !fit || (fit.widthU === p.widthU && v.code !== 'TOP' && v.code !== 'BOTTOM' && v.code !== 'SIDE' && v.code !== 'EXCLUDE');
    if (fit) { const fh = visH(m, fit.widthU); el.fit.textContent = fit.widthU < p.widthU ? `Auf ${fmtCm(fit.widthU)} × ${fmtCm(Math.round(fh.exact))} cm verkleinern` : 'In den Druckbereich schieben'; el.fit.dataset.fit = JSON.stringify(fit); }
  }
  // Auflösung
  const qi = qualityInfo(side);
  el.quality.hidden = !qi || qi.level === 'ok';
  if (qi && qi.level !== 'ok') { el.qualityText.textContent = `Dein Motiv hat bei dieser Größe nur ca. ${Math.round(qi.dpi)} dpi und kann unscharf wirken. Verkleinere es oder lade eine Datei mit mehr Pixeln hoch.`; el.ack.checked = state.ack[side] === qi.key; }
  // Preisstufe
  const t = tariffFor(side);
  const tb = t.key ? tariffsFor(area(side)?.tariffScale || 1).find((x) => x.key === t.key)!.maxU : null;
  el.tariff.innerHTML = m && p ? (t.key ? `Preisstufe <b>${t.key}</b>${(area(side)?.tariffScale || 1) < 1 ? ' für diese Kindergröße' : ''} (bis ${fmtCm(tb![0])} × ${fmtCm(tb![1])} cm)${POD ? '' : `, +${euro(SUR[t.key] / 100)}`} · ca. ${Math.round(qi?.dpi || 0)} dpi` : `<span class="error">${t.error}</span>`) : '';
  el.status.textContent = m?.status === 'error' ? 'Das Hochladen hat nicht geklappt. Dein Entwurf bleibt erhalten. Wähle die Datei erneut.' : '';
}

function qualityInfo(side: Side) {
  const m = state.motif[side], p = state.place[side];
  if (!m || !p) return null;
  const d = sourceDpi(m.bw, m.bh, p.widthU, visH(m, p.widthU).exact).min;
  const qa = qualityFor(d);
  return { dpi: d, level: qa.level, code: qa.code, key: `${m.token}:${p.widthU}` };
}

// ── Preis (wie priceLine im Kassen-Worker) ───────────────────────────────────
function total() {
  const a = activeSides(); const v = variant(); const base = v ? v.price : product.price;
  const tf = a.front ? tariffFor('front').key : null, tb = a.back ? tariffFor('back').key : null;
  const sf = !a.front || POD || !tf ? 0 : SUR[tf] / 100;
  const sb = !a.back ? 0 : POD ? (a.front ? POD_SECOND : 0) : tb ? SUR[tb] / 100 : 0;
  const sl = sleeveOn('left') ? SLEEVE.surcharge : 0, sr = sleeveOn('right') ? SLEEVE.surcharge : 0;
  const unit = Math.round((base + sf + sb + sl + sr) * 100) / 100;
  return { base, sf, sb, sl, sr, tf, tb, unit, sum: Math.round(unit * qty() * 100) / 100 };
}
const sleeveOn = (k: 'left' | 'right') => !!form.querySelector<HTMLInputElement>(`input[name="sleeve_${k}"]:checked`);
function renderCalc() {
  const t = total(); const a = activeSides(); const n = qty();
  const add = (x: number) => (x ? `+ ${euro(x)}` : 'inklusive');
  q('[data-total]').textContent = euro(t.sum);
  q('[data-calc]').innerHTML = [
    `<li><span>${product.title} ${colorEl().dataset.name}${val('size') ? ' / ' + sizeText(val('size')) : ''}${POD ? ', inkl. Druck einer Seite' : ''}</span><b>${euro(t.base)}</b></li>`,
    a.front ? `<li><span>Druck vorne ${t.tf || ''}</span><b>${add(t.sf)}</b></li>` : '',
    a.back ? `<li><span>Druck hinten ${t.tb || ''}${POD && a.front ? ', zweite Seite' : ''}</span><b>${add(t.sb)}</b></li>` : '',
    t.sl ? `<li><span>Druck Ärmel links</span><b>+ ${euro(t.sl)}</b></li>` : '', t.sr ? `<li><span>Druck Ärmel rechts</span><b>+ ${euro(t.sr)}</b></li>` : '',
    n > 1 ? `<li><span>x ${n} Stück</span><b>${euro(t.sum)}</b></li>` : '',
  ].join('');
}
const sizeText = (s: string) => { const age = dz.sizes[s]?.ageLabel; return age ? `${s} (${age})` : s; };

// ── Bestellbar? ──────────────────────────────────────────────────────────────
function blockers(): string[] {
  const out: string[] = []; const a = activeSides();
  if (dz.status !== 'approved' && !dz.allowEstimated) out.push('Für dieses Produkt sind die Druckbereiche noch nicht freigegeben.');
  for (const side of (['front', 'back'] as Side[]).filter((s) => a[s])) {
    const m = state.motif[side];
    if (!area(side)?.zone) { out.push(`${sideLabel(side)}: Für diese Größe ist der Druckbereich noch nicht freigegeben.`); continue; }
    if (!m) { if (!state.planned[side]) out.push(`${sideLabel(side)}: Bitte eine Druckgröße wählen.`); continue; }
    if (m.status === 'uploading') out.push(`${sideLabel(side)}: Motiv wird noch hochgeladen.`);
    if (m.status === 'error') out.push(`${sideLabel(side)}: Hochladen fehlgeschlagen, bitte Datei erneut wählen.`);
    const v = validity(side); if (!v.ok) out.push(`${sideLabel(side)}: ${v.message}`);
    const t = tariffFor(side); if (t.error) out.push(`${sideLabel(side)}: ${t.error}`);
    const qi = qualityInfo(side); if (qi && qi.level !== 'ok' && state.ack[side] !== qi.key) out.push(`${sideLabel(side)}: Bitte den Hinweis zur Auflösung bestätigen.`);
  }
  return out;
}

// Ärmelgröße je Kleidergröße (Kinder/Baby kleiner, Preis gleich)
const sleeveScale = () => dz.sizes[sizeKey()]?.areas?.front?.tariffScale || 1;
function renderSleeves() { const t = sleeveScale() < 1 ? sleeveText(sleeveScale()) : 'max. ca. 8 x 8 cm'; form.querySelectorAll<HTMLElement>('[data-sleeve-hint]').forEach((e) => (e.textContent = t)); }
function render() { renderSleeves(); renderStage(); renderPanel(); renderCalc(); const b = blockers(); el.add.setAttribute('aria-disabled', String(b.length > 0)); el.add.classList.toggle('is-blocked', b.length > 0); }

// ── Upload und Motivprüfung ──────────────────────────────────────────────────
async function inspect(file: File): Promise<Omit<Motif, 'url' | 'status' | 'token' | 'file' | 'name' | 'local'> & { local: string }> {
  const sig = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const isPng = sig[0] === 0x89 && sig[1] === 0x50 && sig[2] === 0x4e && sig[3] === 0x47;
  const isJpg = sig[0] === 0xff && sig[1] === 0xd8;
  if (!isPng && !isJpg) throw new Error('Bitte eine PNG- oder JPG-Datei hochladen. Andere Formate (z. B. HEIC, PDF) bitte vorher als PNG speichern.');
  if (file.size > MAX_BYTES) throw new Error('Die Datei ist größer als 25 MB.');
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' } as any);
  const W = bmp.width, H = bmp.height;
  if (W * H > MAX_PIXELS) { bmp.close(); throw new Error('Das Bild hat mehr als 40 Megapixel. Bitte verkleinern und erneut hochladen.'); }
  let bx = 0, by = 0, bw = W, bh = H, opaque = true;
  if (isPng) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d', { willReadFrequently: true })!; ctx.drawImage(bmp, 0, 0);
    const px = ctx.getImageData(0, 0, W, H).data;
    let minX = W, minY = H, maxX = -1, maxY = -1;
    for (let y = 0; y < H; y++) { const row = y * W * 4; for (let x = 0; x < W; x++) if (px[row + x * 4 + 3] > 0) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; } }
    if (maxX < 0) { bmp.close(); throw new Error('Die Datei ist vollständig transparent.'); }
    bx = minX; by = minY; bw = maxX - minX + 1; bh = maxY - minY + 1;
    opaque = bx === 0 && by === 0 && bw === W && bh === H && px[3] === 255 && px[(W * H - 1) * 4 + 3] === 255;
  }
  bmp.close();
  return { W, H, bx, by, bw, bh, opaque, local: URL.createObjectURL(file) };
}
async function uploadFile(file: File): Promise<string> {
  if (!cloud?.cloudName || !cloud?.uploadPreset) throw new Error('Upload nicht eingerichtet');
  const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', cloud.uploadPreset); fd.append('folder', 'westernprint-shop');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud.cloudName}/image/upload`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('upload');
  return (await res.json()).secure_url;
}

el.file.addEventListener('change', async () => {
  const file = el.file.files?.[0]; el.file.value = ''; if (!file) return;
  const side = state.view; const token = ++uploadSeq;
  el.status.textContent = 'Datei wird geprüft …';
  let info;
  try { info = await inspect(file); } catch (e) { el.status.textContent = (e as Error).message; return; }
  const prev = state.motif[side];
  const m: Motif = { file, name: file.name, url: null, status: 'uploading', token, ...info };
  // Bisherige Platzierung bleibt (gleiche Breite), sonst Startplatzierung
  state.motif[side] = m;
  const keep = state.place[side];
  state.place[side] = keep ? { ...keep } : startPlace(side, m);
  if (!state.place[side]) state.place[side] = { centerXU: 0, topYU: area(side)?.zone?.yMinU ?? 150, widthU: 500, preset: null };
  if (prev && prev.local !== m.local) URL.revokeObjectURL(prev.local);
  commit(); render();
  el.status.textContent = info.opaque ? 'Deine Datei hat einen Hintergrund. Diese Fläche wird mitgedruckt. Prüfe, ob das gewünscht ist.' : 'Motiv wird hochgeladen. Du kannst es schon platzieren.';
  try {
    const url = await uploadFile(file);
    if (state.motif[side]?.token !== token) return; // inzwischen ersetzt
    m.url = url; m.status = 'ready'; if (!info.opaque) el.status.textContent = 'Motiv hochgeladen.';
  } catch {
    if (state.motif[side]?.token !== token) return;
    m.status = 'error';
  }
  render();
});

// ── Ziehen und Skalieren auf der Bühne ───────────────────────────────────────
function svgPoint(e: PointerEvent) { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM()!.inverse()); }
let drag: null | { kind: 'move' | 'scale'; id: number; start: DOMPoint; orig: Place; changed: boolean } = null;
let raf = 0, pending: (() => void) | null = null;
const schedule = (fn: () => void) => { pending = fn; if (!raf) raf = requestAnimationFrame(() => { raf = 0; const f = pending; pending = null; f?.(); }); };

function onDown(e: PointerEvent, kind: 'move' | 'scale') {
  const p = state.place[state.view]; if (!p || drag) return;
  e.preventDefault(); (e.target as Element).setPointerCapture(e.pointerId);
  drag = { kind, id: e.pointerId, start: svgPoint(e), orig: { ...p }, changed: false };
}
el.sel.addEventListener('pointerdown', (e) => onDown(e, 'move'));
el.motif.addEventListener('pointerdown', (e) => onDown(e, 'move'));
document.querySelectorAll<SVGCircleElement>('[data-dz-handle]').forEach((c) => c.addEventListener('pointerdown', (e) => onDown(e, 'scale')));
svg.addEventListener('pointermove', (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  const pt = svgPoint(e); const d = drag;
  schedule(() => {
    const a = area(), m = state.motif[state.view]; if (!a?.zone || !m) return;
    if (d.kind === 'move') {
      const dx = ((pt.x - d.start.x) / a.pxPerCm) * 100, dy = ((pt.y - d.start.y) / a.pxPerCm) * 100;
      let wantX = d.orig.centerXU + dx; const wantTop = d.orig.topYU + dy;
      // Einrasten auf der Mitte und auf "Brust links": 8 Bildschirmpixel, unabhängig vom Zoom
      const snapU = ((8 * pxScale) / a.pxPerCm) * 100; let snapped: number | null = null;
      if (!el.nosnap.checked && !e.altKey) for (const sx of [0, a.presets.chest_left?.centerXU].filter((x) => x != null) as number[]) if (Math.abs(wantX - sx) <= snapU) { wantX = sx; snapped = sx; }
      const h = visH(m, d.orig.widthU).checkU;
      const res = constrainMove(a.zone, { widthU: d.orig.widthU, heightU: h }, wantX, wantTop);
      if (res) { state.place[state.view] = { ...d.orig, centerXU: res.centerXU, topYU: res.topYU, preset: null }; d.changed = true; }
      el.snap.setAttribute('visibility', snapped != null && res?.centerXU === snapped ? 'visible' : 'hidden');
      if (snapped != null) { const [sxp] = cmToPx(a, snapped, 0); el.snap.setAttribute('x1', String(sxp)); el.snap.setAttribute('x2', String(sxp)); }
    } else {
      // Skalieren um Mittelpunkt x und Oberkante: Breite folgt dem Abstand des Griffs zur Mittellinie
      const [cxp] = cmToPx(a, d.orig.centerXU, 0);
      let w = Math.round(((2 * Math.abs(pt.x - cxp)) / a.pxPerCm) * 100);
      const maxW = maxWidthAt(a.zone, m.bw, m.bh, d.orig.centerXU, d.orig.topYU);
      w = Math.max(100, Math.min(w, maxW || 100));
      state.place[state.view] = { ...d.orig, widthU: w, preset: d.orig.preset }; d.changed = true;
    }
    renderStage(); renderPanel(); renderCalc();
  });
});
function endDrag(e: PointerEvent) {
  if (!drag || e.pointerId !== drag.id) return;
  const changed = drag.changed; drag = null; el.snap.setAttribute('visibility', 'hidden');
  if (changed) { commit(); render(); announce(); }
}
svg.addEventListener('pointerup', endDrag); svg.addEventListener('pointercancel', endDrag);

// Tastatur auf dem Motiv: Pfeile 0,1 cm, mit Umschalt 1 cm
el.sel.addEventListener('keydown', (e) => {
  const map: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  const d = map[e.key]; if (!d) return; e.preventDefault();
  nudge(d[0] * (e.shiftKey ? 100 : 10), d[1] * (e.shiftKey ? 100 : 10));
});
function nudge(dx: number, dy: number) {
  const a = area(), m = state.motif[state.view], p = state.place[state.view]; if (!a?.zone || !m || !p) return;
  const res = constrainMove(a.zone, { widthU: p.widthU, heightU: visH(m, p.widthU).checkU }, p.centerXU + dx, p.topYU + dy);
  if (!res || (res.centerXU === p.centerXU && res.topYU === p.topYU)) { el.status.textContent = 'Weiter geht es nicht, dort endet der Druckbereich.'; return; }
  state.place[state.view] = { ...p, centerXU: res.centerXU, topYU: res.topYU, preset: null }; commit(); render(); announce();
}
let announceTimer = 0;
function announce() { clearTimeout(announceTimer); announceTimer = window.setTimeout(() => { const p = state.place[state.view], m = state.motif[state.view]; if (p && m) el.status.textContent = `${fmtCm(p.widthU)} × ${fmtCm(Math.round(visH(m, p.widthU).exact))} cm, ${fmtCm(p.topYU)} cm unter der Kragennaht, Versatz ${fmtCm(p.centerXU)} cm.`; }, 400); }

// ── Eingabefelder ────────────────────────────────────────────────────────────
function applyWidth(wU: number, errEl: HTMLElement) {
  const a = area(), m = state.motif[state.view], p = state.place[state.view]; if (!a?.zone || !m || !p) return;
  const maxW = maxWidthAt(a.zone, m.bw, m.bh, p.centerXU, p.topYU);
  if (!(wU >= 100)) { errEl.textContent = 'Bitte mindestens 1,0 cm eingeben.'; errEl.hidden = false; renderPanel(); return; }
  if (wU > maxW) { errEl.textContent = `An dieser Stelle passen höchstens ${fmtCm(maxW)} cm Breite. Verschiebe das Motiv oder wähle eine kleinere Größe.`; errEl.hidden = false; renderPanel(); return; }
  errEl.hidden = true; state.place[state.view] = { ...p, widthU: wU }; commit(); render(); announce();
}
function onCommitField(input: HTMLInputElement, fn: (n: number) => void) {
  const go = () => { const n = parseCm(input.value); if (n == null) { renderPanel(); return; } fn(n); };
  input.addEventListener('change', go); input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
}
onCommitField(el.w, (n) => applyWidth(toU(n), el.wErr));
onCommitField(el.h, (n) => { const m = state.motif[state.view]; if (m) applyWidth(widthForHeight(toU(n), m.bw, m.bh), el.wErr); });
el.range.addEventListener('input', () => { const p = state.place[state.view]; if (!p) return; state.place[state.view] = { ...p, widthU: Number(el.range.value) }; renderStage(); renderPanel(); renderCalc(); });
el.range.addEventListener('change', () => { commit(); render(); announce(); });
function applyPos(xU: number | null, topU: number | null) {
  const a = area(), m = state.motif[state.view], p = state.place[state.view]; if (!a?.zone || !m || !p) return;
  const next = { centerXU: xU ?? p.centerXU, topYU: topU ?? p.topYU, widthU: p.widthU, heightU: visH(m, p.widthU).checkU };
  const chk = checkPlacement(a.zone, next);
  if (!chk.ok) { el.posErr.textContent = `Diese Position liegt außerhalb des Druckbereichs. ${chk.message}`; el.posErr.hidden = false; renderPanel(); return; }
  el.posErr.hidden = true; state.place[state.view] = { ...p, centerXU: next.centerXU, topYU: next.topYU, preset: null }; commit(); render(); announce();
}
onCommitField(el.top, (n) => applyPos(null, toU(n)));
el.x.addEventListener('change', () => { const s = el.x.value.trim(); const neg = s.startsWith('-') || s.startsWith('−'); const n = parseCm(s.replace(/^[-−+]/, '')); if (n == null) { renderPanel(); return; } applyPos(neg ? -toU(n) : toU(n), null); });

form.addEventListener('change', (e) => {
  const t = e.target as HTMLInputElement;
  if (t.name === 'dz_preset') {
    const a = area(), m = state.motif[state.view], p = state.place[state.view]; if (!a?.zone || !m || !p) return;
    const pr = a.presets[t.value]; if (!pr) return;
    // Presetwechsel behält die Motivgröße. Passt sie dort nicht, Konflikt zeigen statt still zu verkleinern.
    const next = { centerXU: pr.centerXU, topYU: pr.topYU, widthU: p.widthU, heightU: visH(m, p.widthU).checkU };
    state.place[state.view] = { ...p, centerXU: pr.centerXU, topYU: pr.topYU, preset: t.value };
    if (!checkPlacement(a.zone, next).ok) el.status.textContent = 'Das Motiv ist für diese Position zu groß. Nutze den Vorschlag unten oder verkleinere es.';
    commit(); render();
  }
  if (t.name === 'dz_planned') { state.planned[state.view] = t.value; commit(); render(); }
  if (t === el.ack) { const qi = qualityInfo(state.view); state.ack[state.view] = el.ack.checked && qi ? qi.key : ''; render(); }
  if (t.name === 'side') { const a = activeSides(); if (!a[state.view]) state.view = a.front ? 'front' : 'back'; render(); }
  if (t.name === 'color') { updateAvailability(); render(); q('[data-color-label]').textContent = colorEl().dataset.name || ''; }
  if (t.name === 'size') { q('[data-size-error]').hidden = true; render(); }
  if (t.name === 'sleeve_left' || t.name === 'sleeve_right') { (form.querySelector(`[data-sleeve-up="${t.name.replace('sleeve_', '')}"]`) as HTMLElement).hidden = !t.checked; renderCalc(); }
});
el.fit.addEventListener('click', () => { const f = JSON.parse(el.fit.dataset.fit || 'null'); const p = state.place[state.view]; if (!f || !p) return; state.place[state.view] = { ...p, centerXU: f.centerXU, topYU: f.topYU, widthU: f.widthU }; commit(); render(); announce(); });
q('[data-dz-hcenter]').addEventListener('click', () => { const p = state.place[state.view]; if (p) applyPos(0, null); });
q('[data-dz-reset]').addEventListener('click', () => { const m = state.motif[state.view]; if (!m) return; const s = startPlace(state.view, m, state.place[state.view]?.preset || 'center'); if (s) { state.place[state.view] = s; commit(); render(); } });
q('[data-dz-remove]').addEventListener('click', () => { const m = state.motif[state.view]; if (m) URL.revokeObjectURL(m.local); state.motif[state.view] = null; state.place[state.view] = null; commit(); render(); el.status.textContent = 'Motiv entfernt.'; });
document.querySelectorAll<HTMLButtonElement>('[data-dz-nudge]').forEach((b) => b.addEventListener('click', () => { const [dx, dy] = b.dataset.dzNudge!.split(',').map(Number); nudge(dx, dy); }));
el.undo.addEventListener('click', () => { const s = history.past.pop(); if (s == null) return; history.future.push(lastCommitted); restore(s); });
el.redo.addEventListener('click', () => { const s = history.future.pop(); if (s == null) return; history.past.push(lastCommitted); restore(s); });
document.querySelectorAll<HTMLButtonElement>('[data-dz-tab]').forEach((b) => b.addEventListener('click', () => { state.view = b.dataset.dzTab as Side; render(); }));
q('[data-dz-zoom="in"]').addEventListener('click', () => { state.zoomed = true; render(); });
q('[data-dz-zoom="out"]').addEventListener('click', () => { state.zoomed = false; render(); });
addEventListener('resize', () => renderStage());
form.querySelectorAll<HTMLButtonElement>('[data-qty]').forEach((b) => b.addEventListener('click', () => { const i = q<HTMLInputElement>('#qty'); i.value = String(Math.max(1, Math.min(99, qty() + Number(b.dataset.qty)))); renderCalc(); }));
form.addEventListener('input', (e) => { if ((e.target as HTMLElement).id === 'qty') renderCalc(); });

function updateAvailability() {
  form.querySelectorAll<HTMLInputElement>('input[name="size"]').forEach((inp) => {
    const v = product.variants.find((x: any) => x.color === val('color') && x.size === inp.value);
    const ok = !!v && v.available && !!dz.sizes[inp.value]; inp.disabled = !ok; inp.closest('label')!.classList.toggle('is-off', !ok);
    if (!ok && inp.checked) inp.checked = false;
  });
}

// Ärmel: wie bisher, feste Platzierung mittig auf dem Oberarm
form.querySelectorAll<HTMLInputElement>('[data-sleeve-file]').forEach((inp) => inp.addEventListener('change', async () => {
  const k = inp.dataset.sleeveFile as 'left' | 'right'; const file = inp.files?.[0]; if (!file) return;
  const label = q<HTMLElement>(`[data-sleeve-label="${k}"]`); label.textContent = 'Wird hochgeladen …';
  try { const url = await uploadFile(file); state.sleeveUploads[k] = { url, name: file.name }; label.textContent = `Hochgeladen: ${file.name}`; q<HTMLElement>(`[data-sleeve-thumb="${k}"]`).innerHTML = `<img src="${url}" alt="">`; }
  catch { label.textContent = 'Hochladen fehlgeschlagen, bitte erneut wählen'; }
}));

// ── Mockup (ohne Rahmen und Maße) ────────────────────────────────────────────
const loadImg = (src: string) => new Promise<HTMLImageElement>((ok, no) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => ok(im); im.onerror = () => no(new Error('Bild')); im.src = src; });
async function renderMockup(side: Side): Promise<string | null> {
  const m = state.motif[side], p = state.place[side], a = area(side); if (!m?.url || !p || !a || !cloud?.cloudName) return null;
  const ph = photoFor(side);
  const [shirt, art] = await Promise.all([loadImg(ph.src), loadImg(m.local)]);
  const cv = document.createElement('canvas'); cv.width = 720; cv.height = 900; const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 720, 900);
  if (ph.flat) { const t = document.createElement('canvas'); t.width = 720; t.height = 900; const tc = t.getContext('2d')!; tc.drawImage(shirt, 0, 0, 720, 900); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = el.flat.getAttribute('flood-color') || '#777'; tc.fillRect(0, 0, 720, 900); ctx.drawImage(t, 0, 0); }
  else ctx.drawImage(shirt, 0, 0, 720, 900);
  const h = visH(m, p.widthU); const [vx, vy] = cmToPx(a, p.centerXU - p.widthU / 2, p.topYU);
  const sx = ((p.widthU / 100) * a.pxPerCm) / m.bw, sy = ((h.exact / 100) * a.pxPerCm) / m.bh;
  ctx.drawImage(art, vx - m.bx * sx, vy - m.by * sy, m.W * sx, m.H * sy);
  const blob = await new Promise<Blob | null>((r) => cv.toBlob(r, 'image/jpeg', 0.86)); if (!blob) return null;
  const fd = new FormData(); fd.append('file', new File([blob], `mockup-${side}.jpg`, { type: 'image/jpeg' })); fd.append('upload_preset', cloud.uploadPreset); fd.append('folder', 'westernprint-shop/mockups');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud.cloudName}/image/upload`, { method: 'POST', body: fd });
  return res.ok ? ((await res.json()).secure_url as string) : null;
}

// ── In den Warenkorb ─────────────────────────────────────────────────────────
function placementPayload(side: Side) {
  const m = state.motif[side], p = state.place[side], a = area(side); if (!m || !p || !a) return null;
  const h = visH(m, p.widthU); const qi = qualityInfo(side)!;
  return {
    side, frame: a.frame, preset: p.preset, upload: m.url, widthCm: p.widthU / 100, heightCm: h.storedCm, centerXCm: p.centerXU / 100, topYCm: p.topYU / 100,
    px: { w: m.W, h: m.H, bx: m.bx, by: m.by, bw: m.bw, bh: m.bh }, dpi: Math.round(qi.dpi), ack: qi.code && state.ack[side] === qi.key ? [qi.code] : [],
  };
}
const posText = (pl: any, frame: string) => `${String(pl.widthCm.toFixed(1)).replace('.', ',')} x ${String(pl.heightCm.toFixed(1)).replace('.', ',')} cm, Oberkante ${String(pl.topYCm.toFixed(1)).replace('.', ',')} cm ${frame === 'hood-tip' ? 'unter der Kapuzenspitze' : frame === 'hood-v' ? 'unter dem Kapuzenansatz' : 'unter der Kragennaht'}, Mitte ${pl.centerXCm === 0 ? 'mittig' : `${String(Math.abs(pl.centerXCm).toFixed(1)).replace('.', ',')} cm ${pl.centerXCm > 0 ? 'rechts im Bild (linke Brustseite)' : 'links im Bild (rechte Brustseite)'}`}`;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  el.note.hidden = true; el.note.className = 'form-note';
  const v = variant();
  if (!v) { q('[data-size-error]').hidden = false; q<HTMLElement>('[data-sizes]').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
  const b = blockers();
  if (b.length) { el.note.className = 'form-note error'; el.note.hidden = false; el.note.innerHTML = `<b>Noch nicht bestellbar:</b><br>${b.map((x) => x.replace(/</g, '&lt;')).join('<br>')}`; return; }
  const a = activeSides(); const t = total(); const c = colorEl();
  const html = el.add.innerHTML; el.add.disabled = true; el.add.textContent = 'Vorschau wird gespeichert …';
  const mock: Record<Side, string | null> = { front: null, back: null };
  try { [mock.front, mock.back] = await Promise.all((['front', 'back'] as Side[]).map((s) => (a[s] ? renderMockup(s).catch(() => null) : null))); } catch {}
  el.add.disabled = false; el.add.innerHTML = html;
  const pf = a.front ? placementPayload('front') : null, pb = a.back ? placementPayload('back') : null;
  const sl = sleeveOn('left'), sr = sleeveOn('right');
  const up = (pl: any, side: Side) => (pl ? pl.upload : `${state.planned[side] ? 'Motiv' : ''} (wird nachgereicht)`.trim());
  addItem({
    variantId: v.id, handle: product.handle, title: product.title, color: c.dataset.name || '', size: sizeText(val('size')), image: c.dataset.image && c.dataset.image !== 'null' ? c.dataset.image : product.image,
    quantity: qty(), base: t.base, side: val('side') as any, surcharge: Math.round((t.sf + t.sb + t.sl + t.sr) * 100) / 100, pricing: POD ? 'pod' : undefined,
    sizeFront: a.front ? t.tf || undefined : undefined, sizeBack: a.back ? t.tb || undefined : undefined,
    uploadFront: a.front ? up(pf, 'front') : undefined, uploadBack: a.back ? up(pb, 'back') : undefined,
    posFront: pf ? posText(pf, pf.frame) : undefined, posBack: pb ? posText(pb, pb.frame) : undefined,
    mockupFront: mock.front || undefined, mockupBack: mock.back || undefined,
    sleeveLeft: sl || undefined, sleeveRight: sr || undefined, uploadSleeveLeft: sl ? state.sleeveUploads.left?.url || 'Motiv (wird nachgereicht)' : undefined, uploadSleeveRight: sr ? state.sleeveUploads.right?.url || 'Motiv (wird nachgereicht)' : undefined,
    designV2: { core: CORE_VERSION, tariffs: TARIFF_VERSION, data: dz.version, size: val('size'), front: pf, back: pb },
  } as any);
  el.note.className = 'form-note ok'; el.note.hidden = false;
  el.note.innerHTML = 'Im Warenkorb. <a href="/warenkorb" class="accent"><b>Zum Warenkorb</b></a> oder weiter stöbern.';
});

// Galeriebilder (z. B. Modellfoto) groß in einem Dialog zeigen, die Bühne bleibt beim Entwurf
const dlg = document.createElement('dialog'); dlg.className = 'dz-dialog';
dlg.innerHTML = '<img alt=""><button type="button" class="btn btn-ghost">Schließen</button>';
document.body.append(dlg); dlg.querySelector('button')!.addEventListener('click', () => dlg.close()); dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
document.querySelectorAll<HTMLButtonElement>('[data-thumb]').forEach((b) => b.addEventListener('click', () => { dlg.querySelector('img')!.src = b.dataset.thumb!; dlg.showModal(); }));

el.thumb.dataset.empty = el.thumb.innerHTML;
updateAvailability(); render();
