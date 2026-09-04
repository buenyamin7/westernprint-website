// Produktkatalog: Snapshot des freigeschalteten POD-Sortiments (src/data/products.json, gebaut von scripts/build-catalog.py).
import products from '../data/products.json';

export const PRINT_SIZES = [
  { key: 'A6', label: 'A6', hint: 'ca. 10 x 15 cm', surcharge: 5, pct: 18 },
  { key: 'A5', label: 'A5', hint: 'ca. 15 x 21 cm', surcharge: 6, pct: 28 },
  { key: 'A4', label: 'A4', hint: 'ca. 21 x 30 cm', surcharge: 7, pct: 38 },
  { key: 'A3+', label: 'A3+', hint: 'ca. 33 x 48 cm', surcharge: 9, pct: 48 },
];

export interface ProductColor { id: string; name: string; hex: string | null; image: string | null; back: string | null }
export interface ShopProduct {
  id: string; handle: string; title: string; brand: string; style: string; category: string; gender: string; productType: string;
  description: string[]; grammage: string | null; fit: string | null; composition: string | null;
  modelImage: string | null; extraImages: string[]; image: string | null;
  colors: ProductColor[]; sizes: string[]; price: number; minPrice: number;
  variants: { id: string; color: string; size: string; price: number; available: boolean }[];
}

export const CATEGORY_ORDER = ['T-Shirts', 'Hoodies', 'Sweatshirts', 'Polos', 'Tank Tops', 'Hosen', 'Jacken', 'Kinder', 'Baby', 'Taschen', 'Accessoires'];

export async function getProducts(): Promise<ShopProduct[]> {
  const list = (products as ShopProduct[]).filter((p) => p.image && p.colors.length && p.variants.length);
  return [...list].sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || (a.brand === 'Stanley/Stella' ? -1 : 1) - (b.brand === 'Stanley/Stella' ? -1 : 1) || a.price - b.price);
}

export const euro = (n: number) => n.toFixed(2).replace('.', ',') + ' €';
