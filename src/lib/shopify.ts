// Produktkatalog: Snapshot des freigeschalteten POD-Sortiments (src/data/products.json, gebaut von scripts/build-catalog.py).
import products from '../data/products.json';

// frontOnly: nur Vorderseite. Brust = links auf der Brust (vom Träger aus, im Bild rechts), Aufschlag wie A6.
// Gleiche Schlüssel und Aufschläge wie PRINT_SIZES im Kassen-Worker (westernprint-checkout/src/catalog.js).
export const PRINT_SIZES = [
  { key: 'Brust', label: 'Brust', hint: 'ca. 10 x 10 cm, links', surcharge: 5, pct: 18, frontOnly: true },
  { key: 'A6', label: 'A6', hint: 'ca. 10 x 15 cm', surcharge: 5, pct: 18 },
  { key: 'A5', label: 'A5', hint: 'ca. 15 x 21 cm', surcharge: 6, pct: 28 },
  { key: 'A4', label: 'A4', hint: 'ca. 21 x 30 cm', surcharge: 7, pct: 38 },
  { key: 'A3+', label: 'A3+', hint: 'ca. 33 x 48 cm', surcharge: 9, pct: 48 },
];

export const DEFAULT_PRINT_SIZE = 'A4';
// Ärmeldruck je Ärmel (brutto) und zweite Druckseite bei Preislogik "pod" (Changer-Familie), wie im Kassen-Worker.
export const SLEEVE = { surcharge: 3.57, hint: 'max. ca. 8 x 8 cm' };
export const POD_SECOND_SIDE = 5.95;
// Brustdruck nur auf Textilien mit Brust, Ärmeldruck nur mit Ärmeln (gleiche Regeln in westernprint-checkout/src/catalog.js).
const NO_CHEST = ['Bag', 'Accessoire', 'Hose'];
const NO_SLEEVES = [...NO_CHEST, 'Tank Top'];
const NO_CHEST_HANDLES = ['sweatpants-select'];
export const hasChest = (p: { productType: string; handle: string }) => !NO_CHEST.includes(p.productType) && !NO_CHEST_HANDLES.includes(p.handle);
export const hasSleeves = (p: { productType: string; handle: string }) => hasChest(p) && !NO_SLEEVES.includes(p.productType);

export interface ProductColor { id: string; name: string; hex: string | null; image: string | null; back: string | null }
export interface ShopProduct {
  id: string; handle: string; title: string; brand: string; style: string; category: string; gender: string; productType: string;
  description: string[]; grammage: string | null; fit: string | null; composition: string | null;
  modelImage: string | null; extraImages: string[]; image: string | null;
  colors: ProductColor[]; sizes: string[]; price: number; minPrice: number;
  /** "pod": variant.price enthält EINE Druckseite in beliebiger Größe, zweite Seite POD_SECOND_SIDE, keine Größenaufschläge. */
  pricing?: 'pod';
  variants: { id: string; color: string; size: string; price: number; available: boolean }[];
}

export const CATEGORY_ORDER = ['T-Shirts', 'Hoodies', 'Sweatshirts', 'Polos', 'Tank Tops', 'Hosen', 'Jacken', 'Kinder', 'Baby', 'Taschen', 'Accessoires'];

export async function getProducts(): Promise<ShopProduct[]> {
  const list = (products as ShopProduct[]).filter((p) => p.image && p.colors.length && p.variants.length);
  return [...list].sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || (a.brand === 'Stanley/Stella' ? -1 : 1) - (b.brand === 'Stanley/Stella' ? -1 : 1) || a.price - b.price);
}

export const euro = (n: number) => n.toFixed(2).replace('.', ',') + ' €';
