// Produktkatalog. Früher Shopify Storefront API, jetzt lokaler Snapshot (src/data/products.json) mit lokalen Bildern.
import products from '../data/products.json';

export const PRINT_SIZES = [
  { key: 'A6', label: 'A6', hint: 'ca. 10 x 15 cm', surcharge: 5, pct: 18 },
  { key: 'A5', label: 'A5', hint: 'ca. 15 x 21 cm', surcharge: 6, pct: 28 },
  { key: 'A4', label: 'A4', hint: 'ca. 21 x 30 cm', surcharge: 7, pct: 38 },
  { key: 'A3+', label: 'A3+', hint: 'ca. 33 x 48 cm', surcharge: 9, pct: 48 },
];

export interface ShopProduct {
  id: string; handle: string; title: string; description: string; productType: string;
  images: { url: string; alt: string }[];
  options: { name: string; values: string[] }[];
  variants: { id: string; title: string; price: number; available: boolean; options: Record<string, string>; image: string | null }[];
  minPrice: number;
}

export async function getProducts(): Promise<ShopProduct[]> {
  return products as ShopProduct[];
}

export const euro = (n: number) => n.toFixed(2).replace('.', ',') + ' €';
