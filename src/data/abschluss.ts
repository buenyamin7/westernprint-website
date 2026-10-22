// Preise für Abschlussklassen: Abschlusspullis, Abschluss-Hoodies und Klassen-Shirts.
// Einzige Quelle für /fuer/abschlussklassen (Kurz gesagt, Karten, Preistabelle, FAQ, JSON-LD) und /llms-full.txt.
// Bei Preisänderungen hier ändern und STAND anpassen. Die Zeile "Abschlusspullis und Klassen-Shirts" in public/llms.txt
// ist statisch und muss von Hand mitgezogen werden.
// Quelle: EK aus der POD-App-Datenbank (abgelesen 22.10.2026, Standardfarben, Größen bis XXL) + feste Marge, Regel des
// Inhabers vom 07.10.2026: Klassenpreis ab 10 Stück = EK + 12,00 € netto (zwei Drucke), 1 bis 9 Stück = EK + 18,00 € netto.
// EK: Classic Hoodie 10,25 | BY011 13,95 | BY199 15,95 | Cruiser 2.0 16,75 | BY162 24,95 | BY268 25,95 | Classic-T 2,10 | Creator 2.0 4,15.
// Brutto = netto x 1,19, auf Cent gerundet. Dieselben Zahlen wie in den Angeboten, siehe Memory ek-preise-aus-pod-app.
// Anders als preise.ts (netto, ein Druck) stehen hier Bruttopreise inkl. 19 % MwSt. in Cent, weil die Seite sich an
// Schüler und Eltern richtet. Netto rechnet netto() aus (brutto / 1,19, kaufmännisch auf Cent).
// Jeder Preis gilt pro Stück, für alle Farben in XS bis XXL (ab 3XL und bei melierten Stanley/Stella-Farben ist der EK höher,
// der Aufpreis steht im Angebot), inkl. Druck vorne (Motto) und hinten (Namensliste)
// und Design (Motto, Schriftzug, Namensliste setzen), zzgl. Versand.
// Klassenpreis ab 10 Stück. 1 bis 9 Stück und Nachbestellungen (ab 1 Stück) kosten den Preis für 1 bis 9 Stück.

export const STAND = '22.10.2026';

/** Ab dieser Stückzahl gilt der Klassenpreis. */
export const KLASSENPREIS_AB = 10;

export interface AbschlussModell {
  id: string;
  name: string;
  brand: string;
  /** Artikelnummer des Herstellers, falls der Name allein nicht eindeutig ist. */
  artikel?: string;
  art: 'Hoodie' | 'T-Shirt';
  /** Preis pro Stück bei 1 bis 9 Stück und für Nachbestellungen, brutto in Cent. */
  preis1bis9: number;
  /** Klassenpreis pro Stück ab 10 Stück, brutto in Cent. */
  preisAb10: number;
}

export const modelle: AbschlussModell[] = [
  { id: 'classic-hoodie', name: 'Classic Hoodie', brand: 'Stedman', art: 'Hoodie', preis1bis9: 3362, preisAb10: 2648 },
  { id: 'by011', name: 'Heavy Hoody', brand: 'Build Your Brand', artikel: 'BY011', art: 'Hoodie', preis1bis9: 3802, preisAb10: 3088 },
  { id: 'by199', name: 'Oversized Hoody', brand: 'Build Your Brand', artikel: 'BY199', art: 'Hoodie', preis1bis9: 4040, preisAb10: 3326 },
  { id: 'cruiser-2-0', name: 'Cruiser 2.0', brand: 'Stanley/Stella', art: 'Hoodie', preis1bis9: 4135, preisAb10: 3421 },
  { id: 'by162', name: 'Ultra Heavy Box Hoody', brand: 'Build Your Brand', artikel: 'BY162', art: 'Hoodie', preis1bis9: 5111, preisAb10: 4397 },
  { id: 'by268', name: 'Ultra Heavy Oversized', brand: 'Build Your Brand', artikel: 'BY268', art: 'Hoodie', preis1bis9: 5230, preisAb10: 4516 },
  { id: 'classic-t', name: 'Classic-T', brand: 'Stedman', art: 'T-Shirt', preis1bis9: 2392, preisAb10: 1678 },
  { id: 'creator-2-0', name: 'Creator 2.0', brand: 'Stanley/Stella', art: 'T-Shirt', preis1bis9: 2636, preisAb10: 1922 },
];

/** Zusatzkosten, brutto in Cent. 0 = ohne Aufpreis. einheit steht in llms-full.txt hinter dem Preis. */
export const zusatz: { t: string; brutto: number; einheit?: string; d: string }[] = [
  { t: 'Ärmeldruck', brutto: 357, einheit: 'pro Ärmel', d: 'Pro Ärmel, zum Beispiel eigener Name oder Spitzname.' },
  { t: 'Nackendruck', brutto: 357, einheit: 'pro Teil', d: 'Pro Teil, zum Beispiel Jahrgang oder Motto klein im Nacken.' },
  { t: 'Design, Motto und Namensliste setzen', brutto: 0, d: 'Für Abschlussklassen kostenlos.' },
  { t: 'Mischgrößen und Mischfarben', brutto: 0, d: 'Kein Aufpreis, auch Hoodies und Shirts in einer Bestellung.' },
];

/** Versand innerhalb Deutschlands pro Paket (6,95 € netto), brutto in Cent. */
export const VERSAND = { brutto: 827, d: 'Pro Paket innerhalb Deutschlands, per DHL mit Sendungsnummer.' };

/** Produktion nach schriftlicher Bestätigung und Zahlungseingang. */
export const PRODUKTION = '5 bis 7 Werktage';

/** Zahlungsziel der Rechnung in Tagen (Vorkasse per Überweisung). */
export const ZAHLUNGSZIEL_TAGE = 7;

/** Rechenbeispiel auf der Seite und in llms-full.txt. */
export const BEISPIEL = { id: 'classic-hoodie', menge: 25 };

/** Brutto-Cent -> Netto-Cent (19 % MwSt., kaufmännisch gerundet). */
export const netto = (bruttoCent: number) => Math.round(bruttoCent / 1.19);

/** Cent -> "28,90" bzw. "1.234,50" (ohne Euro-Zeichen). */
export const euro = (cent: number) => `${Math.floor(cent / 100).toLocaleString('de-DE')},${String(cent % 100).padStart(2, '0')}`;

export const modell = (id: string) => {
  const m = modelle.find((x) => x.id === id);
  if (!m) throw new Error(`abschluss.ts: Modell ${id} fehlt`);
  return m;
};

/** Rechenbeispiel: Menge x Klassenpreis + ein Paket Versand. Alles in Cent. */
export function rechenbeispiel() {
  const m = modell(BEISPIEL.id);
  const ware = m.preisAb10 * BEISPIEL.menge;
  const gesamt = ware + VERSAND.brutto;
  return { modell: m, menge: BEISPIEL.menge, ware, gesamt, proPerson: Math.round(gesamt / BEISPIEL.menge) };
}
