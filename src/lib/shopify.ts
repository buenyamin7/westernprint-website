// Build-time Zugriff auf die Shopify Storefront API (öffentlicher Token aus dem Buy-Button-Kanal).
export const SHOP_DOMAIN = 'aqi1vt-tk.myshopify.com';
export const STOREFRONT_TOKEN = '5ea1e596c3fb0d4098dc3ba4c37e17c3';
export const API_VERSION = '2025-07';
export const COLLECTION_HANDLE = 'produkte';

// Aufpreis-Varianten (eigene Produkte im Shop), identisch zum alten Konfigurator.
export const PRINT_SIZES = [
  { key: 'A6', label: 'A6', hint: 'ca. 10 x 15 cm', surcharge: 5, variantId: 'gid://shopify/ProductVariant/55952328163673', pct: 18 },
  { key: 'A5', label: 'A5', hint: 'ca. 15 x 21 cm', surcharge: 6, variantId: 'gid://shopify/ProductVariant/55952335765849', pct: 28 },
  { key: 'A4', label: 'A4', hint: 'ca. 21 x 30 cm', surcharge: 7, variantId: 'gid://shopify/ProductVariant/55952337305945', pct: 38 },
  { key: 'A3+', label: 'A3+', hint: 'ca. 33 x 48 cm', surcharge: 9, variantId: 'gid://shopify/ProductVariant/55952338452825', pct: 48 },
];

export interface ShopProduct {
  id: string; handle: string; title: string; description: string; productType: string;
  images: { url: string; alt: string }[];
  options: { name: string; values: string[] }[];
  variants: { id: string; title: string; price: number; available: boolean; options: Record<string, string>; image: string | null }[];
  minPrice: number;
}

async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`https://${SHOP_DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error('Storefront API: ' + JSON.stringify(json.errors));
  return json.data as T;
}

const PRODUCTS_QUERY = `
query Products($handle: String!) {
  collection(handle: $handle) {
    products(first: 50) {
      nodes {
        id handle title description descriptionHtml productType availableForSale
        priceRange { minVariantPrice { amount } }
        images(first: 12) { nodes { url(transform: { maxWidth: 1000 }) altText } }
        options { name values }
        variants(first: 100) {
          nodes { id title availableForSale price { amount } selectedOptions { name value } image { url(transform: { maxWidth: 1000 }) } }
        }
      }
    }
  }
}`;

function firstParagraph(html: string | null, fallback: string): string {
  const blocks = (html ?? '').split(/<\/(?:p|h[1-6]|li|div)>/i).map((b) => b.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()).filter((b) => b.length > 30);
  return blocks[0] ?? (fallback ?? '');
}

let cache: ShopProduct[] | null = null;
export async function getProducts(): Promise<ShopProduct[]> {
  if (cache) return cache;
  const data = await gql<any>(PRODUCTS_QUERY, { handle: COLLECTION_HANDLE });
  const nodes = data.collection?.products?.nodes ?? [];
  cache = nodes.filter((p: any) => p.availableForSale).map((p: any): ShopProduct => ({
    id: p.id, handle: p.handle, title: p.title, description: firstParagraph(p.descriptionHtml, p.description), productType: p.productType ?? '',
    images: p.images.nodes.map((i: any) => ({ url: i.url, alt: i.altText ?? p.title })),
    options: p.options,
    variants: p.variants.nodes.map((v: any) => ({
      id: v.id, title: v.title, price: parseFloat(v.price.amount), available: v.availableForSale,
      options: Object.fromEntries(v.selectedOptions.map((o: any) => [o.name, o.value])),
      image: v.image?.url ?? null,
    })),
    minPrice: parseFloat(p.priceRange.minVariantPrice.amount),
  }));
  return cache!;
}

export const euro = (n: number) => n.toFixed(2).replace('.', ',') + ' €';
