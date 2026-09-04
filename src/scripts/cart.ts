// Warenkorb im Browser über die Shopify Storefront API. Der Warenkorb lebt bei Shopify, hier liegt nur die ID.
const DOMAIN = 'aqi1vt-tk.myshopify.com';
const TOKEN = '5ea1e596c3fb0d4098dc3ba4c37e17c3';
const API = `https://${DOMAIN}/api/2025-07/graphql.json`;
const KEY = 'wp-cart-id';

export interface CartLine { id: string; quantity: number; attributes: { key: string; value: string }[]; cost: { totalAmount: { amount: string } }; merchandise: { id: string; title: string; price: { amount: string }; image: { url: string } | null; product: { title: string; handle: string } } }
export interface Cart { id: string; checkoutUrl: string; totalQuantity: number; cost: { subtotalAmount: { amount: string }; totalAmount: { amount: string } }; lines: { nodes: CartLine[] } }

const CART_FIELDS = `id checkoutUrl totalQuantity cost { subtotalAmount { amount } totalAmount { amount } }
  lines(first: 100) { nodes { id quantity attributes { key value } cost { totalAmount { amount } }
    merchandise { ... on ProductVariant { id title price { amount } image { url(transform: { maxWidth: 300 }) } product { title handle } } } } }`;

async function gql<T = any>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': TOKEN }, body: JSON.stringify({ query, variables }) });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? 'Storefront API Fehler');
  return json.data;
}

const getId = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const setId = (id: string | null) => { try { id ? localStorage.setItem(KEY, id) : localStorage.removeItem(KEY); } catch {} };

export async function getCart(): Promise<Cart | null> {
  const id = getId(); if (!id) return null;
  const data = await gql(`query($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`, { id });
  if (!data.cart) { setId(null); return null; }
  return data.cart;
}

export interface NewLine { merchandiseId: string; quantity: number; attributes?: { key: string; value: string }[] }

export async function addLines(lines: NewLine[]): Promise<Cart> {
  const id = getId();
  if (id) {
    const data = await gql(`mutation($id: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $id, lines: $lines) { cart { ${CART_FIELDS} } userErrors { message } } }`, { id, lines });
    if (data.cartLinesAdd.cart) { announce(data.cartLinesAdd.cart); return data.cartLinesAdd.cart; }
    setId(null);
  }
  const data = await gql(`mutation($lines: [CartLineInput!]!) { cartCreate(input: { lines: $lines }) { cart { ${CART_FIELDS} } userErrors { message } } }`, { lines });
  const err = data.cartCreate.userErrors?.[0]; if (err) throw new Error(err.message);
  setId(data.cartCreate.cart.id); announce(data.cartCreate.cart); return data.cartCreate.cart;
}

export async function updateLine(lineId: string, quantity: number): Promise<Cart> {
  const data = await gql(`mutation($id: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $id, lines: $lines) { cart { ${CART_FIELDS} } userErrors { message } } }`, { id: getId(), lines: [{ id: lineId, quantity }] });
  announce(data.cartLinesUpdate.cart); return data.cartLinesUpdate.cart;
}

export async function removeLines(lineIds: string[]): Promise<Cart> {
  const data = await gql(`mutation($id: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $id, lineIds: $lineIds) { cart { ${CART_FIELDS} } userErrors { message } } }`, { id: getId(), lineIds });
  announce(data.cartLinesRemove.cart); return data.cartLinesRemove.cart;
}

function announce(cart: Cart | null) {
  const n = cart?.totalQuantity ?? 0;
  document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((el) => { el.textContent = String(n); el.hidden = n === 0; });
}

export async function refreshCount() { try { announce(await getCart()); } catch {} }
export const euro = (n: number | string) => Number(n).toFixed(2).replace('.', ',') + ' €';
