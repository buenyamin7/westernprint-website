// Warenkorb im Browser (localStorage). Preise werden an der Kasse serverseitig neu berechnet.
const KEY = 'wp-cart-v2';

export interface CartItem {
  id: string; variantId: string; handle: string; title: string; color: string; size: string; image: string | null;
  quantity: number; base: number; side: 'Vorderseite' | 'Rückseite' | 'Beide Seiten';
  sizeFront?: string; sizeBack?: string; uploadFront?: string; uploadBack?: string; posFront?: string; posBack?: string;
  surcharge: number; // je Stück
}

export function getCart(): CartItem[] { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
function save(items: CartItem[]) { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {} announce(items); }

export function addItem(item: Omit<CartItem, 'id'>): CartItem[] {
  const items = getCart();
  const id = 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  items.push({ ...item, id }); save(items); return items;
}
export function updateQty(id: string, quantity: number): CartItem[] {
  let items = getCart().map((i) => (i.id === id ? { ...i, quantity: Math.max(0, Math.min(99, quantity)) } : i)).filter((i) => i.quantity > 0);
  save(items); return items;
}
export function removeItem(id: string): CartItem[] { const items = getCart().filter((i) => i.id !== id); save(items); return items; }
export function clearCart() { save([]); }
export const lineTotal = (i: CartItem) => (i.base + i.surcharge) * i.quantity;
export const subtotal = (items: CartItem[]) => items.reduce((s, i) => s + lineTotal(i), 0);
export const count = (items: CartItem[]) => items.reduce((s, i) => s + i.quantity, 0);

function announce(items: CartItem[]) {
  const n = count(items);
  document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((el) => { el.textContent = String(n); el.hidden = n === 0; });
}
export function refreshCount() { announce(getCart()); }
export const euro = (n: number | string) => Number(n).toFixed(2).replace('.', ',') + ' €';

/** Kasse: Warenkorb an den Worker schicken, Stripe-URL zurück. */
export async function startCheckout(endpoint: string): Promise<string> {
  const items = getCart();
  if (!items.length) throw new Error('Warenkorb ist leer');
  const lines = items.map((i) => ({ variantId: i.variantId, quantity: i.quantity, side: i.side, sizeFront: i.sizeFront, sizeBack: i.sizeBack, uploadFront: i.uploadFront, uploadBack: i.uploadBack, posFront: i.posFront, posBack: i.posBack }));
  const res = await fetch(`${endpoint}/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lines }) });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error || 'Kasse nicht erreichbar');
  return data.url;
}
